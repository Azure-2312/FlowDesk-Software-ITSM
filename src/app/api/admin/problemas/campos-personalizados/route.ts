import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const entidad = searchParams.get("entidad") || "problema";

    const campos = await query<any>(
      `SELECT c.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as creador_nombre
       FROM campo_personalizado c
       LEFT JOIN usuario u ON u.id_usuario = c.usuario_creacion
       WHERE c.entidad = $1
       ORDER BY c.orden, c.id_campo`,
      [entidad]
    );

    // Obtener límite de campos configurado en el sistema
    const limiteRow = await queryRow<{ valor: string }>(
      "SELECT valor FROM configuracion_sistema WHERE clave = 'limite_campos_personalizados_problema'"
    );
    const limite = limiteRow ? parseInt(limiteRow.valor, 10) : 30;

    return NextResponse.json({
      ok: true,
      campos,
      total: campos.length,
      limite,
    });
  } catch (error: any) {
    console.error("Error al obtener campos personalizados:", error);
    return NextResponse.json({ error: "Error al cargar campos personalizados" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      entidad = "problema",
      codigo,
      etiqueta,
      descripcion,
      tipo,
      propiedades = {},
      formularios_visibles = ["registro", "edicion"],
      pestana_vista = "detalle",
      seccion = "A. Identificación",
      obligatorio = "no",
      reglas_condicionales = [],
      orden = 1,
    } = body;

    if (!codigo || !etiqueta || !tipo) {
      return NextResponse.json(
        { error: "Código, etiqueta y tipo de control son obligatorios" },
        { status: 400 }
      );
    }

    // Asegurar prefijo cf_
    let codigoNormalizado = codigo.trim().toLowerCase();
    if (!codigoNormalizado.startsWith("cf_")) {
      codigoNormalizado = `cf_${codigoNormalizado}`;
    }

    // Validar regex del código
    const regexCodigo = /^cf_[a-z0-9_]{2,37}$/;
    if (!regexCodigo.test(codigoNormalizado)) {
      return NextResponse.json(
        {
          error:
            "El código debe comenzar con 'cf_', usar letras minúsculas, números o guiones bajos, y tener entre 5 y 40 caracteres en total.",
        },
        { status: 400 }
      );
    }

    // Verificar límite
    const totalRow = await queryRow<{ total: number }>(
      "SELECT COUNT(*)::int as total FROM campo_personalizado WHERE entidad = $1",
      [entidad]
    );
    const limiteRow = await queryRow<{ valor: string }>(
      "SELECT valor FROM configuracion_sistema WHERE clave = 'limite_campos_personalizados_problema'"
    );
    const limite = limiteRow ? parseInt(limiteRow.valor, 10) : 30;

    if ((totalRow?.total || 0) >= limite) {
      return NextResponse.json(
        {
          error: `Se ha alcanzado el límite máximo de ${limite} campos personalizados para la entidad ${entidad}.`,
        },
        { status: 400 }
      );
    }

    // Verificar unicidad de código
    const existente = await queryRow<{ id_campo: number }>(
      "SELECT id_campo FROM campo_personalizado WHERE entidad = $1 AND codigo = $2",
      [entidad, codigoNormalizado]
    );
    if (existente) {
      return NextResponse.json(
        { error: `Ya existe un campo con el código ${codigoNormalizado} para ${entidad}` },
        { status: 400 }
      );
    }

    const campoCreado = await queryRow<any>(
      `INSERT INTO campo_personalizado (
        entidad, codigo, etiqueta, descripcion, tipo, activo,
        propiedades, formularios_visibles, pestana_vista, seccion,
        obligatorio, reglas_condicionales, orden, usuario_creacion,
        fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *`,
      [
        entidad,
        codigoNormalizado,
        etiqueta.trim(),
        descripcion || null,
        tipo,
        JSON.stringify(propiedades),
        JSON.stringify(formularios_visibles),
        pestana_vista,
        seccion,
        obligatorio,
        JSON.stringify(reglas_condicionales),
        orden,
        sesion.id_usuario,
      ]
    );

    return NextResponse.json({ ok: true, campo: campoCreado });
  } catch (error: any) {
    console.error("Error al crear campo personalizado:", error);
    return NextResponse.json({ error: "Error al registrar el campo personalizado" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Soporte para actualización por lote (guardar todos los campos personalizados)
    if (Array.isArray(body.campos)) {
      for (const c of body.campos) {
        if (!c.id_campo) continue;
        await query(
          `UPDATE campo_personalizado
           SET activo = COALESCE($1, activo),
               obligatorio = COALESCE($2, obligatorio),
               propiedades = COALESCE($3, propiedades),
               orden = COALESCE($4, orden),
               descripcion = COALESCE($5, descripcion)
           WHERE id_campo = $6`,
          [
            c.activo !== undefined ? c.activo : null,
            c.obligatorio || null,
            c.propiedades ? JSON.stringify(c.propiedades) : null,
            c.orden !== undefined ? c.orden : null,
            c.descripcion !== undefined ? c.descripcion : null,
            c.id_campo,
          ]
        );
      }
      return NextResponse.json({ ok: true, mensaje: "Campos actualizados correctamente" });
    }

    const {
      id_campo,
      etiqueta,
      descripcion,
      activo,
      propiedades,
      formularios_visibles,
      pestana_vista,
      seccion,
      obligatorio,
      reglas_condicionales,
      orden,
    } = body;

    if (!id_campo) {
      return NextResponse.json({ error: "ID de campo requerido" }, { status: 400 });
    }

    const campoActual = await queryRow<any>(
      "SELECT * FROM campo_personalizado WHERE id_campo = $1",
      [id_campo]
    );
    if (!campoActual) {
      return NextResponse.json({ error: "Campo no encontrado" }, { status: 404 });
    }

    const actualizado = await queryRow<any>(
      `UPDATE campo_personalizado
       SET etiqueta = COALESCE($1, etiqueta),
           descripcion = COALESCE($2, descripcion),
           activo = COALESCE($3, activo),
           propiedades = COALESCE($4, propiedades),
           formularios_visibles = COALESCE($5, formularios_visibles),
           pestana_vista = COALESCE($6, pestana_vista),
           seccion = COALESCE($7, seccion),
           obligatorio = COALESCE($8, obligatorio),
           reglas_condicionales = COALESCE($9, reglas_condicionales),
           orden = COALESCE($10, orden)
       WHERE id_campo = $11
       RETURNING *`,
      [
        etiqueta ? etiqueta.trim() : null,
        descripcion !== undefined ? descripcion : null,
        activo !== undefined ? activo : null,
        propiedades ? JSON.stringify(propiedades) : null,
        formularios_visibles ? JSON.stringify(formularios_visibles) : null,
        pestana_vista || null,
        seccion || null,
        obligatorio || null,
        reglas_condicionales ? JSON.stringify(reglas_condicionales) : null,
        orden !== undefined ? orden : null,
        id_campo,
      ]
    );

    return NextResponse.json({ ok: true, campo: actualizado });
  } catch (error: any) {
    console.error("Error al actualizar campo personalizado:", error);
    return NextResponse.json({ error: "Error al actualizar campo personalizado" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const campo = await queryRow<any>(
      "SELECT veces_usado, codigo, etiqueta FROM campo_personalizado WHERE id_campo = $1",
      [id]
    );

    if (!campo) {
      return NextResponse.json({ error: "Campo no encontrado" }, { status: 404 });
    }

    if (campo.veces_usado > 0) {
      return NextResponse.json(
        {
          error: `No es posible eliminar el campo '${campo.etiqueta}' (${campo.codigo}) porque está siendo utilizado en ${campo.veces_usado} tickets. Solo puede desactivarlo.`,
        },
        { status: 400 }
      );
    }

    await query("DELETE FROM campo_personalizado WHERE id_campo = $1", [id]);

    return NextResponse.json({ ok: true, mensaje: "Campo personalizado eliminado exitosamente" });
  } catch (error: any) {
    console.error("Error al eliminar campo personalizado:", error);
    return NextResponse.json({ error: "Error al eliminar campo" }, { status: 500 });
  }
}
