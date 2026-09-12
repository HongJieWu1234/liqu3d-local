// A simple two-color starter product. Dimensions are in millimeters.
/* [Personalize] */
name_text = "Mia";
base_color = "LightBlue"; // [LightBlue,Pink,White,Black]
text_color = "Black"; // [Black,White,Red,Navy]

/* [Size] */
tag_width = 70; // [40:1:120]
tag_height = 24; // [20:1:40]

/* [Hidden] */
$fn = 48;
assert(len(name_text) > 0 && len(name_text) <= 30, "Use 1 to 30 characters per name for this starter tag.");
color(base_color)
difference() {
  linear_extrude(2)
    offset(r=3) square([tag_width-6,tag_height-6],center=true);
  translate([-tag_width/2+6,0,-0.1]) cylinder(h=2.2,r=2);
}
color(text_color)
translate([4,0,2])
  linear_extrude(0.6)
    text(name_text, size=min(12,(tag_width-18)/(max(1,len(name_text))*0.85)),
      font="Liberation Sans:style=Bold",halign="center",valign="center");
