# Cleanup audit — 2026-09-09

Maintenance record for the [Astra guide](ASTRA_GUIDE.md). Scope: first-party browser, server, worker and shared modules; tests, scripts, deployment configuration and documentation. Vendored libraries, installed dependencies, credentials, databases and personal assets were excluded from deletion.

## Removed or simplified

- Unreachable font-picker modal, styling, event handlers, preview state and revision bookkeeping. Background font discovery, availability labels, parameter editing, font APIs and font files remain.
- Obsolete batch-list/distribution UI bindings whose target elements no longer exist, plus editor helpers with no runtime callers. Active plate assignment, selection, undo/redo and object generation remain covered.
- Unused STL browser preview construction and its loader import; the active editor preview uses 3MF.
- Test-only `production-layout.js`, cartesian preset combination and object distribution helpers. Moved the SKU snapshot fixture builder from shipped browser code into `tests/fixtures/sku-snapshot.mjs`.
- Duplicate server cancellation-error construction and challenge-deletion SQL, redundant cache eligibility conditions, write-only worker capability variables and duplicate output-size checks. Bounded reads still enforce output limits.
- Unused release-filter parameter. Existing package dependencies, migrations, compatibility behavior, rendering fallbacks and deployment identities remain.

Deletion evidence combined runtime import/caller searches, HTML IDs, event registration, worker entrypoints, CSS use and fixture review. A second review checked the browser deletions and identified the necessary asset-version update to prevent cached code from accessing removed markup.

## Test maintenance

- Repaired the export test's incomplete VM context and removed obsolete mocks that its current export path never calls.
- Strengthened selected-export coverage to reject swallowed errors.
- Replaced a preexisting SKU test that extracted long-removed callbacks with tests of current variant resolution, saved-workspace restoration, preview/export membership and object isolation.
- Preserved active deletion/undo and movement assertions while removing tests of dead helper functions.
- Added `test:all` discovery and explicit `test:runtime` selection; both collect failures and return a failing exit status. Existing focused/default commands remain available.

## Validation

- 56 local regression test files passed.
- 5 real-runtime test files passed after rebuilding the worker image and restarting local services: parser runtime, Docker isolation, export/history, settings/preview and Instant packing APIs.
- The saved-workspace native benchmark was explicitly skipped because no `PMM_EXPORT_WORKSPACE_ID` was selected.
- After the final helper removals, the three affected object/plate/conditional-preview tests passed again.
- Source syntax, relative module imports and documentation links were checked; the generated source index was refreshed.

The app remains available at `http://127.0.0.1:4174`. Automated coverage does not establish that every interactive state was manually exercised.

## Context to retain

- `server.mjs` and `public/app.js` still coordinate many responsibilities. Splitting them is a separate refactor, not required to delete proven dead code.
- The renderer's cached health result can outlive its pinned Docker image. Verify an actual render when diagnosing availability; the [guide](ASTRA_GUIDE.md) records recovery steps.
- Native test prerequisites and the separate saved-workspace benchmark are documented in [DEVELOPMENT.md](DEVELOPMENT.md). A green local suite alone is not proof of real Docker isolation.
