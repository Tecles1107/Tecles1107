// --- 1. Inicialización de Componentes ---

// Editor de Código con CodeMirror
const editorView = document.getElementById('view-editor');
const editor = CodeMirror(editorView, {
  value: `// ¡Bienvenido a Studio Pro!
function greet(name) {
  console.log(\`Hola, \${name} desde el editor!\`);
}

greet('Mundo');
`,
  mode: 'javascript',
  theme: 'dracula',
  lineNumbers: true,
  autofocus: true,
});

// Terminal con Xterm.js
const termContainer = document.getElementById('terminal-container');
const term = new Terminal({
  cursorBlink: true,
  theme: {
    background: '#111',
    foreground: '#00ff00',
  },
  fontFamily: 'monospace',
});
term.open(termContainer);

import { streamText } from './lib/StreamText.js';
import { Config } from './lib/Config.js';
import { Chat } from './components/Chat.js';
import { GitPanel } from './components/Git.js';

// --- 1. Inicialización de Componentes ---

// Editor de Código con CodeMirror
const editorView = document.getElementById('view-editor');
const editor = CodeMirror(editorView, {
  value: `// ¡Bienvenido a Studio Pro!
function greet(name) {
  console.log(\`Hola, \${name} desde el editor!\`);
}

greet('Mundo');
`,
  mode: 'javascript',
  theme: 'dracula',
  lineNumbers: true,
  autofocus: true,
});

// Terminal con Xterm.js
const termContainer = document.getElementById('terminal-container');
const term = new Terminal({
  cursorBlink: true,
  theme: {
    background: '#111',
    foreground: '#00ff00',
  },
  fontFamily: 'monospace',
});
term.open(termContainer);

// --- 2. Funcionalidad de la Terminal (Conectada al Backend) ---

const prompt = '$ ';
term.write('Terminal de Studio Pro v1.0\r\n');
term.write(prompt);

let command = '';
let isExecuting = false;

term.onKey(async ({ key, domEvent }) => {
  if (isExecuting) return;

  if (domEvent.keyCode === 13) { // Enter
    if (command) {
      term.write('\r\n');
      isExecuting = true;
      await runCommand(command);
      command = '';
      term.write(`\r\n${prompt}`);
      isExecuting = false;
    } else {
      term.write(`\r\n${prompt}`);
    }
  } else if (domEvent.keyCode === 8) { // Backspace
    if (command.length > 0) {
      term.write('\b \b');
      command = command.slice(0, -1);
    }
  } else if (!domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey) {
    term.write(key);
    command += key;
  }
});

async function runCommand(cmd) {
  if (cmd.trim() === 'clear') {
    term.clear();
    return;
  }

  try {
    const url = Config.apiBase + Config.endpoints.terminal;
    for await (const chunk of streamText(url, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ command: cmd })
    })) {
      // Reemplaza saltos de línea por el formato de terminal \r\n
      term.write(chunk.replace(/\n/g, '\r\n'));
    }
  } catch (err) {
    term.write(`\r\n\x1b[31mError: ${err.message}\x1b[0m`);
  }
}


// --- 3. Lógica de Pestañas ---

const tabs = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view');
const componentInstances = {}; // Almacena instancias de componentes para no recrearlos

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Desactivar todas
    tabs.forEach(t => t.classList.remove('is-active'));
    views.forEach(v => {
      v.classList.remove('is-active');
      v.hidden = true;
    });

    // Activar la seleccionada
    tab.classList.add('is-active');
    const tabName = tab.dataset.tab;
    const targetView = document.getElementById(`view-${tabName}`);
    
    if (targetView) {
      targetView.hidden = false;
      
      // Inicializa el componente si es la primera vez
      if (!componentInstances[tabName]) {
        switch (tabName) {
          case 'chat':
            componentInstances[tabName] = new Chat(targetView);
            break;
          case 'git':
            componentInstances[tabName] = new GitPanel(targetView);
            break;
          // Añadir otros casos para otros componentes dinámicos
        }
      }

      // Pequeño delay para que la transición CSS funcione correctamente
      setTimeout(() => {
        targetView.classList.add('is-active');
        if (tabName === 'editor') {
          editor.refresh();
        }
      }, 10);
    }
  });
});

// --- 4. Lógica de Paneles Redimensionables ---

function makeResizable(panel, resizer, direction = 'vertical') {
  let isResizing = false;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    let startX = e.clientX;
    let startY = e.clientY;
    let startWidth = panel.offsetWidth;
    let startHeight = panel.offsetHeight;

    function handleMouseMove(e) {
      if (!isResizing) return;
      if (direction === 'vertical') {
        const delta = e.clientX - startX;
        panel.style.flexBasis = `${startWidth + delta}px`;
      } else { // horizontal
        const delta = e.clientY - startY;
        panel.style.flexBasis = `${startHeight + delta}px`;
      }
    }

    function handleMouseUp() {
      isResizing = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      // Refresca el editor y la terminal por si su tamaño cambió
      editor.refresh();
      term.fit(); // Requiere el addon 'fit' que no hemos cargado para simplicidad, pero esta es la idea
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  });
}

const sidebar = document.getElementById('sidebar');
const resizerV = document.getElementById('resizer-v');
makeResizable(sidebar, resizerV, 'vertical');

const terminalContainer = document.getElementById('terminal-container');
const resizerH = document.getElementById('resizer-h');
makeResizable(terminalContainer, resizerH, 'horizontal');

// Inicializar la vista del editor
document.querySelector('[data-tab="editor"]').click();
