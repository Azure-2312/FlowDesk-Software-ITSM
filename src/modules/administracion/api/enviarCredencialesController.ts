import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { enviarCredenciales } from "@/modules/administracion/services/enviarCredencialesService";

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
    const data = await enviarCredenciales(body);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al enviar credenciales por correo:", err);
    const { error, status } = respuestaError(err, "No se pudo enviar el correo de credenciales. Verifica la configuración de correo saliente.");
    return NextResponse.json({ error }, { status });
  }
}
