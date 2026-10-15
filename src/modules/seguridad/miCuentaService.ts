import { query } from "@/shared/lib/db";
import { compararClave, crearTokenSesion, hashearClave, validarFortalezaClave } from "./authService";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarNombre, validarCelular } from "@/shared/lib/validaciones";
import { Usuario, Perfil, SesionUsuario } from "@/types";

export async function obtenerMiCuenta(idUsuario: number) {
  const usuarios = await query<Usuario>(
    `SELECT id_usuario, dni, nombres, apellido_paterno, apellido_materno,
            celular, correo_electronico, estado_registro, COALESCE(nivel_prioridad, 5) AS nivel_prioridad
     FROM usuario WHERE id_usuario = $1`,
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

  return { usuario: usuarios[0], perfiles };
}

/** Datos personales y (opcionalmente) credenciales para actualizar la cuenta. */
export interface DatosActualizarCuenta {
  nombres?: string | null;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;
  celular?: string | null;
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
  const {
    nombres,
    apellido_paterno,
    apellido_materno,
    celular,
    clave_actual,
    clave_nueva,
  } = datos;

  const vNom = validarNombre(nombres, "El nombre", true);
  if (!vNom.valido) throw new ErrorDominio(vNom.mensaje!);

  const vPat = validarNombre(apellido_paterno, "El apellido paterno", true);
  if (!vPat.valido) throw new ErrorDominio(vPat.mensaje!);

  const vMat = validarNombre(apellido_materno, "El apellido materno", false);
  if (!vMat.valido) throw new ErrorDominio(vMat.mensaje!);

  const vCel = validarCelular(celular, false);
  if (!vCel.valido) throw new ErrorDominio(vCel.mensaje!);

  const nombresLimpio = (nombres as string).trim();
  const apellidoPaternoLimpio = (apellido_paterno as string).trim();

  // Si intenta cambiar la contraseña, validar clave actual
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
       SET nombres = $1, apellido_paterno = $2, apellido_materno = $3,
           celular = $4, clave = $5, usuario_modificacion = $6, fecha_modificacion = now()
       WHERE id_usuario = $7`,
      [
        nombresLimpio,
        apellidoPaternoLimpio,
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
        nombresLimpio,
        apellidoPaternoLimpio,
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
    nombres: nombresLimpio,
  };

  const nuevoToken = crearTokenSesion(nuevaSesion);

  return {
    payload: {
      ok: true,
      mensaje: "Tu perfil ha sido actualizado con éxito",
      usuario: {
        nombres: nombresLimpio,
        apellido_paterno: apellidoPaternoLimpio,
        apellido_materno: apellido_materno ? apellido_materno.trim() : null,
        celular: celular ? celular.trim() : null,
      },
    },
    tokenSesion: nuevoToken,
  };
}
