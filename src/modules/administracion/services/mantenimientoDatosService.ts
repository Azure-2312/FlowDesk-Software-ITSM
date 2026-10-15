import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface ContextoMantenimientoDatos {
  idUsuario: number;
  nombres: string;
  ip: string;
}

export async function procesarMantenimientoDatos(body: any, contexto: ContextoMantenimientoDatos) {
  const { aniosAntiguedad = 5, accion = "SIMULAR" } = body;

  const fechaLimite = new Date();
  fechaLimite.setFullYear(fechaLimite.getFullYear() - aniosAntiguedad);

  // Conteo de tickets cerrados anteriores a la fecha limite
  const conteo = await queryRow<{ total: number }>(`
      SELECT COUNT(*)::int as total
      FROM ticket
      WHERE id_estado IN (6, 7) -- Cerrado o Cancelado
        AND fecha_cierre < $1
    `, [fechaLimite.toISOString()]);

  const totalCandidatos = conteo?.total || 0;

  if (accion === "SIMULAR") {
    return {
      simulacion: true,
      aniosAntiguedad,
      fechaCorte: fechaLimite.toLocaleDateString(),
      totalTicketsCandidatos: totalCandidatos,
      estimadoKbLiberados: (totalCandidatos * 12.5).toFixed(1) + " KB",
      mensaje: `Se identificaron ${totalCandidatos} tickets cerrados con más de ${aniosAntiguedad} años de antigüedad elegibles para archivado o purga.`,
    };
  }

  if (accion === "PURGAR") {
    // Purgado / Archivado seguro: actualización inmutable
    await query(`
        UPDATE ticket
        SET estado_registro = false,
            motivo_cancelacion = 'PURGA_HISTORICA_AUTOMATIZADA_POLITICA_DATOS'
        WHERE id_estado IN (6, 7)
          AND fecha_cierre < $1
      `, [fechaLimite.toISOString()]);

    // Registrar en Audit Trail
    await query(`
        INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
        VALUES ($1, 'MANTENIMIENTO', 'PURGA_HISTORICA', $2, $3, $4)
      `, [
      contexto.idUsuario,
      `El usuario ${contexto.nombres} ejecutó una purga de datos archivando ${totalCandidatos} tickets anteriores al ${fechaLimite.toLocaleDateString()}`,
      JSON.stringify({ aniosAntiguedad, ticketsAfectados: totalCandidatos }),
      contexto.ip,
    ]);

    return {
      exito: true,
      ticketsPurgados: totalCandidatos,
      mensaje: `Se archivaron exitosamente ${totalCandidatos} tickets históricos del sistema.`,
    };
  }

  throw new ErrorDominio("Acción no reconocida.");
}
