# DictionaryApp: maintained original

The original React UI is retained. This is an independent Git repository based on [SkylerrSimpson/DictionaryApp](https://github.com/SkylerrSimpson/DictionaryApp) at `71f1b5889c352633f511944b7a178ae39764d908`, with fetched upstream history and local maintenance changes on `maintained-original`. No changes were pushed. See [MAINTENANCE.md](MAINTENANCE.md) for explicit behavior/backend changes and [README.upstream.md](README.upstream.md) for the historical instructions.

## Run independently

Use Node 24 (Node 22+ required by the server). From this repository:

1. Install the original frontend: `npm ci --ignore-scripts`.
2. Install the maintained server: `npm --prefix backend ci --ignore-scripts`.
3. Provision a dedicated PostgreSQL database **and role** for this original. Never use the modern app's database credentials or an existing Mongo credential. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`. The URL is server-only. Set `APP_ORIGIN=http://localhost:4101` exactly.
4. Run `npm --prefix backend run migrate` to create `dictionary_original.items`.

Build with `npm run build`, then run `npm start`. Open **http://localhost:4101**. One server serves the original production React build and its API; no Render account, cross-origin API host, global nodemon, port 3000, or port 8000 is needed. Known React deep links use the app shell; unknown paths and missing assets return HTTP 404. Development binds to loopback. With `NODE_ENV=production`, the server binds to `0.0.0.0` (override with `HOST` if needed); the hosting platform must terminate HTTPS.

For frontend hot reload, set backend `APP_ORIGIN=http://localhost:4201` and start it; then run `HOST=127.0.0.1 PORT=4201 npm run dev`. CRA proxies the relative API requests to the isolated backend. Use one hostname consistently because browser cookies are host-scoped.

For all four originals together, the sibling [local setup guide](../README.md) provides a separate Docker PostgreSQL service and random local env generation. Each repository also works independently with its own provisioned PostgreSQL service.

## Checks

`npm --prefix backend test` exercises the server contract and browser ownership with an in-memory test adapter; it does not prove PostgreSQL connectivity. `npm --prefix backend run test:database` additionally tests the real SQL store when `ORIGINAL_TEST_DATABASE_URL` names a disposable loopback database ending in `_test`; otherwise the database check is explicitly skipped. `npm run build` verifies the original CRA build. See [VALIDATION.md](VALIDATION.md) for checks actually completed in this workspace.

## Private configuration

`.env` files and build outputs are ignored. Never commit connection strings or database passwords. Browser data access uses a random HttpOnly SameSite=Strict cookie, with only its SHA-256 hash stored as the owner key. Clearing cookies loses access to those saved rows; there is no account recovery or cross-device synchronization. Database operators can access stored data. Cookie loss does not erase the database rows.

For HTTPS hosting set `NODE_ENV=production`, `APP_ORIGIN=https://your-host`, and `COOKIE_SECURE=true`; the server refuses insecure production configuration. No CORS allowance is needed.
