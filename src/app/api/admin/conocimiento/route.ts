import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const t = req.cookies.get(COOKIE_SESION)?.value;
  const s = t ? verificarTokenSesion(t) : null;
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (![1, 4].includes(s.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const articulos = await query(`
      SELECT 
        a.id_articulo,
        a.codigo_articulo,
        a.titulo,
        a.contenido_markdown,
        a.estado_editorial,
        a.version,
        a.visitas,
        a.utilidad_positiva,
        a.utilidad_negativa,
        a.fecha_creacion,
        a.fecha_publicacion,
        a.audiencia_perfiles,
        a.id_categoria,
        cat.nombre AS categoria,
        CONCAT(ua.nombres, ' ', ua.apellido_paterno) AS autor
      FROM articulo_conocimiento a
      LEFT JOIN categoria_ticket cat ON cat.id_categoria = a.id_categoria
      LEFT JOIN usuario ua ON ua.id_usuario = a.id_autor
      WHERE a.estado_registro = true
      ORDER BY 
        CASE a.estado_editorial
          WHEN 'EN_REVISION' THEN 0
          WHEN 'BORRADOR' THEN 1
          WHEN 'PUBLICADO' THEN 2
          ELSE 3
        END,
        a.fecha_creacion DESC
    `);

    return NextResponse.json({ articulos });
  } catch (error) {
    console.error("Error al obtener artículos:", error);
    return NextResponse.json({ error: "Error al consultar artículos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const t = req.cookies.get(COOKIE_SESION)?.value;
  const s = t ? verificarTokenSesion(t) : null;
  if (!s) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (![1, 2, 4, 8].includes(s.perfilActivo?.id_perfil || 0)) {
    return NextResponse.json({ error: "No autorizado para redactar artículos de conocimiento." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { titulo, contenido_markdown, id_categoria, audiencia_perfiles, estado_editorial } = body;

    if (!titulo || !titulo.trim()) {
      return NextResponse.json({ error: "El título del artículo es obligatorio." }, { status: 400 });
    }
    if (!contenido_markdown || !contenido_markdown.trim()) {
      return NextResponse.json({ error: "El contenido explicativo es obligatorio." }, { status: 400 });
    }

    const correlativo = await queryRow<{ siguiente: number }>(
      "SELECT COALESCE(MAX(id_articulo), 0) + 1 AS siguiente FROM articulo_conocimiento"
    );
    const codigoArticulo = `KCS-${String(correlativo?.siguiente || 1).padStart(4, "0")}`;

    const estadoFinal = estado_editorial && ["BORRADOR", "EN_REVISION", "PUBLICADO"].includes(estado_editorial)
      ? estado_editorial
      : "BORRADOR";

    const audiencia = Array.isArray(audiencia_perfiles) && audiencia_perfiles.length > 0
      ? audiencia_perfiles.map(Number)
      : [1, 2, 3, 4, 5, 6, 7, 8, 9];

    const nuevo = await queryRow(
      `INSERT INTO articulo_conocimiento (
        codigo_articulo,
        titulo,
        contenido_markdown,
        id_categoria,
        id_autor,
        id_revisor,
        estado_editorial,
        version,
        audiencia_perfiles,
        estado_registro,
        fecha_creacion,
        fecha_publicacion,
        usuario_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8, true, now(), $9, $5)
      RETURNING *`,
      [
        codigoArticulo,
        titulo.trim(),
        contenido_markdown.trim(),
        id_categoria ? Number(id_categoria) : 1,
        s.id_usuario,
        estadoFinal === "PUBLICADO" ? s.id_usuario : null,
        estadoFinal,
        audiencia,
        estadoFinal === "PUBLICADO" ? new Date() : null,
      ]
    );

    // Registrar en historial editorial
    if (nuevo) {
      await query(
        `INSERT INTO articulo_conocimiento_historial (
          id_articulo, estado_anterior, estado_nuevo, comentario, id_usuario, fecha
        ) VALUES ($1, NULL, $2, $3, $4, now())`,
        [nuevo.id_articulo, estadoFinal, "Creación inicial del artículo", s.id_usuario]
      );

      await query(
        `INSERT INTO log_auditoria_sistema (
          id_usuario, modulo, accion, descripcion, detalles, direccion_ip
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          s.id_usuario,
          "CONOCIMIENTO",
          "CREAR_ARTICULO_CONOCIMIENTO",
          `El usuario ${s.nombres} redactó el artículo [${codigoArticulo}] ${titulo.trim()} en estado ${estadoFinal}.`,
          JSON.stringify({ id_articulo: nuevo.id_articulo, codigo_articulo: codigoArticulo, estado_editorial: estadoFinal }),
          req.headers.get("x-forwarded-for") || "127.0.0.1",
        ]
      );
    }

    return NextResponse.json({ articulo: nuevo }, { status: 201 });
  } catch (error) {
    console.error("Error al redactar artículo:", error);
    return NextResponse.json({ error: "Error al registrar artículo" }, { status: 500 });
  }
}
