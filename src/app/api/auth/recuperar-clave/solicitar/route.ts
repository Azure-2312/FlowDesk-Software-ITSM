import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db";
import { enviarCorreoCodigoRecuperacion } from "@/lib/email";

export const dynamic = "force-dynamic";

function generarCodigo(): string {
  const caracteres = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { correo } = body;

    if (!correo || typeof correo !== "string") {
      return NextResponse.json({ error: "El correo es obligatorio" }, { status: 400 });
    }

    const correoLimpio = correo.trim().toLowerCase();

    // Validar formato de correo permitido (corporativo @systemticket.pe o @gmail.com)
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@(systemticket\.pe|gmail\.com)$/i;
    if (!regexCorreo.test(correoLimpio)) {
      return NextResponse.json(
        { error: "El correo debe ser corporativo (@systemticket.pe) o Gmail (@gmail.com)" },
        { status: 400 }
      );
    }

    // Verificar si el correo existe en la base de datos
    const usuarios = await query<{
      id_usuario: number;
      nombres: string;
      correo_electronico: string;
      estado_registro: boolean;
    }>(
      `SELECT id_usuario, nombres, correo_electronico, estado_registro
       FROM usuario
       WHERE LOWER(correo_electronico) = $1`,
      [correoLimpio]
    );

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: "No existe ningún usuario registrado con este correo en el sistema" },
        { status: 404 }
      );
    }

    const usuario = usuarios[0];
    if (!usuario.estado_registro) {
      return NextResponse.json(
        { error: "Este usuario se encuentra inactivo. Contacta al administrador." },
        { status: 403 }
      );
    }

    // Generar código de 6 caracteres y token de sesión único
    const codigo = generarCodigo();
    const tokenSesion = crypto.randomUUID();

    // Insertar en la base de datos con expiraciones estrictas del servidor:
    // expira_codigo: 75 segundos desde el envío (60s efectivos + 15s margen de entrega SMTP)
    // expira_sesion: 3 minutos para todo el flujo
    const insertado = await query<{
      fecha_envio: string;
      expira_codigo: string;
      expira_sesion: string;
    }>(
      `INSERT INTO codigo_recuperacion
         (id_usuario, correo, codigo, token_sesion, fecha_envio, expira_codigo, expira_sesion, utilizado)
       VALUES
         ($1, $2, $3, $4, now(), now() + interval '75 seconds', now() + interval '180 seconds', false)
       RETURNING fecha_envio, expira_codigo, expira_sesion`,
      [usuario.id_usuario, usuario.correo_electronico, codigo, tokenSesion]
    );

    const { fecha_envio, expira_codigo, expira_sesion } = insertado[0];

    // Enviar correo mediante Gmail SMTP
    await enviarCorreoCodigoRecuperacion(usuario.correo_electronico, codigo, usuario.nombres);

    const ahoraMs = Date.now();
    return NextResponse.json({
      ok: true,
      mensaje: "Código enviado exitosamente a tu correo electrónico",
      token_sesion: tokenSesion,
      fecha_envio,
      expira_codigo,
      expira_sesion,
      expira_codigo_ms: ahoraMs + 60 * 1000,
      expira_sesion_ms: ahoraMs + 180 * 1000,
      segundos_codigo: 60,
      segundos_sesion: 180,
    });
  } catch (error) {
    console.error("Error al solicitar código de recuperación:", error);
    return NextResponse.json(
      { error: "No se pudo enviar el correo de recuperación. Intenta más tarde." },
      { status: 500 }
    );
  }
}
