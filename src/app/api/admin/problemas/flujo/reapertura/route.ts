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
    const {
      permitir_reapertura,
      ventana_dias_resuelto,
      ventana_dias_cerrado,
      perfiles_autorizados,
      estado_destino_id,
      motivo_obligatorio,
      max_reaperturas,
      reinicio_relojes,
      estrategia_asignacion,
      motivos_catalogo,
    } = body;

    const actualizada = await queryRow<any>(
      `UPDATE problema_config_reapertura
       SET permitir_reapertura = COALESCE($1, permitir_reapertura),
           ventana_dias_resuelto = COALESCE($2, ventana_dias_resuelto),
           ventana_dias_cerrado = COALESCE($3, ventana_dias_cerrado),
           perfiles_autorizados = COALESCE($4, perfiles_autorizados),
           estado_destino_id = $5,
           motivo_obligatorio = COALESCE($6, motivo_obligatorio),
           max_reaperturas = COALESCE($7, max_reaperturas),
           reinicio_relojes = COALESCE($8, reinicio_relojes),
           estrategia_asignacion = COALESCE($9, estrategia_asignacion),
           motivos_catalogo = COALESCE($10, motivos_catalogo),
           fecha_modificacion = NOW()
       WHERE id = 1
       RETURNING *`,
      [
        permitir_reapertura !== undefined ? permitir_reapertura : null,
        ventana_dias_resuelto !== undefined ? ventana_dias_resuelto : null,
        ventana_dias_cerrado !== undefined ? ventana_dias_cerrado : null,
        perfiles_autorizados ? JSON.stringify(perfiles_autorizados) : null,
        estado_destino_id || null,
        motivo_obligatorio !== undefined ? motivo_obligatorio : null,
        max_reaperturas !== undefined ? max_reaperturas : null,
        reinicio_relojes || null,
        estrategia_asignacion || null,
        motivos_catalogo ? JSON.stringify(motivos_catalogo) : null,
      ]
    );

    return NextResponse.json({ ok: true, config: actualizada });
  } catch (error: any) {
    console.error("Error al actualizar config de reapertura:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar" }, { status: 500 });
  }
}
