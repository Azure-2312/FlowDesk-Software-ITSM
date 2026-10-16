import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/auditor/api/guardia";
import { listarRecertificacion, registrarRecertificacion } from "@/modules/auditor/services/accesosService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.AUDITORIA_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarRecertificacion());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar la recertificación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar la recertificación");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.AUDITORIA_VER);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await registrarRecertificacion(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al registrar la recertificación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la recertificación");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
