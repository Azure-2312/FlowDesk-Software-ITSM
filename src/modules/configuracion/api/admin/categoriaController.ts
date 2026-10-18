export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { listarCategorias, crearCategoria } from "@/modules/configuracion/services/categoriaService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Permitir a perfiles administrativos y de gestión técnica
  // (acceso gestionado por la capacidad CATEGORIAS_VER)
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CATEGORIAS_VER)) {
    return NextResponse.json(
      { error: "No tienes permisos para consultar la administración de categorías." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const data = await listarCategorias({
      idTipo: searchParams.get("id_tipo"),
      estado: searchParams.get("estado"),
      buscar: searchParams.get("buscar"),
    });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar categorías:", err);
    const { error, status } = respuestaError(err, "Error al consultar categorías del sistema.");
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_CONFIGURACION)) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para registrar nuevas categorías." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") ?? "desconocida";
    const data = await crearCategoria(body, { idUsuario: sesion.id_usuario, ip });
    return NextResponse.json(data.payload, { status: data.httpStatus });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear categoría:", err);
    const { error, status } = respuestaError(err, "Ocurrió un error al registrar la categoría.");
    return NextResponse.json({ error }, { status });
  }
}
