import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Votación del CAB: la única regla que aprueba o rechaza una RFC normal.
 *
 * - Votan los Aprobadores CAB (perfil 7) activos; nunca el solicitante ni el
 *   responsable de la RFC (segregación de funciones), y una sola vez cada uno.
 * - Quórum = mitad + 1 de los Aprobadores CAB activos. Cuando los votos
 *   APROBADO alcanzan el quórum la RFC pasa a Aprobado; cuando los RECHAZADO lo
 *   alcanzan, a Cancelado. OBSERVADO deja constancia sin decidir.
 * - El concepto técnico del Supervisor y el V°B° del Gestor de Área se guardan
 *   como opinión: no cuentan para el quórum ni cambian el estado.
 */

export const SQL_VOTO_CAB = `EXISTS (SELECT 1 FROM usuario_perfiles upv
                                     WHERE upv.id_usuario = ca.id_usuario_aprobador
                                       AND upv.id_perfil = 7 AND upv.estado_registro = true)`;

export async function registrarVotoCab(idUsuario: number, idCambio: number, decision: unknown, comentario: unknown) {
  let normalizada = String(decision || "").toUpperCase();
  let texto = typeof comentario === "string" ? comentario.trim() : "";
  if (normalizada === "APROBADO_CON_CONDICIONES") {
    normalizada = "APROBADO";
    texto = `Condiciones: ${texto}`;
  }
  if (!["APROBADO", "RECHAZADO", "OBSERVADO"].includes(normalizada)) {
    throw new ErrorDominio("La decisión debe ser APROBADO, RECHAZADO, OBSERVADO o APROBADO_CON_CONDICIONES.");
  }
  if (texto.length < 3) throw new ErrorDominio("El sustento del voto es obligatorio.");

  const cambio = await queryRow<{ id_estado: number; id_usuario_solicitante: number; id_usuario_responsable: number | null }>(
    `SELECT id_estado, id_usuario_solicitante, id_usuario_responsable FROM cambio WHERE id_cambio = $1 AND estado_registro = true`,
    [idCambio]
  );
  if (!cambio) throw new ErrorDominio("El cambio no existe.", 404);
  if (cambio.id_estado !== 2) throw new ErrorDominio("La RFC no está en evaluación CAB.", 409);
  if (cambio.id_usuario_solicitante === idUsuario || cambio.id_usuario_responsable === idUsuario) {
    throw new ErrorDominio("Segregación de funciones: el solicitante o el responsable de la RFC no puede votarla.", 403);
  }

  const previo = await queryRow<{ id_cambio_aprobacion: number }>(
    `SELECT id_cambio_aprobacion FROM cambio_aprobacion WHERE id_cambio = $1 AND id_usuario_aprobador = $2 AND estado_registro = true`,
    [idCambio, idUsuario]
  );
  if (previo) throw new ErrorDominio("Ya registraste tu voto para esta RFC.", 409);

  const miembros = await queryRow<{ total: number }>(
    `SELECT COUNT(DISTINCT up.id_usuario)::int AS total
       FROM usuario_perfiles up JOIN usuario u ON u.id_usuario = up.id_usuario
      WHERE up.id_perfil = 7 AND up.estado_registro = true AND u.estado_registro = true`
  );
  const total = Number(miembros?.total || 0);
  if (total === 0) throw new ErrorDominio("No hay Aprobadores CAB activos.", 409);

  const voto = await queryRow<any>(
    `INSERT INTO cambio_aprobacion (id_cambio, id_usuario_aprobador, decision, comentario)
     VALUES ($1, $2, $3, $4)
     RETURNING id_cambio_aprobacion, decision, fecha_decision`,
    [idCambio, idUsuario, normalizada, texto]
  );

  const conteo = await queryRow<{ aprobados: number; rechazados: number }>(
    `SELECT COUNT(*) FILTER (WHERE ca.decision = 'APROBADO')::int AS aprobados,
            COUNT(*) FILTER (WHERE ca.decision = 'RECHAZADO')::int AS rechazados
       FROM cambio_aprobacion ca
      WHERE ca.id_cambio = $1 AND ca.estado_registro = true AND ${SQL_VOTO_CAB}`,
    [idCambio]
  );
  const quorum = Math.floor(total / 2) + 1;
  let nuevoEstado = 2;
  if ((conteo?.aprobados ?? 0) >= quorum) nuevoEstado = 3;
  else if ((conteo?.rechazados ?? 0) >= quorum) nuevoEstado = 8;

  if (nuevoEstado !== 2) {
    await query(
      `UPDATE cambio SET id_estado = $1, usuario_modificacion = $2, fecha_modificacion = now()
        WHERE id_cambio = $3 AND id_estado = 2`,
      [nuevoEstado, idUsuario, idCambio]
    );
  }

  return {
    mensaje:
      nuevoEstado === 3
        ? "Voto registrado: se alcanzó el quórum y la RFC quedó aprobada."
        : nuevoEstado === 8
          ? "Voto registrado: se alcanzó el quórum y la RFC quedó rechazada."
          : `Voto registrado. Faltan votos para el quórum (${quorum} de ${total}).`,
    nuevo_estado: nuevoEstado,
    aprobacion: voto,
  };
}
