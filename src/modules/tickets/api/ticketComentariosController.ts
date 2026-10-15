import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ComentarioTicket, Ticket } from "@/types";
import { validarTexto } from "@/shared/lib/validaciones";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idTicket = parseInt(params.id, 10);
  if (isNaN(idTicket)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { comentario, es_interno } = body;

    const vCom = validarTexto(comentario, 2, 2000, "El comentario", true);
    if (!vCom.valido) {
      return NextResponse.json({ error: vCom.mensaje }, { status: 400 });
    }

    const ticket = await queryRow<Ticket>(
      "SELECT id_ticket, id_usuario_solicitante, id_usuario_asignado, id_departamento, id_departamento_empresa, id_estado FROM ticket WHERE id_ticket = $1 AND estado_registro = true",
      [idTicket]
    );

    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }

    const idPerfil = sesion.perfilActivo?.id_perfil;
    let puedeComentar = false;
    if (idPerfil === 1) {
      puedeComentar = true;
    } else if (idPerfil === 3) {
      puedeComentar = ticket.id_usuario_solicitante === sesion.id_usuario;
    } else if (idPerfil === 2) {
      puedeComentar = ticket.id_usuario_asignado === sesion.id_usuario;
    } else if (idPerfil === 4) {
      puedeComentar = true;
    } else if (idPerfil === 5) {
      const gestor = await queryRow<{ id_departamento_empresa: number | null }>(
        "SELECT id_departamento_empresa FROM usuario WHERE id_usuario = $1 AND estado_registro = true",
        [sesion.id_usuario]
      );
      puedeComentar = !!gestor?.id_departamento_empresa && ticket.id_departamento_empresa === gestor.id_departamento_empresa;
    }
    if (!puedeComentar) {
      return NextResponse.json({ error: "No tienes permiso para comentar en este ticket." }, { status: 403 });
    }

    const userRow = await queryRow<{ nivel_prioridad: number }>(
      "SELECT COALESCE(nivel_prioridad, 5) AS nivel_prioridad FROM usuario WHERE id_usuario = $1",
      [sesion.id_usuario]
    );
    const esPersonalTI = [1, 2, 4, 6, 8, 9, 10].includes(idPerfil || 0);
    const esPrioridadEjecutivaOVip = Number(userRow?.nivel_prioridad || 5) <= 2;
    const tienePermisoInterno = esPersonalTI || esPrioridadEjecutivaOVip;

    const esNotaInternaSegura = tienePermisoInterno && Boolean(es_interno);

    const res = await queryRow<ComentarioTicket>(
      `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [idTicket, sesion.id_usuario, comentario.trim(), esNotaInternaSegura]
    );

    return NextResponse.json({ comentario: res }, { status: 201 });
  } catch (err) {
    console.error("Error al registrar comentario:", err);
    return NextResponse.json({ error: "Error al registrar comentario" }, { status: 500 });
  }
}
