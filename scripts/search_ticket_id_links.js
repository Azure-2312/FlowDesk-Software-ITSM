const fs = require('fs');
const path = require('path');

function searchAll(dir, re) {
  let results = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results = results.concat(searchAll(full, re));
    } else if (/\.(ts|tsx)$/.test(ent.name)) {
      const c = fs.readFileSync(full, 'utf8');
      const lines = c.split('\n');
      lines.forEach((l, idx) => {
        if (re.test(l)) {
          results.push(`${path.relative(path.join(__dirname, '..'), full)}:${idx+1}: ${l.trim()}`);
        }
      });
    }
  }
  return results;
}

const hits = searchAll(path.join(__dirname, '../src'), /\/plataforma\/tickets\/[0-9$]/);
console.log('Hits for /plataforma/tickets/[id]:', hits);
