// backend/server.js
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors()); // Permite que el frontend (en otro origen) haga peticiones

// Esto es un "endpoint" de la API. Es una URL que el frontend puede llamar.
app.get('/api/files', (req, res) => {
  // Aquí, en el futuro, podrías leer el sistema de archivos de verdad.
  // Por ahora, simulamos la respuesta con datos.
  const fileStructure = [
    { name: 'index.html', type: 'file' },
    { name: 'app.js', type: 'file' },
    { name: 'styles.css', type: 'file' },
  ];
  
  console.log('Petición recibida en /api/files. Enviando estructura de archivos.');
  res.json(fileStructure); // Enviamos los datos como JSON
});

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});
