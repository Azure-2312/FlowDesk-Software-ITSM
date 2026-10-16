import { query, queryRow } from "@/shared/lib/db";

/** Detección de conflictos de calendario y capacidad para el Gestor de Cambios. */

export async function detectarConflictos() {
  const [solapamientos, congelamientos, feriados, capacidad, duracionMaxima] = await Promise.all([
    query(
      `SELECT a.id_cambio AS id_a, b.id_cambio AS id_b,
              a.codigo_cambio AS codigo_a, b.codigo_cambio AS codigo_b,
              a.titulo AS titulo_a, b.titulo AS titulo_b,
              a.ventana_inicio AS inicio_a, a.ventana_fin AS fin_a,
              b.ventana_inicio AS inicio_b, b.ventana_fin AS fin_b,
              (a.id_ci_afectado IS NOT NULL AND a.id_ci_afectado = b.id_ci_afectado) AS mismo_ci
       FROM cambio a
       JOIN cambio b ON a.id_cambio < b.id_cambio
       WHERE a.estado_registro = true AND b.estado_registro = true
         AND a.id_estado IN (3, 4, 5) AND b.id_estado IN (3, 4, 5)
         AND a.ventana_inicio IS NOT NULL AND a.ventana_fin IS NOT NULL
         AND b.ventana_inicio IS NOT NULL AND b.ventana_fin IS NOT NULL
         AND a.ventana_inicio < b.ventana_fin AND b.ventana_inicio < a.ventana_fin
       ORDER BY a.ventana_inicio`
    ),
    query(
      `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.ventana_inicio, c.ventana_fin,
              p.nombre AS congelamiento, p.severidad, p.fecha_inicio AS congela_desde, p.fecha_fin AS congela_hasta
       FROM cambio c
       JOIN periodos_congelamiento p ON c.ventana_inicio < p.fecha_fin AND p.fecha_inicio < c.ventana_fin
       WHERE c.estado_registro = true AND c.id_estado IN (3, 4, 5) AND p.activo = true
       ORDER BY c.ventana_inicio`
    ),
    query(
      `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.ventana_inicio, c.ventana_fin,
              f.nombre AS feriado, f.fecha_inicio AS feriado_inicio, f.fecha_fin AS feriado_fin
       FROM cambio c
       JOIN calendario_feriados f ON c.ventana_inicio <= f.fecha_fin AND f.fecha_inicio <= c.ventana_fin
       WHERE c.estado_registro = true AND c.id_estado IN (3, 4, 5) AND f.activo = true
       ORDER BY c.ventana_inicio`
    ),
    query(
      `SELECT date_trunc('day', ventana_inicio)::date AS dia, COUNT(*)::int AS total
       FROM cambio
       WHERE estado_registro = true AND id_estado IN (3, 4, 5) AND ventana_inicio IS NOT NULL
       GROUP BY 1 HAVING COUNT(*) > $1 ORDER BY 1`,
      [5]
    ),
    queryRow<{ duracion_maxima_horas: number }>(
      `SELECT duracion_maxima_horas FROM configuracion_rfc ORDER BY id_configuracion DESC LIMIT 1`
    ),
  ]);

  const maxDuracion = duracionMaxima?.duracion_maxima_horas ?? 12;
  const duraciones = await query(
    `SELECT id_cambio, codigo_cambio, titulo, ventana_inicio, ventana_fin,
            EXTRACT(EPOCH FROM (ventana_fin - ventana_inicio)) / 3600 AS horas
     FROM cambio
     WHERE estado_registro = true AND id_estado IN (3, 4, 5)
       AND ventana_inicio IS NOT NULL AND ventana_fin IS NOT NULL
       AND EXTRACT(EPOCH FROM (ventana_fin - ventana_inicio)) / 3600 > $1
     ORDER BY horas DESC`,
    [maxDuracion]
  );

  return {
    solapamientos,
    congelamientos,
    feriados,
    capacidad,
    duraciones,
    parametros: { max_simultaneo: 5, duracion_maxima_horas: maxDuracion },
  };
}

export async function validarProgramacion(idCambio: number, inicio: string, fin: string) {
  const solapamiento = await query(
    `SELECT c.codigo_cambio, c.titulo, c.ventana_inicio, c.ventana_fin,
            (c.id_ci_afectado IS NOT NULL AND c.id_ci_afectado = x.id_ci_afectado) AS mismo_ci
     FROM cambio c
     JOIN cambio x ON x.id_cambio = $1
     WHERE c.id_cambio <> $1 AND c.estado_registro = true AND c.id_estado IN (3, 4, 5)
       AND c.ventana_inicio IS NOT NULL AND c.ventana_fin IS NOT NULL
       AND c.ventana_inicio < $3 AND $2 < c.ventana_fin`,
    [idCambio, inicio, fin]
  );

  const congelamiento = await query(
    `SELECT nombre, severidad FROM periodos_congelamiento
     WHERE activo = true AND fecha_inicio < $2 AND $1 < fecha_fin`,
    [inicio, fin]
  );

  const feriado = await query(
    `SELECT nombre FROM calendario_feriados
     WHERE activo = true AND fecha_inicio <= $2 AND $1 <= fecha_fin`,
    [inicio, fin]
  );

  return { solapamiento, congelamiento, feriado };
}
