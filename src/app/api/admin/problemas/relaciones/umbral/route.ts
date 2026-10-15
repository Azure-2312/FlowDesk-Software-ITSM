import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const idRegla = searchParams.get("id_regla");

    if (idRegla) {
      const ejecuciones = await query<any>(
        `SELECT * FROM problema_regla_umbral_ejecucion WHERE id_regla = $1 ORDER BY fecha_ejecucion DESC LIMIT 50`,
        [idRegla]
      );
      return NextResponse.json({ ok: true, ejecuciones });
    }

    const reglas = await query<any>(
      `SELECT r.*,
        (SELECT COUNT(*) FROM problema_regla_umbral_ejecucion e WHERE e.id_regla = r.id_regla) as total_ejecuciones
       FROM problema_regla_umbral r
       ORDER BY r.orden ASC, r.id_regla ASC`
    );
    return NextResponse.json({ ok: true, reglas });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { accion, regla, diasSimulacion } = body;

    // SIMULAR REGLA (analiza últimos 30/60/90 días)
    if (accion === "simular") {
      const dias = diasSimulacion || 30;
      const { agrupar_por, umbral_incidentes, ventana_horas } = regla || {};

      // Consultar incidentes en la ventana histórica
      const incidentes = await query<any>(`
        SELECT t.id_ticket, t.codigo_ticket, t.titulo, t.id_servicio, s.nombre as servicio_nombre,
               t.id_categoria, c.nombre as categoria_nombre, t.fecha_creacion, t.prioridad
        FROM ticket t
        LEFT JOIN servicio s ON s.id_servicio = t.id_servicio
        LEFT JOIN categoria_ticket c ON c.id_categoria = t.id_categoria
        WHERE t.tipo = 'INCIDENTE'
          AND t.fecha_creacion >= NOW() - INTERVAL '${parseInt(dias)} days'
        ORDER BY t.fecha_creacion DESC
      `);

      // Agrupar incidentes según el criterio de la regla
      const gruposMap: { [key: string]: any[] } = {};
      incidentes.forEach((inc) => {
        let clave = "General";
        if (agrupar_por === "servicio") {
          clave = inc.servicio_nombre || `Servicio #${inc.id_servicio || "Sin asignar"}`;
        } else if (agrupar_por === "categoria") {
          clave = inc.categoria_nombre || `Categoría #${inc.id_categoria || "Sin categoría"}`;
        } else if (agrupar_por === "ci") {
          clave = `Componente CI vinculado (${inc.servicio_nombre || "TI"})`;
        } else {
          clave = inc.servicio_nombre || "Incidentes operativos";
        }

        if (!gruposMap[clave]) gruposMap[clave] = [];
        gruposMap[clave].push(inc);
      });

      const gruposDetectados: any[] = [];
      let totalProblemasPotenciales = 0;

      Object.entries(gruposMap).forEach(([clave, items]) => {
        if (items.length >= (umbral_incidentes || 3)) {
          totalProblemasPotenciales++;
          gruposDetectados.push({
            criterio: clave,
            total_incidentes: items.length,
            muestra_tickets: items.slice(0, 5).map((t) => `${t.codigo_ticket}: ${t.titulo}`),
            accion_sugerida: regla.accion === "sugerir" ? "Sugerir al Gestor" : "Crear Problema Automático",
            prioridad_calculada: regla.prioridad_problema === "fija_p1" ? "P1" : "P2"
          });
        }
      });

      return NextResponse.json({
        ok: true,
        resultadoSimulacion: {
          periodoAnalizadoDias: dias,
          totalIncidentesEvaluados: incidentes.length,
          gruposSuperanUmbral: gruposDetectados.length,
          problemasEstimados: totalProblemasPotenciales,
          grupos: gruposDetectados
        }
      });
    }

    // CREAR NUEVA REGLA
    if (accion === "crear") {
      const nueva = await queryRow<any>(
        `INSERT INTO problema_regla_umbral (
          nombre, descripcion, orden, activa, estados_incluidos, prioridad_minima,
          servicios_incluidos, categorias_incluidas, agrupar_por, sensibilidad_texto,
          umbral_incidentes, ventana_horas, accion, prioridad_problema,
          evitar_duplicados, enfriamiento_horas, notificar_destinatarios
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        ) RETURNING *`,
        [
          regla.nombre || "Nueva Regla de Umbral",
          regla.descripcion || "",
          regla.orden || 1,
          regla.activa ?? false,
          JSON.stringify(regla.estados_incluidos || ["ABIERTO", "EN_PROCESO"]),
          regla.prioridad_minima || "P4",
          JSON.stringify(regla.servicios_incluidos || []),
          JSON.stringify(regla.categorias_incluidas || []),
          regla.agrupar_por || "servicio",
          regla.sensibilidad_texto || "media",
          regla.umbral_incidentes || 3,
          regla.ventana_horas || 24,
          regla.accion || "crear_automatico",
          regla.prioridad_problema || "maxima_incidentes",
          regla.evitar_duplicados ?? true,
          regla.enfriamiento_horas || 24,
          JSON.stringify(regla.notificar_destinatarios || ["gestor_problemas"])
        ]
      );

      return NextResponse.json({ ok: true, regla: nueva });
    }

    // DUPLICAR REGLA
    if (accion === "duplicar" && regla?.id_regla) {
      const orig = await queryRow<any>(
        "SELECT * FROM problema_regla_umbral WHERE id_regla = $1",
        [regla.id_regla]
      );
      if (!orig) return NextResponse.json({ error: "Regla no encontrada" }, { status: 404 });

      const duplicada = await queryRow<any>(
        `INSERT INTO problema_regla_umbral (
          nombre, descripcion, orden, activa, estados_incluidos, prioridad_minima,
          servicios_incluidos, categorias_incluidas, agrupar_por, sensibilidad_texto,
          umbral_incidentes, ventana_horas, accion, prioridad_problema,
          evitar_duplicados, enfriamiento_horas, notificar_destinatarios
        ) VALUES (
          $1, $2, $3, false, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING *`,
        [
          `${orig.nombre} (Copia)`,
          orig.descripcion,
          (orig.orden || 1) + 1,
          JSON.stringify(orig.estados_incluidos),
          orig.prioridad_minima,
          JSON.stringify(orig.servicios_incluidos),
          JSON.stringify(orig.categorias_incluidas),
          orig.agrupar_por,
          orig.sensibilidad_texto,
          orig.umbral_incidentes,
          orig.ventana_horas,
          orig.accion,
          orig.prioridad_problema,
          orig.evitar_duplicados,
          orig.enfriamiento_horas,
          JSON.stringify(orig.notificar_destinatarios)
        ]
      );

      return NextResponse.json({ ok: true, regla: duplicada });
    }

    return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { id_regla, activa, ...resto } = body;

    if (!id_regla) {
      return NextResponse.json({ error: "ID de regla requerido" }, { status: 400 });
    }

    // Si solo viene toggle de activa
    if (Object.keys(resto).length === 0 && activa !== undefined) {
      const act = await queryRow<any>(
        "UPDATE problema_regla_umbral SET activa = $1 WHERE id_regla = $2 RETURNING *",
        [activa, id_regla]
      );
      return NextResponse.json({ ok: true, regla: act });
    }

    // Actualización completa
    const actualizada = await queryRow<any>(
      `UPDATE problema_regla_umbral
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           agrupar_por = COALESCE($3, agrupar_por),
           umbral_incidentes = COALESCE($4, umbral_incidentes),
           ventana_horas = COALESCE($5, ventana_horas),
           accion = COALESCE($6, accion),
           activa = COALESCE($7, activa),
           prioridad_problema = COALESCE($8, prioridad_problema),
           evitar_duplicados = COALESCE($9, evitar_duplicados),
           enfriamiento_horas = COALESCE($10, enfriamiento_horas),
           prioridad_minima = COALESCE($11, prioridad_minima)
       WHERE id_regla = $12
       RETURNING *`,
      [
        resto.nombre,
        resto.descripcion,
        resto.agrupar_por,
        resto.umbral_incidentes,
        resto.ventana_horas,
        resto.accion,
        activa,
        resto.prioridad_problema,
        resto.evitar_duplicados,
        resto.enfriamiento_horas,
        resto.prioridad_minima,
        id_regla
      ]
    );

    return NextResponse.json({ ok: true, regla: actualizada });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    await query("DELETE FROM problema_regla_umbral WHERE id_regla = $1", [id]);
    return NextResponse.json({ ok: true, mensaje: "Regla eliminada" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
