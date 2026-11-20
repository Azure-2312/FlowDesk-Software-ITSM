const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('--- Aplicando cambios en base de datos ---');

    // 1. Remover "Mi cuenta" (#21225, #21226) de la tabla de menús y perfiles
    console.log('1. Desactivando opciones 21225 y 21226 (Mi cuenta y perfil en sidebar)...');
    await client.query(`UPDATE opciones_menu SET estado_registro = false WHERE id_opcion_menu IN (21225, 21226)`);
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu IN (21225, 21226)`);

    // 2. Remover "Mis activos" (#21118) y "Activos y CMDB" (#21109, #21110) para Solicitante (#3)
    console.log('2. Removiendo Mis activos para Solicitante y desactivando 21118...');
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_perfil = 3 AND id_opcion_menu IN (21109, 21110, 21118)`);
    await client.query(`UPDATE opciones_menu SET estado_registro = false WHERE id_opcion_menu = 21118`);
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu = 21118`);

    // 3. Remover "Mis tareas" (#21020)
    console.log('3. Desactivando opción 21020 (Mis tareas)...');
    await client.query(`UPDATE opciones_menu SET estado_registro = false WHERE id_opcion_menu = 21020`);
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_opcion_menu = 21020`);

    // 4. Remover "Revisión y publicación" (#21161) para Técnico (#2)
    console.log('4. Removiendo 21161 (Revisión y publicación) para Técnico...');
    await client.query(`DELETE FROM opciones_menu_perfiles WHERE id_perfil = 2 AND id_opcion_menu = 21161`);
    await client.query(`DELETE FROM opciones_menu_vistas_perfiles WHERE id_perfil = 2 AND id_opcion_menu = 21161`);

    // 5. Restringir Bandeja de problemas (#21093) para Técnico (#2) solo a vista 'asignados'
    console.log('5. Restringiendo Bandeja de problemas para Técnico...');
    await client.query(`DELETE FROM opciones_menu_vistas_perfiles WHERE id_perfil = 2 AND id_opcion_menu = 21093 AND vista = 'grupo'`);

    // 6. Agregar vista 'asignaciones' a Inventario de activos (#21114)
    console.log('6. Asignando vista "asignaciones" en Inventario de activos (#21114)...');
    for (const pid of [1, 2, 9]) {
      await client.query(`
        INSERT INTO opciones_menu_vistas_perfiles (id_opcion_menu, id_perfil, vista, estado_registro)
        VALUES (21114, $1, 'asignaciones', true)
        ON CONFLICT (id_opcion_menu, id_perfil, vista) DO UPDATE SET estado_registro = true
      `, [pid]);
    }

    // 7. Crear opción "Equipo de trabajo" (#21267) bajo Cambios (#21059)
    console.log('7. Registrando opción 21267 (Equipo de trabajo en Cambios)...');
    await client.query(`
      INSERT INTO opciones_menu (
        id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, bloqueado, abierto_por_defecto
      ) VALUES (
        21267,
        'Equipo de trabajo',
        '/plataforma/cambios/equipo',
        'Equipo de trabajo asignado y estado del cambio RFC en curso.',
        21059,
        2,
        3,
        true,
        false,
        false
      )
      ON CONFLICT (id_opcion_menu) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        url_menu = EXCLUDED.url_menu,
        descripcion = EXCLUDED.descripcion,
        id_padre = EXCLUDED.id_padre,
        nivel = EXCLUDED.nivel,
        orden = EXCLUDED.orden,
        estado_registro = true;
    `);

    // Reordenar hijos de Cambios (21059)
    await client.query(`UPDATE opciones_menu SET orden = 1 WHERE id_opcion_menu = 21070`); // Solicitar cambio
    await client.query(`UPDATE opciones_menu SET orden = 2 WHERE id_opcion_menu = 21068`); // Mis cambios
    await client.query(`UPDATE opciones_menu SET orden = 3 WHERE id_opcion_menu = 21267`); // Equipo de trabajo
    await client.query(`UPDATE opciones_menu SET orden = 4 WHERE id_opcion_menu = 21071`); // Calendario
    await client.query(`UPDATE opciones_menu SET orden = 5 WHERE id_opcion_menu = 21090`); // Modelos
    await client.query(`UPDATE opciones_menu SET orden = 6 WHERE id_opcion_menu = 21073`); // Gestión
    await client.query(`UPDATE opciones_menu SET orden = 7 WHERE id_opcion_menu = 21082`); // CAB
    await client.query(`UPDATE opciones_menu SET orden = 8 WHERE id_opcion_menu = 21077`); // PIR
    await client.query(`UPDATE opciones_menu SET orden = 9 WHERE id_opcion_menu = 21191`); // Configuración

    // Asignar 21267 a perfiles: 1 (Admin), 2 (Técnico), 4 (Supervisor), 8 (Gestor de Cambios)
    for (const pid of [1, 2, 4, 8]) {
      await client.query(`
        INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
        VALUES (21267, $1, true)
        ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true
      `, [pid]);
    }

    await client.query('COMMIT');
    console.log('--- ¡Cambios aplicados con éxito en la base de datos! ---');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error durante la migración:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
