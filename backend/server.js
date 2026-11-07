const express = require("express");
const { randomBytes, createHash, randomUUID } = require("node:crypto");
const path = require("node:path");
const { connect, createStore } = require("./store");
const { validateCreate, validateUpdate, validateId } = require("./validation");

const DEFAULT_PORT = 4101;
const RESOURCE = "/words";
const COOKIE = "original_dictionary_browser";
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
const hash = (token) => createHash("sha256").update(token).digest("hex");
function cookieToken(header = "", name = COOKIE) {
  const matches = header
    .split(";")
    .map((v) => v.trim())
    .filter((v) => v.startsWith(name + "="));
  if (matches.length !== 1) return null;
  const value = matches[0].slice(name.length + 1);
  return tokenPattern.test(value) ? value : null;
}
function createApp({
  store,
  origin = `http://localhost:${DEFAULT_PORT}`,
  secureCookies = false,
  buildDir = path.join(__dirname, "../build"),
}) {
  const app = express();
  const cookieName = secureCookies ? "__Host-" + COOKIE : COOKIE;
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.set("X-Frame-Options", "DENY");
    next();
  });
  app.use(RESOURCE, (req, res, next) => {
    res.set("Cache-Control", "no-store");
    const mutation = !["GET", "HEAD"].includes(req.method);
    if (mutation && req.get("Origin") !== origin)
      return res
        .status(403)
        .json({ message: "Use this app from its configured origin." });
    let token = cookieToken(req.get("Cookie"), cookieName);
    if (!token && mutation)
      return res.status(401).json({
        message: "Load the app to start your private browser session.",
      });
    if (!token) {
      token = randomBytes(32).toString("base64url");
      res.cookie(cookieName, token, {
        httpOnly: true,
        sameSite: "strict",
        secure: secureCookies,
        path: "/",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
    }
    req.owner = hash(token);
    if (["POST", "PATCH"].includes(req.method) && !req.is("application/json"))
      return res.status(415).json({ message: "Send JSON data." });
    next();
  });
  app.use(express.json({ limit: "16kb" }));
  const route = (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res)).catch(next);
  app.get(
    RESOURCE,
    route(async (req, res) => res.json(await store.list(req.owner))),
  );
  app.post(
    RESOURCE,
    route(async (req, res) => {
      const { id, data } = validateCreate(req.body, randomUUID);
      res.status(201).json(await store.create(req.owner, id, data));
    }),
  );
  app.patch(
    RESOURCE + "/:id",
    route(async (req, res) => {
      const id = validateId(req.params.id);
      const { id: nextId, data } = validateUpdate(req.body, id);
      const updated = await store.update(req.owner, id, nextId, data);
      if (!updated)
        return res.status(404).json({ message: "Saved item not found." });
      res.json(updated);
    }),
  );
  app.delete(
    RESOURCE + "/:id",
    route(async (req, res) => {
      await store.remove(req.owner, validateId(req.params.id));
      res.status(204).end();
    }),
  );

  app.use(RESOURCE, (req, res) =>
    res.status(404).json({ message: "Endpoint not found." }),
  );
  app.get("/healthz", (req, res) =>
    res.json({ status: "ok", app: "dictionary-original" }),
  );
  app.use(express.static(buildDir, { index: false }));
  app.get(["/", "/word-list"], (req, res, next) =>
    res.sendFile(
      path.join(buildDir, "index.html"),
      (error) => error && next(error),
    ),
  );
  app.use((req, res) => res.status(404).type("text").send("Page not found."));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === "23505")
      return res
        .status(409)
        .json({ message: "This item is already saved in this browser." });
    const status =
      error.status >= 400 && error.status < 500 ? error.status : 500;
    res.status(status).json({
      message:
        status < 500
          ? error.publicMessage || "Invalid request."
          : "The saved-items service is unavailable. Please try again.",
    });
  });
  return app;
}
async function start() {
  const port = Number(process.env.PORT || DEFAULT_PORT);
  const origin = process.env.APP_ORIGIN || `http://localhost:${port}`;
  if (
    process.env.NODE_ENV === "production" &&
    (!origin.startsWith("https://") || process.env.COOKIE_SECURE !== "true")
  ) {
    throw new Error(
      "Production requires an HTTPS APP_ORIGIN and COOKIE_SECURE=true.",
    );
  }
  const sql = connect(process.env.DATABASE_URL);
  await sql`SELECT 1 FROM dictionary_original.items LIMIT 1`;
  const app = createApp({
    store: createStore(sql),
    origin,
    secureCookies: process.env.COOKIE_SECURE === "true",
  });
  const server = app.listen(
    port,
    process.env.HOST ||
      (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1"),
    () => console.log(`dictionary original: ${origin}`),
  );
  const close = () => server.close(() => sql.end().then(() => process.exit(0)));
  process.once("SIGTERM", close);
  process.once("SIGINT", close);
}
if (require.main === module)
  start().catch(() => {
    console.error(
      "Startup failed. Check DATABASE_URL and run npm run migrate.",
    );
    process.exitCode = 1;
  });
module.exports = { createApp, cookieToken, hash, COOKIE };
