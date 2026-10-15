import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  asignarCategoriaServicios,
  crearServicio,
  listarServicios,
} from "@/modules/servicios/services/servicioService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  try {
    const servicios = await listarServicios({
      idTipo: searchParams.get("id_tipo"),
      idCategoria: searchParams.get("id_categoria"),
      buscar: searchParams.get("buscar"),
      estado: searchParams.get("estado"),
    });
    return NextResponse.json({ servicios });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    return NextResponse.json({ error: "Error al cargar el catálogo de servicios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.SERVICIOS_CONFIGURAR)) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para crear servicios" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const servicio = await crearServicio(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json({ servicio }, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear servicio:", error);
    const { error: mensaje, status } = respuestaError(error, "No se pudo registrar el servicio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion || !sesionTieneCapacidad(sesion, CAPACIDADES.SERVICIOS_CONFIGURAR)) {
    return NextResponse.json(
      { error: "Solo el Administrador puede asignar servicios a categorías." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const resultado = await asignarCategoriaServicios(body, {
      idUsuario: sesion.id_usuario,
      nombres: sesion.nombres,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json(resultado);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al asignar categoría a servicios:", error);
    const { error: mensaje, status } = respuestaError(
      error,
      "Error en el servidor al asignar servicios."
    );
    return NextResponse.json({ error: mensaje }, { status });
  }
}
