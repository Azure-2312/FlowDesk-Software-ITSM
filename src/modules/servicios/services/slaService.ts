import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface PoliticaSla {
  meta_cumplimiento_porcentaje: number;
  tipo_jornada: "habil" | "24x7";
  hora_inicio_jornada: number;
  hora_fin_jornada: number;
  pausar_espera_solicitante: boolean;
  pausar_espera_proveedor: boolean;
  umbral_alerta_preventiva_pct: number;
  umbral_alerta_critica_pct: number;
}

export const POLITICA_SLA_DEFECTO: PoliticaSla = {
  meta_cumplimiento_porcentaje: 80,
  tipo_jornada: "habil",
  hora_inicio_jornada: 8,
  hora_fin_jornada: 18,
  pausar_espera_solicitante: true,
  pausar_espera_proveedor: true,
  umbral_alerta_preventiva_pct: 75,
  umbral_alerta_critica_pct: 90,
};

export async function obtenerObjetivosSla() {
  const [prioridades, configRow, motivosEspera, objetivosOla] = await Promise.all([
    query(`
      SELECT id_prioridad, codigo, nombre, nivel, tiempo_primera_respuesta_hrs, tiempo_resolucion_horas, color, estado_registro
      FROM prioridad_ticket
      WHERE estado_registro = true
      ORDER BY nivel ASC
    `),
    queryRow<{ valor: unknown }>(`
      SELECT valor
      FROM configuracion_sistema
      WHERE clave = 'politica_sla_global'
    `),
    query(`
      SELECT id_motivo_espera, nombre, descripcion, estado_registro
      FROM motivo_espera_ticket
      WHERE estado_registro = true
      ORDER BY id_motivo_espera ASC
    `),
    query(`
      SELECT pot.id_objetivo, pot.id_prioridad, pt.codigo as prioridad_codigo, pt.nombre as prioridad_nombre, pt.color as prioridad_color,
             pot.primera_respuesta_horas, pot.diagnostico_horas, pot.resolucion_total_horas, pot.descripcion_operativa
      FROM problema_objetivo_tiempo pot
      JOIN prioridad_ticket pt ON pt.id_prioridad = pot.id_prioridad
      ORDER BY pt.nivel ASC
    `).catch(() => []),
  ]);

  let politicaSla: PoliticaSla = POLITICA_SLA_DEFECTO;
  if (configRow?.valor) {
    politicaSla =
      typeof configRow.valor === "string"
        ? (JSON.parse(configRow.valor) as PoliticaSla)
        : (configRow.valor as PoliticaSla);
  }

  return { prioridades, politicaSla, motivosEspera, objetivosOla };
}

export interface PrioridadSla {
  id_prioridad: number;
  codigo?: string;
  nombre?: string;
  tiempo_primera_respuesta_hrs: number | string;
  tiempo_resolucion_horas: number | string;
}

export interface ObjetivoOla {
  id_prioridad: number;
  prioridad_codigo?: string;
  prioridad_nombre?: string;
  primera_respuesta_horas: number | string;
  diagnostico_horas: number | string;
  resolucion_total_horas: number | string;
}

export interface ActualizacionObjetivosSla {
  prioridades?: PrioridadSla[];
  politicaSla?: PoliticaSla;
  objetivosOla?: ObjetivoOla[];
}

export interface ContextoAuditoria {
  idUsuario: number;
  nombres: string;
  ip: string;
}

export async function actualizarObjetivosSla(
  body: ActualizacionObjetivosSla,
  contexto: ContextoAuditoria
) {
  const { prioridades, politicaSla, objetivosOla } = body;

  if (!Array.isArray(prioridades) || prioridades.length === 0) {
    throw new ErrorDominio("Debe especificar la matriz de prioridades.");
  }

  for (const p of prioridades) {
    const resp = Number(p.tiempo_primera_respuesta_hrs);
    const resol = Number(p.tiempo_resolucion_horas);
    if (isNaN(resp) || resp <= 0 || isNaN(resol) || resol <= 0) {
      throw new ErrorDominio(
        `Tiempos inválidos para prioridad ${p.codigo || p.nombre}. Deben ser valores numéricos mayores a 0.`
      );
    }
    if (resp > resol) {
      throw new ErrorDominio(
        `El tiempo de primera respuesta no puede ser mayor al tiempo de resolución total en ${p.codigo || p.nombre}.`
      );
    }
  }

  if (Array.isArray(objetivosOla)) {
    for (const o of objetivosOla) {
      const resp = Number(o.primera_respuesta_horas);
      const diag = Number(o.diagnostico_horas);
      const resol = Number(o.resolucion_total_horas);
      if (isNaN(resp) || resp <= 0 || isNaN(diag) || diag <= 0 || isNaN(resol) || resol <= 0) {
        throw new ErrorDominio(
          `Tiempos inválidos para OLA de ${o.prioridad_codigo || o.prioridad_nombre}. Deben ser números mayores a 0.`
        );
      }
    }
  }

  const meta = Number(politicaSla?.meta_cumplimiento_porcentaje);
  if (isNaN(meta) || meta < 1 || meta > 100) {
    throw new ErrorDominio("La meta de cumplimiento debe ser un porcentaje entre 1 y 100.");
  }

  for (const p of prioridades) {
    await query(
      `UPDATE prioridad_ticket
       SET tiempo_primera_respuesta_hrs = $1,
           tiempo_resolucion_horas = $2
       WHERE id_prioridad = $3`,
      [Number(p.tiempo_primera_respuesta_hrs), Number(p.tiempo_resolucion_horas), p.id_prioridad]
    );
  }

  if (Array.isArray(objetivosOla)) {
    for (const ola of objetivosOla) {
      await query(
        `UPDATE problema_objetivo_tiempo
         SET primera_respuesta_horas = $1,
             diagnostico_horas = $2,
             resolucion_total_horas = $3,
             fecha_modificacion = NOW()
         WHERE id_prioridad = $4`,
        [
          Number(ola.primera_respuesta_horas),
          Number(ola.diagnostico_horas),
          Number(ola.resolucion_total_horas),
          ola.id_prioridad,
        ]
      );
    }
  }

  await query(
    `INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, fecha_modificacion)
     VALUES ('politica_sla_global', 'servicios', 'Política institucional y objetivos de Acuerdos de Nivel de Servicio (SLA)', $1, NOW())
     ON CONFLICT (clave) DO UPDATE SET
       valor = EXCLUDED.valor,
       fecha_modificacion = NOW()`,
    [JSON.stringify(politicaSla)]
  );

  await query(
    `INSERT INTO log_auditoria_sistema (
      id_usuario, modulo, accion, descripcion, detalles, direccion_ip
    ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      contexto.idUsuario,
      "SERVICIOS_SLA",
      "ACTUALIZAR_OBJETIVOS_SLA",
      `El usuario ${contexto.nombres} actualizó los objetivos globales de SLA y la matriz OLA/SLA (Meta: ${meta}%).`,
      JSON.stringify({ prioridades, politicaSla, objetivosOla }),
      contexto.ip,
    ]
  );

  return { ok: true, mensaje: "Objetivos SLA y OLA actualizados exitosamente." };
}
