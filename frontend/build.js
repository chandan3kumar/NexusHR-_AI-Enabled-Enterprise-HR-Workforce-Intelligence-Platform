const fs = require("fs");
const path = require("path");

const root = __dirname;
const outputDir = path.join(root, "public");
const files = ["index.html", "app.js", "styles.css"];

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(outputDir, file));
}

console.log("Static frontend copied to public/");
