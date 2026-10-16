import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/activos/api/guardiaGestor";
import { listarAuditoriaCmdb } from "@/modules/activos/services/cmdbGestionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CMDB_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarAuditoriaCmdb());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en auditoría CMDB:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar la auditoría de CMDB");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
