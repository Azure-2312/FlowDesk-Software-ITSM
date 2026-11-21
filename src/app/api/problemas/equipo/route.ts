import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import {
  obtenerDatosEquipoProblemas,
  obtenerTodosLosEquiposProblemas,
  listarProblemasSinAsignar,
  asignarEquipoYTecnicoProblema,
  crearNuevoEquipoProblemas,
  obtenerDepartamentosYTecnicos,
} from "@/modules/problemas/services/problemasEquipoService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_VER)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const miEquipo = await obtenerDatosEquipoProblemas(sesion.id_usuario);
    const todosLosEquipos = await obtenerTodosLosEquiposProblemas();
    const problemasSinAsignar = await listarProblemasSinAsignar();
    const { departamentos, tecnicos } = await obtenerDepartamentosYTecnicos();

    return NextResponse.json({
      miEquipo,
      todosLosEquipos,
      problemasSinAsignar,
      departamentos,
      tecnicos,
    });
  } catch (err: any) {
    console.error("Error al obtener datos de equipos en problemas:", err);
    return NextResponse.json({ error: "Error al consultar equipos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_GESTIONAR) && sesion.perfilActivo?.id_perfil !== 4) {
    return NextResponse.json({ error: "No autorizado para gestionar equipos de problemas" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { accion } = body;

    if (accion === "asignar") {
      const { id_problema, id_departamento, id_usuario_asignado } = body;
      if (!id_problema || !id_departamento) {
        return NextResponse.json({ error: "Faltan parámetros requeridos para la asignación" }, { status: 400 });
      }
      const res = await asignarEquipoYTecnicoProblema(
        Number(id_problema),
        Number(id_departamento),
        id_usuario_asignado ? Number(id_usuario_asignado) : undefined
      );
      return NextResponse.json({ ok: true, resultado: res });
    }

    if (accion === "crear_equipo") {
      const { codigo, nombre, descripcion } = body;
      if (!codigo || !nombre) {
        return NextResponse.json({ error: "El código y el nombre del equipo son obligatorios" }, { status: 400 });
      }
      const nuevo = await crearNuevoEquipoProblemas(codigo, nombre, descripcion || "", sesion.id_usuario);
      return NextResponse.json({ ok: true, equipo: nuevo }, { status: 201 });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    console.error("Error al gestionar equipo de problemas:", err);
    return NextResponse.json({ error: err.message || "Error al procesar la solicitud" }, { status: 500 });
  }
}
