import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import {
  obtenerTopologia,
  analizarImpacto,
  obtenerReconciliacion,
  obtenerHistorialCi,
} from "@/modules/cmdb/services/cmdbAnalisisService";

export const dynamic = "force-dynamic";

/**
 * Analisis avanzado de la CMDB.
 *   GET /api/activos/cmdb/analisis?vista=reconciliacion
 *   GET /api/activos/cmdb/analisis?vista=topologia&id_ci=..&profundidad=2
 *   GET /api/activos/cmdb/analisis?vista=impacto&id_ci=..
 *   GET /api/activos/cmdb/analisis?vista=historial&id_ci=..
 */
export async function GET(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.CMDB_VER);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const vista = searchParams.get("vista") || "reconciliacion";

  try {
    if (vista === "topologia") {
      const idCi = Number(searchParams.get("id_ci"));
      if (!idCi) throw new ErrorDominio("Seleccione un elemento de configuración para dibujar la topología.");
      const profundidad = Math.min(Math.max(Number(searchParams.get("profundidad")) || 2, 1), 4);
      return NextResponse.json(await obtenerTopologia(idCi, profundidad));
    }

    if (vista === "impacto") {
      const idCi = Number(searchParams.get("id_ci"));
      if (!idCi) throw new ErrorDominio("Seleccione un elemento de configuración para analizar el impacto.");
      return NextResponse.json(await analizarImpacto(idCi));
    }

    if (vista === "historial") {
      const idCi = Number(searchParams.get("id_ci"));
      if (!idCi) throw new ErrorDominio("Seleccione un elemento de configuración para ver su historial.");
      return NextResponse.json(await obtenerHistorialCi(idCi));
    }

    return NextResponse.json(await obtenerReconciliacion());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en análisis CMDB:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el análisis de la CMDB");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
