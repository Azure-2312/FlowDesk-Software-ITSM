const { Pool } = require('pg');
const fs = require('fs');

let connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/flowdesk';
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  for (const line of content.split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      connectionString = line.substring('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
    }
  }
}

const pool = new Pool({ connectionString });

async function main() {
  const res = await pool.query(`
    SELECT om.id_opcion_menu, om.id_padre, om.nombre, om.url_menu, om.orden, om.nivel
    FROM opciones_menu om
    JOIN opciones_menu_perfiles omp ON omp.id_opcion_menu = om.id_opcion_menu
    WHERE omp.id_perfil = 1 AND om.estado_registro = true AND omp.estado_registro = true
    ORDER BY om.nivel, om.id_padre, om.orden;
  `);
  console.log(`Total menu options for Admin (perfil 1): ${res.rows.length}`);
  for (const r of res.rows) {
    if (
      r.nombre.toLowerCase().includes('cambio') || 
      r.nombre.toLowerCase().includes('problema') || 
      (r.url_menu && (r.url_menu.includes('cambio') || r.url_menu.includes('problema')))
    ) {
      console.log(`id: ${r.id_opcion_menu}, padre: ${r.id_padre}, nivel: ${r.nivel}, nombre: "${r.nombre}", url: "${r.url_menu}"`);
    }
  }
  await pool.end();
}

main();
