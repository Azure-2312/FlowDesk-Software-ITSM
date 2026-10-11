const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  console.log("Iniciando actualización de opciones de menú para el Administrador...");

  // 1. Quitar del Administrador (id_perfil = 1) las opciones operativas de cambios (212, 213, 211, 221)
  await pool.query(`
    DELETE FROM opciones_menu_perfiles
    WHERE id_perfil = 1 AND id_opcion_menu IN (200, 210, 211, 212, 213, 220, 221)
  `);
  console.log("Opciones operativas de cambios removidas del Administrador.");

  // 2. Insertar / Actualizar sub-opciones de tickets separadas por tipo bajo Supervisión y Despacho (id_padre: 130)
  // Verificar o insertar:
  // 135: Tickets de Incidente (/tickets/gestion/incidentes)
  // 136: Tickets de Solicitud (/tickets/gestion/solicitudes)
  // 137: Tickets de Problema (/tickets/gestion/problemas)
  // 138: Tickets de Cambio (/tickets/gestion/cambios)
  const subTickets = [
    { id: 135, nombre: "Tickets de Incidente", url: "/tickets/gestion/incidentes", orden: 1 },
    { id: 136, nombre: "Tickets de Solicitud", url: "/tickets/gestion/solicitudes", orden: 2 },
    { id: 137, nombre: "Tickets de Problema", url: "/tickets/gestion/problemas", orden: 3 },
    { id: 138, nombre: "Tickets de Cambio", url: "/tickets/gestion/cambios", orden: 4 },
  ];

  for (const st of subTickets) {
    await pool.query(`
      INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      VALUES ($1, $2, $3, $4, 130, 3, $5, true)
      ON CONFLICT (id_opcion_menu) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        url_menu = EXCLUDED.url_menu,
        id_padre = 130,
        nivel = 3,
        orden = EXCLUDED.orden
    `, [st.id, st.nombre, st.url, `Visor segmentado de ${st.nombre.toLowerCase()}`, st.orden]);

    // Asociar al perfil Administrador
    await pool.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden)
      VALUES ($1, 1, $2)
      ON CONFLICT (id_opcion_menu, id_perfil) DO NOTHING
    `, [st.id, st.orden]);
  }

  // 3. Crear nuevas opciones administrativas de arquitectura y gobernanza bajo Administración (id_padre: 500)
  // Submódulo 550: Diseño de Tickets y Formularios (id_padre: 500, nivel: 2)
  // 551: Diseñador de Vistas por Perfil (/admin/tickets-vistas)
  // 552: Constructor de Formularios (/admin/tickets-formularios)
  await pool.query(`
    INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
    VALUES (550, 'Diseño de Formularios y Vistas', '/admin/tickets-vistas', 'Gobernanza de qué ve cada perfil y campos de formularios', 500, 2, 5, true)
    ON CONFLICT (id_opcion_menu) DO UPDATE SET nombre = EXCLUDED.nombre, url_menu = EXCLUDED.url_menu, orden = 5
  `);
  await pool.query(`
    INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden) VALUES (550, 1, 5) ON CONFLICT DO NOTHING
  `);

  const opsFormularios = [
    { id: 551, nombre: "Vistas de Ticket por Perfil", url: "/admin/tickets-vistas", desc: "Configurar visibilidad de notas, respuestas y tipos de ticket", orden: 1 },
    { id: 552, nombre: "Constructor de Formularios", url: "/admin/tickets-formularios", desc: "Configurar campos requeridos y visibles por tipo de ticket", orden: 2 },
  ];
  for (const op of opsFormularios) {
    await pool.query(`
      INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      VALUES ($1, $2, $3, $4, 550, 3, $5, true)
      ON CONFLICT (id_opcion_menu) DO UPDATE SET nombre = EXCLUDED.nombre, url_menu = EXCLUDED.url_menu, orden = EXCLUDED.orden
    `, [op.id, op.nombre, op.url, op.desc, op.orden]);
    await pool.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden) VALUES ($1, 1, $2) ON CONFLICT DO NOTHING
    `, [op.id, op.orden]);
  }

  // Submódulo 560: Notificaciones y Comunicaciones (id_padre: 500, nivel: 2)
  // 561: Plantillas de Correo HTML y Canales (/admin/notificaciones)
  await pool.query(`
    INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
    VALUES (560, 'Comunicaciones y Notificaciones', '/admin/notificaciones', 'Diseño de correos HTML y canales externos (WhatsApp, Slack, Teams)', 500, 2, 6, true)
    ON CONFLICT (id_opcion_menu) DO UPDATE SET nombre = EXCLUDED.nombre, url_menu = EXCLUDED.url_menu, orden = 6
  `);
  await pool.query(`
    INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden) VALUES (560, 1, 6) ON CONFLICT DO NOTHING
  `);

  await pool.query(`
    INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
    VALUES (561, 'Plantillas de Correo y Canales', '/admin/notificaciones', 'Plantillas de correo HTML con logotipo e integraciones de mensajería', 560, 3, 1, true)
    ON CONFLICT (id_opcion_menu) DO UPDATE SET nombre = EXCLUDED.nombre, url_menu = EXCLUDED.url_menu, orden = 1
  `);
  await pool.query(`
    INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden) VALUES (561, 1, 1) ON CONFLICT DO NOTHING
  `);

  // Submódulo 570: Auditoría, Analítica y Mantenimiento (id_padre: 500, nivel: 2)
  // 571: Bitácora de Auditoría Integral (/admin/auditoria-sistema)
  // 572: Diseñador de Dashboards (/admin/reportes-disenador)
  // 573: Mantenimiento y Purga (/admin/mantenimiento-datos)
  await pool.query(`
    INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
    VALUES (570, 'Auditoría y Mantenimiento', '/admin/auditoria-sistema', 'Audit trail de cambios, diseñador de dashboards y purga de base de datos', 500, 2, 7, true)
    ON CONFLICT (id_opcion_menu) DO UPDATE SET nombre = EXCLUDED.nombre, url_menu = EXCLUDED.url_menu, orden = 7
  `);
  await pool.query(`
    INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden) VALUES (570, 1, 7) ON CONFLICT DO NOTHING
  `);

  const opsAuditoriaMant = [
    { id: 571, nombre: "Auditoría Integral (Audit Trail)", url: "/admin/auditoria-sistema", desc: "Registro inmutable de todo cambio de configuración en el sistema", orden: 1 },
    { id: 572, nombre: "Diseñador de Dashboards", url: "/admin/reportes-disenador", desc: "Configurar gráficos de rendimiento y KPIs gerenciales", orden: 2 },
    { id: 573, nombre: "Mantenimiento y Purga", url: "/admin/mantenimiento-datos", desc: "Archivado seguro y purga de tickets históricos", orden: 3 },
  ];
  for (const op of opsAuditoriaMant) {
    await pool.query(`
      INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
      VALUES ($1, $2, $3, $4, 570, 3, $5, true)
      ON CONFLICT (id_opcion_menu) DO UPDATE SET nombre = EXCLUDED.nombre, url_menu = EXCLUDED.url_menu, orden = EXCLUDED.orden
    `, [op.id, op.nombre, op.url, op.desc, op.orden]);
    await pool.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden) VALUES ($1, 1, $2) ON CONFLICT DO NOTHING
    `, [op.id, op.orden]);
  }

  // Opción de Modelado de Clases CI bajo Activos y CMDB (id_padre: 300)
  await pool.query(`
    INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro)
    VALUES (340, 'Modelado de Clases CI', '/activos/cmdb/tipos', 'Definir clases de CI y reglas de propagación de impacto', 300, 2, 4, true)
    ON CONFLICT (id_opcion_menu) DO UPDATE SET nombre = EXCLUDED.nombre, url_menu = EXCLUDED.url_menu, orden = 4
  `);
  await pool.query(`
    INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden) VALUES (340, 1, 4) ON CONFLICT DO NOTHING
  `);

  console.log("Actualización de base de datos de menú completada.");
  await pool.end();
}

run().catch((err) => {
  console.error("Error al actualizar menú:", err);
  process.exit(1);
});
