import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarInformes, crearInforme, actualizarEstadoInforme } from "@/modules/perfiles/auditor/services/auditoriaService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.REPORTES_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarInformes());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar informes de auditoría:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los informes");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.REPORTES_VER);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearInforme(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear el informe:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar el informe");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.REPORTES_VER);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_informe) throw new ErrorDominio("Falta el identificador del informe.");
    return NextResponse.json(await actualizarEstadoInforme(sesion.id_usuario, Number(body.id_informe), body.estado));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar el informe:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al actualizar el informe");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
