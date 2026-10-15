import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  crearTareaOPaquete,
  eliminarTareaOPaquete,
} from "@/modules/problemas/services/flujoService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const resultado = await crearTareaOPaquete(body);
    return NextResponse.json(resultado);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al registrar tarea o paquete:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al registrar");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "tarea";
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const resultado = await eliminarTareaOPaquete(tipo, id);
    return NextResponse.json(resultado);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al eliminar:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al eliminar");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
