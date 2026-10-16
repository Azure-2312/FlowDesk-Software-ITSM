import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/auditor/api/guardia";
import { listarBajasDisposicion } from "@/modules/auditor/services/cmdbAuditoriaService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarBajasDisposicion());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar bajas de activos:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las bajas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
