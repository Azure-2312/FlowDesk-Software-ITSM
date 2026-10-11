import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const recordatorios = await query<any>(
      `SELECT * FROM tecnico_recordatorios 
       WHERE id_usuario = $1 
       ORDER BY fecha_hora ASC`,
      [sesion.id_usuario]
    );

    return NextResponse.json({ recordatorios });
  } catch (error) {
    console.error("Error al obtener recordatorios:", error);
    return NextResponse.json({ error: "Error al cargar recordatorios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { titulo, descripcion, fecha_hora, objeto_tipo, objeto_id } = await req.json();

    if (!titulo || !titulo.trim()) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
    }

    const nuevo = await queryRow<any>(
      `INSERT INTO tecnico_recordatorios (id_usuario, titulo, descripcion, fecha_hora, objeto_tipo, objeto_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        sesion.id_usuario,
        titulo.trim(),
        descripcion ? descripcion.trim() : null,
        fecha_hora || new Date().toISOString(),
        objeto_tipo || null,
        objeto_id ? String(objeto_id) : null,
      ]
    );

    return NextResponse.json({ recordatorio: nuevo });
  } catch (error) {
    console.error("Error al crear recordatorio:", error);
    return NextResponse.json({ error: "Error al guardar recordatorio" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { id_recordatorio, completado } = await req.json();
    const actualizado = await queryRow<any>(
      `UPDATE tecnico_recordatorios 
       SET completado = $1 
       WHERE id_recordatorio = $2 AND id_usuario = $3
       RETURNING *`,
      [completado, id_recordatorio, sesion.id_usuario]
    );

    return NextResponse.json({ recordatorio: actualizado });
  } catch (error) {
    console.error("Error al actualizar recordatorio:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
