const fs = require("fs");
const path = require("path");

const root = __dirname;
const out = path.join(root, "site");

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const excluded = new Set([
  "node_modules",
  "site",
  ".git",
  ".github",
  ".vscode",
  ".wrangler",
  "package.json",
  "package-lock.json",
  "wrangler.jsonc",
  "build.js",
  "tailwind.config.js",
  ".gitignore",
  ".env",
  ".env.example",
  ".htaccess"
]);

for (const item of fs.readdirSync(root)) {
  if (excluded.has(item)) continue;

  const src = path.join(root, item);
  const dest = path.join(out, item);

  fs.cpSync(src, dest, {
    recursive: true
  });
}

console.log("Affordiax static site prepared in ./site");