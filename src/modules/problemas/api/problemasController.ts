import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { crearProblema, listarProblemas } from "@/modules/problemas/services/problemaService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_VER)) {
    return NextResponse.json({ error: "Este perfil no puede consultar problemas." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  try {
    const rows = await listarProblemas(
      { estado: searchParams.get("estado"), soloKedb: searchParams.get("kedb") === "true" },
      { idUsuario: sesion.id_usuario, idPerfil: sesion.perfilActivo?.id_perfil }
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener problemas:", error);
    return NextResponse.json({ error: "Error al consultar la gestión de problemas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_GESTIONAR)) {
    return NextResponse.json(
      { error: "Solo Técnicos y Supervisores pueden registrar problemas." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const resultado = await crearProblema(body, {
      idUsuario: sesion.id_usuario,
      idPerfil: sesion.perfilActivo?.id_perfil,
    });
    return NextResponse.json(resultado, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al registrar problema:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al registrar el problema");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
