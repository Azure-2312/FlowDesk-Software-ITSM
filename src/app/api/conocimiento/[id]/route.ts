import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const id = params.id;
  const idArticulo = parseInt(id, 10);
  if (isNaN(idArticulo)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    // Incrementar conteo de visitas
    await query("UPDATE articulo_conocimiento SET visitas = visitas + 1 WHERE id_articulo = $1", [idArticulo]);

    const sql = `
      SELECT 
        a.id_articulo,
        a.codigo_articulo,
        a.titulo,
        a.contenido_markdown,
        a.id_categoria,
        cat.nombre AS categoria_nombre,
        a.id_problema_origen,
        a.estado_editorial,
        a.id_autor,
        CONCAT(u.nombres, ' ', u.apellido_paterno) AS autor_nombre,
        a.visitas,
        a.utilidad_positiva,
        a.utilidad_negativa,
        a.fecha_publicacion,
        a.fecha_creacion
      FROM articulo_conocimiento a
      LEFT JOIN categoria_ticket cat ON a.id_categoria = cat.id_categoria
      LEFT JOIN usuario u ON a.id_autor = u.id_usuario
      WHERE a.id_articulo = $1 AND a.estado_registro = true
    `;

    const row = await queryRow(sql, [idArticulo]);
    if (!row) {
      return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error("Error al obtener artículo:", error);
    return NextResponse.json({ error: "Error interno al obtener artículo" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const id = params.id;
  const idArticulo = parseInt(id, 10);
  if (isNaN(idArticulo)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { voto_utilidad } = body; // 'POSITIVO' | 'NEGATIVO'

    if (voto_utilidad === "POSITIVO") {
      await query("UPDATE articulo_conocimiento SET utilidad_positiva = utilidad_positiva + 1 WHERE id_articulo = $1", [idArticulo]);
    } else if (voto_utilidad === "NEGATIVO") {
      await query("UPDATE articulo_conocimiento SET utilidad_negativa = utilidad_negativa + 1 WHERE id_articulo = $1", [idArticulo]);
    }

    return NextResponse.json({ mensaje: "Voto registrado exitosamente." });
  } catch (error) {
    console.error("Error al calificar artículo:", error);
    return NextResponse.json({ error: "Error interno al procesar calificación" }, { status: 500 });
  }
}
