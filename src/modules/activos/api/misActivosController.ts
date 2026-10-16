import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { listarMisActivos } from "@/modules/activos/services/activosService";
import { aceptarActa, listarActasPendientes } from "@/modules/activos/services/misActivosService";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const token = cookies().get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }

  try {
    const activos = await listarMisActivos(sesion.id_usuario);
    return NextResponse.json(activos);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar mis activos:", err);
    const { error, status } = respuestaError(err, "Error al consultar tus activos");
    return NextResponse.json({ error }, { status });
  }
}

/** Lista las actas de entrega pendientes de aceptación del custodio autenticado. */
export async function GET_ACTAS_PENDIENTES(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }

  try {
    const actas = await listarActasPendientes(sesion.id_usuario);
    return NextResponse.json(actas);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar actas pendientes:", err);
    const { error, status } = respuestaError(err, "Error al consultar tus actas pendientes");
    return NextResponse.json({ error }, { status });
  }
}

/** Acepta el acta de entrega pendiente de un activo del custodio autenticado. */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const idActivo = Number(body?.id_activo);
    if (!idActivo || Number.isNaN(idActivo)) {
      return NextResponse.json({ error: "Debes indicar el activo del acta." }, { status: 400 });
    }

    const resultado = await aceptarActa(idActivo, sesion.id_usuario, body?.observaciones);
    return NextResponse.json(resultado);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al aceptar acta de entrega:", err);
    const { error, status } = respuestaError(err, "Error al aceptar el acta de entrega");
    return NextResponse.json({ error }, { status });
  }
}
