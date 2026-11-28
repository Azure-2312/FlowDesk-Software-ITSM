import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarBajas, registrarDisposicion } from "@/modules/activos/services/gestorActivosService";
import { solicitarBaja } from "@/modules/activos/services/supervisionBajasService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarBajas());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar bajas:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las bajas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

/** Registra una solicitud de baja. La decisión se toma en la bandeja de bajas. */
export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(
      await solicitarBaja({ id_usuario: sesion.id_usuario, id_perfil: sesion.perfilActivo?.id_perfil }, Number(body.id_activo), body.motivo),
      { status: 201 }
    );
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al solicitar la baja:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la solicitud de baja");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await registrarDisposicion(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al registrar la disposición:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la disposición");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
