# Proyecto – Fase 1 (Base funcional)

Esta fase incluye:
- Backend Express modular (salud, echo, estáticos, seguridad básica).
- Frontend modular (EventBus, Store, ApiClient, Sanitizer, Chat).
- Listo para ejecutar y probar.

## Requisitos
- Node.js 18+ y npm.

## Uso
1. Instala dependencias del backend:
   - cd backend && npm install
2. Inicia el servidor:
   - npm start
3. Abre http://localhost:3000

## Endpoints
- GET /api/health → estado del servicio
- POST /api/echo { "message": "texto" } → eco de prueba

## Estructura
backend/
  routes/ (health, echo)
  middleware/ (security, error)
  utils/ (http)
  config.js, logger.js, server.js
frontend/
  index.html, css/, assets/, lib/, components/, main.js
