const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const res = await pool.query(`
    SELECT om.id_opcion_menu, om.nombre, om.url_menu, om.id_padre, om.nivel, om.orden
    FROM opciones_menu om
    JOIN opciones_menu_perfiles omp ON omp.id_opcion_menu = om.id_opcion_menu
    WHERE omp.id_perfil = 1 AND om.estado_registro = true
    ORDER BY om.nivel, om.orden, om.id_opcion_menu
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}
check();
