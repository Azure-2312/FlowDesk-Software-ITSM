import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import {
  listarIncidentesParaRelacion,
  listarSolicitudesParaRelacion,
} from "@/modules/cambios/services/cambiosService";

export const dynamic = "force-dynamic";

/** Tickets que pueden originar una RFC: incidentes y solicitudes autorizadas en atención. */
export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    const [incidentes, solicitudes] = await Promise.all([
      listarIncidentesParaRelacion(),
      listarSolicitudesParaRelacion(),
    ]);
    return NextResponse.json({ incidentes, solicitudes });
  } catch (err) {
    console.error("Error al listar tickets para relacionar:", err);
    return NextResponse.json({ error: "Error al consultar los tickets" }, { status: 500 });
  }
}
