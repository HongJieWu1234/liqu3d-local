import { initColorBudgetUi } from './color-budget-ui.js?v=2';
import { downloadRecordedExport } from './export-history-ui.js?v=14';
import { createMatchPicker, closeMatchPicker } from './instant-match-picker.js?v=1.0.0-instant5';
import { PRINTERS, PRINT_SETTINGS_GROUPS, SUPPORTED_NOZZLES } from './print-settings-schema.js';
import { acceptsModelUpload, readSelectedFile, readModelFiles } from './instant-file-reader.js?v=1.0.0-sandbox1';
const $ = id => document.getElementById(id);
const id = new URLSearchParams(location.search).get('id');
const countLabel=(count,noun)=>`${count} ${noun}${count===1?'':'s'}`;
let state, poll, busy = false, pendingChanges = 0, responseVersion = 0, changes = Promise.resolve();
let startingGeneration = false, creatingCopy = false, pendingCopy = null;
let downloading=false;
const dirtyForms = new Set();
const node = (tag, text, cls) => { const el=document.createElement(tag);if(text!=null)el.textContent=text;if(cls)el.className=cls;return el; };
async function api(action='',body,method=body===undefined?'GET':'POST') {
  const response=await fetch(`/api/instants/${encodeURIComponent(id)}${action}`,{method,headers:{'Content-Type':'application/json'},...(body!==undefined?{body:JSON.stringify(body)}:{})});
  if(response.status===401){location.assign('/login');throw new Error('Please sign in.');}
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not update Quick batch.');return data;
}
function error(err){$('message').textContent=err.message;}
function change(action,body,method){
  pendingChanges++;responseVersion++;busy=true;clearTimeout(poll);if(action!=='/runs')pendingCopy=null;renderProgress();
  changes=changes.then(async()=>{
    $('message').textContent='';
    try{state=await api(action,body,method);if(body?.printProfile)dirtyForms.delete('printForm');render();return true;}catch(err){error(err);return false;}
    finally{busy=--pendingChanges>0;renderProgress();if(!busy)schedulePoll();}
  });
  return changes;
}
function save(body){return change('',body,'PUT');}
function option(select,value,label){const el=node('option',label);el.value=value;select.append(el);}
function renderProgress(){
  const working=busy||startingGeneration||creatingCopy;
  for(const button of document.querySelectorAll('[data-remove-file],#clearModelBtn'))button.disabled=working;
  for(const control of $('printForm').elements)control.disabled=startingGeneration||creatingCopy;
  $('optimizeColors').disabled=$('instantColorSettings').disabled=working;
  const current=state.currentMatchesInputs===false?null:state.current,progress=current?.progress||{},running=['queued','running'].includes(current?.status);
  const needsGeneration=state.needsGeneration||dirtyForms.size>0;
  document.querySelector('.result-section').dataset.state=running?'running':current?.status==='failed'?'failed':state.result?'ready':'waiting';
  $('resultTitle').textContent=creatingCopy?'Opening workspace…':running?(pendingCopy?'Preparing workspace':'Making your 3MF'):needsGeneration&&state.validation.ready?'Ready to generate':state.result?'Your 3MF is ready':'Your 3MF';
  $('resultEmpty').hidden=!!state.result||running||current?.status==='failed';
  $('resultEmpty').textContent=state.validation.ready?'Choose your settings, then click Generate or create a workspace copy.':!state.config.ordersText?'Add your orders to get started.':!state.config.entry?'Add your SCAD project to continue.':'Check the highlighted fields to continue.';
  $('runStatus').textContent=!state.validation.ready&&!running?'Needs input':running?`${progress.stage||'Queued'}${progress.total?` · ${progress.done||0}/${progress.total}`:''}`:current?.status==='failed'?'Generation failed':current?.status==='cancelled'?'Cancelled':needsGeneration?'Ready to generate':current?.status==='ready'?(progress.skippedCount?'Ready · some objects skipped':'Ready'):'Waiting for inputs';
  $('runProgress').hidden=!running;$('runProgress').value=progress.total?100*(progress.done||0)/progress.total:0;
  $('runError').textContent=current?.error||'';$('cancelRunBtn').hidden=!running;
  $('generateBtn').disabled=!state.validation.ready||working||running;
  $('generateBtn').textContent=startingGeneration?'Saving settings…':running?'Generating…':'Generate';
  $('downloadBtn').hidden=!state.result;$('downloadBtn').href=`/api/instants/${encodeURIComponent(id)}/result`;
  const result=state.result?.progress;
  $('downloadBtn').textContent=result?.archiveExtension==='zip'?'Download 3MF bundle ↓':'Download 3MF ↓';
  const previous=state.result&&(needsGeneration||state.current?.id!==state.result.id||!state.validation.ready||(!state.canConvert&&!result?.skippedCount));
  $('resultSummary').textContent=result?`${state.result.ordersName||'Orders'} · ${countLabel(result.objectCount,'object')} · ${countLabel(result.plateCount,'plate')}${previous?' · Previous successful result':''}`:'';
  const optimization=result?.colorOptimization;
  $('colorSummary').textContent=optimization?.enabled?(optimization.estimatedSwaps==null?'Color estimate unavailable for part of this batch.':`~${optimization.estimatedSwaps.toLocaleString()} estimated changes${optimization.maxColorChanges===undefined?'':` · limit ${optimization.maxColorChanges.toLocaleString()}`}${optimization.baselineFeasible&&optimization.baselineSwaps>optimization.estimatedSwaps?` · previously ${optimization.baselineSwaps.toLocaleString()}`:''} · ${optimization.maxFilamentSlots} slots`):'';
  $('colorEstimateDetails').hidden=!optimization?.enabled;
  const towers=result?.primeTowers||[];
  $('towerSummary').textContent=towers.length?`Estimated prime towers: ${towers.map(tower=>`${tower.plateId}: ${tower.width.toFixed(1)} × ${tower.depth.toFixed(1)} mm`).join(' · ')}. Packing also reserves brim and clearance.`:'';
  const warnings=[...(optimization?.skipped||[]).map(item=>`Order ${item.order}, copy ${item.copy} skipped: ${item.reason}`)];
  if(optimization?.unoptimized?.length)warnings.push(`${countLabel(optimization.unoptimized.length,'object')} packed without color optimization: ${[...new Set(optimization.unoptimized.map(item=>item.reason))].join(' ')}`);
  $('resultWarnings').replaceChildren(...warnings.map(text=>node('li',text)));$('resultWarnings').hidden=!warnings.length;
  $('convertBtn').disabled=$('temporaryCopyBtn').disabled=!state.validation.ready||working||!!pendingCopy;
}
function schedulePoll(){clearTimeout(poll);if(busy)return;if(['queued','running'].includes(state?.current?.status))poll=setTimeout(async()=>{const version=responseVersion;try{const next=await api();if(version!==responseVersion||busy)return;state.current=next.current;state.currentMatchesInputs=next.currentMatchesInputs;state.result=next.result;state.canConvert=next.canConvert;state.needsGeneration=next.needsGeneration;renderProgress();await finishPendingCopy();}catch(err){error(err);}schedulePoll();},1800);}
function render(){
  const focusedMatch=closeMatchPicker()||document.activeElement?.dataset.matchHeader;
  const drafts=[...dirtyForms].flatMap(id=>[...$(id).querySelectorAll('input,select')].map(input=>({form:id,name:input.name,header:input.dataset.header,value:input.value,checked:input.checked})));
  $('instantName').value=state.name;$('ordersLabel').textContent=state.config.ordersName||'Choose an order file';
  $('ordersSection').dataset.filled=Boolean(state.config.ordersText);
  $('ordersHint').textContent=state.config.ordersName?'CSV / TXT · drop a new file to replace':'Drop CSV or TXT here';
  $('ordersAction').textContent=state.config.ordersName?'Replace file ↗':'Browse files ↗';
  $('modelSection').dataset.filled=Boolean(state.config.entry);
  $('modelLabel').textContent=state.config.entry?.split('/').pop()||'Add your SCAD project';
  $('modelHint').textContent=state.files.length?'Add or drop files to update your project':'SCAD, ZIP, or a folder with dependencies';
  const colorSettings=state.config.colorOptimization||{enabled:true,maxFilamentSlots:4};
  $('optimizeColors').checked=colorSettings.enabled;$('filamentSlots').disabled=!colorSettings.enabled;
  if(document.activeElement!==$('filamentSlots'))$('filamentSlots').value=colorSettings.maxFilamentSlots;
  $('orderFormat').value=state.config.format==='\t'?'tab':state.config.format||'auto';
  $('orderCount').textContent=state.validation.orderCount?`${countLabel(state.validation.orderCount,'order')}${state.validation.ready?` · ${countLabel(state.validation.objectCount,'object')}`:''}`:'';
  $('message').textContent=state.validation.errors.filter(text=>!text.startsWith('Add ')).join(' ');
  $('fileCount').textContent=state.files.length?countLabel(state.files.length,'file'):'';
  $('clearModelBtn').hidden=!state.files.length;$('fileDetails').hidden=!state.files.length;
  $('filesList').replaceChildren(...state.files.map(file=>{
    const row=node('li'),label=node('span',file.path),remove=node('button','×','remove-file');
    remove.type='button';remove.dataset.removeFile=file.path;remove.setAttribute('aria-label',`Remove ${file.path}`);remove.title=`Remove ${file.path}`;
    remove.addEventListener('click',()=>change('/files',{remove:[file.path]}));row.append(label,remove);return row;
  }));
  const scads=state.files.filter(file=>/\.scad$/i.test(file.path));
  $('entryField').hidden=scads.length<2&&Boolean(state.config.entry)||!scads.length;$('entryScad').replaceChildren();option($('entryScad'),'','Choose SCAD');for(const file of scads)option($('entryScad'),file.path,file.path);$('entryScad').value=state.config.entry||'';
  $('designField').hidden=state.groups.length<2;$('modelChoice').replaceChildren();const chosen=state.validation.model;option($('modelChoice'),'','Automatic'+(chosen?` · ${chosen.label}`:''));for(const group of state.groups)option($('modelChoice'),group.key,group.label);$('modelChoice').value=(state.config.modelSelection||(state.config.groupKey?'manual':'auto'))==='manual'?state.config.groupKey||'':'';
  $('orderPreview').replaceChildren();if(state.validation.records.length){const table=node('table'),head=node('tr');for(const header of state.validation.headers)head.append(node('th',header));table.append(head);for(const record of state.validation.records){const row=node('tr');for(const header of state.validation.headers)row.append(node('td',record[header]??''));table.append(row);}$('orderPreview').append(table);}
  $('mappingSection').hidden=!state.parameters.length||!state.validation.headers.length;
  $('mappingFields').replaceChildren();
  for(const [index,header] of state.validation.headers.entries()){
    const row=node('div',null,'mapping-row'+(state.validation.unresolved.includes(header)?' unresolved':''));row.append(node('span',header));
    row.append(createMatchPicker({header,index,parameters:state.parameters,match:state.validation.matches?.[header],value:state.validation.mapping[header]||'',onChange:value=>save({mappingPatch:{[header]:value}})}));
    $('mappingFields').append(row);
  }
  if(state.validation.unresolved.length||state.validation.errors.length)$('mappingDetails').open=true;
  if(!state.validation.model&&state.groups.length>1)$('moreOptions').open=true;
  if(state.config.ordersText&&!state.validation.headers.length)$('formatDetails').open=true;
  const openGroups=[...$('printFields').querySelectorAll('details[open]')].map(el=>el.dataset.group);
  buildPrintForm();
  for(const el of $('printFields').querySelectorAll('details'))el.open=openGroups.includes(el.dataset.group);
  for(const draft of drafts){const input=[...$(draft.form).querySelectorAll('input,select')].find(input=>draft.header?input.dataset.header===draft.header:input.name===draft.name);if(input){input.value=draft.value;if(input.type==='checkbox')input.checked=draft.checked;}}
  if(focusedMatch)[...$('mappingFields').querySelectorAll('button')].find(button=>button.dataset.matchHeader===focusedMatch)?.focus({preventScroll:true});
  renderProgress();schedulePoll();
}
function field(labelText,name,value,type='text',values=null){const label=node('label',labelText),input=node(values?'select':'input');input.name=name;if(values){for(const item of values)option(input,typeof item==='object'?item.value:item,typeof item==='object'?item.label:item);input.value=String(value);}else{input.type=type;if(type==='checkbox')input.checked=!!value;else input.value=value??'';if(type==='number')input.step='any';}label.append(input);return label;}
function buildPrintForm(){
  const profile=state.config.printProfile;$('profileSummary').textContent=`${PRINTERS[profile.printer]?.shortLabel||profile.printer} · ${profile.nozzleDiameter} mm · ${profile.settings.filament_type||'PLA'}`;
  const root=$('printFields');root.replaceChildren();const basics=node('div',null,'print-group-fields');
  basics.append(field('Printer','printer',profile.printer,'text',Object.entries(PRINTERS).map(([value,p])=>({value,label:p.label}))),field('Nozzle','nozzleDiameter',profile.nozzleDiameter,'text',SUPPORTED_NOZZLES),field('Plate type','bedType',profile.bedType,'text',['Textured PEI','Smooth PEI','Cool Plate','Engineering Plate']));root.append(basics);
  const limit=field('Objects per plate','maxObjectsPerPlate',state.config.maxObjectsPerPlate,'number');
  Object.assign(limit.lastElementChild,{min:'1',max:'100',step:'1',placeholder:'Auto'});
  limit.append(node('small','Maximum per plate; fewer when needed to fit.'));basics.append(limit);
  for(const group of PRINT_SETTINGS_GROUPS){
    const details=node('details');details.dataset.group=group.id;details.append(node('summary',group.label));
    for(const section of group.sections){
      details.append(node('h3',section.label));const fields=node('div',null,'print-group-fields');
      for(const item of section.settings){
        const input=field(item.label+(item.unit?` (${item.unit})`:''),`setting:${item.key}`,profile.settings[item.key],item.type==='boolean'?'checkbox':['number','percent'].includes(item.type)?'number':'text',item.options||null);
        input.title=item.key;const control=input.lastElementChild;
        if(item.min!=null)control.min=item.min;if(item.max!=null)control.max=item.max;if(item.step!=null)control.step=item.step;
        fields.append(input);
      }
      details.append(fields);
    }
    root.append(details);
  }
}
function decodeText(bytes){let encoding='utf-8';if(bytes[0]===255&&bytes[1]===254)encoding='utf-16le';if(bytes[0]===254&&bytes[1]===255)encoding='utf-16be';return new TextDecoder(encoding,{fatal:true}).decode(bytes);}
async function orders(file){if(!file)return;if(file.size>3*1024*1024)return error(new Error('Order files must be under 3 MB.'));try{await save({ordersName:file.name,ordersText:decodeText(await readSelectedFile(file))});}catch(err){error(err);}}
async function modelFiles(files){try{await change('/files',{files:await readModelFiles(files)});}catch(err){error(err);}}
async function droppedFiles(event){const files=[];async function visit(entry,prefix=''){if(entry.isFile){if(!acceptsModelUpload(entry.name))return;const file=await new Promise((resolve,reject)=>entry.file(resolve,cause=>reject(new Error(`Cannot access “${prefix+entry.name}”. Choose the file again using Choose files, or upload a ZIP of the project.`,{cause}))));Object.defineProperty(file,'relativePath',{value:prefix+file.name});files.push(file);}else if(entry.isDirectory){const reader=entry.createReader();let children;do{children=await new Promise((resolve,reject)=>reader.readEntries(resolve,cause=>reject(new Error(`Cannot access folder “${prefix+entry.name}”. Choose the folder again, or upload a ZIP of the project.`,{cause}))));for(const child of children)await visit(child,prefix+entry.name+'/');}while(children.length);}}const entries=[...event.dataTransfer.items].map(item=>item.webkitGetAsEntry?.()).filter(Boolean);if(entries.length)for(const entry of entries)await visit(entry);else files.push(...event.dataTransfer.files);return files;}
function bindUpload(input,upload){let selection=0;input.addEventListener('change',async()=>{const version=++selection,files=[...input.files];await upload(files);if(version===selection)input.value='';});}
bindUpload($('ordersFile'),files=>orders(files[0]));
for(const input of [$('modelFiles'),$('modelFolder')])bindUpload(input,modelFiles);
$('clearModelBtn').addEventListener('click',()=>change('/files',{replace:true,files:[]}));
$('ordersDrop').addEventListener('dragover',event=>event.preventDefault());$('ordersDrop').addEventListener('drop',event=>{event.preventDefault();orders(event.dataTransfer.files[0]);});
$('modelDrop').addEventListener('dragover',event=>event.preventDefault());$('modelDrop').addEventListener('drop',async event=>{event.preventDefault();try{await modelFiles(await droppedFiles(event));}catch(err){error(err);}});
$('orderFormat').addEventListener('change',event=>save({format:event.target.value==='tab'?'\t':event.target.value}));
$('entryScad').addEventListener('change',event=>save({entry:event.target.value,groupKey:'',modelSelection:'auto',mapping:{}}));
$('modelChoice').addEventListener('change',event=>save({groupKey:event.target.value,modelSelection:event.target.value?'manual':'auto',mapping:{}}));
$('instantName').addEventListener('change',event=>save({name:event.target.value}));
function saveColorSettings(settings=state.config.colorOptimization){
  if(!$('filamentSlots').checkValidity())return $('filamentSlots').reportValidity();
  return save({colorOptimization:{...settings,maxFilamentSlots:Number($('filamentSlots').value)}});
}
initColorBudgetUi({
  checkbox:$('optimizeColors'),button:$('instantColorSettings'),dialog:$('colorBudgetDialog'),
  getSettings:()=>state?.config.colorOptimization||{enabled:true,maxFilamentSlots:4},
  apply:settings=>saveColorSettings(settings),
  disable:()=>saveColorSettings({...state.config.colorOptimization,enabled:false}),
  focusWorkspace:()=>document.querySelector('.result-section').focus({preventScroll:true}),onError:error
});
$('filamentSlots').addEventListener('change',()=>saveColorSettings());
function currentPrintProfile(){
  const profile=structuredClone(state.config.printProfile);
  for(const input of $('printForm').elements){if(!input.name||input.name==='maxObjectsPerPlate')continue;if(input.name.startsWith('setting:'))profile.settings[input.name.slice(8)]=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;else profile[input.name]=input.name==='nozzleDiameter'?Number(input.value):input.value;}
  return profile;
}
function currentPrintSettings(){const value=$('printForm').elements.namedItem('maxObjectsPerPlate').value;return {printProfile:currentPrintProfile(),maxObjectsPerPlate:value===''?null:Number(value)};}
async function openWorkspaceCopy(retention){
  pendingCopy=null;creatingCopy=true;renderProgress();
  try{const workspace=await api('/convert',{retention});location.assign(`/app?workspace=${encodeURIComponent(workspace.id)}`);}
  catch(err){error(err);}finally{creatingCopy=false;renderProgress();}
}
async function finishPendingCopy(){
  if(!pendingCopy)return;
  const current=state.current;
  if(current?.id!==pendingCopy.runId||['failed','cancelled'].includes(current.status)){pendingCopy=null;renderProgress();return;}
  if(current.status!=='ready')return;
  const retention=pendingCopy.retention;pendingCopy=null;
  if(state.canConvert&&!dirtyForms.size)await openWorkspaceCopy(retention);
  else{error(new Error('Some objects could not be generated. Review the warnings and generate again before creating the workspace copy.'));renderProgress();}
}
async function generate(retention=null){
  if(busy||startingGeneration||creatingCopy||pendingCopy||!state.validation.ready)return;
  if(!$('printForm').reportValidity())return;
  startingGeneration=true;renderProgress();
  try{
    if(dirtyForms.has('printForm')&&!await save(currentPrintSettings()))return;
    if(retention&&state.canConvert){await openWorkspaceCopy(retention);return;}
    const running=state.currentMatchesInputs!==false&&['queued','running'].includes(state.current?.status);
    if(!running&&!await change('/runs',{}))return;
    if(retention){pendingCopy={retention,runId:state.current.id};await finishPendingCopy();}
  }finally{startingGeneration=false;renderProgress();schedulePoll();}
}
$('printForm').addEventListener('submit',event=>{event.preventDefault();save(currentPrintSettings());});
$('cancelRunBtn').addEventListener('click',()=>change('/cancel',{}));
$('generateBtn').addEventListener('click',()=>void generate());
$('downloadBtn').addEventListener('click',async event=>{
  event.preventDefault();if(downloading)return;
  downloading=true;$('downloadBtn').setAttribute('aria-disabled','true');$('message').textContent='Preparing export…';
  try {
    const result=await downloadRecordedExport(`/api/instants/${encodeURIComponent(id)}/result`,null,()=>{},{method:'GET'});
    $('message').textContent=`Export downloaded.${result.bambu?.message?` ${result.bambu.message}`:''}`;
  }catch(err){error(err);}finally{downloading=false;$('downloadBtn').removeAttribute('aria-disabled');}
});
for(const id of ['printForm'])$(id).addEventListener('input',()=>{dirtyForms.add(id);pendingCopy=null;renderProgress();});
for(const [buttonId,retention] of [['convertBtn','permanent'],['temporaryCopyBtn','temporary']])$(buttonId).addEventListener('click',()=>void generate(retention));
try{const session=await fetch('/api/auth/session').then(r=>r.json());const appearance=session.user?.preferences?.appearance;if(appearance){document.documentElement.dataset.theme=appearance.theme==='system'?(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):appearance.theme;document.documentElement.style.setProperty('--accent',appearance.accent);}state=await api();render();}catch(err){error(err);}
