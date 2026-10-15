import { NextRequest, NextResponse } from "next/server";
import { queryRow } from "@/shared/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { POST as comentarTicket } from "@/modules/tickets/api/ticketComentariosController";

type Contexto = { params: { id: string } };
export async function POST(req: NextRequest, context: Contexto) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  if (!token || !verificarTokenSesion(token)) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const tipo = await queryRow<{ id_tipo_ticket: number }>("SELECT id_tipo_ticket FROM tipo_ticket WHERE codigo = 'SOLICITUD' AND estado_registro = true");
  const ticket = await queryRow<{ id_tipo_ticket: number }>("SELECT id_tipo_ticket FROM ticket WHERE id_ticket = $1 AND estado_registro = true", [context.params.id]);
  if (!tipo || !ticket || Number(tipo.id_tipo_ticket) !== Number(ticket.id_tipo_ticket)) {
    return NextResponse.json({ error: "Solicitud de servicio no encontrada." }, { status: 404 });
  }
  return comentarTicket(req, context);
}
