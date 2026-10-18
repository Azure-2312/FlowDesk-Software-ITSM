import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarInexactitudes, crearInexactitud, resolverInexactitud } from "@/modules/cmdb/services/cmdbGestionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CMDB_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarInexactitudes());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar inexactitudes:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las inexactitudes");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CMDB_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearInexactitud(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al reportar inexactitud:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al reportar la inexactitud");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CMDB_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await resolverInexactitud(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al resolver inexactitud:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al actualizar la inexactitud");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
