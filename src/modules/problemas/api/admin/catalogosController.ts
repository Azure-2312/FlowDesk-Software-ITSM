import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarValorCatalogo,
  crearValorCatalogo,
  eliminarValorCatalogo,
  fusionarValorCatalogo,
  listarCatalogosProblemas,
} from "@/modules/problemas/services/catalogosService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  try {
    const data = await listarCatalogosProblemas(searchParams.get("catalogo"));
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al obtener catálogos de problemas:", error);
    return NextResponse.json({ error: "Error interno al consultar catálogos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { operacion } = body;

    if (operacion === "fusionar") {
      return NextResponse.json(await fusionarValorCatalogo(body));
    }

    return NextResponse.json(await crearValorCatalogo(body));
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear valor de catálogo:", error);
    const { error: mensaje, status } = respuestaError(
      error,
      error?.message || "Error interno al guardar valor de catálogo."
    );
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await req.json();
    return NextResponse.json(await actualizarValorCatalogo(body));
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar catálogo:", error);
    const { error: mensaje, status } = respuestaError(
      error,
      error?.message || "Error interno al actualizar catálogo."
    );
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIGURAR)) {
    return NextResponse.json(
      { error: "Solo administradores pueden eliminar valores de catálogos." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const catalogo = searchParams.get("catalogo");
  const id = searchParams.get("id");
  if (!catalogo || !id) return NextResponse.json({ error: "Parámetros insuficientes." }, { status: 400 });

  try {
    return NextResponse.json(await eliminarValorCatalogo(catalogo, id));
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al eliminar catálogo:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al eliminar valor.");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
