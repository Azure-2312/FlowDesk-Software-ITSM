import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ServicioWorkflowPaso } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idServicio = parseInt(params.id, 10);
  if (isNaN(idServicio)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const pasos = await query<ServicioWorkflowPaso>(
      `SELECT 
        id_paso,
        id_servicio,
        orden,
        codigo_paso,
        nombre_paso,
        rol_ejecutor,
        es_compuerta_aprobacion,
        pausa_sla,
        estado_registro
      FROM servicio_workflow_paso
      WHERE id_servicio = $1 AND estado_registro = true
      ORDER BY orden ASC`,
      [idServicio]
    );

    return NextResponse.json({ pasos });
  } catch (err) {
    console.error("Error al obtener pasos del workflow:", err);
    return NextResponse.json({ error: "Error al consultar pasos del workflow" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Solo Administrador (1)
  if (sesion.perfilActivo.id_perfil !== 1) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para modificar el workflow" },
      { status: 403 }
    );
  }

  const idServicio = parseInt(params.id, 10);
  if (isNaN(idServicio)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { pasos } = body;

    if (!Array.isArray(pasos) || pasos.length === 0) {
      return NextResponse.json(
        { error: "El workflow debe contener al menos un paso operativo." },
        { status: 400 }
      );
    }

    // Validar cada paso
    for (let i = 0; i < pasos.length; i++) {
      const p = pasos[i];
      if (!p.nombre_paso || !p.rol_ejecutor) {
        return NextResponse.json(
          { error: `El paso #${i + 1} debe tener nombre y rol ejecutor definidos.` },
          { status: 400 }
        );
      }
    }

    // Reemplazo transaccional de pasos del workflow
    await query("DELETE FROM servicio_workflow_paso WHERE id_servicio = $1", [idServicio]);

    for (let i = 0; i < pasos.length; i++) {
      const p = pasos[i];
      const orden = i + 1;
      const codigoPaso = p.codigo_paso?.trim() || `STEP-0${orden}`;
      const nombrePaso = p.nombre_paso.trim();
      const rolEjecutor = p.rol_ejecutor.trim();
      const esCompuerta = Boolean(p.es_compuerta_aprobacion);
      const pausaSla = Boolean(p.pausa_sla);

      await query(
        `INSERT INTO servicio_workflow_paso (
          id_servicio,
          orden,
          codigo_paso,
          nombre_paso,
          rol_ejecutor,
          es_compuerta_aprobacion,
          pausa_sla,
          estado_registro
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
        [idServicio, orden, codigoPaso, nombrePaso, rolEjecutor, esCompuerta, pausaSla]
      );
    }

    const pasosGuardados = await query<ServicioWorkflowPaso>(
      `SELECT * FROM servicio_workflow_paso WHERE id_servicio = $1 AND estado_registro = true ORDER BY orden ASC`,
      [idServicio]
    );

    return NextResponse.json({
      mensaje: "Workflow actualizado correctamente",
      pasos: pasosGuardados,
    });
  } catch (err) {
    console.error("Error al actualizar pasos del workflow:", err);
    return NextResponse.json({ error: "No se pudo actualizar el workflow" }, { status: 500 });
  }
}
