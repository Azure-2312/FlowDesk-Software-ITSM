import { NextRequest, NextResponse } from "next/server";
import { queryRow } from "@/lib/db";

export const dynamic = "force-dynamic";

interface EstadoItem {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  tipos_aplicables?: string[];
  activo?: boolean;
}

interface TransicionItem {
  id: string;
  codigo: string;
  nombre: string;
  origen: string[];
  destino: string;
  destino_final_todas_aprobadas?: string;
  tipos?: string[];
  condiciones_previas?: string[];
  campos_obligatorios?: string[];
  activa?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let estados: EstadoItem[] = body.estados;
    let transiciones: TransicionItem[] = body.transiciones;

    // Si no se envían en el body, consultar la configuración publicada actual
    if (!estados || !transiciones) {
      const dbEstados = await queryRow(`
        SELECT snapshot FROM configuracion_modulo_versiones 
        WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'estados' AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `);
      const dbTrans = await queryRow(`
        SELECT snapshot FROM configuracion_modulo_versiones 
        WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = 'transiciones' AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `);

      estados = dbEstados?.snapshot?.estados || [];
      transiciones = dbTrans?.snapshot?.transiciones || [];
    }

    const errores: string[] = [];
    const advertencias: string[] = [];
    const tiposDeCambio = ["estandar", "normal", "emergencia"];

    const estadosMap = new Map<string, EstadoItem>();
    estados.forEach(e => estadosMap.set(e.id, e));

    // 1. Validar estado inicial único
    const estadosIniciales = estados.filter(e => e.tipo === "inicial" && e.activo !== false);
    if (estadosIniciales.length === 0) {
      errores.push("El flujo no posee ningún estado de tipo 'Inicial'. Debe existir exactamente 1.");
    } else if (estadosIniciales.length > 1) {
      errores.push(`Se encontraron ${estadosIniciales.length} estados iniciales (${estadosIniciales.map(e => e.nombre).join(", ")}). Solo debe haber 1.`);
    }

    // 2. Validar estados finales
    const estadosFinales = estados.filter(e => e.tipo === "final" && e.activo !== false);
    if (estadosFinales.length === 0) {
      errores.push("El flujo no posee ningún estado de tipo 'Final'. Debe existir al menos 1.");
    }

    // 3. Validar transiciones activas
    const transActivas = transiciones.filter(t => t.activa !== false);

    // 4. Verificación de salidas de estados no finales
    for (const est of estados.filter(e => e.tipo !== "final" && e.activo !== false)) {
      const tieneSalida = transActivas.some(t => t.origen.includes(est.id));
      if (!tieneSalida) {
        errores.push(`Estado sin salida: El estado '${est.nombre}' (${est.id}) no es final pero no tiene ninguna transición saliente.`);
      }
    }

    // 5. Análisis de alcanzabilidad y salida a estado final por tipo de cambio
    for (const tipo of tiposDeCambio) {
      const estadosAplicables = estados.filter(e => e.activo !== false && (!e.tipos_aplicables || e.tipos_aplicables.includes(tipo)));
      const transTipo = transActivas.filter(t => !t.tipos || t.tipos.includes(tipo));

      // Grafo de adyacencia
      const adj = new Map<string, Set<string>>();
      estadosAplicables.forEach(e => adj.set(e.id, new Set()));

      transTipo.forEach(t => {
        t.origen.forEach(orig => {
          if (adj.has(orig)) {
            if (t.destino === "estado_anterior") {
              // Simular retorno
              adj.get(orig)!.add("en_evaluacion");
              adj.get(orig)!.add("en_autorizacion");
            } else {
              adj.get(orig)!.add(t.destino);
            }
            if (t.destino_final_todas_aprobadas) {
              adj.get(orig)!.add(t.destino_final_todas_aprobadas);
            }
          }
        });
      });

      // BFS desde estado inicial
      const inicial = estadosIniciales[0]?.id;
      if (inicial && adj.has(inicial)) {
        const visitados = new Set<string>();
        const queue = [inicial];
        visitados.add(inicial);

        while (queue.length > 0) {
          const curr = queue.shift()!;
          const vecinos = adj.get(curr) || new Set();
          for (const v of vecinos) {
            if (!visitados.has(v) && estadosMap.has(v)) {
              visitados.add(v);
              queue.push(v);
            }
          }
        }

        // Revisar inalcanzables para este tipo
        for (const e of estadosAplicables) {
          if (!visitados.has(e.id) && e.id !== "en_pausa") { // en_pausa suele ser transversal
            advertencias.push(`Para tipo '${tipo}', el estado '${e.nombre}' no es alcanzable desde el estado inicial.`);
          }
        }
      }

      // Validar camino hacia algún estado final para cada estado alcanzable
      const finalesIds = new Set(estadosFinales.map(f => f.id));
      for (const e of estadosAplicables) {
        if (e.tipo === "final") continue;
        
        let llegaAFinal = false;
        const q = [e.id];
        const v = new Set<string>([e.id]);
        while (q.length > 0) {
          const curr = q.shift()!;
          if (finalesIds.has(curr)) {
            llegaAFinal = true;
            break;
          }
          for (const nxt of (adj.get(curr) || [])) {
            if (!v.has(nxt)) {
              v.add(nxt);
              q.push(nxt);
            }
          }
        }

        if (!llegaAFinal) {
          errores.push(`Vía muerta: Desde el estado '${e.nombre}' no existe ningún camino hacia un estado final para el tipo '${tipo}'.`);
        }
      }
    }

    // 6. Validaciones normativas de transición hacia En ejecución
    const transAEnEjecucion = transActivas.filter(t => t.destino === "en_ejecucion");
    if (transAEnEjecucion.length === 0) {
      errores.push("No existe ninguna transición hacia el estado 'En ejecución'.");
    } else {
      for (const t of transAEnEjecucion) {
        const tieneCondicionCongelamiento = (t.condiciones_previas || []).includes("sin_congelamiento_vigente");
        const tieneCondicionAprobaciones = (t.condiciones_previas || []).some(c => 
          c.includes("aprob") || c.includes("checklist_go_no_go") || c.includes("condiciones_cumplidas")
        );

        if (!tieneCondicionCongelamiento) {
          advertencias.push(`La transición '${t.nombre}' hacia 'En ejecución' carece de la condición obligatoria 'sin_congelamiento_vigente'.`);
        }
        if (!tieneCondicionAprobaciones) {
          errores.push(`La transición '${t.nombre}' hacia 'En ejecución' debe exigir condiciones de autorización o Go/No-Go.`);
        }
      }
    }

    // 7. Validaciones de motivos en rechazo y cancelación
    const transRechazo = transActivas.filter(t => t.destino === "rechazado");
    for (const t of transRechazo) {
      const exigeMotivo = (t.campos_obligatorios || []).some(c => c.includes("motivo"));
      if (!exigeMotivo) {
        advertencias.push(`La transición de rechazo '${t.nombre}' debe exigir el campo obligatorio de motivo de rechazo.`);
      }
    }

    const transCancelado = transActivas.filter(t => t.destino === "cancelado");
    for (const t of transCancelado) {
      const exigeMotivo = (t.campos_obligatorios || []).some(c => c.includes("motivo"));
      if (!exigeMotivo) {
        advertencias.push(`La transición de cancelación '${t.nombre}' debe exigir el campo obligatorio de motivo de cancelación.`);
      }
    }

    // 8. Validación de código de cierre
    const transCerrado = transActivas.filter(t => t.destino === "cerrado");
    for (const t of transCerrado) {
      const exigeCodigo = (t.campos_obligatorios || []).some(c => c.includes("codigo_cierre"));
      if (!exigeCodigo) {
        advertencias.push(`La transición de cierre '${t.nombre}' debe requerir código de cierre del catálogo.`);
      }
    }

    return NextResponse.json({
      valido: errores.length === 0,
      total_errores: errores.length,
      total_advertencias: advertencias.length,
      errores,
      advertencias,
      grafo_resumen: {
        estados_totales: estados.length,
        estados_activos: estados.filter(e => e.activo !== false).length,
        transiciones_activas: transActivas.length,
        estados_iniciales: estadosIniciales.map(e => e.id),
        estados_finales: estadosFinales.map(e => e.id)
      }
    });
  } catch (error: any) {
    console.error("Error en /api/admin/cambios/flujo-evaluacion/validar-flujo:", error);
    return NextResponse.json({ error: error.message || "Error al validar el flujo" }, { status: 500 });
  }
}
