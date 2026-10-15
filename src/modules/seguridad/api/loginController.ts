import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION } from "@/shared/lib/auth";
import { iniciarSesion } from "@/modules/seguridad/loginService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") ?? "desconocida";

    const resultado = await iniciarSesion({
      correo_electronico: body.correo_electronico,
      clave: body.clave,
      captcha_token: body.captcha_token,
      captcha_respuesta: body.captcha_respuesta,
      ip,
    });

    const respuesta = NextResponse.json(resultado.payload, { status: resultado.httpStatus });

    if (resultado.tokenSesion) {
      const esHttps =
        process.env.NODE_ENV === "production" ||
        req.headers.get("x-forwarded-proto") === "https";

      respuesta.cookies.set(COOKIE_SESION, resultado.tokenSesion, {
        httpOnly: true, // Protección contra lectura JS / XSS
        secure: esHttps, // Solo se transmite sobre HTTPS seguro
        sameSite: "lax", // Mitigación de CSRF
        path: "/",
        maxAge: 60 * 60 * 8, // 8 horas
      });
    }

    return respuesta;
  } catch (error) {
    console.error("Error en endpoint de login:", error);
    return NextResponse.json({ error: "Ocurrió un error al procesar la solicitud" }, { status: 500 });
  }
}
