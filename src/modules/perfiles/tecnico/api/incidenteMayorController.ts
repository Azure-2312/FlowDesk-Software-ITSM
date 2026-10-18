import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { agregarComunicado, listarIncidentesMayores } from "@/modules/perfiles/tecnico/services/incidenteMayorService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    return NextResponse.json(await listarIncidentesMayores());
  } catch (error) {
    console.error("Error al listar incidentes mayores:", error);
    return NextResponse.json({ error: "Error al consultar los incidentes mayores" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    return NextResponse.json(await agregarComunicado(sesion.id_usuario, body));
  } catch (error) {
    console.error("Error al registrar comunicado del incidente mayor:", error);
    return NextResponse.json({ error: "Error al registrar el comunicado" }, { status: 500 });
  }
}
