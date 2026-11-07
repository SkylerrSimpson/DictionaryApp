# Maintenance record — 2026-11-06

Upstream: `https://github.com/SkylerrSimpson/DictionaryApp.git`
Source commit: `71f1b5889c352633f511944b7a178ae39764d908`
Local branch: `maintained-original`
History: fetched directly from upstream; existing history was not rewritten. No push or production data access was performed.

## Changes

- Preserved original sidebar/mobile navigation, purple palette, search/result layout, pronunciation buttons, save stars, saved list, and double-click rename (also keyboard accessible).
- Replaced Mongo/Mongoose with PostgreSQL; same `/words` list/create/delete response shapes. Added atomic `PATCH /words/:id` for rename, replacing destructive delete-then-create.
- Saved words are now private to an opaque browser cookie, not the old global anonymous collection. Same word may be saved independently by different browsers.
- Fixed repeated fetch/effect loops, stabilized error callbacks, encoded lookup/record URLs, retained item on rename conflict, and restored save buttons after errors.
- Added names/keyboard access to icon actions and rename, disabled unavailable pronunciation, retained explicit list errors. This is targeted accessibility repair, not an assertion of full WCAG compliance.

## Persistence and deployment

MongoDB/Mongoose were removed from the executable backend. PostgreSQL schema `dictionary_original` is isolated from the modern application. The old global/shared collection semantics changed deliberately to browser-private ownership. Every saved-item SQL query includes owner_hash; request bodies cannot choose that hash. Mutations require an existing browser cookie, exact configured Origin, and JSON for POST/PATCH. Errors no longer return raw database messages. Validation and bounded JSON requests were added. The local setup creates a separate database and role, not only a shared table prefix.

No old Mongo data was read, exported, converted, assigned to browsers, or deleted. Importing legacy shared records would require a separate ownership decision and an authorized export; this code starts with an empty isolated database.

## Compatibility limits

CRA/react-scripts and the recognizable React component/style structure are retained. It is an intentionally maintained legacy UI, not a Next.js rewrite. A successful build does not establish that every transitive development dependency is vulnerability-free. Frontend external services/fonts retain their availability and privacy limitations. No automatic dependency audit fix or broad visual redesign was applied. The included server/API tests isolate external lookups and do not write to live services.

## Additional compatibility checks

Saved-list initialization is serialized across tabs using Web Locks. Production cookies use the `__Host-` prefix and ambiguous duplicate cookies are rejected. Production servers bind to the host network interface; development stays on loopback. Only known React routes receive the SPA shell; unknown paths and missing assets return HTTP 404.

The unused CRA template test was replaced with a targeted regression check for the actual app workflow. Axios is pinned to 1.21.0. React Router stays on its v6 line at 6.30.6; two reported v6 advisories remain and their reachable inputs require review before public deployment. Build dependencies remain a legacy toolchain; they are not part of the maintained Express runtime.
