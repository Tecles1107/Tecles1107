// Wrapper para capturar errores en handlers async sin try/catch repetitivo
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
