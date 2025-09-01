export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const payload = {
    error: {
      message: status === 500 ? 'Internal Server Error' : err.message,
      code: err.code || 'UNEXPECTED_ERROR'
    }
  };
  if (process.env.NODE_ENV !== 'production') {
    payload.error.stack = err.stack;
  }
  res.status(status).json(payload);
}
