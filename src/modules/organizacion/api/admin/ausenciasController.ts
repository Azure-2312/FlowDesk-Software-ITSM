import { NextRequest, NextResponse } from "next/server";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { respuestaError } from "@/shared/lib/errores";
import {
  listarAusencias,
  crearAusencia,
  actualizarAusencia,
  eliminarAusencia,
} from "@/modules/organizacion/services/ausenciasService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ADMIN_TECNICOS);
  if (error) return error;

  try {
    const data = await listarAusencias();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al obtener ausencias:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ADMIN_TECNICOS);
  if (error) return error;

  try {
    const body = await req.json();
    const data = await crearAusencia(body, sesion.id_usuario);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al registrar ausencia:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.ADMIN_TECNICOS);
  if (error) return error;

  try {
    const body = await req.json();
    const data = await actualizarAusencia(body);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al actualizar ausencia:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.ADMIN_TECNICOS);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const data = await eliminarAusencia(id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al eliminar ausencia:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}
