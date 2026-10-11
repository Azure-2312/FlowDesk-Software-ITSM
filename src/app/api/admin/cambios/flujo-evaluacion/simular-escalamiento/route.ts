import { NextRequest, NextResponse } from "next/server";
import { queryRow } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prioridad = "p2",
      tipo_cambio = "normal",
      fase = "autorizacion",
      horas_transcurridas = 18,
      parametros_custom
    } = body;

    let configPlazos = parametros_custom;
    if (!configPlazos) {
      const dbRow = await queryRow(`
        SELECT snapshot FROM configuracion_modulo_versiones 
        WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'plazos_escalamiento' AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `);
      configPlazos = dbRow?.snapshot || {};
    }

    const plazos = configPlazos.plazos_por_prioridad || [
      { prioridad_id: "p1", primera_respuesta_horas: 0.5, evaluacion_horas: 2, autorizacion_total_horas: 2, plazo_por_etapa_horas: 1 },
      { prioridad_id: "p2", primera_respuesta_horas: 2, evaluacion_horas: 12, autorizacion_total_horas: 24, plazo_por_etapa_horas: 8 },
      { prioridad_id: "p3", primera_respuesta_horas: 8, evaluacion_horas: 48, autorizacion_total_horas: 72, plazo_por_etapa_horas: 24 },
      { prioridad_id: "p4", primera_respuesta_horas: 24, evaluacion_horas: 72, autorizacion_total_horas: 120, plazo_por_etapa_horas: 48 }
    ];

    const filaPrioridad = plazos.find((p: any) => p.prioridad_id === prioridad) || plazos[1];

    let plazoLimiteHoras = 24;
    if (fase === "primera_respuesta") {
      plazoLimiteHoras = filaPrioridad.primera_respuesta_horas;
    } else if (fase === "evaluacion") {
      plazoLimiteHoras = filaPrioridad.evaluacion_horas;
    } else if (fase === "autorizacion") {
      plazoLimiteHoras = tipo_cambio === "emergencia" ? 2 : filaPrioridad.autorizacion_total_horas;
    } else if (fase === "etapa") {
      plazoLimiteHoras = filaPrioridad.plazo_por_etapa_horas;
    }

    const porcentajeConsumido = Math.round((horas_transcurridas / plazoLimiteHoras) * 100);
    const horasRestantes = Math.max(0, plazoLimiteHoras - horas_transcurridas);
    const horasVencido = Math.max(0, horas_transcurridas - plazoLimiteHoras);
    const esVencido = horas_transcurridas > plazoLimiteHoras;

    // Evaluar reglas de escalamiento
    const reglas = configPlazos.reglas_escalamiento || [];
    const reglasDisparadas: any[] = [];

    for (const r of reglas) {
      if (!r.activa) continue;
      if (r.prioridades && !r.prioridades.includes(prioridad)) continue;

      let dispara = false;
      if (r.umbral_tipo === "porcentaje_plazo" && porcentajeConsumido >= r.umbral_valor) {
        dispara = true;
      } else if (r.umbral_tipo === "vencido_horas" && horasVencido >= r.umbral_valor && esVencido) {
        dispara = true;
      }

      if (dispara) {
        reglasDisparadas.push({
          id: r.id,
          nombre: r.nombre,
          accion: r.accion,
          destinatarios: r.destinatarios,
          etiqueta: r.etiqueta || null,
          mensaje: r.mensaje
        });
      }
    }

    let estadoSla = "Dentro de plazo";
    let colorSla = "#16a34a";
    if (esVencido) {
      estadoSla = "Vencido";
      colorSla = "#dc2626";
    } else if (porcentajeConsumido >= 90) {
      estadoSla = "Crítico (>=90%)";
      colorSla = "#ea580c";
    } else if (porcentajeConsumido >= 75) {
      estadoSla = "En riesgo (>=75%)";
      colorSla = "#d97706";
    }

    return NextResponse.json({
      prioridad,
      tipo_cambio,
      fase,
      horas_transcurridas,
      plazo_limite_horas: plazoLimiteHoras,
      porcentaje_consumido: porcentajeConsumido,
      horas_restantes: Number(horasRestantes.toFixed(1)),
      horas_vencido: Number(horasVencido.toFixed(1)),
      estado_sla: estadoSla,
      color_sla: colorSla,
      es_vencido: esVencido,
      autoaprobacion_permitida: false,
      regla_seguridad: "El sistema nunca aprueba automáticamente por vencimiento de plazo (ITIL 4 / COBIT BAI06).",
      reglas_disparadas: reglasDisparadas
    });
  } catch (error: any) {
    console.error("Error en /api/admin/cambios/flujo-evaluacion/simular-escalamiento:", error);
    return NextResponse.json({ error: error.message || "Error al simular escalamiento" }, { status: 500 });
  }
}
