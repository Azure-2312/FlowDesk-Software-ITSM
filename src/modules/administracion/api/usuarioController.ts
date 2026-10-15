import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, transaccion } from "@/shared/lib/db";
import { hashearClave, validarFortalezaClave, verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { asignarPerfilesAUsuario } from "@/shared/lib/usuarios";
import { UsuarioConPerfiles } from "@/types";
import {
  validarDni,
  validarNombre,
  validarCorreo,
  validarCelular,
} from "@/shared/lib/validaciones";

// Esta ruta siempre debe consultar la base de datos en vivo.
export const dynamic = "force-dynamic";

/** Trae la sesión actual desde la cookie (para saber quién crea/edita cada registro). */
function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET() {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_USUARIOS)) {
    return NextResponse.json({ error: "Solo el Administrador puede consultar el directorio de usuarios." }, { status: 403 });
  }

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
  return NextResponse.json({ usuarios: resultado, departamentos_empresa });
}

export async function POST(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_USUARIOS)) {
    return NextResponse.json({ error: "Solo el Administrador puede crear usuarios." }, { status: 403 });
  }

  const body = await req.json();
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

  if (!clave) {
    return NextResponse.json({ error: "La contraseña es obligatoria" }, { status: 400 });
  }
  if (Array.isArray(perfiles) && perfiles.includes(5) && !id_departamento_empresa) {
    return NextResponse.json({ error: "Asigna un departamento empresarial a los usuarios con perfil Gestor de Área." }, { status: 400 });
  }

  const errorClave = validarFortalezaClave(clave);
  if (errorClave) {
    return NextResponse.json({ error: errorClave }, { status: 400 });
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
          sesion.id_usuario,
        ]
      );

      const nuevoId = insertados.rows[0].id_usuario;
      await asignarPerfilesAUsuario(client, nuevoId, Array.isArray(perfiles) ? perfiles : []);
      return nuevoId;
    });

    return NextResponse.json({ ok: true, id_usuario: idUsuario }, { status: 201 });
  } catch (error: any) {
    // Código 23505 de PostgreSQL = violación de restricción UNIQUE (DNI o correo repetido)
    if (error.code === "23505") {
      return NextResponse.json({ error: "El DNI o el correo ya están registrados" }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 });
  }
}
