import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { COOKIE_SESION } from "@/shared/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const campos = await query<any>(
      `SELECT c.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as creador_nombre
       FROM campo_personalizado c
       LEFT JOIN usuario u ON u.id_usuario = c.usuario_creacion
       WHERE c.entidad = 'cambio'
       ORDER BY c.orden, c.id_campo`
    );

    const limiteRow = await queryRow<{ valor: string }>(
      "SELECT valor FROM configuracion_sistema WHERE clave = 'limite_campos_personalizados_cambio'"
    );
    const limite = limiteRow ? parseInt(limiteRow.valor, 10) : 30;

    return NextResponse.json({
      ok: true,
      campos,
      total: campos.length,
      limite,
    });
  } catch (error: any) {
    console.error("Error al obtener campos personalizados de cambio:", error);
    return NextResponse.json({ error: "Error al cargar campos personalizados" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_FORMULARIO_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado para crear campos personalizados" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      codigo,
      etiqueta,
      descripcion,
      tipo,
      propiedades = {},
      formularios_visibles = ["solicitud", "edicion"],
      pestana_vista = "solicitud",
      seccion = "Sección A — Identificación",
      obligatorio = "no",
      reglas_condicionales = [],
      orden = 1,
    } = body;

    if (!codigo || !etiqueta || !tipo) {
      return NextResponse.json(
        { error: "Código, etiqueta y tipo de dato son obligatorios" },
        { status: 400 }
      );
    }

    // Normalizar código con prefijo cf_
    let codigoNormalizado = codigo.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (!codigoNormalizado.startsWith("cf_")) {
      codigoNormalizado = `cf_${codigoNormalizado}`;
    }

    // Validar unicidad
    const existe = await queryRow<{ id_campo: number }>(
      "SELECT id_campo FROM campo_personalizado WHERE entidad = 'cambio' AND codigo = $1",
      [codigoNormalizado]
    );

    if (existe) {
      return NextResponse.json(
        { error: `Ya existe un campo personalizado con el código '${codigoNormalizado}'` },
        { status: 400 }
      );
    }

    const nuevoCampo = await queryRow<any>(
      `INSERT INTO campo_personalizado (
        entidad, codigo, etiqueta, descripcion, tipo, activo, propiedades,
        formularios_visibles, pestana_vista, seccion, obligatorio,
        reglas_condicionales, orden, veces_usado, usuario_creacion
      ) VALUES (
        'cambio', $1, $2, $3, $4, true, $5, $6, $7, $8, $9, $10, $11, 0, $12
      ) RETURNING *`,
      [
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

    return NextResponse.json({
      ok: true,
      mensaje: "Campo personalizado creado exitosamente",
      campo: nuevoCampo,
    });
  } catch (error: any) {
    console.error("Error al crear campo personalizado de cambio:", error);
    return NextResponse.json({ error: "Error al crear campo personalizado" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_FORMULARIO_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await req.json();
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
      return NextResponse.json({ error: "id_campo es obligatorio" }, { status: 400 });
    }

    const campoActualizado = await queryRow<any>(
      `UPDATE campo_personalizado SET
        etiqueta = COALESCE($1, etiqueta),
        descripcion = COALESCE($2, descripcion),
        activo = COALESCE($3, activo),
        propiedades = COALESCE($4, propiedades),
        formularios_visibles = COALESCE($5, formularios_visibles),
        pestana_vista = COALESCE($6, pestana_vista),
        seccion = COALESCE($7, seccion),
        obligatorio = COALESCE($8, obligatorio),
        reglas_condicionales = COALESCE($9, reglas_condicionales),
        orden = COALESCE($10, orden)
       WHERE id_campo = $11 AND entidad = 'cambio'
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

    return NextResponse.json({
      ok: true,
      mensaje: "Campo personalizado actualizado",
      campo: campoActualizado,
    });
  } catch (error: any) {
    console.error("Error al actualizar campo personalizado:", error);
    return NextResponse.json({ error: "Error al actualizar campo" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.CAMBIOS_FORMULARIO_CONFIGURAR)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id_campo = searchParams.get("id_campo");

    if (!id_campo) {
      return NextResponse.json({ error: "id_campo es requerido" }, { status: 400 });
    }

    const campo = await queryRow<{ id_campo: number; veces_usado: number }>(
      "SELECT id_campo, veces_usado FROM campo_personalizado WHERE id_campo = $1 AND entidad = 'cambio'",
      [id_campo]
    );

    if (!campo) {
      return NextResponse.json({ error: "Campo no encontrado" }, { status: 404 });
    }

    if (campo.veces_usado > 0) {
      // Si está en uso, solo se desactiva
      await query(
        "UPDATE campo_personalizado SET activo = false WHERE id_campo = $1",
        [id_campo]
      );
      return NextResponse.json({
        ok: true,
        mensaje: "El campo tiene datos en RFCs existentes; se ha desactivado en lugar de eliminarse para proteger la integridad.",
        desactivado: true,
      });
    }

    await query("DELETE FROM campo_personalizado WHERE id_campo = $1", [id_campo]);

    return NextResponse.json({
      ok: true,
      mensaje: "Campo personalizado eliminado exitosamente.",
      eliminado: true,
    });
  } catch (error: any) {
    console.error("Error al eliminar campo personalizado:", error);
    return NextResponse.json({ error: "Error al eliminar el campo" }, { status: 500 });
  }
}
