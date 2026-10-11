const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log("Aplicando Segregacion de Funciones (SoD / ISO 27001) para perfil Administrador...");

  // Eliminar opciones operativas de cambios (28: Crear RFC, 29: Autorizaciones CAB) del perfil 1 (Administrador)
  const resDel = await pool.query(
    "DELETE FROM opciones_menu_perfiles WHERE id_perfil = 1 AND id_opcion_menu IN (28, 29) RETURNING id_opcion_menu"
  );
  console.log("Opciones operativas eliminadas del perfil Administrador:", resDel.rows);

  // Verificar opciones resultantes del Administrador para el modulo de Cambios
  const resCambios = await pool.query(`
    SELECT om.id_opcion_menu, om.nombre, om.url_menu
    FROM opciones_menu om
    JOIN opciones_menu_perfiles omp ON omp.id_opcion_menu = om.id_opcion_menu
    WHERE omp.id_perfil = 1 AND omp.estado_registro = true AND om.url_menu LIKE '/cambios%'
    ORDER BY om.id_opcion_menu
  `);
  console.log("\nOpciones de Gestion de Cambios asignadas al Administrador:");
  console.table(resCambios.rows);

  await pool.end();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
