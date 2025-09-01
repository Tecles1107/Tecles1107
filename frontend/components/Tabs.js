// components/Tabs.js
export class Tabs {
  constructor(bus, views) {
    this.bus = bus; this.views = views;
    this.nav = document.querySelector('.nav');
    this.buttons = Array.from(this.nav.querySelectorAll('.tab-btn'));
    this.sections = new Map(Object.entries({
      chat: document.getElementById('view-chat'),
      editor: document.getElementById('view-editor'),
      files: document.getElementById('view-files'),
      canvas: document.getElementById('view-canvas'),
      graphs: document.getElementById('view-graphs'),
      terminal: document.getElementById('view-terminal'),
    }));
  }
  init() {
    this.buttons.forEach(btn => {
      btn.addEventListener('click', () => this.activate(btn.dataset.tab));
    });
    // activar por defecto
    this.activate('chat');
  }
  activate(tab) {
    this.buttons.forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    this.sections.forEach((sec, key) => {
      const is = key === tab;
      sec.hidden = !is;
      sec.classList.toggle('is-active', is);
    });
    this.bus.emit('status', `Vista: ${tab}`);
    this.bus.emit('trace', { type: 'tab:change', tab });
  }
}
