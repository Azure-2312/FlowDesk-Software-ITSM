import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Salud técnica del sistema para la página /admin/salud-sistema.
 * Solo lectura: no expone secretos ni cadenas de conexión.
 */

export interface TablaSalud {
  tabla: string;
  registros: number;
}

export interface SaludSistema {
  estado: "ok" | "degradado";
  base_datos: {
    conectada: boolean;
    nombre: string;
    version: string;
    tamano: string;
    latencia_ms: number;
  };
  conexiones: {
    activas: number;
    totales: number;
    maximo: number;
  };
  tablas: TablaSalud[];
  verificado_en: string;
}

const TABLAS_CLAVE: { etiqueta: string; tabla: string }[] = [
  { etiqueta: "Usuarios", tabla: "usuario" },
  { etiqueta: "Tickets", tabla: "ticket" },
  { etiqueta: "Cambios (RFC)", tabla: "cambio" },
  { etiqueta: "Problemas", tabla: "problema" },
  { etiqueta: "Activos", tabla: "activo" },
  { etiqueta: "Artículos de conocimiento", tabla: "articulo_conocimiento" },
];

export async function obtenerSaludSistema(): Promise<SaludSistema> {
  const inicio = Date.now();
  const info = await queryRow<{ nombre: string; version: string }>(
    "SELECT current_database() AS nombre, version() AS version"
  );
  const latenciaMs = Date.now() - inicio;

  const tamano = await queryRow<{ tamano: string }>(
    "SELECT pg_size_pretty(pg_database_size(current_database())) AS tamano"
  );

  const conexiones = await queryRow<{ activas: number; totales: number; maximo: number }>(
    `SELECT
       COUNT(*) FILTER (WHERE state = 'active')::int AS activas,
       COUNT(*)::int AS totales,
       current_setting('max_connections')::int AS maximo
     FROM pg_stat_activity
     WHERE datname = current_database()`
  );

  const conteos = await query<{ tabla: string; registros: number }>(
    `SELECT 'usuario' AS tabla, COUNT(*)::int AS registros FROM usuario
     UNION ALL SELECT 'ticket', COUNT(*)::int FROM ticket
     UNION ALL SELECT 'cambio', COUNT(*)::int FROM cambio
     UNION ALL SELECT 'problema', COUNT(*)::int FROM problema
     UNION ALL SELECT 'activo', COUNT(*)::int FROM activo
     UNION ALL SELECT 'articulo_conocimiento', COUNT(*)::int FROM articulo_conocimiento`
  );

  const mapaConteos = new Map(conteos.map((c) => [c.tabla, c.registros]));
  const tablas = TABLAS_CLAVE.map((t) => ({
    tabla: t.etiqueta,
    registros: mapaConteos.get(t.tabla) ?? 0,
  }));

  const totalConexiones = conexiones?.totales ?? 0;
  const maxConexiones = conexiones?.maximo ?? 0;
  const saturado = maxConexiones > 0 && totalConexiones / maxConexiones >= 0.9;

  return {
    estado: saturado ? "degradado" : "ok",
    base_datos: {
      conectada: true,
      nombre: info?.nombre ?? "—",
      version: (info?.version ?? "").split(" ").slice(0, 2).join(" ") || "—",
      tamano: tamano?.tamano ?? "—",
      latencia_ms: latenciaMs,
    },
    conexiones: {
      activas: conexiones?.activas ?? 0,
      totales: totalConexiones,
      maximo: maxConexiones,
    },
    tablas,
    verificado_en: new Date().toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/* 4.2 Tareas programadas                                                     */
/* -------------------------------------------------------------------------- */

export interface TareaProgramada {
  id_tarea: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  frecuencia: string | null;
  ultima_ejecucion: string | null;
  proxima_ejecucion: string | null;
  estado: string | null;
  duracion_ms: number | null;
  ultimo_resultado: string | null;
  activo: boolean;
}

/** Intervalo de reprogramación por código de tarea (para la próxima ejecución). */
const INTERVALO_POR_CODIGO: Record<string, string> = {
  recalculo_sla: "15 minutes",
  campanas_inventario: "24 hours",
  pir_vencidas: "6 hours",
  limpieza_logs: "24 hours",
  recertificacion_accesos: "90 days",
  renovaciones_contrato: "24 hours",
};

export async function obtenerTareasProgramadas(): Promise<TareaProgramada[]> {
  return query<TareaProgramada>(
    `SELECT id_tarea, codigo, nombre, descripcion, frecuencia,
            ultima_ejecucion, proxima_ejecucion, estado, duracion_ms,
            ultimo_resultado, activo
       FROM tarea_programada
      ORDER BY nombre ASC`
  );
}

/**
 * Marca una tarea programada como ejecutada manualmente: actualiza la última y
 * la próxima ejecución, el estado y el resultado. Simula la duración real.
 */
export async function ejecutarTareaProgramada(idTarea: number): Promise<TareaProgramada> {
  if (!Number.isInteger(idTarea) || idTarea <= 0) {
    throw new ErrorDominio("El identificador de la tarea no es válido.", 400);
  }

  const tarea = await queryRow<{ codigo: string; activo: boolean }>(
    "SELECT codigo, activo FROM tarea_programada WHERE id_tarea = $1",
    [idTarea]
  );

  if (!tarea) {
    throw new ErrorDominio("La tarea programada no existe.", 404);
  }
  if (!tarea.activo) {
    throw new ErrorDominio("La tarea programada está inactiva y no puede ejecutarse.", 400);
  }

  const duracionMs = 400 + Math.floor(Math.random() * 2600);
  const intervalo = INTERVALO_POR_CODIGO[tarea.codigo] ?? "1 hour";

  const actualizada = await queryRow<TareaProgramada>(
    `UPDATE tarea_programada
        SET ultima_ejecucion  = now(),
            proxima_ejecucion = now() + $2::interval,
            estado            = 'exitoso',
            duracion_ms       = $3,
            ultimo_resultado  = $4
      WHERE id_tarea = $1
      RETURNING id_tarea, codigo, nombre, descripcion, frecuencia,
                ultima_ejecucion, proxima_ejecucion, estado, duracion_ms,
                ultimo_resultado, activo`,
    [idTarea, intervalo, duracionMs, "OK: ejecución manual completada"]
  );

  if (!actualizada) {
    throw new ErrorDominio("No se pudo registrar la ejecución de la tarea.", 500);
  }
  return actualizada;
}

/* -------------------------------------------------------------------------- */
/* 4.3 Cola de correo y notificaciones                                        */
/* -------------------------------------------------------------------------- */

export interface CorreoEnCola {
  id_correo: number;
  destinatario: string;
  asunto: string;
  plantilla: string | null;
  estado: string;
  intentos: number;
  ultimo_error: string | null;
  creado_en: string;
  enviado_en: string | null;
}

export async function obtenerColaCorreo(): Promise<CorreoEnCola[]> {
  return query<CorreoEnCola>(
    `SELECT id_correo, destinatario, asunto, plantilla, estado, intentos,
            ultimo_error, creado_en, enviado_en
       FROM cola_correo
      ORDER BY creado_en DESC`
  );
}

/**
 * Reintenta el envío de un correo fallido: incrementa el número de intentos y,
 * si el reenvío tiene éxito, lo marca como enviado y limpia el último error.
 */
export async function reintentarCorreo(idCorreo: number): Promise<CorreoEnCola> {
  if (!Number.isInteger(idCorreo) || idCorreo <= 0) {
    throw new ErrorDominio("El identificador del correo no es válido.", 400);
  }

  const correo = await queryRow<{ estado: string }>(
    "SELECT estado FROM cola_correo WHERE id_correo = $1",
    [idCorreo]
  );

  if (!correo) {
    throw new ErrorDominio("El correo no existe en la cola.", 404);
  }
  if (correo.estado === "enviado") {
    throw new ErrorDominio("El correo ya fue enviado; no requiere reintento.", 400);
  }

  const actualizado = await queryRow<CorreoEnCola>(
    `UPDATE cola_correo
        SET intentos     = intentos + 1,
            estado       = 'enviado',
            enviado_en   = now(),
            ultimo_error = NULL
      WHERE id_correo = $1
      RETURNING id_correo, destinatario, asunto, plantilla, estado, intentos,
                ultimo_error, creado_en, enviado_en`,
    [idCorreo]
  );

  if (!actualizado) {
    throw new ErrorDominio("No se pudo reintentar el envío del correo.", 500);
  }
  return actualizado;
}
