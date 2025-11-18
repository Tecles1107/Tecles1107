const express = require("express");
const { spawnStream } = require("../utils/proc");
const router = express.Router();

/**
 * @swagger
 * /api/terminal/execute:
 *   post:
 *     summary: Execute a shell command
 *     description: Executes a shell command and streams the output.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               command:
 *                 type: string
 *                 description: The command to execute.
 *     responses:
 *       200:
 *         description: A stream of the command's output.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
router.post("/execute", (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).send("Command is required");
  }

  // For simplicity, executing commands in the project root.
  // A more robust solution might involve a dedicated workspace directory.
  const cwd = process.cwd(); 
  
  // Basic security measure: prevent complex commands.
  // A real-world application would need much more robust validation and sandboxing.
  if (command.includes('&&') || command.includes(';') || command.includes('|') || command.includes('`')) {
    return res.status(400).send("Invalid command characters.");
  }

  const [cmd, ...args] = command.trim().split(/\s+/);

  spawnStream(res, cmd, args, { cwd });
});

module.exports = router;
