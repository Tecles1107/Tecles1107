import { streamText } from "../lib/StreamText.js";
import { escapeHTML, sanitizeText } from "../lib/Sanitizer.js";
import { el } from "../lib/dom.js";
import { api } from "../lib/ApiClient.js";
import { Config } from "../lib/Config.js";

export class Chat {
  constructor(root) {
    this.root = root;
    this.mount();
  }

  mount() {
    this.container = el("div", { class: "chat" });
    this.messagesEl = el("div", { class: "chat__messages" });
    this.inputEl = el("input", { type: "text", placeholder: "Escribe…", class: "chat__input-text" });
    this.sendBtn = el("button", { onClick: () => this.send() }, ["Enviar"]);
    this.container.append(this.messagesEl, el("div", { class: "chat__input" }, [this.inputEl, this.sendBtn]));
    this.root.append(this.container);
    this.sendBtn.disabled = false;
    this.inputEl.addEventListener("keydown", e => { if (e.key==="Enter") this.send(); });
  }

  append(msg, role="bot") {
    const css = role==="user" ? "msg msg--user" : "msg msg--bot";
    const node = el("div", { class: css }, [escapeHTML(msg)]);
    this.messagesEl.append(node);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  async send() {
    const raw = this.inputEl.value.trim();
    if (!raw) return;
    const text = sanitizeText(raw);
    this.append(text, "user");
    this.inputEl.value = "";
    this.sendBtn.disabled = true;

    try {
      const url = Config.apiBase + Config.endpoints.chat;
      let accumulated = "";
      for await (const chunk of streamText(url, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ message: text })
      })) {
        accumulated += chunk;
        this.updateLast(accumulated);
      }
    } catch (err) {
      this.append(`⚠ ${err.message}`, "error");
    } finally {
      this.sendBtn.disabled = false;
    }
  }

  updateLast(text) {
    const msgs = Array.from(this.messagesEl.children);
    const last = msgs[msgs.length-1];
    if (last && last.classList.contains("msg--bot")) {
      last.textContent = text;
    } else {
      this.append(text, "bot");
    }
  }
}
