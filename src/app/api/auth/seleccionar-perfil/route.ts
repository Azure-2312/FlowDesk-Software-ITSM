import { NextRequest, NextResponse } from "next/server";
import { verificarTokenPreSesion, crearTokenSesion, COOKIE_SESION } from "@/lib/auth";
import { SesionUsuario } from "@/types";

export async function POST(req: NextRequest) {
  const { tokenPreSesion, id_perfil } = await req.json();

  if (!tokenPreSesion || !id_perfil) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const datos = verificarTokenPreSesion(tokenPreSesion);
  if (!datos) {
    return NextResponse.json(
      { error: "La sesión temporal expiró. Inicia sesión de nuevo." },
      { status: 401 }
    );
  }

  // No confiamos en que el perfil elegido sea válido solo porque el
  // cliente lo mandó: lo comparamos contra la lista de perfiles que
  // quedó firmada dentro del propio token (esa sí es confiable).
  const perfilElegido = datos.perfiles.find((p) => p.id_perfil === id_perfil);
  if (!perfilElegido) {
    return NextResponse.json({ error: "Ese perfil no te pertenece" }, { status: 403 });
  }

  const sesion: SesionUsuario = {
    id_usuario: datos.id_usuario,
    nombres: datos.nombres,
    correo_electronico: datos.correo_electronico,
    perfiles: datos.perfiles,
    perfilActivo: perfilElegido,
  };

  const token = crearTokenSesion(sesion);
  const respuesta = NextResponse.json({ ok: true, sesion });

  respuesta.cookies.set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return respuesta;
}
