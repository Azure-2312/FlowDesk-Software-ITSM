const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('1. Renombrando /admin/tecnicos a "Especialistas técnicos"...');
    await client.query(`
      UPDATE opciones_menu 
      SET nombre = 'Especialistas técnicos', 
          descripcion = 'Gestión de plantilla técnica, especialidades y capacidad WIP',
          orden = 7
      WHERE url_menu = '/admin/tecnicos';
    `);

    console.log('2. Verificando opción /admin/departamentos...');
    const existe = await client.query("SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = '/admin/departamentos'");
    let idOpcionDepto;

    if (existe.rows.length > 0) {
      idOpcionDepto = existe.rows[0].id_opcion_menu;
      await client.query(`
        UPDATE opciones_menu SET
          nombre = 'Departamentos de TI',
          descripcion = 'Gestión de áreas resolutoras, unidades de TI y supervisores',
          id_padre = 7,
          nivel = 2,
          orden = 6,
          estado_registro = true
        WHERE id_opcion_menu = $1
      `, [idOpcionDepto]);
    } else {
      const ins = await client.query(`
        INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
        VALUES (
          'Departamentos de TI',
          '/admin/departamentos',
          'Gestión de áreas resolutoras, unidades de TI y supervisores',
          7,
          2,
          6,
          true
        ) RETURNING id_opcion_menu;
      `);
      idOpcionDepto = ins.rows[0].id_opcion_menu;
    }

    console.log('3. Asignando /admin/departamentos a Administrador (1) y Supervisor (4)...');
    for (const idPerfil of [1, 4]) {
      await client.query(`
        INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
        VALUES ($1, $2, true)
        ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
      `, [idOpcionDepto, idPerfil]);
    }

    await client.query('COMMIT');
    console.log('Migración de menú para departamentos completada con éxito.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en migración:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
