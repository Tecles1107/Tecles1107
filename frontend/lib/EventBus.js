// Bus de eventos simple, con on/off/emit y once.
export class EventBus {
  constructor() { this._events = new Map(); }
  on(event, handler) {
    const arr = this._events.get(event) || [];
    arr.push(handler);
    this._events.set(event, arr);
    return () => this.off(event, handler);
  }
  once(event, handler) {
    const off = this.on(event, (...args) => { off(); handler(...args); });
    return off;
  }
  off(event, handler) {
    const arr = this._events.get(event) || [];
    const idx = arr.indexOf(handler);
    if (idx >= 0) arr.splice(idx, 1);
    this._events.set(event, arr);
  }
  emit(event, payload) {
    const arr = this._events.get(event) || [];
    for (const h of [...arr]) { try { h(payload); } catch { /* noop */ } }
  }
}
export const bus = new EventBus();
