const { pool } = require('./db.js');

async function main() {
  const r = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, orden, id_padre
    FROM opciones_menu
    WHERE id_opcion_menu = 21091
       OR id_padre = 21091
       OR id_padre IN (SELECT id_opcion_menu FROM opciones_menu WHERE id_padre = 21091)
       OR id_opcion_menu BETWEEN 21091 AND 21109
       OR id_opcion_menu BETWEEN 21198 AND 21201
    ORDER BY id_padre NULLS FIRST, orden, id_opcion_menu
  `);
  console.log(`Total opciones encontradas: ${r.rows.length}`);
  console.log(r.rows);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
