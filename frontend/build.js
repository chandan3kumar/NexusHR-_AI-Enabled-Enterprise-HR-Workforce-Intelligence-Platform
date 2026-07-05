const fs = require("fs");
const path = require("path");

const root = __dirname;
const outputDir = path.join(root, "public");
const files = ["index.html", "app.js", "styles.css"];
const apiBase = process.env.BACKEND_ORIGIN || process.env.VITE_API_URL || "/api";

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(outputDir, file));
}

fs.writeFileSync(
  path.join(outputDir, "config.js"),
  `window.NEXUS_API_BASE = ${JSON.stringify(apiBase.replace(/\/$/, ""))};\n`
);

console.log("Static frontend copied to public/");
