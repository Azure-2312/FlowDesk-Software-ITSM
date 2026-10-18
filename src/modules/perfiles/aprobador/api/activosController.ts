import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import {
  listarBajasPorMonto,
  resolverBaja,
  listarRenovaciones,
  resolverRenovacion,
} from "@/modules/perfiles/aprobador/services/montoService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
  if (error) return error;

  try {
    const [bajas, renovaciones] = await Promise.all([listarBajasPorMonto(), listarRenovaciones()]);
    return NextResponse.json({ bajas, renovaciones });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar bajas y renovaciones:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar bajas y renovaciones");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
  if (error) return error;

  try {
    const body = await req.json();
    const tipo = String(body.tipo || "").toUpperCase();
    if (tipo === "BAJA") {
      if (!body.id) throw new ErrorDominio("Falta el identificador de la solicitud.");
      return NextResponse.json(await resolverBaja(sesion.id_usuario, Number(body.id), body.decision, body.comentario));
    }
    if (tipo === "RENOVACION") {
      if (!body.id) throw new ErrorDominio("Falta el identificador de la licencia.");
      return NextResponse.json(await resolverRenovacion(sesion.id_usuario, Number(body.id), body.decision, body.comentario));
    }
    throw new ErrorDominio("Tipo no válido. Usa BAJA o RENOVACION.");
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al resolver la aprobación por monto:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la decisión");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
