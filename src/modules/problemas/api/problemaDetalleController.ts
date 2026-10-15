import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarProblema,
  obtenerProblema,
} from "@/modules/problemas/services/problemaService";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_VER)) {
    return NextResponse.json({ error: "Este perfil no puede consultar problemas." }, { status: 403 });
  }

  const idProblema = parseInt(params.id, 10);
  if (isNaN(idProblema)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const row = await obtenerProblema(idProblema, {
      idUsuario: sesion.id_usuario,
      idPerfil: sesion.perfilActivo?.id_perfil,
    });
    return NextResponse.json(row);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al obtener detalle del problema:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al obtener problema");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_GESTIONAR)) {
    return NextResponse.json(
      { error: "Solo Técnicos y Supervisores pueden modificar problemas." },
      { status: 403 }
    );
  }

  const idProblema = parseInt(params.id, 10);
  if (isNaN(idProblema)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const body = await req.json();
    const resultado = await actualizarProblema(idProblema, body, {
      idUsuario: sesion.id_usuario,
      idPerfil: sesion.perfilActivo?.id_perfil,
    });
    return NextResponse.json(resultado);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar problema:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al actualizar el problema");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
