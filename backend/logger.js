const ts = () => new Date().toISOString();

export const logger = {
  info: (...args) => console.log("[INFO]", ts(), ...args),
  warn: (...args) => console.warn("[WARN]", ts(), ...args),
  error: (...args) => console.error("[ERR ]", ts(), ...args),
  req: (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      console.log("[REQ ]", ts(), req.method, req.originalUrl, res.statusCode, ms + "ms");
    });
    next();
  }
};
