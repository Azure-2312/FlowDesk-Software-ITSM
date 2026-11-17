const { pool } = require('./db.js');

async function main() {
  const r = await pool.query(`
    SELECT omp.id_opcion_menu, om.nombre, omp.id_perfil, p.nombre as perfil
    FROM opciones_menu_perfiles omp
    JOIN opciones_menu om ON om.id_opcion_menu = omp.id_opcion_menu
    JOIN perfiles p ON p.id_perfil = omp.id_perfil
    WHERE omp.id_opcion_menu BETWEEN 21091 AND 21108
       OR omp.id_opcion_menu BETWEEN 21199 AND 21201
    ORDER BY omp.id_opcion_menu, omp.id_perfil
  `);
  console.log(`Found ${r.rows.length} menu-profile rows:`);
  for (const row of r.rows) {
    console.log(`${row.id_opcion_menu} | ${row.nombre} | ${row.id_perfil} (${row.perfil})`);
  }
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
