# Feature guide

[Documentation home](README.md) · [Implementation reference](FUNCTION_REFERENCE.md)

## Projects and accounts

The project library opens saved workspaces, displays generated thumbnails, and supports pinning and library organization. Workspaces contain SCAD sources and editor settings. Saving revisions allows restoration of previous workspace state; export history is a separate record of generated outputs.

Accounts provide signup/login, email verification challenges, password changes, optional email-based two-factor authentication, session inspection/revocation, appearance and workspace preferences, recent activity, storage usage, data export and deletion. Email changes require password verification and a code sent to the new address. Clearing history preserves current projects but removes the selected historical records. Temporary workspace copies expire after 24 hours.

## Parametric editor

Add SCAD files using the file control or drop them into the editor. The settings reader exposes supported global literal assignments as typed controls, with Customizer groups, descriptions and hints where recognized. Search narrows the controls. Changes regenerate a Three.js model preview; SCAD source remains the authority for computed expressions.

The parser handles strings, comments, nested literal vectors, numeric forms, include/use paths and scope boundaries. The last global assignment supplies a literal default. Module-local variables and computed expressions are not guessed into editable settings. Diagnostics identify malformed or ambiguous input. Included libraries are evaluated by OpenSCAD, not interpreted by the settings reader. Models with suitable selectors/manifests can expose individual designs and solid parts; generic models can render without those conventions.

Bundled **Baloo 2 ExtraBold** supplies the default font. Imported literal font defaults are normalized to it; expressions remain source-controlled. Custom font choices come from project font files rather than a general system-font picker. Dependency-bearing Instant projects retain their required assets when converted to workspaces.

## Objects, copies and plates

The 3D workspace supports object selection, moving and rotating, copies, plate assignment, removal, saved parameter values and variants. Advanced presents Plates, Copies, Saved values and Variants. Printer profiles define usable beds and exclusion/reach regions.

**Settings → Workspace → Auto Position** is enabled by default. After a new SCAD import finishes previewing, it arranges separate untouched designs whose footprints all overlap the SCAD origin (X=0, Y=0). It measures geometry rather than assuming zero mesh transforms mean overlapping designs. Designs with a corner at the origin are supported; adjacent footprints that merely touch remain unchanged. New imports reserve plates already occupied by moved objects or copies. It keeps color parts together, uses available plates, and leaves source code, copies and existing layouts alone. Disable it to keep imported origin layouts. This runs once per import; regeneration or undo does not trigger it again.

Hold **Shift + Enter / Return** to undo object edits; hold **Ctrl + R** to redo. History includes moves, rotations, position resets, plate assignments, removals and automatic arrangements, up to 100 steps in the current session. Each completed drag or arrangement is one step. A new recorded edit clears the redo branch. Repeats run serially, stop on release/focus loss and are disabled in text fields and dialogs; restoring removed geometry can take a render. This object history is separate from saved workspace revisions and does not replace text-field undo.

**Reduce color changes** analyzes material/color occupancy by layer and groups compatible objects while respecting plate constraints. Its settings dialog offers the existing minimum mode or a maximum estimated change count across the entire workspace, favoring fewer plates within that limit. Apply closes the dialog immediately, then commits settings and positions as one undoable edit; cancellation or an unsuccessful search keeps both unchanged. It is deterministic geometry analysis, not AI or slicer toolpath optimization. Moving an object manually disables automatic color arrangement. See the [color analysis guide](INSTANT-COLOR-OPTIMIZATION.md).

## Print settings and checking

Select a printer, nozzle, build plate, filament and named process profile. Searchable process groups expose quality, strength, speed, support and other supported settings; selected objects can carry process overrides. Filament controls open in a separate popover. Local Bambu presets can supply vendor defaults and compatible export templates. The supported profile schema, rather than arbitrary raw JSON, controls accepted settings.

Advanced process JSON accepts safe supported overrides. G-code, machine identity, hardware, filament-map and flush-matrix overrides are restricted. Local Bambu vendor profiles are imported separately and are not included in source releases.

**Plate check** reports heuristic fit, spacing, topology, overhang, first-layer and thickness/parameter risks where analysis is applicable. It is not slicing, structural simulation or proof of printability.

## Export and colors

Export opens a chooser for all populated plates or a manual plate selection. Only the chosen output plates are generated and packed. Pressing Export again clears a prior “Export stopped” overlay; a new invalid setting can still produce a new error.

Exports retain full SCAD rendering detail; previews may reduce large literal facet counts. Supported selectable colored parts render independently as closed solids, then receive explicit filament assignments in the 3MF. This avoids OpenSCAD's problematic lazy-union color path. A supplied SCAD model still needs actual color/part information to export multiple colors.

A single populated plate downloads as 3MF. Compatible local Bambu templates enable native multi-plate projects and machine/process metadata. Export paths without compatible templates can use model-only or per-plate archive fallback. Inspect physical filament/AMS assignments in the slicer; the app does not discover printer loading.

## Export history and replay

The project library's **Export history** opens a large modal listing workspace and Instant exports. Each recorded snapshot includes the original source, dependencies/fonts, resolved parameters, transforms, selected plates, object overrides, printer/nozzle/profile/template, preview and estimates. The preview is rendered from final transformed export geometry, not copied from a possibly stale workspace thumbnail. Identical recipes reuse that snapshot's original image.

**Export again** regenerates the saved recipe, including manual selection scope. Runtime and archive-content fingerprint checks stop incompatible replay. Later workspace changes do not rewrite the original recipe. Recipes made with an older incompatible color exporter require a new workspace export. Repeatability means validated content under the recorded runtime, not permission to silently substitute a different engine.

History and Instant runs do **not** retain the final downloadable 3MF. They retain the recipe and raster preview plus metadata. Separate runtime geometry caches may contain mesh payloads; those are not saved final export archives.

## Filament estimates

History displays approximate grams derived from mesh volume, a wall/shell approximation, infill, density and layer color occupancy. Color-change purge uses a saved flush matrix when available or the disclosed fallback of 280 mm³ per change. When estimated changes are greater than zero, a checked checkbox includes their estimated purge; unchecking it shows model filament only. Zero or unavailable change counts omit the checkbox. This comparison does not modify the export. Machine capacity comes from configured profile knowledge, not detected hardware.

These are pre-slice estimates. Supports, brims, towers, startup purge and calibration are excluded. A real dual-nozzle printer can still consume purge material; the zero-purge view is a hypothetical comparison, not a measured guarantee.

## Instant workflows

Instant accepts SCAD projects, ZIP packages, CSV/TXT orders, JSON data, fonts and supported model assets. It preserves relative dependency paths, suggests order-column matches, permits explicit mappings, validates typed values and resolves orders against model parameters. Saved Instant setups can be rerun, cancelled or converted to normal/temporary workspaces.

Generation shares geometry among identical inputs and runs distinct designs with bounded concurrency. Progress and per-design failures are tracked; invalid or oversized results have reasons rather than silently appearing outside the bed. Color grouping and plate packing prepare printable output, and downloads enter export history.

Uploads are quarantined and bounded: 200 files, 8 MB per file, 16 MB compressed archive and 16 MB expanded package. Unsafe paths, conflicting names, symlinks, corrupt archives and unsupported entries are rejected. C#/.cs execution and online dependency installation are not supported.

Instant also offers **Maximum changes** beside **Reduce color changes** in Print settings. Apply & generate saves a limit for the entire batch and favors fewer plates within it; failed budget runs retain the previous successful download.

## Production capabilities

The backend also implements SKU snapshots and variants, deterministic if/then rules, CSV job batches, approved-parameter customer configurators, order webhooks, calibration profiles, workspace templates, reusable SCAD components, and revision differences. Jobs have generation states such as pending, generated, failed and downloaded, with saved source/profile/runtime context.

These capabilities live in the production API and supporting UI code; not every older production panel is exposed by the current simplified Advanced interface. Consult the [function reference](FUNCTION_REFERENCE.md) before extending those flows. Automatic BOM/quoting is retired from the active product.

There is no live printer control, printer status, AMS inventory, print completion tracking, farm scheduling or AI dependency. The app prepares geometry and production metadata; a slicer and printer complete manufacturing.
