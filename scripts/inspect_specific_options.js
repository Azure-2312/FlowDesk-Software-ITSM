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
    SELECT omp.id_opcion_menu, om.nombre, om.url_menu, p.id_perfil, p.nombre as perfil_nombre
    FROM opciones_menu_perfiles omp 
    JOIN opciones_menu om ON omp.id_opcion_menu = om.id_opcion_menu 
    JOIN perfiles p ON omp.id_perfil = p.id_perfil 
    WHERE om.id_opcion_menu IN (21105, 21106, 21102, 21103, 21093, 21094, 21095, 21096, 21098, 21099, 21104, 21107, 21239, 21187, 21186, 21157, 21158) 
    ORDER BY om.id_opcion_menu, p.id_perfil
  `);
  rows.forEach(r => console.log(`[${r.id_opcion_menu}] "${r.nombre}" -> ${r.url_menu} | Perfil ${r.id_perfil} (${r.perfil_nombre})`));
  await pool.end();
}

check().catch(console.error);
