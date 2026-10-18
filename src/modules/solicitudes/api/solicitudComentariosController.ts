import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { ticketComentariosPost as comentarTicket } from "@/modules/tickets";
import { validarTipoTicket } from "@/modules/solicitudes/solicitudesService";

type Contexto = { params: { id: string } };
export async function POST(req: NextRequest, context: Contexto) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  if (!token || !verificarTokenSesion(token)) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const coincide = await validarTipoTicket(context.params.id, "SOLICITUD");
  if (!coincide) {
    return NextResponse.json({ error: "Solicitud de servicio no encontrada." }, { status: 404 });
  }
  return comentarTicket(req, context);
}
