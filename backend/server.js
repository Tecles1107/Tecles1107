// -------------------------------------
// --- Imports y Módulos Necesarios ---
// -------------------------------------
import express from 'express';
import cors from 'cors';
import pg from 'pg'; // Driver de PostgreSQL
import { exec } from 'child_process';

// -------------------------------------
// --- Configuración Centralizada ---
// -------------------------------------
// Usamos variables de entorno para la configuración, ideal para Docker y seguridad.
// Proporcionamos valores por defecto para facilitar el desarrollo local.
const PORT = process.env.PORT || 3000;

const DB_CONFIG = {
  user: process.env.DB_USER || 'myuser',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mydatabase',
  password: process.env.DB_PASSWORD || 'mypassword',
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

// -------------------------------------
// --- Conexión a la Base de Datos ---
// -------------------------------------
const { Pool } = pg;
const pool = new Pool(DB_CONFIG);

// Función para verificar la conexión a la DB al iniciar
async function checkDbConnection() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a la base de datos PostgreSQL exitosa.');
  } catch (err) {
    console.error('❌ Error al conectar con la base de datos:', err);
    // Si no podemos conectar a la DB, el servidor no puede funcionar.
    process.exit(1);
  }
}

// -------------------------------------
// --- Inicialización de Express App ---
// -------------------------------------
const app = express();

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend
app.use(express.json()); // Parsea bodies de peticiones como JSON

// -------------------------------------
// --- Definición de API Routes ---
// -------------------------------------

// Ruta de "Salud" para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor del IDE Studio Pro está corriendo.' });
});

// === RUTAS PARA PROYECTOS ===

// GET /api/projects - Obtener todos los proyectos
app.get('/api/projects', async (req, res) => {
  try {
    const query = 'SELECT id, name, created_at FROM projects ORDER BY created_at DESC';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/projects - Crear un nuevo proyecto
app.post('/api/projects', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'El nombre del proyecto es requerido' });
  }
  try {
    // Usamos consultas parametrizadas ($1) para prevenir Inyección SQL
    const query = 'INSERT INTO projects (name) VALUES ($1) RETURNING *';
    const result = await pool.query(query, [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === RUTAS PARA ARCHIVOS ===

// GET /api/projects/:id/files - Obtener archivos de un proyecto
app.get('/api/projects/:id/files', async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT id, file_path, last_modified FROM files WHERE project_id = $1';
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error(`Error al obtener archivos del proyecto ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/files/:id - Actualizar el contenido de un archivo
app.put('/api/files/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (content === undefined) {
    return res.status(400).json({ error: 'El contenido es requerido' });
  }
  try {
    const query = 'UPDATE files SET content = $1, last_modified = NOW() WHERE id = $2 RETURNING id, file_path, last_modified';
    const result = await pool.query(query, [content, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error al actualizar el archivo ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// === RUTA PARA LA TERMINAL (CON SEGURIDAD) ===

app.post('/api/terminal', (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'El comando es requerido' });
  }

  // --- IMPLEMENTACIÓN DE SEGURIDAD: LISTA BLANCA (ALLOWLIST) ---
  const commandBase = command.trim().split(' ')[0];
  const allowedCommands = ['ls', 'git', 'npm', 'node', 'echo', 'cat', 'pwd', 'whoami'];

  if (!allowedCommands.includes(commandBase)) {
    const errorMsg = `Comando no permitido: "${commandBase}". Por seguridad, solo se permiten comandos en la lista blanca.`;
    return res.status(403).json({ stdout: '', stderr: errorMsg });
  }
  // --- FIN DEL BLOQUE DE SEGURIDAD ---

  // Ejecuta el comando en el sistema operativo del servidor
  exec(command, (error, stdout, stderr) => {
    if (error) {
      // `error` a menudo contiene `stderr`, así que lo enviamos para más contexto
      console.error(`Error al ejecutar comando: ${error.message}`);
      return res.status(500).json({ stdout, stderr: error.message });
    }
    res.json({ stdout, stderr });
  });
});


// -------------------------------------
// --- Arranque del Servidor ---
// -------------------------------------
async function startServer() {
  await checkDbConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  });
}

startServer();
