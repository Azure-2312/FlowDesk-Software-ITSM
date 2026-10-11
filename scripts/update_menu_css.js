const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

const target = `.menu-fila {
  display: flex;
  align-items: center;
  gap: 4px;
}

.menu-item {
  display: block;
  flex: 1;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 14px;
  color: #e5e7eb;
}

.menu-item:hover {
  background-color: #1f2937;
}

.menu-item-activo {
  background-color: #2563eb;
  color: white;
}

.menu-item-activo:hover {
  background-color: #2563eb;
}

.menu-boton-colapsar {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #9ca3af;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-boton-colapsar:hover {
  background-color: #1f2937;
  color: white;
}

.menu-hijos-nivel-2 {
  margin-left: 18px;
}

.menu-hijos-nivel-2 .menu-item {
  font-size: 13px;
  color: #9ca3af;
}

.menu-hijos-nivel-3 {
  margin-left: 18px;
}

.menu-hijos-nivel-3 .menu-item {
  font-size: 12.5px;
  color: #6b7280;
}`;

const replacement = `.menu-fila {
  display: flex;
  align-items: center;
  width: 100%;
}

.menu-item {
  display: block;
  flex: 1;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13.5px;
  color: #e5e7eb;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.menu-item:hover {
  background-color: #1f2937;
  color: #ffffff;
}

.menu-item-activo {
  background-color: #2563eb !important;
  color: #ffffff !important;
  font-weight: 600;
}

.menu-item-activo:hover {
  background-color: #1d4ed8 !important;
}

.menu-item-carpeta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  color: #d1d5db;
  padding: 8px 10px;
  border-radius: 6px;
}

.menu-item-carpeta:hover {
  background-color: #1f2937;
  color: #ffffff;
}

.menu-carpeta-activa {
  color: #93c5fd;
  font-weight: 600;
}

.menu-texto-carpeta {
  flex: 1;
}

.menu-icono-flecha {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  margin-left: 6px;
  flex-shrink: 0;
}

.menu-hijos-nivel-2 {
  margin-left: 10px;
  border-left: 1px solid #1f2937;
  padding-left: 6px;
}

.menu-hijos-nivel-2 .menu-item {
  font-size: 13px;
  color: #9ca3af;
}

.menu-hijos-nivel-2 .menu-item:hover {
  color: #ffffff;
}

.menu-hijos-nivel-3 {
  margin-left: 10px;
  border-left: 1px solid #1f2937;
  padding-left: 6px;
}

.menu-hijos-nivel-3 .menu-item {
  font-size: 12.5px;
  color: #9ca3af;
}

.menu-hijos-nivel-3 .menu-item:hover {
  color: #ffffff;
}`;

// Normalizar CRLF
const normalizedCss = css.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');

if (normalizedCss.includes(normalizedTarget)) {
  const updated = normalizedCss.replace(normalizedTarget, replacement);
  fs.writeFileSync('src/app/globals.css', updated.replace(/\n/g, '\r\n'), 'utf8');
  console.log('globals.css successfully updated');
} else {
  console.error('Target not found in globals.css');
}
