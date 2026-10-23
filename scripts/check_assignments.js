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
  const ids = [21171, 21172, 21173, 21105, 21106, 21157, 21158, 21230, 21241, 21239, 21187, 21186, 21135, 21139, 21141];
  const { rows } = await pool.query(`
    SELECT om.id_opcion_menu, om.nombre, om.url_menu, array_agg(omp.id_perfil ORDER BY omp.id_perfil) as perfiles
    FROM opciones_menu om
    LEFT JOIN opciones_menu_perfiles omp ON om.id_opcion_menu = omp.id_opcion_menu
    WHERE om.id_opcion_menu = ANY($1)
    GROUP BY om.id_opcion_menu, om.nombre, om.url_menu
    ORDER BY om.id_opcion_menu
  `, [ids]);

  rows.forEach(r => {
    console.log(`[${r.id_opcion_menu}] "${r.nombre}" -> ${r.url_menu} | Asignado a perfiles: [${(r.perfiles || []).filter(x => x !== null).join(', ')}]`);
  });

  await pool.end();
}

check().catch(console.error);
