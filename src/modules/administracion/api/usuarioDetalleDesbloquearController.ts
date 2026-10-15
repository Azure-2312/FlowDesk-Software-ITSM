import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { desbloquearUsuario } from "@/modules/administracion/services/usuarioDetalleDesbloquearService";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

interface Contexto {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Contexto) {
  const sesion = obtenerSesionActual();
  if (!sesion) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }

  // Verificar que el perfil activo sea Administrador o soporte
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_USUARIOS)) {
    return NextResponse.json(
      { error: "Solo un administrador o personal de soporte técnico puede desbloquear usuarios" },
      { status: 403 }
    );
  }

  const idUsuario = Number(params.id);
  if (isNaN(idUsuario)) {
    return NextResponse.json({ error: "ID de usuario inválido" }, { status: 400 });
  }

  try {
    const data = await desbloquearUsuario(idUsuario, sesion.id_usuario);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al desbloquear usuario:", err);
    const { error, status } = respuestaError(err, "Error al desbloquear el usuario");
    return NextResponse.json({ error }, { status });
  }
}
