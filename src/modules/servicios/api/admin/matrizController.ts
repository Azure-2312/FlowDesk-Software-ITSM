import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

export const dynamic = "force-dynamic";

interface ConfigMatrizSla {
  usar_matriz_propia: boolean;
  permitir_prioridad_manual: boolean;
  perfiles_prioridad_manual: number[];
  recalcular_al_cambiar: boolean;
  tooltips_impacto: Record<string, string>;
  tooltips_urgencia: Record<string, string>;
}

const CONFIG_MATRIZ_DEFECTO: ConfigMatrizSla = {
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

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const [prioridades, celdasCompartidas, celdasProblemas, configRow] = await Promise.all([
      query<any>("SELECT id_prioridad, codigo, nombre, nivel, color, tiempo_resolucion_horas FROM prioridad_ticket WHERE estado_registro = true ORDER BY nivel ASC"),
      query<any>("SELECT * FROM matriz_prioridad_institucional WHERE entidad = 'compartida' ORDER BY nivel_impacto DESC, nivel_urgencia DESC"),
      query<any>("SELECT * FROM matriz_prioridad_institucional WHERE entidad = 'problema' ORDER BY nivel_impacto DESC, nivel_urgencia DESC"),
      queryRow<{ valor: any }>("SELECT valor FROM configuracion_sistema WHERE clave = 'matriz_problemas_config'"),
    ]);

    let config = CONFIG_MATRIZ_DEFECTO;
    if (configRow?.valor) {
      config = typeof configRow.valor === "string" ? JSON.parse(configRow.valor) : configRow.valor;
    }

    return NextResponse.json({
      ok: true,
      prioridades,
      celdas_compartidas: celdasCompartidas,
      celdas_problemas: celdasProblemas,
      config,
    });
  } catch (error: any) {
    console.error("Error al consultar matriz de prioridad SLA:", error);
    return NextResponse.json({ error: "Error interno al consultar matriz." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.SERVICIOS_CONFIGURAR)) {
    return NextResponse.json({ error: "Solo administradores pueden configurar la matriz de prioridad." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { config, celdas_problemas, celdas_compartidas } = body;

    // Actualizar celdas compartidas si se envían
    if (Array.isArray(celdas_compartidas) && celdas_compartidas.length > 0) {
      for (const celda of celdas_compartidas) {
        await query(`
          INSERT INTO matriz_prioridad_institucional (entidad, nivel_impacto, nivel_urgencia, id_prioridad, fecha_modificacion)
          VALUES ('compartida', $1, $2, $3, NOW())
          ON CONFLICT (entidad, nivel_impacto, nivel_urgencia) DO UPDATE SET
            id_prioridad = EXCLUDED.id_prioridad,
            fecha_modificacion = NOW()
        `, [celda.nivel_impacto, celda.nivel_urgencia, celda.id_prioridad]);
      }
    }

    // Actualizar celdas de problemas si se envían
    if (Array.isArray(celdas_problemas) && celdas_problemas.length > 0) {
      for (const celda of celdas_problemas) {
        await query(`
          INSERT INTO matriz_prioridad_institucional (entidad, nivel_impacto, nivel_urgencia, id_prioridad, fecha_modificacion)
          VALUES ('problema', $1, $2, $3, NOW())
          ON CONFLICT (entidad, nivel_impacto, nivel_urgencia) DO UPDATE SET
            id_prioridad = EXCLUDED.id_prioridad,
            fecha_modificacion = NOW()
        `, [celda.nivel_impacto, celda.nivel_urgencia, celda.id_prioridad]);
      }
    }

    // Actualizar configuración en configuracion_sistema
    if (config) {
      await query(`
        INSERT INTO configuracion_sistema (clave, categoria, descripcion, valor, usuario_modificacion, fecha_modificacion)
        VALUES ('matriz_problemas_config', 'PROBLEMAS', 'Configuración de matriz y priorización ITIL para SLA y Problemas', $1, $2, NOW())
        ON CONFLICT (clave) DO UPDATE SET
          valor = EXCLUDED.valor,
          usuario_modificacion = EXCLUDED.usuario_modificacion,
          fecha_modificacion = NOW()
      `, [JSON.stringify(config), sesion.id_usuario]);
    }

    return NextResponse.json({ ok: true, mensaje: "Matriz institucional de prioridad actualizada exitosamente." });
  } catch (error: any) {
    console.error("Error al actualizar matriz de prioridad SLA:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar matriz." }, { status: 500 });
  }
}
