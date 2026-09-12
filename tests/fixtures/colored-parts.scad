render_part = "all";
export_single_design = 1;
pmm_object_selector_param = "export_single_design";
pmm_part_selector_param = "render_part";
pmm_objects = [[1, "Colored layers"]];
base_color = "Red";
text_color = "Blue";
module placed_design(i) {
    if (render_part == "all" || render_part == "base")
        color(base_color) cube([20, 20, 2]);
    if (render_part == "all" || render_part == "tag_text")
        color(text_color) translate([4, 4, 2]) cube([12, 12, 2]);
}
// GENERATED RENDER BLOCK START
placed_design(export_single_design);
// GENERATED RENDER BLOCK END
