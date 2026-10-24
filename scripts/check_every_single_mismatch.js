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

async function checkAll() {
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
    WHERE om.estado_registro = true
    ORDER BY om.id_padre NULLS FIRST, om.orden, om.id_opcion_menu
  `);

  console.log('=== VERIFICACION DE COHERENCIA CARPETA vs URL ===');
  rows.forEach(r => {
    if (!r.url_menu) return;
    const url = r.url_menu.split('?')[0];
    const top = (r.abuelo_nombre || r.padre_nombre || r.nombre).trim();
    const parent = (r.padre_nombre || '').trim();

    // Check mapping
    let expectedPrefix = '';
    if (top === 'Mi trabajo') expectedPrefix = '/plataforma/operacion/';
    else if (top === 'Mesa de Servicio') {
      if (parent === 'Incidentes') expectedPrefix = '/plataforma/incidentes';
      else if (parent === 'Solicitudes') expectedPrefix = '/plataforma/solicitudes';
      else if (parent === 'Operacion de la mesa') expectedPrefix = '/plataforma/tickets/';
      else if (parent === 'SLA') expectedPrefix = '/plataforma/servicios/sla/';
    }
    else if (top === 'Cambios') expectedPrefix = '/plataforma/cambios';
    else if (top === 'Problemas') expectedPrefix = '/plataforma/problemas';
    else if (top === 'Activos') expectedPrefix = '/plataforma/activos';
    else if (top === 'CMDB') expectedPrefix = '/plataforma/cmdb';
    else if (top === 'Conocimiento') expectedPrefix = '/plataforma/conocimiento';
    else if (top === 'Catálogo de Servicios') expectedPrefix = '/plataforma/servicios';
    else if (top === 'Operación') expectedPrefix = '/plataforma/operacion';
    else if (top === 'Reportes') expectedPrefix = '/plataforma/reportes';
    else if (top === 'Organización') expectedPrefix = '/plataforma/organizacion';
    else if (top === 'Plataforma') expectedPrefix = '/plataforma/'; // can be /plataforma/seguridad/ or /plataforma/operacion/
    else if (top === 'Mi cuenta') expectedPrefix = '/plataforma/mi-cuenta';

    if (expectedPrefix && !url.startsWith(expectedPrefix)) {
      console.log(`[MISMATCH] [${r.id_opcion_menu}] Top: "${top}" | Padre: "${parent}" | Opcion: "${r.nombre}"`);
      console.log(`    URL: ${r.url_menu}`);
      console.log(`    Prefijo esperado: ${expectedPrefix}\n`);
    }
  });

  await pool.end();
}

checkAll().catch(console.error);
