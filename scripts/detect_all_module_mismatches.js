const fs = require('fs');
const { Pool } = require('pg');

const envContent = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^"/, '').replace(/"$/, '');
    break;
  }
}

const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function check() {
  const { rows } = await pool.query(`
    SELECT 
      om.id_opcion_menu,
      om.nombre,
      om.url_menu,
      om.nivel,
      om.id_padre,
      p.nombre as padre_nombre,
      gp.nombre as abuelo_nombre
    FROM opciones_menu om
    LEFT JOIN opciones_menu p ON om.id_padre = p.id_opcion_menu
    LEFT JOIN opciones_menu gp ON p.id_padre = gp.id_opcion_menu
    WHERE om.estado_registro = true AND om.url_menu IS NOT NULL AND om.url_menu != ''
    ORDER BY om.id_padre NULLS FIRST, om.orden, om.id_opcion_menu
  `);

  console.log(`Analyzing ${rows.length} leaf menu options...\n`);

  // Define expected prefix for top-level modules
  // Top modules:
  // "Mi trabajo" -> /plataforma/operacion/ (or /plataforma/mi-trabajo/)
  // "Mesa de Servicio" ->
  //    "Incidentes" -> /plataforma/incidentes/
  //    "Solicitudes" -> /plataforma/solicitudes/
  //    "Operacion de la mesa" -> /plataforma/tickets/ (or /plataforma/operacion/mesa/ or /plataforma/tickets/mesa/)
  //    "SLA" -> /plataforma/servicios/sla/ (or /plataforma/sla/)
  // "Cambios" -> /plataforma/cambios/
  // "Problemas" -> /plataforma/problemas/
  // "Activos" -> /plataforma/activos/
  // "CMDB" -> /plataforma/cmdb/
  // "Conocimiento" -> /plataforma/conocimiento/
  // "Catálogo de Servicios" -> /plataforma/servicios/
  // "Operación" -> /plataforma/operacion/
  // "Reportes" -> /plataforma/reportes/
  // "Organización" -> /plataforma/organizacion/
  // "Plataforma" -> /plataforma/seguridad/ or /plataforma/operacion/
  // "Mi cuenta" -> /plataforma/mi-cuenta/

  const mismatches = [];

  rows.forEach(r => {
    const url = r.url_menu;
    const top = (r.abuelo_nombre || r.padre_nombre || r.nombre).trim();
    const parent = (r.padre_nombre || '').trim();

    // Specific rules
    if (top === 'Mi trabajo') {
      if (!url.startsWith('/plataforma/operacion/')) {
        mismatches.push({ top, parent, id: r.id_opcion_menu, name: r.nombre, url, reason: 'En "Mi trabajo" pero URL no es /plataforma/operacion/...' });
      }
    } else if (parent === 'Incidentes' || top === 'Incidentes') {
      if (!url.startsWith('/plataforma/incidentes')) {
        mismatches.push({ top, parent, id: r.id_opcion_menu, name: r.nombre, url, reason: 'En Incidentes pero URL no es /plataforma/incidentes...' });
      }
    } else if (parent === 'Solicitudes' || top === 'Solicitudes') {
      if (!url.startsWith('/plataforma/solicitudes')) {
        mismatches.push({ top, parent, id: r.id_opcion_menu, name: r.nombre, url, reason: 'En Solicitudes pero URL no es /plataforma/solicitudes...' });
      }
    } else if (top === 'Cambios') {
      if (!url.startsWith('/plataforma/cambios')) {
        mismatches.push({ top, parent, id: r.id_opcion_menu, name: r.nombre, url, reason: 'En Cambios pero URL no es /plataforma/cambios...' });
      }
    } else if (top === 'Problemas') {
      if (!url.startsWith('/plataforma/problemas')) {
        mismatches.push({ top, parent, id: r.id_opcion_menu, name: r.nombre, url, reason: 'En Problemas pero URL no es /plataforma/problemas...' });
      }
    } else if (top === 'Activos') {
      if (!url.startsWith('/plataforma/activos')) {
        mismatches.push({ top, parent, id: r.id_opcion_menu, name: r.nombre, url, reason: 'En Activos pero URL no es /plataforma/activos...' });
      }
    } else if (top === 'CMDB') {
      if (!url.startsWith('/plataforma/cmdb')) {
        mismatches.push({ top, parent, id: r.id_opcion_menu, name: r.nombre, url, reason: 'En CMDB pero URL no es /plataforma/cmdb...' });
      }
    } else if (top === 'Conocimiento') {
      if (!url.startsWith('/plataforma/conocimiento')) {
        mismatches.push({ top, parent, id: r.id_opcion_menu, name: r.nombre, url, reason: 'En Conocimiento pero URL no es /plataforma/conocimiento...' });
      }
    } else if (top === 'Catálogo de Servicios') {
      if (!url.startsWith('/plataforma/servicios')) {
        mismatches.push({ top, parent, id: r.id_opcion_menu, name: r.nombre, url, reason: 'En Catálogo de Servicios pero URL no es /plataforma/servicios...' });
      }
    } else if (top === 'Reportes') {
      if (!url.startsWith('/plataforma/reportes')) {
        mismatches.push({ top, parent, id: r.id_opcion_menu, name: r.nombre, url, reason: 'En Reportes pero URL no es /plataforma/reportes...' });
      }
    } else if (top === 'Organización') {
      if (!url.startsWith('/plataforma/organizacion')) {
        mismatches.push({ top, parent, id: r.id_opcion_menu, name: r.nombre, url, reason: 'En Organización pero URL no es /plataforma/organizacion...' });
      }
    }
  });

  console.log(`Found ${mismatches.length} mismatches:\n`);
  mismatches.forEach(m => {
    console.log(`[${m.id}] [${m.top} -> ${m.parent}] "${m.name}"`);
    console.log(`     URL actual: ${m.url}`);
    console.log(`     Motivo: ${m.reason}\n`);
  });

  await pool.end();
}

check().catch(console.error);
