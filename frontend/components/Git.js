import { el } from "../lib/dom.js";
import { Config } from "../lib/Config.js";
import { api } from "../lib/ApiClient.js";

export class GitPanel {
  constructor(root) {
    this.root = root;
    this.mount();
  }

  mount() {
    this.outputEl = el("pre", { class: "git-output" });
    this.fileInput = el("input", { type: "text", value: ".", class: "git-input" });
    this.commitInput = el("input", { type: "text", placeholder: "Commit message...", class: "git-input" });

    this.container = el("div", { class: "git-panel" }, [
      el("div", { class: "git-controls" }, [
        el("button", { onClick: () => this.runStatus() }, ["Status"]),
        el("button", { onClick: () => this.runLog() }, ["Log"]),
        el("div", { class: "git-action" }, [
          this.fileInput,
          el("button", { onClick: () => this.runAdd() }, ["Add"])
        ]),
        el("div", { class: "git-action" }, [
          this.commitInput,
          el("button", { onClick: () => this.runCommit() }, ["Commit"])
        ])
      ]),
      this.outputEl
    ]);

    this.root.append(this.container);
  }

  async runCommand(endpoint, options = {}) {
    this.outputEl.textContent = "Executing...";
    try {
      const url = Config.apiBase + endpoint;
      const response = await api.get(url, options); // Assuming api client can handle different methods
      
      // For streaming endpoints, api.get might need adjustment.
      // For now, let's assume it returns full text.
      // A proper implementation would use streamText.
      let output = '';
      // This is a simplified example. A real implementation would stream the response.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
      }
      this.outputEl.textContent = output || "(No output)";

    } catch (err) {
      this.outputEl.textContent = `Error: ${err.message}`;
    }
  }
  
  async runStreamingCommand(endpoint, options = {}) {
    this.outputEl.textContent = "Executing...";
    let accumulatedText = "";
    try {
        const url = Config.apiBase + endpoint;
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulatedText += chunk;
            this.outputEl.textContent = accumulatedText;
        }
        if (accumulatedText === "") {
            this.outputEl.textContent = "(No output)";
        }
    } catch (err) {
        this.outputEl.textContent = `Error: ${err.message}`;
    }
  }


  runStatus() {
    this.runStreamingCommand(Config.endpoints.gitStatus);
  }

  runLog() {
    this.runStreamingCommand(Config.endpoints.gitLog);
  }

  runAdd() {
    const files = this.fileInput.value.trim();
    if (!files) return;
    this.runStreamingCommand(Config.endpoints.gitAdd, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: files })
    });
  }

  runCommit() {
    const message = this.commitInput.value.trim();
    if (!message) return;
    this.runStreamingCommand(Config.endpoints.gitCommit, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message })
    });
    this.commitInput.value = "";
  }
}
