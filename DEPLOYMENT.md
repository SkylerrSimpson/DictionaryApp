# Vercel deployment preparation

This repository remains an independent maintained original. Its local `npm start` launcher and original interface are unchanged. The deployment adapter has not been verified on Vercel or against Neon; a successful local build is not a live deployment check.

## Project settings

Create a separate Vercel project for this repository. **Before the first deployment, select `maintained-original` as the production branch and verify that the deployment source is that branch.** Do not accept a Git import that would immediately deploy the default `main` branch; configure the branch first or use a branch-specific import flow. `main` contains the historical, unmaintained application and must not be deployed using these instructions. Do not supply or reuse its old Mongo configuration.

Use the repository root as Root Directory and Node.js 24.x. Package engines are pinned to `24.x` (including lockfile metadata), so Vercel cannot select a later major from a broad `>=22` range. The checked-in `vercel.json` selects the Other preset, installs the required locked dependencies, runs `npm run build:vercel`, and publishes `vercel-static`. Do not override these commands with the development server or point the CDN at the source `public` directory.

The build compiles CRA with source maps disabled, then stages only compiled static assets and the existing public files. Environment files, Git history, backend source, and source maps are excluded from the public output. Do not put secrets in `REACT_APP_*`: CRA embeds those variables in browser bundles. `.vercelignore` also excludes private local configuration and historical backend entry files from uploads.

Only `/` and `/word-list` serves the application shell. Missing assets and unknown UI routes must remain 404. No blanket SPA fallback is configured. Static responses receive the maintained server's basic security headers.

## Isolated PostgreSQL and functions

Provision a separate Neon Free project/database and role for this original, with schema `dictionary_original`. Do not reuse the modern app database or another original's credentials. Set these server-only variables in Vercel's environment settings:

- `DATABASE_URL`: this original's TLS-enabled pooled Neon connection, kept private.
- `APP_ORIGIN`: the exact HTTPS origin serving this deployment, without a trailing slash or path.
- `COOKIE_SECURE=true`.

Run `npm --prefix backend run migrate` once against the intended empty database using a securely supplied connection. This is a controlled deployment step, not a public endpoint, build step, or per-request task. Preview deployments need their own isolated database and exact preview `APP_ORIGIN`; do not assign production data to previews. No old Mongo records are imported.

The Node function at `api/original.js` composes the existing Express app and store. Rewrites retain `/words` and `/words/:id` on the same origin; `/healthz` is also routed to the function. The function receives the original request path, preserving encoded record IDs; direct access to `/api/original` is rejected. Browser ownership cookies, no-store API responses, JSON limits, and exact-Origin mutation checks remain in the existing server. The adapter always requires HTTPS and secure cookies, including previews, and never trusts the request Host to configure ownership checks.

The PostgreSQL client is initialized lazily and reused within a warm function instance. Its existing five-connection pool is per instance, not an account-wide limit; use Neon's pooled endpoint and verify concurrency and cold-start behavior before public use. No daemon listener, automatic schema migration, or shutdown handler runs in the function. `/healthz` checks app availability, not database readiness.

## Checks and free-tier limits

Run `npm run test:deployment` and `npm run build:vercel` locally. Artifact tests cover accidental private-file inclusion, source maps, missing compiled assets, raw CRA templates, and the bounded routing configuration. They do not emulate Vercel's routing engine or function bundler.

Before enabling the public hub link, verify a Vercel preview: direct known UI routes, compiled JS/CSS, unknown-route and missing-asset 404s, response headers, and external lookups. For saved-data apps, additionally verify function tracing, cookie issuance, refresh persistence, two-browser isolation, mutation Origin rejection, encoded IDs, database sleep/resume, and failures without raw database errors. Rate controls and the legacy dependency review remain public-deployment gates. No paid resources are required by this preparation.

Vercel Hobby is intended for personal, non-commercial use and has usage limits. Neon Free has storage/compute/transfer limits and scales to zero after five idle minutes; free hosting does not provide an always-on database promise. Check current account eligibility and allowances before deployment.

References: [Vercel static configuration](https://vercel.com/docs/project-configuration/vercel-json), [Node functions](https://vercel.com/docs/functions/runtimes/node-js), [Express static-serving limitation](https://vercel.com/docs/frameworks/backend/express), [Hobby plan](https://vercel.com/docs/plans/hobby), [Neon plans](https://neon.com/docs/introduction/plans).

Local verification on 2026-11-06: `npm run build:vercel` passed and 5 deployment tests passed. Existing HTTP tests were attempted but blocked by `listen EPERM` in this sandbox. Vercel and Neon runtime verification has not been performed.
