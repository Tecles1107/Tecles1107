import express from 'express';
import { spawn } from 'child_process';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/gemini', (req, res) => {
  const prompt = req.body.prompt || '';
  const gemini = spawn('gemini', [prompt]);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  gemini.stdout.on('data', chunk => {
    res.write(chunk); // streaming directo
  });

  gemini.stderr.on('data', err => {
    console.error('Gemini error:', err.toString());
  });

  gemini.on('close', () => res.end());
});

app.listen(3000, () => console.log('Servidor puente en http://localhost:3000'));
