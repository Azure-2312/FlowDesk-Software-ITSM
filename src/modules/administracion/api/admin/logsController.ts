import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { listarLogsSeguridad } from "@/modules/administracion/services/logsSeguridadService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Restringido a Administrador (1) y Auditor (6)
  const perfilId = sesion.perfilActivo.id_perfil;
  if (perfilId !== 1 && perfilId !== 6) {
    return NextResponse.json(
      { error: "No tienes autorización para consultar los logs de seguridad" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);

  try {
    const data = await listarLogsSeguridad({
      buscar: searchParams.get("buscar"),
      resultado: searchParams.get("resultado"),
    });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar logs de seguridad:", err);
    const { error, status } = respuestaError(err, "Error al consultar registros de seguridad");
    return NextResponse.json({ error }, { status });
  }
}
