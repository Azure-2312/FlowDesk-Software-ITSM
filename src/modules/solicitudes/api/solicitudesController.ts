export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { ticketsGet as listarTickets, ticketsPost as registrarTicket } from "@/modules/tickets";
import { obtenerIdTipoTicketPorCodigo } from "@/modules/solicitudes/solicitudesService";

export async function GET(req: NextRequest) {
  const idTipo = await obtenerIdTipoTicketPorCodigo("SOLICITUD");
  if (!idTipo) return NextResponse.json({ error: "El tipo Solicitud no está configurado." }, { status: 503 });
  const url = new URL(req.url);
  url.searchParams.set("id_tipo", String(idTipo));
  return listarTickets(new NextRequest(url, { headers: req.headers }));
}

export async function POST(req: NextRequest) {
  const idTipo = await obtenerIdTipoTicketPorCodigo("SOLICITUD");
  if (!idTipo) return NextResponse.json({ error: "El tipo Solicitud no está configurado." }, { status: 503 });
  try {
    const payload = await req.json();
    const headers = new Headers(req.headers);
    headers.set("content-type", "application/json");
    return registrarTicket(new NextRequest(req.url, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payload, id_tipo_ticket: idTipo }),
    }));
  } catch {
    return NextResponse.json({ error: "El cuerpo de la solicitud no es válido." }, { status: 400 });
  }
}
