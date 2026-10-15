import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { ActualizarTicketPayload } from "@/types";
import { actualizarTicket, obtenerDetalleTicket } from "@/modules/tickets/services/ticketDetalleService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idTicket = parseInt(params.id, 10);
  if (isNaN(idTicket)) {
    return NextResponse.json({ error: "ID de ticket inválido" }, { status: 400 });
  }

  try {
    const data = await obtenerDetalleTicket(sesion, idTicket);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener detalle del ticket:", err);
    const { error, status } = respuestaError(err, "Error al consultar ticket");
    return NextResponse.json({ error }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idTicket = parseInt(params.id, 10);
  if (isNaN(idTicket)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body: ActualizarTicketPayload = await req.json();
    const data = await actualizarTicket(sesion, idTicket, body);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar ticket:", err);
    const { error, status } = respuestaError(err, "Error al actualizar ticket");
    return NextResponse.json({ error }, { status });
  }
}
