const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../src');

function searchMarkers(dir) {
  let hits = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name !== '.next' && ent.name !== 'node_modules') {
        hits = hits.concat(searchMarkers(full));
      }
    } else if (/\.(ts|tsx)$/.test(ent.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/_old|\.bak|deprecated|TODO.*(elimin|quitar|borrar)|FIXME.*(ruta|menu)/i.test(line)) {
          hits.push({
            file: path.relative(path.join(__dirname, '..'), full).replace(/\\/g, '/'),
            line: idx + 1,
            text: line.trim()
          });
        }
      });
    }
  }
  return hits;
}

const hits = searchMarkers(rootDir);
console.log(`Marcadores encontrados en src/: ${hits.length}`);
hits.forEach(h => console.log(`${h.file}:${h.line} -> ${h.text}`));
