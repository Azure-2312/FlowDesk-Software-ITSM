import { query, queryRow, transaccion } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { ServicioCatalogo, ServicioWorkflowPaso } from "@/types";
import { validarTexto, validarNumeroPositivo, validarSlaTiempos } from "@/shared/lib/validaciones";

export interface ContextoAuditoriaServicio {
  idUsuario: number;
  nombres: string;
  ip: string;
}

export async function obtenerServicio(idServicio: number) {
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
    throw new ErrorDominio("Servicio no encontrado", 404);
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

  return {
    ...servicio,
    pasos,
    perfiles_habilitados: audiencia.map((p) => p.id_perfil),
  };
}

export async function listarPasosWorkflow(idServicio: number) {
  return query<ServicioWorkflowPaso>(
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
}

export interface PasoWorkflowEntrada {
  codigo_paso?: string;
  nombre_paso?: string;
  rol_ejecutor?: string;
  es_compuerta_aprobacion?: unknown;
  pausa_sla?: unknown;
}

export async function actualizarWorkflow(idServicio: number, pasos: PasoWorkflowEntrada[]) {
  if (!Array.isArray(pasos) || pasos.length === 0) {
    throw new ErrorDominio("El workflow debe contener al menos un paso operativo.");
  }

  for (let i = 0; i < pasos.length; i++) {
    const p = pasos[i];
    if (!p.nombre_paso || !p.rol_ejecutor) {
      throw new ErrorDominio(`El paso #${i + 1} debe tener nombre y rol ejecutor definidos.`);
    }
  }

  // Reemplazo transaccional de pasos del workflow
  await query("DELETE FROM servicio_workflow_paso WHERE id_servicio = $1", [idServicio]);

  for (let i = 0; i < pasos.length; i++) {
    const p = pasos[i];
    const orden = i + 1;
    const codigoPaso = p.codigo_paso?.trim() || `STEP-0${orden}`;
    const nombrePaso = p.nombre_paso!.trim();
    const rolEjecutor = p.rol_ejecutor!.trim();
    const esCompuerta = Boolean(p.es_compuerta_aprobacion);
    const pausaSla = Boolean(p.pausa_sla);

    await query(
      `INSERT INTO servicio_workflow_paso (
          id_servicio,
          orden,
          codigo_paso,
          nombre_paso,
          rol_ejecutor,
          es_compuerta_aprobacion,
          pausa_sla,
          estado_registro
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
      [idServicio, orden, codigoPaso, nombrePaso, rolEjecutor, esCompuerta, pausaSla]
    );
  }

  return query<ServicioWorkflowPaso>(
    `SELECT * FROM servicio_workflow_paso WHERE id_servicio = $1 AND estado_registro = true ORDER BY orden ASC`,
    [idServicio]
  );
}

export async function actualizarServicio(
  idServicio: number,
  body: any,
  contexto: ContextoAuditoriaServicio
) {
  const actual = await queryRow<any>(
    "SELECT * FROM servicio_catalogo WHERE id_servicio = $1",
    [idServicio]
  );

  if (!actual) {
    throw new ErrorDominio("Servicio no encontrado", 404);
  }

  let perfilesHabilitados: number[] | undefined;
  if (body.perfiles_habilitados !== undefined) {
    if (
      !Array.isArray(body.perfiles_habilitados) ||
      body.perfiles_habilitados.some(
        (id: unknown) => !Number.isInteger(Number(id)) || Number(id) < 2 || Number(id) > 9
      )
    ) {
      throw new ErrorDominio("La audiencia del servicio contiene perfiles inválidos.");
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
      if (
        !body.motivo_inactivacion ||
        typeof body.motivo_inactivacion !== "string" ||
        body.motivo_inactivacion.trim().length < 5
      ) {
        throw new ErrorDominio(
          "Debe ingresar una justificación detallada (mínimo 5 caracteres) para deshabilitar el servicio."
        );
      }
      motivoInactivacion = body.motivo_inactivacion.trim();
      fechaInactivacion = new Date();
      usuarioInactivacion = contexto.idUsuario;
    } else {
      // Reactivando servicio
      motivoInactivacion = null;
      fechaInactivacion = null;
      usuarioInactivacion = null;
    }
  }

  const nombre = body.nombre !== undefined ? body.nombre.trim() : actual.nombre;
  const descripcion_comercial =
    body.descripcion_comercial !== undefined
      ? body.descripcion_comercial.trim()
      : actual.descripcion_comercial;
  const entregable = body.entregable !== undefined ? body.entregable.trim() : actual.entregable;
  const requiere_aprobacion =
    body.requiere_aprobacion !== undefined ? body.requiere_aprobacion : actual.requiere_aprobacion;
  const sla_horas_resolucion =
    body.sla_horas_resolucion !== undefined ? body.sla_horas_resolucion : actual.sla_horas_resolucion;
  const sla_horas_respuesta =
    body.sla_horas_respuesta !== undefined ? body.sla_horas_respuesta : actual.sla_horas_respuesta;
  const costo_referencial =
    body.costo_referencial !== undefined ? body.costo_referencial : actual.costo_referencial;
  const id_categoria = body.id_categoria !== undefined ? body.id_categoria : actual.id_categoria;
  const id_tipo_ticket =
    body.id_tipo_ticket !== undefined ? body.id_tipo_ticket : actual.id_tipo_ticket;

  const vNom = validarTexto(nombre, 3, 100, "El nombre del servicio", true);
  if (!vNom.valido) throw new ErrorDominio(vNom.mensaje!);

  const vDesc = validarTexto(descripcion_comercial, 10, 1000, "La descripción del servicio", true);
  if (!vDesc.valido) throw new ErrorDominio(vDesc.mensaje!);

  const vEnt = validarTexto(entregable, 3, 300, "El entregable del servicio", true);
  if (!vEnt.valido) throw new ErrorDominio(vEnt.mensaje!);

  if (sla_horas_respuesta !== undefined && sla_horas_respuesta !== null && sla_horas_respuesta !== "") {
    const vResp = validarNumeroPositivo(sla_horas_respuesta, "El SLA de respuesta (horas)", 0.5, 720);
    if (!vResp.valido) throw new ErrorDominio(vResp.mensaje!);
  }

  if (sla_horas_resolucion !== undefined && sla_horas_resolucion !== null && sla_horas_resolucion !== "") {
    const vReso = validarNumeroPositivo(sla_horas_resolucion, "El SLA de resolución (horas)", 1, 1440);
    if (!vReso.valido) throw new ErrorDominio(vReso.mensaje!);
  }

  if (costo_referencial !== undefined && costo_referencial !== null && costo_referencial !== "") {
    const vCost = validarNumeroPositivo(costo_referencial, "El costo referencial", 0, 999999);
    if (!vCost.valido) throw new ErrorDominio(vCost.mensaje!);
  }

  const vSla = validarSlaTiempos(sla_horas_respuesta, sla_horas_resolucion);
  if (!vSla.valido) throw new ErrorDominio(vSla.mensaje!);

  const categoria = await queryRow<{
    id_tipo_ticket: number;
    codigo_corto: string;
    sla_default_respuesta: number;
    sla_default_resolucion: number;
  }>(
    "SELECT id_tipo_ticket,codigo_corto,sla_default_respuesta,sla_default_resolucion FROM categoria_ticket WHERE id_categoria=$1 AND estado_registro=true",
    [id_categoria]
  );
  if (!categoria || Number(categoria.id_tipo_ticket) !== Number(id_tipo_ticket)) {
    throw new ErrorDominio("La categoría seleccionada no pertenece al tipo ITIL elegido.");
  }

  const schema = body.esquema_formulario !== undefined ? body.esquema_formulario : actual.esquema_formulario || [];
  if (
    !Array.isArray(schema) ||
    schema.length > 30 ||
    schema.some(
      (f: any) =>
        !f ||
        !/^[a-z][a-z0-9_]{1,49}$/.test(String(f.clave || "")) ||
        !String(f.etiqueta || "").trim() ||
        !["texto", "area", "numero", "fecha", "correo", "lista", "casilla"].includes(f.tipo) ||
        (f.tipo === "lista" && (!Array.isArray(f.opciones) || !f.opciones.length))
    )
  ) {
    throw new ErrorDominio("El formulario contiene campos inválidos.");
  }
  if (new Set(schema.map((f: any) => f.clave)).size !== schema.length) {
    throw new ErrorDominio("Las claves del formulario deben ser únicas.");
  }

  const escalamiento = body.reglas_escalamiento !== undefined ? body.reglas_escalamiento : actual.reglas_escalamiento || [];
  if (
    !Array.isArray(escalamiento) ||
    escalamiento.length > 10 ||
    escalamiento.some(
      (r: any) =>
        !Number.isInteger(Number(r.despues_horas)) ||
        Number(r.despues_horas) < 1 ||
        !Number.isInteger(Number(r.id_departamento))
    )
  ) {
    throw new ErrorDominio("Las reglas de escalamiento no son válidas.");
  }

  const resolver =
    body.id_departamento_resolutor !== undefined
      ? body.id_departamento_resolutor
        ? Number(body.id_departamento_resolutor)
        : null
      : actual.id_departamento_resolutor;
  if (resolver) {
    const existe = await queryRow<{ existe: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM departamento_ti WHERE id_departamento=$1 AND estado_registro=true) AS existe",
      [resolver]
    );
    if (!existe?.existe) throw new ErrorDominio("El grupo resolutor debe ser un departamento de TI activo.");
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
      if (perfilesHabilitados!.length > 0) {
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

  let descripcionAudit = `El usuario ${contexto.nombres} modificó la configuración del servicio [${codigoServicio}] ${nombre}.`;
  if (cambiosDetalle["sla_horas_resolucion"] || cambiosDetalle["sla_horas_respuesta"]) {
    descripcionAudit = `El usuario ${contexto.nombres} cambió la configuración de SLAs del servicio [${codigoServicio}] ${nombre} (Resolución: ${actual.sla_horas_resolucion}h a ${sla_horas_resolucion}h, Respuesta: ${actual.sla_horas_respuesta}h a ${sla_horas_respuesta}h).`;
  } else if (cambiosDetalle["estado_registro"]) {
    descripcionAudit = `El usuario ${contexto.nombres} cambió el estado del servicio [${codigoServicio}] a ${nuevoEstado ? "Activo" : "Inactivo"}${motivoInactivacion ? ` (Motivo: ${motivoInactivacion})` : ""}.`;
  }

  await query(
    `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      contexto.idUsuario,
      "SERVICIOS",
      cambiosDetalle["sla_horas_resolucion"] || cambiosDetalle["sla_horas_respuesta"]
        ? "ACTUALIZAR_SLA_SERVICIO"
        : "ACTUALIZAR_SERVICIO",
      descripcionAudit,
      JSON.stringify({ id_servicio: idServicio, codigo_servicio: codigoServicio, cambios: cambiosDetalle }),
      contexto.ip,
    ]
  );

  return { ...actualizado, perfiles_habilitados: perfilesHabilitados };
}

export interface FiltrosServicios {
  idTipo?: string | null;
  idCategoria?: string | null;
  buscar?: string | null;
  estado?: string | null;
}

export async function listarServicios(filtros: FiltrosServicios) {
  const condiciones: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (filtros.estado === "inactivos") {
    condiciones.push("s.estado_registro = false");
  } else if (filtros.estado === "todos") {
    // Sin filtro de estado
  } else {
    // Por defecto: activos
    condiciones.push("s.estado_registro = true");
  }

  if (filtros.idTipo) {
    condiciones.push(`s.id_tipo_ticket = $${paramIdx++}`);
    params.push(parseInt(filtros.idTipo, 10));
  }

  if (filtros.idCategoria === "sin_asignar") {
    condiciones.push("s.id_categoria IS NULL");
  } else if (filtros.idCategoria) {
    condiciones.push(`s.id_categoria = $${paramIdx++}`);
    params.push(parseInt(filtros.idCategoria, 10));
  }

  if (filtros.buscar && filtros.buscar.trim().length > 0) {
    condiciones.push(
      `(s.nombre ILIKE $${paramIdx} OR s.codigo_servicio ILIKE $${paramIdx} OR s.descripcion_comercial ILIKE $${paramIdx})`
    );
    params.push(`%${filtros.buscar.trim()}%`);
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

  return servicios.map((s) => ({
    ...s,
    perfiles_habilitados:
      audiencias.find((a) => a.id_servicio === s.id_servicio)?.perfiles_habilitados || [],
    pasos: pasos.filter((p) => p.id_servicio === s.id_servicio),
  }));
}

export async function crearServicio(body: any, contexto: ContextoAuditoriaServicio) {
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
    throw new ErrorDominio("El tipo de requerimiento es obligatorio");
  }

  const vNom = validarTexto(nombre, 3, 100, "El nombre del servicio", true);
  if (!vNom.valido) throw new ErrorDominio(vNom.mensaje!);

  const vDesc = validarTexto(descripcion_comercial, 10, 1000, "La descripción del servicio", true);
  if (!vDesc.valido) throw new ErrorDominio(vDesc.mensaje!);

  const vEnt = validarTexto(entregable, 3, 300, "El entregable del servicio", true);
  if (!vEnt.valido) throw new ErrorDominio(vEnt.mensaje!);

  if (sla_horas_respuesta !== undefined && sla_horas_respuesta !== null && sla_horas_respuesta !== "") {
    const vResp = validarNumeroPositivo(sla_horas_respuesta, "El SLA de respuesta (horas)", 0.5, 720);
    if (!vResp.valido) throw new ErrorDominio(vResp.mensaje!);
  }

  if (sla_horas_resolucion !== undefined && sla_horas_resolucion !== null && sla_horas_resolucion !== "") {
    const vReso = validarNumeroPositivo(sla_horas_resolucion, "El SLA de resolución (horas)", 1, 1440);
    if (!vReso.valido) throw new ErrorDominio(vReso.mensaje!);
  }

  if (costo_referencial !== undefined && costo_referencial !== null && costo_referencial !== "") {
    const vCost = validarNumeroPositivo(costo_referencial, "El costo referencial", 0, 999999);
    if (!vCost.valido) throw new ErrorDominio(vCost.mensaje!);
  }

  const categoriaId = id_categoria ? Number(id_categoria) : null;
  let codigoCorto = "GEN";
  let defaultRespuesta = 4;
  let defaultResolucion = 24;

  if (categoriaId) {
    const categoria = await queryRow<{
      id_tipo_ticket: number;
      codigo_corto: string;
      sla_default_respuesta: number;
      sla_default_resolucion: number;
    }>(
      `SELECT id_tipo_ticket,codigo_corto,sla_default_respuesta,sla_default_resolucion FROM categoria_ticket WHERE id_categoria=$1 AND estado_registro=true`,
      [categoriaId]
    );
    if (!categoria || Number(categoria.id_tipo_ticket) !== Number(id_tipo_ticket)) {
      throw new ErrorDominio("La categoría seleccionada no pertenece al tipo ITIL elegido.");
    }
    codigoCorto = categoria.codigo_corto;
    defaultRespuesta = categoria.sla_default_respuesta;
    defaultResolucion = categoria.sla_default_resolucion;
  }

  const numResp =
    sla_horas_respuesta !== undefined && sla_horas_respuesta !== null && sla_horas_respuesta !== ""
      ? Number(sla_horas_respuesta)
      : defaultRespuesta;
  const numReso =
    sla_horas_resolucion !== undefined && sla_horas_resolucion !== null && sla_horas_resolucion !== ""
      ? Number(sla_horas_resolucion)
      : defaultResolucion;
  const vSla = validarSlaTiempos(numResp, numReso);
  if (!vSla.valido) throw new ErrorDominio(vSla.mensaje!);

  const perfiles = perfiles_habilitados === undefined ? [2, 3, 4, 5, 8] : perfiles_habilitados;
  if (
    !Array.isArray(perfiles) ||
    perfiles.some((id: unknown) => !Number.isInteger(Number(id)) || Number(id) < 2 || Number(id) > 9)
  ) {
    throw new ErrorDominio("La audiencia del servicio contiene perfiles inválidos.");
  }

  const schema = Array.isArray(esquema_formulario) ? esquema_formulario : [];
  if (
    schema.length > 30 ||
    schema.some(
      (f: any) =>
        !f ||
        !/^[a-z][a-z0-9_]{1,49}$/.test(String(f.clave || "")) ||
        !String(f.etiqueta || "").trim() ||
        !["texto", "area", "numero", "fecha", "correo", "lista", "casilla"].includes(f.tipo) ||
        (f.tipo === "lista" && (!Array.isArray(f.opciones) || !f.opciones.length))
    )
  ) {
    throw new ErrorDominio(
      "El formulario contiene campos inválidos. Revisa claves, tipos y opciones de las listas."
    );
  }
  if (new Set(schema.map((f: any) => f.clave)).size !== schema.length) {
    throw new ErrorDominio("Las claves de campo deben ser únicas.");
  }

  const escalamiento = Array.isArray(reglas_escalamiento) ? reglas_escalamiento : [];
  if (
    escalamiento.length > 10 ||
    escalamiento.some(
      (r: any) =>
        !Number.isInteger(Number(r.despues_horas)) ||
        Number(r.despues_horas) < 1 ||
        !Number.isInteger(Number(r.id_departamento))
    )
  ) {
    throw new ErrorDominio("Las reglas de escalamiento no son válidas.");
  }

  const resolver = id_departamento_resolutor ? Number(id_departamento_resolutor) : null;
  if (resolver) {
    const existe = await queryRow<{ existe: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM departamento_ti WHERE id_departamento=$1 AND estado_registro=true) AS existe",
      [resolver]
    );
    if (!existe?.existe) throw new ErrorDominio("El grupo resolutor debe ser un departamento de TI activo.");
  }

  try {
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
      await query(
        "INSERT INTO servicio_catalogo_perfiles(id_servicio,id_perfil) SELECT $1,id_perfil FROM unnest($2::int[]) AS p(id_perfil) ON CONFLICT DO NOTHING",
        [nuevo.id_servicio, perfiles.map(Number)]
      );
      if (Array.isArray(body.pasos) && body.pasos.length > 0) {
        for (const p of body.pasos) {
          await query(
            `INSERT INTO servicio_workflow_paso (
              id_servicio, orden, codigo_paso, nombre_paso, rol_ejecutor, es_compuerta_aprobacion, pausa_sla, estado_registro
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
            [
              nuevo.id_servicio,
              p.orden,
              p.codigo_paso,
              p.nombre_paso,
              p.rol_ejecutor,
              p.es_compuerta_aprobacion ?? false,
              p.pausa_sla ?? false,
            ]
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
          contexto.idUsuario,
          "SERVICIOS",
          "CREAR_SERVICIO",
          `El usuario ${contexto.nombres} dio de alta el nuevo servicio [${nuevo.codigo_servicio}] ${nuevo.nombre} con SLA de resolución de ${nuevo.sla_horas_resolucion}h.`,
          JSON.stringify({
            id_servicio: nuevo.id_servicio,
            codigo_servicio: nuevo.codigo_servicio,
            nombre: nuevo.nombre,
            sla_horas_resolucion: nuevo.sla_horas_resolucion,
          }),
          contexto.ip,
        ]
      );
    }

    return nuevo;
  } catch (err: any) {
    if (err?.code === "23505") {
      throw new ErrorDominio("El código de servicio ya existe", 409);
    }
    throw err;
  }
}

export interface AsignacionCategoria {
  id_categoria?: unknown;
  ids_servicios?: unknown;
}

export async function asignarCategoriaServicios(
  body: AsignacionCategoria,
  contexto: ContextoAuditoriaServicio
) {
  const { id_categoria, ids_servicios } = body;

  if (!id_categoria || !Array.isArray(ids_servicios) || ids_servicios.length === 0) {
    throw new ErrorDominio("Debe seleccionar al menos un servicio y especificar la categoría de destino.");
  }

  const idsInt = ids_servicios
    .map((id: any) => Number(id))
    .filter((id: number) => !isNaN(id) && id > 0);
  if (idsInt.length === 0) {
    throw new ErrorDominio("Identificadores de servicio inválidos.");
  }

  // Actualizar categoría de los servicios seleccionados
  await query("UPDATE servicio_catalogo SET id_categoria = $1 WHERE id_servicio = ANY($2::int[])", [
    Number(id_categoria),
    idsInt,
  ]);

  // Auditoría
  await query(
    `INSERT INTO log_auditoria_sistema (
        id_usuario, modulo, accion, descripcion, detalles, direccion_ip
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      contexto.idUsuario,
      "SERVICIOS",
      "ASIGNAR_CATEGORIA",
      `Se asignaron ${idsInt.length} servicios a la categoría ID ${id_categoria}.`,
      JSON.stringify({ id_categoria, ids_servicios: idsInt }),
      contexto.ip,
    ]
  );

  return { ok: true, mensaje: `Se asignaron ${idsInt.length} servicios exitosamente.` };
}
