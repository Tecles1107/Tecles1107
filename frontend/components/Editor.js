import { el } from "../lib/dom.js";

export class Editor {
  constructor(root) {
    this.root = root;
    this.mount();
  }
  mount() {
    const panel = el("section", { class: "editor-panel" },
      [el("h2", {}, ["Editor"])]);
    this.root.append(panel);
  }
}
