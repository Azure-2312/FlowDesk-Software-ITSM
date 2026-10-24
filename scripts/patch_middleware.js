const fs = require('fs');

let content = fs.readFileSync('src/middleware.ts', 'utf8');

const target = '"/plataforma/seguridad/aprobador/historial": "/plataforma/seguridad/historial-aprobaciones",';
const additions = `"/plataforma/seguridad/aprobador/historial": "/plataforma/seguridad/historial-aprobaciones",
    "/plataforma/activos/panel": "/plataforma/operacion/paneles/gestor-activos",
    "/plataforma/problemas/gestion/panel": "/plataforma/operacion/paneles/gestor-problemas",
    "/plataforma/tickets/desempeno": "/plataforma/operacion/desempeno",
    "/plataforma/solicitudes/delegaciones": "/plataforma/operacion/aprobaciones/delegacion",
    "/plataforma/seguridad/delegaciones": "/plataforma/operacion/aprobaciones/delegaciones",
    "/plataforma/solicitudes/historial-area": "/plataforma/operacion/aprobaciones/historial-area",
    "/plataforma/seguridad/historial-aprobaciones": "/plataforma/operacion/aprobaciones/historial",
    "/plataforma/organizacion/equipo/ausencias": "/plataforma/operacion/equipo/ausencias",
    "/plataforma/organizacion/equipo/vistas": "/plataforma/operacion/equipo/vistas",
    "/plataforma/proveedores": "/plataforma/activos/proveedores",
    "/plataforma/avisos/mantenimientos": "/plataforma/tickets/gestion/avisos",`;

content = content.replace(target, additions);
fs.writeFileSync('src/middleware.ts', content, 'utf8');
console.log('Patched middleware.ts successfully.');
