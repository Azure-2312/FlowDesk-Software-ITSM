import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/activos/api/guardiaGestor";
import { listarContratos, crearContrato, actualizarContrato } from "@/modules/activos/services/contratosService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.PROVEEDORES_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarContratos());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar contratos:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los contratos");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROVEEDORES_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearContrato(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear contrato:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar el contrato");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROVEEDORES_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await actualizarContrato(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar contrato:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al actualizar el contrato");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
