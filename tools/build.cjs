const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const out = path.join(root, "dist");
fs.mkdirSync(path.join(out, "apps-script"), { recursive: true });
const runtime = ["core.js", "ugc.js", "csv.js", "zip.js"]
  .map((f) => read("src/" + f))
  .join("\n");
let html = read("ui/index.html")
  .replace("/* STYLES */", () => read("ui/styles.css"))
  .replace("/* LOCALE */", () => read("ui/locale.js"))
  .replace("/* RUNTIME */", () => runtime)
  .replace("/* APP */", () => read("ui/app.js"));
const server = ["core.js", "ugc.js", "csv.js", "sheets.js", "server.gs"]
  .map((f) => read("src/" + f))
  .join("\n");
fs.writeFileSync(path.join(out, "apps-script", "Code.gs"), server);
fs.writeFileSync(path.join(out, "apps-script", "Index.html"), html);
fs.writeFileSync(
  path.join(out, "apps-script", "appsscript.json"),
  read("src/appsscript.json"),
);
fs.writeFileSync(path.join(out, "ugc-preview.html"), html);
const manifest = {
  product_id: "UGC_BR",
  product_version: require("../package.json").version,
  schema_version: 2,
  built_at: new Date().toISOString(),
  files: {},
};
for (const f of ["Code.gs", "Index.html", "appsscript.json"])
  manifest.files[f] = crypto
    .createHash("sha256")
    .update(fs.readFileSync(path.join(out, "apps-script", f)))
    .digest("hex");
fs.writeFileSync(
  path.join(out, "build-info.json"),
  JSON.stringify(manifest, null, 2),
);
console.log("Built dist/apps-script and dist/ugc-preview.html.");
const files = {
  'INSTALAR.md':read('INSTALAR.md'),
  'GUIA-RAPIDO.md':read('docs/guides/ugc-guia-rapido.md'),
  'ugc-preview.html':html,
  'build-info.json':JSON.stringify(manifest,null,2),
};
for (const name of ['Code.gs','Index.html','appsscript.json']) {
  files['apps-script/'+name] = fs.readFileSync(path.join(out,'apps-script',name),'utf8');
}
fs.writeFileSync(path.join(out,'ugc-os-v1-beta.zip'),require('../src/zip.js').make(files));
console.log('Packaged dist/ugc-os-v1-beta.zip with installation help and guide.');
