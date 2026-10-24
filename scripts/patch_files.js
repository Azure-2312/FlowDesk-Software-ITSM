const fs = require('fs');

function patch(file, map) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [from, to] of Object.entries(map)) {
    content = content.replace(from, to);
  }
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Patched: ${file}`);
}

patch('src/app/plataforma/tickets/page.tsx', {
  '6: "/plataforma/incidentes",': '6: "/plataforma/incidentes/todos",',
  '7: "/plataforma/solicitudes/mios",': '7: "/plataforma/solicitudes/aprobaciones",'
});
