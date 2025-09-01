import { appStore } from '../lib/Store.js';
import { httpJSON } from '../lib/Http.js';

const root = document.getElementById('status-bar');

function render(state) {
  root.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'status';
  const dot = document.createElement('span');
  dot.className = 'dot ' + (state.backendStatus === 'ok' ? 'ok' : (state.backendStatus === 'bad' ? 'bad' : ''));
  const label = document.createElement('span');
  label.textContent = state.backendStatus === 'ok' ? 'Backend OK' :
                      state.backendStatus === 'bad' ? 'Backend con problemas' : 'Backend desconocido';
  wrap.append(dot, label);
  root.appendChild(wrap);
}

appStore.subscribe(render);
render(appStore.get());

async function ping() {
  try {
    await httpJSON('/api/health', { method: 'GET', timeout: 5000 });
    appStore.set({ backendStatus: 'ok' });
  } catch {
    appStore.set({ backendStatus: 'bad' });
  }
}

setInterval(ping, 10000);
ping();
