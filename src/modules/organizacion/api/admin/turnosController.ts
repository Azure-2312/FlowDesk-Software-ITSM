import { NextRequest, NextResponse } from "next/server";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { respuestaError } from "@/shared/lib/errores";
import {
  listarTurnos,
  crearTurno,
  eliminarTurno,
} from "@/modules/organizacion/services/turnosService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ADMIN_TECNICOS);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const data = await listarTurnos(sesion, {
      desde: searchParams.get("desde"),
      hasta: searchParams.get("hasta"),
      idUsuario: searchParams.get("id_usuario"),
    });
    return NextResponse.json(data);
  } catch (error: any) {
    if (!error?.status) console.error("Error al obtener turnos:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ADMIN_TECNICOS);
  if (error) return error;

  try {
    const data = await crearTurno(await req.json(), sesion);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!error?.status) console.error("Error al registrar turno:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ADMIN_TECNICOS);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const data = await eliminarTurno(searchParams.get("id"), sesion);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!error?.status) console.error("Error al eliminar turno:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}
