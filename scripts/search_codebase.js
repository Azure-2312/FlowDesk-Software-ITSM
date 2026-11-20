const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../src');

function search(dir, pattern) {
  let matches = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      matches = matches.concat(search(full, pattern));
    } else if (/\.(ts|tsx|js|jsx)$/.test(ent.name)) {
      const content = fs.readFileSync(full, 'utf8');
      if (pattern.test(content)) {
        matches.push(path.relative(path.join(__dirname, '..'), full).replace(/\\/g, '/'));
      }
    }
  }
  return matches;
}

const patterns = [
  /\/plataforma\/tickets\/catalogo/,
  /\/plataforma\/tickets\/configuracion/,
  /\/plataforma\/tickets\/gestion\/ayuda/,
  /\/plataforma\/tickets\/gestion\/incidentes/,
  /\/plataforma\/tickets\/gestion\/solicitudes/,
  /\/plataforma\/tickets\/gestion\/tecnicos/,
  /\/plataforma\/tickets\/incidentes-mayores/,
  /\/plataforma\/tickets\/mesa/,
  /\/plataforma\/tickets\/reportes/
];

for (const p of patterns) {
  const m = search(rootDir, p);
  console.log(`Pattern ${p}: ${m.length} matches:`, m);
}
