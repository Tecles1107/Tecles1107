// components/Chat.js
import { sanitizeText } from '../lib/Sanitizer.js';

export class Chat {
  constructor(selector, bus, store) {
    this.bus = bus;
    this.store = store;
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

    this.root.querySelector('#menu').addEventListener('click', () => {
      this.addSystem('Menú: Chat actual, limpiar, exportar conversación.');
    });
    this.root.querySelector('#options').addEventListener('click', () => {
      this.addSystem('Opciones: velocidad de tokens, tema, tamaño de fuente.');
    });

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

  tokenize(text) { return text.match(/\\s+|\\S+/g) || []; }
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

    // 🔹 Ahora usamos Gemini en tiempo real
    this.sendToGemini(msg);
  }

  async sendToGemini(prompt) {
    try {
      const resp = await fetch('http://localhost:3000/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      const el = this.addBubble('assistant', '');
      const content = el.querySelector('.content');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content.textContent += decoder.decode(value, { stream: true });
        if (this.isNearBottom()) this.scrollToBottom();
      }
    } catch (err) {
      this.addSystem(`Error al conectar con Gemini: ${err.message}`);
    }
  }
}
