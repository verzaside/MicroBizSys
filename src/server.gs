function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("UGC OS")
    .addItem("Abrir UGC OS", "openUgc")
    .addToUi();
}
function openUgc() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty(
    "UGC_WORKBOOK_ID",
    book.getId(),
  );
  SpreadsheetApp.getUi().showModalDialog(
    renderUgc_().setWidth(1180).setHeight(820),
    "UGC OS",
  );
}
function renderUgc_() {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("UGC OS")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}
function doGet() {
  return renderUgc_();
}
function api(request) {
  try {
    const id =
      PropertiesService.getScriptProperties().getProperty("UGC_WORKBOOK_ID");
    if (!id) return { ok: false, error: { code: "BIND_FIRST", field: "" } };
    const repo = googleRepository_(id);
    const env = {
      id: () => Utilities.getUuid(),
      now: () => new Date().toISOString(),
      today: (meta) =>
        Utilities.formatDate(
          new Date(),
          meta ? meta.timezone : "America/Sao_Paulo",
          "yyyy-MM-dd",
        ),
      fingerprint: (x) =>
        Utilities.computeDigest(
          Utilities.DigestAlgorithm.SHA_256,
          JSON.stringify(x),
        )
          .map((b) => (b & 255).toString(16).padStart(2, "0"))
          .join(""),
    };
    return UGC.createService(repo, env, Backup).handle(request);
  } catch (e) {
    return {
      ok: false,
      error: { code: e.code || "GOOGLE_ACCESS", field: e.field || "" },
    };
  }
}
function googleRepository_(id) {
  const cache = CacheService.getScriptCache();
  let properties;
  function structure(locked) {
    const response = Sheets.Spreadsheets.get(id, {
      fields: "sheets(properties(sheetId,title,gridProperties))",
    });
    const sheets = response.sheets || [];
    const ids = {},
      grids = {};
    sheets.forEach((s) => {
      if (s.properties.title.indexOf(SheetStore.prefix) === 0) {
        const t = s.properties.title.slice(SheetStore.prefix.length);
        ids[t] = s.properties.sheetId;
        grids[t] = s.properties.gridProperties;
      }
    });
    const present = Object.keys(MBS.schemas).filter(
      (t) => ids[t] !== undefined,
    );
    if (!present.length) {
      if (!locked) {
        const lock = LockService.getScriptLock();
        if (lock.hasLock()) return structure(true);
        MBS.assert(lock.tryLock(25000), "BUSY");
        try {
          // Re-read after acquisition: another request may have initialized it.
          return structure(true);
        } finally {
          lock.releaseLock();
        }
      }
      const requests = [];
      let nextId = Math.max(0, ...sheets.map((s) => s.properties.sheetId)) + 1;
      Object.keys(MBS.schemas).forEach((t) => {
        const sid = nextId++;
        ids[t] = sid;
        grids[t] = { rowCount: 1000, columnCount: 26 };
        requests.push({
          addSheet: {
            properties: {
              sheetId: sid,
              title: SheetStore.prefix + t,
              hidden: true,
              gridProperties: grids[t],
            },
          },
        });
        requests.push({
          updateCells: {
            start: { sheetId: sid, rowIndex: 0, columnIndex: 0 },
            rows: [
              {
                values: Object.keys(MBS.schemas[t].fields).map(SheetStore.cell),
              },
            ],
            fields: "userEnteredValue",
          },
        });
        requests.push({
          addProtectedRange: {
            protectedRange: {
              range: { sheetId: sid },
              warningOnly: true,
              description: "UGC OS · dados gerenciados pelo sistema",
            },
          },
        });
      });
      Sheets.Spreadsheets.batchUpdate({ requests }, id);
    } else
      MBS.assert(present.length === Object.keys(MBS.schemas).length, "SCHEMA");
    return { ids, grids };
  }
  function migrateRaw_(raw) {
    const metaHeaders = Object.keys(MBS.schemas.installation.fields);
    const metaRow = raw.installation[1];
    if (
      !metaRow ||
      Number(metaRow[metaHeaders.indexOf("schema_version")]) !== 1
    )
      return raw;
    const campaignHeaders = Object.keys(MBS.schemas.campaigns.fields);
    const legacyHeaders = campaignHeaders.filter((f) => f !== "origin_source");
    MBS.assert(
      JSON.stringify(raw.campaigns[0]) === JSON.stringify(legacyHeaders),
      "SCHEMA",
    );
    const originColumn = campaignHeaders.indexOf("origin_source");
    const requests = [
      {
        updateCells: {
          range: {
            sheetId: properties.ids.campaigns,
            startRowIndex: 0,
            endRowIndex: raw.campaigns.length,
            startColumnIndex: originColumn,
            endColumnIndex: originColumn + 1,
          },
          rows: raw.campaigns.map((row, i) => ({
            values: [SheetStore.cell(i === 0 ? "origin_source" : "")],
          })),
          fields: "userEnteredValue",
        },
      },
    ];
    const migratedMeta = metaRow.slice();
    migratedMeta[metaHeaders.indexOf("schema_version")] = MBS.SCHEMA_VERSION;
    migratedMeta[metaHeaders.indexOf("product_version")] = MBS.VERSION;
    migratedMeta[metaHeaders.indexOf("last_migrated_at")] =
      new Date().toISOString();
    migratedMeta[metaHeaders.indexOf("revision")] =
      Number(migratedMeta[metaHeaders.indexOf("revision")] || 0) + 1;
    requests.push({
      updateCells: {
        range: {
          sheetId: properties.ids.installation,
          startRowIndex: 1,
          endRowIndex: 2,
          startColumnIndex: 0,
          endColumnIndex: metaHeaders.length,
        },
        rows: [{ values: migratedMeta.map(SheetStore.cell) }],
        fields: "userEnteredValue",
      },
    });
    Sheets.Spreadsheets.batchUpdate({ requests }, id);
    raw.campaigns = raw.campaigns.map((row, i) =>
      i === 0 ? campaignHeaders : row.concat(""),
    );
    raw.installation[1] = migratedMeta;
    return raw;
  }
  // Read only metadata first; cache contains the last committed snapshot for that revision.
  function load(fresh) {
    if (!properties) properties = structure();
    const rawMeta =
      Sheets.Spreadsheets.Values.get(id, "'_ugc_installation'!A1:Z2", {
        valueRenderOption: "UNFORMATTED_VALUE",
      }).values || [];
    const headers = Object.keys(MBS.schemas.installation.fields);
    MBS.assert(
      JSON.stringify(rawMeta[0]) === JSON.stringify(headers),
      "SCHEMA",
    );
    const schemaVersion = rawMeta[1]
      ? Number(rawMeta[1][headers.indexOf("schema_version")])
      : 0;
    const revision = rawMeta[1] ? rawMeta[1][headers.indexOf("revision")] : 0;
    const key = "ugc:" + id + ":" + revision;
    const cached =
      fresh || schemaVersion < MBS.SCHEMA_VERSION ? null : cache.get(key);
    if (cached) return JSON.parse(cached);
    const tables = Object.keys(MBS.schemas),
      ranges = tables.map((t) => "'" + SheetStore.prefix + t + "'!A1:Z");
    const values = Sheets.Spreadsheets.Values.batchGet(id, {
      ranges,
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "SERIAL_NUMBER",
    }).valueRanges;
    const raw = Object.fromEntries(
      tables.map((t, i) => [t, values[i].values || []]),
    );
    const migrated = migrateRaw_(raw);
    const migratedRevision = migrated.installation[1]
      ? migrated.installation[1][headers.indexOf("revision")]
      : 0;
    const migratedKey = "ugc:" + id + ":" + migratedRevision;
    put(migratedKey, migrated);
    return migrated;
  }
  function put(key, raw) {
    const value = JSON.stringify(raw);
    if (Utilities.newBlob(value).getBytes().length < 90000)
      cache.put(key, value, 120);
  }
  return SheetStore.create({
    load,
    lock: (fn) => {
      const lock = LockService.getScriptLock();
      MBS.assert(lock.tryLock(25000), "BUSY");
      try {
        return fn();
      } finally {
        lock.releaseLock();
      }
    },
    commit: (before, after) => {
      const requests = [];
      Object.keys(MBS.schemas).forEach((t) => {
        const required = after[t].length + 1;
        const count = properties.grids[t].rowCount;
        if (required > count) {
          requests.push({
            appendDimension: {
              sheetId: properties.ids[t],
              dimension: "ROWS",
              length: required - count + 100,
            },
          });
          properties.grids[t].rowCount = required + 100;
        }
      });
      requests.push(...SheetStore.plan(before, after, properties.ids));
      Sheets.Spreadsheets.batchUpdate({ requests }, id);
      cache.remove(
        "ugc:" +
          id +
          ":" +
          (before.installation[0] ? before.installation[0].revision : 0),
      );
      const raw = Object.fromEntries(
        Object.keys(MBS.schemas).map((t) => [
          t,
          SheetStore.tableRows(after, t),
        ]),
      );
      put("ugc:" + id + ":" + after.installation[0].revision, raw);
    },
  });
}
