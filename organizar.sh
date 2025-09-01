#!/usr/bin/env bash
set -e

echo "📦 Creando carpetas destino..."
mkdir -p backend frontend/components frontend/lib frontend/css frontend/assets .github/workflows

echo "📂 Moviendo backend..."
# Si server.js está en components, lo movemos
[ -f components/server.js ] && mv components/server.js backend/server.js
# Si está en raíz
[ -f server.js ] && mv server.js backend/server.js

echo "📂 Moviendo frontend..."
[ -f index.html ] && mv index.html frontend/
[ -f app.js ] && mv app.js frontend/

if [ -d components ]; then
  mv components/* frontend/components/ 2>/dev/null || true
  rmdir components 2>/dev/null || true
fi

if [ -d lib ]; then
  mv lib/* frontend/lib/ 2>/dev/null || true
  rmdir lib 2>/dev/null || true
fi

# Crear archivos base si no existen
[ ! -f frontend/css/style.css ] && echo "/* Estilos base */" > frontend/css/style.css
[ ! -f frontend/assets/placeholder.png ] && touch frontend/assets/placeholder.png
[ ! -f frontend/README.md ] && echo "# Frontend\nInstrucciones para ejecutar el cliente." > frontend/README.md
[ ! -f backend/README.md ] && echo "# Backend\nInstrucciones para ejecutar el servidor." > backend/README.md
[ ! -f README.md ] && echo "# Proyecto\nDescripción general." > README.md

# Crear package.json backend si no existe
if [ ! -f backend/package.json ]; then
  cat > backend/package.json <<'EOF'
{
  "name": "backend",
  "version": "1.0.0",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2"
  }
}
EOF
fi

echo "✅ Reorganización completada."
