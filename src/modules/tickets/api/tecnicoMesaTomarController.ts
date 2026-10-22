import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { tomarTicketDeMesa } from "@/modules/tickets";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.TICKETS_ATENDER)) {
    return NextResponse.json(
      { error: "Solo especialistas técnicos pueden tomar tickets de la cola." },
      { status: 403 }
    );
  }

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
