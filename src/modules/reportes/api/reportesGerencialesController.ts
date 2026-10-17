import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import {
  ErrorValidacionReporte,
  obtenerReporteGerencial,
  parsearFiltrosReporteGerencial,
} from "@/modules/reportes/services/reportesGerencialesService";

export const dynamic = "force-dynamic";

/**
 * GET /api/reportes/gerenciales
 * Indicadores gerenciales agregados (HU-13) con filtros de rango de fechas,
 * departamento de TI y prioridad. Solo agrega datos: no expone contenido de
 * tickets ni datos personales.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.REPORTES_VER)) {
    return NextResponse.json(
      { error: "Este perfil no puede consultar reportes gerenciales." },
      { status: 403 }
    );
  }

  try {
    const filtros = parsearFiltrosReporteGerencial(req.nextUrl.searchParams);
    const reporte = await obtenerReporteGerencial(
      { idPerfil: sesion.perfilActivo?.id_perfil, idUsuario: sesion.id_usuario },
      filtros
    );
    return NextResponse.json({ reporte, filtrosAplicados: filtros });
  } catch (err) {
    if (err instanceof ErrorValidacionReporte) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Error al generar reporte gerencial:", err);
    return NextResponse.json({ error: "No se pudo generar el reporte gerencial." }, { status: 500 });
  }
}
