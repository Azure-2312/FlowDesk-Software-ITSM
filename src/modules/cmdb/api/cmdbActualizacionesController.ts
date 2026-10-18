import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarActualizaciones, generarDesdeCambios, resolverActualizacion } from "@/modules/cmdb/services/cmdbGestionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CMDB_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarActualizaciones());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar actualizaciones CMDB:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las actualizaciones de CMDB");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CMDB_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (body.accion === "generar") {
      return NextResponse.json(await generarDesdeCambios(sesion.id_usuario));
    }
    if (body.accion === "resolver") {
      return NextResponse.json(await resolverActualizacion(sesion.id_usuario, body));
    }
    throw new ErrorDominio("Acción no reconocida. Usa generar o resolver.");
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en actualizaciones CMDB:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al procesar la actualización de CMDB");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
