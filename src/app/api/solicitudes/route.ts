export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { queryRow } from "@/lib/db";
import { GET as listarTickets, POST as registrarTicket } from "../tickets/route";

async function tipoId(codigo: string) {
  const tipo = await queryRow<{ id_tipo_ticket: number }>(
    "SELECT id_tipo_ticket FROM tipo_ticket WHERE codigo = $1 AND estado_registro = true",
    [codigo]
  );
  return tipo?.id_tipo_ticket;
}

export async function GET(req: NextRequest) {
  const idTipo = await tipoId("SOLICITUD");
  if (!idTipo) return NextResponse.json({ error: "El tipo Solicitud no está configurado." }, { status: 503 });
  const url = new URL(req.url);
  url.searchParams.set("id_tipo", String(idTipo));
  return listarTickets(new NextRequest(url, { headers: req.headers }));
}

export async function POST(req: NextRequest) {
  const idTipo = await tipoId("SOLICITUD");
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
