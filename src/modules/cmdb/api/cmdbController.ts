import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad, ACCIONES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { actualizarCi, crearCi, listarCmdb } from "@/modules/cmdb/services/cmdbService";
import { accionPermitida } from "@/shared/lib/api-auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CMDB_VER)) {
    return NextResponse.json({ error: "No autorizado para consultar la CMDB" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  try {
    const data = await listarCmdb({
      tipo: searchParams.get("tipo"),
      criticidad: searchParams.get("criticidad"),
      estado: searchParams.get("estado"),
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener CMDB:", error);
    return NextResponse.json({ error: "Error al consultar la base de datos de configuración (CMDB)" }, { status: 500 });
  }
}

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
    const data = await crearCi(sesion, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al registrar CI:", error);
    const { error: mensaje, status } = respuestaError(error, "Error interno al registrar CI en la CMDB");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Administrador (1), Técnico (2) o Gestor de Activos (9)
  const negadoAccion = accionPermitida(sesion, ACCIONES.CI_EDITAR);
  if (negadoAccion) return negadoAccion;

  try {
    const body = await req.json();
    const data = await actualizarCi(sesion, body);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar CI:", err);
    const { error, status } = respuestaError(err, "No se pudo actualizar el CI en la CMDB");
    return NextResponse.json({ error }, { status });
  }
}
