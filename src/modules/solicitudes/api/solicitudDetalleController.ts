import { NextRequest, NextResponse } from "next/server";
import { ticketDetalleGet as obtenerTicket, ticketDetallePatch as actualizarTicket } from "@/modules/tickets";
import { obtenerIdTipoTicketPorCodigo } from "@/modules/solicitudes/solicitudesService";

type Contexto = { params: { id: string } };

async function validarTipo(req: NextRequest, context: Contexto) {
  const respuesta = await obtenerTicket(req, context);
  if (!respuesta.ok) return { respuesta };
  const data = await respuesta.clone().json();
  const tipo = await obtenerIdTipoTicketPorCodigo("SOLICITUD");
  if (!tipo || Number(data.ticket?.id_tipo_ticket) !== Number(tipo)) {
    return { respuesta: NextResponse.json({ error: "Solicitud de servicio no encontrada." }, { status: 404 }) };
  }
  return { respuesta: null };
}

export async function GET(req: NextRequest, context: Contexto) {
  const validacion = await validarTipo(req, context);
  if (validacion.respuesta) return validacion.respuesta;
  return obtenerTicket(req, context);
}

export async function PATCH(req: NextRequest, context: Contexto) {
  const validacion = await validarTipo(req, context);
  if (validacion.respuesta) return validacion.respuesta;
  return actualizarTicket(req, context);
}
