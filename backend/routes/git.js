import express from "express";
import { spawnStream } from "../utils/proc.js";
import { asyncHandler } from "../utils/http.js";

const router = express.Router();
const CWD = process.cwd();

// Helper para ejecutar un comando de Git y transmitir la salida
const gitStream = (res, args) => {
  return spawnStream(res, "git", args, { cwd: CWD });
};

/**
 * @swagger
 * /api/git/status:
 *   get:
 *     summary: Get git status
 *     description: Executes `git status --porcelain` and streams the output.
 *     responses:
 *       200:
 *         description: A stream of the git status output.
 */
router.get("/status", asyncHandler(async (req, res) => {
  gitStream(res, ["status", "--porcelain"]);
}));

/**
 * @swagger
 * /api/git/log:
 *   get:
 *     summary: Get git log
 *     description: Executes `git log --oneline -n 20` and streams the output.
 *     responses:
 *       200:
 *         description: A stream of the git log output.
 */
router.get("/log", asyncHandler(async (req, res) => {
  gitStream(res, ["log", "--oneline", "-n", "20"]);
}));

/**
 * @swagger
 * /api/git/add:
 *   post:
 *     summary: Add files to git index
 *     description: Executes `git add <files>`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: string
 *                 description: The files to add (e.g., "." or "path/to/file").
 *     responses:
 *       200:
 *         description: A stream of the git add output.
 */
router.post("/add", asyncHandler(async (req, res) => {
  const { files } = req.body;
  if (!files) {
    return res.status(400).send("Files are required");
  }
  gitStream(res, ["add", files]);
}));

/**
 * @swagger
 * /api/git/commit:
 *   post:
 *     summary: Commit changes
 *     description: Executes `git commit -m <message>`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The commit message.
 *     responses:
 *       200:
 *         description: A stream of the git commit output.
 */
router.post("/commit", asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send("Commit message is required");
  }
  gitStream(res, ["commit", "-m", message]);
}));

export default router;
