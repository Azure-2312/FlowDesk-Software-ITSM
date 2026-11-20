const fs = require('fs');
const path = require('path');

const files = [
  'src/app/plataforma/tickets/[id]/page.tsx',
  'src/app/plataforma/incidentes/[id]/page.tsx',
  'src/app/plataforma/solicitudes/[id]/page.tsx'
];

for (const f of files) {
  const p = path.join(__dirname, '..', f);
  if (fs.existsSync(p)) {
    console.log(`=== ${f} ===`);
    console.log(fs.readFileSync(p, 'utf8'));
  } else {
    console.log(`=== ${f} NOT FOUND ===`);
  }
}
