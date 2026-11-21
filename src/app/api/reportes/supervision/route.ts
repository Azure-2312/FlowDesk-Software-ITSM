import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { generarInformeSupervision } from "@/modules/reportes/services/informeSupervisionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.REPORTES_VER) && sesion.perfilActivo?.id_perfil !== 4) {
    return NextResponse.json({ error: "No autorizado para consultar informe de supervisión" }, { status: 403 });
  }

  try {
    const data = await generarInformeSupervision(sesion.id_usuario);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error al generar informe de supervisión:", err);
    return NextResponse.json({ error: "Error al generar el informe de supervisión" }, { status: 500 });
  }
}
