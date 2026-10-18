import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarCambiosIrregulares } from "@/modules/perfiles/auditor/services/cumplimientoService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.AUDITORIA_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarCambiosIrregulares());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar cambios irregulares:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los cambios");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
