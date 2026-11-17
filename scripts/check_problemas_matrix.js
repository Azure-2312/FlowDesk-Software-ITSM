const fs = require('fs');

const content = fs.readFileSync('docs/reestructuracion/matriz-acceso-antes.csv', 'utf8');
const lines = content.split('\n');
const header = lines[0].split(',');

const problemasIds = [
  21091, 21092, 21093, 21094, 21095, 21096, 21097, 21098, 21099, 21100,
  21101, 21102, 21103, 21104, 21105, 21106, 21107, 21108, 21199, 21200, 21201
];

console.log('ID | Nombre | Perfiles con acceso');
for (const line of lines.slice(1)) {
  if (!line.trim()) continue;
  const parts = line.split(',');
  const id = parseInt(parts[0], 10);
  if (problemasIds.includes(id)) {
    const perfiles = [];
    for (let i = 4; i < parts.length; i++) {
      if (parts[i].trim() === '1' || parts[i].trim() === 'SI' || parts[i].trim().toLowerCase() === 'true') {
        perfiles.push(header[i].trim());
      }
    }
    console.log(`${id} | ${parts[1]} | ${perfiles.join(', ')}`);
  }
}
