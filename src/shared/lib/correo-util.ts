/**
 * Utilidades para sanitización y generación de correos corporativos.
 * Este archivo no importa dependencias del servidor (como pg) para ser seguro de importar
 * tanto en componentes de cliente ("use client") como en rutas de servidor.
 */

/**
 * Sanitiza una cadena de texto para uso en correos electrónicos corporativos:
 * - Convierte a minúsculas
 * - Remueve tildes, diéresis y acentos diacríticos (á -> a, é -> e, ü -> u, etc.)
 * - Reemplaza la 'ñ' por 'n'
 * - Elimina espacios, guiones, apóstrofes y caracteres especiales
 */
export function sanitizarTextoParaCorreo(texto: string): string {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Genera el correo corporativo estándar (Opción B con sanitización completa):
 * Formato: [inicial_primer_nombre][apellido_paterno_sanitizado][inicial_apellido_materno]@systemticket.pe
 * En caso de colisión (si ya existe), añade correlativo numérico: mapazap2@..., mapazap3@...
 */
export function generarCorreoCorporativo(
  nombres: string,
  apellidoPaterno: string,
  apellidoMaterno: string = "",
  correosExistentes: string[] = []
): string {
  const palabrasNombre = nombres.trim().split(/\s+/).filter(Boolean);
  const primerNombre = palabrasNombre[0] || "";
  const inicialNombre = sanitizarTextoParaCorreo(primerNombre).charAt(0);

  const apellidoPatLimpio = sanitizarTextoParaCorreo(apellidoPaterno);

  const palabrasMaterno = apellidoMaterno.trim().split(/\s+/).filter(Boolean);
  const primerMaterno = palabrasMaterno[0] || "";
  const inicialMaterno = sanitizarTextoParaCorreo(primerMaterno).charAt(0);

  if (!inicialNombre && !apellidoPatLimpio) {
    return "";
  }

  const baseLocal = `${inicialNombre}${apellidoPatLimpio}${inicialMaterno}`;
  if (!baseLocal) return "";

  const dominio = "@systemticket.pe";
  const candidatoBase = `${baseLocal}${dominio}`;

  const correosNormalizados = correosExistentes
    .map((c) => c?.toLowerCase().trim())
    .filter(Boolean);

  if (!correosNormalizados.includes(candidatoBase)) {
    return candidatoBase;
  }

  let correlativo = 2;
  while (correosNormalizados.includes(`${baseLocal}${correlativo}${dominio}`)) {
    correlativo++;
  }

  return `${baseLocal}${correlativo}${dominio}`;
}

/**
 * Genera una contraseña estándar segura y robusta que cumple todas las políticas del sistema:
 * - Longitud de 10 caracteres
 * - Al menos una mayúscula (A-Z)
 * - Al menos una minúscula (a-z)
 * - Al menos un número (0-9)
 * - Al menos un símbolo (!@#$%&*?)
 */
export function generarClaveEstandar(): string {
  const mayusculas = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const minusculas = "abcdefghijkmnpqrstuvwxyz";
  const numeros = "23456789";
  const simbolos = "@#$%&*!";

  const partes = [
    mayusculas[Math.floor(Math.random() * mayusculas.length)],
    minusculas[Math.floor(Math.random() * minusculas.length)],
    minusculas[Math.floor(Math.random() * minusculas.length)],
    numeros[Math.floor(Math.random() * numeros.length)],
    numeros[Math.floor(Math.random() * numeros.length)],
    simbolos[Math.floor(Math.random() * simbolos.length)],
    mayusculas[Math.floor(Math.random() * mayusculas.length)],
    minusculas[Math.floor(Math.random() * minusculas.length)],
    numeros[Math.floor(Math.random() * numeros.length)],
    simbolos[Math.floor(Math.random() * simbolos.length)],
  ];

  for (let i = partes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [partes[i], partes[j]] = [partes[j], partes[i]];
  }

  return partes.join("");
}

