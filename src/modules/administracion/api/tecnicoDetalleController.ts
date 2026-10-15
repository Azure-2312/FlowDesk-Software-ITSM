import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { retirarTecnico, actualizarTecnico } from "@/modules/administracion/services/tecnicoDetalleService";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_ORGANIZACION)) return NextResponse.json({ error: "Solo Administración puede retirar técnicos de un departamento." }, { status: 403 });
  const idUsuario = Number(params.id);
  if (!Number.isInteger(idUsuario)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const data = await retirarTecnico(idUsuario);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al retirar técnico:", err);
    const { error, status } = respuestaError(err, "No se pudo retirar el técnico");
    return NextResponse.json({ error }, { status });
  }
}

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idUsuario = parseInt(params.id, 10);
  if (isNaN(idUsuario)) {
    return NextResponse.json({ error: "ID de técnico inválido" }, { status: 400 });
  }

  const esAdminOSupervisor = sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_TECNICOS);
  const esElMismoTecnico = sesion.id_usuario === idUsuario;

  if (!esAdminOSupervisor && !esElMismoTecnico) {
    return NextResponse.json({ error: "No autorizado para modificar este técnico" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await actualizarTecnico(idUsuario, body, sesion);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar técnico:", err);
    const { error, status } = respuestaError(err, "No se pudo actualizar el técnico");
    return NextResponse.json({ error }, { status });
  }
}
