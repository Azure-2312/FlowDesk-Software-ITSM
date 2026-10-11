const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function testMenus() {
  for (let p = 1; p <= 6; p++) {
    const perfil = (await pool.query('SELECT nombre FROM perfiles WHERE id_perfil = $1', [p])).rows[0];
    const opciones = await pool.query(`
      SELECT om.nombre, om.url_menu, om.nivel
      FROM opciones_menu om
      INNER JOIN opciones_menu_perfiles omp ON omp.id_opcion_menu = om.id_opcion_menu
      WHERE omp.id_perfil = $1 AND omp.estado_registro = true
      ORDER BY om.nivel, omp.orden
    `, [p]);
    console.log(`=== PERFIL ${p}: ${perfil?.nombre} ===`);
    opciones.rows.forEach(o => console.log(`  [Nivel ${o.nivel}] ${o.nombre} (${o.url_menu})`));
  }
  await pool.end();
}
testMenus();
