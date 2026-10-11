import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (![1, 2, 4, 6, 7, 8, 9, 10].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "Este perfil no puede consultar solicitudes de cambio." }, { status: 403 });
  }

  const id = params.id;
  const idCambio = parseInt(id, 10);
  if (isNaN(idCambio)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const cambioSql = `
      SELECT 
        c.id_cambio,
        c.codigo_cambio,
        c.titulo,
        c.descripcion,
        c.tipo_cambio,
        c.id_impacto,
        it.nombre AS impacto_nombre,
        c.id_urgencia,
        ut.nombre AS urgencia_nombre,
        c.id_prioridad,
        pt.nombre AS prioridad_nombre,
        c.id_estado,
        CASE c.id_estado
          WHEN 1 THEN 'Registrado'
          WHEN 2 THEN 'Evaluación CAB'
          WHEN 3 THEN 'Aprobado'
          WHEN 4 THEN 'En Planificación'
          WHEN 5 THEN 'En Ejecución'
          WHEN 6 THEN 'Exitoso'
          WHEN 7 THEN 'Fallido'
          WHEN 8 THEN 'Cancelado'
          ELSE 'Desconocido'
        END AS estado_nombre,
        c.justificacion,
        c.plan_implementacion,
        c.plan_rollback,
        c.plan_pruebas,
        c.ventana_inicio,
        c.ventana_fin,
        c.id_ci_afectado,
        ci.codigo_ci,
        ci.nombre AS ci_nombre,
        c.id_problema_origen,
        p.codigo_problema,
        c.id_incidente_origen,
        t.codigo_ticket AS incidente_codigo,
        c.id_usuario_solicitante,
        CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante_nombre,
        us.correo_electronico AS solicitante_email,
        c.id_usuario_responsable,
        CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS responsable_nombre,
        c.resultado_pir,
        c.incidentes_inducidos,
        c.campos_adicionales,
        c.fecha_creacion
      FROM cambio c
      LEFT JOIN impacto_ticket it ON c.id_impacto = it.id_impacto
      LEFT JOIN urgencia_ticket ut ON c.id_urgencia = ut.id_urgencia
      LEFT JOIN prioridad_ticket pt ON c.id_prioridad = pt.id_prioridad
      LEFT JOIN elemento_configuracion ci ON c.id_ci_afectado = ci.id_ci
      LEFT JOIN problema p ON c.id_problema_origen = p.id_problema
      LEFT JOIN ticket t ON c.id_incidente_origen = t.id_ticket
      LEFT JOIN usuario us ON c.id_usuario_solicitante = us.id_usuario
      LEFT JOIN usuario ur ON c.id_usuario_responsable = ur.id_usuario
      WHERE c.id_cambio = $1 AND c.estado_registro = true
    `;

    const cambio = await queryRow(cambioSql, [idCambio]);
    if (!cambio) {
      return NextResponse.json({ error: "Cambio no encontrado" }, { status: 404 });
    }
    if (sesion.perfilActivo?.id_perfil === 2 && (cambio as any).id_usuario_solicitante !== sesion.id_usuario) {
      return NextResponse.json({ error: "Solo puedes consultar las RFC que registraste." }, { status: 403 });
    }
    if (sesion.perfilActivo?.id_perfil === 4) {
      const dentroDelEquipo = await queryRow<{ existe: boolean }>(
        `SELECT EXISTS (
          SELECT 1 FROM cambio c
          JOIN usuario u ON u.id_usuario = c.id_usuario_solicitante
          JOIN departamento_ti d ON d.id_departamento = u.id_departamento
          WHERE c.id_cambio = $1 AND d.id_supervisor = $2 AND d.estado_registro = true
        ) AS existe`,
        [idCambio, sesion.id_usuario]
      );
      if (!dentroDelEquipo?.existe) return NextResponse.json({ error: "Cambio no encontrado." }, { status: 404 });
    }

    const aprobacionesSql = `
      SELECT 
        ca.id_cambio_aprobacion,
        ca.id_cambio,
        ca.id_usuario_aprobador,
        CONCAT(u.nombres, ' ', u.apellido_paterno) AS aprobador_nombre,
        ca.decision,
        ca.comentario,
        ca.fecha_decision
      FROM cambio_aprobacion ca
      JOIN usuario u ON ca.id_usuario_aprobador = u.id_usuario
      WHERE ca.id_cambio = $1 AND ca.estado_registro = true
      ORDER BY ca.fecha_decision DESC
    `;

    const aprobaciones = await query(aprobacionesSql, [idCambio]);

    return NextResponse.json({
      ...cambio,
      aprobaciones
    });
  } catch (error) {
    console.error("Error al obtener detalle del cambio:", error);
    return NextResponse.json({ error: "Error interno al obtener cambio" }, { status: 500 });
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
  if (![7, 8].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "Solo el Aprobador CAB o el Gestor de Cambios pueden modificar RFC." }, { status: 403 });
  }

  const id = params.id;
  const idCambio = parseInt(id, 10);
  if (isNaN(idCambio)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const cambioActual = await queryRow<{
      id_cambio: number;
      id_usuario_solicitante: number;
      id_usuario_responsable: number | null;
      id_estado: number;
      codigo_cambio: string;
    }>(
      "SELECT id_cambio, id_usuario_solicitante, id_usuario_responsable, id_estado, codigo_cambio FROM cambio WHERE id_cambio = $1 AND estado_registro = true",
      [idCambio]
    );

    if (!cambioActual) {
      return NextResponse.json({ error: "Cambio no encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const { decision, comentario, id_estado, resultado_pir, incidentes_inducidos } = body;

    // Caso A: Emisión de Voto en el Comité CAB
    if (decision) {
      // Solo el perfil oficial Aprobador CAB puede emitir votos.
      if (sesion.perfilActivo?.id_perfil !== 7) {
        return NextResponse.json(
          { error: "Solo el perfil Aprobador CAB puede emitir un voto." },
          { status: 403 }
        );
      }

      if (cambioActual.id_estado !== 2) {
        return NextResponse.json({ error: "La RFC no está en evaluación CAB." }, { status: 400 });
      }

      // 2. SoD Autoexclusión: El solicitante de la RFC NO puede votar su propia solicitud
      if (cambioActual.id_usuario_solicitante === sesion.id_usuario || cambioActual.id_usuario_responsable === sesion.id_usuario) {
        return NextResponse.json(
          { error: "Regla SoD: el solicitante o responsable de la RFC no puede votar sobre su propio cambio." },
          { status: 403 }
        );
      }

      const decisionUpper = (decision as string).toUpperCase();
      if (!["APROBADO", "RECHAZADO", "OBSERVADO"].includes(decisionUpper)) {
        return NextResponse.json({ error: "Decisión inválida. Use APROBADO, RECHAZADO u OBSERVADO." }, { status: 400 });
      }

      if (!comentario || comentario.trim().length === 0) {
        return NextResponse.json({ error: "El sustento o comentario técnico del voto CAB es obligatorio." }, { status: 400 });
      }

      const votoPrevio = await queryRow(
        "SELECT id_cambio_aprobacion FROM cambio_aprobacion WHERE id_cambio = $1 AND id_usuario_aprobador = $2 AND estado_registro = true",
        [idCambio, sesion.id_usuario]
      );
      if (votoPrevio) {
        return NextResponse.json({ error: "Ya registraste tu voto para esta RFC." }, { status: 409 });
      }

      const totalMiembros = await queryRow<{ total: string }>(
        "SELECT COUNT(DISTINCT up.id_usuario)::text AS total FROM usuario_perfiles up JOIN usuario u ON u.id_usuario = up.id_usuario WHERE up.id_perfil = 7 AND up.estado_registro = true AND u.estado_registro = true"
      );
      const cabCount = Number(totalMiembros?.total || 0);
      if (cabCount === 0) {
        return NextResponse.json({ error: "No hay miembros activos asignados al perfil Aprobador CAB." }, { status: 409 });
      }

      try {
        await query(
          `INSERT INTO cambio_aprobacion (id_cambio, id_usuario_aprobador, decision, comentario)
           VALUES ($1, $2, $3, $4)`,
          [idCambio, sesion.id_usuario, decisionUpper, comentario]
        );
      } catch (error: any) {
        if (error?.code === "23505") {
          return NextResponse.json({ error: "Ya registraste tu voto para esta RFC." }, { status: 409 });
        }
        throw error;
      }

      const votos = await query<{ decision: string; total: string }>(
        "SELECT decision, COUNT(*)::text AS total FROM cambio_aprobacion WHERE id_cambio = $1 AND estado_registro = true GROUP BY decision",
        [idCambio]
      );
      const quorum = Math.floor(cabCount / 2) + 1;
      const aprobados = Number(votos.find((v) => v.decision === "APROBADO")?.total || 0);
      const rechazados = Number(votos.find((v) => v.decision === "RECHAZADO")?.total || 0);
      let nuevoEstado = cambioActual.id_estado;
      if (aprobados >= quorum) nuevoEstado = 3;
      else if (rechazados >= quorum) nuevoEstado = 8;

      if (nuevoEstado !== cambioActual.id_estado) {
        await query(
          "UPDATE cambio SET id_estado = $1, usuario_modificacion = $2, fecha_modificacion = now() WHERE id_cambio = $3",
          [nuevoEstado, sesion.id_usuario, idCambio]
        );
      }

      return NextResponse.json({
        mensaje: `Voto ${decisionUpper} registrado exitosamente en el comité CAB.`,
        nuevo_estado: nuevoEstado
      });
    }

    // Solo Gestor de Cambios puede actualizar ejecución y revisión post-implementación.
    if (sesion.perfilActivo?.id_perfil !== 8) {
      return NextResponse.json({ error: "Solo el Gestor de Cambios puede actualizar el ciclo de vida y el PIR." }, { status: 403 });
    }
    const camposPermitidos = ["id_estado", "resultado_pir", "incidentes_inducidos"];
    if (Object.keys(body).some((campo) => !camposPermitidos.includes(campo))) {
      return NextResponse.json({ error: "La RFC contiene campos que no se pueden modificar." }, { status: 400 });
    }

    // Caso B: Actualización de estado del ciclo de vida o PIR (Post Implementation Review)
    const updates: string[] = ["usuario_modificacion = $1", "fecha_modificacion = now()"];
    const paramsUpdate: any[] = [sesion.id_usuario];
    let idx = 2;

    if (id_estado !== undefined) {
      const transicionesGestor: Record<number, number[]> = { 3: [4], 4: [5], 5: [6, 7] };
      const destino = Number(id_estado);
      if (!(transicionesGestor[cambioActual.id_estado] || []).includes(destino)) {
        return NextResponse.json({ error: "Transición de estado no permitida para esta RFC." }, { status: 400 });
      }
      updates.push(`id_estado = $${idx++}`);
      paramsUpdate.push(destino);
    }

    if (resultado_pir !== undefined) {
      updates.push(`resultado_pir = $${idx++}`);
      paramsUpdate.push(resultado_pir);
    }

    if (incidentes_inducidos !== undefined) {
      updates.push(`incidentes_inducidos = $${idx++}`);
      paramsUpdate.push(incidentes_inducidos);
    }

    paramsUpdate.push(idCambio);
    await query(`UPDATE cambio SET ${updates.join(", ")} WHERE id_cambio = $${idx}`, paramsUpdate);

    return NextResponse.json({ mensaje: "Cambio actualizado exitosamente." });
  } catch (error) {
    console.error("Error al actualizar cambio:", error);
    return NextResponse.json({ error: "Error interno al actualizar el cambio" }, { status: 500 });
  }
}
