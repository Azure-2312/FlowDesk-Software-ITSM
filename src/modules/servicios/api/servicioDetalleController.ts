import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarServicio,
  obtenerServicio,
} from "@/modules/servicios/services/servicioService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const idServicio = parseInt(params.id, 10);
  if (isNaN(idServicio)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const servicio = await obtenerServicio(idServicio);
    return NextResponse.json({ servicio });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al obtener detalle del servicio:", error);
    const { error: mensaje, status } = respuestaError(error, "Error al consultar servicio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.SERVICIOS_CONFIGURAR)) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para modificar servicios" },
      { status: 403 }
    );
  }

  const idServicio = parseInt(params.id, 10);
  if (isNaN(idServicio)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const body = await req.json();
    const servicio = await actualizarServicio(idServicio, body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json({ servicio });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar servicio:", error);
    const { error: mensaje, status } = respuestaError(error, "No se pudo actualizar el servicio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
