import { query, queryRow } from "@/shared/lib/db";
import { compararClave, hashearClave, validarFortalezaClave } from "./authService";
import { ErrorDominio } from "@/shared/lib/errores";
import { Usuario, Perfil, SesionUsuario } from "@/types";

export async function obtenerMiCuenta(idUsuario: number) {
  const usuarios = await query<Usuario>(
    `SELECT u.id_usuario, u.dni, u.nombres, u.apellido_paterno, u.apellido_materno,
            u.celular, u.correo_electronico, u.correo_personal, u.estado_registro,
            COALESCE(u.nivel_prioridad, 5) AS nivel_prioridad,
            u.foto_perfil,
            u.id_departamento_empresa,
            de.nombre AS departamento_empresa_nombre,
            de.codigo AS departamento_empresa_codigo,
            u.id_departamento,
            dt.nombre AS departamento_ti_nombre,
            dt.codigo AS departamento_ti_codigo
     FROM usuario u
     LEFT JOIN departamento_empresa de ON de.id_departamento_empresa = u.id_departamento_empresa
     LEFT JOIN departamento_ti dt ON dt.id_departamento = u.id_departamento
     WHERE u.id_usuario = $1`,
    [idUsuario]
  );

  if (usuarios.length === 0) {
    throw new ErrorDominio("Usuario no encontrado", 404);
  }

  const perfiles = await query<Perfil>(
    `SELECT p.id_perfil, p.nombre, p.descripcion, p.estado_registro
     FROM perfiles p
     INNER JOIN usuario_perfiles up ON up.id_perfil = p.id_perfil
     WHERE up.id_usuario = $1 AND up.estado_registro = true AND p.estado_registro = true
     ORDER BY p.nombre`,
    [idUsuario]
  );

  const detalleTecnico = await queryRow<{
    nivel_soporte: number;
    especialidad_principal: string | null;
    capacidad_maxima_tickets: number | null;
    estado_operativo: string | null;
    departamento_nombre: string | null;
  }>(
    `SELECT td.nivel_soporte, td.especialidad_principal, td.capacidad_maxima_tickets, td.estado_operativo,
            d.nombre AS departamento_nombre
     FROM tecnico_detalle td
     LEFT JOIN departamento_ti d ON td.id_departamento = d.id_departamento
     WHERE td.id_usuario = $1 AND td.estado_registro = true LIMIT 1`,
    [idUsuario]
  );

  return { usuario: usuarios[0], perfiles, detalleTecnico: detalleTecnico ?? null };
}

/** Campos permitidos para actualización: solo contraseña y foto de perfil. */
export interface DatosActualizarCuenta {
  foto_perfil?: string | null;
  clave_actual?: string | null;
  clave_nueva?: string | null;
}

export interface ResultadoActualizarCuenta {
  payload: Record<string, unknown>;
  tokenSesion: string;
}

export async function actualizarMiCuenta(
  sesion: SesionUsuario,
  datos: DatosActualizarCuenta
): Promise<ResultadoActualizarCuenta> {
  const { foto_perfil, clave_actual, clave_nueva } = datos;

  // 1. Actualización de Foto de Perfil (si viene definida)
  if (foto_perfil !== undefined) {
    // Si viene imagen en base64, verificamos un límite seguro de peso (~5MB)
    if (foto_perfil && foto_perfil.length > 5 * 1024 * 1024) {
      throw new ErrorDominio("La imagen seleccionada supera el tamaño máximo permitido (5 MB)");
    }

    await query(
      `UPDATE usuario
       SET foto_perfil = $1, usuario_modificacion = $2, fecha_modificacion = now()
       WHERE id_usuario = $3`,
      [foto_perfil || null, sesion.id_usuario, sesion.id_usuario]
    );
  }

  // 2. Actualización de Contraseña (si viene definida)
  if (clave_nueva && clave_nueva.trim()) {
    if (!clave_actual) {
      throw new ErrorDominio("Debes ingresar tu contraseña actual para cambiarla");
    }
    const errorFortaleza = validarFortalezaClave(clave_nueva.trim());
    if (errorFortaleza) {
      throw new ErrorDominio(errorFortaleza);
    }

    const usuarioDb = await query<{ clave: string }>(
      `SELECT clave FROM usuario WHERE id_usuario = $1`,
      [sesion.id_usuario]
    );

    if (usuarioDb.length === 0) {
      throw new ErrorDominio("Usuario no encontrado", 404);
    }

    const coincide = await compararClave(clave_actual, usuarioDb[0].clave);
    if (!coincide) {
      throw new ErrorDominio("La contraseña actual no es correcta");
    }

    const esMismaClave = await compararClave(clave_nueva.trim(), usuarioDb[0].clave);
    if (esMismaClave) {
      throw new ErrorDominio("La nueva contraseña no puede ser idéntica a la anterior. Elige una diferente.");
    }

    const nuevoHash = await hashearClave(clave_nueva.trim());

    await query(
      `UPDATE usuario
       SET clave = $1, usuario_modificacion = $2, fecha_modificacion = now()
       WHERE id_usuario = $3`,
      [nuevoHash, sesion.id_usuario, sesion.id_usuario]
    );
  }

  return {
    payload: {
      ok: true,
      mensaje: foto_perfil !== undefined && !clave_nueva
        ? "Foto de perfil actualizada con éxito"
        : "Contraseña actualizada con éxito",
      foto_perfil: foto_perfil || null,
    },
    tokenSesion: "", // Mantiene el token actual intacto sin necesidad de reautenticar
  };
}
