import { NextRequest, NextResponse } from "next/server";
import { queryRow, query } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (sesion.perfilActivo?.id_perfil !== 2) {
    return NextResponse.json({ error: "Solo especialistas técnicos pueden tomar tickets de la cola." }, { status: 403 });
  }

  try {
    const { id_ticket } = await req.json();
    const idTicket = parseInt(id_ticket, 10);
    if (!idTicket || isNaN(idTicket)) {
      return NextResponse.json({ error: "ID de ticket inválido" }, { status: 400 });
    }

    // Verificar departamento del técnico
    const tecnico = await queryRow<{ id_departamento: number }>(
      "SELECT id_departamento FROM tecnico_detalle WHERE id_usuario = $1 AND estado_registro = true",
      [sesion.id_usuario]
    );

    if (!tecnico) {
      return NextResponse.json({ error: "No tienes un departamento técnico asignado." }, { status: 403 });
    }

    // Intentar tomar atómicamente el ticket
    const ticketTomado = await queryRow<any>(
      `UPDATE ticket
       SET id_usuario_asignado = $1,
           id_estado = CASE WHEN id_estado = 1 THEN 2 ELSE id_estado END,
           usuario_modificacion = $1,
           fecha_modificacion = now()
       WHERE id_ticket = $2 
         AND id_usuario_asignado IS NULL 
         AND id_departamento = $3
         AND estado_registro = true
       RETURNING id_ticket, codigo_ticket, titulo, id_estado`,
      [sesion.id_usuario, idTicket, tecnico.id_departamento]
    );

    if (!ticketTomado) {
      return NextResponse.json(
        { error: "El ticket ya fue tomado por otro especialista o no pertenece a tu departamento." },
        { status: 409 }
      );
    }

    // Registrar en auditoría de comentarios
    await query(
      `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno, id_estado_cambiado)
       VALUES ($1, $2, $3, false, $4)`,
      [
        idTicket,
        sesion.id_usuario,
        `Ticket tomado para atención por el especialista ${sesion.nombres}.`,
        ticketTomado.id_estado,
      ]
    );

    return NextResponse.json({
      exito: true,
      mensaje: `Ticket ${ticketTomado.codigo_ticket} tomado con éxito.`,
      ticket: ticketTomado,
    });
  } catch (error) {
    console.error("Error al tomar ticket:", error);
    return NextResponse.json({ error: "Error al procesar la toma del ticket." }, { status: 500 });
  }
}
