import { el } from "../lib/dom.js";

export class Terminal {
  constructor(root) {
    this.root = root;
    this.mount();
  }
  mount() {
    const panel = el("section", { class: "terminal-panel" },
      [el("h2", {}, ["Terminal"])]);
    this.root.append(panel);
  }
}
