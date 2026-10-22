const fs = require('fs');
const { Pool } = require('pg');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      dbUrl = trimmed.replace('DATABASE_URL=', '').trim().replace(/^['"]|['"]$/g, '');
      break;
    }
  }
}

const pool = new Pool({ connectionString: dbUrl });

async function migrar() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Columnas en articulo_conocimiento
    await client.query(`
      ALTER TABLE articulo_conocimiento 
      ADD COLUMN IF NOT EXISTS veces_utilizado_en_tickets integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tipo_plantilla varchar(50) DEFAULT 'SOLUCION',
      ADD COLUMN IF NOT EXISTS clasificacion_seguridad varchar(50) DEFAULT 'INTERNO';
    `);

    // 2. Tabla articulo_conocimiento_version
    await client.query(`
      CREATE TABLE IF NOT EXISTS articulo_conocimiento_version (
        id_version serial PRIMARY KEY,
        id_articulo integer NOT NULL REFERENCES articulo_conocimiento(id_articulo) ON DELETE CASCADE,
        numero_version varchar(20) NOT NULL,
        titulo varchar(255) NOT NULL,
        contenido_markdown text NOT NULL,
        motivo_cambio text,
        id_autor integer REFERENCES usuario(id_usuario),
        fecha_creacion timestamp with time zone DEFAULT now()
      );
    `);

    // 3. Tabla articulo_conocimiento_feedback
    await client.query(`
      CREATE TABLE IF NOT EXISTS articulo_conocimiento_feedback (
        id_feedback serial PRIMARY KEY,
        id_articulo integer NOT NULL REFERENCES articulo_conocimiento(id_articulo) ON DELETE CASCADE,
        id_usuario integer REFERENCES usuario(id_usuario),
        es_positivo boolean NOT NULL,
        motivo_negativo text,
        comentario text,
        ip varchar(45),
        fecha timestamp with time zone DEFAULT now()
      );
    `);

    // 4. Tabla articulo_conocimiento_vinculo_ticket
    await client.query(`
      CREATE TABLE IF NOT EXISTS articulo_conocimiento_vinculo_ticket (
        id_vinculo serial PRIMARY KEY,
        id_articulo integer NOT NULL REFERENCES articulo_conocimiento(id_articulo) ON DELETE CASCADE,
        id_ticket integer NOT NULL REFERENCES ticket(id_ticket) ON DELETE CASCADE,
        id_tecnico integer REFERENCES usuario(id_usuario),
        resolvio_ticket boolean DEFAULT false,
        fecha_vinculo timestamp with time zone DEFAULT now(),
        CONSTRAINT uq_articulo_ticket UNIQUE (id_articulo, id_ticket)
      );
    `);

    // 5. Ajustar menú del Administrador:
    // Actualizar 21202
    await client.query(`
      UPDATE opciones_menu 
      SET nombre = 'Artículos y gobernanza KCS', orden = 1
      WHERE id_opcion_menu = 21202;
    `);

    // Insertar o actualizar opción de Configuración Categorías
    const checkCat = await client.query(`
      SELECT id_opcion_menu FROM opciones_menu 
      WHERE url_menu = '/plataforma/admin/conocimiento-config/categorias'
    `);

    let idCatMenu = 21265;
    if (checkCat.rows.length === 0) {
      const maxIdRes = await client.query('SELECT COALESCE(MAX(id_opcion_menu), 21264) + 1 AS next_id FROM opciones_menu');
      idCatMenu = maxIdRes.rows[0].next_id;

      await client.query(`
        INSERT INTO opciones_menu (
          id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro, bloqueado, abierto_por_defecto
        ) VALUES (
          $1, 'Configuración categorías', '/plataforma/admin/conocimiento-config/categorias',
          'Gestión de taxonomía y categorías de artículos de autoayuda y conocimiento ITIL',
          21156, 2, 2, true, false, false
        )
      `, [idCatMenu]);
    } else {
      idCatMenu = checkCat.rows[0].id_opcion_menu;
      await client.query(`
        UPDATE opciones_menu 
        SET nombre = 'Configuración categorías', id_padre = 21156, nivel = 2, orden = 2, estado_registro = true
        WHERE id_opcion_menu = $1
      `, [idCatMenu]);
    }

    // Vincular al Administrador (id_perfil: 1)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
      VALUES ($1, 1, true)
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET estado_registro = true;
    `, [idCatMenu]);

    // Crear versiones iniciales de los artículos existentes si no tienen ninguna
    const arts = await client.query('SELECT id_articulo, titulo, contenido_markdown, id_autor, version FROM articulo_conocimiento');
    for (const art of arts.rows) {
      const vCheck = await client.query('SELECT id_version FROM articulo_conocimiento_version WHERE id_articulo = $1', [art.id_articulo]);
      if (vCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO articulo_conocimiento_version (id_articulo, numero_version, titulo, contenido_markdown, motivo_cambio, id_autor)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          art.id_articulo,
          `1.${art.version || 0}`,
          art.titulo,
          art.contenido_markdown,
          'Línea base inicial de publicación',
          art.id_autor || 1
        ]);
      }
    }

    await client.query('COMMIT');
    console.log('Migracion completada exitosamente.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error durante la migracion:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrar();
