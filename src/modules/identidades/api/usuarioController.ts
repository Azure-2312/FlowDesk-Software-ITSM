import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { listarUsuarios, crearUsuario } from "@/modules/identidades/services/usuarioService";

// Esta ruta siempre debe consultar la base de datos en vivo.
export const dynamic = "force-dynamic";

/** Trae la sesión actual desde la cookie (para saber quién crea/edita cada registro). */
function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET() {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_USUARIOS)) {
    return NextResponse.json({ error: "Solo el Administrador puede consultar el directorio de usuarios." }, { status: 403 });
  }

  try {
    const data = await listarUsuarios();
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar usuarios:", err);
    const { error, status } = respuestaError(err, "Error al consultar usuarios");
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_USUARIOS)) {
    return NextResponse.json({ error: "Solo el Administrador puede crear usuarios." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await crearUsuario(body, sesion.id_usuario);
    return NextResponse.json(data.payload, { status: data.httpStatus });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear usuario:", err);
    const { error, status } = respuestaError(err, "No se pudo crear el usuario");
    return NextResponse.json({ error }, { status });
  }
}
