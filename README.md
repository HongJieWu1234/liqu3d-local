# Liqu3D Local

A standalone Electron edition of Liqu3D. Opens directly into the editor, with a local project library and settings. No landing page, login, cloud account, Cloudflare, or Docker is needed.

## Open

Double-click `dist/Liqu3D Local-darwin-arm64/Liqu3D Local.app` on this Apple Silicon Mac.

For development, run `npm install`, then `npm start`. `npm run start:server` starts the same local app in a browser at http://127.0.0.1:4175.

## Rendering and files

This build uses the installed OpenSCAD application, currently `/Applications/OpenSCAD.app`. It requires a modern build with Manifold and textmetrics. `OPENSCAD_BIN` can select another compatible executable. OpenSCAD and any system font tools are not bundled into this first local build.

Rendering runs directly on the Mac, without the Docker worker's 1 CPU / 1 GB caps. Up to eight renders run concurrently on this machine by default (scaled down on smaller machines); set `OPENSCAD_MAX_JOBS` to adjust concurrency. Preview detail, full export detail, cancellation, batch generation and saved export replay are retained. Native text geometry is cached against the content of the active fonts, Fontconfig configuration and OpenSCAD executable; changing them invalidates reuse.

Desktop data is stored separately in `~/Library/Application Support/Liqu3D Local/data`. The browser development server uses this copy's `data/` directory unless `PMM_DATA_DIR` is set. No original accounts, passwords, caches or saved projects were copied. There is no 2 GB account storage quota in this edition.

The backend listens only on loopback. Electron authenticates its local requests automatically with a fresh per-launch token; there is no user login. The editor remains sandboxed from Node.js. Native OpenSCAD runs with the current user's filesystem permissions.

## Build and check

- `npm run test:local`: temporary-data checks using native OpenSCAD, including previews, text, 3MF, Quick batch, export replay, preferences and restart persistence.
- `npm run package`: produce the desktop app in `dist/`.
- `node tests/test-desktop-package.mjs`: check packaging exclusions and language-resource trimming in temporary folders.
- `node scripts/build-desktop-icon.mjs`: rebuild the PNG and macOS icon from `desktop/icons/app.svg`.

The packaged app is a local development build, not a signed/notarized public release. Older inherited web/Docker test fixtures are retained as references; use the local test above for this edition.

Packaging keeps the code readable and excludes development scripts and duplicate icon sources. Only English Chromium menu translations are shipped; Unicode text, fonts, ICU and rendering assets are preserved. The desktop backend does not load or ship the former email-service libraries. Most remaining disk space belongs to Electron's browser engine; package-size savings do not imply equivalent RAM savings.

## Windows and Linux

The UI and local backend are shared. The launcher preserves each operating system's executable search path. Packaging accepts an explicit target:

- Windows x64: `npm run package -- --platform win32 --arch x64`
- Linux x64: `npm run package -- --platform linux --arch x64`
- Use `--arch arm64` for an ARM target.

Build and test on the target operating system before distribution. These commands produce app folders, not installers. Windows installation/signing and Linux installer formats are a separate release step. Windows cross-packaging from macOS/Linux may require Wine to apply the executable icon/metadata.

Each system needs a compatible native OpenSCAD build with Manifold and textmetrics, plus Fontconfig tools (`fc-match` and `fc-scan`) available on its search path. OpenSCAD discovery already checks common Windows installations and the Linux PATH; `OPENSCAD_BIN` can override it. Those tools can be bundled later with their platform libraries and license notices, at the cost of a larger download. Linux also needs Electron's normal desktop libraries and a working sandbox.

Only the macOS app has been run and render/export tested here. Windows/Linux target configuration is checked, but those releases are not yet runtime-verified.
