var Backup = (function (C) {
  "use strict";
  function encode(rows) {
    return (
      "\ufeff" +
      rows
        .map((row) =>
          row.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(","),
        )
        .join("\r\n") +
      "\r\n"
    );
  }
  function parse(text) {
    C.assert(typeof text === "string" && text.length <= 5000000, "BACKUP_SIZE");
    text = text.replace(/^\ufeff/, "");
    const rows = [];
    let row = [],
      field = "",
      quoted = false,
      closed = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            quoted = false;
            closed = true;
          }
        } else field += ch;
      } else if (ch === '"') {
        C.assert(!field && !closed, "CSV");
        quoted = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
        closed = false;
      } else if (ch === "\r" || ch === "\n") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        closed = false;
      } else {
        C.assert(!closed, "CSV");
        field += ch;
      }
    }
    C.assert(!quoted, "CSV");
    if (field || closed || row.length) {
      row.push(field);
      rows.push(row);
    }
    C.assert(rows.length > 0, "CSV");
    const width = rows[0].length;
    C.assert(
      rows.every((r) => r.length === width),
      "CSV",
    );
    return rows;
  }
  function protect(v) {
    return /^[\s]*[=+\-@]|^['\t\r\n]/.test(v) ? "'" + v : v;
  }
  function unprotect(v) {
    if (v.startsWith("'") && protect(v.slice(1)) === v) return v.slice(1);
    return v;
  }
  const tables = Object.keys(C.schemas).filter((t) => t !== "operations");
  function exportFiles(s) {
    C.validate(s);
    const files = {};
    const meta = s.installation[0];
    const manifest = [
      ["table", "count", "product_id", "schema_version", "encoding"],
    ];
    tables.forEach((t) => {
      const schema = C.schemas[t];
      const headers = Object.keys(schema.fields);
      const rows = s[t].map((r) =>
        headers.map((f) =>
          schema.fields[f] === "text" ? protect(r[f]) : r[f],
        ),
      );
      files[t + ".csv"] = encode([headers, ...rows]);
      manifest.push([
        t,
        s[t].length,
        meta.product_id,
        meta.schema_version,
        "apostrophe-v1",
      ]);
    });
    files["_backup.csv"] = encode(manifest);
    return files;
  }
  function importFiles(files) {
    C.assert(
      files && typeof files === "object" && !Array.isArray(files),
      "CSV",
    );
    C.assert(
      Object.keys(files).length === tables.length + 1 &&
        Object.keys(files).every(
          (n) => n === "_backup.csv" || tables.some((t) => n === t + ".csv"),
        ),
      "BACKUP_FILES",
    );
    const total = Object.values(files).reduce(
      (a, v) => a + (typeof v === "string" ? v.length : 5000001),
      0,
    );
    C.assert(total <= 5000000, "BACKUP_SIZE");
    const manifest = parse(files["_backup.csv"]);
    C.assert(
      JSON.stringify(manifest.shift()) ===
        JSON.stringify([
          "table",
          "count",
          "product_id",
          "schema_version",
          "encoding",
        ]),
      "SCHEMA",
    );
    C.assert(
      manifest.length === tables.length &&
        new Set(manifest.map((r) => r[0])).size === tables.length,
      "SCHEMA",
    );
    const backupSchema = Number(manifest[0]?.[3]);
    C.assert([1, C.SCHEMA_VERSION].includes(backupSchema), "SCHEMA");
    C.assert(
      manifest.every((entry) => entry[3] === String(backupSchema)),
      "SCHEMA",
    );
    const s = C.empty();
    tables.forEach((t) => {
      const entry = manifest.find((r) => r[0] === t);
      C.assert(
        entry &&
          entry[2] === C.PRODUCT &&
          entry[3] === String(backupSchema) &&
          entry[4] === "apostrophe-v1",
        "SCHEMA",
      );
      const rows = parse(files[t + ".csv"]);
      const schema = C.schemas[t],
        headers = Object.keys(schema.fields);
      const fileHeaders = rows.shift();
      const legacyHeaders = headers.filter((f) => f !== "origin_source");
      const legacy =
        backupSchema === 1 &&
        t === "campaigns" &&
        JSON.stringify(fileHeaders) === JSON.stringify(legacyHeaders);
      C.assert(
        legacy || JSON.stringify(fileHeaders) === JSON.stringify(headers),
        "SCHEMA",
      );
      C.assert(
        /^\d+$/.test(entry[1]) && rows.length === Number(entry[1]),
        "BACKUP_COUNT",
      );
      const sourceHeaders = legacy ? legacyHeaders : headers;
      s[t] = rows.map((values) => {
        const row = Object.fromEntries(
          sourceHeaders.map((f, i) => {
            let v = values[i];
            const type = schema.fields[f];
            if (type === "text") v = unprotect(v);
            else if (type === "boolean") {
              C.assert(v === "true" || v === "false", "CSV");
              v = v === "true";
            } else if (type === "optionalNumber" && v === "") v = "";
            else {
              C.assert(/^\d+(\.\d+)?$/.test(v), "CSV");
              v = Number(v);
            }
            return [f, v];
          }),
        );
        if (legacy) row.origin_source = "";
        return row;
      });
    });
    return C.migrate(s);
  }
  return { encode, parse, protect, unprotect, exportFiles, importFiles };
})(typeof MBS !== "undefined" ? MBS : require("./core.js"));
if (typeof module !== "undefined") module.exports = Backup;
