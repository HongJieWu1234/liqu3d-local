import './setup.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const [app, server, styles] = await Promise.all([
  fs.readFile(new URL('../public/app.js', import.meta.url), 'utf8'),
  fs.readFile(new URL('../server.mjs', import.meta.url), 'utf8'),
  fs.readFile(new URL('../public/styles.css', import.meta.url), 'utf8')
]);

const formHandler = app.slice(app.indexOf("form.addEventListener('input'"), app.indexOf("parameterSearch.addEventListener", app.indexOf("form.addEventListener('input'")));
assert.ok(formHandler.includes('markPlateCardDirty(plate)'), 'Parameter edits should update only the affected plate state');
assert.ok(!formHandler.includes('renderPlateList()'), 'Parameter edits must not rebuild the full plate tray');
assert.ok(formHandler.includes('valueFromParameterInput'), 'Parameter edits should parse the changed control directly');

const renderJobs = app.slice(app.indexOf('async function runRenderJobs('), app.indexOf('\nasync function generatePreview(', app.indexOf('async function runRenderJobs(')));
assert.ok(renderJobs.includes('runtimeRenderSlots'), 'Client render fan-out must follow server capacity');
assert.ok(!renderJobs.includes('Math.min(12'), 'Client must not blindly open twelve render requests');

const animation = app.slice(app.indexOf('function animate('), app.indexOf('\nrequestRender();', app.indexOf('function animate(')));
assert.ok(animation.includes('!panelResizeSuspended'), 'The idle animation loop must not duplicate panel-resize renders');
assert.ok(animation.includes('if (changed) requestRender()'), 'Camera damping continues only while the camera changes');
assert.ok(!animation.includes('requestAnimationFrame'), 'The draw callback must not run an unconditional animation loop');
assert.ok(app.includes("controls.addEventListener('end'"), 'Camera persistence should occur at interaction end instead of every damping frame');

assert.ok(server.includes('AUTO_RENDER_MEMORY_BUDGET_BYTES'), 'Server should budget render memory from host RAM');
assert.ok(server.includes('MANIFOLD_RENDER_SLOTS'), 'Server should tune modern Manifold concurrency separately');
assert.ok(!server.includes('LEGACY_RENDER_SLOTS'), 'Legacy OpenSCAD scheduling must not be present');
assert.ok(server.includes('if (!backendFlag || !manifoldBackend) return null'), 'Local runtime discovery must reject non-Manifold OpenSCAD');
assert.ok(server.includes('fullRenderWeightFor(openscad)'), 'Full-quality renders should reserve weighted capacity');
assert.ok(server.includes('void diskRenderCache.put'), 'Disk-cache persistence should stay off the response-critical path');
assert.ok(server.includes('max-age=31536000, immutable'), 'Versioned static assets should use long immutable caching');

assert.ok(styles.includes('content-visibility: auto'), 'Large production/font lists should skip offscreen rendering work');

console.log('Performance guard tests passed: render fan-out, Manifold-only host tuning, DOM hot paths, idle WebGL, cache latency and long-lived asset caching.');

const serverSource = await fs.readFile(new URL('../server.mjs', import.meta.url), 'utf8');
assert.match(serverSource, /CONFIGURED_FULL_RENDER_WEIGHT \|\| 1/, 'Full-quality exports must not monopolize every Manifold slot by default');


// Hot record refresh: copies own their settings already; read-only refreshes
// should neither deep-copy every parameter nor invalidate live record references.
const {runInNewContext} = await import('node:vm');
const values=Object.fromEntries(Array.from({length:500},(_,i)=>[`parameter_${i}`,i]));
const plate={name:'Benchmark.scad',sourceInstanceId:'bench',defaultPlateId:'A',values,objectDefs:[],objectRecords:{},
 batchInstances:Array.from({length:100},(_,i)=>({id:String(i),sourceKey:'model',plateId:'A',configuration:{parameters:structuredClone(values)}}))};
let clones=0;
const context={structuredClone(value){clones++;return structuredClone(value);},objectIdentityStore:{},activePresetIds:[],parametricPresets:[],createPersistentId:()=> 'source',ensureBatchPlate:id=>id,syncObjectPlateLocation(){}};
const start=app.indexOf('function ensureObjectRecords('),end=app.indexOf('\n}',start)+2;
runInNewContext(app.slice(start,end),context);
context.ensureObjectRecords(plate);const record=plate.objectRecords['instance:0'];clones=0;
const began=performance.now();for(let i=0;i<300;i++)context.ensureObjectRecords(plate);
const elapsed=performance.now()-began;
assert.equal(clones,0,'Existing record reads must not deep-copy settings');
assert.equal(plate.objectRecords['instance:0'],record,'References stay live across refreshes');
plate.batchInstances[0].configuration.parameters.parameter_0=999;
assert.equal(record.configuration.parameters.parameter_0,999);
assert.equal(plate.objectRecords['instance:1'].configuration.parameters.parameter_0,0);
assert.equal(plate.objectRecords.model.configuration.parameters.parameter_0,0,'Copy editing stays isolated from source and other copies');
plate.values={...values,parameter_0:4};context.ensureObjectRecords(plate,{captureConfiguration:true});
assert.equal(plate.objectRecords.model.configuration.parameters.parameter_0,4);
console.log(`Record refresh: ${elapsed.toFixed(1)} ms / 300 refreshes, 101 objects, 500 parameters; zero deep copies.`);

// Personalized pages compress for transport only, never share/cache account markup.
const {promisify}=await import('node:util');const {gzip,gunzipSync}=await import('node:zlib');
const pageContext={Buffer,fs,path:await import('node:path'),PUBLIC_DIR:new URL('../public',import.meta.url).pathname,gzipAsync:promisify(gzip)};
for(const name of ['acceptsGzip','serveAccountPage']){
 const a=server.indexOf(`function ${name}(`),b=server.indexOf('\n}',a)+2;
 runInNewContext((name==='serveAccountPage'?'async ':'')+server.slice(a,b),pageContext);
}
const session={settings:{appearance:{theme:'dark',reduceAnimations:false,density:'compact',accent:'#12ab34'}}};
async function page(encoding){
 const response={headers:{},setHeader(k,v){this.headers[k]=v;},writeHead(status,headers){this.status=status;Object.assign(this.headers,headers);},end(bytes){this.bytes=bytes;}};
 await pageContext.serveAccountPage({headers:{'accept-encoding':encoding}},response,'index.html',session);
 return response;
}
const raw=await page('gzip;q=0'),compressed=await page('gzip');
assert.equal(raw.headers['Content-Encoding'],undefined);
assert.equal(compressed.headers['Content-Encoding'],'gzip');
assert.deepEqual(gunzipSync(compressed.bytes),raw.bytes);
assert.equal(compressed.headers['Cache-Control'],'no-store');assert.match(compressed.headers.Vary,/Cookie, Accept-Encoding/);
assert.ok(compressed.bytes.length<raw.bytes.length/2);
console.log(`Editor HTML: ${raw.bytes.length} → ${compressed.bytes.length} bytes (${(100*(1-compressed.bytes.length/raw.bytes.length)).toFixed(1)}% smaller transfer), identical decoded content.`);
