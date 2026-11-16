import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  crearArticuloAdmin,
  listarArticulosAdmin,
} from "@/modules/conocimiento/services/conocimientoService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const t = req.cookies.get(COOKIE_SESION)?.value;
  const s = t ? verificarTokenSesion(t) : null;
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(s, CAPACIDADES.CONOCIMIENTO_GESTIONAR)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const articulos = await listarArticulosAdmin();
    return NextResponse.json({ articulos });
  } catch (error) {
    console.error("Error al obtener artículos:", error);
    return NextResponse.json({ error: "Error al consultar artículos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const t = req.cookies.get(COOKIE_SESION)?.value;
  const s = t ? verificarTokenSesion(t) : null;
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(s, CAPACIDADES.CONOCIMIENTO_REDACTAR)) {
    return NextResponse.json(
      { error: "No autorizado para redactar artículos de conocimiento." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const articulo = await crearArticuloAdmin(body, {
      idUsuario: s.id_usuario,
      nombres: s.nombres,
      idPerfil: s.perfilActivo?.id_perfil || 0,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json({ articulo }, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al redactar artículo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al registrar artículo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
