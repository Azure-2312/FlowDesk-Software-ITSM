import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const buscar = searchParams.get("buscar");
  const idCategoria = searchParams.get("id_categoria");
  const vista = searchParams.get("vista");

  const condiciones: string[] = ["a.estado_registro = true"];
  const params: any[] = [];
  let paramIdx = 1;

  if (vista === "mis_articulos") {
    condiciones.push(`a.id_autor = $${paramIdx++}`);
    params.push(sesion.id_usuario);
  } else if (vista === "revisiones") {
    condiciones.push(`a.estado_editorial = 'EN_REVISION'`);
  } else {
    condiciones.push(`a.estado_editorial = 'PUBLICADO'`);
    condiciones.push(`($${paramIdx++} = 1 OR $${paramIdx - 1} = ANY(a.audiencia_perfiles))`);
    params.push(sesion.perfilActivo?.id_perfil || 0);
  }

  if (idCategoria) {
    condiciones.push(`a.id_categoria = $${paramIdx++}`);
    params.push(parseInt(idCategoria, 10));
  }

  if (buscar) {
    condiciones.push(`(a.titulo ILIKE $${paramIdx} OR a.contenido_markdown ILIKE $${paramIdx})`);
    params.push(`%${buscar}%`);
    paramIdx++;
  }

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
    WHERE ${condiciones.join(" AND ")}
    ORDER BY a.utilidad_positiva DESC, a.visitas DESC
  `;

  try {
    const rows = await query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error al obtener artículos de conocimiento:", error);
    return NextResponse.json({ error: "Error al consultar la base de conocimiento" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CONOCIMIENTO_VER)) {
    return NextResponse.json({ error: "Este perfil no puede publicar artículos de conocimiento." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { titulo, contenido_markdown, id_categoria, id_problema_origen, audiencia_perfiles } = body;

    if (!titulo || !contenido_markdown) {
      return NextResponse.json({ error: "Título y contenido son obligatorios." }, { status: 400 });
    }

    const countRow = await queryRow<{ c: string }>("SELECT COUNT(*) as c FROM articulo_conocimiento");
    const correlativo = String((parseInt(countRow?.c || "0", 10) + 1)).padStart(3, "0");
    const codigo_articulo = `ART-${new Date().getFullYear()}-${correlativo}`;

    const audiencia = Array.isArray(audiencia_perfiles) && audiencia_perfiles.length > 0
      ? audiencia_perfiles.map(Number)
      : [2, 3, 4, 5, 6, 7, 8, 9];

    const estadoInicial = sesion.perfilActivo?.id_perfil === 2 ? "EN_REVISION" : "PUBLICADO";

    const insertSql = `
      INSERT INTO articulo_conocimiento (
        codigo_articulo,
        titulo,
        contenido_markdown,
        id_categoria,
        id_problema_origen,
        estado_editorial,
        audiencia_perfiles,
        id_autor,
        id_revisor,
        usuario_creacion,
        fecha_publicacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id_articulo, codigo_articulo, estado_editorial
    `;

    const row = await queryRow<{ id_articulo: number; codigo_articulo: string; estado_editorial: string }>(insertSql, [
      codigo_articulo,
      titulo,
      contenido_markdown,
      id_categoria || null,
      id_problema_origen || null,
      estadoInicial,
      audiencia,
      sesion.id_usuario,
      sesion.perfilActivo?.id_perfil === 2 ? null : sesion.id_usuario,
      sesion.id_usuario,
      sesion.perfilActivo?.id_perfil === 2 ? null : new Date()
    ]);

    if (row?.id_articulo) {
      await query(
        `INSERT INTO articulo_conocimiento_historial (id_articulo, estado_anterior, estado_nuevo, comentario, id_usuario, fecha)
         VALUES ($1, null, $2, $3, $4, now())`,
        [
          row.id_articulo,
          estadoInicial,
          sesion.perfilActivo?.id_perfil === 2 ? "Envío inicial a revisión editorial" : "Publicación directa",
          sesion.id_usuario
        ]
      );
    }

    return NextResponse.json({
      mensaje: sesion.perfilActivo?.id_perfil === 2 ? "Artículo enviado a revisión editorial." : "Artículo publicado exitosamente.",
      articulo: row
    }, { status: 201 });
  } catch (error) {
    console.error("Error al publicar artículo:", error);
    return NextResponse.json({ error: "Error interno al publicar artículo" }, { status: 500 });
  }
}
