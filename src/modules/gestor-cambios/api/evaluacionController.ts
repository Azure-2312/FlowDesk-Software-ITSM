import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/gestor-cambios/api/guardia";
import {
  listarEvaluacion,
  listarEvaluadores,
  asignarEvaluador,
  enviarAAutorizacion,
} from "@/modules/gestor-cambios/services/cambiosGestionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    const [cambios, evaluadores] = await Promise.all([listarEvaluacion(), listarEvaluadores()]);
    return NextResponse.json({ cambios, evaluadores });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar la bandeja de evaluación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar la bandeja de evaluación");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_cambio) throw new ErrorDominio("Falta el identificador del cambio.");
    const idCambio = Number(body.id_cambio);
    if (body.accion === "asignar") {
      return NextResponse.json(await asignarEvaluador(idCambio, Number(body.id_evaluador)));
    }
    if (body.accion === "enviar") {
      return NextResponse.json(await enviarAAutorizacion(idCambio));
    }
    throw new ErrorDominio("Acción no reconocida. Usa asignar o enviar.");
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en la bandeja de evaluación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al procesar la evaluación");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
