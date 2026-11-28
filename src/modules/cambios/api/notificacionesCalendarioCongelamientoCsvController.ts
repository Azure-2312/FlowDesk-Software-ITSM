import { NextRequest, NextResponse } from "next/server";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { exportarCongelamientoCsv, importarCongelamientoCsv } from "@/modules/cambios/services/notificacionesCalendarioCongelamientoCsvService";
import { exigirPerfil } from "@/shared/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const csv = await exportarCongelamientoCsv();

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="periodos_congelamiento.csv"'
      }
    });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al exportar períodos de congelamiento CSV:", error);
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

    const data = await importarCongelamientoCsv(csv);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al importar períodos CSV:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al importar CSV");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
