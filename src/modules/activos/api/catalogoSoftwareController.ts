import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarSoftware, crearSoftware, cambiarEstadoSoftware } from "@/modules/activos/services/licenciasCumplimientoService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.LICENCIAS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarSoftware());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar software autorizado:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el catálogo de software");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.LICENCIAS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearSoftware(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear software:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar el software");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.LICENCIAS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_software) throw new ErrorDominio("Falta el identificador del software.");
    return NextResponse.json(await cambiarEstadoSoftware(Number(body.id_software), body.estado));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar software:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al actualizar el software");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
