/* Google Sheets adapter. All coordinates and atomic write plans live here. */
var SheetStore = (function (C) {
  const prefix = "_ugc_";
  function tableRows(s, t) {
    const headers = Object.keys(C.schemas[t].fields);
    return [headers, ...s[t].map((r) => headers.map((f) => r[f]))];
  }
  function deserialize(raw) {
    const s = C.empty();
    Object.keys(C.schemas).forEach((t) => {
      C.assert(Array.isArray(raw[t]), "TABLE");
      const rows = raw[t];
      const headers = Object.keys(C.schemas[t].fields);
      const legacyCampaignHeaders = headers.filter(
        (f) => f !== "origin_source",
      );
      const legacy =
        t === "campaigns" &&
        JSON.stringify(rows[0]) === JSON.stringify(legacyCampaignHeaders);
      C.assert(
        legacy || JSON.stringify(rows[0]) === JSON.stringify(headers),
        "SCHEMA",
      );
      s[t] = rows.slice(1).map((row) => {
        C.assert(row.length <= headers.length, "SCHEMA");
        if (legacy)
          row = row
            .slice(0, headers.indexOf("origin_source"))
            .concat("", row.slice(headers.indexOf("origin_source")));
        return Object.fromEntries(
          headers.map((f, i) => {
            const type = C.schemas[t].fields[f];
            let v = row[i];
            if (v === undefined || v === null) v = "";
            if (type === "text") C.assert(typeof v === "string", "TYPE");
            return [f, v];
          }),
        );
      });
    });
    return s;
  }
  function cell(v) {
    return {
      userEnteredValue:
        typeof v === "boolean"
          ? { boolValue: v }
          : typeof v === "number"
            ? { numberValue: v }
            : { stringValue: String(v) },
    };
  }
  function plan(before, after, ids) {
    const requests = [];
    Object.keys(C.schemas).forEach((t) => {
      const oldRows = tableRows(before, t),
        rows = tableRows(after, t);
      const width = rows[0].length;
      let start = null,
        changed = [];
      const flush = () => {
        if (start !== null) {
          requests.push({
            updateCells: {
              range: {
                sheetId: ids[t],
                startRowIndex: start,
                endRowIndex: start + changed.length,
                startColumnIndex: 0,
                endColumnIndex: width,
              },
              rows: changed.map((r) => ({ values: r.map(cell) })),
              fields: "userEnteredValue",
            },
          });
          start = null;
          changed = [];
        }
      };
      for (let i = 0; i < Math.max(oldRows.length, rows.length); i++) {
        const row = rows[i] || Array(width).fill("");
        if (JSON.stringify(row) !== JSON.stringify(oldRows[i])) {
          if (start === null) start = i;
          changed.push(row);
        } else flush();
      }
      flush();
    });
    return requests;
  }
  function create(api) {
    function read(fresh) {
      const data = deserialize(api.load(fresh));
      return data.installation.length ? C.migrate(data) : data;
    }
    return {
      read,
      transact: (op, revision, fp, fn) =>
        api.lock(() => {
          let before = read();
          const found = before.operations.find((r) => r.operation_id === op);
          if (found) {
            C.assert(found.fingerprint === fp, "OPERATION_REUSE");
            return;
          }
          const current = before.installation[0]
            ? before.installation[0].revision
            : 0;
          C.assert(revision === current, "CONFLICT");
          const after = fn(C.copy(before));
          after.installation[0].revision = current + 1;
          after.operations.push({
            operation_id: op,
            fingerprint: fp,
            created_at: new Date().toISOString(),
            revision: current + 1,
          });
          after.operations = after.operations.slice(-200);
          C.validate(after);
          api.commit(before, after);
        }),
    };
  }
  return { prefix, tableRows, deserialize, cell, plan, create };
})(typeof MBS !== "undefined" ? MBS : require("./core.js"));
if (typeof module !== "undefined") module.exports = SheetStore;
