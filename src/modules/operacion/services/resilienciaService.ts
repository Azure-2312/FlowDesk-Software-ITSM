import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface DatosResiliencia {
  id_servicio?: unknown;
  objetivo_disponibilidad?: unknown;
  disponibilidad_observada?: unknown;
  rto_horas?: unknown;
  rpo_horas?: unknown;
  umbral_capacidad_pct?: unknown;
  consumo_capacidad_pct?: unknown;
  plan_continuidad?: unknown;
  ultima_prueba?: unknown;
  proxima_prueba?: unknown;
  resultado_ultima_prueba?: unknown;
}

function numeroOpcional(valor: unknown): number | null {
  return valor === "" || valor == null ? null : Number(valor);
}

export async function listarResiliencia() {
  const registros = await query(
    `
    SELECT r.*,s.codigo_servicio,s.nombre AS servicio_nombre
    FROM resiliencia_servicio r JOIN servicio_catalogo s ON s.id_servicio=r.id_servicio
    WHERE r.estado_registro=true AND s.estado_registro=true ORDER BY s.nombre
  `
  );
  const servicios = await query(
    "SELECT id_servicio,codigo_servicio,nombre FROM servicio_catalogo WHERE estado_registro=true ORDER BY nombre"
  );
  return { registros, servicios };
}

export async function guardarResiliencia(datos: DatosResiliencia, idUsuario: number) {
  const idServicio = Number(datos.id_servicio);
  const objetivo = Number(datos.objetivo_disponibilidad);
  const rto = numeroOpcional(datos.rto_horas);
  const rpo = numeroOpcional(datos.rpo_horas);
  const umbral = numeroOpcional(datos.umbral_capacidad_pct);
  const plan = String(datos.plan_continuidad || "").trim();

  if (
    !Number.isInteger(idServicio) ||
    !Number.isFinite(objetivo) ||
    objetivo < 0 ||
    objetivo > 100 ||
    !plan
  ) {
    throw new ErrorDominio(
      "Servicio, objetivo de disponibilidad y plan de continuidad son obligatorios"
    );
  }
  if (
    (rto !== null && (!Number.isFinite(rto) || rto < 0)) ||
    (rpo !== null && (!Number.isFinite(rpo) || rpo < 0)) ||
    (umbral !== null && (!Number.isInteger(umbral) || umbral < 1 || umbral > 100))
  ) {
    throw new ErrorDominio("RTO, RPO o umbral de capacidad no válido");
  }

  return queryRow(
    `
    INSERT INTO resiliencia_servicio(id_servicio,objetivo_disponibilidad,disponibilidad_observada,rto_horas,rpo_horas,umbral_capacidad_pct,consumo_capacidad_pct,plan_continuidad,ultima_prueba,proxima_prueba,resultado_ultima_prueba,id_responsable,usuario_creacion,usuario_modificacion,fecha_modificacion,estado_registro)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12,$12,now(),true)
    ON CONFLICT(id_servicio) DO UPDATE SET objetivo_disponibilidad=EXCLUDED.objetivo_disponibilidad,disponibilidad_observada=EXCLUDED.disponibilidad_observada,rto_horas=EXCLUDED.rto_horas,rpo_horas=EXCLUDED.rpo_horas,umbral_capacidad_pct=EXCLUDED.umbral_capacidad_pct,consumo_capacidad_pct=EXCLUDED.consumo_capacidad_pct,plan_continuidad=EXCLUDED.plan_continuidad,ultima_prueba=EXCLUDED.ultima_prueba,proxima_prueba=EXCLUDED.proxima_prueba,resultado_ultima_prueba=EXCLUDED.resultado_ultima_prueba,id_responsable=EXCLUDED.id_responsable,usuario_modificacion=EXCLUDED.usuario_modificacion,fecha_modificacion=now(),estado_registro=true
    RETURNING *
  `,
    [
      idServicio,
      objetivo,
      numeroOpcional(datos.disponibilidad_observada),
      rto,
      rpo,
      umbral,
      numeroOpcional(datos.consumo_capacidad_pct),
      plan,
      datos.ultima_prueba || null,
      datos.proxima_prueba || null,
      String(datos.resultado_ultima_prueba || "").trim() || null,
      idUsuario,
    ]
  );
}
