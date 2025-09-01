// Store observable sencillo con set/patch/subscribe.
export class Store {
  constructor(initial = {}) { this.state = { ...initial }; this.subs = new Set(); }
  get() { return this.state; }
  set(next) { this.state = { ...next }; this._notify(); }
  patch(p) { this.state = { ...this.state, ...p }; this._notify(); }
  subscribe(fn) { this.subs.add(fn); return () => this.subs.delete(fn); }
  _notify() { for (const fn of this.subs) { try { fn(this.state); } catch {} } }
}
