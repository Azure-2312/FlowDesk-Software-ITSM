import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  listarAusencias,
  crearAusencia,
  actualizarAusencia,
  eliminarAusencia,
} from "@/modules/administracion/services/ausenciasService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const data = await listarAusencias();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al obtener ausencias:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = await crearAusencia(body, sesion.id_usuario);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al registrar ausencia:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = await actualizarAusencia(body);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al actualizar ausencia:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const data = await eliminarAusencia(id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al eliminar ausencia:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}
