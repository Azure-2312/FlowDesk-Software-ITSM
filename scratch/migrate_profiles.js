const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insertar perfiles 5 y 6 si no existen
    console.log('1. Verificando perfiles...');
    await client.query(`
      INSERT INTO perfiles (id_perfil, nombre, descripcion, estado_registro)
      VALUES 
        (5, 'Gestor de Area', 'Aprueba requerimientos y supervisa el servicio recibido por su departamento', true),
        (6, 'Auditor', 'Consulta integral de auditoría, logs de seguridad y reportes de cumplimiento sin modificar datos', true)
      ON CONFLICT (id_perfil) DO UPDATE 
      SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion, estado_registro = true;
    `);
    await client.query(`SELECT setval('perfiles_id_perfil_seq', (SELECT MAX(id_perfil) FROM perfiles));`);

    // 2. Asignar todos los perfiles (1, 2, 3, 4, 5, 6) al usuario 1 (Admin)
    console.log('2. Asignando perfiles al usuario 1...');
    for (let p = 1; p <= 6; p++) {
      await client.query(`
        INSERT INTO usuario_perfiles (id_usuario, id_perfil, estado_registro)
        VALUES (1, $1, true)
        ON CONFLICT (id_usuario, id_perfil) DO UPDATE SET estado_registro = true;
      `, [p]);
    }

    // 3. Crear nuevas opciones de menú si no existen
    console.log('3. Creando opciones de menú...');
    const parentGestion = (await client.query(`SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = '/tickets/gestion'`)).rows[0]?.id_opcion_menu;
    const parentAdmin = (await client.query(`SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = '/admin'`)).rows[0]?.id_opcion_menu;

    // Función auxiliar para insertar si no existe por url_menu
    async function asegurarOpcion(nombre, url_menu, descripcion, id_padre, nivel, orden) {
      const existe = await client.query('SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = $1', [url_menu]);
      if (existe.rows.length === 0) {
        await client.query(`
          INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [nombre, url_menu, descripcion, id_padre, nivel, orden]);
      } else {
        await client.query(`
          UPDATE opciones_menu 
          SET nombre = $1, descripcion = $2, id_padre = $3, nivel = $4, orden = $5, estado_registro = true
          WHERE url_menu = $6
        `, [nombre, descripcion, id_padre, nivel, orden, url_menu]);
      }
    }

    await asegurarOpcion('Mis aprobaciones', '/tickets/gestion/aprobaciones', 'Revisar y autorizar solicitudes de su departamento', parentGestion, 3, 3);
    await asegurarOpcion('Tickets de mi área', '/tickets/gestion/departamento', 'Seguimiento de requerimientos de su departamento', parentGestion, 3, 4);
    await asegurarOpcion('Base de autoayuda', '/tickets/gestion/ayuda', 'Guías y preguntas frecuentes para autoservicio', parentGestion, 3, 3);
    await asegurarOpcion('Auditoría de tickets', '/tickets/gestion/auditoria', 'Inspección de trazabilidad y cumplimiento de SLAs', parentGestion, 3, 10);
    await asegurarOpcion('Log de seguridad', '/admin/seguridad-logs', 'Auditoría de accesos e intentos de inicio de sesión', parentAdmin, 2, 4);

    // 4. Asignar opciones de menú por perfil
    console.log('4. Configurando permisos opciones_menu_perfiles...');
    const mapeo = {
      // Administrador (1)
      1: ['/tickets', '/tickets/gestion', '/tickets/reportes', '/tickets/gestion/todos', '/admin', '/admin/usuarios', '/admin/perfiles', '/admin/menu', '/admin/seguridad-logs'],
      // Tecnico (2)
      2: ['/tickets', '/tickets/gestion', '/tickets/gestion/asignados', '/tickets/gestion/bandeja', '/tickets/gestion/resueltos'],
      // Solicitante (3)
      3: ['/tickets', '/tickets/gestion', '/tickets/gestion/crear', '/tickets/gestion/mios', '/tickets/gestion/ayuda'],
      // Supervisor (4)
      4: ['/tickets', '/tickets/gestion', '/tickets/reportes', '/tickets/gestion/todos', '/tickets/gestion/resueltos', '/tickets/gestion/asignar', '/tickets/gestion/tecnicos'],
      // Gestor de Area (5)
      5: ['/tickets', '/tickets/gestion', '/tickets/gestion/aprobaciones', '/tickets/gestion/departamento', '/tickets/gestion/crear', '/tickets/gestion/mios', '/tickets/reportes'],
      // Auditor (6)
      6: ['/tickets', '/tickets/gestion', '/tickets/gestion/auditoria', '/tickets/reportes', '/admin', '/admin/seguridad-logs']
    };

    for (const [perfilId, urls] of Object.entries(mapeo)) {
      await client.query('DELETE FROM opciones_menu_perfiles WHERE id_perfil = $1', [perfilId]);

      for (const url of urls) {
        const opc = (await client.query('SELECT id_opcion_menu, orden FROM opciones_menu WHERE url_menu = $1', [url])).rows[0];
        if (opc) {
          await client.query(`
            INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
            VALUES ($1, $2, $3, true)
            ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
          `, [opc.id_opcion_menu, perfilId, opc.orden]);
        }
      }
    }

    await client.query('COMMIT');
    console.log('MIGRACION EXITOSA: Perfiles y opciones de menu actualizados.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR EN MIGRACION:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
