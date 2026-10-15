import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  crearProveedor,
  listarProveedores,
} from "@/modules/proveedores/services/proveedorService";

function sesionDe(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET(req: NextRequest) {
  const sesion = sesionDe(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROVEEDORES_VER)) {
    return NextResponse.json(
      { error: "No autorizado para consultar proveedores y contratos" },
      { status: 403 }
    );
  }

  try {
    const rows = await listarProveedores(sesion.perfilActivo?.id_perfil === 9);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al consultar proveedores:", error);
    return NextResponse.json({ error: "No se pudieron consultar proveedores" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const sesion = sesionDe(req);
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROVEEDORES_GESTIONAR)) {
    return NextResponse.json(
      { error: "Solo el Gestor de Activos y Configuración mantiene proveedores técnicos" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const proveedor = await crearProveedor(body, sesion.id_usuario);
    return NextResponse.json(proveedor, { status: 201 });
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al crear proveedor:", error);
    const { error: mensaje, status } = respuestaError(
      error,
      "No se pudo crear el proveedor o contrato"
    );
    return NextResponse.json({ error: mensaje }, { status });
  }
}
