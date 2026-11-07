const { createApp } = require("./server");
const { connect, createStore } = require("./store");

function createHandler({
  env = process.env,
  appFactory = createApp,
  connectDatabase = connect,
  storeFactory = createStore,
} = {}) {
  let app;
  return (req, res) => {
    // Vercel dispatches the original request path to this Express handler.
    // Never derive the configured Origin or database from request headers/query.
    const pathname = req.url.split("?")[0];
    if (!/^\/words(?:\/|$)/.test(pathname) && pathname !== "/healthz") {
      res.statusCode = 404;
      return res.end("Page not found.");
    }
    try {
      if (!app) {
        const origin = new URL(env.APP_ORIGIN);
        if (
          origin.protocol !== "https:" ||
          origin.origin !== env.APP_ORIGIN ||
          env.COOKIE_SECURE !== "true"
        )
          throw new Error(
            "An exact HTTPS APP_ORIGIN and secure cookies are required.",
          );
        const sql = connectDatabase(env.DATABASE_URL);
        app = appFactory({
          store: storeFactory(sql),
          origin: origin.origin,
          secureCookies: true,
        });
      }
      return app(req, res);
    } catch {
      res.statusCode = 503;
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Type", "application/json");
      return res.end(
        JSON.stringify({
          message: "The saved-items service is unavailable. Please try again.",
        }),
      );
    }
  };
}
module.exports = { createHandler };
