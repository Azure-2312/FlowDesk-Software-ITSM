import { NextRequest, NextResponse } from "next/server";
import { queryRow } from "@/shared/lib/db";
import { GET as obtenerTicket, PATCH as actualizarTicket } from "../../tickets/[id]/route";

type Contexto = { params: { id: string } };

async function validarTipo(req: NextRequest, context: Contexto) {
  const respuesta = await obtenerTicket(req, context);
  if (!respuesta.ok) return { respuesta };
  const data = await respuesta.clone().json();
  const tipo = await queryRow<{ id_tipo_ticket: number }>("SELECT id_tipo_ticket FROM tipo_ticket WHERE codigo = 'INCIDENTE' AND estado_registro = true");
  if (!tipo || Number(data.ticket?.id_tipo_ticket) !== Number(tipo.id_tipo_ticket)) {
    return { respuesta: NextResponse.json({ error: "Incidente no encontrado." }, { status: 404 }) };
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
