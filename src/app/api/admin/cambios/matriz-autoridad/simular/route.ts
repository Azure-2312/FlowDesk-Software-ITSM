import { NextRequest, NextResponse } from "next/server";
import { queryRow } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tipo_cambio = "normal",
      nivel_riesgo = "bajo",
      criticidad_maxima = "baja",
      entorno = "produccion",
      requiere_interrupcion = false,
      fuera_de_ventana = false,
      dentro_congelamiento = false,
      modelo_aprobado = false
    } = body;

    // Obtener la configuración vigente de matriz de autoridad (borrador si existe, si no la publicada)
    const versionConfig = await queryRow(`
      SELECT snapshot FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = 'matriz_autoridad'
      ORDER BY es_borrador DESC, numero_version DESC LIMIT 1
    `);

    const reglas = versionConfig?.snapshot?.reglas || [];
    
    // Reglas activas ordenadas
    const reglasActivas = [...reglas].filter((r: any) => r.activa !== false).sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));

    let reglaCoincidente: any = null;
    let motivoCoincidencia = "";

    for (const r of reglasActivas) {
      const cond = r.condiciones || {};

      // 1. Tipo de cambio
      if (cond.tipo_cambio && cond.tipo_cambio.toLowerCase() !== tipo_cambio.toLowerCase()) {
        continue;
      }

      // 2. Nivel de riesgo
      if (cond.nivel_riesgo && Array.isArray(cond.nivel_riesgo) && cond.nivel_riesgo.length > 0) {
        if (!cond.nivel_riesgo.includes(nivel_riesgo.toLowerCase())) {
          continue;
        }
      }

      // 3. Modelo aprobado para estándar
      if (tipo_cambio.toLowerCase() === "estandar" && cond.modelo_aprobado !== undefined) {
        if (cond.modelo_aprobado !== modelo_aprobado) {
          continue;
        }
      }

      // 4. Entorno
      if (cond.entorno && cond.entorno !== "todos") {
        if (cond.entorno.toLowerCase() !== entorno.toLowerCase()) {
          continue;
        }
      }

      // 5. Requiere interrupción
      if (cond.requiere_interrupcion !== undefined) {
        if (cond.requiere_interrupcion !== requiere_interrupcion) {
          continue;
        }
      }

      // 6. Fuera de ventana
      if (cond.fuera_de_ventana !== undefined) {
        if (cond.fuera_de_ventana !== fuera_de_ventana) {
          continue;
        }
      }

      // 7. Dentro de congelamiento
      if (cond.dentro_congelamiento !== undefined) {
        if (cond.dentro_congelamiento !== dentro_congelamiento) {
          continue;
        }
      }

      // Coincidió
      reglaCoincidente = r;
      motivoCoincidencia = `Coincidió con la regla #${r.orden} '${r.nombre}'`;
      break;
    }

    if (!reglaCoincidente) {
      // Regla comodín de rescate
      reglaCoincidente = {
        id: "comodin_fallback",
        orden: 99,
        nombre: "Regla de rescate por defecto",
        sin_aprobacion: false,
        etapas: [{ etapa_id: "cab", nombre: "Comité de Cambios (CAB)", modo: "secuencial" }]
      };
      motivoCoincidencia = "No coincidió ninguna regla específica previa. Se aplicó la derivación general al CAB.";
    }

    return NextResponse.json({
      ok: true,
      tipo_evaluado: tipo_cambio,
      riesgo_evaluado: nivel_riesgo,
      regla: {
        id: reglaCoincidente.id,
        orden: reglaCoincidente.orden,
        nombre: reglaCoincidente.nombre,
        sin_aprobacion: !!reglaCoincidente.sin_aprobacion,
        accion_especial: reglaCoincidente.accion_especial || null
      },
      etapas_resultantes: reglaCoincidente.etapas || [],
      sin_aprobacion: !!reglaCoincidente.sin_aprobacion,
      explicacion: motivoCoincidencia
    });
  } catch (error: any) {
    console.error("Error en POST /api/admin/cambios/matriz-autoridad/simular:", error);
    return NextResponse.json({ error: error.message || "Error al simular matriz de autoridad" }, { status: 500 });
  }
}
