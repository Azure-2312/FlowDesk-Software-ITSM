const { pool } = require('./db.js');

async function run() {
  const r = await pool.query(`
    SELECT id_opcion_menu, nombre, url_menu, orden, id_padre
    FROM opciones_menu
    WHERE id_padre = 21215 OR id_opcion_menu = 21215
       OR id_opcion_menu IN (21208, 21209, 21210, 21211, 21213, 21216, 21217, 21218, 21219, 21220, 21221, 21222, 21223, 21224)
       OR id_padre IN (21208, 21211, 21216)
    ORDER BY id_padre NULLS FIRST, orden, id_opcion_menu
  `);
  console.log(`Total opciones encontradas: ${r.rows.length}`);
  for (const row of r.rows) {
    console.log(`${row.id_opcion_menu} | ${row.nombre.padEnd(35)} | orden: ${row.orden} | padre: ${row.id_padre} | ${row.url_menu}`);
  }

  const r2 = await pool.query(`
    SELECT omp.id_opcion_menu, om.nombre, p.id_perfil, p.nombre as perfil
    FROM opciones_menu_perfiles omp
    JOIN opciones_menu om ON om.id_opcion_menu = omp.id_opcion_menu
    JOIN perfiles p ON p.id_perfil = omp.id_perfil
    WHERE omp.id_opcion_menu IN (21215, 21208, 21209, 21210, 21211, 21216, 21220, 21221)
    ORDER BY omp.id_opcion_menu, p.id_perfil
  `);
  console.log('\n--- MATRIZ DE ACCESO ACTUAL ---');
  for (const row of r2.rows) {
    console.log(`${row.id_opcion_menu} (${row.nombre}): ${row.id_perfil}:${row.perfil}`);
  }

  const r3 = await pool.query(`
    SELECT * FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21220
  `);
  console.log('\n--- VISTAS ACTUALES PARA 21220 ---');
  console.log(r3.rows);

  await pool.end();
}

run().catch(console.error);
