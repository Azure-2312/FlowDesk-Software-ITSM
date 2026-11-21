const { pool } = require('./db_helper');

async function applyRefactor() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('--- Iniciando refactor de base de datos para Rol Gestor de Área ---');

    // 1. Eliminar delegaciones por completo de la base de datos
    console.log('1. Eliminando tabla aprobacion_delegacion y opción de menú 21004...');
    await client.query(`DROP TABLE IF EXISTS aprobacion_delegacion CASCADE`);
    await client.query(`DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21004`);
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu = 21004`);
    await client.query(`DELETE FROM opciones_menu WHERE id_opcion_menu = 21004 OR url_menu LIKE '%delegacion%'`);

    // 2. Quitar Catálogo de Servicios de las opciones de Gestor de Área (id_perfil = 5)
    console.log('2. Quitando Catálogo de Servicios para Gestor de Área...');
    await client.query(`DELETE FROM opciones_menu_vistas_perfiles WHERE id_perfil = 5 AND id_opcion_menu IN (21163, 21164)`);
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_perfil = 5 AND id_opcion_menu IN (21163, 21164)`);

    // 3. Quitar "Mis incidentes" (21231) y "Mis solicitudes" (21242) para Gestor de Área (id_perfil = 5)
    console.log('3. Quitando Mis incidentes y Mis solicitudes para Gestor de Área...');
    await client.query(`DELETE FROM opciones_menu_vistas_perfiles WHERE id_perfil = 5 AND id_opcion_menu IN (21231, 21242)`);
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_perfil = 5 AND id_opcion_menu IN (21231, 21242)`);

    // 4. Agregar plantillas de cambios estándar (21090) a Gestor de Área (id_perfil = 5)
    console.log('4. Agregando plantillas de cambios estándar para Gestor de Área...');
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
      VALUES (21090, 5, true)
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true
    `);
    await client.query(`
      INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro)
      VALUES (21090, 5, 'plantillas', true)
      ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true
    `);

    // 5. Garantizar vista 'departamento' estricta para Bandeja de Incidentes (21233) y Solicitudes (21244)
    console.log('5. Asegurando vista de departamento exclusiva en incidentes y solicitudes...');
    await client.query(`DELETE FROM opciones_menu_vistas_perfiles WHERE id_perfil = 5 AND id_opcion_menu IN (21233, 21244) AND vista != 'departamento'`);
    await client.query(`
      INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro)
      VALUES (21233, 5, 'departamento', true)
      ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true
    `);
    await client.query(`
      INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro)
      VALUES (21244, 5, 'departamento', true)
      ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true
    `);

    await client.query('COMMIT');
    console.log('--- Refactorización en base de datos aplicada con éxito ---');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al aplicar refactor:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

applyRefactor().catch((e) => {
  console.error(e);
  process.exit(1);
});
