export const isMacPlatform = () => /Mac|iPhone|iPad|iPod/i.test(globalThis.navigator?.userAgentData?.platform || globalThis.navigator?.platform || '');

export function editorShortcutAction(event, mac = isMacPlatform()) {
  if (event.altKey || event.isComposing || event.defaultPrevented) return null;
  const command = mac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
  const key = ['Backspace', 'Delete'].includes(event.code) ? event.code.toLowerCase() : event.key?.toLowerCase();
  if (command) {
    if (key === 'z') return event.shiftKey ? 'redo' : 'undo';
    if (event.shiftKey) return null;
    return { c: 'copy', v: 'paste', backspace: 'remove', delete: 'remove', enter: 'undoColorArrangement' }[key] || null;
  }
  if (event.ctrlKey || event.metaKey || !event.shiftKey) return null;
  return key === 'backspace' ? 'remove' : null;
}

export function historyShortcutAction(event, mac = isMacPlatform()) {
  const action = editorShortcutAction(event, mac);
  return ['undo', 'redo', 'undoColorArrangement'].includes(action) ? action : null;
}

export class HeldHistoryShortcut {
  constructor(step, allowed, { delay = 350, interval = 100, schedule = (callback, ms) => globalThis.setTimeout(callback, ms), cancel = timer => globalThis.clearTimeout(timer), onError = () => {} } = {}) {
    Object.assign(this, { step, allowed, delay, interval, schedule, cancel, onError });
    this.held = null;
    this.timer = null;
    this.running = false;
  }
  keyDown(event) {
    const action = historyShortcutAction(event);
    if (!action || !this.allowed(event.target)) { if (this.held) this.stop(); return false; }
    event.preventDefault();
    if (event.repeat && !this.held) return true;
    if (this.held?.action === action) return true;
    this.stop();
    this.held = { action, key: event.key?.toLowerCase(), code: event.code, target: event.target, first: true };
    void this.tick(this.held);
    return true;
  }
  keyUp(event) {
    if (!this.held) return;
    if (event.key?.toLowerCase() === this.held.key || (event.code && event.code === this.held.code)
      || ['Shift', 'Control', 'Meta'].includes(event.key) || historyShortcutAction(event) !== this.held.action) this.stop();
  }
  stop() {
    this.held = null;
    this.cancel(this.timer);
    this.timer = null;
  }
  async tick(held) {
    if (this.held !== held) return;
    if (!this.allowed(held.target)) { this.stop(); return; }
    if (this.running) {
      this.timer = this.schedule(() => void this.tick(held), this.interval);
      return;
    }
    this.running = true;
    let changed = false;
    try { changed = await this.step(held.action); }
    catch (error) { this.onError(error); }
    finally { this.running = false; }
    if (this.held !== held) return;
    if (!changed || held.action === 'undoColorArrangement') { this.stop(); return; }
    const wait = held.first ? this.delay : this.interval;
    held.first = false;
    this.timer = this.schedule(() => void this.tick(held), wait);
  }
}
