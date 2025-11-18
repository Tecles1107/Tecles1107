import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import chatRoutes from './routes/chat.js';
import terminalRoutes from './routes/terminal.js';
import gitRoutes from './routes/git.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/securityHeaders.js';

// --- Configuración Centralizada ---
const PORT = process.env.PORT || 3000;

// --- Inicialización de Express App ---
const app = express();

// --- Middlewares de Seguridad y Globales ---
app.use(securityHeaders); // Aplica cabeceras de seguridad
app.use(cors()); // Permite peticiones desde el frontend (configurable para producción)
app.use(express.json()); // Parsea bodies de peticiones como JSON
app.use(express.urlencoded({ extended: true })); // Parsea bodies de formularios

// --- API Routes ---
app.use('/api', apiRoutes);
app.use('/api', chatRoutes); // Prefijo /api para las rutas de chat
app.use('/api/terminal', terminalRoutes); // Prefijo /api/terminal para las rutas de terminal
app.use('/api/git', gitRoutes); // Prefijo /api/git para las rutas de Git

// --- Middleware de Manejo de Errores ---
// Si ninguna ruta coincide, pasa al middleware de 404
app.use(notFound);
// Middleware centralizado para manejar todos los errores
app.use(errorHandler);

// --- Arranque del Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor modular escuchando en http://localhost:${PORT}`);
});

export default app;
