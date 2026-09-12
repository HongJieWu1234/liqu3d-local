import assert from 'node:assert/strict';
import {initColorBudgetUi} from '../public/color-budget-ui.js';
class Control {
  listeners={};disabled=false;value='';textContent='';open=false;style={};
  addEventListener(name,fn){this.listeners[name]=fn;}
  fire(name,event={}){return this.listeners[name]?.({preventDefault(){},...event});}
  focus(){this.focused=true;}
  setAttribute(name,value){this[name]=value;}
  getBoundingClientRect(){return {left:20,right:360,top:20,bottom:320,width:340,height:300};}
  showModal(){this.open=true;}
  close(){this.open=false;}
}
const checkbox=new Control(),button=new Control(),dialog=new Control(),form=new Control(),mode=new Control(),maximum=new Control(),submit=new Control(),message=new Control(),cancel=new Control(),radios=[new Control(),new Control()];
form.elements={mode,maximum};form.querySelector=()=>submit;form.querySelectorAll=()=>radios;
dialog.querySelector=selector=>selector==='form'?form:selector==='[role="status"]'?message:cancel;
globalThis.innerWidth=1000;globalThis.innerHeight=800;
let settings={enabled:false,maxFilamentSlots:4},calls=0,behavior='success',release,activeSignal,focused=0,errors=[];
const ui=initColorBudgetUi({checkbox,button,dialog,focusWorkspace:()=>focused++,onError:error=>errors.push(error.message),getSettings:()=>settings,disable:()=>{settings.enabled=false;},apply:async(next,signal,status)=>{
 calls++;activeSignal=signal;assert.equal(dialog.open,false,'Apply closes before generation starts');assert.equal(signal.aborted,false,'Dismissing on Apply must not cancel generation');
 if(behavior==='wait')await new Promise(resolve=>release=resolve);
 if(signal.aborted)return false;
 if(behavior==='throw')throw new Error('Renderer unavailable.');
 if(behavior==='fail'){status('No arrangement found.');return false;}
 settings=next;return true;
}});
const enable=()=>{checkbox.checked=true;checkbox.fire('change');};
const choose=value=>{mode.value='maximum';maximum.value=value;form.fire('change');};
enable();assert.equal(dialog.open,true);assert.equal(checkbox.checked,false);assert.equal(mode.value,'minimum');
choose('50');assert.equal(calls,0,'keystrokes never arrange');cancel.fire('click');assert.equal(settings.maxColorChanges,undefined);
for(const value of ['', '-1','1.5','Infinity']) {
 button.fire('click');choose(value);await form.fire('submit');assert.match(message.textContent,/whole number/);assert.equal(calls,0);cancel.fire('click');
}
button.fire('click');choose('50');await form.fire('submit');assert.equal(settings.maxColorChanges,50);assert.equal(dialog.open,false);
button.fire('click');assert.equal(mode.value,'maximum');assert.equal(maximum.value,'50');choose('36');dialog.fire('cancel');assert.equal(settings.maxColorChanges,50);
button.fire('click');choose('36');dialog.fire('click',{target:dialog,clientX:0,clientY:0});assert.equal(dialog.open,false);assert.equal(settings.maxColorChanges,50);
behavior='fail';button.fire('click');choose('36');await form.fire('submit');assert.equal(dialog.open,false);assert.equal(settings.maxColorChanges,50);assert.match(message.textContent,/No arrangement/);
behavior='wait';button.fire('click');choose('36');const waiting=form.fire('submit');assert.equal(submit.disabled,true);assert.equal(dialog.open,false);assert.equal(activeSignal.aborted,false);ui.close();assert.equal(activeSignal.aborted,true);release();await waiting;assert.equal(settings.maxColorChanges,50);assert.equal(submit.disabled,false);
behavior='throw';button.fire('click');choose('36');await form.fire('submit');assert.deepEqual(errors,['Renderer unavailable.']);assert.equal(settings.maxColorChanges,50);
assert.equal(focused,calls,'Return focus to the workspace on every valid Apply');
behavior='success';button.fire('click');choose('0');await form.fire('submit');assert.equal(settings.maxColorChanges,0);
button.fire('click');mode.value='minimum';await form.fire('submit');assert.equal(settings.maxColorChanges,undefined);assert.equal(settings.enabled,true);
console.log('Budget controls passed: drafts, validation, zero, failure, Cancel/Escape/outside cancellation, abort, saved mode and explicit Apply.');

// Instant's existing slot save must preserve the budget and disabled state.
const {readFile}=await import('node:fs/promises'),{runInNewContext}=await import('node:vm');
const instant=await readFile(new URL('../public/instant.js',import.meta.url),'utf8');
const slots={value:'8',checkValidity:()=>true,reportValidity:()=>false};let body;
const instantState={state:{config:{colorOptimization:{enabled:true,maxFilamentSlots:4,maxColorChanges:50}}},$:()=>slots,save:value=>body=value};
runInNewContext(instant.slice(instant.indexOf('function saveColorSettings('),instant.indexOf('\ninitColorBudgetUi({')),instantState);
instantState.saveColorSettings();assert.equal(body.colorOptimization.maxColorChanges,50);assert.equal(body.colorOptimization.maxFilamentSlots,8);
instantState.saveColorSettings({...instantState.state.config.colorOptimization,enabled:false});assert.equal(body.colorOptimization.enabled,false);assert.equal(body.colorOptimization.maxColorChanges,50);
instantState.saveColorSettings({enabled:true,maxFilamentSlots:8});assert.equal(body.colorOptimization.maxColorChanges,undefined,'Minimum mode removes the limit');
slots.checkValidity=()=>false;body=null;instantState.saveColorSettings();assert.equal(body,null,'Invalid slot input is not saved');
console.log('Instant controls passed: slot changes preserve the limit; disable, minimum mode and invalid input.');

// Old workspaces had an invisible four-color cap. Maximum mode now defaults to
// all colors, while an explicitly chosen hardware capacity persists.
const capacity=new Control();form.elements.filamentSlots=capacity;
settings={enabled:true,maxFilamentSlots:4,maxColorChanges:1000};
initColorBudgetUi({checkbox,button,dialog,getSettings:()=>settings,maximumDefaultsToAllColors:true,
  disable(){},apply:async next=>{settings=next;}});
button.fire('click');assert.equal(capacity.value,'64');assert.equal(maximum.value,'1000');
await form.fire('submit');assert.equal(settings.maxFilamentSlots,64);assert.equal(settings.filamentSlotsConfigured,false);
button.fire('click');capacity.value='4';capacity.fire('change');form.fire('change');
assert.equal(capacity.value,'4','Form updates do not overwrite an explicit capacity');
await form.fire('submit');assert.equal(settings.maxFilamentSlots,4);
button.fire('click');assert.equal(capacity.value,'4','The chosen capacity survives reopening');
capacity.value='0';await form.fire('submit');assert.match(message.textContent,/capacity/);assert.equal(settings.maxFilamentSlots,4);
cancel.fire('click');
settings={enabled:false,maxFilamentSlots:4};button.fire('click');assert.equal(capacity.value,'4');
choose('1000');assert.equal(capacity.value,'64','Selecting maximum mode prioritizes packing all colors together');
await form.fire('submit');assert.equal(settings.maxFilamentSlots,64);
console.log('Workspace capacity passed: legacy defaults, all-color maximum mode, explicit limits, persistence and validation.');

settings={enabled:false,maxFilamentSlots:4};button.fire('click');await form.fire('submit');
assert.equal(settings.filamentSlotsConfigured,false,'Applying minimum mode does not silently make four colors an explicit limit');
button.fire('click');choose('1000000');assert.equal(capacity.value,'64');await form.fire('submit');
assert.equal(settings.maxFilamentSlots,64);assert.equal(settings.maxColorChanges,1000000);

settings={enabled:true,maxFilamentSlots:4,filamentSlotsConfigured:true};button.fire('click');choose('1000000');
assert.equal(capacity.value,'64','A capacity from minimum mode does not silently constrain maximum mode');
cancel.fire('click');
