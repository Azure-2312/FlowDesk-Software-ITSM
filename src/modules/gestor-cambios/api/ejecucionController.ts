import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/gestor-cambios/api/guardia";
import { listarEjecucion, extenderVentana, resolverEjecucion } from "@/modules/gestor-cambios/services/cambiosGestionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarEjecucion());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar la ejecución:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar la ejecución");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_cambio) throw new ErrorDominio("Falta el identificador del cambio.");
    const idCambio = Number(body.id_cambio);
    if (body.accion === "extender") {
      return NextResponse.json(await extenderVentana(sesion.id_usuario, idCambio, body.ventana_fin, body.motivo));
    }
    if (body.accion === "resultado") {
      return NextResponse.json(await resolverEjecucion(sesion.id_usuario, idCambio, body.resultado, body.motivo));
    }
    throw new ErrorDominio("Acción no reconocida. Usa extender o resultado.");
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en el seguimiento de ejecución:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al procesar la ejecución");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
