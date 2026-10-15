import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { listarPerfiles, crearPerfil } from "@/modules/administracion/services/perfilService";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_PERFILES)) {
    return NextResponse.json({ error: "Solo el Administrador puede consultar perfiles y permisos." }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const incluirTodos = searchParams.get("todos") === "true";

  try {
    const data = await listarPerfiles(incluirTodos);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar perfiles:", err);
    const { error, status } = respuestaError(err, "Error al consultar perfiles");
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_PERFILES)) {
    return NextResponse.json({ error: "Solo el Administrador puede crear perfiles." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await crearPerfil(body);
    return NextResponse.json(data.payload, { status: data.httpStatus });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear perfil:", err);
    const { error, status } = respuestaError(err, "No se pudo crear el perfil");
    return NextResponse.json({ error }, { status });
  }
}
