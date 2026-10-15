import { query } from "@/shared/lib/db";

export async function listarHistorialActivo(idActivo: number) {
  return query(
    `SELECT 
      h.id_historial,
      h.id_activo,
      h.estado_anterior,
      h.estado_nuevo,
      h.custodio_anterior,
      CONCAT(u_ca.nombres, ' ', u_ca.apellido_paterno) AS custodio_anterior_nombre,
      h.custodio_nuevo,
      CONCAT(u_cn.nombres, ' ', u_cn.apellido_paterno) AS custodio_nuevo_nombre,
      h.motivo,
      h.id_usuario,
      CONCAT(u_reg.nombres, ' ', u_reg.apellido_paterno) AS usuario_registro_nombre,
      h.fecha
     FROM activo_historial h
     LEFT JOIN usuario u_ca ON h.custodio_anterior = u_ca.id_usuario
     LEFT JOIN usuario u_cn ON h.custodio_nuevo = u_cn.id_usuario
     LEFT JOIN usuario u_reg ON h.id_usuario = u_reg.id_usuario
     WHERE h.id_activo = $1
     ORDER BY h.fecha DESC, h.id_historial DESC`,
    [idActivo]
  );
}
