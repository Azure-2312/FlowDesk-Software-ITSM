import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { listarColaboradores } from "@/modules/organizacion/services/colaboradoresService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const s = token ? verificarTokenSesion(token) : null;
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(s, CAPACIDADES.AREA_COLABORADORES)) {
    return NextResponse.json({ error: "Solo el Gestor de Área puede consultar sus colaboradores." }, { status: 403 });
  }

  try {
    const data = await listarColaboradores(s.id_usuario);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar colaboradores:", err);
    const { error, status } = respuestaError(err, "Error al consultar colaboradores");
    return NextResponse.json({ error }, { status });
  }
}
