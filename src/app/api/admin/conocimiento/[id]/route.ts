import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID de artículo inválido" }, { status: 400 });
  }

  try {
    const articulo = await queryRow(
      `SELECT 
        a.*,
        cat.nombre AS categoria_nombre,
        CONCAT(ua.nombres, ' ', ua.apellido_paterno) AS autor_nombre,
        CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS revisor_nombre
       FROM articulo_conocimiento a
       LEFT JOIN categoria_ticket cat ON cat.id_categoria = a.id_categoria
       LEFT JOIN usuario ua ON ua.id_usuario = a.id_autor
       LEFT JOIN usuario ur ON ur.id_usuario = a.id_revisor
       WHERE a.id_articulo = $1 AND a.estado_registro = true`,
      [id]
    );

    if (!articulo) {
      return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 });
    }

    const historial = await query(
      `SELECT 
        h.id_historial,
        h.estado_anterior,
        h.estado_nuevo,
        h.comentario,
        CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre,
        h.fecha
       FROM articulo_conocimiento_historial h
       LEFT JOIN usuario u ON h.id_usuario = u.id_usuario
       WHERE h.id_articulo = $1
       ORDER BY h.fecha DESC`,
      [id]
    );

    return NextResponse.json({ articulo, historial });
  } catch (error) {
    console.error("Error al obtener detalle de artículo:", error);
    return NextResponse.json({ error: "Error al consultar artículo" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (![1, 4].includes(sesion.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "Solo Administración o Supervisor pueden revisar artículos." }, { status: 403 });
  }

  const id = Number(params.id);
  if (!id || isNaN(id)) {
    return NextResponse.json({ error: "ID de artículo inválido." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { accion, motivo_retiro, comentario, audiencia_perfiles } = body;

    const estados: Record<string, string> = {
      PUBLICAR: "PUBLICADO",
      ARCHIVAR: "ARCHIVADO",
      DEVOLVER: "EN_REVISION",
      RETIRAR: "RETIRADO"
    };

    if (!estados[accion]) {
      return NextResponse.json({ error: "Acción editorial inválida." }, { status: 400 });
    }

    const nuevoEstado = estados[accion];

    const actual = await queryRow<{ id_articulo: number; estado_editorial: string }>(
      "SELECT id_articulo, estado_editorial FROM articulo_conocimiento WHERE id_articulo = $1 AND estado_registro = true",
      [id]
    );

    if (!actual) {
      return NextResponse.json({ error: "Artículo no encontrado." }, { status: 404 });
    }

    if (nuevoEstado === "RETIRADO" && (!motivo_retiro || String(motivo_retiro).trim().length < 5)) {
      return NextResponse.json({ error: "Debe indicar un motivo de retiro de al menos 5 caracteres." }, { status: 400 });
    }

    const actualizado = await queryRow(
      `UPDATE articulo_conocimiento SET
        estado_editorial = $1,
        id_revisor = $2,
        fecha_publicacion = CASE WHEN $1 = 'PUBLICADO' THEN now() ELSE fecha_publicacion END,
        fecha_revision = CASE WHEN $1 IN ('PUBLICADO', 'RETIRADO') THEN CURRENT_DATE ELSE fecha_revision END,
        motivo_retiro = CASE WHEN $1 = 'RETIRADO' THEN $3 ELSE motivo_retiro END,
        audiencia_perfiles = COALESCE($4, audiencia_perfiles),
        version = version + 1
       WHERE id_articulo = $5 AND estado_registro = true
       RETURNING *`,
      [
        nuevoEstado,
        sesion.id_usuario,
        motivo_retiro?.trim() || null,
        Array.isArray(audiencia_perfiles) && audiencia_perfiles.length > 0 ? audiencia_perfiles.map(Number) : null,
        id
      ]
    );

    await query(
      `INSERT INTO articulo_conocimiento_historial (id_articulo, estado_anterior, estado_nuevo, comentario, id_usuario, fecha)
       VALUES ($1, $2, $3, $4, $5, now())`,
      [
        id,
        actual.estado_editorial,
        nuevoEstado,
        comentario?.trim() || (nuevoEstado === "RETIRADO" ? `Retiro: ${motivo_retiro}` : `Acción editorial: ${accion}`),
        sesion.id_usuario
      ]
    );

    return NextResponse.json({
      mensaje: `Artículo actualizado al estado ${nuevoEstado}.`,
      articulo: actualizado
    });
  } catch (error) {
    console.error("Error al actualizar estado editorial:", error);
    return NextResponse.json({ error: "Error al actualizar estado editorial" }, { status: 500 });
  }
}
