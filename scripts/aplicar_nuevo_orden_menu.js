const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.qagfznblisjownpozmen:13011124-APMA@aws-0-us-east-2.pooler.supabase.com:5432/postgres",
});

async function main() {
  console.log("Iniciando actualizacion de jerarquia y orden maestro del menu ITSM...");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Limpiar asignaciones previas
    console.log("Limpiando asignaciones y opciones previas...");
    await client.query("DELETE FROM opciones_menu_perfiles");
    await client.query("DELETE FROM opciones_menu");

    // 2. Insertar las opciones jerarquicas maestras
    console.log("Insertando estructura de menu de 3 niveles...");

    // Modulo 1: Mesa de Servicio (100)
    await client.query(`
      INSERT INTO opciones_menu (id_opcion_menu, nombre, url_menu, descripcion, id_padre, nivel, orden, estado_registro) VALUES
      (100, 'Mesa de Servicio', '/tickets', 'Gestión integral de incidentes y requerimientos ITIL v4', NULL, 1, 1, true),
      
      -- Nivel 2 bajo Mesa de Servicio
      (110, 'Portal de Autoservicio', '/tickets/catalogo', 'Portal corporativo para usuarios y requerimientos', 100, 2, 1, true),
      (120, 'Operación y Soporte', '/tickets/gestion/bandeja', 'Bandejas operativas y resolución de incidentes', 100, 2, 2, true),
      (130, 'Supervisión y Despacho', '/tickets/gestion/asignar', 'Gobierno operativo y balanceo de carga', 100, 2, 3, true),
      (140, 'Gobernanza de Área', '/tickets/gestion/aprobaciones', 'Autorización de solicitudes y supervisión departamental', 100, 2, 4, true),

      -- Nivel 3 bajo Portal de Autoservicio (110)
      (111, 'Catálogo de servicios', '/tickets/catalogo', 'Portal de solicitud de prestaciones TI estandarizadas', 110, 3, 1, true),
      (112, 'Registrar solicitud', '/tickets/gestion/crear', 'Registrar un nuevo ticket o incidente', 110, 3, 2, true),
      (113, 'Mis solicitudes', '/tickets/gestion/mios', 'Seguimiento de mis requerimientos registrados', 110, 3, 3, true),
      (114, 'Guías de autoayuda', '/tickets/gestion/ayuda', 'Procedimientos y soluciones de autoservicio', 110, 3, 4, true),

      -- Nivel 3 bajo Operación y Soporte (120)
      (121, 'Mis tickets asignados', '/tickets/gestion/asignados', 'Cola de trabajo personal del especialista técnico', 120, 3, 1, true),
      (122, 'Bandeja de pendientes', '/tickets/gestion/bandeja', 'Tickets sin asignar disponibles para atención (Pull)', 120, 3, 2, true),
      (123, 'Tickets de mi área técnica', '/tickets/gestion/departamento', 'Requerimientos asociados al departamento de TI', 120, 3, 3, true),
      (124, 'Historial de resueltos', '/tickets/gestion/resueltos', 'Registro de tickets con solución aplicada', 120, 3, 4, true),

      -- Nivel 3 bajo Supervisión y Despacho (130)
      (131, 'Centro de asignación', '/tickets/gestion/asignar', 'Despacho y asignación equilibrada a técnicos', 130, 3, 1, true),
      (132, 'Monitoreo de técnicos', '/tickets/gestion/tecnicos', 'Supervisión de disponibilidad y capacidad WIP', 130, 3, 2, true),
      (133, 'Todos los tickets', '/tickets/gestion/todos', 'Visibilidad omnicanal de todos los tickets del sistema', 130, 3, 3, true),
      (134, 'Auditoría forense', '/tickets/gestion/auditoria', 'Trazabilidad de ciclo de vida y cumplimiento de SLA', 130, 3, 4, true),

      -- Nivel 3 bajo Gobernanza de Área (140)
      (141, 'Mis aprobaciones', '/tickets/gestion/aprobaciones', 'Autorización de solicitudes con impacto de recursos', 140, 3, 1, true),
      (142, 'Tickets de mi departamento', '/tickets/gestion/departamento', 'Monitoreo de tickets abiertos por el personal del área', 140, 3, 2, true),

      -- Modulo 2: Gestión de Cambios (200)
      (200, 'Gestión de Cambios', '/cambios', 'Habilitación del cambio y gestión de riesgos ITIL v4', NULL, 1, 2, true),

      -- Nivel 2 bajo Gestión de Cambios
      (210, 'Operación y Solicitudes RFC', '/cambios/gestion', 'Peticiones de cambio formalizadas y calendario', 200, 2, 1, true),
      (220, 'Comité Asesor CAB', '/cambios/gestion/cab', 'Change Advisory Board y evaluación colegiada de riesgos', 200, 2, 2, true),

      -- Nivel 3 bajo Operación y Solicitudes RFC (210)
      (211, 'Registrar solicitud RFC', '/cambios/gestion/crear', 'Formulario con plan de trabajo, pruebas y rollback', 210, 3, 1, true),
      (212, 'Calendario de ventanas', '/cambios/gestion/calendario', 'Ventanas de mantenimiento y periodos de congelamiento (freeze)', 210, 3, 2, true),
      (213, 'Historial consolidado', '/cambios/gestion/todos', 'Auditoría integral de cambios y revisiones PIR', 210, 3, 3, true),

      -- Nivel 3 bajo Comité Asesor CAB (220)
      (221, 'Dictamen colegiado CAB', '/cambios/gestion/cab', 'Sesiones de votación y aprobación técnica de cambios', 220, 3, 1, true),

      -- Modulo 3: Activos de TI y CMDB (300)
      (300, 'Activos y CMDB', '/activos', 'Gestión de activos tecnológicos y mapa de configuración', NULL, 1, 3, true),

      -- Nivel 2 bajo Activos y CMDB
      (310, 'Inventario de activos (HAM)', '/activos/inventario', 'Control patrimonial de hardware, estaciones y servidores', 300, 2, 1, true),
      (320, 'Mapa de topología CMDB', '/activos/cmdb', 'Elementos de configuración CI y dependencias de servicio', 300, 2, 2, true),
      (330, 'Licencias de software (SAM)', '/activos/licencias', 'Gestión de licencias, suscripciones y garantías', 300, 2, 3, true),

      -- Modulo 4: Reportes y Analítica (400)
      (400, 'Reportes y Analítica', '/tickets/reportes', 'Indicadores clave de desempeño y métricas SLA', NULL, 1, 4, true),

      -- Nivel 2 bajo Reportes y Analítica
      (410, 'Indicadores y SLAs', '/tickets/reportes', 'Métricas de tiempo medio (MTTA/MTTR), cumplimiento SLA y CSAT', 400, 2, 1, true),

      -- Modulo 5: Administración del Sistema (500)
      (500, 'Administración', '/admin', 'Centro de configuración global y gobierno del sistema', NULL, 1, 5, true),

      -- Nivel 2 bajo Administración
      (510, 'Identidades y Accesos (IAM)', '/admin/usuarios', 'Administración de usuarios corporativos y roles RBAC', 500, 2, 1, true),
      (520, 'Gobierno del Portafolio', '/admin/servicios', 'Parámetros de catálogo, SLAs y plantillas de captura', 500, 2, 2, true),
      (530, 'Organización y Capacidad', '/admin/departamentos', 'Estructura organizativa y capacidad resolutora', 500, 2, 3, true),
      (540, 'Seguridad ISO 27001', '/admin/seguridad-logs', 'Trazabilidad de seguridad de la información ISO 27001', 500, 2, 4, true),

      -- Nivel 3 bajo Identidades y Accesos (510)
      (511, 'Gestión de usuarios', '/admin/usuarios', 'Altas, bajas y mantenimiento de usuarios del sistema', 510, 3, 1, true),
      (512, 'Perfiles y permisos', '/admin/perfiles', 'Matriz de control de acceso basada en roles (RBAC)', 510, 3, 2, true),
      (513, 'Estructura del menú', '/admin/menu', 'Configuración de jerarquías y visibilidad de opciones', 510, 3, 3, true),

      -- Nivel 3 bajo Gobierno del Portafolio (520)
      (521, 'Catálogo de servicios y SLAs', '/admin/servicios', 'Definición de servicios corporativos y acuerdos SLA', 520, 3, 1, true),
      (522, 'Configurador de esquemas RFC', '/admin/servicios', 'Plantillas de cambio, campos requeridos y evaluación de impacto', 520, 3, 2, true),

      -- Nivel 3 bajo Organización y Capacidad (530)
      (531, 'Departamentos de TI', '/admin/departamentos', 'Áreas organizacionales y unidades resolutoras', 530, 3, 1, true),
      (532, 'Especialistas técnicos', '/admin/tecnicos', 'Niveles de soporte L1/L2/L3 y capacidad WIP', 530, 3, 2, true),

      -- Nivel 3 bajo Seguridad ISO 27001 (540)
      (541, 'Logs de seguridad ISO 27001', '/admin/seguridad-logs', 'Registro de accesos, intentos fallidos y bloqueos', 540, 3, 1, true)
    `);

    await client.query("SELECT setval('opciones_menu_id_opcion_menu_seq', (SELECT MAX(id_opcion_menu) FROM opciones_menu))");

    // 3. Insertar asignaciones segregadas por perfil (SoD / RBAC)
    console.log("Insertando asignaciones por perfil con Segregacion SoD...");

    // Administrador (id_perfil: 1)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 1, orden, true FROM opciones_menu
      WHERE id_opcion_menu IN (
        100, 130, 133,
        200, 210, 212, 213,
        300, 310, 320, 330,
        400, 410,
        500, 510, 511, 512, 513, 520, 521, 522, 530, 531, 532, 540, 541
      )
    `);

    // Tecnico (id_perfil: 2)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 2, orden, true FROM opciones_menu
      WHERE id_opcion_menu IN (
        100, 110, 112, 114,
        120, 121, 122, 123, 124,
        200, 210, 211, 212, 213,
        300, 310, 320
      )
    `);

    // Solicitante (id_perfil: 3)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 3, orden, true FROM opciones_menu
      WHERE id_opcion_menu IN (
        100, 110, 111, 112, 113, 114
      )
    `);

    // Supervisor (id_perfil: 4)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 4, orden, true FROM opciones_menu
      WHERE id_opcion_menu IN (
        100, 120, 122, 124,
        130, 131, 132, 133, 134,
        200, 210, 212, 213,
        400, 410,
        500, 530, 531, 532
      )
    `);

    // Gestor de Area (id_perfil: 5)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 5, orden, true FROM opciones_menu
      WHERE id_opcion_menu IN (
        100, 110, 111, 112, 113,
        140, 141, 142,
        400, 410
      )
    `);

    // Auditor (id_perfil: 6)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 6, orden, true FROM opciones_menu
      WHERE id_opcion_menu IN (
        100, 130, 134,
        200, 210, 213,
        300, 310, 330,
        400, 410,
        500, 520, 521, 540, 541
      )
    `);

    // Aprobador CAB (id_perfil: 7)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 7, orden, true FROM opciones_menu
      WHERE id_opcion_menu IN (
        200, 210, 212, 213,
        220, 221,
        300, 320
      )
    `);

    // Gestor de Cambios (id_perfil: 8)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 8, orden, true FROM opciones_menu
      WHERE id_opcion_menu IN (
        100, 130, 133,
        200, 210, 211, 212, 213,
        220, 221,
        300, 320
      )
    `);

    // Gestor de Activos y Configuracion (id_perfil: 9)
    await client.query(`
      INSERT INTO opciones_menu_perfiles (id_opcion_menu, id_perfil, orden, estado_registro)
      SELECT id_opcion_menu, 9, orden, true FROM opciones_menu
      WHERE id_opcion_menu IN (
        100, 130, 133,
        200, 210, 212, 213,
        300, 310, 320, 330
      )
    `);

    await client.query("COMMIT");
    console.log("¡Migración y aplicación de jerarquía de menú completada con éxito!");

    // Validacion de conteo
    const totalOpciones = await client.query("SELECT COUNT(*) FROM opciones_menu");
    const totalAsignaciones = await client.query("SELECT id_perfil, COUNT(*) as cantidad FROM opciones_menu_perfiles GROUP BY id_perfil ORDER BY id_perfil");
    console.log("\nTotal opciones de menú registradas:", totalOpciones.rows[0].count);
    console.log("Asignaciones por perfil:");
    console.table(totalAsignaciones.rows);

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error durante la migracion:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(() => process.exit(1));
