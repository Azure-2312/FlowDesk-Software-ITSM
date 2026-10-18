export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  obtenerCategoriaDetalle,
  actualizarCategoria,
  eliminarCategoria,
} from "@/modules/configuracion/services/categoriaDetalleService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idCategoria = Number(params.id);
  if (!idCategoria || isNaN(idCategoria)) {
    return NextResponse.json({ error: "Identificador de categoría inválido." }, { status: 400 });
  }

  try {
    const data = await obtenerCategoriaDetalle(idCategoria);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener categoría:", err);
    const { error, status } = respuestaError(err, "Error al consultar la categoría.");
    return NextResponse.json({ error }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_CONFIGURACION)) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para modificar categorías." },
      { status: 403 }
    );
  }

  const idCategoria = Number(params.id);
  if (!idCategoria || isNaN(idCategoria)) {
    return NextResponse.json({ error: "Identificador de categoría inválido." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") ?? "desconocida";
    const data = await actualizarCategoria(idCategoria, body, { idUsuario: sesion.id_usuario, ip });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar categoría:", err);
    const { error, status } = respuestaError(err, "Error al actualizar la categoría.");
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_CONFIGURACION)) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para eliminar categorías." },
      { status: 403 }
    );
  }

  const idCategoria = Number(params.id);
  if (!idCategoria || isNaN(idCategoria)) {
    return NextResponse.json({ error: "Identificador de categoría inválido." }, { status: 400 });
  }

  try {
    const ip = req.headers.get("x-forwarded-for") ?? "desconocida";
    const data = await eliminarCategoria(idCategoria, { idUsuario: sesion.id_usuario, ip });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al eliminar categoría:", err);
    const { error, status } = respuestaError(err, "Error al eliminar la categoría.");
    return NextResponse.json({ error }, { status });
  }
}
