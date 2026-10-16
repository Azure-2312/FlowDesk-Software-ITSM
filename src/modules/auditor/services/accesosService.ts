import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/** Recertificación periódica de accesos: usuario × perfil. */

export async function listarRecertificacion() {
  return query(
    `SELECT u.id_usuario,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre,
            u.correo_electronico,
            p.id_perfil,
            p.nombre AS perfil_nombre,
            (SELECT MAX(la.fecha) FROM log_acceso la WHERE la.id_usuario = u.id_usuario AND la.exitoso = true) AS ultimo_acceso,
            ra.decision AS ultima_decision,
            ra.fecha_decision
     FROM usuario u
     JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro = true
     JOIN perfiles p ON p.id_perfil = up.id_perfil
     LEFT JOIN LATERAL (
       SELECT r.decision, r.fecha_decision
       FROM recertificacion_acceso r
       WHERE r.id_usuario = u.id_usuario AND r.id_perfil = up.id_perfil
       ORDER BY r.fecha_decision DESC LIMIT 1
     ) ra ON true
     WHERE u.estado_registro = true
     ORDER BY u.apellido_paterno, u.nombres, p.nombre`
  );
}

export async function registrarRecertificacion(idAuditor: number, body: any) {
  const idUsuario = Number(body.id_usuario);
  const idPerfil = Number(body.id_perfil);
  const decision = String(body.decision || "").toUpperCase();
  if (!idUsuario || !idPerfil) throw new ErrorDominio("Debes indicar el usuario y el perfil a recertificar.");
  if (!["CONFIRMADO", "RETIRADO"].includes(decision)) {
    throw new ErrorDominio("La decisión debe ser CONFIRMADO o RETIRADO.");
  }

  const existe = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM usuario_perfiles
       WHERE id_usuario = $1 AND id_perfil = $2 AND estado_registro = true
     ) AS existe`,
    [idUsuario, idPerfil]
  );
  if (!existe?.existe) throw new ErrorDominio("El usuario no tiene ese perfil activo.", 409);

  const fila = await queryRow<any>(
    `INSERT INTO recertificacion_acceso (id_usuario, id_perfil, decision, comentario, id_auditor)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_recertificacion, id_usuario, id_perfil, decision, fecha_decision`,
    [idUsuario, idPerfil, decision, body.comentario ?? null, idAuditor]
  );
  return { mensaje: "Recertificación registrada.", recertificacion: fila };
}
