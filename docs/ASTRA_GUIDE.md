# Liqu3D Local maintenance guide

This is the independent desktop copy of scad-maker-v1. Changes here must not modify the original project or its data.

## Runtime

`desktop/main.cjs` → Electron utility process running `server.mjs` → native OpenSCAD.

- Electron launches on an ephemeral loopback port and injects a per-launch request token. The window has no Node integration and uses context isolation and sandboxing.
- Closing the application stops the backend and active native renders. Settings has Appearance, Workspace, and Storage; login/account/security screens are absent.
- `server.mjs` creates one internal local owner to preserve SQLite foreign keys and preference/storage APIs. There are no login routes. Root opens the latest project or creates an empty workspace.
- `PMM_RENDERER_URL` is ignored. Preview, full export, Quick batch dependencies and export history replay use native OpenSCAD with Manifold. No Docker quotas are applied; scheduler concurrency still bounds simultaneous renders. Auto concurrency uses two-thirds of logical CPUs, a 1 GiB per-slot scheduling estimate, and a maximum of eight jobs (no per-process RAM/CPU quota). Eight beat three, four, six and twelve on the saved 16-object desktop workload.
- Desktop data and writable fonts/cache live under Electron userData; browser development uses the copy's data directory or `PMM_DATA_DIR`. No hosted quota is imposed.
- The packaged build requires the installed OpenSCAD application and fontconfig tools for dependency/font verification. Do not claim these are bundled.
- Packaging keeps readable code, removes developer files/duplicate icon sources, and retains English Chromium menu translations only. ICU, fonts, native libraries and model/profile assets remain intact. `scripts/package-desktop.mjs` accepts `--platform darwin|win32|linux --arch arm64|x64`; trim only the temporary Electron copy, before signing. `test-desktop-package.mjs` checks target options and resource preservation. Windows/Linux still need runtime acceptance on those operating systems.
- No email-service dependencies ship or load. Inherited account helpers keep disabled guards for compatibility; local startup works with `NODE_ENV=production` and no email credentials. The macOS launcher adds Homebrew to PATH; Windows/Linux retain their native search path.

Native text caching uses `lib/native-font-cache.mjs`: content hashes for the exact configured font directories, Fontconfig file, and native executable. Every request rechecks file metadata and directory membership; changed contents are hashed again. Recheck identity after rendering before storing outputs. Live external dependencies remain non-cacheable without frozen bundles; preview/full keys remain separate. Tests: `test-native-font-cache.mjs`, `test-local-desktop.mjs` (memory and disk reuse across restart).

## Files by task

| Task | Files |
| --- | --- |
| Desktop lifecycle, menus, icon | `desktop/main.cjs`, `desktop/icons/`, `scripts/package-desktop.mjs`, `scripts/build-desktop-icon.mjs` |
| Editor and generation | `public/app.js`, `public/index.html`, `public/styles.css`, `public/preview-prefetch.js` |
| Settings and storage | `public/account-settings.js`, `public/account-storage-ui.js`, `lib/account-storage.mjs` |
| Project library | `public/projects.*`, `public/projects-settings.js` |
| Native renderer and API | `server.mjs`, `lib/render-scheduler.mjs`, `lib/render-cache.mjs`, `lib/instant-assets.mjs` |
| Quick batch | `public/instant.*`, `lib/instant-store.mjs`, `lib/instant-generation.mjs` |
| Exports and replay | `lib/export-history.mjs`, `lib/export-preview.mjs`, `public/export-recipe.js`, `public/export-history-ui.js` |

Preserve sources, profiles, fonts, stable object/plate identity, closed color geometry, cached result identity, cancellation and export recipes. Preview tessellation must not lower final export quality. Generated copies still own their geometry and disposal. The viewer renders on demand; do not restore idle animation loops.

Use `npm run test:local` for real local rendering and app API checks. It creates and cleans temporary data. Never test deletion against the user's data. Relevant pure browser/model tests remain useful; inherited authentication/Docker integration tests assert the old architecture and are not the local acceptance suite.

No frontend bundler or framework is needed. Read targeted sources, run focused checks, update this guide when contracts change, and regenerate `docs/SOURCE_INDEX.md` after moving functions. Existing broader architecture/deployment documents describe the original web edition and are historical references.
