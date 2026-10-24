import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import {
  ErrorValidacionReporte,
  obtenerReporteGerencial,
  parsearFiltrosReporteGerencial,
} from "@/modules/reportes/services/reportesGerencialesService";
import {
  generarCsvReporteGerencial,
  nombreArchivoReporteGerencial,
} from "@/modules/reportes/services/reportesGerencialesCsv";

export const dynamic = "force-dynamic";

/**
 * GET /api/reportes/gerenciales/export
 * Descarga el reporte gerencial filtrado en formato CSV (HU-27, RNF-01):
 * UTF-8 con BOM, separador punto y coma y finales de linea CRLF, compatible
 * directamente con Microsoft Excel. Los filtros son los mismos que el reporte.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.REPORTES_VER)) {
    return NextResponse.json(
      { error: "Este perfil no puede exportar reportes gerenciales." },
      { status: 403 }
    );
  }

  try {
    const filtros = parsearFiltrosReporteGerencial(req.nextUrl.searchParams);
    const reporte = await obtenerReporteGerencial(
      { idPerfil: sesion.perfilActivo?.id_perfil, idUsuario: sesion.id_usuario },
      filtros
    );

    const generadoEn = new Date();
    const csv = generarCsvReporteGerencial(reporte, filtros, generadoEn);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nombreArchivoReporteGerencial(generadoEn)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof ErrorValidacionReporte) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Error al exportar reporte gerencial:", err);
    return NextResponse.json({ error: "No se pudo exportar el reporte gerencial." }, { status: 500 });
  }
}
