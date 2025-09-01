import { Chat } from "./components/Chat.js";
import { Editor } from "./components/Editor.js";
import { FileManager } from "./components/FileManager.js";
import { CanvasLab } from "./components/CanvasLab.js";
import { Terminal } from "./components/Terminal.js";
import { Graphs } from "./components/Graphs.js";

const views = { Chat, Editor, FileManager, CanvasLab, Terminal, Graphs };
const root = document.getElementById("app");
const nav = document.getElementById("nav");

function activate(name) {
  root.innerHTML = "";
  new views[name](root);
  document.querySelectorAll("#nav button").forEach(b => b.disabled = b.id===name);
}

document.addEventListener("DOMContentLoaded", () => {
  const names = Object.keys(views);
  const ul = nav;
  names.forEach(n => {
    const btn = document.createElement("button");
    btn.id = n; btn.textContent = n;
    btn.addEventListener("click", () => activate(n));
    ul.appendChild(btn);
  });
  activate("Chat");
});
