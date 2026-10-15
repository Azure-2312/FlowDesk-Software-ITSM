import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { obtenerMiCuenta, actualizarMiCuenta } from "@/modules/seguridad/miCuentaService";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET() {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });

  try {
    const data = await obtenerMiCuenta(sesion.id_usuario);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener la cuenta:", err);
    const { error, status } = respuestaError(err, "Error al consultar la cuenta");
    return NextResponse.json({ error }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });

  try {
    const body = await req.json();
    const resultado = await actualizarMiCuenta(sesion, body);

    const respuesta = NextResponse.json(resultado.payload);

    respuesta.cookies.set(COOKIE_SESION, resultado.tokenSesion, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return respuesta;
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar la cuenta:", err);
    const { error, status } = respuestaError(err, "Error al actualizar la cuenta");
    return NextResponse.json({ error }, { status });
  }
}
