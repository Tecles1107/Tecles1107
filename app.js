import { EventBus } from './lib/EventBus.js';
import { Store } from './lib/Store.js';
import { Tabs } from './components/Tabs.js';
import { Chat } from './components/Chat.js';
import { Editor } from './components/Editor.js';
import { FileManager } from './components/FileManager.js';
import { CanvasLab } from './components/CanvasLab.js';
import { Terminal } from './components/Terminal.js';
import { Graphs } from './components/Graphs.js';

const bus = new EventBus();
const store = new Store(bus);

// Registrar módulos y montar vistas
const mount = () => {
  const views = {
    chat: new Chat('#view-chat', bus, store),
    editor: new Editor('#view-editor', bus, store),
    files: new FileManager('#view-files', bus, store),
    canvas: new CanvasLab('#view-canvas', bus, store),
    graphs: new Graphs('#view-graphs', bus, store),
    terminal: new Terminal('#view-terminal', bus, store),
  };
  const tabs = new Tabs(bus, views);
  tabs.init();

  // Estado y trazabilidad visible
  const statusEl = document.getElementById('status');
  const traceEl = document.getElementById('trace');
  bus.on('status', (msg) => statusEl.textContent = msg);
  bus.on('trace', () => traceEl.textContent = `Eventos: ${store.trace.length}`);

  bus.emit('status', 'Listo. Usa las pestañas para cambiar de vista.');
  bus.emit('trace');
};

window.addEventListener('DOMContentLoaded', mount);
