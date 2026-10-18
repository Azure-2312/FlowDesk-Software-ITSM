import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarCampanas, crearCampana, detalleCampana, cerrarCampana } from "@/modules/activos/services/gestorActivosService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const id = req.nextUrl.searchParams.get("id_campana");
    if (id) return NextResponse.json(await detalleCampana(Number(id)));
    return NextResponse.json(await listarCampanas());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar campañas:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las campañas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearCampana(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear la campaña:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al crear la campaña");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await cerrarCampana(sesion.id_usuario, Number(body.id_campana)));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al cerrar la campaña:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al cerrar la campaña");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
