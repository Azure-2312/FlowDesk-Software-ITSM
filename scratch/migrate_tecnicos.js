const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrateTecnicos() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('1. Creando tablas departamento_ti y tecnico_detalle...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS departamento_ti (
        id_departamento SERIAL PRIMARY KEY,
        codigo          VARCHAR(20) UNIQUE NOT NULL,
        nombre          VARCHAR(80) NOT NULL,
        descripcion     TEXT,
        id_supervisor   INT REFERENCES usuario(id_usuario),
        estado_registro BOOLEAN NOT NULL DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS tecnico_detalle (
        id_tecnico_detalle      SERIAL PRIMARY KEY,
        id_usuario              INT UNIQUE NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
        id_departamento         INT NOT NULL REFERENCES departamento_ti(id_departamento),
        nivel_soporte           SMALLINT NOT NULL DEFAULT 1 CHECK (nivel_soporte IN (1, 2, 3)),
        capacidad_maxima_tickets INT NOT NULL DEFAULT 8,
        estado_operativo        VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
        especialidad_principal  VARCHAR(100),
        estado_registro         BOOLEAN NOT NULL DEFAULT true
      );
    `);

    console.log('2. Insertando los 5 Departamentos de TI estándar...');
    const departamentos = [
      {
        id: 1,
        codigo: 'DEP-N1-MESA',
        nombre: 'Mesa de Ayuda y Triaje (Nivel 1)',
        descripcion: 'Punto único de contacto (SPOC) para recepción, diagnóstico inicial, reseteo de claves y soporte en primer contacto.',
      },
      {
        id: 2,
        codigo: 'DEP-N2-CAMPO',
        nombre: 'Soporte en Sitio y Hardware (Nivel 2)',
        descripcion: 'Atención técnica presencial en sedes, configuración y entrega de laptops, periféricos y mantenimiento físico.',
      },
      {
        id: 3,
        codigo: 'DEP-REDES',
        nombre: 'Redes, Conectividad y Telefonía IP',
        descripcion: 'Gestión de infraestructura de telecomunicaciones, switches, Access Points, cableado estructurado y telefonía corporativa.',
      },
      {
        id: 4,
        codigo: 'DEP-N3-SIST',
        nombre: 'Sistemas, Infraestructura y Cloud (Nivel 3)',
        descripcion: 'Administración de servidores Windows/Linux, Active Directory, bases de datos SQL, ERP/CRM corporativos y nube.',
      },
      {
        id: 5,
        codigo: 'DEP-SEC',
        nombre: 'Ciberseguridad y Gestión de Identidades',
        descripcion: 'Oficialía de seguridad de la información, análisis SoD, respuesta a incidentes de malware, phishing y reglas de firewall.',
      }
    ];

    for (const d of departamentos) {
      await client.query(`
        INSERT INTO departamento_ti (id_departamento, codigo, nombre, descripcion, id_supervisor, estado_registro)
        VALUES ($1, $2, $3, $4, 1, true)
        ON CONFLICT (codigo) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          descripcion = EXCLUDED.descripcion,
          id_supervisor = EXCLUDED.id_supervisor,
          estado_registro = true;
      `, [d.id, d.codigo, d.nombre, d.descripcion]);
    }
    await client.query(`SELECT setval('departamento_ti_id_departamento_seq', (SELECT MAX(id_departamento) FROM departamento_ti));`);

    console.log('3. Enrolando técnicos existentes en tecnico_detalle...');
    // Consultar todos los usuarios con perfil técnico (2) o admin (1)
    const tecs = await client.query(`
      SELECT DISTINCT u.id_usuario, u.correo_electronico, u.nombres
      FROM usuario u
      INNER JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario
      WHERE up.id_perfil = 2 AND up.estado_registro = true;
    `);

    for (const tec of tecs.rows) {
      // Si es el usuario 1 (Admin/Prueba), asignarle departamento 1 (Mesa N1) o Nivel 2
      await client.query(`
        INSERT INTO tecnico_detalle (
          id_usuario, id_departamento, nivel_soporte, capacidad_maxima_tickets,
          estado_operativo, especialidad_principal, estado_registro
        ) VALUES ($1, 1, 2, 8, 'DISPONIBLE', 'Soporte General e Identidades corporativas', true)
        ON CONFLICT (id_usuario) DO UPDATE SET
          id_departamento = EXCLUDED.id_departamento,
          nivel_soporte = EXCLUDED.nivel_soporte,
          capacidad_maxima_tickets = EXCLUDED.capacidad_maxima_tickets,
          estado_operativo = EXCLUDED.estado_operativo,
          especialidad_principal = EXCLUDED.especialidad_principal,
          estado_registro = true;
      `, [tec.id_usuario]);
    }

    console.log('4. Agregando opción de menú para Gestión de Técnicos en /admin...');
    const parentAdmin = (await client.query(`SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = '/admin'`)).rows[0]?.id_opcion_menu;
    if (parentAdmin) {
      let opcTecnicos = (await client.query(`SELECT id_opcion_menu FROM opciones_menu WHERE url_menu = '/admin/tecnicos'`)).rows[0];
      if (!opcTecnicos) {
        const ins = await client.query(`
          INSERT INTO opciones_menu (nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
          VALUES ('Técnicos y departamentos', '/admin/tecnicos', 'Mantenimiento de especialidades, niveles N1/N2/N3 y capacidad', $1, 2, 6, true)
          RETURNING id_opcion_menu;
        `, [parentAdmin]);
        opcTecnicos = ins.rows[0];
      }

      // Asignar permisos a Administrador (1) y Supervisor (4)
      await client.query(`
        INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
        VALUES ($1, 1, 6, true), ($1, 4, 6, true)
        ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
      `, [opcTecnicos.id_opcion_menu]);
    }

    await client.query('COMMIT');
    console.log('MIGRACION DE TECNICOS COMPLETADA CON EXITO.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR EN MIGRACION DE TECNICOS:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateTecnicos();
