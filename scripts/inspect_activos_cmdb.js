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
      p.nombre as padre_nombre
    FROM opciones_menu om
    LEFT JOIN opciones_menu p ON om.id_padre = p.id_opcion_menu
    WHERE om.estado_registro = true AND (om.id_opcion_menu IN (21109, 21133) OR om.id_padre IN (21109, 21133) OR om.id_padre IN (SELECT id_opcion_menu FROM opciones_menu WHERE id_padre IN (21109, 21133)))
    ORDER BY om.id_padre NULLS FIRST, om.orden, om.id_opcion_menu
  `);

  console.log('=== ACTIVOS Y CMDB EN EL MENU ===');
  rows.forEach(r => {
    console.log(`[${r.id_opcion_menu}] (Padre: [${r.id_padre}] ${r.padre_nombre}) "${r.nombre}" -> ${r.url_menu || '(carpeta)'}`);
  });

  await pool.end();
}

check().catch(console.error);
