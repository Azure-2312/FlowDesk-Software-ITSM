import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  listarDepartamentosEmpresa,
  crearDepartamentoEmpresa,
} from "@/modules/administracion/services/departamentoEmpresaService";

function sesion(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}
export async function GET(req: NextRequest) {
  const s = sesion(req);
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(s, CAPACIDADES.ADMIN_ORGANIZACION)) return NextResponse.json({ error: "Solo Administración puede consultar departamentos." }, { status: 403 });

  try {
    const data = await listarDepartamentosEmpresa();
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar departamentos:", err);
    const { error, status } = respuestaError(err, "Error al consultar departamentos");
    return NextResponse.json({ error }, { status });
  }
}
export async function POST(req: NextRequest) {
  const s = sesion(req);
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(s, CAPACIDADES.ADMIN_ORGANIZACION)) return NextResponse.json({ error: "Solo Administración puede crear departamentos." }, { status: 403 });

  try {
    const b = await req.json();
    const data = await crearDepartamentoEmpresa(b);
    return NextResponse.json(data.payload, { status: data.httpStatus });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear el departamento:", err);
    const { error, status } = respuestaError(err, "No se pudo crear el departamento.");
    return NextResponse.json({ error }, { status });
  }
}
