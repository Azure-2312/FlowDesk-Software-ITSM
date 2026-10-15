import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarCampoPersonalizado,
  crearCampoPersonalizado,
  eliminarCampoPersonalizado,
  listarCamposPersonalizados,
} from "@/modules/problemas/services/camposPersonalizadosService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  try {
    const data = await listarCamposPersonalizados(searchParams.get("entidad") || "problema");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener campos personalizados:", error);
    return NextResponse.json({ error: "Error al cargar campos personalizados" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = await crearCampoPersonalizado(body, sesion.id_usuario);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear campo personalizado:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al registrar el campo personalizado");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = await actualizarCampoPersonalizado(body);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar campo personalizado:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al actualizar campo personalizado");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  try {
    const data = await eliminarCampoPersonalizado(id);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al eliminar campo personalizado:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al eliminar campo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
