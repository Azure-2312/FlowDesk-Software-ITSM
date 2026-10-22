import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarEstadoEditorial,
  actualizarArticuloAdmin,
  obtenerArticuloAdmin,
} from "@/modules/conocimiento/services/conocimientoService";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const id = Number(params.id);
  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID de artículo inválido" }, { status: 400 });
  }

  try {
    const data = await obtenerArticuloAdmin(id);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al obtener detalle de artículo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al consultar artículo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_GESTIONAR)) {
    return NextResponse.json(
      { error: "Solo Administración o Supervisor pueden revisar artículos." },
      { status: 403 }
    );
  }

  const id = Number(params.id);
  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID de artículo inválido." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const resultado = await actualizarEstadoEditorial(id, body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      idPerfil: sesion.perfilActivo?.id_perfil || 0,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json(resultado);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar estado editorial:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al actualizar estado editorial");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_GESTIONAR)) {
    return NextResponse.json(
      { error: "Solo Administración o Supervisor pueden modificar artículos." },
      { status: 403 }
    );
  }

  const id = Number(params.id);
  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID de artículo inválido." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const actualizado = await actualizarArticuloAdmin(id, body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      idPerfil: sesion.perfilActivo?.id_perfil || 0,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json({ mensaje: "Artículo actualizado correctamente.", articulo: actualizado });
  } catch (error) {
    const { error: mensaje, status } = respuestaError(error, "Error al actualizar artículo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
