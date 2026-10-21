import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarCargaTecnico } from "./tecnicoCargaService";

export interface UsuarioTecnico {
  idUsuario: number;
  nombres: string;
}

/**
 * Toma atómicamente un ticket de la cola del departamento del técnico y deja
 * constancia en la bitácora de comentarios.
 */
export async function tomarTicketDeMesa(idTicket: number, usuario: UsuarioTecnico) {
  if (!Number.isInteger(idTicket) || idTicket <= 0) {
    throw new ErrorDominio("ID de ticket inválido");
  }

  const tecnico = await queryRow<{ id_departamento: number }>(
    "SELECT id_departamento FROM tecnico_detalle WHERE id_usuario = $1 AND estado_registro = true",
    [usuario.idUsuario]
  );
  if (!tecnico) {
    throw new ErrorDominio("No tienes un departamento técnico asignado.", 403);
  }

  // Validación de saturación de capacidad del técnico (RN-16)
  await validarCargaTecnico(usuario.idUsuario, idTicket);

  const ticketTomado = await queryRow<{
    id_ticket: number;
    codigo_ticket: string;
    titulo: string;
    id_estado: number;
  }>(
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
    [usuario.idUsuario, idTicket, tecnico.id_departamento]
  );

  if (!ticketTomado) {
    throw new ErrorDominio(
      "El ticket ya fue tomado por otro especialista o no pertenece a tu departamento.",
      409
    );
  }

  await query(
    `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno, id_estado_cambiado)
     VALUES ($1, $2, $3, false, $4)`,
    [
      idTicket,
      usuario.idUsuario,
      `Ticket tomado para atención por el especialista ${usuario.nombres}.`,
      ticketTomado.id_estado,
    ]
  );

  return ticketTomado;
}
