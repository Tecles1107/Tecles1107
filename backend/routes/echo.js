import express from "express";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();

// Endpoint de prueba que valida input y devuelve un eco.
router.post(
  "/echo",
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      const err = new Error("El campo 'message' es requerido");
      err.status = 400;
      throw err;
    }
    // Respuesta determinística, útil para pruebas front.
    res.json({
      reply: `Echo: ${message}`,
      length: message.length
    });
  })
);

export default router;
