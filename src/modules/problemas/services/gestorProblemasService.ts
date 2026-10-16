import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Servicio del perfil Gestor de Problemas (perfil 10).
 * Cubre panel, asignación, identificación proactiva (candidatos y recurrentes),
 * análisis de causa raíz, problemas mayores, RFC derivadas, conocimiento
 * derivado, objetivos de tiempo y reportes.
 */

const ESTADO_CASE = `CASE p.id_estado
  WHEN 1 THEN 'Registrado'
  WHEN 2 THEN 'En investigación'
  WHEN 3 THEN 'Causa raíz identificada'
  WHEN 4 THEN 'Error conocido (KEDB)'
  WHEN 5 THEN 'Resuelto'
  WHEN 6 THEN 'Cerrado'
  ELSE 'Desconocido' END`;

const NOMBRE_USUARIO = `TRIM(CONCAT_WS(' ', u.nombres, u.apellido_paterno, u.apellido_materno))`;

function numOrNull(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

interface IncidenteAgrupable {
  id_ticket: number;
  codigo_ticket: string;
  titulo: string;
  servicio: string | null;
  categoria: string | null;
  ci: string | null;
  resolucion: string | null;
  fecha: string | null;
}

async function cargarIncidentes(dias: number): Promise<IncidenteAgrupable[]> {
  return query<IncidenteAgrupable>(
    `SELECT t.id_ticket, t.codigo_ticket, t.titulo,
            sc.nombre AS servicio,
            cat.nombre AS categoria,
            ci.codigo_ci AS ci,
            t.categoria_resolucion AS resolucion,
            t.fecha_creacion AS fecha
     FROM ticket t
     JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket AND tt.codigo = 'INCIDENTE'
     LEFT JOIN servicio_catalogo sc ON sc.id_servicio = t.id_servicio
     LEFT JOIN categoria_ticket cat ON cat.id_categoria = t.id_categoria
     LEFT JOIN elemento_configuracion ci ON ci.id_ci = t.id_ci
     WHERE t.estado_registro = true
       AND t.fecha_creacion >= now() - ($1 || ' days')::interval`,
    [dias]
  );
}

function valorDimension(inc: IncidenteAgrupable, dimension: string): string {
  const bruto =
    dimension === "ci" ? inc.ci :
    dimension === "categoria" ? inc.categoria :
    dimension === "resolucion" ? inc.resolucion :
    inc.servicio;
  const v = (bruto ?? "").trim();
  return v.length > 0 ? v : "Sin clasificar";
}

function agruparPor(incidentes: IncidenteAgrupable[], dimension: string) {
  const map = new Map<string, { valor: string; total: number; tickets: any[] }>();
  for (const inc of incidentes) {
    const clave = valorDimension(inc, dimension);
    if (!map.has(clave)) map.set(clave, { valor: clave, total: 0, tickets: [] });
    const grupo = map.get(clave)!;
    grupo.total += 1;
    if (grupo.tickets.length < 25) {
      grupo.tickets.push({
        id_ticket: inc.id_ticket,
        codigo_ticket: inc.codigo_ticket,
        titulo: inc.titulo,
        fecha: inc.fecha,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

async function detectarCandidatos() {
  const reglas = await query<any>(
    `SELECT id_regla, nombre, agrupar_por, umbral_incidentes, ventana_horas, prioridad_problema
     FROM problema_regla_umbral
     WHERE activa = true
     ORDER BY orden ASC, id_regla ASC`
  );
  const maxDias = reglas.reduce(
    (m, r) => Math.max(m, Math.ceil((r.ventana_horas ?? 720) / 24)),
    30
  );
  const incidentes = await cargarIncidentes(maxDias);

  const resultado: any[] = [];
  const vistos = new Set<string>();
  for (const regla of reglas) {
    const dimension = regla.agrupar_por || "servicio";
    const dias = Math.ceil((regla.ventana_horas ?? 720) / 24);
    const corte = Date.now() - dias * 86400000;
    const filtrados = incidentes.filter(
      (i) => !i.fecha || new Date(i.fecha).getTime() >= corte
    );
    for (const grupo of agruparPor(filtrados, dimension)) {
      if (grupo.total >= (regla.umbral_incidentes ?? 3)) {
        const clave = `${dimension}:${grupo.valor}`;
        if (vistos.has(clave)) continue;
        vistos.add(clave);
        resultado.push({
          id_regla: regla.id_regla,
          regla: regla.nombre,
          dimension,
          valor: grupo.valor,
          total: grupo.total,
          tickets: grupo.tickets,
        });
      }
    }
  }
  return resultado.sort((a, b) => b.total - a.total);
}

/* ------------------------------------------------------------------ Panel */

export async function obtenerPanelProblemas() {
  const kpis = await queryRow<any>(
    `SELECT
        COUNT(*) FILTER (WHERE p.id_estado NOT IN (5,6))::int AS abiertos,
        COUNT(*) FILTER (WHERE p.id_estado NOT IN (5,6) AND p.id_usuario_asignado IS NULL)::int AS sin_asignar,
        COUNT(*) FILTER (WHERE p.id_estado NOT IN (5,6) AND o.resolucion_total_horas IS NOT NULL
          AND p.fecha_creacion + (o.resolucion_total_horas || ' hours')::interval < now())::int AS vencidos,
        COUNT(*) FILTER (WHERE p.id_estado NOT IN (5,6) AND o.resolucion_total_horas IS NOT NULL
          AND p.fecha_creacion + (o.resolucion_total_horas || ' hours')::interval >= now()
          AND p.fecha_creacion + (o.resolucion_total_horas || ' hours')::interval < now() + interval '24 hours')::int AS por_vencer,
        COUNT(*) FILTER (WHERE p.es_error_conocido = true)::int AS kedb_marcados
     FROM problema p
     LEFT JOIN problema_objetivo_tiempo o ON o.id_prioridad = p.id_prioridad
     WHERE p.estado_registro = true`
  );

  const mayores = await queryRow<any>(
    `SELECT COUNT(*)::int AS activos
     FROM incidente_mayor
     WHERE estado_registro = true AND UPPER(COALESCE(estado,'')) <> 'CERRADO'`
  );

  const kedb = await query<any>(
    `SELECT e.id_error_conocido, e.codigo_kedb, e.titulo, e.fecha_publicacion, p.codigo_problema
     FROM error_conocido e
     LEFT JOIN problema p ON p.id_problema = e.id_problema
     WHERE e.estado_registro = true
     ORDER BY e.fecha_publicacion DESC NULLS LAST, e.id_error_conocido DESC
     LIMIT 8`
  );

  const proximos = await query<any>(
    `SELECT p.id_problema, p.codigo_problema, p.titulo,
            ${ESTADO_CASE} AS estado_nombre,
            pr.nombre AS prioridad_nombre,
            ${NOMBRE_USUARIO} AS asignado,
            (p.fecha_creacion + (o.resolucion_total_horas || ' hours')::interval) AS fecha_objetivo,
            ROUND(EXTRACT(EPOCH FROM ((p.fecha_creacion + (o.resolucion_total_horas || ' hours')::interval) - now()))/3600)::int AS horas_restantes
     FROM problema p
     LEFT JOIN problema_objetivo_tiempo o ON o.id_prioridad = p.id_prioridad
     LEFT JOIN prioridad_ticket pr ON pr.id_prioridad = p.id_prioridad
     LEFT JOIN usuario u ON u.id_usuario = p.id_usuario_asignado
     WHERE p.estado_registro = true AND p.id_estado NOT IN (5,6) AND o.resolucion_total_horas IS NOT NULL
     ORDER BY fecha_objetivo ASC
     LIMIT 10`
  );

  const sinAsignar = await query<any>(
    `SELECT p.id_problema, p.codigo_problema, p.titulo, pr.nombre AS prioridad_nombre,
            ${ESTADO_CASE} AS estado_nombre, p.fecha_creacion
     FROM problema p
     LEFT JOIN prioridad_ticket pr ON pr.id_prioridad = p.id_prioridad
     WHERE p.estado_registro = true AND p.id_estado NOT IN (5,6) AND p.id_usuario_asignado IS NULL
     ORDER BY p.fecha_creacion ASC
     LIMIT 10`
  );

  const candidatos = await detectarCandidatos();

  return {
    kpis: {
      ...kpis,
      mayores_activos: mayores?.activos ?? 0,
      candidatos: candidatos.length,
    },
    kedb,
    proximos,
    sin_asignar: sinAsignar,
    candidatos: candidatos.slice(0, 5),
  };
}

/* -------------------------------------------------------------- Asignación */

export async function listarAsignacion() {
  const problemas = await query<any>(
    `SELECT p.id_problema, p.codigo_problema, p.titulo,
            ${ESTADO_CASE} AS estado_nombre,
            pr.nombre AS prioridad_nombre,
            p.id_usuario_asignado, ${NOMBRE_USUARIO} AS asignado,
            p.id_departamento, d.nombre AS departamento,
            p.id_prioridad, p.fecha_creacion
     FROM problema p
     LEFT JOIN prioridad_ticket pr ON pr.id_prioridad = p.id_prioridad
     LEFT JOIN usuario u ON u.id_usuario = p.id_usuario_asignado
     LEFT JOIN departamento_ti d ON d.id_departamento = p.id_departamento
     WHERE p.estado_registro = true AND p.id_estado NOT IN (5,6)
     ORDER BY p.fecha_creacion ASC
     LIMIT 200`
  );
  const tecnicos = await query<any>(
    `SELECT u.id_usuario, ${NOMBRE_USUARIO} AS nombre
     FROM usuario u
     WHERE u.estado_registro = true
     ORDER BY nombre ASC`
  );
  const departamentos = await query<any>(
    `SELECT id_departamento, nombre FROM departamento_ti WHERE estado_registro = true ORDER BY nombre`
  );
  const prioridades = await query<any>(
    `SELECT id_prioridad, nombre FROM prioridad_ticket WHERE estado_registro = true ORDER BY nivel ASC`
  );
  return { problemas, tecnicos, departamentos, prioridades };
}

export async function asignarProblema(idUsuario: number, body: any) {
  const idProblema = Number(body?.id_problema);
  if (!idProblema) throw new ErrorDominio("Debe indicar el problema.");

  await query(
    `UPDATE problema
     SET id_usuario_asignado = $1,
         id_departamento = $2,
         id_prioridad = COALESCE($3, id_prioridad),
         usuario_modificacion = $4,
         fecha_modificacion = now()
     WHERE id_problema = $5`,
    [
      numOrNull(body?.id_usuario_asignado),
      numOrNull(body?.id_departamento),
      numOrNull(body?.id_prioridad),
      idUsuario,
      idProblema,
    ]
  );
  return { ok: true };
}

/* ------------------------------------------- Identificación proactiva (HAM) */

export async function listarCandidatos() {
  const reglas = await query<any>(
    `SELECT id_regla, nombre, agrupar_por, umbral_incidentes, ventana_horas, activa
     FROM problema_regla_umbral ORDER BY orden ASC, id_regla ASC`
  );
  const candidatos = await detectarCandidatos();
  const problemasExistentes = await query<any>(
    `SELECT id_problema, codigo_problema, titulo FROM problema
     WHERE estado_registro = true ORDER BY id_problema DESC LIMIT 50`
  );
  const prioridades = await query<any>(
    `SELECT id_prioridad, nombre FROM prioridad_ticket WHERE estado_registro = true ORDER BY nivel ASC`
  );
  return { reglas, candidatos, problemas_existentes: problemasExistentes, prioridades };
}

export async function convertirCandidato(idUsuario: number, body: any) {
  const titulo = String(body?.titulo ?? "").trim();
  if (!titulo) throw new ErrorDominio("El título es obligatorio.");
  const ids: number[] = Array.isArray(body?.ids_tickets)
    ? body.ids_tickets.map((x: unknown) => Number(x)).filter((n: number) => Number.isFinite(n) && n > 0)
    : [];

  const nuevo = await queryRow<any>(
    `INSERT INTO problema (codigo_problema, titulo, descripcion, id_impacto, id_urgencia, id_prioridad, id_estado, usuario_creacion)
     VALUES (
       'PRB-' || to_char(now(),'YYYY') || '-' || lpad((COALESCE((SELECT MAX(id_problema) FROM problema),0)+1)::text, 4, '0'),
       $1, $2, $3, $4, $5, 1, $6
     )
     RETURNING id_problema, codigo_problema`,
    [
      titulo,
      body?.descripcion ? String(body.descripcion).trim() : null,
      numOrNull(body?.id_impacto),
      numOrNull(body?.id_urgencia),
      numOrNull(body?.id_prioridad),
      idUsuario,
    ]
  );

  for (const idTicket of ids) {
    await query(`UPDATE ticket SET id_problema = $1 WHERE id_ticket = $2`, [nuevo.id_problema, idTicket]);
    await query(
      `INSERT INTO problema_incidente (id_problema, id_ticket) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [nuevo.id_problema, idTicket]
    );
  }
  return { ok: true, id_problema: nuevo.id_problema, codigo_problema: nuevo.codigo_problema };
}

export async function listarRecurrentes(dimension = "servicio") {
  const dim = ["servicio", "categoria", "ci", "resolucion"].includes(dimension) ? dimension : "servicio";
  const incidentes = await cargarIncidentes(90);
  const grupos = agruparPor(incidentes, dim);
  return { dimension: dim, total_incidentes: incidentes.length, grupos };
}

/* ------------------------------------------------- Análisis de causa raíz */

export async function listarAnalisis(idProblema?: number | null) {
  const problemas = await query<any>(
    `SELECT p.id_problema, p.codigo_problema, p.titulo,
            ${ESTADO_CASE} AS estado_nombre,
            p.causa_raiz, p.metodo_analisis, p.es_error_conocido
     FROM problema p
     WHERE p.estado_registro = true
     ORDER BY p.id_problema DESC
     LIMIT 100`
  );
  let analisis: any[] = [];
  if (idProblema) {
    analisis = await query<any>(
      `SELECT a.*, ${NOMBRE_USUARIO} AS autor
       FROM problema_analisis a
       LEFT JOIN usuario u ON u.id_usuario = a.id_usuario
       WHERE a.id_problema = $1 AND a.estado_registro = true
       ORDER BY a.fecha_creacion DESC`,
      [idProblema]
    );
  }
  return { problemas, analisis };
}

export async function guardarAnalisis(idUsuario: number, body: any) {
  const idProblema = Number(body?.id_problema);
  if (!idProblema) throw new ErrorDominio("Debe indicar el problema.");
  const metodo = String(body?.metodo ?? "5_WHYS");
  const conclusion = body?.conclusion ? String(body.conclusion).trim() : null;

  const fila = await queryRow<any>(
    `INSERT INTO problema_analisis (id_problema, metodo, cinco_porques, ishikawa, linea_tiempo, conclusion, id_usuario)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id_analisis`,
    [
      idProblema,
      metodo,
      body?.cinco_porques ?? null,
      body?.ishikawa ?? null,
      body?.linea_tiempo ?? null,
      conclusion,
      idUsuario,
    ]
  );

  await query(
    `UPDATE problema
     SET metodo_analisis = $1,
         causa_raiz = COALESCE($2, causa_raiz),
         es_error_conocido = COALESCE($3, es_error_conocido),
         usuario_modificacion = $4,
         fecha_modificacion = now()
     WHERE id_problema = $5`,
    [metodo, conclusion, body?.es_error_conocido ?? null, idUsuario, idProblema]
  );

  return { ok: true, id_analisis: fila.id_analisis };
}

/* ----------------------------------------------------- Problemas mayores */

export async function listarMayores() {
  const mayores = await query<any>(
    `SELECT m.id_incidente_mayor, m.codigo, m.titulo, m.descripcion, m.severidad, m.estado,
            m.sala_virtual, m.comunicados, m.fecha_declaracion, m.fecha_cierre,
            m.id_problema, p.codigo_problema,
            ${NOMBRE_USUARIO} AS declara
     FROM incidente_mayor m
     LEFT JOIN problema p ON p.id_problema = m.id_problema
     LEFT JOIN usuario u ON u.id_usuario = m.id_usuario_declara
     WHERE m.estado_registro = true
     ORDER BY m.fecha_declaracion DESC NULLS LAST
     LIMIT 100`
  );
  const candidatos = await query<any>(
    `SELECT p.id_problema, p.codigo_problema, p.titulo,
            pr.nombre AS prioridad_nombre,
            ${ESTADO_CASE} AS estado_nombre
     FROM problema p
     LEFT JOIN prioridad_ticket pr ON pr.id_prioridad = p.id_prioridad
     WHERE p.estado_registro = true AND p.id_estado NOT IN (5,6)
       AND NOT EXISTS (
         SELECT 1 FROM incidente_mayor m
         WHERE m.id_problema = p.id_problema AND m.estado_registro = true
           AND UPPER(COALESCE(m.estado,'')) <> 'CERRADO'
       )
     ORDER BY p.fecha_creacion DESC
     LIMIT 50`
  );
  const departamentos = await query<any>(
    `SELECT id_departamento, nombre FROM departamento_ti WHERE estado_registro = true ORDER BY nombre`
  );
  return { mayores, candidatos, departamentos };
}

export async function declararMayor(idUsuario: number, body: any) {
  const titulo = String(body?.titulo ?? "").trim();
  if (!titulo) throw new ErrorDominio("El título es obligatorio.");

  const fila = await queryRow<any>(
    `INSERT INTO incidente_mayor (codigo, titulo, descripcion, severidad, id_problema, id_departamento, estado, sala_virtual, id_usuario_declara, fecha_declaracion)
     VALUES (
       'MAY-' || to_char(now(),'YYYY') || '-' || lpad((COALESCE((SELECT MAX(id_incidente_mayor) FROM incidente_mayor),0)+1)::text, 4, '0'),
       $1, $2, $3, $4, $5, 'ACTIVO', $6, $7, now()
     )
     RETURNING id_incidente_mayor, codigo`,
    [
      titulo,
      body?.descripcion ? String(body.descripcion).trim() : null,
      body?.severidad ?? "ALTA",
      numOrNull(body?.id_problema),
      numOrNull(body?.id_departamento),
      body?.sala_virtual ?? null,
      idUsuario,
    ]
  );
  return { ok: true, id_incidente_mayor: fila.id_incidente_mayor, codigo: fila.codigo };
}

export async function actualizarMayor(_idUsuario: number, body: any) {
  const id = Number(body?.id_incidente_mayor);
  if (!id) throw new ErrorDominio("Debe indicar el incidente mayor.");
  await query(
    `UPDATE incidente_mayor
     SET sala_virtual = COALESCE($1, sala_virtual),
         comunicados = COALESCE($2, comunicados),
         severidad = COALESCE($3, severidad)
     WHERE id_incidente_mayor = $4`,
    [body?.sala_virtual ?? null, body?.comunicados ?? null, body?.severidad ?? null, id]
  );
  return { ok: true };
}

export async function cerrarMayor(idUsuario: number, body: any) {
  const id = Number(body?.id_incidente_mayor);
  if (!id) throw new ErrorDominio("Debe indicar el incidente mayor.");
  await query(
    `UPDATE incidente_mayor
     SET estado = 'CERRADO', fecha_cierre = now(), id_usuario_cierra = $1,
         comunicados = COALESCE($2, comunicados)
     WHERE id_incidente_mayor = $3`,
    [idUsuario, body?.comunicados ?? null, id]
  );
  return { ok: true };
}

/* ------------------------------------------------ Cambios derivados (RFC) */

export async function listarCambiosDerivados() {
  const cambios = await query<any>(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, c.id_estado, c.fecha_creacion,
            p.codigo_problema, p.titulo AS problema_titulo
     FROM cambio c
     LEFT JOIN problema p ON p.id_problema = c.id_problema_origen
     WHERE c.estado_registro = true AND c.id_problema_origen IS NOT NULL
     ORDER BY c.fecha_creacion DESC
     LIMIT 100`
  );
  const problemas = await query<any>(
    `SELECT p.id_problema, p.codigo_problema, p.titulo, ${ESTADO_CASE} AS estado_nombre
     FROM problema p
     WHERE p.estado_registro = true AND p.id_estado NOT IN (5,6)
       AND NOT EXISTS (
         SELECT 1 FROM cambio c WHERE c.id_problema_origen = p.id_problema AND c.estado_registro = true
       )
     ORDER BY p.fecha_creacion DESC
     LIMIT 50`
  );
  return { cambios, problemas };
}

export async function crearCambioDesdeProblema(idUsuario: number, body: any) {
  const idProblema = Number(body?.id_problema);
  if (!idProblema) throw new ErrorDominio("Debe indicar el problema.");
  const titulo = String(body?.titulo ?? "").trim();
  if (!titulo) throw new ErrorDominio("El título es obligatorio.");

  const ventanaInicio = body?.ventana_inicio ? new Date(body.ventana_inicio) : new Date();
  const ventanaFin = body?.ventana_fin ? new Date(body.ventana_fin) : new Date(Date.now() + 7 * 86400000);

  const fila = await queryRow<any>(
    `INSERT INTO cambio (codigo_cambio, titulo, descripcion, tipo_cambio, justificacion, plan_implementacion, plan_rollback, ventana_inicio, ventana_fin, id_problema_origen, id_estado, id_usuario_solicitante)
     VALUES (
       'RFC-' || to_char(now(),'YYYY') || '-' || lpad((COALESCE((SELECT MAX(id_cambio) FROM cambio),0)+1)::text, 4, '0'),
       $1, $2, $3, $4, $5, $6, $7, $8, $9, 1, $10
     )
     RETURNING id_cambio, codigo_cambio`,
    [
      titulo,
      body?.descripcion ? String(body.descripcion).trim() : null,
      body?.tipo_cambio ?? "NORMAL",
      body?.justificacion ? String(body.justificacion).trim() : null,
      body?.plan_implementacion ? String(body.plan_implementacion).trim() : "Por definir",
      body?.plan_rollback ? String(body.plan_rollback).trim() : "Por definir",
      ventanaInicio,
      ventanaFin,
      idProblema,
      idUsuario,
    ]
  );
  return { ok: true, id_cambio: fila.id_cambio, codigo_cambio: fila.codigo_cambio };
}

/* ------------------------------------------------- Conocimiento derivado */

export async function listarConocimiento() {
  const articulos = await query<any>(
    `SELECT a.id_articulo, a.codigo_articulo, a.titulo, a.estado_editorial, a.fecha_creacion,
            p.codigo_problema, p.titulo AS problema_titulo
     FROM articulo_conocimiento a
     LEFT JOIN problema p ON p.id_problema = a.id_problema_origen
     WHERE a.estado_registro = true AND a.id_problema_origen IS NOT NULL
     ORDER BY a.fecha_creacion DESC
     LIMIT 100`
  );
  const pendientes = await query<any>(
    `SELECT p.id_problema, p.codigo_problema, p.titulo,
            ${ESTADO_CASE} AS estado_nombre, p.es_error_conocido
     FROM problema p
     WHERE p.estado_registro = true AND p.id_estado IN (4,5,6)
       AND NOT EXISTS (
         SELECT 1 FROM articulo_conocimiento a
         WHERE a.id_problema_origen = p.id_problema AND a.estado_registro = true
       )
     ORDER BY p.fecha_modificacion DESC NULLS LAST
     LIMIT 50`
  );
  return { articulos, pendientes };
}

export async function crearArticuloDesdeProblema(idUsuario: number, body: any) {
  const idProblema = Number(body?.id_problema);
  if (!idProblema) throw new ErrorDominio("Debe indicar el problema.");
  const titulo = String(body?.titulo ?? "").trim();
  if (!titulo) throw new ErrorDominio("El título es obligatorio.");

  const fila = await queryRow<any>(
    `INSERT INTO articulo_conocimiento (codigo_articulo, titulo, contenido_markdown, id_categoria, id_problema_origen, estado_editorial, id_autor, usuario_creacion)
     VALUES (
       'KB-' || to_char(now(),'YYYY') || '-' || lpad((COALESCE((SELECT MAX(id_articulo) FROM articulo_conocimiento),0)+1)::text, 4, '0'),
       $1, $2, $3, $4, 'BORRADOR', $5, $5
     )
     RETURNING id_articulo, codigo_articulo`,
    [
      titulo,
      body?.contenido_markdown ? String(body.contenido_markdown) : null,
      numOrNull(body?.id_categoria),
      idProblema,
      idUsuario,
    ]
  );
  return { ok: true, id_articulo: fila.id_articulo, codigo_articulo: fila.codigo_articulo };
}

/* -------------------------------------------------- Objetivos de tiempo */

export async function listarObjetivos() {
  const objetivos = await query<any>(
    `SELECT o.id_objetivo, o.id_prioridad, pr.nombre AS prioridad_nombre, pr.color, pr.nivel,
            o.primera_respuesta_horas, o.diagnostico_horas, o.resolucion_total_horas,
            o.descripcion_operativa, o.umbrales_alerta
     FROM problema_objetivo_tiempo o
     LEFT JOIN prioridad_ticket pr ON pr.id_prioridad = o.id_prioridad
     ORDER BY pr.nivel ASC NULLS LAST, o.id_objetivo ASC`
  );
  const prioridades = await query<any>(
    `SELECT id_prioridad, nombre, nivel FROM prioridad_ticket WHERE estado_registro = true ORDER BY nivel ASC`
  );
  return { objetivos, prioridades };
}

export async function actualizarObjetivo(_idUsuario: number, body: any) {
  const id = Number(body?.id_objetivo);
  if (!id) throw new ErrorDominio("Debe indicar el objetivo.");
  await query(
    `UPDATE problema_objetivo_tiempo
     SET primera_respuesta_horas = $1,
         diagnostico_horas = $2,
         resolucion_total_horas = $3,
         descripcion_operativa = $4,
         umbrales_alerta = $5,
         fecha_modificacion = now()
     WHERE id_objetivo = $6`,
    [
      numOrNull(body?.primera_respuesta_horas),
      numOrNull(body?.diagnostico_horas),
      numOrNull(body?.resolucion_total_horas),
      body?.descripcion_operativa ?? null,
      body?.umbrales_alerta ?? null,
      id,
    ]
  );
  return { ok: true };
}

/* -------------------------------------------------------------- Reportes */

export async function obtenerReportesProblemas() {
  const resumen = await queryRow<any>(
    `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE p.id_estado NOT IN (5,6))::int AS abiertos,
        COUNT(*) FILTER (WHERE p.id_estado IN (5,6))::int AS cerrados,
        COUNT(*) FILTER (WHERE p.es_error_conocido = true)::int AS kedb,
        COUNT(*) FILTER (WHERE p.causa_raiz IS NOT NULL AND p.causa_raiz <> '')::int AS con_causa_raiz,
        ROUND(AVG(EXTRACT(EPOCH FROM (p.fecha_modificacion - p.fecha_creacion))/86400) FILTER (WHERE p.id_estado IN (5,6))::numeric, 2) AS dias_cierre_promedio
     FROM problema p
     WHERE p.estado_registro = true`
  );

  const porEstado = await query<any>(
    `SELECT ${ESTADO_CASE} AS estado, COUNT(*)::int AS total
     FROM problema p WHERE p.estado_registro = true
     GROUP BY 1 ORDER BY 2 DESC`
  );

  const porPrioridad = await query<any>(
    `SELECT COALESCE(pr.nombre,'Sin prioridad') AS prioridad, COUNT(*)::int AS total
     FROM problema p
     LEFT JOIN prioridad_ticket pr ON pr.id_prioridad = p.id_prioridad
     WHERE p.estado_registro = true
     GROUP BY 1 ORDER BY 2 DESC`
  );

  const mayores = await queryRow<any>(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE UPPER(COALESCE(estado,'')) <> 'CERRADO')::int AS activos
     FROM incidente_mayor WHERE estado_registro = true`
  );

  const recurrentes = (await listarRecurrentes("servicio")).grupos.slice(0, 8);

  return {
    resumen: {
      ...resumen,
      mayores_total: mayores?.total ?? 0,
      mayores_activos: mayores?.activos ?? 0,
    },
    porEstado,
    porPrioridad,
    recurrentes,
  };
}
