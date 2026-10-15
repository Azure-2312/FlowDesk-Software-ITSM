import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  crearArticuloOperativo,
  listarArticulos,
} from "@/modules/conocimiento/services/conocimientoService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  try {
    const rows = await listarArticulos(
      {
        buscar: searchParams.get("buscar"),
        idCategoria: searchParams.get("id_categoria"),
        vista: searchParams.get("vista"),
      },
      { idUsuario: sesion.id_usuario, idPerfil: sesion.perfilActivo?.id_perfil || 0 }
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener artículos de conocimiento:", error);
    return NextResponse.json({ error: "Error al consultar la base de conocimiento" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_VER)) {
    return NextResponse.json(
      { error: "Este perfil no puede publicar artículos de conocimiento." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const resultado = await crearArticuloOperativo(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      idPerfil: sesion.perfilActivo?.id_perfil || 0,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al publicar artículo:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al publicar artículo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
