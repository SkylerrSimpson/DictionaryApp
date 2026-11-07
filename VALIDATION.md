# Verification record

Checked 2026-11-06. No original has been pushed or deployed.

| Check | Dictionary | DevFinder | TodoList | Tip |
| --- | --- | --- | --- | --- |
| Locked clean frontend install | Pass | Pass | Pass | Pass |
| Locked clean server install | Pass | Pass | Pass | Pass |
| Production frontend build (`CI=true GENERATE_SOURCEMAP=false npm run build`) | Pass | Pass | Pass | Pass |
| React behavior regression (`CI=true npm run test:ui -- --runInBand`) | Pass | Pass | Pass | Pass |
| Input/cookie unit checks | 2 pass | 2 pass | 2 pass | Not applicable |
| Local HTTP contract | Blocked by listener permissions | Blocked | Blocked | Blocked |
| Real PostgreSQL integration | Not run | Not run | Not run | Not applicable |
| Browser/layout/playback | Not run | Not run | Not run | Not run |

Dependencies were installed from official npm archives in an isolated cache, with locked archive integrity verified and lifecycle scripts disabled. This was a real `npm ci` in each package, not merely a manifest comparison. Preserved CRA builds still emit Node/Browserslist deprecation notices. React component tests use JSDOM and fixtures; React 18.3 reports an old testing-library `act` deprecation. These are not live browser or database results.

The React tests exercise a failed Dictionary atomic rename, failed DevFinder removal, Todo add/complete/delete failure/retry, and Tip presets/custom Enter/invalid people/Reset. The replacement server tests include ownership and Origin enforcement but require an allowed localhost listener for full execution. PostgreSQL tests require explicitly isolated loopback `_test` databases. None writes to the historical database.

## Dependency review

The official npm bulk-advisory endpoint returned no matches for the 68 package names in the maintained Express/PostgreSQL server graph. Axios was updated to 1.21.0 and returned no matching advisory. Dictionary/DevFinder now use React Router 6.30.6; two moderate React Router v6 advisories still match. Their documented triggers concern untrusted Link/navigation destinations and SSR hydration. Current maintained routes use fixed paths plus encoded query values, and the original UIs use client rendering, not SSR. That source assessment is not a blanket guarantee about future callers.

The union of original frontend lockfiles still matched 55 package names with advisories after the focused updates. The remaining critical entries concern form-data, proxy-addr, shell-quote and websocket-driver in the legacy frontend dependency graph. They are not present as vulnerable versions in the maintained server graph. Serving a CRA development server publicly would expose a different risk surface than serving generated static files. Keep builds isolated; ship only static assets and the maintained server's production dependencies. Do not run `npm audit fix --force` across the original projects as a substitute for assessing compatibility and reachable inputs.

## Security and source boundaries

The known Todo credential-bearing current-source comment was removed before building. No exposed credential was used. Historical Git objects still contain the upstream exposure and are not sanitized artifacts. Account-side revocation/rotation has not been verified. Never distribute `.git`, `.env` or raw historical diffs as a clean deployment archive.

Known React routes receive the app shell; unknown routes and missing assets have explicit 404 handlers in source. Production binding and secure-cookie configuration were reviewed, but their hosted behavior is not established by build success. Public deployment also requires verified rate controls for anonymous data writes/session creation, host-specific HTTPS/cookie checks, database backup/restore and live external-API checks.
