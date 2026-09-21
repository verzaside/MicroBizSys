const test = require("node:test"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto");
const C = require("../src/core.js"),
  U = require("../src/ugc.js"),
  B = require("../src/csv.js"),
  Z = require("../src/zip.js"),
  S = require("../src/sheets.js");
function env() {
  let id = 0;
  return {
    id: () => `id-${++id}`,
    now: () => "2026-10-09T12:00:00.000Z",
    today: () => "2026-10-09",
    fingerprint: (x) =>
      crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex"),
  };
}
function setup(sample = true) {
  const e = env(),
    repo = U.memoryRepository(sample ? U.demo(e) : C.empty()),
    svc = U.createService(repo, e, B);
  let op = 0;
  const send = (action, payload = {}, extra = {}) =>
    svc.handle({
      action,
      payload,
      operation_id: "operation-" + ++op,
      revision: repo.read().installation[0]?.revision || 0,
      ...extra,
    });
  return { e, repo, svc, send };
}
test("guide baseline, client weighted rate, payment is not duplicate revenue", () => {
  const { repo, e } = setup();
  const s = repo.read(),
    c = s.campaigns[0];
  assert.deepEqual(U.economics(s, [c]), {
    agreed: 1200,
    expenses: 150,
    contribution: 1050,
    hours: 6,
    estimated_hours: 5,
    incomplete_hours: false,
    hourly: 200,
    receivable: 1200,
    paid: 400,
    balance: 800,
    unbilled: 0,
  });
  U.command(
    s,
    "saveCampaign",
    {
      brand_id: c.brand_id,
      campaign_name: "B",
      agreed_fee: 1800,
      due_date: "2026-10-30",
    },
    e,
  );
  const b = s.campaigns[1];
  U.command(
    s,
    "saveDeliverable",
    {
      campaign_id: b.campaign_id,
      deliverable_type: "Vídeo",
      description: "B",
      due_date: "2026-10-30",
      status: "completed",
      actual_hours: 12,
    },
    e,
  );
  U.command(
    s,
    "recordExpense",
    {
      campaign_id: b.campaign_id,
      description: "B",
      category_key: "production",
      amount: 600,
      expense_date: "2026-10-01",
    },
    e,
  );
  const total = U.economics(s, s.campaigns);
  assert.equal(total.hourly, 166.67);
  assert.equal(total.contribution, 2250);
});
test("zero/unknown hours and no automatic receivable", () => {
  const { send, repo } = setup();
  const b = repo.read().parties[0].party_id;
  assert.equal(
    send("saveCampaign", {
      brand_id: b,
      campaign_name: "New",
      agreed_fee: "20.01",
      due_date: "2026-11-01",
    }).ok,
    true,
  );
  const state = repo.read();
  assert.equal(state.receivables.length, 1);
  const q = U.query(state, "2026-10-09");
  assert.equal(q.campaigns[1].economics.hourly, null);
  assert.equal(q.campaigns[1].economics.incomplete_hours, true);
});
test("overpayment, overbilling and fee reduction fail without changing records", () => {
  const { send, repo } = setup();
  const before = repo.read(),
    c = before.campaigns[0];
  const bad = send("recordPayment", {
    receivable_id: before.receivables[0].receivable_id,
    amount: 801,
    payment_date: "2026-10-09",
  });
  assert.equal(bad.error.code, "OVERPAYMENT");
  assert.deepEqual(repo.read(), before);
  assert.equal(
    send("createReceivable", {
      campaign_id: c.campaign_id,
      description: "extra",
      amount: 1,
      due_date: "2026-10-10",
    }).error.code,
    "OVERBILLED",
  );
  assert.equal(
    send("saveCampaign", { ...c, agreed_fee: 1100 }).error.code,
    "OVERBILLED",
  );
  assert.deepEqual(repo.read(), before);
});
test("payment operation is idempotent; changed retry and stale edits rejected", () => {
  const { send, repo, svc } = setup();
  const request = {
    action: "recordPayment",
    payload: {
      receivable_id: repo.read().receivables[0].receivable_id,
      amount: 800,
      payment_date: "2026-10-09",
    },
    revision: 0,
    operation_id: "stable-operation",
  };
  assert.equal(svc.handle(request).ok, true);
  assert.equal(svc.handle(request).ok, true);
  assert.equal(repo.read().payments.length, 2);
  assert.equal(
    svc.handle({ ...request, payload: { ...request.payload, amount: 700 } })
      .error.code,
    "OPERATION_REUSE",
  );
  assert.equal(
    send("saveParty", { display_name: "Other" }, { revision: 0 }).error.code,
    "CONFLICT",
  );
  assert.equal(repo.read().receivables[0].status, "paid");
});
test("correction keeps history, recalculates balance, blocks voiding linked receipts", () => {
  const { send, repo } = setup();
  const s = repo.read();
  assert.equal(
    send("voidRecord", {
      table: "receivables",
      id: s.receivables[0].receivable_id,
      reason: "error",
    }).error.code,
    "ACTIVE_PAYMENTS",
  );
  assert.equal(
    send("voidRecord", {
      table: "payments",
      id: s.payments[0].payment_id,
      reason: "Incorrect entry",
    }).ok,
    true,
  );
  assert.equal(repo.read().payments[0].status, "void");
  assert.equal(U.query(repo.read(), "2026-10-09").receivables[0].balance, 1200);
  assert.equal(
    send("voidRecord", {
      table: "receivables",
      id: s.receivables[0].receivable_id,
      reason: "Replace invoice",
    }).ok,
    true,
  );
  assert.equal(repo.read().receivables.length, 1);
});
test("workflow completion, cancellation, archive and reopen rules", () => {
  const { send, repo } = setup();
  let s = repo.read();
  const c = s.campaigns[0];
  assert.equal(
    send("archiveParty", { party_id: c.brand_id }).error.code,
    "OPEN_CAMPAIGNS",
  );
  assert.equal(
    send("saveDeliverable", { ...s.deliverables[0], status: "review" }).ok,
    true,
  );
  assert.equal(
    send("transitionCampaign", {
      campaign_id: c.campaign_id,
      status: "completed",
    }).error.code,
    "INCOMPLETE",
  );
  assert.equal(
    send("transitionCampaign", {
      campaign_id: c.campaign_id,
      status: "cancelled",
    }).error.code,
    "OUTSTANDING",
  );
  assert.equal(
    send("saveDeliverable", { ...s.deliverables[0], status: "completed" }).ok,
    true,
  );
  assert.equal(
    send("transitionCampaign", {
      campaign_id: c.campaign_id,
      status: "completed",
    }).ok,
    true,
  );
  assert.equal(
    send("saveDeliverable", { ...s.deliverables[0], status: "review" }).error
      .code,
    "CLOSED",
  );
  assert.equal(
    send("transitionCampaign", { campaign_id: c.campaign_id, status: "active" })
      .ok,
    true,
  );
});
test("attention separates deadlines, money, rights; proposed renewal excluded", () => {
  const { repo, e } = setup();
  const s = repo.read();
  s.deliverables[1].status = "in_progress";
  const q = U.query(s, "2026-10-09");
  assert.equal(q.attention.length, 1);
  assert.equal(q.attention[0].type, "overdue_delivery");
  assert.equal(
    U.query(s, "2026-10-16").attention.some(
      (x) => x.type === "overdue_payment",
    ),
    true,
  );
  assert.equal(U.query(s, "2026-11-10").kpis.rights, 1);
  assert.equal(q.campaigns[0].economics.agreed, 1200);
  U.command(s, "saveRight", { ...s.rights[0], status: "renewed" }, e);
  assert.equal(U.query(s, "2026-11-10").kpis.rights, 0);
});
test("dates, numeric precision, missing references, cross-campaign rights", () => {
  const { send, repo } = setup();
  const s = repo.read();
  assert.equal(
    send("recordPayment", {
      receivable_id: s.receivables[0].receivable_id,
      amount: 1,
      payment_date: "2026-02-30",
    }).error.code,
    "DATE",
  );
  assert.throws(() => C.money("0.001", "amount"));
  assert.equal(C.money("0.10"), 0.1);
  assert.equal(
    send("saveRight", { ...s.rights[0], end_date: "2026-01-01" }).error.code,
    "DATE_ORDER",
  );
  assert.equal(
    send("saveCampaign", {
      brand_id: "missing",
      campaign_name: "X",
      agreed_fee: 10,
      due_date: "2026-11-01",
    }).error.code,
    "NOT_FOUND",
  );
});
test("CSV roundtrip exact for Unicode, newlines, apostrophes and formula-like text", () => {
  const { repo } = setup();
  const s = repo.read();
  s.parties[0].display_name = 'Árvore, "marca"';
  s.parties[0].notes = '=IMPORTXML("https://evil")\n\'Olá\r\nç';
  s.parties[0].phone = "+5511999999999";
  const files = B.exportFiles(s);
  assert.match(files["parties.csv"], /'=IMPORTXML/);
  const restored = B.importFiles(files);
  assert.deepEqual(restored, s);
  for (const value of [
    "=1",
    "+12",
    "-20",
    "@x",
    "'literal",
    "  =1",
    "normal",
    "\ttext",
  ])
    assert.equal(B.unprotect(B.protect(value)), value);
});
test("ZIP stored transport roundtrips and rejects corrupt archives", () => {
  const files = B.exportFiles(setup().repo.read()),
    zip = Z.make(files);
  assert.deepEqual({ ...Z.read(zip) }, files);
  const corrupted = zip.slice();
  corrupted[80] ^= 1;
  assert.throws(() => Z.read(corrupted));
});
test("backup missing files, counts, duplicates, versions, foreign keys all rejected", () => {
  const original = B.exportFiles(setup().repo.read());
  let f = { ...original };
  delete f["payments.csv"];
  assert.throws(() => B.importFiles(f));
  f = { ...original };
  f["_backup.csv"] = f["_backup.csv"].replace("apostrophe-v1", "unknown");
  assert.throws(() => B.importFiles(f));
  f = { ...original };
  const rows = B.parse(f["parties.csv"]);
  rows.push(rows[1]);
  f["parties.csv"] = B.encode(rows);
  assert.throws(() => B.importFiles(f));
  const s = setup().repo.read();
  s.payments[0].job_id = "absent";
  assert.throws(() => C.validate(s));
  s.installation[0].schema_version = 999;
  assert.throws(() => C.migrate(s));
});
test("restore only empty target; retains source identities and histories; retries safe", () => {
  const source = setup().repo.read(),
    files = B.exportFiles(source),
    { send, repo, svc } = setup(false);
  assert.equal(send("setup", { business_name: "Target" }).ok, true);
  const targetId = repo.read().installation[0].installation_id;
  const request = {
    action: "restore",
    payload: { files },
    revision: 1,
    operation_id: "restore-unique",
  };
  assert.equal(svc.handle(request).ok, true);
  assert.equal(svc.handle(request).ok, true);
  const s = repo.read();
  assert.equal(s.installation[0].installation_id, targetId);
  assert.deepEqual(s.payments, source.payments);
  assert.equal(send("restore", { files }).error.code, "RESTORE_NONEMPTY");
});
test("initial schema migration is retryable and does not guess business transformations", () => {
  const e = env(),
    s = C.initial({}, e);
  s.installation[0].schema_version = 0;
  assert.equal(C.migrate(s).installation[0].schema_version, 2);
  assert.deepEqual(C.migrate(C.migrate(s)), C.migrate(s));
  const business = U.demo(env());
  business.installation[0].schema_version = 0;
  assert.throws(() => C.migrate(business), /MIGRATION/);
  const old = U.demo(env());
  old.installation[0].schema_version = 1;
  old.campaigns.forEach((c) => delete c.origin_source);
  const migrated = C.migrate(old);
  assert.equal(migrated.installation[0].schema_version, 2);
  assert.equal(migrated.campaigns[0].origin_source, "");
});
test("schema 1 backups and Sheets rows migrate with blank campaign origin", () => {
  const files = B.exportFiles(setup().repo.read());
  const campaigns = B.parse(files["campaigns.csv"]).map((row) =>
    row.slice(0, -1),
  );
  files["campaigns.csv"] = B.encode(campaigns);
  const installation = B.parse(files["installation.csv"]);
  installation[1][2] = "1.0.0-beta.1";
  installation[1][3] = "1";
  files["installation.csv"] = B.encode(installation);
  const manifest = B.parse(files["_backup.csv"]);
  manifest.slice(1).forEach((row) => (row[3] = "1"));
  files["_backup.csv"] = B.encode(manifest);
  const restored = B.importFiles(files);
  assert.equal(restored.installation[0].schema_version, 2);
  assert.equal(restored.campaigns[0].origin_source, "");

  const raw = Object.fromEntries(
    Object.keys(C.schemas).map((t) => [t, S.tableRows(setup().repo.read(), t)]),
  );
  raw.campaigns = raw.campaigns.map((row) => row.slice(0, -1));
  const deserialized = S.deserialize(raw);
  assert.equal(deserialized.campaigns[0].origin_source, "");
});
test("settings protects existing currency; diagnostics contains no customer content", () => {
  const { send } = setup();
  assert.equal(
    send("saveSettings", { currency: "USD" }).error.code,
    "CURRENCY_LOCKED",
  );
  const d = send("systemCheck").data;
  assert.equal(JSON.stringify(d).includes("Marca Exemplo"), false);
  assert.equal(JSON.stringify(d).includes("1200"), false);
  assert.deepEqual(d.issues, []);
  assert.equal(
    send("saveSettings", { timezone: "Invalid/Zone" }).error.code,
    "TIMEZONE",
  );
});
test("Sheets serialization and targeted batch plan use literal string values", () => {
  const s = setup().repo.read();
  s.parties[0].notes = "=1+1";
  const raw = Object.fromEntries(
    Object.keys(C.schemas).map((t) => [t, S.tableRows(s, t)]),
  );
  assert.deepEqual(S.deserialize(raw), s);
  const after = C.copy(s);
  after.parties[0].notes = "=2+2";
  const ids = Object.fromEntries(
    Object.keys(C.schemas).map((t, i) => [t, i + 1]),
  );
  const plan = S.plan(s, after, ids);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].updateCells.range.startRowIndex, 1);
  assert.equal(
    plan[0].updateCells.rows[0].values[5].userEnteredValue.stringValue,
    "=2+2",
  );
  assert.equal(JSON.stringify(plan).includes("formulaValue"), false);
});
test("Sheets repository failed atomic commit does not publish partial result", () => {
  let s = setup().repo.read();
  const before = C.copy(s);
  let locked = false;
  const repo = S.create({
    load: () =>
      Object.fromEntries(
        Object.keys(C.schemas).map((t) => [t, S.tableRows(s, t)]),
      ),
    lock: (fn) => {
      locked = true;
      return fn();
    },
    commit: () => {
      throw Error("simulated atomic API rejection");
    },
  });
  const svc = U.createService(repo, env(), B);
  const result = svc.handle({
    action: "recordPayment",
    payload: {
      receivable_id: s.receivables[0].receivable_id,
      amount: 100,
      payment_date: "2026-10-09",
    },
    operation_id: "atomic-request",
    revision: 0,
  });
  assert.equal(result.ok, false);
  assert.equal(locked, true);
  assert.deepEqual(s, before);
});
test("locale format and guide money are deterministic", () => {
  assert.match(
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(1250.5),
    /1\.250,50/,
  );
  assert.equal(
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(1250.5),
    "$1,250.50",
  );
  assert.equal(
    new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
      new Date("2026-10-09T12:00Z"),
    ),
    "09/10/2026",
  );
});
