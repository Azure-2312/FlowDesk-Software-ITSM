// ============================================================================
// CLIENTE HTTP DE NUBEFACT (proveedor autorizado por SUNAT, API JSON v1)
// Manual oficial: "NUBEFACT DOC API JSON V1" (www.nubefact.com/integracion).
//
// · Todas las operaciones son POST a la RUTA única de la cuenta, con
//   "Authorization: Token token=<TOKEN>" y "Content-Type: application/json".
// · Operaciones usadas: generar_comprobante, consultar_comprobante.
// · El TOKEN es secreto: solo vive en la variable de entorno NUBEFACT_TOKEN.
//   La RUTA, las series y los datos de la institución se guardan en
//   configuracion_sistema (clave `integracion_nubefact`), editables por el
//   Administrador en Activos → Configuración → Facturación electrónica.
// ============================================================================

import { queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export type TipoComprobante = "01" | "03";
export const CLAVE_CONFIG_NUBEFACT = "integracion_nubefact";

export interface ConfigNubefact {
  habilitado: boolean;
  ruta: string;
  serie_factura: string;
  serie_boleta: string;
  ruc_institucion: string;
  razon_social_institucion: string;
  direccion_institucion: string;
  tiempo_espera_ms: number;
  exigir_conformidad_para_costo: boolean;
}

export const CONFIG_POR_DEFECTO: ConfigNubefact = {
  habilitado: false,
  ruta: "",
  serie_factura: "FFF1",
  serie_boleta: "BBB1",
  ruc_institucion: "",
  razon_social_institucion: "",
  direccion_institucion: "",
  tiempo_espera_ms: 30000,
  exigir_conformidad_para_costo: true,
};

/** Respuesta de Nubefact para generar/consultar comprobantes (o error {errors, codigo}). */
export interface RespuestaNubefact {
  tipo_de_comprobante?: number;
  serie?: string;
  numero?: number;
  enlace?: string;
  enlace_del_pdf?: string;
  enlace_del_xml?: string;
  enlace_del_cdr?: string;
  aceptada_por_sunat?: boolean;
  sunat_description?: string | null;
  sunat_note?: string | null;
  sunat_responsecode?: string | null;
  sunat_soap_error?: string | null;
  anulado?: boolean;
  codigo_hash?: string | null;
  errors?: string;
  codigo?: number;
}

/** Códigos de error documentados en el manual (sección "Manejo de errores"). */
export const ERRORES_NUBEFACT: Record<number, string> = {
  10: "Token incorrecto o eliminado",
  11: "La ruta no es correcta o no existe",
  12: "Cabecera Content-Type incorrecta",
  20: "El JSON no cumple con el formato establecido",
  21: "No se pudo completar la operación",
  22: "Documento enviado fuera del plazo permitido",
  23: "Este documento ya existe en Nubefact",
  24: "El documento no existe o no fue enviado a Nubefact",
  40: "Error interno de Nubefact",
  50: "La cuenta de Nubefact está suspendida",
  51: "La cuenta de Nubefact está suspendida por falta de pago",
};

export const TIPO_NUBEFACT: Record<TipoComprobante, number> = { "01": 1, "03": 2 };

export async function obtenerConfigNubefact(): Promise<ConfigNubefact> {
  const fila = await queryRow<{ valor: any }>(`SELECT valor FROM configuracion_sistema WHERE clave = $1`, [CLAVE_CONFIG_NUBEFACT]);
  const valor = typeof fila?.valor === "string" ? JSON.parse(fila.valor) : fila?.valor;
  return { ...CONFIG_POR_DEFECTO, ...(valor || {}) };
}

function token(): string {
  return (process.env.NUBEFACT_TOKEN || "").trim();
}

export function tokenConfigurado(): boolean {
  return token().length >= 20;
}

/** Solo rutas HTTPS de Nubefact (cuenta propia o reseller *.pse.pe): evita enviar el token a otro servidor. */
export function rutaValida(ruta: string): boolean {
  try {
    const u = new URL(ruta);
    const hostOk = u.hostname === "api.nubefact.com" || u.hostname.endsWith(".nubefact.com") || u.hostname.endsWith(".pse.pe");
    return u.protocol === "https:" && hostOk && /^\/api\/v1\/[A-Za-z0-9-]{8,}\/?$/.test(u.pathname) && !u.search && !u.username;
  } catch {
    return false;
  }
}

export function describirError(r: RespuestaNubefact): string {
  const base = r.codigo && ERRORES_NUBEFACT[r.codigo] ? ERRORES_NUBEFACT[r.codigo] : "Error de Nubefact";
  return r.errors && r.errors !== base ? `${base}: ${r.errors}` : base;
}

/** POST a la RUTA de la cuenta. Devuelve el estado HTTP y el JSON (éxito o {errors, codigo}). */
async function enviar(cuerpo: Record<string, unknown>, configDada?: ConfigNubefact): Promise<{ status: number; json: RespuestaNubefact }> {
  const config = configDada || (await obtenerConfigNubefact());
  if (!tokenConfigurado()) {
    throw new ErrorDominio("Falta el token de Nubefact: defina NUBEFACT_TOKEN en las variables de entorno del servidor.", 503);
  }
  if (!rutaValida(config.ruta)) {
    throw new ErrorDominio("La ruta de Nubefact no es válida. Regístrela en Activos → Configuración → Facturación electrónica.", 409);
  }
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), config.tiempo_espera_ms || 30000);
  let res: Response;
  try {
    res = await fetch(config.ruta, {
      method: "POST",
      headers: {
        Authorization: `Token token="${token()}"`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(cuerpo),
      signal: controlador.signal,
      cache: "no-store",
    });
  } catch (error: any) {
    const motivo = error?.name === "AbortError" ? "tiempo de espera agotado" : "no se pudo conectar";
    throw new ErrorDominio(`Nubefact: ${motivo}.`, 502);
  } finally {
    clearTimeout(temporizador);
  }
  let json: RespuestaNubefact;
  try {
    json = (await res.json()) as RespuestaNubefact;
  } catch {
    json = { errors: `Respuesta no válida (HTTP ${res.status})`, codigo: 40 };
  }
  return { status: res.status, json };
}

// ---------------------------------------------------------------------------
// Operaciones
// ---------------------------------------------------------------------------

/** Operación 1: generar_comprobante (Nubefact arma el XML, lo firma y lo envía a SUNAT). */
export async function generarComprobante(payload: Record<string, unknown>) {
  return enviar({ operacion: "generar_comprobante", ...payload });
}

/** Operación 2: consultar_comprobante (estado en SUNAT y enlaces a PDF/XML/CDR). */
export async function consultarComprobante(tipo: TipoComprobante, serie: string, numero: number, configDada?: ConfigNubefact) {
  return enviar({ operacion: "consultar_comprobante", tipo_de_comprobante: TIPO_NUBEFACT[tipo], serie, numero }, configDada);
}

/**
 * Prueba de conexión sin emitir nada: consulta un número que no existe.
 * Nubefact responde 24 ("no existe") si la ruta y el token son correctos.
 */
export async function probarConexion(configDada?: ConfigNubefact) {
  const config = configDada || (await obtenerConfigNubefact());
  const pasos: { paso: string; ok: boolean; detalle: string }[] = [];
  pasos.push({ paso: "Token en el servidor", ok: tokenConfigurado(), detalle: tokenConfigurado() ? "NUBEFACT_TOKEN definido" : "Falta NUBEFACT_TOKEN" });
  pasos.push({ paso: "Ruta de la cuenta", ok: rutaValida(config.ruta), detalle: rutaValida(config.ruta) ? "Formato correcto" : "Ruta vacía o no válida" });
  if (!pasos.every((p) => p.ok)) return { ok: false, pasos };
  try {
    const r = await consultarComprobante("01", config.serie_factura || "FFF1", 99999999, config);
    const autenticado = r.json.codigo === 24 || (!r.json.errors && r.status === 200);
    pasos.push({
      paso: "Autenticación en Nubefact",
      ok: autenticado,
      detalle: autenticado ? "Ruta y token aceptados" : describirError(r.json),
    });
  } catch (e: any) {
    pasos.push({ paso: "Autenticación en Nubefact", ok: false, detalle: e.message });
  }
  return { ok: pasos.every((p) => p.ok), pasos };
}

/** Enlace de descarga del archivo (si Nubefact no lo envía, se usa enlace + extensión, según el manual). */
export function enlaceArchivo(r: RespuestaNubefact, archivo: "pdf" | "xml" | "cdr"): string | null {
  const directo = archivo === "pdf" ? r.enlace_del_pdf : archivo === "xml" ? r.enlace_del_xml : r.enlace_del_cdr;
  const url = directo || (r.enlace ? `${r.enlace}.${archivo}` : "");
  try {
    const u = new URL(url);
    return u.protocol === "https:" && (u.hostname.endsWith("nubefact.com") || u.hostname.endsWith(".pse.pe")) ? u.toString() : null;
  } catch {
    return null;
  }
}
