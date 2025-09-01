export function validateChat(req, res, next) {
  const msg = String(req.body.message || "").trim();
  if (!msg) {
    const err = new Error("El campo 'message' es requerido y no puede estar vacío.");
    err.status = 400;
    throw err;
  }
  req.body.message = msg;
  next();
}
