const fs = require('fs');
const path = require('path');

const capFile = path.join(__dirname, '../src/shared/lib/capacidades.ts');
const capContent = fs.readFileSync(capFile, 'utf8');

// Extraer las constantes de CAPACIDADES
const regex = /^\s*([A-Z0-9_]+):\s*"([^"]+)",/gm;
let caps = [];
let m;
while ((m = regex.exec(capContent)) !== null) {
  caps.push({ key: m[1], val: m[2] });
}
console.log(`Total capacidades definidas: ${caps.length}`);

// Buscar consumidores en src (excluyendo capacidades.ts)
function searchConsumers(dir) {
  let fileList = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      fileList = fileList.concat(searchConsumers(full));
    } else if (/\.(ts|tsx)$/.test(ent.name) && full !== capFile) {
      fileList.push({ path: full, content: fs.readFileSync(full, 'utf8') });
    }
  }
  return fileList;
}

const allFiles = searchConsumers(path.join(__dirname, '../src'));

const orphanCaps = [];
for (const c of caps) {
  const keyRegex = new RegExp(`CAPACIDADES\\.${c.key}\\b`);
  const valRegex = new RegExp(`"${c.val}"|'${c.val}'`);
  let found = false;
  for (const f of allFiles) {
    if (keyRegex.test(f.content) || valRegex.test(f.content)) {
      found = true;
      break;
    }
  }
  if (!found) {
    orphanCaps.push(c);
  }
}

console.log(`Capacidades huérfanas encontradas: ${orphanCaps.length}`);
orphanCaps.forEach(c => console.log(`  - ${c.key} ("${c.val}")`));
