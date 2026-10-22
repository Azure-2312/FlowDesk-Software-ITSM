import { pool } from "../db";

const updates: [number, string][] = [
  [21201, "Relación con incidentes y KEDB"],
  [21153, "Tipos de CI y relaciones CMDB"],
  [21193, "Flujo de evaluación y PIR"],
  [21107, "Riesgo y problemas mayores"],
  [21069, "Implementaciones del equipo"],
  [21217, "Cambios no autorizados"],
  [21205, "Grupos resolutores de TI"],
  [21145, "Licencias y contratos de área"],
  [21171, "Capacidad y continuidad"],
  [21006, "Historial de aprobaciones"],
  [21221, "Registros de seguridad"],
  [21134, "Actualizaciones de CMDB"],
  [21149, "Ciclos de vida y transiciones"],
  [21220, "Auditoría de cambios"],
  [21063, "Cambios con interrupción"],
  [21005, "Aprobaciones de mi área"],
  [21200, "Flujo de investigación"],
  [21214, "Plantillas de correo y avisos"],
  [21161, "Publicación de artículos"],
  [21076, "Cambios autorizados"],
  [21079, "Etapas de aprobación"],
  [21254, "Historial de resueltos"],
  [21223, "Retención y depuración"],
  [21066, "Cambios en mis servicios"],
  [21253, "Bandeja de pendientes"],
  [21257, "Registrar ticket de usuario"],
  [21088, "Aprobación de negocio"],
  [21142, "Auditorías de CMDB"],
  [21186, "Flujo y aprobaciones"],
  [21239, "Sala de crisis (Mayor)"],
  [21129, "Software autorizado"],
  [21108, "Cambios derivados"],
  [21065, "Cambios que afectan al equipo"],
  [21009, "Ausencias y guardias"],
  [21010, "Vistas compartidas"],
  [21124, "Bajas y renovaciones"],
  [21121, "Aprobación de bajas"],
  [21045, "Riesgos de SLA"],
  [21158, "Base de conocimiento"],
  [21246, "Solicitudes de departamento"],
  [21207, "Técnicos y soporte"],
  [21235, "Incidentes de departamento"],
  [21013, "Panel de problemas"],
  // IDs de la serie 11xxx (migrar_menu_perfiles)
  [11019, "Flujo de investigación"],
  [11020, "Relación con incidentes y KEDB"],
  [11024, "Flujo de evaluación y PIR"],
  [11025, "Notificaciones y calendario"],
  [11028, "Grupos resolutores de TI"],
  [11032, "Tipos, modelos y atributos"],
  [11033, "Ciclos de vida y transiciones"],
  [11035, "Tipos de CI y relaciones CMDB"],
  [11037, "Plantillas de correo y avisos"],
  [11040, "Categorías y reglas KCS"],
  [11043, "Registros de seguridad"],
  [11044, "Retención y depuración"],
  [11050, "Auditoría de tickets"],
  [11053, "Inventario y CMDB"],
  [11054, "Eventos y resiliencia"]
];

async function main() {
  for (const [id, nuevo] of updates) {
    await pool.query("UPDATE opciones_menu SET nombre = $1 WHERE id_opcion_menu = $2", [nuevo, id]);
  }

  // Actualizaciones por patrón de texto si existen variantes
  await pool.query("UPDATE opciones_menu SET nombre = 'Tipos de CI y relaciones CMDB' WHERE nombre LIKE '%Tipos de elementos de configuración%'");
  await pool.query("UPDATE opciones_menu SET nombre = 'Relación con incidentes y KEDB' WHERE nombre LIKE '%Relación con incidentes, errores%'");
  await pool.query("UPDATE opciones_menu SET nombre = 'Flujo de evaluación y PIR' WHERE nombre LIKE '%Flujo de evaluación, autorización%'");
  await pool.query("UPDATE opciones_menu SET nombre = 'Grupos resolutores de TI' WHERE nombre LIKE '%Departamentos y grupos resolutores%'");
  await pool.query("UPDATE opciones_menu SET nombre = 'Ciclos de vida y transiciones' WHERE nombre LIKE '%Ciclos de vida y reglas%'");
  await pool.query("UPDATE opciones_menu SET nombre = 'Auditoría de cambios' WHERE nombre LIKE '%Auditoría de cambios de configuración%'");
  await pool.query("UPDATE opciones_menu SET nombre = 'Registros de seguridad' WHERE nombre LIKE '%Registros de seguridad y autenticación%'");
  await pool.query("UPDATE opciones_menu SET nombre = 'Retención y depuración' WHERE nombre LIKE '%Retención y mantenimiento de datos%'");
  await pool.query("UPDATE opciones_menu SET nombre = 'Plantillas de correo y avisos' WHERE nombre LIKE '%Plantillas de correo y otros%'");
  await pool.query("UPDATE opciones_menu SET nombre = 'Tipos, modelos y atributos' WHERE nombre LIKE '%Tipos, modelos y atributos de activos%'");

  console.log("Nombres de opciones de menu actualizados exitosamente en la base de datos.");
  await pool.end();
}

main().catch((err) => {
  console.error("Error al actualizar nombres de menu:", err);
  process.exit(1);
});
