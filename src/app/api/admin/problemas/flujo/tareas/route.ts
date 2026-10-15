import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { tipo_entidad = "tarea", codigo, titulo, nombre, descripcion, tipo = "investigacion", id_departamento_destino, duracion_estimada_horas = 4, obligatoria = false, checklist = [], tareas = [] } = body;

    if (tipo_entidad === "paquete") {
      const codigoGenerado = codigo || `paq_${Date.now()}`;
      const nuevoPaquete = await queryRow<any>(
        `INSERT INTO problema_tarea_paquete (codigo, nombre, descripcion, tareas, activo, fecha_creacion)
         VALUES ($1, $2, $3, $4, true, NOW()) RETURNING *`,
        [codigoGenerado, nombre.trim(), descripcion || null, JSON.stringify(tareas)]
      );
      return NextResponse.json({ ok: true, paquete: nuevoPaquete });
    }

    const codigoGenerado = codigo || `tar_${Date.now()}`;
    const nuevaTarea = await queryRow<any>(
      `INSERT INTO problema_tarea_catalogo (
        codigo, titulo, descripcion, tipo, id_departamento_destino, duracion_estimada_horas, obligatoria, checklist, activa, fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW()) RETURNING *`,
      [
        codigoGenerado,
        (titulo || nombre).trim(),
        descripcion || null,
        tipo,
        id_departamento_destino || null,
        duracion_estimada_horas,
        obligatoria,
        JSON.stringify(checklist),
      ]
    );

    return NextResponse.json({ ok: true, tarea: nuevaTarea });
  } catch (error: any) {
    console.error("Error al registrar tarea o paquete:", error);
    return NextResponse.json({ error: error.message || "Error al registrar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get("tipo") || "tarea";
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    if (tipo === "paquete") {
      await query("DELETE FROM problema_tarea_paquete WHERE id_paquete = $1", [id]);
    } else {
      await query("DELETE FROM problema_tarea_catalogo WHERE id_tarea = $1", [id]);
    }

    return NextResponse.json({ ok: true, mensaje: "Eliminado exitosamente" });
  } catch (error: any) {
    console.error("Error al eliminar:", error);
    return NextResponse.json({ error: error.message || "Error al eliminar" }, { status: 500 });
  }
}
