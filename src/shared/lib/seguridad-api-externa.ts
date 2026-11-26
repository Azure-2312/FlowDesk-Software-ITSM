// ============================================================================
// SEGURIDAD DE LA API EXTERNA (otros equipos consultan a FlowDesk)
// ============================================================================
// Flujo (similar a OAuth2 "client credentials", sin la complejidad de OAuth):
//   1. El Administrador emite una credencial (client_id + client_secret) desde
//      Plataforma → Integraciones API. El secreto se muestra UNA sola vez y en la
//      BD solo queda su HMAC-SHA256 con un pepper que vive en el servidor.
//   2. El otro equipo canjea la credencial en POST /api/v1/auth/token y recibe
//      un token temporal (15 min). Solo se guarda el hash del token.
//   3. Con "Authorization: Bearer <token>" consulta los recursos de solo lectura.
// Capas de protección:
//   · HTTPS obligatorio en producción, sin caché, sin CORS y errores genéricos.
//   · Vigencia de la credencial, revocación, rotación y lista de IPs permitidas.
//   · Bloqueo por fuerza bruta (por IP y por client_id) y límite por minuto
//     calculados sobre la bitácora en BD (válido en serverless).
//   · Bitácora inmutable (trigger que impide UPDATE/DELETE).
//   · Falla cerrado: sin API_KEY_SALT configurado no se atiende ninguna petición.
// ============================================================================

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";

export const PERMISO_SOLICITANTES = "solicitantes:leer";
export const TTL_TOKEN_MINUTOS = 15;
const VENTANA_BLOQUEO_MIN = 15;
const MAX_FALLOS_POR_IP = 10;
const MAX_FALLOS_POR_CLIENTE = 5;

// ---------------------------------------------------------------------------
// Utilidades criptográficas
// ---------------------------------------------------------------------------

/** Pepper del servidor. Sin él (o si es débil) la API queda deshabilitada. */
function obtenerPepper(): string | null {
  const pepper = process.env.API_KEY_SALT || "";
  return pepper.length >= 32 ? pepper : null;
}

export function apiConfigurada(): boolean {
  return obtenerPepper() !== null;
}

export function hmacSecreto(valor: string): string {
  const pepper = obtenerPepper();
  if (!pepper) throw new Error("API_KEY_SALT no configurado");
  return crypto.createHmac("sha256", pepper).update(valor).digest("hex");
}

export function igualesSeguro(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function generarClientId(): string {
  return `fdc_${crypto.randomBytes(9).toString("hex")}`; // 22 caracteres
}

export function generarClientSecret(): string {
  return `fds_${crypto.randomBytes(32).toString("base64url")}`;
}

function generarToken(): string {
  return `fdt_${crypto.randomBytes(32).toString("base64url")}`;
}

// ---------------------------------------------------------------------------
// Petición: IP, transporte y respuestas
// ---------------------------------------------------------------------------

export function extraerIp(req: NextRequest): string {
  const reenviada = req.headers.get("x-forwarded-for");
  if (reenviada) {
    const primera = reenviada.split(",")[0]?.trim();
    if (primera) return primera.substring(0, 45);
  }
  return (req.headers.get("x-real-ip") || req.ip || "desconocida").substring(0, 45);
}

/** En producción solo se acepta HTTPS (Vercel informa el protocolo original). */
function transporteInseguro(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");
  return proto !== "https";
}

const CABECERAS_SEGURAS: Record<string, string> = {
  "Cache-Control": "no-store",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

export function respuestaApi(
  cuerpo: unknown,
  status = 200,
  extra: Record<string, string> = {}
): NextResponse {
  return NextResponse.json(cuerpo, { status, headers: { ...CABECERAS_SEGURAS, ...extra } });
}

export function errorApi(
  status: number,
  codigo: string,
  mensaje: string,
  extra: Record<string, string> = {}
): NextResponse {
  return respuestaApi({ error: codigo, mensaje }, status, extra);
}

const NO_AUTORIZADO = () =>
  errorApi(401, "no_autorizado", "Credenciales o token inválidos, vencidos o revocados.", {
    "WWW-Authenticate": 'Bearer realm="FlowDesk"',
  });

// ---------------------------------------------------------------------------
// Bitácora inmutable
// ---------------------------------------------------------------------------

export interface EntradaBitacora {
  direccion?: "ENTRANTE" | "SALIENTE" | "ADMIN";
  idCredencial?: number | null;
  grupo?: string | null;
  idUsuario?: number | null;
  metodo: string;
  ruta: string;
  codigo: number;
  ip?: string | null;
  inicio: number;
  error?: string | null;
  detalle?: string | null;
}

export async function registrarBitacora(e: EntradaBitacora): Promise<void> {
  try {
    await query(
      `INSERT INTO api_log_auditoria
         (direccion, id_credencial, grupo_identificado, id_usuario, metodo, ruta, codigo_estado,
          ip_origen, tiempo_respuesta_ms, mensaje_error, detalle)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        e.direccion ?? "ENTRANTE",
        e.idCredencial ?? null,
        (e.grupo ?? "").substring(0, 100) || null,
        e.idUsuario ?? null,
        e.metodo.substring(0, 10),
        e.ruta.substring(0, 255),
        e.codigo,
        e.ip ?? null,
        Date.now() - e.inicio,
        e.error ? e.error.substring(0, 500) : null,
        e.detalle ? e.detalle.substring(0, 255) : null,
      ]
    );
  } catch (err: any) {
    console.error("[API_EXTERNA] No se pudo registrar la bitácora:", err?.message);
  }
}

// ---------------------------------------------------------------------------
// Bloqueo por fuerza bruta y límite por minuto (en BD → válido en serverless)
// ---------------------------------------------------------------------------

async function segundosDeBloqueo(ip: string, clientId?: string): Promise<number> {
  const fila = await queryRow<{ por_ip: string; por_cliente: string; ultimo: Date | null }>(
    `SELECT COUNT(*) FILTER (WHERE ip_origen = $1)                             AS por_ip,
            COUNT(*) FILTER (WHERE $2::text IS NOT NULL AND grupo_identificado = $2) AS por_cliente,
            MAX(fecha_registro)                                                AS ultimo
       FROM api_log_auditoria
      WHERE direccion = 'ENTRANTE'
        AND codigo_estado = 401
        AND fecha_registro > now() - ($3 || ' minutes')::interval
        AND (ip_origen = $1 OR ($2::text IS NOT NULL AND grupo_identificado = $2))`,
    [ip, clientId ? `client:${clientId}` : null, String(VENTANA_BLOQUEO_MIN)]
  );
  const porIp = Number(fila?.por_ip || 0);
  const porCliente = Number(fila?.por_cliente || 0);
  if (porIp < MAX_FALLOS_POR_IP && porCliente < MAX_FALLOS_POR_CLIENTE) return 0;
  const ultimo = fila?.ultimo ? new Date(fila.ultimo).getTime() : Date.now();
  return Math.max(1, Math.ceil((ultimo + VENTANA_BLOQUEO_MIN * 60_000 - Date.now()) / 1000));
}

async function peticionesUltimoMinuto(idCredencial: number): Promise<number> {
  const fila = await queryRow<{ total: string }>(
    `SELECT COUNT(*) AS total FROM api_log_auditoria
      WHERE id_credencial = $1 AND direccion = 'ENTRANTE'
        AND fecha_registro > now() - interval '1 minute'`,
    [idCredencial]
  );
  return Number(fila?.total || 0);
}

function ipPermitida(ip: string, lista: string[] | null): boolean {
  if (!lista || lista.length === 0) return true;
  return lista.some((permitida) => permitida.trim() === ip);
}

// ---------------------------------------------------------------------------
// 1) Canje de credencial por token temporal
// ---------------------------------------------------------------------------

function leerCredencialBasic(req: NextRequest): { id: string; secreto: string } | null {
  const auth = req.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("basic ")) return null;
  try {
    const plano = Buffer.from(auth.slice(6).trim(), "base64").toString("utf8");
    const sep = plano.indexOf(":");
    if (sep < 1) return null;
    return { id: plano.slice(0, sep), secreto: plano.slice(sep + 1) };
  } catch {
    return null;
  }
}

export async function emitirToken(req: NextRequest): Promise<NextResponse> {
  const inicio = Date.now();
  const ip = extraerIp(req);
  const ruta = req.nextUrl.pathname;
  const base = { metodo: "POST", ruta, ip, inicio };

  if (!apiConfigurada()) {
    return errorApi(503, "servicio_no_disponible", "La API no está disponible en este momento.");
  }
  if (transporteInseguro(req)) {
    return errorApi(400, "https_requerido", "Esta API solo acepta conexiones HTTPS.");
  }

  // Credencial por cuerpo JSON {client_id, client_secret} o por HTTP Basic.
  let clientId = "";
  let secreto = "";
  const basic = leerCredencialBasic(req);
  if (basic) {
    clientId = basic.id;
    secreto = basic.secreto;
  } else {
    try {
      const cuerpo = await req.json();
      clientId = typeof cuerpo?.client_id === "string" ? cuerpo.client_id : "";
      secreto = typeof cuerpo?.client_secret === "string" ? cuerpo.client_secret : "";
    } catch {
      /* cuerpo inválido → se trata como credencial ausente */
    }
  }
  clientId = clientId.trim().substring(0, 40);
  secreto = secreto.trim().substring(0, 200);
  const etiquetaCliente = /^fdc_[a-f0-9]{18}$/.test(clientId) ? `client:${clientId}` : "client:desconocido";

  const espera = await segundosDeBloqueo(ip, clientId || undefined);
  if (espera > 0) {
    await registrarBitacora({ ...base, grupo: etiquetaCliente, codigo: 429, error: "Bloqueo temporal por intentos fallidos" });
    return errorApi(429, "bloqueo_temporal", "Demasiados intentos fallidos. Intente más tarde.", {
      "Retry-After": String(espera),
    });
  }

  if (!clientId || !secreto) {
    await registrarBitacora({ ...base, grupo: etiquetaCliente, codigo: 401, error: "Credencial ausente" });
    return NO_AUTORIZADO();
  }

  const cred = await queryRow<any>(
    `SELECT id_credencial, nombre_grupo, api_key_hash, permisos, estado, fecha_expiracion,
            ips_permitidas, limite_rpm
       FROM api_credenciales_externas WHERE client_id = $1`,
    [clientId]
  );

  // Se calcula el HMAC aunque el cliente no exista para no revelar por tiempo de respuesta.
  const hashRecibido = hmacSecreto(secreto);
  const valida = !!cred && igualesSeguro(hashRecibido, cred.api_key_hash);
  const vencida = !!cred?.fecha_expiracion && new Date(cred.fecha_expiracion).getTime() <= Date.now();

  if (!valida || !cred.estado || vencida) {
    const motivo = !valida ? "Secreto o client_id inválido" : !cred.estado ? "Credencial revocada" : "Credencial vencida";
    await registrarBitacora({ ...base, idCredencial: cred?.id_credencial ?? null, grupo: etiquetaCliente, codigo: 401, error: motivo });
    return NO_AUTORIZADO();
  }

  if (!ipPermitida(ip, cred.ips_permitidas)) {
    await registrarBitacora({ ...base, idCredencial: cred.id_credencial, grupo: cred.nombre_grupo, codigo: 403, error: `IP no permitida: ${ip}` });
    return errorApi(403, "ip_no_permitida", "El origen de la petición no está autorizado para esta credencial.");
  }

  const usadas = await peticionesUltimoMinuto(cred.id_credencial);
  const limite = Number(cred.limite_rpm) || 60;
  if (usadas >= limite) {
    await registrarBitacora({ ...base, idCredencial: cred.id_credencial, grupo: cred.nombre_grupo, codigo: 429, error: "Límite por minuto" });
    return errorApi(429, "limite_excedido", `Límite de ${limite} peticiones por minuto superado.`, { "Retry-After": "60" });
  }

  const token = generarToken();
  await query(
    `INSERT INTO api_token_acceso (id_credencial, token_hash, ip_origen, fecha_expiracion)
     VALUES ($1, $2, $3, now() + ($4 || ' minutes')::interval)`,
    [cred.id_credencial, hmacSecreto(token), ip, String(TTL_TOKEN_MINUTOS)]
  );
  await query(
    `UPDATE api_credenciales_externas SET ultimo_acceso = now(), total_peticiones = total_peticiones + 1
      WHERE id_credencial = $1`,
    [cred.id_credencial]
  );
  await registrarBitacora({ ...base, idCredencial: cred.id_credencial, grupo: cred.nombre_grupo, codigo: 200, detalle: "Token emitido" });

  const permisos: string[] = Array.isArray(cred.permisos) ? cred.permisos : [];
  return respuestaApi({
    access_token: token,
    token_type: "Bearer",
    expires_in: TTL_TOKEN_MINUTOS * 60,
    alcance: permisos,
  });
}

// ---------------------------------------------------------------------------
// 2) Validación del token en cada recurso
// ---------------------------------------------------------------------------

export interface ContextoApi {
  idCredencial: number;
  grupo: string;
  ip: string;
  cabeceras: Record<string, string>;
  /** Registra el resultado final de la petición en la bitácora. */
  registrar: (codigo: number, detalle?: string, error?: string) => Promise<void>;
}

export type ResultadoToken =
  | { ok: true; ctx: ContextoApi }
  | { ok: false; respuesta: NextResponse };

export async function validarToken(req: NextRequest, permiso: string): Promise<ResultadoToken> {
  const inicio = Date.now();
  const ip = extraerIp(req);
  const ruta = req.nextUrl.pathname;
  const base = { metodo: req.method, ruta, ip, inicio };

  if (!apiConfigurada()) {
    return { ok: false, respuesta: errorApi(503, "servicio_no_disponible", "La API no está disponible en este momento.") };
  }
  if (transporteInseguro(req)) {
    return { ok: false, respuesta: errorApi(400, "https_requerido", "Esta API solo acepta conexiones HTTPS.") };
  }

  const espera = await segundosDeBloqueo(ip);
  if (espera > 0) {
    await registrarBitacora({ ...base, codigo: 429, error: "Bloqueo temporal por intentos fallidos" });
    return {
      ok: false,
      respuesta: errorApi(429, "bloqueo_temporal", "Demasiados intentos fallidos. Intente más tarde.", { "Retry-After": String(espera) }),
    };
  }

  const auth = req.headers.get("authorization") || "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (!/^fdt_[A-Za-z0-9_-]{43}$/.test(token)) {
    await registrarBitacora({ ...base, codigo: 401, error: token ? "Token con formato inválido" : "Token ausente" });
    return { ok: false, respuesta: NO_AUTORIZADO() };
  }

  const fila = await queryRow<any>(
    `SELECT t.id_token, c.id_credencial, c.nombre_grupo, c.permisos, c.ips_permitidas, c.limite_rpm
       FROM api_token_acceso t
       JOIN api_credenciales_externas c ON c.id_credencial = t.id_credencial
      WHERE t.token_hash = $1
        AND t.revocado = false
        AND t.fecha_expiracion > now()
        AND c.estado = true
        AND (c.fecha_expiracion IS NULL OR c.fecha_expiracion > now())`,
    [hmacSecreto(token)]
  );
  if (!fila) {
    await registrarBitacora({ ...base, codigo: 401, error: "Token inválido, vencido o revocado" });
    return { ok: false, respuesta: NO_AUTORIZADO() };
  }

  const ctxBase = { ...base, idCredencial: fila.id_credencial, grupo: fila.nombre_grupo };

  if (!ipPermitida(ip, fila.ips_permitidas)) {
    await registrarBitacora({ ...ctxBase, codigo: 403, error: `IP no permitida: ${ip}` });
    return { ok: false, respuesta: errorApi(403, "ip_no_permitida", "El origen de la petición no está autorizado para esta credencial.") };
  }

  const permisos: string[] = Array.isArray(fila.permisos) ? fila.permisos : [];
  if (!permisos.includes(permiso)) {
    await registrarBitacora({ ...ctxBase, codigo: 403, error: `Sin permiso ${permiso}` });
    return { ok: false, respuesta: errorApi(403, "permiso_insuficiente", "La credencial no tiene acceso a este recurso.") };
  }

  const limite = Number(fila.limite_rpm) || 60;
  const usadas = await peticionesUltimoMinuto(fila.id_credencial);
  if (usadas >= limite) {
    await registrarBitacora({ ...ctxBase, codigo: 429, error: "Límite por minuto" });
    return {
      ok: false,
      respuesta: errorApi(429, "limite_excedido", `Límite de ${limite} peticiones por minuto superado.`, {
        "Retry-After": "60",
        "X-RateLimit-Limit": String(limite),
        "X-RateLimit-Remaining": "0",
      }),
    };
  }

  query(
    `UPDATE api_credenciales_externas SET ultimo_acceso = now(), total_peticiones = total_peticiones + 1
      WHERE id_credencial = $1`,
    [fila.id_credencial]
  ).catch(() => {});

  return {
    ok: true,
    ctx: {
      idCredencial: fila.id_credencial,
      grupo: fila.nombre_grupo,
      ip,
      cabeceras: {
        "X-RateLimit-Limit": String(limite),
        "X-RateLimit-Remaining": String(Math.max(0, limite - usadas - 1)),
      },
      registrar: (codigo, detalle, error) =>
        registrarBitacora({ ...ctxBase, codigo, detalle: detalle ?? null, error: error ?? null }),
    },
  };
}
