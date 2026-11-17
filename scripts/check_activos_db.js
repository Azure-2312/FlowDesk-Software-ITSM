const { pool } = require('./db.js');

async function run() {
  const r = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, orden, id_padre
    FROM opciones_menu
    WHERE id_opcion_menu BETWEEN 21109 AND 21155
    ORDER BY id_padre NULLS FIRST, orden, id_opcion_menu
  `);
  console.log(`Total opciones encontradas: ${r.rows.length}`);
  for (const row of r.rows) {
    console.log(`${row.id_opcion_menu} | ${row.nombre.padEnd(35)} | padre: ${row.id_padre} | orden: ${row.orden} | ${row.url_menu}`);
  }
  await pool.end();
}

run().catch(console.error);
