const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, id_padre, nivel, orden, estado_registro
    FROM opciones_menu
    ORDER BY COALESCE(id_padre, id_opcion_menu), nivel, orden, id_opcion_menu
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}
run();
