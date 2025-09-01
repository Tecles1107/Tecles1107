import { el } from "../lib/dom.js";

export class FileManager {
  constructor(root) {
    this.root = root;
    this.mount();
  }
  mount() {
    const panel = el("section", { class: "filemanager-panel" },
      [el("h2", {}, ["FileManager"])]);
    this.root.append(panel);
  }
}
