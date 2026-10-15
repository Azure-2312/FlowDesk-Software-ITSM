export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, Capacidad, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { CrearTicketPayload } from "@/types";
import { crearTicket, listarTickets } from "@/modules/tickets/services/ticketsService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const vista = searchParams.get("vista") || "todos";
  const idPerfil = sesion.perfilActivo?.id_perfil;

  // Cada bandeja del listado corresponde a una capacidad `tickets:vista:*`.
  const CAPACIDAD_POR_VISTA: Record<string, Capacidad> = {
    todos: CAPACIDADES.TICKETS_VISTA_TODOS,
    mios: CAPACIDADES.TICKETS_VISTA_MIOS,
    asignados: CAPACIDADES.TICKETS_VISTA_ASIGNADOS,
    bandeja: CAPACIDADES.TICKETS_VISTA_BANDEJA,
    resueltos: CAPACIDADES.TICKETS_VISTA_RESUELTOS,
    aprobaciones: CAPACIDADES.TICKETS_VISTA_APROBACIONES,
    departamento: CAPACIDADES.TICKETS_VISTA_DEPARTAMENTO,
    auditoria: CAPACIDADES.TICKETS_VISTA_AUDITORIA,
  };
  const capacidadVista = CAPACIDAD_POR_VISTA[vista];
  if (!capacidadVista || !sesionTieneCapacidad(sesion, capacidadVista)) {
    return NextResponse.json({ error: "No tienes permiso para consultar esta bandeja." }, { status: 403 });
  }

  if (vista === "aprobaciones" && !sesionTieneCapacidad(sesion, CAPACIDADES.SOLICITUDES_APROBAR)) {
    return NextResponse.json({ error: "Esta bandeja está reservada al Gestor de Área." }, { status: 403 });
  }

  try {
    const data = await listarTickets(
      { idUsuario: sesion.id_usuario, idPerfil: idPerfil || 0 },
      {
        vista,
        idTipo: searchParams.get("id_tipo"),
        idPrioridad: searchParams.get("id_prioridad"),
        idEstado: searchParams.get("id_estado"),
        idDepartamento: searchParams.get("id_departamento"),
        idServicio: searchParams.get("id_servicio"),
        estadoAprobacion: searchParams.get("estado_aprobacion"),
        buscar: searchParams.get("buscar"),
        soloAsignadosAMi: searchParams.get("solo_asignados_a_mi"),
        slaVencido: searchParams.get("sla_vencido"),
        solicitante: searchParams.get("solicitante"),
        tecnico: searchParams.get("tecnico"),
      }
    );

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    console.error("Error al listar tickets:", err);
    return NextResponse.json({ error: "Error al obtener tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.TICKETS_VER)) {
    return NextResponse.json({ error: "Este perfil no puede registrar tickets." }, { status: 403 });
  }

  try {
    const body: CrearTicketPayload = await req.json();
    const data = await crearTicket(sesion, body);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear ticket:", err);
    const { error, status } = respuestaError(err, "Error al registrar ticket");
    return NextResponse.json({ error }, { status });
  }
}
