import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { aprobarArticulo, publicarArticulos } from "@/modules/conocimiento/services/conocimientoService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const idPerfil = sesion.perfilActivo?.id_perfil || 0;
  if (idPerfil !== 1 && idPerfil !== 4 && !sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_GESTIONAR)) {
    return NextResponse.json({ error: "No autorizado para aprobar o publicar artículos" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { accion } = body;

    if (accion === "aprobar") {
      const { id_articulo } = body;
      if (!id_articulo) {
        return NextResponse.json({ error: "El id_articulo es requerido" }, { status: 400 });
      }
      const resultado = await aprobarArticulo(Number(id_articulo));
      return NextResponse.json({ ok: true, resultado });
    }

    if (accion === "publicar") {
      const { ids } = body;
      const resultado = await publicarArticulos(Array.isArray(ids) ? ids.map(Number) : undefined);
      return NextResponse.json({ ok: true, publicados: resultado });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error en publicacion de conocimiento:", error);
    return NextResponse.json({ error: "Error interno al procesar artículo" }, { status: 500 });
  }
}
