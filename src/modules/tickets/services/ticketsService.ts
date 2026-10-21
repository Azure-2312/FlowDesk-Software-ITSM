import { query, queryRow, transaccion } from "@/shared/lib/db";
import { Ticket, CrearTicketPayload } from "@/types";
import { calcularFechaLimiteHorasHabiles, calcularFechaLimiteHorasHabilesAsync } from "@/shared/lib/sla";
import { validarTexto, validarArchivoAdjunto } from "@/shared/lib/validaciones";
import { validarCargaTecnico } from "./tecnicoCargaService";
import { ErrorDominio } from "@/shared/lib/errores";

// Matriz de Prioridad ITIL 4: Impacto (1..3) x Urgencia (1..3)
// Retorna el código de prioridad: P1, P2, P3, P4
export function calcularPrioridadITIL(nivelImpacto: number, nivelUrgencia: number): string {
  if (nivelImpacto === 3 && nivelUrgencia === 3) return "P1"; // Crítica
  if (nivelImpacto === 3 && nivelUrgencia === 2) return "P2"; // Alta
  if (nivelImpacto === 3 && nivelUrgencia === 1) return "P3"; // Media

  if (nivelImpacto === 2 && nivelUrgencia === 3) return "P2"; // Alta
  if (nivelImpacto === 2 && nivelUrgencia === 2) return "P3"; // Media
  if (nivelImpacto === 2 && nivelUrgencia === 1) return "P4"; // Baja

  if (nivelImpacto === 1 && nivelUrgencia === 3) return "P3"; // Media
  if (nivelImpacto === 1 && nivelUrgencia === 2) return "P4"; // Baja
  return "P4"; // Baja
}

export interface ContextoTickets {
  idUsuario: number;
  idPerfil: number;
}

export interface FiltrosTickets {
  vista: string;
  idTipo?: string | null;
  idPrioridad?: string | null;
  idEstado?: string | null;
  idDepartamento?: string | null;
  idServicio?: string | null;
  estadoAprobacion?: string | null;
  buscar?: string | null;
  soloAsignadosAMi?: string | null;
  slaVencido?: string | null;
  solicitante?: string | null;
  tecnico?: string | null;
}

export async function listarTickets(contexto: ContextoTickets, filtros: FiltrosTickets) {
  const { idUsuario, idPerfil } = contexto;
  const {
    vista,
    idTipo,
    idPrioridad,
    idEstado,
    idDepartamento,
    idServicio,
    estadoAprobacion,
    buscar,
    soloAsignadosAMi,
    slaVencido,
    solicitante,
    tecnico,
  } = filtros;

  const condiciones: string[] = ["t.estado_registro = true"];
  const params: any[] = [];
  let paramIdx = 1;

  // Limitar bandejas de técnicos a su departamento resolutor (excepto cuando consulta sus propios tickets)
  if (idPerfil === 2 && vista !== "mios") {
    condiciones.push(`t.id_departamento = (SELECT td.id_departamento FROM tecnico_detalle td WHERE td.id_usuario = $${paramIdx++} AND td.estado_registro = true)`);
    params.push(idUsuario);
  }

  // El Gestor de Área siempre queda dentro de su propio departamento (excepto en "mios").
  if (idPerfil === 5 && vista !== "mios") {
    condiciones.push(`t.id_departamento_empresa = (SELECT u.id_departamento_empresa FROM usuario u WHERE u.id_usuario = $${paramIdx++})`);
    params.push(idUsuario);
  }

  // Cada Supervisor solo consulta expedientes de los grupos de TI que supervisa (excepto en "mios").
  if (idPerfil === 4 && vista !== "mios") {
    condiciones.push(`t.id_departamento IN (
      SELECT d.id_departamento FROM departamento_ti d
      WHERE d.id_supervisor = $${paramIdx++} AND d.estado_registro = true
    )`);
    params.push(idUsuario);
  }

  // Filtrado según vista y perfil
  if (vista === "mios") {
    condiciones.push(`(t.id_usuario_solicitante = $${paramIdx} OR t.usuario_creacion = $${paramIdx})`);
    params.push(idUsuario);
    paramIdx++;
  } else if (vista === "asignados") {
    condiciones.push(`t.id_usuario_asignado = $${paramIdx++}`);
    params.push(idUsuario);
    condiciones.push(`et.es_terminal = false`);
  } else if (vista === "bandeja") {
    // Solo tickets pendientes que NO han sido asignados
    condiciones.push(`t.id_usuario_asignado IS NULL`);
    condiciones.push(`et.es_terminal = false`);
  } else if (vista === "resueltos") {
    condiciones.push(`t.id_estado IN (5, 6)`); // Resuelto o Cerrado
  } else if (vista === "aprobaciones") {
    // Mostrar decisiones que requieren una respuesta, no todas las solicitudes.
    condiciones.push(`t.estado_aprobacion = 'PENDIENTE_APROBACION'`);
    if (idPerfil === 5) {
      // Delimitación departamental estricta de aprobaciones (RN-33)
      condiciones.push(`t.id_departamento_empresa = (SELECT id_departamento_empresa FROM usuario WHERE id_usuario = ${paramIdx++})`);
      params.push(idUsuario);
    }
  } else if (vista === "departamento") {
    // Tickets del departamento
    if (idDepartamento) {
      condiciones.push(`t.id_departamento = $${paramIdx++}`);
      params.push(parseInt(idDepartamento, 10));
    }
  } else if (vista === "auditoria") {
    // Auditoría integral: sin filtros restrictivos
  }

  // Si el perfil activo es Solicitante (id_perfil 3), SOLO puede ver sus propios tickets
  if (idPerfil === 3) {
    if (!condiciones.some((c) => c.includes("t.id_usuario_solicitante") || c.includes("t.usuario_creacion"))) {
      condiciones.push(`(t.id_usuario_solicitante = $${paramIdx} OR t.usuario_creacion = $${paramIdx})`);
      params.push(idUsuario);
      paramIdx++;
    }
  }

  if (idTipo) {
    condiciones.push(`t.id_tipo_ticket = $${paramIdx++}`);
    params.push(parseInt(idTipo, 10));
  }

  if (idPrioridad) {
    condiciones.push(`t.id_prioridad = $${paramIdx++}`);
    params.push(parseInt(idPrioridad, 10));
  }

  if (idEstado) {
    condiciones.push(`t.id_estado = $${paramIdx++}`);
    params.push(parseInt(idEstado, 10));
  }

  if (idDepartamento && vista !== "departamento" && idPerfil !== 5 && idPerfil !== 2) {
    condiciones.push(`t.id_departamento = $${paramIdx++}`);
    params.push(parseInt(idDepartamento, 10));
  }

  if (idServicio) {
    condiciones.push(`t.id_servicio = $${paramIdx++}`);
    params.push(parseInt(idServicio, 10));
  }

  if (estadoAprobacion) {
    condiciones.push(`t.estado_aprobacion = $${paramIdx++}`);
    params.push(estadoAprobacion);
  }

  if (slaVencido === "1") {
    condiciones.push(`t.fecha_limite_sla < NOW() AND et.es_terminal = false`);
  } else if (slaVencido === "0") {
    condiciones.push(`(t.fecha_limite_sla >= NOW() OR et.es_terminal = true)`);
  }

  if (solicitante && solicitante.trim()) {
    condiciones.push(`(CONCAT(us.nombres, ' ', us.apellido_paterno) ILIKE $${paramIdx} OR us.correo_electronico ILIKE $${paramIdx})`);
    params.push(`%${solicitante.trim()}%`);
    paramIdx++;
  }

  if (tecnico && tecnico.trim()) {
    condiciones.push(`(CONCAT(ut.nombres, ' ', ut.apellido_paterno) ILIKE $${paramIdx} OR ut.correo_electronico ILIKE $${paramIdx})`);
    params.push(`%${tecnico.trim()}%`);
    paramIdx++;
  }

  if (soloAsignadosAMi === "1") {
    condiciones.push(`t.id_usuario_asignado = $${paramIdx++}`);
    params.push(idUsuario);
  }

  if (buscar && buscar.trim().length > 0) {
    condiciones.push(
      `(t.codigo_ticket ILIKE $${paramIdx} OR t.titulo ILIKE $${paramIdx} OR t.descripcion ILIKE $${paramIdx})`
    );
    params.push(`%${buscar.trim()}%`);
    paramIdx++;
  }

  const sql = `
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
      t.id_departamento,
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
      t.estado_registro,
      (SELECT COUNT(*) FROM comentario_ticket c WHERE c.id_ticket = t.id_ticket AND c.estado_registro = true)::int as comentarios_cantidad,
      (SELECT COUNT(*) FROM adjunto_ticket a WHERE a.id_ticket = t.id_ticket AND a.estado_registro = true)::int as adjuntos_cantidad
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
    WHERE ${condiciones.join(" AND ")}
    ${vista === "mios" ? "ORDER BY t.fecha_creacion DESC" : "ORDER BY prio.nivel ASC, t.fecha_limite_sla ASC, t.fecha_creacion DESC"}
  `;

  const tickets = await query<Ticket>(sql, params);

  // Calcular estado dinámico de SLA en minutos
  const ahora = Date.now();
  const ticketsConSLA = tickets.map((t) => {
    const limiteMs = new Date(t.fecha_limite_sla).getTime();
    const minutosRestantes = Math.round((limiteMs - ahora) / 60000);
    const slaVencidoCalculado = !t.es_terminal && minutosRestantes < 0;

    return {
      ...t,
      minutos_restantes_sla: minutosRestantes,
      sla_vencido: slaVencidoCalculado,
    };
  });

  return { tickets: ticketsConSLA, id_usuario_actual: idUsuario };
}

export async function crearTicket(sesion: any, body: CrearTicketPayload) {
  const {
    titulo,
    descripcion,
    id_tipo_ticket,
    id_categoria,
    id_servicio,
    id_departamento,
    canal_comunicacion,
    id_impacto,
    id_urgencia,
    campos_adicionales,
    archivos,
  } = body;

  const esSolicitud = Number(id_tipo_ticket) === 2;

  const vTit = validarTexto(titulo, 5, 150, "El título del ticket", true);
  if (!vTit.valido) throw new ErrorDominio(vTit.mensaje!);

  const vDesc = validarTexto(descripcion, 15, 5000, "La descripción del ticket", true);
  if (!vDesc.valido) throw new ErrorDominio(vDesc.mensaje!);

  if (!id_tipo_ticket || !id_categoria || !id_impacto || !id_urgencia) {
    throw new ErrorDominio("Todos los campos de clasificación son obligatorios según ITIL 4");
  }

  if (Array.isArray(archivos)) {
    for (const a of archivos) {
      const vArch = validarArchivoAdjunto(a.nombre || "", a.tamano || 0, 5, a.base64);
      if (!vArch.valido) throw new ErrorDominio(vArch.mensaje!);
    }
  }

  // 1. Obtener niveles de impacto, urgencia y tipo
  const [impacto, urgencia, tipo] = await Promise.all([
    queryRow<{ nivel: number }>("SELECT nivel FROM impacto_ticket WHERE id_impacto = $1", [id_impacto]),
    queryRow<{ nivel: number }>("SELECT nivel FROM urgencia_ticket WHERE id_urgencia = $1", [id_urgencia]),
    queryRow<{ prefijo_codigo: string }>("SELECT prefijo_codigo FROM tipo_ticket WHERE id_tipo_ticket = $1", [id_tipo_ticket]),
  ]);

  if (!impacto || !urgencia || !tipo) {
    throw new ErrorDominio("Catálogo de clasificación inválido");
  }

  const categoria = await queryRow<{ id_tipo_ticket: number }>(
    "SELECT id_tipo_ticket FROM categoria_ticket WHERE id_categoria = $1 AND estado_registro = true",
    [id_categoria]
  );
  if (!categoria || categoria.id_tipo_ticket !== Number(id_tipo_ticket)) {
    throw new ErrorDominio("La categoría no corresponde al tipo de ticket seleccionado.");
  }

  // 2. Calcular código de prioridad según matriz Impacto x Urgencia
  const codigoPrioridad = calcularPrioridadITIL(impacto.nivel, urgencia.nivel);

  // 3. Obtener id_prioridad y horas base de SLA
  const prioridad = await queryRow<{ id_prioridad: number; tiempo_resolucion_horas: number; tiempo_primera_respuesta_hrs: number }>(
    "SELECT id_prioridad, tiempo_resolucion_horas,tiempo_primera_respuesta_hrs FROM prioridad_ticket WHERE codigo = $1",
    [codigoPrioridad]
  );

  if (!prioridad) {
    throw new ErrorDominio("Prioridad no configurada", 500);
  }

  // 4. Analizar servicio corporativo si fue especificado
  let estadoAprobacion = "NO_APLICA";
  let idPasoInicial: number | null = null;
  let horasResolucion = prioridad.tiempo_resolucion_horas;
  let horasRespuesta = prioridad.tiempo_primera_respuesta_hrs;
  let servicioElegido: any = null;

  if (id_servicio) {
    const servicio = await queryRow<any>(
      `SELECT s.* FROM servicio_catalogo s WHERE s.id_servicio = $1 AND s.estado_registro = true`,
      [id_servicio]
    );

    if (servicio) {
      servicioElegido = servicio;
      if (servicio.id_tipo_ticket !== Number(id_tipo_ticket) || servicio.id_categoria !== Number(id_categoria)) {
        throw new ErrorDominio("El servicio no corresponde al tipo y categoría seleccionados.");
      }
      if (esSolicitud && servicio.requiere_aprobacion) {
        estadoAprobacion = "PENDIENTE_APROBACION";
      }
      if (servicio.sla_horas_resolucion && servicio.sla_horas_resolucion > 0) {
        // El SLA del servicio corporativo rige el compromiso oficial
        horasResolucion = servicio.sla_horas_resolucion;
      }
      if (servicio.sla_horas_respuesta && servicio.sla_horas_respuesta > 0) horasRespuesta = servicio.sla_horas_respuesta;

      // El workflow por servicio solo aplica a solicitudes.
      if (esSolicitud) {
        const primerPaso = await queryRow<{ id_paso: number }>(
          "SELECT id_paso FROM servicio_workflow_paso WHERE id_servicio = $1 AND estado_registro = true ORDER BY orden ASC LIMIT 1",
          [id_servicio]
        );
        if (primerPaso) {
          idPasoInicial = primerPaso.id_paso;
        }
      }
    }
    if (!servicio) {
      throw new ErrorDominio("El servicio seleccionado no está disponible.");
    }
  }

  // 5. Determinar grupo resolutor. Solicitantes y gestores de área no
  // eligen el destino técnico: el registro entra por Mesa de Ayuda (N1).
  // Un Supervisor solo puede escoger un grupo que tenga asignado.
  let idDeptoFinal = 1;
  if (servicioElegido?.id_departamento_resolutor) idDeptoFinal = Number(servicioElegido.id_departamento_resolutor);
  const esquema = Array.isArray(servicioElegido?.esquema_formulario) ? servicioElegido.esquema_formulario : [];
  const campos = campos_adicionales && typeof campos_adicionales === "object" ? campos_adicionales as Record<string, unknown> : {};
  for (const campo of esquema) {
    const valor = campos[campo.clave];
    if (campo.obligatorio && (valor === undefined || valor === null || String(valor).trim() === "")) {
      throw new ErrorDominio(`Completa el campo obligatorio: ${campo.etiqueta}.`);
    }
    if (valor !== undefined && campo.tipo === "lista" && !(campo.opciones || []).includes(String(valor))) {
      throw new ErrorDominio(`El valor elegido para ${campo.etiqueta} no es válido.`);
    }
  }
  if (sesion.perfilActivo?.id_perfil === 4 && id_departamento) {
    const grupoSupervisado = await queryRow<{ existe: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM departamento_ti
        WHERE id_departamento = $1 AND id_supervisor = $2 AND estado_registro = true) AS existe`,
      [id_departamento, sesion.id_usuario]
    );
    if (!grupoSupervisado?.existe) {
      throw new ErrorDominio("Solo puedes enrutar a grupos de TI que supervisas.", 403);
    }
    idDeptoFinal = Number(id_departamento);
  }

  // 6. Generar código correlativo de ticket: ej. INC-2026-0005 o REQ-2026-0005
  const anioActual = new Date().getFullYear();
  const conteoAnio = await queryRow<{ total: string }>(
    `SELECT COUNT(*) as total FROM ticket WHERE codigo_ticket LIKE $1`,
    [`${tipo.prefijo_codigo}-${anioActual}-%`]
  );
  const siguienteCorrelativo = (parseInt(conteoAnio?.total || "0", 10) + 1).toString().padStart(4, "0");
  const codigoTicket = `${tipo.prefijo_codigo}-${anioActual}-${siguienteCorrelativo}`;

  // 7. Calcular fecha límite SLA en horas hábiles (ITIL 4 / ISO 20000: L-V 08:00 a 18:00)
  const fechaLimiteSla = await calcularFechaLimiteHorasHabilesAsync(horasResolucion);
  const fechaLimiteRespuestaSla = await calcularFechaLimiteHorasHabilesAsync(horasRespuesta);

  // 8. Determinar solicitante real si se registra a nombre de otro por personal autorizado
  const idPerfilActual = sesion.perfilActivo?.id_perfil || 0;
  const esPersonalSoporte = [1, 2, 4, 8].includes(idPerfilActual);
  const idSolicitante = (body.id_usuario_solicitante && esPersonalSoporte)
    ? Number(body.id_usuario_solicitante)
    : sesion.id_usuario;

  // 8. Insertar ticket con modelo ampliado ITIL 4 y campos adicionales JSONB
  const deptoEmpresa = await queryRow<{ id_departamento_empresa: number | null }>(
    "SELECT id_departamento_empresa FROM usuario WHERE id_usuario = $1", [idSolicitante]
  );
  const idAsignadoInicial = (body.autoasignar_tecnico && [1, 2, 4].includes(idPerfilActual))
    ? sesion.id_usuario
    : null;
  if (idAsignadoInicial) {
    await validarCargaTecnico(idAsignadoInicial);
  }
  const idEstadoInicial = idAsignadoInicial ? 2 : 1; // Asignado (2) o Abierto (1)

  const nuevoTicket = await transaccion(async (client) => {
    const insert = await client.query(
      `INSERT INTO ticket (
        codigo_ticket, titulo, descripcion, id_tipo_ticket, id_categoria,
        id_servicio, id_departamento, id_departamento_empresa, canal_comunicacion,
        id_impacto, id_urgencia, id_prioridad, id_estado,
        id_usuario_solicitante, id_usuario_asignado, fecha_limite_sla, fecha_limite_respuesta_sla, usuario_creacion, campos_adicionales
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) RETURNING id_ticket`,
      [
        codigoTicket,
        titulo.trim(),
        descripcion.trim(),
        id_tipo_ticket,
        id_categoria,
        id_servicio || null,
        idDeptoFinal,
        deptoEmpresa?.id_departamento_empresa ?? null,
        canal_comunicacion || "PORTAL_WEB",
        id_impacto,
        id_urgencia,
        prioridad.id_prioridad,
        idEstadoInicial,
        idSolicitante,
        idAsignadoInicial,
        fechaLimiteSla,
        fechaLimiteRespuestaSla,
        sesion.id_usuario,
        JSON.stringify(campos_adicionales || {}),
      ]
    );

    const idTicket = insert.rows[0].id_ticket;

    // El trigger de la migracion crea la extension 1:1. Aqui solo se
    // completan los datos exclusivos de solicitud.
    if (esSolicitud) {
      await client.query(
        `UPDATE ticket_solicitud
         SET estado_aprobacion = $1, id_paso_actual = $2
         WHERE id_ticket = $3`,
        [estadoAprobacion, idPasoInicial, idTicket]
      );
    }

    const full = await client.query(
      "SELECT * FROM vista_ticket WHERE id_ticket = $1",
      [idTicket]
    );
    return full.rows[0] as Ticket;
  });

  // 8.1. Guardar archivos adjuntos de evidencias técnicas en adjunto_ticket
  if (nuevoTicket && archivos && Array.isArray(archivos) && archivos.length > 0) {
    for (const arch of archivos) {
      if (arch.nombre && arch.base64) {
        await query(
          `INSERT INTO adjunto_ticket (
            id_ticket, nombre_archivo, tipo_mime, tamano_bytes, datos_base64, id_usuario_subio
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            nuevoTicket.id_ticket,
            arch.nombre.slice(0, 255),
            arch.tipo ? arch.tipo.slice(0, 100) : "application/octet-stream",
            arch.tamano || 0,
            arch.base64,
            sesion.id_usuario,
          ]
        );
      }
    }
  }

  // 9. Registrar primer comentario de trazabilidad en la bitácora
  if (nuevoTicket) {
    let detalleInicial = "Ticket creado y registrado en la Mesa de Servicio (Service Desk).";
    if (idSolicitante !== sesion.id_usuario) {
      detalleInicial = "Ticket registrado por el personal de soporte técnico a nombre del usuario solicitante.";
    }
    if (idAsignadoInicial) {
      detalleInicial += " Asignado automáticamente al especialista registrador.";
    }
    if (estadoAprobacion === "PENDIENTE_APROBACION") {
      detalleInicial += " Requerimiento sujeto a compuerta de aprobación de jefatura responsable.";
    }
    await query(
      `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno)
       VALUES ($1, $2, $3, false)`,
      [nuevoTicket.id_ticket, sesion.id_usuario, detalleInicial]
    );
  }

  return { ticket: nuevoTicket };
}
