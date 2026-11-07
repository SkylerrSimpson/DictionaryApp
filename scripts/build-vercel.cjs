const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

// Only compiled CRA assets and the existing public files enter the CDN output.
const publicFiles = new Set([
  "asset-manifest.json",
  "index.html",
  "logo.svg",
  "manifest.json",
  "robots.txt",
]);
function stageBuild(source, destination) {
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination, { recursive: true });
  function visit(directory, prefix = "") {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const relative = prefix + entry.name;
      if (entry.isSymbolicLink())
        throw new Error("Build contains a symbolic link.");
      if (entry.isDirectory()) {
        if (relative === "static" || relative.startsWith("static/"))
          visit(path.join(directory, entry.name), relative + "/");
        continue;
      }
      const compiled =
        /^static\/(?:js|css|media)\/[A-Za-z0-9_./@-]+\.(?:js|css|txt|svg|png|jpe?g|gif|webp|ico|avif|woff2?|ttf|eot|mp3|wav)$/.test(
          relative,
        );
      if (!entry.isFile() || (!publicFiles.has(relative) && !compiled))
        continue;
      if (relative.split("/").some((part) => part.startsWith("."))) continue;
      const target = path.join(destination, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(path.join(directory, entry.name), target);
    }
  }
  visit(source);
  const html = fs.readFileSync(path.join(destination, "index.html"), "utf8");
  if (html.includes("%PUBLIC_URL%") || !html.includes("/static/js/"))
    throw new Error("Expected a compiled CRA index.html.");
  function checkReference(reference) {
    const url = new URL(reference, "https://artifact.invalid/");
    if (url.origin !== "https://artifact.invalid") return;
    if (
      !fs.existsSync(path.join(destination, decodeURIComponent(url.pathname)))
    )
      throw new Error("Compiled output references a missing asset.");
  }
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g))
    checkReference(match[1]);
  const manifestPath = path.join(destination, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    for (const icon of manifest.icons || []) checkReference(icon.src);
  }
}

if (require.main === module) {
  const root = path.join(__dirname, "..");
  const result = spawnSync("npm", ["run", "build"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, GENERATE_SOURCEMAP: "false", PUBLIC_URL: "" },
  });
  if (result.status !== 0) process.exit(result.status || 1);
  stageBuild(path.join(root, "build"), path.join(root, "vercel-static"));
  console.log(
    "Staged compiled public assets for Vercel (without source maps).",
  );
}
module.exports = { stageBuild };
