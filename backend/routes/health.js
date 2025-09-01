import express from "express";
import os from "os";

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    node: process.version,
    host: os.hostname()
  });
});

export default router;
