import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ServicioCatalogo, ServicioWorkflowPaso } from "@/types";
import { validarTexto, validarNumeroPositivo, validarSlaTiempos } from "@/shared/lib/validaciones";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const idTipo = searchParams.get("id_tipo");
  const idCategoria = searchParams.get("id_categoria");
  const buscar = searchParams.get("buscar");
  const estado = searchParams.get("estado"); // "activos", "inactivos", "todos"
  const perfilSolicitado = Number(searchParams.get("perfil_preview"));
  const idPerfilDatos = sesion.perfilActivo?.id_perfil === 1 && [2,3,4,5,6,7,8,9].includes(perfilSolicitado) ? perfilSolicitado : sesion.perfilActivo?.id_perfil;

  const condiciones: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;
  if (estado === "inactivos") {
    condiciones.push("s.estado_registro = false");
  } else if (estado === "todos") {
    // Sin filtro de estado
  } else {
    // Por defecto: activos
    condiciones.push("s.estado_registro = true");
  }


  if (idTipo) {
    condiciones.push(`s.id_tipo_ticket = $${paramIdx++}`);
    params.push(parseInt(idTipo, 10));
  }

  if (idCategoria === "sin_asignar") {
    condiciones.push("s.id_categoria IS NULL");
  } else if (idCategoria) {
    condiciones.push(`s.id_categoria = $${paramIdx++}`);
    params.push(parseInt(idCategoria, 10));
  }

  if (buscar && buscar.trim().length > 0) {
    condiciones.push(
      `(s.nombre ILIKE $${paramIdx} OR s.codigo_servicio ILIKE $${paramIdx} OR s.descripcion_comercial ILIKE $${paramIdx})`
    );
    params.push(`%${buscar.trim()}%`);
    paramIdx++;
  }

  const sqlServicios = `
    SELECT 
      s.id_servicio,
      s.codigo_servicio,
      s.id_tipo_ticket,
      tt.nombre as tipo_nombre,
      tt.codigo as tipo_codigo,
      s.id_categoria,
      cat.nombre as categoria_nombre,
      s.nombre,
      s.descripcion_comercial,
      s.entregable,
      s.requiere_aprobacion,
      s.sla_horas_resolucion,
      s.sla_horas_respuesta,
      s.costo_referencial,
      s.icono,
      s.esquema_formulario,
      s.id_departamento_resolutor,
      s.reglas_escalamiento,
      s.estado_registro,
      s.motivo_inactivacion,
      s.fecha_inactivacion,
      s.usuario_inactivacion,
      CONCAT(u_inact.nombres, ' ', u_inact.apellido_paterno) AS usuario_inactivacion_nombre
    FROM servicio_catalogo s
    INNER JOIN tipo_ticket tt ON tt.id_tipo_ticket = s.id_tipo_ticket
    LEFT JOIN categoria_ticket cat ON cat.id_categoria = s.id_categoria
    LEFT JOIN usuario u_inact ON s.usuario_inactivacion = u_inact.id_usuario
    WHERE ${condiciones.length > 0 ? condiciones.join(" AND ") : "1=1"}
    ORDER BY s.id_tipo_ticket ASC, s.id_servicio ASC
  `;

  try {
    const [servicios, pasos] = await Promise.all([
      query<ServicioCatalogo>(sqlServicios, params),
      query<ServicioWorkflowPaso>(`
        SELECT 
          p.id_paso,
          p.id_servicio,
          p.orden,
          p.codigo_paso,
          p.nombre_paso,
          p.rol_ejecutor,
          p.es_compuerta_aprobacion,
          p.pausa_sla,
          p.estado_registro
        FROM servicio_workflow_paso p
        WHERE p.estado_registro = true
        ORDER BY p.id_servicio, p.orden ASC
      `),
    ]);

    const audiencias = servicios.length
      ? await query<{ id_servicio: number; perfiles_habilitados: number[] }>(
          `SELECT id_servicio, array_agg(id_perfil ORDER BY id_perfil)::int[] AS perfiles_habilitados
           FROM servicio_catalogo_perfiles WHERE id_servicio = ANY($1::int[]) GROUP BY id_servicio`,
          [servicios.map((s) => s.id_servicio)]
        )
      : [];

    // Anidar pasos de workflow en cada servicio
    const serviciosConPasos = servicios.map((s) => ({
      ...s,
      perfiles_habilitados: audiencias.find((a) => a.id_servicio === s.id_servicio)?.perfiles_habilitados || [],
      pasos: pasos.filter((p) => p.id_servicio === s.id_servicio),
    }));

    return NextResponse.json({ servicios: serviciosConPasos });
  } catch (err) {
    console.error("Error al obtener servicios:", err);
    return NextResponse.json({ error: "Error al cargar el catálogo de servicios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Solo Administrador (1)
  if (sesion.perfilActivo.id_perfil !== 1) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para crear servicios" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      id_tipo_ticket,
      id_categoria,
      nombre,
      descripcion_comercial,
      entregable,
      requiere_aprobacion,
      sla_horas_resolucion,
      sla_horas_respuesta,
      costo_referencial,
      icono,
      perfiles_habilitados,
      esquema_formulario,
      id_departamento_resolutor,
      reglas_escalamiento,
    } = body;

    if (!id_tipo_ticket) {
      return NextResponse.json({ error: "El tipo de requerimiento es obligatorio" }, { status: 400 });
    }

    const vNom = validarTexto(nombre, 3, 100, "El nombre del servicio", true);
    if (!vNom.valido) return NextResponse.json({ error: vNom.mensaje }, { status: 400 });

    const vDesc = validarTexto(descripcion_comercial, 10, 1000, "La descripción del servicio", true);
    if (!vDesc.valido) return NextResponse.json({ error: vDesc.mensaje }, { status: 400 });

    const vEnt = validarTexto(entregable, 3, 300, "El entregable del servicio", true);
    if (!vEnt.valido) return NextResponse.json({ error: vEnt.mensaje }, { status: 400 });

    if (sla_horas_respuesta !== undefined && sla_horas_respuesta !== null && sla_horas_respuesta !== "") {
      const vResp = validarNumeroPositivo(sla_horas_respuesta, "El SLA de respuesta (horas)", 0.5, 720);
      if (!vResp.valido) return NextResponse.json({ error: vResp.mensaje }, { status: 400 });
    }

    if (sla_horas_resolucion !== undefined && sla_horas_resolucion !== null && sla_horas_resolucion !== "") {
      const vReso = validarNumeroPositivo(sla_horas_resolucion, "El SLA de resolución (horas)", 1, 1440);
      if (!vReso.valido) return NextResponse.json({ error: vReso.mensaje }, { status: 400 });
    }

    if (costo_referencial !== undefined && costo_referencial !== null && costo_referencial !== "") {
      const vCost = validarNumeroPositivo(costo_referencial, "El costo referencial", 0, 999999);
      if (!vCost.valido) return NextResponse.json({ error: vCost.mensaje }, { status: 400 });
    }

    const categoriaId = id_categoria ? Number(id_categoria) : null;
    let codigoCorto = "GEN";
    let defaultRespuesta = 4;
    let defaultResolucion = 24;

    if (categoriaId) {
      const categoria = await queryRow<{ id_tipo_ticket: number; codigo_corto: string; sla_default_respuesta: number; sla_default_resolucion: number }>(
        `SELECT id_tipo_ticket,codigo_corto,sla_default_respuesta,sla_default_resolucion FROM categoria_ticket WHERE id_categoria=$1 AND estado_registro=true`, [categoriaId]
      );
      if (!categoria || Number(categoria.id_tipo_ticket) !== Number(id_tipo_ticket)) {
        return NextResponse.json({ error: "La categoría seleccionada no pertenece al tipo ITIL elegido." }, { status: 400 });
      }
      codigoCorto = categoria.codigo_corto;
      defaultRespuesta = categoria.sla_default_respuesta;
      defaultResolucion = categoria.sla_default_resolucion;
    }

    const numResp = sla_horas_respuesta !== undefined && sla_horas_respuesta !== null && sla_horas_respuesta !== "" ? Number(sla_horas_respuesta) : defaultRespuesta;
    const numReso = sla_horas_resolucion !== undefined && sla_horas_resolucion !== null && sla_horas_resolucion !== "" ? Number(sla_horas_resolucion) : defaultResolucion;
    const vSla = validarSlaTiempos(numResp, numReso);
    if (!vSla.valido) return NextResponse.json({ error: vSla.mensaje }, { status: 400 });

    const perfiles = perfiles_habilitados === undefined ? [2, 3, 4, 5, 8] : perfiles_habilitados;
    if (!Array.isArray(perfiles) || perfiles.some((id: unknown) => !Number.isInteger(Number(id)) || Number(id) < 2 || Number(id) > 9)) {
      return NextResponse.json({ error: "La audiencia del servicio contiene perfiles inválidos." }, { status: 400 });
    }
    const schema = Array.isArray(esquema_formulario) ? esquema_formulario : [];
    if (schema.length > 30 || schema.some((f: any) => !f || !/^[a-z][a-z0-9_]{1,49}$/.test(String(f.clave || "")) || !String(f.etiqueta || "").trim() || !["texto","area","numero","fecha","correo","lista","casilla"].includes(f.tipo) || (f.tipo === "lista" && (!Array.isArray(f.opciones) || !f.opciones.length)))) {
      return NextResponse.json({ error: "El formulario contiene campos inválidos. Revisa claves, tipos y opciones de las listas." }, { status: 400 });
    }
    if (new Set(schema.map((f: any) => f.clave)).size !== schema.length) return NextResponse.json({ error: "Las claves de campo deben ser únicas." }, { status: 400 });
    const escalamiento = Array.isArray(reglas_escalamiento) ? reglas_escalamiento : [];
    if (escalamiento.length > 10 || escalamiento.some((r: any) => !Number.isInteger(Number(r.despues_horas)) || Number(r.despues_horas) < 1 || !Number.isInteger(Number(r.id_departamento)))) return NextResponse.json({ error: "Las reglas de escalamiento no son válidas." }, { status: 400 });
    const resolver = id_departamento_resolutor ? Number(id_departamento_resolutor) : null;
    if (resolver) {
      const existe = await queryRow<{ existe: boolean }>("SELECT EXISTS(SELECT 1 FROM departamento_ti WHERE id_departamento=$1 AND estado_registro=true) AS existe", [resolver]);
      if (!existe?.existe) return NextResponse.json({ error: "El grupo resolutor debe ser un departamento de TI activo." }, { status: 400 });
    }

    const consecutivo = await queryRow<{ siguiente: number }>(
      categoriaId
        ? `SELECT COALESCE(MAX(substring(codigo_servicio from '([0-9]+)$')::int),0)+1 AS siguiente
           FROM servicio_catalogo WHERE id_tipo_ticket=$1 AND id_categoria=$2 AND codigo_servicio ~ '[0-9]+$'`
        : `SELECT COALESCE(MAX(substring(codigo_servicio from '([0-9]+)$')::int),0)+1 AS siguiente
           FROM servicio_catalogo WHERE id_tipo_ticket=$1 AND id_categoria IS NULL AND codigo_servicio ~ '[0-9]+$'`,
      categoriaId ? [id_tipo_ticket, categoriaId] : [id_tipo_ticket]
    );
    const codigoGenerado = `SRV-${Number(id_tipo_ticket) === 1 ? "INC" : "SOL"}-${codigoCorto}-${String(consecutivo?.siguiente || 1).padStart(3, "0")}`;
    const nuevo = await queryRow<ServicioCatalogo>(
      `INSERT INTO servicio_catalogo (
        codigo_servicio, id_tipo_ticket, id_categoria, nombre,
        descripcion_comercial, entregable, requiere_aprobacion,
        sla_horas_resolucion, sla_horas_respuesta, costo_referencial, icono, estado_registro
        , esquema_formulario, id_departamento_resolutor, reglas_escalamiento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12, $13, $14)
      RETURNING *`,
      [
        codigoGenerado,
        id_tipo_ticket,
        categoriaId,
        nombre.trim(),
        descripcion_comercial.trim(),
        entregable.trim(),
        requiere_aprobacion ?? false,
        sla_horas_resolucion || defaultResolucion,
        sla_horas_respuesta || defaultRespuesta,
        costo_referencial || 0.0,
        icono || "servicio",
        JSON.stringify(schema),
        resolver,
        JSON.stringify(escalamiento),
      ]
    );

    if (nuevo) {
      await query("INSERT INTO servicio_catalogo_perfiles(id_servicio,id_perfil) SELECT $1,id_perfil FROM unnest($2::int[]) AS p(id_perfil) ON CONFLICT DO NOTHING", [nuevo.id_servicio,perfiles.map(Number)]);
      if (Array.isArray(body.pasos) && body.pasos.length > 0) {
        for (const p of body.pasos) {
          await query(
            `INSERT INTO servicio_workflow_paso (
              id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
            [nuevo.id_servicio, p.orden, p.codigo_paso, p.nombre_paso, p.rol_ejecutor, p.es_compuerta_aprobacion ?? false, p.pausa_sla ?? false]
          );
        }
      } else {
        // Pasos estándar por defecto según el estándar ITIL v4
        let ordenPaso = 1;
        await query(
          `INSERT INTO servicio_workflow_paso (id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro)
           VALUES ($1, $2, 'SOLICITADO', 'Registro de solicitud o reporte con detalle', 'SOLICITANTE', false, false, true)`,
          [nuevo.id_servicio, ordenPaso++]
        );

        if (nuevo.requiere_aprobacion) {
          await query(
            `INSERT INTO servicio_workflow_paso (id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro)
             VALUES ($1, $2, 'PENDIENTE_APROBACION', 'Aprobación formal de Jefatura de Área', 'JEFE_APROBADOR', true, true, true)`,
            [nuevo.id_servicio, ordenPaso++]
          );
        }

        await query(
          `INSERT INTO servicio_workflow_paso (id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro)
           VALUES ($1, $2, 'ATENCION_TECNICA', 'Diagnóstico y ejecución técnica del servicio', 'SOPORTE_N2', false, false, true)`,
          [nuevo.id_servicio, ordenPaso++]
        );

        await query(
          `INSERT INTO servicio_workflow_paso (id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro)
           VALUES ($1, $2, 'VERIFICACION_ENTREGA', 'Confirmación de conformidad por el usuario', 'SOLICITANTE', false, false, true)`,
          [nuevo.id_servicio, ordenPaso++]
        );
      }

      await query(
        `INSERT INTO log_auditoria_sistema (
          id_usuario, modulo, accion, descripcion, detalles, direccion_ip
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          sesion.id_usuario,
          "SERVICIOS",
          "CREAR_SERVICIO",
          `El usuario ${sesion.nombres} dio de alta el nuevo servicio [${nuevo.codigo_servicio}] ${nuevo.nombre} con SLA de resolución de ${nuevo.sla_horas_resolucion}h.`,
          JSON.stringify({ id_servicio: nuevo.id_servicio, codigo_servicio: nuevo.codigo_servicio, nombre: nuevo.nombre, sla_horas_resolucion: nuevo.sla_horas_resolucion }),
          req.headers.get("x-forwarded-for") || "127.0.0.1",
        ]
      );
    }

    return NextResponse.json({ servicio: nuevo }, { status: 201 });
  } catch (err: any) {
    if (err.code === "23505") {
      return NextResponse.json({ error: "El código de servicio ya existe" }, { status: 409 });
    }
    console.error("Error al crear servicio:", err);
    return NextResponse.json({ error: "No se pudo registrar el servicio" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion || sesion.perfilActivo?.id_perfil !== 1) {
    return NextResponse.json({ error: "Solo el Administrador puede asignar servicios a categorías." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id_categoria, ids_servicios } = body;

    if (!id_categoria || !Array.isArray(ids_servicios) || ids_servicios.length === 0) {
      return NextResponse.json({ error: "Debe seleccionar al menos un servicio y especificar la categoría de destino." }, { status: 400 });
    }

    const idsInt = ids_servicios.map((id: any) => Number(id)).filter((id: number) => !isNaN(id) && id > 0);
    if (idsInt.length === 0) {
      return NextResponse.json({ error: "Identificadores de servicio inválidos." }, { status: 400 });
    }

    // Actualizar categoría de los servicios seleccionados
    await query(
      "UPDATE servicio_catalogo SET id_categoria = $1 WHERE id_servicio = ANY($2::int[])",
      [Number(id_categoria), idsInt]
    );

    // Auditoría
    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sesion.id_usuario,
        "SERVICIOS",
        "ASIGNAR_CATEGORIA",
        `Se asignaron ${idsInt.length} servicios a la categoría ID ${id_categoria}.`,
        JSON.stringify({ id_categoria, ids_servicios: idsInt }),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    return NextResponse.json({ ok: true, mensaje: `Se asignaron ${idsInt.length} servicios exitosamente.` });
  } catch (err) {
    console.error("Error al asignar categoría a servicios:", err);
    return NextResponse.json({ error: "Error en el servidor al asignar servicios." }, { status: 500 });
  }
}

