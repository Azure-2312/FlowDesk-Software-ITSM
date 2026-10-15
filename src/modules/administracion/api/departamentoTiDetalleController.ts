import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { DepartamentoTI, TecnicoConCarga } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idDepartamento = parseInt(params.id, 10);
  if (isNaN(idDepartamento)) {
    return NextResponse.json({ error: "ID de departamento inválido" }, { status: 400 });
  }

  try {
    const departamento = await queryRow<DepartamentoTI>(`
      SELECT 
        d.id_departamento,
        d.codigo,
        d.nombre,
        d.descripcion,
        d.id_supervisor,
        CONCAT(u.nombres, ' ', u.apellido_paterno) as supervisor_nombre,
        d.tiempo_ola_horas,
        d.tiempo_ola_critico_hrs,
        d.estado_registro
      FROM departamento_ti d
      LEFT JOIN usuario u ON u.id_usuario = d.id_supervisor
      WHERE d.id_departamento = $1
    `, [idDepartamento]);

    if (!departamento) {
      return NextResponse.json({ error: "Departamento no encontrado" }, { status: 404 });
    }

    const perfil = sesion.perfilActivo.id_perfil;
    if (!sesionTieneCapacidad(sesion, CAPACIDADES.ORGANIZACION_VER)) {
      return NextResponse.json({ error: "No autorizado para consultar equipos de TI." }, { status: 403 });
    }
    if (perfil === 4 && Number(departamento.id_supervisor) !== sesion.id_usuario) {
      return NextResponse.json({ error: "Solo puedes consultar los grupos que supervisas." }, { status: 403 });
    }

    const tecnicos = await query<any>(`
      SELECT 
        td.id_tecnico_detalle,
        td.id_usuario,
        u.nombres,
        u.apellido_paterno,
        CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo,
        u.correo_electronico,
        u.celular,
        td.nivel_soporte,
        td.capacidad_maxima_tickets,
        td.estado_operativo,
        td.especialidad_principal,
        COUNT(t.id_ticket) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND t.estado_registro = true)::int as tickets_activos
      FROM tecnico_detalle td
      INNER JOIN usuario u ON u.id_usuario = td.id_usuario
      LEFT JOIN ticket t ON t.id_usuario_asignado = td.id_usuario
      WHERE td.id_departamento = $1 AND td.estado_registro = true AND u.estado_registro = true
      GROUP BY td.id_tecnico_detalle, td.id_usuario, u.nombres, u.apellido_paterno, u.correo_electronico, u.celular, td.nivel_soporte, td.capacidad_maxima_tickets, td.estado_operativo, td.especialidad_principal
      ORDER BY td.nivel_soporte ASC, u.nombres ASC
    `, [idDepartamento]);

    return NextResponse.json({ departamento, tecnicos });
  } catch (err) {
    console.error("Error al obtener detalle del departamento:", err);
    return NextResponse.json({ error: "Error al consultar departamento" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // La estructura y sus responsables se configuran centralmente; el Supervisor
  // coordina su equipo, pero no altera departamentos ni se asigna a sí mismo.
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_ORGANIZACION)) {
    return NextResponse.json({ error: "No autorizado para modificar departamentos" }, { status: 403 });
  }

  const idDepartamento = parseInt(params.id, 10);
  if (isNaN(idDepartamento)) {
    return NextResponse.json({ error: "ID de departamento inválido" }, { status: 400 });
  }

  try {
    const actual = await queryRow<DepartamentoTI>(
      "SELECT * FROM departamento_ti WHERE id_departamento = $1",
      [idDepartamento]
    );

    if (!actual) {
      return NextResponse.json({ error: "Departamento no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const codigo = body.codigo !== undefined ? body.codigo.trim().toUpperCase() : actual.codigo;
    const nombre = body.nombre !== undefined ? body.nombre.trim() : actual.nombre;
    const descripcion = body.descripcion !== undefined ? body.descripcion?.trim() || null : actual.descripcion;
    const id_supervisor = body.id_supervisor !== undefined ? (body.id_supervisor ? parseInt(body.id_supervisor, 10) : null) : actual.id_supervisor;
    const tiempo_ola_horas = body.tiempo_ola_horas !== undefined ? parseInt(body.tiempo_ola_horas, 10) : (actual.tiempo_ola_horas || 8);
    const tiempo_ola_critico_hrs = body.tiempo_ola_critico_hrs !== undefined ? parseInt(body.tiempo_ola_critico_hrs, 10) : (actual.tiempo_ola_critico_hrs || 2);
    const estado_registro = body.estado_registro !== undefined ? Boolean(body.estado_registro) : actual.estado_registro;

    if (id_supervisor) {
      const supervisorValido = await queryRow<{ existe: boolean }>(
        `SELECT EXISTS (
           SELECT 1 FROM usuario u
           JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro = true
           WHERE u.id_usuario = $1 AND u.estado_registro = true AND up.id_perfil = 4
         ) AS existe`,
        [id_supervisor]
      );
      if (!supervisorValido?.existe) {
        return NextResponse.json({ error: "El responsable debe ser un usuario activo con el perfil Supervisor." }, { status: 400 });
      }
    }

    // Verificar si el código ya está en uso por otro departamento
    if (codigo !== actual.codigo) {
      const repetido = await queryRow(
        "SELECT id_departamento FROM departamento_ti WHERE codigo = $1 AND id_departamento != $2",
        [codigo, idDepartamento]
      );
      if (repetido) {
        return NextResponse.json(
          { error: `El código [${codigo}] ya está siendo utilizado por otro departamento` },
          { status: 409 }
        );
      }
    }

    const actualizado = await queryRow<DepartamentoTI>(
      `UPDATE departamento_ti SET
        codigo = $1,
        nombre = $2,
        descripcion = $3,
        id_supervisor = $4,
        tiempo_ola_horas = $5,
        tiempo_ola_critico_hrs = $6,
        estado_registro = $7
       WHERE id_departamento = $8
       RETURNING *`,
      [codigo, nombre, descripcion, id_supervisor, tiempo_ola_horas, tiempo_ola_critico_hrs, estado_registro, idDepartamento]
    );

    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sesion.id_usuario,
        "ORGANIZACION",
        "ACTUALIZAR_DEPARTAMENTO_TI",
        `El usuario ${sesion.nombres} actualizó el departamento de TI [${codigo}] ${nombre}${id_supervisor !== actual.id_supervisor ? ` (Supervisor asignado ID: ${id_supervisor})` : ""}.`,
        JSON.stringify({ id_departamento: idDepartamento, codigo, nombre, id_supervisor, tiempo_ola_horas, estado_registro }),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    return NextResponse.json({ departamento: actualizado });
  } catch (err) {
    console.error("Error al actualizar departamento:", err);
    return NextResponse.json({ error: "No se pudo actualizar el departamento" }, { status: 500 });
  }
}
