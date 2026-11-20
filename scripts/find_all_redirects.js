const fs = require('fs');
const path = require('path');

function findRedirects(dir) {
  let list = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      list = list.concat(findRedirects(full));
    } else if (/\.(ts|tsx)$/.test(ent.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/redirect\(/.test(line)) {
          list.push({
            file: path.relative(path.join(__dirname, '..'), full).replace(/\\/g, '/'),
            line: idx + 1,
            code: line.trim()
          });
        }
      });
    }
  }
  return list;
}

const redirs = findRedirects(path.join(__dirname, '../src'));
console.log(`Total redirect occurrences: ${redirs.length}`);
redirs.forEach(r => console.log(`${r.file}:${r.line} -> ${r.code}`));
