import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/supervisor/api/guardia";
import {
  listarRecursosEquipo,
  crearRecursoEquipo,
  eliminarRecursoEquipo,
} from "@/modules/supervisor/services/supervisionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.TICKETS_VER);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    return NextResponse.json(await listarRecursosEquipo(sesion, searchParams.get("tipo")));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar recursos del equipo:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar recursos");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.TICKETS_VER);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearRecursoEquipo(sesion, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear recurso del equipo:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al crear el recurso");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.TICKETS_VER);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) throw new ErrorDominio("Falta el identificador del recurso.");
    return NextResponse.json(await eliminarRecursoEquipo(sesion, id));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al eliminar recurso del equipo:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al eliminar el recurso");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
