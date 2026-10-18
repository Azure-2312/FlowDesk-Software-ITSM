import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import {
  actualizarMayor,
  cerrarMayor,
  declararMayor,
  listarMayores,
} from "@/modules/problemas/services/gestorProblemasService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarMayores());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar mayores:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los problemas mayores");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await declararMayor(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al declarar mayor:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al declarar el problema mayor");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (body?.accion === "cerrar") {
      return NextResponse.json(await cerrarMayor(sesion.id_usuario, body));
    }
    return NextResponse.json(await actualizarMayor(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar mayor:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al actualizar el problema mayor");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
