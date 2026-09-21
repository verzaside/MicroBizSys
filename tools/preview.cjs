const http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path");
const file = path.resolve(__dirname, "../dist/ugc-preview.html");
const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy":
        "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'",
    });
    res.end(fs.readFileSync(file));
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(4173, "127.0.0.1", () =>
  console.log("UGC local validation: http://127.0.0.1:4173"),
);
