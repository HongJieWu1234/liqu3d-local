import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { BoxGeometry } from '../public/vendor/three/three.module.js';
import { packCore3mf } from '../public/core-3mf.js';
import { unzipSync, strFromU8 } from '../public/vendor/three/addons/libs/fflate.module.js';
import { createDefaultProfile } from '../public/print-settings-schema.js';

const base = createDefaultProfile();
assert.equal(base.settings.internal_solid_infill_pattern, 'zig-zag');

const fixture = await fs.mkdtemp(path.join(os.tmpdir(), 'pmm-v560-bambu-'));
try {
  for (const kind of ['machine', 'process', 'filament']) await fs.mkdir(path.join(fixture, kind), { recursive: true });
  const machineName = 'Bambu Lab P1S 0.4 nozzle';
  const processName = '0.20mm Standard @PMM v560';
  await fs.writeFile(path.join(fixture, 'machine', `${machineName}.json`), JSON.stringify({
    type: 'machine', name: machineName, default_print_profile: processName, nozzle_diameter: ['0.4'], extruder_variant_list: ['Direct Drive Standard']
  }));
  await fs.writeFile(path.join(fixture, 'process', `${processName}.json`), JSON.stringify({ type: 'process', name: processName }));
  await fs.writeFile(path.join(fixture, 'filament', 'Generic PLA.json'), JSON.stringify({
    type: 'filament', name: 'Generic PLA', instantiation: 'true', filament_id: 'GFL99', compatible_printers: [machineName], filament_type: ['PLA']
  }));
  process.env.PMM_BAMBU_PROFILES_DIR = fixture;
  const { bambuExportProfile } = await import(`../lib/bambu-export-profile.mjs?v560=${Date.now()}`);
  const migrated = await bambuExportProfile({
    ...base,
    settings: { ...base.settings, internal_solid_infill_pattern: 'rectilinear', top_surface_pattern: 'rectilinear' }
  });
  assert.equal(migrated.config.internal_solid_infill_pattern, 'zig-zag', 'old saved internal rectilinear must export as current Bambu zig-zag');
  assert.equal(migrated.config.top_surface_pattern, 'zig-zag', 'old saved top rectilinear must export as current Bambu zig-zag');

  const template = {
    config: { printer_settings_id: machineName, print_settings_id: processName, nozzle_diameter: ['0.4'], layer_height: '0.2' },
    filament: { filament_type: ['PLA'], filament_flow_ratio: ['1'], nozzle_temperature: ['220'], nozzle_temperature_initial_layer: ['220'], textured_plate_temp: ['60'], textured_plate_temp_initial_layer: ['60'] },
    filamentName: 'Generic PLA', filamentId: 'GFL99', hotendCount: 1, nozzleDiameters: [0.4]
  };
  const bytes = packCore3mf({
    title: 'Object override test', palette: ['#FFFFFF'], bambuTemplate: template,
    objects: [{
      name: 'Override object', settings: { wall_loops: '5', sparse_infill_density: '27%', enable_support: '1' },
      parts: [{ name: 'Body', materialIndex: 0, geometry: new BoxGeometry(10, 10, 2).translate(0, 0, 1) }]
    }]
  });
  const settings = strFromU8(unzipSync(bytes)['Metadata/model_settings.config']);
  assert.match(settings, /key="wall_loops" value="5"/);
  assert.match(settings, /key="sparse_infill_density" value="27%"/);
  assert.match(settings, /key="enable_support" value="1"/);
} finally {
  await fs.rm(fixture, { recursive: true, force: true });
}
console.log('v1 Bambu compatibility and per-object 3MF override guards passed');
