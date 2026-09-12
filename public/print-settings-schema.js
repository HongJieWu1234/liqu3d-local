export const SUPPORTED_NOZZLES = [0.2, 0.4, 0.6, 0.8];

export const PRINTERS = {
  a1mini: { label: 'Bambu Lab A1 mini', shortLabel: 'A1 mini', width: 180, depth: 180, nozzle: 0.4, excludedAreas: [] },
  a1: { label: 'Bambu Lab A1', shortLabel: 'A1', width: 256, depth: 256, nozzle: 0.4, excludedAreas: [] },
  a2l: { label: 'Bambu Lab A2L', shortLabel: 'A2L', width: 330, depth: 320, nozzle: 0.4, excludedAreas: [] },
  p1p: { label: 'Bambu Lab P1P', shortLabel: 'P1P', width: 256, depth: 256, nozzle: 0.4, excludedAreas: [{ x1: 0, y1: 0, x2: 18, y2: 28, label: 'Front-left no-print area' }] },
  p1s: { label: 'Bambu Lab P1S', shortLabel: 'P1S', width: 256, depth: 256, nozzle: 0.4, excludedAreas: [{ x1: 0, y1: 0, x2: 18, y2: 28, label: 'Front-left no-print area' }] },
  p2s: { label: 'Bambu Lab P2S', shortLabel: 'P2S', width: 256, depth: 256, nozzle: 0.4, excludedAreas: [] },
  x1: { label: 'Bambu Lab X1', shortLabel: 'X1', width: 256, depth: 256, nozzle: 0.4, excludedAreas: [{ x1: 0, y1: 0, x2: 18, y2: 28, label: 'Front-left no-print area' }] },
  x1c: { label: 'Bambu Lab X1 Carbon', shortLabel: 'X1C', width: 256, depth: 256, nozzle: 0.4, excludedAreas: [{ x1: 0, y1: 0, x2: 18, y2: 28, label: 'Front-left no-print area' }] },
  x1e: { label: 'Bambu Lab X1E', shortLabel: 'X1E', width: 256, depth: 256, nozzle: 0.4, excludedAreas: [{ x1: 0, y1: 0, x2: 18, y2: 28, label: 'Front-left no-print area' }] },
  h2s: { label: 'Bambu Lab H2S', shortLabel: 'H2S', width: 340, depth: 320, nozzle: 0.4, excludedAreas: [] },
  h2d: { label: 'Bambu Lab H2D', shortLabel: 'H2D', width: 350, depth: 320, nozzle: 0.4, excludedAreas: [], nozzleLimitedAreas: [{ x1: 0, y1: 0, x2: 25, y2: 320, label: 'Right nozzle cannot reach this strip' }, { x1: 325, y1: 0, x2: 350, y2: 320, label: 'Left nozzle cannot reach this strip' }] },
  h2dpro: { label: 'Bambu Lab H2D Pro', shortLabel: 'H2D Pro', width: 350, depth: 320, nozzle: 0.4, excludedAreas: [], nozzleLimitedAreas: [{ x1: 0, y1: 0, x2: 25, y2: 320, label: 'Right nozzle cannot reach this strip' }, { x1: 325, y1: 0, x2: 350, y2: 320, label: 'Left nozzle cannot reach this strip' }] },
  h2c: { label: 'Bambu Lab H2C', shortLabel: 'H2C', width: 330, depth: 320, nozzle: 0.4, excludedAreas: [], nozzleLimitedAreas: [{ x1: 0, y1: 0, x2: 25, y2: 320, label: 'Auxiliary nozzles cannot reach this strip' }, { x1: 305, y1: 0, x2: 330, y2: 320, label: 'Left nozzle cannot reach this strip' }] },
  x2d: { label: 'Bambu Lab X2D', shortLabel: 'X2D', width: 256, depth: 256, nozzle: 0.4, excludedAreas: [], nozzleLimitedAreas: [{ x1: 0, y1: 0, x2: 20.5, y2: 256, label: 'Auxiliary nozzle cannot reach this strip' }] }
};

const number = (key, label, value, min, max, step, unit = '', extra = {}) => ({ key, label, type: 'number', default: value, min, max, step, unit, ...extra });
const percent = (key, label, value, extra = {}) => ({ key, label, type: 'percent', default: value, min: 0, max: 100, step: 1, unit: '%', ...extra });
const boolean = (key, label, value = false, extra = {}) => ({ key, label, type: 'boolean', default: value, ...extra });
const select = (key, label, value, options, extra = {}) => ({ key, label, type: 'select', default: value, options, ...extra });

// Keys intentionally match Bambu Studio's project/process/filament config names.
// The grouping follows the current Process tabs: Quality, Strength, Speed, Support, Others.
export const PRINT_SETTINGS_GROUPS = [
  {
    id: 'quality', label: 'Quality', scope: 'process', sections: [
      { label: 'Layer height', settings: [
        number('layer_height', 'Layer height', 0.2, 0.04, 0.6, 0.01, 'mm'),
        number('initial_layer_print_height', 'First layer height', 0.2, 0.05, 0.6, 0.01, 'mm')
      ]},
      { label: 'Line width', settings: [
        number('line_width', 'Default', 0.42, 0.15, 1.6, 0.01, 'mm'),
        number('initial_layer_line_width', 'First layer', 0.5, 0.15, 1.6, 0.01, 'mm'),
        number('outer_wall_line_width', 'Outer wall', 0.42, 0.15, 1.6, 0.01, 'mm'),
        number('inner_wall_line_width', 'Inner wall', 0.45, 0.15, 1.6, 0.01, 'mm'),
        number('top_surface_line_width', 'Top surface', 0.42, 0.15, 1.6, 0.01, 'mm')
      ]},
      { label: 'Walls and precision', settings: [
        select('wall_generator', 'Wall generator', 'arachne', ['arachne', 'classic']),
        boolean('detect_thin_wall', 'Detect thin wall', false),
        number('resolution', 'Resolution', 0.012, 0.001, 1, 0.001, 'mm'),
        number('xy_hole_compensation', 'X-Y hole compensation', 0, -2, 2, 0.01, 'mm'),
        number('xy_contour_compensation', 'X-Y contour compensation', 0, -2, 2, 0.01, 'mm'),
        number('elefant_foot_compensation', 'Elephant foot compensation', 0.15, 0, 2, 0.01, 'mm')
      ]}
    ]
  },
  {
    id: 'strength', label: 'Strength', scope: 'process', sections: [
      { label: 'Walls', settings: [
        number('wall_loops', 'Wall loops', 3, 1, 20, 1),
        select('wall_infill_order', 'Wall sequence', 'inner wall/outer wall/infill', ['inner wall/outer wall/infill', 'outer wall/inner wall/infill', 'infill/inner wall/outer wall'])
      ]},
      { label: 'Top/bottom shells', settings: [
        select('top_surface_pattern', 'Top surface pattern', 'monotonic', ['monotonic', 'monotonicline', 'zig-zag', 'alignedrectilinear', 'concentric']),
        number('top_shell_layers', 'Top shell layers', 5, 0, 30, 1),
        number('top_shell_thickness', 'Top shell thickness', 0.8, 0, 10, 0.05, 'mm'),
        number('bottom_shell_layers', 'Bottom shell layers', 4, 0, 30, 1),
        number('bottom_shell_thickness', 'Bottom shell thickness', 0, 0, 10, 0.05, 'mm'),
        select('internal_solid_infill_pattern', 'Internal solid infill pattern', 'zig-zag', ['zig-zag', 'monotonic', 'monotonicline', 'alignedrectilinear', 'concentric'])
      ]},
      { label: 'Sparse infill', settings: [
        percent('sparse_infill_density', 'Sparse infill density', 15),
        select('sparse_infill_pattern', 'Sparse infill pattern', 'gyroid', ['grid', 'line', 'gyroid', 'cubic', 'honeycomb', 'adaptivecubic', 'supportcubic'])
      ]}
    ]
  },
  {
    id: 'speed', label: 'Speed', scope: 'process', sections: [
      { label: 'First layer speed', settings: [
        number('initial_layer_speed', 'First layer', 50, 5, 500, 1, 'mm/s'),
        number('initial_layer_infill_speed', 'First layer infill', 105, 5, 500, 1, 'mm/s')
      ]},
      { label: 'Other layers speed', settings: [
        number('outer_wall_speed', 'Outer wall', 200, 5, 500, 1, 'mm/s'),
        number('inner_wall_speed', 'Inner wall', 300, 5, 500, 1, 'mm/s'),
        number('sparse_infill_speed', 'Sparse infill', 270, 5, 500, 1, 'mm/s'),
        number('internal_solid_infill_speed', 'Internal solid infill', 250, 5, 500, 1, 'mm/s'),
        number('top_surface_speed', 'Top surface', 200, 5, 500, 1, 'mm/s'),
        number('bridge_speed', 'Bridge', 50, 5, 300, 1, 'mm/s'),
        number('travel_speed', 'Travel', 500, 10, 1000, 1, 'mm/s')
      ]},
      { label: 'Acceleration', settings: [
        number('default_acceleration', 'Normal printing', 10000, 100, 30000, 100, 'mm/s²'),
        number('outer_wall_acceleration', 'Outer wall', 5000, 100, 30000, 100, 'mm/s²'),
        number('initial_layer_acceleration', 'First layer', 500, 100, 10000, 100, 'mm/s²')
      ]}
    ]
  },
  {
    id: 'support', label: 'Support', scope: 'process', sections: [
      { label: 'Support', settings: [
        boolean('enable_support', 'Enable support', false),
        select('support_type', 'Type', 'normal(auto)', ['normal(auto)', 'normal(manual)', 'tree(auto)', 'tree(manual)']),
        select('support_style', 'Style', 'default', ['default', 'snug', 'grid', 'organic']),
        number('support_threshold_angle', 'Threshold angle', 30, 0, 90, 1, '°'),
        boolean('support_on_build_plate_only', 'On build plate only', false),
        boolean('remove_small_overhang', 'Remove small overhangs', true)
      ]},
      { label: 'Raft', settings: [ number('raft_layers', 'Raft layers', 0, 0, 10, 1) ]},
      { label: 'Advanced support', settings: [
        number('support_top_z_distance', 'Top Z distance', 0.2, 0, 2, 0.01, 'mm'),
        number('support_bottom_z_distance', 'Bottom Z distance', 0.2, 0, 2, 0.01, 'mm'),
        number('support_interface_top_layers', 'Top interface layers', 2, 0, 10, 1),
        select('support_interface_pattern', 'Interface pattern', 'auto', ['auto', 'rectilinear', 'concentric']),
        number('support_speed', 'Support speed', 150, 5, 500, 1, 'mm/s'),
        number('support_interface_speed', 'Support interface speed', 80, 5, 500, 1, 'mm/s')
      ]}
    ]
  },
  {
    id: 'others', label: 'Others', scope: 'process', sections: [
      { label: 'Bed adhesion', settings: [
        select('brim_type', 'Brim type', 'auto_brim', ['auto_brim', 'outer_only', 'inner_only', 'outer_and_inner', 'no_brim']),
        number('brim_width', 'Brim width', 5, 0, 30, 0.1, 'mm'),
        number('skirt_loops', 'Skirt loops', 0, 0, 20, 1)
      ]},
      { label: 'Seam', settings: [ select('seam_position', 'Seam position', 'aligned', ['aligned', 'back', 'nearest', 'random']) ]},
      { label: 'Ironing', settings: [
        select('ironing_type', 'Ironing type', 'no ironing', ['no ironing', 'top', 'topmost', 'all solid layer']),
        percent('ironing_flow', 'Ironing flow', 10),
        number('ironing_spacing', 'Ironing spacing', 0.15, 0.05, 1, 0.01, 'mm'),
        number('ironing_speed', 'Ironing speed', 30, 5, 200, 1, 'mm/s')
      ]},
      { label: 'Prime tower', settings: [
        boolean('enable_prime_tower', 'Enable prime tower', true),
        number('prime_tower_width', 'Prime tower width', 35, 10, 100, 1, 'mm'),
        number('filament_prime_volume', 'Priming volume per change', 45, 1, 500, 1, 'mm³'),
        number('prime_tower_brim_width', 'Tower brim width', 3, -1, 30, 0.1, 'mm · -1 auto'),
        boolean('prime_tower_rib_wall', 'Rib walls', true),
        boolean('wipe_tower_no_sparse_layers', 'Skip layers without a color change', false)
      ].map(item=>({...item,globalOnly:true}))}
    ]
  },
  {
    id: 'filament', label: 'Filament', scope: 'filament', sections: [
      { label: 'Filament', settings: [
        select('filament_type', 'Filament type', 'PLA', ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'PC', 'PA', 'PVA', 'BVOH']),
        number('filament_flow_ratio', 'Flow ratio', 1, 0.5, 1.5, 0.001),
        number('filament_max_volumetric_speed', 'Max volumetric speed', 12, 1, 60, 0.1, 'mm³/s')
      ]},
      { label: 'Nozzle temperature', settings: [
        number('nozzle_temperature', 'Other layers', 220, 150, 350, 1, '°C'),
        number('nozzle_temperature_initial_layer', 'Initial layer', 220, 150, 350, 1, '°C')
      ]},
      { label: 'Build plate temperature', settings: [
        number('textured_plate_temp_initial_layer', 'Textured PEI · initial layer', 60, 0, 150, 1, '°C'),
        number('textured_plate_temp', 'Textured PEI · other layers', 60, 0, 150, 1, '°C'),
        number('hot_plate_temp_initial_layer', 'Smooth PEI / High Temp · initial layer', 60, 0, 150, 1, '°C'),
        number('hot_plate_temp', 'Smooth PEI / High Temp · other layers', 60, 0, 150, 1, '°C'),
        number('cool_plate_temp_initial_layer', 'Cool Plate · initial layer', 35, 0, 150, 1, '°C'),
        number('cool_plate_temp', 'Cool Plate · other layers', 35, 0, 150, 1, '°C'),
        number('eng_plate_temp_initial_layer', 'Engineering Plate · initial layer', 60, 0, 150, 1, '°C'),
        number('eng_plate_temp', 'Engineering Plate · other layers', 60, 0, 150, 1, '°C')
      ]},
      { label: 'Cooling', settings: [
        percent('fan_min_speed', 'Min fan speed', 100),
        percent('fan_max_speed', 'Max fan speed', 100)
      ]}
    ]
  }
];

for (const group of PRINT_SETTINGS_GROUPS) {
  group.settings = group.sections.flatMap((section) => section.settings);
}

const LEGACY_SETTINGS = {
  first_layer_height: 'initial_layer_print_height',
  wall_count: 'wall_loops',
  top_layers: 'top_shell_layers',
  bottom_layers: 'bottom_shell_layers',
  infill_density: 'sparse_infill_density',
  infill_pattern: 'sparse_infill_pattern',
  first_layer_speed: 'initial_layer_speed',
  support_enabled: 'enable_support',
  support_angle: 'support_threshold_angle',
  support_gap: 'support_top_z_distance',
  flow_ratio: 'filament_flow_ratio',
  fan_speed: 'fan_max_speed'
};

export function migratePrintSettings(settings = {}) {
  const result = { ...(settings || {}) };
  for (const [oldKey, newKey] of Object.entries(LEGACY_SETTINGS)) {
    if (result[newKey] === undefined && result[oldKey] !== undefined) result[newKey] = result[oldKey];
  }
  if (result.sparse_infill_pattern === 'lines') result.sparse_infill_pattern = 'line';
  if (result.top_surface_pattern === 'rectilinear') result.top_surface_pattern = 'zig-zag';
  if (result.internal_solid_infill_pattern === 'rectilinear') result.internal_solid_infill_pattern = 'zig-zag';
  if (result.support_style === 'tree' && !result.support_type) result.support_type = 'tree(auto)';
  if (result.adhesion_type && !result.brim_type) result.brim_type = result.adhesion_type === 'brim' ? 'outer_only' : 'no_brim';
  if (result.print_speed !== undefined) {
    for (const key of ['outer_wall_speed', 'inner_wall_speed', 'sparse_infill_speed', 'internal_solid_infill_speed']) if (result[key] === undefined) result[key] = result.print_speed;
  }
  if (result.fan_min_speed === undefined && result.fan_speed !== undefined) result.fan_min_speed = result.fan_speed;
  if (result.nozzle_temperature_initial_layer === undefined && result.nozzle_temperature !== undefined) result.nozzle_temperature_initial_layer = result.nozzle_temperature;
  if (result.bed_temperature !== undefined) {
    for (const key of ['textured_plate_temp_initial_layer','textured_plate_temp','hot_plate_temp_initial_layer','hot_plate_temp','cool_plate_temp_initial_layer','cool_plate_temp','eng_plate_temp_initial_layer','eng_plate_temp']) {
      if (result[key] === undefined) result[key] = result.bed_temperature;
    }
  }
  for(const key of ['enable_prime_tower','prime_tower_rib_wall','wipe_tower_no_sparse_layers'])if(result[key]!==undefined) {
    const value=Array.isArray(result[key])?result[key][0]:result[key];
    result[key]=[true,1,'1','true'].includes(value);
  }
  return result;
}

export function createDefaultProfile() {
  const settings = {};
  for (const group of PRINT_SETTINGS_GROUPS) for (const item of group.settings) settings[item.key] = item.default;
  return {
    version: 6,
    name: 'My Print Profile',
    printer: 'p1s',
    nozzleDiameter: 0.4,
    bedType: 'Textured PEI',
    filamentColor: '#ffffff',
    settings,
    advanced: {}
  };
}
