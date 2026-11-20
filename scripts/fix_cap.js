const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/shared/lib/capacidades.ts');
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/\r\n/g, '\n');
const lines = c.split('\n');
const newLines = lines.filter(l => !l.includes('CATEGORIAS_VER'));
fs.writeFileSync(file, newLines.join('\n'), 'utf8');
console.log('CATEGORIAS_VER removido.');
