import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarEvidencias, agregarEvidencia } from "@/modules/seguridad/services/auditorEvidenciaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.AUDITORIA_VER);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const idInforme = Number(searchParams.get("id_informe"));
    return NextResponse.json(await listarEvidencias(idInforme));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar evidencias:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las evidencias");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.AUDITORIA_VER);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(
      await agregarEvidencia(
        Number(body.id_informe),
        body.descripcion,
        body.contenido ?? null,
        sesion.id_usuario
      ),
      { status: 201 }
    );
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al registrar la evidencia:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la evidencia");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
