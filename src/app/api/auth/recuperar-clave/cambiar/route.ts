import { NextRequest, NextResponse } from "next/server";
import { query, transaccion } from "@/shared/lib/db";
import { compararClave, hashearClave } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token_sesion, codigo, clave_nueva } = body;

    if (!token_sesion || !codigo || !clave_nueva) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios para cambiar la contraseña" },
        { status: 400 }
      );
    }

    const codigoLimpio = String(codigo).trim().toUpperCase();

    // 1. Validar requisitos de seguridad de la nueva contraseña
    if (clave_nueva.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener un mínimo de 8 caracteres" },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(clave_nueva)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos una letra mayúscula" },
        { status: 400 }
      );
    }
    if (!/[a-z]/.test(clave_nueva)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos una letra minúscula" },
        { status: 400 }
      );
    }
    if (!/\d/.test(clave_nueva)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos un número" },
        { status: 400 }
      );
    }
    if (!/[\W_]/.test(clave_nueva)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos un signo o carácter especial (ej. !@#$%^&*)" },
        { status: 400 }
      );
    }

    // 2. Buscar registro de recuperación
    const registros = await query<{
      id_recuperacion: number;
      id_usuario: number;
      codigo: string;
      utilizado: boolean;
      sesion_expirada: boolean;
      codigo_expirado: boolean;
    }>(
      `SELECT id_recuperacion, id_usuario, codigo, utilizado,
              (now() > expira_sesion) as sesion_expirada,
              (now() > expira_codigo) as codigo_expirado
       FROM codigo_recuperacion
       WHERE token_sesion = $1`,
      [token_sesion]
    );

    if (registros.length === 0) {
      return NextResponse.json(
        { error: "Sesión de recuperación no encontrada" },
        { status: 404 }
      );
    }

    const reg = registros[0];

    if (reg.sesion_expirada) {
      return NextResponse.json(
        {
          error: "El tiempo total de la sesión (3 minutos) ha expirado.",
          sesion_expirada: true,
        },
        { status: 410 }
      );
    }

    if (reg.utilizado) {
      return NextResponse.json(
        { error: "Este código ya fue utilizado. Solicita un nuevo proceso." },
        { status: 400 }
      );
    }

    if (reg.codigo.toUpperCase() !== codigoLimpio) {
      return NextResponse.json(
        { error: "El código de verificación no coincide" },
        { status: 400 }
      );
    }

    // 3. Obtener la contraseña actual del usuario para validar que no sea idéntica
    const usuarios = await query<{ id_usuario: number; clave: string }>(
      `SELECT id_usuario, clave FROM usuario WHERE id_usuario = $1`,
      [reg.id_usuario]
    );

    if (usuarios.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const claveActualHash = usuarios[0].clave;
    const esMismaClave = await compararClave(clave_nueva, claveActualHash);

    if (esMismaClave) {
      return NextResponse.json(
        { error: "La nueva contraseña no puede ser idéntica a la anterior. Por favor, elige una contraseña diferente." },
        { status: 400 }
      );
    }

    // 4. Hashear la nueva contraseña y actualizar en la base de datos
    const nuevaClaveHash = await hashearClave(clave_nueva);

    await transaccion(async (client) => {
      await client.query(
        `UPDATE usuario
         SET clave = $1, fecha_modificacion = now(), cuenta_bloqueada = false, intentos_fallidos = 0
         WHERE id_usuario = $2`,
        [nuevaClaveHash, reg.id_usuario]
      );

      await client.query(
        `UPDATE codigo_recuperacion
         SET utilizado = true
         WHERE id_recuperacion = $1`,
        [reg.id_recuperacion]
      );

      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await client.query(
        `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
         VALUES ($1, 'SEGURIDAD', 'RESTABLECER_CONTRASENA', 'El usuario restableció satisfactoriamente su contraseña mediante código de seguridad verificado', $2, $3)`,
        [
          reg.id_usuario,
          JSON.stringify({ metodo: "CODIGO_EMAIL", id_recuperacion: reg.id_recuperacion }),
          ip,
        ]
      );
    });

    return NextResponse.json({
      ok: true,
      mensaje: "Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la contraseña. Intenta más tarde." },
      { status: 500 }
    );
  }
}
