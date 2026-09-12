<p align="center">
  <img src="desktop/icons/app.png" width="112" height="112" alt="Liqu3D Local logo">
</p>

<h1 align="center">Liqu3D Local</h1>

<h2 align="center">Customize parametric models. Generate faster.</h2>

<p align="center">Turn your OpenSCAD model's editable parameters into controls for dimensions, text, colors, and other options. Generate designs locally with parallel rendering sized to your computer's CPU and RAM, then export your plates as color 3MF projects.</p>

<p align="center">
  <a href="https://github.com/HongJieWu1234/liqu3d-local/releases/download/v1.0.0/Liqu3D-Local-macOS-arm64.zip"><strong>Download for Mac</strong></a>
  &nbsp; · &nbsp;
  <a href="#how-to-use-liqu3d"><strong>How to use it</strong></a>
  &nbsp; · &nbsp;
  <a href="https://github.com/HongJieWu1234/liqu3d-local/issues"><strong>Get help</strong></a>
</p>

---

## Parametric editing, with less waiting

**Change the model through its parameters.** Load a `.scad` file and adjust the supported settings it exposes. For example, change a tag's name and width, or a bracket's dimensions, if those options are defined in the model. OpenSCAD rebuilds the geometry from your values.

**Use your computer's rendering capacity.** Liqu3D chooses how many independent render jobs to run together based on your CPU and installed RAM, up to eight by default. Larger batches can use more of a capable machine; smaller machines run fewer jobs at once.

**Reuse work that is already done.** Identical cacheable designs reuse previous geometry. Changing a model, its parameter values, or relevant fonts triggers a new result when needed. Auto Regenerate can also wait until you finish editing before starting another preview.

The speedup depends on the model, your hardware, and whether a cached result is available. Final exports retain full export detail.

---

## Download & install

### **[↓ Get Liqu3D Local for Mac](https://github.com/HongJieWu1234/liqu3d-local/releases/download/v1.0.0/Liqu3D-Local-macOS-arm64.zip)**

**Apple Silicon Macs (M-series) · Preview release · English interface**

Download the ZIP above. The green **Code** button downloads the source code; the link above downloads the app.

> **First-time setup:** this preview needs OpenSCAD and Fontconfig installed separately. You do not need a Liqu3D account, Docker, or Node.js to use the downloaded app.

### 1. Install the rendering tools

Install a recent **[OpenSCAD development snapshot](https://openscad.org/downloads.html#snapshots)** and put its app in **Applications**. Liqu3D needs the Manifold and textmetrics features; this release was tested with OpenSCAD **2026.08.30**.

Install **[Fontconfig](https://formulae.brew.sh/formula/fontconfig)** for font checking. If you use [Homebrew](https://brew.sh/), open Terminal and run:

```sh
brew install fontconfig
```

### 2. Open Liqu3D

Double-click the downloaded ZIP, move **Liqu3D Local.app** into **Applications**, and open it. The editor starts automatically.

This preview is not Developer ID signed or notarized. If macOS blocks it, follow [Apple's instructions for opening an app from an unidentified developer](https://support.apple.com/en-us/102445) after checking that you downloaded this project's release.

---

## How to use Liqu3D

### **1 — Load a parametric SCAD model**

Click **Add SCAD files** at the top and select your `.scad` file. Its supported parameters appear in the left panel. These controls come from the model, so different files expose different options.

**Need a file to try?** In an empty workspace, click **Try a name tag**. It includes editable text, two colors, and tag dimensions. To start a separate workspace, use the top-right menu → **Library → Add new → Workspace**.

### **2 — Set the values you want**

Find the parameter in the left panel, using **Search settings** if the model has many options. Enter a value or choose an option. When a workspace has multiple objects, select the object you want to customize before editing its settings.

**Try this with the included name tag:**

| Setting | Enter or select | What it changes |
| --- | --- | --- |
| **Name Text** | `Alex` | The raised lettering |
| **Tag Width** | `85` | The tag's overall width in millimeters |
| **Base Color** | `Black` | The tag body color |
| **Text Color** | `White` | The lettering color |

### **3 — Generate the updated geometry**

Click **Generate all** to build the preview from your new values. With the example above, you should see an **85 mm-wide black tag with white “Alex” lettering**. Change a value and generate again to compare the result.

For automatic updates, open the top-right menu → **Settings → Workspace**, enable **Auto Regenerate**, and enter a delay such as **2.5 seconds**. Each new edit restarts that wait, so generation begins after you stop changing values.

### **4 — Arrange the plate and export a 3MF**

Drag an object to reposition it. Press **R** to turn the selected object in 90° increments, then click to apply. Open **Print settings** from the right edge and select your printer and filament settings.

Click **Check plates** to review the layout. Then choose **Export → Export all** for every populated plate, or **Export → Export manually** to select specific plates. Open the resulting **3MF** project in **Bambu Studio**, review the slice, and print from there.

**Save the editable project too:** enter a workspace name at the top and click **Save** or press **⌘ S**. Reopen it later through **Library** to change its parameters again.

---

## Find your way around

| I want to… | Go here |
| --- | --- |
| Reopen a project or start another | Top-right menu → **Library** |
| Make many variants from a file and order list | **Library → Add new → Quick batch** |
| Generate automatically after editing | Top-right menu → **Settings → Workspace → Auto Regenerate** |
| Wait longer before automatic generation | Change the seconds beside **Auto Regenerate**; decimals such as **2.5** work |
| Turn automatic saving on or off | **Settings → Workspace → Auto Save** |
| Change the appearance | **Settings → Appearance** |
| Review saved files and free up space | **Settings → Storage** |
| Find an earlier export | **Library → Export history** |

**Your projects stay on this computer.** They do not automatically sync to another device. Identical supported renders can reuse cached results, so repeating a design can be much faster.

## Does it work on my computer?

| Platform | Availability |
| --- | --- |
| **Mac — Apple Silicon** | **Download available.** Rendering and exports tested. |
| Mac — Intel | No ready-to-download build yet. |
| Windows | Build options exist; no tested release yet. |
| Linux | Build options exist; no tested release yet. |

## Need a hand?

**Generation will not start?** Check that a compatible OpenSCAD snapshot is in Applications, then reopen Liqu3D. An older OpenSCAD installation may not have the required rendering features.

**Font checking fails?** Install Fontconfig using the command above, then reopen the app. Its `fc-match` and `fc-scan` tools need to be available.

**Changes are not appearing?** Click **Generate all**, or enable **Auto Regenerate** in Workspace settings.

**Still stuck? [Open an issue](https://github.com/HongJieWu1234/liqu3d-local/issues/new)** with your macOS version, OpenSCAD version, and the error message. A small example `.scad` file helps reproduce model problems.

---

## For developers

<details>
<summary><strong>Run from source, build the app, and run checks</strong></summary>

Use Node.js 24 or newer and install the rendering tools described above.

```sh
git clone https://github.com/HongJieWu1234/liqu3d-local.git
cd liqu3d-local
npm ci
npm start
```

The project uses plain JavaScript and Electron, with no frontend bundler. `npm run start:server` runs the browser version at `http://127.0.0.1:4175`.

| Command | Purpose |
| --- | --- |
| `npm run package` | Build for the current computer; output goes into `dist/` |
| `npm run package -- --platform win32 --arch x64` | Create a Windows x64 app folder |
| `npm run package -- --platform linux --arch x64` | Create a Linux x64 app folder |
| `npm run test:local` | Test native rendering, text, 3MF, Quick batch, history replay, caching, and saved data across restarts |
| `node tests/test-desktop-package.mjs` | Check packaging exclusions and preserved resources |
| `node scripts/build-desktop-icon.mjs` | Rebuild the app icon |

Build and test on each target operating system before distribution. These are app folders, not installers. Windows cross-packaging may need Wine for executable metadata. ARM targets use `--arch arm64` and still need compatible native dependencies. Linux needs Electron's desktop libraries and sandbox support. OpenSCAD and Fontconfig are not bundled.

Tests create temporary data; do not point them at personal projects. Older inherited web/Docker fixtures describe the original web edition. See [the maintenance guide](docs/ASTRA_GUIDE.md) for the desktop architecture.

</details>

<details>
<summary><strong>Storage, performance, and packaging details</strong></summary>

- Desktop projects live in `~/Library/Application Support/Liqu3D Local/data` on macOS. The browser development server uses this checkout's `data/` directory unless `PMM_DATA_DIR` is set. No hosted 2 GB quota applies; available disk space is the limit.
- Native render concurrency adapts to CPU and memory, up to eight jobs by default. `OPENSCAD_MAX_JOBS` adjusts it; `OPENSCAD_BIN` selects a compatible OpenSCAD executable. These are environment variables for development or custom launches.
- Text-cache keys include font, Fontconfig, and OpenSCAD identities. Changed inputs invalidate reuse. Preview and full-export results use separate cache keys.
- The backend listens on loopback and uses a fresh per-launch request token. The editor has no Node integration. Native OpenSCAD runs with the current user's filesystem permissions.
- Packaged code stays readable. Developer files, duplicate icon sources, unused email libraries, and non-English Chromium menu translations are excluded. Fonts, Unicode support, and rendering assets are preserved. Most remaining disk space belongs to Electron; smaller downloads do not imply the same reduction in RAM usage.

</details>

[License](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md) · [Release notes](https://github.com/HongJieWu1234/liqu3d-local/releases/tag/v1.0.0)
