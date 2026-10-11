import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { codigo, nombre, tipo, color = "#3b82f6", reloj_diagnostico = "corre", reloj_resolucion = "corre", cuenta_como_abierto = true, permite_edicion = "si", descripcion = "", orden = 1 } = body;

    if (!codigo || !nombre || !tipo) {
      return NextResponse.json({ error: "Código, nombre y tipo son obligatorios" }, { status: 400 });
    }

    if (tipo === "inicial") {
      const existeInicial = await queryRow("SELECT id_estado FROM problema_estado WHERE tipo = 'inicial' AND activo = true");
      if (existeInicial) {
        return NextResponse.json({ error: "Solo puede existir exactamente 1 estado de tipo Inicial" }, { status: 400 });
      }
    }

    const nuevo = await queryRow<any>(
      `INSERT INTO problema_estado (
        codigo, nombre, tipo, color, reloj_diagnostico, reloj_resolucion, cuenta_como_abierto, permite_edicion, descripcion, orden, es_sistema, activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, true)
      RETURNING *`,
      [codigo.trim().toLowerCase(), nombre.trim(), tipo, color, reloj_diagnostico, reloj_resolucion, cuenta_como_abierto, permite_edicion, descripcion, orden]
    );

    return NextResponse.json({ ok: true, estado: nuevo });
  } catch (error: any) {
    console.error("Error al crear estado:", error);
    return NextResponse.json({ error: error.message || "Error al crear estado" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { id_estado, nombre, tipo, color, reloj_diagnostico, reloj_resolucion, cuenta_como_abierto, permite_edicion, descripcion, orden, activo } = body;

    if (!id_estado) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const actual = await queryRow<any>("SELECT * FROM problema_estado WHERE id_estado = $1", [id_estado]);
    if (!actual) return NextResponse.json({ error: "Estado no encontrado" }, { status: 404 });

    if (actual.es_sistema && tipo && tipo !== actual.tipo) {
      return NextResponse.json({ error: "Los estados protegidos del sistema no pueden cambiar de tipo" }, { status: 400 });
    }

    if (tipo === "inicial" && actual.tipo !== "inicial") {
      const otroInicial = await queryRow("SELECT id_estado FROM problema_estado WHERE tipo = 'inicial' AND id_estado != $1 AND activo = true", [id_estado]);
      if (otroInicial) {
        return NextResponse.json({ error: "Solo puede existir exactamente 1 estado de tipo Inicial" }, { status: 400 });
      }
    }

    const actualizado = await queryRow<any>(
      `UPDATE problema_estado
       SET nombre = COALESCE($1, nombre),
           tipo = COALESCE($2, tipo),
           color = COALESCE($3, color),
           reloj_diagnostico = COALESCE($4, reloj_diagnostico),
           reloj_resolucion = COALESCE($5, reloj_resolucion),
           cuenta_como_abierto = COALESCE($6, cuenta_como_abierto),
           permite_edicion = COALESCE($7, permite_edicion),
           descripcion = COALESCE($8, descripcion),
           orden = COALESCE($9, orden),
           activo = COALESCE($10, activo)
       WHERE id_estado = $11
       RETURNING *`,
      [
        nombre ? nombre.trim() : null,
        tipo || null,
        color || null,
        reloj_diagnostico || null,
        reloj_resolucion || null,
        cuenta_como_abierto !== undefined ? cuenta_como_abierto : null,
        permite_edicion || null,
        descripcion !== undefined ? descripcion : null,
        orden !== undefined ? orden : null,
        activo !== undefined ? activo : null,
        id_estado,
      ]
    );

    return NextResponse.json({ ok: true, estado: actualizado });
  } catch (error: any) {
    console.error("Error al actualizar estado:", error);
    return NextResponse.json({ error: error.message || "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    const actual = await queryRow<any>("SELECT * FROM problema_estado WHERE id_estado = $1", [id]);
    if (!actual) return NextResponse.json({ error: "Estado no encontrado" }, { status: 404 });

    if (actual.es_sistema) {
      return NextResponse.json({ error: "Los estados requeridos por el sistema no pueden ser eliminados" }, { status: 400 });
    }

    const uso = await queryRow<{ total: number }>(
      "SELECT COUNT(*)::int as total FROM problema WHERE estado_actual = $1",
      [actual.codigo]
    );
    if ((uso?.total || 0) > 0) {
      return NextResponse.json(
        { error: `El estado '${actual.nombre}' tiene ${uso?.total} tickets asociados. Solo puede desactivarlo.` },
        { status: 400 }
      );
    }

    await query("DELETE FROM problema_transicion WHERE estado_origen_id = $1 OR estado_destino_id = $1", [id]);
    await query("DELETE FROM problema_estado WHERE id_estado = $1", [id]);

    return NextResponse.json({ ok: true, mensaje: "Estado eliminado exitosamente" });
  } catch (error: any) {
    console.error("Error al eliminar estado:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar" }, { status: 500 });
  }
}
