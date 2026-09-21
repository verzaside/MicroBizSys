const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../src/core.js");
const U = require("../src/ugc.js");
const B = require("../src/csv.js");
const crypto = require("node:crypto");
const env = {
  id: () => crypto.randomUUID(),
  now: () => "2026-10-09T12:00:00.000Z",
  today: () => "2026-10-09",
};

test("cancellation retains financial history and actual effort", () => {
  const s = U.demo(env),
    c = s.campaigns[0];
  U.command(
    s,
    "recordPayment",
    {
      receivable_id: s.receivables[0].receivable_id,
      amount: 800,
      payment_date: "2026-10-09",
    },
    env,
  );
  U.command(
    s,
    "transitionCampaign",
    { campaign_id: c.campaign_id, status: "cancelled" },
    env,
  );
  s.deliverables[0].status = "cancelled";
  C.validate(s);
  const result = U.economics(s, [c]);
  assert.equal(result.agreed, 1200);
  assert.equal(result.paid, 1200);
  assert.equal(result.hours, 6);
  assert.equal(result.contribution, 1050);
  assert.equal(result.unbilled, 0);
  assert.equal(result.incomplete_hours, false);
  assert.deepEqual(B.importFiles(B.exportFiles(s)), s);
});

test("stored numeric strings and missing financial descriptions fail diagnostics", () => {
  for (const change of [
    (s) => (s.campaigns[0].agreed_fee = "1200"),
    (s) => (s.expenses[0].category_key = ""),
    (s) => (s.expenses[0].description = ""),
    (s) => (s.receivables[0].description = ""),
  ]) {
    const s = U.demo(env);
    change(s);
    assert.ok(C.inspect(s).length);
    assert.throws(() => C.validate(s), { code: "INTEGRITY" });
  }
});
