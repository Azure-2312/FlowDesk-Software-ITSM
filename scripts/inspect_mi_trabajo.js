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
      array_agg(omp.id_perfil ORDER BY omp.id_perfil) as perfiles
    FROM opciones_menu om
    LEFT JOIN opciones_menu p ON om.id_padre = p.id_opcion_menu
    LEFT JOIN opciones_menu_perfiles omp ON om.id_opcion_menu = omp.id_opcion_menu AND omp.estado_registro = true
    WHERE om.id_opcion_menu = 21001 OR om.id_padre = 21001 OR om.id_padre IN (SELECT id_opcion_menu FROM opciones_menu WHERE id_padre = 21001)
    GROUP BY om.id_opcion_menu, om.nombre, om.url_menu, om.nivel, om.id_padre, p.nombre
    ORDER BY om.nivel, om.orden, om.id_opcion_menu
  `);

  console.log('=== OPCIONES DE "MI TRABAJO" ===');
  rows.forEach(r => {
    const profs = (r.perfiles || []).filter(x => x !== null).join(',');
    console.log(`[${r.id_opcion_menu}] (Nivel ${r.nivel}, Padre [${r.id_padre}] ${r.padre_nombre || 'RAIZ'}) "${r.nombre}" -> ${r.url_menu || '(carpeta)'} | Perfiles: [${profs}]`);
  });

  await pool.end();
}

check().catch(console.error);
