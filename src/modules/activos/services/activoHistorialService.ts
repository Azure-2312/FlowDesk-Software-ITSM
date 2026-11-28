import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { ACCIONES, perfilPuedeAccion } from "@/shared/lib/capacidades";

/**
 * Historial de un activo. El custodio de cada movimiento solo lo ven los
 * perfiles que pueden saber quién tiene cada equipo (ACCIONES.CUSTODIO_VER);
 * el Gestor de Área, solo de los activos cuyo custodio actual es de su área.
 */
export async function listarHistorialActivo(idActivo: number, idPerfil = 0, idUsuario = 0) {
  if (idPerfil === 5) {
    const delArea = await queryRow<{ existe: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM activo a
           JOIN usuario uc ON uc.id_usuario = a.id_usuario_custodio
           JOIN usuario ug ON ug.id_usuario = $2
          WHERE a.id_activo = $1 AND uc.id_departamento_empresa IS NOT NULL
            AND uc.id_departamento_empresa = ug.id_departamento_empresa) AS existe`,
      [idActivo, idUsuario]
    );
    if (!delArea?.existe) throw new ErrorDominio("Activo no encontrado.", 404);
  }
  const filas = await query<any>(
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
  if (!perfilPuedeAccion(idPerfil, ACCIONES.CUSTODIO_VER)) {
    filas.forEach((f) => {
      f.custodio_anterior = null;
      f.custodio_anterior_nombre = null;
      f.custodio_nuevo = null;
      f.custodio_nuevo_nombre = null;
    });
  }
  return filas;
}
