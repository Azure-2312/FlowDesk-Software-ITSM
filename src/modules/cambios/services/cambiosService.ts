import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarTexto, validarFechaNoPasada } from "@/shared/lib/validaciones";
import { sqlEnAtencion, sqlEsperaAprobacion } from "@/shared/lib/sla-sql";

export interface FiltrosCambios {
  tipo: string | null;
  estado: string | null;
  vista: string | null;
}

export async function listarCambios(sesion: any, filtros: FiltrosCambios) {
  const { tipo, estado, vista } = filtros;

  const condiciones: string[] = ["c.estado_registro = true"];
  const params: any[] = [];
  let paramIdx = 1;

  if (vista === "implementacion") {
    condiciones.push(`(c.id_usuario_responsable = $${paramIdx} OR c.id_usuario_solicitante = $${paramIdx})`);
    params.push(sesion.id_usuario);
    paramIdx++;
    condiciones.push(`c.id_estado IN (3, 4, 5)`);
  } else if (vista === "calendario") {
    condiciones.push(`c.id_estado IN (3, 4, 5, 6)`);
  } else if (vista === "impacto") {
    condiciones.push(`c.id_estado IN (3, 4, 5)`);
  } else if (vista === "historial") {
    condiciones.push(`c.id_estado IN (6, 7, 8)`);
  } else if (vista === "todos") {
    // Todos los cambios dentro del alcance del perfil (abajo)
  } else if (vista === "sin_asignar") {
    condiciones.push(`c.id_usuario_responsable IS NULL`);
  } else if (vista === "mis_cambios") {
    condiciones.push(`(c.id_usuario_solicitante = $${paramIdx} OR c.id_usuario_responsable = $${paramIdx})`);
    params.push(sesion.id_usuario);
    paramIdx++;
  }

  // Alcance del perfil: se aplica con cualquier vista (igual que el detalle),
  // salvo el calendario, que es la agenda compartida de la organización.
  const perfilCambios = Number(sesion.perfilActivo?.id_perfil);
  if (vista === "calendario") {
    // sin filtro de alcance
  } else if (perfilCambios === 2) {
    condiciones.push(`(c.id_usuario_solicitante = $${paramIdx} OR c.id_usuario_responsable = $${paramIdx})`);
    params.push(sesion.id_usuario);
    paramIdx++;
  } else if (perfilCambios === 5) {
    condiciones.push(`EXISTS (
      SELECT 1 FROM usuario ug
       WHERE ug.id_usuario = $${paramIdx++} AND ug.id_departamento_empresa IS NOT NULL
         AND (c.id_usuario_solicitante IN (SELECT id_usuario FROM usuario WHERE id_departamento_empresa = ug.id_departamento_empresa)
              OR c.id_incidente_origen IN (SELECT id_ticket FROM ticket WHERE id_departamento_empresa = ug.id_departamento_empresa))
    )`);
    params.push(sesion.id_usuario);
  } else if (perfilCambios === 4) {
    condiciones.push(`c.id_usuario_solicitante IN (
      SELECT u.id_usuario FROM usuario u
      WHERE u.id_departamento IN (
        SELECT d.id_departamento FROM departamento_ti d
        WHERE d.id_supervisor = $${paramIdx++} AND d.estado_registro = true
      )
    )`);
    params.push(sesion.id_usuario);
  }

  if (tipo) {
    condiciones.push(`c.tipo_cambio = $${paramIdx++}`);
    params.push(tipo.toUpperCase());
  }

  if (estado) {
    condiciones.push(`c.id_estado = $${paramIdx++}`);
    params.push(parseInt(estado, 10));
  }

  const sql = `
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
      c.id_solicitud_origen,
      sol.codigo_ticket AS solicitud_codigo,
      sol.titulo AS solicitud_titulo,
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
    LEFT JOIN ticket sol ON c.id_solicitud_origen = sol.id_ticket
    LEFT JOIN usuario us ON c.id_usuario_solicitante = us.id_usuario
    LEFT JOIN usuario ur ON c.id_usuario_responsable = ur.id_usuario
    WHERE ${condiciones.join(" AND ")}
    ORDER BY c.id_cambio DESC
  `;

  return query(sql, params);
}

/**
 * Avisos de mantenimiento visibles para cualquier usuario autenticado
 * (página /avisos/mantenimientos): cambios aprobados, en planificación o en
 * ejecución cuya ventana es vigente o futura. No expone datos internos.
 */
export async function listarAvisosMantenimiento() {
  return query(
    `SELECT
       c.id_cambio,
       c.codigo_cambio,
       c.titulo,
       c.descripcion,
       c.tipo_cambio,
       c.id_estado,
       CASE c.id_estado
         WHEN 3 THEN 'Aprobado'
         WHEN 4 THEN 'En Planificación'
         WHEN 5 THEN 'En Ejecución'
         ELSE 'Programado'
       END AS estado_nombre,
       c.ventana_inicio,
       c.ventana_fin,
       it.nombre AS impacto_nombre,
       ci.codigo_ci,
       ci.nombre AS ci_nombre
     FROM cambio c
     LEFT JOIN impacto_ticket it ON c.id_impacto = it.id_impacto
     LEFT JOIN elemento_configuracion ci ON c.id_ci_afectado = ci.id_ci
     WHERE c.estado_registro = true
       AND c.id_estado IN (3, 4, 5)
       AND c.ventana_fin >= now() - interval '1 day'
     ORDER BY c.ventana_inicio ASC`
  );
}

export async function listarAprobadoresEmergencia() {
  return query<{
    id_usuario: number;
    nombre_completo: string;
    correo_electronico: string;
    perfil_nombre: string;
  }>(`
    SELECT DISTINCT u.id_usuario, TRIM(CONCAT(u.nombres, ' ', u.apellido_paterno)) as nombre_completo, u.correo_electronico, p.nombre as perfil_nombre
    FROM usuario u
    JOIN usuario_perfiles up ON u.id_usuario = up.id_usuario
    JOIN perfiles p ON up.id_perfil = p.id_perfil
    WHERE u.estado_registro = true 
      AND up.estado_registro = true
      AND up.id_perfil IN (1, 4, 7, 8)
    ORDER BY nombre_completo ASC
  `);
}

export async function listarIncidentesParaRelacion() {
  return query<{
    id_ticket: number;
    codigo_ticket: string;
    titulo: string;
    id_prioridad: number;
    fecha_creacion: string;
  }>(`
    SELECT t.id_ticket, t.codigo_ticket, t.titulo, t.id_prioridad, t.fecha_creacion
    FROM ticket t
    JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket AND tt.codigo = 'INCIDENTE'
    WHERE t.estado_registro = true
    ORDER BY t.id_ticket DESC
    LIMIT 100
  `);
}

/** Solicitudes que pueden originar una RFC: en atención y ya autorizadas por el jefe. */
export async function listarSolicitudesParaRelacion() {
  return query<{ id_ticket: number; codigo_ticket: string; titulo: string; id_prioridad: number }>(`
    SELECT t.id_ticket, t.codigo_ticket, t.titulo, t.id_prioridad
    FROM ticket t
    JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket AND tt.codigo = 'SOLICITUD'
    WHERE t.estado_registro = true AND ${sqlEnAtencion("t")} AND NOT ${sqlEsperaAprobacion("t")}
    ORDER BY t.id_ticket DESC
    LIMIT 100
  `);
}

/** Valida que el ticket sea una solicitud que todavía se atiende y no espera aprobación. */
async function validarSolicitudOrigen(idSolicitud: unknown): Promise<number | null> {
  if (idSolicitud === undefined || idSolicitud === null || idSolicitud === "") return null;
  const id = Number(idSolicitud);
  if (!Number.isInteger(id) || id <= 0) throw new ErrorDominio("La solicitud de origen no es válida.");
  const fila = await queryRow<{ es_solicitud: boolean; en_atencion: boolean; espera: boolean }>(
    `SELECT (tt.codigo = 'SOLICITUD') AS es_solicitud,
            ${sqlEnAtencion("t")} AS en_atencion,
            ${sqlEsperaAprobacion("t")} AS espera
     FROM ticket t JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket
     WHERE t.id_ticket = $1 AND t.estado_registro = true`,
    [id]
  );
  if (!fila) throw new ErrorDominio("La solicitud de origen no existe.", 404);
  if (!fila.es_solicitud) throw new ErrorDominio("El ticket de origen indicado no es una solicitud de servicio.");
  if (fila.espera) throw new ErrorDominio("La solicitud todavía espera la aprobación del jefe (o fue rechazada).");
  if (!fila.en_atencion) throw new ErrorDominio("La solicitud de origen ya está resuelta, cerrada o cancelada.");
  return id;
}

export async function crearCambio(sesion: any, body: any) {
  const config = await queryRow<{
    perfiles_solicitantes: number[];
    tipos_rfc: string[];
    exige_ci: boolean;
    exige_plan_pruebas: boolean;
    permite_emergencia: boolean;
    campos_personalizados: any[];
    exige_rollback: boolean;
    duracion_maxima_horas: number;
  }>(
    "SELECT perfiles_solicitantes,tipos_rfc,exige_ci,exige_plan_pruebas,permite_emergencia,campos_personalizados,exige_rollback,duracion_maxima_horas FROM configuracion_rfc WHERE id_configuracion=1"
  );

  const idPerfil = sesion.perfilActivo?.id_perfil || 0;
  if (idPerfil !== 1 && !(config?.perfiles_solicitantes || [2, 8]).includes(idPerfil)) {
    throw new ErrorDominio("El perfil activo no está habilitado para presentar RFC.", 403);
  }

  const {
    titulo,
    descripcion,
    tipo_cambio,
    id_impacto,
    id_urgencia,
    id_prioridad,
    justificacion,
    motivo_cambio,
    entorno,
    id_ci_afectado,
    requiere_interrupcion,
    id_servicio_afectado,
    ventana_inicio,
    ventana_fin,
    plan_implementacion,
    plan_rollback,
    plan_pruebas,
    criterios_exito,
    id_problema_origen,
    id_incidente_origen,
    id_solicitud_origen,
    id_modelo_estandar,
    checklist_elegibilidad,
    medio_autorizacion_emergencia,
    id_usuario_autorizador_emergencia,
    justificacion_urgencia,
    cuestionario_riesgo,
    nivel_riesgo,
    evidencias,
  } = body;

  const tipoNormalizado = String(tipo_cambio || "").toUpperCase();
  const idSolicitudOrigen = await validarSolicitudOrigen(id_solicitud_origen);
  if (!["ESTANDAR", "NORMAL", "EMERGENCIA"].includes(tipoNormalizado)) {
    throw new ErrorDominio("Tipo de RFC no válido según las directrices ITIL v4.");
  }
  if (tipoNormalizado === "EMERGENCIA" && config && config.permite_emergencia === false) {
    throw new ErrorDominio("Las RFC de emergencia están deshabilitadas por configuración.");
  }

  if (!ventana_inicio || !ventana_fin) {
    throw new ErrorDominio("Las fechas de inicio y fin de la ventana de cambio son obligatorias.");
  }
  const vFecha = validarFechaNoPasada(ventana_inicio, "El inicio de la ventana de cambio");
  if (!vFecha.valido) throw new ErrorDominio(vFecha.mensaje!);
  const inicio = new Date(ventana_inicio).getTime();
  const fin = new Date(ventana_fin).getTime();
  if (!Number.isFinite(inicio) || !Number.isFinite(fin) || fin <= inicio) {
    throw new ErrorDominio("La ventana de cambio debe tener fechas válidas y su fin debe ser posterior al inicio.");
  }
  if ((fin - inicio) / 3600000 > Number(config?.duracion_maxima_horas || 24)) {
    throw new ErrorDominio(`La ventana supera el máximo configurado de ${config?.duracion_maxima_horas || 24} horas.`);
  }

  if (!id_ci_afectado) {
    throw new ErrorDominio("Debe seleccionar el elemento de configuración (CI / Activo) afectado.");
  }
  const ciExiste = await queryRow<{ id_ci: number; nombre: string }>(
    "SELECT id_ci, nombre FROM elemento_configuracion WHERE id_ci = $1 AND estado_registro = true",
    [id_ci_afectado]
  );
  if (!ciExiste) {
    throw new ErrorDominio(`El CI afectado (id ${id_ci_afectado}) no existe o no está activo en la CMDB.`, 404);
  }

  const solapamientoRow = await queryRow<{ id_cambio: number; codigo_cambio: string; titulo: string }>(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo
     FROM cambio c
     WHERE c.estado_registro = true
       AND c.id_ci_afectado = $1
       AND c.id_estado IN (3, 4, 5)
       AND c.ventana_inicio < $2
       AND c.ventana_fin > $3
     LIMIT 1`,
    [id_ci_afectado, ventana_fin, ventana_inicio]
  );
  if (solapamientoRow) {
    throw new ErrorDominio(
      `No se puede registrar el RFC: el CI afectado ya tiene un cambio activo en esa ventana (${solapamientoRow.codigo_cambio} - ${solapamientoRow.titulo}).`,
      409
    );
  }

  let servicioNombre: string | null = null;
  if (requiere_interrupcion) {
    if (!id_servicio_afectado) {
      throw new ErrorDominio("Debe seleccionar el servicio del catálogo que sufrirá interrupción o caída.");
    }
    const servRow = await queryRow<{ id_servicio: number; nombre: string }>(
      "SELECT id_servicio, nombre FROM servicio_catalogo WHERE id_servicio = $1 AND estado_registro = true",
      [id_servicio_afectado]
    );
    if (!servRow) {
      throw new ErrorDominio("El servicio seleccionado no existe o no está activo en el catálogo.");
    }
    servicioNombre = servRow.nombre;
  }

  let finalTitulo = "";
  let finalDescripcion = "";
  let finalJustificacion = "";
  let finalPlanImpl = "";
  let finalPlanRollback = "";
  let finalPlanPruebas: string | null = null;
  let finalCriteriosExito: string | null = null;
  let finalMotivo = "";
  let finalImpacto = 2;
  let finalUrgencia = 2;
  let finalPrioridad = 3;
  let finalEstado = 2;
  let autorizadorEmergenciaNombre: string | null = null;

  if (tipoNormalizado === "ESTANDAR") {
    if (!id_modelo_estandar) {
      throw new ErrorDominio("Debe seleccionar un Modelo de Cambio Estándar preautorizado.");
    }
    const modelo = await queryRow<any>(
      "SELECT * FROM cambio_modelo_estandar WHERE id_modelo = $1",
      [id_modelo_estandar]
    );
    if (!modelo) {
      throw new ErrorDominio("El modelo estándar seleccionado no existe en el catálogo de cambios.", 404);
    }

    const listaElegible = Array.isArray(modelo.lista_elegibilidad) ? modelo.lista_elegibilidad : [];
    if (listaElegible.length > 0) {
      const confirmados = typeof checklist_elegibilidad === "object" && checklist_elegibilidad !== null
        ? checklist_elegibilidad
        : {};
      const todasConfirmadas = listaElegible.every((_: any, idx: number) => confirmados[idx] === true);
      if (!todasConfirmadas) {
        throw new ErrorDominio("Debe confirmar todas las condiciones de la lista de verificación de elegibilidad.");
      }
    }

    finalTitulo = (titulo && String(titulo).trim()) || modelo.nombre;
    finalDescripcion = (descripcion && String(descripcion).trim()) || modelo.descripcion || `[RFC Estándar] ${modelo.nombre}`;
    finalJustificacion = (justificacion && String(justificacion).trim()) || modelo.contenido_prellenado?.motivo || "Procedimiento estándar preautorizado.";
    finalPlanImpl = (plan_implementacion && String(plan_implementacion).trim()) || modelo.contenido_prellenado?.plan_implementacion || "Conforme al modelo estándar preautorizado.";
    finalPlanRollback = (plan_rollback && String(plan_rollback).trim()) || modelo.contenido_prellenado?.plan_rollback || "Conforme al procedimiento estándar preautorizado.";
    finalPlanPruebas = (plan_pruebas && String(plan_pruebas).trim()) || modelo.contenido_prellenado?.plan_pruebas || "Verificación estándar del servicio.";
    finalCriteriosExito = (criterios_exito && String(criterios_exito).trim()) || "Funcionamiento operativo validado según modelo estándar.";
    finalMotivo = (motivo_cambio && String(motivo_cambio).trim()) || modelo.contenido_prellenado?.motivo || "Mantenimiento operativo estándar";
    finalImpacto = 1;
    finalUrgencia = 1;
    finalPrioridad = 4;
    finalEstado = 3;
  } else if (tipoNormalizado === "EMERGENCIA") {
    if (!medio_autorizacion_emergencia || !String(medio_autorizacion_emergencia).trim()) {
      throw new ErrorDominio("Debe especificar el medio de autorización de la emergencia (llamada, sala de crisis, etc.).");
    }
    if (!id_usuario_autorizador_emergencia) {
      throw new ErrorDominio("Debe seleccionar el aprobador de emergencia que autorizó la intervención.");
    }
    const autorizador = await queryRow<{ id_usuario: number; nombre_completo: string }>(
      `SELECT u.id_usuario, TRIM(CONCAT(u.nombres, ' ', u.apellido_paterno)) as nombre_completo
       FROM usuario u
       JOIN usuario_perfiles up ON u.id_usuario = up.id_usuario
       WHERE u.id_usuario = $1 AND u.estado_registro = true AND up.estado_registro = true AND up.id_perfil IN (1, 4, 7, 8)
       LIMIT 1`,
      [id_usuario_autorizador_emergencia]
    );
    if (!autorizador) {
      throw new ErrorDominio("El usuario seleccionado no cuenta con perfil facultado para autorizar cambios de emergencia.", 403);
    }
    autorizadorEmergenciaNombre = autorizador.nombre_completo;

    const vUrg = validarTexto(justificacion_urgencia, 10, 2000, "La justificación de urgencia", true);
    if (!vUrg.valido) throw new ErrorDominio(vUrg.mensaje!);

    if (!id_incidente_origen) {
      throw new ErrorDominio("Un cambio de emergencia debe asociarse obligatoriamente al incidente origen.");
    }

    const vTit = validarTexto(titulo, 5, 150, "El título del cambio", true);
    if (!vTit.valido) throw new ErrorDominio(vTit.mensaje!);

    finalTitulo = titulo.trim();
    finalDescripcion = (descripcion && String(descripcion).trim()) || `[RFC Emergencia] ${titulo.trim()}`;
    finalJustificacion = (justificacion && String(justificacion).trim()) || justificacion_urgencia.trim();
    finalPlanImpl = (plan_implementacion && String(plan_implementacion).trim()) || "Pendiente de regularización post-emergencia";
    finalPlanRollback = (plan_rollback && String(plan_rollback).trim()) || "Pendiente de regularización post-emergencia";
    finalPlanPruebas = (plan_pruebas && String(plan_pruebas).trim()) || null;
    finalCriteriosExito = (criterios_exito && String(criterios_exito).trim()) || null;
    finalMotivo = (motivo_cambio && String(motivo_cambio).trim()) || "Restablecimiento de servicio ante incidente crítico";
    finalImpacto = id_impacto ? Math.min(Number(id_impacto), 3) : 3;
    finalUrgencia = id_urgencia ? Math.min(Number(id_urgencia), 3) : 3;
    finalPrioridad = id_prioridad || 1;
    finalEstado = 2;
  } else {
    const vTit = validarTexto(titulo, 5, 150, "El título del cambio", true);
    if (!vTit.valido) throw new ErrorDominio(vTit.mensaje!);

    const vJust = validarTexto(justificacion, 10, 2000, "La justificación de negocio", true);
    if (!vJust.valido) throw new ErrorDominio(vJust.mensaje!);

    const vPlan = validarTexto(plan_implementacion, 10, 3000, "El plan de implementación", true);
    if (!vPlan.valido) throw new ErrorDominio(vPlan.mensaje!);

    if (!plan_rollback || !String(plan_rollback).trim()) {
      throw new ErrorDominio("El plan de rollback es obligatorio para cambios normales.");
    }
    if (!plan_pruebas || !String(plan_pruebas).trim()) {
      throw new ErrorDominio("El plan de pruebas es obligatorio para cambios normales.");
    }
    if (!criterios_exito || !String(criterios_exito).trim()) {
      throw new ErrorDominio("Los criterios de éxito son obligatorios para cambios normales.");
    }
    if (!entorno || !String(entorno).trim()) {
      throw new ErrorDominio("Debe seleccionar el entorno afectado.");
    }
    if (!motivo_cambio || !String(motivo_cambio).trim()) {
      throw new ErrorDominio("Debe seleccionar el motivo del cambio.");
    }

    finalTitulo = titulo.trim();
    finalDescripcion = (descripcion && String(descripcion).trim()) || `[RFC Normal] ${titulo.trim()}`;
    finalJustificacion = justificacion.trim();
    finalPlanImpl = plan_implementacion.trim();
    finalPlanRollback = plan_rollback.trim();
    finalPlanPruebas = plan_pruebas.trim();
    finalCriteriosExito = criterios_exito.trim();
    finalMotivo = motivo_cambio.trim();
    finalImpacto = id_impacto || 2;
    finalUrgencia = id_urgencia || 2;
    finalPrioridad = id_prioridad || 3;
    finalEstado = 2;
  }

  const custom = body.campos_personalizados && typeof body.campos_personalizados === "object" ? body.campos_personalizados : {};
  for (const field of config?.campos_personalizados || []) {
    const value = custom[field.clave];
    if (field.obligatorio && (value === undefined || value === null || String(value).trim() === "")) {
      throw new ErrorDominio(`Completa el campo obligatorio: ${field.etiqueta}.`);
    }
    if (value !== undefined && field.tipo === "lista" && !(field.opciones || []).includes(String(value))) {
      throw new ErrorDominio(`Valor no válido para ${field.etiqueta}.`);
    }
  }

  const camposAdicionalesCompletos = {
    ...custom,
    motivo_cambio: finalMotivo,
    entorno: entorno || "Producción",
    criterios_exito: finalCriteriosExito,
    requiere_interrupcion: Boolean(requiere_interrupcion),
    id_servicio_afectado: id_servicio_afectado ? Number(id_servicio_afectado) : null,
    servicio_afectado_nombre: servicioNombre,
    id_modelo_estandar: id_modelo_estandar ? Number(id_modelo_estandar) : null,
    checklist_elegibilidad: checklist_elegibilidad || null,
    medio_autorizacion_emergencia: medio_autorizacion_emergencia || null,
    id_usuario_autorizador_emergencia: id_usuario_autorizador_emergencia ? Number(id_usuario_autorizador_emergencia) : null,
    autorizador_emergencia_nombre: autorizadorEmergenciaNombre,
    justificacion_urgencia: justificacion_urgencia || null,
    cuestionario_riesgo: cuestionario_riesgo || null,
    nivel_riesgo: nivel_riesgo || (tipoNormalizado === "ESTANDAR" ? "Bajo" : "Medio"),
    evidencias: evidencias || null,
  };

  const year = new Date().getFullYear();
  const countRow = await queryRow<{ c: string }>(
    "SELECT COUNT(*) as c FROM cambio WHERE EXTRACT(YEAR FROM fecha_creacion) = $1",
    [year]
  );
  const correlativo = String((parseInt(countRow?.c || "0", 10) + 1)).padStart(4, "0");
  const codigo_cambio = `RFC-${year}-${correlativo}`;

  const insertSql = `
    INSERT INTO cambio (
      codigo_cambio,
      titulo,
      descripcion,
      tipo_cambio,
      id_impacto,
      id_urgencia,
      id_prioridad,
      id_estado,
      justificacion,
      plan_implementacion,
      plan_rollback,
      plan_pruebas,
      ventana_inicio,
      ventana_fin,
      id_ci_afectado,
      id_problema_origen,
      id_incidente_origen,
      id_solicitud_origen,
      id_usuario_solicitante,
      id_usuario_responsable,
      usuario_creacion,
      campos_adicionales
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
    ) RETURNING id_cambio, codigo_cambio
  `;

  const row = await queryRow<{ id_cambio: number; codigo_cambio: string }>(insertSql, [
    codigo_cambio,
    finalTitulo,
    finalDescripcion,
    tipoNormalizado,
    finalImpacto,
    finalUrgencia,
    finalPrioridad,
    finalEstado,
    finalJustificacion,
    finalPlanImpl,
    finalPlanRollback,
    finalPlanPruebas,
    ventana_inicio,
    ventana_fin,
    id_ci_afectado,
    id_problema_origen || null,
    id_incidente_origen || null,
    idSolicitudOrigen,
    sesion.id_usuario,
    sesion.id_usuario,
    sesion.id_usuario,
    JSON.stringify(camposAdicionalesCompletos),
  ]);

  // La solicitud deja constancia de la RFC que la atenderá.
  if (idSolicitudOrigen && row) {
    await query(
      `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno)
       VALUES ($1, $2, $3, false)`,
      [
        idSolicitudOrigen,
        sesion.id_usuario,
        `Se registró la solicitud de cambio ${row.codigo_cambio} para atender esta solicitud. Su avance se sigue en Gestión de Cambios.`,
      ]
    );
  }

  if (id_ci_afectado) {
    try {
      await query(
        `INSERT INTO cmdb_actualizacion (
           tipo_operacion, detalle, estado, fecha_creacion, fecha_aplicacion,
           id_ci, id_cambio, id_usuario_aplica, estado_registro
         ) VALUES (
           'CAMBIO_APLICADO', $1, 'APLICADO', now(), now(),
           $2, $3, $4, true
         )`,
        [
          `RFC ${codigo_cambio}: ${finalTitulo}`,
          id_ci_afectado,
          row?.id_cambio,
          sesion.id_usuario,
        ]
      );
    } catch (error) {
      console.error("Trazabilidad CMDB: no se pudo registrar la actualización del CI:", error);
    }
  }

  return {
    mensaje: "Solicitud de Cambio (RFC) creada exitosamente.",
    id_cambio: row?.id_cambio,
    codigo_cambio: row?.codigo_cambio,
  };
}
