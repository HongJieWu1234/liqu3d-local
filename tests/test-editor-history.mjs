import './setup.mjs';
import assert from 'node:assert/strict';
import { HeldHistoryShortcut, historyShortcutAction, editorShortcutAction } from '../public/history-shortcuts.js';

Object.defineProperty(globalThis.navigator, 'platform', {value:'Linux', configurable:true});
const event = (key = 'z', extra = {}) => ({ key, code: key === 'Enter' ? 'Enter' : `Key${key.toUpperCase()}`, shiftKey: false, ctrlKey: true,
  target: { tagName: 'CANVAS' }, preventDefault() { this.prevented = true; }, ...extra });
assert.equal(historyShortcutAction(event()), 'undo');
assert.equal(historyShortcutAction(event('u')), null);
assert.equal(historyShortcutAction(event('z',{shiftKey:true})), 'redo');
assert.equal(historyShortcutAction(event('U')), null);
for (const props of [{ctrlKey:false},{shiftKey:true},{metaKey:true},{altKey:true},{isComposing:true},{defaultPrevented:true}]) assert.equal(historyShortcutAction(event('u',props)),null);
for (const code of ['Enter','NumpadEnter']) assert.equal(historyShortcutAction(event('Enter',{code})), 'undoColorArrangement');
for (const mac of [false,true]) {
  for (const [key,code] of [['0','Digit0'],[')','Digit0'],['0','Numpad0'],['Enter','Enter'],['Enter','NumpadEnter'],['_','Minus'],['-','Minus']]) {
    assert.equal(historyShortcutAction({key,code,shiftKey:true},mac),null,'Shift shortcuts no longer undo');
  }
  const mods=mac?{metaKey:true}:{ctrlKey:true};
  for (const [key, action] of [['z','undo'],['c','copy'],['v','paste'],['Backspace','remove'],['Delete','remove']]) {
    const e={key, ...mods};
    assert.equal(editorShortcutAction(e,mac),action);
    assert.equal(editorShortcutAction(e,!mac),null,'Use the platform modifier');
    for(const guard of ['altKey','isComposing','defaultPrevented']) assert.equal(editorShortcutAction({...e,[guard]:true},mac),null);
  }
  assert.equal(historyShortcutAction({key:'z',shiftKey:true,...mods},mac),'redo');
  assert.equal(editorShortcutAction({key:'r',...mods},mac),null,'Browser refresh stays available');
  for(const key of ['u','U','y']) assert.equal(historyShortcutAction({key,...mods},mac),null,'Removed redo shortcuts stay inactive');
}
let timers = new Map(), sequence = 0, calls = [], allowed = true, resolveStep;
const step = action => { calls.push(action); return new Promise(resolve => { resolveStep = resolve; }); };
const shortcut = new HeldHistoryShortcut(step, target => allowed && target.tagName !== 'INPUT', {
  schedule: (callback, delay) => { timers.set(++sequence, { callback, delay }); return sequence; },
  cancel: id => timers.delete(id)
});
const flush = () => new Promise(resolve => setImmediate(resolve));
const fire = () => { const [id, timer] = timers.entries().next().value; timers.delete(id); timer.callback(); return timer.delay; };
const first = event(); shortcut.keyDown(first);
assert.equal(first.prevented, true); assert.deepEqual(calls, ['undo']);
for (let i = 0; i < 20; i++) shortcut.keyDown(event('z', { repeat: true }));
assert.equal(calls.length, 1); assert.equal(timers.size, 0, 'Never queue repeats behind unfinished work');
resolveStep(true); await flush();
assert.equal(fire(), 350); assert.equal(calls.length, 2);
resolveStep(true); await flush(); assert.equal(fire(), 100);
shortcut.keyUp(event()); resolveStep(true); await flush();
assert.equal(timers.size, 0, 'Release during work prevents a later repeat');
shortcut.keyDown(event('z',{shiftKey:true})); assert.equal(calls.at(-1), 'redo');
resolveStep(true); await flush(); fire(); assert.equal(calls.at(-1), 'redo');
resolveStep(false); await flush(); assert.equal(timers.size, 0, 'Stop at end of history');
shortcut.keyDown(event()); resolveStep(true); await flush();
shortcut.keyUp(event('Shift')); assert.equal(timers.size, 0);
shortcut.keyDown(event()); resolveStep(true); await flush(); allowed = false; fire();
assert.equal(shortcut.held, null, 'Opening a dialog/focusing a field stops held work');
allowed = true;
shortcut.keyDown(event('z', { target: { tagName: 'INPUT' } })); assert.equal(shortcut.held, null);
shortcut.keyDown(event()); shortcut.stop(); resolveStep(true); await flush(); assert.equal(timers.size, 0);
// Changing direction while an asynchronous restore runs waits rather than overlapping.
shortcut.keyDown(event()); const previous = resolveStep;
shortcut.keyDown(event('z',{shiftKey:true})); const before = calls.length; fire(); assert.equal(calls.length, before);
previous(true); await flush(); fire(); assert.equal(calls.at(-1), 'redo');
resolveStep(true); await flush(); shortcut.stop();
const stoppedCalls = calls.length;
shortcut.keyDown(event('z', { repeat: true }));
assert.equal(calls.length, stoppedCalls, 'Native repeat cannot resume a shortcut after blur or exhaustion');
assert.equal(timers.size, 0);
for (const released of [event('z',{shiftKey:true}),event('Control',{ctrlKey:false})]) {
  const press=event('z',{shiftKey:true});shortcut.keyDown(press);assert.equal(press.prevented,true,'Ctrl+Shift+Z redoes an edit');
  resolveStep(true);await flush();shortcut.keyUp(released);assert.equal(timers.size,0);assert.equal(shortcut.held,null);
}
const colorUndo=event('Enter',{ctrlKey:true,shiftKey:false});shortcut.keyDown(colorUndo);assert.equal(colorUndo.prevented,true);assert.equal(calls.at(-1),'undoColorArrangement');
resolveStep(true);await flush();assert.equal(timers.size,0,'Holding Ctrl+Enter undoes only one color arrangement');
shortcut.keyDown({...colorUndo,repeat:true});assert.equal(timers.size,0);
shortcut.stop();
for (const mac of [false,true]) {
  Object.defineProperty(globalThis.navigator,'platform',{value:mac?'MacIntel':'Linux',configurable:true});
  const press=event('z',{ctrlKey:!mac,metaKey:mac});
  for(const released of [press,{key:mac?'Meta':'Control'}]) {
    shortcut.keyDown(press);resolveStep(true);await flush();
    assert.equal(calls.at(-1),'undo');assert.equal(timers.size,1);
    shortcut.keyUp(released);assert.equal(timers.size,0);assert.equal(shortcut.held,null);
  }
}
Object.defineProperty(globalThis.navigator,'platform',{value:'Linux',configurable:true});
console.log('Held history shortcuts passed: keys, repeat timing, serialization, release, direction changes, focus and exhaustion.');

// Browser timer functions require their Window receiver, unlike Node timers.
const originalSchedule=globalThis.setTimeout,originalCancel=globalThis.clearTimeout;
let nativeSchedules=0,nativeCancels=0;
try {
  globalThis.setTimeout=function(){assert.equal(this,globalThis);nativeSchedules++;return 123;};
  globalThis.clearTimeout=function(){assert.equal(this,globalThis);nativeCancels++;};
  const defaults=new HeldHistoryShortcut(async()=>true,()=>true);
  defaults.keyDown(event());await flush();assert.equal(nativeSchedules,1);
  defaults.stop();assert.ok(nativeCancels>=2);
} finally {globalThis.setTimeout=originalSchedule;globalThis.clearTimeout=originalCancel;}
console.log('Browser timer receiver regression passed.');
