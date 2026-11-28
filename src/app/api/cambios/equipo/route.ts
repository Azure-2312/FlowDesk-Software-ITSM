import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad, ACCIONES } from "@/shared/lib/capacidades";
import {
  obtenerDatosEquipoTrabajo,
  obtenerTodosLosEquiposTrabajo,
  listarCambiosSinAsignar,
  asignarResponsableCambio,
  crearNuevoEquipoTrabajo,
  obtenerTecnicosDisponibles,
} from "@/modules/cambios/services/cambiosEquipoService";
import { accionPermitida } from "@/shared/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_VER)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const miEquipo = await obtenerDatosEquipoTrabajo(sesion.id_usuario);
    const todosLosEquipos = await obtenerTodosLosEquiposTrabajo();
    const cambiosSinAsignar = await listarCambiosSinAsignar();
    const tecnicosDisponibles = await obtenerTecnicosDisponibles();

    return NextResponse.json({
      miEquipo,
      todosLosEquipos,
      cambiosSinAsignar,
      tecnicosDisponibles,
    });
  } catch (err: any) {
    console.error("Error al obtener datos de equipo en cambios:", err);
    return NextResponse.json({ error: "Error al consultar equipos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const negadoAccion = accionPermitida(sesion, ACCIONES.CAMBIO_EQUIPO_ASIGNAR);
  if (negadoAccion) return negadoAccion;

  try {
    const body = await req.json();
    const { accion } = body;

    if (accion === "asignar") {
      const { id_cambio, id_usuario_responsable } = body;
      if (!id_cambio || !id_usuario_responsable) {
        return NextResponse.json({ error: "Faltan parámetros requeridos para la asignación" }, { status: 400 });
      }
      const res = await asignarResponsableCambio(Number(id_cambio), Number(id_usuario_responsable));
      return NextResponse.json({ ok: true, resultado: res });
    }

    if (accion === "crear_equipo") {
      const { codigo, nombre, descripcion } = body;
      if (!codigo || !nombre) {
        return NextResponse.json({ error: "El código y el nombre del equipo son obligatorios" }, { status: 400 });
      }
      const nuevo = await crearNuevoEquipoTrabajo(codigo, nombre, descripcion || "", sesion.id_usuario);
      return NextResponse.json({ ok: true, equipo: nuevo }, { status: 201 });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    console.error("Error al gestionar equipo de cambios:", err);
    return NextResponse.json({ error: err.message || "Error al procesar la solicitud" }, { status: 500 });
  }
}
