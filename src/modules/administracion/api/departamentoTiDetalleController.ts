import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  obtenerDepartamentoTi,
  actualizarDepartamentoTi,
} from "@/modules/administracion/services/departamentoTiDetalleService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idDepartamento = parseInt(params.id, 10);
  if (isNaN(idDepartamento)) {
    return NextResponse.json({ error: "ID de departamento inválido" }, { status: 400 });
  }

  try {
    const data = await obtenerDepartamentoTi(idDepartamento, sesion);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener detalle del departamento:", err);
    const { error, status } = respuestaError(err, "Error al consultar departamento");
    return NextResponse.json({ error }, { status });
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

  // La estructura y sus responsables se configuran centralmente; el Supervisor
  // coordina su equipo, pero no altera departamentos ni se asigna a sí mismo.
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_ORGANIZACION)) {
    return NextResponse.json({ error: "No autorizado para modificar departamentos" }, { status: 403 });
  }

  const idDepartamento = parseInt(params.id, 10);
  if (isNaN(idDepartamento)) {
    return NextResponse.json({ error: "ID de departamento inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data = await actualizarDepartamentoTi(idDepartamento, body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar departamento:", err);
    const { error, status } = respuestaError(err, "No se pudo actualizar el departamento");
    return NextResponse.json({ error }, { status });
  }
}
