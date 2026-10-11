import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import {
  verificarTokenSesion,
  crearTokenSesion,
  compararClave,
  hashearClave,
  validarFortalezaClave,
  COOKIE_SESION,
} from "@/lib/auth";
import { Usuario, Perfil, SesionUsuario } from "@/types";
import { validarNombre, validarCelular } from "@/lib/validaciones";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET() {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });

  const usuarios = await query<Usuario>(
    `SELECT id_usuario, dni, nombres, apellido_paterno, apellido_materno,
            celular, correo_electronico, estado_registro, COALESCE(nivel_prioridad, 5) AS nivel_prioridad
     FROM usuario WHERE id_usuario = $1`,
    [sesion.id_usuario]
  );

  if (usuarios.length === 0) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const perfiles = await query<Perfil>(
    `SELECT p.id_perfil, p.nombre, p.descripcion, p.estado_registro
     FROM perfiles p
     INNER JOIN usuario_perfiles up ON up.id_perfil = p.id_perfil
     WHERE up.id_usuario = $1 AND up.estado_registro = true AND p.estado_registro = true
     ORDER BY p.nombre`,
    [sesion.id_usuario]
  );

  return NextResponse.json({ usuario: usuarios[0], perfiles });
}

export async function PUT(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });

  const body = await req.json();
  const {
    nombres,
    apellido_paterno,
    apellido_materno,
    celular,
    clave_actual,
    clave_nueva,
  } = body;

  const vNom = validarNombre(nombres, "El nombre", true);
  if (!vNom.valido) return NextResponse.json({ error: vNom.mensaje }, { status: 400 });

  const vPat = validarNombre(apellido_paterno, "El apellido paterno", true);
  if (!vPat.valido) return NextResponse.json({ error: vPat.mensaje }, { status: 400 });

  const vMat = validarNombre(apellido_materno, "El apellido materno", false);
  if (!vMat.valido) return NextResponse.json({ error: vMat.mensaje }, { status: 400 });

  const vCel = validarCelular(celular, false);
  if (!vCel.valido) return NextResponse.json({ error: vCel.mensaje }, { status: 400 });

  // Si intenta cambiar la contraseña, validar clave actual
  if (clave_nueva && clave_nueva.trim()) {
    if (!clave_actual) {
      return NextResponse.json(
        { error: "Debes ingresar tu contraseña actual para cambiarla" },
        { status: 400 }
      );
    }
    const errorFortaleza = validarFortalezaClave(clave_nueva.trim());
    if (errorFortaleza) {
      return NextResponse.json({ error: errorFortaleza }, { status: 400 });
    }

    const usuarioDb = await query<{ clave: string }>(
      `SELECT clave FROM usuario WHERE id_usuario = $1`,
      [sesion.id_usuario]
    );

    if (usuarioDb.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const coincide = await compararClave(clave_actual, usuarioDb[0].clave);
    if (!coincide) {
      return NextResponse.json(
        { error: "La contraseña actual no es correcta" },
        { status: 400 }
      );
    }

    const esMismaClave = await compararClave(clave_nueva.trim(), usuarioDb[0].clave);
    if (esMismaClave) {
      return NextResponse.json(
        { error: "La nueva contraseña no puede ser idéntica a la anterior. Elige una diferente." },
        { status: 400 }
      );
    }

    const nuevoHash = await hashearClave(clave_nueva.trim());

    await query(
      `UPDATE usuario
       SET nombres = $1, apellido_paterno = $2, apellido_materno = $3,
           celular = $4, clave = $5, usuario_modificacion = $6, fecha_modificacion = now()
       WHERE id_usuario = $7`,
      [
        nombres.trim(),
        apellido_paterno.trim(),
        apellido_materno ? apellido_materno.trim() : null,
        celular ? celular.trim() : null,
        nuevoHash,
        sesion.id_usuario,
        sesion.id_usuario,
      ]
    );
  } else {
    // Actualización de solo datos personales
    await query(
      `UPDATE usuario
       SET nombres = $1, apellido_paterno = $2, apellido_materno = $3,
           celular = $4, usuario_modificacion = $5, fecha_modificacion = now()
       WHERE id_usuario = $6`,
      [
        nombres.trim(),
        apellido_paterno.trim(),
        apellido_materno ? apellido_materno.trim() : null,
        celular ? celular.trim() : null,
        sesion.id_usuario,
        sesion.id_usuario,
      ]
    );
  }

  // Actualizar token de sesión si cambiaron nombres
  const nuevaSesion: SesionUsuario = {
    ...sesion,
    nombres: nombres.trim(),
  };

  const nuevoToken = crearTokenSesion(nuevaSesion);
  const respuesta = NextResponse.json({
    ok: true,
    mensaje: "Tu perfil ha sido actualizado con éxito",
    usuario: {
      nombres: nombres.trim(),
      apellido_paterno: apellido_paterno.trim(),
      apellido_materno: apellido_materno ? apellido_materno.trim() : null,
      celular: celular ? celular.trim() : null,
    },
  });

  respuesta.cookies.set(COOKIE_SESION, nuevoToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return respuesta;
}
