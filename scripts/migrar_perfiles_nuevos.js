const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insertar perfiles 7, 8, 9
    console.log('Insertando perfiles 7, 8, 9...');
    await client.query(`
      INSERT INTO perfiles (id_perfil, nombre, descripcion, estado_registro) VALUES
      (7, 'Aprobador', 'Autoridad de Cambio (CAB): evalúa impacto y autoriza solicitudes de cambio (RFC)', true),
      (8, 'Gestor de Cambios', 'Change Manager: coordina el calendario de cambios y las ventanas de mantenimiento', true),
      (9, 'Gestor de Activos y Configuracion', 'IT Asset & Configuration Manager: custodia el inventario de hardware, software y la CMDB', true)
      ON CONFLICT (id_perfil) DO UPDATE 
      SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, estado_registro = true;
    `);

    await client.query(`SELECT setval('perfiles_id_perfil_seq', (SELECT GREATEST(MAX(id_perfil), 9) FROM perfiles));`);

    // 2. Asignar perfiles 7, 8, 9 al usuario administrador (id_usuario = 1)
    console.log('Asignando perfiles 7, 8, 9 al usuario 1...');
    await client.query(`
      INSERT INTO usuario_perfiles (id_usuario, id_perfil, estado_registro) VALUES
      (1, 7, true),
      (1, 8, true),
      (1, 9, true)
      ON CONFLICT (id_usuario, id_perfil) DO UPDATE SET estado_registro = true;
    `);

    // 3. Crear opciones de menu de Nivel 1
    console.log('Creando opciones de menu de nivel 1...');
    await client.query(`
      INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      SELECT 'Gestion de cambios', '/cambios', 'Módulo de habilitación de cambios y RFCs', NULL, 1, 3, true
      WHERE NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/cambios');
    `);

    await client.query(`
      INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      SELECT 'Activos y CMDB', '/activos', 'Inventario tecnológico y mapa de dependencias CI', NULL, 1, 4, true
      WHERE NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/activos');
    `);

    // 4. Nivel 2
    console.log('Creando opciones de menu de nivel 2...');
    await client.query(`
      INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      SELECT 'Solicitudes de cambio', '/cambios/gestion', 'Registro y seguimiento de RFCs', om.id_opcion_menu, 2, 1, true
      FROM opciones_menu om
      WHERE om.url_menu = '/cambios'
        AND NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/cambios/gestion');
    `);

    // 5. Nivel 3 para Cambios
    console.log('Creando opciones de menu de nivel 3 para Cambios...');
    await client.query(`
      INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      SELECT 'Crear RFC', '/cambios/gestion/crear', 'Registrar una nueva solicitud de cambio', om.id_opcion_menu, 3, 1, true
      FROM opciones_menu om
      WHERE om.url_menu = '/cambios/gestion'
        AND NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/cambios/gestion/crear');
    `);

    await client.query(`
      INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      SELECT 'Autorizaciones CAB', '/cambios/gestion/cab', 'Bandeja de evaluación y aprobación CAB', om.id_opcion_menu, 3, 2, true
      FROM opciones_menu om
      WHERE om.url_menu = '/cambios/gestion'
        AND NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/cambios/gestion/cab');
    `);

    await client.query(`
      INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      SELECT 'Calendario de ventanas', '/cambios/gestion/calendario', 'Ventanas de mantenimiento y congelamientos', om.id_opcion_menu, 3, 3, true
      FROM opciones_menu om
      WHERE om.url_menu = '/cambios/gestion'
        AND NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/cambios/gestion/calendario');
    `);

    await client.query(`
      INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      SELECT 'Historial de cambios', '/cambios/gestion/todos', 'Registro consolidado de todos los RFCs', om.id_opcion_menu, 3, 4, true
      FROM opciones_menu om
      WHERE om.url_menu = '/cambios/gestion'
        AND NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/cambios/gestion/todos');
    `);

    // 6. Nivel 2 para Activos
    console.log('Creando opciones de menu de nivel 2 para Activos...');
    await client.query(`
      INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      SELECT 'Inventario de activos', '/activos/inventario', 'Catálogo de hardware, estaciones y equipos', om.id_opcion_menu, 2, 1, true
      FROM opciones_menu om
      WHERE om.url_menu = '/activos'
        AND NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/activos/inventario');
    `);

    await client.query(`
      INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      SELECT 'Mapa CMDB', '/activos/cmdb', 'Elementos de configuración CI y dependencias', om.id_opcion_menu, 2, 2, true
      FROM opciones_menu om
      WHERE om.url_menu = '/activos'
        AND NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/activos/cmdb');
    `);

    await client.query(`
      INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      SELECT 'Licencias de software', '/activos/licencias', 'Control de suscripciones, asientos y garantías', om.id_opcion_menu, 2, 3, true
      FROM opciones_menu om
      WHERE om.url_menu = '/activos'
        AND NOT EXISTS (SELECT 1 FROM opciones_menu WHERE url_menu = '/activos/licencias');
    `);

    // 7. Asociaciones en opciones_menu_perfiles
    console.log('Asociando opciones de menu a perfiles...');

    // Perfil 7: Aprobador (CAB)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 7, orden, true FROM opciones_menu
      WHERE url_menu IN ('/cambios', '/cambios/gestion', '/cambios/gestion/cab', '/cambios/gestion/calendario', '/cambios/gestion/todos')
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
    `);

    // Perfil 8: Gestor de Cambios
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 8, orden, true FROM opciones_menu
      WHERE url_menu IN ('/cambios', '/cambios/gestion', '/cambios/gestion/crear', '/cambios/gestion/calendario', '/cambios/gestion/todos')
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
    `);

    // Perfil 9: Gestor de Activos y Configuracion
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 9, orden, true FROM opciones_menu
      WHERE url_menu IN ('/activos', '/activos/inventario', '/activos/cmdb', '/activos/licencias')
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
    `);

    // Perfil 1: Administrador
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 1, orden, true FROM opciones_menu
      WHERE url_menu IN (
        '/cambios', '/cambios/gestion', '/cambios/gestion/crear', '/cambios/gestion/cab', '/cambios/gestion/calendario', '/cambios/gestion/todos',
        '/activos', '/activos/inventario', '/activos/cmdb', '/activos/licencias'
      )
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
    `);

    // Perfil 2: Tecnico (puede registrar RFC y ver historial)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 2, orden, true FROM opciones_menu
      WHERE url_menu IN ('/cambios', '/cambios/gestion', '/cambios/gestion/crear', '/cambios/gestion/todos')
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
    `);

    // Perfil 6: Auditor
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 6, orden, true FROM opciones_menu
      WHERE url_menu IN ('/cambios', '/cambios/gestion', '/cambios/gestion/todos', '/activos', '/activos/inventario', '/activos/licencias')
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
    `);

    await client.query('COMMIT');
    console.log('Migración completada exitosamente.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error durante la migración:', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

run();
