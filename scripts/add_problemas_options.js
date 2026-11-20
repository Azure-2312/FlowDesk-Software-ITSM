const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  await pool.query('BEGIN');

  // 1. Insert 21268: Mis problemas
  await pool.query(`
    INSERT INTO opciones_menu (
      id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, bloqueado, abierto_por_defecto
    ) VALUES (
      21268,
      'Mis problemas',
      '/plataforma/problemas/mios',
      'Problemas de causa raíz asignados a mi cartera técnica.',
      21091,
      2,
      2,
      true,
      false,
      false
    ) ON CONFLICT (id_opcion_menu) DO UPDATE SET estado_registro = true, orden = 2
  `);

  // 2. Insert 21269: Equipo de trabajo
  await pool.query(`
    INSERT INTO opciones_menu (
      id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, bloqueado, abierto_por_defecto
    ) VALUES (
      21269,
      'Equipo de trabajo',
      '/plataforma/problemas/equipo',
      'Equipo de investigación de problemas y casos activos de causa raíz.',
      21091,
      2,
      3,
      true,
      false,
      false
    ) ON CONFLICT (id_opcion_menu) DO UPDATE SET estado_registro = true, orden = 3
  `);

  // Reorder children of 21091
  await pool.query('UPDATE opciones_menu SET orden = 1 WHERE id_opcion_menu = 21105'); // Registrar problema
  await pool.query('UPDATE opciones_menu SET orden = 4 WHERE id_opcion_menu = 21093'); // Bandeja de problemas
  await pool.query('UPDATE opciones_menu SET orden = 5 WHERE id_opcion_menu = 21095'); // Candidatos
  await pool.query('UPDATE opciones_menu SET orden = 6 WHERE id_opcion_menu = 21098'); // KEDB
  await pool.query('UPDATE opciones_menu SET orden = 7 WHERE id_opcion_menu = 21104'); // Configuración

  // Asignar a perfiles: 1 (Admin), 2 (Técnico), 4 (Supervisor), 10 (Gestor de Problemas)
  for (const pid of [1, 2, 4, 10]) {
    await pool.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
      VALUES (21268, $1, true)
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true
    `, [pid]);
    await pool.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
      VALUES (21269, $1, true)
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true
    `, [pid]);
  }

  await pool.query('COMMIT');
  console.log('SUCCESS: Opciones 21268 y 21269 creadas y asignadas en Problemas');
}

run().catch(console.error).finally(() => pool.end());
