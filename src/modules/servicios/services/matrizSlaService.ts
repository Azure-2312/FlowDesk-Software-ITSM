import { query, queryRow } from "@/shared/lib/db";

export interface ConfigMatrizSla {
  usar_matriz_propia: boolean;
  permitir_prioridad_manual: boolean;
  perfiles_prioridad_manual: number[];
  recalcular_al_cambiar: boolean;
  tooltips_impacto: Record<string, string>;
  tooltips_urgencia: Record<string, string>;
}

export interface CeldaMatriz {
  nivel_impacto: number;
  nivel_urgencia: number;
  id_prioridad: number;
}

export const CONFIG_MATRIZ_DEFECTO: ConfigMatrizSla = {
  usar_matriz_propia: false,
  permitir_prioridad_manual: true,
  perfiles_prioridad_manual: [1, 4, 10], // Admin, Supervisor, Gestor
  recalcular_al_cambiar: true,
  tooltips_impacto: {
    "1": "Baja: afecta a funciones accesorias o a un único usuario sin impacto en operaciones críticas.",
    "2": "Media: degradación parcial del rendimiento de un servicio sin paralización total.",
    "3": "Alta: afectación crítica o interrupción total de un servicio esencial o más de 100 usuarios.",
  },
  tooltips_urgencia: {
    "1": "Baja: la atención puede programarse de forma estándar sin riesgo operativo inmediato.",
    "2": "Media: existen incidentes concurrentes o riesgo de recurrencia en horas punta.",
    "3": "Alta: afectación crítica o bloqueo inmediato de la continuidad del negocio.",
  },
};

export async function obtenerMatrizSla() {
  const [prioridades, celdasCompartidas, celdasProblemas, configRow] = await Promise.all([
    query(
      "SELECT id_prioridad, codigo, nombre, nivel, color, tiempo_resolucion_horas FROM prioridad_ticket WHERE estado_registro = true ORDER BY nivel ASC"
    ),
    query(
      "SELECT * FROM matriz_prioridad_institucional WHERE entidad = 'compartida' ORDER BY nivel_impacto DESC, nivel_urgencia DESC"
    ),
    query(
      "SELECT * FROM matriz_prioridad_institucional WHERE entidad = 'problema' ORDER BY nivel_impacto DESC, nivel_urgencia DESC"
    ),
    queryRow<{ valor: unknown }>(
      "SELECT valor FROM configuracion_sistema WHERE clave = 'matriz_problemas_config'"
    ),
  ]);

  let config: ConfigMatrizSla = CONFIG_MATRIZ_DEFECTO;
  if (configRow?.valor) {
    config =
      typeof configRow.valor === "string"
        ? (JSON.parse(configRow.valor) as ConfigMatrizSla)
        : (configRow.valor as ConfigMatrizSla);
  }

  return {
    ok: true,
    prioridades,
    celdas_compartidas: celdasCompartidas,
    celdas_problemas: celdasProblemas,
    config,
  };
}

async function upsertCeldas(entidad: "compartida" | "problema", celdas: CeldaMatriz[]) {
  for (const celda of celdas) {
    await query(
      `INSERT INTO matriz_prioridad_institucional (entidad, nivel_impacto, nivel_urgencia, id_prioridad, fecha_modificacion)
       VALUES ($4, $1, $2, $3, NOW())
       ON CONFLICT (entidad, nivel_impacto, nivel_urgencia) DO UPDATE SET
         id_prioridad = EXCLUDED.id_prioridad,
         fecha_modificacion = NOW()`,
      [celda.nivel_impacto, celda.nivel_urgencia, celda.id_prioridad, entidad]
    );
  }
}

export interface ActualizacionMatrizSla {
  config?: unknown;
  celdas_problemas?: CeldaMatriz[];
  celdas_compartidas?: CeldaMatriz[];
}

export async function actualizarMatrizSla(body: ActualizacionMatrizSla, idUsuario: number) {
  const { config, celdas_problemas, celdas_compartidas } = body;

  if (Array.isArray(celdas_compartidas) && celdas_compartidas.length > 0) {
    await upsertCeldas("compartida", celdas_compartidas);
  }
  if (Array.isArray(celdas_problemas) && celdas_problemas.length > 0) {
    await upsertCeldas("problema", celdas_problemas);
  }

  if (config) {
    await query(
      `INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, usuario_modificacion, fecha_modificacion)
       VALUES ('matriz_problemas_config', 'PROBLEMAS', 'Configuración de matriz y priorización ITIL para SLA y Problemas', $1, $2, NOW())
       ON CONFLICT (clave) DO UPDATE SET
         valor = EXCLUDED.valor,
         usuario_modificacion = EXCLUDED.usuario_modificacion,
         fecha_modificacion = NOW()`,
      [JSON.stringify(config), idUsuario]
    );
  }

  return { ok: true, mensaje: "Matriz institucional de prioridad actualizada exitosamente." };
}
