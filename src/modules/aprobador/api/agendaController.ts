import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/aprobador/api/guardia";
import { listarReuniones, listarCambiosParaAgenda, crearReunion, actualizarReunion } from "@/modules/aprobador/services/cabService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    const [reuniones, cambios] = await Promise.all([listarReuniones(), listarCambiosParaAgenda()]);
    return NextResponse.json({ reuniones, cambios });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar la agenda del CAB:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar la agenda del CAB");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearReunion(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear la reunión del CAB:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al programar la reunión");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_reunion) throw new ErrorDominio("Falta el identificador de la reunión.");
    return NextResponse.json(await actualizarReunion(sesion.id_usuario, Number(body.id_reunion), body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar la reunión del CAB:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al actualizar la reunión");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
