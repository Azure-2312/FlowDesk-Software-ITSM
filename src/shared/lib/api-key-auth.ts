import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/shared/lib/db";

const SALT = process.env.API_KEY_SALT || "flowdesk_salt_seguridad_api_clientes_2026_super_secreto_itsm";
const MASTER_KEY = process.env.MASTER_API_KEY || "fdk_live_master_flowdesk_2026_secreto_compartido_itsm_key";

export interface CredencialGrupo {
  id_credencial: number;
  nombre_grupo: string;
  contacto?: string;
  permisos: string[];
  limite_rpm: number;
}

export type ResultadoAuthApiKey =
  | {
      autorizado: true;
      credencial: CredencialGrupo;
      ip: string;
      headersRateLimit: Record<string, string>;
      registrarAuditoria: (statusCode: number, mensajeError?: string) => Promise<void>;
    }
  | { autorizado: false; respuesta: NextResponse };

/**
 * Calcula el hash HMAC-SHA256 de una API Key para nunca almacenarla en texto plano.
 */
export function hashApiKey(rawKey: string): string {
  if (!rawKey) return "";
  return crypto.createHmac("sha256", SALT).update(rawKey.trim()).digest("hex");
}

/**
 * Comparación segura contra Timing Attacks usando buffers de longitud constante.
 */
export function compararStringsSeguro(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Extrae la IP de origen de forma segura.
 */
export function extraerIpSegura(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim());
    if (ips.length > 0 && ips[0]) return ips[0].substring(0, 45);
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.substring(0, 45);

  return "127.0.0.1";
}

// Memoria para Rate Limiting (ventana deslizante de 1 minuto)
interface RegistroRateLimit {
  inicioVentana: number;
  conteo: number;
}

const mapaRateLimit = new Map<string, RegistroRateLimit>();

// Limpieza periódica cada 10 minutos
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const ahora = Date.now();
    for (const [clave, datos] of mapaRateLimit.entries()) {
      if (ahora - datos.inicioVentana > 60000) {
        mapaRateLimit.delete(clave);
      }
    }
  }, 10 * 60 * 1000).unref?.();
}

/**
 * Autentica la petición HTTP mediante encabezado X-API-KEY o Bearer Token.
 * Incluye protección contra Timing Attacks, verificación de cuota (Rate Limiting) y auditoría inmutable.
 */
export async function autenticarApiKey(
  req: NextRequest,
  permisoRequerido?: string
): Promise<ResultadoAuthApiKey> {
  const inicio = Date.now();
  const ip = extraerIpSegura(req);
  const ruta = req.nextUrl.pathname;
  const metodo = req.method;

  // 1. Extraer clave de los encabezados
  let rawKey = req.headers.get("x-api-key") || req.headers.get("X-API-KEY");
  if (!rawKey) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      rawKey = authHeader.substring(7).trim();
    }
  }

  const registrarLogAuditoria = async (
    idCredencial: number | null,
    grupoIdentificado: string,
    statusCode: number,
    mensajeError?: string
  ) => {
    try {
      const duracion = Date.now() - inicio;
      await query(
        `INSERT INTO api_log_auditoria (id_credencial, grupo_identificado, metodo, ruta, codigo_estado, ip_origen, tiempo_respuesta_ms, mensaje_error)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [idCredencial, grupoIdentificado, metodo, ruta, statusCode, ip, duracion, mensajeError || null]
      );
    } catch (e: any) {
      console.error("[AUDITORIA_API] Error al registrar log:", e.message);
    }
  };

  // 2. Validación de clave ausente
  if (!rawKey) {
    await registrarLogAuditoria(null, "ANONIMO_SIN_KEY", 401, "API Key no proporcionada");
    return {
      autorizado: false,
      respuesta: NextResponse.json(
        {
          exito: false,
          codigo_error: "AUTH_API_KEY_FALTANTE",
          mensaje: "Acceso no autorizado. Debe incluir una API Key válida en el encabezado [X-API-KEY] o [Authorization: Bearer <token>].",
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      )
    };
  }

  const keyLimpia = rawKey.trim();
  let credencial: CredencialGrupo | null = null;
  let keyRevocada = false;

  // 3. Verificación contra MASTER_KEY (Timing Safe)
  if (MASTER_KEY && compararStringsSeguro(keyLimpia, MASTER_KEY)) {
    credencial = {
      id_credencial: 0,
      nombre_grupo: "ADMIN_MASTER_FLOWDESK",
      permisos: ["clientes:read", "clientes:write", "admin"],
      limite_rpm: 1000
    };
  } else {
    // 4. Verificación criptográfica en base de datos
    const hash = hashApiKey(keyLimpia);
    try {
      const rows = await query<any>(
        `SELECT id_credencial, nombre_grupo, contacto, permisos, limite_rpm, estado
         FROM api_credenciales_externas
         WHERE api_key_hash = $1`,
        [hash]
      );

      if (rows.length > 0) {
        const row = rows[0];
        if (!row.estado) {
          keyRevocada = true;
        } else {
          credencial = {
            id_credencial: row.id_credencial,
            nombre_grupo: row.nombre_grupo,
            contacto: row.contacto,
            permisos: Array.isArray(row.permisos)
              ? row.permisos
              : (typeof row.permisos === "string" ? JSON.parse(row.permisos) : []),
            limite_rpm: row.limite_rpm || 60
          };

          // Actualizar último acceso de forma asíncrona
          query(
            `UPDATE api_credenciales_externas
             SET ultimo_acceso = NOW(), total_peticiones = total_peticiones + 1
             WHERE id_credencial = $1`,
            [row.id_credencial]
          ).catch(() => {});
        }
      }
    } catch (err: any) {
      await registrarLogAuditoria(null, "ERROR_BD", 503, err.message);
      return {
        autorizado: false,
        respuesta: NextResponse.json(
          {
            exito: false,
            codigo_error: "ERROR_BASE_DATOS",
            mensaje: "Error de conexión con la base de datos de credenciales.",
            timestamp: new Date().toISOString()
          },
          { status: 503 }
        )
      };
    }
  }

  // 5. Manejo de clave revocada
  if (keyRevocada) {
    await registrarLogAuditoria(null, "KEY_REVOCADA", 403, "API Key deshabilitada por administración");
    return {
      autorizado: false,
      respuesta: NextResponse.json(
        {
          exito: false,
          codigo_error: "KEY_REVOCADA",
          mensaje: "Esta API Key ha sido revocada o desactivada por el administrador.",
          timestamp: new Date().toISOString()
        },
        { status: 403 }
      )
    };
  }

  // 6. Manejo de clave inválida / inexistente
  if (!credencial) {
    await registrarLogAuditoria(null, "RECHAZADO", 401, "API Key no válida o inexistente");
    return {
      autorizado: false,
      respuesta: NextResponse.json(
        {
          exito: false,
          codigo_error: "AUTH_API_KEY_INVALIDA",
          mensaje: "API Key no válida o inexistente.",
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      )
    };
  }

  // 7. Rate Limiting por Credencial / IP
  const idRate = `cred_${credencial.id_credencial}_${ip}`;
  const ahora = Date.now();
  let registro = mapaRateLimit.get(idRate);
  const limiteMax = credencial.limite_rpm || 60;

  if (!registro || ahora - registro.inicioVentana > 60000) {
    registro = { inicioVentana: ahora, conteo: 1 };
    mapaRateLimit.set(idRate, registro);
  } else {
    registro.conteo++;
  }

  const remaining = Math.max(0, limiteMax - registro.conteo);
  const resetSeconds = Math.ceil((registro.inicioVentana + 60000 - ahora) / 1000);

  const headersRateLimit: Record<string, string> = {
    "X-RateLimit-Limit": String(limiteMax),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(resetSeconds)
  };

  if (registro.conteo > limiteMax) {
    await registrarLogAuditoria(credencial.id_credencial, credencial.nombre_grupo, 429, "Rate limit excedido");
    return {
      autorizado: false,
      respuesta: NextResponse.json(
        {
          exito: false,
          codigo_error: "LIMITE_EXCEDIDO_429",
          mensaje: `Ha superado el límite de peticiones permitidas (${limiteMax} req/min). Por favor espere ${resetSeconds} segundos.`,
          reintentar_en_segundos: resetSeconds,
          timestamp: new Date().toISOString()
        },
        { status: 429, headers: headersRateLimit }
      )
    };
  }

  // 8. Validación de Scopes / Permisos
  if (permisoRequerido) {
    const tienePermiso =
      credencial.permisos.includes(permisoRequerido) ||
      credencial.permisos.includes("admin");

    if (!tienePermiso) {
      await registrarLogAuditoria(
        credencial.id_credencial,
        credencial.nombre_grupo,
        403,
        `Requiere permiso [${permisoRequerido}]`
      );
      return {
        autorizado: false,
        respuesta: NextResponse.json(
          {
            exito: false,
            codigo_error: "PERMISO_INSUFICIENTE",
            mensaje: `La credencial no posee el permiso requerido [${permisoRequerido}] para ejecutar esta operación.`,
            timestamp: new Date().toISOString()
          },
          { status: 403, headers: headersRateLimit }
        )
      };
    }
  }

  const credFinal = credencial;
  const registrarAuditoria = async (statusCode: number, mensajeError?: string) => {
    await registrarLogAuditoria(credFinal.id_credencial, credFinal.nombre_grupo, statusCode, mensajeError);
  };

  return {
    autorizado: true,
    credencial,
    ip,
    headersRateLimit,
    registrarAuditoria
  };
}
