import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { respuestaError } from "@/shared/lib/errores";
import {
  registrarBusquedaLog,
  marcarDeflexionExitosa,
} from "@/modules/conocimiento/services/conocimientoService";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  try {
    const body = await req.json();
    const { accion, termino, resultados, id_log, id_articulo, origen } = body;

    const contexto = {
      idUsuario: sesion?.id_usuario || 0,
      nombres: sesion?.nombres || "Usuario Portal",
      idPerfil: sesion?.perfilActivo?.id_perfil || 0,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    };

    if (accion === "MARCAR_DEFLEXION") {
      if (!id_log || !id_articulo) {
        return NextResponse.json({ error: "id_log e id_articulo son obligatorios." }, { status: 400 });
      }
      await marcarDeflexionExitosa(Number(id_log), Number(id_articulo), contexto);
      return NextResponse.json({ mensaje: "Desvío de ticket (deflection) registrado exitosamente." });
    }

    if (!termino || !termino.trim()) {
      return NextResponse.json({ error: "Término de búsqueda es obligatorio." }, { status: 400 });
    }

    const log = await registrarBusquedaLog(
      termino.trim(),
      Number(resultados) || 0,
      id_articulo ? Number(id_articulo) : null,
      false,
      contexto,
      origen || "PORTAL"
    );

    return NextResponse.json({ log });
  } catch (error) {
    const { error: mensaje, status } = respuestaError(error, "Error al registrar telemetría de búsqueda");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
