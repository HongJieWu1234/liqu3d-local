# Commercial-use audit — V1

## Application

The original Liqu3D application is **proprietary / All Rights Reserved** and is intended to operate as a hosted web service. It is not MIT licensed and is not offered to end users for download, installation, redistribution, or self-hosting. Browser access to the hosted service does not grant a general software license or permission to copy, modify, redistribute, sublicense, sell, mirror, host, or build derivative products from the original application code.

End-user permission is limited to accessing the hosted service under the applicable Terms of Service or other written agreement. Client-side code necessarily delivered to a browser remains proprietary; delivery to a browser does not relicense that code.

The proprietary claim applies only to original application material for which the owner actually holds rights. It does not override third-party licenses or establish provenance for source, models, fonts, profiles, or other assets supplied by someone else.

## OpenSCAD renderer

The supplied production renderer is built from the official moving OpenSCAD development container `openscad/openscad:dev`. OpenSCAD is GPL-2.0-or-later. Commercial use is permitted, but **distributing a built image that contains OpenSCAD creates GPL source/notice obligations for OpenSCAD and GPL-covered material inside that image**. The proprietary application license does not replace or weaken those GPL rights.

Running a locally installed OpenSCAD executable without redistributing it is a different distribution scenario.

## Bambu Studio data

V1 does not bundle Bambu Studio vendor profile files or slicer executable code. `bambu-profiles/BBL` contains only a placeholder in the clean release. Deployment helpers can copy profile files from the operator's own Bambu Studio installation for local/server use. Review Bambu's applicable license/terms before redistributing those imported files; the release builder intentionally excludes them.

The app independently exports 3MF data and can use locally supplied Bambu profile metadata. The proprietary application license does not grant rights to Bambu trademarks, artwork, firmware, profiles, slicer code, or proprietary networking components.

## Third-party components

Third-party components are **not proprietary Liqu3D code** and remain under their original licenses. Major items include:

- OpenSCAD — GPL-2.0-or-later
- Three.js 0.179.1 — MIT
- fflate 0.8.2 — MIT
- Nodemailer 9.0.6 — MIT-0
- Resend 6.25.0 — MIT
- @xmldom/xmldom 0.9.12 — MIT
- standardwebhooks 1.0.0 — MIT
- @stablelib/base64 1.0.1 — MIT
- postal-mime 2.7.5 — MIT-0
- fast-sha256 1.3.0 — Unlicense
- Caddy 2.11.4 image — Apache-2.0
- ImageMagick in the renderer — ImageMagick License
- 3MF Core format — published 3MF specification

Keep `package-lock.json`, license copies, source references, and notices current when dependencies change.

## Fonts and user assets

The clean release intentionally does not bundle third-party custom fonts. Files placed in `fonts/custom`, imported STL/SVG/SCAD assets, model templates, Bambu profiles, and user-supplied dependencies retain their own copyright/license status. Loading them in this application does not make them proprietary to Liqu3D and does not grant commercial rights.

This is a practical engineering/provenance review, not legal advice.
