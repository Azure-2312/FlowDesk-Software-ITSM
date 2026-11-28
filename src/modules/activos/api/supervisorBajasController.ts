import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { decidirBaja, listarBajasAprobaciones } from "@/modules/activos/services/supervisionBajasService";

export const dynamic = "force-dynamic";

// Bandeja única de bajas: cada perfil ve y decide solo lo que le corresponde
// (la regla vive en supervisionBajasService).

export async function GET(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
  if (error) return error;

  try {
    const vista = req.nextUrl.searchParams.get("vista") || "pendientes";
    return NextResponse.json(
      await listarBajasAprobaciones({ id_usuario: sesion.id_usuario, id_perfil: sesion.perfilActivo?.id_perfil }, vista)
    );
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar bajas:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar bajas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(
      await decidirBaja(
        { id_usuario: sesion.id_usuario, id_perfil: sesion.perfilActivo?.id_perfil },
        Number(body.id_solicitud),
        body.decision,
        body.comentario
      )
    );
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al resolver baja:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al resolver la solicitud de baja");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
