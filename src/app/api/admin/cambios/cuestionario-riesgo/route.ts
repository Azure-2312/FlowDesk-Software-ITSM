import { NextRequest, NextResponse } from "next/server";
import { queryRow } from "@/lib/db";
import { verificarTokenSesion } from "@/lib/auth";
import { COOKIE_SESION } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { respuestas = {}, valores_formulario = {} } = body;

    // Obtener la configuración activa del cuestionario de riesgo
    const confRow = await queryRow<any>(`
      SELECT snapshot FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.1' AND pestana = 'cuestionario_riesgo'
      ORDER BY es_borrador DESC, numero_version DESC
      LIMIT 1
    `);

    const config = confRow?.snapshot || {};
    const preguntas = config.preguntas || [];
    const niveles = config.niveles || [
      { id: "bajo", nombre: "Bajo", min: 0, max: 10, color: "#16a34a" },
      { id: "medio", nombre: "Medio", min: 11, max: 20, color: "#d97706" },
      { id: "alto", nombre: "Alto", min: 21, max: 32, color: "#ea580c" },
      { id: "critico", nombre: "Crítico", min: 33, max: 44, color: "#dc2626" }
    ];

    let puntajeTotal = 0;
    const detallesRespuestas: Array<{
      pregunta_id: number;
      texto: string;
      opcion_elegida: string;
      puntaje: number;
      eleva_minimo: string | null;
      fuente: string;
    }> = [];
    let nivelElevadoMinimo: string | null = null;

    const jerarquiaNiveles: Record<string, number> = {
      bajo: 1,
      medio: 2,
      alto: 3,
      critico: 4
    };

    for (const preg of preguntas) {
      if (!preg.activa) continue;

      let valorOpcion = respuestas[preg.id];

      // Si es automática, deducir desde valores_formulario si no fue enviada explícitamente
      if (!valorOpcion) {
        if (preg.fuente === "auto_criticidad") {
          const crit = valores_formulario.servicios_criticos || 0;
          valorOpcion = crit > 1 ? "varios" : crit === 1 ? "un_servicio" : "ninguno";
        } else if (preg.fuente === "auto_usuarios") {
          const usr = Number(valores_formulario.usuarios_afectados || 0);
          valorOpcion = usr > 1000 ? "mas_1000" : usr > 100 ? "101_1000" : usr >= 10 ? "10_100" : "menos_10";
        } else if (preg.fuente === "auto_interrupcion") {
          const reqInt = valores_formulario.requiere_interrupcion;
          const dur = valores_formulario.duracion_interrupcion || "";
          if (!reqInt) valorOpcion = "ninguna";
          else if (dur.includes("4h") || dur.includes("5h") || dur.includes("6h") || dur.includes("8h")) valorOpcion = "mas_4h";
          else if (dur.includes("1h") || dur.includes("2h") || dur.includes("3h")) valorOpcion = "1_4h";
          else valorOpcion = "hasta_1h";
        } else if (preg.fuente === "auto_entorno") {
          valorOpcion = (valores_formulario.entorno || "produccion").toLowerCase();
        } else if (preg.fuente === "auto_calendario") {
          valorOpcion = valores_formulario.fuera_de_ventana ? "fuera_ventana" : "en_ventana";
        } else if (preg.fuente === "auto_historial") {
          const fallos = Number(valores_formulario.fallos_previos || 0);
          valorOpcion = fallos > 1 ? "mas_fallos" : fallos === 1 ? "un_fallo" : "cero";
        } else {
          valorOpcion = preg.opciones[0]?.valor;
        }
      }

      const opcion = preg.opciones.find((o: any) => o.valor === valorOpcion) || preg.opciones[0];
      const pts = (opcion?.puntaje || 0) * (preg.peso || 1);
      puntajeTotal += pts;

      if (opcion?.eleva_minimo) {
        const pesoMinActual = nivelElevadoMinimo ? jerarquiaNiveles[nivelElevadoMinimo] : 0;
        const pesoNuevo = jerarquiaNiveles[opcion.eleva_minimo] || 0;
        if (pesoNuevo > pesoMinActual) {
          nivelElevadoMinimo = opcion.eleva_minimo;
        }
      }

      detallesRespuestas.push({
        pregunta_id: preg.id,
        texto: preg.texto,
        opcion_elegida: opcion?.texto || valorOpcion,
        puntaje: pts,
        eleva_minimo: opcion?.eleva_minimo || null,
        fuente: preg.fuente,
      });
    }

    // Determinar nivel por puntaje
    let nivelCalculado = niveles[0];
    for (const n of niveles) {
      if (puntajeTotal >= n.min && puntajeTotal <= n.max) {
        nivelCalculado = n;
        break;
      }
    }

    // Aplicar elevación de riesgo si corresponde
    let nivelFinal = nivelCalculado;
    let huboElevacion = false;
    if (config.reglas?.aplicar_regla_elevacion && nivelElevadoMinimo) {
      const pesoCalculado = jerarquiaNiveles[nivelCalculado.id] || 1;
      const pesoMinimo = jerarquiaNiveles[nivelElevadoMinimo] || 1;
      if (pesoMinimo > pesoCalculado) {
        nivelFinal = niveles.find((n: any) => n.id === nivelElevadoMinimo) || nivelCalculado;
        huboElevacion = true;
      }
    }

    return NextResponse.json({
      ok: true,
      puntaje_total: puntajeTotal,
      nivel_calculado: nivelCalculado,
      nivel_final: nivelFinal,
      hubo_elevacion: huboElevacion,
      nivel_elevado_minimo: nivelElevadoMinimo,
      detalles_respuestas: detallesRespuestas,
    });
  } catch (error: any) {
    console.error("Error al evaluar cuestionario de riesgo:", error);
    return NextResponse.json({ error: "Error al evaluar riesgo" }, { status: 500 });
  }
}
