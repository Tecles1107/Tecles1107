import { Router } from 'express';
import { echo, health } from '../controllers/echoController.js';

const router = Router();

// Saludo simple
router.get('/', (_req, res) => res.json({ api: 'v1' }));

// Salud del backend
router.get('/health', health);

// Echo de prueba
router.post('/echo', echo);

export default router;
