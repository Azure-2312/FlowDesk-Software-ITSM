const { Client } = require('pg');

async function sync() {
  const localClient = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/flowdesk',
    ssl: false,
  });

  const supabaseClient = new Client({
    connectionString: 'postgresql://postgres.qagfznblisjownpozmen:13011124-APMA@aws-0-us-east-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false },
  });

  await Promise.all([localClient.connect(), supabaseClient.connect()]);
  console.log('✅ Conectado a Local y Supabase. Iniciando sincronización...\n');

  // 1. Sincronizar configuracion_sistema
  console.log('--- 1. SINCRONIZANDO configuracion_sistema ---');
  const resCs = await localClient.query(`
    SELECT clave, categoria, descripcion, valor FROM configuracion_sistema;
  `);

  for (const row of resCs.rows) {
    await supabaseClient.query(`
      INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, fecha_modificacion)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (clave) DO UPDATE SET
        categoria = EXCLUDED.categoria,
        descripcion = EXCLUDED.descripcion,
        valor = EXCLUDED.valor,
        fecha_modificacion = NOW();
    `, [row.clave, row.categoria, row.descripcion, row.valor]);
    console.log(`✔ configuracion_sistema: "${row.clave}" sincronizada en Supabase.`);
  }

  // 2. Sincronizar opciones_menu (nombres, URLs canónicas, carpetas sin url)
  console.log('\n--- 2. SINCRONIZANDO opciones_menu (URLs y Nombres) ---');
  const resOm = await localClient.query(`
    SELECT id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, contador_clave, bloqueado, abierto_por_defecto, estado_registro
    FROM opciones_menu
    ORDER BY id_opcion_menu;
  `);

  for (const om of resOm.rows) {
    await supabaseClient.query(`
      UPDATE opciones_menu
      SET nombre = $1,
          url_menu = $2,
          descripcion = COALESCE($3, descripcion),
          orden = $4,
          abierto_por_defecto = $5,
          estado_registro = $6
      WHERE id_opcion_menu = $7;
    `, [om.nombre, om.url_menu, om.descripcion, om.orden, om.abierto_por_defecto, om.estado_registro, om.id_opcion_menu]);
  }
  console.log(`✔ ${resOm.rows.length} opciones_menu actualizadas con URLs canónicas y carpetas depuradas.`);

  // Asegurar que las carpetas con hijos tengan url_menu vacío en Supabase
  await supabaseClient.query(`
    UPDATE opciones_menu om
    SET url_menu = ''
    WHERE EXISTS (
      SELECT 1 FROM opciones_menu h
      WHERE h.id_padre = om.id_opcion_menu
        AND h.estado_registro = true
    );
  `);
  console.log('✔ Carpetas contenedoras depuradas (url_menu = vacío para desplegar/contraer).');

  // 3. Sincronizar opciones_menu_perfiles (desactivar 'Todos los incidentes', 'Todas las solicitudes', 'Todos los tickets' para Administrador)
  console.log('\n--- 3. SINCRONIZANDO opciones_menu_perfiles ---');
  const resOmp = await localClient.query(`
    SELECT id_opcion_menu, id_perfil, estado_registro
    FROM opciones_menu_perfiles
    WHERE id_perfil = 1;
  `);

  for (const omp of resOmp.rows) {
    await supabaseClient.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, estado_registro)
      VALUES ($1, $2, $3)
      ON CONFLICT (id_opcion_menu, id_perfil) DO UPDATE SET
        estado_registro = EXCLUDED.estado_registro;
    `, [omp.id_opcion_menu, omp.id_perfil, omp.estado_registro]);
  }

  // Desactivación estricta confirmada para Admin en Supabase:
  await supabaseClient.query(`
    UPDATE opciones_menu_perfiles 
    SET estado_registro = false 
    WHERE id_perfil = 1 AND id_opcion_menu IN (
      21230, -- 'Todos los incidentes'
      21241, -- 'Todas las solicitudes'
      21256  -- 'Todos los tickets'
    );
  `);
  console.log('✔ Permisos del Administrador (id_perfil = 1) sincronizados. "Todos los incidentes", "Todas las solicitudes" y "Todos los tickets" quedan INACTIVOS.');

  // 4. Verificar resultado en Supabase para Administrador
  const verif = await supabaseClient.query(`
    SELECT om.id_opcion_menu, om.nombre, om.url_menu, omp.estado_registro
    FROM opciones_menu om
    INNER JOIN opciones_menu_perfiles omp ON omp.id_opcion_menu = om.id_opcion_menu
    WHERE omp.id_perfil = 1 AND omp.estado_registro = true AND om.id_padre IN (21023, 21228, 21229, 21024)
    ORDER BY om.id_padre, om.orden;
  `);
  console.log('\n--- MESA DE SERVICIO EN SUPABASE PARA ADMINISTRADOR ---');
  console.table(verif.rows);

  await Promise.all([localClient.end(), supabaseClient.end()]);
  console.log('\n🎉 Sincronización completa a Supabase exitosa.');
}

sync().catch(console.error);
