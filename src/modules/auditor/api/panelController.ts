import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/auditor/api/guardia";
import { obtenerPanelAuditoria } from "@/modules/auditor/services/auditoriaService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.AUDITORIA_VER);
  if (error) return error;

  try {
    return NextResponse.json(await obtenerPanelAuditoria());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en el panel de auditoría:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el panel de auditoría");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
