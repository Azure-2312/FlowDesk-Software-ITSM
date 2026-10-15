import { query, queryRow } from "@/shared/lib/db";

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
