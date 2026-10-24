import { queryRow } from "@/shared/lib/db";

export interface DisponibilidadTecnico {
  id_usuario_tecnico: number;
  fecha: string;
  disponible: boolean;
  motivo: string | null;
  id_ausencia: number | null;
}

function normalizarFecha(fecha: Date | string = new Date()): string {
  if (fecha instanceof Date) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  }

  const texto = String(fecha).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
    return texto.slice(0, 10);
  }

  const fechaParseada = new Date(texto);
  if (Number.isNaN(fechaParseada.getTime())) {
    throw new Error("Fecha inválida para consultar disponibilidad.");
  }
  return normalizarFecha(fechaParseada);
}

/**
 * Contrato público para que otros módulos (cambios, tickets, problemas)
 * consulten si un técnico está disponible en una fecha.
 */
export async function obtenerDisponibilidadTecnico(
  idTecnico: number,
  fecha: Date | string = new Date()
): Promise<DisponibilidadTecnico> {
  const fechaConsulta = normalizarFecha(fecha);

  const ausencia = await queryRow<{
    id_ausencia: number;
    motivo: string;
  }>(
    `SELECT id_ausencia, motivo
     FROM tecnico_ausencias
     WHERE id_usuario_tecnico = $1
       AND COALESCE(estado_registro, true) = true
       AND $2::date BETWEEN fecha_desde::date AND fecha_hasta::date
     ORDER BY fecha_desde DESC
     LIMIT 1`,
    [idTecnico, fechaConsulta]
  );

  return {
    id_usuario_tecnico: idTecnico,
    fecha: fechaConsulta,
    disponible: !ausencia,
    motivo: ausencia?.motivo ?? null,
    id_ausencia: ausencia?.id_ausencia ?? null,
  };
}

/** Contrato SC-5: `esTecnicoDisponible(idTecnico, fecha)`. */
export async function esTecnicoDisponible(
  idTecnico: number,
  fecha: Date | string = new Date()
): Promise<boolean> {
  if (!idTecnico || idTecnico <= 0) return false;
  const disponibilidad = await obtenerDisponibilidadTecnico(idTecnico, fecha);
  return disponibilidad.disponible;
}
