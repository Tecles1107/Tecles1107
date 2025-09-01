// server.js
import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/gemini', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).send('Falta prompt');
    return;
  }

  // 🔹 Ajusta el comando y flags según tu instalación de Gemini CLI
  const gemini = spawn('gemini', ['--model', 'gemini-2.0-flash', '--stream', prompt]);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  gemini.stdout.on('data', chunk => {
    res.write(chunk);
  });

  gemini.stderr.on('data', err => {
    console.error('Gemini error:', err.toString());
  });

  gemini.on('close', () => {
    res.end();
  });
});

app.listen(3000, () => {
  console.log('Servidor Gemini puente en http://localhost:3000');
});
