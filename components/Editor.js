// components/Editor.js
import { sanitizeText } from '../lib/Sanitizer.js';

export class Editor {
  constructor(selector, bus, store) {
    this.bus = bus; this.store = store;
    this.root = document.querySelector(selector);
    this.root.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <strong>Editor</strong>
          <button class="btn" id="open-modal">Instrucciones y configuración</button>
          <button class="btn ok" id="add-button">Agregar botón al menú</button>
        </div>
        <div class="panel-body">
          <p>Usa el modal para instrucciones y sandbox seguro para extender funcionalidades sin comprometer seguridad.</p>
          <ul class="instructions">
            <li><strong>Extensiones seguras</strong>: usa el sandbox (iframe) para ejecutar scripts aislados.</li>
            <li><strong>Botones personalizados</strong>: define etiqueta y acción (predefinida) para el menú superior.</li>
            <li><strong>Colores/tema</strong>: cambia variables CSS en tiempo real.</li>
            <li><strong>Ventanas</strong>: elige abrir Canvas/Terminal/Gráficas redimensionando la vista.</li>
          </ul>
        </div>
      </div>
      <div class="modal" id="modal">
        <div class="modal-card" role="dialog" aria-modal="true" aria-label="Editor de configuración">
          <div class="modal-head"><strong>Guía y Sandbox</strong></div>
          <div class="modal-body">
            <div class="instructions">
              Aquí puedes:
              - Agregar botones al menú con acciones: cambiar pestaña, tema, snapshot de estado, abrir archivo, etc.
              - Ejecutar scripts en <em>sandbox</em> aislado sin acceso al DOM principal.
              - Sugerencias: modo presentación (auto-resize y transiciones), layout 2 columnas en Canvas, atajos de teclado.
            </div>
            <fieldset>
              <legend>Agregar botón</legend>
              <label>Etiqueta: <input id="btn-label" placeholder="Mi botón"></label>
              <label>Acción:
                <select id="btn-action">
                  <option value="tab:chat">Abrir Chat</option>
                  <option value="tab:editor">Abrir Editor</option>
                  <option value="tab:files">Abrir Archivos</option>
                  <option value="tab:canvas">Abrir Canvas</option>
                  <option value="tab:graphs">Abrir Gráficas</option>
                  <option value="tab:terminal">Abrir Terminal</option>
                  <option value="theme:toggle">Cambiar tema</option>
                  <option value="state:snapshot">Snapshot de estado</option>
                </select>
              </label>
              <button class="btn ok" id="btn-create">Crear</button>
            </fieldset>

            <fieldset>
              <legend>Sandbox seguro</legend>
              <iframe id="sandbox" title="Sandbox" sandbox="allow-scripts" style="width:100%;height:240px;border:1px solid var(--border);border-radius:8px;"></iframe>
              <small class="instructions">El sandbox no puede acceder al DOM principal ni a cookies. Solo recibe/retorna mensajes serializables.</small>
              <textarea id="sandbox-code" rows="6" placeholder="// Escribe JS seguro aquí. Debe postMessage({log: '...'})."></textarea>
              <button class="btn" id="sandbox-run">Ejecutar en sandbox</button>
              <pre id="sandbox-log" class="instructions" style="white-space:pre-wrap;"></pre>
            </fieldset>
          </div>
          <div class="modal-foot">
            <button class="btn" id="close-modal">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    this.modal = this.root.querySelector('#modal');
    this.root.querySelector('#open-modal').addEventListener('click', () => this.open());
    this.root.querySelector('#close-modal').addEventListener('click', () => this.close());
    this.root.querySelector('#add-button').addEventListener('click', () => this.open());
    this.root.querySelector('#btn-create').addEventListener('click', () => this.createButton());

    // Sandbox setup
    this.sandboxFrame = this.root.querySelector('#sandbox');
    this.root.querySelector('#sandbox-run').addEventListener('click', () => this.runSandbox());
    window.addEventListener('message', (evt) => {
      if (evt.source !== this.sandboxFrame.contentWindow) return;
      const log = this.root.querySelector('#sandbox-log');
      log.textContent += `\n[sandbox] ${JSON.stringify(evt.data)}`;
    });
    this.initSandbox();
  }

  open() { this.modal.classList.add('open'); }
  close() { this.modal.classList.remove('open'); }

  createButton() {
    const label = this.root.querySelector('#btn-label').value.trim().slice(0, 24) || 'Acción';
    const action = this.root.querySelector('#btn-action').value;
    const nav = document.querySelector('.nav');
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => this.handleAction(action));
    nav.appendChild(btn);
    this.bus.emit('trace', { type: 'editor:add-button', label, action });
  }

  handleAction(action) {
    if (action.startsWith('tab:')) {
      const tab = action.split(':')[1];
      document.querySelector(`.tab-btn[data-tab="${tab}"]`)?.click();
      return;
    }
    if (action === 'theme:toggle') {
      document.documentElement.classList.toggle('light');
      this.bus.emit('status', 'Tema alternado');
      return;
    }
    if (action === 'state:snapshot') {
      const snap = this.store.snapshot();
      this.bus.emit('status', `Snapshot con ${Object.keys(snap).length} claves`);
      console.log('snapshot', snap);
      return;
    }
  }

  initSandbox() {
    const doc =
      `<script>window.addEventListener('message',e=>{try{const fn=new Function('postMessage','data',e.data.code);fn((m)=>parent.postMessage(m,'*'),e.data);}catch(err){parent.postMessage({error:String(err)},'*');}});<\/script>`;
    this.sandboxFrame.srcdoc = doc;
  }

  runSandbox() {
    const code = this.root.querySelector('#sandbox-code').value;
    this.sandboxFrame.contentWindow.postMessage({ code }, '*');
  }
}
