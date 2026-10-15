import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { cambiarPerfil } from "@/modules/seguridad/cambiarPerfilService";

export async function POST(req: NextRequest) {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesionActual = token ? verificarTokenSesion(token) : null;

  if (!sesionActual) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }

  try {
    const { id_perfil } = await req.json();
    const resultado = await cambiarPerfil(sesionActual, id_perfil);

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
    if (!(err instanceof ErrorDominio)) console.error("Error al cambiar de perfil:", err);
    const { error, status } = respuestaError(err, "Error al cambiar de perfil");
    return NextResponse.json({ error }, { status });
  }
}
