import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const ausencias = await query<any>(`
      SELECT a.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as tecnico_nombre
      FROM tecnico_ausencias a
      JOIN usuario u ON u.id_usuario = a.id_usuario_tecnico
      ORDER BY a.fecha_desde DESC
    `);
    return NextResponse.json({ ok: true, ausencias });
  } catch (error: any) {
    console.error("Error al obtener ausencias:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { id_usuario_tecnico, fecha_desde, fecha_hasta, motivo } = body;

    if (!id_usuario_tecnico || !fecha_desde || !fecha_hasta || !motivo) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const nueva = await queryRow<any>(
      `INSERT INTO tecnico_ausencias (
        id_usuario_tecnico, fecha_desde, fecha_hasta, motivo, registrado_por, fecha_registro
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [id_usuario_tecnico, fecha_desde, fecha_hasta, motivo.trim(), sesion.id_usuario]
    );

    return NextResponse.json({ ok: true, ausencia: nueva });
  } catch (error: any) {
    console.error("Error al registrar ausencia:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { id_ausencia, id_usuario_tecnico, fecha_desde, fecha_hasta, motivo } = body;

    if (!id_ausencia || !id_usuario_tecnico || !fecha_desde || !fecha_hasta || !motivo) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const actualizada = await queryRow<any>(
      `UPDATE tecnico_ausencias
       SET id_usuario_tecnico = $1, fecha_desde = $2, fecha_hasta = $3, motivo = $4
       WHERE id_ausencia = $5
       RETURNING *`,
      [id_usuario_tecnico, fecha_desde, fecha_hasta, motivo.trim(), id_ausencia]
    );

    return NextResponse.json({ ok: true, ausencia: actualizada });
  } catch (error: any) {
    console.error("Error al actualizar ausencia:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    await query("DELETE FROM tecnico_ausencias WHERE id_ausencia = $1", [id]);
    return NextResponse.json({ ok: true, mensaje: "Ausencia eliminada" });
  } catch (error: any) {
    console.error("Error al eliminar ausencia:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

