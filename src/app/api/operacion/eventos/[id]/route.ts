import { NextRequest, NextResponse } from "next/server";
import { queryRow } from "@/shared/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const perfil = sesion.perfilActivo?.id_perfil || 0;
  if (![2, 4].includes(perfil)) return NextResponse.json({ error: "Solo Técnico o Supervisor puede atender el evento" }, { status: 403 });
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Evento no válido" }, { status: 400 });

  try {
    const body = await req.json();
    const estado = String(body.estado || "").toUpperCase();
    const id_ticket = body.id_ticket ? Number(body.id_ticket) : null;
    if (!["RECONOCIDO", "VINCULADO", "CERRADO"].includes(estado)) return NextResponse.json({ error: "Transición no válida" }, { status: 400 });
    if (estado === "VINCULADO" && !id_ticket) return NextResponse.json({ error: "Vincular un incidente requiere id_ticket" }, { status: 400 });
    const incident = id_ticket ? await queryRow<{ id_ticket: number }>("SELECT id_ticket FROM ticket WHERE id_ticket=$1 AND id_tipo_ticket=1 AND estado_registro=true", [id_ticket]) : null;
    if (id_ticket && !incident) return NextResponse.json({ error: "Solo se puede vincular un incidente activo" }, { status: 400 });
    const row = await queryRow(`
      UPDATE evento_servicio SET estado=$2,id_ticket=COALESCE($3,id_ticket),
        reconocido_por=CASE WHEN $2='RECONOCIDO' AND reconocido_por IS NULL THEN $4 ELSE reconocido_por END,
        reconocido_en=CASE WHEN $2='RECONOCIDO' AND reconocido_en IS NULL THEN now() ELSE reconocido_en END,
        cerrado_por=CASE WHEN $2='CERRADO' THEN $4 ELSE cerrado_por END,
        cerrado_en=CASE WHEN $2='CERRADO' THEN now() ELSE cerrado_en END
      WHERE id_evento=$1 AND estado_registro=true
      RETURNING id_evento,codigo_evento,estado,id_ticket,reconocido_en,cerrado_en
    `, [id, estado, id_ticket, sesion.id_usuario]);
    if (!row) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    return NextResponse.json(row);
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    return NextResponse.json({ error: "No se pudo actualizar el evento" }, { status: 500 });
  }
}
