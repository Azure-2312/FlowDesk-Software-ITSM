import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/activos/api/guardiaGestor";
import {
  listarMantenimiento,
  crearMantenimiento,
  actualizarMantenimiento,
} from "@/modules/activos/services/gestorActivosService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarMantenimiento());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar mantenimiento:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el mantenimiento");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearMantenimiento(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al programar mantenimiento:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al programar el mantenimiento");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await actualizarMantenimiento(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar mantenimiento:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al actualizar el mantenimiento");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
