# Development and operation

[Documentation home](README.md) · [Configuration and deployment](../README.md)

## Run

Install Node.js 22.5+ and Docker with Buildx. On macOS use Colima or Docker Desktop. From the repository root:

```sh
npm ci
npm start
```

Open `http://127.0.0.1:4174`. `scripts/start-local.mjs` prepares the runtime, starts the private renderer, checks readiness and starts the web server. First startup can take longer because images must be built/downloaded. Direct `node server.mjs` does not perform this orchestration. `PMM_RENDERER_URL` selects an existing renderer instead.

The root [README](../README.md) contains the environment table and Caddy/Cloudflare deployment procedures. Example environment files are `.env.example` and `.env.cloudflare.example`; they are templates, not live credentials.

## Where to edit

| Change | Start here | Relevant checks |
| --- | --- | --- |
| Editor controls, export chooser, retry status | `public/app.js`, `public/index.html`, `public/styles.css` | `tests/test-export.mjs`, `tests/test-export-selection.mjs`, UX tests |
| Project library / account entry | `public/projects.*`, `public/welcome.*`, server auth/account routes | `tests/test-auth.mjs` |
| History modal | `public/export-history-ui.js`, `public/export-history-ui.css` | `npm run test:export-history` |
| SCAD parameters / diagnostics | `lib/scad-syntax.mjs`, `lib/parser.mjs`, server `modelInfoFromSource` | `npm run test:parser` |
| Font defaults | `lib/font-defaults.mjs`, server font catalog | parser and generation regressions |
| Object counts / bed placement | `public/packing-settings.js`, `public/plate-packing.js` | export-history and layout tests |
| Print setting / printer definition | `public/print-settings-schema.js`, `lib/bambu-export-profile.mjs` | `npm run test:bambu`, printer tests |
| 3MF geometry and color | `public/core-3mf.js`, `public/solid-3mf.js`, `lib/solid-parts.mjs` | 3MF structure and authenticated export integration |
| Snapshot/replay contract | `lib/export-history.mjs`, `public/export-recipe.js` | history, selection and history API tests |
| Instant uploads/orders | `public/instant.js`, `lib/instant-archive.mjs`, `lib/instant-orders.mjs`, `lib/instant-store.mjs` | `npm run test:instant` |
| Render performance/cancellation | `lib/render-scheduler.mjs`, `lib/parallel-work.mjs`, `lib/render-resources.mjs` | parallel-generation, renderer-service, render-cache tests |
| Isolation/runtime | `renderer-service.mjs`, `renderer-worker.mjs`, `lib/renderer-containers.mjs`, `lib/renderer-runtime.mjs`, `Dockerfile` | `npm run test:instant-container` |
| Startup/deploy/release | `scripts/`, Compose files | Cloudflare/release tests |

Follow imports across server/browser shared modules: changing a file in `public/` can affect server-side export too. For browser entrypoint changes update the existing asset version query when cache invalidation is needed. Runtime-image changes require an image rebuild; restarting only the web process does not update a container's code.

## Verification

Use focused checks for the changed behavior. The complete available commands are in [package.json](../package.json):

```sh
npm run test:color-budget
npm run test:editor
npm run test:parser
npm run test:bambu
npm run test:export-history
npm run test:instant
npm test
npm run test:all
```

These commands are alternatives by scope, not a requirement to run every suite after a documentation edit. Some native checks require OpenSCAD or an active renderer. `node tests/test-export-history-api.mjs` exercises authenticated real rendering/history with the local services running. `npm run test:instant-container` verifies actual Docker isolation; default Instant integration transport alone does not prove isolation.

`npm run test:all` discovers the local regression files, runs each in a separate process and reports all failures. It excludes six runtime/benchmark files with explicit reasons; use `-- --list` to inspect selection. The local fixtures still require OpenSCAD, font/image tools and compatible Bambu presets. `npm run test:runtime` runs the separate parser-runtime, Docker and real-renderer checks; the saved-workspace native benchmark remains skipped unless `PMM_EXPORT_WORKSPACE_ID` is supplied with its database and OpenSCAD. No existing services are needed for the normal local suite; some individual tests can opt into real Docker through their documented environment flags.

Optional external fixtures use `PMM_INSTANT_FIXTURE_DIR`, `PMM_TEST_SCAD` or `PMM_EXPORT_WORKSPACE_ID`; tests must not depend on a developer's personal Downloads files. Shared fixtures live in `tests/fixtures/`, and `tests/setup.mjs` anchors paths to the repository. Use temporary directories and clean generated output, not durable user data.

For a color change, verify distinct closed solids and explicit filament assignments in the exported 3MF, then replay it. Do not demand triangle paint on every uniform-color part. For history changes, test selected-plate scope, unchanged preview reuse, changed recipes, runtime mismatch and absence of retained final archives. For cancellation changes, ensure sibling jobs finish cancellation before disposal.

## Troubleshooting

| Symptom | Check / action |
| --- | --- |
| “No printable geometry” | OpenSCAD returned an empty selected design. Manifest previews skip conditionally inactive designs and exclude them from object counts and packing, while retaining their settings for reactivation. A fully empty preview shows an actionable message. Required exports still return 422; optional previews/parts use separate cache entries. Syntax errors, assertions and missing dependencies remain failures. |
| Web page unavailable | Start with `npm start`; inspect `cache/local-services.log` and `http://127.0.0.1:4174/healthz` |
| UI loads, rendering unavailable | Check renderer `http://127.0.0.1:4180/healthz`, Docker availability and the Manifold startup probe; a web-only process is insufficient |
| First generation slow | Separate image startup from rendering; inspect distinct model count, worker capacity and memory pressure |
| Repeated generations slow | Check whether dependencies intentionally bypass caching; do not remove dependency checks to force cache hits |
| Some SCAD settings absent | Read parser diagnostics; expressions/local variables are intentionally left to OpenSCAD |
| Missing dependency/font | Preserve project-relative upload paths and supply referenced assets; inspect worker validation errors |
| Monochrome export | Check source colors, selector metadata, separate-part rendering and filament assignments; old color snapshots require a new export |
| Replay rejected | Compare runtime/color-export version and fingerprint; recreate an export from the workspace when intentionally changing the recipe |
| Invalid wall loops or other profile values | Correct the setting; retry clears old UI status but does not bypass validation |
| Bambu metadata unavailable | Import compatible local profiles with `scripts/import-bambu-profiles.sh` |

## Maintain documentation and package releases

Update feature descriptions, function contracts and relevant tests together. Run `node scripts/document-functions.mjs` after adding or moving named functions. The generated index deliberately omits vendor code, tests, anonymous callbacks and class/object methods; consult linked source for those details.

`npm run release` uses `scripts/make-release.mjs` to create a clean package. It excludes account databases, caches, credentials, private fonts/presets and installed dependencies, and rejects symlinks. Preserve `data/`, `secrets/` and personal assets while organizing the repository. See [licensing](../LICENSE) and the [audit](COMMERCIAL-USE-AUDIT.md) before distribution.
