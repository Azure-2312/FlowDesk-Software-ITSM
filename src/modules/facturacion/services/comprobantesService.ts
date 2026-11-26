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
  TIPO_NUBEFACT,
  consultarComprobante,
  describirError,
  generarComprobante,
  obtenerConfigNubefact,
  enlaceArchivo,
  type RespuestaNubefact,
  type TipoComprobante,
} from "./nubefactCliente";

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
      `SELECT id_proveedor, COALESCE(razon_social, nombre) AS nombre, ruc, (ruc IS NOT NULL) AS habilitado_sunat
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

  const proveedor = await queryRow<{ ruc: string | null }>(
    `SELECT ruc FROM proveedor_ti WHERE id_proveedor = $1 AND estado_registro = true`,
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
  // Las series pertenecen a la cuenta emisora de Nubefact (configuración de la integración).
  const config = await obtenerConfigNubefact();
  const serie = entrada.tipo_documento === "01" ? config.serie_factura || "FFF1" : config.serie_boleta || "BBB1";

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
// Emisión y envío a SUNAT (Nubefact, proveedor autorizado por SUNAT)
// ---------------------------------------------------------------------------

const ESTADO_SUNAT: Record<string, string> = {
  ACEPTADO: "ACEPTADA POR SUNAT",
  REGISTRADO: "PENDIENTE EN SUNAT",
  RECHAZADO: "RECHAZADA POR SUNAT",
  ANULADO: "ANULADA",
};

const dos = (n: number) => String(n).padStart(2, "0");

/** Fecha AAAA-MM-DD (las columnas DATE llegan como Date en hora local). */
function fechaIso(v: unknown): string {
  if (v instanceof Date) return `${v.getFullYear()}-${dos(v.getMonth() + 1)}-${dos(v.getDate())}`;
  return String(v || "").slice(0, 10);
}

function hoyLima(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Lima" });
}

function sumarDias(iso: string, dias: number): string {
  const f = new Date(`${iso}T12:00:00Z`);
  f.setUTCDate(f.getUTCDate() + dias);
  return f.toISOString().slice(0, 10);
}

/** Nubefact exige fechas DD-MM-AAAA. */
const aNubefact = (iso: string) => {
  const [a, m, d] = iso.split("-");
  return `${d}-${m}-${a}`;
};

/** Sin comillas dobles ni saltos (el manual pide evitarlos en textos). */
const texto = (v: unknown, max: number) => String(v ?? "").replace(/["“”]/g, "").replace(/\s+/g, " ").trim().slice(0, max);

function clasificar(r: RespuestaNubefact): "ACEPTADO" | "RECHAZADO" | "REGISTRADO" | "ANULADO" {
  if (r.anulado) return "ANULADO";
  if (r.aceptada_por_sunat) return "ACEPTADO";
  const codigo = Number(r.sunat_responsecode);
  // Códigos SUNAT 2000–3999 = rechazo; sin respuesta = pendiente (p. ej. boletas en resumen diario).
  if (Number.isFinite(codigo) && codigo >= 2000 && codigo < 4000) return "RECHAZADO";
  return "REGISTRADO";
}

function mensajeSunat(r: RespuestaNubefact): string | null {
  return r.sunat_description || r.sunat_soap_error || r.sunat_note || null;
}

/** Arma el JSON de "generar_comprobante" según el manual de Nubefact. */
function armarPayload(c: any, config: Awaited<ReturnType<typeof obtenerConfigNubefact>>, serie: string, numero: number, fecha: string) {
  const items = (c.items as any[]).map((i) => {
    const cantidad = Number(i.cantidad);
    const valor = Number(i.valor_unitario);
    const pIgv = Number(i.porcentaje_igv);
    return {
      unidad_de_medida: i.unidad || "NIU",
      codigo: texto(i.codigo, 30),
      codigo_producto_sunat: "",
      descripcion: texto(i.descripcion, 250),
      cantidad,
      valor_unitario: valor,
      precio_unitario: Math.round(valor * (1 + pIgv / 100) * 1e6) / 1e6,
      descuento: "",
      subtotal: Number(i.subtotal),
      tipo_de_igv: pIgv > 0 ? 1 : 8, // 1 = gravado, 8 = exonerado (operación onerosa)
      igv: Number(i.igv),
      total: Number(i.total),
      anticipo_regularizacion: false,
      anticipo_documento_serie: "",
      anticipo_documento_numero: "",
    };
  });
  const gravada = redondear(items.filter((i) => i.tipo_de_igv === 1).reduce((s, i) => s + i.subtotal, 0));
  const exonerada = redondear(items.filter((i) => i.tipo_de_igv === 8).reduce((s, i) => s + i.subtotal, 0));
  const total = redondear(items.reduce((s, i) => s + i.total, 0));
  const credito = c.forma_pago === "Credito";
  const vencimiento = c.fecha_vencimiento ? fechaIso(c.fecha_vencimiento) : credito ? sumarDias(fecha, 30) : "";

  return {
    tipo_de_comprobante: TIPO_NUBEFACT[c.tipo_documento as TipoComprobante],
    serie,
    numero,
    sunat_transaction: 1,
    cliente_tipo_de_documento: 6,
    cliente_numero_de_documento: config.ruc_institucion,
    cliente_denominacion: texto(config.razon_social_institucion || "INSTITUCION", 100),
    cliente_direccion: texto(config.direccion_institucion || "-", 100),
    cliente_email: "",
    fecha_de_emision: aNubefact(fecha),
    fecha_de_vencimiento: vencimiento ? aNubefact(vencimiento) : "",
    moneda: c.moneda === "USD" ? 2 : 1,
    tipo_de_cambio: "",
    porcentaje_de_igv: 18.0,
    total_gravada: gravada || "",
    total_exonerada: exonerada || "",
    total_igv: redondear(items.reduce((s, i) => s + i.igv, 0)) || "",
    total,
    detraccion: false,
    observaciones: texto(c.observaciones || `FlowDesk ${c.codigo}`, 1000),
    enviar_automaticamente_a_la_sunat: true,
    enviar_automaticamente_al_cliente: false,
    condiciones_de_pago: credito ? "CREDITO" : "CONTADO",
    ...(credito ? { venta_al_credito: [{ cuota: 1, fecha_de_pago: aNubefact(vencimiento), importe: total }] } : {}),
    items,
  };
}

/**
 * Reserva el siguiente número correlativo de la serie (Nubefact exige que el
 * sistema lo envíe). El bloqueo evita que dos emisiones tomen el mismo número.
 */
async function reservarNumero(id: number, tipo: TipoComprobante, serie: string, minimo = 1): Promise<number> {
  return transaccion(async (cliente) => {
    await cliente.query(`SELECT pg_advisory_xact_lock(hashtext($1))`, [`cpe:${tipo}:${serie}`]);
    const r = await cliente.query(
      `SELECT COALESCE(MAX(correlativo::int), 0) + 1 AS n FROM comprobante_proveedor
        WHERE tipo_documento = $1 AND serie = $2 AND correlativo ~ '^[0-9]{1,8}$' AND id_comprobante <> $3`,
      [tipo, serie, id]
    );
    const numero = Math.max(Number(r.rows[0].n), minimo);
    await cliente.query(`UPDATE comprobante_proveedor SET serie = $2, correlativo = $3 WHERE id_comprobante = $1`, [id, serie, String(numero)]);
    return numero;
  });
}

async function guardarRespuesta(
  id: number,
  r: RespuestaNubefact,
  sesion: SesionUsuario,
  estadoAnterior: string,
  accion: string,
  fechaEmision: string | null = null
) {
  const estado = clasificar(r);
  const mensaje = mensajeSunat(r);
  await query(
    `UPDATE comprobante_proveedor
        SET estado = $2, estado_sunat = $3, codigo_respuesta_sunat = $4, mensaje_sunat = $5,
            id_documento_api = COALESCE($6, id_documento_api), fecha_emision = COALESCE($7::date, fecha_emision),
            fecha_envio_sunat = COALESCE(fecha_envio_sunat, now()), usuario_modificacion = $8, fecha_modificacion = now()
      WHERE id_comprobante = $1`,
    [id, estado, ESTADO_SUNAT[estado], r.sunat_responsecode ? String(r.sunat_responsecode).slice(0, 20) : null, mensaje,
     r.numero ?? null, fechaEmision, sesion.id_usuario]
  );
  await registrarEvento(null, id, accion, sesion, estadoAnterior, estado, {
    serie: r.serie, numero: r.numero, aceptada_por_sunat: r.aceptada_por_sunat ?? null, codigo_sunat: r.sunat_responsecode ?? null, mensaje,
  });
  return { estado, mensaje };
}

async function marcarError(id: number, sesion: SesionUsuario, estadoAnterior: string, accion: string, mensaje: string) {
  await query(
    `UPDATE comprobante_proveedor SET estado = 'ERROR', mensaje_sunat = $2, usuario_modificacion = $3, fecha_modificacion = now() WHERE id_comprobante = $1`,
    [id, mensaje.slice(0, 1000), sesion.id_usuario]
  );
  await registrarEvento(null, id, accion, sesion, estadoAnterior, "ERROR", { mensaje });
}

/**
 * Emite el comprobante en Nubefact, que genera el XML firmado y lo envía a SUNAT.
 * Estados: BORRADOR/ERROR → ACEPTADO | REGISTRADO (pendiente en SUNAT) | RECHAZADO, o ERROR.
 */
export async function emitirComprobante(id: number, sesion: SesionUsuario) {
  const c: any = await obtenerComprobante(id, sesion);
  if (!["BORRADOR", "ERROR"].includes(c.estado)) {
    throw new ErrorDominio(
      c.estado === "REGISTRADO"
        ? "El comprobante ya fue enviado y espera respuesta de SUNAT; use Consultar estado."
        : `El comprobante está ${c.estado}; no se puede volver a enviar.`,
      409
    );
  }
  const config = await obtenerConfigNubefact();
  if (!config.habilitado) {
    throw new ErrorDominio("La integración con SUNAT (Nubefact) está deshabilitada. Actívela en Activos → Configuración → Facturación electrónica.", 409);
  }
  if (!config.ruc_institucion) {
    throw new ErrorDominio("Configure el RUC de la institución (cliente de los comprobantes) en Activos → Configuración → Facturación electrónica.", 409);
  }
  const tipo = c.tipo_documento as TipoComprobante;
  const serie = tipo === "01" ? config.serie_factura : config.serie_boleta;
  const estadoAnterior = c.estado as string;
  const tieneNumero = Boolean(c.correlativo) && c.serie === serie;

  try {
    // Reintento tras un error: si Nubefact ya tiene ese número, solo se sincroniza (no se duplica).
    if (tieneNumero) {
      const previo = await consultarComprobante(tipo, serie, Number(c.correlativo), config);
      if (!previo.json.errors) return guardarRespuesta(id, previo.json, sesion, estadoAnterior, "SINCRONIZACION_SUNAT");
    }

    let numero = tieneNumero ? Number(c.correlativo) : await reservarNumero(id, tipo, serie);
    const fecha = hoyLima();
    for (let intento = 0; intento < 3; intento++) {
      const r = await generarComprobante(armarPayload(c, config, serie, numero, fecha));
      if (!r.json.errors) return guardarRespuesta(id, r.json, sesion, estadoAnterior, "EMISION_SUNAT", fecha);
      if (r.json.codigo === 23) {
        // Número ya usado en la cuenta (p. ej. emitido desde el panel de Nubefact): se toma el siguiente.
        numero = await reservarNumero(id, tipo, serie, numero + 1);
        continue;
      }
      const detalle = describirError(r.json);
      await marcarError(id, sesion, estadoAnterior, "EMISION_FALLIDA", detalle);
      throw new ErrorDominio(`Nubefact no emitió el comprobante: ${detalle}`, [10, 11, 50, 51].includes(Number(r.json.codigo)) ? 503 : 422);
    }
    const detalle = "Los números correlativos siguientes ya existen en Nubefact.";
    await marcarError(id, sesion, estadoAnterior, "EMISION_FALLIDA", detalle);
    throw new ErrorDominio(detalle, 409);
  } catch (error) {
    // Falla de red o tiempo agotado: queda en ERROR con su número para reintentar sin duplicar.
    if (error instanceof ErrorDominio && error.estado === 502) {
      await marcarError(id, sesion, estadoAnterior, "ENVIO_FALLIDO", error.message);
    }
    throw error;
  }
}

/** Consulta en Nubefact el estado del comprobante en SUNAT. */
export async function actualizarEstadoSunat(id: number, sesion: SesionUsuario) {
  const c: any = await obtenerComprobante(id, sesion);
  if (!c.correlativo || c.estado === "BORRADOR") throw new ErrorDominio("El comprobante aún no fue emitido.", 409);
  const r = await consultarComprobante(c.tipo_documento, c.serie, Number(c.correlativo));
  if (r.json.errors) {
    const detalle = describirError(r.json);
    await registrarEvento(null, id, "CONSULTA_SUNAT_FALLIDA", sesion, c.estado, c.estado, { mensaje: detalle });
    throw new ErrorDominio(`Nubefact: ${detalle}`, 502);
  }
  return guardarRespuesta(id, r.json, sesion, c.estado, "CONSULTA_SUNAT");
}

/** Descarga el PDF, XML o CDR desde Nubefact (enlaces que devuelve la consulta). */
export async function archivoComprobante(id: number, sesion: SesionUsuario, archivo: "pdf" | "xml" | "cdr") {
  const c: any = await obtenerComprobante(id, sesion); // aplica el alcance del perfil
  if (!c.correlativo || ["BORRADOR", "ERROR"].includes(c.estado)) throw new ErrorDominio("El comprobante aún no fue emitido.", 409);
  const r = await consultarComprobante(c.tipo_documento, c.serie, Number(c.correlativo));
  if (r.json.errors) throw new ErrorDominio(`Nubefact: ${describirError(r.json)}`, 502);
  const url = enlaceArchivo(r.json, archivo);
  if (!url) {
    throw new ErrorDominio(archivo === "cdr" ? "SUNAT aún no devolvió la constancia de recepción (CDR)." : "Nubefact aún no generó el archivo.", 409);
  }
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), 30000);
  try {
    const res = await fetch(url, { cache: "no-store", signal: controlador.signal });
    if (!res.ok) throw new ErrorDominio(`Nubefact no devolvió el archivo (HTTP ${res.status}).`, res.status === 404 ? 404 : 502);
    const contenido = Buffer.from(await res.arrayBuffer());
    const tipoContenido = res.headers.get("content-type") || "application/octet-stream";
    const ext = archivo === "pdf" ? "pdf" : archivo === "xml" ? "xml" : /xml/i.test(tipoContenido) ? "xml" : "zip";
    return { contenido, tipoContenido, nombre: `${archivo === "cdr" ? "R-" : ""}${c.tipo_documento}-${c.serie}-${c.correlativo}.${ext}` };
  } catch (error: any) {
    if (error instanceof ErrorDominio) throw error;
    throw new ErrorDominio("No se pudo descargar el archivo desde Nubefact.", 502);
  } finally {
    clearTimeout(temporizador);
  }
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
  const config = await obtenerConfigNubefact();

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
