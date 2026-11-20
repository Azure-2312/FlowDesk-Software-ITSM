const fs = require('fs');
const path = require('path');

const capFile = path.join(__dirname, '../src/shared/lib/capacidades.ts');
let capContent = fs.readFileSync(capFile, 'utf8');

function getConsumers() {
  function walk(dir) {
    let files = [];
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) files = files.concat(walk(full));
      else if (/\.(ts|tsx)$/.test(ent.name) && full !== capFile) {
        files.push(fs.readFileSync(full, 'utf8'));
      }
    }
    return files;
  }
  return walk(path.join(__dirname, '../src'));
}

const consumers = getConsumers();

// Get all keys
const keyRegex = /^\s*([A-Z0-9_]+):\s*"([^"]+)",/gm;
let allKeys = [];
let m;
while ((m = keyRegex.exec(capContent)) !== null) {
  allKeys.push({ key: m[1], val: m[2] });
}

const unused = [];
for (const k of allKeys) {
  const rKey = new RegExp(`CAPACIDADES\\.${k.key}\\b`);
  const rVal = new RegExp(`["']${k.val}["']`);
  const isUsed = consumers.some(c => rKey.test(c) || rVal.test(c));
  if (!isUsed) {
    unused.push(k);
  }
}

console.log(`Capacidades sin uso real fuera de capacidades.ts (${unused.length}):`);
unused.forEach(u => console.log(`  - ${u.key}`));

// Remove unused from CAPACIDADES definition and from CAPACIDADES_POR_PERFIL
let cleaned = capContent;
for (const u of unused) {
  // remove definition line
  const defLineRegex = new RegExp(`^\\s*${u.key}:\\s*"${u.val}",\\r?\\n`, 'gm');
  cleaned = cleaned.replace(defLineRegex, '');
  // remove from profile arrays
  const usageInProfileRegex = new RegExp(`^\\s*CAPACIDADES\\.${u.key},\\r?\\n`, 'gm');
  cleaned = cleaned.replace(usageInProfileRegex, '');
}

fs.writeFileSync(capFile, cleaned, 'utf8');
console.log('capacidades.ts limpiado.');
