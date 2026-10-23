import { query } from "@/shared/lib/db";

/**
 * Disposición de activos dados de baja (solo lectura): motivo de la baja,
 * CI asociados y sustento en el historial. Lectura de dominio movida desde
 * src/modules/perfiles/auditor para que el rol solo conserve su UI.
 */
export async function listarBajasDisposicion() {
  return query(
    `SELECT a.id_activo, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo,
            a.motivo_inactivacion, a.fecha_inactivacion,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS responsable_nombre,
            (SELECT COUNT(*) FROM elemento_configuracion ci WHERE ci.id_activo = a.id_activo AND ci.estado_registro = true)::int AS ci_activos,
            (SELECT ah.motivo FROM activo_historial ah
              WHERE ah.id_activo = a.id_activo AND ah.estado_nuevo = 'BAJA'
              ORDER BY ah.fecha DESC LIMIT 1) AS motivo_historial
     FROM activo a
     LEFT JOIN usuario u ON u.id_usuario = a.usuario_inactivacion
     WHERE a.estado_registro = true AND a.estado_activo = 'BAJA'
     ORDER BY a.fecha_inactivacion DESC NULLS LAST`
  );
}
