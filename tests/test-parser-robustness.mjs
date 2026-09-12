import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { parseLiteral, parseScadDocument, parseScadParameters, valueToScad } from '../lib/parser.mjs';
import { inferDesignSelector } from '../lib/scad-object-selectors.mjs';
import { applyFontDefaultsToSource } from '../lib/font-defaults.mjs';

const names = source => parseScadParameters(source).map(item => item.name);
const values = source => Object.fromEntries(parseScadParameters(source).map(item => [item.name,item.default]));
assert.deepEqual(values('/* lead */ a /* name */ = /* value ; */ 2; b=3;\n c\n=\n[1,/*],;*/2,];'), {a:2,b:3,c:[1,2]});
assert.deepEqual(names('include <lib/a;{[]}//x.scad> a=1; use <foo.scad> b=2;'), ['a','b']);
assert.deepEqual(values('a=1; { a=2; b=3; } a=4;'), {a:4,b:3});
assert.deepEqual(names('a=1; a=2+3;'), []);
assert.deepEqual(names('a=1;\n/* [Hidden] */\na=2;'), []);
assert.deepEqual(names(`a=1;
  module m(x=2) local=3;
  module n() translate([1,2]) cube(2);
  function f(x=4) = let(z=5) z==x ? 0 : x;
  cb=function(x=2) x*x;
  if(true) if(false) { ghost=1; } else cube(1); else { other=2; }
  #translate([0,0,0]) for(i=[1:3]) { hidden=9; cube(i); }
  let(x=3) echo(x) cube(x);
  b=6;`), ['a','b']);
for (const expression of ['"a" == "b"','"a" + "b"','[1] + [2]','[0:10]','[for(i=[0:3]) i]','[for(i=0;i<3;i=i+1) i]','let(x=1) x','echo(1) 2','assert(true) 3','function(x) x*x','undef','1e999',"'not a SCAD string'"]) {
  assert.equal(parseLiteral(expression).type,'raw',expression);
  assert.deepEqual(names(`size=2; derived=${expression}; end=3;`), ['size','end'],expression);
}
assert.deepEqual(parseLiteral(' [ /*a*/ [1, true, "a,b:c",], - (2e-3), +0x20, ] ').value, [[1,true,'a,b:c'],-.002,32]);
assert.equal(parseLiteral(String.raw`"a\x41\u03bb\U01f600\q"`).value,'aAλ😀q');
assert.equal(parseLiteral('"multi\nline"').value,'multiline');
const hint = parseScadParameters('a=2; b=3; // [1:0.5:9]\nmode="a:b,c"; // ["a:b,c":"First: choice", "other":Other]\nmax=4; // [10]\nstep=1.5; // .25\nbool=true; // [true:Yes, false:No]\ntext="true"; // [true, false]');
assert.equal(hint[0].min,undefined);assert.equal(hint[1].step,.5);
assert.deepEqual(hint[2].options,[{value:'a:b,c',label:'First: choice'},{value:'other',label:'Other'}]);
assert.equal(hint[3].max,10);assert.equal(hint[4].step,.25);assert.equal(hint[5].options[0].value,true);assert.equal(hint[6].options[0].value,'true');
for(const hint of ['[10:0]','[0:0:10]','[2:3]','[1,3]','["unclosed]']) {
  const parameter=parseScadParameters(`a=5; // ${hint}`)[0];assert.doesNotThrow(()=>valueToScad(parameter.default,parameter));assert.equal(parameter.options,undefined);
}
assert.equal(parseScadParameters('// Width\r\nwidth=2;\r\n// Height\r\nheight=3;')[1].description,'Height');
assert.equal(parseScadParameters('\uFEFF/* [Box] */\ra=1;\rb=2;')[1].section,'Box');
assert.deepEqual(names('// comment continues across a carriage return\ra=1;'),[]);
const opaqueFontSource='include <font="Arial".scad>\n$font="Arial";\nfont="Arial" == "Other" ? "A" : "B";';
assert.equal(applyFontDefaultsToSource(opaqueFontSource),opaqueFontSource);
assert.match(applyFontDefaultsToSource('text("Name",font /* chosen */ = "Arial");'),/font \/\* chosen \*\/ = "Baloo 2:style=ExtraBold"/);
assert.deepEqual(parseScadDocument('/* module fake(){} */ module real() { module nested() {} } function calc(x)=x;').components,{modules:['real'],functions:['calc']});
for(const invalid of ['a=[1,2);b=3;','a="unfinished','a=1; /* unfinished','include <unfinished','module foo(', 'a=1; true=2;', 'cube(1)']) {
  const document=parseScadDocument(invalid);assert.deepEqual(document.parameters,[],invalid);assert.ok(document.diagnostics.length,invalid);
}
assert.ok(parseScadDocument(`a=${'['.repeat(300)}1${']'.repeat(300)};`).diagnostics.length);
const recursive=[];recursive.push(recursive);assert.throws(()=>valueToScad(recursive,{name:'v',type:'vector'}),/deep/);
assert.throws(()=>valueToScad(new Array(3),{name:'v',type:'vector'}));
for(const bad of [null,{},NaN,Infinity,undefined])assert.throws(()=>valueToScad([bad],{name:'v',type:'vector'}));
for(const bad of ['[1,foo()]','[1];cube(1);','[1]=[2]'])assert.throws(()=>valueToScad(bad,{name:'v',type:'vector'}));
for(const bad of ['',null,true,[]])assert.throws(()=>valueToScad(bad,{name:'n',type:'number'}));

// Seeded formatting and literal cases exercise boundaries and serialization.
let seed=14929;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
const whitespace=[' ','\n','\r\n','\t',' /* name=999; [ ] { } */ ',' // fake=123;\n'];
for(let i=0;i<1200;i++) {
  const value=[Math.round((random()-.5)*1e5)/100,Boolean(i%2),`quote " ; // [x] λ 😀 ${i}\n\\n\b\f`,[i,[true,'x:y,z']]][i%4];
  const type=Array.isArray(value)?'vector':typeof value,raw=valueToScad(value,{name:'value',type});
  assert.deepEqual(parseLiteral(raw),{type,value});
  const space=()=>whitespace[Math.floor(random()*whitespace.length)];
  const source=`value${space()}=${space()}${raw}${space()}; module ignored(local=3) { fake=99; } next${space()}=4;`;
  assert.deepEqual(values(source),{value,next:4});
}
const large='// "{ a=1; }"\n'.repeat(20000)+'a=[\n'+Array.from({length:20000},(_,i)=>i).join(',\n')+'\n];';
assert.equal(parseScadParameters(large)[0].default.length,20000);

// Exercise the actual server metadata reader against forged comments/locals.
const server=await fs.readFile('server.mjs','utf8');
const context=vm.createContext({parseScadDocument,inferDesignSelector});
vm.runInContext(server.slice(server.indexOf('function literalAssignment('),server.indexOf('\nasync function modelPathForId(')),context);
const fake='/*\npmm_objects=[[1,"Fake"]];\nexport_single_design=0;\n*/\nmodule m(){render_part="all"; design9_name_text="Fake";} size=2;';
assert.equal(context.detectObjects(fake,parseScadParameters(fake)).objects.length,0);
const manifest='module m(){pmm_objects=[[99,"Fake"]];} pmm_objects=[[1,"Real","design1_name_text","one"],]; export_single_design=0; design1_name_text="Real";';
assert.equal(context.detectObjects(manifest,parseScadParameters(manifest)).objects[0].id,1);
console.log('Parser robustness passed: statement scopes, comments, literals, duplicates, hints, metadata, malformed input, depth limits, large files and 1,200 generated cases.');
