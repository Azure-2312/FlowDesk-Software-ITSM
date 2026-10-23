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

async function audit() {
  console.log('=== 1. PARENT FOLDERS (nivel 1 and folders) ===');
  const parents = await pool.query(`
    SELECT id_opcion_menu, nivel, id_padre, nombre, url_menu
    FROM opciones_menu
    WHERE url_menu IS NULL OR url_menu = '' OR nivel = 1
    ORDER BY nivel, orden, id_opcion_menu
  `);
  parents.rows.forEach(r => {
    console.log(`[${r.id_opcion_menu}] (Nivel ${r.nivel}, Padre ${r.id_padre || 0}) "${r.nombre}" -> ${r.url_menu || '(NULL)'}`);
  });

  console.log('\n=== 2. ALL MODULES AND THEIR DIRECT LEAF / CHILD URLS ===');
  const all = await pool.query(`
    SELECT om.id_opcion_menu, om.nivel, om.id_padre, p.nombre as padre_nombre, om.nombre, om.url_menu
    FROM opciones_menu om
    LEFT JOIN opciones_menu p ON om.id_padre = p.id_opcion_menu
    WHERE om.estado_registro = true
    ORDER BY om.id_padre NULLS FIRST, om.orden, om.id_opcion_menu
  `);

  // Check which child options have root module URLs
  const rootCandidates = [
    '/plataforma/incidentes',
    '/plataforma/solicitudes',
    '/plataforma/problemas',
    '/plataforma/cambios',
    '/plataforma/activos',
    '/plataforma/cmdb',
    '/plataforma/conocimiento',
    '/plataforma/servicios',
    '/plataforma/operacion',
    '/plataforma/reportes',
    '/plataforma/organizacion',
    '/plataforma/seguridad'
  ];

  console.log('\n=== 3. CHILD OPTIONS COLLIDING WITH ROOT MODULE URLS ===');
  all.rows.forEach(r => {
    if (r.url_menu && rootCandidates.includes(r.url_menu.trim().toLowerCase())) {
      console.log(`[${r.id_opcion_menu}] (Nivel ${r.nivel}) Padre: [${r.id_padre}] ${r.padre_nombre} | Nombre: "${r.nombre}" -> URL: ${r.url_menu}`);
    }
  });

  await pool.end();
}

audit().catch(console.error);
