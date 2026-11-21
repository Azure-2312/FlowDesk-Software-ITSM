const { pool } = require('./db_helper');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('--- Migración: Creación de Centros de Aprobaciones por Módulo ---');

    // 1. Quitar la opción 21249 ("Mis aprobaciones") del Gestor de Área (id_perfil = 5)
    console.log('1. Removiendo 21249 de Gestor de Área...');
    await client.query(`DELETE FROM opciones_menu_vistas_perfiles WHERE id_perfil = 5 AND id_opcion_menu = 21249`);
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_perfil = 5 AND id_opcion_menu = 21249`);

    // 2. Insertar opción 21273: Centro de aprobaciones (Solicitudes)
    console.log('2. Registrando opción 21273 (Centro de aprobaciones - Solicitudes)...');
    await client.query(`
      INSERT INTO opciones_menu (
        id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, bloqueado, abierto_por_defecto
      ) VALUES (
        21273, 'Centro de aprobaciones', '/plataforma/solicitudes/aprobaciones',
        'Gestión y dictamen de autorizaciones sobre solicitudes de servicio', 21229, 3, 4, true, false, false
      )
      ON CONFLICT (id_opcion_menu) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        url_menu = EXCLUDED.url_menu,
        descripcion = EXCLUDED.descripcion,
        id_padre = EXCLUDED.id_padre,
        nivel = EXCLUDED.nivel,
        orden = EXCLUDED.orden,
        estado_registro = true
    `);

    // 3. Insertar opción 21274: Centro de aprobaciones (Cambios)
    console.log('3. Registrando opción 21274 (Centro de aprobaciones - Cambios)...');
    await client.query(`
      INSERT INTO opciones_menu (
        id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, bloqueado, abierto_por_defecto
      ) VALUES (
        21274, 'Centro de aprobaciones', '/plataforma/cambios/aprobaciones',
        'Evaluación técnica y visto bueno de área para solicitudes de cambio (RFC)', 21059, 2, 7, true, false, false
      )
      ON CONFLICT (id_opcion_menu) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        url_menu = EXCLUDED.url_menu,
        descripcion = EXCLUDED.descripcion,
        id_padre = EXCLUDED.id_padre,
        nivel = EXCLUDED.nivel,
        orden = EXCLUDED.orden,
        estado_registro = true
    `);

    // 4. Insertar opción 21275: Centro de aprobaciones (Activos)
    console.log('4. Registrando opción 21275 (Centro de aprobaciones - Activos)...');
    await client.query(`
      INSERT INTO opciones_menu (
        id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, bloqueado, abierto_por_defecto
      ) VALUES (
        21275, 'Centro de aprobaciones', '/plataforma/activos/aprobaciones',
        'Dictamen de solicitudes de baja y desincorporación de activos', 21110, 3, 7, true, false, false
      )
      ON CONFLICT (id_opcion_menu) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        url_menu = EXCLUDED.url_menu,
        descripcion = EXCLUDED.descripcion,
        id_padre = EXCLUDED.id_padre,
        nivel = EXCLUDED.nivel,
        orden = EXCLUDED.orden,
        estado_registro = true
    `);

    // 5. Asignar permisos a Gestor de Área (id_perfil = 5) y Administrador (id_perfil = 1)
    console.log('5. Asignando perfiles y vistas autorizadas (pendientes, historial)...');
    for (const idPerfil of [1, 5]) {
      for (const idOpcion of [21273, 21274, 21275]) {
        await client.query(`
          INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
          VALUES ($1, $2, 1, true)
          ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true
        `, [idOpcion, idPerfil]);

        for (const vista of ['pendientes', 'historial']) {
          await client.query(`
            INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro)
            VALUES ($1, $2, $3, true)
            ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true
          `, [idOpcion, idPerfil, vista]);
        }
      }
    }

    await client.query('COMMIT');
    console.log('--- Migración completada con éxito ---');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en migración:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
