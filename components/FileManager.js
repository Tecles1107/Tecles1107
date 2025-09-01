// components/FileManager.js
export class FileManager {
  constructor(selector, bus, store) {
    this.bus = bus; this.store = store;
    this.root = document.querySelector(selector);
    this.root.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <strong>Archivos</strong>
          <button class="btn" id="new">Nuevo</button>
          <button class="btn" id="import">Importar JSON</button>
          <button class="btn" id="export">Exportar JSON</button>
        </div>
        <div class="panel-body">
          <ul class="file-list" id="list"></ul>
        </div>
      </div>
    `;
    this.list = this.root.querySelector('#list');
    this.root.querySelector('#new').addEventListener('click', () => this.create());
    this.root.querySelector('#import').addEventListener('click', () => this.import());
    this.root.querySelector('#export').addEventListener('click', () => this.export());
    this.render();
  }

  render() {
    const files = this.store.files();
    this.list.innerHTML = '';
    files.forEach(f => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${f.name}</span>
        <span>
          <button class="btn" data-act="open">Abrir</button>
          <button class="btn" data-act="rename">Renombrar</button>
          <button class="btn danger" data-act="delete">Borrar</button>
        </span>`;
      li.querySelector('[data-act="open"]').add
