import { query } from "@/shared/lib/db";

/**
 * Auditoría de exactitud de la CMDB (solo lectura): controles de consistencia
 * entre activos (ITAM), elementos de configuración (CI) y sus relaciones.
 * Lógica de dominio movida desde src/modules/perfiles/auditor para que el rol
 * solo conserve su UI.
 */

async function conteo(sql: string, params: any[] = []) {
  const filas = await query<{ total: number }>(sql, params);
  return filas[0]?.total ?? 0;
}

export async function obtenerResultadosCmdb() {
  const [sinCi, ciSinActivo, ciSinRelacion, ciCriticosSinRelacion, activosSinCustodio, ciSinSoporte, seriesDuplicadas] =
    await Promise.all([
      conteo(
        `SELECT COUNT(*)::int AS total FROM activo a
         WHERE a.estado_registro = true
           AND NOT EXISTS (SELECT 1 FROM elemento_configuracion ci WHERE ci.id_activo = a.id_activo AND ci.estado_registro = true)`
      ),
      conteo(`SELECT COUNT(*)::int AS total FROM elemento_configuracion ci WHERE ci.estado_registro = true AND ci.id_activo IS NULL`),
      conteo(
        `SELECT COUNT(*)::int AS total FROM elemento_configuracion ci
         WHERE ci.estado_registro = true
           AND NOT EXISTS (SELECT 1 FROM ci_relacion r WHERE r.id_ci_padre = ci.id_ci OR r.id_ci_hijo = ci.id_ci)`
      ),
      conteo(
        `SELECT COUNT(*)::int AS total FROM elemento_configuracion ci
         WHERE ci.estado_registro = true AND ci.criticidad = 'CRITICA'
           AND NOT EXISTS (SELECT 1 FROM ci_relacion r WHERE r.id_ci_padre = ci.id_ci OR r.id_ci_hijo = ci.id_ci)`
      ),
      conteo(`SELECT COUNT(*)::int AS total FROM activo WHERE estado_registro = true AND id_usuario_custodio IS NULL AND estado_activo = 'EN_OPERACION'`),
      conteo(`SELECT COUNT(*)::int AS total FROM elemento_configuracion WHERE estado_registro = true AND id_departamento_soporte IS NULL`),
      conteo(
        `SELECT COUNT(*)::int AS total FROM (
           SELECT numero_serie FROM activo
           WHERE estado_registro = true AND numero_serie IS NOT NULL AND btrim(numero_serie) <> ''
           GROUP BY numero_serie HAVING COUNT(*) > 1
         ) d`
      ),
    ]);

  const muestraSinCi = await query(
    `SELECT a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo
     FROM activo a
     WHERE a.estado_registro = true
       AND NOT EXISTS (SELECT 1 FROM elemento_configuracion ci WHERE ci.id_activo = a.id_activo AND ci.estado_registro = true)
     ORDER BY a.codigo_patrimonial LIMIT 10`
  );
  const muestraCiHuerfano = await query(
    `SELECT ci.codigo_ci, ci.nombre, ci.tipo_ci, ci.criticidad
     FROM elemento_configuracion ci
     WHERE ci.estado_registro = true AND ci.id_activo IS NULL
     ORDER BY ci.codigo_ci LIMIT 10`
  );
  const muestraCiSinRelacion = await query(
    `SELECT ci.codigo_ci, ci.nombre, ci.tipo_ci, ci.criticidad
     FROM elemento_configuracion ci
     WHERE ci.estado_registro = true
       AND NOT EXISTS (SELECT 1 FROM ci_relacion r WHERE r.id_ci_padre = ci.id_ci OR r.id_ci_hijo = ci.id_ci)
     ORDER BY ci.criticidad, ci.codigo_ci LIMIT 10`
  );

  return {
    controles: [
      { codigo: "CMDB-01", nombre: "Activos sin CI asociado", severidad: "MEDIA", total: sinCi, muestra: muestraSinCi },
      { codigo: "CMDB-02", nombre: "CI sin activo de origen", severidad: "BAJA", total: ciSinActivo, muestra: muestraCiHuerfano },
      { codigo: "CMDB-03", nombre: "CI sin relaciones", severidad: "MEDIA", total: ciSinRelacion, muestra: muestraCiSinRelacion },
      { codigo: "CMDB-04", nombre: "CI crítico sin relaciones", severidad: "ALTA", total: ciCriticosSinRelacion, muestra: [] },
      { codigo: "CMDB-05", nombre: "Activo en operación sin custodio", severidad: "MEDIA", total: activosSinCustodio, muestra: [] },
      { codigo: "CMDB-06", nombre: "CI sin departamento de soporte", severidad: "BAJA", total: ciSinSoporte, muestra: [] },
      { codigo: "CMDB-07", nombre: "Números de serie duplicados", severidad: "ALTA", total: seriesDuplicadas, muestra: [] },
    ],
  };
}
