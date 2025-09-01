// Cliente API con timeout y reintentos básicos.
const DEFAULT_TIMEOUT = 12000;
const RETRIES = 1;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export class ApiClient {
  constructor(base = "") { this.base = base; }
  async request(path, { method = "GET", headers = {}, body, timeout = DEFAULT_TIMEOUT } = {}) {
    const url = this.base + path;
    let attempt = 0;
    while (true) {
      attempt++;
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), timeout);
      try {
        const res = await fetch(url, {
          method,
          headers: { "Accept": "application/json", ...headers },
          body,
          signal: ctrl.signal
        });
        clearTimeout(to);
        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await res.json() : await res.text();
        if (!res.ok) {
          const err = new Error(data?.message || `HTTP ${res.status}`);
          err.status = res.status; throw err;
        }
        return data;
      } catch (err) {
        clearTimeout(to);
        const retriable = (err.name === "AbortError") || !err.status || (err.status >= 500);
        if (retriable && attempt <= (RETRIES + 1)) {
          await sleep(300 * attempt);
          continue;
        }
        throw err;
      }
    }
  }
  json(path, method, obj, opts = {}) {
    return this.request(path, {
      method,
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      body: JSON.stringify(obj),
      timeout: opts.timeout
    });
  }
}
export const api = new ApiClient("");
