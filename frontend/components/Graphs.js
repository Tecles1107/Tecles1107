import { el } from "../lib/dom.js";

export class Graphs {
  constructor(root) {
    this.root = root;
    this.mount();
  }
  mount() {
    const panel = el("section", { class: "graphs-panel" },
      [el("h2", {}, ["Graphs"])]);
    this.root.append(panel);
  }
}
