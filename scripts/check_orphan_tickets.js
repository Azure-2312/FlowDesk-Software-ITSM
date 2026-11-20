const fs = require('fs');
const path = require('path');

const patterns = [
  '/plataforma/tickets/catalogo',
  '/plataforma/tickets/configuracion',
  '/plataforma/tickets/gestion/ayuda',
  '/plataforma/tickets/gestion/incidentes',
  '/plataforma/tickets/gestion/solicitudes',
  '/plataforma/tickets/gestion/tecnicos',
  '/plataforma/tickets/incidentes-mayores',
  '/plataforma/tickets/mesa',
  '/plataforma/tickets/reportes'
];

function searchIn(dir) {
  let hits = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name !== '.next' && ent.name !== 'node_modules') {
        hits = hits.concat(searchIn(full));
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(ent.name)) {
      const c = fs.readFileSync(full, 'utf8');
      patterns.forEach(pat => {
        if (c.includes(pat)) {
          hits.push({ file: path.relative(path.join(__dirname, '..'), full).replace(/\\/g, '/'), pat });
        }
      });
    }
  }
  return hits;
}

const allHits = searchIn(path.join(__dirname, '../src'));
console.log('Total hits:', allHits.length);
allHits.forEach(h => console.log(`${h.file} matches ${h.pat}`));
