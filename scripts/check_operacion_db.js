const { pool } = require('./db.js');

async function run() {
  const r = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, orden, id_padre
    FROM opciones_menu
    WHERE id_padre = 21170 OR id_opcion_menu = 21170
       OR id_opcion_menu IN (21170, 21171, 21172, 21173)
    ORDER BY id_padre NULLS FIRST, orden, id_opcion_menu
  `);
  console.log(`Total opciones encontradas: ${r.rows.length}`);
  for (const row of r.rows) {
    console.log(`${row.id_opcion_menu} | ${row.nombre.padEnd(45)} | orden: ${row.orden} | padre: ${row.id_padre} | ${row.url_menu}`);
  }

  const roots = await pool.query(`
    SELECT id_opcion_menu, nombre, orden
    FROM opciones_menu
    WHERE id_padre IS NULL
    ORDER BY orden, id_opcion_menu
  `);
  console.log(`\n--- RAÍCES ACTUALES (${roots.rows.length}) ---`);
  for (const row of roots.rows) {
    console.log(`${row.id_opcion_menu} | ${row.nombre}`);
  }

  await pool.end();
}

run().catch(console.error);
