import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

export const dynamic = "force-dynamic";

interface PoliticaSla {
  meta_cumplimiento_porcentaje: number;
  tipo_jornada: "habil" | "24x7";
  hora_inicio_jornada: number;
  hora_fin_jornada: number;
  pausar_espera_solicitante: boolean;
  pausar_espera_proveedor: boolean;
  umbral_alerta_preventiva_pct: number;
  umbral_alerta_critica_pct: number;
}

const POLITICA_SLA_DEFECTO: PoliticaSla = {
  meta_cumplimiento_porcentaje: 80,
  tipo_jornada: "habil",
  hora_inicio_jornada: 8,
  hora_fin_jornada: 18,
  pausar_espera_solicitante: true,
  pausar_espera_proveedor: true,
  umbral_alerta_preventiva_pct: 75,
  umbral_alerta_critica_pct: 90,
};

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const [prioridades, configRow, motivosEspera, objetivosOla] = await Promise.all([
      query(`
        SELECT id_prioridad, codigo, nombre, nivel, tiempo_primera_respuesta_hrs, tiempo_resolucion_horas, color, estado_registro
        FROM prioridad_ticket
        WHERE estado_registro = true
        ORDER BY nivel ASC
      `),
      queryRow<{ valor: any }>(`
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

    let politicaSla = POLITICA_SLA_DEFECTO;
    if (configRow?.valor) {
      politicaSla = typeof configRow.valor === "string" ? JSON.parse(configRow.valor) : configRow.valor;
    }

    return NextResponse.json({
      prioridades,
      politicaSla,
      motivosEspera,
      objetivosOla,
    });
  } catch (error) {
    console.error("Error al obtener objetivos SLA:", error);
    return NextResponse.json({ error: "Error interno al obtener objetivos SLA" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.SERVICIOS_CONFIGURAR)) {
    return NextResponse.json(
      { error: "No autorizado. Solo Administradores del Sistema pueden configurar objetivos SLA." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { prioridades, politicaSla, objetivosOla } = body;

    if (!Array.isArray(prioridades) || prioridades.length === 0) {
      return NextResponse.json({ error: "Debe especificar la matriz de prioridades." }, { status: 400 });
    }

    for (const p of prioridades) {
      const resp = Number(p.tiempo_primera_respuesta_hrs);
      const resol = Number(p.tiempo_resolucion_horas);
      if (isNaN(resp) || resp <= 0 || isNaN(resol) || resol <= 0) {
        return NextResponse.json(
          { error: `Tiempos inválidos para prioridad ${p.codigo || p.nombre}. Deben ser valores numéricos mayores a 0.` },
          { status: 400 }
        );
      }
      if (resp > resol) {
        return NextResponse.json(
          { error: `El tiempo de primera respuesta no puede ser mayor al tiempo de resolución total en ${p.codigo || p.nombre}.` },
          { status: 400 }
        );
      }
    }

    if (Array.isArray(objetivosOla)) {
      for (const o of objetivosOla) {
        const resp = Number(o.primera_respuesta_horas);
        const diag = Number(o.diagnostico_horas);
        const resol = Number(o.resolucion_total_horas);
        if (isNaN(resp) || resp <= 0 || isNaN(diag) || diag <= 0 || isNaN(resol) || resol <= 0) {
          return NextResponse.json(
            { error: `Tiempos inválidos para OLA de ${o.prioridad_codigo || o.prioridad_nombre}. Deben ser números mayores a 0.` },
            { status: 400 }
          );
        }
      }
    }

    const meta = Number(politicaSla?.meta_cumplimiento_porcentaje);
    if (isNaN(meta) || meta < 1 || meta > 100) {
      return NextResponse.json({ error: "La meta de cumplimiento debe ser un porcentaje entre 1 y 100." }, { status: 400 });
    }

    // Actualización de prioridades SLA
    for (const p of prioridades) {
      await query(
        `UPDATE prioridad_ticket
         SET tiempo_primera_respuesta_hrs = $1,
             tiempo_resolucion_horas = $2
         WHERE id_prioridad = $3`,
        [Number(p.tiempo_primera_respuesta_hrs), Number(p.tiempo_resolucion_horas), p.id_prioridad]
      );
    }

    // Actualización de objetivos OLA
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

    // Upsert política en configuracion_sistema
    await query(
      `INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, fecha_modificacion)
       VALUES ('politica_sla_global', 'servicios', 'Política institucional y objetivos de Acuerdos de Nivel de Servicio (SLA)', $1, NOW())
       ON CONFLICT (clave) DO UPDATE SET
         valor = EXCLUDED.valor,
         fecha_modificacion = NOW()`,
      [JSON.stringify(politicaSla)]
    );

    // Registro en auditoría
    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sesion.id_usuario,
        "SERVICIOS_SLA",
        "ACTUALIZAR_OBJETIVOS_SLA",
        `El usuario ${sesion.nombres} actualizó los objetivos globales de SLA y la matriz OLA/SLA (Meta: ${meta}%).`,
        JSON.stringify({ prioridades, politicaSla, objetivosOla }),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    return NextResponse.json({ ok: true, mensaje: "Objetivos SLA y OLA actualizados exitosamente." });
  } catch (error) {
    console.error("Error al actualizar objetivos SLA:", error);
    return NextResponse.json({ error: "Error interno al guardar objetivos SLA." }, { status: 500 });
  }
}
