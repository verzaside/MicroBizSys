/* Country-neutral validation, schema, money and repository-independent integrity. */
var MBS = (function () {
  "use strict";
  const VERSION = "1.0.0-beta.2",
    SCHEMA_VERSION = 2,
    PRODUCT = "UGC_BR";
  const schemas = {
    installation: {
      id: "installation_id",
      fields: {
        installation_id: "text",
        product_id: "text",
        product_version: "text",
        schema_version: "integer",
        locale: "text",
        currency: "text",
        unit_system: "text",
        timezone: "text",
        business_name: "text",
        created_at: "text",
        last_migrated_at: "text",
        revision: "integer",
      },
    },
    parties: {
      id: "party_id",
      fields: {
        party_id: "text",
        party_type: "text",
        display_name: "text",
        email: "text",
        phone: "text",
        notes: "text",
        active: "boolean",
        created_at: "text",
        updated_at: "text",
      },
    },
    jobs: {
      id: "job_id",
      fields: {
        job_id: "text",
        job_type: "text",
        party_id: "text",
        title: "text",
        status: "text",
        due_date: "text",
        quoted_amount: "money",
        created_at: "text",
        updated_at: "text",
      },
    },
    campaigns: {
      id: "campaign_id",
      fields: {
        campaign_id: "text",
        job_id: "text",
        brand_id: "text",
        campaign_name: "text",
        status: "text",
        agreed_fee: "money",
        start_date: "text",
        due_date: "text",
        notes: "text",
        created_at: "text",
        updated_at: "text",
        origin_source: "text",
      },
    },
    deliverables: {
      id: "deliverable_id",
      fields: {
        deliverable_id: "text",
        campaign_id: "text",
        deliverable_type: "text",
        description: "text",
        due_date: "text",
        status: "text",
        revision_rounds_included: "integer",
        revision_rounds_used: "integer",
        estimated_hours: "optionalNumber",
        actual_hours: "optionalNumber",
        created_at: "text",
        updated_at: "text",
      },
    },
    rights: {
      id: "right_id",
      fields: {
        right_id: "text",
        campaign_id: "text",
        deliverable_id: "text",
        right_type: "text",
        start_date: "text",
        end_date: "text",
        territory: "text",
        channels: "text",
        renewal_value: "money",
        status: "text",
        created_at: "text",
        updated_at: "text",
      },
    },
    receivables: {
      id: "receivable_id",
      fields: {
        receivable_id: "text",
        job_id: "text",
        party_id: "text",
        description: "text",
        amount: "money",
        due_date: "text",
        status: "text",
        void_reason: "text",
        created_at: "text",
        updated_at: "text",
      },
    },
    payments: {
      id: "payment_id",
      fields: {
        payment_id: "text",
        receivable_id: "text",
        job_id: "text",
        party_id: "text",
        amount: "money",
        payment_date: "text",
        payment_method: "text",
        reference: "text",
        status: "text",
        void_reason: "text",
        created_at: "text",
        updated_at: "text",
      },
    },
    expenses: {
      id: "expense_id",
      fields: {
        expense_id: "text",
        job_id: "text",
        party_id: "text",
        category_key: "text",
        description: "text",
        amount: "money",
        expense_date: "text",
        status: "text",
        void_reason: "text",
        created_at: "text",
        updated_at: "text",
      },
    },
    operations: {
      id: "operation_id",
      fields: {
        operation_id: "text",
        fingerprint: "text",
        created_at: "text",
        revision: "integer",
      },
    },
  };
  const businessTables = Object.keys(schemas).filter(
    (k) => !["installation", "operations"].includes(k),
  );
  function fail(code, field) {
    const e = new Error(code);
    e.code = code;
    e.field = field || "";
    throw e;
  }
  function assert(ok, code, field) {
    if (!ok) fail(code, field);
  }
  function copy(x) {
    return JSON.parse(JSON.stringify(x));
  }
  function empty() {
    const s = {};
    Object.keys(schemas).forEach((k) => (s[k] = []));
    return s;
  }
  function text(x, field, required, max) {
    assert(typeof x === "string", "INVALID", field);
    const v = x.trim();
    assert(!required || v.length, "REQUIRED", field);
    assert(v.length <= (max || 2000), "TOO_LONG", field);
    return v;
  }
  function date(x, field, required) {
    const v = text(x || "", field, required, 10);
    if (!v) return "";
    assert(/^\d{4}-\d{2}-\d{2}$/.test(v), "DATE", field);
    const d = new Date(v + "T12:00:00Z");
    assert(
      !isNaN(d) &&
        d.toISOString().slice(0, 10) === v &&
        v >= "1900-01-01" &&
        v <= "2199-12-31",
      "DATE",
      field,
    );
    return v;
  }
  function money(x, field, positive) {
    assert(typeof x === "number" || typeof x === "string", "MONEY", field);
    const v = String(x);
    assert(/^\d{1,9}(\.\d{1,2})?$/.test(v), "MONEY", field);
    const parts = v.split(".");
    const cents =
      Number(parts[0]) * 100 + Number((parts[1] || "").padEnd(2, "0"));
    assert(
      Number.isSafeInteger(cents) && (!positive || cents > 0),
      "MONEY",
      field,
    );
    return cents / 100;
  }
  function cents(n) {
    return Math.round(n * 100);
  }
  function sum(rows, field) {
    return rows.reduce((a, r) => a + cents(r[field]), 0) / 100;
  }
  function number(x, field, optional) {
    if (optional && (x === "" || x === null || x === undefined)) return "";
    const n = Number(x);
    assert(
      x !== "" && Number.isFinite(n) && n >= 0 && n <= 100000,
      "NUMBER",
      field,
    );
    return n;
  }
  function integer(x, field) {
    const n = number(x, field);
    assert(Number.isInteger(n), "NUMBER", field);
    return n;
  }
  function choice(v, values, field) {
    assert(values.includes(v), "ENUM", field);
    return v;
  }
  function ref(s, table, id) {
    const v = s[table].find((r) => r[schemas[table].id] === id);
    assert(v, "NOT_FOUND", schemas[table].id);
    return v;
  }
  function active(r) {
    return r.status !== "void";
  }
  function balance(s, r) {
    return (
      (cents(r.amount) -
        s.payments
          .filter((p) => p.receivable_id === r.receivable_id && active(p))
          .reduce((a, p) => a + cents(p.amount), 0)) /
      100
    );
  }
  function hasData(s) {
    return businessTables.some((t) => s[t].length);
  }
  function fingerprint(x) {
    return JSON.stringify(x);
  }
  function initial(input, env) {
    const s = empty();
    const locale = choice(
      input.locale || "pt-BR",
      ["pt-BR", "en-US"],
      "locale",
    );
    const currency = choice(
      input.currency || "BRL",
      ["BRL", "USD"],
      "currency",
    );
    const timezone = text(
      input.timezone || "America/Sao_Paulo",
      "timezone",
      true,
      80,
    );
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(
        new Date(),
      );
    } catch (e) {
      fail("TIMEZONE", "timezone");
    }
    s.installation.push({
      installation_id: env.id(),
      product_id: PRODUCT,
      product_version: VERSION,
      schema_version: SCHEMA_VERSION,
      locale,
      currency,
      unit_system: "metric",
      timezone,
      business_name: text(
        input.business_name || "",
        "business_name",
        false,
        100,
      ),
      created_at: env.now(),
      last_migrated_at: "",
      revision: 0,
    });
    return s;
  }
  function inspect(s) {
    const issues = [];
    const add = (code, table, field) =>
      issues.push({ code, table, field: field || "" });
    if (!s || typeof s !== "object")
      return [{ code: "SCHEMA", table: "installation", field: "" }];
    Object.keys(schemas).forEach((t) => {
      if (!Array.isArray(s[t])) {
        add("TABLE", t);
        return;
      }
      const ids = new Set(),
        schema = schemas[t];
      s[t].forEach((r) => {
        if (!r || typeof r !== "object") {
          add("ROW", t);
          return;
        }
        if (
          typeof r[schema.id] !== "string" ||
          !r[schema.id] ||
          ids.has(r[schema.id])
        )
          add("ID", t, schema.id);
        ids.add(r[schema.id]);
        if (
          Object.keys(r).some(
            (k) => !Object.hasOwnProperty.call(schema.fields, k),
          )
        )
          add("COLUMN", t);
        Object.keys(schema.fields).forEach((f) => {
          const type = schema.fields[f],
            v = r[f];
          let ok = true;
          if (type === "text") ok = typeof v === "string" && v.length <= 20000;
          if (type === "boolean") ok = typeof v === "boolean";
          if (type === "integer")
            ok = typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
          if (type === "optionalNumber")
            ok =
              v === "" ||
              (typeof v === "number" &&
                Number.isFinite(v) &&
                v >= 0 &&
                v <= 100000);
          if (type === "money") {
            try {
              assert(typeof v === "number", "MONEY", f);
              money(v, f);
            } catch (e) {
              ok = false;
            }
          }
          if (!ok) add("TYPE", t, f);
        });
      });
    });
    if (issues.length) return issues;
    if (s.installation.length !== 1)
      return [{ code: "INSTALLATION", table: "installation", field: "" }];
    const meta = s.installation[0];
    if (meta.product_id !== PRODUCT || meta.schema_version !== SCHEMA_VERSION)
      add("VERSION", "installation");
    try {
      initial(meta, { id: () => "", now: () => "" });
    } catch (e) {
      add(e.code, "installation", e.field);
    }
    const maps = {};
    Object.keys(schemas).forEach(
      (t) => (maps[t] = new Map(s[t].map((r) => [r[schemas[t].id], r]))),
    );
    function fk(t, r, f, target, optional) {
      if (optional && !r[f]) return;
      if (!maps[target].has(r[f])) add("REFERENCE", t, f);
    }
    function dt(t, r, f, required) {
      try {
        date(r[f], f, required);
      } catch (e) {
        add("DATE", t, f);
      }
    }
    const enums = {
      campaigns: ["draft", "active", "completed", "cancelled"],
      jobs: ["draft", "active", "completed", "cancelled"],
      deliverables: [
        "planned",
        "in_progress",
        "review",
        "completed",
        "cancelled",
      ],
      rights: ["active", "expired", "renewed", "closed"],
      receivables: ["open", "paid", "void"],
      payments: ["active", "void"],
      expenses: ["active", "void"],
    };
    Object.keys(enums).forEach((t) =>
      s[t].forEach((r) => {
        if (!enums[t].includes(r.status)) add("ENUM", t, "status");
      }),
    );
    s.parties.forEach((r) => {
      if (!r.display_name.trim() || !["brand", "client"].includes(r.party_type))
        add("VALUE", "parties");
    });
    s.jobs.forEach((r) => {
      fk("jobs", r, "party_id", "parties");
      if (r.job_type !== "campaign") add("ENUM", "jobs", "job_type");
    });
    s.campaigns.forEach((c) => {
      fk("campaigns", c, "job_id", "jobs");
      fk("campaigns", c, "brand_id", "parties");
      dt("campaigns", c, "due_date", true);
      dt("campaigns", c, "start_date", false);
      if (
        !c.campaign_name.trim() ||
        (c.start_date && c.start_date > c.due_date)
      )
        add("VALUE", "campaigns");
      const job = maps.jobs.get(c.job_id);
      if (
        job &&
        (job.party_id !== c.brand_id ||
          job.title !== c.campaign_name ||
          job.status !== c.status ||
          job.quoted_amount !== c.agreed_fee ||
          job.due_date !== c.due_date)
      )
        add("JOB_MISMATCH", "campaigns");
      const rec = s.receivables.filter(
        (r) => r.job_id === c.job_id && active(r),
      );
      if (cents(sum(rec, "amount")) > cents(c.agreed_fee))
        add("OVERBILLED", "campaigns");
      if (
        c.status === "completed" &&
        s.deliverables.some(
          (d) =>
            d.campaign_id === c.campaign_id &&
            !["completed", "cancelled"].includes(d.status),
        )
      )
        add("INCOMPLETE", "campaigns");
      if (c.status === "cancelled" && rec.some((r) => balance(s, r) > 0))
        add("OUTSTANDING", "campaigns");
    });
    s.jobs.forEach((j) => {
      if (s.campaigns.filter((c) => c.job_id === j.job_id).length !== 1)
        add("JOB_MISMATCH", "jobs");
    });
    s.deliverables.forEach((d) => {
      fk("deliverables", d, "campaign_id", "campaigns");
      dt("deliverables", d, "due_date", true);
      if (!d.description.trim() || !d.deliverable_type.trim())
        add("VALUE", "deliverables");
    });
    s.rights.forEach((r) => {
      fk("rights", r, "campaign_id", "campaigns");
      fk("rights", r, "deliverable_id", "deliverables");
      dt("rights", r, "start_date", true);
      dt("rights", r, "end_date", false);
      if (r.end_date && r.end_date < r.start_date) add("DATE_ORDER", "rights");
      const d = maps.deliverables.get(r.deliverable_id);
      if (d && d.campaign_id !== r.campaign_id)
        add("REFERENCE", "rights", "campaign_id");
      if (!r.right_type.trim()) add("VALUE", "rights");
    });
    ["receivables", "payments", "expenses"].forEach((t) =>
      s[t].forEach((r) => {
        fk(t, r, "job_id", "jobs", t === "expenses");
        fk(t, r, "party_id", "parties", t === "expenses");
        const j = maps.jobs.get(r.job_id);
        if (j && j.party_id !== r.party_id) add("REFERENCE", t, "party_id");
        if (r.amount <= 0) add("MONEY", t, "amount");
        if (r.status === "void" && !r.void_reason.trim())
          add("REQUIRED", t, "void_reason");
      }),
    );
    s.receivables.forEach((r) => {
      if (!r.description.trim()) add("REQUIRED", "receivables", "description");
      dt("receivables", r, "due_date", true);
      const b = balance(s, r);
      if (b < 0) add("OVERPAYMENT", "receivables");
      if (
        r.status === "void" &&
        s.payments.some((p) => p.receivable_id === r.receivable_id && active(p))
      )
        add("ACTIVE_PAYMENTS", "receivables");
      if (active(r) && r.status !== (b === 0 ? "paid" : "open"))
        add("BALANCE_STATUS", "receivables");
    });
    s.payments.forEach((p) => {
      fk("payments", p, "receivable_id", "receivables");
      dt("payments", p, "payment_date", true);
      const r = maps.receivables.get(p.receivable_id);
      if (r && (r.job_id !== p.job_id || r.party_id !== p.party_id))
        add("REFERENCE", "payments", "job_id");
    });
    s.expenses.forEach((e) => {
      if (!e.description.trim() || !e.category_key.trim())
        add("REQUIRED", "expenses");
      dt("expenses", e, "expense_date", true);
      if (!e.job_id && e.party_id) add("REFERENCE", "expenses", "party_id");
    });
    return issues;
  }
  function validate(s) {
    const issues = inspect(s);
    if (issues.length) {
      const e = new Error("INTEGRITY");
      e.code = "INTEGRITY";
      e.issues = issues;
      throw e;
    }
    return s;
  }
  // Migrations are explicit and preserve IDs/history. Schema 1 predates campaign origin_source.
  function migrate(s) {
    const out = copy(s);
    assert(out.installation && out.installation.length === 1, "SCHEMA");
    const m = out.installation[0];
    if (m.schema_version === 0) {
      assert(!hasData(out), "MIGRATION");
      m.schema_version = SCHEMA_VERSION;
      m.product_version = VERSION;
      m.revision = m.revision || 0;
    }
    if (m.schema_version === 1) {
      out.campaigns.forEach((c) => {
        if (c.origin_source === undefined) c.origin_source = "";
      });
      m.schema_version = 2;
      m.product_version = VERSION;
      m.last_migrated_at = m.last_migrated_at || new Date().toISOString();
    }
    assert(m.schema_version === SCHEMA_VERSION, "SCHEMA");
    return validate(out);
  }
  return {
    VERSION,
    SCHEMA_VERSION,
    PRODUCT,
    schemas,
    businessTables,
    fail,
    assert,
    copy,
    empty,
    text,
    date,
    money,
    cents,
    sum,
    number,
    integer,
    choice,
    ref,
    active,
    balance,
    hasData,
    fingerprint,
    initial,
    inspect,
    validate,
    migrate,
  };
})();
if (typeof module !== "undefined") module.exports = MBS;
