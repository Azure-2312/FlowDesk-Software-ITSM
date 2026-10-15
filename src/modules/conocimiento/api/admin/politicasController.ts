import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import {
  guardarPoliticasKcs,
  obtenerPoliticasKcs,
} from "@/modules/conocimiento/services/conocimientoService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_GESTIONAR)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const data = await obtenerPoliticasKcs();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener políticas KCS:", error);
    return NextResponse.json({ error: "Error al consultar políticas KCS" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_CONFIGURAR)) {
    return NextResponse.json(
      { error: "Solo Administración puede configurar las políticas de gobierno KCS." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const resultado = await guardarPoliticasKcs(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      idPerfil: sesion.perfilActivo?.id_perfil || 0,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al guardar políticas KCS:", error);
    return NextResponse.json({ error: "Error al guardar políticas KCS" }, { status: 500 });
  }
}
