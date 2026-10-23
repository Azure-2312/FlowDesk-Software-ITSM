import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { actualizarDepartamentoEmpresa } from "@/modules/organizacion/services/departamentoEmpresaDetalleService";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const t = req.cookies.get(COOKIE_SESION)?.value;
  const s = t ? verificarTokenSesion(t) : null;
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(s, CAPACIDADES.ADMIN_ORGANIZACION)) return NextResponse.json({ error: "Solo Administración puede editar departamentos." }, { status: 403 });

  const id = Number(params.id);

  try {
    const b = await req.json();
    const data = await actualizarDepartamentoEmpresa(id, b);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar el departamento:", err);
    const { error, status } = respuestaError(err, "No se pudo actualizar el departamento.");
    return NextResponse.json({ error }, { status });
  }
}
