import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarTexto } from "@/shared/lib/validaciones";

/**
 * Contratos y cobertura, más renovaciones y vencimientos, para el Gestor de
 * Activos y Configuración.
 */

export async function listarContratos() {
  const [contratos, proveedores] = await Promise.all([
    query(
      `SELECT c.id_contrato, c.codigo, c.nombre, c.tipo, c.descripcion, c.fecha_inicio, c.fecha_fin,
              c.monto, c.moneda, c.cobertura, c.renovacion_automatica, c.dias_aviso, c.estado,
              p.nombre AS proveedor_nombre,
              (c.fecha_fin - CURRENT_DATE) AS dias_para_vencer
       FROM contrato_ti c
       LEFT JOIN proveedor_ti p ON p.id_proveedor = c.id_proveedor
       WHERE c.estado_registro = true
       ORDER BY c.fecha_fin ASC NULLS LAST`
    ),
    query(`SELECT id_proveedor, nombre FROM proveedor_ti WHERE estado_registro = true ORDER BY nombre`),
  ]);
  return { contratos, proveedores };
}

export async function crearContrato(idUsuario: number, body: any) {
  const vCodigo = validarTexto(body.codigo, 3, 40, "El código del contrato", true);
  if (!vCodigo.valido) throw new ErrorDominio(vCodigo.mensaje!);
  const vNombre = validarTexto(body.nombre, 3, 200, "El nombre del contrato", true);
  if (!vNombre.valido) throw new ErrorDominio(vNombre.mensaje!);

  const codigo = String(body.codigo).trim().toUpperCase();
  const existe = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM contrato_ti WHERE codigo = $1) AS existe`,
    [codigo]
  );
  if (existe?.existe) throw new ErrorDominio("Ya existe un contrato con ese código.", 409);

  const fila = await queryRow<any>(
    `INSERT INTO contrato_ti (codigo, nombre, id_proveedor, tipo, descripcion, fecha_inicio, fecha_fin,
                              monto, moneda, cobertura, renovacion_automatica, dias_aviso, usuario_creacion)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id_contrato, codigo, nombre, estado`,
    [
      codigo, String(body.nombre).trim(),
      body.id_proveedor ? Number(body.id_proveedor) : null,
      body.tipo ?? null, body.descripcion ?? null,
      body.fecha_inicio ?? null, body.fecha_fin ?? null,
      body.monto !== undefined && body.monto !== "" ? Number(body.monto) : null,
      body.moneda ?? "PEN", body.cobertura ?? null,
      Boolean(body.renovacion_automatica),
      body.dias_aviso !== undefined && body.dias_aviso !== "" ? Number(body.dias_aviso) : 30,
      idUsuario,
    ]
  );
  return { mensaje: "Contrato registrado.", contrato: fila };
}

export async function actualizarContrato(idUsuario: number, body: any) {
  const idContrato = Number(body.id_contrato);
  if (!idContrato) throw new ErrorDominio("Falta el identificador del contrato.");
  const estado = body.estado ? String(body.estado).toUpperCase() : null;
  if (estado && !["VIGENTE", "POR_VENCER", "VENCIDO", "RENOVADO", "CANCELADO"].includes(estado)) {
    throw new ErrorDominio("Estado de contrato no válido.");
  }

  const fila = await queryRow<any>(
    `UPDATE contrato_ti
     SET estado = COALESCE($1, estado),
         cobertura = COALESCE($2, cobertura),
         monto = COALESCE($3, monto),
         fecha_fin = COALESCE($4, fecha_fin),
         renovacion_automatica = COALESCE($5, renovacion_automatica),
         dias_aviso = COALESCE($6, dias_aviso)
     WHERE id_contrato = $7 AND estado_registro = true
     RETURNING id_contrato, codigo, estado`,
    [
      estado, body.cobertura ?? null,
      body.monto !== undefined && body.monto !== "" ? Number(body.monto) : null,
      body.fecha_fin ?? null,
      body.renovacion_automatica === undefined ? null : Boolean(body.renovacion_automatica),
      body.dias_aviso !== undefined && body.dias_aviso !== "" ? Number(body.dias_aviso) : null,
      idContrato,
    ]
  );
  if (!fila) throw new ErrorDominio("El contrato no existe.", 404);
  return { mensaje: "Contrato actualizado.", contrato: fila };
}

export async function listarRenovaciones() {
  const [porVencer, renovaciones, contratos] = await Promise.all([
    query(
      `SELECT c.id_contrato, c.codigo, c.nombre, c.fecha_fin, c.monto, c.moneda, c.renovacion_automatica,
              c.dias_aviso, p.nombre AS proveedor_nombre,
              (c.fecha_fin - CURRENT_DATE) AS dias_para_vencer
       FROM contrato_ti c
       LEFT JOIN proveedor_ti p ON p.id_proveedor = c.id_proveedor
       WHERE c.estado_registro = true AND c.fecha_fin IS NOT NULL
         AND c.fecha_fin <= CURRENT_DATE + (c.dias_aviso || ' days')::interval
       ORDER BY c.fecha_fin ASC`
    ),
    query(
      `SELECT r.id_renovacion, r.fecha_solicitud, r.monto_propuesto, r.estado, r.comentario,
              c.codigo AS contrato_codigo, c.nombre AS contrato_nombre,
              CONCAT(u.nombres, ' ', u.apellido_paterno) AS solicita_nombre
       FROM renovacion_contrato r
       JOIN contrato_ti c ON c.id_contrato = r.id_contrato
       LEFT JOIN usuario u ON u.id_usuario = r.id_usuario_solicita
       WHERE r.estado_registro = true
       ORDER BY r.fecha_solicitud DESC`
    ),
    query(`SELECT id_contrato, codigo, nombre FROM contrato_ti WHERE estado_registro = true ORDER BY nombre`),
  ]);
  return { porVencer, renovaciones, contratos };
}

export async function crearRenovacion(idUsuario: number, body: any) {
  const idContrato = Number(body.id_contrato);
  if (!idContrato) throw new ErrorDominio("Debes indicar el contrato a renovar.");
  const contrato = await queryRow<{ id_contrato: number }>(
    `SELECT id_contrato FROM contrato_ti WHERE id_contrato = $1 AND estado_registro = true`,
    [idContrato]
  );
  if (!contrato) throw new ErrorDominio("El contrato no existe.", 404);

  const fila = await queryRow<any>(
    `INSERT INTO renovacion_contrato (id_contrato, monto_propuesto, estado, id_usuario_solicita, comentario)
     VALUES ($1, $2, 'SOLICITADA', $3, $4)
     RETURNING id_renovacion, estado, fecha_solicitud`,
    [
      idContrato,
      body.monto_propuesto !== undefined && body.monto_propuesto !== "" ? Number(body.monto_propuesto) : null,
      idUsuario,
      body.comentario ?? null,
    ]
  );
  return { mensaje: "Solicitud de renovación registrada.", renovacion: fila };
}

export async function resolverRenovacion(idUsuario: number, body: any) {
  const idRenovacion = Number(body.id_renovacion);
  if (!idRenovacion) throw new ErrorDominio("Falta el identificador de la renovación.");
  const estado = String(body.estado || "").toUpperCase();
  if (!["APROBADA", "RECHAZADA", "EJECUTADA"].includes(estado)) {
    throw new ErrorDominio("Estado de renovación no válido.");
  }

  const fila = await queryRow<any>(
    `UPDATE renovacion_contrato SET estado = $1, comentario = COALESCE($2, comentario)
     WHERE id_renovacion = $3 AND estado_registro = true
     RETURNING id_renovacion, id_contrato, estado`,
    [estado, body.comentario ?? null, idRenovacion]
  );
  if (!fila) throw new ErrorDominio("La renovación no existe.", 404);

  if (estado === "EJECUTADA") {
    await query(
      `UPDATE contrato_ti SET estado = 'RENOVADO', fecha_modificacion = now() WHERE id_contrato = $1`,
      [fila.id_contrato]
    );
  }
  return { mensaje: "Renovación actualizada.", renovacion: fila };
}
