import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parseScadParameters, parseLiteral, valueToScad } from '../lib/parser.mjs';

// Differential checks against OpenSCAD, using only these synthetic fixtures.
const execute = promisify(execFile), directory = await fs.mkdtemp(path.join(os.tmpdir(),'pmm-parser-runtime-'));
const literals = ['0','-0','- .125','+(2e-3)','--4','0x2f','true','false','[]','[1,2,]','[[1,true], "a,b:c", [-3,],]',
  String.raw`"quotes \" and \\ slash"`, String.raw`"\x41\x00\u03BB\U01f600\q"`,
  String.raw`"\n\r\t\b\f"`, String.raw`"\u0008\u000c"`, String.raw`"literal \\n and \\b"`, '"line\nbreak"', '"line\\\nbreak"'];
try {
  const assertions = literals.map((literal,index) => {
    const parsed = parseLiteral(literal); assert.notEqual(parsed.type,'raw',literal);
    return `assert((${literal}) == (${valueToScad(parsed.value,{name:'value',type:parsed.type})}), "Literal ${index}");`;
  });
  // Global blocks and reassignments must agree with the engine's actual scope.
  const source = `size=1; {size=2; width=3;} size=4;
module nested(size=99) { width=100; cube(size); }
function helper(x=5) = let(size=33) size+x;
derived=size*width;
text="unchanged";
${assertions.join('\n')}
echo("RESULT",size,width,derived,text);
assert(derived==12); cube([size,width,1]);`;
  const file = path.join(directory,'case.scad'); await fs.writeFile(file,source);
  const original = path.join(directory,'original.echo'), repeated = path.join(directory,'repeated.echo');
  const run = async (output, definitions=[]) => {
    await execute(process.env.OPENSCAD_BIN || 'openscad',['-o',output,...definitions,file],{timeout:20000,maxBuffer:1024*1024});
    const report = await fs.readFile(output,'utf8'); assert.ok(!/ERROR:/.test(report),report);
    return report.split('\n').filter(line=>line.startsWith('ECHO:')).join('\n');
  };
  const params = parseScadParameters(source); assert.deepEqual(params.map(p=>p.name),['size','width','text']);
  const definitions=params.flatMap(parameter=>['-D',`${parameter.name}=${valueToScad(parameter.default,parameter)}`]);
  assert.equal(await run(repeated,definitions),await run(original));
  console.log(`OpenSCAD differential parser tests passed: ${literals.length} literal forms, global scopes, duplicate assignments and dependent expressions.`);
} finally { await fs.rm(directory,{recursive:true,force:true}); }
