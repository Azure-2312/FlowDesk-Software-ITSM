import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      aplicar_paquete_tareas,
      exigir_revision_cierre,
      plazo_revision_dias,
      participantes_roles,
      aprobacion_cierre_perfil,
      notificar_direccion_al_detectar,
      notificar_direccion_al_cerrar,
      generar_informe_pdf,
      plantilla_preguntas,
    } = body;

    const actualizada = await queryRow<any>(
      `UPDATE problema_config_mayor
       SET aplicar_paquete_tareas = COALESCE($1, aplicar_paquete_tareas),
           exigir_revision_cierre = COALESCE($2, exigir_revision_cierre),
           plazo_revision_dias = COALESCE($3, plazo_revision_dias),
           participantes_roles = COALESCE($4, participantes_roles),
           aprobacion_cierre_perfil = $5,
           notificar_direccion_al_detectar = COALESCE($6, notificar_direccion_al_detectar),
           notificar_direccion_al_cerrar = COALESCE($7, notificar_direccion_al_cerrar),
           generar_informe_pdf = COALESCE($8, generar_informe_pdf),
           plantilla_preguntas = COALESCE($9, plantilla_preguntas),
           fecha_modificacion = NOW()
       WHERE id = 1
       RETURNING *`,
      [
        aplicar_paquete_tareas !== undefined ? aplicar_paquete_tareas : null,
        exigir_revision_cierre !== undefined ? exigir_revision_cierre : null,
        plazo_revision_dias !== undefined ? plazo_revision_dias : null,
        participantes_roles ? JSON.stringify(participantes_roles) : null,
        aprobacion_cierre_perfil || null,
        notificar_direccion_al_detectar !== undefined ? notificar_direccion_al_detectar : null,
        notificar_direccion_al_cerrar !== undefined ? notificar_direccion_al_cerrar : null,
        generar_informe_pdf !== undefined ? generar_informe_pdf : null,
        plantilla_preguntas ? JSON.stringify(plantilla_preguntas) : null,
      ]
    );

    return NextResponse.json({ ok: true, config: actualizada });
  } catch (error: any) {
    console.error("Error al actualizar configuración de problemas mayores:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar" }, { status: 500 });
  }
}
