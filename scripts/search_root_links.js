const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../src');

function search(dir, pattern) {
  let matches = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      matches = matches.concat(search(full, pattern));
    } else if (/\.(ts|tsx)$/.test(ent.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (pattern.test(l)) {
          matches.push(`${path.relative(path.join(__dirname, '..'), full).replace(/\\/g, '/')}:${idx+1}: ${l.trim()}`);
        }
      });
    }
  }
  return matches;
}

const urls = [
  /href=["']\/plataforma\/activos["']/,
  /href=["']\/plataforma\/cambios["']/,
  /href=["']\/plataforma\/cmdb["']/,
  /href=["']\/plataforma\/conocimiento["']/,
  /href=["']\/plataforma\/organizacion["']/,
  /href=["']\/plataforma\/problemas["']/,
  /href=["']\/plataforma\/reportes["']/,
  /href=["']\/plataforma\/seguridad["']/
];

for (const u of urls) {
  const m = search(rootDir, u);
  console.log(`Pattern ${u}: ${m.length} matches:`, m);
}
