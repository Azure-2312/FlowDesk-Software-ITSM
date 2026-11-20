const fs = require('fs');
const path = require('path');

const ticketsDir = path.join(__dirname, '../src/app/plataforma/tickets');

function walk(dir) {
  let files = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) files = files.concat(walk(full));
    else if (ent.name === 'page.tsx') files.push(full);
  }
  return files;
}

for (const f of walk(ticketsDir)) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const rel = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
  console.log('FILE:', rel);
  console.log('  LINES:', lines.length);
  console.log('  FIRST 3:', lines.slice(0, 3).join(' | '));
}
