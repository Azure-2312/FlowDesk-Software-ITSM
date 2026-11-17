const { pool } = require('./db.js');

async function run() {
  const ids = [
    21114, 21111, 21117, 21113, // Inventario
    21118, // Mis activos
    21112, // Asignaciones
    21126, 21127, // Mantenimiento
    21132, 21130, 21129, // Licencias
    21144, 21145, 21146, 21147, // Contratos
    21123, 21122, // Bajas
    21154, 21150, 21155, 21152, // Configuración
  ];

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
