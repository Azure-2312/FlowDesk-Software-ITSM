import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { actualizarProveedor } from "@/modules/proveedores/services/proveedorService";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROVEEDORES_GESTIONAR)) {
    return NextResponse.json(
      { error: "Solo el Gestor de Activos y Configuración puede modificar proveedores" },
      { status: 403 }
    );
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Proveedor no válido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const proveedor = await actualizarProveedor(id, body, sesion.id_usuario);
    return NextResponse.json(proveedor);
  } catch (error) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar proveedor:", error);
    const { error: mensaje, status } = respuestaError(
      error,
      "No se pudo actualizar el proveedor"
    );
    return NextResponse.json({ error: mensaje }, { status });
  }
}
