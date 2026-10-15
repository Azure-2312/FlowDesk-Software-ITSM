import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { crearComentarioTicket } from "@/modules/tickets/services/ticketComentariosService";

export async function POST(
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
    const body = await req.json();
    const data = await crearComentarioTicket(sesion, idTicket, body);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al registrar comentario:", err);
    const { error, status } = respuestaError(err, "Error al registrar comentario");
    return NextResponse.json({ error }, { status });
  }
}
