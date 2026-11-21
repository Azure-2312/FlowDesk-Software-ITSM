const { pool } = require('./db_helper');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('--- Migración: Ajustes Rol Aprobador y Eliminación Total de Mis Aprobaciones ---');

    // 1. Eliminación TOTAL de la opción legacy 21249 ("Mis aprobaciones") en todo el sistema
    console.log('1. Eliminando opción 21249 de opciones_menu_vistas_perfiles...');
    await client.query(`DELETE FROM opciones_menu_vistas_perfiles WHERE id_opcion_menu = 21249`);

    console.log('2. Eliminando opción 21249 de opciones_menu_perfiles...');
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu = 21249`);

    console.log('3. Eliminando opción 21249 de opciones_menu...');
    await client.query(`DELETE FROM opciones_menu WHERE id_opcion_menu = 21249`);

    // 2. Para el rol Aprobador (id_perfil = 7), eliminar "Mis solicitudes" (21242)
    // y los contenedores vacíos si no tienen otras opciones asignadas (21229: Solicitudes, 21023: Mesa de Servicio)
    console.log('4. Removiendo 21242 (Mis solicitudes) de id_perfil = 7...');
    await client.query(`DELETE FROM opciones_menu_vistas_perfiles WHERE id_perfil = 7 AND id_opcion_menu = 21242`);
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_perfil = 7 AND id_opcion_menu = 21242`);

    console.log('5. Limpiando contenedores vacíos de solicitudes para id_perfil = 7...');
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_perfil = 7 AND id_opcion_menu IN (21229, 21023)`);

    // 3. Habilitar Centro de Aprobaciones de Cambios (21274) para el rol de Aprobador (id_perfil = 7)
    console.log('6. Asignando opción 21274 (Centro de aprobaciones - Cambios) a id_perfil = 7...');
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
      VALUES (21274, 7, true)
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true
    `);

    console.log('7. Asignando vistas pendientes e historial de 21274 a id_perfil = 7...');
    for (const vista of ['pendientes', 'historial']) {
      await client.query(`
        INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro)
        VALUES (21274, 7, $1, true)
        ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true
      `, [vista]);
    }

    await client.query('COMMIT');
    console.log('--- Migración completada con éxito ---');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error durante la migración:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
