import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarRenovaciones, crearRenovacion, resolverRenovacion } from "@/modules/activos/services/contratosService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.PROVEEDORES_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarRenovaciones());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar renovaciones:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las renovaciones");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROVEEDORES_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearRenovacion(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear renovación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la renovación");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROVEEDORES_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await resolverRenovacion(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al resolver renovación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al actualizar la renovación");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
