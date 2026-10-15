import { queryRow } from "@/shared/lib/db";

export async function simularReglasClasificacion(body: any) {
  const {
    tipo_cambio = "estandar",
    nivel_riesgo = "medio",
    criticidad_ci = "media",
    entorno = "produccion",
    horas_anticipacion = 12,
    fuera_de_ventana = false,
    dentro_congelamiento = false
  } = body;

  const versionConfig = await queryRow(`
    SELECT snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = 'reglas_clasificacion'
    ORDER BY es_borrador DESC, numero_version DESC LIMIT 1
  `);

  const snapshot = versionConfig?.snapshot || {};
  const reglas = snapshot.reglas || [];
  const estrategia = snapshot.estrategia_evaluacion || "todas";

  const reglasActivas = [...reglas].filter((r: any) => r.activa !== false).sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));

  const reglasDisparadas: any[] = [];
  let tipoFinal = tipo_cambio;
  const accionesEjecutadas: string[] = [];
  const etapasAdicionales: string[] = [];
  let bloqueado = false;
  let mensajeBloqueo = "";

  const jerarquiaRiesgo: Record<string, number> = { bajo: 1, medio: 2, alto: 3, critico: 4 };

  for (const r of reglasActivas) {
    const cond = r.condiciones || {};
    let coincide = true;

    if (cond.tipo_cambio && cond.tipo_cambio.toLowerCase() !== tipoFinal.toLowerCase()) {
      coincide = false;
    }

    if (cond.riesgo_mayor_que) {
      const nivelRiesgoActual = jerarquiaRiesgo[nivel_riesgo.toLowerCase()] || 1;
      const nivelLimite = jerarquiaRiesgo[cond.riesgo_mayor_que.toLowerCase()] || 1;
      if (nivelRiesgoActual <= nivelLimite) {
        coincide = false;
      }
    }

    if (cond.criticidad_ci_en && Array.isArray(cond.criticidad_ci_en)) {
      if (!cond.criticidad_ci_en.includes(criticidad_ci.toLowerCase())) {
        coincide = false;
      }
    }

    if (cond.fuera_anticipacion_minima) {
      // En normal, anticipación estándar es 72h
      if (tipoFinal.toLowerCase() === "normal" && horas_anticipacion >= 72) {
        coincide = false;
      } else if (tipoFinal.toLowerCase() !== "normal") {
        coincide = false;
      }
    }

    if (cond.entorno && cond.entorno !== "todos") {
      if (cond.entorno.toLowerCase() !== entorno.toLowerCase()) {
        coincide = false;
      }
    }

    if (cond.fuera_de_ventana !== undefined && cond.fuera_de_ventana !== fuera_de_ventana) {
      coincide = false;
    }

    if (cond.dentro_congelamiento !== undefined && cond.dentro_congelamiento !== dentro_congelamiento) {
      coincide = false;
    }

    if (coincide) {
      reglasDisparadas.push({
        id: r.id,
        orden: r.orden,
        nombre: r.nombre,
        accion: r.accion,
        mensaje: r.mensaje
      });

      if (r.accion === "reclasificar_tipo" && r.tipo_destino) {
        tipoFinal = r.tipo_destino;
        accionesEjecutadas.push(`Reclasificado de '${tipo_cambio}' a '${tipoFinal}'`);
      } else if (r.accion === "agregar_etapa_aprobacion" && r.etapa_a_agregar) {
        etapasAdicionales.push(r.etapa_a_agregar);
        accionesEjecutadas.push(`Etapa de aprobación agregada: ${r.etapa_a_agregar}`);
      } else if (r.accion === "bloquear_con_mensaje") {
        bloqueado = true;
        mensajeBloqueo = r.mensaje;
        accionesEjecutadas.push(`Envío bloqueado: ${r.mensaje}`);
      } else if (r.accion === "etiquetar_y_notificar") {
        accionesEjecutadas.push(`Etiquetado '${r.etiqueta}' y notificación disparada a roles correspondientes`);
      }

      if (estrategia === "primera") {
        break;
      }
    }
  }

  return {
    ok: true,
    estrategia,
    tipo_inicial: tipo_cambio,
    tipo_resultante: tipoFinal,
    total_reglas_disparadas: reglasDisparadas.length,
    reglas_disparadas: reglasDisparadas,
    acciones_ejecutadas: accionesEjecutadas,
    etapas_adicionales: etapasAdicionales,
    bloqueado,
    mensaje_bloqueo: mensajeBloqueo
  };
}
