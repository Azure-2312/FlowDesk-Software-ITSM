import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { listarTecnicos, guardarTecnico } from "@/modules/organizacion/services/tecnicoService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_TECNICOS)) {
    return NextResponse.json({ error: "No autorizado para consultar la carga de técnicos" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  try {
    const data = await listarTecnicos(sesion, {
      idDepartamento: searchParams.get("id_departamento"),
      nivel: searchParams.get("nivel"),
      estado: searchParams.get("estado"),
    });
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener tecnicos con carga:", err);
    const { error, status } = respuestaError(err, "Error al consultar tecnicos");
    return NextResponse.json({ error }, { status });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Permitido para Administrador (1) y Supervisor (4)
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_TECNICOS)) {
    return NextResponse.json({ error: "No autorizado para configurar técnicos" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await guardarTecnico(body, sesion);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al guardar configuracion de tecnico:", err);
    const { error, status } = respuestaError(err, "Error al registrar tecnico");
    return NextResponse.json({ error }, { status });
  }
}
