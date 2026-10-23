import { NextRequest, NextResponse } from "next/server";
import { autorizarApi } from "@/shared/lib/api-auth";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { crearProblema, listarProblemas } from "@/modules/problemas/services/problemaService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = autorizarApi(req, CAPACIDADES.PROBLEMAS_VER, {
    noAutorizado: "Este perfil no puede consultar problemas.",
  });
  if (!auth.autorizado) return auth.respuesta;
  const sesion = auth.sesion;

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
  const auth = autorizarApi(req, CAPACIDADES.PROBLEMAS_GESTIONAR, {
    noAutorizado: "No tienes autorización para registrar problemas en la plataforma.",
  });
  if (!auth.autorizado) return auth.respuesta;
  const sesion = auth.sesion;

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
