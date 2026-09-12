import { Resvg } from '@resvg/resvg-js';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const source=await fs.readFile('desktop/icons/app.svg');
await fs.writeFile('desktop/icons/app.png',new Resvg(source).render().asPng());
await fs.mkdir('desktop/icons/App.iconset',{recursive:true});
for(const size of [16,32,128,256,512])for(const scale of [1,2]){
  await fs.writeFile(`desktop/icons/App.iconset/icon_${size}x${size}${scale===2?'@2x':''}.png`,new Resvg(source,{fitTo:{mode:'width',value:size*scale}}).render().asPng());
}
if(process.platform==='darwin')execFileSync('iconutil',['-c','icns','desktop/icons/App.iconset','-o','desktop/icons/app.icns']);
