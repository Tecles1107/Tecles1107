import { logger } from "../logger.js";

export function notFound(req, res, _next) {
  return res.status(404).json({
    error: "NotFound",
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}

// Manejador de errores centralizado
export function errorHandler(err, req, res, _next) {
  logger.error("Error:", err?.message || err, "stack:", err?.stack || "n/a");
  const status = typeof err?.status === "number" ? err.status : 500;
  const payload = {
    error: err?.code || "InternalError",
    message: status === 500 ? "Error interno" : err?.message || "Error"
  };
  if (req.app.get("env") !== "production") {
    payload.details = err?.details || undefined;
  }
  res.status(status).json(payload);
}
