/*
Fridge Tag Customizer - Generator Template

This source template contains three fridge-tag designs. The generator expands
the design controls as needed and keeps each generated plate at five tags or
fewer.
Each design has its own name, colors, font preset, body height,
and optional counter bridge.

Recommended export workflow:
1) Edit orders.txt and run the Mac or Windows launcher.
2) Open the single arranged 3MF generated for each physical build plate.
3) Every tag is separately selectable in that file; do not use Split to Objects.
4) Keep the matching generated SCAD as the editable source and preview.
5) Per-tag render passes are temporary internals and are never user output.

Units: millimeters.
*/

/* [GLOBAL RENDER] */
render_design = "all"; // [all,design_1,design_2,design_3]
render_part = "all"; // [all,base,text,shadow,symbol_all,symbol_base,symbol_shadow,symbol_top]

// 0 automatically chooses a compact centered grid. Use 1, 2, or 3 only when
// a specific manual column count is required.
designs_per_row = 0; // [0:Auto,1:One column,2:Two columns,3:Three columns]
design_spacing_min = 68;
design_layout_gap = 10;
design_row_gap = 5;

/* [DESIGN 1] */
design1_name_text = "Jordan";
design1_font_preset = "Baloo 2:style=ExtraBold"; // font
design1_base_color_preview = "Pastel Pink"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]
design1_text_color_preview = "Baby Blue"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]
design1_shadow_color_preview = "White"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]

// 37.2 mm is exactly 124% of the previous 30 mm body height.
design1_fixed_name_body_height = 37.2; // [20:0.1:75]

// Complete visible X/Y scale for this tag. Magnet cavity dimensions and Z
// layer thicknesses remain fixed.
design1_overall_size_percent = 100; // [50:1:200]

// Visible outline margins for this tag.
design1_base_margin = 5.1; // [0:0.1:15]
design1_shadow_margin = 3; // [0:0.1:15]
design1_text_margin = 0; // [-2:0.1:5]

// Symbol colors belong to this design. Symbol Base inherits this tag's Base color.
design1_symbol_shadow_color_preview = "Pastel Pink"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]
design1_symbol_top_color_preview = "White"; // [Default,None,White,Black,Red,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]

// Inline symbol attached to the right side of this name.
design1_inline_symbol_type = "None"; // [None,Flower,Heart,Football,Soccer Ball,Baseball,Basketball,Volleyball,Hockey,Lacrosse,Pencil,Double Note,Treble Clef,Racket,Music Note]
design1_inline_symbol_scale = 1; // [0.1:0.05:3]
design1_inline_symbol_gap = 1; // [0:0.25:10]
design1_inline_symbol_shadow_clearance = 0.2; // [0:0.1:3]
design1_inline_symbol_x_adjust = 0; // [-30:0.5:30]
design1_inline_symbol_y_adjust = -1; // [-30:0.5:30]
design1_inline_symbol_rotate_z = 0; // [-180:1:180]


// Unlimited manual lower-layer repairs for this tag.
// [Layer, Shape, Limit, X, Y, Size X, Size Y, Rotation]
// Layer: Base, Shadow, Both. Shape: Rectangle, Circle. Limit: Clip, Free.
// Equal Circle sizes make a circle; unequal sizes make an ellipse.
design1_repair_parts = [
    // ["Shadow", "Rectangle", "Clip", 0, 0, 200, 80, 0],
    // ["Both", "Circle", "Free", 20, 0, 6, 10, 15]
];

// Counter Bridge Shadow Rectangle
design1_counter_bridge_enabled = false; // [false:Off,true:On]
design1_counter_bridge_length_factor = 0.89; // [0.1:0.01:1.5]
design1_counter_bridge_width_factor = 0.42; // [0.05:0.01:1]
design1_counter_bridge_x_adjust = 0.00; // [-1:0.01:1]
design1_counter_bridge_y_adjust = -0.03; // [-1:0.01:1]
design1_counter_bridge_corner_radius = 2.0; // [0:0.1:10]

// Counter Bridge Shadow Circle
design1_counter_bridge_shadow_circle_enabled = false; // [false:Off,true:On]
design1_counter_bridge_shadow_circle_diameter = 10.0; // [1:0.1:50]
design1_counter_bridge_shadow_circle_x_adjust = 0.0; // [-100:0.1:100]
design1_counter_bridge_shadow_circle_y_adjust = 0.0; // [-100:0.1:100]

// Counter Bridge Base Circle
design1_counter_bridge_base_circle_enabled = false; // [false:Off,true:On]
design1_counter_bridge_base_circle_diameter = 10.0; // [1:0.1:50]
design1_counter_bridge_base_circle_x_adjust = 0.0; // [-100:0.1:100]
design1_counter_bridge_base_circle_y_adjust = 0.0; // [-100:0.1:100]
/* [DESIGN 2] */
design2_name_text = "Taylor";
design2_font_preset = "Baloo 2:style=ExtraBold"; // font
design2_base_color_preview = "Mint Green"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]
design2_text_color_preview = "White"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]
design2_shadow_color_preview = "Pastel Pink"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]

// 37.2 mm is exactly 124% of the previous 30 mm body height.
design2_fixed_name_body_height = 37.2; // [20:0.1:75]

// Complete visible X/Y scale for this tag. Magnet cavity dimensions and Z
// layer thicknesses remain fixed.
design2_overall_size_percent = 100; // [50:1:200]

// Visible outline margins for this tag.
design2_base_margin = 5.1; // [0:0.1:15]
design2_shadow_margin = 3; // [0:0.1:15]
design2_text_margin = 0; // [-2:0.1:5]

// Symbol colors belong to this design. Symbol Base inherits this tag's Base color.
design2_symbol_shadow_color_preview = "Pastel Pink"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]
design2_symbol_top_color_preview = "White"; // [Default,None,White,Black,Red,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]

// Inline symbol attached to the right side of this name.
design2_inline_symbol_type = "Flower"; // [None,Flower,Heart,Football,Soccer Ball,Baseball,Basketball,Volleyball,Hockey,Lacrosse,Pencil,Double Note,Treble Clef,Racket,Music Note]
design2_inline_symbol_scale = 1; // [0.1:0.05:3]
design2_inline_symbol_gap = 1; // [0:0.25:10]
design2_inline_symbol_shadow_clearance = 0.2; // [0:0.1:3]
design2_inline_symbol_x_adjust = 0; // [-30:0.5:30]
design2_inline_symbol_y_adjust = -1; // [-30:0.5:30]
design2_inline_symbol_rotate_z = 0; // [-180:1:180]


// Unlimited manual lower-layer repairs for this tag.
// [Layer, Shape, Limit, X, Y, Size X, Size Y, Rotation]
// Layer: Base, Shadow, Both. Shape: Rectangle, Circle. Limit: Clip, Free.
// Equal Circle sizes make a circle; unequal sizes make an ellipse.
design2_repair_parts = [
    // ["Shadow", "Rectangle", "Clip", 0, 0, 200, 80, 0],
    // ["Both", "Circle", "Free", 20, 0, 6, 10, 15]
];

// Counter Bridge Shadow Rectangle
design2_counter_bridge_enabled = false; // [false:Off,true:On]
design2_counter_bridge_length_factor = 0.89; // [0.1:0.01:1.5]
design2_counter_bridge_width_factor = 0.42; // [0.05:0.01:1]
design2_counter_bridge_x_adjust = 0.00; // [-1:0.01:1]
design2_counter_bridge_y_adjust = -0.03; // [-1:0.01:1]
design2_counter_bridge_corner_radius = 2.0; // [0:0.1:10]

// Counter Bridge Shadow Circle
design2_counter_bridge_shadow_circle_enabled = false; // [false:Off,true:On]
design2_counter_bridge_shadow_circle_diameter = 10.0; // [1:0.1:50]
design2_counter_bridge_shadow_circle_x_adjust = 0.0; // [-100:0.1:100]
design2_counter_bridge_shadow_circle_y_adjust = 0.0; // [-100:0.1:100]

// Counter Bridge Base Circle
design2_counter_bridge_base_circle_enabled = false; // [false:Off,true:On]
design2_counter_bridge_base_circle_diameter = 10.0; // [1:0.1:50]
design2_counter_bridge_base_circle_x_adjust = 0.0; // [-100:0.1:100]
design2_counter_bridge_base_circle_y_adjust = 0.0; // [-100:0.1:100]
/* [DESIGN 3] */
design3_name_text = "Morgan";
design3_font_preset = "Baloo 2:style=ExtraBold"; // font
design3_base_color_preview = "Navy Blue"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]
design3_text_color_preview = "White"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]
design3_shadow_color_preview = "Baby Blue"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]

// 37.2 mm is exactly 124% of the previous 30 mm body height.
design3_fixed_name_body_height = 37.2; // [20:0.1:75]

// Complete visible X/Y scale for this tag. Magnet cavity dimensions and Z
// layer thicknesses remain fixed.
design3_overall_size_percent = 100; // [50:1:200]

// Visible outline margins for this tag.
design3_base_margin = 5.1; // [0:0.1:15]
design3_shadow_margin = 3; // [0:0.1:15]
design3_text_margin = 0; // [-2:0.1:5]

// Symbol colors belong to this design. Symbol Base inherits this tag's Base color.
design3_symbol_shadow_color_preview = "Baby Blue"; // [Black,Red,White,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]
design3_symbol_top_color_preview = "White"; // [Default,None,White,Black,Red,Pastel Pink,Lavender,Baby Blue,Mint Green,Navy Blue]

// Inline symbol attached to the right side of this name.
design3_inline_symbol_type = "Heart"; // [None,Flower,Heart,Football,Soccer Ball,Baseball,Basketball,Volleyball,Hockey,Lacrosse,Pencil,Double Note,Treble Clef,Racket,Music Note]
design3_inline_symbol_scale = 1; // [0.1:0.05:3]
design3_inline_symbol_gap = 1; // [0:0.25:10]
design3_inline_symbol_shadow_clearance = 0.2; // [0:0.1:3]
design3_inline_symbol_x_adjust = 0; // [-30:0.5:30]
design3_inline_symbol_y_adjust = -1; // [-30:0.5:30]
design3_inline_symbol_rotate_z = 0; // [-180:1:180]


// Unlimited manual lower-layer repairs for this tag.
// [Layer, Shape, Limit, X, Y, Size X, Size Y, Rotation]
// Layer: Base, Shadow, Both. Shape: Rectangle, Circle. Limit: Clip, Free.
// Equal Circle sizes make a circle; unequal sizes make an ellipse.
design3_repair_parts = [
    // ["Shadow", "Rectangle", "Clip", 0, 0, 200, 80, 0],
    // ["Both", "Circle", "Free", 20, 0, 6, 10, 15]
];

// Counter Bridge Shadow Rectangle
design3_counter_bridge_enabled = false; // [false:Off,true:On]
design3_counter_bridge_length_factor = 0.89; // [0.1:0.01:1.5]
design3_counter_bridge_width_factor = 0.42; // [0.05:0.01:1]
design3_counter_bridge_x_adjust = 0.00; // [-1:0.01:1]
design3_counter_bridge_y_adjust = -0.03; // [-1:0.01:1]
design3_counter_bridge_corner_radius = 2.0; // [0:0.1:10]

// Counter Bridge Shadow Circle
design3_counter_bridge_shadow_circle_enabled = false; // [false:Off,true:On]
design3_counter_bridge_shadow_circle_diameter = 10.0; // [1:0.1:50]
design3_counter_bridge_shadow_circle_x_adjust = 0.0; // [-100:0.1:100]
design3_counter_bridge_shadow_circle_y_adjust = 0.0; // [-100:0.1:100]

// Counter Bridge Base Circle
design3_counter_bridge_base_circle_enabled = false; // [false:Off,true:On]
design3_counter_bridge_base_circle_diameter = 10.0; // [1:0.1:50]
design3_counter_bridge_base_circle_x_adjust = 0.0; // [-100:0.1:100]
design3_counter_bridge_base_circle_y_adjust = 0.0; // [-100:0.1:100]
/* [Hidden] */
// Structural layer thicknesses are intentionally hidden from the Customizer.
// They are required by the tag geometry and magnet enclosure, but are not
// normal symbol/letter/XY-size controls.
base_thickness = 3.6;
shadow_thickness = 0.8;
text_thickness = 1.2;

// Keep the all-tags preview inside one top-level group. The model maker
// otherwise recenters every top-level SCAD statement
// and stacks the tags. The generator temporarily disables this only while it
// creates a native colored 3MF with separate positioned objects.
keep_plate_layout_grouped = true;

// Internal export selector. 0 renders the normal plate; a positive design
// number renders exactly one positioned tag for atomic 3MF assembly.
export_single_design = 0;

// Parametric Model Maker object manifest (V4.4+).
// pmm_object_selector_param names the integer variable used to render one object.
// pmm_part_selector_param names the string variable used to render one color/part.
// Each pmm_objects row is:
//   [object_id, fallback_label, label_parameter, merge_key]
// Objects that share the SAME merge_key are treated as one logical object in
// selection and 3MF export, while every child part keeps its own geometry,
// filament/color, and SCAD behavior. Give each row a unique merge_key to keep
// objects separate. Example: change Design 1 and Design 2 to "pair_a" to group them.
pmm_object_selector_param = "export_single_design";
pmm_part_selector_param = "render_part";
pmm_objects = [
    [1, "Design 1", "design1_name_text", "design_1"],
    [2, "Design 2", "design2_name_text", "design_2"],
    [3, "Design 3", "design3_name_text", "design_3"]
];

// Reference text size used to define the original design proportions.
max_name_size = 25;

// Minimum recommended text size warning reference.
min_name_size = 10;

// Scale all XY details based on actual name size / max_name_size.
auto_scale_all_xy = 1; // [0:No,1:Yes]

// Approximate average letter width factor for the fallback/default calculation.
letter_width_factor = 0.68;

// Bubble outline amount around text at full scale.
base_outline_offset = 6;

// Fixed 8.2 mm diameter x 2.6 mm deep magnet pockets. Each pocket starts
// at Z = 0.4 mm inside the 3.6 mm Base, leaving a sealed 0.4 mm bottom floor and
// a 0.6 mm top cover for inserting the magnet during a print pause.
magnet_cavity_diameter = 8.2;
magnet_cavity_height = 2.6;
magnet_cavity_z = 0.4;
// Keep at least three 0.4 mm perimeter lines between every cavity and the
// calculated tag boundary, and between neighboring cavities. This affects
// placement/count only; it adds no positive geometry.
magnet_cavity_edge_wall = 1.2;

// Smoothing quality.
$fn = 96;

// FONT TUNING
// Playwrite Australia Victoria Guides is a joined script font.
playwrite_avg_letter_width_factor = 0.56;
playwrite_base_outline_offset = 4.3;
playwrite_text_spacing = 0.82;
playwrite_text_y_adjust = -0.6;

// Baloo 2 ExtraBold tuning. This is the rounded block option.
baloo_letter_width_factor = 0.68;
baloo_base_outline_offset = 6;
baloo_text_spacing = 0.92;
baloo_text_y_adjust = -1.2;

// INTERNAL FONT TUNING
// Shift text so it visually centers better for fallback fonts.
text_y_adjust = -1.2;

// Spacing below 1 makes the name more compact and connected-looking.
text_spacing = 0.92;

function d_name(i) =
    i == 1 ? design1_name_text :
    i == 2 ? design2_name_text :
    design3_name_text;

function d_font_preset(i) =
    i == 1 ? design1_font_preset :
    i == 2 ? design2_font_preset :
    design3_font_preset;

function d_base_color_preview(i) =
    i == 1 ? design1_base_color_preview :
    i == 2 ? design2_base_color_preview :
    design3_base_color_preview;

function d_text_color_preview(i) =
    i == 1 ? design1_text_color_preview :
    i == 2 ? design2_text_color_preview :
    design3_text_color_preview;

function d_shadow_color_preview(i) =
    i == 1 ? design1_shadow_color_preview :
    i == 2 ? design2_shadow_color_preview :
    design3_shadow_color_preview;

function d_inline_symbol_type(i) =
    i == 1 ? design1_inline_symbol_type :
    i == 2 ? design2_inline_symbol_type :
    design3_inline_symbol_type;

function d_symbol_shadow_color_preview(i) =
    i == 1 ? design1_symbol_shadow_color_preview :
    i == 2 ? design2_symbol_shadow_color_preview :
    design3_symbol_shadow_color_preview;

function d_symbol_top_color_setting(i) =
    i == 1 ? design1_symbol_top_color_preview :
    i == 2 ? design2_symbol_top_color_preview :
    design3_symbol_top_color_preview;

// "Default" keeps normal symbols on Sunshine Yellow. The layered SVG Heart
// instead inherits the tag Text color for its inner Top face.
function d_symbol_top_color_preview(i) =
    d_symbol_top_color_setting(i) == "Default"
        ? (resolved_inline_symbol_type(i) == "Heart"
            ? d_text_color_preview(i)
            : "Sunshine Yellow")
        : d_symbol_top_color_setting(i);

function d_fixed_name_body_height(i) =
    i == 1 ? design1_fixed_name_body_height :
    i == 2 ? design2_fixed_name_body_height :
    design3_fixed_name_body_height;

function d_overall_size_percent(i) =
    i == 1 ? design1_overall_size_percent :
    i == 2 ? design2_overall_size_percent :
    design3_overall_size_percent;

function d_base_margin(i) =
    i == 1 ? design1_base_margin :
    i == 2 ? design2_base_margin :
    design3_base_margin;

function d_shadow_margin(i) =
    i == 1 ? design1_shadow_margin :
    i == 2 ? design2_shadow_margin :
    design3_shadow_margin;

function d_text_margin(i) =
    i == 1 ? design1_text_margin :
    i == 2 ? design2_text_margin :
    design3_text_margin;

function d_inline_symbol_scale(i) =
    i == 1 ? design1_inline_symbol_scale :
    i == 2 ? design2_inline_symbol_scale :
    design3_inline_symbol_scale;

function d_inline_symbol_gap(i) =
    i == 1 ? design1_inline_symbol_gap :
    i == 2 ? design2_inline_symbol_gap :
    design3_inline_symbol_gap;

function d_inline_symbol_shadow_clearance(i) =
    i == 1 ? design1_inline_symbol_shadow_clearance :
    i == 2 ? design2_inline_symbol_shadow_clearance :
    design3_inline_symbol_shadow_clearance;

function d_inline_symbol_x_adjust(i) =
    i == 1 ? design1_inline_symbol_x_adjust :
    i == 2 ? design2_inline_symbol_x_adjust :
    design3_inline_symbol_x_adjust;

function d_inline_symbol_y_adjust(i) =
    i == 1 ? design1_inline_symbol_y_adjust :
    i == 2 ? design2_inline_symbol_y_adjust :
    design3_inline_symbol_y_adjust;

function d_inline_symbol_rotate_z(i) =
    i == 1 ? design1_inline_symbol_rotate_z :
    i == 2 ? design2_inline_symbol_rotate_z :
    design3_inline_symbol_rotate_z;


function d_counter_bridge_enabled(i) =
    i == 1 ? design1_counter_bridge_enabled :
    i == 2 ? design2_counter_bridge_enabled :
    design3_counter_bridge_enabled;

function d_counter_bridge_length_factor(i) =
    i == 1 ? design1_counter_bridge_length_factor :
    i == 2 ? design2_counter_bridge_length_factor :
    design3_counter_bridge_length_factor;

function d_counter_bridge_width_factor(i) =
    i == 1 ? design1_counter_bridge_width_factor :
    i == 2 ? design2_counter_bridge_width_factor :
    design3_counter_bridge_width_factor;

function d_counter_bridge_x_adjust(i) =
    i == 1 ? design1_counter_bridge_x_adjust :
    i == 2 ? design2_counter_bridge_x_adjust :
    design3_counter_bridge_x_adjust;

function d_counter_bridge_y_adjust(i) =
    i == 1 ? design1_counter_bridge_y_adjust :
    i == 2 ? design2_counter_bridge_y_adjust :
    design3_counter_bridge_y_adjust;

function d_counter_bridge_corner_radius(i) =
    i == 1 ? design1_counter_bridge_corner_radius :
    i == 2 ? design2_counter_bridge_corner_radius :
    design3_counter_bridge_corner_radius;

function d_counter_bridge_shadow_circle_enabled(i) =
    i == 1 ? design1_counter_bridge_shadow_circle_enabled :
    i == 2 ? design2_counter_bridge_shadow_circle_enabled :
    design3_counter_bridge_shadow_circle_enabled;

function d_counter_bridge_shadow_circle_diameter(i) =
    i == 1 ? design1_counter_bridge_shadow_circle_diameter :
    i == 2 ? design2_counter_bridge_shadow_circle_diameter :
    design3_counter_bridge_shadow_circle_diameter;

function d_counter_bridge_shadow_circle_x_adjust(i) =
    i == 1 ? design1_counter_bridge_shadow_circle_x_adjust :
    i == 2 ? design2_counter_bridge_shadow_circle_x_adjust :
    design3_counter_bridge_shadow_circle_x_adjust;

function d_counter_bridge_shadow_circle_y_adjust(i) =
    i == 1 ? design1_counter_bridge_shadow_circle_y_adjust :
    i == 2 ? design2_counter_bridge_shadow_circle_y_adjust :
    design3_counter_bridge_shadow_circle_y_adjust;

function d_counter_bridge_base_circle_enabled(i) =
    i == 1 ? design1_counter_bridge_base_circle_enabled :
    i == 2 ? design2_counter_bridge_base_circle_enabled :
    design3_counter_bridge_base_circle_enabled;

function d_counter_bridge_base_circle_diameter(i) =
    i == 1 ? design1_counter_bridge_base_circle_diameter :
    i == 2 ? design2_counter_bridge_base_circle_diameter :
    design3_counter_bridge_base_circle_diameter;

function d_counter_bridge_base_circle_x_adjust(i) =
    i == 1 ? design1_counter_bridge_base_circle_x_adjust :
    i == 2 ? design2_counter_bridge_base_circle_x_adjust :
    design3_counter_bridge_base_circle_x_adjust;

function d_counter_bridge_base_circle_y_adjust(i) =
    i == 1 ? design1_counter_bridge_base_circle_y_adjust :
    i == 2 ? design2_counter_bridge_base_circle_y_adjust :
    design3_counter_bridge_base_circle_y_adjust;

function d_repair_parts(i) =
    i == 1 ? design1_repair_parts :
    i == 2 ? design2_repair_parts :
    design3_repair_parts;

// OpenSCAD/Google Font family names. Keep the old token names accepted so
// older saved parameter sets still render correctly.
function is_baloo_font(i) =
    d_font_preset(i) == "Baloo 2" || d_font_preset(i) == "Baloo 2:style=ExtraBold" || d_font_preset(i) == "Baloo_2_ExtraBold";

function is_playwrite_font(i) =
    d_font_preset(i) == "Playwrite AU VIC Guides" ||
    d_font_preset(i) == "Playwrite AU VIC Guides:style=Regular" ||
    d_font_preset(i) == "Playwrite_Australia_Victoria_Guides";

// OpenSCAD selects a font by Fontconfig family name plus optional style.
function selected_font(i) =
    is_baloo_font(i) ? "Baloo 2:style=ExtraBold" :
    is_playwrite_font(i) ? "Playwrite AU VIC Guides:style=Regular" :
    d_font_preset(i);

function font_letter_width_factor(i) =
    is_baloo_font(i) ? baloo_letter_width_factor :
    is_playwrite_font(i) ? playwrite_avg_letter_width_factor :
    letter_width_factor;

function font_base_outline_offset(i) =
    is_baloo_font(i) ? baloo_base_outline_offset :
    is_playwrite_font(i) ? playwrite_base_outline_offset :
    base_outline_offset;

function overall_xy_scale(i) = max(1,d_overall_size_percent(i)) / 100;

function font_text_offset(i) = d_text_margin(i) * overall_xy_scale(i);

function font_text_spacing(i) =
    is_baloo_font(i) ? baloo_text_spacing :
    is_playwrite_font(i) ? playwrite_text_spacing :
    text_spacing;

function font_text_y_adjust(i) =
    is_baloo_font(i) ? baloo_text_y_adjust :
    is_playwrite_font(i) ? playwrite_text_y_adjust :
    text_y_adjust;

function computed_text_size(i) =
    (auto_scale_all_xy == 1
        ? d_fixed_name_body_height(i) / (1 + 2 * font_base_outline_offset(i) / max_name_size)
        : d_fixed_name_body_height(i) - 2 * font_base_outline_offset(i)) *
    overall_xy_scale(i);

function scale_xy(i) = auto_scale_all_xy == 1 ? computed_text_size(i) / max_name_size : 1;
function scale_z(i) = 1;
// Approximate width used for general plate layout and older non-inline paths.
// Inline placement uses exact textmetrics bounds below.
function char_width_weight(c) =
    c == " " ? 0.35 :
    c == "." ? 0.25 :
    c == "," ? 0.25 :
    c == "'" ? 0.2 :
    c == "-" ? 0.35 :
    c == "i" ? 0.38 :
    c == "í" ? 0.38 :
    c == "ì" ? 0.38 :
    c == "î" ? 0.38 :
    c == "ï" ? 0.38 :
    c == "l" ? 0.42 :
    c == "I" ? 0.45 :
    c == "j" ? 0.45 :
    c == "t" ? 0.52 :
    c == "f" ? 0.55 :
    c == "r" ? 0.55 :
    c == "s" ? 0.65 :
    c == "a" ? 0.72 :
    c == "á" ? 0.72 :
    c == "à" ? 0.72 :
    c == "â" ? 0.72 :
    c == "ä" ? 0.72 :
    c == "A" ? 0.82 :
    c == "m" ? 1.05 :
    c == "M" ? 1.08 :
    c == "w" ? 1.05 :
    c == "W" ? 1.15 :
    c == "B" ? 0.86 :
    c == "R" ? 0.82 :
    c == "H" ? 0.88 :
    c == "o" ? 0.78 :
    0.74;

function text_width_units(txt,idx = 0) =
    idx >= len(txt)
        ? 0
        : char_width_weight(txt[idx]) + text_width_units(txt,idx + 1);

// Baloo is rounded and slightly wide, so keep a small safety multiplier.
name_width_safety = 1.12;

function name_body_width(i) =
    text_width_units(d_name(i)) *
    computed_text_size(i) *
    font_letter_width_factor(i) *
    name_width_safety;

// Every design owns its inline-symbol selection. There is no global fallback.
function resolved_inline_symbol_type(i) = d_inline_symbol_type(i);

function inline_is_active_for_design(i) =
    resolved_inline_symbol_type(i) != "None" && d_name(i) != "";

// Magnet and inline placement use the real rendered bounds of the selected
// font. OpenSCAD development snapshots expose this through textmetrics.
function exact_name_metrics(i) =
    d_name(i) != ""
        ? textmetrics(
            text = d_name(i),
            size = computed_text_size(i),
            font = selected_font(i),
            halign = "center",
            valign = "center",
            spacing = font_text_spacing(i)
        )
        : undef;

function exact_name_metrics_required(i) =
    let(metrics = exact_name_metrics(i))
    assert(
        !is_undef(metrics),
        "Exact magnet and inline placement need OpenSCAD textmetrics. Use a development snapshot and enable Preferences > Features > textmetrics."
    )
    metrics;

function exact_name_text_left(i) =
    let(metrics = exact_name_metrics_required(i))
    metrics.position[0];

function exact_name_text_right(i) =
    let(metrics = exact_name_metrics_required(i))
    metrics.position[0] + metrics.size[0];

function exact_name_text_center_y(i) =
    let(metrics = exact_name_metrics_required(i))
    metrics.position[1] + metrics.size[1] / 2 + s(i,font_text_y_adjust(i));

function exact_name_text_bottom(i) =
    let(metrics = exact_name_metrics_required(i))
    metrics.position[1] + s(i,font_text_y_adjust(i));

function exact_name_text_top(i) =
    let(metrics = exact_name_metrics_required(i))
    metrics.position[1] + metrics.size[1] + s(i,font_text_y_adjust(i));

function inline_name_face_left(i) =
    exact_name_text_left(i) - font_text_offset(i);

function inline_name_face_right(i) =
    exact_name_text_right(i) + font_text_offset(i);

// Custom symbol artwork uses a 26.8 mm nominal drawing size. Scale its face to
// the calculated letter height, then keep rotation independent from the name.
function symbol_art_nominal_size() = 26.8;

function inline_symbol_face_size(i) =
    let(
        symbol_size_factor = resolved_inline_symbol_type(i) == "Music Note"
            ? 8 / 9
            : 1,
        configured_size = computed_text_size(i) * max(0.01,d_inline_symbol_scale(i)) * symbol_size_factor,
        heart_minimum_size = resolved_inline_symbol_type(i) == "Heart"
            ? d_fixed_name_body_height(i) * overall_xy_scale(i)
            : 0
    )
    max(configured_size,heart_minimum_size);

function inline_symbol_xy_scale(i) = inline_symbol_face_size(i) / symbol_art_nominal_size();
function inline_symbol_base_outline_s(i) =
    (resolved_inline_symbol_type(i) == "Heart"
        ? heart_base_outline()
        : symbol_base_outline()) * inline_symbol_xy_scale(i);
function inline_symbol_shadow_outline_s(i) =
    symbol_shadow_outline_for(resolved_inline_symbol_type(i)) *
        inline_symbol_xy_scale(i);

// Exact bounds of the installed custom symbol core before its transform.
// Bounds use [left, right, bottom, top].
function inline_symbol_core_bounds(i) =
    symbol_art_bounds(resolved_inline_symbol_type(i));

function inline_symbol_builtin_rotate_z(i) =
    resolved_inline_symbol_type(i) == "Football" ? 30 :
    resolved_inline_symbol_type(i) == "Flower" ? 30 :
    0;

// Special symbols may move away from the lettering, but never consume the
// whole Base overlap that keeps the symbol physically attached to the tag.
function inline_symbol_max_connected_gap_adjust(i) =
    max(0,
        base_offset_s(i) + inline_symbol_base_outline_s(i) -
        inline_symbol_resolved_gap(i) - 0.8
    );

function inline_symbol_detail_guard_gap(i) =
    let(symbol_name = resolved_inline_symbol_type(i))
    symbol_name == "Soccer Ball" ||
    symbol_name == "Baseball" ||
    symbol_name == "Basketball" ||
    symbol_name == "Volleyball" ||
    symbol_name == "Hockey"
        ? min(0.8,inline_symbol_max_connected_gap_adjust(i)) :
    symbol_name == "Lacrosse" ||
    symbol_name == "Pencil" ||
    symbol_name == "Racket"
        ? min(0.6,inline_symbol_max_connected_gap_adjust(i)) :
    0;

function inline_symbol_builtin_gap_adjust(i) =
    resolved_inline_symbol_type(i) == "Music Note" ? 0 :
    resolved_inline_symbol_type(i) == "Football" ? 3 :
    resolved_inline_symbol_type(i) == "Treble Clef"
        ? 1 + min(1.5,inline_symbol_max_connected_gap_adjust(i)) :
    1 + inline_symbol_detail_guard_gap(i);

function inline_symbol_builtin_y_adjust(i) =
    resolved_inline_symbol_type(i) == "Football" ? -1 : 0;

function inline_symbol_effective_rotate_z(i) =
    d_inline_symbol_rotate_z(i) + inline_symbol_builtin_rotate_z(i);

function inline_symbol_rotated_point(point,i) =
    let(
        scaled_x = point[0] * inline_symbol_xy_scale(i),
        scaled_y = point[1] * inline_symbol_xy_scale(i)
    )
    [
        scaled_x * cos(inline_symbol_effective_rotate_z(i)) -
            scaled_y * sin(inline_symbol_effective_rotate_z(i)),
        scaled_x * sin(inline_symbol_effective_rotate_z(i)) +
            scaled_y * cos(inline_symbol_effective_rotate_z(i))
    ];

function inline_art_rotated_bounds(i) =
    let(points = [
        for (point = symbol_art_face_points_flat(resolved_inline_symbol_type(i)))
            inline_symbol_rotated_point(point,i)
    ])
    [
        min([for (point = points) point[0]]),
        max([for (point = points) point[0]]),
        min([for (point = points) point[1]]),
        max([for (point = points) point[1]])
    ];

function inline_symbol_rotated_bounds(i) =
    inline_art_rotated_bounds(i);

// Keep the finished name Shadow and symbol Shadow separated. Their two Base
// outlines are thicker, so they still overlap naturally underneath and form
// one printable object without a bridge.
function inline_symbol_art_growth_s(i) =
    resolved_inline_symbol_type(i) == "Music Note"
        ? 0.55 * inline_symbol_xy_scale(i)
        : 0;

function inline_symbol_min_safe_gap(i) =
    max(0,shadow_offset_s(i) - font_text_offset(i)) +
    inline_symbol_shadow_outline_s(i) +
    inline_symbol_art_growth_s(i) +
    max(0,d_inline_symbol_shadow_clearance(i));

function inline_symbol_resolved_gap(i) =
    max(max(0,d_inline_symbol_gap(i)),inline_symbol_min_safe_gap(i));

// Fine adjustment is applied last and can intentionally override the safety
// position when a special design needs it.
function inline_symbol_connection_overlap(i) =
    resolved_inline_symbol_type(i) == "Heart"
        ? max(3,0.08 * inline_symbol_face_size(i))
        : 0;

function inline_symbol_center_x(i) =
    inline_name_face_right(i) +
    inline_symbol_resolved_gap(i) +
    inline_symbol_builtin_gap_adjust(i) +
    -inline_symbol_rotated_bounds(i)[0] -
    inline_symbol_connection_overlap(i) +
    d_inline_symbol_x_adjust(i);

// Lowercase first letters sit 1 mm lower. Uppercase first letters, names that
// start with no alphabetic character, and empty names use the normal height.
function inline_symbol_case_y(i) =
    symbol_is_lowercase_letter(symbol_alpha_from_left_at(d_name(i),0)) ? -1 : 0;

function inline_symbol_center_y(i) =
    s(i,font_text_y_adjust(i)) +
    inline_symbol_case_y(i) +
    inline_symbol_builtin_y_adjust(i) +
    d_inline_symbol_y_adjust(i);

function s(i,v) = v * scale_xy(i);
function sz(i,v) = v * scale_z(i);
function base_offset_s(i) = d_base_margin(i) * overall_xy_scale(i);
function shadow_offset_s(i) = d_shadow_margin(i) * overall_xy_scale(i);
function approx_name_body_height(i) = computed_text_size(i) + 2 * base_offset_s(i);

// Exact bounds of the pink name backing. Counter-bridge helpers remain inside
// these outer ends and do not change the complete-print reference span.
function name_base_left(i) = exact_name_text_left(i) - base_offset_s(i);
function name_base_right(i) = exact_name_text_right(i) + base_offset_s(i);
function name_base_bottom(i) = exact_name_text_bottom(i) - base_offset_s(i);
function name_base_top(i) = exact_name_text_top(i) + base_offset_s(i);
function name_base_width(i) = name_base_right(i) - name_base_left(i);

// Horizontal shadow bridge dimensions.
function counter_bridge_length_s(i) = name_body_width(i) * d_counter_bridge_length_factor(i);
function counter_bridge_width_s(i) = computed_text_size(i) * d_counter_bridge_width_factor(i);
function counter_bridge_x_s(i) = computed_text_size(i) * d_counter_bridge_x_adjust(i);
function counter_bridge_y_s(i) = s(i,font_text_y_adjust(i)) + computed_text_size(i) * d_counter_bridge_y_adjust(i);
function counter_bridge_radius_s(i) = s(i,d_counter_bridge_corner_radius(i));

// Shadow-circle controls are final local millimetres. They deliberately do not
// use overall_xy_scale(), computed_text_size(), or the name width.
function counter_bridge_shadow_circle_diameter_mm(i) = max(0.01,d_counter_bridge_shadow_circle_diameter(i));
function counter_bridge_shadow_circle_x_mm(i) = d_counter_bridge_shadow_circle_x_adjust(i);
function counter_bridge_shadow_circle_y_mm(i) = d_counter_bridge_shadow_circle_y_adjust(i);

// Base-circle controls are final local millimetres. They deliberately do not
// use overall_xy_scale(), computed_text_size(), or the name width.
function counter_bridge_base_circle_diameter_mm(i) = max(0.01,d_counter_bridge_base_circle_diameter(i));
function music_note_base_circle_anchor(i) =
    inline_symbol_rotated_point([-6.2,11.6],i);

function counter_bridge_base_circle_x_mm(i) =
    d_counter_bridge_base_circle_x_adjust(i) +
    (resolved_inline_symbol_type(i) == "Music Note"
        ? inline_symbol_center_x(i) + music_note_base_circle_anchor(i)[0]
        : 0);

function counter_bridge_base_circle_y_mm(i) =
    d_counter_bridge_base_circle_y_adjust(i) +
    (resolved_inline_symbol_type(i) == "Music Note"
        ? inline_symbol_center_y(i) + music_note_base_circle_anchor(i)[1]
        : 0);

function repair_row_valid(row) =
    is_list(row) && len(row) >= 8 &&
    (row[0] == "Base" || row[0] == "Shadow" || row[0] == "Both") &&
    (row[1] == "Rectangle" || row[1] == "Circle") &&
    (row[2] == "Clip" || row[2] == "Free") &&
    is_num(row[3]) && is_num(row[4]) &&
    is_num(row[5]) && is_num(row[6]) && is_num(row[7]) &&
    row[5] > 0 && row[6] > 0;

function repair_row_is_free(row) = repair_row_valid(row) && row[2] == "Free";
function repair_row_half_x(i,row) =
    (abs(cos(row[7])) * row[5] / 2 + abs(sin(row[7])) * row[6] / 2) * overall_xy_scale(i);
function repair_row_half_y(i,row) =
    (abs(sin(row[7])) * row[5] / 2 + abs(cos(row[7])) * row[6] / 2) * overall_xy_scale(i);
function repair_free_rows(i) =
    [for (row = d_repair_parts(i)) if (repair_row_is_free(row)) row];
function repair_has_free_parts(i) = len(repair_free_rows(i)) > 0;
function repair_free_left(i,fallback) =
    let(rows = repair_free_rows(i))
    len(rows) == 0 ? fallback : min([for (row = rows) row[3] * overall_xy_scale(i) - repair_row_half_x(i,row)]);
function repair_free_right(i,fallback) =
    let(rows = repair_free_rows(i))
    len(rows) == 0 ? fallback : max([for (row = rows) row[3] * overall_xy_scale(i) + repair_row_half_x(i,row)]);
function repair_free_bottom(i,fallback) =
    let(rows = repair_free_rows(i))
    len(rows) == 0 ? fallback : min([for (row = rows) row[4] * overall_xy_scale(i) - repair_row_half_y(i,row)]);
function repair_free_top(i,fallback) =
    let(rows = repair_free_rows(i))
    len(rows) == 0 ? fallback : max([for (row = rows) row[4] * overall_xy_scale(i) + repair_row_half_y(i,row)]);

// Plate spacing must use the real rendered glyph bounds. The older estimated
// width was too narrow for names such as Chloe, Ethan, Olivia, and Mason.
function normal_design_left(i) = name_base_left(i);
function normal_design_right(i) = name_base_right(i);
function inline_design_left(i) = inline_symbol_center_x(i) + inline_symbol_rotated_bounds(i)[0] - inline_symbol_base_outline_s(i);
function inline_design_right(i) = inline_symbol_center_x(i) + inline_symbol_rotated_bounds(i)[1] + inline_symbol_base_outline_s(i);
function design_content_left(i) =
    inline_is_active_for_design(i)
        ? min(normal_design_left(i),inline_design_left(i))
        : normal_design_left(i);
function design_content_right(i) =
    inline_is_active_for_design(i)
        ? max(normal_design_right(i),inline_design_right(i))
        : normal_design_right(i);
function design_outer_left(i) =
    min(design_content_left(i),repair_free_left(i,design_content_left(i)));
function design_outer_right(i) =
    max(design_content_right(i),repair_free_right(i,design_content_right(i)));
function design_outer_width(i) = design_outer_right(i) - design_outer_left(i);

function normal_design_bottom(i) = name_base_bottom(i);
function normal_design_top(i) = name_base_top(i);
function inline_design_bottom(i) = inline_symbol_center_y(i) + inline_symbol_rotated_bounds(i)[2] - inline_symbol_base_outline_s(i);
function inline_design_top(i) = inline_symbol_center_y(i) + inline_symbol_rotated_bounds(i)[3] + inline_symbol_base_outline_s(i);
function design_content_bottom(i) =
    inline_is_active_for_design(i)
        ? min(normal_design_bottom(i),inline_design_bottom(i))
        : normal_design_bottom(i);
function design_content_top(i) =
    inline_is_active_for_design(i)
        ? max(normal_design_top(i),inline_design_top(i))
        : normal_design_top(i);
function design_outer_bottom(i) =
    min(design_content_bottom(i),repair_free_bottom(i,design_content_bottom(i)));
function design_outer_top(i) =
    max(design_content_top(i),repair_free_top(i,design_content_top(i)));
function design_outer_height(i) = design_outer_top(i) - design_outer_bottom(i);

// Plate placement uses the complete outer bounds of the name and inline symbol,
// base margin, rotation, and any free repair parts. design_layout_gap is then
// added between those finished outlines, so neighboring tags cannot merge.
function layout_fallback_left(i) =
    let(normal_left = -name_body_width(i) / 2 - base_offset_s(i))
    min(normal_left, repair_free_left(i, normal_left));
function layout_fallback_right(i) =
    let(
        normal_right = name_body_width(i) / 2 + base_offset_s(i),
        inline_extension = inline_is_active_for_design(i)
            ? computed_text_size(i) * max(0.01, d_inline_symbol_scale(i)) +
                max(0, d_inline_symbol_gap(i)) + base_offset_s(i)
            : 0,
        content_right = normal_right + inline_extension
    )
    max(content_right, repair_free_right(i, content_right));
function layout_fallback_width(i) = layout_fallback_right(i) - layout_fallback_left(i);
function layout_safe_width(i) = max(design_spacing_min, design_outer_width(i));
function layout_safe_left(i) = design_outer_left(i);
function layout_safe_height(i) = max(d_fixed_name_body_height(i) * overall_xy_scale(i), design_outer_height(i));
function preview_cell_width() = max([for (idx = [1:total_designs()]) layout_safe_width(idx)]) + design_layout_gap;
function preview_cell_height() = max([for (idx = [1:total_designs()]) layout_safe_height(idx)]) + design_row_gap;
function total_designs() = 3;
function auto_designs_per_row() = max(1,ceil(sqrt(total_designs())));
function resolved_designs_per_row() =
    designs_per_row <= 0
        ? auto_designs_per_row()
        : min(total_designs(),max(1,floor(designs_per_row)));
function design_col(i) = (i - 1) % resolved_designs_per_row();
function design_row(i) = floor((i - 1) / resolved_designs_per_row());
function total_rows() = ceil(total_designs() / resolved_designs_per_row());
function designs_in_row(r) = min(resolved_designs_per_row(),max(0,total_designs() - r * resolved_designs_per_row()));
function row_design_index(r,c) = r * resolved_designs_per_row() + c + 1;
function layout_list_sum(values, index = 0) =
    index >= len(values) ? 0 :
    values[index] + layout_list_sum(values, index + 1);
function row_content_width(r) =
    layout_list_sum([
        for (c = [0:designs_in_row(r) - 1])
            layout_safe_width(row_design_index(r, c))
    ]) + max(0, designs_in_row(r) - 1) * design_layout_gap;
function row_width_before_col(r, c) = c <= 0 ? 0 :
    layout_list_sum([
        for (prior_c = [0:c - 1])
            layout_safe_width(row_design_index(r, prior_c))
    ]);
function design_x_offset(i) =
    let(r = design_row(i), c = design_col(i))
    -row_content_width(r) / 2 +
    row_width_before_col(r, c) +
    c * design_layout_gap -
    layout_safe_left(i);
function design_y_offset(i) =
    ((total_rows() - 1) / 2 - design_row(i)) * preview_cell_height() +
    (repair_has_free_parts(i) ? -(design_outer_bottom(i) + design_outer_top(i)) / 2 : 0);

// Helpful echoes in OpenSCAD console.
for (i = [1:total_designs()]) {
    echo(str("Design ",i," name: ",d_name(i)));
    echo(str("Design ",i," font preset: ",d_font_preset(i)));
    echo(str("Design ",i," selected font: ",selected_font(i)));
    echo(str("Design ",i," colors base/shadow/text: ",d_base_color_preview(i)," / ",d_shadow_color_preview(i)," / ",d_text_color_preview(i)));
    echo(str("Design ",i," fixed body height target: ",d_fixed_name_body_height(i)," mm"));
    echo(str("Design ",i," computed text size: ",computed_text_size(i)," mm"));
    echo(str("Design ",i," approx body height: ",approx_name_body_height(i)," mm"));
    echo(str("Design ",i," body width: ",name_body_width(i)," mm"));
    echo(str("Design ",i," bridge enabled: ",d_counter_bridge_enabled(i),", length/width: ",counter_bridge_length_s(i)," / ",counter_bridge_width_s(i)," mm"));
    echo(str("Design ",i," shadow circle enabled: ",d_counter_bridge_shadow_circle_enabled(i),", diameter/position: ",counter_bridge_shadow_circle_diameter_mm(i)," mm at [",counter_bridge_shadow_circle_x_mm(i),", ",counter_bridge_shadow_circle_y_mm(i),"]"));
    echo(str("Design ",i," base circle enabled: ",d_counter_bridge_base_circle_enabled(i),", diameter/position: ",counter_bridge_base_circle_diameter_mm(i)," mm at [",counter_bridge_base_circle_x_mm(i),", ",counter_bridge_base_circle_y_mm(i),"]"));
    if (computed_text_size(i) < min_name_size) {
        echo(str("WARNING: Design ",i," text is below recommended minimum size of ",min_name_size," mm."));
    }
}

function rgb(c) =
    // Neutral filament swatches. Values mirror the web customizer palette.
    c == "Pastel Pink" ? [0.9451,0.6118,0.7333] : // Pastel Pink #F19CBB
    c == "Lavender" ? [0.7216,0.6745,0.8392] :    // Lavender #B8ACD6
    c == "Baby Blue" ? [0.6588,0.7765,0.9333] :   // Baby Blue #A8C6EE
    c == "Mint Green" ? [0.5882,0.8627,0.7255] :  // Mint #96DCB9
    c == "Sunshine Yellow" ? [0.9961,0.7765,0] :  // Sunflower Yellow #FEC600
    c == "Ruby Red" ? [0.7569,0.1804,0.1216] :    // PLA Basic Red #C12E1F
    c == "Navy Blue" ? [0.0471,0.1373,0.2510] :   // Navy Blue #0C2340
    c == "Black" ? [0,0,0] :                      // #000000
    c == "White" ? [1,1,1] :                      // #FFFFFF
    c == "Red" ? [0.7569,0.1804,0.1216] :         // PLA Basic Red #C12E1F
    c == "Royal Blue" ? [0.1569,0.2588,0.6784] :  // Royal Blue #2842AD
    c == "Gray" ? [0.5569,0.5647,0.5373] :        // PLA Basic Gray #8E9089
    c == "Orange" ? [0.9569,0.4745,0.1490] :      // PLA Basic Orange #F47926
    [0.75,0.75,0.75];

module centered_text_2d(i,extra_spacing) {
    text(d_name(i),
        size = computed_text_size(i),
        font = selected_font(i),
        halign = "center",
        valign = "center",
        spacing = extra_spacing);
}

module text_shape_2d(i) {
    translate([0,s(i,font_text_y_adjust(i))])
        centered_text_2d(i,font_text_spacing(i));
}

module printable_text_shape_2d(i) {
    offset(delta = font_text_offset(i))
        text_shape_2d(i);
}

module inline_symbol_core_art_2d(i) {
    symbol_art_core_2d(resolved_inline_symbol_type(i));
}

module inline_symbol_top_art_2d(i) {
    symbol_art_top_2d(resolved_inline_symbol_type(i));
}

module inline_symbol_transform_2d(i) {
    translate([inline_symbol_center_x(i),inline_symbol_center_y(i)])
        rotate(inline_symbol_effective_rotate_z(i))
            scale([inline_symbol_xy_scale(i),inline_symbol_xy_scale(i)])
                children();
}

module inline_symbol_core_placed_2d(i) {
    if (inline_is_active_for_design(i))
        inline_symbol_transform_2d(i)
            inline_symbol_core_art_2d(i);
}

module inline_symbol_top_placed_2d(i) {
    if (inline_is_active_for_design(i))
        inline_symbol_transform_2d(i)
            inline_symbol_top_art_2d(i);
}

// Cut the usable sealed 8.2 mm x 2.6 mm negative magnet pocket.
module magnet_cavity_at(x,y) {
    translate([x,y,magnet_cavity_z])
        cylinder(
            h = magnet_cavity_height,
            d = magnet_cavity_diameter
        );
}

module name_base_bubble_2d(i) {
    // Main smooth bubble around the name. Base counters are not auto-filled.
    offset(r = base_offset_s(i))
        text_shape_2d(i);
}

module inline_base_bubble_raw_2d(i) {
    if (inline_is_active_for_design(i))
        union() {
            if (resolved_inline_symbol_type(i) == "Heart")
                inline_symbol_transform_2d(i)
                    polygon(points = heart_outer_path());
            else
                offset(r = inline_symbol_base_outline_s(i))
                    inline_symbol_core_placed_2d(i);

            music_note_base_bridge_2d(i);
        }
}

// This complete outline is also used for robust inline-symbol bounds.
// symbols. The printable tag and inline color pieces below do not overlap.
module base_bubble_2d(i) {
    union() {
        name_base_bubble_2d(i);
        inline_base_bubble_raw_2d(i);
    }
}

function repair_row_targets_layer(row,layer_name) =
    repair_row_valid(row) && (row[0] == layer_name || row[0] == "Both");

module repair_shape_raw_2d(i,row) {
    translate([row[3] * overall_xy_scale(i),row[4] * overall_xy_scale(i)])
        rotate(row[7])
            if (row[1] == "Circle")
                scale([
                    row[5] * overall_xy_scale(i) / 2,
                    row[6] * overall_xy_scale(i) / 2
                ])
                    circle(r = 1);
            else
                square([
                    row[5] * overall_xy_scale(i),
                    row[6] * overall_xy_scale(i)
                ],center = true);
}

module repair_shape_for_tag_2d(i,row) {
    if (row[2] == "Free") {
        repair_shape_raw_2d(i,row);
    } else {
        intersection() {
            repair_shape_raw_2d(i,row);
            base_bubble_2d(i);
        }
    }
}

module repair_parts_for_layer_2d(i,layer_name) {
    union() {
        for (row = d_repair_parts(i))
            if (repair_row_targets_layer(row,layer_name))
                repair_shape_for_tag_2d(i,row);
    }
}

module counter_bridge_base_circle_2d(i) {
    if (d_counter_bridge_base_circle_enabled(i))
        translate([
            counter_bridge_base_circle_x_mm(i),
            counter_bridge_base_circle_y_mm(i)
        ])
            circle(d = counter_bridge_base_circle_diameter_mm(i));
}

// Raw tag-colored Base geometry.
module tag_base_color_2d(i) {
    union() {
        name_base_bubble_2d(i);
        counter_bridge_base_circle_2d(i);
        repair_parts_for_layer_2d(i,"Base");
    }
}

module inline_base_piece_2d(i) {
    if (inline_is_active_for_design(i))
        inline_base_bubble_raw_2d(i);
}


// Complete Layer 1 geometry after the name, inline symbol, Base circle, and
// manual Base repairs have been generated. No early per-letter fill is used.
module final_base_raw_2d(i) {
    union() {
        tag_base_color_2d(i);
        inline_base_piece_2d(i);
    }
}

// Add only empty regions completely enclosed by the finished Base geometry.
// Magnet cavities are subtracted later and therefore remain unchanged.
module final_base_enclosed_fillers_2d(i) {
    difference() {
        fill()
            final_base_raw_2d(i);
        final_base_raw_2d(i);
    }
}

module final_base_layer_2d(i) {
    union() {
        final_base_raw_2d(i);
        final_base_enclosed_fillers_2d(i);
    }
}

module base_layer(i) {
    base_with_magnet_cavities_merged(i);
}

// FINAL BASE INVARIANT: build every Base addition first, then subtract each
// sealed pocket in one Boolean. Program.cs enforces this
// module after its other geometry patches so later generation changes cannot
// accidentally emit magnet circles as separate objects.
module base_with_magnet_cavities_merged(i) {
    difference() {
        linear_extrude(height = sz(i,base_thickness))
            final_base_layer_2d(i);
        tag_component_magnet_cavities_local(i);
        // If the face gap/adjustment detaches an inline symbol, it remains in
        // this shared Base extrusion but receives its own embedded cavity cut.
        if (inline_is_active_for_design(i) && !inline_touches_tag(i))
            inline_component_magnet_cavities_local(i);
    }
}

module inline_base_layer(i) {
    if (inline_is_active_for_design(i)) {
        difference() {
            linear_extrude(height = sz(i,base_thickness))
                inline_base_piece_2d(i);
            inline_component_magnet_cavities_local(i);
        }
    }
}

module rounded_rect_2d(w,h,r) {
    rr = min(r,min(w,h) / 2);
    offset(r = rr)
        square([max(0.01,w - 2 * rr),max(0.01,h - 2 * rr)],center = true);
}

module counter_bridge_2d(i) {
    translate([counter_bridge_x_s(i),counter_bridge_y_s(i)])
        rounded_rect_2d(counter_bridge_length_s(i),counter_bridge_width_s(i),counter_bridge_radius_s(i));
}

module counter_bridge_shadow_circle_2d(i) {
    if (d_counter_bridge_shadow_circle_enabled(i))
        translate([
            counter_bridge_shadow_circle_x_mm(i),
            counter_bridge_shadow_circle_y_mm(i)
        ])
            circle(d = counter_bridge_shadow_circle_diameter_mm(i));
}

// Build the normal Layer 2 name geometry first. Hole detection is deliberately
// not performed here; it happens only after every Layer 2 component exists.
module shadow_layer_2d(i) {
    union() {
        offset(r = shadow_offset_s(i))
            text_shape_2d(i);
        if (d_counter_bridge_enabled(i))
            counter_bridge_2d(i);
        counter_bridge_shadow_circle_2d(i);
    }
}

// Treble Clef uses its former Top artwork as negative detail in Layer 2.
// The cutout is applied only to the symbol Shadow; Layer 1/Base remains solid.
module inline_symbol_shadow_cutout_placed_2d(i) {
    if (inline_is_active_for_design(i) &&
        resolved_inline_symbol_type(i) == "Treble Clef")
        inline_symbol_top_placed_2d(i);
}

module inline_shadow_raw_2d(i) {
    if (inline_is_active_for_design(i))
        difference() {
            offset(r = inline_symbol_shadow_outline_s(i))
                inline_symbol_core_placed_2d(i);
            inline_symbol_shadow_cutout_placed_2d(i);
        }
}

module tag_shadow_raw_2d(i) {
    union() {
        shadow_layer_2d(i);
        repair_parts_for_layer_2d(i,"Shadow");
    }
}

module inline_shadow_piece_2d(i) {
    difference() {
        inline_shadow_raw_2d(i);
        tag_shadow_raw_2d(i);
    }
}

// Complete unfilled Layer 2 geometry after the name, outlines, connector,
// transformed inline symbol, and manual Shadow repairs have been generated.
module final_shadow_raw_2d(i) {
    union() {
        tag_shadow_raw_2d(i);
        inline_shadow_piece_2d(i);
    }
}

// fill(final_shape) preserves the exterior boundary and closes every bounded
// connected component of the complement. Subtracting the original shape
// isolates those enclosed regions as a separate filler object.
module final_shadow_enclosed_fillers_2d(i) {
    // Do not auto-fill Treble Clef's intentional Shadow cutouts.
    difference() {
        difference() {
            fill()
                final_shadow_raw_2d(i);
            final_shadow_raw_2d(i);
        }
        inline_symbol_shadow_cutout_placed_2d(i);
    }
}

// Final Layer 2 = normally generated geometry + enclosed-void fillers only.
module final_shadow_layer_2d(i) {
    union() {
        final_shadow_raw_2d(i);
        final_shadow_enclosed_fillers_2d(i);
    }
}

module shadow_layer(i) {
    if (d_shadow_color_preview(i) != "None") {
        translate([0,0,sz(i,base_thickness)])
            linear_extrude(height = sz(i,shadow_thickness))
                shadow_layer_2d(i);
    }
}

module inline_shadow_layer(i) {
    if (inline_is_active_for_design(i))
        translate([0,0,sz(i,base_thickness)])
            linear_extrude(height = sz(i,shadow_thickness))
                inline_shadow_piece_2d(i);
}

module text_layer(i) {
    z_start = d_shadow_color_preview(i) == "None"
        ? sz(i,base_thickness)
        : sz(i,base_thickness) + sz(i,shadow_thickness);
    translate([0,0,z_start])
        linear_extrude(height = sz(i,text_thickness))
            printable_text_shape_2d(i);
}

module inline_top_piece_2d(i) {
    // Preserve the complete symbol artwork. Older builds subtracted the name
    // text here, which could delete seams/stitches/tape details when an icon
    // was positioned close to the lettering. Automatic gap guards now keep
    // detailed symbols clear while the Base still overlaps for attachment.
    inline_symbol_top_placed_2d(i);
}

module inline_top_layer(i) {
    // Symbol Top is permanently the same thickness as the Shadow layer.
    // Treble Clef is the exception: its former Top artwork is now a hole in
    // the symbol Shadow, so no positive Top object is generated for it.
    if (inline_is_active_for_design(i) &&
        resolved_inline_symbol_type(i) != "Treble Clef")
        translate([0,0,sz(i,base_thickness) + sz(i,shadow_thickness)])
            linear_extrude(height = sz(i,shadow_thickness))
                inline_top_piece_2d(i);
}

module tag_base_color_layer(i) {
    base_layer(i);
}

module tag_shadow_color_layer(i) {
    if (d_shadow_color_preview(i) != "None")
        translate([0,0,sz(i,base_thickness)])
            linear_extrude(height = sz(i,shadow_thickness))
                difference() {
                    final_shadow_layer_2d(i);
                    inline_shadow_piece_2d(i);
                }
}

// Normal Base exports use the one shared tag-colored extrusion.
module combined_base_layer(i) {
    tag_base_color_layer(i);
}

module combined_shadow_layer(i) {
    union() {
        tag_shadow_color_layer(i);
        inline_shadow_layer(i);
    }
}

module combined_top_layer(i) {
    union() {
        text_layer(i);
        if (d_symbol_top_color_preview(i) != "None")
            inline_top_layer(i);
    }
}

module inline_symbol_all_layers(i) {
    if (inline_is_active_for_design(i)) {
        color(rgb(d_base_color_preview(i))) inline_base_layer(i);
        color(rgb(d_symbol_shadow_color_preview(i))) inline_shadow_layer(i);
        if (d_symbol_top_color_preview(i) != "None")
            color(rgb(d_symbol_top_color_preview(i))) inline_top_layer(i);
    }
}

module full_model(i) {
    color(rgb(d_base_color_preview(i))) tag_base_color_layer(i);
    if (d_shadow_color_preview(i) != "None")
        color(rgb(d_shadow_color_preview(i))) tag_shadow_color_layer(i);
    if (inline_is_active_for_design(i))
        color(rgb(d_symbol_shadow_color_preview(i))) inline_shadow_layer(i);
    color(rgb(d_text_color_preview(i))) text_layer(i);
    if (inline_is_active_for_design(i) && d_symbol_top_color_preview(i) != "None")
        color(rgb(d_symbol_top_color_preview(i))) inline_top_layer(i);
}

// ---------- FLOWER1.SVG POLYGON LIBRARY ----------
// flower1.svg was flattened by color, cleaned of its white page background and
// gradient fragments, simplified, centered on the yellow face, and normalized
// to the existing Flower size. These polygons are embedded so generated SCAD
// files do not need the source SVG at runtime.
function flower1_petal_paths() = [
    [[-1.945,16.654],[-3.057,16.135],[-4.034,15.428],[-5.045,14.169],[-5.484,13.256],[-5.859,11.757],[-5.868,11.069],[-5.736,9.517],[-5.322,8.085],[-4.292,5.879],[-2.704,3.544],[-1.112,4.275],[-0.006,4.401],[1.25,4.235],[2.51,3.621],[4.191,6.411],[5.082,8.641],[5.315,9.628],[5.432,11.099],[5.377,11.938],[5.088,13.103],[4.692,14.049],[4.151,14.829],[3.214,15.763],[2.301,16.329],[0.614,16.894],[-0.614,16.912]],
    [[4.344,-1.356],[7.945,-2.257],[10.124,-2.407],[12.09,-2.131],[13.196,-1.694],[14.01,-1.188],[14.883,-0.395],[15.556,0.567],[15.912,1.295],[16.253,2.536],[16.309,3.501],[16.134,4.828],[15.66,6.137],[15.215,6.825],[14.345,7.772],[13.556,8.313],[12.517,8.792],[11.534,9.032],[10.155,9.071],[9.119,8.859],[8.136,8.5],[6.956,7.79],[6.019,7.028],[4.888,5.87],[2.922,3.323],[3.699,2.407],[4.203,1.347],[4.434,-0.011],[4.246,-1.255]],
    [[-15.353,6.509],[-16.02,5.406],[-16.333,4.518],[-16.484,3.326],[-16.459,2.349],[-16.137,1.16],[-15.765,0.33],[-15.341,-0.287],[-14.269,-1.36],[-12.548,-2.266],[-11.138,-2.579],[-10.062,-2.656],[-7.119,-2.327],[-4.234,-1.51],[-4.415,-0.189],[-4.28,1.144],[-3.856,2.165],[-3.002,3.249],[-4.907,5.431],[-6.744,7.108],[-7.875,7.818],[-8.883,8.282],[-9.986,8.565],[-11.546,8.611],[-12.72,8.359],[-13.725,7.922],[-14.616,7.283]],
    [[9.055,-14.792],[10.068,-14.276],[11.061,-13.441],[11.709,-12.617],[12.265,-11.566],[12.619,-10.214],[12.652,-9.505],[12.499,-8.07],[12.188,-7.142],[11.712,-6.276],[11.07,-5.477],[9.417,-4.116],[6.861,-2.813],[4.01,-1.888],[3.303,-2.927],[2.522,-3.612],[1.601,-4.109],[0.412,-4.441],[0.823,-8.306],[1.545,-10.949],[2.123,-12.208],[2.919,-13.296],[3.804,-14.116],[4.649,-14.627],[5.546,-14.977],[6.563,-15.146],[7.859,-15.109]],
    [[-7.939,-15.066],[-6.931,-15.244],[-5.497,-15.158],[-4.501,-14.872],[-3.518,-14.378],[-2.599,-13.613],[-1.754,-12.593],[-1.201,-11.572],[-0.725,-10.27],[-0.172,-7.495],[-0.061,-4.447],[-1.456,-4.174],[-2.369,-3.732],[-3.165,-3.083],[-4.013,-1.968],[-7.558,-3.378],[-9.629,-4.635],[-11.055,-6.017],[-11.685,-7.044],[-11.967,-7.756],[-12.204,-8.985],[-12.213,-9.886],[-12.01,-11.062],[-11.62,-12.092],[-11.018,-13.013],[-9.896,-14.116],[-9.036,-14.639]]
];

function flower1_center_path() =
    [[-0.82,4.343],[-2.412,3.704],[-3.536,2.659],[-4.255,1.24],[-4.421,0.06],[-4.366,-0.736],[-3.801,-2.248],[-3.269,-2.985],[-2.615,-3.569],[-1.392,-4.186],[-0.326,-4.401],[0.713,-4.352],[1.693,-4.066],[2.578,-3.572],[3.327,-2.89],[3.911,-2.048],[4.286,-1.074],[4.421,0.008],[4.354,0.77],[3.838,2.177],[2.888,3.326],[2.283,3.768],[0.863,4.328]];

function flower1_face_points_flat() =
    [for (path = flower1_petal_paths(),point = path) point];

// Smooth upright heart based on the classic parametric heart curve. It is
// centered and normalized to the same nominal drawing size as the Flower.
// The smaller copy becomes the independently colored Top face.
function modern_heart_points() = [
    [0.000,6.500],[0.401,7.317],[0.852,8.066],[1.347,8.747],[1.881,9.359],
    [2.451,9.902],[3.050,10.375],[3.674,10.777],[4.319,11.107],[4.978,11.366],
    [5.648,11.551],[6.324,11.663],[7.000,11.700],[7.903,11.653],[8.759,11.515],
    [9.561,11.292],[10.304,10.989],[10.981,10.611],[11.588,10.162],[12.117,9.650],
    [12.563,9.078],[12.920,8.452],[13.183,7.776],[13.345,7.057],[13.400,6.300],
    [13.333,5.523],[13.138,4.695],[12.824,3.821],[12.400,2.905],[11.876,1.952],
    [11.259,0.967],[10.560,-0.046],[9.787,-1.083],[8.950,-2.138],[8.057,-3.206],
    [7.118,-4.284],[6.141,-5.367],[5.135,-6.449],[4.111,-7.527],[3.076,-8.596],
    [2.040,-9.651],[1.011,-10.687],[0.000,-11.700],[-1.011,-10.687],[-2.040,-9.651],
    [-3.076,-8.596],[-4.111,-7.527],[-5.135,-6.449],[-6.141,-5.367],[-7.118,-4.284],
    [-8.057,-3.206],[-8.950,-2.138],[-9.787,-1.083],[-10.560,-0.046],[-11.259,0.967],
    [-11.876,1.952],[-12.400,2.905],[-12.824,3.821],[-13.138,4.695],[-13.333,5.523],
    [-13.400,6.300],[-13.345,7.057],[-13.183,7.776],[-12.920,8.452],[-12.563,9.078],
    [-12.117,9.650],[-11.588,10.162],[-10.981,10.611],[-10.304,10.989],[-9.561,11.292],
    [-8.759,11.515],[-7.903,11.653],[-7.000,11.700],[-6.324,11.663],[-5.648,11.551],
    [-4.978,11.366],[-4.319,11.107],[-3.674,10.777],[-3.050,10.375],[-2.451,9.902],
    [-1.881,9.359],[-1.347,8.747],[-0.852,8.066],[-0.401,7.317]
];

// Legacy parametric heart retained only as a reference. The active Heart uses
// the exact SVG-derived contours embedded below.
function legacy_heart_face_path(scale_factor = 1) = [
    for (point = modern_heart_points())
        [point[0] * scale_factor, point[1] * scale_factor]
];

// Legacy inset companion for the unused parametric heart.
function legacy_heart_top_path() = legacy_heart_face_path(0.9);

// ---------- ROUNDED LAYERED HEART SVG POLYGON LIBRARY ----------
// Embedded from rounded-layered-heart.svg so generated SCAD files remain
// portable. SVG cubic curves are sampled densely, centered, Y-flipped, and
// normalized to the standard 26.8 mm symbol size.
// Outer = tag Base color, Face = Symbol Shadow color, Top = Symbol Top color.
function heart_outer_path() = [
    [0.000,-13.400],
    [-0.301,-13.173],
    [-0.802,-12.807],
    [-1.477,-12.310],
    [-2.298,-11.689],
    [-3.237,-10.951],
    [-4.267,-10.104],
    [-5.361,-9.154],
    [-6.491,-8.109],
    [-7.630,-6.976],
    [-8.751,-5.763],
    [-9.826,-4.476],
    [-10.828,-3.123],
    [-11.730,-1.712],
    [-12.503,-0.248],
    [-13.121,1.259],
    [-13.557,2.804],
    [-13.687,3.567],
    [-13.756,4.335],
    [-13.763,5.102],
    [-13.710,5.864],
    [-13.595,6.617],
    [-13.420,7.355],
    [-13.185,8.074],
    [-12.891,8.769],
    [-12.537,9.436],
    [-12.123,10.070],
    [-11.651,10.666],
    [-11.121,11.219],
    [-10.532,11.726],
    [-9.886,12.180],
    [-9.182,12.579],
    [-8.421,12.916],
    [-7.817,13.120],
    [-7.215,13.268],
    [-6.617,13.360],
    [-6.024,13.399],
    [-5.439,13.385],
    [-4.862,13.321],
    [-4.297,13.208],
    [-3.744,13.047],
    [-3.206,12.841],
    [-2.684,12.590],
    [-2.181,12.296],
    [-1.697,11.960],
    [-1.235,11.585],
    [-0.798,11.172],
    [-0.385,10.722],
    [0.000,10.236],
    [0.385,10.722],
    [0.798,11.172],
    [1.235,11.585],
    [1.697,11.960],
    [2.181,12.296],
    [2.684,12.590],
    [3.206,12.841],
    [3.744,13.047],
    [4.297,13.208],
    [4.862,13.321],
    [5.439,13.385],
    [6.024,13.399],
    [6.617,13.360],
    [7.215,13.268],
    [7.817,13.120],
    [8.421,12.916],
    [9.182,12.579],
    [9.886,12.180],
    [10.532,11.726],
    [11.121,11.219],
    [11.651,10.666],
    [12.123,10.070],
    [12.537,9.436],
    [12.891,8.769],
    [13.185,8.074],
    [13.420,7.355],
    [13.595,6.617],
    [13.710,5.864],
    [13.763,5.102],
    [13.756,4.335],
    [13.687,3.567],
    [13.557,2.804],
    [13.121,1.259],
    [12.503,-0.248],
    [11.730,-1.712],
    [10.828,-3.123],
    [9.826,-4.476],
    [8.751,-5.763],
    [7.630,-6.976],
    [6.491,-8.109],
    [5.361,-9.154],
    [4.267,-10.104],
    [3.237,-10.951],
    [2.298,-11.689],
    [1.477,-12.310],
    [0.802,-12.807],
    [0.301,-13.173]
];

function heart_face_path() = [
    [0.000,-11.167],
    [-0.258,-10.970],
    [-0.682,-10.659],
    [-1.248,-10.240],
    [-1.935,-9.718],
    [-2.720,-9.099],
    [-3.580,-8.391],
    [-4.492,-7.597],
    [-5.435,-6.725],
    [-6.384,-5.781],
    [-7.318,-4.770],
    [-8.213,-3.699],
    [-9.048,-2.573],
    [-9.799,-1.398],
    [-10.443,-0.181],
    [-10.959,1.073],
    [-11.324,2.358],
    [-11.435,2.994],
    [-11.495,3.634],
    [-11.502,4.273],
    [-11.459,4.907],
    [-11.364,5.533],
    [-11.219,6.146],
    [-11.023,6.744],
    [-10.777,7.322],
    [-10.482,7.876],
    [-10.137,8.403],
    [-9.743,8.899],
    [-9.301,9.360],
    [-8.810,9.782],
    [-8.271,10.162],
    [-7.684,10.495],
    [-7.049,10.779],
    [-6.547,10.946],
    [-6.047,11.067],
    [-5.549,11.143],
    [-5.055,11.174],
    [-4.568,11.163],
    [-4.087,11.109],
    [-3.615,11.015],
    [-3.154,10.882],
    [-2.704,10.711],
    [-2.267,10.503],
    [-1.844,10.259],
    [-1.438,9.980],
    [-1.049,9.668],
    [-0.678,9.325],
    [-0.328,8.950],
    [0.000,8.546],
    [0.328,8.950],
    [0.678,9.325],
    [1.049,9.668],
    [1.438,9.980],
    [1.844,10.259],
    [2.267,10.503],
    [2.704,10.711],
    [3.154,10.882],
    [3.615,11.015],
    [4.087,11.109],
    [4.568,11.163],
    [5.055,11.174],
    [5.549,11.143],
    [6.047,11.067],
    [6.547,10.946],
    [7.049,10.779],
    [7.684,10.495],
    [8.271,10.162],
    [8.810,9.782],
    [9.301,9.360],
    [9.743,8.899],
    [10.137,8.403],
    [10.482,7.876],
    [10.777,7.322],
    [11.023,6.744],
    [11.219,6.146],
    [11.364,5.533],
    [11.459,4.907],
    [11.502,4.273],
    [11.495,3.634],
    [11.435,2.994],
    [11.324,2.358],
    [10.959,1.073],
    [10.443,-0.181],
    [9.799,-1.398],
    [9.048,-2.573],
    [8.213,-3.699],
    [7.318,-4.770],
    [6.384,-5.781],
    [5.435,-6.725],
    [4.492,-7.597],
    [3.580,-8.391],
    [2.720,-9.099],
    [1.935,-9.718],
    [1.248,-10.240],
    [0.682,-10.659],
    [0.258,-10.970]
];

function heart_top_path() = [
    [0.000,-8.998],
    [-0.209,-8.838],
    [-0.549,-8.587],
    [-1.001,-8.251],
    [-1.549,-7.834],
    [-2.174,-7.341],
    [-2.857,-6.777],
    [-3.582,-6.146],
    [-4.330,-5.453],
    [-5.083,-4.703],
    [-5.824,-3.901],
    [-6.534,-3.051],
    [-7.195,-2.157],
    [-7.790,-1.226],
    [-8.300,-0.261],
    [-8.708,0.733],
    [-8.995,1.751],
    [-9.082,2.256],
    [-9.129,2.763],
    [-9.134,3.269],
    [-9.099,3.771],
    [-9.023,4.267],
    [-8.908,4.752],
    [-8.752,5.225],
    [-8.557,5.683],
    [-8.322,6.122],
    [-8.047,6.539],
    [-7.733,6.931],
    [-7.380,7.296],
    [-6.989,7.630],
    [-6.558,7.930],
    [-6.089,8.194],
    [-5.582,8.418],
    [-5.177,8.554],
    [-4.774,8.653],
    [-4.376,8.714],
    [-3.983,8.740],
    [-3.596,8.731],
    [-3.216,8.688],
    [-2.844,8.613],
    [-2.480,8.506],
    [-2.126,8.368],
    [-1.783,8.201],
    [-1.451,8.005],
    [-1.132,7.781],
    [-0.827,7.531],
    [-0.536,7.255],
    [-0.260,6.955],
    [0.000,6.632],
    [0.260,6.955],
    [0.536,7.255],
    [0.827,7.531],
    [1.132,7.781],
    [1.451,8.005],
    [1.783,8.201],
    [2.126,8.368],
    [2.480,8.506],
    [2.844,8.613],
    [3.216,8.688],
    [3.596,8.731],
    [3.983,8.740],
    [4.376,8.714],
    [4.774,8.653],
    [5.177,8.554],
    [5.582,8.418],
    [6.089,8.194],
    [6.558,7.930],
    [6.989,7.630],
    [7.380,7.296],
    [7.733,6.931],
    [8.047,6.539],
    [8.322,6.122],
    [8.557,5.683],
    [8.752,5.225],
    [8.908,4.752],
    [9.023,4.267],
    [9.099,3.771],
    [9.134,3.269],
    [9.129,2.763],
    [9.082,2.256],
    [8.995,1.751],
    [8.708,0.733],
    [8.300,-0.261],
    [7.790,-1.226],
    [7.195,-2.157],
    [6.534,-3.051],
    [5.824,-3.901],
    [5.083,-4.703],
    [4.330,-5.453],
    [3.582,-6.146],
    [2.857,-6.777],
    [2.174,-7.341],
    [1.549,-7.834],
    [1.001,-8.251],
    [0.549,-8.587],
    [0.209,-8.838]
];

// ---------- CONNECTED DOUBLE MUSIC NOTE ----------
// Uses the exact traced silhouette supplied for the Music Note collection item.
function music_note_face_points_flat() = v17_double_note_face_points_flat();

module music_note_core_2d() {
    // Strengthen both vertical stems and the top beam before layering.
    offset(r = 0.55)
        v17_double_note_core_2d();
}

module music_note_top_2d() {
    // Preserve the supplied outer silhouette while keeping the collection's
    // normal Shadow border and independently colored Top face.
    // A smaller inset leaves substantially thicker visible left/right stems.
    offset(delta = -0.25)
        v17_double_note_core_2d();
}

module music_note_base_bridge_2d(i) {
    // Fill only the Base-layer gap between the final letter and the note.
    // The Shadow and Top layers remain independent, preserving the white gap.
    if (inline_is_active_for_design(i) &&
        resolved_inline_symbol_type(i) == "Music Note") {
        bridge_scale = inline_symbol_xy_scale(i);
        bridge_radius = max(1.4,1.7 * bridge_scale);
        bridge_y = inline_symbol_center_y(i) - 2.5 * bridge_scale;
        name_anchor_x = name_base_right(i) - 0.8 * overall_xy_scale(i);
        note_anchor_x =
            inline_symbol_center_x(i) +
            (-6.2 - 0.55) * bridge_scale -
            inline_symbol_base_outline_s(i) +
            0.8 * overall_xy_scale(i);

        hull() {
            translate([name_anchor_x,bridge_y])
                circle(r = bridge_radius);
            translate([note_anchor_x,bridge_y])
                circle(r = bridge_radius);
        }
    }
}

function symbol_art_face_points_flat(symbol_name) =
    symbol_name == "Flower" ? flower1_face_points_flat() :
    symbol_name == "Heart" ? heart_face_path() :
    symbol_name == "Football" ? football_face_points_flat() :
    symbol_name == "Soccer Ball" ? soccer_ball_face_path() :
    symbol_name == "Baseball" ? baseball_face_path() :
    symbol_name == "Basketball" ? basketball_face_path() :
    symbol_name == "Volleyball" ? volleyball_face_path() :
    symbol_name == "Hockey" ? hockey_face_path() :
    symbol_name == "Lacrosse" ? v17_lacrosse_face_points_flat() :
    symbol_name == "Pencil" ? v17_pencil_face_points_flat() :
    symbol_name == "Music Note" ? music_note_face_points_flat() :
    symbol_name == "Double Note" ? v17_double_note_face_points_flat() :
    symbol_name == "Treble Clef" ? v17_treble_face_points_flat() :
    symbol_name == "Racket" ? racket_face_points_flat() :
    [];

function symbol_art_bounds(symbol_name) =
    symbol_name == "Flower"
        ? [-16.496,16.318,-15.247,16.919]
        : symbol_name == "Heart"
        ? [-11.506,11.506,-11.168,11.176]
        : symbol_name == "Football"
        ? [-16.4,16.4,-9.279,9.279]
        : symbol_name == "Soccer Ball"
        ? [-16.4,16.4,-16.4,16.4]
        : symbol_name == "Baseball"
        ? [-16.4,16.4,-16.4,16.4]
        : symbol_name == "Basketball"
        ? [-16.4,16.4,-16.4,16.4]
        : symbol_name == "Volleyball"
        ? [-16.4,16.4,-16.4,16.4]
        : symbol_name == "Hockey"
        ? [-16.395,16.368,-15.639,15.637]
        : symbol_name == "Lacrosse"
        ? [-12.5723,12.5723,-16.4,16.4]
        : symbol_name == "Pencil"
        ? [-14.3921,14.3921,-16.4,16.4]
        : symbol_name == "Music Note"
        ? [-14.3272,14.3272,-16.4,16.4]
        : symbol_name == "Double Note"
        ? [-14.3272,14.3272,-16.4,16.4]
        : symbol_name == "Treble Clef"
        ? [-6.1991,6.1991,-16.4,16.4]
        : symbol_name == "Racket"
        ? [-12.5341,12.5341,-16.4,16.4]
        : [0,0,0,0];

function flower1_center_scale() = 1.15;

module flower1_center_2d() {
    scale([flower1_center_scale(), flower1_center_scale()])
        polygon(points = flower1_center_path());
}

module flower_face_2d() {
    // Keep the center filled in the Flower core/shadow geometry. The separate
    // Top center can still cover this area with another color. If Symbol Top
    // Color is None, the center therefore remains the Symbol Shadow Color
    // instead of exposing the tag layer underneath.
    union() {
        for (path = flower1_petal_paths())
            polygon(points = path);
        flower1_center_2d();
    }
}

module symbol_art_core_2d(symbol_name) {
    if (symbol_name == "Flower")
        flower_face_2d();
    else if (symbol_name == "Heart")
        polygon(points = heart_face_path());
    else if (symbol_name == "Football")
        polygon(points = football_face_path());
    else if (symbol_name == "Soccer Ball")
        polygon(points = soccer_ball_face_path());
    else if (symbol_name == "Baseball")
        polygon(points = baseball_face_path());
    else if (symbol_name == "Basketball")
        polygon(points = basketball_face_path());
    else if (symbol_name == "Volleyball")
        polygon(points = volleyball_face_path());
    else if (symbol_name == "Hockey")
        polygon(points = hockey_face_path());
    else if (symbol_name == "Lacrosse")
        v17_lacrosse_core_2d();
    else if (symbol_name == "Pencil")
        union() {
            v17_pencil_core_2d();
            // Guarantee every Top detail has Shadow material directly below it.
            v17_pencil_top_boolean_2d();
        }
    else if (symbol_name == "Music Note")
        music_note_core_2d();
    else if (symbol_name == "Double Note")
        offset(r = 0.25)
            v17_double_note_core_2d();
    else if (symbol_name == "Treble Clef")
        v17_treble_core_2d();
    else if (symbol_name == "Racket")
        union() {
            v17_racket_core_2d();
            // The grip/frame detail used to extend through small holes in the
            // Shadow core. Back it with Shadow so no Top stripe can float.
            racket_face_2d();
        }
}

module symbol_art_top_2d(symbol_name) {
    if (symbol_name == "Flower")
        flower1_center_2d();
    else if (symbol_name == "Heart")
        polygon(points = heart_top_path());
    else if (symbol_name == "Football")
        union()
            for (path = football_top_paths())
                polygon(points = path);
    else if (symbol_name == "Soccer Ball")
        difference() {
            polygon(points = soccer_ball_face_path());
            union()
                for (path = soccer_ball_light_panel_paths())
                    polygon(points = path);
        }
    else if (symbol_name == "Baseball")
        baseball_svg_black_2d();
    else if (symbol_name == "Basketball")
        scale([1.10, 1.10])
            basketball_svg_black_2d();
    else if (symbol_name == "Volleyball")
        volleyball_svg_black_2d();
    else if (symbol_name == "Hockey")
        union()
            // Shrink each tape panel independently so the Shadow color remains
            // visible between panels. This restores the grip/blade tape lines
            // that were merging into solid blocks in earlier builds.
            for (path = hockey_top_paths())
                offset(delta = -0.18)
                    polygon(points = path);
    else if (symbol_name == "Lacrosse")
        v17_lacrosse_top_boolean_2d();
    else if (symbol_name == "Pencil")
        v17_pencil_top_boolean_2d();
    else if (symbol_name == "Music Note")
        music_note_top_2d();
    else if (symbol_name == "Treble Clef")
        v17_treble_top_boolean_2d();
    else if (symbol_name == "Racket")
        racket_face_2d();
}



// ---------- BASKETBALL SYMBOL LIBRARY ----------
// Exact SVG-derived basketball: the Symbol Shadow layer uses the original
// outer silhouette, and the Symbol Top layer uses the original interior
// channel regions from the uploaded SVG. Top Color None leaves the body only.
function basketball_face_path() = [[-0.186,16.323],[1.611,16.292],[1.642,16.261],[1.982,16.261],[2.013,16.23],[2.261,16.23],[2.292,16.199],[3.128,16.106],[4.894,15.703],[6.411,15.177],[6.629,15.083],[6.844,14.988],[7.057,14.891],[7.268,14.791],[7.477,14.688],[7.683,14.584],[7.887,14.477],[8.089,14.368],[8.288,14.257],[8.485,14.144],[8.68,14.028],[8.873,13.91],[9.063,13.79],[9.251,13.667],[9.437,13.542],[9.621,13.415],[9.802,13.286],[9.981,13.154],[10.158,13.02],[10.333,12.884],[10.505,12.745],[10.675,12.605],[10.842,12.462],[11.008,12.316],[11.171,12.169],[11.332,12.019],[11.491,11.867],[11.647,11.713],[11.801,11.556],[11.953,11.397],[12.102,11.236],[12.25,11.073],[12.376,10.934],[12.501,10.793],[12.623,10.651],[12.745,10.507],[12.864,10.361],[12.982,10.214],[13.098,10.064],[13.212,9.914],[13.325,9.761],[13.436,9.607],[13.545,9.451],[13.652,9.293],[13.758,9.133],[13.862,8.972],[13.964,8.809],[14.065,8.644],[14.163,8.478],[14.261,8.31],[14.356,8.14],[14.45,7.969],[14.542,7.795],[14.632,7.62],[14.72,7.444],[14.807,7.265],[14.892,7.085],[14.976,6.903],[15.057,6.72],[15.137,6.535],[15.216,6.348],[15.292,6.159],[15.367,5.969],[15.44,5.776],[15.873,4.383],[16.214,2.741],[16.307,1.781],[16.338,1.75],[16.338,1.378],[16.369,1.347],[16.4,-0.201],[16.369,-0.232],[16.369,-0.883],[16.338,-0.914],[16.338,-1.254],[16.307,-1.285],[16.276,-1.812],[15.997,-3.392],[15.564,-4.971],[15.13,-6.117],[15.041,-6.321],[14.951,-6.522],[14.858,-6.722],[14.763,-6.919],[14.667,-7.115],[14.568,-7.309],[14.468,-7.501],[14.366,-7.691],[14.261,-7.879],[14.155,-8.065],[14.047,-8.25],[13.937,-8.432],[13.826,-8.613],[13.712,-8.791],[13.596,-8.968],[13.479,-9.142],[13.359,-9.315],[13.238,-9.486],[13.114,-9.655],[12.989,-9.822],[12.862,-9.987],[12.733,-10.15],[12.602,-10.312],[12.469,-10.471],[12.334,-10.628],[12.197,-10.784],[12.058,-10.937],[11.918,-11.089],[11.775,-11.239],[11.631,-11.387],[11.484,-11.533],[11.336,-11.677],[11.192,-11.817],[11.046,-11.956],[10.898,-12.093],[10.749,-12.228],[10.597,-12.361],[10.444,-12.492],[10.288,-12.621],[10.131,-12.748],[9.972,-12.874],[9.811,-12.997],[9.648,-13.119],[9.483,-13.239],[9.317,-13.357],[9.148,-13.473],[8.978,-13.587],[8.806,-13.699],[8.631,-13.81],[8.455,-13.918],[8.277,-14.025],[8.097,-14.129],[7.916,-14.232],[7.732,-14.333],[7.547,-14.432],[7.359,-14.529],[7.17,-14.625],[6.979,-14.718],[6.786,-14.809],[6.591,-14.899],[6.394,-14.987],[6.195,-15.073],[5.994,-15.156],[5.792,-15.239],[4.305,-15.734],[2.509,-16.137],[2.323,-16.137],[1.858,-16.23],[1.611,-16.23],[1.58,-16.261],[0.836,-16.292],[0.805,-16.323],[-0.929,-16.323],[-0.96,-16.292],[-1.363,-16.292],[-1.394,-16.261],[-1.703,-16.261],[-1.734,-16.23],[-2.416,-16.168],[-4.181,-15.796],[-4.271,-15.771],[-4.361,-15.745],[-4.45,-15.719],[-4.539,-15.693],[-4.628,-15.666],[-4.716,-15.639],[-4.804,-15.612],[-4.891,-15.584],[-4.978,-15.556],[-5.065,-15.528],[-5.151,-15.499],[-5.237,-15.469],[-5.322,-15.44],[-5.407,-15.41],[-5.492,-15.379],[-5.577,-15.348],[-5.661,-15.317],[-5.744,-15.286],[-5.828,-15.254],[-5.91,-15.222],[-5.993,-15.189],[-6.075,-15.156],[-6.157,-15.122],[-6.238,-15.089],[-6.319,-15.055],[-6.4,-15.02],[-6.48,-14.985],[-6.56,-14.95],[-6.64,-14.914],[-6.719,-14.878],[-6.798,-14.842],[-6.876,-14.805],[-7.058,-14.716],[-7.238,-14.625],[-7.417,-14.533],[-7.594,-14.439],[-7.77,-14.344],[-7.944,-14.247],[-8.116,-14.148],[-8.287,-14.048],[-8.456,-13.946],[-8.624,-13.843],[-8.79,-13.738],[-8.954,-13.631],[-9.117,-13.523],[-9.278,-13.413],[-9.438,-13.302],[-9.596,-13.189],[-9.753,-13.074],[-9.907,-12.958],[-10.061,-12.841],[-10.212,-12.721],[-10.363,-12.6],[-10.511,-12.478],[-10.658,-12.354],[-10.803,-12.228],[-10.947,-12.101],[-11.089,-11.972],[-11.23,-11.842],[-11.369,-11.71],[-11.506,-11.576],[-11.642,-11.441],[-11.776,-11.304],[-11.909,-11.166],[-12.045,-11.025],[-12.178,-10.883],[-12.31,-10.739],[-12.44,-10.594],[-12.569,-10.446],[-12.695,-10.297],[-12.82,-10.146],[-12.943,-9.993],[-13.064,-9.838],[-13.183,-9.681],[-13.3,-9.523],[-13.416,-9.362],[-13.53,-9.2],[-13.642,-9.037],[-13.752,-8.871],[-13.86,-8.703],[-13.967,-8.534],[-14.071,-8.363],[-14.174,-8.19],[-14.275,-8.015],[-14.375,-7.839],[-14.472,-7.66],[-14.568,-7.48],[-14.662,-7.298],[-14.754,-7.114],[-14.844,-6.928],[-14.932,-6.741],[-15.019,-6.552],[-15.104,-6.361],[-15.187,-6.168],[-15.268,-5.973],[-15.347,-5.776],[-15.812,-4.383],[-16.028,-3.515],[-16.245,-2.338],[-16.307,-1.595],[-16.338,-1.564],[-16.338,-1.254],[-16.369,-1.223],[-16.4,0.573],[-16.369,0.604],[-16.369,1.131],[-16.338,1.161],[-16.338,1.502],[-16.307,1.533],[-16.276,2.029],[-15.997,3.577],[-15.533,5.188],[-14.944,6.644],[-14.851,6.839],[-14.755,7.032],[-14.658,7.223],[-14.559,7.412],[-14.458,7.6],[-14.355,7.785],[-14.251,7.969],[-14.144,8.151],[-14.036,8.331],[-13.926,8.509],[-13.813,8.685],[-13.699,8.86],[-13.583,9.032],[-13.466,9.203],[-13.346,9.372],[-13.225,9.539],[-13.101,9.704],[-12.976,9.867],[-12.849,10.028],[-12.72,10.188],[-12.589,10.345],[-12.456,10.501],[-12.322,10.655],[-12.185,10.807],[-12.047,10.957],[-11.907,11.105],[-11.765,11.252],[-11.621,11.396],[-11.475,11.539],[-11.327,11.68],[-11.178,11.818],[-11.026,11.955],[-10.9,12.07],[-10.772,12.183],[-10.643,12.295],[-10.512,12.406],[-10.38,12.515],[-10.247,12.623],[-10.113,12.729],[-9.977,12.834],[-9.84,12.938],[-9.701,13.041],[-9.562,13.142],[-9.421,13.242],[-9.278,13.34],[-9.134,13.438],[-8.989,13.533],[-8.843,13.628],[-8.695,13.721],[-8.546,13.813],[-8.395,13.904],[-8.244,13.993],[-8.09,14.081],[-7.936,14.167],[-7.78,14.253],[-7.623,14.336],[-7.465,14.419],[-7.305,14.5],[-7.144,14.58],[-6.981,14.659],[-6.818,14.736],[-6.653,14.812],[-6.486,14.887],[-6.318,14.96],[-4.801,15.517],[-3.283,15.92],[-1.92,16.168],[-1.146,16.23],[-1.115,16.261],[-0.774,16.261],[-0.743,16.292],[-0.217,16.292]];

// Removed unused legacy definition: basketball_top_paths


// ---------- VOLLEYBALL SYMBOL LIBRARY ----------
// Exact SVG-derived volleyball: the Symbol Shadow layer uses the original
// outer silhouette, and the Symbol Top layer uses the original interior panel
// regions from the uploaded SVG. Top Color None leaves the body only.
function volleyball_face_path() = [[-0.057,16.4],[0.542,16.4],[0.57,16.371],[1.169,16.371],[1.198,16.343],[1.854,16.314],[1.882,16.286],[2.31,16.257],[2.339,16.229],[2.71,16.2],[2.881,16.143],[3.309,16.086],[4.649,15.744],[6.332,15.117],[6.531,15.026],[6.728,14.933],[6.923,14.839],[7.116,14.742],[7.308,14.644],[7.497,14.544],[7.684,14.441],[7.87,14.337],[8.053,14.231],[8.235,14.123],[8.414,14.013],[8.592,13.901],[8.768,13.787],[8.941,13.671],[9.113,13.553],[9.283,13.433],[9.451,13.311],[9.617,13.188],[9.781,13.062],[9.943,12.934],[10.103,12.805],[10.262,12.673],[10.418,12.54],[10.572,12.405],[10.724,12.267],[10.875,12.128],[11.023,11.987],[11.17,11.844],[11.315,11.699],[11.457,11.552],[11.598,11.403],[11.737,11.252],[11.867,11.107],[11.996,10.96],[12.123,10.812],[12.249,10.663],[12.373,10.511],[12.495,10.358],[12.616,10.203],[12.735,10.047],[12.853,9.889],[12.969,9.73],[13.083,9.568],[13.195,9.405],[13.306,9.241],[13.415,9.075],[13.523,8.907],[13.629,8.738],[13.733,8.567],[13.836,8.394],[13.937,8.22],[14.037,8.044],[14.135,7.866],[14.231,7.687],[14.325,7.506],[14.418,7.323],[14.509,7.139],[14.599,6.953],[14.687,6.766],[14.773,6.577],[14.858,6.386],[14.941,6.194],[15.022,6],[15.102,5.804],[15.473,4.777],[15.73,3.865],[15.73,3.751],[15.958,2.838],[16.043,2.153],[16.101,1.954],[16.101,1.754],[16.129,1.726],[16.158,1.212],[16.186,1.184],[16.243,-0.414],[16.215,-0.442],[16.215,-1.212],[16.186,-1.241],[16.158,-1.868],[16.129,-1.897],[16.072,-2.524],[15.872,-3.637],[15.53,-4.92],[15.511,-4.979],[15.492,-5.037],[15.473,-5.096],[15.454,-5.154],[15.434,-5.212],[15.415,-5.27],[15.395,-5.328],[15.375,-5.385],[15.355,-5.443],[15.335,-5.5],[15.314,-5.557],[15.293,-5.614],[15.273,-5.671],[15.252,-5.727],[15.231,-5.784],[15.209,-5.84],[15.188,-5.896],[15.166,-5.952],[15.144,-6.008],[15.122,-6.063],[15.1,-6.118],[15.078,-6.174],[15.055,-6.229],[15.033,-6.284],[15.01,-6.338],[14.987,-6.393],[14.964,-6.447],[14.94,-6.502],[14.917,-6.556],[14.893,-6.61],[14.87,-6.663],[14.846,-6.717],[14.756,-6.912],[14.664,-7.106],[14.57,-7.297],[14.475,-7.487],[14.377,-7.675],[14.278,-7.861],[14.177,-8.045],[14.074,-8.227],[13.969,-8.407],[13.862,-8.586],[13.754,-8.762],[13.643,-8.937],[13.531,-9.11],[13.416,-9.281],[13.3,-9.45],[13.182,-9.617],[13.062,-9.782],[12.94,-9.946],[12.817,-10.107],[12.691,-10.267],[12.564,-10.424],[12.434,-10.58],[12.303,-10.734],[12.17,-10.887],[12.035,-11.037],[11.898,-11.185],[11.76,-11.332],[11.619,-11.476],[11.477,-11.619],[11.332,-11.76],[11.186,-11.899],[11.038,-12.036],[10.894,-12.171],[10.749,-12.303],[10.601,-12.434],[10.452,-12.563],[10.301,-12.69],[10.148,-12.815],[9.994,-12.939],[9.837,-13.06],[9.679,-13.18],[9.519,-13.298],[9.357,-13.414],[9.193,-13.528],[9.027,-13.641],[8.86,-13.751],[8.691,-13.86],[8.519,-13.967],[8.347,-14.072],[8.172,-14.176],[7.995,-14.277],[7.817,-14.377],[7.636,-14.475],[7.454,-14.571],[7.271,-14.665],[7.085,-14.757],[6.897,-14.848],[6.708,-14.936],[6.517,-15.023],[6.324,-15.108],[6.129,-15.192],[5.932,-15.273],[5.734,-15.353],[5.533,-15.43],[4.193,-15.858],[2.481,-16.229],[2.282,-16.229],[1.626,-16.343],[1.341,-16.343],[1.312,-16.371],[0.884,-16.371],[0.856,-16.4],[-0.77,-16.4],[-0.799,-16.371],[-1.226,-16.371],[-1.255,-16.343],[-1.512,-16.343],[-1.54,-16.314],[-1.797,-16.314],[-2.025,-16.257],[-2.424,-16.229],[-4.022,-15.887],[-5.334,-15.487],[-6.788,-14.888],[-6.976,-14.798],[-7.163,-14.705],[-7.348,-14.611],[-7.531,-14.515],[-7.712,-14.417],[-7.891,-14.318],[-8.069,-14.216],[-8.245,-14.113],[-8.419,-14.008],[-8.591,-13.902],[-8.762,-13.793],[-8.931,-13.683],[-9.098,-13.571],[-9.263,-13.457],[-9.427,-13.342],[-9.588,-13.225],[-9.748,-13.106],[-9.907,-12.985],[-10.063,-12.863],[-10.218,-12.738],[-10.371,-12.612],[-10.522,-12.484],[-10.671,-12.355],[-10.819,-12.224],[-10.965,-12.09],[-11.109,-11.956],[-11.251,-11.819],[-11.392,-11.68],[-11.531,-11.54],[-11.668,-11.398],[-11.803,-11.255],[-11.936,-11.109],[-12.005,-11.034],[-12.074,-10.958],[-12.142,-10.882],[-12.21,-10.805],[-12.277,-10.728],[-12.344,-10.65],[-12.41,-10.572],[-12.476,-10.494],[-12.542,-10.415],[-12.607,-10.336],[-12.672,-10.256],[-12.736,-10.176],[-12.8,-10.096],[-12.863,-10.015],[-12.926,-9.933],[-12.989,-9.851],[-13.051,-9.769],[-13.113,-9.687],[-13.174,-9.604],[-13.235,-9.52],[-13.295,-9.436],[-13.356,-9.352],[-13.415,-9.267],[-13.474,-9.182],[-13.533,-9.096],[-13.592,-9.01],[-13.649,-8.924],[-13.707,-8.837],[-13.764,-8.75],[-13.821,-8.662],[-13.877,-8.574],[-13.933,-8.485],[-13.983,-8.407],[-14.032,-8.328],[-14.081,-8.248],[-14.13,-8.169],[-14.178,-8.088],[-14.225,-8.007],[-14.272,-7.926],[-14.319,-7.845],[-14.365,-7.762],[-14.411,-7.68],[-14.456,-7.597],[-14.501,-7.513],[-14.545,-7.429],[-14.589,-7.345],[-14.633,-7.26],[-14.676,-7.175],[-14.718,-7.089],[-14.761,-7.003],[-14.802,-6.916],[-14.843,-6.829],[-14.884,-6.741],[-14.924,-6.653],[-14.964,-6.564],[-15.004,-6.476],[-15.042,-6.386],[-15.081,-6.296],[-15.119,-6.206],[-15.156,-6.115],[-15.193,-6.024],[-15.23,-5.932],[-15.266,-5.84],[-15.302,-5.747],[-15.673,-4.606],[-16.043,-2.923],[-16.129,-2.096],[-16.158,-2.068],[-16.158,-1.84],[-16.186,-1.811],[-16.186,-1.469],[-16.215,-1.44],[-16.243,0.442],[-16.215,0.471],[-16.215,1.041],[-16.186,1.07],[-16.186,1.412],[-16.129,1.669],[-16.129,1.925],[-16.101,1.954],[-16.043,2.553],[-15.901,3.323],[-15.53,4.777],[-15.51,4.84],[-15.491,4.902],[-15.471,4.964],[-15.45,5.026],[-15.43,5.087],[-15.409,5.149],[-15.389,5.21],[-15.368,5.271],[-15.347,5.332],[-15.326,5.393],[-15.304,5.454],[-15.283,5.514],[-15.261,5.574],[-15.239,5.634],[-15.217,5.694],[-15.195,5.754],[-15.173,5.814],[-15.15,5.873],[-15.127,5.933],[-15.104,5.992],[-15.081,6.051],[-15.058,6.11],[-15.035,6.168],[-15.011,6.227],[-14.988,6.285],[-14.964,6.343],[-14.94,6.401],[-14.916,6.459],[-14.891,6.516],[-14.867,6.574],[-14.842,6.631],[-14.817,6.688],[-14.73,6.875],[-14.642,7.061],[-14.552,7.244],[-14.461,7.426],[-14.367,7.607],[-14.272,7.785],[-14.175,7.962],[-14.077,8.137],[-13.977,8.311],[-13.875,8.483],[-13.772,8.653],[-13.667,8.821],[-13.56,8.988],[-13.451,9.153],[-13.341,9.317],[-13.229,9.478],[-13.116,9.639],[-13,9.797],[-12.883,9.954],[-12.765,10.109],[-12.644,10.262],[-12.522,10.413],[-12.398,10.563],[-12.273,10.712],[-12.146,10.858],[-12.017,11.003],[-11.887,11.146],[-11.755,11.288],[-11.621,11.427],[-11.485,11.565],[-11.348,11.702],[-11.209,11.837],[-11.08,11.96],[-10.95,12.082],[-10.819,12.203],[-10.685,12.322],[-10.551,12.439],[-10.414,12.555],[-10.277,12.67],[-10.137,12.783],[-9.996,12.894],[-9.854,13.004],[-9.71,13.112],[-9.565,13.219],[-9.418,13.324],[-9.269,13.428],[-9.119,13.53],[-8.967,13.631],[-8.814,13.73],[-8.659,13.827],[-8.503,13.923],[-8.345,14.018],[-8.186,14.11],[-8.025,14.202],[-7.863,14.292],[-7.699,14.38],[-7.533,14.467],[-7.366,14.552],[-7.198,14.636],[-7.028,14.718],[-6.856,14.798],[-6.683,14.877],[-6.508,14.955],[-6.332,15.031],[-4.506,15.687],[-3.337,16.001],[-1.911,16.257],[-1.683,16.257],[-1.398,16.314],[-1.084,16.314],[-1.055,16.343],[-0.685,16.343],[-0.656,16.371],[-0.086,16.371]];

// Removed unused legacy definition: volleyball_top_paths


// ---------- LACROSSE SVG POLYGON LIBRARY ----------
// Cleaned from the supplied SVG: retained the primary black lacrosse-head
// artwork and removed the white background and grayscale tracing fragments.
// The frame, shaft, and net are a single Symbol Shadow region; the open net
// cells remain actual holes. This single-color icon intentionally has no Top
// geometry.
// Removed unused legacy definition: lacrosse_outer_paths


// Removed unused legacy definition: lacrosse_hole_paths


// Removed unused legacy definition: lacrosse_face_points_flat


// Removed unused legacy definition: lacrosse_face_2d


// ---------- HOCKEY SVG POLYGON LIBRARY ----------
// Cleaned from the supplied crossed-hockey-sticks SVG. The page background,
// white knockout tracing, and grayscale antialias fragments are removed. The
// main crossed-stick silhouette is the Symbol Shadow layer; the small grip and
// blade tape regions are the Symbol Top layer. Top=None leaves solid sticks.
function hockey_face_path() = [[-12.566,15.637],[-12.049,15.572],[-11.645,15.265],[-3.568,3.407],[0.035,-1.778],[8.549,10.548],[11.457,14.845],[11.925,15.443],[12.235,15.601],[12.668,15.637],[13.085,15.509],[13.507,15.204],[13.815,14.716],[13.856,14.527],[13.848,14.134],[13.654,13.714],[3.928,0.079],[1.311,-3.668],[5.56,-9.658],[6.527,-10.771],[7.352,-11.517],[8.145,-11.956],[8.823,-12.118],[9.76,-12.15],[10.73,-12.053],[11.667,-11.891],[12.474,-11.698],[13.864,-11.245],[14.413,-11.116],[15.027,-11.116],[15.328,-11.195],[15.701,-11.391],[15.98,-11.681],[16.271,-12.328],[16.368,-12.78],[16.368,-13.62],[16.229,-14.034],[15.948,-14.42],[15.285,-14.832],[13.767,-15.316],[12.571,-15.542],[11.537,-15.639],[10.051,-15.639],[9.243,-15.575],[8.339,-15.413],[7.533,-15.092],[6.834,-14.64],[6.061,-13.878],[4.284,-11.455],[0.035,-5.462],[-1.08,-6.964],[-5.916,-13.784],[-6.653,-14.573],[-7.454,-15.113],[-8.43,-15.478],[-9.27,-15.607],[-11.5,-15.639],[-12.275,-15.575],[-13.115,-15.445],[-14.44,-15.122],[-15.409,-14.767],[-15.797,-14.541],[-16.104,-14.234],[-16.302,-13.875],[-16.393,-13.409],[-16.395,-13.038],[-16.298,-12.425],[-16.13,-11.95],[-15.943,-11.637],[-15.708,-11.395],[-15.373,-11.225],[-14.537,-11.148],[-14.02,-11.245],[-12.663,-11.665],[-11.564,-11.924],[-10.272,-12.118],[-9.238,-12.15],[-8.269,-11.988],[-7.558,-11.665],[-7.217,-11.432],[-6.452,-10.764],[-5.7,-9.904],[-1.661,-4.25],[-1.306,-3.733],[-1.274,-3.604],[-13.551,13.714],[-13.745,14.134],[-13.745,14.554],[-13.626,14.896],[-13.439,15.169],[-13.133,15.428],[-12.875,15.558]];

function hockey_top_paths() = [
    [[-12.598,15.281],[-12.986,15.087],[-13.175,14.913],[-13.357,14.61],[-13.404,14.395],[-13.397,14.232],[-13.358,14.102],[-12.744,13.181],[-12.663,13.181],[-11.322,14.134],[-12.011,15.141],[-12.082,15.192],[-12.255,15.261]],
    [[12.41,15.281],[12.184,15.184],[11.974,14.974],[11.424,14.134],[12.571,13.31],[12.765,13.181],[12.846,13.181],[13.395,13.973],[13.524,14.328],[13.496,14.542],[13.429,14.717],[13.308,14.883],[13.044,15.12],[12.797,15.249]],
    [[-11.241,13.924],[-12.55,12.971],[-11.968,12.083],[-11.887,12.083],[-11.694,12.212],[-10.579,13.036],[-11.128,13.876]],
    [[11.279,13.924],[10.713,13.133],[10.681,12.987],[12.022,12.05],[12.652,12.971]],
    [[-10.466,12.826],[-11.774,11.873],[-11.193,10.984],[-11.08,11.016],[-9.836,11.889],[-9.868,12.034],[-10.353,12.745]],
    [[10.487,12.826],[9.906,11.937],[11.247,10.984],[11.844,11.776],[11.877,11.889]],
    [[-9.69,11.727],[-10.999,10.823],[-10.967,10.677],[-10.401,9.886],[-9.06,10.839]],
    [[9.76,11.727],[9.163,10.806],[10.471,9.886],[11.101,10.774]],
    [[-8.947,10.629],[-10.256,9.724],[-9.674,8.819],[-9.529,8.852],[-8.317,9.692],[-8.349,9.805],[-8.899,10.58],[-8.898,10.628]],
    [[9.017,10.629],[8.419,9.772],[8.419,9.708],[9.373,9.013],[9.663,8.819],[9.744,8.819],[10.326,9.643],[10.326,9.724]],
    [[14.413,-11.471],[13.751,-11.665],[14.914,-14.541],[15.012,-14.524],[15.28,-14.441],[15.508,-14.306],[15.746,-14.113],[15.935,-13.841],[16.045,-13.491],[16.045,-12.974],[16.012,-12.941],[15.98,-12.586],[15.885,-12.282],[15.758,-12.008],[15.657,-11.843],[15.461,-11.663],[15.216,-11.532],[15.027,-11.471]],
    [[-14.989,-11.504],[-15.345,-11.601],[-15.506,-11.698],[-15.612,-11.793],[-15.745,-11.964],[-15.845,-12.166],[-16.039,-12.909],[-16.06,-13.269],[-16.051,-13.43],[-15.995,-13.713],[-15.947,-13.835],[-15.813,-14.04],[-15.312,-14.412],[-14.925,-14.573],[-14.036,-12.554],[-13.713,-11.698],[-14.537,-11.504]],
    [[13.491,-11.742],[12.571,-12.021],[12.458,-12.101],[13.589,-14.961],[14.381,-14.767],[14.752,-14.622],[13.557,-11.843],[13.556,-11.762]],
    [[-13.471,-11.794],[-13.713,-12.263],[-14.682,-14.622],[-14.569,-14.702],[-13.568,-14.961],[-12.421,-12.101],[-12.469,-12.053]],
    [[-12.178,-12.118],[-12.937,-13.943],[-13.325,-15.025],[-12.437,-15.187],[-12.178,-15.187],[-11.904,-14.557],[-11.128,-12.344],[-11.887,-12.214]],
    [[12.234,-12.102],[11.828,-12.214],[11.198,-12.311],[11.198,-12.457],[11.65,-13.62],[11.974,-14.622],[12.216,-15.187],[12.701,-15.155],[13.363,-15.025],[13.234,-14.589],[12.264,-12.166],[12.268,-12.127]],
    [[-10.853,-12.376],[-10.934,-12.408],[-11.936,-15.219],[-11.855,-15.252],[-10.74,-15.284],[-9.771,-12.521],[-9.82,-12.473],[-10.272,-12.473],[-10.304,-12.441],[-10.821,-12.408]],
    [[-8.463,-12.376],[-8.85,-12.473],[-9.303,-12.473],[-9.335,-12.505],[-9.577,-12.505],[-10.514,-15.284],[-9.351,-15.252],[-8.446,-12.457],[-8.415,-12.427]],
    [[10.794,-12.376],[10.503,-12.441],[9.906,-12.473],[9.906,-12.586],[10.778,-15.284],[11.893,-15.252],[11.974,-15.219],[11.004,-12.425],[10.932,-12.369]],
    [[8.581,-12.441],[9.389,-15.219],[9.631,-15.219],[9.663,-15.252],[10.245,-15.252],[10.277,-15.284],[10.536,-15.284],[10.584,-15.235],[9.712,-12.586],[9.631,-12.473],[9.566,-12.505],[9.534,-12.473],[8.791,-12.473]]
];

// ---------- TREBLE CLEF SVG POLYGON LIBRARY ----------
// Cleaned from the supplied SVG: kept the primary dark treble-clef vector,
// removed the white page/background and tiny grayscale tracing fragments,
// sampled the quadratic curves, simplified the closed outlines, centered the
// symbol, and normalized it to the standard symbol height. The three inner
// contours are subtracted so the characteristic open spaces remain printable.
// Removed unused legacy definition: treble_clef_path_0


// Removed unused legacy definition: treble_clef_path_1


// Removed unused legacy definition: treble_clef_path_2


// Removed unused legacy definition: treble_clef_path_3



// Removed unused legacy definition: treble_clef_face_2d


// ---------- DOUBLE NOTE SVG POLYGON LIBRARY ----------
// Cleaned from the supplied SVG: removed the white page background and tiny
// grayscale tracing fragments, sampled the curved outline into a closed
// polygon, simplified it for OpenSCAD, centered it, and normalized it to the
// standard symbol size. This symbol is one solid printable color region.
// Removed unused legacy definition: double_note_face_path


// ---------- SOCCER BALL SVG POLYGON LIBRARY ----------
// Cleaned from the supplied SVG. The raster-like tracing noise and page
// background are discarded. The Shadow layer is a solid circular ball, while
// the Top layer is the classic soccer pattern produced by subtracting the
// twelve light panel regions below from the circle.
function soccer_ball_radius() = 16.4;
function soccer_ball_face_path() = [
    for (angle = [0:5:355])
        [soccer_ball_radius() * cos(angle),soccer_ball_radius() * sin(angle)]
];

function soccer_ball_light_panel_paths() = [
    [[-3.405,15.717],[-3.391,15.676],[-4.166,13.601],[-4.304,13.136],[-4.401,12.986],[-8.885,10.119],[-11.736,10.829],[-11.778,10.87],[-10.767,11.894],[-10.404,12.215],[-10.03,12.525],[-9.645,12.824],[-9.249,13.113],[-8.842,13.391],[-8.425,13.658],[-7.996,13.915],[-7.556,14.161],[-7.313,14.289],[-7.066,14.414],[-6.816,14.536],[-6.561,14.653],[-6.304,14.768],[-6.042,14.878],[-5.777,14.986],[-5.508,15.089],[-4.567,15.417]],
    [[3.543,15.69],[4.263,15.526],[5.287,15.198],[6.505,14.707],[7.39,14.27],[7.626,14.144],[7.859,14.015],[8.088,13.883],[8.315,13.748],[8.538,13.61],[8.758,13.469],[8.976,13.325],[9.19,13.177],[10.02,12.549],[10.933,11.73],[10.975,11.73],[10.969,11.713],[10.966,11.699],[10.966,11.688],[10.97,11.679],[10.977,11.674],[10.987,11.672],[11,11.672],[11.016,11.675],[11.086,11.566],[11.141,11.566],[11.135,11.549],[11.132,11.535],[11.132,11.524],[11.136,11.516],[11.143,11.51],[11.153,11.508],[11.166,11.508],[11.182,11.511],[11.778,10.87],[11.044,10.665],[10.933,10.665],[8.996,10.2],[4.498,13.013]],
    [[-4.263,12.877],[-0.042,10.214],[-0.042,7.674],[-0.014,7.565],[-0.042,7.538],[-0.042,7.319],[-0.014,7.292],[-0.014,5.763],[-4.512,2.881],[-8.138,4.93],[-8.816,5.353],[-8.788,8.657],[-8.761,8.685],[-8.761,9.968],[-8.719,10.009],[-8.153,10.359],[-7.59,10.712],[-7.03,11.067],[-6.471,11.424],[-5.916,11.784],[-5.362,12.146],[-4.811,12.51]],
    [[4.401,12.877],[8.899,10.05],[8.871,10.023],[8.871,9.559],[8.899,9.531],[8.927,5.353],[4.678,2.881],[4.102,3.232],[3.529,3.585],[2.959,3.941],[2.392,4.299],[1.828,4.661],[1.267,5.025],[0.708,5.393],[0.152,5.763],[0.152,10.214],[0.194,10.228]],
    [[-8.94,5.175],[-4.581,2.717],[-4.498,2.239],[-4.498,2.076],[-4.47,2.048],[-4.47,1.857],[-4.443,1.83],[-4.359,1.092],[-4.332,1.065],[-4.276,0.437],[-4.221,0.218],[-4.221,0.027],[-4.193,0],[-4.193,-0.191],[-4.166,-0.218],[-4.166,-0.41],[-4.11,-0.628],[-4.11,-0.847],[-4.055,-1.065],[-4,-1.721],[-3.972,-1.748],[-3.944,-2.158],[-3.861,-2.622],[-8.774,-5.367],[-13.134,-2.485],[-13.134,1.884],[-13.162,1.912],[-13.134,1.994],[-13.162,2.048],[-13.162,2.622]],
    [[8.996,5.175],[9.162,5.121],[9.715,4.793],[13.272,2.622],[13.272,-2.485],[13.231,-2.526],[8.94,-5.367],[8.885,-5.367],[5.093,-3.236],[4,-2.663],[4.027,-2.595],[4.083,-1.994],[4.11,-1.966],[4.193,-1.202],[4.332,-0.41],[4.332,-0.218],[4.359,-0.191],[4.443,0.601],[4.498,0.819],[4.498,1.01],[4.526,1.038],[4.526,1.229],[4.636,1.857],[4.719,2.717],[5.453,3.1]],
    [[-15.362,4.602],[-13.604,2.922],[-13.424,2.717],[-13.355,2.676],[-13.328,2.458],[-13.355,2.431],[-13.355,2.158],[-13.328,2.13],[-13.328,-2.458],[-13.3,-2.513],[-15.279,-4.52],[-15.404,-4.615],[-15.4,-4.632],[-15.4,-4.645],[-15.402,-4.655],[-15.408,-4.661],[-15.416,-4.665],[-15.427,-4.665],[-15.442,-4.662],[-15.459,-4.656],[-15.763,-3.468],[-15.985,-2.239],[-15.985,-2.048],[-16.04,-1.802],[-16.04,-1.502],[-16.068,-1.475],[-16.068,-1.202],[-16.096,-1.174],[-16.123,0.109],[-16.096,0.137],[-16.068,1.202],[-16.04,1.229],[-16.04,1.475],[-16.012,1.502],[-16.012,1.721],[-15.985,1.748],[-15.929,2.294],[-15.68,3.523]],
    [[15.321,4.602],[15.34,4.608],[15.355,4.61],[15.367,4.608],[15.376,4.601],[15.381,4.591],[15.383,4.576],[15.381,4.557],[15.376,4.534],[15.487,4.233],[15.763,3.113],[15.763,2.977],[15.819,2.84],[15.929,2.021],[15.957,1.994],[15.957,1.83],[15.985,1.802],[16.012,1.284],[16.04,1.256],[16.04,0.901],[16.068,0.874],[16.068,0.464],[16.096,0.437],[16.096,-0.601],[16.068,-0.628],[16.04,-1.557],[16.012,-1.584],[16.012,-1.83],[15.985,-1.857],[15.985,-2.076],[15.957,-2.103],[15.902,-2.676],[15.819,-2.977],[15.736,-3.523],[15.487,-4.506],[15.417,-4.656],[13.438,-2.513],[13.438,-1.202],[13.466,-1.174],[13.466,2.649],[15.279,4.547],[15.295,4.544],[15.309,4.543],[15.319,4.546],[15.325,4.551],[15.329,4.56],[15.329,4.571],[15.327,4.585]],
    [[-3.792,-2.799],[-0.014,-5.244],[-0.014,-9.996],[-0.055,-10.009],[-4.29,-12.795],[-8.331,-10.255],[-8.65,-10.091],[-8.65,-9.313],[-8.677,-9.286],[-8.677,-5.517]],
    [[3.903,-2.799],[8.816,-5.544],[8.816,-10.05],[8.747,-10.119],[7.861,-10.637],[4.456,-12.795],[2.989,-11.866],[0.152,-9.968],[0.152,-5.244],[0.221,-5.175]],
    [[-8.83,-10.228],[-8.636,-10.282],[-4.332,-12.973],[-3.363,-15.704],[-3.432,-15.717],[-4.484,-15.444],[-5.536,-15.089],[-5.832,-14.975],[-6.123,-14.856],[-6.41,-14.733],[-6.693,-14.606],[-6.971,-14.474],[-7.244,-14.337],[-7.513,-14.197],[-7.778,-14.051],[-8.308,-13.741],[-8.822,-13.416],[-9.321,-13.075],[-9.805,-12.719],[-10.273,-12.348],[-10.725,-11.962],[-11.162,-11.56],[-11.584,-11.143],[-11.639,-11.061],[-11.598,-11.02],[-11.127,-10.911]],
    [[8.885,-10.228],[11.265,-10.938],[11.459,-10.965],[11.667,-11.061],[11.252,-11.481],[10.821,-11.885],[10.375,-12.275],[9.914,-12.65],[9.438,-13.009],[8.946,-13.353],[8.439,-13.683],[7.916,-13.997],[7.636,-14.154],[7.351,-14.306],[7.061,-14.454],[6.766,-14.596],[6.466,-14.734],[6.161,-14.866],[5.851,-14.994],[5.536,-15.116],[4.567,-15.444],[3.584,-15.69],[4.415,-13.246],[4.567,-12.932]]
];

// ---------- PENCIL SVG POLYGON LIBRARY ----------
// Cleaned from the supplied SVG: removed the white page/background and tiny
// grayscale tracing fragments. The outer silhouette is the Symbol Shadow layer;
// the seven enclosed pencil regions are the Symbol Top layer. With Top=None,
// the result remains a clean solid pencil silhouette.
// Removed unused legacy definition: pencil_face_path


// Removed unused legacy definition: pencil_top_paths


// ---------- BASEBALL SYMBOL LIBRARY ----------
// Exact SVG-derived baseball: the Symbol Shadow layer uses the original
// outer silhouette, and the Symbol Top layer uses the original seam/stitch
// regions from the uploaded SVG. Top Color None leaves the solid body only.
// Removed unused legacy definition: baseball_radius

function baseball_face_path() = [[-0.333,16.4],[0.499,16.4],[0.527,16.372],[1.498,16.345],[1.526,16.317],[1.776,16.317],[1.804,16.289],[1.998,16.289],[2.026,16.261],[2.22,16.261],[2.414,16.206],[2.747,16.178],[4.357,15.817],[5.161,15.568],[6.133,15.207],[6.332,15.122],[6.53,15.035],[6.725,14.946],[6.919,14.856],[7.111,14.763],[7.301,14.668],[7.489,14.572],[7.675,14.473],[7.859,14.373],[8.041,14.271],[8.221,14.166],[8.399,14.06],[8.576,13.952],[8.75,13.842],[8.922,13.73],[9.093,13.616],[9.261,13.5],[9.428,13.382],[9.593,13.263],[9.755,13.141],[9.916,13.017],[10.075,12.892],[10.232,12.764],[10.387,12.635],[10.54,12.504],[10.691,12.37],[10.841,12.235],[10.988,12.098],[11.133,11.959],[11.277,11.818],[11.418,11.675],[11.558,11.53],[11.698,11.384],[11.837,11.236],[11.974,11.086],[12.11,10.934],[12.243,10.78],[12.374,10.624],[12.504,10.467],[12.632,10.308],[12.757,10.146],[12.881,9.983],[13.004,9.818],[13.124,9.652],[13.242,9.483],[13.359,9.312],[13.473,9.14],[13.586,8.966],[13.697,8.79],[13.806,8.612],[13.913,8.432],[14.019,8.25],[14.122,8.067],[14.224,7.881],[14.324,7.694],[14.421,7.505],[14.517,7.314],[14.612,7.121],[14.704,6.926],[14.794,6.73],[14.883,6.531],[14.97,6.331],[15.054,6.129],[15.137,5.925],[15.637,4.454],[15.998,2.955],[16.081,2.289],[16.109,2.262],[16.192,1.401],[16.22,1.374],[16.247,0.513],[16.275,0.486],[16.275,-0.652],[16.247,-0.68],[16.22,-1.596],[16.192,-1.623],[16.109,-2.539],[15.831,-3.954],[15.665,-4.482],[15.609,-4.787],[15.332,-5.619],[14.888,-6.729],[14.799,-6.921],[14.708,-7.11],[14.616,-7.298],[14.522,-7.484],[14.426,-7.668],[14.328,-7.85],[14.228,-8.03],[14.127,-8.209],[14.024,-8.386],[13.919,-8.561],[13.812,-8.735],[13.703,-8.906],[13.593,-9.076],[13.481,-9.244],[13.367,-9.41],[13.251,-9.574],[13.134,-9.737],[13.014,-9.898],[12.893,-10.057],[12.77,-10.214],[12.646,-10.369],[12.519,-10.523],[12.391,-10.675],[12.261,-10.825],[12.129,-10.973],[11.995,-11.119],[11.86,-11.264],[11.722,-11.407],[11.583,-11.548],[11.442,-11.687],[11.3,-11.824],[11.155,-11.96],[11.08,-12.03],[11.004,-12.1],[10.928,-12.169],[10.851,-12.238],[10.773,-12.307],[10.696,-12.375],[10.618,-12.442],[10.539,-12.509],[10.46,-12.576],[10.38,-12.642],[10.3,-12.708],[10.22,-12.773],[10.139,-12.838],[10.058,-12.902],[9.976,-12.966],[9.894,-13.03],[9.812,-13.093],[9.728,-13.156],[9.645,-13.218],[9.561,-13.279],[9.477,-13.341],[9.392,-13.402],[9.307,-13.462],[9.221,-13.522],[9.135,-13.582],[9.048,-13.641],[8.961,-13.699],[8.874,-13.757],[8.786,-13.815],[8.697,-13.873],[8.608,-13.929],[8.519,-13.986],[8.436,-14.038],[8.352,-14.091],[8.267,-14.142],[8.182,-14.193],[8.097,-14.244],[8.011,-14.294],[7.924,-14.344],[7.838,-14.393],[7.75,-14.442],[7.662,-14.49],[7.574,-14.538],[7.485,-14.585],[7.396,-14.632],[7.306,-14.679],[7.216,-14.724],[7.125,-14.77],[7.033,-14.815],[6.942,-14.859],[6.849,-14.903],[6.757,-14.946],[6.663,-14.989],[6.57,-15.031],[6.475,-15.073],[6.381,-15.115],[6.285,-15.156],[6.19,-15.196],[6.094,-15.236],[5.997,-15.276],[5.9,-15.315],[5.802,-15.353],[5.704,-15.391],[5.605,-15.429],[4.329,-15.845],[3.552,-16.039],[2.359,-16.261],[1.693,-16.317],[1.665,-16.345],[1.415,-16.345],[1.387,-16.372],[0.999,-16.372],[0.971,-16.4],[-0.86,-16.4],[-0.888,-16.372],[-1.276,-16.372],[-1.304,-16.345],[-1.554,-16.345],[-1.582,-16.317],[-2.414,-16.234],[-3.663,-15.984],[-5.3,-15.484],[-6.466,-15.013],[-6.661,-14.92],[-6.854,-14.825],[-7.046,-14.729],[-7.236,-14.631],[-7.424,-14.532],[-7.611,-14.43],[-7.795,-14.327],[-7.978,-14.222],[-8.159,-14.115],[-8.339,-14.006],[-8.516,-13.896],[-8.692,-13.784],[-8.866,-13.67],[-9.038,-13.554],[-9.209,-13.437],[-9.377,-13.318],[-9.544,-13.197],[-9.709,-13.074],[-9.873,-12.949],[-10.034,-12.823],[-10.194,-12.695],[-10.352,-12.565],[-10.508,-12.434],[-10.663,-12.3],[-10.816,-12.165],[-10.967,-12.028],[-11.116,-11.889],[-11.263,-11.749],[-11.409,-11.607],[-11.553,-11.463],[-11.695,-11.317],[-11.835,-11.169],[-12.779,-10.087],[-13.722,-8.755],[-14.416,-7.562],[-14.888,-6.591],[-15.276,-5.647],[-15.748,-4.149],[-16.109,-2.456],[-16.109,-2.262],[-16.192,-1.818],[-16.192,-1.568],[-16.22,-1.54],[-16.247,-0.708],[-16.275,-0.68],[-16.275,0.541],[-16.247,0.569],[-16.22,1.401],[-16.192,1.429],[-16.164,1.845],[-16.109,2.067],[-16.109,2.262],[-15.831,3.649],[-15.554,4.648],[-15.304,5.37],[-14.666,6.896],[-14.575,7.083],[-14.482,7.269],[-14.387,7.453],[-14.291,7.635],[-14.193,7.815],[-14.094,7.994],[-13.993,8.171],[-13.89,8.347],[-13.785,8.52],[-13.678,8.692],[-13.57,8.862],[-13.46,9.031],[-13.349,9.198],[-13.236,9.363],[-13.121,9.526],[-13.004,9.688],[-12.886,9.848],[-12.766,10.006],[-12.644,10.163],[-12.52,10.318],[-12.395,10.471],[-12.268,10.623],[-12.14,10.772],[-12.009,10.92],[-11.877,11.067],[-11.744,11.211],[-11.608,11.354],[-11.471,11.495],[-11.332,11.635],[-11.192,11.773],[-11.05,11.909],[-10.906,12.043],[-10.836,12.107],[-10.766,12.171],[-10.696,12.234],[-10.625,12.297],[-10.554,12.359],[-10.483,12.422],[-10.411,12.483],[-10.338,12.545],[-10.266,12.605],[-10.193,12.666],[-10.12,12.726],[-10.046,12.786],[-9.972,12.845],[-9.897,12.905],[-9.822,12.963],[-9.747,13.021],[-9.671,13.079],[-9.595,13.137],[-9.519,13.194],[-9.442,13.251],[-9.365,13.307],[-9.288,13.363],[-9.21,13.419],[-9.131,13.474],[-9.053,13.529],[-8.974,13.584],[-8.894,13.638],[-8.814,13.691],[-8.734,13.745],[-8.654,13.798],[-8.573,13.85],[-8.491,13.903],[-8.42,13.948],[-8.347,13.993],[-8.275,14.037],[-8.202,14.082],[-8.129,14.125],[-8.055,14.169],[-7.981,14.212],[-7.907,14.255],[-7.833,14.297],[-7.758,14.34],[-7.682,14.381],[-7.607,14.423],[-7.531,14.464],[-7.455,14.505],[-7.378,14.545],[-7.301,14.585],[-7.224,14.625],[-7.146,14.664],[-7.068,14.703],[-6.989,14.742],[-6.911,14.78],[-6.832,14.818],[-6.752,14.856],[-6.672,14.893],[-6.592,14.93],[-6.512,14.967],[-6.431,15.003],[-6.35,15.039],[-6.268,15.074],[-6.186,15.11],[-6.104,15.145],[-6.022,15.179],[-4.634,15.679],[-3.247,16.039],[-2.164,16.234],[-1.582,16.289],[-1.554,16.317],[-0.971,16.345],[-0.943,16.372],[-0.361,16.372]];

// Removed unused legacy definition: baseball_top_paths



// ---------- FOOTBALL.SVG POLYGON LIBRARY ----------
// Cleaned from the supplied SVG: removed the white page background and tiny
// tracing fragments, kept the solid football silhouette plus the two stripes
// and center laces, then centered and normalized to the same overall width as
// the Flower artwork. The core is intentionally solid so Symbol Top Color=None
// leaves a complete football instead of holes in the body.
function football_face_path() =
    [[-0.288,9.279],[1.159,9.251],[2.987,9.088],[5.798,8.514],[8.026,7.74],[10.136,6.685],[11.586,5.74],[12.786,4.803],[13.898,3.777],[15.069,2.504],[16.209,0.969],[16.373,0.532],[16.4,0.041],[16.204,-0.54],[14.822,-2.366],[13.101,-4.108],[10.904,-5.82],[8.681,-7.154],[6.835,-7.996],[5.034,-8.596],[3.342,-8.978],[2.032,-9.169],[-0.588,-9.279],[-2.58,-9.115],[-4.217,-8.815],[-6.892,-7.969],[-9,-6.952],[-11.294,-5.508],[-13.357,-3.832],[-14.972,-2.159],[-16.218,-0.477],[-16.4,0.227],[-16.293,0.75],[-15.298,2.189],[-14.216,3.412],[-13.018,4.562],[-12.13,5.293],[-10.697,6.289],[-9.674,6.885],[-8.038,7.677],[-5.828,8.46],[-2.744,9.088]];

function football_top_paths() = [
    [[-9.321,6.959],[-9.225,6.932],[-9.198,6.863],[-9.225,-6.55],[-9.375,-6.55],[-9.948,-6.222],[-11.326,-5.281],[-11.326,5.772],[-10.339,6.408]],
    [[9.291,6.959],[10.348,6.406],[11.324,5.785],[11.324,-5.281],[9.899,-6.243],[9.427,-6.522],[9.236,-6.55],[9.195,-6.509],[9.195,6.891]],
    [[-5.173,2.101],[-4.866,2.043],[-4.695,1.76],[-4.695,0.628],[-2.921,0.628],[-2.921,1.815],[-2.839,1.992],[-2.607,2.101],[-2.317,2.037],[-2.157,1.787],[-2.157,0.628],[-0.383,0.628],[-0.383,1.815],[-0.269,2.008],[-0.022,2.108],[0.221,2.037],[0.381,1.815],[0.381,0.628],[2.155,0.628],[2.155,1.815],[2.348,2.058],[2.547,2.105],[2.779,2.021],[2.919,1.815],[2.919,0.628],[4.693,0.628],[4.711,1.844],[4.899,2.065],[5.17,2.101],[5.402,1.951],[5.484,1.76],[5.484,0.628],[6.207,0.628],[6.355,0.582],[6.531,0.392],[6.548,0.123],[6.426,-0.082],[6.289,-0.164],[5.484,-0.164],[5.478,-1.329],[5.373,-1.533],[5.163,-1.644],[4.952,-1.637],[4.747,-1.46],[4.693,-1.296],[4.693,-0.164],[2.919,-0.191],[2.913,-1.377],[2.788,-1.57],[2.563,-1.65],[2.414,-1.637],[2.209,-1.487],[2.155,-1.351],[2.155,-0.205],[2.114,-0.164],[0.422,-0.164],[0.381,-0.205],[0.381,-1.378],[0.212,-1.598],[0.025,-1.65],[-0.124,-1.637],[-0.329,-1.487],[-0.383,-1.378],[-0.383,-0.205],[-0.424,-0.164],[-2.122,-0.164],[-2.157,-0.205],[-2.157,-1.351],[-2.319,-1.593],[-2.534,-1.65],[-2.662,-1.637],[-2.867,-1.487],[-2.921,-1.378],[-2.921,-0.205],[-2.962,-0.164],[-4.695,-0.164],[-4.722,-1.399],[-4.9,-1.61],[-5.2,-1.637],[-5.432,-1.46],[-5.486,-1.324],[-5.486,-0.164],[-6.291,-0.164],[-6.504,0.002],[-6.559,0.217],[-6.551,0.341],[-6.373,0.573],[-6.21,0.628],[-5.486,0.628],[-5.482,1.79],[-5.393,1.974]]
];

function football_face_points_flat() = football_face_path();


// ---------- RACKET SVG POLYGON LIBRARY ----------
// Cleaned from the supplied SVG: kept only the two true-black vector paths,
// removed the white background and grayscale ImageTracer edge fragments,
// sampled the quadratic curves into closed polygon contours, centered the
// artwork, and normalized it to the standard symbol height. The compound
// contour intentionally preserves the open string cells, throat, and grip gaps.
function racket_path_0_points() =
    [[5.538,16.4],[6.664,16.4],[6.692,16.372],[6.917,16.372],[7.706,16.231],[8.269,16.062],[8.888,15.809],[9.705,15.358],[9.942,15.196],[10.169,15.023],[10.385,14.84],[10.592,14.647],[10.788,14.443],[11.163,13.996],[11.497,13.508],[11.79,12.978],[12.042,12.408],[12.253,11.797],[12.421,11.065],[12.478,10.473],[12.506,10.445],[12.534,9.15],[12.506,9.122],[12.506,8.784],[12.478,8.756],[12.478,8.503],[12.45,8.475],[12.421,8.108],[12.196,7.123],[11.83,6.025],[11.464,5.18],[11.036,4.381],[10.561,3.629],[10.04,2.922],[9.473,2.261],[8.86,1.647],[8.447,1.283],[8.016,0.937],[7.565,0.611],[7.096,0.303],[6.608,0.014],[5.481,-0.521],[4.186,-0.971],[2.947,-1.478],[2.425,-1.721],[1.913,-1.975],[1.412,-2.24],[0.921,-2.515],[0.442,-2.801],[-0.046,-3.107],[-0.524,-3.423],[-0.991,-3.75],[-1.448,-4.087],[-1.895,-4.434],[-3.317,-5.715],[-3.486,-5.878],[-3.647,-6.05],[-3.799,-6.23],[-3.942,-6.419],[-4.077,-6.616],[-4.026,-6.655],[-3.989,-6.708],[-3.966,-6.776],[-3.958,-6.858],[-3.964,-6.954],[-4.373,-7.559],[-4.499,-7.658],[-4.725,-8.038],[-4.751,-8.046],[-4.77,-8.046],[-4.781,-8.038],[-4.785,-8.021],[-4.781,-7.996],[-5.048,-7.813],[-6.85,-6.827],[-6.921,-6.926],[-5.414,-7.813],[-4.88,-8.094],[-4.781,-8.108],[-7.54,-12.275],[-9.384,-14.964],[-11.482,-13.613],[-11.397,-13.43],[-6.498,-6.138],[-6.498,-6.081],[-6.09,-5.476],[-5.837,-5.448],[-5.738,-5.476],[-5.231,-4.364],[-4.725,-2.928],[-4.331,-1.464],[-3.993,0.225],[-3.993,0.394],[-3.964,0.422],[-3.908,0.929],[-3.88,0.957],[-3.88,1.154],[-3.852,1.182],[-3.852,1.38],[-3.824,1.408],[-3.796,1.886],[-3.767,1.915],[-3.711,2.984],[-3.683,3.013],[-3.683,3.632],[-3.655,3.66],[-3.655,5.997],[-3.627,6.025],[-3.627,6.363],[-3.598,6.391],[-3.598,6.644],[-3.57,6.673],[-3.486,7.433],[-3.204,8.615],[-3.111,8.916],[-3.011,9.21],[-2.904,9.497],[-2.79,9.777],[-2.669,10.051],[-1.881,11.515],[-1.523,12.052],[-1.14,12.564],[-0.731,13.051],[-0.298,13.513],[0.16,13.951],[0.595,14.327],[1.054,14.678],[1.539,15.005],[2.048,15.306],[2.581,15.584],[2.867,15.714],[3.163,15.836],[3.467,15.948],[3.78,16.052],[4.102,16.147],[4.862,16.316],[5.031,16.316],[5.256,16.372],[5.509,16.372],[5.735,15.274],[5.664,15.175],[6.439,14.626],[6.678,14.514],[7.1,15.147],[7.1,15.218],[6.72,15.246],[6.692,15.274],[5.2,15.246],[4.355,15.077],[3.82,14.908],[3.789,14.891],[3.766,14.869],[3.752,14.841],[3.746,14.807],[3.75,14.767],[4.721,14.119],[5.411,15.119],[5.256,15.246],[7.269,15.161],[6.791,14.415],[7.734,13.753],[7.804,13.753],[8.452,14.753],[8.248,14.871],[8.027,14.971],[7.791,15.053],[7.538,15.116],[5.524,15.02],[4.876,14.007],[5.876,13.359],[6.509,14.274],[6.537,14.401],[5.594,15.02],[3.454,14.767],[2.581,14.373],[2.272,14.176],[2.25,14.18],[2.235,14.178],[2.227,14.17],[2.225,14.155],[2.229,14.134],[2.807,13.753],[3.468,14.697],[3.609,14.654],[2.962,13.683],[2.962,13.613],[3.961,12.965],[4.623,13.936],[4.623,13.993],[3.708,14.626],[8.606,14.654],[7.917,13.655],[8.86,12.993],[8.93,12.993],[8.958,13.092],[9.578,13.965],[9.578,14.021],[9.001,14.457],[6.692,14.26],[6.03,13.261],[7.002,12.599],[7.635,13.514],[7.663,13.641],[2.018,14.035],[1.117,13.387],[1.019,13.247],[1.99,12.599],[2.061,12.599],[2.089,12.698],[2.708,13.599],[2.131,14.007],[4.763,13.894],[4.144,12.979],[4.116,12.867],[5.087,12.205],[5.777,13.204],[9.69,13.894],[9.043,12.895],[10.014,12.233],[10.507,12.951],[10.507,13.007],[10.197,13.43],[9.733,13.894],[2.821,13.5],[2.173,12.501],[3.173,11.839],[3.834,12.782],[3.834,12.838],[2.891,13.5],[7.818,13.5],[7.157,12.501],[8.142,11.839],[8.789,12.838],[0.85,13.162],[0.858,13.136],[0.858,13.117],[0.85,13.105],[0.833,13.102],[0.808,13.106],[0.118,12.416],[0.033,12.304],[0.033,12.233],[1.146,11.501],[1.258,11.473],[1.92,12.444],[5.904,13.106],[5.242,12.106],[6.213,11.445],[6.903,12.444],[5.96,13.106],[10.605,12.796],[10.169,12.191],[10.169,12.135],[11.14,11.473],[11.183,11.543],[10.929,12.247],[10.648,12.754],[10.653,12.776],[10.652,12.79],[10.643,12.799],[10.628,12.801],[4.017,12.74],[3.891,12.613],[3.328,11.769],[3.328,11.698],[4.299,11.079],[4.989,12.05],[8.902,12.74],[8.255,11.726],[9.226,11.079],[9.916,12.078],[8.973,12.74],[2.075,12.346],[1.385,11.332],[2.356,10.685],[2.427,10.685],[2.455,10.783],[3.074,11.684],[7.03,12.346],[6.368,11.346],[7.283,10.713],[7.382,10.713],[8.029,11.684],[7.086,12.346],[-0.121,12.121],[-0.699,11.374],[-0.811,11.205],[-0.811,11.135],[0.47,10.319],[1.131,11.262],[1.131,11.318],[-0.009,12.092],[10.071,12.008],[9.437,11.121],[9.381,10.98],[10.352,10.319],[11.042,11.346],[5.115,11.952],[4.454,10.98],[5.397,10.319],[5.467,10.319],[6.115,11.332],[5.228,11.923],[3.187,11.586],[2.539,10.586],[3.553,9.924],[3.581,10.023],[4.2,10.924],[3.257,11.586],[8.156,11.586],[7.579,10.783],[7.494,10.586],[8.409,9.953],[8.48,9.953],[9.127,10.952],[6.27,11.22],[5.58,10.22],[6.523,9.558],[6.593,9.558],[6.622,9.657],[7.241,10.558],[11.154,11.22],[10.507,10.22],[11.253,9.699],[11.464,9.615],[11.408,10.473],[11.267,11.177],[1.286,11.191],[0.653,10.305],[0.625,10.192],[1.596,9.53],[2.258,10.473],[2.286,10.572],[1.343,11.191],[-0.91,11.022],[-1.051,10.826],[-1.182,10.619],[-1.303,10.403],[-1.414,10.176],[-1.515,9.939],[-0.375,9.164],[-0.318,9.164],[0.343,10.107],[0.343,10.164],[4.355,10.825],[3.665,9.826],[4.496,9.249],[4.679,9.164],[5.326,10.164],[9.254,10.825],[8.592,9.854],[9.507,9.221],[9.606,9.192],[10.254,10.192],[9.507,10.713],[7.354,10.459],[6.706,9.46],[7.677,8.798],[8.311,9.713],[8.339,9.84],[7.452,10.431],[2.398,10.431],[1.779,9.516],[1.751,9.418],[2.764,8.77],[3.412,9.741],[3.412,9.798],[2.525,10.403],[10.408,10.093],[9.719,9.122],[9.845,8.995],[10.69,8.432],[11.38,9.432],[0.484,10.065],[-0.135,9.15],[-0.164,9.038],[0.723,8.432],[0.836,8.404],[1.497,9.347],[1.497,9.404],[0.667,9.981],[5.481,10.065],[4.82,9.122],[4.82,9.066],[5.763,8.404],[6.453,9.375],[6.453,9.446],[-1.628,9.784],[-1.966,9.009],[-2.078,8.643],[-1.093,7.982],[-0.417,9.024],[-1.529,9.756],[8.494,9.699],[7.832,8.756],[7.832,8.686],[8.804,8.066],[9.465,9.009],[9.465,9.066],[3.525,9.671],[2.877,8.7],[3.82,8.038],[3.877,8.038],[4.538,8.981],[4.538,9.038],[3.623,9.671],[1.652,9.305],[1.047,8.446],[0.963,8.263],[1.906,7.644],[1.962,7.644],[2.624,8.587],[2.624,8.643],[6.608,9.305],[6.454,9.113],[6.308,8.916],[6.17,8.713],[6.04,8.505],[5.918,8.292],[6.861,7.672],[6.931,7.672],[7.579,8.686],[11.422,9.192],[10.845,8.362],[11.323,8.038],[11.38,8.559],[11.408,8.587],[11.408,8.812],[11.436,8.841],[9.606,8.967],[8.958,7.996],[8.958,7.925],[9.93,7.306],[10.591,8.306],[4.721,8.939],[4.172,8.193],[4.031,7.911],[4.946,7.278],[5.003,7.278],[5.664,8.277],[-0.262,8.911],[-0.417,8.722],[-0.563,8.525],[-0.701,8.319],[-0.831,8.105],[-0.952,7.883],[0.019,7.222],[0.709,8.249],[7.691,8.573],[7.044,7.574],[7.987,6.912],[8.057,6.912],[8.705,7.911],[7.79,8.545],[2.764,8.545],[2.145,7.63],[2.117,7.517],[3.088,6.884],[3.75,7.827],[3.75,7.883],[-2.12,8.46],[-2.275,8.052],[-2.444,7.208],[-1.895,6.827],[-1.234,7.799],[-1.234,7.855],[10.746,8.207],[10.056,7.193],[10.915,6.63],[11.009,6.852],[11.09,7.086],[11.161,7.331],[11.22,7.587],[11.267,7.855],[5.819,8.179],[5.129,7.179],[6.101,6.518],[6.791,7.517],[0.864,8.151],[0.174,7.123],[1.146,6.461],[1.666,7.179],[1.835,7.489],[8.818,7.813],[8.17,6.813],[9.141,6.152],[9.831,7.151],[8.973,7.757],[3.891,7.785],[3.215,6.785],[4.214,6.124],[4.848,7.039],[4.876,7.165],[-1.051,7.757],[-1.684,6.87],[-1.74,6.729],[-0.769,6.067],[-0.107,7.01],[-0.079,7.109],[6.903,7.419],[6.875,7.32],[6.256,6.405],[7.227,5.758],[7.917,6.729],[7.917,6.799],[6.974,7.419],[1.99,7.391],[1.3,6.391],[2.314,5.701],[2.99,6.729],[9.958,7.053],[9.296,6.11],[9.296,6.053],[10.042,5.532],[10.352,5.363],[10.704,6.053],[10.845,6.476],[10.014,7.053],[5.031,7.025],[4.426,6.166],[4.369,5.983],[5.312,5.363],[6.002,6.335],[6.002,6.405],[-2.458,6.996],[-2.5,6.954],[-2.557,6.194],[-2.585,6.166],[-2.585,5.884],[-2.529,5.87],[-2.388,6.138],[-1.994,6.673],[0.076,6.996],[-0.614,5.969],[0.357,5.307],[0.934,6.11],[1.047,6.335],[8.029,6.659],[7.382,5.645],[8.269,5.054],[8.395,5.026],[9.043,6.039],[8.1,6.659],[3.102,6.63],[2.483,5.715],[2.455,5.603],[3.285,5.026],[3.426,4.969],[4.116,5.969],[-1.867,6.574],[-2.557,5.575],[-1.557,4.913],[-0.896,5.856],[-0.867,5.955],[6.157,6.264],[5.467,5.265],[6.439,4.603],[7.016,5.406],[7.128,5.631],[1.202,6.208],[0.512,5.209],[1.483,4.547],[2.201,5.589],[2.018,5.673],[1.258,6.208],[9.198,5.927],[9.015,5.715],[8.508,4.927],[9.62,4.153],[10.169,4.983],[10.254,5.223],[4.243,5.87],[3.553,4.871],[4.327,4.322],[4.566,4.209],[5.214,5.18],[5.214,5.251],[-0.755,5.814],[-1.402,4.843],[-1.402,4.772],[-0.431,4.153],[0.231,5.096],[0.259,5.195],[-0.684,5.814],[7.283,5.532],[6.622,4.589],[6.593,4.491],[7.48,3.899],[7.607,3.871],[8.255,4.871],[2.314,5.476],[1.638,4.477],[2.441,3.899],[2.638,3.815],[3.328,4.814],[-2.585,5.363],[-2.557,4.589],[-2.416,3.801],[-2.346,3.759],[-1.656,4.758],[5.369,5.11],[4.679,4.111],[5.65,3.449],[6.34,4.42],[6.34,4.477],[0.371,5.054],[-0.276,4.054],[0.695,3.393],[1.385,4.364],[1.385,4.434],[0.498,5.026],[8.367,4.772],[7.72,3.801],[7.72,3.73],[8.747,3.055],[9.324,3.716],[9.522,4.026],[8.466,4.744],[3.454,4.716],[2.764,3.716],[3.708,3.055],[3.764,3.055],[4.397,3.97],[4.426,4.096],[-1.543,4.66],[-2.219,3.618],[-1.219,2.998],[-0.53,3.998],[-1.445,4.631],[6.495,4.378],[5.833,3.435],[5.805,3.336],[6.692,2.745],[6.819,2.717],[7.466,3.716],[1.497,4.294],[0.85,3.294],[1.821,2.632],[2.539,3.66],[1.596,4.294],[4.58,3.956],[3.891,2.956],[4.862,2.295],[5.552,3.266],[5.552,3.322],[-0.417,3.899],[-1.036,2.984],[-1.065,2.858],[-0.093,2.238],[0.597,3.21],[0.597,3.28],[-0.347,3.899],[7.621,3.618],[6.931,2.618],[7.677,2.098],[7.762,2.098],[8.184,2.464],[8.621,2.9],[8.621,2.97],[2.666,3.562],[2.004,2.618],[1.976,2.52],[2.919,1.9],[2.976,1.9],[3.637,2.9],[-2.303,3.477],[-2.233,3.206],[-2.147,2.947],[-2.045,2.702],[-1.929,2.471],[-1.797,2.252],[-1.801,2.23],[-1.799,2.215],[-1.791,2.206],[-1.776,2.205],[-1.754,2.21],[-1.318,2.844],[-2.205,3.449],[5.707,3.224],[5.017,2.196],[5.988,1.534],[6.678,2.562],[0.709,3.139],[0.062,2.14],[1.033,1.478],[1.61,2.281],[1.723,2.506],[0.92,3.055],[3.792,2.801],[3.102,1.802],[4.017,1.168],[4.116,1.14],[4.707,2.027],[4.763,2.168],[-1.205,2.745],[-1.656,2.055],[-1.6,1.915],[-1.318,1.548],[-0.853,1.112],[-0.192,2.055],[-0.192,2.126],[6.833,2.464],[6.171,1.52],[6.143,1.422],[6.495,1.197],[6.72,1.326],[6.937,1.464],[7.146,1.61],[7.345,1.765],[7.537,1.929],[7.559,1.923],[7.574,1.925],[7.583,1.933],[7.584,1.948],[7.579,1.971],[1.878,2.407],[1.188,1.38],[2.159,0.718],[2.877,1.746],[4.918,2.041],[4.228,1.042],[5.059,0.493],[5.383,0.605],[5.89,1.408],[-0.079,1.985],[-0.727,0.985],[-0.065,0.521],[0.315,0.38],[0.934,1.295],[0.934,1.365],[-0.009,1.985],[3.004,1.647],[2.342,0.704],[2.314,0.605],[3.328,-0.014],[3.975,0.957],[3.975,1.028],[-2.683,1.45],[-2.74,1.422],[-2.81,1.351],[-3.007,-0.113],[-3.345,-1.774],[-3.683,-3.041],[-4.049,-4.167],[-4.274,-4.73],[-4.274,-4.843],[-4.147,-4.941],[-4.007,-4.913],[-3.5,-4.434],[-2.977,-3.972],[-2.436,-3.527],[-1.879,-3.099],[-1.304,-2.689],[-0.858,-2.386],[-0.402,-2.093],[0.066,-1.812],[0.544,-1.541],[1.033,-1.281],[1.103,-1.182],[1.075,-1.07],[0.892,-0.971],[0.442,-0.887],[-0.178,-0.662],[-0.5,-0.511],[-0.805,-0.343],[-1.092,-0.157],[-1.362,0.047],[-1.614,0.267],[-1.817,0.459],[-2.007,0.663],[-2.184,0.879],[-2.349,1.109],[-2.5,1.351],[-2.523,1.384],[-2.553,1.41],[-2.589,1.43],[-2.633,1.443],[6.044,1.309],[5.693,0.774],[6.27,1.056],[6.312,1.126],[1.047,1.225],[0.456,0.338],[0.456,0.267],[1.174,0.042],[1.695,-0.014],[2.089,0.563],[1.174,1.197],[4.13,0.887],[3.553,0.042],[4.045,0.127],[4.876,0.394],[4.741,0.506],[4.599,0.611],[4.449,0.709],[4.293,0.801],[2.215,0.493],[1.92,0.084],[1.863,-0.07],[2.215,-0.07],[2.244,-0.099],[2.638,-0.099],[2.666,-0.07],[2.976,-0.07],[2.99,-0.028],[-7.85,-8.263],[-7.906,-8.362],[-7.751,-8.489],[-6.062,-9.446],[-5.893,-9.53],[-5.795,-9.53],[-5.766,-9.432],[-8.793,-9.699],[-8.827,-9.718],[-8.852,-9.744],[-8.866,-9.778],[-8.87,-9.819],[-8.863,-9.868],[-8.455,-10.065],[-6.963,-10.938],[-6.933,-10.965],[-6.896,-10.984],[-6.851,-10.995],[-6.798,-10.998],[-6.738,-10.994],[-6.752,-10.952],[-6.724,-10.896],[-9.778,-11.163],[-9.849,-11.262],[-8.455,-12.092],[-7.751,-12.458],[-7.727,-12.442],[-7.711,-12.42],[-7.702,-12.391],[-7.702,-12.357],[-7.709,-12.318],[-10.764,-12.599],[-10.806,-12.726],[-10.4,-12.981],[-9.989,-13.228],[-9.572,-13.467],[-9.15,-13.699],[-8.723,-13.922],[-8.694,-13.796]];

function racket_path_0_paths() =
    [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138],[139,140,141,142,143,144,145,146],[147,148,149,150,151,152,153,154,155,156,157],[158,159,160,161,162,163,164,165,166],[167,168,169,170,171,172],[173,174,175,176,177,178,179,180,181,182],[183,184,185,186,187,188,189],[190,191,192,193,194,195,196,197],[198,199,200,201,202],[203,204,205,206,207,208,209,210],[211,212,213,214,215],[216,217,218,219,220,221,222],[223,224,225,226,227,228],[229,230,231,232],[233,234,235,236,237,238,239,240,241,242,243,244],[245,246,247,248,249],[250,251,252,253,254,255,256,257,258,259,260],[261,262,263,264,265,266],[267,268,269,270,271],[272,273,274,275,276,277],[278,279,280,281,282,283],[284,285,286,287,288,289,290,291],[292,293,294,295,296],[297,298,299,300,301,302],[303,304,305,306,307,308],[309,310,311,312,313,314],[315,316,317,318,319,320],[321,322,323,324,325,326],[327,328,329,330,331,332,333],[334,335,336,337,338,339,340,341,342,343],[344,345,346,347,348],[349,350,351,352,353,354],[355,356,357,358,359,360],[361,362,363,364,365,366,367],[368,369,370,371,372],[373,374,375,376,377,378,379,380],[381,382,383,384,385,386],[387,388,389,390,391,392],[393,394,395,396,397,398],[399,400,401,402,403,404,405],[406,407,408,409,410,411,412],[413,414,415,416,417,418,419,420,421],[422,423,424,425,426,427,428],[429,430,431,432,433],[434,435,436,437,438,439],[440,441,442,443,444,445,446,447],[448,449,450,451,452,453],[454,455,456,457,458,459],[460,461,462,463,464,465],[466,467,468,469,470,471,472,473],[474,475,476,477],[478,479,480,481,482],[483,484,485,486,487],[488,489,490,491,492],[493,494,495,496,497,498],[499,500,501,502,503,504,505],[506,507,508,509],[510,511,512,513,514,515,516,517],[518,519,520,521,522,523],[524,525,526,527,528,529,530,531],[532,533,534,535,536],[537,538,539,540,541,542],[543,544,545,546,547,548],[549,550,551,552,553],[554,555,556,557,558],[559,560,561,562,563,564],[565,566,567,568,569,570],[571,572,573,574,575,576],[577,578,579,580,581,582,583],[584,585,586,587,588,589],[590,591,592,593,594],[595,596,597,598,599],[600,601,602,603,604],[605,606,607,608,609,610],[611,612,613,614,615,616,617],[618,619,620,621,622,623],[624,625,626,627,628],[629,630,631,632,633,634],[635,636,637,638,639],[640,641,642,643,644],[645,646,647,648,649,650,651],[652,653,654,655,656,657,658],[659,660,661,662,663,664],[665,666,667,668,669,670,671,672,673,674,675,676,677],[678,679,680,681],[682,683,684,685,686,687],[688,689,690,691,692,693],[694,695,696,697,698,699,700],[701,702,703,704,705,706,707,708,709,710,711,712,713,714],[715,716,717,718],[719,720,721,722,723],[724,725,726,727,728,729,730],[731,732,733,734,735,736],[737,738,739,740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,776],[777,778,779,780],[781,782,783,784,785,786,787],[788,789,790,791,792,793,794,795],[796,797,798,799,800,801,802,803,804],[805,806,807,808,809,810,811],[812,813,814,815,816,817,818,819,820,821,822,823,824,825,826],[827,828,829,830,831,832,833,834,835],[836,837,838,839,840,841,842,843]];

function racket_path_1_points() =
    [[-11.806,-13.725],[-11.733,-13.715],[-11.669,-13.712],[-11.612,-13.718],[-11.564,-13.732],[-11.524,-13.753],[-9.426,-15.147],[-9.394,-15.233],[-9.373,-15.33],[-9.362,-15.437],[-9.361,-15.554],[-9.37,-15.682],[-9.426,-15.851],[-9.666,-16.203],[-9.752,-16.274],[-9.855,-16.329],[-9.973,-16.368],[-10.107,-16.392],[-10.257,-16.4],[-10.595,-16.259],[-12.383,-15.035],[-12.45,-14.955],[-12.497,-14.856],[-12.525,-14.738],[-12.534,-14.6],[-12.523,-14.443],[-12.477,-14.31],[-12.419,-14.188],[-12.348,-14.078],[-12.266,-13.98],[-12.172,-13.894]];

function racket_path_1_paths() =
    [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]];

function racket_face_points_flat() =
    concat(racket_path_0_points(),racket_path_1_points());

module racket_face_2d() {
    union() {
        polygon(points = racket_path_0_points(),paths = racket_path_0_paths());
        polygon(points = racket_path_1_points(),paths = racket_path_1_paths());
    }
}

// ---------- SYMBOL ART HELPERS AND MAGNET LAYOUT ----------

function symbol_base_outline() = 3.9;
// The SVG heart already contains its exact outer Base contour. This value is
// used only for bounds, connection, and magnet calculations.
function heart_base_outline() = 2.27;
function symbol_shadow_outline_for(symbol_name) =
    // The SVG heart's middle contour is already the exact Shadow region.
    symbol_name == "Heart" ? 0 :
    symbol_name == "Football" ? 0 :
    symbol_name == "Soccer Ball" ? 0 :
    symbol_name == "Double Note" ? 0.35 :
    symbol_name == "Treble Clef" ? 0 :
    symbol_name == "Racket" ? 0.12 :
    0.44;

// The automatic capitalization rule ignores spaces, punctuation, and numbers.
function symbol_uppercase_letters() =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖØŒÙÚÛÜÝŸŠŽ";

function symbol_lowercase_letters() =
    "abcdefghijklmnopqrstuvwxyzàáâãäåæçèéêëìíîïñòóôõöøœùúûüýÿšž";


function symbol_is_lowercase_letter(c) =
    c != "" && len(search(c,symbol_lowercase_letters())) > 0;

function symbol_is_alphabetic_letter(c) =
    c != "" &&
    len(search(c,str(symbol_uppercase_letters(),symbol_lowercase_letters()))) > 0;

// Letters (including supported accented letters) and digits count. Spaces and
// punctuation do not affect magnet capacity.
function symbol_is_decimal_digit(c) =
    c != "" && len(search(c,"0123456789")) > 0;

function visible_name_character_count(txt,index = 0) =
    index >= len(txt) ? 0 :
    ((symbol_is_alphabetic_letter(txt[index]) || symbol_is_decimal_digit(txt[index])) ? 1 : 0) +
        visible_name_character_count(txt,index + 1);

function magnet_count_for_visible_character_count(character_count) =
    character_count <= 0 ? 0 :
    character_count <= 3 ? 2 :
    3;

function name_visible_character_count(i) =
    d_name(i) == "" ? 0 :
    visible_name_character_count(d_name(i));

function symbol_alpha_from_left_at(txt,wanted,idx = 0,found = 0) =
    idx >= len(txt) ? "" :
    symbol_is_alphabetic_letter(txt[idx])
        ? (found == wanted
            ? txt[idx]
            : symbol_alpha_from_left_at(txt,wanted,idx + 1,found + 1))
        : symbol_alpha_from_left_at(txt,wanted,idx + 1,found);

function tag_name_bounds_local(i) = [
    name_base_left(i),
    name_base_right(i),
    name_base_bottom(i),
    name_base_top(i)
];

function inline_base_bounds_local(i) = [
    inline_symbol_center_x(i) + inline_symbol_rotated_bounds(i)[0] - inline_symbol_base_outline_s(i),
    inline_symbol_center_x(i) + inline_symbol_rotated_bounds(i)[1] + inline_symbol_base_outline_s(i),
    inline_symbol_center_y(i) + inline_symbol_rotated_bounds(i)[2] - inline_symbol_base_outline_s(i),
    inline_symbol_center_y(i) + inline_symbol_rotated_bounds(i)[3] + inline_symbol_base_outline_s(i)
];

function bounds_union(a,b) = [
    min(a[0],b[0]),
    max(a[1],b[1]),
    min(a[2],b[2]),
    max(a[3],b[3])
];

function bounds_overlap(a,b,minimum_overlap = 0.01) =
    min(a[1],b[1]) - max(a[0],b[0]) >= minimum_overlap &&
    min(a[3],b[3]) - max(a[2],b[2]) >= minimum_overlap;

function inline_touches_tag(i) =
    inline_is_active_for_design(i) &&
    bounds_overlap(inline_base_bounds_local(i),tag_name_bounds_local(i));


// A connected inline symbol counts once because it belongs to the same Base.
// A detached symbol remains a separate component and does not affect the name.
function tag_component_requested_magnet_count(i) =
    d_name(i) == "" ? 0 :
    magnet_count_for_visible_character_count(
        name_visible_character_count(i) + (inline_touches_tag(i) ? 1 : 0)
    );

// Detached inline symbols retain the existing independent two-when-safe rule.
function inline_component_requested_magnet_count(i) = 0;


function tag_component_bounds_local(i) =
    inline_is_active_for_design(i) && inline_touches_tag(i) ?
        bounds_union(tag_name_bounds_local(i),inline_base_bounds_local(i)) :
    tag_name_bounds_local(i);

function inline_component_bounds_local(i) =
    inline_touches_tag(i) ?
        bounds_union(tag_name_bounds_local(i),inline_base_bounds_local(i)) :
        inline_base_bounds_local(i);


function tag_component_magnet_y_local(i) = exact_name_text_center_y(i);

function inline_component_magnet_y_local(i) =
    inline_touches_tag(i) ?
        exact_name_text_center_y(i) :
        (inline_base_bounds_local(i)[2] + inline_base_bounds_local(i)[3]) / 2;


function component_width(bounds) = bounds[1] - bounds[0];
function component_height(bounds) = bounds[3] - bounds[2];

// These are placement limits only. They keep each negative cavity safely
// inside the existing name/symbol Base without creating a circular support pad.
function magnet_cavity_center_inset() =
    magnet_cavity_diameter / 2 + max(0,magnet_cavity_edge_wall);
function component_magnet_safe_left(bounds) =
    bounds[0] + magnet_cavity_center_inset();
function component_magnet_safe_right(bounds) =
    bounds[1] - magnet_cavity_center_inset();
function component_magnet_safe_bottom(bounds) =
    bounds[2] + magnet_cavity_center_inset();
function component_magnet_safe_top(bounds) =
    bounds[3] - magnet_cavity_center_inset();
function component_magnet_safe_width(bounds) =
    max(0,component_magnet_safe_right(bounds) - component_magnet_safe_left(bounds));

// Require a 1.2 mm solid web between neighboring pockets. The same value also
// protects the exterior boundary, so reducing a count cannot change the outline.
function component_magnet_required_center_spacing() =
    magnet_cavity_diameter + max(0,magnet_cavity_edge_wall);
function component_can_fit_one(bounds) =
    component_magnet_safe_left(bounds) <= component_magnet_safe_right(bounds) &&
    component_magnet_safe_bottom(bounds) <= component_magnet_safe_top(bounds);
function component_can_fit_two(bounds) =
    component_can_fit_one(bounds) &&
    component_width(bounds) / 3 >=
        component_magnet_required_center_spacing();
function component_can_fit_three(bounds) =
    component_can_fit_one(bounds) &&
    component_width(bounds) / 5 >= magnet_cavity_center_inset() &&
    component_width(bounds) * 3 / 10 >=
        component_magnet_required_center_spacing();

// requested_count = 0 is used by a detached symbol with no connected name.
// It keeps the safe rule of two cavities when they fit, otherwise one.
function component_magnet_count(bounds,requested_count = 0) =
    requested_count == 1 ? (component_can_fit_one(bounds) ? 1 : 0) :
    requested_count == 3 && component_can_fit_three(bounds) ? 3 :
    requested_count >= 2 && component_can_fit_two(bounds) ? 2 :
    requested_count == 0 && component_can_fit_two(bounds) ? 2 :
    component_can_fit_one(bounds) ? 1 :
    0;

function component_magnet_fraction(index,count) =
    count == 2 ? (index + 1) / 3 :
    1 / 2;

function component_magnet_x(bounds,index = 0,requested_count = 0) =
    let(
        count = component_magnet_count(bounds,requested_count)
    )
    count == 3
        ? bounds[0] + component_width(bounds) *
            (index == 0 ? 1 / 5 : index == 1 ? 1 / 2 : 4 / 5)
        : bounds[0] + component_width(bounds) * component_magnet_fraction(index,count);

function component_magnet_y(bounds,preferred_y) =
    let(
        safe_bottom = component_magnet_safe_bottom(bounds),
        safe_top = component_magnet_safe_top(bounds)
    )
    safe_bottom <= safe_top
        ? min(max(preferred_y,safe_bottom),safe_top)
        : (bounds[2] + bounds[3]) / 2;

module component_magnet_cavities_local(bounds,center_y,requested_count = 0) {
    count = component_magnet_count(bounds,requested_count);
    safe_y = component_magnet_y(bounds,center_y);
    if (count > 0) {
        for (index = [0:count - 1]) {
            magnet_x = component_magnet_x(bounds,index,requested_count);
            magnet_cavity_at(magnet_x,safe_y);
        }
    }
}

module tag_component_magnet_cavities_local(i) {
    if (d_name(i) != "")
        component_magnet_cavities_local(
            tag_component_bounds_local(i),
            tag_component_magnet_y_local(i),
            tag_component_requested_magnet_count(i)
        );
}

module inline_component_magnet_cavities_local(i) {
    if (inline_is_active_for_design(i))
        component_magnet_cavities_local(
            inline_component_bounds_local(i),
            inline_component_magnet_y_local(i),
            inline_component_requested_magnet_count(i)
        );
}


module selected_part(i) {
    if (render_part == "all") {
        full_model(i);
    } else if (render_part == "base") {
        combined_base_layer(i);
    } else if (render_part == "tag_shadow") {
        tag_shadow_color_layer(i);
    } else if (render_part == "tag_text") {
        text_layer(i);
    } else if (render_part == "shadow") {
        combined_shadow_layer(i);
    } else if (render_part == "text") {
        combined_top_layer(i);
    } else if (render_part == "symbol_all") {
        if (inline_is_active_for_design(i))
            inline_symbol_all_layers(i);
    } else if (render_part == "symbol_base") {
        if (inline_is_active_for_design(i))
            color(rgb(d_base_color_preview(i))) inline_base_layer(i);
    } else if (render_part == "symbol_shadow") {
        if (inline_is_active_for_design(i))
            color(rgb(d_symbol_shadow_color_preview(i))) inline_shadow_layer(i);
    } else if (render_part == "symbol_top") {
        if (inline_is_active_for_design(i) && d_symbol_top_color_preview(i) != "None")
            color(rgb(d_symbol_top_color_preview(i))) inline_top_layer(i);
    }
}

module placed_design(i) {
    if (render_part == "all") {
        color(rgb(d_base_color_preview(i)))
            translate([design_x_offset(i), design_y_offset(i), 0])
                tag_base_color_layer(i);

        if (d_shadow_color_preview(i) != "None")
            color(rgb(d_shadow_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    tag_shadow_color_layer(i);

        if (inline_is_active_for_design(i))
            color(rgb(d_symbol_shadow_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    inline_shadow_layer(i);

        color(rgb(d_text_color_preview(i)))
            translate([design_x_offset(i), design_y_offset(i), 0])
                text_layer(i);

        if (inline_is_active_for_design(i) && d_symbol_top_color_preview(i) != "None")
            color(rgb(d_symbol_top_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    inline_top_layer(i);
    } else if (render_part == "base") {
        color(rgb(d_base_color_preview(i)))
            translate([design_x_offset(i), design_y_offset(i), 0])
                tag_base_color_layer(i);
    } else if (render_part == "tag_shadow") {
        if (d_shadow_color_preview(i) != "None")
            color(rgb(d_shadow_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    tag_shadow_color_layer(i);
    } else if (render_part == "tag_text") {
        color(rgb(d_text_color_preview(i)))
            translate([design_x_offset(i), design_y_offset(i), 0])
                text_layer(i);
    } else if (render_part == "shadow") {
        if (d_shadow_color_preview(i) != "None")
            color(rgb(d_shadow_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    tag_shadow_color_layer(i);
        if (inline_is_active_for_design(i))
            color(rgb(d_symbol_shadow_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    inline_shadow_layer(i);
    } else if (render_part == "text") {
        color(rgb(d_text_color_preview(i)))
            translate([design_x_offset(i), design_y_offset(i), 0])
                text_layer(i);
        if (inline_is_active_for_design(i) && d_symbol_top_color_preview(i) != "None")
            color(rgb(d_symbol_top_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    inline_top_layer(i);
    } else if (render_part == "symbol_all") {
        if (inline_is_active_for_design(i)) {
            color(rgb(d_base_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    inline_base_layer(i);
            color(rgb(d_symbol_shadow_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    inline_shadow_layer(i);
            if (d_symbol_top_color_preview(i) != "None")
                color(rgb(d_symbol_top_color_preview(i)))
                    translate([design_x_offset(i), design_y_offset(i), 0])
                        inline_top_layer(i);
        }
    } else if (render_part == "symbol_base") {
        if (inline_is_active_for_design(i))
            color(rgb(d_base_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    inline_base_layer(i);
    } else if (render_part == "symbol_shadow") {
        if (inline_is_active_for_design(i))
            color(rgb(d_symbol_shadow_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    inline_shadow_layer(i);
    } else if (render_part == "symbol_top") {
        if (inline_is_active_for_design(i) && d_symbol_top_color_preview(i) != "None")
            color(rgb(d_symbol_top_color_preview(i)))
                translate([design_x_offset(i), design_y_offset(i), 0])
                    inline_top_layer(i);
    }
}

// An explicit Boolean union is the object boundary for one complete tag.
// Base, sealed cavity surfaces, shadow, text, and symbol colors are collapsed
// into one mesh resource instead of being exported as sibling objects.
module placed_design_object(i) {
    union() {
        placed_design(i);
    }
}

// GENERATED RENDER BLOCK START
if (export_single_design == 0 && render_design == "all" && keep_plate_layout_grouped) {
    union() {
        if (d_name(1) != "") placed_design(1);
        if (d_name(2) != "") placed_design(2);
        if (d_name(3) != "") placed_design(3);
    }
}

if (export_single_design == 0 && render_design == "all" && !keep_plate_layout_grouped && d_name(1) != "") placed_design_object(1);
if (export_single_design == 0 && render_design == "all" && !keep_plate_layout_grouped && d_name(2) != "") placed_design_object(2);
if (export_single_design == 0 && render_design == "all" && !keep_plate_layout_grouped && d_name(3) != "") placed_design_object(3);

if (export_single_design == 1 && d_name(1) != "") placed_design_object(1);
if (export_single_design == 2 && d_name(2) != "") placed_design_object(2);
if (export_single_design == 3 && d_name(3) != "") placed_design_object(3);

if (export_single_design == 0 && render_design == "design_1") {
    selected_part(1);
}
if (export_single_design == 0 && render_design == "design_2") {
    selected_part(2);
}
if (export_single_design == 0 && render_design == "design_3") {
    selected_part(3);
}
// GENERATED RENDER BLOCK END



// Vers16 exact ball detail modules retained unchanged because these three were approved.
module baseball_svg_black_2d() {
    polygon(points = [[-0.379,15.563],[0.405,15.563],[0.432,15.537],[1.347,15.511],[1.373,15.485],[1.609,15.485],[1.635,15.458],[1.818,15.458],[1.844,15.432],[2.027,15.432],[2.21,15.38],[2.524,15.354],[4.041,15.014],[4.8,14.778],[5.715,14.438],[6.213,14.221],[6.697,13.99],[7.169,13.747],[7.627,13.491],[8.073,13.221],[8.505,12.939],[8.925,12.644],[9.332,12.335],[9.725,12.014],[10.106,11.68],[10.474,11.333],[10.829,10.973],[11.179,10.601],[11.516,10.217],[11.841,9.82],[12.153,9.411],[12.453,8.99],[12.741,8.556],[13.016,8.109],[13.278,7.65],[13.528,7.179],[13.765,6.695],[13.99,6.198],[14.203,5.689],[14.674,4.303],[15.014,2.89],[15.092,2.263],[15.118,2.236],[15.197,1.426],[15.223,1.399],[15.249,0.589],[15.275,0.562],[15.275,-0.51],[15.249,-0.536],[15.223,-1.399],[15.197,-1.426],[15.118,-2.289],[14.857,-3.623],[14.7,-4.12],[14.648,-4.407],[14.386,-5.192],[13.967,-6.238],[13.74,-6.715],[13.501,-7.18],[13.25,-7.633],[12.987,-8.074],[12.712,-8.503],[12.425,-8.92],[12.126,-9.325],[11.815,-9.718],[11.491,-10.098],[11.156,-10.467],[10.809,-10.824],[10.449,-11.169],[10.259,-11.344],[10.065,-11.517],[9.868,-11.686],[9.669,-11.853],[9.466,-12.016],[9.261,-12.177],[9.052,-12.335],[8.841,-12.489],[8.626,-12.641],[8.409,-12.79],[8.188,-12.935],[7.965,-13.078],[7.754,-13.209],[7.54,-13.338],[7.322,-13.462],[7.101,-13.584],[6.877,-13.702],[6.65,-13.817],[6.42,-13.929],[6.186,-14.037],[5.949,-14.142],[5.709,-14.244],[5.465,-14.343],[5.218,-14.438],[4.015,-14.831],[3.283,-15.014],[2.158,-15.223],[1.53,-15.275],[1.504,-15.301],[1.269,-15.301],[1.242,-15.328],[0.876,-15.328],[0.85,-15.354],[-0.876,-15.354],[-0.902,-15.328],[-1.269,-15.328],[-1.295,-15.301],[-1.53,-15.301],[-1.556,-15.275],[-2.341,-15.197],[-3.518,-14.961],[-5.061,-14.491],[-6.16,-14.046],[-6.647,-13.809],[-7.122,-13.561],[-7.585,-13.301],[-8.037,-13.028],[-8.477,-12.744],[-8.904,-12.448],[-9.32,-12.141],[-9.724,-11.821],[-10.116,-11.489],[-10.496,-11.146],[-10.865,-10.791],[-11.221,-10.423],[-12.11,-9.403],[-13,-8.148],[-13.654,-7.023],[-14.098,-6.107],[-14.464,-5.218],[-14.909,-3.806],[-15.249,-2.21],[-15.249,-2.027],[-15.328,-1.609],[-15.328,-1.373],[-15.354,-1.347],[-15.38,-0.562],[-15.406,-0.536],[-15.406,0.615],[-15.38,0.641],[-15.354,1.426],[-15.328,1.452],[-15.301,1.844],[-15.249,2.053],[-15.249,2.236],[-14.988,3.544],[-14.726,4.486],[-14.491,5.166],[-13.889,6.604],[-13.657,7.072],[-13.413,7.528],[-13.157,7.972],[-12.891,8.405],[-12.613,8.826],[-12.323,9.236],[-12.022,9.635],[-11.709,10.022],[-11.385,10.398],[-11.05,10.762],[-10.703,11.115],[-10.345,11.456],[-10.169,11.616],[-9.991,11.774],[-9.81,11.929],[-9.627,12.081],[-9.441,12.231],[-9.253,12.378],[-9.062,12.523],[-8.868,12.665],[-8.672,12.805],[-8.474,12.942],[-8.273,13.077],[-8.069,13.209],[-7.888,13.322],[-7.704,13.433],[-7.519,13.541],[-7.33,13.647],[-7.14,13.751],[-6.947,13.852],[-6.752,13.951],[-6.554,14.048],[-6.355,14.143],[-6.153,14.235],[-5.948,14.325],[-5.741,14.412],[-4.433,14.883],[-3.126,15.223],[-2.106,15.406],[-1.556,15.458],[-1.53,15.485],[-0.981,15.511],[-0.955,15.537],[-0.405,15.537],[-0.745,15.118],[-0.772,15.092],[-1.085,15.092],[-1.112,15.066],[-1.818,15.014],[-3.152,14.778],[-4.25,14.491],[-5.637,13.994],[-6.036,13.818],[-6.427,13.633],[-6.809,13.44],[-7.183,13.238],[-7.547,13.027],[-7.904,12.808],[-8.251,12.58],[-8.591,12.344],[-8.921,12.099],[-9.243,11.846],[-9.556,11.583],[-9.861,11.313],[-9.613,11.015],[-9.373,10.71],[-9.141,10.398],[-8.915,10.079],[-8.697,9.752],[-8.486,9.418],[-8.283,9.076],[-8.087,8.727],[-7.898,8.371],[-7.717,8.007],[-7.543,7.637],[-7.376,7.258],[-7.379,7.249],[-7.38,7.241],[-7.38,7.233],[-7.38,7.227],[-7.378,7.222],[-7.375,7.218],[-7.372,7.216],[-7.367,7.214],[-7.361,7.214],[-7.354,7.214],[-7.346,7.216],[-7.337,7.219],[-6.487,8.475],[-6.395,8.527],[-6.366,8.532],[-6.339,8.536],[-6.312,8.538],[-6.287,8.539],[-6.263,8.539],[-6.241,8.537],[-6.22,8.535],[-6.2,8.53],[-6.181,8.525],[-6.164,8.518],[-6.148,8.51],[-6.134,8.501],[-6.016,8.331],[-6.014,8.307],[-6.012,8.284],[-6.012,8.262],[-6.014,8.241],[-6.016,8.222],[-6.02,8.204],[-6.025,8.187],[-6.031,8.172],[-6.039,8.157],[-6.047,8.144],[-6.057,8.132],[-6.068,8.122],[-7.115,6.631],[-6.487,4.852],[-6.055,3.191],[-5.257,4.041],[-4.957,4.316],[-4.721,4.29],[-4.604,4.146],[-4.6,4.116],[-4.598,4.088],[-4.597,4.061],[-4.598,4.035],[-4.6,4.011],[-4.604,3.989],[-4.609,3.968],[-4.615,3.948],[-4.623,3.93],[-4.633,3.913],[-4.643,3.898],[-4.656,3.884],[-5.937,2.55],[-5.859,1.792],[-5.833,1.766],[-5.833,1.556],[-5.807,1.53],[-5.807,1.321],[-5.781,1.295],[-5.754,0.641],[-5.728,0.615],[-5.728,-1.072],[-4.538,-0.262],[-4.329,-0.288],[-4.211,-0.432],[-4.237,-0.667],[-4.355,-0.785],[-5.781,-1.752],[-5.807,-1.818],[-5.859,-2.419],[-5.885,-2.446],[-5.911,-2.786],[-6.016,-3.361],[-6.487,-5.218],[-6.496,-5.224],[-6.503,-5.229],[-6.509,-5.235],[-6.512,-5.241],[-6.514,-5.246],[-6.514,-5.252],[-6.512,-5.257],[-6.508,-5.262],[-6.502,-5.268],[-6.494,-5.273],[-6.485,-5.278],[-6.474,-5.284],[-5.27,-4.839],[-5.087,-4.891],[-4.996,-5.035],[-5.022,-5.244],[-5.14,-5.362],[-6.683,-5.911],[-6.748,-5.977],[-6.984,-6.683],[-7.402,-7.677],[-8.108,-9.089],[-8.122,-9.129],[-7.18,-9.024],[-7.154,-8.998],[-6.971,-8.998],[-6.944,-8.972],[-6.735,-8.998],[-6.709,-9.011],[-6.686,-9.027],[-6.666,-9.046],[-6.649,-9.068],[-6.635,-9.093],[-6.623,-9.121],[-6.615,-9.152],[-6.61,-9.186],[-6.607,-9.223],[-6.608,-9.263],[-6.611,-9.305],[-6.618,-9.351],[-6.788,-9.495],[-8.462,-9.704],[-9.599,-11.391],[-9.283,-11.655],[-8.958,-11.909],[-8.625,-12.156],[-8.283,-12.394],[-7.933,-12.624],[-7.574,-12.845],[-7.207,-13.057],[-6.831,-13.262],[-6.447,-13.457],[-6.055,-13.645],[-5.654,-13.823],[-5.244,-13.994],[-4.12,-14.386],[-2.995,-14.674],[-2.864,-14.674],[-2.446,-14.778],[-1.949,-14.831],[-1.922,-14.857],[-1.53,-14.883],[-1.504,-14.909],[-0.902,-14.935],[-0.876,-14.961],[-0.327,-14.961],[-0.301,-14.988],[0.929,-14.961],[0.955,-14.935],[1.269,-14.935],[1.295,-14.909],[1.53,-14.909],[1.556,-14.883],[2.132,-14.831],[3.78,-14.491],[4.93,-14.124],[5.373,-13.948],[5.806,-13.762],[6.23,-13.566],[6.643,-13.361],[7.047,-13.146],[7.441,-12.921],[7.825,-12.686],[8.199,-12.441],[8.564,-12.187],[8.919,-11.923],[9.264,-11.649],[9.599,-11.365],[9.496,-11.237],[9.395,-11.107],[9.296,-10.976],[9.198,-10.842],[9.101,-10.708],[9.007,-10.571],[8.914,-10.433],[8.823,-10.293],[8.733,-10.152],[8.645,-10.008],[8.559,-9.864],[8.475,-9.717],[8.357,-9.652],[8.148,-9.652],[8.122,-9.626],[6.709,-9.442],[6.591,-9.299],[6.586,-9.27],[6.583,-9.242],[6.58,-9.216],[6.579,-9.19],[6.579,-9.167],[6.581,-9.144],[6.584,-9.123],[6.588,-9.103],[6.593,-9.085],[6.6,-9.068],[6.608,-9.052],[6.618,-9.037],[6.735,-8.945],[6.997,-8.945],[7.206,-8.998],[7.938,-9.076],[7.965,-9.102],[8.108,-9.089],[7.271,-7.441],[6.801,-6.291],[6.696,-5.937],[5.087,-5.362],[4.944,-5.192],[4.97,-4.983],[4.982,-4.965],[4.996,-4.948],[5.011,-4.933],[5.027,-4.918],[5.044,-4.904],[5.062,-4.892],[5.081,-4.88],[5.101,-4.87],[5.122,-4.861],[5.144,-4.852],[5.168,-4.845],[5.192,-4.839],[6.461,-5.284],[6.016,-3.596],[5.859,-2.786],[5.728,-1.739],[4.303,-0.732],[4.211,-0.615],[4.206,-0.586],[4.202,-0.558],[4.2,-0.532],[4.199,-0.507],[4.199,-0.483],[4.201,-0.46],[4.204,-0.439],[4.208,-0.419],[4.213,-0.401],[4.22,-0.384],[4.228,-0.368],[4.237,-0.353],[4.433,-0.235],[4.617,-0.288],[5.611,-0.994],[5.676,-1.033],[5.676,-0.405],[5.65,-0.379],[5.702,1.059],[5.728,1.085],[5.728,1.347],[5.781,1.609],[5.781,1.818],[5.807,1.844],[5.807,2.053],[5.885,2.419],[5.89,2.452],[5.892,2.483],[5.893,2.512],[5.892,2.539],[5.888,2.564],[5.883,2.587],[5.875,2.608],[5.865,2.626],[5.854,2.643],[5.84,2.658],[5.824,2.67],[5.807,2.681],[4.604,3.963],[4.598,3.992],[4.595,4.019],[4.592,4.046],[4.591,4.071],[4.592,4.095],[4.593,4.117],[4.596,4.138],[4.6,4.158],[4.605,4.177],[4.612,4.194],[4.62,4.21],[4.63,4.224],[4.826,4.342],[5.009,4.29],[5.597,3.649],[6.003,3.243],[6.042,3.243],[6.121,3.727],[6.356,4.643],[6.618,5.401],[6.618,5.48],[7.036,6.578],[7.01,6.709],[6.016,8.226],[6.011,8.258],[6.007,8.287],[6.005,8.315],[6.005,8.341],[6.007,8.366],[6.011,8.388],[6.016,8.409],[6.023,8.428],[6.032,8.446],[6.042,8.462],[6.054,8.476],[6.068,8.488],[6.238,8.579],[6.395,8.553],[6.513,8.435],[7.219,7.311],[7.324,7.245],[7.484,7.631],[7.653,8.009],[7.83,8.379],[8.014,8.741],[8.207,9.096],[8.408,9.443],[8.617,9.783],[8.834,10.114],[9.059,10.438],[9.292,10.755],[9.533,11.064],[9.782,11.365],[9.435,11.68],[9.076,11.984],[8.704,12.274],[8.32,12.553],[7.923,12.819],[7.514,13.072],[7.093,13.313],[6.659,13.542],[6.213,13.759],[5.754,13.963],[5.283,14.154],[4.8,14.334],[3.152,14.804],[1.792,15.04],[0.955,15.092],[0.929,15.118],[10.109,11.064],[9.678,10.554],[8.841,9.325],[8.733,9.151],[8.627,8.976],[8.524,8.798],[8.424,8.617],[8.326,8.434],[8.231,8.249],[8.139,8.061],[8.049,7.872],[7.962,7.679],[7.877,7.485],[7.795,7.288],[7.716,7.088],[8.278,7.193],[8.514,7.271],[8.749,7.298],[8.985,7.376],[9.014,7.381],[9.041,7.385],[9.068,7.387],[9.093,7.388],[9.117,7.388],[9.139,7.387],[9.16,7.384],[9.18,7.38],[9.199,7.374],[9.216,7.367],[9.232,7.359],[9.246,7.35],[9.364,7.18],[9.338,6.997],[9.168,6.853],[9.063,6.853],[8.828,6.774],[8.592,6.748],[7.468,6.487],[7.35,6.264],[6.931,5.087],[6.922,5.031],[6.912,4.976],[6.9,4.922],[6.888,4.869],[6.874,4.818],[6.859,4.767],[6.844,4.717],[6.827,4.669],[6.809,4.621],[6.79,4.575],[6.77,4.53],[6.748,4.486],[6.434,3.178],[6.448,3.06],[7.755,3.61],[7.938,3.583],[7.966,3.572],[7.991,3.557],[8.012,3.539],[8.031,3.517],[8.045,3.493],[8.057,3.465],[8.065,3.434],[8.07,3.4],[8.071,3.362],[8.07,3.321],[8.065,3.278],[8.056,3.23],[7.912,3.086],[6.343,2.459],[6.278,2.341],[6.173,1.373],[6.147,1.347],[6.121,0.745],[6.094,0.719],[6.094,0.196],[6.068,0.17],[6.094,-1.125],[6.186,-1.099],[7.232,-0.366],[7.247,-0.357],[7.263,-0.349],[7.28,-0.342],[7.298,-0.337],[7.318,-0.332],[7.339,-0.33],[7.362,-0.328],[7.386,-0.328],[7.411,-0.329],[7.437,-0.331],[7.465,-0.335],[7.494,-0.34],[7.638,-0.51],[7.641,-0.54],[7.643,-0.568],[7.644,-0.595],[7.643,-0.62],[7.641,-0.644],[7.638,-0.667],[7.633,-0.688],[7.626,-0.708],[7.618,-0.726],[7.609,-0.743],[7.598,-0.758],[7.585,-0.772],[6.173,-1.739],[6.199,-2.21],[6.408,-3.413],[6.722,-4.695],[6.892,-5.231],[6.958,-5.205],[7.69,-4.329],[7.938,-4.107],[8.148,-4.133],[8.265,-4.303],[8.268,-4.33],[8.27,-4.355],[8.27,-4.379],[8.269,-4.402],[8.266,-4.424],[8.263,-4.444],[8.258,-4.463],[8.251,-4.481],[8.244,-4.497],[8.235,-4.512],[8.225,-4.526],[8.213,-4.538],[7.088,-5.82],[7.638,-7.232],[8.475,-8.906],[8.566,-8.972],[9.233,-7.808],[9.403,-7.664],[9.612,-7.69],[9.73,-7.86],[9.733,-7.887],[9.735,-7.912],[9.735,-7.936],[9.734,-7.959],[9.731,-7.981],[9.728,-8.001],[9.723,-8.02],[9.716,-8.038],[9.709,-8.054],[9.7,-8.069],[9.689,-8.083],[9.678,-8.095],[8.841,-9.508],[8.921,-9.648],[9.003,-9.786],[9.087,-9.922],[9.173,-10.056],[9.261,-10.189],[9.35,-10.319],[9.442,-10.448],[9.535,-10.575],[9.63,-10.7],[9.727,-10.823],[9.826,-10.945],[9.926,-11.064],[10.136,-10.907],[10.476,-10.585],[10.805,-10.251],[11.123,-9.907],[11.431,-9.552],[11.727,-9.186],[12.013,-8.809],[12.288,-8.421],[12.551,-8.022],[12.804,-7.612],[13.046,-7.191],[13.277,-6.759],[13.497,-6.317],[14.02,-5.061],[14.464,-3.596],[14.726,-2.289],[14.804,-1.478],[14.831,-1.452],[14.831,-1.242],[14.857,-1.216],[14.857,-0.902],[14.883,-0.876],[14.883,0.824],[14.857,0.85],[14.831,1.452],[14.804,1.478],[14.7,2.419],[14.36,3.989],[13.863,5.48],[13.632,6.027],[13.386,6.559],[13.125,7.076],[12.849,7.579],[12.559,8.067],[12.254,8.539],[11.933,8.997],[11.598,9.44],[11.248,9.869],[10.884,10.282],[10.504,10.68],[-10.214,11.012],[-10.546,10.687],[-10.867,10.352],[-11.178,10.008],[-11.479,9.653],[-11.77,9.287],[-12.051,8.912],[-12.322,8.527],[-12.582,8.131],[-12.832,7.725],[-13.073,7.31],[-13.303,6.884],[-13.523,6.448],[-13.62,6.242],[-13.715,6.034],[-13.808,5.823],[-13.897,5.61],[-13.984,5.394],[-14.068,5.175],[-14.15,4.954],[-14.228,4.729],[-14.305,4.502],[-14.378,4.273],[-14.449,4.041],[-14.517,3.806],[-14.831,2.367],[-14.831,2.21],[-14.935,1.661],[-14.961,1.164],[-14.988,1.138],[-14.988,0.772],[-15.014,0.745],[-15.014,-0.693],[-14.988,-0.719],[-14.988,-1.085],[-14.961,-1.112],[-14.961,-1.373],[-14.935,-1.399],[-14.935,-1.635],[-14.857,-2.027],[-14.857,-2.184],[-14.778,-2.498],[-14.726,-2.916],[-14.517,-3.78],[-14.124,-5.009],[-14.028,-5.261],[-13.928,-5.51],[-13.824,-5.755],[-13.717,-5.996],[-13.607,-6.235],[-13.493,-6.47],[-13.375,-6.701],[-13.255,-6.929],[-13.131,-7.154],[-13.003,-7.375],[-12.872,-7.593],[-12.738,-7.808],[-12.608,-8.009],[-12.475,-8.207],[-12.34,-8.403],[-12.202,-8.597],[-12.062,-8.788],[-11.919,-8.977],[-11.774,-9.163],[-11.627,-9.347],[-11.477,-9.528],[-11.324,-9.707],[-11.169,-9.883],[-11.012,-10.057],[-9.952,-11.09],[-9.855,-10.974],[-9.759,-10.857],[-9.665,-10.737],[-9.572,-10.616],[-9.481,-10.493],[-9.392,-10.369],[-9.305,-10.243],[-9.219,-10.115],[-9.135,-9.985],[-9.053,-9.854],[-8.972,-9.721],[-8.893,-9.586],[-8.893,-9.508],[-9.782,-8.017],[-9.73,-7.808],[-9.586,-7.716],[-9.559,-7.713],[-9.534,-7.712],[-9.51,-7.712],[-9.487,-7.713],[-9.465,-7.715],[-9.445,-7.719],[-9.426,-7.724],[-9.408,-7.73],[-9.392,-7.738],[-9.377,-7.747],[-9.363,-7.757],[-9.351,-7.768],[-8.632,-8.985],[-8.553,-9.024],[-7.795,-7.52],[-7.141,-5.872],[-7.141,-5.82],[-7.324,-5.611],[-8.239,-4.617],[-8.318,-4.46],[-8.292,-4.277],[-8.148,-4.159],[-7.965,-4.159],[-7.873,-4.211],[-7.873,-4.25],[-7.115,-5.087],[-6.931,-5.231],[-6.748,-4.617],[-6.434,-3.309],[-6.278,-2.419],[-6.199,-1.739],[-7.611,-0.811],[-7.664,-0.693],[-7.669,-0.662],[-7.673,-0.632],[-7.674,-0.604],[-7.674,-0.578],[-7.673,-0.554],[-7.669,-0.531],[-7.664,-0.51],[-7.657,-0.491],[-7.648,-0.473],[-7.638,-0.458],[-7.625,-0.444],[-7.611,-0.432],[-7.441,-0.34],[-7.285,-0.366],[-6.212,-1.099],[-6.147,-1.099],[-6.147,0.562],[-6.173,0.589],[-6.173,0.929],[-6.199,0.955],[-6.199,1.269],[-6.251,1.53],[-6.251,1.739],[-6.278,1.766],[-6.278,1.949],[-6.33,2.132],[-6.356,2.446],[-7.991,3.086],[-8.082,3.204],[-8.086,3.239],[-8.088,3.272],[-8.089,3.303],[-8.088,3.333],[-8.086,3.361],[-8.082,3.387],[-8.077,3.411],[-8.071,3.433],[-8.063,3.454],[-8.053,3.473],[-8.042,3.49],[-8.03,3.505],[-7.912,3.557],[-7.729,3.557],[-6.709,3.139],[-6.487,3.086],[-6.853,4.617],[-7.481,6.421],[-7.572,6.487],[-9.246,6.827],[-9.364,6.944],[-9.39,7.049],[-9.338,7.232],[-9.246,7.324],[-9.142,7.35],[-7.768,7.062],[-7.925,7.425],[-8.09,7.781],[-8.261,8.131],[-8.439,8.473],[-8.625,8.809],[-8.817,9.138],[-9.017,9.461],[-9.224,9.777],[-9.438,10.086],[-9.659,10.388],[-9.887,10.684],[-10.122,10.973]],paths = [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191],[192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,554,555,556,557,558],[559,560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,575,576,577,578,579,580,581,582,583,584,585,586,587,588,589,590,591,592,593,594,595,596,597,598,599,600,601,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,641,642,643,644,645,646,647,648,649,650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699,700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758],[759,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,827,828,829,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,846,847,848,849,850,851,852,853,854,855,856,857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,874,875,876,877,878,879,880,881,882,883,884,885,886,887,888,889,890,891,892,893,894,895,896,897,898,899,900,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,930,931,932,933,934,935,936,937,938,939,940,941,942,943,944]]);
}

module basketball_svg_black_2d() {
    polygon(points = [[0.039,14.281],[1.556,14.255],[1.582,14.229],[1.87,14.229],[1.896,14.203],[2.106,14.203],[2.132,14.177],[2.838,14.098],[4.329,13.758],[5.611,13.314],[6.096,13.1],[6.569,12.872],[7.027,12.631],[7.472,12.376],[7.903,12.108],[8.321,11.826],[8.725,11.53],[9.115,11.221],[9.492,10.898],[9.855,10.562],[10.205,10.212],[10.541,9.848],[10.822,9.532],[11.093,9.206],[11.354,8.869],[11.604,8.522],[11.844,8.165],[12.074,7.797],[12.293,7.419],[12.502,7.031],[12.701,6.633],[12.889,6.224],[13.067,5.805],[13.235,5.375],[13.601,4.198],[13.889,2.812],[13.967,2.001],[13.994,1.975],[13.994,1.661],[14.02,1.635],[14.046,0.327],[14.02,0.301],[14.02,-0.248],[13.994,-0.275],[13.994,-0.562],[13.967,-0.589],[13.941,-1.033],[13.706,-2.367],[13.34,-3.701],[12.974,-4.669],[12.77,-5.123],[12.555,-5.567],[12.328,-5.998],[12.09,-6.418],[11.84,-6.827],[11.579,-7.224],[11.306,-7.609],[11.022,-7.983],[10.726,-8.346],[10.419,-8.697],[10.1,-9.036],[9.769,-9.364],[9.442,-9.677],[9.102,-9.979],[8.752,-10.269],[8.39,-10.548],[8.017,-10.816],[7.632,-11.072],[7.237,-11.317],[6.829,-11.551],[6.411,-11.773],[5.981,-11.984],[5.54,-12.184],[5.087,-12.372],[3.832,-12.79],[2.315,-13.13],[2.158,-13.13],[1.766,-13.209],[1.556,-13.209],[1.53,-13.235],[0.902,-13.261],[0.876,-13.287],[-0.589,-13.287],[-0.615,-13.261],[-0.955,-13.261],[-0.981,-13.235],[-1.242,-13.235],[-1.269,-13.209],[-1.844,-13.157],[-3.335,-12.843],[-3.537,-12.785],[-3.737,-12.726],[-3.934,-12.664],[-4.129,-12.6],[-4.323,-12.533],[-4.513,-12.465],[-4.702,-12.394],[-4.888,-12.321],[-5.072,-12.245],[-5.254,-12.168],[-5.433,-12.088],[-5.611,-12.006],[-6.017,-11.802],[-6.414,-11.589],[-6.802,-11.366],[-7.18,-11.134],[-7.549,-10.892],[-7.908,-10.641],[-8.257,-10.38],[-8.597,-10.11],[-8.927,-9.83],[-9.248,-9.54],[-9.559,-9.241],[-9.861,-8.932],[-10.163,-8.613],[-10.454,-8.283],[-10.734,-7.942],[-11.003,-7.59],[-11.261,-7.227],[-11.509,-6.853],[-11.745,-6.468],[-11.971,-6.073],[-12.186,-5.666],[-12.389,-5.249],[-12.582,-4.82],[-12.764,-4.381],[-13.157,-3.204],[-13.34,-2.472],[-13.523,-1.478],[-13.575,-0.85],[-13.601,-0.824],[-13.601,-0.562],[-13.627,-0.536],[-13.654,0.981],[-13.627,1.007],[-13.627,1.452],[-13.601,1.478],[-13.601,1.766],[-13.575,1.792],[-13.549,2.21],[-13.314,3.518],[-12.921,4.878],[-12.424,6.107],[-12.21,6.543],[-11.985,6.967],[-11.749,7.38],[-11.501,7.782],[-11.242,8.173],[-10.972,8.552],[-10.691,8.921],[-10.398,9.278],[-10.094,9.623],[-9.779,9.958],[-9.453,10.281],[-9.115,10.593],[-8.828,10.849],[-8.533,11.096],[-8.229,11.335],[-7.918,11.567],[-7.599,11.79],[-7.271,12.006],[-6.936,12.213],[-6.593,12.413],[-6.242,12.604],[-5.882,12.788],[-5.515,12.963],[-5.14,13.13],[-3.858,13.601],[-2.576,13.941],[-1.426,14.151],[-0.772,14.203],[-0.745,14.229],[-0.458,14.229],[-0.432,14.255],[0.013,14.255],[0.772,13.732],[0.745,13.706],[-0.353,13.706],[-0.379,13.68],[-0.719,13.68],[-0.745,13.654],[-1.19,13.627],[-1.216,13.601],[-1.739,13.549],[-1.896,13.497],[-2.419,13.418],[-3.544,13.13],[-4.329,12.869],[-5.166,12.529],[-5.349,12.443],[-5.53,12.356],[-5.708,12.267],[-5.885,12.175],[-6.059,12.082],[-6.231,11.987],[-6.401,11.891],[-6.569,11.792],[-6.735,11.691],[-6.898,11.589],[-7.06,11.484],[-7.219,11.378],[-7.333,11.216],[-7.444,11.05],[-7.55,10.879],[-7.652,10.704],[-7.749,10.524],[-7.843,10.34],[-7.932,10.152],[-8.018,9.959],[-8.099,9.761],[-8.176,9.559],[-8.249,9.353],[-8.318,9.142],[-8.605,7.965],[-8.658,7.441],[-8.684,7.415],[-8.684,7.206],[-8.71,7.18],[-8.71,6.814],[-8.736,6.788],[-8.71,5.741],[-8.684,5.715],[-8.632,5.166],[-8.501,4.643],[-8.456,4.5],[-8.406,4.362],[-8.353,4.228],[-8.296,4.098],[-8.234,3.972],[-8.169,3.85],[-8.099,3.732],[-8.025,3.619],[-7.948,3.509],[-7.866,3.403],[-7.78,3.302],[-7.69,3.204],[-7.638,3.151],[-7.585,3.1],[-7.53,3.051],[-7.472,3.003],[-7.413,2.958],[-7.352,2.914],[-7.289,2.873],[-7.224,2.833],[-7.157,2.796],[-7.088,2.76],[-7.017,2.726],[-6.944,2.694],[-6.905,2.733],[-6.644,3.78],[-6.199,5.114],[-5.624,6.526],[-5.205,7.389],[-5.021,7.741],[-4.829,8.086],[-4.632,8.425],[-4.428,8.757],[-4.218,9.083],[-4.001,9.402],[-3.777,9.715],[-3.547,10.021],[-3.311,10.321],[-3.068,10.614],[-2.819,10.901],[-2.563,11.182],[-2.43,11.323],[-2.295,11.463],[-2.157,11.6],[-2.018,11.735],[-1.876,11.868],[-1.732,11.999],[-1.586,12.127],[-1.438,12.254],[-1.288,12.378],[-1.135,12.5],[-0.981,12.62],[-0.824,12.738],[0.196,13.392],[0.719,13.654],[0.785,13.654],[2.184,13.575],[1.269,13.261],[0.17,12.686],[-0.029,12.556],[-0.225,12.423],[-0.418,12.286],[-0.607,12.146],[-0.793,12.003],[-0.976,11.857],[-1.155,11.707],[-1.331,11.554],[-1.503,11.397],[-1.673,11.237],[-1.838,11.074],[-2.001,10.907],[-2.248,10.644],[-2.488,10.374],[-2.722,10.098],[-2.95,9.816],[-3.172,9.528],[-3.388,9.234],[-3.597,8.933],[-3.801,8.626],[-3.997,8.313],[-4.188,7.994],[-4.373,7.669],[-4.551,7.337],[-5.1,6.212],[-5.65,4.852],[-6.173,3.256],[-6.356,2.485],[-6.055,2.433],[-5.454,2.433],[-5.427,2.459],[-5.192,2.459],[-4.774,2.537],[-4.303,2.668],[-3.518,2.982],[-2.053,3.793],[0.353,5.336],[1.582,6.042],[1.777,6.146],[1.974,6.248],[2.173,6.348],[2.373,6.446],[2.575,6.543],[2.779,6.637],[2.985,6.73],[3.193,6.821],[3.402,6.91],[3.613,6.998],[3.826,7.083],[4.041,7.167],[5.087,7.533],[6.212,7.847],[7.546,8.108],[8.148,8.161],[8.174,8.187],[8.435,8.187],[8.462,8.213],[8.802,8.213],[8.828,8.239],[9.769,8.239],[9.796,8.213],[10.109,8.213],[10.136,8.187],[10.371,8.187],[10.397,8.161],[10.868,8.108],[11.195,8.03],[11.114,8.157],[11.031,8.283],[10.947,8.407],[10.86,8.53],[10.771,8.651],[10.681,8.771],[10.588,8.889],[10.494,9.005],[10.397,9.12],[10.299,9.234],[10.199,9.345],[10.096,9.456],[9.851,9.718],[9.599,9.974],[9.34,10.222],[9.073,10.464],[8.799,10.698],[8.518,10.925],[8.23,11.145],[7.935,11.357],[7.633,11.563],[7.323,11.761],[7.007,11.952],[6.683,12.137],[6.498,12.237],[6.31,12.335],[6.12,12.43],[5.926,12.522],[5.73,12.611],[5.531,12.698],[5.329,12.781],[5.124,12.862],[4.916,12.94],[4.706,13.015],[4.493,13.087],[4.277,13.157],[2.864,13.497],[2.393,13.549],[2.367,13.575],[-8.514,10.358],[-8.697,10.201],[-8.951,9.965],[-9.199,9.722],[-9.44,9.473],[-9.675,9.217],[-9.904,8.955],[-10.126,8.687],[-10.342,8.413],[-10.551,8.132],[-10.754,7.844],[-10.951,7.551],[-11.142,7.251],[-11.326,6.944],[-11.405,6.806],[-11.483,6.665],[-11.559,6.524],[-11.634,6.381],[-11.708,6.237],[-11.781,6.092],[-11.852,5.945],[-11.922,5.797],[-11.991,5.648],[-12.058,5.497],[-12.124,5.345],[-12.189,5.192],[-12.45,4.46],[-12.738,3.413],[-12.738,3.23],[-12.529,2.759],[-12.084,2.158],[-12.024,2.094],[-11.963,2.03],[-11.901,1.968],[-11.837,1.908],[-11.773,1.848],[-11.707,1.79],[-11.64,1.733],[-11.572,1.677],[-11.502,1.622],[-11.431,1.568],[-11.36,1.516],[-11.286,1.465],[-10.371,0.915],[-10.148,0.805],[-9.922,0.699],[-9.693,0.596],[-9.46,0.498],[-9.225,0.403],[-8.985,0.311],[-8.743,0.224],[-8.497,0.14],[-8.248,0.06],[-7.995,-0.016],[-7.74,-0.088],[-7.481,-0.157],[-7.35,0.772],[-7.141,1.844],[-7.088,1.975],[-7.088,2.106],[-7.176,2.145],[-7.261,2.186],[-7.345,2.229],[-7.426,2.273],[-7.506,2.32],[-7.585,2.368],[-7.661,2.418],[-7.736,2.469],[-7.809,2.523],[-7.88,2.578],[-7.949,2.635],[-8.017,2.694],[-8.105,2.778],[-8.189,2.866],[-8.271,2.956],[-8.35,3.05],[-8.425,3.147],[-8.498,3.247],[-8.567,3.35],[-8.633,3.456],[-8.696,3.565],[-8.756,3.677],[-8.813,3.792],[-8.867,3.91],[-8.899,3.987],[-8.93,4.065],[-8.96,4.144],[-8.989,4.224],[-9.017,4.305],[-9.044,4.388],[-9.069,4.471],[-9.094,4.556],[-9.117,4.641],[-9.139,4.728],[-9.161,4.815],[-9.181,4.904],[-9.259,5.349],[-9.259,5.558],[-9.285,5.584],[-9.285,5.846],[-9.312,5.872],[-9.312,6.997],[-9.285,7.023],[-9.285,7.311],[-9.259,7.337],[-9.259,7.546],[-9.233,7.572],[-9.181,8.095],[-8.998,8.906],[-8.841,9.429],[-8.632,10.005],[-8.475,10.319],[-8.472,10.328],[-8.47,10.336],[-8.469,10.343],[-8.47,10.349],[-8.471,10.353],[-8.474,10.357],[-8.478,10.36],[-8.483,10.362],[-8.489,10.362],[-8.496,10.362],[-8.504,10.36],[8.697,7.664],[8.671,7.638],[8.383,7.638],[8.357,7.611],[7.729,7.559],[6.631,7.35],[5.741,7.115],[4.224,6.591],[2.838,5.99],[1.478,5.284],[0.118,4.473],[-1.975,3.139],[-3.073,2.537],[-4.093,2.119],[-4.8,1.936],[-5.087,1.909],[-5.114,1.883],[-5.375,1.883],[-5.401,1.857],[-6.081,1.857],[-6.474,1.936],[-6.539,1.818],[-6.618,1.321],[-6.696,1.059],[-6.905,-0.366],[-3.989,-1.125],[-1.216,-1.674],[-1.059,-1.674],[-0.536,-1.779],[0.17,-1.857],[0.196,-1.883],[0.589,-1.909],[0.615,-1.936],[1.504,-2.014],[1.53,-2.04],[2.367,-2.093],[2.393,-2.119],[2.707,-2.119],[2.733,-2.145],[3.1,-2.145],[3.126,-2.171],[4.146,-2.197],[4.172,-2.223],[6.683,-2.223],[6.709,-2.197],[7.258,-2.197],[7.285,-2.171],[7.703,-2.171],[7.729,-2.145],[8.619,-2.093],[8.645,-2.066],[9.299,-2.014],[9.325,-1.988],[10.136,-1.883],[11.234,-1.648],[12.045,-1.386],[12.804,-1.02],[13.222,-0.706],[13.418,-0.484],[13.444,0.301],[13.47,0.327],[13.47,1.164],[13.444,1.19],[13.418,1.975],[13.392,2.001],[13.392,2.21],[13.366,2.236],[13.314,2.786],[13.157,3.596],[12.895,4.564],[12.607,5.401],[12.137,6.474],[11.77,7.154],[11.679,7.245],[11.26,7.428],[10.423,7.611],[9.979,7.638],[9.952,7.664],[-12.934,2.302],[-13,1.975],[-13,1.766],[-13.026,1.739],[-13.052,0.902],[-13.078,0.876],[-13.078,0.065],[-13.052,0.039],[-13.052,-0.484],[-13,-0.772],[-13,-1.007],[-12.974,-1.033],[-12.869,-1.844],[-12.66,-2.786],[-12.398,-3.649],[-11.98,-4.721],[-11.561,-5.584],[-11.195,-6.186],[-11.197,-6.197],[-11.199,-6.206],[-11.198,-6.214],[-11.197,-6.221],[-11.195,-6.226],[-11.191,-6.23],[-11.186,-6.232],[-11.18,-6.234],[-11.172,-6.234],[-11.164,-6.232],[-11.154,-6.229],[-11.143,-6.225],[-11.135,-5.953],[-11.115,-5.692],[-11.084,-5.442],[-11.041,-5.203],[-10.986,-4.976],[-10.92,-4.76],[-10.843,-4.555],[-10.753,-4.362],[-10.652,-4.18],[-10.54,-4.009],[-10.415,-3.849],[-10.279,-3.701],[-10.217,-3.637],[-10.152,-3.576],[-10.085,-3.517],[-10.015,-3.46],[-9.943,-3.405],[-9.869,-3.353],[-9.793,-3.303],[-9.714,-3.255],[-9.634,-3.209],[-9.55,-3.166],[-9.465,-3.125],[-9.377,-3.086],[-8.959,-2.956],[-8.645,-2.93],[-8.619,-2.903],[-7.886,-2.903],[-7.86,-2.93],[-7.664,-2.93],[-7.664,-1.949],[-7.638,-1.922],[-7.638,-1.504],[-7.611,-1.478],[-7.611,-1.164],[-7.585,-1.138],[-7.588,-1.098],[-7.59,-1.06],[-7.592,-1.024],[-7.592,-0.989],[-7.591,-0.955],[-7.589,-0.923],[-7.587,-0.892],[-7.583,-0.862],[-7.578,-0.834],[-7.573,-0.808],[-7.567,-0.782],[-7.559,-0.759],[-7.783,-0.697],[-8.004,-0.634],[-8.224,-0.568],[-8.441,-0.499],[-8.657,-0.429],[-8.87,-0.356],[-9.082,-0.28],[-9.291,-0.203],[-9.499,-0.123],[-9.704,-0.041],[-9.908,0.044],[-10.109,0.131],[-10.299,0.216],[-10.484,0.305],[-10.667,0.398],[-10.845,0.493],[-11.021,0.593],[-11.192,0.696],[-11.361,0.802],[-11.525,0.912],[-11.687,1.025],[-11.844,1.142],[-11.999,1.262],[-12.15,1.386],[-12.225,1.453],[-12.298,1.521],[-12.369,1.592],[-12.439,1.664],[-12.507,1.737],[-12.573,1.813],[-12.638,1.89],[-12.701,1.969],[-12.762,2.049],[-12.821,2.132],[-12.878,2.216],[-6.971,-0.942],[-7.01,-0.981],[-7.036,-1.635],[-7.062,-1.661],[-7.088,-3.047],[-6.997,-3.113],[-6.526,-3.27],[-6.003,-3.531],[-5.218,-4.028],[-5.045,-4.156],[-4.874,-4.285],[-4.705,-4.417],[-4.538,-4.551],[-4.374,-4.687],[-4.211,-4.826],[-4.051,-4.966],[-3.893,-5.109],[-3.737,-5.254],[-3.583,-5.401],[-3.432,-5.551],[-3.283,-5.702],[-3.178,-5.833],[-3.1,-5.885],[-2.93,-6.081],[-0.562,-8.396],[-0.393,-8.551],[-0.221,-8.704],[-0.046,-8.855],[0.13,-9.002],[0.31,-9.148],[0.492,-9.291],[0.676,-9.431],[0.863,-9.569],[1.052,-9.705],[1.244,-9.838],[1.438,-9.968],[1.635,-10.096],[1.77,-10.181],[1.907,-10.264],[2.046,-10.345],[2.188,-10.424],[2.331,-10.501],[2.476,-10.576],[2.623,-10.649],[2.772,-10.721],[2.923,-10.79],[3.076,-10.857],[3.23,-10.922],[3.387,-10.986],[4.538,-11.326],[4.983,-11.404],[5.166,-11.404],[5.192,-11.43],[5.767,-11.43],[6.761,-10.907],[6.993,-10.768],[7.221,-10.625],[7.445,-10.479],[7.665,-10.329],[7.882,-10.175],[8.095,-10.018],[8.305,-9.857],[8.511,-9.692],[8.713,-9.524],[8.912,-9.352],[9.107,-9.177],[9.299,-8.998],[9.559,-8.741],[9.812,-8.478],[10.058,-8.207],[10.297,-7.93],[10.529,-7.645],[10.754,-7.353],[10.971,-7.054],[11.182,-6.748],[11.385,-6.435],[11.582,-6.115],[11.771,-5.788],[11.953,-5.454],[12.45,-4.407],[12.895,-3.178],[13.13,-2.289],[13.287,-1.412],[13.187,-1.47],[13.084,-1.527],[12.98,-1.581],[12.874,-1.635],[12.767,-1.687],[12.658,-1.738],[12.547,-1.788],[12.434,-1.836],[12.32,-1.882],[12.204,-1.928],[12.086,-1.971],[11.967,-2.014],[10.685,-2.354],[9.639,-2.537],[8.828,-2.616],[8.802,-2.642],[8.592,-2.642],[8.566,-2.668],[7.625,-2.72],[7.598,-2.746],[7.154,-2.746],[7.128,-2.773],[6.526,-2.773],[6.5,-2.799],[4.355,-2.799],[4.329,-2.773],[3.178,-2.746],[3.152,-2.72],[2.759,-2.72],[2.733,-2.694],[2.446,-2.694],[2.419,-2.668],[1.504,-2.616],[1.478,-2.589],[1.242,-2.589],[1.216,-2.563],[1.007,-2.563],[0.981,-2.537],[0.772,-2.537],[0.745,-2.511],[0.536,-2.511],[0.51,-2.485],[-0.039,-2.433],[-0.065,-2.406],[-0.248,-2.406],[-0.275,-2.38],[-0.615,-2.354],[-0.798,-2.302],[-0.955,-2.302],[-1.922,-2.119],[-2.053,-2.119],[-3.23,-1.883],[-3.596,-1.779],[-3.832,-1.752],[-5.584,-1.334],[-8.592,-3.479],[-9.168,-3.636],[-9.612,-3.897],[-9.686,-3.959],[-9.757,-4.023],[-9.824,-4.091],[-9.889,-4.161],[-9.951,-4.234],[-10.011,-4.31],[-10.067,-4.389],[-10.12,-4.47],[-10.171,-4.555],[-10.219,-4.642],[-10.264,-4.733],[-10.306,-4.826],[-10.463,-5.27],[-10.567,-5.846],[-10.567,-6.683],[-10.541,-6.709],[-10.489,-7.258],[-10.412,-7.365],[-10.334,-7.47],[-10.255,-7.574],[-10.175,-7.677],[-10.094,-7.779],[-10.011,-7.88],[-9.928,-7.979],[-9.843,-8.078],[-9.758,-8.175],[-9.671,-8.272],[-9.584,-8.367],[-9.495,-8.462],[-9.177,-8.793],[-8.847,-9.113],[-8.506,-9.421],[-8.152,-9.717],[-7.787,-10.002],[-7.411,-10.275],[-7.022,-10.536],[-6.622,-10.785],[-6.21,-11.023],[-5.787,-11.249],[-5.351,-11.463],[-4.904,-11.666],[-4.865,-11.679],[-4.952,-11.576],[-5.037,-11.472],[-5.121,-11.366],[-5.203,-11.259],[-5.284,-11.15],[-5.363,-11.039],[-5.441,-10.927],[-5.517,-10.814],[-5.592,-10.699],[-5.665,-10.582],[-5.737,-10.464],[-5.807,-10.345],[-5.889,-10.198],[-5.969,-10.05],[-6.048,-9.9],[-6.125,-9.747],[-6.199,-9.593],[-6.272,-9.437],[-6.343,-9.279],[-6.412,-9.12],[-6.48,-8.958],[-6.545,-8.794],[-6.608,-8.629],[-6.67,-8.462],[-7.088,-7.128],[-7.402,-5.741],[-7.507,-4.93],[-7.533,-4.904],[-7.559,-4.512],[-7.585,-4.486],[-7.585,-4.277],[-7.611,-4.25],[-7.638,-3.57],[-7.729,-3.505],[-7.749,-3.51],[-7.768,-3.514],[-7.785,-3.516],[-7.801,-3.517],[-7.816,-3.517],[-7.83,-3.515],[-7.842,-3.513],[-7.854,-3.508],[-7.864,-3.503],[-7.872,-3.496],[-7.88,-3.488],[-7.886,-3.479],[-7.062,-3.714],[-6.958,-4.8],[-6.722,-6.134],[-6.382,-7.441],[-6.121,-8.226],[-6.061,-8.389],[-5.999,-8.549],[-5.936,-8.708],[-5.871,-8.866],[-5.804,-9.021],[-5.735,-9.174],[-5.664,-9.326],[-5.592,-9.476],[-5.517,-9.624],[-5.441,-9.77],[-5.363,-9.915],[-5.284,-10.057],[-5.211,-10.181],[-5.137,-10.303],[-5.061,-10.423],[-4.982,-10.541],[-4.902,-10.657],[-4.821,-10.771],[-4.737,-10.884],[-4.651,-10.994],[-4.564,-11.103],[-4.474,-11.209],[-4.383,-11.314],[-4.29,-11.417],[-4.215,-11.5],[-4.139,-11.58],[-4.06,-11.659],[-3.98,-11.735],[-3.897,-11.809],[-3.812,-11.881],[-3.724,-11.951],[-3.635,-12.018],[-3.544,-12.084],[-3.45,-12.147],[-3.354,-12.208],[-3.256,-12.267],[-2.106,-12.529],[-1.661,-12.581],[-1.635,-12.607],[-1.452,-12.607],[-1.426,-12.633],[-1.242,-12.633],[-1.216,-12.66],[-0.641,-12.686],[-0.615,-12.712],[0.876,-12.712],[0.902,-12.686],[1.269,-12.686],[1.295,-12.66],[1.53,-12.66],[1.556,-12.633],[2.106,-12.581],[3.361,-12.32],[4.486,-11.953],[4.501,-11.957],[4.515,-11.959],[4.527,-11.96],[4.537,-11.959],[4.545,-11.957],[4.552,-11.953],[4.556,-11.948],[4.559,-11.942],[4.56,-11.934],[4.559,-11.924],[4.556,-11.913],[4.551,-11.901],[3.753,-11.718],[2.629,-11.3],[2.455,-11.219],[2.283,-11.135],[2.113,-11.05],[1.946,-10.962],[1.782,-10.872],[1.619,-10.779],[1.459,-10.684],[1.301,-10.587],[1.146,-10.487],[0.992,-10.386],[0.842,-10.281],[0.693,-10.175],[0.515,-10.045],[0.339,-9.914],[0.165,-9.781],[-0.007,-9.646],[-0.178,-9.509],[-0.347,-9.37],[-0.513,-9.23],[-0.679,-9.088],[-0.842,-8.944],[-1.003,-8.798],[-1.163,-8.65],[-1.321,-8.501],[-4.303,-5.545],[-4.93,-4.996],[-6.003,-4.211],[-6.788,-3.793]],paths = [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174],[175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279],[280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388],[389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511],[512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,575,576,577,578,579,580,581,582,583,584,585,586,587,588,589],[590,591,592,593,594,595,596,597,598,599,600,601,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,641,642,643,644,645,646,647,648,649,650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699,700,701,702],[703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,827,828,829,830,831,832,833,834,835,836,837,838,839,840],[841,842,843,844,845,846,847,848,849,850,851,852,853,854,855,856,857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,874,875,876,877,878,879,880,881,882,883,884,885,886,887,888,889,890,891,892,893,894,895,896,897,898,899,900,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,930,931],[932,933,934,935,936,937,938,939,940,941,942,943,944,945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,975,976,977,978,979,980,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1031,1032]]);
}

module volleyball_svg_black_2d() {
    polygon(points = [[-0.039,15.223],[0.51,15.223],[0.536,15.197],[1.085,15.197],[1.112,15.171],[1.713,15.144],[1.739,15.118],[2.132,15.092],[2.158,15.066],[2.498,15.04],[2.655,14.988],[3.047,14.935],[4.277,14.621],[5.82,14.046],[6.303,13.82],[6.773,13.582],[7.23,13.331],[7.675,13.067],[8.107,12.791],[8.526,12.502],[8.933,12.2],[9.327,11.886],[9.708,11.559],[10.077,11.219],[10.433,10.867],[10.776,10.502],[11.092,10.144],[11.398,9.776],[11.692,9.397],[11.976,9.007],[12.249,8.607],[12.512,8.196],[12.764,7.774],[13.005,7.342],[13.235,6.899],[13.455,6.445],[13.664,5.981],[13.863,5.506],[14.203,4.564],[14.438,3.727],[14.438,3.623],[14.648,2.786],[14.726,2.158],[14.778,1.975],[14.778,1.792],[14.804,1.766],[14.831,1.295],[14.857,1.269],[14.909,-0.196],[14.883,-0.222],[14.883,-0.929],[14.857,-0.955],[14.831,-1.53],[14.804,-1.556],[14.752,-2.132],[14.569,-3.152],[14.255,-4.329],[14.209,-4.472],[14.161,-4.614],[14.113,-4.756],[14.063,-4.896],[14.013,-5.035],[13.961,-5.172],[13.908,-5.309],[13.854,-5.445],[13.799,-5.579],[13.743,-5.713],[13.686,-5.845],[13.627,-5.977],[13.404,-6.451],[13.168,-6.912],[12.92,-7.362],[12.659,-7.799],[12.387,-8.224],[12.102,-8.636],[11.805,-9.037],[11.495,-9.425],[11.174,-9.801],[10.84,-10.164],[10.494,-10.516],[10.136,-10.855],[9.78,-11.18],[9.413,-11.493],[9.034,-11.794],[8.643,-12.083],[8.241,-12.36],[7.826,-12.626],[7.399,-12.879],[6.961,-13.121],[6.51,-13.35],[6.048,-13.568],[5.574,-13.774],[5.087,-13.967],[3.858,-14.36],[2.289,-14.7],[2.106,-14.7],[1.504,-14.804],[1.242,-14.804],[1.216,-14.831],[0.824,-14.831],[0.798,-14.857],[-0.693,-14.857],[-0.719,-14.831],[-1.112,-14.831],[-1.138,-14.804],[-1.373,-14.804],[-1.399,-14.778],[-1.635,-14.778],[-1.844,-14.726],[-2.21,-14.7],[-3.675,-14.386],[-4.878,-14.02],[-6.212,-13.47],[-6.669,-13.245],[-7.114,-13.008],[-7.548,-12.76],[-7.97,-12.5],[-8.381,-12.228],[-8.78,-11.945],[-9.168,-11.65],[-9.544,-11.344],[-9.908,-11.027],[-10.262,-10.698],[-10.603,-10.357],[-10.933,-10.005],[-11.101,-9.819],[-11.266,-9.631],[-11.428,-9.44],[-11.588,-9.247],[-11.745,-9.05],[-11.899,-8.851],[-12.05,-8.649],[-12.198,-8.445],[-12.344,-8.237],[-12.487,-8.027],[-12.627,-7.814],[-12.764,-7.598],[-12.885,-7.406],[-13.003,-7.21],[-13.118,-7.011],[-13.23,-6.809],[-13.34,-6.604],[-13.446,-6.397],[-13.549,-6.186],[-13.649,-5.972],[-13.746,-5.755],[-13.84,-5.536],[-13.932,-5.313],[-14.02,-5.087],[-14.36,-4.041],[-14.7,-2.498],[-14.778,-1.739],[-14.804,-1.713],[-14.804,-1.504],[-14.831,-1.478],[-14.831,-1.164],[-14.857,-1.138],[-14.883,0.589],[-14.857,0.615],[-14.857,1.138],[-14.831,1.164],[-14.831,1.478],[-14.778,1.713],[-14.778,1.949],[-14.752,1.975],[-14.7,2.524],[-14.569,3.23],[-14.229,4.564],[-14.181,4.716],[-14.131,4.867],[-14.08,5.017],[-14.028,5.166],[-13.976,5.314],[-13.922,5.46],[-13.867,5.606],[-13.811,5.75],[-13.753,5.893],[-13.695,6.036],[-13.636,6.177],[-13.575,6.317],[-13.36,6.771],[-13.134,7.214],[-12.897,7.646],[-12.648,8.067],[-12.389,8.477],[-12.119,8.875],[-11.838,9.263],[-11.545,9.64],[-11.242,10.006],[-10.928,10.361],[-10.603,10.705],[-10.266,11.038],[-9.949,11.337],[-9.621,11.626],[-9.284,11.906],[-8.936,12.175],[-8.578,12.434],[-8.21,12.683],[-7.833,12.922],[-7.445,13.151],[-7.047,13.37],[-6.639,13.579],[-6.221,13.778],[-5.794,13.967],[-4.12,14.569],[-3.047,14.857],[-1.739,15.092],[-1.53,15.092],[-1.269,15.144],[-0.981,15.144],[-0.955,15.171],[-0.615,15.171],[-0.589,15.197],[-0.065,15.197],[-0.092,14.569],[-0.118,14.543],[-0.589,14.543],[-0.615,14.517],[-1.164,14.491],[-1.661,14.334],[-1.872,14.216],[-2.08,14.095],[-2.284,13.97],[-2.485,13.841],[-2.682,13.709],[-2.876,13.574],[-3.066,13.435],[-3.252,13.292],[-3.435,13.146],[-3.615,12.996],[-3.79,12.843],[-3.963,12.686],[-4.226,12.433],[-4.483,12.173],[-4.734,11.908],[-4.98,11.636],[-5.219,11.359],[-5.452,11.075],[-5.679,10.786],[-5.899,10.49],[-6.114,10.188],[-6.323,9.88],[-6.526,9.566],[-6.722,9.246],[-7.167,8.462],[-7.821,7.075],[-8.292,5.82],[-8.553,4.904],[-8.393,4.759],[-8.231,4.616],[-8.066,4.476],[-7.899,4.338],[-7.729,4.202],[-7.557,4.069],[-7.383,3.939],[-7.206,3.81],[-7.026,3.685],[-6.845,3.561],[-6.66,3.44],[-6.474,3.322],[-5.244,2.616],[-4.538,2.276],[-4.394,2.249],[-4.313,2.523],[-4.228,2.792],[-4.138,3.057],[-4.044,3.319],[-3.946,3.576],[-3.844,3.83],[-3.737,4.08],[-3.626,4.326],[-3.511,4.568],[-3.391,4.806],[-3.267,5.04],[-3.139,5.27],[-2.093,6.892],[-1.991,7.028],[-1.888,7.163],[-1.784,7.297],[-1.679,7.429],[-1.572,7.559],[-1.463,7.689],[-1.354,7.817],[-1.243,7.943],[-1.13,8.068],[-1.016,8.192],[-0.901,8.314],[-0.785,8.435],[-0.496,8.728],[-0.197,9.012],[0.111,9.286],[0.428,9.551],[0.755,9.806],[1.091,10.051],[1.437,10.287],[1.793,10.514],[2.157,10.731],[2.532,10.939],[2.916,11.137],[3.309,11.326],[4.564,11.796],[5.767,12.084],[6.317,12.137],[6.343,12.163],[6.631,12.163],[6.657,12.189],[7.768,12.202],[7.614,12.309],[7.458,12.414],[7.299,12.517],[7.138,12.618],[6.975,12.716],[6.809,12.812],[6.641,12.906],[6.471,12.997],[6.299,13.086],[6.124,13.173],[5.947,13.257],[5.767,13.34],[4.538,13.837],[3.806,14.072],[2.864,14.307],[2.132,14.438],[1.975,14.438],[1.949,14.464],[1.504,14.491],[1.478,14.517],[1.138,14.517],[1.112,14.543],[0.693,14.543],[0.667,14.569],[-3.23,14.124],[-3.989,13.915],[-4.826,13.627],[-5.663,13.287],[-6.526,12.869],[-6.825,12.706],[-7.12,12.538],[-7.408,12.365],[-7.692,12.187],[-7.97,12.003],[-8.243,11.813],[-8.511,11.619],[-8.773,11.419],[-9.03,11.214],[-9.282,11.004],[-9.528,10.788],[-9.769,10.567],[-9.924,10.421],[-10.076,10.272],[-10.225,10.12],[-10.372,9.966],[-10.516,9.81],[-10.658,9.651],[-10.797,9.49],[-10.934,9.326],[-11.069,9.159],[-11.2,8.99],[-11.33,8.819],[-11.456,8.645],[-11.43,8.357],[-11.09,7.755],[-10.982,7.591],[-10.872,7.428],[-10.76,7.268],[-10.646,7.11],[-10.529,6.954],[-10.41,6.801],[-10.289,6.649],[-10.166,6.5],[-10.041,6.353],[-9.913,6.208],[-9.784,6.065],[-9.652,5.924],[-9.611,5.871],[-9.569,5.819],[-9.526,5.769],[-9.48,5.721],[-9.434,5.674],[-9.386,5.628],[-9.336,5.584],[-9.284,5.542],[-9.231,5.501],[-9.177,5.462],[-9.121,5.424],[-9.063,5.388],[-8.998,5.506],[-8.71,6.474],[-8.318,7.468],[-7.952,8.278],[-7.507,9.115],[-7.341,9.403],[-7.171,9.687],[-6.997,9.966],[-6.818,10.24],[-6.635,10.51],[-6.448,10.776],[-6.256,11.038],[-6.06,11.295],[-5.859,11.548],[-5.654,11.796],[-5.445,12.041],[-5.231,12.28],[-5.078,12.449],[-4.921,12.615],[-4.761,12.778],[-4.599,12.938],[-4.433,13.095],[-4.265,13.249],[-4.093,13.401],[-3.919,13.549],[-3.741,13.694],[-3.561,13.836],[-3.377,13.975],[-3.191,14.111],[6.892,11.587],[6.866,11.561],[6.526,11.561],[6.5,11.535],[6.107,11.509],[5.087,11.3],[4.915,11.25],[4.744,11.199],[4.575,11.145],[4.408,11.089],[4.244,11.031],[4.082,10.971],[3.921,10.909],[3.763,10.845],[3.607,10.779],[3.453,10.71],[3.302,10.64],[3.152,10.567],[2.865,10.416],[2.584,10.259],[2.308,10.097],[2.037,9.93],[1.772,9.757],[1.512,9.578],[1.257,9.395],[1.008,9.206],[0.764,9.011],[0.526,8.812],[0.293,8.607],[0.065,8.396],[-0.155,8.183],[-0.372,7.966],[-0.583,7.743],[-0.79,7.516],[-0.992,7.285],[-1.189,7.048],[-1.382,6.807],[-1.57,6.562],[-1.754,6.311],[-1.932,6.056],[-2.106,5.797],[-2.276,5.532],[-2.36,5.396],[-2.443,5.259],[-2.524,5.12],[-2.604,4.98],[-2.682,4.838],[-2.759,4.695],[-2.835,4.55],[-2.909,4.404],[-2.982,4.257],[-3.053,4.108],[-3.123,3.958],[-3.191,3.806],[-3.61,2.759],[-3.845,2.001],[-3.335,1.779],[-1.661,1.256],[-0.589,1.02],[-0.196,0.968],[-0.054,1.175],[0.09,1.379],[0.238,1.58],[0.389,1.778],[0.542,1.973],[0.699,2.165],[0.859,2.354],[1.021,2.541],[1.186,2.724],[1.355,2.904],[1.526,3.082],[1.7,3.256],[1.868,3.42],[2.039,3.58],[2.212,3.738],[2.388,3.894],[2.566,4.047],[2.747,4.197],[2.93,4.345],[3.116,4.491],[3.304,4.634],[3.495,4.775],[3.688,4.913],[3.884,5.048],[4.047,5.156],[4.211,5.262],[4.378,5.365],[4.547,5.467],[4.718,5.566],[4.891,5.663],[5.067,5.758],[5.244,5.85],[5.424,5.941],[5.606,6.029],[5.79,6.115],[5.977,6.199],[7.285,6.67],[7.965,6.853],[9.246,7.088],[9.952,7.141],[9.979,7.167],[10.345,7.167],[10.371,7.193],[11.443,7.193],[11.47,7.167],[12.097,7.141],[12.398,7.088],[12.231,7.393],[12.057,7.692],[11.878,7.986],[11.692,8.274],[11.501,8.556],[11.303,8.832],[11.1,9.103],[10.89,9.368],[10.675,9.627],[10.453,9.881],[10.225,10.129],[9.992,10.371],[9.115,11.195],[8.749,11.378],[8.305,11.509],[7.938,11.535],[7.912,11.561],[-11.914,7.978],[-12.016,7.827],[-12.117,7.674],[-12.215,7.519],[-12.31,7.362],[-12.404,7.203],[-12.496,7.042],[-12.585,6.878],[-12.672,6.713],[-12.757,6.545],[-12.84,6.375],[-12.921,6.203],[-13,6.029],[-13.392,5.061],[-13.44,4.929],[-13.487,4.795],[-13.533,4.659],[-13.577,4.523],[-13.621,4.385],[-13.663,4.246],[-13.704,4.106],[-13.743,3.965],[-13.781,3.822],[-13.819,3.679],[-13.854,3.534],[-13.889,3.387],[-13.889,3.047],[-13.811,2.707],[-13.47,1.792],[-13.389,1.629],[-13.305,1.469],[-13.217,1.313],[-13.125,1.16],[-13.03,1.011],[-12.932,0.866],[-12.83,0.724],[-12.724,0.585],[-12.615,0.45],[-12.503,0.318],[-12.387,0.19],[-12.267,0.065],[-11.954,-0.236],[-11.631,-0.528],[-11.298,-0.81],[-10.956,-1.082],[-10.603,-1.344],[-10.241,-1.596],[-9.869,-1.839],[-9.487,-2.071],[-9.095,-2.294],[-8.693,-2.507],[-8.281,-2.71],[-7.86,-2.903],[-6.761,-3.348],[-6.134,-3.557],[-4.93,-3.871],[-4.067,-4.028],[-3.492,-4.08],[-3.466,-4.107],[-2.943,-4.133],[-2.916,-4.159],[-2.393,-4.159],[-2.367,-4.185],[-1.373,-4.185],[-1.347,-4.159],[-0.562,-4.133],[-0.536,-4.107],[-0.301,-4.107],[-0.275,-4.08],[-0.092,-4.08],[-0.065,-4.054],[0.118,-4.054],[0.301,-4.002],[0.615,-3.976],[0.876,-3.923],[0.915,-3.884],[0.785,-2.681],[0.549,-1.609],[0.235,-0.641],[-0.209,0.301],[-0.301,0.366],[-0.589,0.392],[-1.321,0.549],[-2.759,0.942],[-3.884,1.334],[-5.14,1.883],[-6.474,2.589],[-7.337,3.139],[-7.509,3.261],[-7.68,3.384],[-7.849,3.51],[-8.016,3.636],[-8.182,3.765],[-8.346,3.895],[-8.509,4.026],[-8.67,4.159],[-8.83,4.294],[-8.988,4.431],[-9.144,4.569],[-9.299,4.708],[-9.439,4.84],[-9.578,4.974],[-9.715,5.109],[-9.851,5.246],[-9.985,5.384],[-10.118,5.524],[-10.249,5.665],[-10.379,5.808],[-10.506,5.952],[-10.633,6.098],[-10.758,6.246],[-10.881,6.395],[-10.977,6.517],[-11.071,6.64],[-11.163,6.766],[-11.254,6.893],[-11.343,7.022],[-11.43,7.153],[-11.515,7.286],[-11.598,7.421],[-11.68,7.557],[-11.76,7.695],[-11.838,7.836],[10.476,6.591],[10.449,6.565],[10.057,6.565],[9.769,6.513],[9.534,6.513],[8.985,6.408],[8.828,6.408],[7.991,6.225],[7.952,6.186],[8.124,5.988],[8.294,5.788],[8.462,5.585],[8.628,5.38],[8.79,5.172],[8.951,4.962],[9.109,4.749],[9.264,4.534],[9.417,4.316],[9.567,4.096],[9.715,3.874],[9.861,3.649],[9.99,3.44],[10.117,3.23],[10.242,3.016],[10.364,2.8],[10.483,2.582],[10.6,2.361],[10.714,2.137],[10.826,1.911],[10.935,1.682],[11.042,1.451],[11.146,1.217],[11.247,0.981],[11.796,-0.51],[12.137,-1.687],[12.45,-3.23],[12.503,-3.78],[12.529,-3.806],[12.555,-4.355],[12.581,-4.381],[12.581,-4.774],[12.607,-4.8],[12.607,-6.395],[12.581,-6.421],[12.594,-6.67],[12.66,-6.604],[13.209,-5.454],[13.444,-4.852],[13.784,-3.78],[14.02,-2.786],[14.151,-2.053],[14.203,-1.478],[14.229,-1.452],[14.229,-1.216],[14.255,-1.19],[14.281,-0.275],[14.307,-0.248],[14.255,1.138],[14.229,1.164],[14.151,2.001],[14.098,2.158],[14.098,2.315],[13.994,2.864],[13.941,2.995],[13.941,3.126],[13.627,4.303],[13.418,4.93],[12.895,6.186],[12.865,6.224],[12.833,6.259],[12.798,6.292],[12.762,6.323],[12.723,6.351],[12.681,6.378],[12.638,6.401],[12.592,6.423],[12.543,6.442],[12.493,6.46],[12.44,6.474],[12.385,6.487],[12.045,6.513],[12.019,6.539],[11.757,6.539],[11.731,6.565],[11.339,6.565],[11.313,6.591],[7.258,6.016],[6.879,5.883],[6.508,5.742],[6.147,5.591],[5.794,5.432],[5.45,5.263],[5.116,5.085],[4.79,4.899],[4.473,4.703],[4.165,4.499],[3.866,4.286],[3.577,4.063],[3.296,3.832],[3.293,3.821],[3.292,3.812],[3.292,3.804],[3.293,3.797],[3.296,3.792],[3.3,3.788],[3.305,3.785],[3.311,3.784],[3.318,3.784],[3.327,3.786],[3.337,3.789],[3.348,3.793],[3.489,3.623],[3.628,3.451],[3.765,3.277],[3.9,3.1],[4.034,2.921],[4.165,2.741],[4.295,2.557],[4.423,2.372],[4.55,2.185],[4.674,1.995],[4.797,1.803],[4.917,1.609],[5.624,0.301],[6.068,-0.719],[6.513,-1.975],[6.958,-3.753],[7.115,-4.643],[7.141,-5.009],[7.167,-5.035],[7.219,-5.82],[7.245,-5.846],[7.245,-6.369],[7.271,-6.395],[7.271,-7.206],[7.245,-7.232],[7.219,-7.991],[7.193,-8.017],[7.193,-8.252],[7.167,-8.278],[7.115,-8.854],[6.984,-9.56],[6.949,-9.706],[6.913,-9.851],[6.876,-9.995],[6.838,-10.138],[6.798,-10.279],[6.757,-10.419],[6.715,-10.558],[6.672,-10.696],[6.628,-10.832],[6.582,-10.967],[6.535,-11.101],[6.487,-11.234],[6.425,-11.395],[6.361,-11.555],[6.296,-11.713],[6.23,-11.869],[6.162,-12.023],[6.093,-12.175],[6.023,-12.326],[5.951,-12.475],[5.878,-12.622],[5.803,-12.767],[5.727,-12.91],[5.65,-13.052],[5.818,-12.981],[5.984,-12.908],[6.148,-12.833],[6.31,-12.756],[6.471,-12.676],[6.63,-12.594],[6.787,-12.51],[6.942,-12.424],[7.096,-12.336],[7.248,-12.246],[7.398,-12.153],[7.546,-12.058],[7.744,-11.931],[7.938,-11.801],[8.131,-11.668],[8.32,-11.533],[8.507,-11.395],[8.692,-11.255],[8.874,-11.112],[9.053,-10.966],[9.229,-10.818],[9.403,-10.667],[9.575,-10.514],[9.743,-10.358],[9.921,-10.189],[10.097,-10.018],[10.269,-9.844],[10.439,-9.667],[10.605,-9.487],[10.769,-9.304],[10.93,-9.119],[11.088,-8.93],[11.243,-8.739],[11.396,-8.545],[11.545,-8.348],[11.692,-8.148],[11.796,-7.886],[11.901,-7.441],[11.927,-7.101],[11.953,-7.075],[11.953,-6.814],[11.98,-6.788],[11.98,-6.421],[12.006,-6.395],[12.006,-4.747],[11.98,-4.721],[11.98,-4.303],[11.953,-4.277],[11.927,-3.832],[11.901,-3.806],[11.901,-3.623],[11.875,-3.596],[11.796,-2.969],[11.43,-1.399],[10.907,0.196],[10.678,0.756],[10.436,1.303],[10.18,1.836],[9.91,2.355],[9.627,2.861],[9.329,3.353],[9.018,3.831],[8.694,4.295],[8.355,4.746],[8.003,5.183],[7.638,5.606],[2.812,3.426],[2.446,3.113],[2.249,2.924],[2.055,2.732],[1.865,2.536],[1.679,2.336],[1.496,2.133],[1.316,1.927],[1.14,1.717],[0.968,1.504],[0.799,1.287],[0.634,1.066],[0.472,0.842],[0.314,0.615],[0.759,-0.275],[0.994,-0.902],[1.177,-1.53],[1.439,-2.916],[1.465,-3.361],[1.491,-3.387],[1.491,-3.675],[1.517,-3.701],[1.517,-4.146],[1.543,-4.172],[1.517,-5.611],[1.491,-5.637],[1.465,-6.16],[1.439,-6.186],[1.439,-6.395],[1.36,-6.761],[1.36,-6.918],[1.046,-8.383],[0.706,-9.482],[0.633,-9.679],[0.558,-9.874],[0.481,-10.067],[0.401,-10.258],[0.319,-10.446],[0.235,-10.633],[0.149,-10.817],[0.061,-10.999],[-0.029,-11.179],[-0.122,-11.356],[-0.217,-11.532],[-0.314,-11.705],[-0.439,-11.918],[-0.567,-12.129],[-0.696,-12.337],[-0.828,-12.543],[-0.962,-12.746],[-1.099,-12.947],[-1.237,-13.145],[-1.378,-13.341],[-1.52,-13.534],[-1.665,-13.724],[-1.812,-13.913],[-1.962,-14.098],[-1.661,-14.151],[-1.478,-14.151],[-1.452,-14.177],[-0.876,-14.203],[-0.85,-14.229],[-0.458,-14.229],[-0.432,-14.255],[0.562,-14.255],[0.589,-14.229],[1.007,-14.229],[1.033,-14.203],[1.347,-14.203],[1.373,-14.177],[2.027,-14.124],[2.89,-13.967],[3.649,-13.784],[4.538,-13.497],[4.606,-13.428],[4.673,-13.357],[4.737,-13.284],[4.8,-13.209],[4.861,-13.133],[4.919,-13.054],[4.976,-12.973],[5.031,-12.891],[5.084,-12.807],[5.135,-12.72],[5.184,-12.632],[5.231,-12.542],[5.728,-11.522],[5.99,-10.842],[6.251,-10.005],[6.461,-9.115],[6.565,-8.514],[6.565,-8.357],[6.591,-8.331],[6.618,-7.86],[6.644,-7.834],[6.644,-7.494],[6.67,-7.468],[6.67,-6.16],[6.644,-6.134],[6.644,-5.767],[6.618,-5.741],[6.618,-5.427],[6.565,-5.192],[6.565,-4.983],[6.356,-3.806],[6.304,-3.675],[6.304,-3.544],[5.833,-1.844],[5.362,-0.589],[4.656,0.85],[3.793,2.236],[2.982,3.283],[-14.177,1.805],[-14.203,1.373],[-14.229,1.347],[-14.229,1.033],[-14.255,1.007],[-14.255,0.562],[-14.281,0.536],[-14.281,-0.641],[-14.255,-0.667],[-14.255,-1.007],[-14.229,-1.033],[-14.203,-1.556],[-14.177,-1.582],[-14.072,-2.446],[-13.889,-3.335],[-13.654,-4.172],[-13.287,-5.218],[-13,-5.872],[-12.633,-6.474],[-12.519,-6.59],[-12.402,-6.704],[-12.282,-6.816],[-12.159,-6.924],[-12.034,-7.029],[-11.906,-7.132],[-11.775,-7.232],[-11.641,-7.329],[-11.504,-7.424],[-11.365,-7.515],[-11.222,-7.604],[-11.077,-7.69],[-10.925,-7.782],[-10.771,-7.872],[-10.614,-7.959],[-10.456,-8.045],[-10.295,-8.129],[-10.133,-8.21],[-9.968,-8.29],[-9.802,-8.368],[-9.633,-8.443],[-9.463,-8.517],[-9.29,-8.588],[-9.115,-8.658],[-8.953,-8.72],[-8.789,-8.78],[-8.622,-8.838],[-8.455,-8.895],[-8.285,-8.95],[-8.114,-9.003],[-7.941,-9.054],[-7.766,-9.104],[-7.589,-9.152],[-7.411,-9.198],[-7.231,-9.243],[-7.049,-9.285],[-5.689,-9.521],[-4.957,-9.573],[-4.93,-9.599],[-4.512,-9.599],[-4.486,-9.626],[-2.943,-9.626],[-2.916,-9.599],[-2.184,-9.573],[-2.158,-9.547],[-1.713,-9.521],[-1.687,-9.495],[-1.504,-9.495],[-0.929,-9.39],[-0.772,-9.39],[0.157,-9.207],[0.419,-8.383],[0.628,-7.546],[0.785,-6.709],[0.837,-6.134],[0.863,-6.107],[0.889,-5.506],[0.915,-5.48],[0.915,-4.525],[0.353,-4.63],[-0.248,-4.682],[-0.275,-4.708],[-0.824,-4.734],[-0.85,-4.76],[-1.478,-4.76],[-1.504,-4.787],[-2.838,-4.76],[-2.864,-4.734],[-3.204,-4.734],[-3.23,-4.708],[-3.466,-4.708],[-3.492,-4.682],[-3.701,-4.682],[-3.91,-4.63],[-4.277,-4.604],[-5.689,-4.316],[-7.206,-3.845],[-7.682,-3.658],[-8.146,-3.46],[-8.6,-3.251],[-9.042,-3.03],[-9.473,-2.798],[-9.892,-2.555],[-10.301,-2.301],[-10.698,-2.036],[-11.084,-1.76],[-11.459,-1.472],[-11.823,-1.173],[-12.176,-0.863],[-12.284,-0.765],[-12.391,-0.664],[-12.496,-0.563],[-12.6,-0.459],[-12.702,-0.354],[-12.802,-0.247],[-12.9,-0.138],[-12.996,-0.027],[-13.091,0.085],[-13.185,0.199],[-13.276,0.314],[-13.366,0.432],[-13.439,0.53],[-13.51,0.631],[-13.579,0.735],[-13.646,0.84],[-13.71,0.948],[-13.773,1.058],[-13.833,1.17],[-13.89,1.285],[-13.946,1.402],[-13.999,1.521],[-14.05,1.642],[-14.098,1.766],[-11.718,-8.004],[-11.627,-8.139],[-11.535,-8.273],[-11.441,-8.405],[-11.345,-8.537],[-11.247,-8.666],[-11.148,-8.794],[-11.047,-8.921],[-10.944,-9.047],[-10.839,-9.171],[-10.733,-9.293],[-10.625,-9.414],[-10.515,-9.534],[-10.259,-9.806],[-9.996,-10.071],[-9.727,-10.329],[-9.451,-10.58],[-9.168,-10.824],[-8.878,-11.062],[-8.582,-11.293],[-8.278,-11.517],[-7.968,-11.735],[-7.651,-11.945],[-7.327,-12.149],[-6.997,-12.346],[-6.836,-12.44],[-6.673,-12.533],[-6.509,-12.623],[-6.342,-12.711],[-6.173,-12.797],[-6.002,-12.881],[-5.828,-12.962],[-5.653,-13.042],[-5.475,-13.12],[-5.296,-13.195],[-5.114,-13.268],[-4.93,-13.34],[-4.015,-13.654],[-2.89,-13.941],[-2.861,-13.946],[-2.834,-13.95],[-2.807,-13.952],[-2.782,-13.954],[-2.758,-13.953],[-2.736,-13.952],[-2.715,-13.949],[-2.695,-13.945],[-2.676,-13.939],[-2.659,-13.933],[-2.643,-13.925],[-2.629,-13.915],[-2.377,-13.626],[-2.134,-13.329],[-1.898,-13.024],[-1.67,-12.712],[-1.45,-12.391],[-1.238,-12.063],[-1.034,-11.726],[-0.837,-11.382],[-0.649,-11.03],[-0.468,-10.67],[-0.296,-10.302],[-0.131,-9.926],[-0.118,-9.887],[-0.275,-9.887],[-0.432,-9.939],[-1.269,-10.044],[-1.295,-10.07],[-1.949,-10.122],[-1.975,-10.149],[-2.629,-10.175],[-2.655,-10.201],[-3.309,-10.201],[-3.335,-10.227],[-4.669,-10.201],[-4.695,-10.175],[-5.061,-10.175],[-5.087,-10.149],[-5.611,-10.122],[-5.637,-10.096],[-5.82,-10.096],[-5.846,-10.07],[-6.003,-10.07],[-6.657,-9.939],[-6.788,-9.939],[-7.834,-9.704],[-8.932,-9.364],[-9.796,-9.024],[-10.711,-8.579]],paths = [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213],[214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330],[331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414],[415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538],[539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,575,576,577,578,579,580,581,582,583,584,585,586,587,588,589,590,591,592,593,594,595,596,597,598,599,600,601,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,641,642,643,644,645,646,647,648,649,650,651,652,653,654,655,656,657,658,659,660,661],[662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699,700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,741,742,743,744,745,746,747],[748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,827,828,829,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,846,847,848,849,850,851,852,853,854,855,856,857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,874,875,876,877,878,879,880,881,882,883,884,885,886,887,888,889,890,891,892,893],[894,895,896,897,898,899,900,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,930,931,932,933,934,935,936,937,938,939,940,941,942,943,944,945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,975,976,977,978,979,980,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,1000,1001,1002,1003,1004,1005],[1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1107,1108,1109,1110,1111,1112,1113,1114,1115,1116,1117,1118,1119,1120,1121,1122,1123,1124,1125,1126,1127,1128,1129,1130,1131,1132,1133,1134,1135,1136,1137],[1138,1139,1140,1141,1142,1143,1144,1145,1146,1147,1148,1149,1150,1151,1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162,1163,1164,1165,1166,1167,1168,1169,1170,1171,1172,1173,1174,1175,1176,1177,1178,1179,1180,1181,1182,1183,1184,1185,1186,1187,1188,1189,1190,1191,1192,1193,1194,1195,1196,1197,1198,1199,1200,1201,1202,1203,1204,1205,1206,1207,1208,1209,1210,1211,1212,1213,1214,1215,1216,1217,1218,1219,1220,1221,1222,1223,1224,1225,1226]]);
}


// Removed unused legacy definition: v17_racket_background_2d



// Removed unused legacy definition: v17_racket_background_exact_paths

// Removed unused legacy definition: v17_racket_background_exact_2d


// Removed unused legacy definition: v17_racket_background_compound_2d


// ===== VERS17 EXACT SYMBOL REPAIRS =====

// Curves are sampled densely from the original SVG Q commands. No geometric simplification is applied.

function v17_lacrosse_core_points() = [[0.8368,16.4],[2.5105,16.4],[2.5503,16.3602],[2.9488,16.3602],[2.9887,16.3203],[3.5465,16.2805],[4.7022,16.0414],[5.9773,15.6429],[6.0944,15.5981],[6.2107,15.5525],[6.3261,15.506],[6.4406,15.4586],[6.5542,15.4104],[6.667,15.3613],[6.7789,15.3113],[6.89,15.2604],[7.0001,15.2087],[7.1094,15.1561],[7.2179,15.1027],[7.3254,15.0484],[7.4321,14.9932],[7.538,14.9371],[7.6429,14.8802],[7.747,14.8224],[7.8503,14.7638],[7.9526,14.7042],[8.0541,14.6439],[8.1547,14.5826],[8.2545,14.5205],[8.3534,14.4575],[8.4514,14.3936],[8.5486,14.3289],[8.6448,14.2633],[8.7402,14.1968],[8.8348,14.1294],[8.9285,14.0612],[9.0213,13.9922],[9.1132,13.9222],[9.2043,13.8514],[9.2945,13.7797],[9.3838,13.7072],[9.4723,13.6338],[9.5599,13.5595],[9.6466,13.4843],[9.7325,13.4083],[9.8175,13.3314],[9.9016,13.2536],[9.9849,13.175],[10.0673,13.0955],[10.1488,13.0152],[10.2294,12.9339],[10.3092,12.8518],[10.3881,12.7689],[10.4662,12.685],[10.5434,12.6003],[10.6197,12.5147],[10.6623,12.4661],[10.7046,12.417],[10.7464,12.3675],[10.7878,12.3176],[10.8289,12.2673],[10.8695,12.2166],[10.9097,12.1655],[10.9495,12.114],[10.989,12.0622],[11.028,12.0099],[11.0666,11.9572],[11.1048,11.9041],[11.1427,11.8506],[11.1801,11.7967],[11.2171,11.7424],[11.2537,11.6877],[11.2899,11.6326],[11.3258,11.5771],[11.3612,11.5212],[11.3962,11.4648],[11.4308,11.4081],[11.465,11.351],[11.4988,11.2935],[11.5322,11.2356],[11.5652,11.1773],[11.5978,11.1186],[11.63,11.0595],[11.6618,10.9999],[11.6932,10.94],[11.7242,10.8797],[11.7548,10.819],[11.785,10.7579],[11.8148,10.6963],[11.8442,10.6344],[11.8732,10.5721],[11.9018,10.5094],[11.93,10.4462],[11.9578,10.3827],[11.9852,10.3188],[12.0122,10.2544],[12.0388,10.1897],[12.065,10.1246],[12.0907,10.059],[12.1161,9.9931],[12.1411,9.9268],[12.1657,9.86],[12.1899,9.7929],[12.2136,9.7253],[12.4129,9.0081],[12.5324,8.3306],[12.5324,8.0118],[12.5723,7.972],[12.5723,6.6171],[12.5324,6.5773],[12.4926,5.8999],[12.3332,5.1826],[12.0941,4.4255],[11.7753,3.6683],[11.7444,3.6054],[11.7131,3.5429],[11.6814,3.4808],[11.6493,3.4191],[11.6167,3.3578],[11.5838,3.2969],[11.5505,3.2364],[11.5168,3.1763],[11.4827,3.1166],[11.4482,3.0573],[11.4134,2.9984],[11.3781,2.9398],[11.3424,2.8817],[11.3063,2.824],[11.2698,2.7667],[11.2329,2.7097],[11.1956,2.6532],[11.158,2.5971],[11.1199,2.5413],[11.0814,2.486],[11.0425,2.4311],[11.0033,2.3765],[10.9636,2.3224],[10.9235,2.2686],[10.8831,2.2153],[10.8422,2.1623],[10.801,2.1098],[10.7593,2.0576],[10.7172,2.0059],[10.6748,1.9545],[10.6319,1.9036],[10.5887,1.853],[10.5451,1.8028],[10.501,1.7531],[10.4566,1.7037],[10.4117,1.6547],[10.3665,1.6061],[10.3209,1.558],[10.2748,1.5102],[10.2284,1.4628],[10.1816,1.4158],[10.1343,1.3692],[10.0867,1.3231],[10.0387,1.2773],[9.9903,1.2319],[9.9415,1.1869],[9.8923,1.1423],[9.8426,1.0981],[8.6472,0.1816],[6.8141,-0.9342],[5.6187,-1.771],[5.5722,-1.8093],[5.5259,-1.8476],[5.4797,-1.8861],[5.4337,-1.9247],[5.3877,-1.9635],[5.3419,-2.0023],[5.2962,-2.0413],[5.2506,-2.0804],[5.2052,-2.1196],[5.1598,-2.159],[5.1146,-2.1984],[5.0695,-2.238],[5.0245,-2.2777],[4.9797,-2.3175],[4.9349,-2.3575],[4.8903,-2.3975],[4.8458,-2.4377],[4.8015,-2.478],[4.7572,-2.5185],[4.7131,-2.559],[4.6691,-2.5997],[4.6252,-2.6405],[4.5814,-2.6814],[4.5378,-2.7224],[4.4943,-2.7636],[4.4508,-2.8048],[4.4076,-2.8462],[4.3644,-2.8878],[4.3214,-2.9294],[4.2784,-2.9712],[4.2357,-3.013],[4.193,-3.055],[4.1504,-3.0972],[4.108,-3.1394],[4.0657,-3.1818],[4.0235,-3.2243],[3.9814,-3.2669],[3.9395,-3.3096],[3.8976,-3.3524],[3.8559,-3.3954],[3.8143,-3.4385],[3.7729,-3.4817],[3.7315,-3.5251],[3.6903,-3.5685],[3.6492,-3.6121],[3.6082,-3.6558],[3.5674,-3.6996],[3.5266,-3.7435],[1.6537,-5.9352],[-0.6575,-9.0434],[-1.7932,-10.2588],[-2.7496,-10.9761],[-4.3834,-11.8926],[-5.3796,-12.5302],[-5.4192,-12.5578],[-5.4586,-12.5856],[-5.498,-12.6135],[-5.5371,-12.6416],[-5.5761,-12.6699],[-5.615,-12.6982],[-5.6537,-12.7268],[-5.6923,-12.7554],[-5.7307,-12.7843],[-5.769,-12.8132],[-5.8071,-12.8424],[-5.8451,-12.8716],[-5.8829,-12.9011],[-5.9206,-12.9306],[-5.9581,-12.9604],[-5.9955,-12.9902],[-6.0327,-13.0202],[-6.0698,-13.0504],[-6.1067,-13.0807],[-6.1435,-13.1112],[-6.1801,-13.1418],[-6.2166,-13.1725],[-6.2529,-13.2035],[-6.2891,-13.2345],[-6.3252,-13.2657],[-6.3611,-13.2971],[-6.3968,-13.3286],[-6.4324,-13.3602],[-6.4678,-13.392],[-6.5031,-13.424],[-6.5383,-13.4561],[-6.5733,-13.4883],[-6.6081,-13.5207],[-6.6428,-13.5533],[-6.6774,-13.586],[-6.7118,-13.6188],[-6.746,-13.6518],[-6.7801,-13.6849],[-6.8141,-13.7182],[-6.8479,-13.7517],[-6.8816,-13.7852],[-6.9151,-13.819],[-6.9484,-13.8529],[-6.9816,-13.8869],[-7.0147,-13.9211],[-7.0476,-13.9554],[-7.0804,-13.9899],[-7.113,-14.0245],[-7.91,-14.941],[-8.707,-16.1365],[-8.8863,-16.3158],[-8.8911,-16.3201],[-8.8961,-16.3242],[-8.9012,-16.3283],[-8.9064,-16.3322],[-8.9117,-16.336],[-8.9172,-16.3397],[-8.9227,-16.3433],[-8.9283,-16.3468],[-8.9341,-16.3502],[-8.94,-16.3535],[-8.9459,-16.3566],[-8.952,-16.3597],[-8.9582,-16.3626],[-8.9645,-16.3654],[-8.9709,-16.3681],[-8.9775,-16.3707],[-8.9841,-16.3732],[-8.9909,-16.3756],[-8.9977,-16.3779],[-9.0047,-16.38],[-9.0118,-16.3821],[-9.019,-16.384],[-9.0263,-16.3858],[-9.0337,-16.3875],[-9.0412,-16.3892],[-9.0489,-16.3906],[-9.0566,-16.392],[-9.0645,-16.3933],[-9.0725,-16.3945],[-9.0805,-16.3955],[-9.0887,-16.3965],[-9.097,-16.3973],[-9.1054,-16.398],[-9.114,-16.3986],[-9.1226,-16.3991],[-9.1313,-16.3995],[-9.1402,-16.3998],[-9.1492,-16.3999],[-9.1582,-16.4],[-9.1674,-16.3999],[-9.1767,-16.3998],[-9.1861,-16.3995],[-9.1957,-16.3991],[-9.2053,-16.3986],[-9.215,-16.398],[-9.2249,-16.3973],[-9.2348,-16.3965],[-9.2449,-16.3955],[-11.9945,-14.961],[-12.3531,-14.7617],[-12.5324,-14.5824],[-12.5723,-14.1839],[-12.5368,-14.1182],[-12.5016,-14.0521],[-12.4667,-13.9856],[-12.4323,-13.9188],[-12.3981,-13.8517],[-12.3643,-13.7842],[-12.3309,-13.7163],[-12.2978,-13.6482],[-12.265,-13.5796],[-12.2326,-13.5108],[-12.2005,-13.4416],[-12.1688,-13.372],[-12.1374,-13.3021],[-12.1064,-13.2318],[-12.0757,-13.1612],[-12.0454,-13.0903],[-12.0154,-13.019],[-11.9858,-12.9474],[-11.9565,-12.8754],[-11.9275,-12.803],[-11.8989,-12.7304],[-11.8706,-12.6573],[-11.8427,-12.584],[-11.8152,-12.5103],[-11.7879,-12.4362],[-11.7611,-12.3618],[-11.7345,-12.287],[-11.7083,-12.212],[-11.6825,-12.1365],[-11.657,-12.0607],[-11.6319,-11.9846],[-11.6071,-11.9081],[-11.5826,-11.8313],[-11.5585,-11.7541],[-11.5347,-11.6766],[-11.5113,-11.5987],[-11.4882,-11.5205],[-11.4655,-11.442],[-11.4431,-11.3631],[-11.4211,-11.2838],[-11.3994,-11.2042],[-11.3781,-11.1243],[-11.3571,-11.044],[-11.3364,-10.9634],[-11.3161,-10.8824],[-11.2962,-10.8011],[-11.2765,-10.7194],[-11.2573,-10.6374],[-11.1377,-9.7209],[-11.0979,-9.681],[-11.058,-8.8442],[-11.0182,-8.8043],[-10.9783,-6.6525],[-10.9385,-6.6127],[-10.8986,-6.0149],[-10.6994,-5.1382],[-10.4603,-4.421],[-10.0618,-3.5044],[-10.0175,-3.42],[-9.9734,-3.3355],[-9.9293,-3.2509],[-9.8854,-3.1661],[-9.8416,-3.0812],[-9.7979,-2.9963],[-9.7544,-2.9111],[-9.7109,-2.8259],[-9.6676,-2.7406],[-9.6244,-2.6551],[-9.5813,-2.5695],[-9.5383,-2.4838],[-9.4954,-2.398],[-9.4527,-2.3121],[-9.4101,-2.226],[-9.3676,-2.1398],[-9.3252,-2.0536],[-9.2829,-1.9672],[-9.2407,-1.8806],[-9.1987,-1.794],[-9.1568,-1.7072],[-9.115,-1.6204],[-9.0733,-1.5334],[-9.0317,-1.4463],[-8.9903,-1.359],[-8.9489,-1.2717],[-8.9077,-1.1842],[-8.8666,-1.0966],[-8.8256,-1.0089],[-8.7848,-0.9211],[-8.744,-0.8332],[-8.7034,-0.7451],[-8.6629,-0.657],[-8.6225,-0.5687],[-8.5822,-0.4803],[-8.5421,-0.3918],[-8.502,-0.3031],[-8.4621,-0.2144],[-8.4223,-0.1255],[-8.3826,-0.0365],[-8.3431,0.0526],[-8.3036,0.1418],[-8.2643,0.2312],[-8.2251,0.3206],[-8.186,0.4102],[-8.147,0.4999],[-8.1081,0.5897],[-8.0694,0.6797],[-7.3122,2.5924],[-6.8341,4.0668],[-6.5153,5.5412],[-6.2762,9.287],[-6.2363,9.3268],[-6.1566,10.084],[-5.9574,10.9208],[-5.9286,11.0157],[-5.8991,11.1099],[-5.8687,11.2032],[-5.8376,11.2958],[-5.8058,11.3877],[-5.7731,11.4787],[-5.7397,11.569],[-5.7056,11.6586],[-5.6706,11.7473],[-5.6349,11.8353],[-5.5984,11.9225],[-5.5611,12.0089],[-5.5231,12.0946],[-5.4843,12.1795],[-5.4447,12.2636],[-5.4044,12.3469],[-5.3633,12.4295],[-5.3214,12.5113],[-5.2787,12.5924],[-5.2353,12.6726],[-5.1911,12.7521],[-5.1461,12.8308],[-5.1003,12.9088],[-5.0538,12.986],[-5.0065,13.0624],[-4.9585,13.138],[-4.9096,13.2129],[-4.86,13.287],[-4.8096,13.3603],[-4.7585,13.4328],[-4.7066,13.5046],[-4.6539,13.5756],[-4.6004,13.6458],[-4.5462,13.7153],[-4.4912,13.784],[-4.4354,13.8519],[-4.3789,13.9191],[-4.3215,13.9854],[-4.2635,14.0511],[-4.2046,14.1159],[-4.145,14.18],[-4.0846,14.2432],[-4.0234,14.3058],[-3.9614,14.3675],[-3.8987,14.4285],[-3.8352,14.4887],[-3.771,14.5481],[-3.7059,14.6068],[-3.6701,14.639],[-3.634,14.671],[-3.5976,14.7027],[-3.5609,14.7341],[-3.524,14.7652],[-3.4868,14.7961],[-3.4493,14.8267],[-3.4115,14.857],[-3.3734,14.887],[-3.3351,14.9167],[-3.2965,14.9462],[-3.2576,14.9754],[-3.2185,15.0043],[-3.179,15.033],[-3.1393,15.0613],[-3.0993,15.0894],[-3.0591,15.1172],[-3.0185,15.1448],[-2.9777,15.172],[-2.9366,15.199],[-2.8953,15.2257],[-2.8536,15.2521],[-2.8117,15.2783],[-2.7695,15.3042],[-2.727,15.3298],[-2.6843,15.3551],[-2.6412,15.3801],[-2.5979,15.4049],[-2.5543,15.4294],[-2.5105,15.4536],[-2.4663,15.4775],[-2.4219,15.5012],[-2.3772,15.5246],[-2.3323,15.5477],[-2.287,15.5705],[-2.2415,15.5931],[-2.1957,15.6153],[-2.1496,15.6373],[-2.1033,15.6591],[-2.0566,15.6805],[-2.0097,15.7017],[-1.9626,15.7226],[-1.9151,15.7432],[-1.8674,15.7635],[-1.8193,15.7836],[-1.7711,15.8034],[-1.7225,15.8229],[-1.6736,15.8421],[-0.4782,16.2008],[0.4383,16.3602],[0.797,16.3602]];
// Sequential core path omitted for v17_lacrosse; polygon() uses point order directly.
module v17_lacrosse_core_2d() { polygon(points = v17_lacrosse_core_points()); }

// Removed unused legacy definition: v17_lacrosse_net_points

// Removed unused legacy definition: v17_lacrosse_net_paths

// Removed unused legacy definition: v17_lacrosse_net_2d


function v17_pencil_core_points() = [[9.9957,16.4],[10.7159,16.4],[10.7344,16.3966],[10.7528,16.3931],[10.771,16.3894],[10.7892,16.3857],[10.8073,16.3819],[10.8253,16.3781],[10.8432,16.3741],[10.861,16.37],[10.8787,16.3658],[10.8963,16.3616],[10.9138,16.3572],[10.9312,16.3527],[10.9486,16.3482],[10.9658,16.3435],[10.983,16.3388],[11,16.334],[11.017,16.3291],[11.0338,16.324],[11.0506,16.3189],[11.0673,16.3137],[11.0839,16.3084],[11.1004,16.303],[11.1168,16.2975],[11.1331,16.292],[11.1493,16.2863],[11.1654,16.2805],[11.1814,16.2747],[11.1973,16.2687],[11.2132,16.2627],[11.2289,16.2565],[11.2445,16.2503],[11.2601,16.244],[11.2756,16.2375],[11.2909,16.231],[11.3062,16.2244],[11.3214,16.2177],[11.3364,16.2109],[11.3514,16.204],[11.3663,16.197],[11.3811,16.1899],[11.3958,16.1828],[11.4105,16.1755],[11.425,16.1681],[11.4394,16.1607],[11.4537,16.1531],[11.468,16.1455],[11.4821,16.1377],[11.4962,16.1299],[11.5473,16.0929],[11.5983,16.0557],[11.6492,16.0185],[11.7,15.9812],[11.7508,15.9438],[11.8015,15.9063],[11.852,15.8687],[11.9025,15.8311],[11.953,15.7933],[12.0033,15.7555],[12.0535,15.7176],[12.1037,15.6796],[12.1537,15.6415],[12.2037,15.6033],[12.2536,15.5651],[12.3034,15.5267],[12.3531,15.4883],[12.4028,15.4498],[12.4523,15.4112],[12.5018,15.3725],[12.5512,15.3337],[12.6005,15.2949],[12.6497,15.2559],[12.6988,15.2169],[12.7478,15.1778],[12.7968,15.1386],[12.8456,15.0993],[12.8944,15.0599],[12.9431,15.0204],[12.9917,14.9809],[13.0402,14.9413],[13.0887,14.9015],[13.137,14.8617],[13.1853,14.8218],[13.2334,14.7819],[13.2815,14.7418],[13.3295,14.7017],[13.3774,14.6614],[13.4253,14.6211],[13.473,14.5807],[13.5207,14.5402],[13.5683,14.4996],[13.6157,14.459],[13.6631,14.4182],[13.7105,14.3774],[13.7577,14.3364],[13.8048,14.2954],[13.8519,14.2543],[13.864,14.2402],[13.8759,14.2259],[13.8878,14.2114],[13.8995,14.1969],[13.9111,14.1823],[13.9226,14.1675],[13.934,14.1526],[13.9452,14.1376],[13.9564,14.1225],[13.9674,14.1073],[13.9784,14.092],[13.9892,14.0765],[13.9999,14.061],[14.0105,14.0453],[14.0209,14.0295],[14.0313,14.0136],[14.0415,13.9976],[14.0516,13.9815],[14.0616,13.9652],[14.0715,13.9488],[14.0813,13.9324],[14.091,13.9158],[14.1005,13.8991],[14.11,13.8822],[14.1193,13.8653],[14.1285,13.8482],[14.1376,13.8311],[14.1466,13.8138],[14.1554,13.7964],[14.1642,13.7789],[14.1728,13.7613],[14.1813,13.7435],[14.1897,13.7257],[14.198,13.7077],[14.2062,13.6896],[14.2142,13.6714],[14.2222,13.6531],[14.23,13.6347],[14.2377,13.6161],[14.2453,13.5975],[14.2528,13.5787],[14.2602,13.5598],[14.2675,13.5408],[14.2746,13.5217],[14.2816,13.5025],[14.2885,13.4831],[14.2953,13.4637],[14.302,13.4441],[14.3921,13.024],[14.3921,12.5138],[14.242,11.9136],[14.0319,11.4935],[12.0213,9.1228],[12.0213,9.0628],[12.0513,8.9127],[11.9913,8.7627],[11.1361,7.7874],[11.061,7.7424],[10.941,7.5023],[10.2058,6.647],[10.0107,6.512],[-6.5993,-12.7389],[-13.9516,-16.4],[-14.1316,-16.4],[-14.3267,-16.295],[-14.3302,-16.2915],[-14.3335,-16.288],[-14.3368,-16.2844],[-14.34,-16.2807],[-14.343,-16.2769],[-14.346,-16.273],[-14.3489,-16.269],[-14.3517,-16.265],[-14.3544,-16.2608],[-14.357,-16.2565],[-14.3595,-16.2522],[-14.362,-16.2477],[-14.3643,-16.2432],[-14.3665,-16.2385],[-14.3687,-16.2338],[-14.3707,-16.2289],[-14.3727,-16.224],[-14.3745,-16.219],[-14.3763,-16.2139],[-14.378,-16.2087],[-14.3795,-16.2034],[-14.381,-16.198],[-14.3824,-16.1925],[-14.3837,-16.1869],[-14.3849,-16.1813],[-14.386,-16.1755],[-14.3871,-16.1696],[-14.388,-16.1637],[-14.3888,-16.1576],[-14.3895,-16.1515],[-14.3902,-16.1453],[-14.3907,-16.1389],[-14.3912,-16.1325],[-14.3915,-16.126],[-14.3918,-16.1194],[-14.392,-16.1127],[-14.3921,-16.1059],[-14.392,-16.099],[-14.3919,-16.092],[-14.3917,-16.0849],[-14.3914,-16.0777],[-14.391,-16.0705],[-14.3906,-16.0631],[-14.39,-16.0556],[-14.3893,-16.0481],[-14.3885,-16.0405],[-14.3877,-16.0327],[-14.3867,-16.0249],[-13.3964,-12.9039],[-13.3064,-12.5138],[-12.7662,-10.8933],[-12.7662,-10.8033],[-12.1961,-9.0928],[-12.076,-8.6126],[-11.926,-8.2825],[4.279,10.5332],[4.6091,10.9233],[4.61,10.9355],[4.6111,10.9476],[4.6122,10.9596],[4.6135,10.9714],[4.6149,10.9831],[4.6165,10.9947],[4.6181,11.0062],[4.6199,11.0175],[4.6218,11.0288],[4.6238,11.0399],[4.6259,11.0509],[4.6282,11.0617],[4.6306,11.0725],[4.6331,11.0831],[4.6357,11.0937],[4.6384,11.1041],[4.6413,11.1143],[4.6442,11.1245],[4.6473,11.1345],[4.6505,11.1444],[4.6539,11.1542],[4.6573,11.1639],[4.6609,11.1735],[4.6646,11.1829],[4.6684,11.1922],[4.6723,11.2014],[4.6764,11.2105],[4.6805,11.2195],[4.6848,11.2283],[4.6892,11.237],[4.6938,11.2456],[4.6984,11.2541],[4.7032,11.2625],[4.7081,11.2707],[4.7131,11.2788],[4.7182,11.2868],[4.7235,11.2947],[4.7288,11.3025],[4.7343,11.3101],[4.7399,11.3176],[4.7457,11.325],[4.7515,11.3323],[4.7575,11.3395],[4.7636,11.3465],[4.7698,11.3534],[4.7761,11.3602],[4.7826,11.3669],[4.7891,11.3735],[5.5544,12.2287],[5.5572,12.2278],[5.5599,12.2269],[5.5626,12.2261],[5.5652,12.2254],[5.5677,12.2247],[5.5702,12.2242],[5.5725,12.2237],[5.5748,12.2233],[5.577,12.223],[5.5791,12.2228],[5.5811,12.2226],[5.5831,12.2225],[5.5849,12.2225],[5.5867,12.2226],[5.5884,12.2228],[5.59,12.2231],[5.5916,12.2234],[5.593,12.2238],[5.5944,12.2243],[5.5957,12.2249],[5.5969,12.2255],[5.5981,12.2263],[5.5991,12.2271],[5.6001,12.228],[5.601,12.229],[5.6018,12.23],[5.6026,12.2312],[5.6032,12.2324],[5.6038,12.2337],[5.6043,12.2351],[5.6047,12.2365],[5.605,12.2381],[5.6053,12.2397],[5.6055,12.2414],[5.6056,12.2432],[5.6056,12.245],[5.6055,12.247],[5.6053,12.249],[5.6051,12.2511],[5.6048,12.2533],[5.6044,12.2556],[5.6039,12.2579],[5.6034,12.2604],[5.6027,12.2629],[5.602,12.2655],[5.6012,12.2682],[5.6003,12.2709],[5.5994,12.2737],[5.6894,12.4538],[6.4846,13.3391],[6.6947,13.3991],[6.8297,13.5341],[8.5403,15.5447],[8.9454,15.9499],[8.9634,15.9632],[8.9815,15.9763],[8.9998,15.9892],[9.0182,16.002],[9.0369,16.0147],[9.0557,16.0271],[9.0746,16.0394],[9.0938,16.0516],[9.1131,16.0635],[9.1325,16.0753],[9.1522,16.0869],[9.172,16.0984],[9.1919,16.1097],[9.2121,16.1208],[9.2324,16.1318],[9.2528,16.1426],[9.2734,16.1532],[9.2942,16.1637],[9.3152,16.174],[9.3363,16.1841],[9.3576,16.1941],[9.3791,16.2039],[9.4007,16.2135],[9.4225,16.2229],[9.4445,16.2322],[9.4666,16.2414],[9.4889,16.2503],[9.5114,16.2591],[9.534,16.2678],[9.5568,16.2762],[9.5798,16.2845],[9.6029,16.2926],[9.6262,16.3006],[9.6497,16.3084],[9.6733,16.316],[9.6971,16.3235],[9.7211,16.3308],[9.7452,16.3379],[9.7695,16.3449],[9.794,16.3517],[9.8186,16.3583],[9.8434,16.3647],[9.8684,16.371],[9.8935,16.3772],[9.9188,16.3831],[9.9443,16.3889],[9.9699,16.3945]];
// Sequential core path omitted for v17_pencil; polygon() uses point order directly.
module v17_pencil_core_2d() { polygon(points = v17_pencil_core_points()); }

// Removed unused legacy definition: v17_pencil_details_paths

// Removed unused legacy definition: v17_pencil_details_2d


function v17_double_note_core_points() = [[13.8463,16.4],[14.0121,16.4],[14.2277,16.3005],[14.3272,16.0849],[14.3272,-8.5234],[14.1945,-9.2861],[13.8297,-10.2479],[13.8094,-10.2858],[13.7889,-10.3234],[13.7681,-10.3608],[13.7471,-10.398],[13.7259,-10.4349],[13.7044,-10.4715],[13.6826,-10.5079],[13.6607,-10.5441],[13.6385,-10.58],[13.616,-10.6157],[13.5933,-10.6511],[13.5704,-10.6863],[13.5473,-10.7213],[13.5239,-10.756],[13.5002,-10.7904],[13.4763,-10.8246],[13.4522,-10.8586],[13.4279,-10.8923],[13.4033,-10.9258],[13.3784,-10.959],[13.3534,-10.992],[13.328,-11.0247],[13.3025,-11.0572],[13.2767,-11.0895],[13.2507,-11.1215],[13.2244,-11.1533],[13.1979,-11.1848],[13.1712,-11.216],[13.1442,-11.2471],[13.1169,-11.2779],[13.0895,-11.3084],[13.0618,-11.3387],[13.0338,-11.3687],[13.0057,-11.3985],[12.9772,-11.4281],[12.9486,-11.4574],[12.9197,-11.4865],[12.8905,-11.5153],[12.8612,-11.5439],[12.8316,-11.5722],[12.8017,-11.6003],[12.7716,-11.6282],[12.7413,-11.6558],[12.7107,-11.6831],[12.6799,-11.7102],[12.6489,-11.7371],[12.6176,-11.7637],[12.586,-11.7901],[12.5488,-11.8213],[12.5113,-11.8522],[12.4735,-11.8827],[12.4353,-11.9129],[12.3968,-11.9428],[12.3579,-11.9724],[12.3188,-12.0016],[12.2793,-12.0305],[12.2394,-12.0591],[12.1993,-12.0874],[12.1588,-12.1153],[12.118,-12.1429],[12.0769,-12.1701],[12.0354,-12.1971],[11.9936,-12.2237],[11.9515,-12.25],[11.909,-12.2759],[11.8663,-12.3016],[11.8232,-12.3269],[11.7797,-12.3518],[11.736,-12.3765],[11.6919,-12.4008],[11.6475,-12.4248],[11.6027,-12.4484],[11.5576,-12.4717],[11.5122,-12.4947],[11.4665,-12.5174],[11.4204,-12.5398],[11.3741,-12.5618],[11.3273,-12.5835],[11.2803,-12.6048],[11.2329,-12.6258],[11.1852,-12.6465],[11.1372,-12.6669],[11.0888,-12.687],[11.0402,-12.7067],[10.9911,-12.7261],[10.9418,-12.7451],[10.8921,-12.7639],[10.8421,-12.7823],[10.7918,-12.8003],[10.7412,-12.8181],[10.6902,-12.8355],[10.6389,-12.8526],[10.5872,-12.8694],[10.5353,-12.8858],[10.483,-12.9019],[10.4303,-12.9177],[9.6012,-13.0835],[8.4736,-13.1167],[8.4404,-13.0835],[8.0756,-13.0835],[7.2797,-12.9177],[6.4174,-12.586],[6.3786,-12.5662],[6.34,-12.546],[6.3016,-12.5256],[6.2636,-12.505],[6.2258,-12.484],[6.1882,-12.4629],[6.1509,-12.4414],[6.1138,-12.4198],[6.0771,-12.3978],[6.0405,-12.3756],[6.0042,-12.3532],[5.9682,-12.3305],[5.9324,-12.3075],[5.8969,-12.2843],[5.8617,-12.2608],[5.8267,-12.2371],[5.7919,-12.2131],[5.7575,-12.1888],[5.7232,-12.1643],[5.6893,-12.1396],[5.6555,-12.1146],[5.6221,-12.0893],[5.5889,-12.0638],[5.5559,-12.038],[5.5232,-12.012],[5.4908,-11.9857],[5.4586,-11.9591],[5.4267,-11.9323],[5.395,-11.9052],[5.3636,-11.8779],[5.3325,-11.8504],[5.3016,-11.8225],[5.2709,-11.7944],[5.2406,-11.7661],[5.2104,-11.7375],[5.1806,-11.7086],[5.1509,-11.6795],[5.1216,-11.6501],[5.0925,-11.6205],[5.0636,-11.5906],[5.035,-11.5605],[5.0067,-11.5301],[4.9786,-11.4995],[4.9508,-11.4686],[4.9232,-11.4374],[4.8959,-11.406],[4.8689,-11.3743],[4.8421,-11.3424],[4.8218,-11.3177],[4.8018,-11.2928],[4.782,-11.2677],[4.7623,-11.2425],[4.7428,-11.2171],[4.7235,-11.1915],[4.7044,-11.1657],[4.6855,-11.1397],[4.6667,-11.1135],[4.6481,-11.0872],[4.6298,-11.0606],[4.6116,-11.0339],[4.5936,-11.007],[4.5757,-10.9799],[4.5581,-10.9527],[4.5406,-10.9252],[4.5234,-10.8976],[4.5063,-10.8698],[4.4894,-10.8418],[4.4726,-10.8136],[4.4561,-10.7852],[4.4398,-10.7566],[4.4236,-10.7279],[4.4076,-10.699],[4.3918,-10.6699],[4.3762,-10.6406],[4.3608,-10.6111],[4.3455,-10.5814],[4.3304,-10.5516],[4.3156,-10.5215],[4.3009,-10.4913],[4.2864,-10.4609],[4.272,-10.4303],[4.2579,-10.3996],[4.2439,-10.3686],[4.2302,-10.3375],[4.2166,-10.3061],[4.2032,-10.2746],[4.19,-10.243],[4.1769,-10.2111],[4.1641,-10.179],[4.1514,-10.1468],[4.1389,-10.1143],[4.1266,-10.0817],[4.1145,-10.0489],[4.1026,-10.016],[4.0908,-9.9828],[4.0793,-9.9494],[3.9134,-9.1867],[3.9134,-8.1585],[4.0461,-7.4952],[4.3778,-6.6661],[4.3958,-6.6324],[4.4141,-6.5988],[4.4325,-6.5654],[4.4511,-6.5322],[4.4699,-6.4992],[4.4889,-6.4664],[4.5081,-6.4337],[4.5275,-6.4013],[4.547,-6.369],[4.5668,-6.3369],[4.5867,-6.305],[4.6068,-6.2733],[4.6271,-6.2418],[4.6476,-6.2105],[4.6683,-6.1793],[4.6891,-6.1484],[4.7102,-6.1176],[4.7314,-6.087],[4.7529,-6.0566],[4.7745,-6.0264],[4.7963,-5.9964],[4.8183,-5.9666],[4.8404,-5.9369],[4.8628,-5.9075],[4.8853,-5.8782],[4.9081,-5.8491],[4.931,-5.8202],[4.9541,-5.7915],[4.9774,-5.763],[5.0009,-5.7347],[5.0246,-5.7065],[5.0484,-5.6786],[5.0725,-5.6508],[5.0967,-5.6232],[5.1211,-5.5958],[5.1457,-5.5686],[5.1705,-5.5416],[5.1955,-5.5147],[5.2207,-5.4881],[5.246,-5.4616],[5.2716,-5.4353],[5.2973,-5.4092],[5.3232,-5.3833],[5.3493,-5.3576],[5.3756,-5.3321],[5.4021,-5.3067],[5.4288,-5.2816],[5.4556,-5.2566],[6.3842,-4.5602],[7.346,-4.0959],[8.3078,-3.8305],[8.7389,-3.7974],[8.7721,-3.7642],[9.5349,-3.731],[9.568,-3.7642],[10.0655,-3.7642],[10.9278,-3.93],[10.9616,-3.94],[10.9952,-3.9502],[11.0287,-3.9605],[11.062,-3.9709],[11.0951,-3.9814],[11.1281,-3.9921],[11.1609,-4.0029],[11.1936,-4.0139],[11.2261,-4.0249],[11.2584,-4.0361],[11.2906,-4.0475],[11.3227,-4.059],[11.3546,-4.0706],[11.3863,-4.0823],[11.4178,-4.0942],[11.4492,-4.1062],[11.4805,-4.1183],[11.5116,-4.1306],[11.5425,-4.143],[11.5733,-4.1555],[11.6039,-4.1682],[11.6343,-4.181],[11.6646,-4.1939],[11.6947,-4.207],[11.7247,-4.2202],[11.7545,-4.2335],[11.7842,-4.2469],[11.8137,-4.2605],[11.843,-4.2743],[11.8722,-4.2881],[11.9013,-4.3021],[11.9301,-4.3162],[11.9588,-4.3305],[11.9874,-4.3449],[12.0158,-4.3594],[12.044,-4.374],[12.0721,-4.3888],[12.1,-4.4037],[12.1278,-4.4188],[12.1554,-4.434],[12.1828,-4.4493],[12.2101,-4.4647],[12.2372,-4.4803],[12.2642,-4.496],[12.291,-4.5118],[12.3176,-4.5278],[12.3441,-4.5439],[12.3705,-4.5602],[12.3705,9.3856],[12.4036,9.5515],[12.3705,9.5846],[12.3705,9.8334],[7.2465,8.6726],[7.1139,8.6726],[6.2516,8.4404],[5.2235,8.2415],[4.7923,8.1088],[3.6315,7.8766],[3.2004,7.744],[2.9019,7.7108],[2.4708,7.5782],[0.5804,7.1802],[0.1492,7.0475],[0.0166,7.0475],[-1.8738,6.5832],[-3.0346,6.3511],[-3.3331,6.2516],[-3.6315,6.2184],[-3.6413,6.2136],[-3.6511,6.2089],[-3.661,6.2043],[-3.6709,6.1997],[-3.681,6.1953],[-3.6911,6.1909],[-3.7014,6.1867],[-3.7117,6.1825],[-3.7221,6.1784],[-3.7326,6.1744],[-3.7432,6.1704],[-3.7538,6.1666],[-3.7646,6.1628],[-3.7754,6.1592],[-3.7864,6.1556],[-3.7974,6.1521],[-3.8085,6.1487],[-3.8197,6.1453],[-3.8309,6.1421],[-3.8423,6.1389],[-3.8537,6.1359],[-3.8653,6.1329],[-3.8769,6.13],[-3.8886,6.1272],[-3.9004,6.1245],[-3.9122,6.1218],[-3.9242,6.1193],[-3.9362,6.1168],[-3.9484,6.1145],[-3.9606,6.1122],[-3.9729,6.11],[-3.9853,6.1079],[-3.9978,6.1058],[-4.0104,6.1039],[-4.023,6.102],[-4.0357,6.1003],[-4.0486,6.0986],[-4.0615,6.097],[-4.0745,6.0955],[-4.0876,6.094],[-4.1007,6.0927],[-4.114,6.0914],[-4.1273,6.0903],[-4.1408,6.0892],[-4.1543,6.0882],[-4.1679,6.0873],[-4.1816,6.0865],[-4.1953,6.0857],[-4.2451,6.036],[-4.2451,-10.8117],[-4.2783,-10.8449],[-4.2783,-11.2429],[-4.2749,-11.245],[-4.2716,-11.2472],[-4.2684,-11.2496],[-4.2654,-11.2521],[-4.2624,-11.2547],[-4.2596,-11.2574],[-4.2569,-11.2602],[-4.2543,-11.2631],[-4.2518,-11.2662],[-4.2495,-11.2694],[-4.2472,-11.2726],[-4.2451,-11.276],[-4.2431,-11.2795],[-4.2412,-11.2832],[-4.2394,-11.2869],[-4.2377,-11.2908],[-4.2362,-11.2947],[-4.2347,-11.2988],[-4.2334,-11.303],[-4.2322,-11.3074],[-4.2311,-11.3118],[-4.2301,-11.3163],[-4.2293,-11.321],[-4.2285,-11.3258],[-4.2279,-11.3307],[-4.2274,-11.3357],[-4.227,-11.3408],[-4.2267,-11.3461],[-4.2265,-11.3514],[-4.2264,-11.3569],[-4.2265,-11.3625],[-4.2267,-11.3682],[-4.227,-11.374],[-4.2274,-11.3799],[-4.2279,-11.386],[-4.2285,-11.3921],[-4.2293,-11.3984],[-4.2301,-11.4048],[-4.2311,-11.4113],[-4.2322,-11.4179],[-4.2334,-11.4246],[-4.2347,-11.4315],[-4.2362,-11.4385],[-4.2377,-11.4455],[-4.2394,-11.4527],[-4.2412,-11.4601],[-4.2431,-11.4675],[-4.2451,-11.475],[-4.2783,-11.5082],[-4.3114,-12.1383],[-4.4441,-12.7021],[-4.8089,-13.5644],[-4.8295,-13.6012],[-4.8503,-13.6377],[-4.8713,-13.6741],[-4.8925,-13.7102],[-4.914,-13.746],[-4.9357,-13.7817],[-4.9576,-13.8171],[-4.9798,-13.8523],[-5.0022,-13.8873],[-5.0248,-13.922],[-5.0476,-13.9565],[-5.0707,-13.9908],[-5.094,-14.0248],[-5.1175,-14.0587],[-5.1413,-14.0923],[-5.1652,-14.1256],[-5.1894,-14.1588],[-5.2139,-14.1917],[-5.2385,-14.2244],[-5.2634,-14.2568],[-5.2885,-14.2891],[-5.3139,-14.3211],[-5.3394,-14.3529],[-5.3652,-14.3844],[-5.3913,-14.4157],[-5.4175,-14.4468],[-5.444,-14.4777],[-5.4707,-14.5083],[-5.4976,-14.5388],[-5.5248,-14.5689],[-5.5522,-14.5989],[-5.5798,-14.6286],[-5.6076,-14.6581],[-5.6357,-14.6874],[-5.664,-14.7165],[-5.6925,-14.7453],[-5.7213,-14.7739],[-5.7503,-14.8022],[-5.7795,-14.8304],[-5.8089,-14.8583],[-5.8386,-14.886],[-5.8685,-14.9134],[-5.8986,-14.9407],[-5.9289,-14.9677],[-5.9595,-14.9944],[-5.9903,-15.021],[-6.0213,-15.0473],[-6.0526,-15.0734],[-6.0891,-15.1046],[-6.1259,-15.1355],[-6.1631,-15.166],[-6.2006,-15.1963],[-6.2384,-15.2261],[-6.2765,-15.2557],[-6.315,-15.2849],[-6.3538,-15.3139],[-6.393,-15.3424],[-6.4324,-15.3707],[-6.4722,-15.3986],[-6.5123,-15.4262],[-6.5528,-15.4535],[-6.5935,-15.4804],[-6.6346,-15.507],[-6.6761,-15.5333],[-6.7178,-15.5592],[-6.7599,-15.5849],[-6.8023,-15.6102],[-6.8451,-15.6351],[-6.8882,-15.6598],[-6.9315,-15.6841],[-6.9753,-15.7081],[-7.0193,-15.7317],[-7.0637,-15.7551],[-7.1084,-15.7781],[-7.1535,-15.8007],[-7.1988,-15.8231],[-7.2445,-15.8451],[-7.2906,-15.8668],[-7.3369,-15.8881],[-7.3836,-15.9092],[-7.4306,-15.9299],[-7.4779,-15.9502],[-7.5256,-15.9703],[-7.5736,-15.99],[-7.6219,-16.0094],[-7.6706,-16.0285],[-7.7196,-16.0472],[-7.7689,-16.0656],[-7.8185,-16.0837],[-7.8685,-16.1014],[-7.9187,-16.1188],[-7.9694,-16.1359],[-8.0203,-16.1527],[-8.0716,-16.1691],[-8.1232,-16.1852],[-8.1751,-16.201],[-9.1701,-16.4],[-10.3308,-16.4],[-11.1931,-16.2342],[-12.0554,-15.9025],[-12.0881,-15.8856],[-12.1205,-15.8684],[-12.1528,-15.851],[-12.1848,-15.8335],[-12.2167,-15.8157],[-12.2483,-15.7977],[-12.2798,-15.7795],[-12.3111,-15.7611],[-12.3421,-15.7425],[-12.373,-15.7237],[-12.4036,-15.7047],[-12.4341,-15.6855],[-12.4644,-15.6661],[-12.4944,-15.6465],[-12.5243,-15.6267],[-12.554,-15.6066],[-12.5835,-15.5864],[-12.6127,-15.566],[-12.6418,-15.5453],[-12.6707,-15.5245],[-12.6994,-15.5034],[-12.7278,-15.4822],[-12.7561,-15.4607],[-12.7842,-15.439],[-12.8121,-15.4172],[-12.8398,-15.3951],[-12.8673,-15.3728],[-12.8945,-15.3504],[-12.9216,-15.3277],[-12.9485,-15.3048],[-12.9752,-15.2817],[-13.0017,-15.2584],[-13.028,-15.2349],[-13.0541,-15.2112],[-13.08,-15.1873],[-13.1057,-15.1632],[-13.1312,-15.1388],[-13.1565,-15.1143],[-13.1816,-15.0896],[-13.2065,-15.0647],[-13.2312,-15.0395],[-13.2557,-15.0142],[-13.28,-14.9886],[-13.3041,-14.9629],[-13.328,-14.9369],[-13.3518,-14.9108],[-13.3753,-14.8844],[-13.3986,-14.8578],[-13.4204,-14.832],[-13.4421,-14.806],[-13.4635,-14.7797],[-13.4847,-14.7532],[-13.5056,-14.7265],[-13.5264,-14.6996],[-13.5469,-14.6724],[-13.5672,-14.645],[-13.5872,-14.6174],[-13.6071,-14.5896],[-13.6267,-14.5615],[-13.6461,-14.5332],[-13.6652,-14.5047],[-13.6842,-14.476],[-13.7029,-14.447],[-13.7214,-14.4178],[-13.7397,-14.3884],[-13.7577,-14.3588],[-13.7755,-14.329],[-13.7931,-14.2989],[-13.8105,-14.2686],[-13.8276,-14.238],[-13.8445,-14.2073],[-13.8612,-14.1763],[-13.8777,-14.1451],[-13.8939,-14.1137],[-13.91,-14.082],[-13.9258,-14.0501],[-13.9413,-14.018],[-13.9567,-13.9857],[-13.9718,-13.9532],[-13.9867,-13.9204],[-14.0014,-13.8874],[-14.0158,-13.8542],[-14.0301,-13.8207],[-14.0441,-13.787],[-14.0578,-13.7531],[-14.0714,-13.719],[-14.0847,-13.6847],[-14.0978,-13.6501],[-14.1107,-13.6153],[-14.1233,-13.5803],[-14.1358,-13.545],[-14.148,-13.5095],[-14.16,-13.4739],[-14.1717,-13.4379],[-14.1832,-13.4018],[-14.1945,-13.3654],[-14.3272,-12.669],[-14.3272,-11.9062],[-14.1614,-11.0107],[-13.8961,-10.3143],[-13.878,-10.2771],[-13.8597,-10.2401],[-13.8412,-10.2033],[-13.8225,-10.1667],[-13.8035,-10.1304],[-13.7844,-10.0943],[-13.765,-10.0584],[-13.7454,-10.0227],[-13.7256,-9.9872],[-13.7056,-9.9519],[-13.6854,-9.9169],[-13.6649,-9.8821],[-13.6443,-9.8475],[-13.6234,-9.8131],[-13.6023,-9.7789],[-13.581,-9.7449],[-13.5595,-9.7112],[-13.5377,-9.6776],[-13.5158,-9.6443],[-13.4936,-9.6112],[-13.4712,-9.5783],[-13.4486,-9.5457],[-13.4258,-9.5132],[-13.4027,-9.481],[-13.3795,-9.449],[-13.356,-9.4172],[-13.3323,-9.3856],[-13.3084,-9.3542],[-13.2843,-9.323],[-13.26,-9.2921],[-13.2354,-9.2614],[-13.2107,-9.2309],[-13.1857,-9.2006],[-13.1605,-9.1705],[-13.1351,-9.1406],[-13.1094,-9.111],[-13.0836,-9.0816],[-13.0575,-9.0524],[-13.0312,-9.0234],[-13.0048,-8.9946],[-12.978,-8.966],[-12.9511,-8.9377],[-12.924,-8.9095],[-12.8966,-8.8816],[-12.869,-8.8539],[-12.8413,-8.8264],[-12.8133,-8.7991],[-12.785,-8.7721],[-12.7502,-8.7378],[-12.715,-8.7039],[-12.6796,-8.6703],[-12.6438,-8.6369],[-12.6077,-8.6039],[-12.5713,-8.5712],[-12.5346,-8.5389],[-12.4976,-8.5068],[-12.4603,-8.475],[-12.4226,-8.4436],[-12.3847,-8.4124],[-12.3464,-8.3816],[-12.3079,-8.3511],[-12.269,-8.3208],[-12.2298,-8.2909],[-12.1903,-8.2614],[-12.1505,-8.2321],[-12.1103,-8.2031],[-12.0699,-8.1745],[-12.0292,-8.1461],[-11.9881,-8.1181],[-11.9467,-8.0903],[-11.905,-8.0629],[-11.8631,-8.0358],[-11.8208,-8.009],[-11.7781,-7.9826],[-11.7352,-7.9564],[-11.692,-7.9305],[-11.6484,-7.905],[-11.6046,-7.8798],[-11.5604,-7.8548],[-11.5159,-7.8302],[-11.4711,-7.8059],[-11.426,-7.7819],[-11.3806,-7.7582],[-11.3349,-7.7349],[-11.2889,-7.7118],[-11.2425,-7.6891],[-11.1959,-7.6666],[-11.1489,-7.6445],[-11.1016,-7.6227],[-11.054,-7.6012],[-11.0061,-7.58],[-10.9579,-7.5591],[-10.9094,-7.5385],[-10.8606,-7.5183],[-10.8114,-7.4983],[-10.762,-7.4787],[-10.2645,-7.3128],[-9.4686,-7.147],[-9.2032,-7.147],[-9.1701,-7.1139],[-8.1751,-7.1139],[-7.2465,-7.2797],[-6.2018,-7.7108],[-6.2018,-2.9848],[-6.1687,-2.9517],[-6.1687,11.6077],[-5.9862,11.8564],[-5.5883,11.9891],[-4.5602,12.1881],[-3.5652,12.4534],[-3.1341,12.5197],[-1.2437,12.984],[0.2156,13.2825],[0.5141,13.382],[0.9452,13.4483],[1.2437,13.5478],[1.6748,13.6142],[4.1622,14.2111],[4.4607,14.2443],[5.323,14.4764],[5.7541,14.5428],[6.0526,14.6423],[6.4837,14.7086],[6.7822,14.8081],[7.5118,14.9407],[7.8103,15.0402],[9.568,15.4051],[9.8665,15.5046],[10.2977,15.5709],[11.6243,15.9025],[11.9228,15.9357]];
// Sequential core path omitted for v17_double_note; polygon() uses point order directly.
module v17_double_note_core_2d() { polygon(points = v17_double_note_core_points()); }

function v17_treble_core_points() = [[1.4958,16.3841],[1.5097,16.3858],[1.5236,16.3875],[1.5374,16.389],[1.551,16.3905],[1.5646,16.3918],[1.578,16.3931],[1.5914,16.3942],[1.6046,16.3952],[1.6177,16.3962],[1.6308,16.397],[1.6437,16.3977],[1.6566,16.3984],[1.6693,16.3989],[1.6819,16.3993],[1.6945,16.3996],[1.7069,16.3999],[1.7192,16.4],[1.7314,16.4],[1.7436,16.3999],[1.7556,16.3997],[1.7675,16.3994],[1.7793,16.3991],[1.791,16.3986],[1.8027,16.398],[1.8142,16.3973],[1.8256,16.3965],[1.8369,16.3956],[1.8481,16.3946],[1.8592,16.3935],[1.8702,16.3923],[1.8811,16.391],[1.8919,16.3896],[1.9026,16.3881],[1.9132,16.3865],[1.9237,16.3848],[1.9341,16.3829],[1.9444,16.381],[1.9546,16.379],[1.9647,16.3769],[1.9747,16.3747],[1.9846,16.3724],[1.9944,16.3699],[2.004,16.3674],[2.0136,16.3648],[2.0231,16.3621],[2.0325,16.3592],[2.0418,16.3563],[2.0509,16.3533],[2.065,16.3474],[2.079,16.3415],[2.0929,16.3355],[2.1067,16.3294],[2.1204,16.3232],[2.1341,16.3169],[2.1476,16.3105],[2.161,16.304],[2.1744,16.2974],[2.1876,16.2907],[2.2008,16.284],[2.2138,16.2771],[2.2268,16.2702],[2.2396,16.2631],[2.2524,16.256],[2.2651,16.2487],[2.2777,16.2414],[2.2902,16.234],[2.3026,16.2265],[2.3149,16.2189],[2.3271,16.2112],[2.3392,16.2034],[2.3513,16.1955],[2.3632,16.1875],[2.375,16.1794],[2.3868,16.1712],[2.3984,16.163],[2.41,16.1546],[2.4215,16.1462],[2.4328,16.1376],[2.4441,16.129],[2.4553,16.1202],[2.4664,16.1114],[2.4774,16.1025],[2.4883,16.0935],[2.4991,16.0844],[2.5098,16.0752],[2.5204,16.0659],[2.531,16.0565],[2.5414,16.047],[2.5517,16.0374],[2.562,16.0277],[2.5721,16.018],[2.5822,16.0081],[2.5922,15.9982],[2.602,15.9881],[2.6118,15.978],[2.6215,15.9677],[2.6372,15.9501],[2.6529,15.9323],[2.6684,15.9144],[2.6837,15.8963],[2.699,15.8782],[2.7141,15.8599],[2.7291,15.8415],[2.744,15.823],[2.7588,15.8043],[2.7734,15.7855],[2.7879,15.7666],[2.8023,15.7476],[2.8166,15.7285],[2.8307,15.7092],[2.8447,15.6898],[2.8586,15.6703],[2.8724,15.6507],[2.8861,15.6309],[2.8996,15.611],[2.913,15.591],[2.9263,15.5709],[2.9394,15.5506],[2.9525,15.5303],[2.9654,15.5098],[2.9782,15.4891],[2.9908,15.4684],[3.0034,15.4475],[3.0158,15.4265],[3.0281,15.4054],[3.0403,15.3842],[3.0523,15.3628],[3.0642,15.3413],[3.076,15.3197],[3.0877,15.298],[3.0993,15.2761],[3.1107,15.2542],[3.122,15.2321],[3.1332,15.2098],[3.1443,15.1875],[3.1552,15.165],[3.166,15.1424],[3.1767,15.1197],[3.1873,15.0969],[3.1978,15.0739],[3.2081,15.0508],[3.2183,15.0276],[3.2284,15.0043],[3.2383,14.9808],[3.6084,13.9014],[3.7935,13.0687],[3.8551,12.4519],[3.886,12.421],[3.9168,11.65],[3.9477,11.6191],[3.9477,10.7556],[3.9168,10.7248],[3.9168,10.293],[3.886,10.2621],[3.8551,9.7378],[3.6393,8.6892],[3.3925,7.9182],[3.0224,7.0855],[3.0049,7.0516],[2.9873,7.0179],[2.9695,6.9842],[2.9517,6.9506],[2.9338,6.9171],[2.9157,6.8838],[2.8976,6.8505],[2.8794,6.8174],[2.861,6.7843],[2.8426,6.7513],[2.824,6.7185],[2.8054,6.6857],[2.7866,6.6531],[2.7678,6.6205],[2.7488,6.5881],[2.7298,6.5557],[2.7106,6.5235],[2.6914,6.4913],[2.672,6.4593],[2.6525,6.4273],[2.633,6.3955],[2.6133,6.3638],[2.5936,6.3321],[2.5737,6.3006],[2.5537,6.2692],[2.5337,6.2378],[2.5135,6.2066],[2.4932,6.1755],[2.4728,6.1445],[2.4523,6.1135],[2.4318,6.0827],[2.4111,6.052],[2.3903,6.0214],[2.3694,5.9908],[2.3484,5.9604],[2.3273,5.9301],[2.3062,5.8999],[2.2849,5.8698],[2.2635,5.8398],[2.242,5.8099],[2.2204,5.7801],[2.1987,5.7504],[2.1769,5.7208],[2.155,5.6913],[2.133,5.6619],[2.1109,5.6326],[2.0887,5.6034],[2.0664,5.5743],[2.0348,5.5339],[2.0031,5.4936],[1.9713,5.4535],[1.9393,5.4134],[1.9073,5.3736],[1.875,5.3338],[1.8427,5.2942],[1.8102,5.2547],[1.7776,5.2154],[1.7448,5.1762],[1.7119,5.1371],[1.6789,5.0982],[1.6458,5.0594],[1.6125,5.0207],[1.579,4.9822],[1.5455,4.9438],[1.5118,4.9055],[1.478,4.8674],[1.444,4.8294],[1.4099,4.7915],[1.3757,4.7537],[1.3413,4.7161],[1.3068,4.6787],[1.2722,4.6413],[1.2374,4.6041],[1.2025,4.5671],[1.1675,4.5301],[1.1323,4.4934],[1.097,4.4567],[1.0616,4.4202],[1.026,4.3838],[0.9903,4.3475],[0.9545,4.3114],[0.9185,4.2754],[0.8824,4.2395],[0.8462,4.2038],[0.8098,4.1682],[0.7733,4.1327],[0.7367,4.0974],[0.6999,4.0622],[0.663,4.0272],[0.626,3.9922],[0.5888,3.9574],[0.5515,3.9228],[0.5141,3.8883],[0.4765,3.8539],[0.4388,3.8196],[0.4009,3.7855],[0.4009,3.693],[1.0178,0.9327],[1.4341,0.9635],[1.465,0.9944],[2.421,0.9944],[3.0687,0.871],[3.8397,0.5626],[3.8648,0.5485],[3.8898,0.5343],[3.9147,0.52],[3.9395,0.5056],[3.9641,0.491],[3.9886,0.4763],[4.0129,0.4615],[4.0372,0.4465],[4.0613,0.4315],[4.0853,0.4162],[4.1092,0.4009],[4.1329,0.3855],[4.1565,0.3699],[4.18,0.3542],[4.2034,0.3383],[4.2266,0.3224],[4.2497,0.3063],[4.2727,0.2901],[4.2956,0.2738],[4.3183,0.2573],[4.3409,0.2407],[4.3634,0.224],[4.3857,0.2072],[4.408,0.1902],[4.4301,0.1731],[4.452,0.1559],[4.4739,0.1386],[4.4956,0.1211],[4.5172,0.1035],[4.5387,0.0858],[4.5601,0.0679],[4.5813,0.05],[4.6024,0.0319],[4.6233,0.0136],[4.6442,-0.0047],[4.6649,-0.0232],[4.6855,-0.0418],[4.706,-0.0605],[4.7263,-0.0794],[4.7465,-0.0983],[4.7666,-0.1174],[4.7866,-0.1367],[4.8064,-0.156],[4.8261,-0.1755],[4.8457,-0.1951],[4.8652,-0.2148],[4.8845,-0.2347],[4.9037,-0.2547],[4.9289,-0.2815],[4.9539,-0.3086],[4.9787,-0.3359],[5.0032,-0.3634],[5.0275,-0.3911],[5.0516,-0.4191],[5.0754,-0.4473],[5.0991,-0.4757],[5.1225,-0.5043],[5.1456,-0.5332],[5.1686,-0.5623],[5.1913,-0.5916],[5.2138,-0.6212],[5.2361,-0.6509],[5.2582,-0.6809],[5.28,-0.7111],[5.3016,-0.7416],[5.323,-0.7722],[5.3441,-0.8031],[5.3651,-0.8342],[5.3858,-0.8656],[5.4063,-0.8971],[5.4265,-0.9289],[5.4465,-0.9609],[5.4663,-0.9932],[5.4859,-1.0256],[5.5053,-1.0583],[5.5244,-1.0912],[5.5433,-1.1244],[5.562,-1.1577],[5.5805,-1.1913],[5.5987,-1.2251],[5.6167,-1.2592],[5.6345,-1.2934],[5.652,-1.3279],[5.6694,-1.3626],[5.6865,-1.3976],[5.7034,-1.4327],[5.72,-1.4681],[5.7364,-1.5037],[5.7527,-1.5396],[5.7686,-1.5756],[5.7844,-1.6119],[5.7999,-1.6484],[5.8152,-1.6852],[5.8303,-1.7221],[5.8452,-1.7593],[5.8598,-1.7967],[6.1374,-2.8145],[6.1682,-3.3079],[6.1991,-3.3388],[6.1991,-4.0481],[6.1682,-4.079],[6.1682,-4.3874],[6.0757,-4.8808],[5.829,-5.621],[5.8116,-5.659],[5.7941,-5.6966],[5.7763,-5.7341],[5.7582,-5.7713],[5.74,-5.8083],[5.7215,-5.8451],[5.7027,-5.8816],[5.6838,-5.9179],[5.6646,-5.9539],[5.6451,-5.9898],[5.6255,-6.0254],[5.6056,-6.0607],[5.5854,-6.0958],[5.5651,-6.1307],[5.5445,-6.1654],[5.5236,-6.1998],[5.5026,-6.234],[5.4813,-6.268],[5.4598,-6.3017],[5.438,-6.3352],[5.416,-6.3685],[5.3938,-6.4015],[5.3713,-6.4343],[5.3486,-6.4669],[5.3257,-6.4992],[5.3025,-6.5313],[5.2791,-6.5631],[5.2555,-6.5948],[5.2317,-6.6262],[5.2076,-6.6573],[5.1832,-6.6883],[5.1587,-6.719],[5.1339,-6.7494],[5.1089,-6.7797],[5.0836,-6.8097],[5.0581,-6.8394],[5.0324,-6.869],[5.0065,-6.8983],[4.9803,-6.9274],[4.9539,-6.9562],[4.9272,-6.9848],[4.9003,-7.0132],[4.8732,-7.0413],[4.8458,-7.0692],[4.8183,-7.0969],[4.7904,-7.1243],[4.7624,-7.1515],[4.7341,-7.1785],[4.7043,-7.2065],[4.6743,-7.2343],[4.6441,-7.2619],[4.6136,-7.2893],[4.5829,-7.3164],[4.552,-7.3434],[4.5209,-7.3701],[4.4895,-7.3965],[4.4579,-7.4228],[4.4262,-7.4488],[4.3941,-7.4746],[4.3619,-7.5002],[4.3294,-7.5256],[4.2967,-7.5507],[4.2638,-7.5756],[4.2307,-7.6003],[4.1974,-7.6248],[4.1638,-7.6491],[4.13,-7.6731],[4.096,-7.6969],[4.0617,-7.7205],[4.0273,-7.7439],[3.9926,-7.767],[3.9577,-7.7899],[3.9226,-7.8126],[3.8872,-7.8351],[3.8516,-7.8574],[3.8158,-7.8794],[3.7798,-7.9012],[3.7436,-7.9228],[3.7071,-7.9442],[3.6704,-7.9653],[3.6335,-7.9862],[3.5964,-8.0069],[3.559,-8.0274],[3.5215,-8.0476],[3.4837,-8.0677],[3.4457,-8.0875],[3.4074,-8.1071],[3.369,-8.1264],[3.3303,-8.1456],[3.2914,-8.1645],[3.2522,-8.1832],[3.2129,-8.2017],[3.1733,-8.2199],[3.1335,-8.238],[3.0935,-8.2558],[3.0533,-8.2734],[3.0533,-8.4584],[3.115,-8.6126],[3.1458,-8.8902],[3.2075,-9.0444],[3.2383,-9.322],[3.3,-9.4762],[3.7935,-11.8201],[3.8551,-12.4678],[3.886,-12.4986],[3.886,-13.2388],[3.8551,-13.2696],[3.7935,-13.7939],[3.6393,-14.2874],[3.6268,-14.3161],[3.6142,-14.3446],[3.6014,-14.3729],[3.5883,-14.401],[3.5751,-14.4289],[3.5617,-14.4566],[3.5481,-14.4841],[3.5343,-14.5114],[3.5203,-14.5385],[3.5061,-14.5655],[3.4917,-14.5922],[3.4771,-14.6187],[3.4624,-14.6451],[3.4474,-14.6712],[3.4322,-14.6972],[3.4169,-14.7229],[3.4013,-14.7485],[3.3855,-14.7739],[3.3696,-14.799],[3.3534,-14.824],[3.3371,-14.8488],[3.3206,-14.8734],[3.3038,-14.8977],[3.2869,-14.9219],[3.2698,-14.9459],[3.2524,-14.9697],[3.2349,-14.9933],[3.2172,-15.0168],[3.1993,-15.04],[3.1812,-15.063],[3.1629,-15.0858],[3.1444,-15.1084],[3.1257,-15.1309],[3.1069,-15.1531],[3.0878,-15.1752],[3.0685,-15.197],[3.049,-15.2187],[3.0294,-15.2401],[3.0095,-15.2614],[2.9894,-15.2824],[2.9692,-15.3033],[2.9487,-15.324],[2.9281,-15.3445],[2.9073,-15.3647],[2.8862,-15.3848],[2.865,-15.4047],[2.8436,-15.4244],[2.822,-15.4439],[2.7969,-15.4664],[2.7716,-15.4887],[2.7461,-15.5107],[2.7203,-15.5324],[2.6942,-15.5539],[2.6679,-15.5752],[2.6414,-15.5962],[2.6146,-15.617],[2.5876,-15.6375],[2.5603,-15.6578],[2.5328,-15.6778],[2.5051,-15.6976],[2.4771,-15.7171],[2.4488,-15.7364],[2.4203,-15.7555],[2.3916,-15.7743],[2.3626,-15.7928],[2.3333,-15.8111],[2.3038,-15.8292],[2.2741,-15.847],[2.2441,-15.8646],[2.2139,-15.8819],[2.1834,-15.899],[2.1527,-15.9158],[2.1217,-15.9324],[2.0905,-15.9487],[2.0591,-15.9648],[2.0274,-15.9806],[1.9954,-15.9962],[1.9632,-16.0116],[1.9308,-16.0267],[1.8981,-16.0416],[1.8652,-16.0562],[1.832,-16.0705],[1.7986,-16.0847],[1.7649,-16.0985],[1.731,-16.1122],[1.6968,-16.1255],[1.6624,-16.1387],[1.6277,-16.1516],[1.5928,-16.1642],[1.5577,-16.1766],[1.5223,-16.1887],[1.4866,-16.2006],[1.4507,-16.2123],[1.4146,-16.2237],[1.3782,-16.2349],[1.3416,-16.2458],[0.4472,-16.4],[-0.2313,-16.4],[-0.2621,-16.3692],[-0.5397,-16.3692],[-1.064,-16.2766],[-1.65,-16.0916],[-1.6791,-16.0797],[-1.708,-16.0676],[-1.7367,-16.0553],[-1.7652,-16.0428],[-1.7935,-16.0301],[-1.8217,-16.0172],[-1.8497,-16.0042],[-1.8775,-15.9909],[-1.9051,-15.9775],[-1.9325,-15.9639],[-1.9597,-15.95],[-1.9867,-15.936],[-2.0136,-15.9218],[-2.0403,-15.9074],[-2.0668,-15.8929],[-2.0931,-15.8781],[-2.1192,-15.8631],[-2.1451,-15.848],[-2.1709,-15.8327],[-2.1965,-15.8171],[-2.2218,-15.8014],[-2.247,-15.7855],[-2.2721,-15.7694],[-2.2969,-15.7531],[-2.3215,-15.7366],[-2.346,-15.72],[-2.3703,-15.7031],[-2.3944,-15.686],[-2.4183,-15.6688],[-2.442,-15.6514],[-2.4655,-15.6338],[-2.4889,-15.616],[-2.512,-15.598],[-2.535,-15.5798],[-2.5578,-15.5614],[-2.5804,-15.5428],[-2.6029,-15.524],[-2.6251,-15.5051],[-2.6472,-15.486],[-2.669,-15.4666],[-2.6907,-15.4471],[-2.7122,-15.4274],[-2.7336,-15.4075],[-2.7547,-15.3874],[-2.7756,-15.3671],[-2.7964,-15.3467],[-2.817,-15.326],[-2.8374,-15.3051],[-2.854,-15.2884],[-2.8705,-15.2714],[-2.8868,-15.2543],[-2.9029,-15.237],[-2.9189,-15.2196],[-2.9347,-15.202],[-2.9504,-15.1843],[-2.9659,-15.1664],[-2.9812,-15.1483],[-2.9964,-15.1301],[-3.0114,-15.1117],[-3.0263,-15.0931],[-3.041,-15.0744],[-3.0555,-15.0555],[-3.0699,-15.0365],[-3.0841,-15.0173],[-3.0982,-14.9979],[-3.1121,-14.9784],[-3.1258,-14.9587],[-3.1394,-14.9389],[-3.1528,-14.9189],[-3.166,-14.8987],[-3.1791,-14.8784],[-3.1921,-14.8579],[-3.2048,-14.8373],[-3.2174,-14.8165],[-3.2299,-14.7955],[-3.2422,-14.7744],[-3.2543,-14.7531],[-3.2663,-14.7317],[-3.2781,-14.7101],[-3.2897,-14.6883],[-3.3012,-14.6664],[-3.3125,-14.6443],[-3.3237,-14.6221],[-3.3347,-14.5997],[-3.3455,-14.5771],[-3.3562,-14.5544],[-3.3667,-14.5315],[-3.3771,-14.5084],[-3.3873,-14.4852],[-3.3973,-14.4618],[-3.4072,-14.4383],[-3.4169,-14.4146],[-3.4265,-14.3908],[-3.4359,-14.3667],[-3.4451,-14.3426],[-3.4542,-14.3182],[-3.5776,-13.8556],[-3.6084,-13.3313],[-3.5776,-13.3005],[-3.5467,-12.9304],[-3.2383,-12.1902],[-3.2281,-12.1734],[-3.2178,-12.1567],[-3.2074,-12.1401],[-3.1969,-12.1236],[-3.1863,-12.1073],[-3.1756,-12.091],[-3.1648,-12.0748],[-3.1539,-12.0587],[-3.1429,-12.0427],[-3.1318,-12.0268],[-3.1207,-12.011],[-3.1094,-11.9953],[-3.098,-11.9797],[-3.0865,-11.9642],[-3.0749,-11.9488],[-3.0632,-11.9335],[-3.0514,-11.9183],[-3.0395,-11.9032],[-3.0276,-11.8882],[-3.0155,-11.8733],[-3.0033,-11.8585],[-2.991,-11.8438],[-2.9786,-11.8292],[-2.9661,-11.8147],[-2.9536,-11.8003],[-2.9409,-11.786],[-2.9281,-11.7718],[-2.9152,-11.7577],[-2.9023,-11.7437],[-2.8892,-11.7297],[-2.876,-11.7159],[-2.8627,-11.7022],[-2.8494,-11.6886],[-2.8359,-11.6751],[-2.8223,-11.6617],[-2.8087,-11.6483],[-2.7949,-11.6351],[-2.781,-11.622],[-2.7671,-11.609],[-2.753,-11.5961],[-2.7388,-11.5832],[-2.7246,-11.5705],[-2.7102,-11.5579],[-2.6957,-11.5454],[-2.6812,-11.5329],[-2.6665,-11.5206],[-2.6518,-11.5084],[-2.6369,-11.4963],[-1.9584,-11.157],[-1.6192,-11.1262],[-1.5883,-11.0953],[-1.3107,-11.0953],[-0.9715,-11.157],[-0.5706,-11.3112],[-0.0617,-11.7276],[-0.0522,-11.7387],[-0.0429,-11.7499],[-0.0336,-11.7612],[-0.0245,-11.7726],[-0.0154,-11.7841],[-0.0065,-11.7957],[0.0024,-11.8074],[0.0111,-11.8192],[0.0198,-11.8312],[0.0283,-11.8432],[0.0368,-11.8553],[0.0451,-11.8675],[0.0533,-11.8798],[0.0615,-11.8923],[0.0695,-11.9048],[0.0774,-11.9174],[0.0853,-11.9301],[0.093,-11.943],[0.1006,-11.9559],[0.1082,-11.9689],[0.1156,-11.9821],[0.1229,-11.9953],[0.1301,-12.0087],[0.1372,-12.0221],[0.1443,-12.0356],[0.1512,-12.0493],[0.158,-12.063],[0.1647,-12.0769],[0.1713,-12.0908],[0.1778,-12.1049],[0.1842,-12.119],[0.1905,-12.1333],[0.1967,-12.1477],[0.2028,-12.1621],[0.2088,-12.1767],[0.2147,-12.1913],[0.2205,-12.2061],[0.2262,-12.221],[0.2318,-12.2359],[0.2373,-12.251],[0.2427,-12.2662],[0.248,-12.2815],[0.2532,-12.2968],[0.2583,-12.3123],[0.2632,-12.3279],[0.2681,-12.3436],[0.2729,-12.3594],[0.2776,-12.3752],[0.3393,-12.6836],[0.3393,-13.0846],[0.2467,-13.5164],[0.0925,-13.8556],[-0.3238,-14.3336],[-0.7864,-14.6112],[-1.2491,-14.7346],[-1.4958,-14.7346],[-1.5729,-14.8117],[-1.5421,-14.9967],[-1.3107,-15.2589],[-1.2978,-15.2697],[-1.2848,-15.2805],[-1.2717,-15.2912],[-1.2585,-15.3017],[-1.2452,-15.3122],[-1.2317,-15.3225],[-1.2182,-15.3327],[-1.2045,-15.3428],[-1.1908,-15.3528],[-1.1769,-15.3628],[-1.1629,-15.3726],[-1.1488,-15.3822],[-1.1346,-15.3918],[-1.1203,-15.4013],[-1.1059,-15.4107],[-1.0914,-15.4199],[-1.0768,-15.4291],[-1.0621,-15.4381],[-1.0473,-15.4471],[-1.0323,-15.4559],[-1.0173,-15.4646],[-1.0021,-15.4733],[-0.9869,-15.4818],[-0.9715,-15.4902],[-0.956,-15.4985],[-0.9404,-15.5067],[-0.9248,-15.5148],[-0.909,-15.5227],[-0.8931,-15.5306],[-0.877,-15.5384],[-0.8609,-15.546],[-0.8447,-15.5536],[-0.8284,-15.561],[-0.8119,-15.5684],[-0.7954,-15.5756],[-0.7787,-15.5827],[-0.762,-15.5897],[-0.7451,-15.5966],[-0.7281,-15.6034],[-0.7111,-15.6101],[-0.6939,-15.6167],[-0.6766,-15.6232],[-0.6592,-15.6296],[-0.6417,-15.6358],[-0.6241,-15.642],[-0.6063,-15.648],[-0.5885,-15.654],[-0.5706,-15.6598],[-0.1079,-15.7523],[0.478,-15.7523],[0.5291,-15.743],[0.5796,-15.7331],[0.6295,-15.7226],[0.679,-15.7117],[0.7279,-15.7003],[0.7764,-15.6883],[0.8243,-15.6758],[0.8717,-15.6628],[0.9186,-15.6493],[0.9649,-15.6353],[1.0108,-15.6207],[1.0561,-15.6056],[1.1009,-15.5901],[1.1452,-15.574],[1.189,-15.5574],[1.2323,-15.5402],[1.275,-15.5226],[1.3173,-15.5044],[1.359,-15.4857],[1.4002,-15.4665],[1.4408,-15.4468],[1.481,-15.4266],[1.5207,-15.4058],[1.5598,-15.3846],[1.5984,-15.3628],[1.6365,-15.3405],[1.6741,-15.3177],[1.7111,-15.2943],[1.7477,-15.2705],[1.7837,-15.2461],[1.8192,-15.2212],[1.8542,-15.1958],[1.8887,-15.1699],[1.9227,-15.1435],[1.9561,-15.1165],[1.9891,-15.0891],[2.0215,-15.0611],[2.0534,-15.0326],[2.0848,-15.0036],[2.1156,-14.974],[2.146,-14.944],[2.1758,-14.9134],[2.2051,-14.8823],[2.2339,-14.8507],[2.2622,-14.8186],[2.2899,-14.786],[2.3172,-14.7528],[2.3439,-14.7192],[2.3609,-14.6983],[2.3778,-14.6772],[2.3944,-14.6559],[2.4109,-14.6345],[2.4272,-14.6129],[2.4433,-14.5911],[2.4592,-14.5691],[2.475,-14.547],[2.4906,-14.5246],[2.506,-14.5021],[2.5212,-14.4795],[2.5363,-14.4566],[2.5512,-14.4336],[2.5659,-14.4104],[2.5804,-14.387],[2.5948,-14.3635],[2.6089,-14.3397],[2.6229,-14.3158],[2.6368,-14.2917],[2.6504,-14.2675],[2.6639,-14.243],[2.6772,-14.2184],[2.6903,-14.1936],[2.7032,-14.1686],[2.716,-14.1435],[2.7286,-14.1182],[2.741,-14.0927],[2.7532,-14.067],[2.7653,-14.0411],[2.7771,-14.0151],[2.7888,-13.9889],[2.8004,-13.9625],[2.8117,-13.936],[2.8229,-13.9092],[2.8339,-13.8823],[2.8447,-13.8552],[2.8553,-13.828],[2.8658,-13.8005],[2.8761,-13.7729],[2.8862,-13.7451],[2.8961,-13.7171],[2.9059,-13.689],[2.9155,-13.6606],[2.9249,-13.6321],[2.9341,-13.6035],[2.9432,-13.5746],[2.952,-13.5456],[2.9607,-13.5164],[3.0841,-12.8995],[3.0841,-11.9126],[2.7449,-10.093],[2.529,-9.2603],[2.4364,-8.6743],[2.3593,-8.5355],[1.2799,-8.7514],[1.0023,-8.7514],[0.9715,-8.7822],[0.1079,-8.7822],[0.0771,-8.7514],[-0.2621,-8.7514],[-1.1257,-8.5972],[-2.2051,-8.2271],[-2.2643,-8.2008],[-2.3231,-8.1741],[-2.3815,-8.1471],[-2.4394,-8.1196],[-2.497,-8.0917],[-2.5542,-8.0634],[-2.611,-8.0347],[-2.6673,-8.0057],[-2.7233,-7.9762],[-2.7789,-7.9463],[-2.8341,-7.916],[-2.8888,-7.8853],[-2.9432,-7.8543],[-2.9972,-7.8228],[-3.0508,-7.7909],[-3.104,-7.7587],[-3.1568,-7.726],[-3.2092,-7.6929],[-3.2612,-7.6595],[-3.3127,-7.6256],[-3.3639,-7.5913],[-3.4147,-7.5567],[-3.4651,-7.5216],[-3.5151,-7.4861],[-3.5647,-7.4503],[-3.6139,-7.414],[-3.6627,-7.3774],[-3.7111,-7.3403],[-3.7591,-7.3029],[-3.8067,-7.265],[-3.8539,-7.2268],[-3.9007,-7.1881],[-3.9471,-7.1491],[-3.9931,-7.1096],[-4.0387,-7.0698],[-4.0839,-7.0295],[-4.1288,-6.9889],[-4.1732,-6.9478],[-4.2172,-6.9064],[-4.2608,-6.8645],[-4.304,-6.8223],[-4.3468,-6.7796],[-4.3892,-6.7366],[-4.4312,-6.6932],[-4.4729,-6.6493],[-4.5141,-6.6051],[-4.5549,-6.5605],[-4.5953,-6.5154],[-4.6258,-6.4816],[-4.656,-6.4476],[-4.6859,-6.4133],[-4.7156,-6.3787],[-4.745,-6.3439],[-4.7742,-6.3088],[-4.8031,-6.2735],[-4.8318,-6.2379],[-4.8602,-6.202],[-4.8883,-6.1659],[-4.9162,-6.1295],[-4.9438,-6.0929],[-4.9712,-6.056],[-4.9983,-6.0189],[-5.0252,-5.9815],[-5.0518,-5.9438],[-5.0781,-5.9059],[-5.1042,-5.8678],[-5.13,-5.8293],[-5.1556,-5.7907],[-5.1809,-5.7517],[-5.206,-5.7125],[-5.2308,-5.6731],[-5.2553,-5.6334],[-5.2796,-5.5934],[-5.3036,-5.5532],[-5.3274,-5.5127],[-5.3509,-5.472],[-5.3742,-5.431],[-5.3972,-5.3897],[-5.4199,-5.3482],[-5.4424,-5.3065],[-5.4647,-5.2644],[-5.4866,-5.2222],[-5.5084,-5.1796],[-5.5298,-5.1368],[-5.551,-5.0938],[-5.572,-5.0505],[-5.5926,-5.0069],[-5.6131,-4.9631],[-5.6333,-4.919],[-5.6532,-4.8747],[-5.6728,-4.8301],[-5.6922,-4.7852],[-5.7114,-4.7401],[-5.7303,-4.6948],[-5.7489,-4.6492],[-5.7673,-4.6033],[-6.014,-3.8322],[-6.1374,-3.1846],[-6.1682,-2.6603],[-6.1991,-2.6294],[-6.1991,-1.8276],[-6.1682,-1.7967],[-6.1682,-1.4883],[-6.1374,-1.4575],[-6.0757,-0.9332],[-5.7981,0.0537],[-5.782,0.0967],[-5.7657,0.1395],[-5.7492,0.1822],[-5.7326,0.2246],[-5.7158,0.267],[-5.6989,0.3091],[-5.6818,0.3511],[-5.6645,0.393],[-5.6471,0.4347],[-5.6295,0.4762],[-5.6117,0.5176],[-5.5938,0.5588],[-5.5757,0.5998],[-5.5575,0.6407],[-5.5391,0.6814],[-5.5206,0.722],[-5.5018,0.7624],[-5.483,0.8026],[-5.4639,0.8427],[-5.4447,0.8826],[-5.4254,0.9223],[-5.4059,0.9619],[-5.3862,1.0014],[-5.3664,1.0406],[-5.3464,1.0798],[-5.3262,1.1187],[-5.3059,1.1575],[-5.2854,1.1961],[-5.2648,1.2346],[-5.244,1.2729],[-5.223,1.3111],[-5.2019,1.3491],[-5.1806,1.3869],[-5.1591,1.4246],[-5.1375,1.4621],[-5.1158,1.4994],[-5.0938,1.5366],[-5.0718,1.5736],[-5.0495,1.6105],[-5.0271,1.6472],[-5.0045,1.6837],[-4.9818,1.7201],[-4.9589,1.7563],[-4.9359,1.7924],[-4.9127,1.8283],[-4.8893,1.864],[-4.8657,1.8996],[-4.8421,1.935],[-4.8164,1.9737],[-4.7907,2.0122],[-4.7648,2.0506],[-4.7389,2.0889],[-4.7128,2.127],[-4.6866,2.1651],[-4.6603,2.203],[-4.6339,2.2409],[-4.6073,2.2786],[-4.5807,2.3162],[-4.554,2.3537],[-4.5271,2.3911],[-4.5001,2.4284],[-4.473,2.4655],[-4.4458,2.5026],[-4.4185,2.5395],[-4.3911,2.5763],[-4.3635,2.6131],[-4.3359,2.6497],[-4.3081,2.6861],[-4.2802,2.7225],[-4.2522,2.7588],[-4.2241,2.7949],[-4.1959,2.831],[-4.1676,2.8669],[-4.1392,2.9027],[-4.1106,2.9384],[-4.0819,2.974],[-4.0532,3.0095],[-4.0243,3.0448],[-3.9953,3.0801],[-3.9662,3.1152],[-3.9369,3.1503],[-3.9076,3.1852],[-3.8781,3.22],[-3.8486,3.2547],[-3.8189,3.2892],[-3.7891,3.3237],[-3.7592,3.358],[-3.7292,3.3923],[-3.6991,3.4264],[-3.6688,3.4604],[-3.6385,3.4943],[-3.608,3.5281],[-3.5774,3.5618],[-3.5468,3.5954],[-3.516,3.6288],[-3.485,3.6621],[-1.1257,6.0523],[-0.8019,6.3453],[-0.8019,6.4995],[-0.8636,6.6537],[-0.8944,6.9313],[-0.9561,7.0855],[-1.2336,8.4425],[-1.3262,9.2135],[-1.357,9.2444],[-1.3878,9.8612],[-1.4187,9.892],[-1.4187,11.4341],[-1.3878,11.4649],[-1.3878,11.7425],[-1.2336,12.6369],[-0.8019,13.9631],[-0.7801,14.012],[-0.758,14.0606],[-0.7355,14.1088],[-0.7128,14.1567],[-0.6896,14.2042],[-0.6661,14.2514],[-0.6423,14.2982],[-0.6181,14.3447],[-0.5936,14.3909],[-0.5687,14.4367],[-0.5435,14.4822],[-0.5179,14.5273],[-0.492,14.572],[-0.4658,14.6165],[-0.4392,14.6605],[-0.4122,14.7043],[-0.385,14.7477],[-0.3573,14.7907],[-0.3293,14.8334],[-0.301,14.8758],[-0.2724,14.9178],[-0.2433,14.9594],[-0.214,15.0008],[-0.1843,15.0417],[-0.1542,15.0824],[-0.1238,15.1226],[-0.0931,15.1626],[-0.062,15.2022],[-0.0306,15.2414],[0.0012,15.2803],[0.0333,15.3189],[0.0658,15.3571],[0.0986,15.395],[0.1318,15.4325],[0.1653,15.4696],[0.1991,15.5065],[0.2333,15.543],[0.2679,15.5791],[0.3027,15.6149],[0.338,15.6503],[0.3735,15.6854],[0.4095,15.7202],[0.4457,15.7546],[0.4823,15.7887],[0.5193,15.8224],[0.5566,15.8558],[0.5942,15.8888],[0.6322,15.9215],[0.6467,15.9346],[0.6613,15.9477],[0.6761,15.9605],[0.691,15.9732],[0.7061,15.9858],[0.7213,15.9982],[0.7367,16.0105],[0.7522,16.0226],[0.7678,16.0345],[0.7837,16.0463],[0.7996,16.058],[0.8157,16.0695],[0.832,16.0809],[0.8484,16.0921],[0.865,16.1032],[0.8817,16.1141],[0.8986,16.1248],[0.9156,16.1354],[0.9328,16.1459],[0.9501,16.1562],[0.9675,16.1664],[0.9852,16.1764],[1.0029,16.1863],[1.0208,16.196],[1.0389,16.2055],[1.0571,16.2149],[1.0755,16.2242],[1.094,16.2333],[1.1127,16.2423],[1.1315,16.2511],[1.1504,16.2598],[1.1696,16.2683],[1.1888,16.2766],[1.2082,16.2848],[1.2278,16.2929],[1.2475,16.3008],[1.2674,16.3086],[1.2874,16.3162],[1.3076,16.3237],[1.3279,16.331],[1.3483,16.3381],[1.369,16.3452],[1.3897,16.352],[1.4106,16.3587],[1.4317,16.3653],[1.4529,16.3717],[1.4743,16.378]];
// Sequential core path omitted for v17_treble; polygon() uses point order directly.
module v17_treble_core_2d() { polygon(points = v17_treble_core_points()); }

// Removed unused legacy definition: v17_treble_inner_paths

// Removed unused legacy definition: v17_treble_inner_2d


function v17_racket_core_paths() = [
    [[5.5377,16.4],[6.6638,16.4],[6.692,16.3718],[6.9172,16.3718],[7.7056,16.2311],[8.2687,16.0621],[8.8881,15.8088],[9.7045,15.3583],[9.7297,15.3418],[9.7548,15.3252],[9.7797,15.3085],[9.8045,15.2917],[9.8293,15.2748],[9.8539,15.2578],[9.8784,15.2406],[9.9028,15.2234],[9.9271,15.206],[9.9512,15.1885],[9.9753,15.171],[9.9993,15.1533],[10.0231,15.1355],[10.0469,15.1176],[10.0705,15.0996],[10.094,15.0814],[10.1174,15.0632],[10.1407,15.0448],[10.1639,15.0264],[10.187,15.0078],[10.2099,14.9891],[10.2328,14.9704],[10.2555,14.9515],[10.2782,14.9324],[10.3007,14.9133],[10.3231,14.8941],[10.3454,14.8748],[10.3676,14.8553],[10.3897,14.8358],[10.4117,14.8161],[10.4336,14.7963],[10.4553,14.7764],[10.477,14.7564],[10.4985,14.7363],[10.5199,14.7161],[10.5412,14.6958],[10.5625,14.6753],[10.5836,14.6548],[10.6045,14.6341],[10.6254,14.6134],[10.6462,14.5925],[10.6668,14.5715],[10.6874,14.5504],[10.7078,14.5292],[10.7282,14.5079],[10.7484,14.4864],[10.7685,14.4649],[10.7885,14.4433],[10.8294,14.3986],[10.8699,14.3535],[10.91,14.3079],[10.9496,14.2619],[10.9888,14.2154],[11.0275,14.1685],[11.0658,14.1211],[11.1037,14.0733],[11.141,14.0251],[11.178,13.9764],[11.2145,13.9273],[11.2506,13.8777],[11.2862,13.8277],[11.3214,13.7772],[11.3561,13.7263],[11.3904,13.675],[11.4242,13.6232],[11.4576,13.5709],[11.4905,13.5182],[11.523,13.4651],[11.5551,13.4115],[11.5867,13.3575],[11.6179,13.303],[11.6486,13.2481],[11.6789,13.1927],[11.7087,13.1369],[11.7381,13.0807],[11.767,13.024],[11.7955,12.9669],[11.8236,12.9093],[11.8512,12.8513],[11.8784,12.7928],[11.9051,12.7339],[11.9314,12.6745],[11.9572,12.6147],[11.9826,12.5544],[12.0075,12.4938],[12.032,12.4326],[12.0561,12.371],[12.0797,12.309],[12.1028,12.2465],[12.1256,12.1836],[12.1478,12.1202],[12.1697,12.0564],[12.191,11.9922],[12.212,11.9275],[12.2325,11.8623],[12.2525,11.7967],[12.4214,11.0647],[12.4777,10.4735],[12.5059,10.4453],[12.5341,9.1502],[12.5059,9.1221],[12.5059,8.7842],[12.4777,8.7561],[12.4777,8.5027],[12.4496,8.4745],[12.4214,8.1085],[12.1962,7.1231],[11.8302,6.0251],[11.4642,5.1804],[11.4217,5.095],[11.3787,5.0102],[11.3352,4.9258],[11.2913,4.8419],[11.2468,4.7585],[11.2018,4.6756],[11.1563,4.5932],[11.1103,4.5114],[11.0638,4.43],[11.0168,4.3491],[10.9693,4.2687],[10.9213,4.1889],[10.8728,4.1095],[10.8238,4.0306],[10.7743,3.9522],[10.7243,3.8744],[10.6739,3.797],[10.6229,3.7201],[10.5714,3.6438],[10.5193,3.5679],[10.4668,3.4925],[10.4138,3.4177],[10.3603,3.3433],[10.3063,3.2694],[10.2518,3.1961],[10.1968,3.1232],[10.1413,3.0509],[10.0853,2.979],[10.0288,2.9076],[9.9718,2.8368],[9.9143,2.7664],[9.8563,2.6966],[9.7977,2.6272],[9.7387,2.5584],[9.6792,2.49],[9.6192,2.4222],[9.5587,2.3548],[9.4976,2.288],[9.4361,2.2216],[9.3741,2.1558],[9.3116,2.0904],[9.2486,2.0256],[9.185,1.9612],[9.121,1.8974],[9.0565,1.8341],[8.9915,1.7712],[8.9259,1.7089],[8.8599,1.647],[8.8178,1.6082],[8.7755,1.5696],[8.733,1.5311],[8.6903,1.4929],[8.6473,1.4549],[8.6042,1.4171],[8.5609,1.3794],[8.5173,1.342],[8.4736,1.3048],[8.4297,1.2678],[8.3855,1.231],[8.3411,1.1945],[8.2966,1.1581],[8.2518,1.1219],[8.2068,1.0859],[8.1617,1.0502],[8.1163,1.0146],[8.0707,0.9792],[8.0249,0.9441],[7.9789,0.9092],[7.9327,0.8744],[7.8863,0.8399],[7.8397,0.8056],[7.7928,0.7714],[7.7458,0.7375],[7.6986,0.7038],[7.6511,0.6703],[7.6035,0.637],[7.5557,0.6039],[7.5076,0.571],[7.4593,0.5383],[7.4109,0.5058],[7.3622,0.4736],[7.3133,0.4415],[7.2643,0.4096],[7.215,0.378],[7.1655,0.3465],[7.1158,0.3153],[7.0659,0.2842],[7.0158,0.2534],[6.9655,0.2228],[6.9149,0.1923],[6.8642,0.1621],[6.8133,0.1321],[6.7622,0.1023],[6.7108,0.0727],[6.6593,0.0433],[6.6075,0.0141],[5.4814,-0.5209],[4.1862,-0.9713],[2.9474,-1.4781],[2.8925,-1.5029],[2.8376,-1.5279],[2.7829,-1.5529],[2.7283,-1.5781],[2.6738,-1.6033],[2.6194,-1.6287],[2.5652,-1.6543],[2.5111,-1.6799],[2.457,-1.7056],[2.4031,-1.7315],[2.3493,-1.7575],[2.2957,-1.7836],[2.2421,-1.8098],[2.1887,-1.8361],[2.1354,-1.8626],[2.0822,-1.8892],[2.0291,-1.9159],[1.9761,-1.9427],[1.9233,-1.9696],[1.8705,-1.9966],[1.8179,-2.0238],[1.7654,-2.0511],[1.7131,-2.0784],[1.6608,-2.106],[1.6086,-2.1336],[1.5566,-2.1613],[1.5047,-2.1892],[1.4529,-2.2172],[1.4012,-2.2453],[1.3497,-2.2735],[1.2982,-2.3018],[1.2469,-2.3303],[1.1957,-2.3588],[1.1446,-2.3875],[1.0937,-2.4163],[1.0428,-2.4452],[0.9921,-2.4743],[0.9414,-2.5034],[0.8909,-2.5327],[0.8406,-2.5621],[0.7903,-2.5916],[0.7401,-2.6212],[0.6901,-2.6509],[0.6402,-2.6808],[0.5904,-2.7108],[0.5407,-2.7408],[0.4911,-2.771],[0.4417,-2.8014],[0.3904,-2.8328],[0.3392,-2.8642],[0.2881,-2.8958],[0.2371,-2.9276],[0.1862,-2.9594],[0.1354,-2.9913],[0.0848,-3.0234],[0.0342,-3.0555],[-0.0162,-3.0878],[-0.0665,-3.1202],[-0.1167,-3.1527],[-0.1668,-3.1853],[-0.2168,-3.2181],[-0.2666,-3.2509],[-0.3164,-3.2838],[-0.366,-3.3169],[-0.4156,-3.3501],[-0.465,-3.3834],[-0.5143,-3.4168],[-0.5635,-3.4503],[-0.6125,-3.4839],[-0.6615,-3.5177],[-0.7104,-3.5515],[-0.7591,-3.5855],[-0.8077,-3.6196],[-0.8562,-3.6537],[-0.9046,-3.688],[-0.9529,-3.7225],[-1.0011,-3.757],[-1.0492,-3.7916],[-1.0971,-3.8264],[-1.145,-3.8612],[-1.1927,-3.8962],[-1.2403,-3.9313],[-1.2878,-3.9665],[-1.3352,-4.0018],[-1.3825,-4.0372],[-1.4296,-4.0728],[-1.4767,-4.1084],[-1.5236,-4.1442],[-1.5705,-4.1801],[-1.6172,-4.216],[-1.6638,-4.2521],[-1.7103,-4.2884],[-1.7567,-4.3247],[-1.8029,-4.3611],[-1.8491,-4.3977],[-1.8951,-4.4343],[-3.3169,-5.7154],[-3.3349,-5.732],[-3.3529,-5.7486],[-3.3707,-5.7654],[-3.3884,-5.7823],[-3.4061,-5.7992],[-3.4237,-5.8163],[-3.4411,-5.8334],[-3.4585,-5.8507],[-3.4758,-5.868],[-3.4929,-5.8854],[-3.51,-5.9029],[-3.527,-5.9205],[-3.5439,-5.9382],[-3.5607,-5.956],[-3.5775,-5.9739],[-3.5941,-5.9919],[-3.6106,-6.01],[-3.6271,-6.0281],[-3.6434,-6.0464],[-3.6597,-6.0648],[-3.6758,-6.0832],[-3.6919,-6.1017],[-3.7079,-6.1204],[-3.7238,-6.1391],[-3.7396,-6.1579],[-3.7552,-6.1768],[-3.7709,-6.1958],[-3.7864,-6.2149],[-3.8018,-6.2341],[-3.8171,-6.2534],[-3.8323,-6.2728],[-3.8475,-6.2922],[-3.8625,-6.3118],[-3.8775,-6.3314],[-3.8923,-6.3512],[-3.9071,-6.371],[-3.9218,-6.3909],[-3.9364,-6.411],[-3.9509,-6.4311],[-3.9653,-6.4513],[-3.9796,-6.4716],[-3.9938,-6.492],[-4.0079,-6.5125],[-4.0219,-6.5331],[-4.0359,-6.5537],[-4.0497,-6.5745],[-4.0634,-6.5954],[-4.0771,-6.6163],[-4.0711,-6.6197],[-4.0652,-6.6232],[-4.0595,-6.6269],[-4.054,-6.6307],[-4.0486,-6.6347],[-4.0433,-6.6388],[-4.0382,-6.6431],[-4.0333,-6.6476],[-4.0285,-6.6522],[-4.0239,-6.657],[-4.0195,-6.6619],[-4.0152,-6.667],[-4.011,-6.6722],[-4.007,-6.6776],[-4.0032,-6.6832],[-3.9995,-6.6889],[-3.996,-6.6948],[-3.9926,-6.7008],[-3.9894,-6.707],[-3.9864,-6.7133],[-3.9835,-6.7198],[-3.9807,-6.7264],[-3.9782,-6.7332],[-3.9757,-6.7402],[-3.9735,-6.7473],[-3.9714,-6.7546],[-3.9694,-6.762],[-3.9676,-6.7696],[-3.966,-6.7773],[-3.9645,-6.7852],[-3.9632,-6.7933],[-3.962,-6.8015],[-3.961,-6.8099],[-3.9601,-6.8184],[-3.9594,-6.8271],[-3.9589,-6.8359],[-3.9585,-6.8449],[-3.9582,-6.8541],[-3.9581,-6.8634],[-3.9582,-6.8728],[-3.9585,-6.8824],[-3.9589,-6.8922],[-3.9594,-6.9022],[-3.9601,-6.9122],[-3.961,-6.9225],[-3.962,-6.9329],[-3.9632,-6.9434],[-3.9645,-6.9542],[-4.3727,-7.5595],[-4.4994,-7.658],[-4.7247,-8.0381],[-4.7278,-8.0394],[-4.7308,-8.0405],[-4.7338,-8.0416],[-4.7367,-8.0425],[-4.7395,-8.0434],[-4.7422,-8.0442],[-4.7448,-8.0449],[-4.7473,-8.0455],[-4.7498,-8.0461],[-4.7522,-8.0465],[-4.7545,-8.0468],[-4.7567,-8.0471],[-4.7588,-8.0472],[-4.7609,-8.0473],[-4.7628,-8.0473],[-4.7647,-8.0472],[-4.7665,-8.047],[-4.7682,-8.0467],[-4.7698,-8.0463],[-4.7714,-8.0458],[-4.7728,-8.0453],[-4.7742,-8.0446],[-4.7755,-8.0439],[-4.7767,-8.043],[-4.7779,-8.0421],[-4.7789,-8.0411],[-4.7799,-8.04],[-4.7808,-8.0388],[-4.7816,-8.0375],[-4.7823,-8.0361],[-4.7829,-8.0347],[-4.7835,-8.0331],[-4.7839,-8.0315],[-4.7843,-8.0297],[-4.7846,-8.0279],[-4.7848,-8.026],[-4.785,-8.024],[-4.785,-8.0219],[-4.785,-8.0197],[-4.7849,-8.0174],[-4.7847,-8.015],[-4.7844,-8.0126],[-4.784,-8.01],[-4.7836,-8.0074],[-4.7831,-8.0046],[-4.7824,-8.0018],[-4.7817,-7.9989],[-4.781,-7.9959],[-5.0484,-7.8129],[-6.8503,-6.8275],[-6.9207,-6.926],[-5.4144,-7.8129],[-4.8795,-8.0944],[-4.781,-8.1085],[-7.5401,-12.2754],[-9.3842,-14.9641],[-11.4817,-13.6127],[-11.3973,-13.4297],[-6.4984,-6.1377],[-6.4984,-6.0814],[-6.0901,-5.4761],[-5.8368,-5.4479],[-5.7382,-5.4761],[-5.2314,-4.3639],[-4.7247,-2.9281],[-4.3305,-1.464],[-3.9926,0.2252],[-3.9926,0.3942],[-3.9645,0.4223],[-3.9082,0.9291],[-3.88,0.9573],[-3.88,1.1543],[-3.8519,1.1825],[-3.8519,1.3796],[-3.8237,1.4077],[-3.7956,1.8864],[-3.7674,1.9145],[-3.7111,2.9844],[-3.6829,3.0125],[-3.6829,3.6319],[-3.6548,3.6601],[-3.6548,5.9969],[-3.6266,6.0251],[-3.6266,6.3629],[-3.5985,6.3911],[-3.5985,6.6445],[-3.5703,6.6726],[-3.4859,7.4328],[-3.2043,8.6153],[-3.1949,8.6469],[-3.1854,8.6785],[-3.1758,8.71],[-3.1662,8.7414],[-3.1565,8.7727],[-3.1467,8.804],[-3.1368,8.8352],[-3.1269,8.8663],[-3.1169,8.8974],[-3.1068,8.9284],[-3.0966,8.9593],[-3.0864,8.9901],[-3.0761,9.0208],[-3.0657,9.0515],[-3.0553,9.0821],[-3.0448,9.1127],[-3.0342,9.1431],[-3.0235,9.1735],[-3.0128,9.2038],[-3.0019,9.2341],[-2.9911,9.2643],[-2.9801,9.2944],[-2.9691,9.3244],[-2.958,9.3543],[-2.9468,9.3842],[-2.9355,9.414],[-2.9242,9.4437],[-2.9128,9.4734],[-2.9013,9.503],[-2.8898,9.5325],[-2.8782,9.5619],[-2.8665,9.5913],[-2.8547,9.6206],[-2.8428,9.6498],[-2.8309,9.679],[-2.8189,9.708],[-2.8069,9.737],[-2.7948,9.7659],[-2.7825,9.7948],[-2.7703,9.8236],[-2.7579,9.8523],[-2.7455,9.8809],[-2.733,9.9095],[-2.7204,9.938],[-2.7078,9.9664],[-2.695,9.9947],[-2.6822,10.023],[-2.6694,10.0512],[-1.881,11.5152],[-1.8449,11.5723],[-1.8085,11.6291],[-1.7718,11.6857],[-1.7348,11.742],[-1.6976,11.798],[-1.6601,11.8538],[-1.6223,11.9093],[-1.5843,11.9645],[-1.5459,12.0194],[-1.5073,12.0741],[-1.4685,12.1285],[-1.4293,12.1826],[-1.3899,12.2365],[-1.3503,12.2901],[-1.3103,12.3434],[-1.2701,12.3964],[-1.2296,12.4492],[-1.1888,12.5017],[-1.1478,12.5539],[-1.1065,12.6059],[-1.0649,12.6576],[-1.0231,12.709],[-0.981,12.7601],[-0.9386,12.811],[-0.8959,12.8616],[-0.853,12.9119],[-0.8098,12.962],[-0.7663,13.0118],[-0.7226,13.0613],[-0.6785,13.1105],[-0.6343,13.1595],[-0.5897,13.2082],[-0.5449,13.2566],[-0.4998,13.3048],[-0.4544,13.3527],[-0.4087,13.4003],[-0.3628,13.4477],[-0.3166,13.4947],[-0.2702,13.5415],[-0.2235,13.5881],[-0.1765,13.6343],[-0.1292,13.6803],[-0.0816,13.726],[-0.0338,13.7715],[0.0143,13.8167],[0.0626,13.8616],[0.1113,13.9062],[0.1602,13.9506],[0.2043,13.9909],[0.2487,14.031],[0.2933,14.0708],[0.3383,14.1103],[0.3835,14.1496],[0.4289,14.1886],[0.4747,14.2273],[0.5207,14.2657],[0.567,14.3039],[0.6135,14.3418],[0.6603,14.3795],[0.7074,14.4169],[0.7548,14.454],[0.8024,14.4908],[0.8503,14.5274],[0.8984,14.5637],[0.9469,14.5997],[0.9956,14.6355],[1.0445,14.671],[1.0937,14.7062],[1.1433,14.7412],[1.193,14.7759],[1.2431,14.8103],[1.2934,14.8445],[1.3439,14.8783],[1.3948,14.912],[1.4459,14.9453],[1.4973,14.9784],[1.5489,15.0112],[1.6009,15.0437],[1.6531,15.076],[1.7055,15.108],[1.7583,15.1398],[1.8112,15.1712],[1.8645,15.2024],[1.9181,15.2333],[1.9719,15.264],[2.0259,15.2944],[2.0803,15.3245],[2.1349,15.3544],[2.1898,15.384],[2.2449,15.4133],[2.3003,15.4423],[2.356,15.4711],[2.412,15.4996],[2.4682,15.5278],[2.5247,15.5558],[2.5814,15.5835],[2.6108,15.5975],[2.6403,15.6115],[2.6699,15.6253],[2.6995,15.639],[2.7293,15.6527],[2.7592,15.6662],[2.7891,15.6797],[2.8192,15.693],[2.8493,15.7063],[2.8796,15.7194],[2.91,15.7325],[2.9404,15.7454],[2.971,15.7583],[3.0016,15.771],[3.0324,15.7837],[3.0632,15.7962],[3.0941,15.8087],[3.1252,15.8211],[3.1563,15.8333],[3.1875,15.8455],[3.2189,15.8576],[3.2503,15.8696],[3.2818,15.8814],[3.3135,15.8932],[3.3452,15.9049],[3.377,15.9165],[3.4089,15.928],[3.4409,15.9394],[3.473,15.9507],[3.5053,15.9618],[3.5376,15.9729],[3.57,15.9839],[3.6025,15.9948],[3.6351,16.0056],[3.6678,16.0163],[3.7006,16.027],[3.7335,16.0375],[3.7665,16.0479],[3.7996,16.0582],[3.8328,16.0684],[3.866,16.0785],[3.8994,16.0885],[3.9329,16.0985],[3.9665,16.1083],[4.0002,16.118],[4.0339,16.1276],[4.0678,16.1372],[4.1018,16.1466],[4.862,16.3155],[5.0309,16.3155],[5.2561,16.3718],[5.5095,16.3718]],
    [[-11.8055,-13.7253],[-11.7976,-13.7238],[-11.7897,-13.7224],[-11.782,-13.7211],[-11.7743,-13.7199],[-11.7667,-13.7188],[-11.7592,-13.7178],[-11.7518,-13.7168],[-11.7445,-13.7159],[-11.7373,-13.7152],[-11.7301,-13.7145],[-11.7231,-13.7139],[-11.7161,-13.7134],[-11.7092,-13.7129],[-11.7025,-13.7126],[-11.6958,-13.7123],[-11.6891,-13.7122],[-11.6826,-13.7121],[-11.6762,-13.7121],[-11.6698,-13.7122],[-11.6636,-13.7124],[-11.6574,-13.7127],[-11.6513,-13.7131],[-11.6453,-13.7135],[-11.6394,-13.7141],[-11.6336,-13.7147],[-11.6278,-13.7154],[-11.6222,-13.7162],[-11.6166,-13.7171],[-11.6112,-13.7181],[-11.6058,-13.7192],[-11.6005,-13.7203],[-11.5953,-13.7216],[-11.5902,-13.7229],[-11.5851,-13.7243],[-11.5802,-13.7258],[-11.5753,-13.7274],[-11.5706,-13.7291],[-11.5659,-13.7309],[-11.5613,-13.7328],[-11.5568,-13.7347],[-11.5524,-13.7367],[-11.5481,-13.7389],[-11.5438,-13.7411],[-11.5397,-13.7434],[-11.5356,-13.7458],[-11.5317,-13.7483],[-11.5278,-13.7508],[-11.524,-13.7535],[-9.4265,-15.1471],[-9.4226,-15.1556],[-9.4189,-15.1642],[-9.4153,-15.173],[-9.4119,-15.1818],[-9.4085,-15.1908],[-9.4053,-15.1998],[-9.4021,-15.209],[-9.3991,-15.2183],[-9.3962,-15.2277],[-9.3934,-15.2372],[-9.3907,-15.2468],[-9.3881,-15.2566],[-9.3856,-15.2664],[-9.3833,-15.2764],[-9.381,-15.2865],[-9.3789,-15.2967],[-9.3769,-15.307],[-9.375,-15.3174],[-9.3732,-15.3279],[-9.3715,-15.3385],[-9.3699,-15.3493],[-9.3685,-15.3602],[-9.3672,-15.3711],[-9.3659,-15.3822],[-9.3648,-15.3934],[-9.3638,-15.4047],[-9.3629,-15.4162],[-9.3621,-15.4277],[-9.3615,-15.4393],[-9.3609,-15.4511],[-9.3605,-15.463],[-9.3601,-15.475],[-9.3599,-15.4871],[-9.3598,-15.4993],[-9.3598,-15.5116],[-9.3599,-15.524],[-9.3602,-15.5366],[-9.3605,-15.5493],[-9.361,-15.562],[-9.3615,-15.5749],[-9.3622,-15.5879],[-9.363,-15.601],[-9.3639,-15.6143],[-9.3649,-15.6276],[-9.3661,-15.641],[-9.3673,-15.6546],[-9.3687,-15.6683],[-9.3701,-15.6821],[-9.4265,-15.851],[-9.6658,-16.2029],[-9.6741,-16.211],[-9.6825,-16.219],[-9.6912,-16.2268],[-9.7,-16.2344],[-9.709,-16.2418],[-9.7181,-16.2491],[-9.7274,-16.2562],[-9.7369,-16.2631],[-9.7466,-16.2699],[-9.7564,-16.2765],[-9.7664,-16.2829],[-9.7766,-16.2891],[-9.787,-16.2952],[-9.7975,-16.3011],[-9.8082,-16.3068],[-9.8191,-16.3124],[-9.8301,-16.3178],[-9.8413,-16.323],[-9.8527,-16.3281],[-9.8642,-16.3329],[-9.8759,-16.3376],[-9.8878,-16.3422],[-9.8999,-16.3465],[-9.9121,-16.3507],[-9.9245,-16.3547],[-9.9371,-16.3586],[-9.9498,-16.3623],[-9.9628,-16.3658],[-9.9758,-16.3691],[-9.9891,-16.3723],[-10.0025,-16.3753],[-10.0161,-16.3781],[-10.0299,-16.3808],[-10.0439,-16.3832],[-10.058,-16.3855],[-10.0723,-16.3877],[-10.0867,-16.3896],[-10.1013,-16.3914],[-10.1161,-16.3931],[-10.1311,-16.3945],[-10.1462,-16.3958],[-10.1616,-16.3969],[-10.177,-16.3979],[-10.1927,-16.3986],[-10.2085,-16.3992],[-10.2245,-16.3997],[-10.2407,-16.3999],[-10.257,-16.4],[-10.5949,-16.2592],[-12.3827,-15.0345],[-12.3906,-15.0271],[-12.3982,-15.0195],[-12.4057,-15.0117],[-12.4129,-15.0037],[-12.4199,-14.9955],[-12.4268,-14.9871],[-12.4334,-14.9784],[-12.4398,-14.9696],[-12.446,-14.9605],[-12.4519,-14.9513],[-12.4577,-14.9418],[-12.4633,-14.9321],[-12.4686,-14.9222],[-12.4738,-14.9121],[-12.4787,-14.9018],[-12.4834,-14.8912],[-12.4879,-14.8805],[-12.4922,-14.8695],[-12.4963,-14.8584],[-12.5002,-14.847],[-12.5039,-14.8354],[-12.5073,-14.8236],[-12.5106,-14.8116],[-12.5136,-14.7994],[-12.5164,-14.787],[-12.519,-14.7744],[-12.5215,-14.7615],[-12.5236,-14.7485],[-12.5256,-14.7352],[-12.5274,-14.7217],[-12.529,-14.708],[-12.5303,-14.6941],[-12.5315,-14.68],[-12.5324,-14.6657],[-12.5331,-14.6512],[-12.5337,-14.6365],[-12.534,-14.6215],[-12.5341,-14.6064],[-12.5339,-14.591],[-12.5336,-14.5754],[-12.5331,-14.5596],[-12.5323,-14.5437],[-12.5314,-14.5274],[-12.5302,-14.511],[-12.5288,-14.4944],[-12.5273,-14.4776],[-12.5255,-14.4605],[-12.5235,-14.4433],[-12.5192,-14.4288],[-12.5147,-14.4144],[-12.5102,-14.4002],[-12.5055,-14.3861],[-12.5007,-14.3721],[-12.4958,-14.3583],[-12.4907,-14.3446],[-12.4855,-14.331],[-12.4802,-14.3176],[-12.4747,-14.3043],[-12.4692,-14.2911],[-12.4634,-14.278],[-12.4576,-14.2651],[-12.4516,-14.2523],[-12.4455,-14.2396],[-12.4393,-14.2271],[-12.4329,-14.2147],[-12.4265,-14.2024],[-12.4198,-14.1903],[-12.4131,-14.1782],[-12.4062,-14.1663],[-12.3992,-14.1546],[-12.3921,-14.143],[-12.3848,-14.1315],[-12.3774,-14.1201],[-12.3699,-14.1088],[-12.3622,-14.0977],[-12.3544,-14.0867],[-12.3465,-14.0759],[-12.3385,-14.0652],[-12.3303,-14.0546],[-12.322,-14.0441],[-12.3136,-14.0338],[-12.305,-14.0235],[-12.2963,-14.0135],[-12.2875,-14.0035],[-12.2785,-13.9937],[-12.2695,-13.984],[-12.2602,-13.9745],[-12.2509,-13.965],[-12.2414,-13.9557],[-12.2318,-13.9466],[-12.2221,-13.9375],[-12.2122,-13.9286],[-12.2023,-13.9198],[-12.1921,-13.9112],[-12.1819,-13.9026],[-12.1715,-13.8942]]
];
module v17_racket_core_2d() {
    union()
        for (path = v17_racket_core_paths())
            polygon(points = path);
}

// Removed unused legacy definition: v17_racket_cells_paths

// Removed unused legacy definition: v17_racket_cells_2d


function v17_lacrosse_face_points_flat() = v17_lacrosse_core_points();

function v17_pencil_face_points_flat() = v17_pencil_core_points();

function v17_double_note_face_points_flat() = v17_double_note_core_points();

function v17_treble_face_points_flat() = v17_treble_core_points();

// Removed unused legacy definition: v17_racket_face_points_flat



// ===== VERS17 BOOLEAN-DERIVED TOP REGIONS =====
module v17_lacrosse_top_boolean_2d() {
    union() {
        polygon(points = [[1.0361,13.6106],[0.6376,13.6106],[0.0398,13.491],[-0.6774,13.2519],[-0.7,13.2428],[-0.7226,13.2336],[-0.745,13.2243],[-0.7674,13.2149],[-0.7897,13.2054],[-0.8119,13.1959],[-0.834,13.1862],[-0.856,13.1765],[-0.8779,13.1667],[-0.8998,13.1568],[-0.9216,13.1468],[-0.9432,13.1367],[-0.9648,13.1265],[-0.9863,13.1163],[-1.0078,13.106],[-1.0291,13.0955],[-1.0503,13.085],[-1.0715,13.0745],[-1.0926,13.0638],[-1.1136,13.053],[-1.1345,13.0422],[-1.1553,13.0312],[-1.1761,13.0202],[-1.1967,13.0091],[-1.2173,12.9979],[-1.2378,12.9867],[-1.2582,12.9753],[-1.2785,12.9639],[-1.2987,12.9523],[-1.3188,12.9407],[-1.3389,12.929],[-1.3588,12.9172],[-1.3787,12.9053],[-1.3985,12.8934],[-1.4182,12.8813],[-1.4379,12.8692],[-1.4574,12.857],[-1.4768,12.8447],[-1.4962,12.8323],[-1.5155,12.8198],[-1.5347,12.8073],[-1.5538,12.7946],[-1.5728,12.7819],[-1.5918,12.7691],[-1.6106,12.7562],[-1.6294,12.7432],[-1.6481,12.7301],[-1.6667,12.717],[-1.6852,12.7037],[-1.7036,12.6904],[-1.722,12.677],[-1.7402,12.6635],[-1.7584,12.6499],[-1.7765,12.6362],[-1.7945,12.6225],[-1.8124,12.6086],[-1.8302,12.5947],[-1.8479,12.5807],[-1.8656,12.5666],[-1.8832,12.5524],[-1.9006,12.5381],[-1.918,12.5238],[-1.9354,12.5093],[-1.9526,12.4948],[-1.9852,12.4677],[-2.0176,12.4403],[-2.0497,12.4126],[-2.0816,12.3847],[-2.1132,12.3565],[-2.1445,12.3281],[-2.1756,12.2994],[-2.2064,12.2705],[-2.237,12.2413],[-2.2674,12.2119],[-2.2974,12.1822],[-2.3272,12.1522],[-2.3568,12.122],[-2.3861,12.0915],[-2.4152,12.0608],[-2.444,12.0298],[-2.4725,11.9986],[-2.5008,11.9671],[-2.5288,11.9354],[-2.5566,11.9034],[-2.5841,11.8711],[-2.6114,11.8386],[-2.6384,11.8059],[-2.6652,11.7729],[-2.6917,11.7396],[-2.718,11.7061],[-2.7439,11.6723],[-2.7697,11.6383],[-2.7952,11.604],[-2.8204,11.5694],[-2.8454,11.5347],[-2.8701,11.4996],[-2.8946,11.4643],[-2.9188,11.4287],[-2.9427,11.3929],[-2.9664,11.3568],[-2.9899,11.3205],[-3.0131,11.2839],[-3.036,11.2471],[-3.0587,11.21],[-3.0811,11.1727],[-3.1033,11.1351],[-3.1252,11.0972],[-3.1469,11.0591],[-3.1683,11.0207],[-3.1894,10.9821],[-3.2103,10.9432],[-3.231,10.9041],[-3.2514,10.8647],[-3.2715,10.8251],[-3.2914,10.7852],[-3.311,10.745],[-3.3304,10.7046],[-3.3495,10.664],[-3.3684,10.6231],[-3.387,10.5819],[-3.4053,10.5405],[-3.4234,10.4988],[-3.4412,10.4569],[-3.4588,10.4147],[-3.4762,10.3722],[-3.4932,10.3295],[-3.51,10.2866],[-3.5266,10.2434],[-3.9251,8.8088],[-4.1642,5.9796],[-4.4431,4.4653],[-4.8018,3.1104],[-5.2003,1.915],[-6.0769,-0.3165],[-8.3882,-5.2976],[-8.5874,-5.9751],[-8.6273,-6.5728],[-8.6671,-6.6127],[-8.5874,-7.3299],[-8.2288,-8.0472],[-8.2013,-8.0789],[-8.1736,-8.1103],[-8.1455,-8.1414],[-8.1171,-8.1721],[-8.0883,-8.2025],[-8.0593,-8.2326],[-8.0299,-8.2624],[-8.0002,-8.2918],[-7.9702,-8.321],[-7.9398,-8.3497],[-7.9091,-8.3782],[-7.8781,-8.4064],[-7.8468,-8.4342],[-7.8151,-8.4617],[-7.7831,-8.4888],[-7.7508,-8.5157],[-7.7182,-8.5422],[-7.6852,-8.5684],[-7.652,-8.5943],[-7.6183,-8.6198],[-7.5844,-8.645],[-7.5502,-8.6699],[-7.5156,-8.6945],[-7.4807,-8.7187],[-7.4454,-8.7426],[-7.4099,-8.7662],[-7.374,-8.7895],[-7.3378,-8.8124],[-7.3013,-8.8351],[-7.2644,-8.8574],[-7.2272,-8.8793],[-7.1897,-8.901],[-7.1519,-8.9223],[-7.1137,-8.9433],[-7.0752,-8.9639],[-7.0364,-8.9843],[-6.9973,-9.0043],[-6.9578,-9.024],[-6.9181,-9.0434],[-6.878,-9.0624],[-6.8375,-9.0811],[-6.7968,-9.0995],[-6.7557,-9.1176],[-6.7143,-9.1353],[-6.6725,-9.1528],[-6.6305,-9.1699],[-6.5881,-9.1866],[-6.5454,-9.2031],[-6.5024,-9.2192],[-6.459,-9.235],[-6.4153,-9.2505],[-6.3713,-9.2656],[-6.327,-9.2804],[-6.2823,-9.2949],[-6.2374,-9.3091],[-6.1921,-9.3229],[-6.1464,-9.3364],[-6.1005,-9.3496],[-6.0542,-9.3625],[-6.0076,-9.3751],[-5.9607,-9.3873],[-5.9134,-9.3992],[-5.8658,-9.4107],[-5.8179,-9.422],[-5.3397,-9.422],[-4.8217,-9.3024],[-4.8,-9.2943],[-4.7783,-9.2861],[-4.7568,-9.2777],[-4.7353,-9.2693],[-4.714,-9.2608],[-4.6927,-9.2521],[-4.6715,-9.2434],[-4.6505,-9.2346],[-4.6295,-9.2257],[-4.6086,-9.2166],[-4.5879,-9.2075],[-4.5672,-9.1983],[-4.5466,-9.189],[-4.5261,-9.1796],[-4.5058,-9.1701],[-4.4855,-9.1605],[-4.4653,-9.1508],[-4.4452,-9.141],[-4.4252,-9.1311],[-4.4053,-9.1211],[-4.3855,-9.111],[-4.3658,-9.1008],[-4.3462,-9.0905],[-4.3267,-9.0802],[-4.3073,-9.0697],[-4.288,-9.0591],[-4.2688,-9.0484],[-4.2497,-9.0377],[-4.2306,-9.0268],[-4.2117,-9.0158],[-4.1929,-9.0048],[-4.1742,-8.9936],[-4.1555,-8.9824],[-4.137,-8.971],[-4.1186,-8.9596],[-4.1002,-8.948],[-4.082,-8.9364],[-4.0638,-8.9246],[-4.0458,-8.9128],[-4.0278,-8.9008],[-4.01,-8.8888],[-3.9922,-8.8767],[-3.9746,-8.8644],[-3.957,-8.8521],[-3.9395,-8.8397],[-3.9222,-8.8272],[-3.9049,-8.8146],[-3.8877,-8.8018],[-3.8707,-8.789],[-3.8537,-8.7761],[-3.8368,-8.7631],[-3.82,-8.75],[-3.8033,-8.7368],[-3.7868,-8.7235],[-3.7703,-8.7101],[-3.7539,-8.6966],[-3.7376,-8.683],[-3.7214,-8.6693],[-3.7053,-8.6556],[-3.6893,-8.6417],[-3.6734,-8.6277],[-3.6576,-8.6136],[-3.6419,-8.5994],[-3.6262,-8.5852],[-2.5304,-7.4096],[-2.4862,-7.3455],[-2.4419,-7.2815],[-2.3975,-7.2175],[-2.3531,-7.1536],[-2.3086,-7.0897],[-2.2641,-7.0259],[-2.2195,-6.9621],[-2.1749,-6.8984],[-2.1302,-6.8348],[-2.0854,-6.7712],[-2.0406,-6.7077],[-1.9957,-6.6442],[-1.9508,-6.5808],[-1.9058,-6.5175],[-1.8607,-6.4542],[-1.8156,-6.391],[-1.7704,-6.3278],[-1.7252,-6.2647],[-1.6799,-6.2017],[-1.6346,-6.1387],[-1.5892,-6.0757],[-1.5437,-6.0129],[-1.4982,-5.95],[-1.4526,-5.8873],[-1.407,-5.8246],[-1.3613,-5.7619],[-1.3155,-5.6993],[-1.2697,-5.6368],[-1.2238,-5.5744],[-1.1779,-5.5119],[-1.1319,-5.4496],[-1.0859,-5.3873],[-1.0398,-5.3251],[-0.9936,-5.2629],[-0.9474,-5.2008],[-0.9011,-5.1387],[-0.8548,-5.0767],[-0.8084,-5.0148],[-0.7619,-4.9529],[-0.7154,-4.8911],[-0.6688,-4.8293],[-0.6222,-4.7676],[-0.5755,-4.7059],[-0.5288,-4.6443],[-0.482,-4.5828],[-0.4351,-4.5213],[-0.3882,-4.4599],[-0.3412,-4.3986],[-0.2942,-4.3373],[-0.2471,-4.276],[-0.1999,-4.2148],[-0.1527,-4.1537],[-0.1054,-4.0926],[-0.0581,-4.0316],[-0.0107,-3.9707],[0.0367,-3.9098],[0.0842,-3.849],[0.1318,-3.7882],[0.1794,-3.7275],[0.2271,-3.6668],[0.2748,-3.6062],[0.3226,-3.5457],[0.3705,-3.4852],[0.4184,-3.4248],[2.2515,-1.3526],[2.2843,-1.3182],[2.3171,-1.2838],[2.3501,-1.2496],[2.3832,-1.2154],[2.4164,-1.1813],[2.4497,-1.1474],[2.483,-1.1135],[2.5165,-1.0797],[2.5501,-1.046],[2.5837,-1.0124],[2.6175,-0.9789],[2.6513,-0.9456],[2.6853,-0.9122],[2.7193,-0.879],[2.7534,-0.8459],[2.7877,-0.8129],[2.822,-0.78],[2.8564,-0.7472],[2.8909,-0.7144],[2.9255,-0.6818],[2.9602,-0.6493],[2.995,-0.6168],[3.0299,-0.5845],[3.0649,-0.5522],[3.1,-0.5201],[3.1352,-0.488],[3.1705,-0.456],[3.2058,-0.4242],[3.2413,-0.3924],[3.2769,-0.3607],[3.3125,-0.3291],[3.3483,-0.2976],[3.3841,-0.2662],[3.4201,-0.2349],[3.4561,-0.2037],[3.4923,-0.1726],[3.5285,-0.1416],[3.5648,-0.1107],[3.6012,-0.0799],[3.6378,-0.0491],[3.6744,-0.0185],[3.7111,0.012],[3.7479,0.0425],[3.7848,0.0728],[3.8218,0.1031],[3.8589,0.1332],[3.896,0.1633],[3.9333,0.1933],[3.9707,0.2231],[4.0082,0.2529],[4.0457,0.2826],[4.0834,0.3122],[4.1211,0.3417],[4.159,0.3711],[4.1969,0.4004],[4.235,0.4296],[4.2731,0.4587],[4.3114,0.4877],[4.3497,0.5166],[4.3881,0.5454],[4.4266,0.5741],[4.4652,0.6028],[4.504,0.6313],[4.5428,0.6597],[4.575,0.6829],[4.6074,0.7059],[4.6398,0.729],[4.6723,0.7519],[4.7048,0.7748],[4.7374,0.7976],[4.7701,0.8204],[4.8028,0.8431],[4.8356,0.8657],[4.8684,0.8883],[4.9013,0.9108],[4.9343,0.9332],[4.9673,0.9556],[5.0004,0.9779],[5.0336,1.0002],[5.0668,1.0224],[5.1,1.0445],[5.1334,1.0666],[5.1668,1.0886],[5.2003,1.1105],[5.2338,1.1324],[5.2674,1.1542],[5.301,1.176],[5.3348,1.1977],[5.3685,1.2193],[5.4024,1.2409],[5.4363,1.2624],[5.4702,1.2839],[5.5043,1.3053],[5.5384,1.3266],[5.5725,1.3479],[5.6067,1.3691],[5.641,1.3902],[5.6753,1.4113],[5.7097,1.4323],[5.7442,1.4532],[5.7787,1.4741],[5.8133,1.495],[5.848,1.5157],[5.8827,1.5364],[5.9174,1.5571],[5.9523,1.5776],[5.9872,1.5982],[6.0221,1.6186],[6.0572,1.639],[6.0923,1.6593],[6.1274,1.6796],[6.1626,1.6998],[6.1979,1.7199],[6.2332,1.74],[6.2686,1.76],[6.3041,1.78],[6.3396,1.7999],[6.3752,1.8197],[6.4108,1.8395],[6.4465,1.8592],[6.4823,1.8788],[6.5181,1.8984],[6.554,1.9179],[6.59,1.9374],[6.626,1.9568],[6.6621,1.9761],[6.6982,1.9954],[6.7344,2.0146],[7.7705,2.7717],[7.7921,2.7912],[7.8136,2.8108],[7.835,2.8305],[7.8564,2.8503],[7.8776,2.8701],[7.8987,2.8901],[7.9197,2.9102],[7.9405,2.9304],[7.9613,2.9507],[7.982,2.9711],[8.0026,2.9917],[8.0231,3.0123],[8.0435,3.033],[8.0637,3.0538],[8.0839,3.0747],[8.104,3.0957],[8.124,3.1169],[8.1438,3.1381],[8.1636,3.1594],[8.1832,3.1809],[8.2028,3.2024],[8.2222,3.2241],[8.2416,3.2458],[8.2608,3.2677],[8.28,3.2896],[8.299,3.3117],[8.3179,3.3338],[8.3368,3.3561],[8.3555,3.3785],[8.3741,3.4009],[8.3927,3.4235],[8.4111,3.4462],[8.4294,3.4689],[8.4476,3.4918],[8.4657,3.5148],[8.4837,3.5379],[8.5016,3.5611],[8.5194,3.5844],[8.5371,3.6078],[8.5547,3.6313],[8.5722,3.6549],[8.5896,3.6786],[8.6069,3.7024],[8.6241,3.7263],[8.6411,3.7503],[8.6581,3.7744],[8.675,3.7987],[8.6918,3.823],[8.7084,3.8474],[8.725,3.8719],[8.7414,3.8966],[8.7578,3.9213],[8.7741,3.9462],[8.7902,3.9711],[8.8063,3.9961],[8.8222,4.0213],[8.838,4.0466],[8.8538,4.0719],[8.8694,4.0974],[8.8849,4.1229],[8.9004,4.1486],[8.9157,4.1744],[8.9309,4.2002],[8.946,4.2262],[9.4641,5.3818],[9.743,6.5773],[9.743,7.5735],[9.6235,8.2509],[9.4641,8.769],[8.9062,9.8847],[8.0694,10.8809],[8.0468,10.9032],[8.0241,10.9254],[8.0014,10.9474],[7.9785,10.9694],[7.9556,10.9914],[7.9326,11.0132],[7.9095,11.0349],[7.8864,11.0566],[7.8631,11.0782],[7.8398,11.0997],[7.8164,11.1211],[7.7929,11.1424],[7.7693,11.1637],[7.7456,11.1848],[7.7219,11.2059],[7.698,11.2269],[7.6741,11.2478],[7.6501,11.2686],[7.626,11.2894],[7.6018,11.31],[7.5776,11.3306],[7.5533,11.3511],[7.5288,11.3715],[7.5043,11.3918],[7.4797,11.4121],[7.4551,11.4322],[7.4303,11.4523],[7.4055,11.4723],[7.3805,11.4922],[7.3555,11.512],[7.3304,11.5317],[7.3053,11.5514],[7.28,11.571],[7.2547,11.5905],[7.2292,11.6099],[7.2037,11.6292],[7.1781,11.6484],[7.1525,11.6676],[7.1267,11.6866],[7.1009,11.7056],[7.0749,11.7245],[7.0489,11.7434],[7.0228,11.7621],[6.9966,11.7807],[6.9704,11.7993],[6.944,11.8178],[6.9176,11.8362],[6.8911,11.8545],[6.8645,11.8727],[6.8378,11.8909],[6.8111,11.909],[6.7842,11.9269],[6.7573,11.9448],[6.7303,11.9626],[6.7032,11.9804],[6.676,11.998],[6.6487,12.0156],[6.6214,12.0331],[6.5939,12.0505],[6.5664,12.0678],[6.5388,12.085],[6.5111,12.1021],[6.4833,12.1192],[6.4555,12.1362],[6.4273,12.1535],[6.3991,12.1707],[6.3707,12.1878],[6.3423,12.2048],[6.3139,12.2218],[6.2853,12.2387],[6.2567,12.2555],[6.228,12.2723],[6.1992,12.289],[6.1704,12.3056],[6.1414,12.3221],[6.1125,12.3386],[6.0834,12.355],[6.0542,12.3713],[6.025,12.3875],[5.9957,12.4037],[5.9664,12.4198],[5.9369,12.4358],[5.9074,12.4517],[5.8778,12.4676],[5.8482,12.4834],[5.8185,12.4991],[5.7886,12.5147],[5.7588,12.5303],[5.7288,12.5458],[5.6988,12.5612],[5.6687,12.5766],[5.6385,12.5919],[5.6083,12.6071],[5.5779,12.6222],[5.5475,12.6372],[5.5171,12.6522],[5.4865,12.6671],[5.4559,12.682],[5.4252,12.6967],[5.3944,12.7114],[5.3636,12.726],[5.3327,12.7406],[5.3017,12.755],[5.2706,12.7694],[5.2395,12.7837],[5.2083,12.798],[5.177,12.8121],[5.1456,12.8262],[5.1142,12.8402],[5.0827,12.8542],[5.0511,12.8681],[5.0194,12.8819],[4.9877,12.8956],[4.9559,12.9092],[4.924,12.9228],[4.8921,12.9363],[4.8601,12.9497],[4.828,12.9631],[4.7958,12.9764],[4.7635,12.9896],[4.7312,13.0027],[4.6988,13.0158],[4.6664,13.0287],[4.6338,13.0417],[4.6012,13.0545],[4.5685,13.0673],[4.5357,13.0799],[4.5029,13.0926],[4.4775,13.102],[4.452,13.1114],[4.4264,13.1207],[4.4008,13.1299],[4.3751,13.1391],[4.3494,13.1482],[4.3236,13.1573],[4.2977,13.1663],[4.2718,13.1752],[4.2458,13.1841],[4.2197,13.1929],[4.1936,13.2016],[4.1674,13.2103],[4.1412,13.2189],[4.1148,13.2275],[4.0885,13.236],[4.0621,13.2444],[4.0356,13.2528],[4.009,13.2611],[3.9824,13.2694],[3.9557,13.2776],[3.929,13.2857],[3.9022,13.2938],[3.8753,13.3018],[3.8484,13.3097],[3.8214,13.3176],[3.7943,13.3254],[3.7672,13.3331],[3.74,13.3408],[3.7128,13.3485],[3.6855,13.356],[3.6581,13.3635],[3.6307,13.371],[3.6032,13.3783],[3.5756,13.3857],[3.548,13.3929],[3.5204,13.4001],[3.4926,13.4072],[3.4648,13.4143],[3.437,13.4213],[3.409,13.4282],[3.381,13.4351],[3.353,13.4419],[3.3249,13.4487],[3.2967,13.4554],[3.2685,13.462],[3.2402,13.4686],[3.2118,13.4751],[3.1834,13.4815],[3.1549,13.4879],[3.1264,13.4942],[3.0977,13.5005],[3.0691,13.5067],[3.0403,13.5128],[3.0115,13.5189],[2.9827,13.5249],[2.9538,13.5309],[2.9248,13.5367],[2.8957,13.5426],[2.8666,13.5483],[2.8374,13.554],[2.8082,13.5597],[2.7789,13.5652],[2.7496,13.5707],[2.112,13.6106],[2.0721,13.6504],[1.0759,13.6504],[1.9127,13.1723],[1.9526,13.1324],[2.2515,13.1324],[2.2515,12.7937],[2.2116,12.7538],[2.2116,12.196],[2.1718,12.1561],[2.1718,11.5982],[2.1319,11.5584],[2.1319,11.0802],[2.0323,10.9407],[1.1158,10.5024],[-0.6774,9.4663],[-0.9364,9.3866],[-0.8966,9.4862],[-0.8567,10.602],[-0.8169,10.6419],[-0.7372,12.6343],[-0.6376,12.7339],[0.1195,13.0129],[0.7173,13.1324],[1.0759,13.1324],[1.1158,13.1723],[3.2277,12.973],[4.0646,12.7339],[4.9612,12.3554],[2.63,11.2595],[2.6267,11.261],[2.6235,11.2625],[2.6204,11.264],[2.6173,11.2655],[2.6144,11.267],[2.6116,11.2685],[2.6088,11.27],[2.6062,11.2715],[2.6036,11.273],[2.6012,11.2746],[2.5988,11.2761],[2.5965,11.2776],[2.5944,11.2791],[2.5923,11.2806],[2.5903,11.2821],[2.5884,11.2837],[2.5866,11.2852],[2.5849,11.2867],[2.5833,11.2883],[2.5818,11.2898],[2.5804,11.2913],[2.5791,11.2929],[2.5779,11.2944],[2.5768,11.2959],[2.5758,11.2975],[2.5748,11.299],[2.574,11.3006],[2.5732,11.3021],[2.5726,11.3037],[2.5721,11.3052],[2.5716,11.3068],[2.5712,11.3083],[2.571,11.3099],[2.5708,11.3114],[2.5707,11.313],[2.5708,11.3146],[2.5709,11.3161],[2.5711,11.3177],[2.5714,11.3193],[2.5718,11.3208],[2.5723,11.3224],[2.5729,11.324],[2.5736,11.3256],[2.5744,11.3271],[2.5752,11.3287],[2.5762,11.3303],[2.5773,11.3319],[2.5785,11.3335],[2.5797,11.3351],[2.5811,11.3367],[2.5825,11.3383],[2.5841,11.3398],[2.5857,11.3414],[2.5875,11.343],[2.5893,11.3446],[2.5912,11.3462],[2.5933,11.3478],[2.5954,11.3495],[2.5976,11.3511],[2.5999,11.3527],[2.6023,11.3543],[2.6048,11.3559],[2.6074,11.3575],[2.6101,11.3591],[2.6898,12.9929],[2.7496,13.0527],[-1.2154,12.3554],[-1.2154,11.7178],[-1.2552,11.6779],[-1.2552,11.0005],[-1.2951,10.9606],[-1.3748,9.4065],[-1.4146,9.3667],[-1.4146,9.0479],[-1.4744,8.9881],[-3.5266,7.6731],[-3.5221,7.766],[-3.5168,7.8582],[-3.5108,7.9495],[-3.504,8.0402],[-3.4964,8.13],[-3.488,8.2192],[-3.4788,8.3075],[-3.4689,8.3951],[-3.4582,8.482],[-3.4467,8.5681],[-3.4344,8.6534],[-3.4214,8.738],[-3.4076,8.8219],[-3.393,8.9049],[-3.3776,8.9873],[-3.3615,9.0688],[-3.3446,9.1496],[-3.3269,9.2297],[-3.3084,9.309],[-3.2892,9.3876],[-3.2691,9.4653],[-3.2483,9.5424],[-3.2268,9.6187],[-3.2044,9.6942],[-3.1813,9.769],[-3.1574,9.843],[-3.1327,9.9163],[-3.1072,9.9888],[-3.081,10.0605],[-3.054,10.1315],[-3.0262,10.2018],[-2.9976,10.2713],[-2.9683,10.34],[-2.9382,10.408],[-2.9073,10.4752],[-2.8756,10.5417],[-2.8432,10.6074],[-2.8099,10.6723],[-2.7759,10.7366],[-2.7412,10.8],[-2.7056,10.8627],[-2.6693,10.9246],[-2.6322,10.9858],[-2.5943,11.0463],[-2.5556,11.1059],[-2.5162,11.1649],[-2.476,11.223],[-2.435,11.2804],[-2.3932,11.3371],[-2.3507,11.393],[-2.3074,11.4481],[-2.2633,11.5025],[-2.2184,11.5562],[-2.1728,11.609],[-2.1264,11.6612],[-2.0792,11.7125],[-2.0312,11.7632],[-1.9824,11.813],[-1.9329,11.8621],[-1.8826,11.9105],[-1.8315,11.9581],[-1.7797,12.0049],[-1.7271,12.051],[-1.6736,12.0963],[-1.2752,12.3753],[5.6386,11.9967],[5.5589,10.7614],[5.5191,10.7216],[5.4792,9.9644],[5.3995,9.5659],[5.3995,9.2073],[5.3964,9.2054],[5.3934,9.2034],[5.3905,9.2013],[5.3877,9.1992],[5.3849,9.197],[5.3822,9.1947],[5.3796,9.1923],[5.3771,9.1899],[5.3746,9.1873],[5.3723,9.1847],[5.37,9.182],[5.3678,9.1793],[5.3656,9.1764],[5.3635,9.1735],[5.3616,9.1705],[5.3597,9.1675],[5.3578,9.1643],[5.3561,9.1611],[5.3544,9.1578],[5.3528,9.1544],[5.3513,9.1509],[5.3498,9.1474],[5.3485,9.1438],[5.3472,9.1401],[5.346,9.1363],[5.3449,9.1324],[5.3438,9.1285],[5.3428,9.1245],[5.3419,9.1204],[5.3411,9.1162],[5.3404,9.112],[5.3397,9.1077],[5.3391,9.1033],[5.3386,9.0988],[5.3382,9.0943],[5.3379,9.0896],[5.3376,9.0849],[5.3374,9.0801],[5.3373,9.0753],[5.3372,9.0703],[5.3373,9.0653],[5.3374,9.0602],[5.3376,9.055],[5.3379,9.0498],[5.3382,9.0444],[5.3386,9.039],[5.3391,9.0335],[5.3397,9.028],[5.3404,9.0223],[5.3411,9.0166],[5.3419,9.0108],[5.3428,9.0049],[5.3438,8.999],[5.3449,8.993],[5.346,8.9868],[5.3472,8.9807],[5.3485,8.9744],[5.3498,8.9681],[5.3513,8.9616],[5.3528,8.9551],[5.3544,8.9486],[5.3561,8.9419],[5.3578,8.9352],[5.3597,8.9284],[5.2999,8.8686],[5.2538,8.8505],[5.2079,8.8323],[5.162,8.8141],[5.1162,8.7957],[5.0705,8.7773],[5.0248,8.7588],[4.9793,8.7403],[4.9338,8.7216],[4.8884,8.7029],[4.843,8.6841],[4.7978,8.6653],[4.7526,8.6463],[4.7075,8.6273],[4.6625,8.6082],[4.6175,8.589],[4.5726,8.5697],[4.5279,8.5504],[4.4831,8.531],[4.4385,8.5115],[4.3939,8.4919],[4.3495,8.4722],[4.3051,8.4525],[4.2607,8.4327],[4.2165,8.4128],[4.1723,8.3929],[4.1282,8.3728],[4.0842,8.3527],[4.0403,8.3325],[3.9964,8.3122],[3.9527,8.2919],[3.909,8.2714],[3.8653,8.2509],[3.8218,8.2303],[3.7783,8.2097],[3.7349,8.1889],[3.6916,8.1681],[3.6484,8.1472],[3.6052,8.1262],[3.5621,8.1052],[3.5191,8.0841],[3.4762,8.0629],[3.4334,8.0416],[3.3906,8.0202],[3.3479,7.9988],[3.3053,7.9772],[3.2628,7.9556],[3.2203,7.934],[3.1779,7.9122],[3.1356,7.8904],[3.0934,7.8685],[3.0513,7.8465],[3.0092,7.8244],[2.9672,7.8023],[2.9253,7.7801],[2.8835,7.7578],[2.8417,7.7354],[2.8,7.7129],[2.7584,7.6904],[2.7169,7.6678],[2.6755,7.6451],[2.6341,7.6223],[2.5928,7.5995],[2.5516,7.5766],[2.5105,7.5536],[2.2116,7.4739],[2.2137,7.4795],[2.2157,7.4852],[2.2177,7.491],[2.2197,7.4968],[2.2216,7.5028],[2.2235,7.5087],[2.2253,7.5148],[2.227,7.5209],[2.2288,7.5271],[2.2304,7.5333],[2.2321,7.5396],[2.2336,7.546],[2.2352,7.5525],[2.2367,7.559],[2.2381,7.5656],[2.2395,7.5723],[2.2408,7.579],[2.2421,7.5858],[2.2434,7.5926],[2.2446,7.5996],[2.2458,7.6066],[2.2469,7.6136],[2.2479,7.6208],[2.249,7.628],[2.2499,7.6353],[2.2509,7.6426],[2.2517,7.65],[2.2526,7.6575],[2.2534,7.665],[2.2541,7.6726],[2.2548,7.6803],[2.2554,7.6881],[2.256,7.6959],[2.2566,7.7038],[2.2571,7.7117],[2.2576,7.7197],[2.258,7.7278],[2.2583,7.736],[2.2587,7.7442],[2.2589,7.7525],[2.2592,7.7609],[2.2593,7.7693],[2.2595,7.7778],[2.2595,7.7864],[2.2596,7.795],[2.2596,7.8037],[2.2595,7.8125],[2.2594,7.8213],[2.2593,7.8302],[2.2591,7.8392],[2.2588,7.8482],[2.2586,7.8573],[2.2582,7.8665],[2.2578,7.8758],[2.2574,7.8851],[2.2569,7.8945],[2.2564,7.9039],[2.2558,7.9134],[2.2552,7.923],[2.2546,7.9327],[2.2539,7.9424],[2.2531,7.9522],[2.2523,7.9621],[2.2515,7.972],[2.2913,8.0118],[2.2913,8.3306],[2.3312,8.3705],[2.371,9.0479],[2.4108,9.0878],[2.5304,10.6419],[2.63,10.7415],[2.6735,10.764],[2.7171,10.7864],[2.7607,10.8088],[2.8044,10.8311],[2.8481,10.8534],[2.8919,10.8756],[2.9358,10.8977],[2.9797,10.9198],[3.0237,10.9418],[3.0677,10.9638],[3.1118,10.9856],[3.156,11.0075],[3.2003,11.0292],[3.2446,11.0509],[3.2889,11.0726],[3.3333,11.0941],[3.3778,11.1157],[3.4224,11.1371],[3.467,11.1585],[3.5117,11.1798],[3.5564,11.2011],[3.6012,11.2223],[3.6461,11.2434],[3.691,11.2645],[3.736,11.2855],[3.781,11.3065],[3.8261,11.3273],[3.8713,11.3482],[3.9165,11.3689],[3.9618,11.3896],[4.0072,11.4103],[4.0526,11.4309],[4.0981,11.4514],[4.1436,11.4718],[4.1893,11.4922],[4.2349,11.5126],[4.2807,11.5328],[4.3265,11.553],[4.3723,11.5732],[4.4182,11.5932],[4.4642,11.6133],[4.5103,11.6332],[4.5564,11.6531],[4.6025,11.6729],[4.6488,11.6927],[4.6951,11.7124],[4.7414,11.7321],[4.7878,11.7516],[4.8343,11.7712],[4.8808,11.7906],[4.9275,11.81],[4.9741,11.8293],[5.0208,11.8486],[5.0676,11.8678],[5.1145,11.887],[5.1614,11.9061],[5.2084,11.9251],[5.2554,11.944],[5.3025,11.9629],[5.3497,11.9818],[5.3969,12.0005],[5.4442,12.0193],[5.4916,12.0379],[5.539,12.0565],[6.1521,11.7186],[6.1872,11.6992],[6.2222,11.6798],[6.257,11.6601],[6.2917,11.6403],[6.3262,11.6203],[6.3606,11.6001],[6.3949,11.5797],[6.4289,11.5592],[6.4629,11.5385],[6.4966,11.5176],[6.5302,11.4966],[6.5637,11.4754],[6.597,11.454],[6.6302,11.4324],[6.6632,11.4107],[6.6961,11.3888],[6.7288,11.3667],[6.7613,11.3444],[6.7937,11.322],[6.826,11.2994],[6.8581,11.2766],[6.8901,11.2537],[6.9219,11.2306],[6.9535,11.2073],[6.985,11.1838],[7.0163,11.1602],[7.0475,11.1363],[7.0786,11.1124],[7.1095,11.0882],[7.1402,11.0639],[7.1708,11.0393],[7.2012,11.0147],[7.2315,10.9898],[7.2616,10.9648],[7.2916,10.9396],[7.3214,10.9142],[7.3511,10.8887],[7.3806,10.8629],[7.41,10.8371],[7.4392,10.811],[7.4683,10.7847],[7.4972,10.7583],[7.526,10.7317],[7.5546,10.705],[7.583,10.6781],[7.6113,10.651],[7.6395,10.6237],[7.6675,10.5962],[7.6954,10.5686],[7.7231,10.5408],[7.7506,10.5128],[7.778,10.4847],[7.8053,10.4564],[7.8324,10.4279],[7.8593,10.3992],[7.8861,10.3704],[7.9127,10.3414],[7.9392,10.3122],[7.9655,10.2828],[7.9917,10.2533],[8.0178,10.2236],[8.0436,10.1937],[8.0694,10.1637],[8.1491,9.9844],[5.8378,9.1077],[5.8777,9.2472],[5.8777,9.6058],[5.9175,9.6456],[5.9972,10.7216],[6.0371,10.7614],[6.0371,11.1599],[6.0769,11.1997],[6.0769,11.5982],[6.1168,11.7377],[2.0522,10.4028],[2.0522,10.1238],[2.0124,10.084],[2.0124,9.7253],[1.9725,9.6855],[1.9725,9.3268],[1.9327,9.287],[1.9327,8.9284],[1.8928,8.8885],[1.7733,7.4938],[1.7702,7.4919],[1.7672,7.4899],[1.7643,7.4879],[1.7614,7.4857],[1.7587,7.4835],[1.756,7.4812],[1.7534,7.4788],[1.7509,7.4764],[1.7484,7.4738],[1.746,7.4712],[1.7437,7.4685],[1.7415,7.4658],[1.7394,7.4629],[1.7373,7.46],[1.7353,7.457],[1.7334,7.454],[1.7316,7.4508],[1.7298,7.4476],[1.7282,7.4443],[1.7266,7.4409],[1.7251,7.4374],[1.7236,7.4339],[1.7223,7.4303],[1.721,7.4266],[1.7198,7.4228],[1.7186,7.4189],[1.7176,7.415],[1.7166,7.411],[1.7157,7.4069],[1.7149,7.4027],[1.7142,7.3985],[1.7135,7.3942],[1.7129,7.3898],[1.7124,7.3853],[1.712,7.3808],[1.7116,7.3761],[1.7114,7.3714],[1.7112,7.3666],[1.711,7.3618],[1.711,7.3568],[1.711,7.3518],[1.7112,7.3467],[1.7114,7.3415],[1.7116,7.3363],[1.712,7.3309],[1.7124,7.3255],[1.7129,7.3201],[1.7135,7.3145],[1.7142,7.3088],[1.7149,7.3031],[1.7157,7.2973],[1.7166,7.2914],[1.7176,7.2855],[1.7186,7.2795],[1.7198,7.2734],[1.721,7.2672],[1.7223,7.2609],[1.7236,7.2546],[1.7251,7.2481],[1.7266,7.2416],[1.7282,7.2351],[1.7298,7.2284],[1.7316,7.2217],[1.7334,7.2149],[1.6338,7.1152],[0.518,6.5574],[-1.2951,5.5213],[-1.2154,6.4179],[-1.1755,6.4577],[-1.1357,7.175],[-1.0958,7.2149],[-0.9763,8.7291],[-0.8767,8.8287],[1.9924,10.4227],[8.5476,9.5261],[8.5691,9.4972],[8.5903,9.4679],[8.6112,9.4384],[8.6318,9.4086],[8.6521,9.3784],[8.672,9.348],[8.6917,9.3172],[8.7111,9.2861],[8.7301,9.2547],[8.7489,9.2231],[8.7673,9.1911],[8.7854,9.1588],[8.8033,9.1262],[8.8208,9.0932],[8.838,9.06],[8.8549,9.0265],[8.8715,8.9926],[8.8878,8.9585],[8.9038,8.9241],[8.9194,8.8893],[8.9348,8.8542],[8.9498,8.8188],[8.9646,8.7832],[8.979,8.7472],[8.9932,8.7109],[9.007,8.6743],[9.0205,8.6374],[9.0337,8.6001],[9.0466,8.5626],[9.0592,8.5248],[9.0715,8.4866],[9.0835,8.4482],[9.0952,8.4094],[9.1066,8.3704],[9.1176,8.331],[9.1284,8.2913],[9.1388,8.2513],[9.149,8.211],[9.1588,8.1704],[9.1683,8.1295],[9.1775,8.0883],[9.1865,8.0468],[9.1951,8.0049],[9.2033,7.9628],[9.2113,7.9204],[9.219,7.8776],[9.2264,7.8345],[9.2335,7.7912],[9.2402,7.7475],[9.2467,7.7035],[9.2528,7.6592],[9.2586,7.6146],[9.2642,7.5697],[9.2694,7.5245],[9.2743,7.479],[9.2789,7.4332],[9.2832,7.387],[9.2872,7.3406],[9.2909,7.2938],[9.2943,7.2468],[9.2973,7.1994],[9.3001,7.1517],[9.3025,7.1038],[9.3047,7.0555],[9.2051,6.8363],[7.4916,6.2386],[5.3198,5.3619],[5.4792,6.2585],[5.4792,6.5374],[5.5987,7.0953],[5.6386,7.6134],[5.6784,7.6532],[5.7581,8.5299],[5.8179,8.5896],[8.4081,9.5859],[-1.5108,8.4286],[-1.5075,8.427],[-1.5042,8.4254],[-1.5011,8.4238],[-1.4981,8.4222],[-1.4951,8.4206],[-1.4923,8.419],[-1.4895,8.4174],[-1.4869,8.4158],[-1.4843,8.4142],[-1.4819,8.4126],[-1.4796,8.411],[-1.4773,8.4094],[-1.4752,8.4078],[-1.4731,8.4062],[-1.4712,8.4046],[-1.4693,8.403],[-1.4676,8.4014],[-1.4659,8.3998],[-1.4644,8.3983],[-1.4629,8.3967],[-1.4616,8.3951],[-1.4603,8.3935],[-1.4591,8.392],[-1.4581,8.3904],[-1.4571,8.3888],[-1.4563,8.3873],[-1.4555,8.3857],[-1.4549,8.3841],[-1.4543,8.3826],[-1.4538,8.381],[-1.4535,8.3794],[-1.4532,8.3779],[-1.4531,8.3763],[-1.453,8.3748],[-1.453,8.3732],[-1.4532,8.3717],[-1.4534,8.3701],[-1.4537,8.3686],[-1.4542,8.3671],[-1.4547,8.3655],[-1.4553,8.364],[-1.4561,8.3624],[-1.4569,8.3609],[-1.4578,8.3594],[-1.4588,8.3578],[-1.46,8.3563],[-1.4612,8.3548],[-1.4625,8.3533],[-1.464,8.3517],[-1.4655,8.3502],[-1.4671,8.3487],[-1.4688,8.3472],[-1.4706,8.3457],[-1.4726,8.3442],[-1.4746,8.3426],[-1.4767,8.3411],[-1.4789,8.3396],[-1.4812,8.3381],[-1.4837,8.3366],[-1.4862,8.3351],[-1.4888,8.3336],[-1.4915,8.3321],[-1.4943,8.3306],[-1.5342,7.4938],[-1.574,7.454],[-1.574,7.0953],[-1.6139,7.0555],[-1.6537,6.3382],[-1.7334,6.0194],[-1.7733,5.342],[-1.8131,5.1826],[-1.9127,5.083],[-1.9481,5.0635],[-1.9833,5.044],[-2.0185,5.0243],[-2.0536,5.0047],[-2.0886,4.9849],[-2.1236,4.9651],[-2.1585,4.9452],[-2.1933,4.9252],[-2.228,4.9051],[-2.2627,4.885],[-2.2973,4.8648],[-2.3318,4.8445],[-2.3662,4.8242],[-2.4006,4.8037],[-2.4349,4.7832],[-2.4691,4.7627],[-2.5033,4.742],[-2.5373,4.7213],[-2.5713,4.7005],[-2.6053,4.6796],[-2.6391,4.6587],[-2.6729,4.6377],[-2.7066,4.6166],[-2.7402,4.5954],[-2.7738,4.5742],[-2.8073,4.5529],[-2.8407,4.5315],[-2.874,4.51],[-2.9073,4.4885],[-2.9404,4.4669],[-2.9736,4.4452],[-3.0066,4.4235],[-3.0396,4.4016],[-3.0724,4.3797],[-3.1053,4.3578],[-3.138,4.3357],[-3.1707,4.3136],[-3.2033,4.2914],[-3.2358,4.2691],[-3.2682,4.2468],[-3.3006,4.2243],[-3.3329,4.2018],[-3.3651,4.1793],[-3.3973,4.1566],[-3.4293,4.1339],[-3.4613,4.1111],[-3.4933,4.0883],[-3.5251,4.0653],[-3.5569,4.0423],[-3.5886,4.0192],[-3.6202,3.9961],[-3.6518,3.9728],[-3.6833,3.9495],[-3.7147,3.9261],[-3.746,3.9027],[-3.7773,3.8792],[-3.8085,3.8555],[-3.8396,3.8319],[-3.8706,3.8081],[-3.9016,3.7843],[-3.9325,3.7604],[-3.9633,3.7364],[-3.9941,3.7124],[-4.0247,3.6883],[-4.1642,3.6484],[-3.8056,5.2224],[-3.686,6.2186],[-3.6462,6.2585],[-3.6462,6.5374],[-3.6063,6.5773],[-3.6063,6.9758],[-3.427,7.1551],[-1.5143,8.4303],[5.1844,8.312],[5.1884,8.3133],[5.1923,8.3145],[5.1961,8.3156],[5.1999,8.3167],[5.2036,8.3176],[5.2071,8.3185],[5.2107,8.3194],[5.2141,8.3201],[5.2174,8.3208],[5.2207,8.3214],[5.2239,8.322],[5.227,8.3224],[5.2301,8.3228],[5.233,8.3232],[5.2359,8.3234],[5.2387,8.3236],[5.2414,8.3237],[5.244,8.3237],[5.2466,8.3237],[5.249,8.3236],[5.2514,8.3234],[5.2538,8.3232],[5.256,8.3228],[5.2581,8.3225],[5.2602,8.322],[5.2622,8.3214],[5.2641,8.3208],[5.266,8.3202],[5.2677,8.3194],[5.2694,8.3186],[5.271,8.3177],[5.2725,8.3167],[5.2739,8.3157],[5.2753,8.3146],[5.2766,8.3134],[5.2778,8.3121],[5.2789,8.3108],[5.2799,8.3094],[5.2809,8.3079],[5.2818,8.3064],[5.2826,8.3047],[5.2833,8.303],[5.2839,8.3013],[5.2845,8.2995],[5.285,8.2975],[5.2854,8.2956],[5.2857,8.2935],[5.2859,8.2914],[5.2861,8.2892],[5.2862,8.2869],[5.2862,8.2846],[5.2861,8.2822],[5.2859,8.2797],[5.2857,8.2772],[5.2854,8.2745],[5.285,8.2718],[5.2845,8.2691],[5.2839,8.2662],[5.2833,8.2633],[5.2826,8.2603],[5.2818,8.2573],[5.2809,8.2541],[5.28,8.2509],[5.2401,8.2111],[5.1206,7.0555],[5.001,6.5374],[5.001,6.2983],[4.9612,6.2585],[4.8018,5.083],[4.7532,5.0632],[4.7048,5.0434],[4.6564,5.0235],[4.6081,5.0036],[4.5598,4.9835],[4.5116,4.9634],[4.4635,4.9431],[4.4154,4.9228],[4.3674,4.9024],[4.3195,4.8819],[4.2717,4.8613],[4.2239,4.8407],[4.1762,4.8199],[4.1285,4.7991],[4.081,4.7782],[4.0334,4.7572],[3.986,4.7361],[3.9386,4.7149],[3.8913,4.6937],[3.8441,4.6723],[3.7969,4.6509],[3.7498,4.6294],[3.7028,4.6078],[3.6558,4.5861],[3.6089,4.5643],[3.5621,4.5425],[3.5153,4.5205],[3.4686,4.4985],[3.422,4.4764],[3.3754,4.4542],[3.329,4.4319],[3.2825,4.4095],[3.2362,4.3871],[3.1899,4.3645],[3.1437,4.3419],[3.0975,4.3192],[3.0515,4.2964],[3.0054,4.2735],[2.9595,4.2505],[2.9136,4.2275],[2.8678,4.2043],[2.8221,4.1811],[2.7764,4.1578],[2.7308,4.1344],[2.6853,4.1109],[2.6398,4.0873],[2.5944,4.0637],[2.5491,4.0399],[2.5038,4.0161],[2.4586,3.9922],[2.4135,3.9682],[2.3684,3.9441],[2.3234,3.9199],[2.2785,3.8957],[2.2337,3.8713],[2.1889,3.8469],[2.1442,3.8224],[2.0995,3.7978],[2.0549,3.7731],[2.0104,3.7483],[1.966,3.7235],[1.9216,3.6985],[1.8773,3.6735],[1.833,3.6484],[1.6936,3.6484],[1.7733,3.9871],[1.7733,4.2262],[1.9725,5.3818],[1.9725,5.6608],[2.0921,6.2186],[2.1319,6.8164],[2.2315,6.916],[5.1803,8.3107],[1.5593,6.5589],[1.5643,6.5604],[1.5693,6.5617],[1.5741,6.5629],[1.5788,6.564],[1.5834,6.5649],[1.5879,6.5658],[1.5923,6.5665],[1.5965,6.5671],[1.6007,6.5676],[1.6047,6.568],[1.6086,6.5682],[1.6124,6.5684],[1.6161,6.5684],[1.6196,6.5683],[1.6231,6.5681],[1.6264,6.5677],[1.6296,6.5673],[1.6328,6.5667],[1.6357,6.566],[1.6386,6.5652],[1.6414,6.5643],[1.644,6.5632],[1.6466,6.562],[1.649,6.5607],[1.6513,6.5593],[1.6535,6.5578],[1.6555,6.5562],[1.6575,6.5544],[1.6593,6.5525],[1.6611,6.5505],[1.6627,6.5484],[1.6642,6.5462],[1.6656,6.5438],[1.6668,6.5413],[1.668,6.5387],[1.669,6.536],[1.67,6.5332],[1.6708,6.5302],[1.6715,6.5272],[1.672,6.524],[1.6725,6.5207],[1.6729,6.5172],[1.6731,6.5137],[1.6732,6.51],[1.6732,6.5063],[1.6731,6.5024],[1.6729,6.4983],[1.6726,6.4942],[1.6721,6.4899],[1.6715,6.4856],[1.6709,6.4811],[1.6701,6.4765],[1.6692,6.4717],[1.6681,6.4669],[1.667,6.4619],[1.6657,6.4568],[1.6644,6.4516],[1.6629,6.4463],[1.6613,6.4408],[1.6596,6.4353],[1.6577,6.4296],[1.6558,6.4238],[1.6537,6.4179],[1.6139,6.378],[1.6139,6.0593],[1.574,6.0194],[1.2552,3.5886],[1.2154,3.3894],[1.1158,3.2898],[-1.8131,1.656],[-1.6139,3.23],[-1.574,3.2698],[-1.4943,4.1067],[-1.4545,4.1465],[-1.4146,4.7044],[-1.3748,4.8638],[-1.2752,4.9634],[1.5541,6.5574],[9.1288,6.3189],[9.1322,6.3195],[9.1355,6.3199],[9.1387,6.3202],[9.1418,6.3204],[9.1448,6.3204],[9.1478,6.3203],[9.1507,6.3201],[9.1535,6.3197],[9.1562,6.3192],[9.1589,6.3186],[9.1615,6.3178],[9.1639,6.317],[9.1664,6.316],[9.1687,6.3148],[9.1709,6.3135],[9.1731,6.3121],[9.1752,6.3106],[9.1772,6.3089],[9.1791,6.3071],[9.181,6.3052],[9.1828,6.3032],[9.1845,6.301],[9.1861,6.2987],[9.1876,6.2962],[9.1891,6.2936],[9.1904,6.2909],[9.1917,6.2881],[9.1929,6.2851],[9.1941,6.282],[9.1951,6.2788],[9.1961,6.2754],[9.197,6.2719],[9.1978,6.2683],[9.1985,6.2646],[9.1992,6.2607],[9.1998,6.2567],[9.2003,6.2525],[9.2007,6.2483],[9.201,6.2439],[9.2013,6.2393],[9.2014,6.2347],[9.2015,6.2299],[9.2016,6.2249],[9.2015,6.2199],[9.2014,6.2147],[9.2011,6.2094],[9.2008,6.204],[9.2004,6.1984],[9.2,6.1927],[9.1994,6.1868],[9.1988,6.1809],[9.1981,6.1748],[9.1973,6.1685],[9.1965,6.1622],[9.1955,6.1557],[9.1945,6.1491],[9.1934,6.1423],[9.1922,6.1355],[9.191,6.1284],[9.1896,6.1213],[9.1882,6.114],[9.1867,6.1066],[9.1851,6.0991],[9.1709,6.0436],[9.1563,5.9885],[9.1414,5.9337],[9.1261,5.8792],[9.1104,5.8251],[9.0944,5.7714],[9.0781,5.718],[9.0614,5.6649],[9.0444,5.6122],[9.027,5.5599],[9.0093,5.5079],[8.9912,5.4562],[8.9728,5.4049],[8.954,5.3539],[8.9349,5.3033],[8.9154,5.2531],[8.8956,5.2031],[8.8754,5.1536],[8.8549,5.1044],[8.834,5.0555],[8.8128,5.007],[8.7913,4.9588],[8.7694,4.911],[8.7471,4.8635],[8.7245,4.8163],[8.7016,4.7696],[8.6783,4.7231],[8.6546,4.677],[8.6306,4.6313],[8.6063,4.5859],[8.5816,4.5409],[8.5565,4.4962],[8.5311,4.4518],[8.5054,4.4078],[8.4793,4.3642],[8.4529,4.3209],[8.4261,4.2779],[8.399,4.2353],[8.3715,4.1931],[8.3436,4.1512],[8.3155,4.1096],[8.2869,4.0684],[8.2581,4.0276],[8.2288,3.987],[8.1993,3.9469],[8.1694,3.9071],[8.1391,3.8676],[8.1085,3.8285],[8.0775,3.7897],[8.0462,3.7513],[8.0145,3.7132],[7.9825,3.6755],[7.9502,3.6381],[7.9175,3.6011],[7.8844,3.5644],[7.851,3.528],[7.8173,3.4921],[7.7832,3.4564],[7.7487,3.4211],[7.7139,3.3862],[7.6788,3.3516],[7.6433,3.3174],[7.6074,3.2835],[7.5713,3.2499],[7.0532,2.8116],[5.4593,1.8154],[4.6025,1.4966],[5.001,3.4691],[5.1604,4.5848],[5.26,4.804],[7.372,5.6807],[9.1254,6.3183],[-1.9489,4.5261],[-1.9453,4.5271],[-1.9418,4.528],[-1.9383,4.5287],[-1.935,4.5294],[-1.9317,4.5299],[-1.9286,4.5304],[-1.9255,4.5307],[-1.9225,4.531],[-1.9196,4.5311],[-1.9168,4.5312],[-1.9141,4.5311],[-1.9114,4.5309],[-1.9089,4.5307],[-1.9064,4.5303],[-1.904,4.5298],[-1.9017,4.5292],[-1.8995,4.5285],[-1.8974,4.5278],[-1.8954,4.5269],[-1.8934,4.5259],[-1.8916,4.5248],[-1.8898,4.5236],[-1.8881,4.5223],[-1.8866,4.5209],[-1.8851,4.5194],[-1.8836,4.5177],[-1.8823,4.516],[-1.8811,4.5142],[-1.8799,4.5123],[-1.8788,4.5103],[-1.8779,4.5081],[-1.877,4.5059],[-1.8762,4.5036],[-1.8755,4.5011],[-1.8748,4.4986],[-1.8743,4.496],[-1.8738,4.4932],[-1.8735,4.4904],[-1.8732,4.4874],[-1.873,4.4843],[-1.8729,4.4812],[-1.8729,4.4779],[-1.873,4.4746],[-1.8731,4.4711],[-1.8734,4.4675],[-1.8737,4.4638],[-1.8741,4.4601],[-1.8746,4.4562],[-1.8752,4.4522],[-1.8759,4.4481],[-1.8767,4.4439],[-1.8776,4.4396],[-1.8785,4.4352],[-1.8796,4.4307],[-1.8807,4.4261],[-1.8819,4.4214],[-1.8832,4.4166],[-1.8846,4.4117],[-1.886,4.4067],[-1.8876,4.4016],[-1.8893,4.3964],[-1.891,4.391],[-1.8928,4.3856],[-1.9327,4.3458],[-2.2913,1.5962],[-2.371,1.2575],[-3.3871,0.6597],[-5.2202,-0.6154],[-5.2401,-0.3564],[-5.1206,0.2413],[-5.0409,1.0782],[-5.0285,1.1046],[-5.0161,1.1311],[-5.0039,1.1576],[-4.9917,1.1842],[-4.9796,1.2109],[-4.9676,1.2376],[-4.9556,1.2644],[-4.9437,1.2913],[-4.9319,1.3182],[-4.9202,1.3452],[-4.9086,1.3722],[-4.897,1.3993],[-4.8856,1.4265],[-4.8742,1.4537],[-4.8628,1.4809],[-4.8516,1.5083],[-4.8404,1.5357],[-4.8293,1.5631],[-4.8183,1.5906],[-4.8074,1.6182],[-4.7965,1.6459],[-4.7857,1.6735],[-4.775,1.7013],[-4.7644,1.7291],[-4.7539,1.757],[-4.7434,1.7849],[-4.733,1.8129],[-4.7227,1.841],[-4.7125,1.8691],[-4.7023,1.8973],[-4.6922,1.9255],[-4.6822,1.9538],[-4.6723,1.9822],[-4.6625,2.0106],[-4.6527,2.0391],[-4.643,2.0676],[-4.6334,2.0962],[-4.6239,2.1249],[-4.6144,2.1536],[-4.605,2.1824],[-4.5957,2.2112],[-4.5865,2.2401],[-4.5774,2.2691],[-4.5683,2.2981],[-4.5593,2.3272],[-4.5504,2.3564],[-4.5416,2.3856],[-4.5328,2.4148],[-4.5241,2.4442],[-4.5155,2.4735],[-4.507,2.503],[-4.4985,2.5325],[-4.4902,2.5621],[-4.4819,2.5917],[-4.4737,2.6214],[-4.4655,2.6511],[-4.4575,2.6809],[-4.4495,2.7108],[-4.4416,2.7407],[-4.4338,2.7707],[-4.4261,2.8008],[-4.4184,2.8309],[-4.4108,2.861],[-4.4033,2.8913],[-1.9526,4.5251],[4.6822,4.3458],[4.1243,1.3969],[4.0247,1.2176],[1.056,-0.2169],[1.6139,3.0507],[4.6623,4.5251],[1.0398,2.7329],[1.0434,2.7339],[1.0469,2.7348],[1.0503,2.7355],[1.0537,2.7362],[1.0569,2.7367],[1.0601,2.7372],[1.0632,2.7375],[1.0661,2.7378],[1.069,2.7379],[1.0719,2.738],[1.0746,2.7379],[1.0772,2.7377],[1.0798,2.7375],[1.0823,2.7371],[1.0846,2.7366],[1.0869,2.736],[1.0891,2.7353],[1.0912,2.7346],[1.0933,2.7337],[1.0952,2.7327],[1.0971,2.7316],[1.0988,2.7304],[1.1005,2.7291],[1.1021,2.7277],[1.1036,2.7262],[1.105,2.7246],[1.1063,2.7228],[1.1076,2.721],[1.1087,2.7191],[1.1098,2.7171],[1.1108,2.7149],[1.1117,2.7127],[1.1125,2.7104],[1.1132,2.7079],[1.1138,2.7054],[1.1144,2.7028],[1.1148,2.7],[1.1152,2.6972],[1.1155,2.6942],[1.1156,2.6912],[1.1157,2.688],[1.1158,2.6847],[1.1157,2.6814],[1.1155,2.6779],[1.1153,2.6743],[1.1149,2.6707],[1.1145,2.6669],[1.114,2.663],[1.1134,2.659],[1.1127,2.6549],[1.112,2.6507],[1.1111,2.6464],[1.1101,2.642],[1.1091,2.6375],[1.108,2.6329],[1.1068,2.6282],[1.1055,2.6234],[1.1041,2.6185],[1.1026,2.6135],[1.1011,2.6084],[1.0994,2.6032],[1.0977,2.5978],[1.0958,2.5924],[0.8567,1.3969],[0.8169,0.9586],[0.7372,0.7195],[0.7372,0.5203],[0.6177,0.0819],[0.6177,-0.1173],[0.538,-0.4759],[0.4782,-0.5357],[-0.9564,-1.2928],[-2.4507,-2.1695],[-1.9725,0.6],[-1.9725,0.8391],[-1.8729,1.0582],[1.0361,2.7319],[-2.4507,0.6],[-2.4905,0.5601],[-2.4905,0.321],[-2.9687,-2.4285],[-3.1082,-2.6079],[-3.9849,-3.1259],[-5.8179,-4.401],[-5.9175,-4.401],[-5.5589,-2.5481],[-5.3995,-1.3925],[-5.26,-1.2131],[-2.5503,0.6199],[3.2324,0.3422],[3.237,0.3433],[3.2415,0.3443],[3.2459,0.3453],[3.2502,0.3462],[3.2544,0.347],[3.2584,0.3478],[3.2624,0.3484],[3.2663,0.349],[3.2701,0.3495],[3.2738,0.3499],[3.2774,0.3503],[3.2809,0.3506],[3.2843,0.3508],[3.2876,0.3509],[3.2908,0.3509],[3.2939,0.3509],[3.2968,0.3508],[3.2997,0.3506],[3.3025,0.3503],[3.3052,0.3499],[3.3078,0.3495],[3.3103,0.349],[3.3127,0.3484],[3.315,0.3478],[3.3172,0.347],[3.3193,0.3462],[3.3213,0.3453],[3.3233,0.3443],[3.3251,0.3433],[3.3268,0.3422],[3.3284,0.341],[3.3299,0.3397],[3.3313,0.3383],[3.3326,0.3369],[3.3338,0.3354],[3.3349,0.3338],[3.3359,0.3321],[3.3368,0.3303],[3.3376,0.3285],[3.3384,0.3266],[3.339,0.3246],[3.3395,0.3225],[3.3399,0.3204],[3.3402,0.3182],[3.3404,0.3159],[3.3406,0.3135],[3.3406,0.3111],[3.3405,0.3085],[3.3403,0.3059],[3.34,0.3032],[3.3397,0.3005],[3.3392,0.2976],[3.3386,0.2947],[3.3379,0.2917],[3.3371,0.2887],[3.3363,0.2855],[3.3353,0.2823],[3.3342,0.279],[3.3331,0.2756],[3.3318,0.2721],[3.3304,0.2686],[3.3289,0.265],[3.3274,0.2613],[3.2985,0.2408],[3.2698,0.2202],[3.2411,0.1995],[3.2125,0.1787],[3.184,0.1578],[3.1556,0.1367],[3.1272,0.1156],[3.099,0.0943],[3.0708,0.073],[3.0427,0.0515],[3.0148,0.0299],[2.9869,0.0082],[2.959,-0.0136],[2.9313,-0.0355],[2.9036,-0.0576],[2.8761,-0.0797],[2.8486,-0.1019],[2.8212,-0.1243],[2.7939,-0.1468],[2.7667,-0.1694],[2.7396,-0.1921],[2.7125,-0.2149],[2.6855,-0.2378],[2.6587,-0.2608],[2.6319,-0.284],[2.6052,-0.3072],[2.5785,-0.3306],[2.552,-0.354],[2.5256,-0.3776],[2.4992,-0.4013],[2.4729,-0.4251],[2.4467,-0.449],[2.4206,-0.4731],[2.3946,-0.4972],[2.3686,-0.5215],[2.3428,-0.5458],[2.317,-0.5703],[2.2913,-0.5949],[2.2658,-0.6196],[2.2402,-0.6444],[2.2148,-0.6693],[2.1895,-0.6943],[2.1642,-0.7194],[2.1391,-0.7447],[2.114,-0.77],[2.089,-0.7955],[2.0641,-0.8211],[2.0393,-0.8468],[2.0145,-0.8726],[1.9899,-0.8985],[1.9653,-0.9245],[1.9408,-0.9507],[1.9164,-0.9769],[1.8921,-1.0033],[1.8679,-1.0297],[1.8438,-1.0563],[1.8197,-1.083],[1.7957,-1.1098],[1.7718,-1.1367],[1.7481,-1.1637],[1.7243,-1.1909],[1.7007,-1.2181],[1.6772,-1.2455],[1.6537,-1.2729],[0.6974,-2.3488],[0.6974,-2.4086],[0.6933,-2.4102],[0.6893,-2.4116],[0.6854,-2.4129],[0.6816,-2.4141],[0.6779,-2.4152],[0.6743,-2.4162],[0.6708,-2.417],[0.6673,-2.4178],[0.664,-2.4184],[0.6607,-2.4189],[0.6576,-2.4192],[0.6545,-2.4195],[0.6515,-2.4196],[0.6486,-2.4196],[0.6458,-2.4195],[0.6431,-2.4193],[0.6404,-2.419],[0.6379,-2.4185],[0.6354,-2.4179],[0.6331,-2.4172],[0.6308,-2.4164],[0.6286,-2.4155],[0.6265,-2.4144],[0.6245,-2.4133],[0.6226,-2.412],[0.6208,-2.4106],[0.619,-2.4091],[0.6174,-2.4074],[0.6158,-2.4056],[0.6143,-2.4038],[0.613,-2.4018],[0.6117,-2.3996],[0.6105,-2.3974],[0.6094,-2.395],[0.6083,-2.3926],[0.6074,-2.39],[0.6066,-2.3873],[0.6058,-2.3844],[0.6052,-2.3815],[0.6046,-2.3784],[0.6041,-2.3752],[0.6037,-2.3719],[0.6034,-2.3685],[0.6032,-2.3649],[0.6031,-2.3613],[0.603,-2.3575],[0.6031,-2.3536],[0.6032,-2.3496],[0.6034,-2.3454],[0.6038,-2.3412],[0.6042,-2.3368],[0.6047,-2.3323],[0.6053,-2.3277],[0.6059,-2.323],[0.6067,-2.3181],[0.6076,-2.3132],[0.6085,-2.3081],[0.6096,-2.3029],[0.6107,-2.2975],[0.6119,-2.2921],[0.6132,-2.2865],[0.6146,-2.2809],[0.6161,-2.2751],[0.6177,-2.2691],[0.6239,-2.2498],[0.63,-2.2304],[0.6361,-2.211],[0.6421,-2.1915],[0.6481,-2.1719],[0.654,-2.1523],[0.6598,-2.1326],[0.6656,-2.1129],[0.6713,-2.0931],[0.677,-2.0732],[0.6826,-2.0533],[0.6882,-2.0333],[0.6937,-2.0133],[0.6991,-1.9932],[0.7045,-1.973],[0.7098,-1.9528],[0.7151,-1.9326],[0.7203,-1.9122],[0.7254,-1.8919],[0.7305,-1.8714],[0.7355,-1.8509],[0.7405,-1.8304],[0.7454,-1.8098],[0.7503,-1.7891],[0.7551,-1.7684],[0.7598,-1.7476],[0.7645,-1.7267],[0.7691,-1.7058],[0.7737,-1.6848],[0.7782,-1.6638],[0.7826,-1.6427],[0.787,-1.6216],[0.7913,-1.6004],[0.7956,-1.5791],[0.7998,-1.5578],[0.804,-1.5364],[0.8081,-1.515],[0.8121,-1.4935],[0.8161,-1.472],[0.82,-1.4504],[0.8239,-1.4287],[0.8277,-1.407],[0.8314,-1.3852],[0.8351,-1.3634],[0.8387,-1.3415],[0.8423,-1.3195],[0.8458,-1.2975],[0.8493,-1.2754],[0.8527,-1.2533],[0.856,-1.2311],[0.8593,-1.2088],[0.8625,-1.1865],[0.8657,-1.1642],[0.8688,-1.1417],[0.8718,-1.1193],[0.8748,-1.0967],[0.8777,-1.0741],[0.8806,-1.0515],[0.8834,-1.0287],[0.8862,-1.006],[0.8889,-0.9831],[0.8915,-0.9602],[0.8941,-0.9373],[0.8966,-0.9143],[0.9962,-0.7748],[3.2277,0.341],[0.323,-1.1324],[0.3271,-1.1315],[0.331,-1.1306],[0.3349,-1.1299],[0.3387,-1.1294],[0.3423,-1.1289],[0.3459,-1.1286],[0.3494,-1.1284],[0.3527,-1.1283],[0.356,-1.1284],[0.3591,-1.1285],[0.3622,-1.1288],[0.3651,-1.1292],[0.368,-1.1298],[0.3707,-1.1304],[0.3733,-1.1312],[0.3759,-1.1321],[0.3783,-1.1331],[0.3806,-1.1343],[0.3828,-1.1355],[0.385,-1.1369],[0.387,-1.1385],[0.3889,-1.1401],[0.3907,-1.1419],[0.3924,-1.1437],[0.394,-1.1457],[0.3955,-1.1479],[0.3969,-1.1501],[0.3982,-1.1525],[0.3994,-1.155],[0.4005,-1.1576],[0.4015,-1.1603],[0.4024,-1.1632],[0.4031,-1.1662],[0.4038,-1.1693],[0.4044,-1.1725],[0.4049,-1.1759],[0.4052,-1.1794],[0.4055,-1.183],[0.4056,-1.1867],[0.4057,-1.1905],[0.4057,-1.1945],[0.4055,-1.1986],[0.4053,-1.2028],[0.4049,-1.2071],[0.4044,-1.2116],[0.4039,-1.2162],[0.4032,-1.2209],[0.4025,-1.2257],[0.4016,-1.2306],[0.4006,-1.2357],[0.3995,-1.2409],[0.3984,-1.2462],[0.3971,-1.2517],[0.3957,-1.2572],[0.3942,-1.2629],[0.3926,-1.2687],[0.3909,-1.2746],[0.3891,-1.2807],[0.3872,-1.2868],[0.3852,-1.2931],[0.3831,-1.2996],[0.3809,-1.3061],[0.3786,-1.3128],[-0.0199,-3.2255],[-1.315,-4.8792],[-1.3454,-4.8937],[-1.3757,-4.9082],[-1.4059,-4.9228],[-1.4361,-4.9374],[-1.4663,-4.9521],[-1.4963,-4.9669],[-1.5264,-4.9817],[-1.5563,-4.9965],[-1.5863,-5.0114],[-1.6161,-5.0264],[-1.6459,-5.0414],[-1.6757,-5.0565],[-1.7054,-5.0716],[-1.7351,-5.0868],[-1.7646,-5.102],[-1.7942,-5.1173],[-1.8237,-5.1327],[-1.8531,-5.1481],[-1.8825,-5.1635],[-1.9118,-5.179],[-1.9411,-5.1946],[-1.9703,-5.2102],[-1.9994,-5.2259],[-2.0286,-5.2416],[-2.0576,-5.2574],[-2.0866,-5.2732],[-2.1155,-5.2891],[-2.1444,-5.3051],[-2.1733,-5.321],[-2.202,-5.3371],[-2.2308,-5.3532],[-2.2594,-5.3694],[-2.288,-5.3856],[-2.3166,-5.4019],[-2.3451,-5.4182],[-2.3736,-5.4346],[-2.4019,-5.451],[-2.4303,-5.4675],[-2.4586,-5.484],[-2.4868,-5.5006],[-2.515,-5.5173],[-2.5431,-5.534],[-2.5712,-5.5507],[-2.5992,-5.5676],[-2.6272,-5.5844],[-2.6551,-5.6013],[-2.6829,-5.6183],[-2.7107,-5.6354],[-2.7385,-5.6524],[-2.7661,-5.6696],[-2.7938,-5.6868],[-2.8214,-5.704],[-2.8489,-5.7213],[-2.8763,-5.7387],[-2.9038,-5.7561],[-2.9311,-5.7736],[-2.9584,-5.7911],[-2.9857,-5.8087],[-3.0129,-5.8263],[-3.04,-5.844],[-3.0671,-5.8617],[-3.0941,-5.8795],[-3.1211,-5.8974],[-3.1481,-5.9153],[-3.1514,-5.9138],[-3.1546,-5.9123],[-3.1577,-5.9108],[-3.1607,-5.9093],[-3.1637,-5.9078],[-3.1665,-5.9063],[-3.1693,-5.9048],[-3.1719,-5.9033],[-3.1744,-5.9018],[-3.1769,-5.9003],[-3.1793,-5.8987],[-3.1815,-5.8972],[-3.1837,-5.8957],[-3.1858,-5.8942],[-3.1878,-5.8927],[-3.1896,-5.8911],[-3.1914,-5.8896],[-3.1931,-5.8881],[-3.1947,-5.8866],[-3.1962,-5.885],[-3.1976,-5.8835],[-3.1989,-5.882],[-3.2002,-5.8804],[-3.2013,-5.8789],[-3.2023,-5.8773],[-3.2032,-5.8758],[-3.2041,-5.8742],[-3.2048,-5.8727],[-3.2055,-5.8711],[-3.206,-5.8696],[-3.2065,-5.868],[-3.2068,-5.8665],[-3.2071,-5.8649],[-3.2073,-5.8634],[-3.2073,-5.8618],[-3.2073,-5.8602],[-3.2072,-5.8587],[-3.207,-5.8571],[-3.2067,-5.8555],[-3.2063,-5.854],[-3.2058,-5.8524],[-3.2052,-5.8508],[-3.2045,-5.8492],[-3.2037,-5.8477],[-3.2028,-5.8461],[-3.2018,-5.8445],[-3.2008,-5.8429],[-3.1996,-5.8413],[-3.1983,-5.8397],[-3.197,-5.8381],[-3.1955,-5.8366],[-3.194,-5.835],[-3.1923,-5.8334],[-3.1906,-5.8318],[-3.1888,-5.8302],[-3.1868,-5.8286],[-3.1848,-5.827],[-3.1827,-5.8254],[-3.1805,-5.8237],[-3.1782,-5.8221],[-3.1758,-5.8205],[-3.1733,-5.8189],[-3.1707,-5.8173],[-3.168,-5.8157],[-2.8093,-3.8631],[-2.6101,-3.0661],[-2.6101,-2.8669],[-2.4706,-2.7274],[0.3188,-1.1334],[-5.9731,-1.77],[-5.9691,-1.769],[-5.9651,-1.7682],[-5.9612,-1.7675],[-5.9574,-1.767],[-5.9538,-1.7665],[-5.9502,-1.7662],[-5.9467,-1.766],[-5.9434,-1.7659],[-5.9401,-1.7659],[-5.937,-1.7661],[-5.9339,-1.7664],[-5.931,-1.7668],[-5.9281,-1.7674],[-5.9254,-1.768],[-5.9228,-1.7688],[-5.9202,-1.7697],[-5.9178,-1.7707],[-5.9155,-1.7719],[-5.9133,-1.7731],[-5.9111,-1.7745],[-5.9091,-1.776],[-5.9072,-1.7777],[-5.9054,-1.7794],[-5.9037,-1.7813],[-5.9021,-1.7833],[-5.9006,-1.7854],[-5.8992,-1.7877],[-5.8979,-1.7901],[-5.8967,-1.7926],[-5.8956,-1.7952],[-5.8946,-1.7979],[-5.8937,-1.8008],[-5.893,-1.8038],[-5.8923,-1.8069],[-5.8917,-1.8101],[-5.8912,-1.8135],[-5.8909,-1.8169],[-5.8906,-1.8205],[-5.8905,-1.8243],[-5.8904,-1.8281],[-5.8904,-1.8321],[-5.8906,-1.8362],[-5.8908,-1.8404],[-5.8912,-1.8447],[-5.8917,-1.8492],[-5.8922,-1.8537],[-5.8929,-1.8584],[-5.8936,-1.8633],[-5.8945,-1.8682],[-5.8955,-1.8733],[-5.8966,-1.8785],[-5.8978,-1.8838],[-5.899,-1.8892],[-5.9004,-1.8948],[-5.9019,-1.9005],[-5.9035,-1.9063],[-5.9052,-1.9122],[-5.907,-1.9183],[-5.9089,-1.9244],[-5.9109,-1.9307],[-5.913,-1.9371],[-5.9152,-1.9437],[-5.9175,-1.9503],[-6.1566,-3.1458],[-6.1965,-3.5841],[-6.2762,-3.8232],[-6.2762,-4.0225],[-6.3957,-4.4608],[-6.3957,-4.6601],[-6.4356,-4.8195],[-6.5352,-4.9191],[-7.9299,-5.995],[-8.1092,-6.0747],[-7.9897,-5.5766],[-7.631,-4.7398],[-6.5153,-2.3887],[-6.2563,-1.9703],[-5.9773,-1.771],[-3.1281,-3.2255],[-3.7259,-6.2142],[-3.8653,-6.3536],[-3.91,-6.3787],[-3.9546,-6.4038],[-3.9991,-6.4291],[-4.0436,-6.4543],[-4.0879,-6.4797],[-4.1322,-6.5051],[-4.1765,-6.5307],[-4.2206,-6.5562],[-4.2647,-6.5819],[-4.3087,-6.6076],[-4.3526,-6.6334],[-4.3965,-6.6593],[-4.4402,-6.6853],[-4.484,-6.7113],[-4.5276,-6.7374],[-4.5711,-6.7636],[-4.6146,-6.7898],[-4.658,-6.8162],[-4.7014,-6.8425],[-4.7446,-6.869],[-4.7878,-6.8956],[-4.831,-6.9222],[-4.874,-6.9489],[-4.917,-6.9756],[-4.9599,-7.0025],[-5.0027,-7.0294],[-5.0454,-7.0564],[-5.0881,-7.0835],[-5.1307,-7.1106],[-5.1732,-7.1378],[-5.2157,-7.1651],[-5.258,-7.1924],[-5.3003,-7.2199],[-5.3426,-7.2474],[-5.3847,-7.275],[-5.4268,-7.3026],[-5.4688,-7.3304],[-5.5107,-7.3582],[-5.5526,-7.386],[-5.5944,-7.414],[-5.6361,-7.442],[-5.6777,-7.4701],[-5.7193,-7.4983],[-5.7608,-7.5265],[-5.8022,-7.5548],[-5.8435,-7.5832],[-5.8848,-7.6117],[-5.926,-7.6402],[-5.9671,-7.6689],[-6.0082,-7.6976],[-6.0491,-7.7263],[-6.09,-7.7552],[-6.1309,-7.7841],[-6.1716,-7.8131],[-6.2123,-7.8421],[-6.2529,-7.8712],[-6.2934,-7.9005],[-6.3339,-7.9297],[-6.3743,-7.9591],[-6.4146,-7.9885],[-6.4548,-8.018],[-6.4949,-8.0476],[-6.535,-8.0773],[-6.575,-8.107],[-6.595,-7.8878],[-6.2363,-6.254],[-6.0769,-5.2179],[-5.9375,-5.0386],[-3.2277,-3.2056],[-6.595,-5.6961],[-7.113,-8.3062],[-7.1284,-8.3003],[-7.1437,-8.2943],[-7.1589,-8.2881],[-7.174,-8.2819],[-7.189,-8.2755],[-7.204,-8.269],[-7.2188,-8.2623],[-7.2335,-8.2556],[-7.2482,-8.2487],[-7.2627,-8.2418],[-7.2772,-8.2347],[-7.2916,-8.2274],[-7.3058,-8.2201],[-7.32,-8.2127],[-7.3341,-8.2051],[-7.3481,-8.1974],[-7.362,-8.1896],[-7.3758,-8.1816],[-7.3895,-8.1736],[-7.4031,-8.1654],[-7.4167,-8.1571],[-7.4301,-8.1487],[-7.4434,-8.1402],[-7.4567,-8.1316],[-7.4698,-8.1228],[-7.4829,-8.1139],[-7.4959,-8.1049],[-7.5087,-8.0958],[-7.5215,-8.0866],[-7.5342,-8.0772],[-7.5468,-8.0678],[-7.5593,-8.0582],[-7.5717,-8.0485],[-7.584,-8.0386],[-7.5962,-8.0287],[-7.6084,-8.0186],[-7.6204,-8.0084],[-7.6323,-7.9981],[-7.6442,-7.9877],[-7.6559,-7.9772],[-7.6676,-7.9665],[-7.6792,-7.9557],[-7.6906,-7.9448],[-7.702,-7.9338],[-7.7133,-7.9227],[-7.7245,-7.9114],[-7.7356,-7.9],[-7.7466,-7.8886],[-7.7575,-7.8769],[-7.7683,-7.8652],[-7.7791,-7.8534],[-7.7897,-7.8414],[-7.8002,-7.8293],[-7.8107,-7.8171],[-7.821,-7.8048],[-7.8313,-7.7924],[-7.8414,-7.7798],[-7.8515,-7.7671],[-7.8615,-7.7543],[-7.8714,-7.7414],[-7.8812,-7.7284],[-7.8909,-7.7152],[-7.9005,-7.702],[-7.91,-7.6886],[-8.1491,-7.1307],[-8.1889,-6.8119],[-6.6149,-5.5567],[-1.9725,-5.8157],[-1.9951,-5.8491],[-2.0177,-5.8825],[-2.0404,-5.9159],[-2.0632,-5.9492],[-2.086,-5.9824],[-2.1089,-6.0155],[-2.1319,-6.0486],[-2.1549,-6.0816],[-2.178,-6.1146],[-2.2011,-6.1474],[-2.2243,-6.1803],[-2.2476,-6.213],[-2.271,-6.2457],[-2.2944,-6.2784],[-2.3178,-6.3109],[-2.3414,-6.3434],[-2.365,-6.3759],[-2.3886,-6.4082],[-2.4124,-6.4405],[-2.4361,-6.4728],[-2.46,-6.505],[-2.4839,-6.5371],[-2.5079,-6.5691],[-2.532,-6.6011],[-2.5561,-6.6331],[-2.5802,-6.6649],[-2.6045,-6.6967],[-2.6288,-6.7284],[-2.6532,-6.7601],[-2.6776,-6.7917],[-2.7021,-6.8233],[-2.7267,-6.8547],[-2.7513,-6.8861],[-2.776,-6.9175],[-2.8007,-6.9488],[-2.8255,-6.98],[-2.8504,-7.0111],[-2.8754,-7.0422],[-2.9004,-7.0733],[-2.9255,-7.1042],[-2.9506,-7.1351],[-2.9758,-7.166],[-3.0011,-7.1967],[-3.0264,-7.2274],[-3.0518,-7.2581],[-3.0773,-7.2886],[-3.1028,-7.3192],[-3.1284,-7.3496],[-3.154,-7.38],[-3.1797,-7.4103],[-3.2055,-7.4406],[-3.2314,-7.4708],[-3.2573,-7.5009],[-3.2833,-7.5309],[-3.3093,-7.5609],[-3.3354,-7.5909],[-3.3616,-7.6207],[-3.3878,-7.6506],[-3.4141,-7.6803],[-3.4405,-7.71],[-3.4669,-7.7396],[-3.4934,-7.7691],[-3.5199,-7.7986],[-3.5465,-7.828],[-3.5497,-7.829],[-3.5529,-7.8299],[-3.5559,-7.8307],[-3.5589,-7.8314],[-3.5618,-7.832],[-3.5647,-7.8326],[-3.5674,-7.8331],[-3.5701,-7.8335],[-3.5728,-7.8338],[-3.5753,-7.834],[-3.5778,-7.8342],[-3.5802,-7.8342],[-3.5825,-7.8342],[-3.5848,-7.8342],[-3.587,-7.834],[-3.5891,-7.8338],[-3.5912,-7.8334],[-3.5932,-7.833],[-3.5951,-7.8326],[-3.5969,-7.832],[-3.5987,-7.8314],[-3.6003,-7.8306],[-3.602,-7.8298],[-3.6035,-7.829],[-3.605,-7.828],[-3.6064,-7.827],[-3.6077,-7.8259],[-3.609,-7.8247],[-3.6102,-7.8234],[-3.6113,-7.822],[-3.6123,-7.8206],[-3.6133,-7.8191],[-3.6142,-7.8175],[-3.615,-7.8158],[-3.6158,-7.814],[-3.6164,-7.8122],[-3.6171,-7.8103],[-3.6176,-7.8083],[-3.6181,-7.8062],[-3.6185,-7.8041],[-3.6188,-7.8018],[-3.619,-7.7995],[-3.6192,-7.7971],[-3.6193,-7.7946],[-3.6193,-7.7921],[-3.6193,-7.7895],[-3.6192,-7.7867],[-3.619,-7.784],[-3.6188,-7.7811],[-3.6184,-7.7781],[-3.618,-7.7751],[-3.6176,-7.772],[-3.617,-7.7688],[-3.6164,-7.7655],[-3.6157,-7.7622],[-3.615,-7.7587],[-3.6141,-7.7552],[-3.6132,-7.7516],[-3.6123,-7.748],[-3.6112,-7.7442],[-3.6101,-7.7404],[-3.6089,-7.7365],[-3.6076,-7.7325],[-3.6063,-7.7284],[-3.3274,-6.513],[-1.9924,-5.7559],[-3.9416,-6.913],[-3.9383,-6.9145],[-3.935,-6.916],[-3.9319,-6.9175],[-3.9288,-6.919],[-3.9259,-6.9205],[-3.923,-6.922],[-3.9203,-6.9235],[-3.9177,-6.925],[-3.9151,-6.9266],[-3.9127,-6.9281],[-3.9103,-6.9296],[-3.9081,-6.9311],[-3.9059,-6.9326],[-3.9039,-6.9341],[-3.9019,-6.9357],[-3.9001,-6.9372],[-3.8983,-6.9387],[-3.8967,-6.9403],[-3.8951,-6.9418],[-3.8937,-6.9433],[-3.8923,-6.9449],[-3.8911,-6.9464],[-3.8899,-6.9479],[-3.8889,-6.9495],[-3.8879,-6.951],[-3.8871,-6.9526],[-3.8863,-6.9541],[-3.8856,-6.9557],[-3.8851,-6.9572],[-3.8846,-6.9588],[-3.8843,-6.9603],[-3.884,-6.9619],[-3.8838,-6.9634],[-3.8838,-6.965],[-3.8838,-6.9666],[-3.8839,-6.9681],[-3.8842,-6.9697],[-3.8845,-6.9713],[-3.8849,-6.9728],[-3.8855,-6.9744],[-3.8861,-6.976],[-3.8868,-6.9776],[-3.8877,-6.9791],[-3.8886,-6.9807],[-3.8896,-6.9823],[-3.8908,-6.9839],[-3.892,-6.9855],[-3.8933,-6.9871],[-3.8947,-6.9887],[-3.8963,-6.9903],[-3.8979,-6.9919],[-3.8996,-6.9934],[-3.9014,-6.995],[-3.9033,-6.9966],[-3.9054,-6.9982],[-3.9075,-6.9999],[-3.9097,-7.0015],[-3.912,-7.0031],[-3.9144,-7.0047],[-3.917,-7.0063],[-3.9196,-7.0079],[-3.9223,-7.0095],[-3.9251,-7.0111],[-4.204,-8.366],[-4.3435,-8.5055],[-5.0608,-8.8641],[-5.6187,-8.9438],[-6.2164,-8.8243],[-6.5153,-8.7047],[-6.3758,-8.5055],[-3.945,-6.9115]],paths = [[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,575,576,577,578,579,580,581,582,583,584,585,586,587,588,589,590,591,592,593,594,595,596,597,598,599,600,601,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,641,642,643,644,645,646,647,648,649,650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699,700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734],[735,736,737,738,739,740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757],[758,759,760,761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,827],[828,829,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,846,847,848,849,850,851,852,853,854,855,856,857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,874,875,876,877,878,879,880,881,882,883,884,885,886,887,888,889,890,891,892,893,894,895,896,897,898,899,900,901,902],[903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,925,926,927,928,929,930,931,932,933,934,935,936,937,938,939,940,941,942,943,944,945,946,947,948,949,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,975,976,977,978,979,980,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1018,1019,1020,1021,1022,1023,1024,1025,1026,1027,1028,1029,1030,1031,1032,1033,1034,1035,1036,1037,1038,1039,1040,1041,1042,1043,1044,1045,1046,1047,1048,1049,1050,1051,1052,1053,1054,1055,1056,1057,1058,1059,1060,1061,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1072,1073,1074,1075,1076,1077,1078,1079,1080,1081,1082,1083,1084,1085,1086,1087,1088,1089,1090,1091,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1103,1104,1105,1106,1107,1108,1109,1110,1111,1112,1113,1114,1115,1116,1117,1118,1119,1120,1121,1122,1123,1124,1125,1126,1127,1128,1129,1130,1131,1132,1133,1134,1135,1136,1137,1138,1139,1140,1141,1142,1143,1144,1145,1146,1147,1148,1149,1150,1151,1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162,1163,1164,1165,1166,1167,1168,1169,1170,1171,1172,1173],[1174,1175,1176,1177,1178,1179,1180,1181,1182,1183,1184,1185,1186,1187,1188,1189,1190,1191,1192,1193,1194,1195,1196,1197,1198,1199,1200,1201,1202,1203,1204,1205,1206,1207,1208,1209,1210,1211,1212,1213,1214,1215,1216,1217,1218,1219,1220,1221,1222,1223,1224,1225,1226,1227,1228,1229,1230,1231,1232,1233,1234,1235,1236,1237,1238,1239,1240,1241,1242,1243,1244,1245,1246,1247,1248],[1249,1250,1251,1252,1253,1254,1255,1256,1257,1258,1259,1260,1261,1262,1263,1264,1265,1266,1267,1268,1269,1270,1271,1272,1273,1274,1275,1276,1277,1278,1279,1280,1281,1282,1283,1284,1285,1286,1287,1288,1289,1290,1291,1292,1293,1294,1295,1296,1297,1298,1299,1300,1301,1302,1303,1304,1305,1306,1307,1308,1309,1310,1311,1312,1313,1314,1315,1316,1317,1318,1319,1320,1321,1322,1323,1324,1325,1326,1327,1328,1329,1330,1331,1332],[1333,1334,1335,1336,1337,1338,1339,1340,1341,1342,1343,1344,1345,1346,1347,1348,1349,1350,1351,1352,1353,1354,1355,1356,1357,1358,1359,1360,1361,1362,1363,1364,1365,1366,1367,1368,1369,1370,1371,1372,1373,1374,1375,1376,1377,1378,1379,1380,1381,1382,1383,1384,1385,1386,1387,1388,1389,1390,1391,1392,1393,1394,1395,1396,1397,1398,1399,1400,1401,1402,1403,1404,1405,1406,1407,1408],[1409,1410,1411,1412,1413,1414,1415,1416,1417,1418,1419,1420,1421,1422,1423,1424,1425,1426,1427,1428,1429,1430,1431,1432,1433,1434,1435,1436,1437,1438,1439,1440,1441,1442,1443,1444,1445,1446,1447,1448,1449,1450,1451,1452,1453,1454,1455,1456,1457,1458,1459,1460,1461,1462,1463,1464,1465,1466,1467,1468,1469,1470,1471,1472,1473,1474,1475,1476,1477,1478,1479,1480,1481,1482,1483,1484,1485,1486,1487,1488,1489,1490,1491,1492,1493,1494,1495,1496,1497,1498,1499,1500,1501,1502,1503,1504,1505,1506,1507,1508,1509,1510,1511,1512,1513,1514,1515,1516,1517,1518,1519,1520,1521,1522,1523,1524,1525,1526,1527,1528,1529,1530,1531,1532,1533,1534,1535,1536,1537,1538,1539,1540,1541,1542,1543,1544,1545,1546,1547,1548,1549,1550,1551,1552,1553,1554],[1555,1556,1557,1558,1559,1560,1561,1562,1563,1564,1565,1566,1567,1568,1569,1570,1571,1572,1573,1574,1575,1576,1577,1578,1579,1580,1581,1582,1583,1584,1585,1586,1587,1588,1589,1590,1591,1592,1593,1594,1595,1596,1597,1598,1599,1600,1601,1602,1603,1604,1605,1606,1607,1608,1609,1610,1611,1612,1613,1614,1615,1616,1617,1618,1619,1620,1621,1622,1623,1624,1625,1626,1627,1628,1629,1630,1631,1632,1633,1634,1635,1636,1637,1638,1639,1640,1641,1642,1643,1644,1645,1646,1647,1648,1649,1650,1651,1652,1653,1654,1655,1656,1657,1658,1659,1660,1661,1662,1663,1664,1665,1666,1667,1668,1669,1670,1671,1672,1673,1674,1675,1676,1677,1678,1679,1680,1681,1682,1683,1684,1685,1686,1687,1688,1689,1690,1691,1692,1693,1694,1695,1696,1697],[1698,1699,1700,1701,1702,1703,1704,1705,1706,1707,1708,1709,1710,1711,1712,1713,1714,1715,1716,1717,1718,1719,1720,1721,1722,1723,1724,1725,1726,1727,1728,1729,1730,1731,1732,1733,1734,1735,1736,1737,1738,1739,1740,1741,1742,1743,1744,1745,1746,1747,1748,1749,1750,1751,1752,1753,1754,1755,1756,1757,1758,1759,1760,1761,1762,1763,1764,1765,1766,1767,1768,1769,1770,1771,1772,1773,1774,1775,1776],[1777,1778,1779,1780,1781,1782,1783,1784,1785,1786,1787,1788,1789,1790,1791,1792,1793,1794,1795,1796,1797,1798,1799,1800,1801,1802,1803,1804,1805,1806,1807,1808,1809,1810,1811,1812,1813,1814,1815,1816,1817,1818,1819,1820,1821,1822,1823,1824,1825,1826,1827,1828,1829,1830,1831,1832,1833,1834,1835,1836,1837,1838,1839,1840,1841,1842,1843,1844,1845,1846,1847,1848,1849,1850,1851,1852,1853,1854,1855,1856,1857,1858,1859,1860,1861,1862,1863,1864,1865,1866,1867,1868,1869,1870,1871,1872,1873,1874,1875,1876,1877,1878,1879,1880,1881,1882,1883,1884,1885,1886,1887,1888,1889,1890,1891,1892,1893,1894,1895,1896,1897,1898,1899,1900,1901,1902,1903,1904,1905,1906,1907,1908,1909,1910,1911,1912],[1913,1914,1915,1916,1917,1918,1919,1920,1921,1922,1923,1924,1925,1926,1927,1928,1929,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1940,1941,1942,1943,1944,1945,1946,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1957,1958,1959,1960,1961,1962,1963,1964,1965,1966,1967,1968,1969,1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031,2032,2033,2034,2035,2036,2037,2038,2039,2040,2041,2042,2043,2044,2045,2046,2047,2048,2049],[2050,2051,2052,2053,2054,2055],[2056,2057,2058,2059,2060,2061,2062,2063,2064,2065,2066,2067,2068,2069,2070,2071,2072,2073,2074,2075,2076,2077,2078,2079,2080,2081,2082,2083,2084,2085,2086,2087,2088,2089,2090,2091,2092,2093,2094,2095,2096,2097,2098,2099,2100,2101,2102,2103,2104,2105,2106,2107,2108,2109,2110,2111,2112,2113,2114,2115,2116,2117,2118,2119,2120,2121,2122,2123,2124,2125,2126,2127,2128,2129,2130,2131,2132,2133],[2134,2135,2136,2137,2138,2139,2140,2141,2142,2143,2144,2145],[2146,2147,2148,2149,2150,2151,2152,2153,2154,2155,2156,2157,2158,2159,2160,2161,2162,2163,2164,2165,2166,2167,2168,2169,2170,2171,2172,2173,2174,2175,2176,2177,2178,2179,2180,2181,2182,2183,2184,2185,2186,2187,2188,2189,2190,2191,2192,2193,2194,2195,2196,2197,2198,2199,2200,2201,2202,2203,2204,2205,2206,2207,2208,2209,2210,2211,2212,2213,2214,2215,2216,2217,2218,2219,2220,2221,2222,2223,2224,2225,2226,2227,2228,2229,2230,2231,2232,2233,2234,2235,2236,2237,2238,2239,2240,2241,2242,2243,2244,2245,2246,2247,2248,2249,2250,2251,2252,2253,2254,2255,2256,2257,2258,2259,2260,2261,2262,2263,2264,2265,2266,2267,2268,2269,2270,2271,2272,2273,2274,2275,2276,2277,2278,2279,2280,2281,2282,2283,2284,2285,2286,2287,2288,2289,2290,2291,2292,2293,2294,2295,2296,2297,2298,2299,2300,2301,2302,2303,2304,2305,2306,2307,2308,2309,2310,2311,2312,2313,2314,2315,2316,2317,2318,2319,2320,2321,2322,2323,2324,2325,2326,2327,2328,2329,2330,2331,2332,2333,2334,2335,2336,2337,2338,2339,2340,2341,2342,2343,2344,2345,2346,2347,2348,2349,2350,2351,2352,2353,2354,2355,2356,2357,2358,2359,2360,2361,2362,2363,2364,2365,2366,2367,2368,2369,2370,2371,2372,2373,2374,2375,2376,2377,2378,2379,2380,2381,2382,2383,2384,2385,2386,2387,2388,2389,2390,2391,2392,2393,2394,2395,2396,2397,2398,2399,2400,2401,2402,2403,2404,2405],[2406,2407,2408,2409,2410,2411,2412,2413,2414,2415,2416,2417,2418,2419,2420,2421,2422,2423,2424,2425,2426,2427,2428,2429,2430,2431,2432,2433,2434,2435,2436,2437,2438,2439,2440,2441,2442,2443,2444,2445,2446,2447,2448,2449,2450,2451,2452,2453,2454,2455,2456,2457,2458,2459,2460,2461,2462,2463,2464,2465,2466,2467,2468,2469,2470,2471,2472,2473,2474,2475,2476,2477,2478,2479,2480,2481,2482,2483,2484,2485,2486,2487,2488,2489,2490,2491,2492,2493,2494,2495,2496,2497,2498,2499,2500,2501,2502,2503,2504,2505,2506,2507,2508,2509,2510,2511,2512,2513,2514,2515,2516,2517,2518,2519,2520,2521,2522,2523,2524,2525,2526,2527,2528,2529,2530,2531,2532,2533,2534,2535,2536,2537,2538,2539,2540,2541,2542,2543,2544,2545,2546,2547,2548,2549,2550,2551,2552,2553,2554,2555,2556,2557,2558,2559,2560,2561,2562,2563,2564,2565,2566,2567,2568,2569,2570,2571,2572,2573,2574,2575,2576,2577,2578,2579,2580,2581,2582,2583,2584,2585,2586,2587,2588,2589,2590,2591,2592,2593,2594,2595,2596,2597,2598,2599,2600,2601,2602,2603,2604],[2605,2606,2607,2608,2609,2610,2611,2612,2613,2614,2615,2616,2617,2618,2619,2620,2621,2622,2623,2624,2625,2626,2627,2628,2629,2630,2631,2632,2633,2634,2635,2636,2637,2638,2639,2640,2641,2642,2643,2644,2645,2646,2647,2648,2649,2650,2651,2652,2653,2654,2655,2656,2657,2658,2659,2660,2661,2662,2663,2664,2665,2666,2667,2668,2669,2670,2671,2672,2673,2674,2675,2676,2677,2678,2679,2680,2681,2682,2683],[2684,2685,2686,2687,2688,2689,2690,2691,2692,2693,2694,2695,2696,2697,2698,2699,2700,2701,2702,2703,2704,2705,2706,2707,2708,2709,2710,2711,2712,2713,2714,2715,2716,2717,2718,2719,2720,2721,2722,2723,2724,2725,2726,2727,2728,2729,2730,2731,2732,2733,2734,2735,2736,2737,2738,2739,2740,2741,2742,2743,2744,2745,2746,2747,2748,2749,2750,2751,2752,2753,2754,2755],[2756,2757,2758,2759,2760,2761,2762,2763,2764,2765,2766,2767,2768,2769,2770,2771,2772,2773,2774,2775,2776,2777,2778,2779,2780,2781,2782,2783,2784,2785,2786,2787,2788,2789,2790,2791,2792,2793,2794,2795,2796,2797,2798,2799,2800,2801,2802,2803,2804,2805,2806,2807,2808,2809,2810,2811,2812,2813,2814,2815,2816,2817,2818,2819,2820,2821,2822,2823,2824],[2825,2826,2827,2828,2829,2830,2831,2832,2833,2834,2835,2836,2837,2838,2839,2840,2841,2842,2843,2844,2845,2846,2847,2848,2849,2850,2851,2852,2853,2854,2855,2856,2857,2858,2859,2860,2861,2862,2863,2864,2865,2866,2867,2868,2869,2870,2871,2872,2873,2874,2875,2876,2877,2878,2879,2880,2881,2882,2883,2884,2885,2886,2887,2888,2889,2890,2891,2892,2893,2894,2895,2896,2897,2898,2899,2900,2901,2902,2903,2904,2905,2906,2907,2908,2909,2910,2911,2912,2913,2914,2915,2916,2917,2918,2919,2920,2921,2922,2923,2924,2925,2926,2927,2928,2929,2930,2931,2932,2933,2934,2935,2936,2937,2938,2939,2940,2941,2942,2943,2944,2945,2946,2947,2948,2949,2950,2951,2952,2953,2954,2955],[2956,2957,2958,2959,2960,2961,2962,2963,2964,2965,2966,2967,2968,2969,2970,2971,2972,2973,2974,2975,2976,2977,2978,2979,2980,2981,2982,2983,2984,2985,2986,2987,2988,2989,2990,2991,2992,2993,2994,2995,2996,2997,2998,2999,3000,3001,3002,3003,3004,3005,3006,3007,3008,3009,3010,3011,3012,3013,3014,3015,3016,3017,3018,3019,3020,3021,3022,3023,3024,3025,3026,3027]]);
        polygon(points = [[-8.946,-10.0795],[-9.1453,-11.3945],[-9.3844,-12.311],[-9.3445,-12.5103],[-9.1652,-12.6497],[-8.966,-12.6099],[-8.9438,-12.586],[-8.9215,-12.5622],[-8.8992,-12.5385],[-8.8768,-12.5148],[-8.8543,-12.4912],[-8.8318,-12.4676],[-8.8092,-12.4441],[-8.7865,-12.4207],[-8.7638,-12.3974],[-8.741,-12.3741],[-8.7181,-12.3509],[-8.6952,-12.3277],[-8.6722,-12.3047],[-8.6492,-12.2816],[-8.626,-12.2587],[-8.6028,-12.2358],[-8.5796,-12.213],[-8.5563,-12.1902],[-8.5329,-12.1676],[-8.5094,-12.1449],[-8.4859,-12.1224],[-8.4623,-12.0999],[-8.4387,-12.0775],[-8.4149,-12.0551],[-8.3911,-12.0328],[-8.3673,-12.0106],[-8.3434,-11.9885],[-8.3194,-11.9664],[-8.2953,-11.9443],[-8.2712,-11.9224],[-8.247,-11.9005],[-8.2228,-11.8787],[-8.1985,-11.8569],[-8.1741,-11.8352],[-8.1496,-11.8136],[-8.1251,-11.792],[-8.1005,-11.7705],[-8.0759,-11.7491],[-8.0512,-11.7277],[-8.0264,-11.7064],[-8.0016,-11.6852],[-7.9767,-11.664],[-7.9517,-11.6429],[-7.9266,-11.6219],[-7.9015,-11.601],[-7.8763,-11.5801],[-7.8511,-11.5592],[-7.8258,-11.5385],[-7.8004,-11.5178],[-7.775,-11.4971],[-7.7495,-11.4765],[-7.7239,-11.456],[-7.6983,-11.4356],[-7.6726,-11.4152],[-7.6468,-11.3949],[-7.6209,-11.3747],[-7.595,-11.3545],[-7.5691,-11.3344],[-7.543,-11.3144],[-7.5169,-11.2944],[-7.4908,-11.2745],[-7.4645,-11.2547],[-7.4382,-11.2349],[-7.4119,-11.2152],[-7.1528,-10.9163],[-7.1927,-10.7171],[-8.5276,-9.9002],[-8.8066,-9.9002]]);
    }
}

module v17_pencil_top_boolean_2d() {
    union() {
        polygon(points = [[7.1598,13.204],[7.1598,13.144],[10.3858,10.5482],[11.6762,9.4379],[13.6118,11.7036],[13.8219,12.0937],[13.9419,12.5738],[13.9119,13.144],[13.9081,13.1594],[13.9042,13.1748],[13.9003,13.19],[13.8962,13.2052],[13.8921,13.2203],[13.8878,13.2353],[13.8835,13.2502],[13.8791,13.265],[13.8746,13.2797],[13.87,13.2943],[13.8653,13.3089],[13.8606,13.3234],[13.8557,13.3377],[13.8508,13.352],[13.8457,13.3662],[13.8406,13.3803],[13.8354,13.3944],[13.8301,13.4083],[13.8248,13.4221],[13.8193,13.4359],[13.8137,13.4496],[13.8081,13.4631],[13.8024,13.4766],[13.7966,13.4901],[13.7907,13.5034],[13.7847,13.5166],[13.7786,13.5297],[13.7724,13.5428],[13.7662,13.5558],[13.7598,13.5686],[13.7534,13.5814],[13.7469,13.5941],[13.7402,13.6068],[13.7336,13.6193],[13.7268,13.6317],[13.7199,13.6441],[13.7129,13.6563],[13.7059,13.6685],[13.6988,13.6806],[13.6915,13.6926],[13.6842,13.7045],[13.6768,13.7163],[13.6693,13.7281],[13.6618,13.7397],[13.6541,13.7513],[13.6463,13.7628],[13.6385,13.7742],[13.6306,13.7855],[13.6226,13.7967],[13.6145,13.8078],[13.6063,13.8188],[13.598,13.8298],[13.5896,13.8406],[13.5812,13.8514],[13.5726,13.8621],[13.564,13.8727],[13.5553,13.8832],[13.5465,13.8936],[13.5376,13.9039],[13.5286,13.9142],[13.5195,13.9243],[13.5104,13.9344],[13.5011,13.9444],[13.4918,13.9543],[11.2861,15.7098],[10.7459,15.9199],[10.1758,15.9499],[9.6956,15.8298],[9.2155,15.5597],[7.64,13.7742]]);
        polygon(points = [[10.866,8.2375],[10.926,8.2375],[11.5112,8.9127],[11.5112,8.9727],[11.4378,9.0358],[11.3644,9.0988],[11.2909,9.1618],[11.2174,9.2247],[11.1438,9.2875],[11.0701,9.3503],[10.9964,9.4131],[10.9226,9.4757],[10.8487,9.5383],[10.7748,9.6009],[10.7009,9.6633],[10.6268,9.7258],[10.5527,9.7881],[10.4786,9.8504],[10.4044,9.9127],[10.3301,9.9749],[10.2558,10.037],[10.1814,10.099],[10.107,10.161],[10.0325,10.223],[9.9579,10.2849],[9.8833,10.3467],[9.8086,10.4084],[9.7338,10.4701],[9.659,10.5318],[9.5842,10.5934],[9.5092,10.6549],[9.4342,10.7163],[9.3592,10.7778],[9.2841,10.8391],[9.2089,10.9004],[9.1337,10.9616],[9.0584,11.0228],[8.9831,11.0839],[8.9077,11.1449],[8.8322,11.2059],[8.7567,11.2668],[8.6811,11.3277],[8.6054,11.3885],[8.5297,11.4492],[8.454,11.5099],[8.3781,11.5705],[8.3022,11.6311],[8.2263,11.6916],[8.1503,11.752],[8.0742,11.8124],[7.9981,11.8727],[7.9219,11.933],[7.8456,11.9931],[7.7693,12.0533],[7.693,12.1134],[7.6165,12.1734],[7.5401,12.2333],[7.4635,12.2932],[7.3869,12.3531],[7.3102,12.4129],[7.2335,12.4726],[7.1567,12.5322],[7.0799,12.5918],[7.0029,12.6514],[6.926,12.7109],[6.8489,12.7703],[6.7719,12.8296],[6.6947,12.8889],[6.1095,12.2137],[6.1095,12.1537],[10.7159,8.3575]]);
        polygon(points = [[5.2549,10.9693],[5.3305,10.9101],[5.4061,10.8509],[5.4816,10.7916],[5.5571,10.7322],[5.6326,10.6728],[5.708,10.6134],[5.7833,10.5538],[5.8586,10.4943],[5.9339,10.4346],[6.0091,10.3749],[6.0843,10.3152],[6.1595,10.2554],[6.2346,10.1955],[6.3097,10.1356],[6.3847,10.0756],[6.4597,10.0155],[6.5346,9.9554],[6.6095,9.8953],[6.6843,9.835],[6.7591,9.7747],[6.8339,9.7144],[6.9086,9.654],[6.9833,9.5935],[7.0579,9.533],[7.1325,9.4725],[7.2071,9.4118],[7.2816,9.3511],[7.3561,9.2904],[7.4305,9.2296],[7.5049,9.1687],[7.5792,9.1078],[7.6535,9.0468],[7.7278,8.9857],[7.802,8.9246],[7.8762,8.8635],[7.9503,8.8023],[8.0244,8.741],[8.0984,8.6796],[8.1724,8.6183],[8.2464,8.5568],[8.3203,8.4953],[8.3942,8.4337],[8.468,8.3721],[8.5418,8.3104],[8.6155,8.2486],[8.6892,8.1868],[8.7629,8.125],[8.8365,8.0631],[8.9101,8.0011],[8.9836,7.939],[9.0571,7.8769],[9.1306,7.8148],[9.204,7.7526],[9.2773,7.6903],[9.3507,7.628],[9.4239,7.5656],[9.4972,7.5031],[9.5704,7.4406],[9.6435,7.378],[9.7166,7.3154],[9.7897,7.2527],[9.8627,7.19],[9.9357,7.1272],[9.9957,7.1272],[10.5809,7.8024],[10.5809,7.8624],[7.0248,10.8183],[5.8244,11.7786],[5.7494,11.7786],[5.7494,11.7336],[5.1792,11.1034],[5.1792,11.0284]]);
        polygon(points = [[-11.0857,-8.9427],[-11.0797,-8.9498],[-11.0736,-8.9569],[-11.0675,-8.9639],[-11.0613,-8.9708],[-11.055,-8.9777],[-11.0487,-8.9845],[-11.0424,-8.9913],[-11.036,-8.998],[-11.0295,-9.0047],[-11.023,-9.0113],[-11.0164,-9.0178],[-11.0098,-9.0243],[-11.0031,-9.0308],[-10.9964,-9.0372],[-10.9896,-9.0435],[-10.9827,-9.0498],[-10.9758,-9.0561],[-10.9689,-9.0622],[-10.9619,-9.0684],[-10.9548,-9.0744],[-10.9477,-9.0804],[-10.9406,-9.0864],[-10.9333,-9.0923],[-10.9261,-9.0982],[-10.9187,-9.104],[-10.9113,-9.1097],[-10.9039,-9.1154],[-10.8964,-9.121],[-10.8889,-9.1266],[-10.8813,-9.1321],[-10.8736,-9.1376],[-10.8659,-9.143],[-10.8581,-9.1484],[-10.8503,-9.1537],[-10.8424,-9.159],[-10.8345,-9.1642],[-10.8265,-9.1693],[-10.8185,-9.1744],[-10.8104,-9.1795],[-10.8023,-9.1844],[-10.7941,-9.1894],[-10.7858,-9.1942],[-10.7775,-9.1991],[-10.7692,-9.2038],[-10.7607,-9.2086],[-10.7523,-9.2132],[-10.7437,-9.2178],[-10.7352,-9.2224],[-10.7265,-9.2269],[-10.7179,-9.2313],[-10.7091,-9.2357],[-10.7003,-9.24],[-10.6915,-9.2443],[-10.6826,-9.2485],[-10.6736,-9.2527],[-10.6646,-9.2568],[-10.6555,-9.2609],[-10.6464,-9.2649],[-10.6372,-9.2689],[-10.628,-9.2728],[-10.6187,-9.2766],[-10.6094,-9.2804],[-10.6,-9.2841],[-10.5906,-9.2878],[-10.2605,-9.3178],[-10.2305,-9.3478],[-9.7803,-9.2878],[6.3196,9.5129],[5.1042,10.5182],[4.9392,10.6082],[4.219,9.723],[-11.2958,-8.2825],[-11.2958,-8.4926]]);
        polygon(points = [[-9.5252,-9.5429],[-9.4952,-9.873],[-9.4352,-10.0831],[-9.1951,-10.4732],[-8.76,-10.7883],[-8.4899,-10.8783],[-8.2498,-10.8783],[-8.2198,-10.9083],[-7.7997,-10.8483],[8.2402,7.9224],[6.5747,9.2878],[2.0583,4.0812],[-9.1651,-9.0328],[-9.4952,-9.4229]]);
        polygon(points = [[-7.6047,-12.0637],[-7.6001,-12.0686],[-7.5956,-12.0735],[-7.591,-12.0784],[-7.5863,-12.0832],[-7.5816,-12.088],[-7.5769,-12.0927],[-7.5721,-12.0974],[-7.5673,-12.102],[-7.5624,-12.1066],[-7.5575,-12.1111],[-7.5526,-12.1156],[-7.5476,-12.1201],[-7.5425,-12.1245],[-7.5375,-12.1288],[-7.5324,-12.1331],[-7.5272,-12.1374],[-7.522,-12.1416],[-7.5167,-12.1458],[-7.5115,-12.1499],[-7.5061,-12.154],[-7.5008,-12.158],[-7.4953,-12.162],[-7.4899,-12.166],[-7.4844,-12.1699],[-7.4788,-12.1737],[-7.4733,-12.1776],[-7.4676,-12.1813],[-7.462,-12.185],[-7.4562,-12.1887],[-7.4505,-12.1923],[-7.4447,-12.1959],[-7.4389,-12.1995],[-7.433,-12.203],[-7.427,-12.2064],[-7.4211,-12.2098],[-7.4151,-12.2132],[-7.409,-12.2165],[-7.4029,-12.2198],[-7.3968,-12.223],[-7.3906,-12.2261],[-7.3844,-12.2293],[-7.3781,-12.2324],[-7.3718,-12.2354],[-7.3655,-12.2384],[-7.3591,-12.2413],[-7.3526,-12.2443],[-7.3462,-12.2471],[-7.3396,-12.2499],[-7.3331,-12.2527],[-7.3265,-12.2554],[-7.3198,-12.2581],[-7.3131,-12.2607],[-7.3064,-12.2633],[-7.2996,-12.2658],[-7.2928,-12.2683],[-7.2859,-12.2708],[-7.279,-12.2732],[-7.2721,-12.2756],[-7.2651,-12.2779],[-7.2581,-12.2801],[-7.251,-12.2824],[-7.2439,-12.2845],[-7.2367,-12.2867],[-7.2295,-12.2887],[-6.8394,-12.2887],[9.6206,6.7821],[8.4953,7.6973],[-7.5146,-10.9833],[-7.6947,-11.4635],[-7.6947,-11.8836]]);
        translate([-14.392, -16.400])
            scale([0.60, 0.60])
                translate([14.392, 16.400])
                    polygon(points = [[-13.2814,-12.4388],[-13.3064,-12.5138],[-13.3964,-12.9039],[-14.3867,-16.0249],[-14.3874,-16.0308],[-14.3881,-16.0366],[-14.3887,-16.0424],[-14.3893,-16.0481],[-14.3898,-16.0538],[-14.3903,-16.0594],[-14.3907,-16.0649],[-14.391,-16.0705],[-14.3913,-16.0759],[-14.3916,-16.0813],[-14.3918,-16.0867],[-14.3919,-16.092],[-14.392,-16.0972],[-14.3921,-16.1024],[-14.392,-16.1076],[-14.392,-16.1127],[-14.3919,-16.1177],[-14.3917,-16.1227],[-14.3915,-16.1276],[-14.3912,-16.1325],[-14.3908,-16.1373],[-14.3905,-16.1421],[-14.39,-16.1468],[-14.3895,-16.1515],[-14.389,-16.1561],[-14.3884,-16.1607],[-14.3877,-16.1652],[-14.387,-16.1696],[-14.3863,-16.174],[-14.3855,-16.1784],[-14.3846,-16.1827],[-14.3837,-16.1869],[-14.3828,-16.1911],[-14.3817,-16.1953],[-14.3807,-16.1994],[-14.3795,-16.2034],[-14.3784,-16.2074],[-14.3771,-16.2113],[-14.3759,-16.2152],[-14.3745,-16.219],[-14.3731,-16.2228],[-14.3717,-16.2265],[-14.3702,-16.2302],[-14.3687,-16.2338],[-14.3671,-16.2373],[-14.3654,-16.2408],[-14.3637,-16.2443],[-14.362,-16.2477],[-14.3602,-16.2511],[-14.3583,-16.2544],[-14.3564,-16.2576],[-14.3544,-16.2608],[-14.3524,-16.2639],[-14.3503,-16.267],[-14.3482,-16.27],[-14.346,-16.273],[-14.3438,-16.276],[-14.3415,-16.2788],[-14.3392,-16.2816],[-14.3368,-16.2844],[-14.3343,-16.2871],[-14.3318,-16.2898],[-14.3293,-16.2924],[-14.3267,-16.295],[-14.1316,-16.4],[-13.9516,-16.4],[-10.3655,-14.6143],[-10.3655,-14.0916],[-9.7503,-13.7892],[-7.3946,-12.5738],[-7.7697,-12.3488],[-7.9648,-12.0637],[-8.0248,-11.8236],[-8.0248,-11.5535],[-7.9348,-11.2084],[-8.5799,-11.1784],[-8.5907,-11.1756],[-8.6014,-11.1727],[-8.6121,-11.1698],[-8.6227,-11.1668],[-8.6333,-11.1638],[-8.6439,-11.1607],[-8.6544,-11.1576],[-8.6648,-11.1545],[-8.6752,-11.1513],[-8.6856,-11.1481],[-8.6959,-11.1448],[-8.7062,-11.1415],[-8.7164,-11.1381],[-8.7266,-11.1347],[-8.7368,-11.1313],[-8.7469,-11.1278],[-8.7569,-11.1242],[-8.767,-11.1206],[-8.7769,-11.117],[-8.7868,-11.1133],[-8.7967,-11.1096],[-8.8066,-11.1059],[-8.8164,-11.1021],[-8.8261,-11.0982],[-8.8358,-11.0943],[-8.8455,-11.0904],[-8.8551,-11.0864],[-8.8647,-11.0824],[-8.8742,-11.0783],[-8.8837,-11.0742],[-8.8931,-11.0701],[-8.9025,-11.0659],[-8.9119,-11.0616],[-8.9212,-11.0573],[-8.9305,-11.053],[-8.9397,-11.0486],[-8.9489,-11.0442],[-8.958,-11.0398],[-8.9671,-11.0353],[-8.9762,-11.0307],[-8.9852,-11.0261],[-8.9941,-11.0215],[-9.003,-11.0168],[-9.0119,-11.0121],[-9.0207,-11.0073],[-9.0295,-11.0025],[-9.0383,-10.9976],[-9.047,-10.9927],[-9.0556,-10.9878],[-9.0642,-10.9828],[-9.0728,-10.9778],[-9.0813,-10.9727],[-9.0898,-10.9676],[-9.0982,-10.9624],[-9.1066,-10.9572],[-9.115,-10.9519],[-9.1233,-10.9466],[-9.1315,-10.9413],[-9.1397,-10.9359],[-9.1479,-10.9305],[-9.156,-10.925],[-9.1641,-10.9195],[-9.1721,-10.9139],[-9.1801,-10.9083],[-9.1911,-10.9005],[-9.2019,-10.8926],[-9.2127,-10.8846],[-9.2233,-10.8765],[-9.2339,-10.8683],[-9.2444,-10.8601],[-9.2548,-10.8517],[-9.2651,-10.8433],[-9.2754,-10.8348],[-9.2855,-10.8262],[-9.2956,-10.8175],[-9.3056,-10.8087],[-9.3155,-10.7998],[-9.3253,-10.7909],[-9.335,-10.7818],[-9.3446,-10.7727],[-9.3542,-10.7635],[-9.3636,-10.7542],[-9.373,-10.7448],[-9.3823,-10.7354],[-9.3915,-10.7258],[-9.4006,-10.7162],[-9.4096,-10.7064],[-9.4186,-10.6966],[-9.4274,-10.6867],[-9.4362,-10.6767],[-9.4449,-10.6667],[-9.4535,-10.6565],[-9.462,-10.6462],[-9.4704,-10.6359],[-9.4787,-10.6255],[-9.487,-10.615],[-9.4951,-10.6044],[-9.5032,-10.5937],[-9.5112,-10.5829],[-9.5191,-10.5721],[-9.5269,-10.5612],[-9.5347,-10.5501],[-9.5423,-10.539],[-9.5499,-10.5278],[-9.5573,-10.5165],[-9.5647,-10.5052],[-9.572,-10.4937],[-9.5792,-10.4822],[-9.5863,-10.4705],[-9.5934,-10.4588],[-9.6003,-10.447],[-9.6072,-10.4351],[-9.614,-10.4231],[-9.6207,-10.4111],[-9.6273,-10.3989],[-9.6338,-10.3867],[-9.6402,-10.3744],[-9.6466,-10.362],[-9.6528,-10.3495],[-9.659,-10.3369],[-9.6651,-10.3242],[-9.6711,-10.3115],[-9.677,-10.2986],[-9.6828,-10.2857],[-9.6886,-10.2727],[-9.6942,-10.2596],[-9.6998,-10.2464],[-9.7053,-10.2331],[-9.7953,-9.903],[-9.7953,-9.6179],[-9.9904,-9.6179],[-10.0204,-9.6479],[-10.5606,-9.6179],[-10.5734,-9.6148],[-10.5861,-9.6116],[-10.5987,-9.6083],[-10.6113,-9.6049],[-10.6238,-9.6015],[-10.6362,-9.5979],[-10.6485,-9.5943],[-10.6608,-9.5906],[-10.673,-9.5869],[-10.6851,-9.583],[-10.6971,-9.5791],[-10.709,-9.5751],[-10.7209,-9.571],[-10.7327,-9.5669],[-10.7444,-9.5626],[-10.756,-9.5583],[-10.7675,-9.5539],[-10.779,-9.5494],[-10.7904,-9.5449],[-10.8017,-9.5402],[-10.8129,-9.5355],[-10.8241,-9.5307],[-10.8351,-9.5258],[-10.8461,-9.5209],[-10.857,-9.5158],[-10.8678,-9.5107],[-10.8786,-9.5055],[-10.8893,-9.5003],[-10.8999,-9.4949],[-10.9104,-9.4895],[-10.9208,-9.484],[-10.9312,-9.4784],[-10.9414,-9.4727],[-10.9516,-9.467],[-10.9618,-9.4612],[-10.9718,-9.4552],[-10.9818,-9.4493],[-10.9916,-9.4432],[-11.0014,-9.4371],[-11.0112,-9.4308],[-11.0208,-9.4245],[-11.0304,-9.4182],[-11.0399,-9.4117],[-11.0493,-9.4052],[-11.0586,-9.3986],[-11.0678,-9.3919],[-11.077,-9.3851],[-11.0861,-9.3782],[-11.0951,-9.3713],[-11.104,-9.3643],[-11.1129,-9.3572],[-11.1217,-9.35],[-11.1303,-9.3428],[-11.139,-9.3355],[-11.1475,-9.328],[-11.156,-9.3206],[-11.1643,-9.313],[-11.1726,-9.3054],[-11.1808,-9.2976],[-11.189,-9.2898],[-11.197,-9.2819],[-11.205,-9.274],[-11.2129,-9.2659],[-11.2208,-9.2578],[-11.2273,-9.2512],[-11.2338,-9.2446],[-11.2402,-9.2379],[-11.2466,-9.2312],[-11.2529,-9.2244],[-11.2592,-9.2175],[-11.2654,-9.2106],[-11.2716,-9.2037],[-11.2778,-9.1967],[-11.2838,-9.1896],[-11.2899,-9.1825],[-11.2958,-9.1754],[-11.3018,-9.1682],[-11.3076,-9.1609],[-11.3135,-9.1536],[-11.3192,-9.1462],[-11.3249,-9.1388],[-11.3306,-9.1314],[-11.3362,-9.1238],[-11.3418,-9.1163],[-11.3473,-9.1087],[-11.3528,-9.101],[-11.3582,-9.0933],[-11.3635,-9.0855],[-11.3688,-9.0777],[-11.3741,-9.0698],[-11.3793,-9.0619],[-11.3845,-9.0539],[-11.3896,-9.0459],[-11.3946,-9.0378],[-11.3996,-9.0297],[-11.4046,-9.0215],[-11.4095,-9.0133],[-11.4143,-9.005],[-11.4191,-8.9967],[-11.4238,-8.9883],[-11.4285,-8.9798],[-11.4332,-8.9713],[-11.4378,-8.9628],[-11.4423,-8.9542],[-11.4468,-8.9456],[-11.4512,-8.9369],[-11.4556,-8.9281],[-11.4599,-8.9193],[-11.4642,-8.9105],[-11.4685,-8.9016],[-11.4726,-8.8926],[-11.4768,-8.8836],[-11.4808,-8.8746],[-11.4849,-8.8655],[-11.4888,-8.8563],[-11.4928,-8.8471],[-11.4966,-8.8379],[-11.5005,-8.8286],[-11.5042,-8.8192],[-11.508,-8.8098],[-11.5116,-8.8003],[-11.5152,-8.7908],[-11.5188,-8.7813],[-11.5223,-8.7716],[-11.5258,-8.762],[-11.5292,-8.7523],[-11.5325,-8.7425],[-11.5359,-8.7327],[-11.5349,-8.7292],[-11.5341,-8.7259],[-11.5333,-8.7226],[-11.5326,-8.7194],[-11.5319,-8.7162],[-11.5313,-8.7131],[-11.5307,-8.7101],[-11.5302,-8.7072],[-11.5298,-8.7043],[-11.5294,-8.7016],[-11.5291,-8.6988],[-11.5288,-8.6962],[-11.5286,-8.6936],[-11.5285,-8.6911],[-11.5284,-8.6887],[-11.5283,-8.6863],[-11.5284,-8.6841],[-11.5285,-8.6818],[-11.5286,-8.6797],[-11.5288,-8.6776],[-11.5291,-8.6756],[-11.5294,-8.6737],[-11.5298,-8.6718],[-11.5302,-8.6701],[-11.5307,-8.6684],[-11.5313,-8.6667],[-11.5319,-8.6651],[-11.5326,-8.6637],[-11.5333,-8.6622],[-11.5341,-8.6609],[-11.5349,-8.6596],[-11.5359,-8.6584],[-11.5368,-8.6573],[-11.5378,-8.6562],[-11.5389,-8.6552],[-11.5401,-8.6543],[-11.5413,-8.6534],[-11.5425,-8.6526],[-11.5439,-8.6519],[-11.5452,-8.6513],[-11.5467,-8.6507],[-11.5482,-8.6503],[-11.5497,-8.6498],[-11.5513,-8.6495],[-11.553,-8.6492],[-11.5547,-8.649],[-11.5565,-8.6489],[-11.5584,-8.6488],[-11.5603,-8.6488],[-11.5622,-8.6489],[-11.5642,-8.6491],[-11.5663,-8.6493],[-11.5685,-8.6496],[-11.5707,-8.65],[-11.5729,-8.6504],[-11.5752,-8.6509],[-11.5776,-8.6515],[-11.58,-8.6522],[-11.5825,-8.6529],[-11.5851,-8.6537],[-11.5877,-8.6546],[-11.5904,-8.6555],[-11.5931,-8.6566],[-11.5959,-8.6576],[-12.2261,-10.7433],[-12.8563,-12.6339],[-12.7912,-12.4388]]);
    }
}

module v17_treble_top_boolean_2d() {
    union() {
        polygon(points = [[1.852,13.9144],[1.8381,13.9118],[1.8244,13.9092],[1.8107,13.9064],[1.7971,13.9036],[1.7837,13.9007],[1.7703,13.8977],[1.757,13.8946],[1.7438,13.8915],[1.7307,13.8882],[1.7176,13.8848],[1.7047,13.8814],[1.6918,13.8779],[1.6791,13.8742],[1.6664,13.8705],[1.6539,13.8667],[1.6414,13.8628],[1.629,13.8588],[1.6167,13.8547],[1.6045,13.8505],[1.5923,13.8463],[1.5803,13.8419],[1.5684,13.8375],[1.5565,13.833],[1.5448,13.8283],[1.5331,13.8236],[1.5215,13.8188],[1.51,13.8139],[1.4986,13.8089],[1.4873,13.8039],[1.4761,13.7987],[1.465,13.7934],[1.4539,13.7881],[1.443,13.7827],[1.4321,13.7771],[1.4213,13.7715],[1.4107,13.7658],[1.4001,13.76],[1.3896,13.7541],[1.3792,13.7481],[1.3689,13.7421],[1.3586,13.7359],[1.3485,13.7297],[1.3385,13.7233],[1.3285,13.7169],[1.3186,13.7104],[1.3089,13.7038],[1.2992,13.6971],[1.2896,13.6903],[1.2801,13.6834],[1.2707,13.6764],[1.2614,13.6694],[1.2521,13.6622],[1.243,13.655],[1.2339,13.6476],[1.225,13.6402],[1.2161,13.6327],[1.2073,13.6251],[1.1986,13.6174],[1.19,13.6096],[1.1815,13.6017],[1.1731,13.5938],[1.1648,13.5857],[1.1565,13.5776],[1.1444,13.567],[1.1324,13.5564],[1.1204,13.5458],[1.1084,13.5351],[1.0965,13.5243],[1.0847,13.5135],[1.0729,13.5027],[1.0612,13.4917],[1.0495,13.4808],[1.0379,13.4697],[1.0263,13.4586],[1.0148,13.4475],[1.0034,13.4363],[0.992,13.425],[0.9807,13.4137],[0.9694,13.4023],[0.9582,13.3909],[0.947,13.3794],[0.9359,13.3679],[0.9248,13.3563],[0.9138,13.3447],[0.9029,13.333],[0.892,13.3212],[0.8811,13.3094],[0.8704,13.2975],[0.8596,13.2856],[0.849,13.2736],[0.8384,13.2616],[0.8278,13.2495],[0.8173,13.2373],[0.8069,13.2251],[0.7965,13.2129],[0.7861,13.2005],[0.7759,13.1882],[0.7656,13.1757],[0.7555,13.1633],[0.7454,13.1507],[0.7353,13.1381],[0.7253,13.1255],[0.7154,13.1128],[0.7055,13.1],[0.6957,13.0872],[0.6859,13.0743],[0.6762,13.0614],[0.6665,13.0484],[0.6569,13.0354],[0.6473,13.0223],[0.6378,13.0091],[0.6284,12.9959],[0.619,12.9826],[0.6097,12.9693],[0.6004,12.956],[0.5912,12.9425],[0.582,12.929],[0.5729,12.9155],[0.5639,12.9019],[0.5549,12.8882],[0.5459,12.8745],[0.537,12.8608],[0.5282,12.8469],[0.5194,12.8331],[0.5107,12.8191],[0.5021,12.8052],[0.4935,12.7911],[0,11.8042],[-0.3393,10.7556],[-0.5551,9.522],[-0.5551,8.35],[-0.5243,8.3191],[-0.4935,7.8257],[-0.2776,6.885],[-0.2005,6.885],[0.2005,7.2551],[0.2358,7.2883],[0.2709,7.3215],[0.3059,7.355],[0.3408,7.3886],[0.3755,7.4223],[0.41,7.4562],[0.4444,7.4902],[0.4787,7.5244],[0.5128,7.5587],[0.5467,7.5932],[0.5805,7.6278],[0.6142,7.6626],[0.6477,7.6975],[0.681,7.7325],[0.7143,7.7678],[0.7473,7.8031],[0.7802,7.8387],[0.813,7.8743],[0.8456,7.9101],[0.8781,7.9461],[0.9104,7.9822],[0.9425,8.0185],[0.9746,8.0549],[1.0064,8.0915],[1.0382,8.1282],[1.0697,8.165],[1.1011,8.202],[1.1324,8.2392],[1.1635,8.2765],[1.1945,8.314],[1.2253,8.3516],[1.256,8.3893],[1.2865,8.4272],[1.3169,8.4653],[1.3471,8.5035],[1.3772,8.5418],[1.4071,8.5803],[1.4369,8.619],[1.4666,8.6578],[1.496,8.6967],[1.5254,8.7358],[1.5546,8.7751],[1.5836,8.8144],[1.6125,8.854],[1.6412,8.8937],[1.6698,8.9335],[1.6982,8.9735],[1.7265,9.0137],[1.7547,9.0539],[1.7827,9.0944],[1.8105,9.135],[1.8382,9.1757],[1.8657,9.2166],[1.8931,9.2576],[1.9204,9.2988],[1.9475,9.3401],[1.9744,9.3816],[2.0012,9.4232],[2.0279,9.465],[2.0544,9.507],[2.0807,9.549],[2.1069,9.5913],[2.133,9.6336],[2.1589,9.6762],[2.1727,9.6989],[2.1865,9.7218],[2.2001,9.7448],[2.2137,9.7678],[2.2272,9.791],[2.2406,9.8142],[2.2539,9.8375],[2.2671,9.8609],[2.2802,9.8844],[2.2933,9.908],[2.3063,9.9316],[2.3191,9.9554],[2.3319,9.9792],[2.3446,10.0032],[2.3572,10.0272],[2.3698,10.0513],[2.3822,10.0754],[2.3945,10.0997],[2.4068,10.1241],[2.419,10.1485],[2.4311,10.1731],[2.4431,10.1977],[2.455,10.2224],[2.4668,10.2472],[2.4785,10.2721],[2.4902,10.2971],[2.5018,10.3221],[2.5132,10.3473],[2.5246,10.3725],[2.5359,10.3978],[2.5471,10.4232],[2.5583,10.4487],[2.5693,10.4743],[2.5803,10.5],[2.5911,10.5257],[2.6019,10.5516],[2.6126,10.5775],[2.6232,10.6035],[2.6337,10.6296],[2.6441,10.6558],[2.6545,10.6821],[2.6647,10.7085],[2.6749,10.735],[2.685,10.7615],[2.695,10.7881],[2.7049,10.8149],[2.7147,10.8417],[2.7244,10.8686],[2.7341,10.8955],[2.7436,10.9226],[2.7531,10.9498],[2.7625,10.977],[2.7718,11.0043],[2.781,11.0317],[2.7901,11.0593],[2.7991,11.0868],[2.8081,11.1145],[2.8169,11.1423],[2.8257,11.1702],[2.8344,11.1981],[2.843,11.2261],[2.8515,11.2542],[2.8599,11.2824],[2.8682,11.3107],[2.9916,11.835],[3.0224,12.3285],[3.0533,12.3593],[3.0533,12.6369],[2.9607,13.1304],[2.7449,13.5313],[2.7369,13.5431],[2.7287,13.5546],[2.7203,13.566],[2.7118,13.5773],[2.7031,13.5883],[2.6942,13.5991],[2.6851,13.6098],[2.6758,13.6203],[2.6664,13.6306],[2.6567,13.6407],[2.6469,13.6507],[2.6369,13.6604],[2.6267,13.67],[2.6164,13.6794],[2.6058,13.6886],[2.5951,13.6976],[2.5842,13.7065],[2.5731,13.7152],[2.5618,13.7236],[2.5504,13.7319],[2.5387,13.7401],[2.5269,13.748],[2.5149,13.7558],[2.5027,13.7633],[2.4903,13.7707],[2.4778,13.7779],[2.4651,13.785],[2.4521,13.7918],[2.439,13.7985],[2.4258,13.8049],[2.4123,13.8112],[2.3987,13.8173],[2.3848,13.8233],[2.3708,13.829],[2.3566,13.8346],[2.3423,13.84],[2.3277,13.8452],[2.313,13.8502],[2.2981,13.855],[2.283,13.8597],[2.2677,13.8642],[2.2522,13.8685],[2.2366,13.8726],[2.2207,13.8765],[2.2047,13.8803],[2.1885,13.8838],[2.1722,13.8872],[2.1556,13.8904],[2.1389,13.8934],[2.1219,13.8963],[2.1048,13.8989],[2.0875,13.9014],[2.0701,13.9037],[2.0524,13.9058],[2.0346,13.9077],[2.0166,13.9094],[1.9984,13.911],[1.98,13.9124],[1.9614,13.9136],[1.9427,13.9146],[1.9238,13.9154],[1.9047,13.9161],[1.8854,13.9165],[1.8659,13.9168]]);
        polygon(points = [[-1.5883,2.0121],[-1.6295,1.9747],[-1.6704,1.9371],[-1.7112,1.8994],[-1.7517,1.8614],[-1.7921,1.8232],[-1.8323,1.7848],[-1.8722,1.7462],[-1.912,1.7074],[-1.9516,1.6685],[-1.991,1.6293],[-2.0301,1.5899],[-2.0691,1.5504],[-2.1079,1.5106],[-2.1465,1.4706],[-2.1849,1.4305],[-2.2231,1.3901],[-2.2611,1.3496],[-2.2989,1.3088],[-2.3365,1.2679],[-2.3739,1.2267],[-2.4111,1.1854],[-2.4481,1.1438],[-2.4849,1.1021],[-2.5215,1.0602],[-2.5579,1.018],[-2.5941,0.9757],[-2.6302,0.9332],[-2.666,0.8905],[-2.7016,0.8475],[-2.737,0.8044],[-2.7723,0.7611],[-2.8073,0.7176],[-2.8422,0.6739],[-2.8768,0.63],[-2.9112,0.5859],[-2.9455,0.5416],[-2.9795,0.4971],[-3.0134,0.4524],[-3.047,0.4075],[-3.0805,0.3624],[-3.1138,0.3171],[-3.1468,0.2716],[-3.1797,0.2259],[-3.2124,0.18],[-3.2448,0.134],[-3.2771,0.0877],[-3.3092,0.0412],[-3.3411,-0.0054],[-3.3727,-0.0523],[-3.4042,-0.0994],[-3.4355,-0.1466],[-3.4666,-0.1941],[-3.4975,-0.2417],[-3.5282,-0.2896],[-3.5587,-0.3377],[-3.589,-0.3859],[-3.6191,-0.4343],[-3.649,-0.483],[-3.6787,-0.5318],[-3.7082,-0.5809],[-3.7375,-0.6301],[-3.7667,-0.6795],[-3.7956,-0.7292],[-3.8243,-0.779],[-3.8339,-0.7968],[-3.8435,-0.8147],[-3.853,-0.8327],[-3.8625,-0.8507],[-3.8719,-0.8687],[-3.8813,-0.8868],[-3.8907,-0.9049],[-3.9,-0.9231],[-3.9092,-0.9413],[-3.9184,-0.9595],[-3.9276,-0.9778],[-3.9367,-0.9962],[-3.9458,-1.0146],[-3.9548,-1.033],[-3.9638,-1.0515],[-3.9727,-1.07],[-3.9816,-1.0886],[-3.9905,-1.1072],[-3.9993,-1.1259],[-4.008,-1.1446],[-4.0167,-1.1634],[-4.0254,-1.1822],[-4.034,-1.201],[-4.0426,-1.2199],[-4.0511,-1.2388],[-4.0596,-1.2578],[-4.0681,-1.2769],[-4.0764,-1.2959],[-4.0848,-1.315],[-4.0931,-1.3342],[-4.1014,-1.3534],[-4.1096,-1.3727],[-4.1177,-1.392],[-4.1259,-1.4113],[-4.134,-1.4307],[-4.142,-1.4501],[-4.15,-1.4696],[-4.1579,-1.4891],[-4.1658,-1.5087],[-4.1737,-1.5283],[-4.1815,-1.548],[-4.1892,-1.5677],[-4.197,-1.5874],[-4.2046,-1.6072],[-4.2123,-1.6271],[-4.2198,-1.647],[-4.2274,-1.6669],[-4.2349,-1.6869],[-4.2423,-1.7069],[-4.2497,-1.727],[-4.2571,-1.7471],[-4.2644,-1.7672],[-4.2717,-1.7874],[-4.2789,-1.8077],[-4.286,-1.828],[-4.2932,-1.8483],[-4.3003,-1.8687],[-4.3073,-1.8891],[-4.3143,-1.9096],[-4.3212,-1.9301],[-4.3282,-1.9507],[-4.335,-1.9713],[-4.3418,-1.9919],[-4.3486,-2.0126],[-4.5028,-2.6294],[-4.5336,-2.9995],[-4.5645,-3.0304],[-4.5645,-3.4313],[-4.5953,-3.4622],[-4.5336,-4.2949],[-4.3486,-5.0042],[-4.3382,-5.0314],[-4.3277,-5.0585],[-4.3171,-5.0855],[-4.3063,-5.1123],[-4.2954,-5.139],[-4.2844,-5.1655],[-4.2732,-5.192],[-4.262,-5.2183],[-4.2505,-5.2444],[-4.239,-5.2705],[-4.2273,-5.2964],[-4.2155,-5.3222],[-4.2036,-5.3478],[-4.1915,-5.3734],[-4.1793,-5.3988],[-4.167,-5.424],[-4.1546,-5.4492],[-4.142,-5.4742],[-4.1293,-5.4991],[-4.1164,-5.5238],[-4.1035,-5.5484],[-4.0904,-5.5729],[-4.0772,-5.5973],[-4.0638,-5.6215],[-4.0503,-5.6456],[-4.0367,-5.6696],[-4.023,-5.6934],[-4.0091,-5.7171],[-3.9951,-5.7407],[-3.9809,-5.7642],[-3.9667,-5.7875],[-3.9523,-5.8107],[-3.9378,-5.8338],[-3.9231,-5.8567],[-3.9083,-5.8795],[-3.8934,-5.9022],[-3.8784,-5.9247],[-3.8632,-5.9472],[-3.8479,-5.9694],[-3.8325,-5.9916],[-3.8169,-6.0136],[-3.8012,-6.0355],[-3.7854,-6.0573],[-3.7695,-6.079],[-3.7534,-6.1005],[-3.7372,-6.1218],[-3.7209,-6.1431],[-3.7044,-6.1642],[-3.6878,-6.1852],[-3.6711,-6.2061],[-3.6542,-6.2268],[-3.6373,-6.2474],[-3.6201,-6.2679],[-3.6029,-6.2882],[-3.5855,-6.3085],[-3.568,-6.3285],[-3.5504,-6.3485],[-3.5326,-6.3683],[-3.5147,-6.388],[-3.4967,-6.4076],[-3.4786,-6.427],[-3.4603,-6.4464],[-3.4419,-6.4655],[-3.4234,-6.4846],[-3.4013,-6.5078],[-3.3791,-6.5309],[-3.3568,-6.5539],[-3.3343,-6.5767],[-3.3116,-6.5993],[-3.2888,-6.6218],[-3.2659,-6.6442],[-3.2428,-6.6664],[-3.2196,-6.6885],[-3.1962,-6.7104],[-3.1726,-6.7321],[-3.1489,-6.7537],[-3.1251,-6.7752],[-3.1011,-6.7965],[-3.077,-6.8177],[-3.0527,-6.8387],[-3.0283,-6.8595],[-3.0037,-6.8803],[-2.9789,-6.9008],[-2.9541,-6.9212],[-2.929,-6.9415],[-2.9038,-6.9616],[-2.8785,-6.9816],[-2.853,-7.0014],[-2.8274,-7.0211],[-2.8016,-7.0406],[-2.7757,-7.06],[-2.7496,-7.0792],[-2.7234,-7.0983],[-2.697,-7.1172],[-2.6705,-7.136],[-2.6439,-7.1546],[-2.617,-7.1731],[-2.5901,-7.1914],[-2.5629,-7.2096],[-2.5357,-7.2276],[-2.5083,-7.2455],[-2.4807,-7.2632],[-2.453,-7.2808],[-2.4251,-7.2983],[-2.3971,-7.3155],[-2.3689,-7.3327],[-2.3406,-7.3497],[-2.3122,-7.3665],[-2.2836,-7.3832],[-2.2548,-7.3997],[-2.2259,-7.4161],[-2.1969,-7.4324],[-2.1676,-7.4485],[-2.1383,-7.4644],[-2.1088,-7.4802],[-2.0791,-7.4958],[-2.0493,-7.5113],[-2.0194,-7.5267],[-1.9893,-7.5419],[-1.959,-7.5569],[-1.9286,-7.5718],[-1.8981,-7.5866],[-1.8674,-7.6012],[-1.8366,-7.6156],[-1.8056,-7.6299],[-1.7744,-7.6441],[-1.7431,-7.6581],[-1.7117,-7.672],[-0.7864,-7.9804],[-0.1079,-8.1037],[0.1388,-8.1037],[0.1696,-8.1346],[0.9715,-8.1346],[1.0023,-8.1037],[1.2491,-8.1037],[2.0509,-7.9495],[2.2514,-7.8416],[1.7888,-5.8061],[1.7579,-5.5285],[1.6654,-5.2509],[1.6346,-4.9734],[1.5421,-4.6958],[1.5112,-4.4182],[1.4187,-4.1407],[1.2028,-2.9995],[1.1103,-2.722],[1.1103,-2.5678],[1.1058,-2.5559],[1.1013,-2.544],[1.0969,-2.532],[1.0926,-2.5199],[1.0883,-2.5079],[1.084,-2.4957],[1.0798,-2.4835],[1.0757,-2.4713],[1.0716,-2.459],[1.0675,-2.4467],[1.0635,-2.4343],[1.0596,-2.4218],[1.0557,-2.4093],[1.0519,-2.3968],[1.0481,-2.3842],[1.0444,-2.3715],[1.0407,-2.3588],[1.037,-2.3461],[1.0335,-2.3333],[1.0299,-2.3204],[1.0264,-2.3075],[1.023,-2.2946],[1.0196,-2.2816],[1.0163,-2.2685],[1.013,-2.2554],[1.0098,-2.2422],[1.0066,-2.229],[1.0035,-2.2158],[1.0004,-2.2025],[0.9974,-2.1891],[0.9945,-2.1757],[0.9915,-2.1622],[0.9887,-2.1487],[0.9859,-2.1351],[0.9831,-2.1215],[0.9804,-2.1078],[0.9777,-2.0941],[0.9751,-2.0803],[0.9726,-2.0665],[0.97,-2.0526],[0.9676,-2.0387],[0.9652,-2.0247],[0.9628,-2.0107],[0.9605,-1.9966],[0.9583,-1.9825],[0.9561,-1.9683],[0.9539,-1.954],[0.9518,-1.9398],[0.9498,-1.9254],[0.9478,-1.911],[0.9458,-1.8966],[0.944,-1.8821],[0.9421,-1.8676],[0.9403,-1.853],[0.9386,-1.8383],[0.9369,-1.8236],[0.9353,-1.8089],[0.9337,-1.7941],[0.9321,-1.7792],[0.9307,-1.7643],[0.9292,-1.7494],[0.9278,-1.7344],[0.9265,-1.7193],[0.9252,-1.7042],[0.8173,-1.4421],[0.7983,-1.4471],[0.7793,-1.4523],[0.7605,-1.4575],[0.7418,-1.4629],[0.7231,-1.4684],[0.7046,-1.4739],[0.6861,-1.4796],[0.6678,-1.4853],[0.6496,-1.4912],[0.6314,-1.4971],[0.6134,-1.5032],[0.5955,-1.5094],[0.5776,-1.5156],[0.5599,-1.522],[0.5422,-1.5284],[0.5247,-1.535],[0.5072,-1.5416],[0.4899,-1.5484],[0.4727,-1.5552],[0.4555,-1.5622],[0.4385,-1.5692],[0.4215,-1.5764],[0.4047,-1.5836],[0.3879,-1.591],[0.3713,-1.5984],[0.3547,-1.606],[0.3383,-1.6136],[0.3219,-1.6214],[0.3057,-1.6292],[0.2895,-1.6371],[0.2735,-1.6452],[0.2575,-1.6533],[0.2417,-1.6616],[0.2259,-1.6699],[0.2103,-1.6783],[0.1947,-1.6869],[0.1793,-1.6955],[0.1639,-1.7043],[0.1486,-1.7131],[0.1335,-1.722],[0.1184,-1.7311],[0.1035,-1.7402],[0.0886,-1.7495],[0.0738,-1.7588],[0.0592,-1.7682],[0.0446,-1.7778],[0.0302,-1.7874],[0.0158,-1.7971],[0.0015,-1.807],[-0.0126,-1.8169],[-0.0267,-1.8269],[-0.0406,-1.837],[-0.0545,-1.8473],[-0.0683,-1.8576],[-0.0819,-1.868],[-0.0955,-1.8786],[-0.109,-1.8892],[-0.1223,-1.8999],[-0.1356,-1.9107],[-0.1488,-1.9217],[-0.1619,-1.9327],[-0.1748,-1.9438],[-0.1877,-1.955],[-0.2005,-1.9664],[-0.2141,-1.9778],[-0.2277,-1.9893],[-0.2412,-2.0008],[-0.2546,-2.0124],[-0.268,-2.0241],[-0.2813,-2.0359],[-0.2945,-2.0478],[-0.3076,-2.0597],[-0.3207,-2.0717],[-0.3336,-2.0838],[-0.3465,-2.0959],[-0.3594,-2.1081],[-0.3721,-2.1204],[-0.3848,-2.1328],[-0.3975,-2.1453],[-0.41,-2.1578],[-0.4225,-2.1704],[-0.4349,-2.183],[-0.4472,-2.1958],[-0.4594,-2.2086],[-0.4716,-2.2215],[-0.4837,-2.2344],[-0.4957,-2.2475],[-0.5077,-2.2606],[-0.5196,-2.2737],[-0.5314,-2.287],[-0.5431,-2.3003],[-0.5547,-2.3137],[-0.5663,-2.3272],[-0.5778,-2.3407],[-0.5893,-2.3544],[-0.6006,-2.3681],[-0.6119,-2.3818],[-0.6231,-2.3957],[-0.6343,-2.4096],[-0.6453,-2.4236],[-0.6563,-2.4377],[-0.6672,-2.4518],[-0.6781,-2.466],[-0.6889,-2.4803],[-0.6996,-2.4947],[-0.7102,-2.5091],[-0.7207,-2.5236],[-0.7312,-2.5382],[-0.7416,-2.5528],[-0.7519,-2.5676],[-0.7622,-2.5824],[-0.7724,-2.5973],[-0.7825,-2.6122],[-0.7925,-2.6272],[-0.8025,-2.6423],[-0.8124,-2.6575],[-0.8222,-2.6728],[-0.8319,-2.6881],[-0.8416,-2.7035],[-0.8512,-2.7189],[-0.8607,-2.7345],[-0.8701,-2.7501],[-0.8795,-2.7658],[-0.8888,-2.7815],[-0.898,-2.7974],[-0.9072,-2.8133],[-0.9162,-2.8293],[-0.9252,-2.8453],[-1.0794,-3.1846],[-1.2336,-3.8631],[-1.2336,-4.2332],[-1.1103,-4.7883],[-1.1055,-4.8009],[-1.1007,-4.8135],[-1.0959,-4.826],[-1.091,-4.8384],[-1.0861,-4.8508],[-1.0811,-4.8632],[-1.076,-4.8755],[-1.071,-4.8878],[-1.0658,-4.9],[-1.0606,-4.9122],[-1.0554,-4.9243],[-1.0501,-4.9364],[-1.0448,-4.9484],[-1.0394,-4.9604],[-1.034,-4.9723],[-1.0286,-4.9842],[-1.023,-4.996],[-1.0175,-5.0078],[-1.0119,-5.0195],[-1.0062,-5.0312],[-1.0005,-5.0428],[-0.9947,-5.0544],[-0.9889,-5.066],[-0.9831,-5.0775],[-0.9772,-5.0889],[-0.9712,-5.1003],[-0.9652,-5.1116],[-0.9592,-5.1229],[-0.9531,-5.1342],[-0.9469,-5.1454],[-0.9407,-5.1566],[-0.9345,-5.1677],[-0.9282,-5.1787],[-0.9219,-5.1897],[-0.9155,-5.2007],[-0.909,-5.2116],[-0.9026,-5.2225],[-0.896,-5.2333],[-0.8895,-5.2441],[-0.8828,-5.2548],[-0.8762,-5.2655],[-0.8694,-5.2761],[-0.8627,-5.2867],[-0.8558,-5.2972],[-0.849,-5.3077],[-0.8421,-5.3181],[-0.8351,-5.3285],[-0.8281,-5.3388],[-0.821,-5.3491],[-0.8139,-5.3594],[-0.8068,-5.3696],[-0.7996,-5.3797],[-0.7923,-5.3898],[-0.785,-5.3998],[-0.7777,-5.4098],[-0.7703,-5.4198],[-0.7628,-5.4297],[-0.7553,-5.4396],[-0.7478,-5.4494],[-0.7402,-5.4591],[-0.7325,-5.4688],[-0.7249,-5.4785],[-0.7171,-5.4881],[-0.7093,-5.4977],[-0.6954,-5.5155],[-0.6813,-5.5332],[-0.667,-5.5507],[-0.6525,-5.5681],[-0.6379,-5.5853],[-0.6232,-5.6023],[-0.6082,-5.6192],[-0.5932,-5.6359],[-0.5779,-5.6525],[-0.5625,-5.6689],[-0.5469,-5.6851],[-0.5312,-5.7012],[-0.5153,-5.7171],[-0.4993,-5.7328],[-0.483,-5.7484],[-0.4667,-5.7639],[-0.4501,-5.7791],[-0.4334,-5.7942],[-0.4166,-5.8092],[-0.3995,-5.824],[-0.3824,-5.8386],[-0.365,-5.8531],[-0.3475,-5.8674],[-0.3299,-5.8815],[-0.312,-5.8955],[-0.294,-5.9093],[-0.2759,-5.9229],[-0.2576,-5.9364],[-0.2391,-5.9498],[-0.2205,-5.963],[-0.2017,-5.976],[-0.1827,-5.9888],[-0.1636,-6.0015],[-0.1443,-6.014],[-0.1249,-6.0264],[-0.1053,-6.0386],[-0.0855,-6.0506],[-0.0656,-6.0625],[-0.0455,-6.0743],[-0.0253,-6.0858],[-0.0049,-6.0972],[0.0157,-6.1085],[0.0364,-6.1195],[0.0573,-6.1305],[0.0783,-6.1412],[0.0995,-6.1518],[0.1209,-6.1622],[0.1424,-6.1725],[0.1641,-6.1826],[0.186,-6.1926],[0.208,-6.2024],[0.2302,-6.212],[0.2525,-6.2215],[0.275,-6.2308],[0.2977,-6.2399],[0.3205,-6.2489],[0.3435,-6.2577],[0.3666,-6.2664],[0.3899,-6.2749],[0.4134,-6.2832],[0.437,-6.2914],[0.4608,-6.2994],[0.4848,-6.3073],[0.5089,-6.315],[0.5118,-6.3163],[0.5147,-6.3178],[0.5176,-6.3193],[0.5204,-6.3208],[0.5231,-6.3224],[0.5258,-6.3241],[0.5284,-6.3258],[0.531,-6.3275],[0.5335,-6.3294],[0.536,-6.3312],[0.5384,-6.3332],[0.5407,-6.3352],[0.543,-6.3372],[0.5452,-6.3393],[0.5474,-6.3415],[0.5495,-6.3437],[0.5516,-6.3459],[0.5536,-6.3483],[0.5556,-6.3507],[0.5575,-6.3531],[0.5593,-6.3556],[0.5611,-6.3581],[0.5629,-6.3607],[0.5645,-6.3634],[0.5662,-6.3661],[0.5677,-6.3689],[0.5692,-6.3717],[0.5707,-6.3746],[0.5721,-6.3775],[0.5734,-6.3805],[0.5747,-6.3836],[0.576,-6.3867],[0.5771,-6.3898],[0.5783,-6.393],[0.5793,-6.3963],[0.5803,-6.3996],[0.5813,-6.403],[0.5822,-6.4065],[0.583,-6.41],[0.5838,-6.4135],[0.5845,-6.4171],[0.5852,-6.4208],[0.5858,-6.4245],[0.5864,-6.4283],[0.5869,-6.4321],[0.5874,-6.436],[0.5878,-6.4399],[0.5881,-6.4439],[0.5884,-6.448],[0.5886,-6.4521],[0.5888,-6.4562],[0.5889,-6.4605],[0.589,-6.4647],[0.589,-6.4691],[0.5889,-6.4734],[0.5888,-6.4779],[0.5887,-6.4824],[0.5884,-6.4869],[0.5882,-6.4915],[0.5878,-6.4962],[0.5875,-6.5009],[0.587,-6.5057],[0.5865,-6.5105],[0.586,-6.5154],[0.4164,-6.6234],[0.1079,-6.5925],[-0.3547,-6.4383],[-0.37,-6.4319],[-0.3852,-6.4255],[-0.4004,-6.419],[-0.4155,-6.4124],[-0.4306,-6.4058],[-0.4456,-6.3991],[-0.4605,-6.3924],[-0.4754,-6.3856],[-0.4903,-6.3788],[-0.5051,-6.3719],[-0.5198,-6.3649],[-0.5344,-6.3579],[-0.5491,-6.3508],[-0.5636,-6.3437],[-0.5781,-6.3365],[-0.5925,-6.3292],[-0.6069,-6.3219],[-0.6212,-6.3146],[-0.6355,-6.3071],[-0.6497,-6.2997],[-0.6639,-6.2921],[-0.678,-6.2845],[-0.692,-6.2769],[-0.706,-6.2692],[-0.7199,-6.2614],[-0.7338,-6.2536],[-0.7476,-6.2457],[-0.7613,-6.2378],[-0.775,-6.2298],[-0.7886,-6.2217],[-0.8022,-6.2136],[-0.8157,-6.2055],[-0.8292,-6.1973],[-0.8426,-6.189],[-0.856,-6.1806],[-0.8693,-6.1722],[-0.8825,-6.1638],[-0.8957,-6.1553],[-0.9088,-6.1467],[-0.9219,-6.1381],[-0.9349,-6.1294],[-0.9478,-6.1207],[-0.9607,-6.1119],[-0.9735,-6.103],[-0.9863,-6.0941],[-0.999,-6.0852],[-1.0117,-6.0762],[-1.0243,-6.0671],[-1.0369,-6.0579],[-1.0494,-6.0487],[-1.0618,-6.0395],[-1.0742,-6.0302],[-1.0865,-6.0208],[-1.0987,-6.0114],[-1.111,-6.0019],[-1.1231,-5.9924],[-1.1352,-5.9828],[-1.1472,-5.9731],[-1.1592,-5.9634],[-1.1711,-5.9537],[-1.183,-5.9438],[-1.1948,-5.934],[-1.2065,-5.924],[-1.2182,-5.914],[-1.2328,-5.9017],[-1.2474,-5.8892],[-1.2618,-5.8767],[-1.2762,-5.8641],[-1.2905,-5.8514],[-1.3048,-5.8387],[-1.319,-5.8259],[-1.3331,-5.813],[-1.3471,-5.8],[-1.361,-5.787],[-1.3749,-5.7739],[-1.3887,-5.7607],[-1.4024,-5.7474],[-1.4161,-5.7341],[-1.4297,-5.7207],[-1.4432,-5.7072],[-1.4566,-5.6936],[-1.47,-5.68],[-1.4832,-5.6663],[-1.4965,-5.6525],[-1.5096,-5.6387],[-1.5227,-5.6248],[-1.5356,-5.6108],[-1.5486,-5.5967],[-1.5614,-5.5826],[-1.5742,-5.5683],[-1.5869,-5.554],[-1.5995,-5.5397],[-1.612,-5.5252],[-1.6245,-5.5107],[-1.6369,-5.4961],[-1.6492,-5.4815],[-1.6615,-5.4667],[-1.6737,-5.4519],[-1.6858,-5.4371],[-1.6978,-5.4221],[-1.7097,-5.4071],[-1.7216,-5.392],[-1.7334,-5.3768],[-1.7452,-5.3615],[-1.7568,-5.3462],[-1.7684,-5.3308],[-1.7799,-5.3153],[-1.7914,-5.2998],[-1.8027,-5.2842],[-1.814,-5.2685],[-1.8253,-5.2527],[-1.8364,-5.2369],[-1.8475,-5.221],[-1.8585,-5.205],[-1.8694,-5.1889],[-1.8802,-5.1728],[-1.891,-5.1566],[-1.9017,-5.1403],[-1.9123,-5.1239],[-1.9229,-5.1075],[-1.9334,-5.091],[-1.9438,-5.0744],[-1.9541,-5.0577],[-1.9644,-5.041],[-1.9746,-5.0242],[-1.9847,-5.0073],[-1.9947,-4.9904],[-2.0047,-4.9734],[-2.3131,-4.2332],[-2.4364,-3.5855],[-2.4364,-2.8762],[-2.2822,-2.1051],[-2.2732,-2.0775],[-2.2641,-2.0501],[-2.2548,-2.0227],[-2.2454,-1.9955],[-2.2358,-1.9684],[-2.2262,-1.9415],[-2.2164,-1.9146],[-2.2065,-1.8879],[-2.1965,-1.8613],[-2.1863,-1.8349],[-2.176,-1.8085],[-2.1656,-1.7823],[-2.155,-1.7562],[-2.1444,-1.7303],[-2.1336,-1.7045],[-2.1226,-1.6788],[-2.1116,-1.6532],[-2.1004,-1.6277],[-2.0891,-1.6024],[-2.0777,-1.5772],[-2.0661,-1.5522],[-2.0544,-1.5272],[-2.0426,-1.5024],[-2.0307,-1.4777],[-2.0186,-1.4532],[-2.0064,-1.4287],[-1.9941,-1.4044],[-1.9817,-1.3802],[-1.9691,-1.3562],[-1.9564,-1.3323],[-1.9436,-1.3084],[-1.9307,-1.2848],[-1.9176,-1.2612],[-1.9044,-1.2378],[-1.8911,-1.2145],[-1.8776,-1.1913],[-1.864,-1.1683],[-1.8503,-1.1454],[-1.8365,-1.1226],[-1.8225,-1.0999],[-1.8084,-1.0774],[-1.7942,-1.055],[-1.7799,-1.0327],[-1.7654,-1.0105],[-1.7508,-0.9885],[-1.7361,-0.9666],[-1.7213,-0.9448],[-1.7063,-0.9232],[-1.6912,-0.9016],[-1.676,-0.8802],[-1.6606,-0.859],[-1.6451,-0.8378],[-1.6295,-0.8168],[-1.6138,-0.7959],[-1.5979,-0.7751],[-1.582,-0.7545],[-1.5658,-0.734],[-1.5496,-0.7136],[-1.5332,-0.6933],[-1.5168,-0.6732],[-1.5001,-0.6532],[-1.4834,-0.6333],[-1.4665,-0.6136],[-1.4495,-0.5939],[-1.4375,-0.5795],[-1.4253,-0.5651],[-1.4132,-0.5508],[-1.4009,-0.5365],[-1.3886,-0.5223],[-1.3763,-0.5081],[-1.3639,-0.494],[-1.3515,-0.48],[-1.339,-0.466],[-1.3264,-0.452],[-1.3138,-0.4381],[-1.3012,-0.4242],[-1.2885,-0.4104],[-1.2757,-0.3967],[-1.2629,-0.383],[-1.25,-0.3694],[-1.2371,-0.3558],[-1.2241,-0.3422],[-1.2111,-0.3288],[-1.198,-0.3153],[-1.1849,-0.302],[-1.1717,-0.2886],[-1.1585,-0.2754],[-1.1452,-0.2621],[-1.1319,-0.249],[-1.1185,-0.2359],[-1.105,-0.2228],[-1.0915,-0.2098],[-1.078,-0.1968],[-1.0644,-0.1839],[-1.0507,-0.1711],[-1.037,-0.1583],[-1.0233,-0.1456],[-1.0095,-0.1329],[-0.9956,-0.1202],[-0.9817,-0.1076],[-0.9677,-0.0951],[-0.9537,-0.0826],[-0.9396,-0.0702],[-0.9255,-0.0578],[-0.9113,-0.0455],[-0.8971,-0.0332],[-0.8828,-0.021],[-0.8684,-0.0089],[-0.854,0.0033],[-0.8396,0.0153],[-0.8251,0.0273],[-0.8105,0.0393],[-0.7959,0.0512],[-0.7813,0.063],[-0.7666,0.0748],[-0.7518,0.0866],[-0.737,0.0982],[-0.7221,0.1099],[-0.7072,0.1215],[-0.6922,0.133],[-0.6772,0.1445],[-0.6621,0.1559],[-0.647,0.1673],[-0.6318,0.1786],[-0.6166,0.1899],[-0.6013,0.2011],[-0.586,0.2122],[-0.5706,0.2234],[-0.5583,0.2323],[-0.546,0.2412],[-0.5336,0.25],[-0.5212,0.2588],[-0.5087,0.2675],[-0.4961,0.2762],[-0.4836,0.2848],[-0.4709,0.2933],[-0.4582,0.3018],[-0.4454,0.3103],[-0.4326,0.3187],[-0.4198,0.327],[-0.4069,0.3353],[-0.3939,0.3435],[-0.3809,0.3517],[-0.3678,0.3598],[-0.3546,0.3679],[-0.3415,0.3759],[-0.3282,0.3839],[-0.3149,0.3918],[-0.3016,0.3996],[-0.2882,0.4074],[-0.2747,0.4152],[-0.2612,0.4229],[-0.2476,0.4305],[-0.234,0.4381],[-0.2203,0.4456],[-0.2066,0.4531],[-0.1928,0.4605],[-0.179,0.4679],[-0.1651,0.4752],[-0.1511,0.4824],[-0.1371,0.4896],[-0.1231,0.4968],[-0.109,0.5039],[-0.0948,0.5109],[-0.0806,0.5179],[-0.0663,0.5248],[-0.052,0.5317],[-0.0376,0.5385],[-0.0232,0.5453],[-0.0087,0.552],[0.0059,0.5587],[0.0205,0.5653],[0.0351,0.5718],[0.0498,0.5783],[0.0646,0.5847],[0.0794,0.5911],[0.0943,0.5975],[0.1092,0.6038],[0.1242,0.61],[0.1392,0.6161],[0.1543,0.6223],[0.1694,0.6283],[0.1846,0.6343],[0.1999,0.6403],[0.2152,0.6462],[0.2305,0.652],[0.246,0.6578],[0.2614,0.6636],[0.2769,0.6692],[0.2925,0.6749],[0.3081,0.6805],[0.3238,0.686],[0.4009,0.7631],[-0.0617,2.7986],[-0.1234,3.2304],[-0.1696,3.2766]]);
        polygon(points = [[1.5112,-1.3341],[2.0664,-3.9556],[2.128,-4.1098],[2.1589,-4.3874],[2.2822,-4.8192],[2.3131,-5.0967],[2.6215,-6.3612],[2.8374,-7.5023],[2.9145,-7.6103],[3.593,-7.1477],[3.6221,-7.1228],[3.6509,-7.0977],[3.6794,-7.0721],[3.7075,-7.0463],[3.7353,-7.0201],[3.7627,-6.9936],[3.7899,-6.9667],[3.8166,-6.9395],[3.8431,-6.912],[3.8692,-6.8841],[3.895,-6.8559],[3.9204,-6.8274],[3.9455,-6.7985],[3.9703,-6.7693],[3.9947,-6.7398],[4.0188,-6.7099],[4.0425,-6.6797],[4.066,-6.6492],[4.0891,-6.6183],[4.1118,-6.587],[4.1342,-6.5555],[4.1563,-6.5236],[4.178,-6.4914],[4.1995,-6.4588],[4.2205,-6.4259],[4.2413,-6.3927],[4.2617,-6.3591],[4.2817,-6.3252],[4.3014,-6.2909],[4.3208,-6.2564],[4.3399,-6.2214],[4.3586,-6.1862],[4.377,-6.1506],[4.3951,-6.1147],[4.4128,-6.0784],[4.4301,-6.0418],[4.4472,-6.0049],[4.4639,-5.9676],[4.4803,-5.93],[4.4963,-5.8921],[4.512,-5.8538],[4.5274,-5.8152],[4.5424,-5.7763],[4.5571,-5.737],[4.5714,-5.6974],[4.5854,-5.6574],[4.5991,-5.6171],[4.6125,-5.5765],[4.6255,-5.5355],[4.6382,-5.4942],[4.6505,-5.4526],[4.6625,-5.4107],[4.6742,-5.3683],[4.6855,-5.3257],[4.6965,-5.2827],[4.7072,-5.2394],[4.7175,-5.1958],[4.7275,-5.1518],[4.7371,-5.1075],[4.7465,-5.0628],[4.7554,-5.0178],[4.7641,-4.9725],[4.7724,-4.9268],[4.7804,-4.8808],[4.7804,-4.0481],[4.657,-3.493],[4.4103,-2.907],[3.9477,-2.2594],[3.9334,-2.2438],[3.9191,-2.2283],[3.9047,-2.213],[3.8901,-2.1977],[3.8755,-2.1826],[3.8607,-2.1675],[3.8459,-2.1526],[3.8309,-2.1378],[3.8158,-2.123],[3.8006,-2.1084],[3.7853,-2.0939],[3.77,-2.0795],[3.7544,-2.0652],[3.7388,-2.0509],[3.7231,-2.0368],[3.7073,-2.0228],[3.6914,-2.0089],[3.6753,-1.9951],[3.6592,-1.9815],[3.6429,-1.9679],[3.6266,-1.9544],[3.6101,-1.941],[3.5935,-1.9277],[3.5768,-1.9146],[3.5601,-1.9015],[3.5432,-1.8885],[3.5262,-1.8757],[3.5091,-1.8629],[3.4918,-1.8503],[3.4745,-1.8377],[3.4571,-1.8253],[3.4396,-1.8129],[3.4219,-1.8007],[3.4042,-1.7886],[3.3863,-1.7765],[3.3683,-1.7646],[3.3503,-1.7528],[3.3321,-1.7411],[3.3138,-1.7295],[3.2954,-1.7179],[3.2769,-1.7065],[3.2583,-1.6952],[3.2396,-1.684],[3.2208,-1.6729],[3.2019,-1.662],[3.1828,-1.6511],[3.1637,-1.6403],[3.1444,-1.6296],[3.1251,-1.619],[3.1056,-1.6086],[3.0861,-1.5982],[3.0664,-1.5879],[3.0466,-1.5778],[3.0267,-1.5677],[3.0067,-1.5578],[2.9866,-1.5479],[2.9664,-1.5382],[2.9461,-1.5286],[2.9257,-1.519],[2.9051,-1.5096],[2.8845,-1.5003],[2.8638,-1.491],[2.8429,-1.4819],[2.822,-1.4729],[2.2668,-1.3187],[1.5575,-1.2879]]);
    }
}
// Removed unused legacy definition: v17_racket_background_boolean_2d
