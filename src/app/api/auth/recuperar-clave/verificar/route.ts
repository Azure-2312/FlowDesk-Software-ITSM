import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token_sesion, codigo } = body;

    if (!token_sesion || !codigo) {
      return NextResponse.json(
        { error: "El token de sesión y el código son requeridos" },
        { status: 400 }
      );
    }

    const codigoLimpio = String(codigo).trim().toUpperCase();
    if (codigoLimpio.length !== 6) {
      return NextResponse.json(
        { error: "El código debe contener exactamente 6 caracteres" },
        { status: 400 }
      );
    }

    const registros = await query<{
      id_recuperacion: number;
      id_usuario: number;
      codigo: string;
      expira_codigo: string;
      expira_sesion: string;
      utilizado: boolean;
      sesion_expirada: boolean;
      codigo_expirado: boolean;
    }>(
      `SELECT id_recuperacion, id_usuario, codigo, expira_codigo, expira_sesion, utilizado,
              (now() > expira_sesion) as sesion_expirada,
              (now() > expira_codigo) as codigo_expirado
       FROM codigo_recuperacion
       WHERE token_sesion = $1`,
      [token_sesion]
    );

    if (registros.length === 0) {
      return NextResponse.json(
        { error: "Sesión de recuperación no encontrada. Por favor inicia nuevamente." },
        { status: 404 }
      );
    }

    const reg = registros[0];

    if (reg.sesion_expirada) {
      return NextResponse.json(
        {
          error: "El tiempo máximo de la sesión (3 minutos) ha expirado.",
          sesion_expirada: true,
        },
        { status: 410 }
      );
    }

    if (reg.utilizado) {
      return NextResponse.json(
        { error: "Este código ya fue utilizado para cambiar una contraseña." },
        { status: 400 }
      );
    }

    if (reg.codigo.toUpperCase() !== codigoLimpio) {
      return NextResponse.json(
        { error: "El código de verificación es incorrecto. Verifica tu bandeja de correo." },
        { status: 400 }
      );
    }

    if (reg.codigo_expirado) {
      return NextResponse.json(
        {
          error: "El código ha vencido (validez de 1 minuto). Pulsa 'Reenviar código' para generar uno nuevo.",
          codigo_expirado: true,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Código verificado con éxito",
    });
  } catch (error) {
    console.error("Error al verificar código:", error);
    return NextResponse.json(
      { error: "Error interno al verificar el código" },
      { status: 500 }
    );
  }
}
