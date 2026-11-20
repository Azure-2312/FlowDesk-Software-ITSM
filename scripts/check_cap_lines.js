const fs = require('fs');
const path = require('path');

const capFile = path.join(__dirname, '../src/shared/lib/capacidades.ts');
const lines = fs.readFileSync(capFile, 'utf8').split('\n');

const orphans = [
  'TICKETS_ADMINISTRAR',
  'INCIDENTES_VER',
  'SOLICITUDES_VER',
  'SOLICITUDES_CREAR',
  'PROBLEMAS_CREAR',
  'KEDB_VER',
  'CAMBIOS_CREAR',
  'SERVICIOS_VER',
  'OPERACION_VER',
  'OPERACION_EVENTOS',
  'OPERACION_RESILIENCIA',
  'OPERACION_GESTIONAR',
  'OPERACION_ATENDER',
  'CATEGORIAS_VER',
  'SEGURIDAD_LOGS'
];

lines.forEach((l, idx) => {
  orphans.forEach(o => {
    if (l.includes(o)) {
      console.log(`L${idx + 1}: ${l.trim()}`);
    }
  });
});
