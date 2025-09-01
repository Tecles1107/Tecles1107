// components/Chat.js
import { sanitizeText } from '../lib/Sanitizer.js';

export class Chat {
  constructor(selector, bus, store) {
    this.bus = bus; this.store = store;
    this.root = document.querySelector(selector);
    this.root.classList.add('chat');
    this.root.innerHTML = `
      <div class="chat-scroll" aria-live="polite"></div>
      <div class="chat-input">
        <textarea id="chat-input" placeholder="Escribe tu mensaje..." aria-label="Entrada de chat"></textarea>
        <div style="display:flex;gap:8px;">
          <button class="btn" id="send">Enviar</button>
          <button class="btn" id="menu">Menú</button>
          <button class="btn" id="options">Opciones</button>
        </div>
      </div>
    `;
    this.scroll = this.root.querySelector('.chat-scroll');
    this.input = this.root.querySelector('#chat-input');
    this.root.querySelector('#send').addEventListener('click', () => this.onSend());
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) this.onSend();
    });
    // menú y opciones demo
    this.root.querySelector('#menu').addEventListener('click', () => {
      this.addSystem('Menú: Chat actual, limpiar, exportar conversación.');
    });
    this.root.querySelector('#options').addEventListener('click', () => {
      this.addSystem('Opciones: velocidad de tokens, tema, tamaño de fuente.');
    });

    // mensajes iniciales
    this.addAssistant('¿En qué quieres trabajar hoy? Puedo abrir Editor, Archivos, Canvas, Gráficas o Terminal.');
  }

  addBubble(role, text) {
    const el = document.createElement('div');
    el.className = `msg ${role}`;
    const time = new Date().toLocaleTimeString();
    el.innerHTML = `<div class="meta">${role} • ${time}</div><div class="content"></div>`;
    el.querySelector('.content').textContent = text;
    this.scroll.appendChild(el);
    this.scrollToBottom();
    return el;
  }
  addSystem(text) { this.addBubble('assistant', sanitizeText(text)); }
  addUser(text) { return this.addBubble('user', sanitizeText(text)); }
  addAssistant(text) { return this.addBubble('assistant', sanitizeText(text)); }

  async streamAssistant(text, delay = 28) {
    const el = this.addBubble('assistant', '');
    const content = el.querySelector('.content');
    for (const token of this.tokenize(text)) {
      content.textContent += token;
      await this.sleep(delay);
      if (this.isNearBottom()) this.scrollToBottom();
    }
  }

  tokenize(text) {
    // splitting by words+spaces for a natural feel
    return text.match(/\s+|\S+/g) || [];
  }
  sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
  isNearBottom() {
    const { scrollTop, scrollHeight, clientHeight } = this.scroll;
    return scrollHeight - (scrollTop + clientHeight) < 120;
    }
  scrollToBottom() { this.scroll.scrollTop = this.scroll.scrollHeight; }

  onSend() {
    const raw = this.input.value.trim();
    if (!raw) return;
    const msg = raw.slice(0, 4000);
    this.addUser(msg);
    this.input.value = '';
    this.bus.emit('trace', { type: 'chat:user', msg });
    // Simular respuesta y navegación sugerida
    const reply = `Recibido: "${msg}". Puedes abrir Editor para agregar botones con funciones,
o ir a Archivos para gestionar recursos. También está Canvas para transformar objetos,
y Gráficas para ver datos.`;
    this.streamAssistant(reply, 18);
  }
}
