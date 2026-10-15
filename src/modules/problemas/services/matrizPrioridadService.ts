import { query, queryRow } from "@/shared/lib/db";

export interface ConfigMatrizProblemas {
  usar_matriz_propia: boolean;
  permitir_prioridad_manual: boolean;
  perfiles_prioridad_manual: number[];
  recalcular_al_cambiar: boolean;
  tooltips_impacto: Record<string, string>;
  tooltips_urgencia: Record<string, string>;
}

export const CONFIG_MATRIZ_PROBLEMAS_DEFECTO: ConfigMatrizProblemas = {
  usar_matriz_propia: false,
  permitir_prioridad_manual: true,
  perfiles_prioridad_manual: [1, 10, 4], // Admin, Gestor de Problemas, Supervisor
  recalcular_al_cambiar: true,
  tooltips_impacto: {
    "1": "Baja: afecta a funciones accesorias o a un único usuario sin impacto en operaciones críticas.",
    "2": "Media: degradación parcial del rendimiento de un servicio sin paralización total.",
    "3": "Alta: afectación crítica o interrupción total de un servicio esencial o más de 100 usuarios.",
  },
  tooltips_urgencia: {
    "1": "Baja: la investigación puede programarse de forma estándar sin riesgo de recurrencia inmediata.",
    "2": "Media: existen incidentes concurrentes o riesgo de recurrencia en horas punta.",
    "3": "Alta: incidentes activos bloqueantes o compromiso de continuidad de negocio inminente.",
  },
};

export async function obtenerMatrizPrioridad() {
  const [prioridades, celdasCompartidas, celdasProblemas, configRow] = await Promise.all([
    query<any>(
      "SELECT id_prioridad, codigo, nombre, nivel, color, tiempo_resolucion_horas FROM prioridad_ticket WHERE estado_registro = true ORDER BY nivel ASC"
    ),
    query<any>(
      "SELECT * FROM matriz_prioridad_institucional WHERE entidad = 'compartida' ORDER BY nivel_impacto DESC, nivel_urgencia DESC"
    ),
    query<any>(
      "SELECT * FROM matriz_prioridad_institucional WHERE entidad = 'problema' ORDER BY nivel_impacto DESC, nivel_urgencia DESC"
    ),
    queryRow<{ valor: any }>(
      "SELECT valor FROM configuracion_sistema WHERE clave = 'matriz_problemas_config'"
    ),
  ]);

  let config = CONFIG_MATRIZ_PROBLEMAS_DEFECTO;
  if (configRow?.valor) {
    config = typeof configRow.valor === "string" ? JSON.parse(configRow.valor) : configRow.valor;
  }

  return {
    ok: true,
    prioridades,
    celdas_compartidas: celdasCompartidas,
    celdas_problemas: celdasProblemas,
    config,
  };
}

export async function actualizarMatrizPrioridad(body: any, idUsuario: number) {
  const { config, celdas_problemas, celdas_compartidas } = body;

  if (Array.isArray(celdas_problemas) && celdas_problemas.length > 0) {
    for (const celda of celdas_problemas) {
      await query(
        `INSERT INTO matriz_prioridad_institucional (entidad, nivel_impacto, nivel_urgencia, id_prioridad, fecha_modificacion)
          VALUES ('problema', $1, $2, $3, NOW())
          ON CONFLICT (entidad, nivel_impacto, nivel_urgencia) DO UPDATE SET
            id_prioridad = EXCLUDED.id_prioridad,
            fecha_modificacion = NOW()`,
        [celda.nivel_impacto, celda.nivel_urgencia, celda.id_prioridad]
      );
    }
  }

  if (Array.isArray(celdas_compartidas) && celdas_compartidas.length > 0) {
    for (const celda of celdas_compartidas) {
      await query(
        `INSERT INTO matriz_prioridad_institucional (entidad, nivel_impacto, nivel_urgencia, id_prioridad, fecha_modificacion)
          VALUES ('compartida', $1, $2, $3, NOW())
          ON CONFLICT (entidad, nivel_impacto, nivel_urgencia) DO UPDATE SET
            id_prioridad = EXCLUDED.id_prioridad,
            fecha_modificacion = NOW()`,
        [celda.nivel_impacto, celda.nivel_urgencia, celda.id_prioridad]
      );
    }
  }

  if (config) {
    await query(
      `INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, usuario_modificacion, fecha_modificacion)
        VALUES ('matriz_problemas_config', 'PROBLEMAS', 'Configuración de matriz y priorización para el módulo de problemas', $1, $2, NOW())
        ON CONFLICT (clave) DO UPDATE SET
          valor = EXCLUDED.valor,
          usuario_modificacion = EXCLUDED.usuario_modificacion,
          fecha_modificacion = NOW()`,
      [JSON.stringify(config), idUsuario]
    );
  }

  return { ok: true, mensaje: "Matriz y opciones de prioridad actualizadas exitosamente." };
}
