import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  listarReglasNotificacion,
  actualizarReglaNotificacion,
  crearReglaNotificacion,
} from "@/modules/administracion/services/reglasNotificacionService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_NOTIFICACIONES)) {
    return NextResponse.json({ error: "Solo Administración puede consultar reglas de notificación." }, { status: 403 });
  }

  try {
    const data = await listarReglasNotificacion();
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener reglas de notificación:", err);
    const { error, status } = respuestaError(err, "Error al consultar reglas de notificación");
    return NextResponse.json({ error }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_NOTIFICACIONES)) {
    return NextResponse.json({ error: "Solo Administración puede configurar reglas de notificación." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const data = await actualizarReglaNotificacion(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      ip,
    });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar regla de notificación:", err);
    const { error, status } = respuestaError(err, "Error al actualizar regla de notificación");
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_NOTIFICACIONES)) {
    return NextResponse.json({ error: "Solo Administración puede registrar nuevas reglas de notificación." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const data = await crearReglaNotificacion(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      ip,
    });
    return NextResponse.json(data.payload, { status: data.httpStatus });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear regla de notificación:", err);
    const { error, status } = respuestaError(err, "Error al registrar regla de notificación");
    return NextResponse.json({ error }, { status });
  }
}
