import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  calificarArticulo,
  obtenerArticulo,
} from "@/modules/conocimiento/services/conocimientoService";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const idArticulo = parseInt(params.id, 10);
  if (isNaN(idArticulo)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const row = await obtenerArticulo(idArticulo);
    return NextResponse.json(row);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al obtener artículo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al obtener artículo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const idArticulo = parseInt(params.id, 10);
  if (isNaN(idArticulo)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const body = await req.json();
    const resultado = await calificarArticulo(idArticulo, body.voto_utilidad);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al calificar artículo:", error);
    return NextResponse.json({ error: "Error interno al procesar calificación" }, { status: 500 });
  }
}
