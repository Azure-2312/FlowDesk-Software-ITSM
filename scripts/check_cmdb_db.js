const { pool } = require('./db.js');

async function run() {
  const r = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, orden, id_padre, nivel
    FROM opciones_menu
    WHERE id_opcion_menu = 21133 OR id_padre = 21133
    ORDER BY id_padre NULLS FIRST, orden
  `);
  console.log(`Total opciones encontradas: ${r.rows.length}`);
  for (const row of r.rows) {
    console.log(`${row.id_opcion_menu} | ${row.nombre.padEnd(25)} | orden: ${row.orden} | padre: ${row.id_padre} | ${row.url_menu}`);
  }
  await pool.end();
}

run().catch(console.error);
