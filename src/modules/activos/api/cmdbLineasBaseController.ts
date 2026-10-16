import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/activos/api/guardiaGestor";
import { listarLineasBase, crearLineaBase } from "@/modules/activos/services/cmdbGestionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CMDB_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarLineasBase());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar líneas base:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las líneas base");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CMDB_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearLineaBase(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear línea base:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al crear la línea base");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
