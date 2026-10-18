import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Analisis avanzado de la CMDB (Gestion de Configuracion del Servicio):
 *
 *  - Topologia: vecindad (arriba/abajo) de un CI para dibujar el mapa.
 *  - Impacto: que CIs y que tickets/cambios/problemas se ven afectados si
 *    un CI falla (recorrido recursivo del grafo de dependencias).
 *  - Reconciliacion Activo <-> CI: calidad de datos de la CMDB.
 *  - Historial de configuracion por CI (actualizaciones, lineas base e
 *    inexactitudes).
 *
 * Todas las consultas recursivas usan UNION (no UNION ALL) para cortar de
 * raiz los posibles ciclos del grafo de dependencias.
 */

const LIMITE_VECINDAD = 30;
const LIMITE_AFECTADOS = 200;
const LIMITE_LISTAS = 100;

export async function obtenerTopologia(idCi: number, profundidad = 2) {
  const ci = await queryRow(
    `SELECT id_ci, codigo_ci, nombre, tipo_ci, ambiente, criticidad
     FROM elemento_configuracion WHERE id_ci = $1`,
    [idCi]
  );
  if (!ci) throw new ErrorDominio("Elemento de configuración no encontrado.", 404);

  const nodos = await query(
    `WITH RECURSIVE descendientes AS (
        SELECT cr.id_ci_hijo AS id_ci, 1 AS nivel
        FROM ci_relacion cr WHERE cr.id_ci_padre = $1
        UNION
        SELECT cr.id_ci_hijo, d.nivel + 1
        FROM ci_relacion cr JOIN descendientes d ON cr.id_ci_padre = d.id_ci
        WHERE d.nivel < $2
     ),
     ascendientes AS (
        SELECT cr.id_ci_padre AS id_ci, 1 AS nivel
        FROM ci_relacion cr WHERE cr.id_ci_hijo = $1
        UNION
        SELECT cr.id_ci_padre, a.nivel + 1
        FROM ci_relacion cr JOIN ascendientes a ON cr.id_ci_hijo = a.id_ci
        WHERE a.nivel < $2
     ),
     alcance AS (
        SELECT $1::int AS id_ci
        UNION SELECT id_ci FROM descendientes
        UNION SELECT id_ci FROM ascendientes
     )
     SELECT ci.id_ci, ci.codigo_ci, ci.nombre, ci.tipo_ci, ci.ambiente, ci.criticidad,
            (ci.id_ci = $1) AS es_raiz,
            (SELECT MIN(nivel) FROM descendientes d WHERE d.id_ci = ci.id_ci) AS nivel_desc,
            (SELECT MIN(nivel) FROM ascendientes a WHERE a.id_ci = ci.id_ci) AS nivel_asc
     FROM alcance x
     JOIN elemento_configuracion ci ON ci.id_ci = x.id_ci
     ORDER BY es_raiz DESC, ci.criticidad ASC, ci.codigo_ci ASC
     LIMIT ${LIMITE_VECINDAD}`,
    [idCi, profundidad]
  );

  const aristas = await query(
    `WITH RECURSIVE descendientes AS (
        SELECT cr.id_ci_hijo AS id_ci, 1 AS nivel
        FROM ci_relacion cr WHERE cr.id_ci_padre = $1
        UNION
        SELECT cr.id_ci_hijo, d.nivel + 1
        FROM ci_relacion cr JOIN descendientes d ON cr.id_ci_padre = d.id_ci
        WHERE d.nivel < $2
     ),
     ascendientes AS (
        SELECT cr.id_ci_padre AS id_ci, 1 AS nivel
        FROM ci_relacion cr WHERE cr.id_ci_hijo = $1
        UNION
        SELECT cr.id_ci_padre, a.nivel + 1
        FROM ci_relacion cr JOIN ascendientes a ON cr.id_ci_hijo = a.id_ci
        WHERE a.nivel < $2
     ),
     alcance AS (
        SELECT $1::int AS id_ci
        UNION SELECT id_ci FROM descendientes
        UNION SELECT id_ci FROM ascendientes
     )
     SELECT cr.id_ci_padre, cr.id_ci_hijo, cr.tipo_relacion
     FROM ci_relacion cr
     WHERE cr.id_ci_padre IN (SELECT id_ci FROM alcance)
       AND cr.id_ci_hijo IN (SELECT id_ci FROM alcance)`,
    [idCi, profundidad]
  );

  return { ci, nodos, aristas, profundidad };
}

export async function analizarImpacto(idCi: number) {
  const ci = await queryRow(
    `SELECT id_ci, codigo_ci, nombre, tipo_ci, ambiente, criticidad
     FROM elemento_configuracion WHERE id_ci = $1`,
    [idCi]
  );
  if (!ci) throw new ErrorDominio("Elemento de configuración no encontrado.", 404);

  // CIs que dependen (transitivamente) de este: si cae el CI, caen ellos.
  const afectados = await query(
    `WITH RECURSIVE afectados AS (
        SELECT cr.id_ci_hijo AS id_ci FROM ci_relacion cr WHERE cr.id_ci_padre = $1
        UNION
        SELECT cr.id_ci_hijo
        FROM ci_relacion cr JOIN afectados a ON cr.id_ci_padre = a.id_ci
     )
     SELECT ci.id_ci, ci.codigo_ci, ci.nombre, ci.tipo_ci, ci.ambiente, ci.criticidad
     FROM afectados a
     JOIN elemento_configuracion ci ON ci.id_ci = a.id_ci
     WHERE ci.estado_registro = true
     ORDER BY ci.criticidad ASC, ci.codigo_ci ASC
     LIMIT ${LIMITE_AFECTADOS}`,
    [idCi]
  );

  // CIs de los que este depende (transitivamente): su falla tambien arrastra.
  const origenes = await query(
    `WITH RECURSIVE origenes AS (
        SELECT cr.id_ci_padre AS id_ci FROM ci_relacion cr WHERE cr.id_ci_hijo = $1
        UNION
        SELECT cr.id_ci_padre
        FROM ci_relacion cr JOIN origenes o ON cr.id_ci_hijo = o.id_ci
     )
     SELECT ci.id_ci, ci.codigo_ci, ci.nombre, ci.tipo_ci, ci.ambiente, ci.criticidad
     FROM origenes o
     JOIN elemento_configuracion ci ON ci.id_ci = o.id_ci
     WHERE ci.estado_registro = true
     ORDER BY ci.criticidad ASC, ci.codigo_ci ASC
     LIMIT ${LIMITE_AFECTADOS}`,
    [idCi]
  );

  const idsAfectados = [idCi, ...afectados.map((a: any) => a.id_ci)];

  const tickets = await query(
    `SELECT t.id_ticket, t.codigo_ticket, t.titulo, t.id_ci, t.fecha_creacion
     FROM ticket t
     WHERE t.estado_registro = true AND t.id_ci = ANY($1::int[])
     ORDER BY t.fecha_creacion DESC
     LIMIT ${LIMITE_LISTAS}`,
    [idsAfectados]
  );

  const cambios = await query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.id_ci_afectado, c.fecha_creacion
     FROM cambio c
     WHERE c.estado_registro = true AND c.id_ci_afectado = ANY($1::int[])
     ORDER BY c.fecha_creacion DESC
     LIMIT ${LIMITE_LISTAS}`,
    [idsAfectados]
  );

  const problemas = await query(
    `SELECT p.id_problema, p.codigo_problema, p.titulo, p.id_ci_afectado, p.fecha_creacion
     FROM problema p
     WHERE p.estado_registro = true AND p.id_ci_afectado = ANY($1::int[])
     ORDER BY p.fecha_creacion DESC
     LIMIT ${LIMITE_LISTAS}`,
    [idsAfectados]
  );

  return { ci, afectados, origenes, tickets, cambios, problemas };
}

export async function obtenerReconciliacion() {
  const activosSinCi = await query(
    `SELECT a.id_activo, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo, a.estado_activo
     FROM activo a
     WHERE NOT EXISTS (SELECT 1 FROM elemento_configuracion ci WHERE ci.id_activo = a.id_activo)
     ORDER BY a.codigo_patrimonial ASC
     LIMIT ${LIMITE_LISTAS}`
  );

  const ciSinActivo = await query(
    `SELECT ci.id_ci, ci.codigo_ci, ci.nombre, ci.tipo_ci, ci.criticidad
     FROM elemento_configuracion ci
     WHERE ci.estado_registro = true AND ci.id_activo IS NULL
     ORDER BY ci.codigo_ci ASC
     LIMIT ${LIMITE_LISTAS}`
  );

  const ciSinRelaciones = await query(
    `SELECT ci.id_ci, ci.codigo_ci, ci.nombre, ci.tipo_ci, ci.criticidad
     FROM elemento_configuracion ci
     WHERE ci.estado_registro = true
       AND NOT EXISTS (
         SELECT 1 FROM ci_relacion r
         WHERE r.id_ci_padre = ci.id_ci OR r.id_ci_hijo = ci.id_ci
       )
     ORDER BY ci.codigo_ci ASC
     LIMIT ${LIMITE_LISTAS}`
  );

  const ciSinSoporte = await query(
    `SELECT ci.id_ci, ci.codigo_ci, ci.nombre, ci.tipo_ci, ci.criticidad
     FROM elemento_configuracion ci
     WHERE ci.estado_registro = true AND ci.id_departamento_soporte IS NULL
     ORDER BY ci.codigo_ci ASC
     LIMIT ${LIMITE_LISTAS}`
  );

  const totales = await queryRow(
    `SELECT
       (SELECT COUNT(*) FROM elemento_configuracion WHERE estado_registro = true)::int AS total_ci,
       (SELECT COUNT(*) FROM activo)::int AS total_activos,
       (SELECT COUNT(*) FROM ci_relacion)::int AS total_relaciones`
  );

  const resumen = {
    totalCi: (totales as any)?.total_ci ?? 0,
    totalActivos: (totales as any)?.total_activos ?? 0,
    totalRelaciones: (totales as any)?.total_relaciones ?? 0,
    activosSinCi: activosSinCi.length,
    ciSinActivo: ciSinActivo.length,
    ciSinRelaciones: ciSinRelaciones.length,
    ciSinSoporte: ciSinSoporte.length,
  };

  return { resumen, activosSinCi, ciSinActivo, ciSinRelaciones, ciSinSoporte };
}

export async function obtenerHistorialCi(idCi: number) {
  const ci = await queryRow(
    `SELECT id_ci, codigo_ci, nombre, tipo_ci, ambiente, criticidad
     FROM elemento_configuracion WHERE id_ci = $1`,
    [idCi]
  );
  if (!ci) throw new ErrorDominio("Elemento de configuración no encontrado.", 404);

  const actualizaciones = await query(
    `SELECT u.id_actualizacion, u.tipo_operacion, u.detalle, u.estado,
            u.fecha_creacion, u.fecha_aplicacion,
            c.codigo_cambio, c.titulo AS cambio_titulo,
            CONCAT(us.nombres, ' ', us.apellido_paterno) AS usuario
     FROM cmdb_actualizacion u
     LEFT JOIN cambio c ON c.id_cambio = u.id_cambio
     LEFT JOIN usuario us ON us.id_usuario = u.id_usuario_aplica
     WHERE u.id_ci = $1 AND u.estado_registro = true
     ORDER BY u.fecha_creacion DESC
     LIMIT ${LIMITE_LISTAS}`,
    [idCi]
  );

  const lineasBase = await query(
    `SELECT lb.id_linea_base, lb.nombre, lb.descripcion, lb.total_elementos, lb.fecha_creacion,
            CONCAT(us.nombres, ' ', us.apellido_paterno) AS usuario
     FROM cmdb_linea_base lb
     LEFT JOIN usuario us ON us.id_usuario = lb.id_usuario_creacion
     WHERE lb.id_ci = $1 AND lb.estado_registro = true
     ORDER BY lb.fecha_creacion DESC
     LIMIT ${LIMITE_LISTAS}`,
    [idCi]
  );

  const inexactitudes = await query(
    `SELECT i.id_inexactitud, i.descripcion, i.estado, i.fecha_creacion, i.fecha_resolucion
     FROM cmdb_inexactitud i
     WHERE i.id_ci = $1 AND i.estado_registro = true
     ORDER BY i.fecha_creacion DESC
     LIMIT ${LIMITE_LISTAS}`,
    [idCi]
  );

  return { ci, actualizaciones, lineasBase, inexactitudes };
}
