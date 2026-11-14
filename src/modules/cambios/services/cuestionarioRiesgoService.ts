import { queryRow } from "@/shared/lib/db";
import { VALORES_FABRICA_PESTANAS } from "./formularioConfiguracionService";

export async function evaluarCuestionarioRiesgo(body: any, puedeSimularBorrador = false) {
  const { respuestas = {}, valores_formulario = {}, config_simulacion = null } = body;

  let config: any = null;

  if (puedeSimularBorrador && config_simulacion && Array.isArray(config_simulacion.preguntas)) {
    config = config_simulacion;
  } else {
    // Obtener la configuración activa del cuestionario de riesgo
    const confRow = await queryRow<any>(`
      SELECT snapshot FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.1' AND pestana = 'cuestionario_riesgo'
      ORDER BY es_borrador DESC, numero_version DESC
      LIMIT 1
    `);
    config = (confRow?.snapshot && Object.keys(confRow.snapshot).length > 0)
      ? confRow.snapshot
      : VALORES_FABRICA_PESTANAS.cuestionario_riesgo;
  }

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

    // Si no fue enviada explícitamente, tomar la primera opción por defecto
    if (!valorOpcion) {
      valorOpcion = preg.opciones[0]?.valor;
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
    });
  }

  // Determinar nivel por puntaje (si excede el máximo configurado, corresponde al nivel más alto)
  const nivelesOrdenados = [...niveles].sort((a: any, b: any) => (a.min ?? 0) - (b.min ?? 0));
  let nivelCalculado = nivelesOrdenados[0];
  let encontrado = false;
  for (const n of nivelesOrdenados) {
    if (puntajeTotal >= n.min && puntajeTotal <= n.max) {
      nivelCalculado = n;
      encontrado = true;
      break;
    }
  }
  if (!encontrado && nivelesOrdenados.length > 0 && puntajeTotal > nivelesOrdenados[nivelesOrdenados.length - 1].max) {
    nivelCalculado = nivelesOrdenados[nivelesOrdenados.length - 1];
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

  return {
    ok: true,
    puntaje_total: puntajeTotal,
    nivel_calculado: nivelCalculado,
    nivel_final: nivelFinal,
    hubo_elevacion: huboElevacion,
    nivel_elevado_minimo: nivelElevadoMinimo,
    detalles_respuestas: detallesRespuestas,
  };
}
