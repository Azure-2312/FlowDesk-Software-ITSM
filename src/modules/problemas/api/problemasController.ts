import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (![1, 2, 4, 6, 7, 8, 9].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "Este perfil no puede consultar problemas." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get("estado");
  const soloKEDB = searchParams.get("kedb") === "true";

  const condiciones: string[] = ["p.estado_registro = true"];
  const params: any[] = [];
  let paramIdx = 1;

  if (estado) {
    condiciones.push(`p.id_estado = $${paramIdx++}`);
    params.push(parseInt(estado, 10));
  }

  if (soloKEDB) {
    condiciones.push(`p.es_error_conocido = true`);
  }

  const perfil = sesion.perfilActivo?.id_perfil;
  if (perfil === 2) {
    condiciones.push(`p.id_departamento = (SELECT td.id_departamento FROM tecnico_detalle td WHERE td.id_usuario = $${paramIdx++} AND td.estado_registro = true)`);
    params.push(sesion.id_usuario);
  } else if (perfil === 4) {
    condiciones.push(`p.id_departamento IN (SELECT d.id_departamento FROM departamento_ti d WHERE d.id_supervisor = $${paramIdx++} AND d.estado_registro = true)`);
    params.push(sesion.id_usuario);
  }

  const sql = `
    SELECT 
      p.id_problema,
      p.codigo_problema,
      p.titulo,
      p.descripcion,
      p.id_impacto,
      it.nombre AS impacto_nombre,
      p.id_urgencia,
      ut.nombre AS urgencia_nombre,
      p.id_prioridad,
      pt.nombre AS prioridad_nombre,
      p.id_estado,
      CASE p.id_estado
        WHEN 1 THEN 'Registrado'
        WHEN 2 THEN 'En Investigación'
        WHEN 3 THEN 'Causa Raíz Identificada'
        WHEN 4 THEN 'Error Conocido (KEDB)'
        WHEN 5 THEN 'Resuelto'
        WHEN 6 THEN 'Cerrado'
        ELSE 'Desconocido'
      END AS estado_nombre,
      p.causa_raiz,
      p.metodo_analisis,
      p.workaround,
      p.es_error_conocido,
      p.id_ci_afectado,
      ci.codigo_ci,
      ci.nombre AS ci_nombre,
      p.id_usuario_asignado,
      CONCAT(u.nombres, ' ', u.apellido_paterno) AS tecnico_asignado_nombre,
      p.id_departamento,
      dep.nombre AS departamento_nombre,
      p.solucion_definitiva,
      p.fecha_creacion,
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id_ticket', t.id_ticket,
          'codigo_ticket', t.codigo_ticket,
          'titulo', t.titulo
        )) FROM problema_incidente pi
        JOIN ticket t ON pi.id_ticket = t.id_ticket
        WHERE pi.id_problema = p.id_problema),
        '[]'::json
      ) AS incidentes_asociados
    FROM problema p
    LEFT JOIN impacto_ticket it ON p.id_impacto = it.id_impacto
    LEFT JOIN urgencia_ticket ut ON p.id_urgencia = ut.id_urgencia
    LEFT JOIN prioridad_ticket pt ON p.id_prioridad = pt.id_prioridad
    LEFT JOIN elemento_configuracion ci ON p.id_ci_afectado = ci.id_ci
    LEFT JOIN usuario u ON p.id_usuario_asignado = u.id_usuario
    LEFT JOIN departamento_ti dep ON p.id_departamento = dep.id_departamento
    WHERE ${condiciones.join(" AND ")}
    ORDER BY p.id_problema DESC
  `;

  try {
    const rows = await query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener problemas:", error);
    return NextResponse.json({ error: "Error al consultar la gestión de problemas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (![2, 4].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "Solo Técnicos y Supervisores pueden registrar problemas." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      titulo,
      descripcion,
      id_impacto,
      id_urgencia,
      id_prioridad,
      metodo_analisis,
      id_ci_afectado,
      id_departamento,
      id_ticket_origen
    } = body;

    let idDepartamentoFinal: number;
    if (sesion.perfilActivo?.id_perfil === 2) {
      const grupoTecnico = await queryRow<{ id_departamento: number }>(
        "SELECT id_departamento FROM tecnico_detalle WHERE id_usuario = $1 AND estado_registro = true",
        [sesion.id_usuario]
      );
      if (!grupoTecnico) return NextResponse.json({ error: "El técnico no tiene un grupo resolutor activo." }, { status: 403 });
      idDepartamentoFinal = Number(grupoTecnico.id_departamento);
      if (id_departamento && Number(id_departamento) !== idDepartamentoFinal) {
        return NextResponse.json({ error: "Solo puedes registrar problemas para tu grupo resolutor." }, { status: 403 });
      }
    } else {
      const gruposSupervisor = await query<{ id_departamento: number }>(
        "SELECT id_departamento FROM departamento_ti WHERE id_supervisor = $1 AND estado_registro = true ORDER BY id_departamento",
        [sesion.id_usuario]
      );
      if (id_departamento) {
        idDepartamentoFinal = Number(id_departamento);
        if (!gruposSupervisor.some((d) => Number(d.id_departamento) === idDepartamentoFinal)) {
          return NextResponse.json({ error: "Solo puedes registrar problemas para grupos que supervisas." }, { status: 403 });
        }
      } else if (gruposSupervisor[0]) {
        idDepartamentoFinal = Number(gruposSupervisor[0].id_departamento);
      } else {
        return NextResponse.json({ error: "No tienes un grupo de TI asignado para registrar el problema." }, { status: 403 });
      }
    }

    if (!titulo || !descripcion) {
      return NextResponse.json({ error: "Título y descripción son obligatorios para el Problema." }, { status: 400 });
    }

    if (id_ticket_origen) {
      const ticketDelGrupo = await queryRow<{ existe: boolean }>(
        "SELECT EXISTS (SELECT 1 FROM ticket WHERE id_ticket = $1 AND id_departamento = $2 AND estado_registro = true) AS existe",
        [id_ticket_origen, idDepartamentoFinal]
      );
      if (!ticketDelGrupo?.existe) {
        return NextResponse.json({ error: "El incidente de origen debe pertenecer al mismo grupo resolutor del problema." }, { status: 400 });
      }
    }

    const year = new Date().getFullYear();
    const countRow = await queryRow<{ c: string }>(
      "SELECT COUNT(*) as c FROM problema WHERE EXTRACT(YEAR FROM fecha_creacion) = $1",
      [year]
    );
    const correlativo = String((parseInt(countRow?.c || "0", 10) + 1)).padStart(4, "0");
    const codigo_problema = `PRB-${year}-${correlativo}`;

    const insertSql = `
      INSERT INTO problema (
        codigo_problema,
        titulo,
        descripcion,
        id_impacto,
        id_urgencia,
        id_prioridad,
        id_estado,
        metodo_analisis,
        id_ci_afectado,
        id_usuario_asignado,
        id_departamento,
        usuario_creacion
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 1, $7, $8, $9, $10, $11
      ) RETURNING id_problema, codigo_problema
    `;

    const row = await queryRow<{ id_problema: number; codigo_problema: string }>(insertSql, [
      codigo_problema,
      titulo,
      descripcion,
      id_impacto || 2,
      id_urgencia || 2,
      id_prioridad || 2,
      metodo_analisis || "5_WHYS",
      id_ci_afectado || null,
      sesion.id_usuario,
      idDepartamentoFinal,
      sesion.id_usuario
    ]);

    const idProblema = row?.id_problema;

    // Si viene originado de un ticket, asociarlo
    if (idProblema && id_ticket_origen) {
      await query(
        `INSERT INTO problema_incidente (id_problema, id_ticket) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [idProblema, id_ticket_origen]
      );
      await query(
        `UPDATE ticket SET id_problema = $1 WHERE id_ticket = $2`,
        [idProblema, id_ticket_origen]
      );
    }

    return NextResponse.json({
      mensaje: "Problema ITIL registrado exitosamente.",
      id_problema: idProblema,
      codigo_problema: row?.codigo_problema
    }, { status: 201 });
  } catch (error) {
    console.error("Error al registrar problema:", error);
    return NextResponse.json({ error: "Error al registrar el problema" }, { status: 500 });
  }
}
