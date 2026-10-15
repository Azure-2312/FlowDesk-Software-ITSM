import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_MANTENIMIENTO)) {
    return NextResponse.json({ error: "No autorizado. Solo Administradores pueden gestionar purga de datos." }, { status: 403 });
  }

  try {
    const body = await req.json();
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
      return NextResponse.json({
        simulacion: true,
        aniosAntiguedad,
        fechaCorte: fechaLimite.toLocaleDateString(),
        totalTicketsCandidatos: totalCandidatos,
        estimadoKbLiberados: (totalCandidatos * 12.5).toFixed(1) + " KB",
        mensaje: `Se identificaron ${totalCandidatos} tickets cerrados con más de ${aniosAntiguedad} años de antigüedad elegibles para archivado o purga.`
      });
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
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await query(`
        INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
        VALUES ($1, 'MANTENIMIENTO', 'PURGA_HISTORICA', $2, $3, $4)
      `, [
        sesion.id_usuario,
        `El usuario ${sesion.nombres} ejecutó una purga de datos archivando ${totalCandidatos} tickets anteriores al ${fechaLimite.toLocaleDateString()}`,
        JSON.stringify({ aniosAntiguedad, ticketsAfectados: totalCandidatos }),
        ip
      ]);

      return NextResponse.json({
        exito: true,
        ticketsPurgados: totalCandidatos,
        mensaje: `Se archivaron exitosamente ${totalCandidatos} tickets históricos del sistema.`
      });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error) {
    console.error("Error en mantenimiento de datos:", error);
    return NextResponse.json({ error: "Error interno al procesar mantenimiento de datos." }, { status: 500 });
  }
}
