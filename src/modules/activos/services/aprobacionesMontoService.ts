import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { UMBRAL_MONTO_APROBACION as UMBRAL_MONTO } from "@/shared/lib/parametros";

/**
 * Aprobaciones por monto sobre el ciclo de vida del activo/software:
 * bajas de activos y renovaciones de licencias que superan el umbral.
 * Lógica de dominio movida desde el portal del Aprobador
 * (`src/modules/perfiles/aprobador`) para que el rol solo conserve su UI.
 */

export async function listarBajasPorMonto() {
  return query(
    `SELECT s.id_solicitud, s.id_activo, s.motivo, s.fecha_solicitud,
            a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo,
            COALESCE(a.costo_compra, 0) AS costo_compra,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS solicitante_nombre
     FROM solicitud_baja_activo s
     JOIN activo a ON a.id_activo = s.id_activo
     LEFT JOIN usuario u ON u.id_usuario = s.id_usuario_solicita
     WHERE s.estado_registro = true AND s.estado = 'PENDIENTE'
       AND COALESCE(a.costo_compra, 0) >= $1
     ORDER BY a.costo_compra DESC NULLS LAST`,
    [UMBRAL_MONTO]
  );
}

/**
 * Una decisión vale para el periodo de vigencia actual: si se aprobó, la
 * licencia ya venció un año más tarde y la decisión queda antes del nuevo
 * periodo, así que el próximo año vuelve a aparecer; si se rechazó, la
 * licencia sigue con la misma fecha y no vuelve a pedirse.
 */
const DECIDIDA_EN_ESTE_PERIODO = `EXISTS (
  SELECT 1 FROM aprobacion_monto am
   WHERE am.tipo = 'RENOVACION' AND am.id_referencia = ls.id_licencia
     AND am.fecha_decision >= ls.fecha_vencimiento - INTERVAL '1 year'
)`;

export async function listarRenovaciones() {
  return query(
    `SELECT ls.id_licencia, ls.nombre_software, ls.fabricante, ls.tipo_licencia,
            ls.cantidad_adquirida, ls.cantidad_en_uso, ls.fecha_vencimiento,
            COALESCE(ls.costo_anual, 0) AS costo_anual,
            (ls.fecha_vencimiento - CURRENT_DATE) AS dias_restantes
     FROM licencia_software ls
     WHERE ls.estado_registro = true
       AND COALESCE(ls.costo_anual, 0) >= $1
       AND ls.fecha_vencimiento IS NOT NULL
       AND ls.fecha_vencimiento <= CURRENT_DATE + INTERVAL '90 days'
       AND NOT ${DECIDIDA_EN_ESTE_PERIODO}
     ORDER BY ls.fecha_vencimiento ASC`,
    [UMBRAL_MONTO]
  );
}

export async function listarHistorialRenovaciones() {
  return query(
    `SELECT am.id_aprobacion_monto, am.decision, am.comentario, am.monto, am.fecha_decision,
            ls.id_licencia, ls.nombre_software, ls.fabricante,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS aprobador_nombre
       FROM aprobacion_monto am
       JOIN licencia_software ls ON ls.id_licencia = am.id_referencia
       LEFT JOIN usuario u ON u.id_usuario = am.id_aprobador
      WHERE am.tipo = 'RENOVACION'
      ORDER BY am.fecha_decision DESC
      LIMIT 30`
  );
}

export async function resolverRenovacion(idUsuario: number, idLicencia: number, decision: string, comentario?: string) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBADO", "RECHAZADO"].includes(normalizada)) throw new ErrorDominio("La decisión debe ser APROBADO o RECHAZADO.");
  if (!comentario || String(comentario).trim().length < 3) throw new ErrorDominio("El comentario de la decisión es obligatorio.");

  const licencia = await queryRow<any>(
    `SELECT id_licencia, COALESCE(costo_anual, 0) AS costo_anual FROM licencia_software
     WHERE id_licencia = $1 AND estado_registro = true`,
    [idLicencia]
  );
  if (!licencia) throw new ErrorDominio("La licencia no existe.", 404);
  const pendiente = await queryRow<{ en_ventana: boolean; decidida: boolean }>(
    `SELECT (ls.fecha_vencimiento IS NOT NULL AND ls.fecha_vencimiento <= CURRENT_DATE + INTERVAL '90 days') AS en_ventana,
            ${DECIDIDA_EN_ESTE_PERIODO} AS decidida
       FROM licencia_software ls WHERE ls.id_licencia = $1`,
    [idLicencia]
  );
  if (pendiente?.decidida) throw new ErrorDominio("La renovación de este periodo ya fue decidida.", 409);
  if (!pendiente?.en_ventana) throw new ErrorDominio("La licencia todavía no está dentro de los 90 días previos a su vencimiento.", 409);
  if (Number(licencia.costo_anual) < UMBRAL_MONTO) {
    throw new ErrorDominio(`El monto no alcanza el umbral de autorización (${UMBRAL_MONTO}).`, 409);
  }

  await query(
    `INSERT INTO aprobacion_monto (tipo, id_referencia, monto, decision, comentario, id_aprobador)
     VALUES ('RENOVACION', $1, $2, $3, $4, $5)`,
    [idLicencia, licencia.costo_anual, normalizada, String(comentario).trim(), idUsuario]
  );

  if (normalizada === "APROBADO") {
    await query(
      `UPDATE licencia_software SET fecha_vencimiento = fecha_vencimiento + INTERVAL '1 year'
       WHERE id_licencia = $1`,
      [idLicencia]
    );
  }

  return {
    mensaje: normalizada === "APROBADO"
      ? "Renovación aprobada: la licencia vence un año más tarde."
      : "Renovación rechazada: la licencia no se renovará en este periodo.",
  };
}
