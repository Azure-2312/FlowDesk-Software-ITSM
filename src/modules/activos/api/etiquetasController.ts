import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/activos/api/guardiaGestor";
import { query } from "@/shared/lib/db";

export const dynamic = "force-dynamic";

/** Etiquetas imprimibles de los activos seleccionados. */
export async function GET(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
  if (error) return error;

  try {
    const ids = (req.nextUrl.searchParams.get("ids") ?? "")
      .split(",")
      .map((x) => Number(x))
      .filter(Boolean);
    if (ids.length === 0) throw new ErrorDominio("Selecciona al menos un activo para generar etiquetas.");

    const activos = await query(
      `SELECT a.id_activo, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo, a.numero_serie,
              d.nombre AS departamento_nombre
       FROM activo a
       LEFT JOIN departamento_ti d ON d.id_departamento = a.id_departamento
       WHERE a.estado_registro = true AND a.id_activo = ANY($1::int[])
       ORDER BY a.codigo_patrimonial`,
      [ids]
    );
    return NextResponse.json({ activos });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al generar etiquetas:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al generar las etiquetas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
