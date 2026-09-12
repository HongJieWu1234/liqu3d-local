import { isValidPlateId } from './plate-ids.js';

export class PlateShortcutBuffer {
  constructor(commit, { delay = 700, schedule = setTimeout, unschedule = clearTimeout, pending = () => {} } = {}) {
    Object.assign(this, { commit, delay, schedule, unschedule, onPending: pending });
    this.current = null;
  }
  cancel() {
    if (this.current) this.unschedule(this.current.timer);
    this.current = null;
  }
  handle(event, payload) {
    if (event.key === 'Escape') { const handled = Boolean(this.current); this.cancel(); return handled; }
    if (event.repeat || event.isComposing || event.metaKey || event.ctrlKey || event.altKey) return false;
    const digit = event.code?.match(/^Digit([0-9])$/)?.[1] ?? (/^[0-9]$/.test(event.key) ? event.key : null);
    if (this.current && digit !== null) {
      const { letter, payload: saved } = this.current;
      this.cancel(); this.commit(`${letter}${digit}`, saved); return true;
    }
    if (event.key === 'Shift') return false;
    const letter = String(event.key || '').toUpperCase();
    if (!event.shiftKey || !/^[A-Z]$/.test(letter) || !isValidPlateId(letter)) { this.cancel(); return false; }
    this.cancel();
    const current = { letter, payload, timer: null };
    this.current = current;
    current.timer = this.schedule(() => {
      if (this.current !== current) return;
      this.current = null; this.commit(letter, payload);
    }, this.delay);
    this.onPending(letter);
    return true;
  }
}
