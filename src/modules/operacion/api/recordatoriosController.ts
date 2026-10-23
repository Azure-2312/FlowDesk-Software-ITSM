import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarRecordatorio,
  crearRecordatorio,
  listarRecordatorios,
} from "@/modules/operacion/services/recordatoriosService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const recordatorios = await listarRecordatorios(sesion.id_usuario);
    return NextResponse.json({ recordatorios });
  } catch (error) {
    console.error("Error al obtener recordatorios:", error);
    return NextResponse.json({ error: "Error al cargar recordatorios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const recordatorio = await crearRecordatorio(body, sesion.id_usuario);
    return NextResponse.json({ recordatorio });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear recordatorio:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al guardar recordatorio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { id_recordatorio, completado } = await req.json();
    const recordatorio = await actualizarRecordatorio(id_recordatorio, completado, sesion.id_usuario);
    return NextResponse.json({ recordatorio });
  } catch (error) {
    console.error("Error al actualizar recordatorio:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
