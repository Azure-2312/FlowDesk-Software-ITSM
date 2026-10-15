import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export interface FiltrosActivos {
  tipo?: string | null;
  estado?: string | null;
}

export async function listarActivos(idPerfil: number, filtros: FiltrosActivos) {
  const { tipo, estado } = filtros;

  const condiciones: string[] = ["a.estado_registro = true"];
  const params: any[] = [];
  let paramIdx = 1;

  if (tipo && tipo !== "TODOS") {
    condiciones.push(`a.tipo_activo = $${paramIdx++}`);
    params.push(tipo.toUpperCase());
  }

  if (estado && estado !== "TODOS") {
    condiciones.push(`a.estado_activo = $${paramIdx++}`);
    params.push(estado.toUpperCase());
  }

  const sql = `
    SELECT 
      a.id_activo,
      a.codigo_patrimonial,
      a.numero_serie,
      a.tipo_activo,
      a.marca,
      a.modelo,
      a.id_departamento,
      dep.nombre AS departamento_nombre,
      a.id_usuario_custodio,
      CONCAT(u.nombres, ' ', u.apellido_paterno) AS custodio_nombre,
      a.estado_activo,
      a.fecha_adquisicion,
      a.fecha_fin_garantia,
      a.costo_compra,
      a.id_modelo,
      m.nombre_modelo,
      m.fabricante AS modelo_fabricante,
      a.atributos,
      a.valor_residual,
      a.vida_util_meses,
      a.fecha_creacion,
      a.motivo_inactivacion,
      a.fecha_inactivacion,
      a.usuario_inactivacion
    FROM activo a
    LEFT JOIN departamento_ti dep ON a.id_departamento = dep.id_departamento
    LEFT JOIN usuario u ON a.id_usuario_custodio = u.id_usuario
    LEFT JOIN modelo_activo m ON a.id_modelo = m.id_modelo
    WHERE ${condiciones.join(" AND ")}
    ORDER BY a.id_activo ASC
  `;

  const rows = await query<any>(sql, params);
  if (idPerfil === 2) {
    rows.forEach((r) => {
      delete r.costo_compra;
      delete r.valor_residual;
    });
  }
  return rows;
}

/**
 * Activos bajo custodia del usuario autenticado (página /activos/mis-activos).
 * No expone datos financieros: es una vista de autoservicio.
 */
export async function listarMisActivos(idUsuario: number) {
  const rows = await query<any>(
    `SELECT
       a.id_activo,
       a.codigo_patrimonial,
       a.numero_serie,
       a.tipo_activo,
       a.marca,
       a.modelo,
       dep.nombre AS departamento_nombre,
       a.estado_activo,
       a.fecha_adquisicion,
       a.fecha_fin_garantia,
       a.atributos,
       m.nombre_modelo,
       m.fabricante AS modelo_fabricante
     FROM activo a
     LEFT JOIN departamento_ti dep ON a.id_departamento = dep.id_departamento
     LEFT JOIN modelo_activo m ON a.id_modelo = m.id_modelo
     WHERE a.estado_registro = true AND a.id_usuario_custodio = $1
     ORDER BY a.id_activo ASC`,
    [idUsuario]
  );
  return rows;
}

export async function crearActivo(sesion: any, body: any) {
  const {
    codigo_patrimonial,
    numero_serie,
    tipo_activo,
    marca,
    modelo,
    id_modelo,
    atributos,
    valor_residual,
    vida_util_meses,
    id_departamento,
    id_usuario_custodio,
    estado_activo,
    fecha_adquisicion,
    fecha_fin_garantia,
    costo_compra,
  } = body;

  if (!codigo_patrimonial || !tipo_activo || !marca || !modelo) {
    throw new ErrorDominio("Código patrimonial, tipo, marca y modelo son obligatorios.");
  }

  const insertSql = `
    INSERT INTO activo (
      codigo_patrimonial,
      numero_serie,
      tipo_activo,
      marca,
      modelo,
      id_modelo,
      atributos,
      valor_residual,
      vida_util_meses,
      id_departamento,
      id_usuario_custodio,
      estado_activo,
      fecha_adquisicion,
      fecha_fin_garantia,
      costo_compra,
      usuario_creacion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING id_activo, codigo_patrimonial
  `;

  let row: { id_activo: number; codigo_patrimonial: string } | null;
  try {
    row = await queryRow<{ id_activo: number; codigo_patrimonial: string }>(insertSql, [
      codigo_patrimonial.trim().toUpperCase(),
      numero_serie?.trim() || null,
      tipo_activo.toUpperCase(),
      marca.trim(),
      modelo.trim(),
      id_modelo ? Number(id_modelo) : null,
      JSON.stringify(atributos || {}),
      valor_residual ? Number(valor_residual) : 0,
      vida_util_meses ? Number(vida_util_meses) : null,
      id_departamento ? Number(id_departamento) : null,
      id_usuario_custodio ? Number(id_usuario_custodio) : null,
      estado_activo || "EN_STOCK",
      fecha_adquisicion || null,
      fecha_fin_garantia || null,
      costo_compra ? Number(costo_compra) : null,
      sesion.id_usuario,
    ]);
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ErrorDominio("Ya existe un activo con ese código patrimonial.");
    }
    throw error;
  }

  if (row?.id_activo) {
    await query(
      `INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario, fecha)
       VALUES ($1, null, $2, null, $3, 'Alta inicial de activo en el sistema', $4, now())`,
      [row.id_activo, estado_activo || "EN_STOCK", id_usuario_custodio ? Number(id_usuario_custodio) : null, sesion.id_usuario]
    );
  }

  return { mensaje: "Activo de hardware registrado exitosamente.", activo: row };
}

export async function actualizarActivo(sesion: any, body: any) {
  const { id_activo } = body;

  if (!id_activo) {
    throw new ErrorDominio("ID de activo requerido");
  }

  const actual = await queryRow<any>("SELECT * FROM activo WHERE id_activo = $1", [id_activo]);
  if (!actual) {
    throw new ErrorDominio("Activo no encontrado", 404);
  }

  let estadoActivo = body.estado_activo !== undefined ? body.estado_activo : actual.estado_activo;
  let motivoInactivacion = actual.motivo_inactivacion;
  let fechaInactivacion = actual.fecha_inactivacion;
  let usuarioInactivacion = actual.usuario_inactivacion;

  if (estadoActivo !== actual.estado_activo) {
    const transicion = await queryRow<{ requiere_motivo: boolean }>(
      "SELECT requiere_motivo FROM transicion_activo WHERE estado_origen = $1 AND estado_destino = $2 AND estado_registro = true",
      [actual.estado_activo, estadoActivo]
    );
    if (!transicion) {
      throw new ErrorDominio(
        `Transición de estado de '${actual.estado_activo}' a '${estadoActivo}' no permitida según la política de ciclo de vida del activo.`
      );
    }
    const motivoTexto = (body.motivo || body.motivo_inactivacion || "").trim();
    if (transicion.requiere_motivo && motivoTexto.length < 5) {
      throw new ErrorDominio(
        `La transición a '${estadoActivo}' requiere una justificación o motivo de al menos 5 caracteres.`
      );
    }
  }

  if (estadoActivo === "BAJA") {
    if (!body.motivo_inactivacion && !body.motivo) {
      throw new ErrorDominio("Debe ingresar una justificación detallada para dar de baja el activo.");
    }
    motivoInactivacion = (body.motivo_inactivacion || body.motivo).trim();
    fechaInactivacion = new Date();
    usuarioInactivacion = sesion.id_usuario;
  } else if (actual.estado_activo === "BAJA" && estadoActivo !== "BAJA") {
    motivoInactivacion = null;
    fechaInactivacion = null;
    usuarioInactivacion = null;
  }

  const codigo_patrimonial = body.codigo_patrimonial !== undefined ? body.codigo_patrimonial.trim().toUpperCase() : actual.codigo_patrimonial;
  const numero_serie = body.numero_serie !== undefined ? (body.numero_serie.trim() || null) : actual.numero_serie;
  const tipo_activo = body.tipo_activo !== undefined ? body.tipo_activo.toUpperCase() : actual.tipo_activo;
  const marca = body.marca !== undefined ? body.marca.trim() : actual.marca;
  const modelo = body.modelo !== undefined ? body.modelo.trim() : actual.modelo;
  const id_modelo = body.id_modelo !== undefined ? (body.id_modelo ? Number(body.id_modelo) : null) : actual.id_modelo;
  const atributos = body.atributos !== undefined ? body.atributos : actual.atributos;
  const valor_residual = body.valor_residual !== undefined ? Number(body.valor_residual) : actual.valor_residual;
  const vida_util_meses = body.vida_util_meses !== undefined ? (body.vida_util_meses ? Number(body.vida_util_meses) : null) : actual.vida_util_meses;
  const id_departamento = body.id_departamento !== undefined ? (body.id_departamento ? Number(body.id_departamento) : null) : actual.id_departamento;
  const id_usuario_custodio = body.id_usuario_custodio !== undefined ? (body.id_usuario_custodio ? Number(body.id_usuario_custodio) : null) : actual.id_usuario_custodio;
  const fecha_adquisicion = body.fecha_adquisicion !== undefined ? (body.fecha_adquisicion || null) : actual.fecha_adquisicion;
  const fecha_fin_garantia = body.fecha_fin_garantia !== undefined ? (body.fecha_fin_garantia || null) : actual.fecha_fin_garantia;
  const costo_compra = body.costo_compra !== undefined ? (body.costo_compra ? Number(body.costo_compra) : null) : actual.costo_compra;

  let actualizado;
  try {
    actualizado = await queryRow(
      `UPDATE activo SET
        codigo_patrimonial = $1,
        numero_serie = $2,
        tipo_activo = $3,
        marca = $4,
        modelo = $5,
        id_modelo = $6,
        atributos = $7,
        valor_residual = $8,
        vida_util_meses = $9,
        id_departamento = $10,
        id_usuario_custodio = $11,
        estado_activo = $12,
        fecha_adquisicion = $13,
        fecha_fin_garantia = $14,
        costo_compra = $15,
        motivo_inactivacion = $16,
        fecha_inactivacion = $17,
        usuario_inactivacion = $18,
        usuario_modificacion = $19,
        fecha_modificacion = now()
      WHERE id_activo = $20
      RETURNING *`,
      [
        codigo_patrimonial,
        numero_serie,
        tipo_activo,
        marca,
        modelo,
        id_modelo,
        JSON.stringify(atributos || {}),
        valor_residual,
        vida_util_meses,
        id_departamento,
        id_usuario_custodio,
        estadoActivo,
        fecha_adquisicion,
        fecha_fin_garantia,
        costo_compra,
        motivoInactivacion,
        fechaInactivacion,
        usuarioInactivacion,
        sesion.id_usuario,
        id_activo,
      ]
    );
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ErrorDominio("Ya existe un activo con ese código patrimonial.");
    }
    throw error;
  }

  if (estadoActivo !== actual.estado_activo || (body.id_usuario_custodio !== undefined && id_usuario_custodio !== actual.id_usuario_custodio)) {
    const motivoHist = (body.motivo || body.motivo_inactivacion || (estadoActivo !== actual.estado_activo ? `Cambio de estado a ${estadoActivo}` : "Reasignación de custodio"));
    await query(
      `INSERT INTO activo_historial (id_activo, estado_anterior, estado_nuevo, custodio_anterior, custodio_nuevo, motivo, id_usuario, fecha)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())`,
      [
        id_activo,
        actual.estado_activo,
        estadoActivo,
        actual.id_usuario_custodio,
        id_usuario_custodio ?? actual.id_usuario_custodio,
        motivoHist,
        sesion.id_usuario,
      ]
    );
  }

  return { mensaje: "Activo actualizado exitosamente.", activo: actualizado };
}
