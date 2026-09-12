import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { DOMParser } from '@xmldom/xmldom';
import { BoxGeometry } from '../public/vendor/three/three.module.js';
import { packCore3mf } from '../public/core-3mf.js';
import { readSolid3mf } from '../public/solid-3mf.js';
import { unzipSync, strFromU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
import { createDefaultProfile } from '../public/print-settings-schema.js';

const parse = (xml) => new DOMParser().parseFromString(xml, 'application/xml');
const installedProfiles = process.env.PMM_BAMBU_PROFILES_DIR;
const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-bambu-presets-'));
try {
  for (const kind of ['machine', 'process', 'filament']) await fs.mkdir(path.join(fixtureRoot, kind), { recursive: true });
  await fs.mkdir(path.join(fixtureRoot, 'filament', 'nested', 'P1P'), { recursive: true });
  const processName = '0.20 Standard @PMM fixture';
  await fs.writeFile(path.join(fixtureRoot, 'process', `${processName}.json`), JSON.stringify({
    type: 'process', name: processName,
    layer_height: '0.2', initial_layer_print_height: '0.2', line_width: '0.42', wall_loops: '3',
    top_shell_layers: '5', bottom_shell_layers: '4', travel_speed: '200', initial_layer_speed: '30',
    outer_wall_speed: '100', inner_wall_speed: '100', sparse_infill_speed: '100', internal_solid_infill_speed: '100',
    sparse_infill_density: '15%', sparse_infill_pattern: 'gyroid', enable_support: '0', support_type: 'normal(auto)',
    support_threshold_angle: '45', support_top_z_distance: '0.2', brim_type: 'outer_only', brim_width: '5',
    skirt_loops: '0', raft_layers: '0'
  }, null, 2));

  const machineNames = [
    ['Bambu Lab P1S 0.4 nozzle', ['0.4']],
    ['Bambu Lab P1S 0.6 nozzle', ['0.6']],
    ['Bambu Lab H2D 0.4 nozzle', ['0.4', '0.4']]
  ];
  for (const [name, nozzle] of machineNames) {
    await fs.writeFile(path.join(fixtureRoot, 'machine', `${name}.json`), JSON.stringify({
      type: 'machine', name, default_print_profile: processName, nozzle_diameter: nozzle,
      printer_model: name.includes('H2D') ? 'H2D' : 'P1S', printer_variant: `${nozzle[0]} mm`,
      machine_start_gcode: 'G28\n' + 'G1 X0 Y0\n'.repeat(200),
      change_filament_gcode: 'M400\n' + 'G1 E-1\n'.repeat(200),
      extruder_variant_list: nozzle.map(() => 'Direct Drive Standard')
    }, null, 2));
  }

  await fs.writeFile(path.join(fixtureRoot, 'filament', 'nested', 'P1P', 'Generic PLA.json'), JSON.stringify({
    type: 'filament', name: 'Generic PLA', instantiation: 'true', filament_id: 'GFL99',
    compatible_printers: machineNames.map(([name]) => name),
    filament_type: ['PLA'], nozzle_temperature: ['220'], nozzle_temperature_initial_layer: ['220'],
    hot_plate_temp: ['60'], hot_plate_temp_initial_layer: ['60'], textured_plate_temp: ['60'], textured_plate_temp_initial_layer: ['60'],
    cool_plate_temp: ['35'], cool_plate_temp_initial_layer: ['35'], eng_plate_temp: ['55'], eng_plate_temp_initial_layer: ['55'],
    filament_flow_ratio: ['1'], fan_min_speed: ['100'], fan_max_speed: ['100']
  }, null, 2));

  process.env.PMM_BAMBU_PROFILES_DIR = fixtureRoot;
  const { bambuExportProfile } = await import(`../lib/bambu-export-profile.mjs?fixture=${Date.now()}`);

  const base = createDefaultProfile();
  assert.equal(base.version, 6);
  const template = await bambuExportProfile({ ...base, advanced: { seam_position: 'back', machine_start_gcode: 'M112', printer_model:'Wrong printer', curr_bed_type:'Wrong plate', printable_area:['0x0','1x1'] } });
  await assert.rejects(() => bambuExportProfile({ ...base, settings: { nozzle_temperature: Number.NaN } }), /Invalid/);
  assert.ok(template.config.machine_start_gcode.length > 1000, 'Resolve vendor startup code from the machine preset');
  assert.ok(template.config.change_filament_gcode.length > 1000);
  assert.equal(template.config.seam_position, 'back', 'Safe advanced settings must reach the exported project');
  assert.doesNotMatch(template.config.machine_start_gcode, /M112/, 'Advanced settings must not override raw G-code');
  assert.equal(template.config.curr_bed_type, 'Textured PEI Plate');
  assert.equal(template.config.printer_model,'P1S','selected machine identity cannot be replaced by Advanced JSON');
  assert.notDeepEqual(template.config.printable_area,['0x0','1x1']);
  assert.equal(template.nozzleDiameters[0], 0.4);
  const six = await bambuExportProfile({ ...base, nozzleDiameter: 0.6 });
  assert.deepEqual(six.nozzleDiameters, [0.6]);
  const dual = await bambuExportProfile({ ...base, printer: 'h2d', nozzleDiameter: 0.4 });
  assert.equal(dual.config.printer_model,'H2D');
  assert.equal(dual.config.printer_settings_id,'Bambu Lab H2D 0.4 nozzle');
  assert.equal(dual.hotendCount, 2, 'Dual-hotend machine presets must no longer be rejected');
  const changed = await bambuExportProfile({ ...base, settings: {
    ...base.settings, layer_height: 0.28, wall_loops: 7, sparse_infill_density: 37, enable_support: true, nozzle_temperature: 231
  } });
  assert.equal(changed.config.layer_height, '0.28');
  assert.equal(changed.config.wall_loops, '7');
  assert.equal(changed.config.sparse_infill_density, '37%');
  assert.equal(changed.config.enable_support, '1');
  assert.deepEqual(changed.filament.nozzle_temperature, ['231']);
  assert.equal(changed.config.print_settings_id, 'My Print Profile · 0.28mm');
  await assert.rejects(() => bambuExportProfile({ ...base, settings: { ...base.settings, layer_height: 0.4 } }), /0\.08–0\.28 mm/);
  const thickLayer = await bambuExportProfile({ ...base, nozzleDiameter: 0.6, settings: { ...base.settings, layer_height: 0.4 } });
  assert.equal(thickLayer.config.layer_height, '0.4');
  assert.equal(thickLayer.config.print_settings_id, 'My Print Profile · 0.40mm');

  const model = { title: 'Colour test', palette: ['#FF00FF', '#020202', '#F4F4EA', '#0A1E59'], bambuTemplate: template,
    objects: [{ name: 'Three-colour object', settings: { layer_height: '0.28', wall_loops: '9' }, parts: [1, 2, 3].map((materialIndex, index) => ({
      name: `Layer ${index}`, materialIndex, geometry: new BoxGeometry(20, 10, 1).translate(128, 128, index + 0.5)
    })) }] };
  const painted = packCore3mf({ ...model, objects: [{ parts: [{ geometry: new BoxGeometry(10, 10, 1), materialIndex: 1, materialIndices: Uint32Array.from({ length: 12 }, (_, i) => i % 3 + 1) }] }] });
  const paintedXml = strFromU8(unzipSync(painted)['3D/3dmodel.model']);
  assert.match(paintedXml, /paint_color="8"/);
  assert.match(paintedXml, /paint_color="0C"/);
  const archive = packCore3mf({ ...model, attachments: { 'workflow.json': '{"version":1}', 'README.txt': 'single plate metadata' } });
  const files = unzipSync(archive);
  assert.equal(strFromU8(files['Metadata/pmm/workflow.json']), '{"version":1}', 'Single-plate 3MF must retain workflow metadata');
  assert.equal(strFromU8(files['Metadata/pmm/README.txt']), 'single plate metadata');
  const config = JSON.parse(strFromU8(files['Metadata/project_settings.config']));
  assert.deepEqual(config.filament_colour, ['#020202', '#F4F4EA', '#0A1E59']);
  assert.deepEqual(config.filament_type, ['PLA', 'PLA', 'PLA']);
  assert.equal(config.filament_settings_id.length, 3);
  assert.equal(config.filament_extruder_variant.length, 3);
  assert.deepEqual(config.filament_self_index, ['1', '2', '3']);
  assert.equal(config.flush_volumes_matrix.length, 9);
  assert.equal(config.nozzle_diameter.length, 1, 'Three colours do not mean three hotends');
  assert.equal(config.layer_height, '0.2');
  assert.equal(config.enable_prime_tower, '1');
  const towerOffTemplate=await bambuExportProfile({...base,settings:{...base.settings,enable_prime_tower:false,filament_prime_volume:90,wipe_tower_no_sparse_layers:true}});
  const towerOffFiles=unzipSync(packCore3mf({...model,bambuTemplate:towerOffTemplate}));
  const towerOffConfig=JSON.parse(strFromU8(towerOffFiles['Metadata/project_settings.config']));
  assert.equal(towerOffConfig.enable_prime_tower,'0','Tower toggle reaches the actual exported project');
  assert.equal(towerOffConfig.wipe_tower_no_sparse_layers,'1');
  assert.deepEqual(towerOffConfig.filament_prime_volume,['90','90','90'],'Exported filament uses the chosen priming volume');
  assert.deepEqual(towerOffTemplate.primeTowerSettings.filament_prime_volume,[90]);
  assert.equal(towerOffFiles['Metadata/pmm/prime-towers.json'],undefined);
  const metadata = parse(strFromU8(files['Metadata/model_settings.config']));
  assert.match(strFromU8(files['Metadata/model_settings.config']), /key="layer_height" value="0\.28"/);
  assert.match(strFromU8(files['Metadata/model_settings.config']), /key="wall_loops" value="9"/);
  const assignments = Array.from(metadata.getElementsByTagName('part')).map((part) => Array.from(part.getElementsByTagName('metadata')).find((m) => m.getAttribute('key') === 'extruder').getAttribute('value'));
  assert.deepEqual(new Set(assignments), new Set(['1', '2', '3']));
  assert.equal(readSolid3mf(archive, parse).length, model.objects.reduce((sum, o) => sum + o.parts.length, 0));

  process.env.PMM_BAMBU_PROFILES_DIR = path.join(fixtureRoot, 'not-installed');
  const { bambuExportProfile: fallbackExportProfile } = await import(`../lib/bambu-export-profile.mjs?fallback=${Date.now()}`);
  await assert.rejects(() => fallbackExportProfile(base), /ENOENT|no such file|preset/i, 'Never emit a model-only 3MF that silently drops print settings');

  const directory = path.join(fixtureRoot, 'output');
  await fs.mkdir(directory);
  const input = path.join(directory, 'colour-project.3mf');
  await fs.writeFile(input, archive);
  if (process.env.PMM_VALIDATE_SLICER) {
    // Synthetic presets above isolate mapping tests but are not complete native
    // printer profiles. Studio can crash while loading them. Validate colors
    // with the same installed vendor profiles used by real exports.
    if(installedProfiles)process.env.PMM_BAMBU_PROFILES_DIR=installedProfiles;
    else delete process.env.PMM_BAMBU_PROFILES_DIR;
    const {bambuExportProfile:nativeProfile}=await import(`../lib/bambu-export-profile.mjs?native=${Date.now()}`);
    await fs.writeFile(input,packCore3mf({...model,bambuTemplate:await nativeProfile(base)}));
    const output = path.join(directory, 'bambu-roundtrip.3mf');
    const { stdout, stderr } = await promisify(execFile)(process.env.PMM_VALIDATE_SLICER, ['--datadir', path.join(directory, 'profile'), '--arrange', '0', '--orient', '0', '--export-3mf', output, input], { cwd: directory, maxBuffer: 8 * 1024 * 1024,timeout:30000 });
    assert.doesNotMatch(stdout+stderr, /invalid config|invalid parameter|no filament colors found/i);
    const roundtrip = unzipSync(await fs.readFile(output));
    const actualConfig = JSON.parse(strFromU8(roundtrip['Metadata/project_settings.config']));
    assert.deepEqual(actualConfig.filament_colour, config.filament_colour);
  }
} finally {
  await fs.rm(fixtureRoot, { recursive: true, force: true });
}
console.log('Bambu project tests passed: global/object print settings, guarded preset failures, nozzle selection, presets, and colours.');
