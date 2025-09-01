#!/usr/bin/env bash
set -e

echo "🚀 Iniciando reorganización y despliegue..."

# 1️⃣ Crear carpetas destino
mkdir -p backend frontend/components frontend/lib frontend/css frontend/assets .github/workflows

# 2️⃣ Mover backend
[ -f components/server.js ] && mv components/server.js backend/server.js
[ -f server.js ] && mv server.js backend/server.js

# 3️⃣ Mover frontend
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

# 4️⃣ Archivos base
[ ! -f frontend/css/style.css ] && echo "/* Estilos base */" > frontend/css/style.css
[ ! -f frontend/assets/placeholder.png ] && touch frontend/assets/placeholder.png
[ ! -f frontend/README.md ] && echo "# Frontend\nInstrucciones para ejecutar el cliente." > frontend/README.md
[ ! -f backend/README.md ] && echo "# Backend\nInstrucciones para ejecutar el servidor." > backend/README.md
[ ! -f README.md ] && echo "# Proyecto\nDescripción general." > README.md

# 5️⃣ package.json backend
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

# 6️⃣ package.json raíz para levantar todo
if [ ! -f package.json ]; then
  cat > package.json <<'EOF'
{
  "name": "proyecto",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run start --prefix backend\" \"npx serve frontend -l 8080\""
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "serve": "^14.2.0"
  }
}
EOF
fi

# 7️⃣ Instalar dependencias
echo "📦 Instalando dependencias..."
npm install
npm install --prefix backend

# 8️⃣ Ejecutar despliegue
echo "🚀 Levantando backend y frontend..."
npm run dev
