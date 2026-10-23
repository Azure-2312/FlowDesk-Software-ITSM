import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion } from "@/shared/lib/auth";
import { COOKIE_SESION } from "@/shared/lib/constants";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarModeloEstandar,
  crearModeloEstandar,
  eliminarModeloEstandar,
  listarModelosEstandar,
} from "@/modules/cambios/services/modelosEstandarService";

export const dynamic = "force-dynamic";

async function getUsuarioSesion(req: NextRequest) {
  try {
    const cookie = req.cookies.get(COOKIE_SESION);
    if (!cookie?.value) return null;
    const token = await verificarTokenSesion(cookie.value);
    if (!token?.id_usuario) return null;
    return token;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const estado = searchParams.get("estado");
    const categoriaId = searchParams.get("categoria_id");
    const busqueda = searchParams.get("busqueda");
    const soloAprobados = searchParams.get("solo_aprobados") === "true";

    const data = await listarModelosEstandar({ id, estado, categoriaId, busqueda, soloAprobados });
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en GET /api/cambios/configuracion/modelos-estandar:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al listar modelos estándar");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesion(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const data = await crearModeloEstandar(userId, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en POST /api/cambios/configuracion/modelos-estandar:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al crear modelo estándar");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesion(req);
    const body = await req.json();
    const userId = usuario?.id_usuario || 1;

    const data = await actualizarModeloEstandar(userId, body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en PUT /api/cambios/configuracion/modelos-estandar:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al actualizar modelo estándar");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const data = await eliminarModeloEstandar(id as string);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en DELETE /api/cambios/configuracion/modelos-estandar:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al eliminar modelo estándar");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
