import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/activos/api/guardiaGestor";
import {
  listarImportaciones,
  validarImportacion,
  aplicarImportacion,
  revertirImportacion,
} from "@/modules/activos/services/gestorActivosService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarImportaciones());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar importaciones:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las importaciones");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (body.accion === "validar") {
      return NextResponse.json(await validarImportacion(sesion.id_usuario, body));
    }
    if (body.accion === "aplicar") {
      return NextResponse.json(await aplicarImportacion(sesion.id_usuario, Number(body.id_importacion)));
    }
    if (body.accion === "revertir") {
      return NextResponse.json(await revertirImportacion(sesion.id_usuario, Number(body.id_importacion)));
    }
    throw new ErrorDominio("Acción no reconocida. Usa validar, aplicar o revertir.");
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en la importación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al procesar la importación");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
