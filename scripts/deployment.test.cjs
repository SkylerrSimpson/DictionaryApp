const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { stageBuild } = require("./build-vercel.cjs");
const config = require("../vercel.json");

test("deployment stages compiled assets without private files, maps, or history", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "original-assets-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const source = path.join(directory, "build");
  const target = path.join(directory, "output");
  const files = {
    "index.html":
      '<script src="/static/js/main.123.js"></script><link href="/static/css/main.456.css" rel="stylesheet">',
    "manifest.json": JSON.stringify({
      icons: [{ src: "static/media/logo.789.svg" }],
    }),
    "static/js/main.123.js": "console.log('compiled');",
    "static/css/main.456.css": "body { color: black; }",
    "static/media/logo.789.svg": "<svg/>",
    "static/js/main.123.js.map": "private source fixture",
    ".env": "private fixture",
    ".git/config": "private history fixture",
    "backend/app.js": "private source fixture",
    "package.json": "{}",
  };
  for (const [name, content] of Object.entries(files)) {
    const filename = path.join(source, name);
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, content);
  }
  stageBuild(source, target);
  for (const name of Object.keys(files))
    assert.equal(
      fs.existsSync(path.join(target, name)),
      [
        "index.html",
        "manifest.json",
        "static/js/main.123.js",
        "static/css/main.456.css",
        "static/media/logo.789.svg",
      ].includes(name),
      name,
    );
  fs.writeFileSync(path.join(target, "stale.env"), "stale private fixture");
  stageBuild(source, target);
  assert.equal(fs.existsSync(path.join(target, "stale.env")), false);
  fs.writeFileSync(
    path.join(source, "manifest.json"),
    JSON.stringify({ icons: [{ src: "missing-icon.png" }] }),
  );
  assert.throws(() => stageBuild(source, target), /missing asset/);
  fs.writeFileSync(
    path.join(source, "manifest.json"),
    JSON.stringify({ icons: [] }),
  );
  fs.rmSync(path.join(source, "static/js/main.123.js"));
  assert.throws(() => stageBuild(source, target), /missing asset/);
});

test("deployment rejects a raw CRA template and symbolic links", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "original-invalid-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const source = path.join(directory, "build");
  fs.mkdirSync(source);
  fs.writeFileSync(
    path.join(source, "index.html"),
    '<link href="%PUBLIC_URL%/favicon.ico">',
  );
  assert.throws(
    () => stageBuild(source, path.join(directory, "output")),
    /compiled CRA/,
  );
  fs.symlinkSync(
    path.join(source, "index.html"),
    path.join(source, "leak.html"),
  );
  assert.throws(
    () => stageBuild(source, path.join(directory, "output")),
    /symbolic link/,
  );
});

test("routing exposes only the known UI rewrite and same-origin API", () => {
  assert.equal(config.outputDirectory, "vercel-static");
  const sources = (config.rewrites || []).map((route) => route.source);
  assert.deepEqual(sources, ["/words/:path*", "/healthz", "/word-list"]);
  assert.ok(!sources.includes("/(.*)"));
  assert.ok(!sources.includes("/:path*"));
  for (const route of config.rewrites || []) {
    if (route.source === "/word-list")
      assert.equal(route.destination, "/index.html");
    else assert.ok(route.destination.startsWith("/api/"));
  }
});

const { createHandler } = require("../backend/vercel");
const secureEnv = {
  APP_ORIGIN: "https://original.example",
  COOKIE_SECURE: "true",
  DATABASE_URL: "test-only-placeholder",
};
function response() {
  return {
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body) {
      this.body = body;
    },
  };
}
test("adapter preserves encoded IDs, reuses its app, and forces secure origin configuration", () => {
  let connections = 0;
  let options;
  const received = [];
  const handler = createHandler({
    env: secureEnv,
    connectDatabase: () => {
      connections++;
      return {};
    },
    storeFactory: () => ({}),
    appFactory: (settings) => {
      options = settings;
      return (req) => received.push(req.url);
    },
  });
  handler({ url: "/words/hello%20world?ignored=1" }, response());
  handler({ url: "/words/hello%20world" }, response());
  assert.deepEqual(received, [
    "/words/hello%20world?ignored=1",
    "/words/hello%20world",
  ]);
  assert.equal(connections, 1);
  assert.equal(options.origin, secureEnv.APP_ORIGIN);
  assert.equal(options.secureCookies, true);
  const missing = response();
  handler({ url: "/api/original" }, missing);
  assert.equal(missing.statusCode, 404);
});
test("bad deployment configuration fails closed without echoing configuration", () => {
  for (const env of [
    {},
    { ...secureEnv, APP_ORIGIN: "http://original.example" },
    { ...secureEnv, APP_ORIGIN: "https://original.example/path" },
    { ...secureEnv, APP_ORIGIN: "https://name:private@original.example" },
    { ...secureEnv, COOKIE_SECURE: "false" },
  ]) {
    const handler = createHandler({
      env,
      connectDatabase: () => assert.fail("must not connect"),
    });
    const res = response();
    handler({ url: "/words" }, res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.headers["Cache-Control"], "no-store");
    assert.deepEqual(JSON.parse(res.body), {
      message: "The saved-items service is unavailable. Please try again.",
    });
  }
});
