import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarCategoriaConocimiento,
  crearCategoriaConocimiento,
  listarCategoriasConocimiento,
} from "@/modules/conocimiento/services/conocimientoService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_GESTIONAR)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const categorias = await listarCategoriasConocimiento();
    return NextResponse.json({ categorias });
  } catch (error) {
    console.error("Error al obtener categorías de conocimiento:", error);
    return NextResponse.json({ error: "Error al consultar categorías" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_CONFIGURAR)) {
    return NextResponse.json(
      { error: "Solo Administración puede crear categorías de conocimiento." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const categoria = await crearCategoriaConocimiento(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      idPerfil: sesion.perfilActivo?.id_perfil || 0,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json({ categoria }, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear categoría de conocimiento:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al registrar categoría de conocimiento");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_CONFIGURAR)) {
    return NextResponse.json({ error: "Solo Administración puede actualizar categorías." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const categoria = await actualizarCategoriaConocimiento(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      idPerfil: sesion.perfilActivo?.id_perfil || 0,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json({ categoria });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar categoría de conocimiento:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al actualizar categoría");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
