import { NextRequest, NextResponse } from "next/server";
import { autorizarApi } from "@/shared/lib/api-auth";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { tomarTicketDeMesa } from "@/modules/tickets";

export async function POST(req: NextRequest) {
  const auth = autorizarApi(req, CAPACIDADES.TICKETS_ATENDER, {
    noAutorizado: "Solo especialistas técnicos pueden tomar tickets de la cola.",
  });
  if (!auth.autorizado) return auth.respuesta;
  const sesion = auth.sesion;

  try {
    const { id_ticket } = await req.json();
    const idTicket = parseInt(id_ticket, 10);
    const ticket = await tomarTicketDeMesa(idTicket, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
    });
    return NextResponse.json({
      exito: true,
      mensaje: `Ticket ${ticket.codigo_ticket} tomado con éxito.`,
      ticket,
    });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al tomar ticket:", error);
    const { error: mensaje, status } = respuestaError(
      error,
      "Error al procesar la toma del ticket."
    );
    return NextResponse.json({ error: mensaje }, { status });
  }
}
