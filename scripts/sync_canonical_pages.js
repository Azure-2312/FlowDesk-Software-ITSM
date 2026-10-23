const fs = require('fs');
const path = require('path');

const targetMappings = {
  // Incidentes
  '/plataforma/incidentes/sala-crisis': 'src/app/plataforma/tickets/mesa/incidente-mayor/page.tsx',
  '/plataforma/incidentes/configuracion/flujo': 'src/app/plataforma/tickets/configuracion/vistas/page.tsx',
  '/plataforma/incidentes/todos': 'src/app/plataforma/incidentes/page.tsx',

  // Solicitudes
  '/plataforma/solicitudes/configuracion/flujo': 'src/app/plataforma/tickets/configuracion/vistas/page.tsx',
  '/plataforma/solicitudes/todos': 'src/app/plataforma/solicitudes/page.tsx',
  '/plataforma/solicitudes/delegaciones': 'src/app/plataforma/solicitudes/area/delegacion/page.tsx',
  '/plataforma/solicitudes/historial-area': 'src/app/plataforma/solicitudes/area/historial/page.tsx',

  // Problemas
  '/plataforma/problemas/nuevo': 'src/app/plataforma/problemas/tecnico/nuevo/page.tsx',
  '/plataforma/problemas/todos': 'src/app/plataforma/problemas/page.tsx',
  '/plataforma/problemas/asignacion': 'src/app/plataforma/problemas/supervisor/asignar/page.tsx',
  '/plataforma/problemas/candidatos': 'src/app/plataforma/problemas/tecnico/candidatos/page.tsx',
  '/plataforma/problemas/asignados': 'src/app/plataforma/problemas/tecnico/asignados/page.tsx',
  '/plataforma/problemas/grupo': 'src/app/plataforma/problemas/tecnico/grupo/page.tsx',
  '/plataforma/problemas/mayores': 'src/app/plataforma/problemas/aprobador/page.tsx',

  // Cambios
  '/plataforma/cambios/nuevo': 'src/app/plataforma/cambios/tecnico/nuevo/page.tsx',
  '/plataforma/cambios/calendario': 'src/app/plataforma/cambios/tecnico/calendario/page.tsx',
  '/plataforma/cambios/implementacion': 'src/app/plataforma/cambios/tecnico/implementacion/page.tsx',
  '/plataforma/cambios/historial': 'src/app/plataforma/cambios/tecnico/historial/page.tsx',
  '/plataforma/cambios/mis-cambios': 'src/app/plataforma/cambios/tecnico/mis-cambios/page.tsx',
  '/plataforma/cambios/aprobaciones/tecnicas': 'src/app/plataforma/cambios/supervisor/aprobaciones/page.tsx',
  '/plataforma/cambios/programacion': 'src/app/plataforma/cambios/supervisor/programar/page.tsx',
  '/plataforma/cambios/impacto/equipo': 'src/app/plataforma/cambios/supervisor/impacto/page.tsx',
  '/plataforma/cambios/impacto/servicios': 'src/app/plataforma/cambios/tecnico/impacto/page.tsx',
  '/plataforma/cambios/impacto/interrupciones': 'src/app/plataforma/cambios/gestor-area/impacto/page.tsx',
  '/plataforma/cambios/aprobaciones/negocio': 'src/app/plataforma/cambios/gestor-area/aprobaciones/page.tsx',
  '/plataforma/cambios/aprobaciones': 'src/app/plataforma/cambios/aprobador/page.tsx',
  '/plataforma/cambios/modelos': 'src/app/plataforma/cambios/aprobador/modelos/page.tsx',

  // Activos
  '/plataforma/activos/area': 'src/app/plataforma/activos/gestor-area/page.tsx',
  '/plataforma/activos/conteos': 'src/app/plataforma/activos/tecnico/conteos/page.tsx',
  '/plataforma/activos/inventario-tecnico': 'src/app/plataforma/activos/tecnico/inventario/page.tsx',
  '/plataforma/activos/bajas/aprobacion': 'src/app/plataforma/activos/supervisor/bajas/page.tsx',
  '/plataforma/activos/bajas/consulta': 'src/app/plataforma/activos/auditor/bajas/page.tsx',
  '/plataforma/activos/bajas/renovaciones': 'src/app/plataforma/activos/aprobador/page.tsx',
  '/plataforma/activos/reparaciones': 'src/app/plataforma/activos/tecnico/mantenimiento/page.tsx',
  '/plataforma/activos/licencias/consulta': 'src/app/plataforma/activos/tecnico/licencias/page.tsx',

  // CMDB
  '/plataforma/cmdb/topologia': 'src/app/plataforma/activos/cmdb/page.tsx',
  '/plataforma/cmdb/tipos': 'src/app/plataforma/activos/cmdb/tipos/page.tsx',
  '/plataforma/cmdb/auditoria/resultados': 'src/app/plataforma/cmdb/auditor/resultados/page.tsx',

  // Conocimiento
  '/plataforma/conocimiento/base': 'src/app/plataforma/conocimiento/tecnico/base/page.tsx',
  '/plataforma/conocimiento/nuevo': 'src/app/plataforma/conocimiento/tecnico/nuevo/page.tsx',
  '/plataforma/conocimiento/mis-articulos': 'src/app/plataforma/conocimiento/tecnico/mis-articulos/page.tsx',
  '/plataforma/conocimiento/publicacion': 'src/app/plataforma/conocimiento/supervisor/revisiones/page.tsx',
  '/plataforma/conocimiento/revisiones': 'src/app/plataforma/conocimiento/tecnico/revisiones/page.tsx',

  // SLA
  '/plataforma/servicios/sla/escalamientos': 'src/app/plataforma/servicios/sla/supervisor/escalamientos/page.tsx',
  '/plataforma/servicios/sla/incumplimientos': 'src/app/plataforma/servicios/sla/supervisor/incumplimientos/page.tsx',
  '/plataforma/servicios/sla/objetivos': 'src/app/plataforma/servicios/sla/tecnico/objetivos/page.tsx',
  '/plataforma/servicios/sla/semaforo-cola': 'src/app/plataforma/servicios/sla/tecnico/semaforo/page.tsx',
  '/plataforma/servicios/sla/semaforo-grupo': 'src/app/plataforma/servicios/sla/supervisor/semaforo/page.tsx',

  // Seguridad
  '/plataforma/seguridad/delegaciones': 'src/app/plataforma/seguridad/aprobador/delegaciones/page.tsx',
  '/plataforma/seguridad/historial-aprobaciones': 'src/app/plataforma/seguridad/aprobador/historial/page.tsx',

  // Operacion
  '/plataforma/operacion/eventos-resiliencia': 'src/app/plataforma/operacion/page.tsx'
};

for (const [targetUrl, sourcePath] of Object.entries(targetMappings)) {
  const targetRel = targetUrl.replace(/^\/plataforma\//, 'src/app/plataforma/') + '/page.tsx';
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source not found: ${sourcePath}`);
    continue;
  }
  const sourceContent = fs.readFileSync(sourcePath, 'utf8');
  const targetDir = path.dirname(targetRel);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetRel, sourceContent, 'utf8');
  console.log(`Synced: ${sourcePath} -> ${targetRel}`);
}

console.log('Sync complete.');
