import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { enviarCorreoCredencialesNuevas } from "@/shared/lib/email";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function POST(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_USUARIOS)) {
    return NextResponse.json({ error: "Solo el Administrador puede gestionar credenciales de usuarios." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      correo_personal,
      correo_corporativo,
      clave_temporal,
      nombres,
      perfiles = [],
    } = body;

    if (!correo_personal || !correo_corporativo || !clave_temporal || !nombres) {
      return NextResponse.json(
        { error: "Faltan datos requeridos para el envío de credenciales" },
        { status: 400 }
      );
    }

    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexCorreo.test(correo_personal.trim())) {
      return NextResponse.json(
        { error: "El correo personal no tiene un formato válido" },
        { status: 400 }
      );
    }

    await enviarCorreoCredencialesNuevas(correo_personal.trim(), {
      nombres: nombres.trim(),
      correoCorporativo: correo_corporativo.trim(),
      claveTemporal: clave_temporal,
      perfiles: Array.isArray(perfiles) ? perfiles : [],
    });

    return NextResponse.json({
      ok: true,
      mensaje: `Credenciales enviadas exitosamente al correo personal ${correo_personal.trim()}`,
    });
  } catch (error) {
    console.error("Error al enviar credenciales por correo:", error);
    return NextResponse.json(
      { error: "No se pudo enviar el correo de credenciales. Verifica la configuración de correo saliente." },
      { status: 500 }
    );
  }
}
