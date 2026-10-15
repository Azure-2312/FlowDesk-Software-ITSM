import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, transaccion } from "@/shared/lib/db";
import { hashearClave, compararClave, validarFortalezaClave, verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { asignarPerfilesAUsuario } from "@/shared/lib/usuarios";
import {
  validarDni,
  validarNombre,
  validarCorreo,
  validarCelular,
} from "@/shared/lib/validaciones";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

interface Contexto {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: Contexto) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_USUARIOS)) {
    return NextResponse.json({ error: "Solo el Administrador puede modificar usuarios." }, { status: 403 });
  }

  const idUsuario = Number(params.id);
  const body = await req.json();
  const {
    dni,
    nombres,
    apellido_paterno,
    apellido_materno,
    celular,
    correo_personal,
    correo_electronico,
    clave, // opcional: si viene vacío, no se cambia la contraseña
    perfiles,
    id_departamento_empresa,
    nivel_prioridad,
  } = body;

  const correoLimpio = (correo_electronico || "").trim().toLowerCase();
  const correoPersonalLimpio = (correo_personal || "").trim().toLowerCase() || null;
  const prioridadInt = Number(nivel_prioridad) >= 1 && Number(nivel_prioridad) <= 5 ? Number(nivel_prioridad) : 5;

  const vDni = validarDni(dni);
  if (!vDni.valido) return NextResponse.json({ error: vDni.mensaje }, { status: 400 });

  const vNom = validarNombre(nombres, "El nombre del usuario", true);
  if (!vNom.valido) return NextResponse.json({ error: vNom.mensaje }, { status: 400 });

  const vPat = validarNombre(apellido_paterno, "El apellido paterno", true);
  if (!vPat.valido) return NextResponse.json({ error: vPat.mensaje }, { status: 400 });

  const vMat = validarNombre(apellido_materno, "El apellido materno", false);
  if (!vMat.valido) return NextResponse.json({ error: vMat.mensaje }, { status: 400 });

  const vCel = validarCelular(celular, false);
  if (!vCel.valido) return NextResponse.json({ error: vCel.mensaje }, { status: 400 });

  const vCorp = validarCorreo(correo_electronico, "El correo corporativo", true);
  if (!vCorp.valido) return NextResponse.json({ error: vCorp.mensaje }, { status: 400 });

  if (correo_personal) {
    const vPers = validarCorreo(correo_personal, "El correo personal", false);
    if (!vPers.valido) return NextResponse.json({ error: vPers.mensaje }, { status: 400 });
  }

  if (Array.isArray(perfiles) && perfiles.includes(5) && !id_departamento_empresa) {
    return NextResponse.json({ error: "Asigna un departamento empresarial a los usuarios con perfil Gestor de Área." }, { status: 400 });
  }

  if (clave && clave.trim()) {
    const errorClave = validarFortalezaClave(clave.trim());
    if (errorClave) {
      return NextResponse.json({ error: errorClave }, { status: 400 });
    }

    const actual = await query<{ clave: string }>(
      `SELECT clave FROM usuario WHERE id_usuario = $1`,
      [idUsuario]
    );
    if (actual.length > 0) {
      const esMisma = await compararClave(clave.trim(), actual[0].clave);
      if (esMisma) {
        return NextResponse.json(
          { error: "La nueva contraseña no puede ser idéntica a la anterior" },
          { status: 400 }
        );
      }
    }
  }

  try {
    await transaccion(async (client) => {
      if (clave) {
        const claveHash = await hashearClave(clave);
        await client.query(
          `UPDATE usuario
           SET dni = $1, nombres = $2, apellido_paterno = $3, apellido_materno = $4,
               celular = $5, correo_personal = $6, correo_electronico = $7, clave = $8,
               id_departamento_empresa = $9, nivel_prioridad = $10, usuario_modificacion = $11, fecha_modificacion = now()
           WHERE id_usuario = $12`,
          [dni.trim(), nombres.trim(), apellido_paterno.trim(), apellido_materno?.trim() || null, celular?.trim() || null,
           correoPersonalLimpio, correoLimpio, claveHash, id_departamento_empresa || null, prioridadInt, sesion.id_usuario, idUsuario]
        );
      } else {
        await client.query(
          `UPDATE usuario
           SET dni = $1, nombres = $2, apellido_paterno = $3, apellido_materno = $4,
               celular = $5, correo_personal = $6, correo_electronico = $7,
               id_departamento_empresa = $8, nivel_prioridad = $9, usuario_modificacion = $10, fecha_modificacion = now()
           WHERE id_usuario = $11`,
          [dni.trim(), nombres.trim(), apellido_paterno.trim(), apellido_materno?.trim() || null, celular?.trim() || null,
           correoPersonalLimpio, correoLimpio, id_departamento_empresa || null, prioridadInt, sesion.id_usuario, idUsuario]
        );
      }

      await asignarPerfilesAUsuario(client, idUsuario, Array.isArray(perfiles) ? perfiles : []);
      if (id_departamento_empresa) {
        await client.query("UPDATE ticket SET id_departamento_empresa=$1 WHERE id_usuario_solicitante=$2 AND id_departamento_empresa IS NULL", [id_departamento_empresa,idUsuario]);
      }

      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await client.query(
        `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
         VALUES ($1, 'USUARIOS', $2, $3, $4, $5)`,
        [
          sesion.id_usuario,
          clave ? 'ACTUALIZAR_USUARIO_Y_CREDENCIALES' : 'ACTUALIZAR_DATOS_USUARIO',
          `El Administrador modificó los datos del usuario ID ${idUsuario} (${correoLimpio})` + (clave ? ' incluyendo nueva contraseña' : ''),
          JSON.stringify({ id_usuario_afectado: idUsuario, correo: correoLimpio, perfiles, cambio_clave: Boolean(clave) }),
          ip,
        ]
      );
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "El DNI o el correo ya están registrados" }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "No se pudo actualizar el usuario" }, { status: 500 });
  }
}

/** Activa/desactiva al usuario (soft delete). Nunca borra la fila. */
export async function DELETE(req: NextRequest, { params }: Contexto) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_USUARIOS)) {
    return NextResponse.json({ error: "Solo el Administrador puede activar o desactivar usuarios." }, { status: 403 });
  }

  const idUsuario = Number(params.id);

  const actuales = await query<{ estado_registro: boolean; correo_electronico: string }>(
    `SELECT estado_registro, correo_electronico FROM usuario WHERE id_usuario = $1`,
    [idUsuario]
  );
  if (actuales.length === 0) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const nuevoEstado = !actuales[0].estado_registro;
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  await transaccion(async (client) => {
    await client.query(
      `UPDATE usuario
       SET estado_registro = $1, usuario_modificacion = $2, fecha_modificacion = now()
       WHERE id_usuario = $3`,
      [nuevoEstado, sesion.id_usuario, idUsuario]
    );

    await client.query(
      `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
       VALUES ($1, 'USUARIOS', $2, $3, $4, $5)`,
      [
        sesion.id_usuario,
        nuevoEstado ? 'REACTIVAR_USUARIO' : 'SUSPENDER_USUARIO',
        `El Administrador ${nuevoEstado ? 'reactivó' : 'suspendió'} al usuario ID ${idUsuario} (${actuales[0].correo_electronico})`,
        JSON.stringify({ id_usuario_afectado: idUsuario, nuevo_estado: nuevoEstado }),
        ip,
      ]
    );
  });

  return NextResponse.json({ ok: true, estado_registro: nuevoEstado });
}
