const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/modules/operacion/paneles/administrador/VistaPanelAdministrador.tsx');
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  if (/menu|seguridad-logs|salud-sistema/.test(l)) {
    console.log(`L${idx+1}: ${l.trim()}`);
  }
});
