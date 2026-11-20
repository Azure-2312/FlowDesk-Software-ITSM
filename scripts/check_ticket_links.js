const fs = require('fs');
const path = require('path');

const files = [
  'src/modules/operacion/paneles/solicitante/VistaPanelSolicitante.tsx',
  'src/modules/tickets/presentadores/PresentadorAdmin.tsx',
  'src/modules/tickets/ticket-detail/presentadores/VistaTicketAdministrador.tsx',
  'src/modules/operacion/paneles/supervisor/VistaPanelSupervisor.tsx',
  'src/modules/activos/views/VistaActivosInventario.tsx'
];

for (const f of files) {
  const p = path.join(__dirname, '..', f);
  const content = fs.readFileSync(p, 'utf8');
  const lines = content.split('\n');
  console.log(`=== ${f} ===`);
  lines.forEach((line, idx) => {
    if (/\/plataforma\/tickets\//.test(line)) {
      console.log(`  L${idx + 1}: ${line.trim()}`);
    }
  });
}
