import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";
import { TecnicoConCarga } from "@/types";
import { validarNumeroPositivo, validarTexto } from "@/lib/validaciones";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (![1, 4].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "No autorizado para consultar la carga de técnicos" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const idDepartamento = searchParams.get("id_departamento");
  const nivelSoporte = searchParams.get("nivel");
  const estadoOperativo = searchParams.get("estado");

  const condiciones: string[] = ["td.estado_registro = true", "u.estado_registro = true"];
  const params: any[] = [];
  let paramIdx = 1;

  if (idDepartamento) {
    condiciones.push(`td.id_departamento = $${paramIdx++}`);
    params.push(parseInt(idDepartamento, 10));
  }

  if (nivelSoporte) {
    condiciones.push(`td.nivel_soporte = $${paramIdx++}`);
    params.push(parseInt(nivelSoporte, 10));
  }

  if (estadoOperativo) {
    condiciones.push(`td.estado_operativo = $${paramIdx++}`);
    params.push(estadoOperativo.toUpperCase());
  }

  // La capacidad de un Supervisor se limita a los grupos que tiene asignados.
  if (sesion.perfilActivo?.id_perfil === 4) {
    condiciones.push(`td.id_departamento IN (
      SELECT d.id_departamento FROM departamento_ti d
      WHERE d.id_supervisor = $${paramIdx++} AND d.estado_registro = true
    )`);
    params.push(sesion.id_usuario);
  }

  const sql = `
    SELECT 
      td.id_tecnico_detalle,
      td.id_usuario,
      u.nombres,
      u.apellido_paterno,
      CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo,
      u.correo_electronico,
      u.celular,
      td.id_departamento,
      dep.nombre as departamento_nombre,
      dep.codigo as departamento_codigo,
      td.nivel_soporte,
      td.capacidad_maxima_tickets,
      td.estado_operativo,
      td.especialidad_principal,
      td.estado_registro,
      -- Cómputo de tickets activos (estados no terminales: 1 ABIERTO, 2 ASIGNADO, 3 EN_PROCESO, 4 EN_ESPERA)
      COUNT(t.id_ticket) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND t.estado_registro = true)::int as tickets_activos,
      -- Cómputo de tickets resueltos o cerrados (estados 5 y 6)
      COUNT(t.id_ticket) FILTER (WHERE t.id_estado IN (5, 6) AND t.estado_registro = true)::int as tickets_resueltos,
      -- Cómputo de tickets críticos activos (P1 y P2)
      COUNT(t.id_ticket) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND t.id_prioridad IN (1, 2) AND t.estado_registro = true)::int as tickets_criticos,
      -- Cómputo de tickets con SLA vencido activos
      COUNT(t.id_ticket) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND t.fecha_limite_sla < NOW() AND t.estado_registro = true)::int as tickets_sla_vencido
    FROM tecnico_detalle td
    INNER JOIN usuario u ON u.id_usuario = td.id_usuario
    INNER JOIN departamento_ti dep ON dep.id_departamento = td.id_departamento
    LEFT JOIN ticket t ON t.id_usuario_asignado = td.id_usuario
    WHERE ${condiciones.join(" AND ")}
    GROUP BY 
      td.id_tecnico_detalle, td.id_usuario, u.nombres, u.apellido_paterno,
      u.correo_electronico, u.celular, td.id_departamento, dep.id_departamento, dep.nombre, dep.codigo,
      td.nivel_soporte, td.capacidad_maxima_tickets, td.estado_operativo,
      td.especialidad_principal, td.estado_registro
    ORDER BY dep.id_departamento ASC, td.nivel_soporte ASC, u.nombres ASC
  `;

  try {
    const rawTecnicos = await query<any>(sql, params);

    const tecnicos: TecnicoConCarga[] = rawTecnicos.map((tec) => {
      const capacidad = tec.capacidad_maxima_tickets || 8;
      const activos = tec.tickets_activos || 0;
      const porcentaje = Math.min(100, Math.round((activos / capacidad) * 100));

      return {
        ...tec,
        porcentaje_ocupacion: porcentaje,
      };
    });

    return NextResponse.json({ tecnicos });
  } catch (err) {
    console.error("Error al obtener tecnicos con carga:", err);
    return NextResponse.json({ error: "Error al consultar tecnicos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Permitido para Administrador (1) y Supervisor (4)
  if (![1, 4].includes(sesion.perfilActivo.id_perfil)) {
    return NextResponse.json({ error: "No autorizado para configurar técnicos" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      id_usuario,
      id_departamento,
      nivel_soporte,
      capacidad_maxima_tickets,
      estado_operativo,
      especialidad_principal,
    } = body;

    if (!id_usuario || !id_departamento) {
      return NextResponse.json({ error: "Faltan datos requeridos (usuario y departamento)" }, { status: 400 });
    }

    if (capacidad_maxima_tickets !== undefined && capacidad_maxima_tickets !== null) {
      const vCap = validarNumeroPositivo(capacidad_maxima_tickets, "La capacidad máxima de tickets", 1, 100);
      if (!vCap.valido) return NextResponse.json({ error: vCap.mensaje }, { status: 400 });
    }

    if (especialidad_principal) {
      const vEsp = validarTexto(especialidad_principal, 2, 100, "La especialidad técnica", false);
      if (!vEsp.valido) return NextResponse.json({ error: vEsp.mensaje }, { status: 400 });
    }

    if (sesion.perfilActivo.id_perfil === 4) {
      const gestionaGrupo = await queryRow<{ existe: boolean }>(
        `SELECT EXISTS (
           SELECT 1 FROM departamento_ti
           WHERE id_departamento = $1 AND id_supervisor = $2 AND estado_registro = true
         ) AS existe`,
        [id_departamento, sesion.id_usuario]
      );
      if (!gestionaGrupo?.existe) {
        return NextResponse.json({ error: "Solo puedes administrar técnicos de tus grupos de TI." }, { status: 403 });
      }
    }

    // Asegurar que el usuario tenga asignado el perfil de Técnico (2) en usuario_perfiles
    await query(
      `INSERT INTO usuario_perfiles (id_usuario, id_perfil, estado_registro)
       VALUES ($1, 2, true)
       ON CONFLICT (id_usuario, id_perfil) DO UPDATE SET estado_registro = true`,
      [id_usuario]
    );

    const guardado = await queryRow(
      `INSERT INTO tecnico_detalle (
        id_usuario, id_departamento, nivel_soporte, capacidad_maxima_tickets,
        estado_operativo, especialidad_principal, estado_registro
      ) VALUES ($1, $2, $3, $4, $5, $6, true)
      ON CONFLICT (id_usuario) DO UPDATE SET
        id_departamento = EXCLUDED.id_departamento,
        nivel_soporte = EXCLUDED.nivel_soporte,
        capacidad_maxima_tickets = EXCLUDED.capacidad_maxima_tickets,
        estado_operativo = EXCLUDED.estado_operativo,
        especialidad_principal = EXCLUDED.especialidad_principal,
        estado_registro = true
      RETURNING *`,
      [
        id_usuario,
        id_departamento,
        nivel_soporte || 1,
        capacidad_maxima_tickets || 8,
        estado_operativo || "DISPONIBLE",
        especialidad_principal || null,
      ]
    );

    return NextResponse.json({ tecnico: guardado }, { status: 200 });
  } catch (err) {
    console.error("Error al guardar configuracion de tecnico:", err);
    return NextResponse.json({ error: "Error al registrar tecnico" }, { status: 500 });
  }
}
