import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { actualizarEvento } from "@/modules/operacion/services/eventoService";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.OPERACION_ATENDER)) {
    return NextResponse.json(
      { error: "Solo Técnico o Supervisor puede atender el evento" },
      { status: 403 }
    );
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Evento no válido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const row = await actualizarEvento(id, body, sesion.id_usuario);
    return NextResponse.json(row);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar evento:", error);
    const { error: mensaje, status } = respuestaError(error, "No se pudo actualizar el evento");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
