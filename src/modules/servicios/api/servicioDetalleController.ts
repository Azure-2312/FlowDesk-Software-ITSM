import { NextRequest, NextResponse } from "next/server";
import { query, queryRow, transaccion } from "@/shared/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ServicioCatalogo, ServicioWorkflowPaso } from "@/types";
import { validarTexto, validarNumeroPositivo, validarSlaTiempos } from "@/shared/lib/validaciones";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idServicio = parseInt(params.id, 10);
  if (isNaN(idServicio)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const servicio = await queryRow<ServicioCatalogo>(
      `SELECT 
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
      INNER JOIN categoria_ticket cat ON cat.id_categoria = s.id_categoria
      LEFT JOIN usuario u_inact ON s.usuario_inactivacion = u_inact.id_usuario
      WHERE s.id_servicio = $1`,
      [idServicio]
    );

    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    const pasos = await query<ServicioWorkflowPaso>(
      `SELECT 
        id_paso,
        id_servicio,
        orden,
        codigo_paso,
        nombre_paso,
        rol_ejecutor,
        es_compuerta_aprobacion,
        pausa_sla,
        estado_registro
      FROM servicio_workflow_paso
      WHERE id_servicio = $1 AND estado_registro = true
      ORDER BY orden ASC`,
      [idServicio]
    );
    const audiencia = await query<{ id_perfil: number }>(
      "SELECT id_perfil FROM servicio_catalogo_perfiles WHERE id_servicio = $1 ORDER BY id_perfil",
      [idServicio]
    );

    return NextResponse.json({ servicio: { ...servicio, pasos, perfiles_habilitados: audiencia.map((p) => p.id_perfil) } });
  } catch (err) {
    console.error("Error al obtener detalle del servicio:", err);
    return NextResponse.json({ error: "Error al consultar servicio" }, { status: 500 });
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

  // Solo Administrador (1)
  if (sesion.perfilActivo.id_perfil !== 1) {
    return NextResponse.json(
      { error: "Solo los administradores tienen permiso para modificar servicios" },
      { status: 403 }
    );
  }

  const idServicio = parseInt(params.id, 10);
  if (isNaN(idServicio)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const actual = await queryRow<any>(
      "SELECT * FROM servicio_catalogo WHERE id_servicio = $1",
      [idServicio]
    );

    if (!actual) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    let perfilesHabilitados: number[] | undefined;
    if (body.perfiles_habilitados !== undefined) {
      if (!Array.isArray(body.perfiles_habilitados) || body.perfiles_habilitados.some((id: unknown) => !Number.isInteger(Number(id)) || Number(id) < 2 || Number(id) > 9)) {
        return NextResponse.json({ error: "La audiencia del servicio contiene perfiles inválidos." }, { status: 400 });
      }
      const ids: number[] = body.perfiles_habilitados.map((id: unknown) => Number(id));
      perfilesHabilitados = [...new Set<number>(ids)];
    }

    // Gestion de estado activo/inactivo con justificacion obligatoria
    let nuevoEstado = actual.estado_registro;
    let motivoInactivacion = actual.motivo_inactivacion;
    let fechaInactivacion = actual.fecha_inactivacion;
    let usuarioInactivacion = actual.usuario_inactivacion;

    if (body.estado_registro !== undefined) {
      nuevoEstado = Boolean(body.estado_registro);
      if (!nuevoEstado) {
        // Deshabilitando servicio: motivo obligatorio
        if (!body.motivo_inactivacion || typeof body.motivo_inactivacion !== "string" || body.motivo_inactivacion.trim().length < 5) {
          return NextResponse.json(
            { error: "Debe ingresar una justificación detallada (mínimo 5 caracteres) para deshabilitar el servicio." },
            { status: 400 }
          );
        }
        motivoInactivacion = body.motivo_inactivacion.trim();
        fechaInactivacion = new Date();
        usuarioInactivacion = sesion.id_usuario;
      } else {
        // Reactivando servicio
        motivoInactivacion = null;
        fechaInactivacion = null;
        usuarioInactivacion = null;
      }
    }

    const nombre = body.nombre !== undefined ? body.nombre.trim() : actual.nombre;
    const descripcion_comercial = body.descripcion_comercial !== undefined ? body.descripcion_comercial.trim() : actual.descripcion_comercial;
    const entregable = body.entregable !== undefined ? body.entregable.trim() : actual.entregable;
    const requiere_aprobacion = body.requiere_aprobacion !== undefined ? body.requiere_aprobacion : actual.requiere_aprobacion;
    const sla_horas_resolucion = body.sla_horas_resolucion !== undefined ? body.sla_horas_resolucion : actual.sla_horas_resolucion;
    const sla_horas_respuesta = body.sla_horas_respuesta !== undefined ? body.sla_horas_respuesta : actual.sla_horas_respuesta;
    const costo_referencial = body.costo_referencial !== undefined ? body.costo_referencial : actual.costo_referencial;
    const id_categoria = body.id_categoria !== undefined ? body.id_categoria : actual.id_categoria;
    const id_tipo_ticket = body.id_tipo_ticket !== undefined ? body.id_tipo_ticket : actual.id_tipo_ticket;

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

    const vSla = validarSlaTiempos(sla_horas_respuesta, sla_horas_resolucion);
    if (!vSla.valido) return NextResponse.json({ error: vSla.mensaje }, { status: 400 });
    const categoria = await queryRow<{ id_tipo_ticket: number; codigo_corto: string; sla_default_respuesta: number; sla_default_resolucion: number }>(
      "SELECT id_tipo_ticket,codigo_corto,sla_default_respuesta,sla_default_resolucion FROM categoria_ticket WHERE id_categoria=$1 AND estado_registro=true", [id_categoria]
    );
    if (!categoria || Number(categoria.id_tipo_ticket) !== Number(id_tipo_ticket)) {
      return NextResponse.json({ error: "La categoría seleccionada no pertenece al tipo ITIL elegido." }, { status: 400 });
    }
    const schema = body.esquema_formulario !== undefined ? body.esquema_formulario : actual.esquema_formulario || [];
    if (!Array.isArray(schema) || schema.length > 30 || schema.some((f: any) => !f || !/^[a-z][a-z0-9_]{1,49}$/.test(String(f.clave || "")) || !String(f.etiqueta || "").trim() || !["texto","area","numero","fecha","correo","lista","casilla"].includes(f.tipo) || (f.tipo === "lista" && (!Array.isArray(f.opciones) || !f.opciones.length)))) return NextResponse.json({ error: "El formulario contiene campos inválidos." }, { status: 400 });
    if (new Set(schema.map((f: any) => f.clave)).size !== schema.length) return NextResponse.json({ error: "Las claves del formulario deben ser únicas." }, { status: 400 });
    const escalamiento = body.reglas_escalamiento !== undefined ? body.reglas_escalamiento : actual.reglas_escalamiento || [];
    if (!Array.isArray(escalamiento) || escalamiento.length > 10 || escalamiento.some((r: any) => !Number.isInteger(Number(r.despues_horas)) || Number(r.despues_horas) < 1 || !Number.isInteger(Number(r.id_departamento)))) return NextResponse.json({ error: "Las reglas de escalamiento no son válidas." }, { status: 400 });
    const resolver = body.id_departamento_resolutor !== undefined ? (body.id_departamento_resolutor ? Number(body.id_departamento_resolutor) : null) : actual.id_departamento_resolutor;
    if (resolver) {
      const existe = await queryRow<{ existe: boolean }>("SELECT EXISTS(SELECT 1 FROM departamento_ti WHERE id_departamento=$1 AND estado_registro=true) AS existe", [resolver]);
      if (!existe?.existe) return NextResponse.json({ error: "El grupo resolutor debe ser un departamento de TI activo." }, { status: 400 });
    }
    let codigoServicio = actual.codigo_servicio;
    if (Number(id_categoria) !== Number(actual.id_categoria) || Number(id_tipo_ticket) !== Number(actual.id_tipo_ticket)) {
      const correlativo = await queryRow<{ siguiente: number }>(
        `SELECT COALESCE(MAX(substring(codigo_servicio from '([0-9]+)$')::int),0)+1 AS siguiente FROM servicio_catalogo
         WHERE id_tipo_ticket=$1 AND id_categoria=$2 AND id_servicio<>$3 AND codigo_servicio ~ '[0-9]+$'`,
        [id_tipo_ticket, id_categoria, idServicio]
      );
      codigoServicio = `SRV-${Number(id_tipo_ticket) === 1 ? "INC" : "SOL"}-${categoria.codigo_corto}-${String(correlativo?.siguiente || 1).padStart(3, "0")}`;
    }

    const actualizado = await queryRow<ServicioCatalogo>(
      `UPDATE servicio_catalogo SET
        nombre = $1,
        descripcion_comercial = $2,
        entregable = $3,
        requiere_aprobacion = $4,
        sla_horas_resolucion = $5,
        sla_horas_respuesta = $6,
        costo_referencial = $7,
        id_categoria = $8,
        id_tipo_ticket = $9,
        codigo_servicio = $10,
        estado_registro = $11,
        motivo_inactivacion = $12,
        fecha_inactivacion = $13,
        usuario_inactivacion = $14,
        esquema_formulario = $15,
        id_departamento_resolutor = $16,
        reglas_escalamiento = $17
      WHERE id_servicio = $18
      RETURNING *`,
      [
        nombre,
        descripcion_comercial,
        entregable,
        requiere_aprobacion,
        sla_horas_resolucion,
        sla_horas_respuesta,
        costo_referencial,
        id_categoria,
        id_tipo_ticket,
        codigoServicio,
        nuevoEstado,
        motivoInactivacion,
        fechaInactivacion,
        usuarioInactivacion,
        JSON.stringify(schema),
        resolver,
        JSON.stringify(escalamiento),
        idServicio,
      ]
    );

    if (perfilesHabilitados) {
      await transaccion(async (client) => {
        await client.query("DELETE FROM servicio_catalogo_perfiles WHERE id_servicio = $1", [idServicio]);
        if (perfilesHabilitados.length > 0) {
          await client.query(
            "INSERT INTO servicio_catalogo_perfiles(id_servicio,id_perfil) SELECT $1,id_perfil FROM unnest($2::int[]) AS p(id_perfil)",
            [idServicio, perfilesHabilitados]
          );
        }
      });
    }

    const cambiosDetalle: Record<string, { anterior: any; nuevo: any }> = {};
    if (actual.sla_horas_resolucion !== sla_horas_resolucion) {
      cambiosDetalle["sla_horas_resolucion"] = { anterior: actual.sla_horas_resolucion, nuevo: sla_horas_resolucion };
    }
    if (actual.sla_horas_respuesta !== sla_horas_respuesta) {
      cambiosDetalle["sla_horas_respuesta"] = { anterior: actual.sla_horas_respuesta, nuevo: sla_horas_respuesta };
    }
    if (actual.nombre !== nombre) {
      cambiosDetalle["nombre"] = { anterior: actual.nombre, nuevo: nombre };
    }
    if (actual.requiere_aprobacion !== requiere_aprobacion) {
      cambiosDetalle["requiere_aprobacion"] = { anterior: actual.requiere_aprobacion, nuevo: requiere_aprobacion };
    }
    if (actual.estado_registro !== nuevoEstado) {
      cambiosDetalle["estado_registro"] = { anterior: actual.estado_registro, nuevo: nuevoEstado };
    }

    let descripcionAudit = `El usuario ${sesion.nombres} modificó la configuración del servicio [${codigoServicio}] ${nombre}.`;
    if (cambiosDetalle["sla_horas_resolucion"] || cambiosDetalle["sla_horas_respuesta"]) {
      descripcionAudit = `El usuario ${sesion.nombres} cambió la configuración de SLAs del servicio [${codigoServicio}] ${nombre} (Resolución: ${actual.sla_horas_resolucion}h a ${sla_horas_resolucion}h, Respuesta: ${actual.sla_horas_respuesta}h a ${sla_horas_respuesta}h).`;
    } else if (cambiosDetalle["estado_registro"]) {
      descripcionAudit = `El usuario ${sesion.nombres} cambió el estado del servicio [${codigoServicio}] a ${nuevoEstado ? "Activo" : "Inactivo"}${motivoInactivacion ? ` (Motivo: ${motivoInactivacion})` : ""}.`;
    }

    await query(
      `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sesion.id_usuario,
        "SERVICIOS",
        cambiosDetalle["sla_horas_resolucion"] || cambiosDetalle["sla_horas_respuesta"] ? "ACTUALIZAR_SLA_SERVICIO" : "ACTUALIZAR_SERVICIO",
        descripcionAudit,
        JSON.stringify({ id_servicio: idServicio, codigo_servicio: codigoServicio, cambios: cambiosDetalle }),
        req.headers.get("x-forwarded-for") || "127.0.0.1",
      ]
    );

    return NextResponse.json({ servicio: { ...actualizado, perfiles_habilitados: perfilesHabilitados } });
  } catch (err) {
    console.error("Error al actualizar servicio:", err);
    return NextResponse.json({ error: "No se pudo actualizar el servicio" }, { status: 500 });
  }
}
