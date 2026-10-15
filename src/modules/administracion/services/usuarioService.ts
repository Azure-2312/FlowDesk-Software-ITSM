import { query, transaccion } from "@/shared/lib/db";
import { hashearClave, validarFortalezaClave } from "@/shared/lib/auth";
import { ErrorDominio } from "@/shared/lib/errores";
import { asignarPerfilesAUsuario } from "@/shared/lib/usuarios";
import { UsuarioConPerfiles } from "@/types";
import {
  validarDni,
  validarNombre,
  validarCorreo,
  validarCelular,
} from "@/shared/lib/validaciones";

export async function listarUsuarios() {
  // 1) Todos los usuarios (activos e inactivos, para poder reactivarlos)
  const usuarios = await query<Omit<UsuarioConPerfiles, "perfiles">>(
    `SELECT u.id_usuario, u.dni, u.nombres, u.apellido_paterno, u.apellido_materno,
            u.celular, u.correo_personal, u.correo_electronico, u.estado_registro,
            u.intentos_fallidos, u.cuenta_bloqueada, u.id_departamento_empresa, u.nivel_prioridad,
            de.nombre AS departamento_empresa_nombre
     FROM usuario u LEFT JOIN departamento_empresa de ON de.id_departamento_empresa=u.id_departamento_empresa
     ORDER BY u.fecha_creacion DESC`
  );

  // 2) Todas las asignaciones usuario-perfil activas, en una sola consulta
  const asignaciones = await query<{ id_usuario: number; id_perfil: number; nombre: string }>(
    `SELECT up.id_usuario, p.id_perfil, p.nombre
     FROM usuario_perfiles up
     INNER JOIN perfiles p ON p.id_perfil = up.id_perfil
     WHERE up.estado_registro = true AND p.estado_registro = true`
  );

  // 3) Combinar en JavaScript: a cada usuario le pegamos sus perfiles
  const resultado: UsuarioConPerfiles[] = usuarios.map((u) => ({
    ...u,
    perfiles: asignaciones
      .filter((a) => a.id_usuario === u.id_usuario)
      .map((a) => ({ id_perfil: a.id_perfil, nombre: a.nombre })),
  }));
  const departamentos_empresa = await query<{ id_departamento_empresa: number; nombre: string }>(
    "SELECT id_departamento_empresa,nombre FROM departamento_empresa WHERE estado_registro=true ORDER BY nombre"
  );
  return { usuarios: resultado, departamentos_empresa };
}

export async function crearUsuario(body: any, idUsuarioSesion: number) {
  const {
    dni,
    nombres,
    apellido_paterno,
    apellido_materno,
    celular,
    correo_personal,
    correo_electronico,
    clave,
    perfiles, // number[] — ids de perfiles a asignar
    id_departamento_empresa,
    nivel_prioridad,
  } = body;

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

  if (!clave) {
    throw new ErrorDominio("La contraseña es obligatoria");
  }
  if (Array.isArray(perfiles) && perfiles.includes(5) && !id_departamento_empresa) {
    throw new ErrorDominio("Asigna un departamento empresarial a los usuarios con perfil Gestor de Área.");
  }

  const errorClave = validarFortalezaClave(clave);
  if (errorClave) {
    throw new ErrorDominio(errorClave);
  }

  try {
    const idUsuario = await transaccion(async (client) => {
      const claveHash = await hashearClave(clave);

      const insertados = await client.query<{ id_usuario: number }>(
        `INSERT INTO usuario
           (dni, nombres, apellido_paterno, apellido_materno, celular,
            correo_personal, correo_electronico, clave, id_departamento_empresa, nivel_prioridad, usuario_creacion, estado_registro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
         RETURNING id_usuario`,
        [
          dni.trim(),
          nombres.trim(),
          apellido_paterno.trim(),
          apellido_materno?.trim() || null,
          celular?.trim() || null,
          correoPersonalLimpio,
          correoLimpio,
          claveHash,
          id_departamento_empresa || null,
          prioridadInt,
          idUsuarioSesion,
        ]
      );

      const nuevoId = insertados.rows[0].id_usuario;
      await asignarPerfilesAUsuario(client, nuevoId, Array.isArray(perfiles) ? perfiles : []);
      return nuevoId;
    });

    return { httpStatus: 201, payload: { ok: true, id_usuario: idUsuario } };
  } catch (error: any) {
    // Código 23505 de PostgreSQL = violación de restricción UNIQUE (DNI o correo repetido)
    if (error.code === "23505") {
      throw new ErrorDominio("El DNI o el correo ya están registrados", 409);
    }
    throw error;
  }
}
