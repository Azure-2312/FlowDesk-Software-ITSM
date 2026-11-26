// ============================================================================
// CLIENTE HTTP DE fact_api (facturación electrónica SUNAT)
// https://github.com/angelitosystems/fact_api — Laravel + Greenter, autenticación
// Laravel Sanctum (Authorization: Bearer <token>). Todas las rutas bajo /api.
//
// Credenciales: nunca en la base de datos. Se leen de variables de entorno:
//   FACT_API_TOKEN            token Sanctum ya emitido (opcional), o
//   FACT_API_EMAIL / FACT_API_PASSWORD  usuario de fact_api para POST /api/auth/login
// La URL base y los datos de la institución viven en configuracion_sistema
// (clave `integracion_fact_api`), editables por el Administrador.
// ============================================================================

import { queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

export type TipoComprobante = "01" | "03";

export interface ConfigFactApi {
  habilitado: boolean;
  url_base: string;
  ruc_institucion: string;
  razon_social_institucion: string;
  direccion_institucion: string;
  tiempo_espera_ms: number;
  exigir_conformidad_para_costo: boolean;
}

export const CONFIG_POR_DEFECTO: ConfigFactApi = {
  habilitado: false,
  url_base: "http://localhost:8000",
  ruc_institucion: "",
  razon_social_institucion: "",
  direccion_institucion: "",
  tiempo_espera_ms: 20000,
  exigir_conformidad_para_costo: true,
};

/** Respuesta estándar de fact_api: { success, data, message, error?, error_code? } */
export interface RespuestaFactApi<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  error_code?: string;
}

export async function obtenerConfigFactApi(): Promise<ConfigFactApi> {
  const fila = await queryRow<{ valor: any }>(
    `SELECT valor FROM configuracion_sistema WHERE clave = 'integracion_fact_api'`
  );
  const valor = typeof fila?.valor === "string" ? JSON.parse(fila.valor) : fila?.valor;
  return { ...CONFIG_POR_DEFECTO, ...(valor || {}) };
}

/** Segmento de ruta de fact_api según el tipo de comprobante SUNAT */
export function rutaDocumento(tipo: TipoComprobante): "invoices" | "boletas" {
  return tipo === "01" ? "invoices" : "boletas";
}

export function credencialesConfiguradas(): { token: boolean; usuario: boolean } {
  return {
    token: Boolean(process.env.FACT_API_TOKEN),
    usuario: Boolean(process.env.FACT_API_EMAIL && process.env.FACT_API_PASSWORD),
  };
}

// Token Sanctum en memoria del proceso (se renueva ante un 401)
let tokenEnCache: { url: string; token: string } | null = null;

function base(config: ConfigFactApi): string {
  return config.url_base.replace(/\/+$/, "");
}

async function solicitar(
  config: ConfigFactApi,
  ruta: string,
  opciones: { metodo?: string; cuerpo?: unknown; token?: string | null; crudo?: boolean } = {}
): Promise<Response> {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), config.tiempo_espera_ms || 20000);
  try {
    return await fetch(`${base(config)}${ruta}`, {
      method: opciones.metodo || "GET",
      headers: {
        Accept: opciones.crudo ? "*/*" : "application/json",
        ...(opciones.cuerpo !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(opciones.token ? { Authorization: `Bearer ${opciones.token}` } : {}),
      },
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
      signal: controlador.signal,
      cache: "no-store",
    });
  } catch (error: any) {
    const motivo = error?.name === "AbortError" ? "tiempo de espera agotado" : "no se pudo conectar";
    throw new ErrorDominio(`fact_api: ${motivo} (${base(config)}).`, 502);
  } finally {
    clearTimeout(temporizador);
  }
}

async function leerJson(res: Response): Promise<RespuestaFactApi> {
  try {
    return (await res.json()) as RespuestaFactApi;
  } catch {
    return { success: false, message: `Respuesta no válida de fact_api (HTTP ${res.status}).` };
  }
}

/** POST /api/auth/login → access_token (o FACT_API_TOKEN si está definido) */
async function obtenerToken(config: ConfigFactApi, forzar = false): Promise<string> {
  if (process.env.FACT_API_TOKEN) return process.env.FACT_API_TOKEN;
  if (!forzar && tokenEnCache && tokenEnCache.url === config.url_base) return tokenEnCache.token;
  const email = process.env.FACT_API_EMAIL;
  const password = process.env.FACT_API_PASSWORD;
  if (!email || !password) {
    throw new ErrorDominio(
      "Faltan credenciales de fact_api: defina FACT_API_TOKEN o FACT_API_EMAIL y FACT_API_PASSWORD en el entorno del servidor.",
      503
    );
  }
  const res = await solicitar(config, "/api/auth/login", { metodo: "POST", cuerpo: { email, password } });
  const json: any = await leerJson(res);
  if (!res.ok || !json.access_token) {
    throw new ErrorDominio(`fact_api rechazó el inicio de sesión: ${json.message || `HTTP ${res.status}`}.`, 502);
  }
  tokenEnCache = { url: config.url_base, token: json.access_token };
  return json.access_token;
}

/** Llamada autenticada; reintenta una vez con token nuevo si fact_api responde 401 */
async function llamar(
  ruta: string,
  opciones: { metodo?: string; cuerpo?: unknown; crudo?: boolean } = {},
  configDada?: ConfigFactApi
): Promise<Response> {
  const config = configDada || (await obtenerConfigFactApi());
  if (!config.habilitado) {
    throw new ErrorDominio("La integración con SUNAT (fact_api) está deshabilitada. Actívela en Activos → Configuración.", 409);
  }
  let res = await solicitar(config, ruta, { ...opciones, token: await obtenerToken(config) });
  if (res.status === 401 && !process.env.FACT_API_TOKEN) {
    res = await solicitar(config, ruta, { ...opciones, token: await obtenerToken(config, true) });
  }
  return res;
}

async function llamarJson<T = any>(ruta: string, opciones: { metodo?: string; cuerpo?: unknown } = {}) {
  const res = await llamar(ruta, opciones);
  const json = await leerJson(res);
  return { ok: res.ok && json.success !== false, status: res.status, json: json as RespuestaFactApi<T> };
}

// ---------------------------------------------------------------------------
// Operaciones de negocio
// ---------------------------------------------------------------------------

/** Prueba de conexión: GET /api/system/info (público) + login + GET /api/v1/auth/me */
export async function probarConexion(configDada?: ConfigFactApi) {
  const config = configDada || (await obtenerConfigFactApi());
  const pasos: { paso: string; ok: boolean; detalle: string }[] = [];
  try {
    const info = await solicitar(config, "/api/system/info");
    pasos.push({ paso: "Servicio disponible", ok: info.ok, detalle: `HTTP ${info.status}` });
  } catch (e: any) {
    pasos.push({ paso: "Servicio disponible", ok: false, detalle: e.message });
    return { ok: false, pasos };
  }
  try {
    const token = await obtenerToken(config, true);
    const yo = await solicitar(config, "/api/v1/auth/me", { token });
    const json: any = await leerJson(yo);
    const usuario = json?.user?.email || json?.data?.email || json?.email || "";
    pasos.push({ paso: "Autenticación", ok: yo.ok, detalle: yo.ok ? `Sesión de ${usuario || "usuario de integración"}` : `HTTP ${yo.status}` });
  } catch (e: any) {
    pasos.push({ paso: "Autenticación", ok: false, detalle: e.message });
  }
  return { ok: pasos.every((p) => p.ok), pasos };
}

/** POST /api/v1/invoices | /api/v1/boletas — registra el comprobante (no lo envía) */
export async function registrarDocumento(tipo: TipoComprobante, payload: Record<string, unknown>) {
  return llamarJson(`/api/v1/${rutaDocumento(tipo)}`, { metodo: "POST", cuerpo: payload });
}

/** POST /api/v1/{invoices|boletas}/{id}/send-sunat */
export async function enviarDocumentoSunat(tipo: TipoComprobante, idDocumento: number) {
  return llamarJson(`/api/v1/${rutaDocumento(tipo)}/${idDocumento}/send-sunat`, { metodo: "POST" });
}

/** POST /api/v1/consulta-cpe/{factura|boleta}/{id} — consulta de validez en SUNAT */
export async function consultarDocumentoSunat(tipo: TipoComprobante, idDocumento: number) {
  return llamarJson(`/api/v1/consulta-cpe/${tipo === "01" ? "factura" : "boleta"}/${idDocumento}`, { metodo: "POST" });
}

/** GET /api/v1/{invoices|boletas}/{id}/download-{pdf|xml|cdr} — archivo binario */
export async function descargarArchivo(tipo: TipoComprobante, idDocumento: number, archivo: "pdf" | "xml" | "cdr") {
  const sufijo = archivo === "pdf" ? "download-pdf?format=A4" : `download-${archivo}`;
  return llamar(`/api/v1/${rutaDocumento(tipo)}/${idDocumento}/${sufijo}`, { crudo: true });
}
