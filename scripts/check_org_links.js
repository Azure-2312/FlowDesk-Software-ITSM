const fs = require('fs');
const path = require('path');

const files = [
  'src/app/plataforma/organizacion/departamentos-empresa/page.tsx',
  'src/modules/organizacion/config/departamentos/VistaDepartamentos.tsx'
];

for (const f of files) {
  const p = path.join(__dirname, '..', f);
  const content = fs.readFileSync(p, 'utf8');
  const lines = content.split('\n');
  console.log(`=== ${f} ===`);
  lines.forEach((l, idx) => {
    if (/\/plataforma\/organizacion\/(departamentos|tecnicos)/.test(l)) {
      console.log(`  L${idx+1}: ${l.trim()}`);
    }
  });
}
