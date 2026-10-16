import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/gestor-area/api/guardia";
import {
  listarDelegaciones,
  crearDelegacion,
  eliminarDelegacion,
} from "@/modules/gestor-area/services/areaService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.SOLICITUDES_APROBAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarDelegaciones(sesion.id_usuario));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar delegaciones:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar delegaciones");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.SOLICITUDES_APROBAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearDelegacion(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear delegación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la delegación");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.SOLICITUDES_APROBAR);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) throw new ErrorDominio("Falta el identificador de la delegación.");
    return NextResponse.json(await eliminarDelegacion(sesion.id_usuario, id));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al eliminar delegación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al eliminar la delegación");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
