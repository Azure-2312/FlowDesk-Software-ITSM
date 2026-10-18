import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarProblemasMayores, resolverProblema } from "@/modules/perfiles/aprobador/services/montoService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarProblemasMayores());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar problemas mayores:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los problemas mayores");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_VER);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_problema) throw new ErrorDominio("Falta el identificador del problema.");
    return NextResponse.json(
      await resolverProblema(sesion.id_usuario, Number(body.id_problema), body.decision, body.riesgo_aceptado, body.comentario)
    );
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al resolver el cierre del problema:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la decisión");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
