import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarAsignaciones, registrarMovimientoActivo } from "@/modules/activos/services/gestorActivosService";
import {
  validarAccionAsignacion,
  validarCoherenciaCustodia,
  validarEstadoActivo,
} from "@/modules/activos/activosValidaciones";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarAsignaciones());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar asignaciones:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las asignaciones");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();

    const vAccion = validarAccionAsignacion(body.accion);
    if (!vAccion.valido) throw new ErrorDominio(vAccion.mensaje!);

    const vCustodia = validarCoherenciaCustodia({
      accion: body.accion,
      id_usuario_custodio: body.id_usuario_custodio,
      estado_activo: body.estado_activo,
    });
    if (!vCustodia.valido) throw new ErrorDominio(vCustodia.mensaje!);

    if (body.estado_activo !== undefined && body.estado_activo !== null) {
      const vEstado = validarEstadoActivo(body.estado_activo);
      if (!vEstado.valido) throw new ErrorDominio(vEstado.mensaje!);
    }

    return NextResponse.json(await registrarMovimientoActivo(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en la asignación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar el movimiento del activo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
