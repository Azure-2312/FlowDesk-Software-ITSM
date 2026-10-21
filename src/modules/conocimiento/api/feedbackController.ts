import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { respuestaError } from "@/shared/lib/errores";
import { registrarFeedbackArticulo } from "@/modules/conocimiento/services/conocimientoService";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  try {
    const body = await req.json();
    const { id_articulo, es_positivo, motivo_negativo, comentario } = body;

    if (!id_articulo || typeof es_positivo !== "boolean") {
      return NextResponse.json({ error: "id_articulo y es_positivo son obligatorios." }, { status: 400 });
    }

    const resultado = await registrarFeedbackArticulo(
      Number(id_articulo),
      Boolean(es_positivo),
      motivo_negativo || null,
      comentario || null,
      {
        idUsuario: sesion?.id_usuario || 0,
        nombres: sesion?.nombres || "Usuario Anónimo",
        idPerfil: sesion?.perfilActivo?.id_perfil || 0,
        ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
      }
    );

    return NextResponse.json(resultado);
  } catch (error) {
    const { error: mensaje, status } = respuestaError(error, "Error al registrar feedback del artículo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
