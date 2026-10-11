import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { objetivos = [] } = body;

    for (const obj of objetivos) {
      if (obj.id_prioridad) {
        await query(
          `UPDATE problema_objetivo_tiempo
           SET primera_respuesta_horas = $1,
               diagnostico_horas = $2,
               resolucion_total_horas = $3,
               descripcion_operativa = $4,
               umbrales_alerta = $5,
               fecha_modificacion = NOW()
           WHERE id_prioridad = $6`,
          [
            obj.primera_respuesta_horas,
            obj.diagnostico_horas,
            obj.resolucion_total_horas,
            obj.descripcion_operativa || null,
            JSON.stringify(obj.umbrales_alerta || [50, 75, 90]),
            obj.id_prioridad,
          ]
        );
      }
    }

    return NextResponse.json({ ok: true, mensaje: "Objetivos de tiempo OLA actualizados exitosamente" });
  } catch (error: any) {
    console.error("Error al actualizar objetivos OLA:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar" }, { status: 500 });
  }
}
