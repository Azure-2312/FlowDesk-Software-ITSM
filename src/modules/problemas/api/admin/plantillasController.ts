import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarPlantilla,
  crearPlantilla,
  eliminarPlantilla,
  listarPlantillas,
} from "@/modules/problemas/services/plantillasService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  try {
    const data = await listarPlantillas(searchParams.get("id"));
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al obtener plantillas de problema:", error);
    const { error: mensaje, status } = respuestaError(error, "Error en el servidor al cargar plantillas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = await crearPlantilla(body, sesion.id_usuario);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear plantilla de problema:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al registrar la plantilla");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = await actualizarPlantilla(body);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar plantilla:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al actualizar plantilla");
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
    const data = await eliminarPlantilla(id);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al eliminar plantilla:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al eliminar plantilla");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
