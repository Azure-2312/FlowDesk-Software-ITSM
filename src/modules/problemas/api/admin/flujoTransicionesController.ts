import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarTransicionProblema,
  crearTransicionProblema,
  eliminarTransicionProblema,
} from "@/modules/problemas/services/flujoService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const transicion = await crearTransicionProblema(body);
    return NextResponse.json({ ok: true, transicion });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear transicion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al crear transición");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const transicion = await actualizarTransicionProblema(body);
    return NextResponse.json({ ok: true, transicion });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar transicion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al actualizar");
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
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const resultado = await eliminarTransicionProblema(id);
    return NextResponse.json(resultado);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al eliminar transicion:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al eliminar");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
