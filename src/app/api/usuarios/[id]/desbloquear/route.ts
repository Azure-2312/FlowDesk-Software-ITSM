import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

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
  if (sesion.perfilActivo.nombre.toLowerCase() !== "administrador") {
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
    await query(
      `UPDATE usuario
       SET intentos_fallidos = 0,
           cuenta_bloqueada = false,
           bloqueado_hasta = NULL,
           usuario_modificacion = $1,
           fecha_modificacion = now()
       WHERE id_usuario = $2`,
      [sesion.id_usuario, idUsuario]
    );

    return NextResponse.json({
      ok: true,
      mensaje: "Usuario desbloqueado exitosamente. Ya puede iniciar sesión.",
    });
  } catch (error) {
    console.error("Error al desbloquear usuario:", error);
    return NextResponse.json({ error: "Error al desbloquear el usuario" }, { status: 500 });
  }
}
