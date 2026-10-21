import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { query, queryRow, transaccion } from "@/shared/lib/db";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/aprobaciones
 * Consulta las solicitudes pendientes de visto bueno institucional para el usuario en sesión.
 * Cumple con RN-32 (SoD Autoexclusión) y RN-33 (Jurisdicción Departamental).
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.SOLICITUDES_APROBAR)) {
    return NextResponse.json(
      { error: "No tienes autorización para consultar la bandeja de aprobaciones de negocio." },
      { status: 403 }
    );
  }

  const idPerfil = sesion.perfilActivo?.id_perfil || 0;

  try {
    const params: any[] = [];
    let filtroJurisdiccion = "";

    // RN-33: Delimitación Departamental Estricta para Gestor de Área (Perfil 5)
    if (idPerfil === 5) {
      params.push(sesion.id_usuario);
      filtroJurisdiccion = `AND t.id_departamento_empresa = (
        SELECT id_departamento_empresa FROM usuario WHERE id_usuario = $1
      )`;
    }

    const sql = `
      SELECT 
        t.id_ticket,
        t.codigo_ticket,
        t.titulo,
        t.descripcion,
        t.id_tipo_ticket,
        t.id_categoria,
        t.id_impacto,
        t.id_urgencia,
        t.id_prioridad,
        t.id_estado,
        t.id_usuario_solicitante,
        t.id_departamento,
        t.id_departamento_empresa,
        t.fecha_creacion,
        t.fecha_limite_sla,
        ts.estado_aprobacion,
        ts.id_paso_actual,
        u.nombres || ' ' || u.apellido_paterno AS solicitante_nombre,
        u.correo_electronico AS solicitante_correo,
        c.nombre AS categoria_nombre,
        p.codigo AS prioridad_codigo,
        et.nombre AS estado_nombre,
        et.color AS estado_color,
        (t.id_usuario_solicitante = ${sesion.id_usuario}) AS es_solicitante_propietario,
        (t.id_usuario_solicitante != ${sesion.id_usuario}) AS puede_dictaminar
      FROM ticket t
      INNER JOIN ticket_solicitud ts ON ts.id_ticket = t.id_ticket
      INNER JOIN usuario u ON u.id_usuario = t.id_usuario_solicitante
      INNER JOIN categoria_ticket c ON c.id_categoria = t.id_categoria
      INNER JOIN prioridad_ticket p ON p.id_prioridad = t.id_prioridad
      INNER JOIN estado_ticket et ON et.id_estado = t.id_estado
      WHERE t.estado_registro = true
        AND ts.estado_aprobacion = 'PENDIENTE_APROBACION'
        ${filtroJurisdiccion}
      ORDER BY p.nivel ASC, t.fecha_creacion ASC
    `;

    const tickets = await query(sql, params);

    return NextResponse.json({
      tickets,
      total: tickets.length,
      id_usuario_actual: sesion.id_usuario,
    });
  } catch (err) {
    console.error("Error al obtener bandeja de aprobaciones:", err);
    return NextResponse.json(
      { error: "Error al consultar solicitudes pendientes de aprobación." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/aprobaciones
 * Registra formalmente el dictamen de APROBADO o RECHAZADO sobre una solicitud de servicio.
 * Aplica validación estricta de Segregación de Funciones (RN-32 SoD) y Jurisdicción (RN-33).
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.SOLICITUDES_APROBAR)) {
    return NextResponse.json(
      { error: "No tienes atribuciones para dictaminar requerimientos de negocio." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const idTicket = parseInt(body.id_ticket, 10);
    const decision = body.decision || body.decision_aprobacion;
    const comentario = (body.comentario || body.comentario_aprobacion || "").trim();

    if (!idTicket || isNaN(idTicket)) {
      return NextResponse.json({ error: "Identificador de ticket inválido." }, { status: 400 });
    }

    if (!["APROBADO", "RECHAZADO"].includes(decision)) {
      return NextResponse.json(
        { error: "La decisión debe ser 'APROBADO' o 'RECHAZADO'." },
        { status: 400 }
      );
    }

    // RN-21: Sustento Obligatorio ante Denegación de Solicitudes
    if (decision === "RECHAZADO" && comentario.length < 5) {
      return NextResponse.json(
        { error: "Debe registrar un sustento formal para la denegación (mínimo 5 caracteres)." },
        { status: 400 }
      );
    }

    // 1. Obtener ticket actual y validar estado
    const actual = await queryRow<{
      id_ticket: number;
      codigo_ticket: string;
      titulo: string;
      id_tipo_ticket: number;
      id_usuario_solicitante: number;
      id_departamento_empresa: number | null;
      id_estado: number;
      estado_aprobacion: string;
      id_paso_actual: number | null;
    }>(
      `SELECT 
        t.id_ticket,
        t.codigo_ticket,
        t.titulo,
        t.id_tipo_ticket,
        t.id_usuario_solicitante,
        t.id_departamento_empresa,
        t.id_estado,
        ts.estado_aprobacion,
        ts.id_paso_actual
      FROM ticket t
      INNER JOIN ticket_solicitud ts ON ts.id_ticket = t.id_ticket
      WHERE t.id_ticket = $1 AND t.estado_registro = true`,
      [idTicket]
    );

    if (!actual) {
      return NextResponse.json(
        { error: "La solicitud de servicio especificada no existe." },
        { status: 404 }
      );
    }

    if (actual.estado_aprobacion !== "PENDIENTE_APROBACION") {
      return NextResponse.json(
        { error: `La solicitud ya se encuentra en estado de aprobación '${actual.estado_aprobacion}'.` },
        { status: 409 }
      );
    }

    // 2. BLINDAJE SoD - Autoexclusión Estricta (RN-32 / ISO 27001 / ITIL 4)
    if (actual.id_usuario_solicitante === sesion.id_usuario) {
      return NextResponse.json(
        {
          error: "Violación de Segregación de Funciones (SoD / ISO 27001 - RN-32): El solicitante titular no puede dictaminar su propio requerimiento.",
          codigo: "SOD_AUTOEXCLUSION_VIOLADA",
        },
        { status: 403 }
      );
    }

    // 3. BLINDAJE SoD - Delimitación Departamental (RN-33)
    const idPerfil = sesion.perfilActivo?.id_perfil || 0;
    if (idPerfil === 5) {
      const gestor = await queryRow<{ id_departamento_empresa: number | null }>(
        "SELECT id_departamento_empresa FROM usuario WHERE id_usuario = $1",
        [sesion.id_usuario]
      );

      if (!gestor?.id_departamento_empresa || gestor.id_departamento_empresa !== actual.id_departamento_empresa) {
        return NextResponse.json(
          {
            error: "Violación de Jurisdicción Departamental (RN-33): Como Gestor de Área, solo puedes dictaminar requerimientos correspondientes a tu propio departamento.",
            codigo: "JURISDICCION_DEPARTAMENTAL_INVALIDA",
          },
          { status: 403 }
        );
      }
    }

    // 4. Ejecución atómica del dictamen
    const resultado = await transaccion(async (client) => {
      const comentarioAprob = comentario || `Decisión de aprobación: ${decision} por ${sesion.nombres}.`;

      // 4.1 Registrar auditoría formal en ticket_aprobacion
      await client.query(
        `INSERT INTO ticket_aprobacion (
          id_ticket, id_usuario_aprobador, id_paso_workflow, estado_decision, comentario
        ) VALUES ($1, $2, $3, $4, $5)`,
        [idTicket, sesion.id_usuario, actual.id_paso_actual, decision, comentarioAprob]
      );

      // 4.2 Actualizar tabla de extensión ticket_solicitud
      await client.query(
        `UPDATE ticket_solicitud
         SET estado_aprobacion = $1
         WHERE id_ticket = $2`,
        [decision, idTicket]
      );

      // 4.3 Actualizar estado de ticket: 2 (Asignado/Listo para TI) si aprobó, 7 (Cancelado/Rechazado) si rechazó
      const nuevoEstadoTicket = decision === "APROBADO" ? 2 : 7;
      await client.query(
        `UPDATE ticket
         SET id_estado = $1,
             usuario_modificacion = $2,
             fecha_modificacion = now()
         WHERE id_ticket = $3`,
        [nuevoEstadoTicket, sesion.id_usuario, idTicket]
      );

      // 4.4 Bitácora de trazabilidad en comentario_ticket
      const notaTrazabilidad = decision === "APROBADO"
        ? `Solicitud autorizada formalmente por la Jefatura de Área (${sesion.nombres}). Derivada a la Mesa de TI para atención técnica.`
        : `Solicitud denegada formalmente por la Jefatura de Área (${sesion.nombres}). Motivo: ${comentario}`;

      await client.query(
        `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno, id_estado_cambiado)
         VALUES ($1, $2, $3, false, $4)`,
        [idTicket, sesion.id_usuario, notaTrazabilidad, nuevoEstadoTicket]
      );

      return {
        id_ticket: idTicket,
        decision,
        nuevo_estado_ticket: nuevoEstadoTicket,
      };
    });

    return NextResponse.json({
      ok: true,
      mensaje: decision === "APROBADO"
        ? "Requerimiento aprobado satisfactoriamente y derivado a la Mesa de TI."
        : "Requerimiento denegado y notificado al solicitante.",
      resultado,
    });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al procesar dictamen de aprobación:", err);
    const { error, status } = respuestaError(err, "Error al registrar la decisión de aprobación.");
    return NextResponse.json({ error }, { status });
  }
}
