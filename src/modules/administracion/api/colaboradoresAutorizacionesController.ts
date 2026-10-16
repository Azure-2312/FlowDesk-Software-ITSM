import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  listarAutorizaciones,
  otorgarAutorizacion,
  revocarAutorizacion,
  resolverDepartamentoEmpresa,
} from "@/modules/administracion/services/colaboradoresAutorizacionesService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const s = token ? verificarTokenSesion(token) : null;
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(s, CAPACIDADES.AREA_COLABORADORES)) {
    return NextResponse.json({ error: "Solo el Gestor de Área puede administrar autorizaciones." }, { status: 403 });
  }

  try {
    const area = await resolverDepartamentoEmpresa(s.id_usuario);
    const data = await listarAutorizaciones(area?.id_departamento_empresa ?? 0);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar autorizaciones:", err);
    const { error, status } = respuestaError(err, "Error al consultar autorizaciones");
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const s = token ? verificarTokenSesion(token) : null;
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(s, CAPACIDADES.AREA_COLABORADORES)) {
    return NextResponse.json({ error: "Solo el Gestor de Área puede otorgar autorizaciones." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await otorgarAutorizacion(Number(body.id_usuario), body.tipo, s.id_usuario);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al otorgar autorización:", err);
    const { error, status } = respuestaError(err, "Error al otorgar la autorización");
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const s = token ? verificarTokenSesion(token) : null;
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(s, CAPACIDADES.AREA_COLABORADORES)) {
    return NextResponse.json({ error: "Solo el Gestor de Área puede revocar autorizaciones." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    const data = await revocarAutorizacion(id, s.id_usuario);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al revocar autorización:", err);
    const { error, status } = respuestaError(err, "Error al revocar la autorización");
    return NextResponse.json({ error }, { status });
  }
}
