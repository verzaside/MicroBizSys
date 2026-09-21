/* UGC application commands and product-specific query policy. Persistence is injected. */
var UGC = (function (C) {
  "use strict";
  function command(s, name, p, env) {
    const now = env.now();
    const id = env.id;
    const stamp = (r) => Object.assign(r, { updated_at: now });
    function newRow(t, r) {
      const row = Object.assign(
        { [C.schemas[t].id]: id(), created_at: now, updated_at: now },
        r,
      );
      s[t].push(row);
      return row;
    }
    function editableCampaign(cid) {
      const c = C.ref(s, "campaigns", cid);
      C.assert(!["completed", "cancelled"].includes(c.status), "CLOSED");
      return c;
    }
    function normalizeBalance(r) {
      if (r.status !== "void")
        r.status = C.balance(s, r) === 0 ? "paid" : "open";
      stamp(r);
    }
    function withJob(c) {
      return { job_id: c.job_id, party_id: c.brand_id };
    }
    switch (name) {
      case "saveSettings": {
        const m = s.installation[0];
        const x = C.initial(p, env).installation[0];
        if (C.hasData(s))
          C.assert(x.currency === m.currency, "CURRENCY_LOCKED", "currency");
        ["locale", "currency", "timezone", "business_name"].forEach(
          (f) => (m[f] = x[f]),
        );
        break;
      }
      case "saveParty": {
        const v = {
          display_name: C.text(p.display_name, "display_name", true, 150),
          email: C.text(p.email || "", "email", false, 200),
          phone: C.text(p.phone || "", "phone", false, 60),
          notes: C.text(p.notes || "", "notes", false),
          party_type: "brand",
        };
        C.assert(
          !v.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email),
          "EMAIL",
          "email",
        );
        if (p.party_id) {
          const old = C.ref(s, "parties", p.party_id);
          stamp(Object.assign(old, v));
        } else newRow("parties", Object.assign(v, { active: true }));
        break;
      }
      case "archiveParty": {
        const r = C.ref(s, "parties", p.party_id);
        C.assert(
          !s.campaigns.some(
            (c) =>
              c.brand_id === r.party_id &&
              ["draft", "active"].includes(c.status),
          ),
          "OPEN_CAMPAIGNS",
        );
        r.active = !r.active;
        stamp(r);
        break;
      }
      case "saveCampaign": {
        const old = p.campaign_id ? C.ref(s, "campaigns", p.campaign_id) : null;
        const brand = C.ref(s, "parties", p.brand_id);
        C.assert(
          brand.active || (old && old.brand_id === brand.party_id),
          "ARCHIVED",
        );
        const v = {
          brand_id: brand.party_id,
          origin_source: C.text(
            p.origin_source || "",
            "origin_source",
            false,
            200,
          ),
          campaign_name: C.text(p.campaign_name, "campaign_name", true, 160),
          agreed_fee: C.money(p.agreed_fee, "agreed_fee"),
          start_date: C.date(p.start_date, "start_date", false),
          due_date: C.date(p.due_date, "due_date", true),
          notes: C.text(p.notes || "", "notes", false),
          status: old ? old.status : "draft",
        };
        C.assert(
          !v.start_date || v.start_date <= v.due_date,
          "DATE_ORDER",
          "due_date",
        );
        if (old) {
          C.assert(
            v.brand_id === old.brand_id ||
              (!s.receivables.some((r) => r.job_id === old.job_id) &&
                !s.expenses.some((e) => e.job_id === old.job_id)),
            "PARTY_LOCKED",
          );
          C.assert(
            C.cents(v.agreed_fee) >=
              C.cents(
                C.sum(
                  s.receivables.filter(
                    (r) => r.job_id === old.job_id && C.active(r),
                  ),
                  "amount",
                ),
              ),
            "OVERBILLED",
            "agreed_fee",
          );
          stamp(Object.assign(old, v));
          const j = C.ref(s, "jobs", old.job_id);
          stamp(
            Object.assign(j, {
              party_id: v.brand_id,
              title: v.campaign_name,
              due_date: v.due_date,
              quoted_amount: v.agreed_fee,
            }),
          );
        } else {
          const job = newRow("jobs", {
            job_type: "campaign",
            party_id: v.brand_id,
            title: v.campaign_name,
            status: "draft",
            due_date: v.due_date,
            quoted_amount: v.agreed_fee,
          });
          newRow("campaigns", Object.assign(v, { job_id: job.job_id }));
        }
        break;
      }
      case "transitionCampaign": {
        const c = C.ref(s, "campaigns", p.campaign_id);
        const next = C.choice(
          p.status,
          ["draft", "active", "completed", "cancelled"],
          "status",
        );
        const allowed = {
          draft: ["active", "cancelled"],
          active: ["completed", "cancelled"],
          completed: ["active"],
          cancelled: ["active"],
        };
        C.assert(allowed[c.status].includes(next), "TRANSITION", "status");
        if (next === "completed")
          C.assert(
            s.deliverables
              .filter((d) => d.campaign_id === c.campaign_id)
              .every((d) => ["completed", "cancelled"].includes(d.status)),
            "INCOMPLETE",
          );
        if (next === "cancelled")
          C.assert(
            !s.receivables.some(
              (r) =>
                r.job_id === c.job_id && C.active(r) && C.balance(s, r) > 0,
            ),
            "OUTSTANDING",
          );
        c.status = next;
        stamp(c);
        const j = C.ref(s, "jobs", c.job_id);
        j.status = next;
        stamp(j);
        break;
      }
      case "saveDeliverable": {
        const c = editableCampaign(p.campaign_id);
        const old = p.deliverable_id
          ? C.ref(s, "deliverables", p.deliverable_id)
          : null;
        C.assert(!old || old.campaign_id === c.campaign_id, "REFERENCE");
        const v = {
          campaign_id: c.campaign_id,
          deliverable_type: C.text(
            p.deliverable_type,
            "deliverable_type",
            true,
            80,
          ),
          description: C.text(p.description, "description", true, 500),
          due_date: C.date(p.due_date, "due_date", true),
          status: C.choice(
            p.status || "planned",
            ["planned", "in_progress", "review", "completed", "cancelled"],
            "status",
          ),
          revision_rounds_included: C.integer(
            p.revision_rounds_included || 0,
            "revision_rounds_included",
          ),
          revision_rounds_used: C.integer(
            p.revision_rounds_used || 0,
            "revision_rounds_used",
          ),
          estimated_hours: C.number(p.estimated_hours, "estimated_hours", true),
          actual_hours: C.number(p.actual_hours, "actual_hours", true),
        };
        old ? stamp(Object.assign(old, v)) : newRow("deliverables", v);
        break;
      }
      case "saveRight": {
        const d = C.ref(s, "deliverables", p.deliverable_id);
        const old = p.right_id ? C.ref(s, "rights", p.right_id) : null;
        C.assert(!old || old.campaign_id === d.campaign_id, "REFERENCE");
        const v = {
          campaign_id: d.campaign_id,
          deliverable_id: d.deliverable_id,
          right_type: C.text(p.right_type, "right_type", true, 120),
          start_date: C.date(p.start_date, "start_date", true),
          end_date: C.date(p.end_date, "end_date", false),
          territory: C.text(p.territory || "", "territory", false, 200),
          channels: C.text(p.channels || "", "channels", false, 300),
          renewal_value: C.money(p.renewal_value || 0, "renewal_value"),
          status: C.choice(
            p.status || "active",
            ["active", "expired", "renewed", "closed"],
            "status",
          ),
        };
        C.assert(
          !v.end_date || v.end_date >= v.start_date,
          "DATE_ORDER",
          "end_date",
        );
        old ? stamp(Object.assign(old, v)) : newRow("rights", v);
        break;
      }
      case "createReceivable": {
        const c = editableCampaign(p.campaign_id);
        const amount = C.money(p.amount, "amount", true);
        const total =
          C.cents(
            C.sum(
              s.receivables.filter((r) => r.job_id === c.job_id && C.active(r)),
              "amount",
            ),
          ) + C.cents(amount);
        C.assert(total <= C.cents(c.agreed_fee), "OVERBILLED", "amount");
        newRow(
          "receivables",
          Object.assign(withJob(c), {
            description: C.text(p.description, "description", true, 300),
            amount,
            due_date: C.date(p.due_date, "due_date", true),
            status: "open",
            void_reason: "",
          }),
        );
        break;
      }
      case "recordPayment": {
        const r = C.ref(s, "receivables", p.receivable_id);
        C.assert(C.active(r), "VOID");
        const amount = C.money(p.amount, "amount", true);
        C.assert(
          C.cents(amount) <= C.cents(C.balance(s, r)),
          "OVERPAYMENT",
          "amount",
        );
        newRow("payments", {
          receivable_id: r.receivable_id,
          job_id: r.job_id,
          party_id: r.party_id,
          amount,
          payment_date: C.date(p.payment_date, "payment_date", true),
          payment_method: C.text(
            p.payment_method || "",
            "payment_method",
            false,
            100,
          ),
          reference: C.text(p.reference || "", "reference", false, 300),
          status: "active",
          void_reason: "",
        });
        normalizeBalance(r);
        break;
      }
      case "recordExpense": {
        const c = p.campaign_id ? C.ref(s, "campaigns", p.campaign_id) : null;
        newRow(
          "expenses",
          Object.assign(c ? withJob(c) : { job_id: "", party_id: "" }, {
            description: C.text(p.description, "description", true, 300),
            category_key: C.text(p.category_key, "category_key", true, 100),
            amount: C.money(p.amount, "amount", true),
            expense_date: C.date(p.expense_date, "expense_date", true),
            status: "active",
            void_reason: "",
          }),
        );
        break;
      }
      case "voidRecord": {
        const table = C.choice(
          p.table,
          ["receivables", "payments", "expenses"],
          "table",
        );
        const r = C.ref(s, table, p.id);
        C.assert(r.status !== "void", "VOID");
        if (table === "receivables")
          C.assert(
            !s.payments.some(
              (x) => x.receivable_id === r.receivable_id && C.active(x),
            ),
            "ACTIVE_PAYMENTS",
          );
        const reason = C.text(p.reason, "reason", true, 300);
        r.status = "void";
        r.void_reason = reason;
        stamp(r);
        if (table === "payments")
          normalizeBalance(C.ref(s, "receivables", r.receivable_id));
        break;
      }
      default:
        C.fail("COMMAND");
    }
    C.validate(s);
    return s;
  }
  function economics(s, campaigns) {
    const jobs = new Set(campaigns.map((c) => c.job_id));
    const ids = new Set(campaigns.map((c) => c.campaign_id));
    const deliveries = s.deliverables.filter((d) => ids.has(d.campaign_id));
    // Status does not rewrite the agreement or erase effort already recorded.
    const fee = C.sum(campaigns, "agreed_fee");
    const costs = C.sum(
      s.expenses.filter((e) => jobs.has(e.job_id) && C.active(e)),
      "amount",
    );
    const hours = deliveries.reduce(
      (a, d) => a + (d.actual_hours === "" ? 0 : d.actual_hours),
      0,
    );
    const expected = deliveries.reduce(
      (a, d) => a + (d.estimated_hours === "" ? 0 : d.estimated_hours),
      0,
    );
    const rec = s.receivables.filter((r) => jobs.has(r.job_id) && C.active(r));
    const paid = C.sum(
      s.payments.filter((p) => jobs.has(p.job_id) && C.active(p)),
      "amount",
    );
    return {
      agreed: fee,
      expenses: costs,
      contribution: (C.cents(fee) - C.cents(costs)) / 100,
      hours,
      estimated_hours: expected,
      incomplete_hours:
        !deliveries.length ||
        deliveries.some(
          (d) =>
            d.actual_hours === "" ||
            !["completed", "cancelled"].includes(d.status),
        ),
      hourly: hours ? Math.floor(C.cents(fee) / hours + 0.5) / 100 : null,
      receivable: C.sum(rec, "amount"),
      paid,
      balance: (C.cents(C.sum(rec, "amount")) - C.cents(paid)) / 100,
      unbilled: (C.cents(fee) - C.cents(C.sum(rec, "amount"))) / 100,
    };
  }
  function query(s, today) {
    if (!s.installation.length) return { setup: true, version: C.VERSION };
    C.validate(s);
    const end = (days) => {
      const d = new Date(today + "T12:00:00Z");
      d.setUTCDate(d.getUTCDate() + days);
      return d.toISOString().slice(0, 10);
    };
    const openCampaigns = new Set(
      s.campaigns
        .filter((c) => !["completed", "cancelled"].includes(c.status))
        .map((c) => c.campaign_id),
    );
    const attention = [];
    s.deliverables
      .filter(
        (d) =>
          openCampaigns.has(d.campaign_id) &&
          !["completed", "cancelled"].includes(d.status) &&
          d.due_date <= end(7),
      )
      .forEach((d) =>
        attention.push({
          type: d.due_date < today ? "overdue_delivery" : "upcoming_delivery",
          id: d.deliverable_id,
          campaign_id: d.campaign_id,
          title: d.description,
          date: d.due_date,
        }),
      );
    s.receivables
      .filter((r) => C.active(r) && C.balance(s, r) > 0 && r.due_date < today)
      .forEach((r) => {
        const c = s.campaigns.find((c) => c.job_id === r.job_id);
        attention.push({
          type: "overdue_payment",
          id: r.receivable_id,
          campaign_id: c.campaign_id,
          title: r.description,
          date: r.due_date,
        });
      });
    s.rights
      .filter(
        (r) => r.status === "active" && r.end_date && r.end_date <= end(30),
      )
      .forEach((r) =>
        attention.push({
          type: r.end_date < today ? "expired_right" : "expiring_right",
          id: r.right_id,
          campaign_id: r.campaign_id,
          title: r.right_type,
          date: r.end_date,
        }),
      );
    attention.sort((a, b) => a.date.localeCompare(b.date));
    const result = C.copy(s);
    delete result.operations;
    result.today = today;
    result.version = C.VERSION;
    result.attention = attention;
    result.campaigns.forEach((c) => (c.economics = economics(s, [c])));
    result.parties.forEach(
      (p) =>
        (p.economics = economics(
          s,
          s.campaigns.filter((c) => c.brand_id === p.party_id),
        )),
    );
    result.receivables.forEach(
      (r) => (r.balance = C.active(r) ? C.balance(s, r) : 0),
    );
    result.kpis = {
      due: s.deliverables.filter(
        (d) =>
          openCampaigns.has(d.campaign_id) &&
          !["completed", "cancelled"].includes(d.status) &&
          d.due_date >= today &&
          d.due_date <= end(7),
      ).length,
      balance:
        s.receivables
          .filter(C.active)
          .reduce((a, r) => a + C.cents(C.balance(s, r)), 0) / 100,
      received: C.sum(
        s.payments.filter(
          (p) =>
            C.active(p) && p.payment_date.slice(0, 7) === today.slice(0, 7),
        ),
        "amount",
      ),
      rights: s.rights.filter(
        (r) =>
          r.status === "active" && r.end_date >= today && r.end_date <= end(30),
      ).length,
    };
    return result;
  }
  function demo(env) {
    let s = C.initial({ business_name: "Estúdio Exemplo" }, env);
    const run = (n, p) => command(s, n, p, env);
    run("saveParty", {
      display_name: "Marca Exemplo",
      email: "contato@example.com",
      notes: "Dados fictícios do Guia Rápido.",
    });
    const b = s.parties[0].party_id;
    run("saveCampaign", {
      brand_id: b,
      campaign_name: "Dois vídeos · campanha do guia",
      agreed_fee: 1200,
      start_date: "2026-10-01",
      due_date: "2026-10-08",
    });
    const c = s.campaigns[0].campaign_id;
    run("transitionCampaign", { campaign_id: c, status: "active" });
    run("saveDeliverable", {
      campaign_id: c,
      deliverable_type: "Vídeo",
      description: "Vídeo de apresentação",
      due_date: "2026-10-05",
      status: "completed",
      revision_rounds_included: 1,
      revision_rounds_used: 1,
      estimated_hours: 2,
      actual_hours: 3,
    });
    run("saveDeliverable", {
      campaign_id: c,
      deliverable_type: "Vídeo",
      description: "Vídeo de demonstração",
      due_date: "2026-10-08",
      status: "completed",
      revision_rounds_included: 1,
      revision_rounds_used: 0,
      estimated_hours: 3,
      actual_hours: 3,
    });
    run("createReceivable", {
      campaign_id: c,
      description: "Campanha · dois vídeos",
      amount: 1200,
      due_date: "2026-10-15",
    });
    run("recordPayment", {
      receivable_id: s.receivables[0].receivable_id,
      amount: 400,
      payment_date: "2026-10-01",
      payment_method: "Pix",
    });
    run("recordExpense", {
      campaign_id: c,
      description: "Materiais de produção",
      category_key: "production",
      amount: 150,
      expense_date: "2026-10-01",
    });
    run("saveRight", {
      deliverable_id: s.deliverables[0].deliverable_id,
      right_type: "Publicação no perfil da marca",
      start_date: "2026-11-01",
      end_date: "2026-11-30",
      territory: "Brasil",
      channels: "Instagram",
      renewal_value: 300,
      status: "active",
    });
    return s;
  }
  function createService(repo, env, csv) {
    function handle(request) {
      try {
        const q = request || {},
          p = q.payload || {};
        C.assert(typeof q.action === "string", "COMMAND");
        if (q.action === "systemCheck") {
          const s = repo.read(true);
          const issues = s.installation.length ? C.inspect(s) : [];
          return {
            ok: true,
            data: {
              product: C.PRODUCT,
              version: C.VERSION,
              schema: s.installation[0] ? s.installation[0].schema_version : 0,
              locale: s.installation[0] ? s.installation[0].locale : "",
              counts: Object.fromEntries(
                C.businessTables.map((t) => [t, s[t].length]),
              ),
              issues,
            },
          };
        }
        if (q.action === "export") {
          const s = repo.read(true);
          C.validate(s);
          return { ok: true, data: csv.exportFiles(s) };
        }
        if (q.action === "load") {
          const s = repo.read();
          return { ok: true, data: query(s, env.today(s.installation[0])) };
        }
        C.assert(
          typeof q.operation_id === "string" &&
            /^[A-Za-z0-9_-]{8,100}$/.test(q.operation_id),
          "OPERATION",
        );
        C.assert(
          Number.isSafeInteger(q.revision) && q.revision >= 0,
          "CONFLICT",
        );
        const fp = env.fingerprint
          ? env.fingerprint({ action: q.action, payload: p })
          : C.fingerprint({ action: q.action, payload: p });
        repo.transact(q.operation_id, q.revision, fp, (s) => {
          if (q.action === "setup") {
            C.assert(!s.installation.length, "ALREADY_SETUP");
            s = C.initial(p, env);
          } else if (q.action === "restore") {
            C.assert(!C.hasData(s), "RESTORE_NONEMPTY");
            const old = s.installation[0];
            s = csv.importFiles(p.files);
            s.installation[0].installation_id = old
              ? old.installation_id
              : env.id();
            s.installation[0].last_migrated_at = env.now();
            s.installation[0].product_version = C.VERSION;
          } else if (q.action === "loadSample") {
            C.assert(!C.hasData(s), "RESTORE_NONEMPTY");
            C.assert(s.installation.length, "SETUP");
            const old = s.installation[0];
            s = demo(env);
            s.installation[0] = old;
            C.assert(old.currency === "BRL", "SAMPLE_CURRENCY");
          } else {
            C.assert(s.installation.length, "SETUP");
            C.validate(s);
            command(s, q.action, p, env);
          }
          return s;
        });
        const s = repo.read();
        return { ok: true, data: query(s, env.today(s.installation[0])) };
      } catch (e) {
        return {
          ok: false,
          error: {
            code: e.code || "UNEXPECTED",
            field: e.field || "",
            issues: e.issues || [],
          },
        };
      }
    }
    return { handle };
  }
  function memoryRepository(state) {
    let data = C.copy(state || C.empty());
    if (data.installation.length) data = C.migrate(data);
    return {
      read: () => C.copy(data),
      transact: (op, revision, fp, fn) => {
        const found = data.operations.find((r) => r.operation_id === op);
        if (found) {
          C.assert(found.fingerprint === fp, "OPERATION_REUSE");
          return;
        }
        const current = data.installation[0]
          ? data.installation[0].revision
          : 0;
        C.assert(current === revision, "CONFLICT");
        let next = fn(C.copy(data));
        next.installation[0].revision = current + 1;
        next.operations.push({
          operation_id: op,
          fingerprint: fp,
          created_at: new Date().toISOString(),
          revision: current + 1,
        });
        next.operations = next.operations.slice(-200);
        C.validate(next);
        data = C.copy(next);
      },
    };
  }
  return { command, query, economics, demo, createService, memoryRepository };
})(typeof MBS !== "undefined" ? MBS : require("./core.js"));
if (typeof module !== "undefined") module.exports = UGC;
