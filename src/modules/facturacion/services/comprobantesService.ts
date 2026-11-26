// ============================================================================
// COMPROBANTES ELECTRÓNICOS DE PROVEEDORES — servicio de dominio
// Una sola base de información (comprobante_proveedor) con alcance por perfil:
//   Administrador (1), Gestor de Activos (9), Auditor (6): todos los comprobantes
//   Gestor de Área (5): solo los dirigidos a su departamento
// Acciones: registrar (9/1) · emitir y enviar a SUNAT (9/1) · consultar estado
// (9/1) · conformidad (5 de su área / 1) · descargar archivos (todos con acceso).
// ============================================================================

import type { PoolClient } from "pg";
import { query, queryRow, transaccion } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import type { SesionUsuario } from "@/types";
import {
  consultarDocumentoSunat,
  enviarDocumentoSunat,
  obtenerConfigFactApi,
  registrarDocumento,
  type TipoComprobante,
} from "./factApiCliente";

export const PERFILES_ALCANCE_TOTAL = [1, 6, 9];

export interface ItemComprobanteEntrada {
  id_activo?: number | null;
  codigo: string;
  descripcion: string;
  unidad?: string;
  cantidad: number;
  valor_unitario: number;
  porcentaje_igv?: number;
}

export interface ComprobanteEntrada {
  id_proveedor: number;
  id_recepcion?: number | null;
  id_contrato?: number | null;
  id_departamento_empresa?: number | null;
  tipo_documento: TipoComprobante;
  fecha_emision: string;
  fecha_vencimiento?: string | null;
  moneda?: "PEN" | "USD";
  forma_pago?: "Contado" | "Credito";
  observaciones?: string | null;
  items: ItemComprobanteEntrada[];
}

const redondear = (n: number) => Math.round(n * 100) / 100;

function perfil(sesion: SesionUsuario): number {
  return sesion.perfilActivo?.id_perfil || 0;
}

async function areaDelUsuario(idUsuario: number): Promise<number | null> {
  const fila = await queryRow<{ id_departamento_empresa: number | null }>(
    `SELECT id_departamento_empresa FROM usuario WHERE id_usuario = $1`,
    [idUsuario]
  );
  return fila?.id_departamento_empresa ?? null;
}

/** Filtro SQL de alcance según el perfil activo (misma tabla, distinto alcance) */
async function filtroAlcance(sesion: SesionUsuario, params: any[]): Promise<string> {
  const p = perfil(sesion);
  if (PERFILES_ALCANCE_TOTAL.includes(p)) return "";
  if (p === 5) {
    const area = await areaDelUsuario(sesion.id_usuario);
    if (!area) return "AND false";
    params.push(area);
    return `AND c.id_departamento_empresa = $${params.length}`;
  }
  return "AND false";
}

async function registrarEvento(
  cliente: PoolClient | null,
  idComprobante: number,
  accion: string,
  sesion: SesionUsuario,
  estadoAnterior: string | null,
  estadoNuevo: string | null,
  detalle?: Record<string, unknown>
) {
  const sql = `INSERT INTO comprobante_proveedor_evento
      (id_comprobante, accion, estado_anterior, estado_nuevo, detalle, id_usuario, id_perfil)
    VALUES ($1, $2, $3, $4, $5, $6, $7)`;
  const params = [idComprobante, accion, estadoAnterior, estadoNuevo, detalle ? JSON.stringify(detalle) : null, sesion.id_usuario, perfil(sesion)];
  if (cliente) await cliente.query(sql, params);
  else await query(sql, params);
}

// ---------------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------------

export async function listarComprobantes(
  sesion: SesionUsuario,
  filtros: { estado?: string; conformidad?: string; texto?: string } = {}
) {
  const params: any[] = [];
  const alcance = await filtroAlcance(sesion, params);
  let extra = "";
  if (filtros.estado) { params.push(filtros.estado); extra += ` AND c.estado = $${params.length}`; }
  if (filtros.conformidad) { params.push(filtros.conformidad); extra += ` AND c.conformidad = $${params.length}`; }
  if (filtros.texto) {
    params.push(`%${filtros.texto}%`);
    extra += ` AND (c.codigo ILIKE $${params.length} OR p.nombre ILIKE $${params.length} OR p.ruc ILIKE $${params.length}
               OR (c.serie || '-' || COALESCE(c.correlativo, '')) ILIKE $${params.length})`;
  }
  return query(
    `SELECT c.id_comprobante, c.codigo, c.tipo_documento, c.serie, c.correlativo, c.fecha_emision,
            c.moneda, c.subtotal, c.igv, c.total, c.estado, c.estado_sunat, c.mensaje_sunat,
            c.conformidad, c.fecha_conformidad, c.id_documento_api, c.fecha_creacion,
            p.id_proveedor, COALESCE(p.razon_social, p.nombre) AS proveedor, p.ruc AS proveedor_ruc,
            d.nombre AS area, r.codigo AS recepcion_codigo
       FROM comprobante_proveedor c
       JOIN proveedor_ti p ON p.id_proveedor = c.id_proveedor
       LEFT JOIN departamento_empresa d ON d.id_departamento_empresa = c.id_departamento_empresa
       LEFT JOIN recepcion_activo r ON r.id_recepcion = c.id_recepcion
      WHERE c.estado_registro = true ${alcance} ${extra}
      ORDER BY c.fecha_creacion DESC
      LIMIT 500`,
    params
  );
}

export async function obtenerComprobante(id: number, sesion: SesionUsuario) {
  const params: any[] = [id];
  const alcance = await filtroAlcance(sesion, params);
  const cabecera = await queryRow(
    `SELECT c.*, COALESCE(p.razon_social, p.nombre) AS proveedor, p.ruc AS proveedor_ruc,
            d.nombre AS area, r.codigo AS recepcion_codigo, ct.codigo AS contrato_codigo,
            uc.nombres AS usuario_conformidad_nombre
       FROM comprobante_proveedor c
       JOIN proveedor_ti p ON p.id_proveedor = c.id_proveedor
       LEFT JOIN departamento_empresa d ON d.id_departamento_empresa = c.id_departamento_empresa
       LEFT JOIN recepcion_activo r ON r.id_recepcion = c.id_recepcion
       LEFT JOIN contrato_ti ct ON ct.id_contrato = c.id_contrato
       LEFT JOIN usuario uc ON uc.id_usuario = c.id_usuario_conformidad
      WHERE c.id_comprobante = $1 AND c.estado_registro = true ${alcance}`,
    params
  );
  if (!cabecera) throw new ErrorDominio("Comprobante no encontrado o fuera de su alcance.", 404);
  const [items, eventos] = await Promise.all([
    query(
      `SELECT dt.*, a.codigo_patrimonial
         FROM comprobante_proveedor_detalle dt
         LEFT JOIN activo a ON a.id_activo = dt.id_activo
        WHERE dt.id_comprobante = $1 ORDER BY dt.id_detalle`,
      [id]
    ),
    query(
      `SELECT e.id_evento, e.accion, e.estado_anterior, e.estado_nuevo, e.detalle, e.fecha,
              u.nombres AS usuario, pf.nombre AS perfil
         FROM comprobante_proveedor_evento e
         LEFT JOIN usuario u ON u.id_usuario = e.id_usuario
         LEFT JOIN perfiles pf ON pf.id_perfil = e.id_perfil
        WHERE e.id_comprobante = $1 ORDER BY e.fecha, e.id_evento`,
      [id]
    ),
  ]);
  return { ...cabecera, items, eventos };
}

/** Catálogos para el formulario de registro */
export async function catalogosRegistro() {
  const [proveedores, recepciones, areas, activos, contratos] = await Promise.all([
    query(
      `SELECT id_proveedor, COALESCE(razon_social, nombre) AS nombre, ruc, serie_factura, serie_boleta,
              (ruc IS NOT NULL AND fact_company_id IS NOT NULL AND fact_branch_id IS NOT NULL) AS habilitado_sunat
         FROM proveedor_ti WHERE estado_registro = true ORDER BY 2`
    ),
    query(
      `SELECT id_recepcion, codigo, id_proveedor, documento, fecha_recepcion
         FROM recepcion_activo WHERE estado_registro = true ORDER BY fecha_recepcion DESC LIMIT 200`
    ),
    query(`SELECT id_departamento_empresa, nombre FROM departamento_empresa WHERE estado_registro = true ORDER BY nombre`),
    query(
      `SELECT id_activo, codigo_patrimonial, marca, modelo, tipo_activo
         FROM activo WHERE estado_registro = true ORDER BY codigo_patrimonial LIMIT 1000`
    ),
    query(`SELECT id_contrato, codigo, nombre, id_proveedor FROM contrato_ti WHERE estado_registro = true ORDER BY codigo`),
  ]);
  return { proveedores, recepciones, areas, activos, contratos };
}

// ---------------------------------------------------------------------------
// Registro (BORRADOR)
// ---------------------------------------------------------------------------

export async function registrarComprobante(entrada: ComprobanteEntrada, sesion: SesionUsuario) {
  if (!entrada.id_proveedor) throw new ErrorDominio("Seleccione el proveedor.");
  if (!["01", "03"].includes(entrada.tipo_documento)) throw new ErrorDominio("Tipo de comprobante no válido (01 factura, 03 boleta).");
  if (!entrada.fecha_emision) throw new ErrorDominio("Indique la fecha de emisión.");
  if (entrada.fecha_vencimiento && entrada.fecha_vencimiento < entrada.fecha_emision) {
    throw new ErrorDominio("La fecha de vencimiento no puede ser anterior a la de emisión.");
  }
  const items = (entrada.items || []).filter((i) => i && String(i.descripcion || "").trim());
  if (items.length === 0) throw new ErrorDominio("Agregue al menos un ítem.");
  for (const [n, i] of items.entries()) {
    if (!(Number(i.cantidad) > 0)) throw new ErrorDominio(`Ítem ${n + 1}: la cantidad debe ser mayor a 0.`);
    if (!(Number(i.valor_unitario) >= 0)) throw new ErrorDominio(`Ítem ${n + 1}: el valor unitario no es válido.`);
  }

  const proveedor = await queryRow<{ serie_factura: string; serie_boleta: string; ruc: string | null }>(
    `SELECT serie_factura, serie_boleta, ruc FROM proveedor_ti WHERE id_proveedor = $1 AND estado_registro = true`,
    [entrada.id_proveedor]
  );
  if (!proveedor) throw new ErrorDominio("Proveedor no encontrado.", 404);
  if (entrada.tipo_documento === "01" && !proveedor.ruc) {
    throw new ErrorDominio("El proveedor no tiene RUC registrado; regístrelo en la configuración de facturación electrónica.");
  }

  const calculados = items.map((i) => {
    const cantidad = Number(i.cantidad);
    const valor = Number(i.valor_unitario);
    const pIgv = i.porcentaje_igv == null ? 18 : Number(i.porcentaje_igv);
    const subtotal = redondear(cantidad * valor);
    const igv = redondear((subtotal * pIgv) / 100);
    return { ...i, cantidad, valor_unitario: valor, porcentaje_igv: pIgv, unidad: (i.unidad || "NIU").toUpperCase().slice(0, 3), subtotal, igv, total: redondear(subtotal + igv) };
  });
  const subtotal = redondear(calculados.reduce((s, i) => s + i.subtotal, 0));
  const igv = redondear(calculados.reduce((s, i) => s + i.igv, 0));
  const serie = entrada.tipo_documento === "01" ? proveedor.serie_factura || "F001" : proveedor.serie_boleta || "B001";

  return transaccion(async (cliente) => {
    const anio = new Date().getFullYear();
    const sec = await cliente.query(
      `SELECT COUNT(*)::int + 1 AS n FROM comprobante_proveedor WHERE codigo LIKE $1`,
      [`CPE-${anio}-%`]
    );
    const codigo = `CPE-${anio}-${String(sec.rows[0].n).padStart(4, "0")}`;
    const ins = await cliente.query(
      `INSERT INTO comprobante_proveedor
         (codigo, id_proveedor, id_recepcion, id_contrato, id_departamento_empresa, tipo_documento, serie,
          fecha_emision, fecha_vencimiento, moneda, forma_pago, subtotal, igv, total, observaciones, usuario_creacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING id_comprobante, codigo`,
      [
        codigo, entrada.id_proveedor, entrada.id_recepcion || null, entrada.id_contrato || null,
        entrada.id_departamento_empresa || null, entrada.tipo_documento, serie, entrada.fecha_emision,
        entrada.fecha_vencimiento || null, entrada.moneda || "PEN", entrada.forma_pago || "Contado",
        subtotal, igv, redondear(subtotal + igv), entrada.observaciones || null, sesion.id_usuario,
      ]
    );
    const id = ins.rows[0].id_comprobante as number;
    for (const i of calculados) {
      await cliente.query(
        `INSERT INTO comprobante_proveedor_detalle
           (id_comprobante, id_activo, codigo, descripcion, unidad, cantidad, valor_unitario, porcentaje_igv, subtotal, igv, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [id, i.id_activo || null, String(i.codigo || "ITEM").slice(0, 50), String(i.descripcion).slice(0, 500), i.unidad,
         i.cantidad, i.valor_unitario, i.porcentaje_igv, i.subtotal, i.igv, i.total]
      );
    }
    await registrarEvento(cliente, id, "REGISTRO", sesion, null, "BORRADOR", { total: redondear(subtotal + igv), items: calculados.length });
    return ins.rows[0];
  });
}

export async function anularBorrador(id: number, sesion: SesionUsuario) {
  const c = await obtenerComprobante(id, sesion);
  if (c.estado !== "BORRADOR") throw new ErrorDominio("Solo se anulan comprobantes en borrador (aún no enviados a SUNAT).", 409);
  await query(`UPDATE comprobante_proveedor SET estado = 'ANULADO', usuario_modificacion = $2, fecha_modificacion = now() WHERE id_comprobante = $1`, [id, sesion.id_usuario]);
  await registrarEvento(null, id, "ANULACION", sesion, "BORRADOR", "ANULADO");
}

// ---------------------------------------------------------------------------
// Emisión y envío a SUNAT (fact_api)
// ---------------------------------------------------------------------------

function extraerCorrelativo(data: any): string | null {
  if (!data) return null;
  const v = data.correlativo ?? data.numero ?? data.number ?? null;
  return v == null ? null : String(v);
}

function clasificarEstadoSunat(estado: string | null | undefined, ok: boolean): "ACEPTADO" | "RECHAZADO" | "REGISTRADO" {
  const e = String(estado || "").toUpperCase();
  if (e.includes("RECHAZ") || e.includes("ANUL")) return "RECHAZADO";
  if (e.includes("ACEPT")) return "ACEPTADO";
  return ok ? "ACEPTADO" : "REGISTRADO";
}

/**
 * Registra el comprobante en fact_api (si aún no existe allí) y lo envía a SUNAT.
 * Estados: BORRADOR/ERROR → REGISTRADO → ACEPTADO | RECHAZADO (o ERROR si falla la red).
 */
export async function emitirComprobante(id: number, sesion: SesionUsuario) {
  const c: any = await obtenerComprobante(id, sesion);
  if (!["BORRADOR", "REGISTRADO", "ERROR"].includes(c.estado)) {
    throw new ErrorDominio(`El comprobante está ${c.estado}; no se puede volver a enviar.`, 409);
  }
  const config = await obtenerConfigFactApi();
  if (!config.ruc_institucion) {
    throw new ErrorDominio("Configure el RUC de la institución (cliente de los comprobantes) en Activos → Configuración → Facturación electrónica.", 409);
  }
  const prov = await queryRow<{ fact_company_id: number | null; fact_branch_id: number | null }>(
    `SELECT fact_company_id, fact_branch_id FROM proveedor_ti WHERE id_proveedor = $1`,
    [c.id_proveedor]
  );
  if (!prov?.fact_company_id || !prov?.fact_branch_id) {
    throw new ErrorDominio("El proveedor no está vinculado a una empresa y sucursal de fact_api.", 409);
  }

  let idDocumento: number | null = c.id_documento_api;
  let estado = c.estado as string;
  const tipo = c.tipo_documento as TipoComprobante;

  try {
    // 1) Registrar en fact_api (POST /api/v1/invoices | /boletas)
    if (!idDocumento) {
      const payload = {
        company_id: prov.fact_company_id,
        branch_id: prov.fact_branch_id,
        serie: c.serie,
        fecha_emision: String(c.fecha_emision).slice(0, 10),
        ...(c.fecha_vencimiento ? { fecha_vencimiento: String(c.fecha_vencimiento).slice(0, 10) } : {}),
        moneda: c.moneda,
        tipo_operacion: "0101",
        forma_pago_tipo: c.forma_pago,
        client: {
          tipo_documento: "6",
          numero_documento: config.ruc_institucion,
          razon_social: config.razon_social_institucion || "INSTITUCIÓN",
          ...(config.direccion_institucion ? { direccion: config.direccion_institucion } : {}),
        },
        detalles: c.items.map((i: any) => ({
          codigo: i.codigo,
          descripcion: i.descripcion,
          unidad: i.unidad,
          cantidad: Number(i.cantidad),
          mto_valor_unitario: Number(i.valor_unitario),
          porcentaje_igv: Number(i.porcentaje_igv),
          tip_afe_igv: i.tip_afe_igv || "10",
        })),
        ...(tipo === "03" ? { metodo_envio: "individual" } : {}),
        usuario_creacion: `flowdesk:${sesion.id_usuario}`,
      };
      const reg = await registrarDocumento(tipo, payload);
      if (!reg.ok || !reg.json.data?.id) {
        const msg = reg.json.message || reg.json.error || `HTTP ${reg.status}`;
        await query(
          `UPDATE comprobante_proveedor SET estado = 'ERROR', mensaje_sunat = $2, usuario_modificacion = $3, fecha_modificacion = now() WHERE id_comprobante = $1`,
          [id, `Registro en fact_api: ${msg}`, sesion.id_usuario]
        );
        await registrarEvento(null, id, "REGISTRO_API_FALLIDO", sesion, estado, "ERROR", { status: reg.status, mensaje: msg });
        throw new ErrorDominio(`fact_api no registró el comprobante: ${msg}`, 502);
      }
      idDocumento = Number(reg.json.data.id);
      const correlativo = extraerCorrelativo(reg.json.data);
      await query(
        `UPDATE comprobante_proveedor SET estado = 'REGISTRADO', id_documento_api = $2, correlativo = COALESCE($3, correlativo),
                estado_sunat = $4, mensaje_sunat = NULL, usuario_modificacion = $5, fecha_modificacion = now()
          WHERE id_comprobante = $1`,
        [id, idDocumento, correlativo, reg.json.data.estado_sunat || "PENDIENTE", sesion.id_usuario]
      );
      await registrarEvento(null, id, "REGISTRO_API", sesion, estado, "REGISTRADO", { id_documento_api: idDocumento, correlativo });
      estado = "REGISTRADO";
    }

    // 2) Enviar a SUNAT (POST .../send-sunat)
    const env = await enviarDocumentoSunat(tipo, idDocumento!);
    const data: any = env.json.data || {};
    const nuevo = env.ok ? clasificarEstadoSunat(data.estado_sunat, true) : env.status === 400 && env.json.data ? "RECHAZADO" : "ERROR";
    const yaAceptado = !env.ok && /ya fue enviada y aceptada/i.test(env.json.message || "");
    const estadoFinal = yaAceptado ? "ACEPTADO" : nuevo;
    await query(
      `UPDATE comprobante_proveedor
          SET estado = $2, estado_sunat = COALESCE($3, estado_sunat), codigo_respuesta_sunat = $4, mensaje_sunat = $5,
              correlativo = COALESCE($6, correlativo), fecha_envio_sunat = now(),
              usuario_modificacion = $7, fecha_modificacion = now()
        WHERE id_comprobante = $1`,
      [id, estadoFinal, data.estado_sunat || (estadoFinal === "ACEPTADO" ? "ACEPTADO" : null), env.json.error_code || data.codigo_respuesta || null,
       env.json.message || null, extraerCorrelativo(data), sesion.id_usuario]
    );
    await registrarEvento(null, id, "ENVIO_SUNAT", sesion, estado, estadoFinal, { status: env.status, mensaje: env.json.message, error_code: env.json.error_code });
    return { estado: estadoFinal, mensaje: env.json.message || null };
  } catch (error) {
    if (error instanceof ErrorDominio && error.estado !== 502) throw error;
    if (!(error instanceof ErrorDominio)) throw error;
    // Falla de red/servicio después de registrar: queda en ERROR para reintentar
    const actual = await queryRow<{ estado: string }>(`SELECT estado FROM comprobante_proveedor WHERE id_comprobante = $1`, [id]);
    if (actual && actual.estado !== "ERROR") {
      await query(`UPDATE comprobante_proveedor SET estado = 'ERROR', mensaje_sunat = $2, fecha_modificacion = now() WHERE id_comprobante = $1`, [id, error.message]);
      await registrarEvento(null, id, "ENVIO_FALLIDO", sesion, actual.estado, "ERROR", { mensaje: error.message });
    }
    throw error;
  }
}

/** Consulta de validez del comprobante en SUNAT (consulta-cpe) */
export async function actualizarEstadoSunat(id: number, sesion: SesionUsuario) {
  const c: any = await obtenerComprobante(id, sesion);
  if (!c.id_documento_api) throw new ErrorDominio("El comprobante aún no fue registrado en fact_api.", 409);
  const r = await consultarDocumentoSunat(c.tipo_documento, c.id_documento_api);
  const data: any = r.json.data || {};
  const estadoSunat = data.estado_sunat || data.estado || data.estadoCp || null;
  const nuevo = r.ok && estadoSunat ? clasificarEstadoSunat(estadoSunat, false) : c.estado;
  await query(
    `UPDATE comprobante_proveedor SET estado = $2, estado_sunat = COALESCE($3, estado_sunat), mensaje_sunat = COALESCE($4, mensaje_sunat),
            fecha_modificacion = now() WHERE id_comprobante = $1`,
    [id, nuevo === "REGISTRADO" ? c.estado : nuevo, estadoSunat, r.json.message || null]
  );
  await registrarEvento(null, id, "CONSULTA_SUNAT", sesion, c.estado, nuevo === "REGISTRADO" ? c.estado : nuevo, { status: r.status, estado_sunat: estadoSunat, mensaje: r.json.message });
  if (!r.ok) throw new ErrorDominio(`SUNAT/fact_api: ${r.json.message || `HTTP ${r.status}`}`, 502);
  return { estado_sunat: estadoSunat, mensaje: r.json.message || null };
}

// ---------------------------------------------------------------------------
// Conformidad del área usuaria
// ---------------------------------------------------------------------------

export async function registrarConformidad(
  id: number,
  decision: "CONFORME" | "OBSERVADO",
  observacion: string | null,
  sesion: SesionUsuario
) {
  if (!["CONFORME", "OBSERVADO"].includes(decision)) throw new ErrorDominio("Decisión no válida.");
  if (decision === "OBSERVADO" && !String(observacion || "").trim()) {
    throw new ErrorDominio("Indique el motivo de la observación.");
  }
  const c: any = await obtenerComprobante(id, sesion); // aplica alcance del área
  if (c.estado !== "ACEPTADO") throw new ErrorDominio("Solo se da conformidad a comprobantes aceptados por SUNAT.", 409);
  if (c.conformidad === "CONFORME") throw new ErrorDominio("El comprobante ya tiene conformidad.", 409);
  const config = await obtenerConfigFactApi();

  await transaccion(async (cliente) => {
    await cliente.query(
      `UPDATE comprobante_proveedor
          SET conformidad = $2, observacion_conformidad = $3, id_usuario_conformidad = $4, fecha_conformidad = now(),
              usuario_modificacion = $4, fecha_modificacion = now()
        WHERE id_comprobante = $1`,
      [id, decision, observacion || null, sesion.id_usuario]
    );
    let activosActualizados = 0;
    if (decision === "CONFORME" && config.exigir_conformidad_para_costo) {
      // Costo de adquisición de cada activo = valor unitario con IGV del comprobante
      const r = await cliente.query(
        `UPDATE activo a
            SET costo_compra = ROUND(d.valor_unitario * (1 + d.porcentaje_igv / 100), 2),
                fecha_adquisicion = COALESCE(a.fecha_adquisicion, $2::date),
                usuario_modificacion = $3, fecha_modificacion = now()
           FROM comprobante_proveedor_detalle d
          WHERE d.id_comprobante = $1 AND d.id_activo = a.id_activo`,
        [id, c.fecha_emision, sesion.id_usuario]
      );
      activosActualizados = r.rowCount || 0;
    }
    await registrarEvento(cliente, id, "CONFORMIDAD", sesion, c.conformidad, decision, { observacion, activos_actualizados: activosActualizados });
  });
}
