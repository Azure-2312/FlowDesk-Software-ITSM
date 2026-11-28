import { NextRequest, NextResponse } from "next/server";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { exportarFeriadosCsv, importarFeriadosCsv } from "@/modules/cambios/services/notificacionesCalendarioFeriadosCsvService";
import { exigirPerfil } from "@/shared/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const csv = await exportarFeriadosCsv();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="calendario_feriados.csv"'
      }
    });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al exportar feriados CSV:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al exportar CSV");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  // Solo el perfil dueño de esta configuración (y el Administrador) escribe
  const negado = exigirPerfil([8]);
  if (negado) return negado;
  try {
    const body = await req.json();
    const { csv } = body;

    const data = await importarFeriadosCsv(csv);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al importar feriados CSV:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al importar CSV");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
