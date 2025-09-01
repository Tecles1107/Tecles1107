import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

import "./config.js"; // dotenv
import { config } from "./config.js";
import { logger } from "./logger.js";
import { securityHeaders } from "./middleware/security.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { notFound, errorHandler } from "./middleware/error.js";

import healthRouter from "./routes/health.js";
import echoRouter from "./routes/echo.js";
import chatRouter from "./routes/chat.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Settings
app.set("env", config.env);

// Middlewares
app.use(logger.req);
app.use(securityHeaders);
app.use(cors(config.cors));
app.use(express.json({ limit: "2mb" }));
app.use(apiLimiter);

// API v1
app.use("/api", healthRouter);
app.use("/api", echoRouter);
app.use("/api", chatRouter);

// Frontend estático
const staticPath = path.normalize(fileURLToPath(config.staticDir));
app.use(express.static(staticPath, { extensions: ["html"] }));

// SPA fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(staticPath, "index.html"));
});

// 404 + errores
app.use("/api", notFound);
app.use(errorHandler);

// Arranque
app.listen(config.port, () => {
  logger.info(`Servidor backend en http://localhost:${config.port}`);
});
