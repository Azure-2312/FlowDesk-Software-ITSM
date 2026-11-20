const fs = require('fs');
const path = require('path');

const mapaUrlsContent = fs.readFileSync(path.join(__dirname, '../docs/reestructuracion/mapa-urls.md'), 'utf8');
const lines = mapaUrlsContent.split('\n');
const urls = [];
for (const l of lines) {
  const m = l.match(/^\|\s*(`[^`]+`|\/[^\s|]+)\s*\|/);
  if (m) {
    const raw = m[1].replace(/`/g, '').trim();
    if (raw.startsWith('/plataforma/')) {
      urls.push(raw);
    }
  }
}

// URLs canónicas activas
const menuUrls = new Set([
  '/plataforma/inicio',
  '/plataforma/operacion/tareas',
  '/plataforma/aprobaciones',
  '/plataforma/seguridad/delegaciones',
  '/plataforma/notificaciones',
  '/plataforma/incidentes/crear',
  '/plataforma/incidentes/mios',
  '/plataforma/incidentes/bandeja',
  '/plataforma/incidentes/mayores',
  '/plataforma/incidentes/configuracion',
  '/plataforma/solicitudes/crear',
  '/plataforma/solicitudes/mios',
  '/plataforma/solicitudes/bandeja',
  '/plataforma/solicitudes/configuracion',
  '/plataforma/tickets/gestion/asignar',
  '/plataforma/servicios/sla',
  '/plataforma/cambios/nuevo',
  '/plataforma/cambios/mis-cambios',
  '/plataforma/cambios/gestion',
  '/plataforma/cambios/cab',
  '/plataforma/cambios/gestion/calendario',
  '/plataforma/cambios/modelos',
  '/plataforma/cambios/gestion/pir',
  '/plataforma/cambios/configuracion',
  '/plataforma/problemas/crear',
  '/plataforma/problemas/bandeja',
  '/plataforma/problemas/candidatos',
  '/plataforma/problemas/kedb',
  '/plataforma/problemas/configuracion',
  '/plataforma/activos/inventario',
  '/plataforma/activos/mis-activos',
  '/plataforma/activos/asignaciones',
  '/plataforma/activos/mantenimiento',
  '/plataforma/activos/licencias',
  '/plataforma/activos/contratos',
  '/plataforma/activos/bajas',
  '/plataforma/activos/configuracion',
  '/plataforma/cmdb/cis',
  '/plataforma/cmdb/topologia',
  '/plataforma/cmdb/analisis',
  '/plataforma/cmdb/configuracion',
  '/plataforma/conocimiento/base',
  '/plataforma/conocimiento/crear',
  '/plataforma/conocimiento/mis-articulos',
  '/plataforma/conocimiento/publicacion',
  '/plataforma/conocimiento/configuracion',
  '/plataforma/servicios/catalogo',
  '/plataforma/servicios/configuracion/sla',
  '/plataforma/reportes/operativos',
  '/plataforma/reportes/cambios',
  '/plataforma/reportes/activos',
  '/plataforma/reportes/productividad',
  '/plataforma/organizacion/departamentos-empresa',
  '/plataforma/organizacion/grupos-ti',
  '/plataforma/seguridad/usuarios',
  '/plataforma/seguridad/perfiles',
  '/plataforma/seguridad/auditoria-sistema',
  '/plataforma/mi-cuenta/perfil'
]);

const urlsAntiguas = urls.filter(u => !menuUrls.has(u));

function searchFiles(dir) {
  let list = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name !== '.next' && ent.name !== 'node_modules' && ent.name !== '.git') {
        list = list.concat(searchFiles(full));
      }
    } else if (/\.(ts|tsx)$/.test(ent.name)) {
      list.push(full);
    }
  }
  return list;
}

const srcFiles = searchFiles(path.join(__dirname, '../src'));
let hits = 0;

for (const u of urlsAntiguas) {
  // Regex con límite de palabra / comilla / barra final
  // Escapar caracteres de regex en u
  const escaped = u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`["'\`\>]${escaped}([\/"'\`?#]|$)`);

  for (const f of srcFiles) {
    const content = fs.readFileSync(f, 'utf8');
    if (regex.test(content)) {
      // Excluir vistas.ts y page-auth si son rutas prefijo permitidas
      const relPath = path.relative(path.join(__dirname, '..'), f).replace(/\\/g, '/');
      console.log(`[ALERTA V-20] Encontrado "${u}" en ${relPath}`);
      hits++;
    }
  }
}

if (hits === 0) {
  console.log('\n[PASS] V-20: CERO referencias a URLs antiguas en src/ (100% LIMPIO)');
} else {
  console.log(`\n[FAIL] V-20: ${hits} referencias encontradas.`);
  process.exit(1);
}
