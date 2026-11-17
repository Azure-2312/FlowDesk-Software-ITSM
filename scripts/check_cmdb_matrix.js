const { pool } = require('./db.js');

async function run() {
  const ids = [21133, 21134, 21135, 21136, 21137, 21138, 21139, 21140, 21141, 21142, 21153];
  const r = await pool.query(`
    SELECT omp.id_opcion_menu, om.nombre, omp.id_perfil, p.nombre as perfil
    FROM opciones_menu_perfiles omp
    JOIN opciones_menu om ON om.id_opcion_menu = omp.id_opcion_menu
    JOIN perfiles p ON p.id_perfil = omp.id_perfil
    WHERE omp.id_opcion_menu = ANY($1::int[])
    ORDER BY omp.id_opcion_menu, omp.id_perfil
  `, [ids]);

  console.log(`Accesos encontrados: ${r.rows.length}`);
  const porOpcion = {};
  for (const row of r.rows) {
    if (!porOpcion[row.id_opcion_menu]) {
      porOpcion[row.id_opcion_menu] = { nombre: row.nombre, perfiles: [] };
    }
    porOpcion[row.id_opcion_menu].perfiles.push({ id: row.id_perfil, nombre: row.perfil });
  }

  for (const [id, data] of Object.entries(porOpcion)) {
    console.log(`${id} (${data.nombre}): ${data.perfiles.map(p => `${p.id}:${p.nombre}`).join(', ')}`);
  }

  await pool.end();
}

run().catch(console.error);
