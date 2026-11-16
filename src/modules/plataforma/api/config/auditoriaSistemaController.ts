import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { listarAuditoriaSistema } from "@/modules/plataforma/services/auditoriaSistemaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Permitido para Administrador (1) y Auditor (6)
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.AUDITORIA_VER)) {
    return NextResponse.json({ error: "No autorizado para consultar la bitácora integral de auditoría." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  try {
    const data = await listarAuditoriaSistema({
      modulo: searchParams.get("modulo"),
      accion: searchParams.get("accion"),
      buscar: searchParams.get("buscar"),
      fechaDesde: searchParams.get("fecha_desde"),
      fechaHasta: searchParams.get("fecha_hasta"),
    });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar bitácora de auditoría:", err);
    const { error, status } = respuestaError(err, "Error interno al consultar auditoría");
    return NextResponse.json({ error }, { status });
  }
}
