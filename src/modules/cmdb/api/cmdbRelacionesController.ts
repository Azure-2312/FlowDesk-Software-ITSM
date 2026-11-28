import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { crearRelacionCmdb, eliminarRelacionCmdb } from "@/modules/cmdb/services/cmdbRelacionesService";
import { accionPermitida } from "@/shared/lib/api-auth";
import { ACCIONES } from "@/shared/lib/capacidades";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Administrador (1) o Gestor de Activos (9)
  const negadoAccion = accionPermitida(sesion, ACCIONES.CI_REGISTRAR);
  if (negadoAccion) return negadoAccion;

  try {
    const body = await req.json();
    const data = await crearRelacionCmdb(body);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al registrar relación CMDB:", err);
    const { error, status } = respuestaError(err, "Error al guardar relación en CMDB");
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Administrador (1) o Gestor de Activos (9)
  const negadoAccion = accionPermitida(sesion, ACCIONES.CI_REGISTRAR);
  if (negadoAccion) return negadoAccion;

  try {
    const { searchParams } = new URL(req.url);
    const data = await eliminarRelacionCmdb(searchParams.get("id_ci_padre"), searchParams.get("id_ci_hijo"));
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al eliminar relación CMDB:", err);
    const { error, status } = respuestaError(err, "Error al eliminar relación en CMDB");
    return NextResponse.json({ error }, { status });
  }
}
