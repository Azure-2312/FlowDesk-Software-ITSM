import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { actualizarCambio, obtenerDetalleCambio } from "@/modules/cambios/services/cambioDetalleService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_VER)) {
    return NextResponse.json({ error: "Este perfil no puede consultar solicitudes de cambio." }, { status: 403 });
  }

  const id = params.id;
  const idCambio = parseInt(id, 10);
  if (isNaN(idCambio)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const data = await obtenerDetalleCambio(sesion, idCambio);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al obtener detalle del cambio:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al obtener cambio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_MODIFICAR)) {
    return NextResponse.json({ error: "Solo el Aprobador CAB o el Gestor de Cambios pueden modificar RFC." }, { status: 403 });
  }

  const id = params.id;
  const idCambio = parseInt(id, 10);
  if (isNaN(idCambio)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data = await actualizarCambio(sesion, idCambio, body);
    return NextResponse.json(data);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar cambio:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al actualizar el cambio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
