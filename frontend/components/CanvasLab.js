import { el } from "../lib/dom.js";

export class CanvasLab {
  constructor(root) {
    this.root = root;
    this.mount();
  }
  mount() {
    const panel = el("section", { class: "canvaslab-panel" },
      [el("h2", {}, ["CanvasLab"])]);
    this.root.append(panel);
  }
}
