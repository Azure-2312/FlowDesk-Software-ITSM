import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarReglaUmbral,
  crearReglaUmbral,
  duplicarReglaUmbral,
  eliminarReglaUmbral,
  listarReglasUmbral,
} from "@/modules/problemas/services/relacionesUmbralService";

export const dynamic = "force-dynamic";

// Reglas de detección de candidatos: verlas exige PROBLEMAS_CONFIG_VER y
// modificarlas PROBLEMAS_CONFIGURAR (Administrador y Gestor de Problemas).

function fallo(error: unknown, mensaje: string) {
  if (!(error instanceof ErrorDominio)) console.error(`${mensaje}:`, error);
  const { error: texto, status } = respuestaError(error, mensaje);
  return NextResponse.json({ error: texto }, { status });
}

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_CONFIG_VER);
  if (error) return error;
  try {
    return NextResponse.json(await listarReglasUmbral());
  } catch (err) {
    return fallo(err, "Error al listar las reglas de detección");
  }
}

export async function POST(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_CONFIGURAR);
  if (error) return error;
  try {
    const { accion, regla } = await req.json();
    if (accion === "crear") return NextResponse.json(await crearReglaUmbral(regla));
    if (accion === "duplicar") return NextResponse.json(await duplicarReglaUmbral(regla));
    return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
  } catch (err) {
    return fallo(err, "Error al guardar la regla de detección");
  }
}

export async function PUT(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_CONFIGURAR);
  if (error) return error;
  try {
    return NextResponse.json(await actualizarReglaUmbral(await req.json()));
  } catch (err) {
    return fallo(err, "Error al actualizar la regla de detección");
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_CONFIGURAR);
  if (error) return error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  try {
    return NextResponse.json(await eliminarReglaUmbral(id));
  } catch (err) {
    return fallo(err, "Error al eliminar la regla de detección");
  }
}
