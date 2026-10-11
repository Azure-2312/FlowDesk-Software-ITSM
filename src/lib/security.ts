import crypto from "crypto";

function obtenerSecretoCaptcha(): string {
  const secreto = process.env.JWT_SECRET;
  if (!secreto || secreto.length < 32) {
    throw new Error("JWT_SECRET debe estar configurado con al menos 32 caracteres.");
  }
  return secreto;
}

// ---------- Sanitización de Entradas ----------

/**
 * Sanitiza texto general para prevenir ataques XSS y caracteres de control maliciosos.
 */
export function sanitizarTexto(entrada: unknown): string {
  if (typeof entrada !== "string") return "";

  return entrada
    // Eliminar caracteres nulos y de control invisibles
    .replace(/\0/g, "")
    // Eliminar etiquetas de script completas
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Escapar caracteres HTML potencialmente peligrosos
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Sanitiza y normaliza un correo electrónico.
 */
export function sanitizarCorreo(correo: unknown): string {
  if (typeof correo !== "string") return "";
  return correo.trim().toLowerCase().replace(/\0/g, "");
}

// ---------- CAPTCHA Anti-Bot Criptográfico ----------

const CARACTERES_CAPTCHA = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // sin 0, O, 1, I, L para evitar confusión

export interface DesafioCaptcha {
  token: string;
  svg: string;
}

/**
 * Genera un código de 5 caracteres, produce un SVG con distorsión visual y líneas de interferencia,
 * y firma criptográficamente el resultado con una validez de 3 minutos.
 */
export function generarCaptchaDesafio(): DesafioCaptcha {
  let codigo = "";
  for (let i = 0; i < 5; i++) {
    codigo += CARACTERES_CAPTCHA.charAt(crypto.randomInt(CARACTERES_CAPTCHA.length));
  }

  const expiraEn = Date.now() + 3 * 60 * 1000; // 3 minutos

  // Firma HMAC SHA256: respuesta:expiraEn
  const hmac = crypto
    .createHmac("sha256", obtenerSecretoCaptcha())
    .update(`${codigo.toUpperCase()}:${expiraEn}`)
    .digest("hex");

  const token = Buffer.from(`${hmac}:${expiraEn}`).toString("base64url");

  // Generar SVG con líneas y letras con ángulo/color aleatorio
  const colores = ["#1e40af", "#047857", "#b91c1c", "#6d28d9", "#c2410c", "#0f766e"];
  const width = 160;
  const height = 48;

  let elementosLetras = "";
  const paso = (width - 30) / 5;

  for (let i = 0; i < 5; i++) {
    const x = 16 + i * paso;
    const y = 32 + (Math.random() * 8 - 4);
    const rot = (Math.random() * 30 - 15).toFixed(1);
    const color = colores[Math.floor(Math.random() * colores.length)];
    elementosLetras += `
      <text x="${x}" y="${y}" font-family="Courier, monospace, sans-serif" font-weight="900" font-size="24" fill="${color}" transform="rotate(${rot}, ${x}, ${y})">${codigo[i]}</text>
    `;
  }

  // Líneas de interferencia aleatorias
  let lineasRuido = "";
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    const color = colores[Math.floor(Math.random() * colores.length)];
    lineasRuido += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" stroke-opacity="0.5" />`;
  }

  // Puntos de ruido
  let puntosRuido = "";
  for (let i = 0; i < 25; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    puntosRuido += `<circle cx="${cx}" cy="${cy}" r="1" fill="#9ca3af" opacity="0.6"/>`;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #f3f4f6; border-radius: 6px; user-select: none;">
      <rect width="100%" height="100%" fill="#f9fafb"/>
      ${lineasRuido}
      ${puntosRuido}
      ${elementosLetras}
    </svg>
  `.trim();

  return { token, svg };
}

/**
 * Verifica la respuesta del usuario contra el token firmado del CAPTCHA.
 */
export function verificarCaptcha(token: string, respuestaUsuario: string): { valido: boolean; error?: string } {
  if (!token || !respuestaUsuario) {
    return { valido: false, error: "El código de seguridad CAPTCHA es obligatorio" };
  }

  try {
    const decodificado = Buffer.from(token, "base64url").toString("utf-8");
    const partes = decodificado.split(":");
    if (partes.length !== 2) {
      return { valido: false, error: "Token de CAPTCHA inválido" };
    }

    const [hmacEsperado, expiraEnStr] = partes;
    const expiraEn = parseInt(expiraEnStr, 10);

    if (isNaN(expiraEn) || Date.now() > expiraEn) {
      return { valido: false, error: "El código CAPTCHA ha expirado. Por favor solicita uno nuevo." };
    }

    const respuestaLimpia = respuestaUsuario.trim().toUpperCase();

    const hmacCalculado = crypto
      .createHmac("sha256", obtenerSecretoCaptcha())
      .update(`${respuestaLimpia}:${expiraEn}`)
      .digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(hmacEsperado), Buffer.from(hmacCalculado))) {
      return { valido: true };
    } else {
      return { valido: false, error: "El código de seguridad CAPTCHA ingresado es incorrecto" };
    }
  } catch {
    return { valido: false, error: "Error al validar el código CAPTCHA" };
  }
}
