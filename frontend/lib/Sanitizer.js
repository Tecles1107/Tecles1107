// Sanitización básica para contenido textual en UI.
const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, ch => ESC[ch]);
}
export function stripControl(str) {
  return String(str).replace(/[\u0000-\u001F\u007F]/g, "");
}
export function sanitizeText(str, { trim = true } = {}) {
  let out = stripControl(str);
  if (trim) out = out.trim();
  return out;
}
