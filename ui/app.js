(function () {
  "use strict";
  const t = UI_TEXT["pt-BR"],
    app = document.getElementById("app"),
    dialog = document.getElementById("formDialog");
  const local = !(window.google && google.script && google.script.run);
  let state,
    route = "home",
    selected = "",
    search = "",
    busy = false,
    diagnostic = null,
    lastAttempt = null,
    formRevision = 0,
    localRepo,
    localService,
    hash = "";
  const $ = (s) => document.querySelector(s),
    esc = (x) =>
      String(x ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
  const uid = () => crypto.randomUUID();
  function meta() {
    return state && state.installation
      ? state.installation[0]
      : {
          locale: "pt-BR",
          currency: "BRL",
          timezone: "America/Sao_Paulo",
          revision: 0,
        };
  }
  const money = (v) =>
    new Intl.NumberFormat(meta().locale, {
      style: "currency",
      currency: meta().currency,
    }).format(v || 0);
  const num = (v) =>
    new Intl.NumberFormat(meta().locale, { maximumFractionDigits: 2 }).format(
      v || 0,
    );
  const date = (v) =>
    v
      ? new Intl.DateTimeFormat(meta().locale, { timeZone: "UTC" }).format(
          new Date(v + "T12:00:00Z"),
        )
      : t.unknown;
  const status = (v, context) =>
    '<span class="badge ' +
    esc(v) +
    '">' +
    esc(v === "active" && context ? t[context] : t.enums[v] || v) +
    "</span>";
  const btn = (text, action, cls = "", id = "") =>
    '<button type="button" class="' +
    cls +
    '" data-action="' +
    action +
    '" data-id="' +
    esc(id) +
    '">' +
    esc(text) +
    "</button>";
  const svg = (path) =>
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    path +
    "</svg>";
  const icons = {
    home: svg('<path d="M3 10 12 3l9 7v10H3Z"/><path d="M9 20v-7h6v7"/>'),
    campaigns: svg(
      '<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M8 6V3h8v3M3 11h18"/>',
    ),
    parties: svg(
      '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 6"/>',
    ),
    finance: svg(
      '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 15h3M15 15h2"/>',
    ),
    help: svg(
      '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 17h.01"/>',
    ),
  };
  const row = (title, sub, right) =>
    '<div class="record"><div class="recordLeft"><div class="recordTitle">' +
    title +
    '</div><div class="recordMeta">' +
    sub +
    '</div></div><div class="recordRight">' +
    right +
    "</div></div>";
  const card = (title, body, action = "") =>
    '<section class="card"><div class="cardHead"><h2>' +
    esc(title) +
    "</h2>" +
    action +
    "</div>" +
    body +
    "</section>";
  const empty = (
    title,
    description,
    footer = "",
    iconAction = "",
    iconLabel = "",
    showIcon = true,
  ) =>
    '<div class="empty">' +
    (showIcon
      ? iconAction
        ? '<button type="button" class="emptyIcon emptyAction" data-action="' +
          esc(iconAction) +
          '" aria-label="' +
          esc(iconLabel) +
          '" title="' +
          esc(iconLabel) +
          '">＋</button>'
        : '<div class="emptyIcon" aria-hidden="true">＋</div>'
      : "") +
    "<h3>" +
    esc(title) +
    "</h3><p>" +
    esc(description) +
    "</p>" +
    footer +
    "</div>";
  const campaign = (id) => state.campaigns.find((c) => c.campaign_id === id),
    brand = (id) => state.parties.find((p) => p.party_id === id);
  function matches(s) {
    return String(s).toLocaleLowerCase().includes(search.toLocaleLowerCase());
  }
  function toast(text) {
    const el = $("#toast");
    el.textContent = text;
    el.classList.add("visible");
    setTimeout(() => el.classList.remove("visible"), 4500);
  }
  function errorText(error) {
    return t.errors[error.code] || t.errors.UNEXPECTED;
  }
  function today(m) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: (m && m.timezone) || "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
  async function invoke(action, payload = {}, attempt) {
    try {
      return await invokeRequest(action, payload, attempt);
    } catch (e) {
      return { ok: false, error: { code: e.code || "UNEXPECTED" } };
    }
  }
  async function invokeRequest(action, payload = {}, attempt) {
    const request = attempt || {
      action,
      payload,
      operation_id: uid(),
      revision: meta().revision,
    };
    if (local) {
      hash = Array.from(
        new Uint8Array(
          await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(
              JSON.stringify({
                action: request.action,
                payload: request.payload,
              }),
            ),
          ),
        ),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const before = localRepo.read();
      const result = localService.handle(request);
      if (result.ok) {
        try {
          localStorage.setItem(
            "ugc-validation-v1",
            JSON.stringify(localRepo.read()),
          );
        } catch (e) {
          localRepo = UGC.memoryRepository(before);
          localService = UGC.createService(localRepo, localEnv(), Backup);
          return { ok: false, error: { code: "LOCAL_STORAGE" } };
        }
      }
      return result;
    }
    return new Promise((resolve) =>
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(() =>
          resolve({ ok: false, error: { code: "NETWORK" } }),
        )
        .api(request),
    );
  }
  async function load() {
    app.innerHTML =
      '<div class="loading"><div><div class="spinner"></div>' +
      esc(t.loading) +
      "</div></div>";
    const r = await invoke("load");
    if (!r.ok) {
      diagnostic = {
        product: MBS.PRODUCT,
        version: MBS.VERSION,
        issues: r.error.issues || [],
        code: r.error.code,
      };
      app.innerHTML =
        '<div class="setup"><h1>' +
        esc(t.systemFailure) +
        "</h1><p>" +
        esc(errorText(r.error)) +
        "</p>" +
        btn(t.retry, "refresh", "primary") +
        btn(t.diagnostic, "diagnostic") +
        "</div>";
      return;
    }
    state = r.data;
    render();
  }
  function pageHead(title, lead, action = "") {
    return (
      '<div class="pageHead"><div><div class="eyebrow">' +
      esc(t.app) +
      "</div><h1>" +
      esc(title) +
      '</h1><p class="sub">' +
      esc(lead) +
      '</p></div><div class="actions">' +
      action +
      "</div></div>"
    );
  }
  function campaignList(list) {
    return list.length
      ? list
          .map((c) =>
            row(
              esc(c.campaign_name),
              esc(brand(c.brand_id)?.display_name || "") +
                " · " +
                esc(date(c.due_date)) +
                (c.origin_source
                  ? "<br>" + esc(t.origin_source) + ": " + esc(c.origin_source)
                  : ""),
              status(c.status) +
                '<span class="money">' +
                esc(money(c.agreed_fee)) +
                "</span>" +
                btn(t.open, "campaign", "small", c.campaign_id),
            ),
          )
          .join("")
      : empty(
          t.noCampaigns,
          t.noCampaignsHint,
          "",
          "form:campaign",
          t.newCampaign,
        );
  }
  function renderHome() {
    const k = state.kpis;
    return (
      pageHead(
        t.welcome,
        t.homeLead,
        btn(t.newCampaign, "form:campaign", "primary"),
      ) +
      '<div class="kpis">' +
      [
        [t.due, num(k.due)],
        [t.balance, money(k.balance)],
        [t.received, money(k.received)],
        [t.rights, num(k.rights)],
      ]
        .map(
          ([l, v]) =>
            '<div class="kpi"><div class="accent"></div><span class="label">' +
            esc(l) +
            '</span><strong class="value">' +
            esc(v) +
            "</strong></div>",
        )
        .join("") +
      '</div><div class="grid"><div>' +
      card(
        t.attention,
        state.attention.length
          ? state.attention
              .map((a) =>
                row(
                  esc(a.title),
                  '<span class="badge ' +
                    (a.type.startsWith("overdue") || a.type === "expired_right"
                      ? "overdue"
                      : "") +
                    '">' +
                    esc(t.attentionTypes[a.type]) +
                    "</span> · " +
                    esc(date(a.date)),
                  btn(t.open, "campaign", "small", a.campaign_id),
                ),
              )
              .join("")
          : empty(t.attentionEmpty, t.attentionHint, "", "", "", false),
      ) +
      card(
        t.recent,
        campaignList(state.campaigns.slice().reverse().slice(0, 4)),
        btn(t.viewAll, "route:campaigns", "quiet small"),
      ) +
      "</div><div>" +
      card(
        t.guide,
        '<div class="cardBody steps">' +
          [1, 2, 3]
            .map(
              (i) =>
                '<div class="step"><span class="stepNum">0' +
                i +
                "</span><p>" +
                esc(t["guide" + i]) +
                "</p></div>",
            )
            .join("") +
          "</div>",
      ) +
      '<p class="footerNote">' +
      esc(t.monthBasis) +
      " " +
      esc(meta().timezone) +
      "</p></div></div>"
    );
  }
  function searchBox() {
    return (
      '<div class="search"><input id="search" aria-label="' +
      esc(t.search) +
      '" placeholder="' +
      esc(t.search) +
      '" value="' +
      esc(search) +
      '"></div>'
    );
  }
  function renderCampaigns() {
    return (
      pageHead(
        t.campaigns,
        t.campaignLead,
        btn(t.newCampaign, "form:campaign", "primary"),
      ) +
      searchBox() +
      card(
        t.campaigns,
        campaignList(
          state.campaigns
            .filter((c) =>
              matches(c.campaign_name + " " + brand(c.brand_id)?.display_name),
            )
            .slice()
            .reverse(),
        ),
      )
    );
  }
  function metrics(e) {
    return (
      '<div class="cardBody"><div class="metrics">' +
      [
        [t.agreed, money(e.agreed)],
        [t.paid, money(e.paid)],
        [t.balanceShort, money(e.balance)],
        [t.expenses, money(e.expenses)],
        [t.contribution, money(e.contribution)],
        [t.hourly, e.hourly === null ? t.unknown : money(e.hourly) + "/h"],
        [t.hours, num(e.hours)],
        [t.estimated_hours, num(e.estimated_hours)],
        [t.unbilled, money(e.unbilled)],
      ]
        .map(
          ([l, v]) =>
            '<div class="metric"><small>' +
            esc(l) +
            "</small><strong>" +
            esc(v) +
            "</strong></div>",
        )
        .join("") +
      '</div><div class="note">' +
      esc(t.economicsNote) +
      (e.incomplete_hours ? "<br>" + esc(t.incompleteHours) : "") +
      "</div></div>"
    );
  }
  function renderCampaign() {
    const c = campaign(selected);
    if (!c) {
      route = "campaigns";
      return renderCampaigns();
    }
    const ds = state.deliverables.filter(
        (d) => d.campaign_id === c.campaign_id,
      ),
      rs = state.rights.filter((r) => r.campaign_id === c.campaign_id);
    const transition =
      c.status === "draft"
        ? btn(t.activate, "status:active", "small", c.campaign_id) +
          btn(
            t.cancelCampaign,
            "status:cancelled",
            "small danger",
            c.campaign_id,
          )
        : c.status === "active"
          ? btn(t.complete, "status:completed", "small", c.campaign_id) +
            btn(
              t.cancelCampaign,
              "status:cancelled",
              "small danger",
              c.campaign_id,
            )
          : btn(t.activate, "status:active", "small", c.campaign_id);
    return (
      btn("← " + t.back, "route:campaigns", "quiet small") +
      pageHead(
        c.campaign_name,
        (brand(c.brand_id)?.display_name || "") +
          (c.origin_source
            ? " · " + t.origin_source + ": " + c.origin_source
            : ""),
        btn(t.edit, "form:campaign", "", c.campaign_id),
      ) +
      card(
        t.details,
        '<div class="cardBody"><div class="actions">' +
          status(c.status) +
          transition +
          "</div><p>" +
          esc(date(c.start_date)) +
          " → " +
          esc(date(c.due_date)) +
          "</p>" +
          (c.notes ? "<p>" + esc(c.notes) + "</p>" : "") +
          "</div>" +
          metrics(c.economics),
      ) +
      card(
        t.deliverables,
        ds.length
          ? ds
              .map((d) =>
                row(
                  esc(d.description),
                  esc(d.deliverable_type) +
                    " · " +
                    esc(date(d.due_date)) +
                    "<br>" +
                    esc(t.hours) +
                    ": " +
                    (d.actual_hours === ""
                      ? esc(t.unknown)
                      : esc(num(d.actual_hours))) +
                    " · " +
                    esc(t.revisions) +
                    ": " +
                    d.revision_rounds_used +
                    "/" +
                    d.revision_rounds_included +
                    (d.revision_rounds_used > d.revision_rounds_included
                      ? '<br><span class="badge overdue">' +
                        esc(t.excessRevisions) +
                        "</span>"
                      : ""),
                  status(d.status) +
                    btn(t.edit, "form:deliverable", "small", d.deliverable_id),
                ),
              )
              .join("")
          : empty(t.empty, t.guide1, "", "form:deliverable", t.addDelivery),
        btn(t.addDelivery, "form:deliverable", "small", ""),
      ) +
      card(
        t.usageRights,
        rs.length
          ? rs
              .map((r) =>
                row(
                  esc(r.right_type),
                  esc(
                    state.deliverables.find(
                      (d) => d.deliverable_id === r.deliverable_id,
                    )?.description || "",
                  ) +
                    "<br>" +
                    esc(date(r.start_date)) +
                    " → " +
                    esc(r.end_date ? date(r.end_date) : t.noEnd) +
                    "<br>" +
                    esc(r.channels) +
                    " · " +
                    esc(r.territory) +
                    "<br>" +
                    esc(t.renewal_value) +
                    ": " +
                    esc(money(r.renewal_value)),
                  status(r.status, "rightActive") +
                    btn(t.edit, "form:right", "small", r.right_id),
                ),
              )
              .join("")
          : empty(t.empty, t.rightsNote, "", "form:right", t.addRight),
        btn(t.addRight, "form:right", "small"),
      ) +
      renderFinanceRecords(c.job_id)
    );
  }
  function renderParties() {
    return (
      pageHead(
        t.parties,
        t.partyLead,
        btn(t.newParty, "form:party", "primary"),
      ) +
      searchBox() +
      card(
        t.parties,
        state.parties
          .filter((p) => matches(p.display_name))
          .map((p) =>
            row(
              esc(p.display_name) + (p.active ? "" : " " + status("archived")),
              esc(p.email || p.phone) +
                "<br>" +
                esc(t.contribution) +
                ": " +
                esc(money(p.economics.contribution)),
              btn(t.open, "party", "small", p.party_id) +
                btn(t.edit, "form:party", "small", p.party_id),
            ),
          )
          .join("") ||
          empty(t.noParties, t.noPartiesHint, "", "form:party", t.newParty),
      )
    );
  }
  function renderParty() {
    const p = brand(selected);
    return (
      btn("← " + t.back, "route:parties", "quiet small") +
      pageHead(
        p.display_name,
        [p.email, p.phone].filter(Boolean).join(" · "),
        btn(t.edit, "form:party", "", p.party_id) +
          btn(t.archive, "archive", "quiet", p.party_id),
      ) +
      card(
        t.details,
        metrics(p.economics) +
          '<div class="cardBody"><p>' +
          esc(p.notes) +
          "</p></div>",
      ) +
      card(
        t.history,
        campaignList(state.campaigns.filter((c) => c.brand_id === p.party_id)),
      )
    );
  }
  function renderFinanceRecords(job) {
    const rec = state.receivables.filter((r) => !job || r.job_id === job),
      payments = state.payments.filter((r) => !job || r.job_id === job),
      expenses = state.expenses.filter((r) => !job || r.job_id === job);
    const jobName = (id) =>
      state.campaigns.find((c) => c.job_id === id)?.campaign_name ||
      t.generalExpense;
    const voidButton = (table, r, id) =>
      r.status === "void"
        ? ""
        : btn(t.void, "void:" + table, "small quiet", id);
    return (
      card(
        t.receivables,
        rec.length
          ? rec
              .map((r) =>
                row(
                  esc(r.description),
                  esc(jobName(r.job_id)) +
                    " · " +
                    esc(date(r.due_date)) +
                    "<br>" +
                    esc(t.receivableAmount) +
                    ": " +
                    esc(money(r.amount)) +
                    (r.void_reason ? "<br>" + esc(r.void_reason) : ""),
                  status(r.status) +
                    '<span class="money">' +
                    esc(t.balanceShort) +
                    ": " +
                    esc(money(r.balance)) +
                    "</span>" +
                    (r.balance > 0
                      ? btn(
                          t.addPayment,
                          "form:payment",
                          "small",
                          r.receivable_id,
                        )
                      : "") +
                    voidButton("receivables", r, r.receivable_id),
                ),
              )
              .join("")
          : empty(
              t.empty,
              t.receivableNote,
              "",
              "form:receivable",
              t.addReceivable,
            ),
        btn(t.addReceivable, "form:receivable", "small"),
      ) +
      '<div class="twoCols">' +
      card(
        t.payments,
        payments.length
          ? payments
              .slice()
              .reverse()
              .map((p) =>
                row(
                  esc(money(p.amount)),
                  esc(jobName(p.job_id)) +
                    " · " +
                    esc(date(p.payment_date)) +
                    "<br>" +
                    esc(p.payment_method) +
                    " " +
                    esc(p.reference) +
                    (p.void_reason ? "<br>" + esc(p.void_reason) : ""),
                  status(p.status, "recordActive") +
                    voidButton("payments", p, p.payment_id),
                ),
              )
              .join("")
          : empty(t.empty, t.paymentNote, "", "form:payment", t.addPayment),
        btn(t.addPayment, "form:payment", "small"),
      ) +
      card(
        t.expenses,
        expenses.length
          ? expenses
              .slice()
              .reverse()
              .map((e) =>
                row(
                  esc(e.description) + " · " + esc(money(e.amount)),
                  esc(jobName(e.job_id)) +
                    "<br>" +
                    esc(date(e.expense_date)) +
                    " · " +
                    esc(t.enums[e.category_key] || e.category_key) +
                    (e.void_reason ? "<br>" + esc(e.void_reason) : ""),
                  status(e.status, "recordActive") +
                    voidButton("expenses", e, e.expense_id),
                ),
              )
              .join("")
          : empty(t.empty, t.guide3, "", "form:expense", t.addExpense),
        btn(t.addExpense, "form:expense", "small"),
      ) +
      "</div>"
    );
  }
  function renderFinance() {
    return (
      pageHead(
        t.finance,
        t.financeLead,
        btn(t.addPayment, "form:payment", "primary") +
          btn(t.addExpense, "form:expense"),
      ) + renderFinanceRecords()
    );
  }
  function renderHelp() {
    return (
      pageHead(t.help, t.helpLead, btn(t.settings, "form:settings")) +
      '<div class="grid"><div>' +
      card(
        t.export,
        '<div class="cardBody"><p>' +
          esc(t.backupNote) +
          "</p>" +
          btn(t.export, "export", "primary") +
          "</div>",
      ) +
      card(
        t.restore,
        '<div class="cardBody"><p>' +
          esc(t.restoreNote) +
          '</p><input class="file" type="file" id="backupFiles" multiple accept=".csv,.zip" aria-label="' +
          esc(t.restore) +
          '">' +
          btn(t.restore, "restore") +
          "</div>",
      ) +
      card(
        t.check,
        '<div class="cardBody">' +
          btn(t.check, "check") +
          " " +
          (diagnostic
            ? btn(t.diagnostic, "diagnostic") +
              "<p>" +
              esc(diagnostic.issues.length ? t.checkBad : t.checkGood) +
              '</p><pre class="checkList">' +
              esc(JSON.stringify(diagnostic, null, 2)) +
              "</pre>"
            : "") +
          "</div>",
      ) +
      "</div><div>" +
      card(
        t.versions,
        '<div class="cardBody"><p>' +
          esc(t.version) +
          ": " +
          esc(state.version) +
          "<br>" +
          esc(t.schema) +
          ": " +
          meta().schema_version +
          "<br>" +
          esc(meta().locale) +
          " · " +
          esc(meta().currency) +
          "<br>" +
          esc(meta().timezone) +
          "</p><p>" +
          esc(t.mobileNote) +
          "</p>" +
          (local ? '<div class="note">' + esc(t.localNote) + "</div>" : "") +
          "</div>",
      ) +
      card(
        t.sample,
        '<div class="cardBody"><p>' +
          esc(t.sampleNote) +
          "</p>" +
          btn(t.sample, "sample") +
          "</div>",
      ) +
      card(
        t.guideChapters,
        '<div class="cardBody steps">' +
          Array.from(
            { length: 9 },
            (_, i) =>
              '<div class="step"><span class="stepNum">' +
              (i + 1) +
              "</span><p>" +
              esc(t["guide" + (i + 1)]) +
              "</p></div>",
          ).join("") +
          "</div>",
      ) +
      "</div></div>"
    );
  }
  function render() {
    if (state.setup) {
      renderSetup();
      return;
    }
    const current = ["campaign", "party"].includes(route)
      ? route === "campaign"
        ? "campaigns"
        : "parties"
      : route;
    const content = (
      {
        home: renderHome,
        campaigns: renderCampaigns,
        campaign: renderCampaign,
        parties: renderParties,
        party: renderParty,
        finance: renderFinance,
        help: renderHelp,
      }[route] || renderHome
    )();
    app.innerHTML =
      '<div class="shell"><aside class="sidebar"><div class="brand">UGC<span>' +
      esc(t.tagline) +
      '</span></div><nav class="nav" aria-label="' +
      esc(t.app) +
      '">' +
      ["home", "campaigns", "parties", "finance", "help"]
        .map(
          (r) =>
            '<button data-action="route:' +
            r +
            '" class="' +
            (current === r ? "current" : "") +
            '" ' +
            (current === r ? 'aria-current="page"' : "") +
            ">" +
            icons[r] +
            esc(t[r]) +
            "</button>",
        )
        .join("") +
      '</nav><div class="sideFoot">' +
      esc(meta().business_name || t.app) +
      "<br>" +
      esc(state.version) +
      '</div></aside><div class="workspace"><header class="topbar"><strong>' +
      esc(meta().business_name || t.app) +
      "</strong><div>" +
      esc(date(state.today)) +
      " " +
      btn(t.refresh, "refresh", "quiet small") +
      "</div></header>" +
      (local ? '<div class="localBanner">' + esc(t.localMode) + "</div>" : "") +
      '<main class="main">' +
      content +
      "</main></div></div>";
  }
  function options(rows, id, label) {
    return rows.map((r) => [
      r[id],
      typeof label === "function" ? label(r) : r[label],
    ]);
  }
  function inputField(
    key,
    value = "",
    type = "text",
    required = false,
    opts = null,
    wide = false,
  ) {
    let control;
    const help = t.fieldHelp?.[key] || "";
    const attrs =
      'name="' +
      key +
      '" id="f_' +
      key +
      '" ' +
      (required ? "required " : "") +
      (help ? 'title="' + esc(help) + '" ' : "");
    if (opts)
      control =
        "<select " +
        attrs +
        ">" +
        (!required
          ? '<option value="">' +
            esc(key === "campaign_id" ? t.generalExpense : t.choose) +
            "</option>"
          : '<option value="">' + esc(t.choose) + "</option>") +
        opts
          .map(
            ([v, l]) =>
              '<option value="' +
              esc(v) +
              '" ' +
              (String(v) === String(value) ? "selected" : "") +
              ">" +
              esc(l) +
              "</option>",
          )
          .join("") +
        "</select>";
    else if (type === "textarea")
      control =
        "<textarea " +
        attrs +
        ' maxlength="2000">' +
        esc(value) +
        "</textarea>";
    else {
      let shown = value;
      if (type === "money" && value !== "")
        shown = new Intl.NumberFormat(meta().locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: false,
        }).format(Number(value));
      if (type === "decimal" && value !== "")
        shown = new Intl.NumberFormat(meta().locale, {
          useGrouping: false,
          maximumFractionDigits: 4,
        }).format(Number(value));
      control =
        "<input " +
        attrs +
        'type="' +
        (type === "money" || type === "decimal" ? "text" : type) +
        '" ' +
        (type === "money" || type === "decimal"
          ? 'inputmode="decimal" data-number="' + type + '" '
          : "") +
        (type === "number" ? 'min="0" step="1" ' : "") +
        'value="' +
        esc(shown) +
        '" maxlength="2000">';
    }
    return (
      '<div class="field ' +
      (wide ? "wide" : "") +
      '"><label for="f_' +
      key +
      '">' +
      esc(t[key] || key) +
      (required ? " *" : "") +
      "</label>" +
      control +
      "</div>"
    );
  }
  function settingsFields(values) {
    return (
      inputField(
        "business_name",
        values.business_name || "",
        "text",
        false,
        null,
        true,
      ) +
      inputField("locale", values.locale || "pt-BR", "text", true, [
        ["pt-BR", t.formatBR],
        ["en-US", t.formatUS],
      ]) +
      inputField("currency", values.currency || "BRL", "text", true, [
        ["BRL", "BRL"],
        ["USD", "USD"],
      ]) +
      inputField(
        "timezone",
        values.timezone || "America/Sao_Paulo",
        "text",
        true,
        null,
        true,
      )
    );
  }
  function renderSetup() {
    app.innerHTML =
      '<div class="setup"><div class="brand">UGC OS</div><h1>' +
      esc(t.setupTitle) +
      "</h1><p>" +
      esc(t.setupLead) +
      '</p><form id="setupForm"><div class="formGrid">' +
      settingsFields({}) +
      '</div><div class="formError" role="alert"></div><div class="formActions"><button class="primary" type="submit">' +
      esc(t.start) +
      "</button></div></form></div>";
    formRevision = 0;
  }
  function showForm(kind, id) {
    let v = {},
      fields = "",
      note = "",
      action = "",
      title = "",
      hidden = {};
    const c = route === "campaign" ? campaign(selected) : null;
    const parties = options(
      state.parties.filter((p) => p.active),
      "party_id",
      "display_name",
    );
    const campaigns = options(
      state.campaigns.filter(
        (c) => !["completed", "cancelled"].includes(c.status),
      ),
      "campaign_id",
      "campaign_name",
    );
    const statuses = (values) => values.map((x) => [x, t.enums[x]]);
    const f = (k, type = "text", req = false, opts = null, wide = false) =>
      inputField(k, v[k] ?? "", type, req, opts, wide);
    if (kind === "party") {
      v = state.parties.find((p) => p.party_id === id) || {};
      action = "saveParty";
      title = id ? t.edit : t.newParty;
      hidden = { party_id: id || "" };
      fields =
        f("display_name", "text", true, null, true) +
        f("email", "email") +
        f("phone") +
        f("notes", "textarea", false, null, true);
    }
    if (kind === "campaign") {
      v = campaign(id) || { start_date: state.today };
      action = "saveCampaign";
      title = id ? t.edit : t.newCampaign;
      hidden = { campaign_id: id || "" };
      const all = options(
        state.parties.filter((p) => p.active || p.party_id === v.brand_id),
        "party_id",
        "display_name",
      );
      if (!all.length) {
        toast(t.noParties);
        showForm("party");
        return;
      }
      fields =
        f("brand_id", "text", true, all) +
        f("origin_source", "text", false, null, true) +
        f("campaign_name", "text", true) +
        f("agreed_fee", "money", true) +
        f("due_date", "date", true) +
        f("start_date", "date") +
        f("notes", "textarea", false, null, true);
      note = t.campaignNote;
    }
    if (kind === "deliverable") {
      if (!c) return;
      v = state.deliverables.find((d) => d.deliverable_id === id) || {
        status: "planned",
        due_date: c.due_date,
        revision_rounds_included: 0,
        revision_rounds_used: 0,
      };
      action = "saveDeliverable";
      title = id ? t.edit : t.addDelivery;
      hidden = { campaign_id: c.campaign_id, deliverable_id: id || "" };
      fields =
        f("description", "text", true, null, true) +
        f("deliverable_type", "text", true) +
        f("due_date", "date", true) +
        f(
          "status",
          "text",
          true,
          statuses([
            "planned",
            "in_progress",
            "review",
            "completed",
            "cancelled",
          ]),
        ) +
        f("revision_rounds_included", "number", true) +
        f("revision_rounds_used", "number", true) +
        f("estimated_hours", "decimal") +
        f("actual_hours", "decimal");
      note = t.hourNote;
    }
    if (kind === "right") {
      if (!c) return;
      const ds = options(
        state.deliverables.filter((d) => d.campaign_id === c.campaign_id),
        "deliverable_id",
        "description",
      );
      if (!ds.length) {
        toast(t.addDelivery);
        return;
      }
      v = state.rights.find((r) => r.right_id === id) || {
        start_date: state.today,
        status: "active",
        renewal_value: 0,
      };
      action = "saveRight";
      title = id ? t.edit : t.addRight;
      hidden = { right_id: id || "" };
      fields =
        f("deliverable_id", "text", true, ds, true) +
        f("right_type", "text", true, null, true) +
        f("start_date", "date", true) +
        f("end_date", "date") +
        f("channels") +
        f("territory") +
        f("renewal_value", "money") +
        f(
          "status",
          "text",
          true,
          statuses(["active", "expired", "renewed", "closed"]).map(
            ([key, label]) => [key, key === "active" ? t.rightActive : label],
          ),
        );
      note = t.rightsNote;
    }
    if (kind === "receivable") {
      v = {
        campaign_id: c?.campaign_id || "",
        due_date: c?.due_date || "",
        amount: c ? Math.max(0, c.economics.unbilled) : "",
      };
      action = "createReceivable";
      title = t.addReceivable;
      fields =
        f("campaign_id", "text", true, campaigns, true) +
        f("description", "text", true, null, true) +
        f("amount", "money", true) +
        f("due_date", "date", true);
      note = t.receivableNote;
    }
    if (kind === "payment") {
      const rows = state.receivables.filter(
        (r) =>
          r.balance > 0 && r.status !== "void" && (!c || r.job_id === c.job_id),
      );
      if (!rows.length) {
        toast(t.empty);
        return;
      }
      const r = rows.find((r) => r.receivable_id === id) || rows[0];
      v = {
        receivable_id: r.receivable_id,
        amount: r.balance,
        payment_date: state.today,
      };
      action = "recordPayment";
      title = t.addPayment;
      fields =
        f(
          "receivable_id",
          "text",
          true,
          options(
            rows,
            "receivable_id",
            (r) =>
              r.description + " · " + t.balanceShort + " " + money(r.balance),
          ),
          true,
        ) +
        f("amount", "money", true) +
        f("payment_date", "date", true) +
        f("payment_method") +
        f("reference");
      note = t.paymentNote;
    }
    if (kind === "expense") {
      v = {
        campaign_id: c?.campaign_id || "",
        expense_date: state.today,
        category_key: "production",
      };
      action = "recordExpense";
      title = t.addExpense;
      fields =
        f(
          "campaign_id",
          "text",
          false,
          options(state.campaigns, "campaign_id", "campaign_name"),
          true,
        ) +
        f("description", "text", true, null, true) +
        f(
          "category_key",
          "text",
          true,
          ["production", "transport", "equipment", "other"].map((key) => [
            key,
            t.enums[key],
          ]),
        ) +
        f("amount", "money", true) +
        f("expense_date", "date", true);
    }
    if (kind === "settings") {
      v = meta();
      action = "saveSettings";
      title = t.settings;
      fields = settingsFields(v);
      note = t.currencyHint;
    }
    if (kind.startsWith("void:")) {
      action = "voidRecord";
      title = t.financeCorrection;
      hidden = { table: kind.split(":")[1], id };
      fields = inputField("reason", "", "textarea", true, null, true);
      note = t.voidNote;
    }
    if (!action) return;
    formRevision = meta().revision;
    lastAttempt = null;
    $("#formContent").innerHTML =
      '<div class="formHeader"><h2>' +
      esc(title) +
      "</h2>" +
      btn("×", "close", "quiet small") +
      '</div><form id="editForm" data-command="' +
      action +
      '">' +
      Object.entries(hidden)
        .map(
          ([k, v]) =>
            '<input type="hidden" name="' + k + '" value="' + esc(v) + '">',
        )
        .join("") +
      '<div class="formGrid">' +
      fields +
      "</div>" +
      (note ? '<p class="note">' + esc(note) + "</p>" : "") +
      '<div class="formError" role="alert"></div><div class="formActions">' +
      btn(t.cancel, "close") +
      '<button type="submit" class="primary">' +
      esc(t.save) +
      "</button></div></form>";
    dialog.showModal();
  }
  function payload(form) {
    const p = Object.fromEntries(new FormData(form));
    form.querySelectorAll("[data-number]").forEach((input) => {
      let v = input.value.trim();
      if (v) {
        if (meta().locale === "pt-BR") {
          if (!/^(\d+|\d{1,3}(\.\d{3})+)(,\d+)?$/.test(v))
            throw {
              code: input.dataset.number === "money" ? "MONEY" : "NUMBER",
              field: input.name,
            };
          v = v.replace(/\./g, "").replace(",", ".");
        } else {
          if (!/^(\d+|\d{1,3}(,\d{3})+)(\.\d+)?$/.test(v))
            throw {
              code: input.dataset.number === "money" ? "MONEY" : "NUMBER",
              field: input.name,
            };
          v = v.replace(/,/g, "");
        }
        p[input.name] = v;
      } else p[input.name] = "";
    });
    return p;
  }
  function showError(form, error) {
    const box = form.querySelector(".formError");
    box.textContent = errorText(error);
    const field = form.elements.namedItem(error.field);
    if (field) {
      field.setAttribute("aria-invalid", "true");
      field.focus();
    }
  }
  async function submit(form) {
    if (busy) return;
    const action =
      form.getAttribute("id") === "setupForm" ? "setup" : form.dataset.command;
    let p;
    try {
      p = payload(form);
    } catch (e) {
      showError(form, e);
      return;
    }
    const serial = JSON.stringify({ action, p });
    const request =
      lastAttempt && lastAttempt.serial === serial
        ? lastAttempt.request
        : { action, payload: p, revision: formRevision, operation_id: uid() };
    lastAttempt = { serial, request };
    busy = true;
    const button = form.querySelector("[type=submit]");
    button.disabled = true;
    button.textContent = t.saving;
    form
      .querySelectorAll("[aria-invalid]")
      .forEach((e) => e.removeAttribute("aria-invalid"));
    const r = await invoke(action, p, request);
    busy = false;
    button.disabled = false;
    button.textContent = t.save;
    if (!r.ok) {
      showError(form, r.error);
      if (r.error.code !== "NETWORK") lastAttempt = null;
      return;
    }
    state = r.data;
    lastAttempt = null;
    if (dialog.open) dialog.close();
    render();
    toast(t.saved);
  }
  async function mutate(action, p) {
    if (busy) return;
    busy = true;
    const r = await invoke(action, p);
    busy = false;
    if (r.ok) {
      state = r.data;
      render();
      toast(t.saved);
    } else toast(errorText(r.error));
  }
  function download(name, bytes, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([bytes], { type }));
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }
  async function act(action, id) {
    if (action.startsWith("route:")) {
      route = action.split(":")[1];
      selected = "";
      search = "";
      render();
      return;
    }
    if (action === "campaign" || action === "party") {
      route = action;
      selected = id;
      search = "";
      render();
      return;
    }
    if (action.startsWith("form:")) {
      showForm(action.split(":")[1], id);
      return;
    }
    if (action.startsWith("void:")) {
      showForm(action, id);
      return;
    }
    if (action === "close") {
      if (busy) return;
      if (confirm(t.confirmDiscard)) dialog.close();
      return;
    }
    if (action === "refresh") {
      await load();
      return;
    }
    if (action === "archive" && confirm(t.confirmArchive))
      return mutate("archiveParty", { party_id: id });
    if (action.startsWith("status:") && confirm(t.confirmStatus))
      return mutate("transitionCampaign", {
        campaign_id: id,
        status: action.split(":")[1],
      });
    if (action === "sample" && confirm(t.sampleConfirm))
      return mutate("loadSample", {});
    if (action === "check") {
      const r = await invoke("systemCheck");
      if (r.ok) {
        diagnostic = r.data;
        render();
      } else toast(errorText(r.error));
    }
    if (action === "diagnostic" && diagnostic)
      download(
        "ugc-diagnostic.json",
        JSON.stringify(diagnostic, null, 2),
        "application/json",
      );
    if (action === "export") {
      const r = await invoke("export");
      if (!r.ok) {
        toast(errorText(r.error));
        return;
      }
      download(
        "ugc-backup-" + state.today + ".zip",
        CsvZip.make(r.data),
        "application/zip",
      );
      toast(t.downloaded);
    }
    if (action === "restore") {
      try {
        const selectedFiles = Array.from($("#backupFiles").files);
        if (!selectedFiles.length) throw { code: "BACKUP_FILES" };
        if (selectedFiles.reduce((sum, file) => sum + file.size, 0) > 6000000)
          throw { code: "BACKUP_SIZE" };
        let files;
        if (
          selectedFiles.length === 1 &&
          selectedFiles[0].name.endsWith(".zip")
        ) {
          files = CsvZip.read(
            new Uint8Array(await selectedFiles[0].arrayBuffer()),
          );
        } else {
          files = Object.create(null);
          for (const file of selectedFiles) {
            if (Object.hasOwnProperty.call(files, file.name))
              throw { code: "BACKUP_FILES" };
            files[file.name] = await file.text();
          }
        }
        Backup.importFiles(files);
        if (confirm(t.importConfirm)) await mutate("restore", { files });
      } catch (e) {
        toast(errorText({ code: e.code || e.message }));
      }
    }
  }
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (el) {
      e.preventDefault();
      act(el.dataset.action, el.dataset.id).catch(() =>
        toast(t.errors.UNEXPECTED),
      );
    }
  });
  document.addEventListener("submit", (e) => {
    if (["editForm", "setupForm"].includes(e.target.getAttribute("id"))) {
      e.preventDefault();
      submit(e.target);
    }
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "search") {
      const pos = e.target.selectionStart;
      search = e.target.value;
      render();
      $("#search").focus();
      $("#search").setSelectionRange(pos, pos);
    }
  });
  document.addEventListener("change", (e) => {
    if (e.target.name === "receivable_id") {
      const r = state.receivables.find(
        (r) => r.receivable_id === e.target.value,
      );
      if (r && $("#f_amount"))
        $("#f_amount").value = new Intl.NumberFormat(meta().locale, {
          minimumFractionDigits: 2,
          useGrouping: false,
        }).format(r.balance);
    }
  });
  dialog.addEventListener("cancel", (e) => {
    if (busy || !confirm(t.confirmDiscard)) e.preventDefault();
  });
  function localEnv() {
    return {
      id: uid,
      now: () => new Date().toISOString(),
      today,
      fingerprint: () => hash,
    };
  }
  async function boot() {
    try {
      if (local) {
        const env = localEnv();
        const saved = localStorage.getItem("ugc-validation-v1");
        localRepo = UGC.memoryRepository(
          saved ? JSON.parse(saved) : UGC.demo(env),
        );
        localService = UGC.createService(localRepo, env, Backup);
      }
      await load();
    } catch (e) {
      app.innerHTML =
        '<div class="setup"><h1>' +
        esc(t.systemFailure) +
        "</h1><p>" +
        esc(t.errors.INTEGRITY) +
        "</p></div>";
    }
  }
  boot();
})();
