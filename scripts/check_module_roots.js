const fs = require('fs');
const path = require('path');

const moduleRoots = [
  'src/app/plataforma/activos/page.tsx',
  'src/app/plataforma/cambios/page.tsx',
  'src/app/plataforma/cmdb/page.tsx',
  'src/app/plataforma/conocimiento/page.tsx',
  'src/app/plataforma/mi-cuenta/page.tsx',
  'src/app/plataforma/organizacion/page.tsx',
  'src/app/plataforma/problemas/page.tsx',
  'src/app/plataforma/reportes/page.tsx',
  'src/app/plataforma/seguridad/page.tsx',
  'src/app/plataforma/page.tsx'
];

for (const f of moduleRoots) {
  const p = path.join(__dirname, '..', f);
  if (fs.existsSync(p)) {
    console.log(`=== ${f} ===`);
    console.log(fs.readFileSync(p, 'utf8'));
  }
}
