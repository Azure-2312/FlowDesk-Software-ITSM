import { query, queryRow } from "@/shared/lib/db";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio } from "@/shared/lib/errores";
import { Ticket, ComentarioTicket, ActualizarTicketPayload, TicketAprobacion, AdjuntoTicket } from "@/types";

export async function obtenerDetalleTicket(sesion: any, idTicket: number) {
  const sqlTicket = `
    SELECT 
      t.id_ticket,
      t.codigo_ticket,
      t.titulo,
      t.descripcion,
      t.id_tipo_ticket,
      tt.nombre as tipo_nombre,
      tt.codigo as tipo_codigo,
      t.id_categoria,
      cat.nombre as categoria_nombre,
      t.id_servicio,
      s.nombre as servicio_nombre,
      s.codigo_servicio as servicio_codigo,
      s.requiere_aprobacion as servicio_requiere_aprobacion,
      t.id_departamento,
      t.id_departamento_empresa,
      dep.nombre as departamento_nombre,
      dep.codigo as departamento_codigo,
      t.canal_comunicacion,
      t.estado_aprobacion,
      t.id_paso_actual,
      swp.nombre_paso as paso_actual_nombre,
      t.categoria_resolucion,
      t.calificacion_csat,
      t.comentario_csat,
      t.fecha_csat,
      t.tiempo_pausado_minutos,
      t.fecha_ultima_pausa,
      t.id_impacto,
      imp.nombre as impacto_nombre,
      imp.nivel as impacto_nivel,
      t.id_urgencia,
      urg.nombre as urgencia_nombre,
      urg.nivel as urgencia_nivel,
      t.id_prioridad,
      prio.codigo as prioridad_codigo,
      prio.nombre as prioridad_nombre,
      prio.color as prioridad_color,
      prio.tiempo_resolucion_horas,
      t.id_estado,
      et.codigo as estado_codigo,
      et.nombre as estado_nombre,
      et.color as estado_color,
      et.pausa_sla,
      et.es_terminal,
      t.id_motivo_espera,
      me.nombre as motivo_espera_nombre,
      t.id_usuario_solicitante,
      CONCAT(us.nombres, ' ', us.apellido_paterno) as solicitante_nombre,
      us.correo_electronico as solicitante_correo,
      t.id_usuario_asignado,
      CONCAT(ua.nombres, ' ', ua.apellido_paterno) as tecnico_nombre,
      ua.correo_electronico as tecnico_correo,
      t.solucion_aplicada,
      t.motivo_cancelacion,
      t.fecha_limite_sla,
      t.fecha_limite_respuesta_sla,
      t.fecha_primera_respuesta,
      t.fecha_resolucion,
      t.fecha_cierre,
      t.sla_cumplido,
      t.fecha_creacion,
      t.fecha_modificacion,
      t.campos_adicionales,
      t.id_problema,
      p.codigo_problema,
      p.titulo as problema_titulo,
      t.id_ci,
      ci.codigo_ci,
      ci.nombre as ci_nombre,
      t.fecha_reapertura,
      t.motivo_reapertura,
      COALESCE(t.conteo_reaperturas, 0) as conteo_reaperturas,
      t.estado_registro
    FROM vista_ticket t
    INNER JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket
    INNER JOIN categoria_ticket cat ON cat.id_categoria = t.id_categoria
    LEFT JOIN servicio_catalogo s ON s.id_servicio = t.id_servicio
    LEFT JOIN departamento_ti dep ON dep.id_departamento = t.id_departamento
    LEFT JOIN servicio_workflow_paso swp ON swp.id_paso = t.id_paso_actual
    INNER JOIN impacto_ticket imp ON imp.id_impacto = t.id_impacto
    INNER JOIN urgencia_ticket urg ON urg.id_urgencia = t.id_urgencia
    INNER JOIN prioridad_ticket prio ON prio.id_prioridad = t.id_prioridad
    INNER JOIN estado_ticket et ON et.id_estado = t.id_estado
    LEFT JOIN motivo_espera_ticket me ON me.id_motivo_espera = t.id_motivo_espera
    INNER JOIN usuario us ON us.id_usuario = t.id_usuario_solicitante
    LEFT JOIN usuario ua ON ua.id_usuario = t.id_usuario_asignado
    LEFT JOIN problema p ON p.id_problema = t.id_problema
    LEFT JOIN elemento_configuracion ci ON ci.id_ci = t.id_ci
    WHERE t.id_ticket = $1 AND t.estado_registro = true
  `;

  const ticket = await queryRow<Ticket>(sqlTicket, [idTicket]);

  if (!ticket) {
    throw new ErrorDominio("Ticket no encontrado", 404);
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  let autorizado = false;
  if ([1, 4, 6].includes(idPerfil || 0)) {
    autorizado = true;
  } else if (idPerfil === 3) {
    autorizado = ticket.id_usuario_solicitante === sesion.id_usuario;
  } else if (idPerfil === 2) {
    const asignacion = await queryRow<{ id_departamento: number }>(
      "SELECT id_departamento FROM tecnico_detalle WHERE id_usuario = $1 AND estado_registro = true",
      [sesion.id_usuario]
    );
    autorizado = ticket.id_usuario_asignado === sesion.id_usuario ||
      (!!asignacion && ticket.id_departamento === asignacion.id_departamento);
  } else if (idPerfil === 5) {
    const gestor = await queryRow<{ id_departamento_empresa: number | null }>(
      "SELECT id_departamento_empresa FROM usuario WHERE id_usuario = $1 AND estado_registro = true",
      [sesion.id_usuario]
    );
    autorizado = !!gestor?.id_departamento_empresa && ticket.id_departamento_empresa === gestor.id_departamento_empresa;
  }
  if (idPerfil === 4 && autorizado) {
    const supervisaDepartamento = await queryRow<{ existe: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM departamento_ti
         WHERE id_departamento = $1 AND id_supervisor = $2 AND estado_registro = true
       ) AS existe`,
      [ticket.id_departamento, sesion.id_usuario]
    );
    autorizado = supervisaDepartamento?.existe === true;
  }
  if (!autorizado) {
    throw new ErrorDominio("No tienes permiso para ver este ticket", 403);
  }
  const userRow = await queryRow<{ nivel_prioridad: number }>(
    "SELECT COALESCE(nivel_prioridad, 5) AS nivel_prioridad FROM usuario WHERE id_usuario = $1",
    [sesion.id_usuario]
  );
  const esPersonalTI = [1, 2, 4, 6, 8, 9, 10].includes(idPerfil || 0);
  const esPrioridadEjecutivaOVip = Number(userRow?.nivel_prioridad || 5) <= 2;
  const puedeVerNotasInternas = esPersonalTI || esPrioridadEjecutivaOVip;

  // Calcular SLA restante
  const ahora = Date.now();
  const limiteMs = new Date(ticket.fecha_limite_sla).getTime();
  const minutosRestantes = Math.round((limiteMs - ahora) / 60000);
  const slaVencido = !ticket.es_terminal && minutosRestantes < 0;

  ticket.minutos_restantes_sla = minutosRestantes;
  ticket.sla_vencido = slaVencido;

  // Obtener comentarios
  let sqlComentarios = `
    SELECT 
      c.id_comentario,
      c.id_ticket,
      c.id_usuario,
      CONCAT(u.nombres, ' ', u.apellido_paterno) as usuario_nombre,
      u.correo_electronico as usuario_correo,
      c.comentario,
      c.es_interno,
      c.id_estado_cambiado,
      et.nombre as estado_nombre,
      c.fecha_creacion,
      c.estado_registro
    FROM comentario_ticket c
    INNER JOIN usuario u ON u.id_usuario = c.id_usuario
    LEFT JOIN estado_ticket et ON et.id_estado = c.id_estado_cambiado
    WHERE c.id_ticket = $1 AND c.estado_registro = true
  `;

  if (!puedeVerNotasInternas) {
    sqlComentarios += " AND c.es_interno = false";
  }

  sqlComentarios += " ORDER BY c.fecha_creacion ASC";

  const comentarios = await query<ComentarioTicket>(sqlComentarios, [idTicket]);

  // Obtener historial de aprobaciones jerárquicas
  const sqlAprobaciones = `
    SELECT 
      ta.id_ticket_aprobacion,
      ta.id_ticket,
      ta.id_usuario_aprobador,
      CONCAT(u.nombres, ' ', u.apellido_paterno) as aprobador_nombre,
      u.correo_electronico as aprobador_correo,
      ta.id_paso_workflow,
      ta.estado_decision,
      ta.comentario,
      ta.fecha_decision,
      ta.estado_registro
    FROM ticket_aprobacion ta
    INNER JOIN usuario u ON u.id_usuario = ta.id_usuario_aprobador
    WHERE ta.id_ticket = $1 AND ta.estado_registro = true
    ORDER BY ta.fecha_decision ASC
  `;

  const aprobaciones = await query<TicketAprobacion>(sqlAprobaciones, [idTicket]);
  ticket.aprobaciones = aprobaciones;

  // Obtener evidencias técnicas y archivos adjuntos
  const sqlAdjuntos = `
    SELECT 
      a.id_adjunto,
      a.id_ticket,
      a.nombre_archivo,
      a.tipo_mime,
      a.tamano_bytes,
      a.datos_base64,
      a.id_usuario_subio,
      CONCAT(u.nombres, ' ', u.apellido_paterno) as usuario_nombre,
      a.fecha_creacion
    FROM adjunto_ticket a
    INNER JOIN usuario u ON u.id_usuario = a.id_usuario_subio
    WHERE a.id_ticket = $1 AND a.estado_registro = true
    ORDER BY a.fecha_creacion ASC
  `;

  const adjuntos = await query<AdjuntoTicket>(sqlAdjuntos, [idTicket]);
  ticket.adjuntos = adjuntos;

  return { ticket, comentarios };
}

export async function actualizarTicket(sesion: any, idTicket: number, body: ActualizarTicketPayload) {
  const actual = await queryRow<any>(
    "SELECT * FROM vista_ticket WHERE id_ticket = $1 AND estado_registro = true",
    [idTicket]
  );

  if (!actual) {
    throw new ErrorDominio("Ticket no encontrado", 404);
  }

  const idPerfilActivo = sesion.perfilActivo.id_perfil;
  const esAdmin = idPerfilActivo === 1;
  const esTecnico = idPerfilActivo === 2;
  const esSolicitante = idPerfilActivo === 3;
  const esSupervisor = idPerfilActivo === 4;
  const esGestorArea = idPerfilActivo === 5;
  const esSupervisorOAdmin = esSupervisor || esAdmin;

  if (esSupervisor) {
    const supervisaDepartamento = await queryRow<{ existe: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM departamento_ti
         WHERE id_departamento = $1 AND id_supervisor = $2 AND estado_registro = true
       ) AS existe`,
      [actual.id_departamento, sesion.id_usuario]
    );
    if (!supervisaDepartamento?.existe) {
      throw new ErrorDominio("El ticket no pertenece a un departamento de TI bajo tu supervisión.", 403);
    }
  }

  // 1. GESTIÓN DE COMPUERTA DE APROBACIÓN (ITIL 4 / SOX / ISO 27001)
  if (body.decision_aprobacion) {
    if (!sesionTieneCapacidad(sesion, CAPACIDADES.SOLICITUDES_APROBAR)) {
      throw new ErrorDominio("Solo el Gestor de Área puede resolver aprobaciones de negocio.", 403);
    }
    if (actual.id_tipo_ticket !== 2) {
      throw new ErrorDominio("Solo las solicitudes tienen compuerta de aprobación.");
    }
    if (actual.estado_aprobacion !== "PENDIENTE_APROBACION" || !["APROBADO", "RECHAZADO"].includes(body.decision_aprobacion)) {
      throw new ErrorDominio("La solicitud no está pendiente o la decisión no es válida.");
    }

    // Principio SoD (ISO 27001 / ITIL 4): Autoexclusión estricta de aprobador titular
    if (actual.id_usuario_solicitante === sesion.id_usuario) {
      throw new ErrorDominio(
        "Violación de Segregación de Funciones (SoD / ISO 27001): El solicitante titular no puede dictaminar su propio requerimiento.",
        403
      );
    }

    // Principio SoD por Departamento (ISO 27001): El Gestor de Área solo puede dictaminar tickets de su propia área
    if (idPerfilActivo === 5) {
      const gestor = await queryRow<{ id_departamento_empresa: number | null }>(
        "SELECT id_departamento_empresa FROM usuario WHERE id_usuario = $1",
        [sesion.id_usuario]
      );
      if (!gestor?.id_departamento_empresa || gestor.id_departamento_empresa !== actual.id_departamento_empresa) {
        throw new ErrorDominio(
          "Violación de Segregación de Funciones (SoD): Como Gestor de Área, solo puedes aprobar requerimientos correspondientes a tu propio departamento.",
          403
        );
      }
    }

    const decision = body.decision_aprobacion;
    if (decision === "RECHAZADO" && (!body.comentario_aprobacion || body.comentario_aprobacion.trim().length < 5)) {
      throw new ErrorDominio("Indica el motivo del rechazo (mínimo 5 caracteres).");
    }
    const comentarioAprob = body.comentario_aprobacion?.trim() || `Decisión de aprobación: ${decision}`;

    // Registrar en ticket_aprobacion
    await query(
      `INSERT INTO ticket_aprobacion (
        id_ticket, id_usuario_aprobador, id_paso_workflow, estado_decision, comentario
      ) VALUES ($1, $2, $3, $4, $5)`,
      [idTicket, sesion.id_usuario, actual.id_paso_actual, decision, comentarioAprob]
    );

    let nuevoEstadoAprob = decision === "APROBADO" ? "APROBADO" : "RECHAZADO";
    let nuevoEstadoTicket = actual.id_estado;
    let notaDecision = `Compuerta de aprobación ${decision} por ${sesion.nombres}.`;
    if (body.comentario_aprobacion?.trim()) {
      notaDecision += ` Nota: ${body.comentario_aprobacion.trim()}`;
    }

    // Si fue rechazado, cancela el requerimiento
    if (decision === "RECHAZADO") {
      nuevoEstadoTicket = 7; // CANCELADO
    }

    await query(
      `UPDATE ticket_solicitud SET estado_aprobacion = $1 WHERE id_ticket = $2`,
      [nuevoEstadoAprob, idTicket]
    );

    await query(
      `UPDATE ticket SET
        id_estado = $1,
        usuario_modificacion = $2,
        fecha_modificacion = now()
       WHERE id_ticket = $3`,
      [nuevoEstadoTicket, sesion.id_usuario, idTicket]
    );

    await query(
      `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno, id_estado_cambiado)
       VALUES ($1, $2, $3, false, $4)`,
      [idTicket, sesion.id_usuario, notaDecision, nuevoEstadoTicket !== actual.id_estado ? nuevoEstadoTicket : null]
    );

    const ticketActualizado = await queryRow("SELECT * FROM vista_ticket WHERE id_ticket = $1", [idTicket]);
    return { ticket: ticketActualizado };
  }

  // 2. EVALUACIÓN DE SATISFACCIÓN CSAT (ITIL 4 / ISO 20000)
  if (body.calificacion_csat !== undefined) {
    if (!esSolicitante || actual.id_usuario_solicitante !== sesion.id_usuario || actual.id_estado !== 5 || actual.calificacion_csat != null) {
      throw new ErrorDominio("Solo el titular puede calificar una vez un ticket resuelto.", 403);
    }

    const estrellas = Math.max(1, Math.min(5, Math.round(body.calificacion_csat)));
    const comentCsat = body.comentario_csat?.trim() || null;

    await query(
      `UPDATE ticket SET
        calificacion_csat = $1,
        comentario_csat = $2,
        fecha_csat = now(),
        usuario_modificacion = $3,
        fecha_modificacion = now()
       WHERE id_ticket = $4`,
      [estrellas, comentCsat, sesion.id_usuario, idTicket]
    );

    await query(
      `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno)
       VALUES ($1, $2, $3, false)`,
      [
        idTicket,
        sesion.id_usuario,
        `Encuesta CSAT enviada por el usuario: ${estrellas} de 5 estrellas.${comentCsat ? ` Comentario: "${comentCsat}"` : ""}`,
      ]
    );

    const ticketActualizado = await queryRow("SELECT * FROM vista_ticket WHERE id_ticket = $1", [idTicket]);
    return { ticket: ticketActualizado };
  }

  // 3. REGLAS DE SEGREGACIÓN DE FUNCIONES (SoD) PARA ASIGNACIÓN
  if (esSolicitante) {
    const camposPermitidos = ["id_estado", "es_reapertura", "motivo_reapertura"];
    if (Object.keys(body).some((campo) => !camposPermitidos.includes(campo))) {
      throw new ErrorDominio("El solicitante solo puede confirmar el cierre o pedir reapertura.", 403);
    }
  } else if (esTecnico) {
    const camposPermitidos = ["id_usuario_asignado", "id_estado", "id_motivo_espera", "solucion_aplicada", "categoria_resolucion", "nota_cambio", "es_nota_interna", "es_reapertura", "motivo_reapertura", "id_problema", "id_ci"];
    if (Object.keys(body).some((campo) => !camposPermitidos.includes(campo))) {
      throw new ErrorDominio("El técnico no puede modificar campos de gobierno o despacho.", 403);
    }
  } else if (esSupervisor || esAdmin) {
    const camposPermitidos = ["id_usuario_asignado", "id_departamento", "id_paso_actual", "id_estado", "id_motivo_espera", "solucion_aplicada", "categoria_resolucion", "motivo_cancelacion", "nota_cambio", "es_nota_interna", "id_problema", "id_ci", "es_reapertura", "motivo_reapertura"];
    if (Object.keys(body).some((campo) => !camposPermitidos.includes(campo))) {
      throw new ErrorDominio("No se pueden modificar campos fuera de la operación del ticket.", 403);
    }
  } else {
    throw new ErrorDominio("Este perfil no está autorizado para operar tickets.", 403);
  }

  if (body.id_paso_actual !== undefined && actual.id_tipo_ticket !== 2) {
    throw new ErrorDominio("El paso de workflow solo aplica a solicitudes.");
  }
  if (body.id_problema !== undefined && actual.id_tipo_ticket !== 1) {
    throw new ErrorDominio("Solo los incidentes pueden vincularse a un problema.");
  }

  if (body.id_usuario_asignado !== undefined && body.id_usuario_asignado !== actual.id_usuario_asignado) {
    if (esTecnico) {
      if (actual.id_usuario_asignado !== null || body.id_usuario_asignado !== sesion.id_usuario) {
        throw new ErrorDominio(
          "Un técnico no puede asignar tickets a otros especialistas. Solo puede tomar tickets sin asignar para sí mismo.",
          403
        );
      }
      const tecnico = await queryRow<{ id_departamento: number }>(
        "SELECT id_departamento FROM tecnico_detalle WHERE id_usuario = $1 AND estado_registro = true",
        [sesion.id_usuario]
      );
      if (!tecnico || tecnico.id_departamento !== actual.id_departamento) {
        throw new ErrorDominio("Solo puedes tomar tickets de tu departamento técnico.", 403);
      }
    } else if (!esSupervisorOAdmin) {
      throw new ErrorDominio(
        "Solo los supervisores o administradores tienen autorización para asignar o transferir técnicos",
        403
      );
    }
  }

  // 4. REGLAS DE OPERACIÓN PARA TÉCNICOS Y SOLICITANTES
  if (esTecnico) {
    const tecnicoEfectivo = body.id_usuario_asignado !== undefined ? body.id_usuario_asignado : actual.id_usuario_asignado;
    if (tecnicoEfectivo !== sesion.id_usuario) {
      throw new ErrorDominio(
        "No tienes permiso para operar sobre este ticket porque está asignado a otro especialista",
        403
      );
    }
  }

  if (body.id_estado !== undefined) {
    const estadoDestino = Number(body.id_estado);
    const transicionesTecnico: Record<number, number[]> = { 1: [3], 2: [3], 3: [4, 5], 4: [3] };
    const transicionesSupervisor: Record<number, number[]> = { ...transicionesTecnico, 1: [2, 3, 7], 2: [3, 7], 3: [4, 5, 7], 4: [3, 7] };
    const permitidos = esTecnico ? transicionesTecnico[actual.id_estado] || [] : esSupervisor ? transicionesSupervisor[actual.id_estado] || [] : [];
    if (esSolicitante) {
      if (!(actual.id_estado === 5 && estadoDestino === 6)) {
        throw new ErrorDominio("Transición no permitida para el solicitante.", 403);
      }
    } else if (!permitidos.includes(estadoDestino)) {
      throw new ErrorDominio("Transición de estado no permitida para este perfil.", 403);
    }
  }

  const esAccionReapertura = body.es_reapertura === true || Boolean(body.motivo_reapertura && (body.id_estado === 3 || body.id_estado === 2));

  if (esSolicitante) {
    if (actual.id_usuario_solicitante !== sesion.id_usuario) {
      throw new ErrorDominio("No tienes permiso para modificar este ticket", 403);
    }

    if (esAccionReapertura) {
      // Regla ITIL v4: Reapertura permitida únicamente en estado Resuelto (5) y dentro de 48 horas
      if (actual.id_estado !== 5) {
        throw new ErrorDominio(
          "Solo se puede reabrir un ticket cuando está en estado 'Resuelto'. Los tickets cerrados definitivamente requieren una nueva solicitud."
        );
      }

      if (!body.motivo_reapertura || body.motivo_reapertura.trim().length < 8) {
        throw new ErrorDominio("Debe indicar obligatoriamente el motivo de reapertura (mínimo 8 caracteres).");
      }

      if (actual.fecha_resolucion) {
        const horasDesdeResolucion = (Date.now() - new Date(actual.fecha_resolucion).getTime()) / (1000 * 60 * 60);
        if (horasDesdeResolucion > 48) {
          throw new ErrorDominio(
            "La ventana de reapertura (48 horas posteriores a la resolución) ha expirado. Por favor, registre un nuevo ticket de soporte."
          );
        }
      }
    } else if (body.id_estado !== 6 || actual.id_estado !== 5) {
      throw new ErrorDominio(
        "El solicitante únicamente puede confirmar y cerrar un ticket resuelto, o solicitar su reapertura dentro de las 48 horas.",
        403
      );
    }
  }

  let nuevoEstado = body.id_estado !== undefined ? body.id_estado : actual.id_estado;
  let nuevoAsignado = body.id_usuario_asignado !== undefined ? body.id_usuario_asignado : actual.id_usuario_asignado;
  let nuevoDepto = body.id_departamento !== undefined ? body.id_departamento : actual.id_departamento;
  let nuevoPasoActual = body.id_paso_actual !== undefined ? body.id_paso_actual : actual.id_paso_actual;
  let nuevoMotivoEspera = body.id_motivo_espera !== undefined ? body.id_motivo_espera : actual.id_motivo_espera;
  let nuevaSolucion = body.solucion_aplicada !== undefined ? body.solucion_aplicada : actual.solucion_aplicada;
  let nuevaCategoriaResolucion = body.categoria_resolucion !== undefined ? body.categoria_resolucion : actual.categoria_resolucion;
  let nuevoMotivoCancelacion = body.motivo_cancelacion !== undefined ? body.motivo_cancelacion : actual.motivo_cancelacion;

  let fechaPrimeraRespuesta = actual.fecha_primera_respuesta;
  let fechaResolucion = actual.fecha_resolucion;
  let fechaCierre = actual.fecha_cierre;
  let slaCumplido = actual.sla_cumplido;
  let tiempoPausado = actual.tiempo_pausado_minutos || 0;
  let fechaUltimaPausa = actual.fecha_ultima_pausa;
  let fechaLimiteSla = actual.fecha_limite_sla;
  let fechaReapertura = actual.fecha_reapertura;
  let motivoReapertura = actual.motivo_reapertura;
  let conteoReaperturas = actual.conteo_reaperturas || 0;

  if (esAccionReapertura) {
    nuevoEstado = 3; // Regresa a EN PROCESO
    fechaReapertura = new Date().toISOString();
    motivoReapertura = body.motivo_reapertura?.trim() || "Reapertura solicitada";
    conteoReaperturas += 1;
  }

  // Regla ITIL: Si se asigna técnico por primera vez y estaba Abierto (1), pasa a Asignado (2)
  if (nuevoAsignado && !actual.id_usuario_asignado && nuevoEstado === 1) {
    nuevoEstado = 2; // ASIGNADO
  }

  // Regla ITIL: Al pasar a En Proceso (3), si no había primera respuesta, marcar now()
  if (nuevoEstado === 3 && !fechaPrimeraRespuesta) {
    fechaPrimeraRespuesta = new Date().toISOString();
  }

  // CONTROL EXACTO DE PAUSA Y REANUDACIÓN DE SLA
  if (nuevoEstado === 4) { // EN ESPERA
    if (!nuevoMotivoEspera) {
      throw new ErrorDominio(
        "Según ITIL 4, al pausar el ticket en 'En espera' es obligatorio seleccionar el motivo de pausa del SLA"
      );
    }
    if (actual.id_estado !== 4) {
      fechaUltimaPausa = new Date().toISOString();
    }
  } else {
    // Reanudar reloj de SLA si venía de En Espera (4)
    if (actual.id_estado === 4 && actual.fecha_ultima_pausa) {
      const msPausado = Date.now() - new Date(actual.fecha_ultima_pausa).getTime();
      const minPausados = Math.max(1, Math.round(msPausado / 60000));
      tiempoPausado += minPausados;

      // Extender fecha límite de SLA por los minutos que estuvo pausado
      const nuevaFechaLimiteMs = new Date(fechaLimiteSla).getTime() + minPausados * 60000;
      fechaLimiteSla = new Date(nuevaFechaLimiteMs).toISOString();
      fechaUltimaPausa = null;
    }
    nuevoMotivoEspera = null;
  }

  // Regla ITIL: Al pasar a Resuelto (5), la solución aplicada y categoría de resolución son obligatorias
  if (nuevoEstado === 5) {
    if (!nuevaSolucion || nuevaSolucion.trim().length === 0) {
      throw new ErrorDominio(
        "Según ITIL 4, al resolver un ticket es obligatorio documentar la solución o workaround aplicado"
      );
    }
    fechaResolucion = new Date().toISOString();
    const limiteMs = new Date(fechaLimiteSla).getTime();
    slaCumplido = Date.now() <= limiteMs;
  }

  // Regla ITIL: Al pasar a Cerrado (6), marcar fecha de cierre
  if (nuevoEstado === 6) {
    fechaCierre = new Date().toISOString();
    if (!fechaResolucion) {
      fechaResolucion = fechaCierre;
    }
  }

  // Cancelación (7)
  if (nuevoEstado === 7) {
    if (!nuevoMotivoCancelacion || nuevoMotivoCancelacion.trim().length === 0) {
      throw new ErrorDominio("Debe indicar el motivo de la cancelación del ticket");
    }
  }

  // Actualizar registro con todos los atributos ITIL 4
  const sqlUpdate = `
    UPDATE ticket SET
      id_estado = $1,
      id_usuario_asignado = $2,
      id_departamento = $3,
      id_motivo_espera = $4,
      solucion_aplicada = $5,
      categoria_resolucion = $6,
      motivo_cancelacion = $7,
      fecha_primera_respuesta = $8,
      fecha_resolucion = $9,
      fecha_cierre = $10,
      sla_cumplido = $11,
      tiempo_pausado_minutos = $12,
      fecha_ultima_pausa = $13,
      fecha_limite_sla = $14,
      id_ci = COALESCE($15, id_ci),
      fecha_reapertura = $16,
      motivo_reapertura = $17,
      conteo_reaperturas = $18,
      usuario_modificacion = $19,
      fecha_modificacion = now()
    WHERE id_ticket = $20
  `;

  await query(sqlUpdate, [
    nuevoEstado,
    nuevoAsignado,
    nuevoDepto,
    nuevoMotivoEspera,
    nuevaSolucion,
    nuevaCategoriaResolucion,
    nuevoMotivoCancelacion,
    fechaPrimeraRespuesta,
    fechaResolucion,
    fechaCierre,
    slaCumplido,
    tiempoPausado,
    fechaUltimaPausa,
    fechaLimiteSla,
    body.id_ci || null,
    fechaReapertura,
    motivoReapertura,
    conteoReaperturas,
    sesion.id_usuario,
    idTicket,
  ]);

  if (actual.id_tipo_ticket === 2 && body.id_paso_actual !== undefined) {
    await query(
      `UPDATE ticket_solicitud SET id_paso_actual = $1 WHERE id_ticket = $2`,
      [nuevoPasoActual, idTicket]
    );
  }

  if (actual.id_tipo_ticket === 1 && body.id_problema !== undefined) {
    await query(
      `UPDATE ticket_incidente SET id_problema = $1 WHERE id_ticket = $2`,
      [body.id_problema || null, idTicket]
    );
  }

  const ticketActualizado = await queryRow<Ticket>(
    "SELECT * FROM vista_ticket WHERE id_ticket = $1",
    [idTicket]
  );

  // Registro en auditoría / comentarios
  if (esAccionReapertura) {
    await query(
      `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno, id_estado_cambiado)
       VALUES ($1, $2, $3, false, 3)`,
      [
        idTicket,
        sesion.id_usuario,
        `Ticket reabierto por el solicitante dentro de la ventana de 48h. Motivo de reapertura: "${motivoReapertura}"`
      ]
    );
  } else if (body.nota_cambio && body.nota_cambio.trim().length > 0) {
    await query(
      `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno, id_estado_cambiado)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        idTicket,
        sesion.id_usuario,
        body.nota_cambio.trim(),
        body.es_nota_interna ?? false,
        nuevoEstado !== actual.id_estado ? nuevoEstado : null,
      ]
    );
  } else if (nuevoEstado !== actual.id_estado) {
    const estInfo = await queryRow<{ nombre: string }>("SELECT nombre FROM estado_ticket WHERE id_estado = $1", [nuevoEstado]);
    await query(
      `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno, id_estado_cambiado)
       VALUES ($1, $2, $3, false, $4)`,
      [
        idTicket,
        sesion.id_usuario,
        `Estado actualizado a: ${estInfo?.nombre || nuevoEstado}`,
        nuevoEstado,
      ]
    );
  }

  return { ticket: ticketActualizado };
}
