import { isNonEmptyString } from '../utils/validate.js';

export function echo(req, res, next) {
  try {
    const { message } = req.body || {};
    if (!isNonEmptyString(message, { min: 1, max: 2000 })) {
      const error = new Error('El campo "message" es requerido y debe ser un string no vacío (<= 2000).');
      error.status = 400;
      error.code = 'INVALID_MESSAGE';
      throw error;
    }
    const reply = `Echo: ${message.trim()}`;
    res.json({ reply });
  } catch (err) {
    next(err);
  }
}

export function health(_req, res) {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
}
