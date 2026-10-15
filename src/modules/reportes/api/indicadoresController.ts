import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { obtenerIndicadores } from "@/modules/reportes/services/indicadoresService";

export const dynamic = "force-dynamic";

/** Aggregate-only reporting endpoint: it does not expose ticket content or PII. */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.INDICADORES_VER)) {
    return NextResponse.json(
      { error: "Este perfil no puede consultar indicadores globales." },
      { status: 403 }
    );
  }

  try {
    const indicadores = await obtenerIndicadores({
      idPerfil: sesion.perfilActivo?.id_perfil,
      idUsuario: sesion.id_usuario,
    });
    return NextResponse.json({ indicadores });
  } catch (err) {
    console.error("Error al calcular indicadores:", err);
    return NextResponse.json({ error: "No se pudieron calcular los indicadores." }, { status: 500 });
  }
}
