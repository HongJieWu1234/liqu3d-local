# Instant color optimization

Enabled by default for new Instant runs. Under **Print settings**, **Reduce color changes** can be turned off and **Available filament slots** can be set to 1–64 (default 4). Slot changes and disabling optimization save automatically and generate a new result. The adjacent gear opens **Minimize color changes** or **Maximum changes**; enabling the checkbox opens the same dialog. **Apply & generate** closes the dialog, saves the chosen mode/limit and starts generation. Existing completed downloads stay unchanged until inputs/settings change or generation is explicitly retried. Ordinary workspace packing is unchanged.

## Integration and files

The pipeline is **orders → existing OpenSCAD rendering → solid 3MF reader → color-layer analysis → model grouping → existing rectangle packing → existing native Bambu 3MF exporter**. There is no plate viewer and no change to order mapping or SCAD generation.

| File | Responsibility |
| --- | --- |
| `lib/instant-color-optimization.mjs` | Original geometry analyzer, bounded hash cache, swap estimate, deterministic grouping and slot/material constraints. |
| `public/solid-3mf.js` | Optional per-face color/material metadata, assembly transforms and unit conversion for Instant. Workspace callers keep the original strict mode. |
| `lib/instant-generation.mjs` | Analyze complete logical objects, group before packing, retain per-object values/parts/colors/placement, isolate bad objects, embed the report. |
| `lib/instant-store.mjs` | Validate/persist options, immutable run snapshots, account-scoped cache, result summary, storage accounting, partial-result conversion guard. |
| `public/instant.html`, `public/instant.js`, `public/instant.css` | Saved controls, estimate, explicit omission/fallback notices and expandable limitations. |
| `public/core-3mf.js` | Attach the failing object index to existing mesh-validation errors, allowing Instant to isolate an invalid solid. Healthy export output is unchanged. |
| `public/index.html`, `public/app.js` | Updated affected asset references. |
| `tests/test-instant-color-optimization.mjs`, `tests/test-instant-store.mjs`, `tests/test-instant-api.mjs`, `package.json` | Geometry, packing, persistence, isolation and real OpenSCAD integration checks. |

## Analysis and scoring

The analyzer knows nothing about SCAD parameters, design names or CSV fields. It consumes transformed triangles and their actual 3MF properties. Core base materials and the Materials extension's flat per-face colors are supported, including multipart component hierarchies. RGB values identify colors; alpha is not a separate filament. Model/object `filament_type`, `material_type` or `material` metadata is inherited through assemblies. Recognizable polymer names in base-material names also provide material types. Without a material type, the selected Instant filament type is assumed.

Each complete model is normalized to its lowest Z, matching placement on the bed. The layer and first-layer heights come from the **actual embedded print profile**. Non-horizontal, non-degenerate triangles contribute their intersected Z-slab intervals. An event sweep unions those intervals by color and records one-based inclusive layer ranges. Disconnected volumes do not fill the gap between them. Horizontal caps are omitted to avoid adding the upper color below a shared boundary; side faces of closed solids supply the occupied intervals. No contours, infill, supports or toolpaths are constructed.

Analysis work is O(triangles + events × log events), rather than testing every triangle on every layer. SHA-256 keys include transformed geometry, face properties, layer heights, assumed material and analyzer version. A process-local LRU retains at most 2,048 analyses / 16 MiB across accounts, with account-scoped keys and account-deletion cleanup. Copies share their parsed geometry and analysis. Cache entries contain only small reports, not meshes or customer order text. Restarting clears the cache; persisted completed results remain available.

The swap proxy counts `number of colors on the layer − 1` changes per occupied layer, plus one between consecutive occupied color sets with no common color. It assumes favorable color ordering, carries the last filament forward where possible and excludes the initial load. It is a relative lower-bound proxy, not a prediction of a slicer's sequence.

Identical layer patterns are grouped first and split using the existing packer. Up to three bounded neighbor passes merge fitting groups when the estimate does not increase, preferring fewer colors in ties. Different known material-type sets never merge. The existing packer decides physical fit using the selected bed, exclusions, 5 mm margins/clearance and optional 90° rotation; dimensions are never scaled. Under plate-cap pressure, the least costly legal neighboring merge is attempted. If normal packing meets every known slot/material constraint and has a better estimate, it is retained.

This is a deterministic heuristic, not a global optimum. **It may use more plates to reduce color changes.** Slot limits are per plate; the multi-plate project can contain a larger total palette, requiring filament changes between plates. Single objects exceeding the available slots are explicitly omitted, never split or recolored. An impossible overall plate limit produces an error rather than truncating orders. Instant's existing **100 expanded objects / 26 plates per run** limits remain; the reusable analyzer/grouping code is also tested with 1,000 models.

## Results and failure handling

The result shows estimated changes and a before/after comparison only when every model is analyzable and baseline packing satisfies the constraints. The ZIP entry **`Metadata/pmm/color-optimization.json`** inside the downloaded 3MF contains settings, per-plate groups/estimates, deduplicated model layer profiles, material identifiers, fallbacks and omissions. `workflow.json` also lists omitted orders/copies.

Missing or unsupported colors do not fail generation: affected geometry is packed separately, remains downloadable, and is marked non-optimizable. Available material-type metadata still separates these fallback groups. **Unknown colors cannot have their slot count guaranteed**; that uncertainty is displayed instead of reporting a false estimate.

Render/parse failures, oversized objects and malformed solids are isolated to the affected objects. If native export discovers invalid topology, Instant excludes every copy sharing that geometry and repacks the survivors without rerendering. Partial results prominently list each omitted order/copy and cannot create a workspace copy until all requested objects are valid. If none survive, generation fails and the previous successful download remains available. Cancellation and stale-run checks still prevent publishing obsolete results.

Settings, snapshots, summaries and results use the existing authenticated Instant APIs, account export, storage limits and deletion paths. No persistent cache table or background service was added.

## Limits

- This estimates **relative grouping and color-swap reduction**, not exact swaps or G-code.
- It does not predict **purge towers, support filament, slicer painting, variable layer height, exact purge volume or exact print time**.
- Thin features, buried/overlapping surfaces, tiny overlaps at layer boundaries and the slicer's choice of sampling plane can differ from this conservative slab estimate. Color occupies a layer even if its cross-section is very small.
- Interpolated vertex colors, textures, unsupported property groups, missing colors and surface-only color assignments fall back to ordinary packing. External model-file references in 3MF are outside the existing OpenSCAD export reader. Normal self-contained OpenSCAD-generated 3MFs are supported.
- Color does not establish chemical compatibility. Separation uses available material metadata; unknown types use the selected filament. Proprietary blends or different grades may need manual review. An object's own combined materials remain an indivisible assembly.
- Material metadata informs grouping; **the selected Instant print profile remains authoritative for export**. This feature does not invent per-material temperature profiles. Choose the correct print preset for each material before slicing.
- Analysis is bounded to 2 million triangles, 100,000 layers and 256 color/material channels per model; more complex models fall back with a reason. The cache avoids repeated analysis, but hashing/reading a newly rendered file still costs time.

No AI, new runtime dependency, slicer implementation or GPL/AGPL slicer code was introduced. The implementation uses original JavaScript and existing Node crypto, Three.js, fflate and XML-reader dependencies. OpenSCAD remains the existing separate geometry-rendering process.

Format references: [3MF Core specification](https://github.com/3MFConsortium/spec_core/blob/master/3MF%20Core%20Specification.md) and [3MF Materials extension](https://github.com/3MFConsortium/spec_materials/blob/master/3MF%20Materials%20Extension.md).

## Verification

Run `npm run test:instant`. It includes:

- Matching/reversed/offset transitions, concurrent colors, disconnected volumes, different first-layer heights, transformed assemblies and non-millimeter units.
- Filament limits, material separation (also with missing colors), cache identity/eviction/account isolation and 1,000-model cache/grouping exercise.
- Corrupt XML geometry and non-closed meshes among valid objects; complete multipart native export, print settings and independent workspace records.
- Saved options, automatic regeneration, no regeneration for identical saves/reopening, cancellation, stale runs, recovery and partial-result conversion guards.
- Real OpenSCAD rendering with opposing color patterns: the fixture reduces the estimate from **11 to 2** using two plates. A spatially constrained synthetic fixture reduces **20 to 2 across the same two plates**. These are fixture results, not promised savings for every batch.

Existing export, 3MF structure and Bambu profile tests also cover unchanged packing/export behavior.

## Instant color-change budget

The maximum is a nonnegative whole number across the entire Instant batch, including every resulting plate. Missing limits retain the existing minimum mode. Instant shares `packColorBudget` with the workspace; candidate arrangements reuse rendered geometry and cached merge calculations. Changing filament slots or turning optimization off preserves the chosen limit. Cancel/Escape/outside dismissal discard draft settings, and no optimization runs on keystrokes.

Saved configuration, run snapshots, generated workspace copies and export recipes retain the limit. Instant saves settings when Apply is pressed, following its existing regeneration workflow. If no qualifying arrangement is found, or an estimate/model cannot be analyzed, the run fails and the previous successful download remains available. Budget mode never satisfies the limit by silently dropping invalid or oversized orders; minimum mode keeps its existing partial-result behavior. Use Instant's existing Cancel and Try again controls for generation. Undo keyboard shortcuts belong to the workspace editor.

The result reports approximate changes and the applied limit. This is a bounded heuristic, not a global optimum or a guarantee of actual slicer tool changes. Tests cover the 36-to-48-change plate tradeoff, exact/zero/unattainable limits, unknown/invalid solids, render reuse, saved settings, copies and retained downloads after failure.

## Workspace color-change budget

**Reduce color changes** beside **Use Bambu defaults** opens a compact settings dialog. The adjacent gear reopens it. **Minimize color changes** retains the existing algorithm. **Maximum changes** accepts a nonnegative whole number: 50 allows at most 50 estimated changes summed across every resulting workspace plate. **Apply & arrange** closes the dialog immediately, returns focus to the workspace and performs the work; typing does not render or optimize. Before applying, Cancel, Escape and clicking outside discard pending edits. Progress and failures appear in the workspace status.

Budget planning starts with color-efficient groups. Within the existing 24-neighbor search bound, it repeatedly chooses a compatible merge with the lowest additional change cost, provided the global total stays within the budget. Non-increasing merges can also bring an initially excessive total toward the limit. A compact baseline is considered only if it respects slots, materials and layer grids. Budget mode also tries up to five alternative packing passes using longest/shortest-side ordering and the opposite preferred rotation. It stops when a valid candidate reaches the area/slot/compatibility lower bound. Winning placements are retained exactly rather than repacked with the original ordering. These lightweight trials reuse analyzed geometry. Candidates are ranked by fewer plates, then fewer estimated changes, with deterministic ordering. Different layer-height groups share one workspace allowance while remaining on separate plates. Printer boundaries, exclusions, multipart objects and the 26-plate cap still apply.

This is the best arrangement found by a bounded heuristic, not a guaranteed global optimum. Counts are pre-slice estimates and cannot guarantee the slicer's actual tool-change count. The applied status reports approximately how many changes and how many plates were found. Unknown estimates or an unattainable limit leave positions and saved settings unchanged; unknown colors retain the existing fallback only in minimum mode.

`public/color-optimization.js` validates optional `maxColorChanges` and implements `packColorBudget`. `public/workspace-color-optimization.js` analyzes geometry once before planning and converts the selected packing to editor transforms. Candidate merges cache fit/scoring calculations within the operation and never call OpenSCAD. Full-quality solids are obtained once per distinct render request before planning. `public/color-budget-ui.js` owns draft settings and cancellation; `public/app.js` commits the arrangement and settings together after checking cancellation and the current workspace, print profile and plate scope.

The optional field lives in the existing workspace `colorOptimization` object. Missing values retain minimum mode without a database migration or new endpoint. Save/reopen and one-step undo/redo restore settings and positions together. **Ctrl + Enter / Return** undoes the latest color arrangement and unchecks **Reduce color changes**, including when a previous arrangement was enabled. Undo any newer manual edits first with Shift + Enter. Ctrl + R can redo the arrangement. Moving objects or assigning another plate disables automatic color arrangement; unchecking keeps current positions. Exports use the visible arrangement without another optimization pass, including selected-plate exports and recorded replay. Workspace Auto Position remains unchanged.

Run `npm run test:color-budget` for budget fixtures, failure preservation, UI draft/cancellation, stale operations and history. The 36-change fixture retains two plates with a limit of 36 and chooses one at 48 changes with a limit of 48 or 50. Tests also cover zero, invalid limits, shared layer-grid budgets, unavailable estimates and geometry/material/slot constraints. The separate 1,000-object planner benchmark uses no renderer and reports time and packing-call count (about 3.5 seconds and 9 packing calls on the development machine). `npm run test:instant`, `npm run test:export-history` and `node tests/test-auth.mjs` cover existing generation, color export, replay and saved workspace behavior.

A maximum such as 10,000 relaxes color-change cost; it cannot override the bed dimensions, 5 mm separation, excluded regions, filament-slot capacity, material separation or incompatible layer grids. The rotation regression fits six objects on one P1S plate where the original first-fit order needed two. The bounded search may still miss a feasible packing.
