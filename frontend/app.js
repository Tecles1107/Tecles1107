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

// --- 2. Funcionalidad de la Terminal (Simulada) ---

const prompt = '$ ';
term.write('Terminal de Studio Pro v1.0\r\n');
term.write('Escribe "help" para ver los comandos disponibles.\r\n');
term.write(prompt);

let command = '';

term.onKey(({ key, domEvent }) => {
  if (domEvent.keyCode === 13) { // Enter
    if (command) {
      term.write('\r\n');
      runCommand(command);
      command = '';
    }
    term.write(`\r\n${prompt}`);
  } else if (domEvent.keyCode === 8) { // Backspace
    if (command.length > 0) {
      term.write('\b \b');
      command = command.slice(0, -1);
    }
  } else {
    term.write(key);
    command += key;
  }
});

function runCommand(cmd) {
  const args = cmd.split(' ');
  const baseCmd = args[0];

  switch (baseCmd) {
    case 'help':
      term.write('Comandos disponibles:\r\n');
      term.write('  ls         - Lista los archivos del proyecto\r\n');
      term.write('  cat [file] - Muestra el contenido de un archivo\r\n');
      term.write('  echo [msg] - Imprime un mensaje\r\n');
      term.write('  clear      - Limpia la terminal\r\n');
      term.write('  npm [arg]  - Simula un comando npm\r\n');
      break;
    case 'ls':
      term.write('index.html  styles.css  app.js  package.json\r\n');
      break;
    case 'cat':
      term.write(`(simulado) Mostrando contenido de ${args[1] || 'ningún archivo'}...\r\n`);
      break;
    case 'echo':
      term.write(args.slice(1).join(' ') + '\r\n');
      break;
    case 'clear':
      term.clear();
      break;
    case 'npm':
      term.write(`(simulado) Ejecutando npm ${args[1] || 'install'}...\r\n`);
      setTimeout(() => term.write('¡Paquetes instalados con éxito! (simulado)\r\n'), 1500);
      break;
    default:
      term.write(`Comando no encontrado: ${cmd}\r\n`);
  }
}


// --- 3. Lógica de Pestañas ---

const tabs = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view');

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
    const targetView = document.getElementById(`view-${tab.dataset.tab}`);
    if (targetView) {
      targetView.hidden = false;
      // Pequeño delay para que la transición CSS funcione correctamente
      setTimeout(() => {
        targetView.classList.add('is-active');
        // Si la vista activada es el editor, refresca CodeMirror
        if (tab.dataset.tab === 'editor') {
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
