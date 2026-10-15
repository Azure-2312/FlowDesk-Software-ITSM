import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarWorkflow,
  listarPasosWorkflow,
} from "@/modules/servicios/services/servicioService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const idServicio = parseInt(params.id, 10);
  if (isNaN(idServicio)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const pasos = await listarPasosWorkflow(idServicio);
    return NextResponse.json({ pasos });
  } catch (error) {
    console.error("Error al obtener pasos del workflow:", error);
    return NextResponse.json({ error: "Error al consultar pasos del workflow" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.SERVICIOS_CONFIGURAR)) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para modificar el workflow" },
      { status: 403 }
    );
  }

  const idServicio = parseInt(params.id, 10);
  if (isNaN(idServicio)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const body = await req.json();
    const pasos = await actualizarWorkflow(idServicio, body.pasos);
    return NextResponse.json({
      mensaje: "Workflow actualizado correctamente",
      pasos,
    });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar pasos del workflow:", error);
    const { error: mensaje, status } = respuestaError(error, "No se pudo actualizar el workflow");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
