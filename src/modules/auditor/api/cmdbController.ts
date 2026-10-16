import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/auditor/api/guardia";
import { obtenerResultadosCmdb } from "@/modules/auditor/services/cmdbAuditoriaService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CMDB_VER);
  if (error) return error;

  try {
    return NextResponse.json(await obtenerResultadosCmdb());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al auditar la CMDB:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los resultados de CMDB");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
