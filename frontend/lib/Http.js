const DEFAULT_TIMEOUT_MS = 15000;

function withTimeout(promise, ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort('timeout'), ms);
  return {
    signal: controller.signal,
    run: promise(controller, () => clearTimeout(timeout))
  };
}

export async function httpJSON(path, { method = 'GET', body, headers = {}, timeout = DEFAULT_TIMEOUT_MS } = {}) {
  const url = path.startsWith('http') ? path : `${location.origin}${path}`;
  const exec = withTimeout(async (controller, clear) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      const contentType = res.headers.get('content-type') || '';
      const isJSON = contentType.includes('application/json');
      const data = isJSON ? await res.json().catch(() => null) : await res.text();
      if (!res.ok) {
        const err = new Error((data && data.error && data.error.message) || `HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    } finally {
      clear();
    }
  }, timeout);

  return exec.run;
}
