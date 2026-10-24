import { query, queryRow, transaccion } from "@/shared/lib/db";
import { hashearClave, compararClave, validarFortalezaClave } from "@/shared/lib/auth";
import { PERFILES } from "@/shared/lib/capacidades";
import { ErrorDominio } from "@/shared/lib/errores";
import { asignarPerfilesAUsuario } from "@/shared/lib/usuarios";
import {
  validarDni,
  validarNombre,
  validarCorreo,
  validarCelular,
} from "@/shared/lib/validaciones";

export interface ContextoAuditoriaUsuario {
  idUsuarioSesion: number;
  ip: string;
}

async function usuarioTienePerfilActivo(idUsuario: number, idPerfil: number): Promise<boolean> {
  const fila = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM usuario u
       INNER JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario
       WHERE u.id_usuario = $1
         AND u.estado_registro = true
         AND up.id_perfil = $2
         AND up.estado_registro = true
     ) AS existe`,
    [idUsuario, idPerfil]
  );
  return Boolean(fila?.existe);
}

async function existeOtroAdministradorActivo(idExcluido: number): Promise<boolean> {
  const fila = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1
       FROM usuario u
       INNER JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario
       WHERE u.estado_registro = true
         AND up.estado_registro = true
         AND up.id_perfil = $1
         AND u.id_usuario <> $2
     ) AS existe`,
    [PERFILES.ADMINISTRADOR, idExcluido]
  );
  return Boolean(fila?.existe);
}

export async function actualizarUsuario(idUsuario: number, body: any, contexto: ContextoAuditoriaUsuario) {
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

  const perfilesNormalizados = Array.isArray(perfiles) ? perfiles.map(Number) : null;
  const correoLimpio = (correo_electronico || "").trim().toLowerCase();
  const correoPersonalLimpio = (correo_personal || "").trim().toLowerCase() || null;
  const prioridadInt = Number(nivel_prioridad) >= 1 && Number(nivel_prioridad) <= 5 ? Number(nivel_prioridad) : 5;

  const vDni = validarDni(dni);
  if (!vDni.valido) throw new ErrorDominio(vDni.mensaje!);

  const vNom = validarNombre(nombres, "El nombre del usuario", true);
  if (!vNom.valido) throw new ErrorDominio(vNom.mensaje!);

  const vPat = validarNombre(apellido_paterno, "El apellido paterno", true);
  if (!vPat.valido) throw new ErrorDominio(vPat.mensaje!);

  const vMat = validarNombre(apellido_materno, "El apellido materno", false);
  if (!vMat.valido) throw new ErrorDominio(vMat.mensaje!);

  const vCel = validarCelular(celular, false);
  if (!vCel.valido) throw new ErrorDominio(vCel.mensaje!);

  const vCorp = validarCorreo(correo_electronico, "El correo corporativo", true);
  if (!vCorp.valido) throw new ErrorDominio(vCorp.mensaje!);

  if (correo_personal) {
    const vPers = validarCorreo(correo_personal, "El correo personal", false);
    if (!vPers.valido) throw new ErrorDominio(vPers.mensaje!);
  }

  if (perfilesNormalizados?.includes(PERFILES.GESTOR_AREA) && !id_departamento_empresa) {
    throw new ErrorDominio("Asigna un departamento empresarial a los usuarios con perfil Gestor de Área.");
  }

  if (perfilesNormalizados && perfilesNormalizados.length === 0) {
    throw new ErrorDominio("El usuario debe conservar al menos un perfil.");
  }

  if (perfilesNormalizados && !perfilesNormalizados.includes(PERFILES.ADMINISTRADOR)) {
    const eraAdministrador = await usuarioTienePerfilActivo(idUsuario, PERFILES.ADMINISTRADOR);
    if (eraAdministrador && !(await existeOtroAdministradorActivo(idUsuario))) {
      throw new ErrorDominio("No puedes retirar el perfil de Administrador al último administrador activo.");
    }
  }

  if (clave && clave.trim()) {
    const errorClave = validarFortalezaClave(clave.trim());
    if (errorClave) {
      throw new ErrorDominio(errorClave);
    }

    const actual = await query<{ clave: string }>(
      `SELECT clave FROM usuario WHERE id_usuario = $1`,
      [idUsuario]
    );
    if (actual.length > 0) {
      const esMisma = await compararClave(clave.trim(), actual[0].clave);
      if (esMisma) {
        throw new ErrorDominio("La nueva contraseña no puede ser idéntica a la anterior");
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
           correoPersonalLimpio, correoLimpio, claveHash, id_departamento_empresa || null, prioridadInt, contexto.idUsuarioSesion, idUsuario]
        );
      } else {
        await client.query(
          `UPDATE usuario
           SET dni = $1, nombres = $2, apellido_paterno = $3, apellido_materno = $4,
               celular = $5, correo_personal = $6, correo_electronico = $7,
               id_departamento_empresa = $8, nivel_prioridad = $9, usuario_modificacion = $10, fecha_modificacion = now()
           WHERE id_usuario = $11`,
          [dni.trim(), nombres.trim(), apellido_paterno.trim(), apellido_materno?.trim() || null, celular?.trim() || null,
           correoPersonalLimpio, correoLimpio, id_departamento_empresa || null, prioridadInt, contexto.idUsuarioSesion, idUsuario]
        );
      }

      if (perfilesNormalizados) {
        await asignarPerfilesAUsuario(client, idUsuario, perfilesNormalizados);
      }
      if (id_departamento_empresa) {
        await client.query("UPDATE ticket SET id_departamento_empresa=$1 WHERE id_usuario_solicitante=$2 AND id_departamento_empresa IS NULL", [id_departamento_empresa,idUsuario]);
      }

      await client.query(
        `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
         VALUES ($1, 'USUARIOS', $2, $3, $4, $5)`,
        [
          contexto.idUsuarioSesion,
          clave ? 'ACTUALIZAR_USUARIO_Y_CREDENCIALES' : 'ACTUALIZAR_DATOS_USUARIO',
          `El Administrador modificó los datos del usuario ID ${idUsuario} (${correoLimpio})` + (clave ? ' incluyendo nueva contraseña' : ''),
          JSON.stringify({ id_usuario_afectado: idUsuario, correo: correoLimpio, perfiles: perfilesNormalizados ?? perfiles, cambio_clave: Boolean(clave) }),
          contexto.ip,
        ]
      );
    });

    return { ok: true };
  } catch (error: any) {
    if (error.code === "23505") {
      throw new ErrorDominio("El DNI o el correo ya están registrados", 409);
    }
    throw error;
  }
}

/** Activa/desactiva al usuario (soft delete). Nunca borra la fila. */
export async function alternarEstadoUsuario(idUsuario: number, contexto: ContextoAuditoriaUsuario) {
  const actuales = await query<{ estado_registro: boolean; correo_electronico: string }>(
    `SELECT estado_registro, correo_electronico FROM usuario WHERE id_usuario = $1`,
    [idUsuario]
  );
  if (actuales.length === 0) {
    throw new ErrorDominio("Usuario no encontrado", 404);
  }

  const nuevoEstado = !actuales[0].estado_registro;

  if (!nuevoEstado) {
    if (idUsuario === contexto.idUsuarioSesion) {
      throw new ErrorDominio("No puedes desactivar tu propia cuenta.");
    }

    const eraAdministrador = await usuarioTienePerfilActivo(idUsuario, PERFILES.ADMINISTRADOR);
    if (eraAdministrador && !(await existeOtroAdministradorActivo(idUsuario))) {
      throw new ErrorDominio("No puedes desactivar al último administrador activo.");
    }
  }

  await transaccion(async (client) => {
    await client.query(
      `UPDATE usuario
       SET estado_registro = $1, usuario_modificacion = $2, fecha_modificacion = now()
       WHERE id_usuario = $3`,
      [nuevoEstado, contexto.idUsuarioSesion, idUsuario]
    );

    await client.query(
      `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
       VALUES ($1, 'USUARIOS', $2, $3, $4, $5)`,
      [
        contexto.idUsuarioSesion,
        nuevoEstado ? 'REACTIVAR_USUARIO' : 'SUSPENDER_USUARIO',
        `El Administrador ${nuevoEstado ? 'reactivó' : 'suspendió'} al usuario ID ${idUsuario} (${actuales[0].correo_electronico})`,
        JSON.stringify({ id_usuario_afectado: idUsuario, nuevo_estado: nuevoEstado }),
        contexto.ip,
      ]
    );
  });

  return { ok: true, estado_registro: nuevoEstado };
}
