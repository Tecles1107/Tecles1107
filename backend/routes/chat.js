import express from "express";
import { asyncHandler } from "../utils/http.js";
import { spawnStream } from "../utils/proc.js";
import { config } from "../config.js";

const router = express.Router();

router.post(
  "/chat",
  asyncHandler(async (req, res) => {
    const { message } = req.body;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    // Lanza Gemini CLI en streaming
    const proc = spawnStream(config.geminiBin, ["--stream", message]);
    proc.stdout.on("data", chunk => res.write(chunk));
    proc.stderr.on("data", chunk => console.error("GeminiERR:", chunk.toString()));
    proc.on("close", () => res.end());
  })
);

export default router;
