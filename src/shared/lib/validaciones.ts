/**
 * Biblioteca centralizada de validaciones de entrada del sistema.
 * Aplica estándares internacionales y peruanos para formularios de usuario,
 * credenciales, catálogos, tickets y procesos ITIL v4.
 */

export interface ResultadoValidacion {
  valido: boolean;
  mensaje?: string;
}

/**
 * 1. Validación de DNI (Perú)
 * Debe contener exactamente 8 dígitos numéricos.
 * Notifica claramente si tiene menos o más de 8 dígitos.
 */
export function validarDni(dni: string): ResultadoValidacion {
  if (!dni || typeof dni !== "string") {
    return { valido: false, mensaje: "El DNI es obligatorio." };
  }
  const limpio = dni.trim();
  if (!/^\d+$/.test(limpio)) {
    return {
      valido: false,
      mensaje: "El DNI solo debe contener dígitos numéricos (0-9).",
    };
  }
  if (limpio.length < 8) {
    return {
      valido: false,
      mensaje: `El DNI debe tener exactamente 8 dígitos (has ingresado ${limpio.length} de 8).`,
    };
  }
  if (limpio.length > 8) {
    return {
      valido: false,
      mensaje: `El DNI no puede exceder los 8 dígitos (has ingresado ${limpio.length} de 8).`,
    };
  }
  return { valido: true };
}

/**
 * 1.1 Validación de RUC (Perú)
 * Debe contener exactamente 11 dígitos numéricos.
 * Habitualmente inicia con 10, 15, 17 o 20.
 */
export function validarRuc(
  ruc: string | null | undefined,
  obligatorio: boolean = true
): ResultadoValidacion {
  if (!ruc || typeof ruc !== "string" || ruc.trim().length === 0) {
    if (!obligatorio) return { valido: true };
    return { valido: false, mensaje: "El RUC es obligatorio." };
  }
  const limpio = ruc.trim();
  if (!/^\d+$/.test(limpio)) {
    return {
      valido: false,
      mensaje: "El RUC solo debe contener dígitos numéricos (0-9).",
    };
  }
  if (limpio.length < 11) {
    return {
      valido: false,
      mensaje: `El RUC debe tener exactamente 11 dígitos (has ingresado ${limpio.length} de 11).`,
    };
  }
  if (limpio.length > 11) {
    return {
      valido: false,
      mensaje: `El RUC no puede exceder los 11 dígitos (has ingresado ${limpio.length} de 11).`,
    };
  }
  return { valido: true };
}

/**
 * 2. Validación de Nombres y Apellidos
 * Soporta nombres internacionales cortos (ej. "Li", "Ed", "Bo", "Al", "Ng", "Wu") desde 2 caracteres
 * hasta nombres largos compuestos de hasta 100 caracteres.
 * Admite caracteres Unicode con tildes, diéresis, ñ, apóstrofes (O'Connor, D'Angelo) y guiones (Marie-Curie).
 * Prohíbe números, símbolos no permitidos y cadenas compuestas solo por signos de puntuación.
 */
export function validarNombre(
  valor: string | null | undefined,
  nombreCampo: string = "El nombre",
  obligatorio: boolean = true
): ResultadoValidacion {
  if (!valor || typeof valor !== "string") {
    if (!obligatorio) return { valido: true };
    return { valido: false, mensaje: `${nombreCampo} es obligatorio.` };
  }
  const limpio = valor.trim();
  if (limpio.length === 0) {
    if (!obligatorio) return { valido: true };
    return { valido: false, mensaje: `${nombreCampo} no puede estar vacío ni contener solo espacios.` };
  }
  if (limpio.length < 2) {
    return {
      valido: false,
      mensaje: `${nombreCampo} debe tener al menos 2 caracteres (ejemplo: Li).`,
    };
  }
  if (limpio.length > 100) {
    return {
      valido: false,
      mensaje: `${nombreCampo} no puede superar los 100 caracteres.`,
    };
  }

  // Permite letras (incluyendo acentos y caracteres internacionales), espacios, apóstrofes y guiones
  const regexNombres = /^[\p{L}][\p{L}\s'-]*[\p{L}]$/u;
  if (!regexNombres.test(limpio)) {
    return {
      valido: false,
      mensaje: `${nombreCampo} solo debe contener caracteres alfabéticos, apóstrofes o guiones (sin números ni símbolos especiales).`,
    };
  }

  // Evitar secuencias absurdas como "--" o "''"
  if (/[-']{2,}/.test(limpio)) {
    return {
      valido: false,
      mensaje: `${nombreCampo} no puede contener signos de puntuación consecutivos.`,
    };
  }
  return { valido: true };
}

/**
 * 3. Validación de Correo Electrónico
 * Estándar RFC 5322 simplificado con soporte para TLDs modernos.
 */
export function validarCorreo(
  correo: string | null | undefined,
  nombreCampo: string = "El correo electrónico",
  obligatorio: boolean = true
): ResultadoValidacion {
  if (!correo || typeof correo !== "string") {
    if (!obligatorio) return { valido: true };
    return { valido: false, mensaje: `${nombreCampo} es obligatorio.` };
  }
  const limpio = correo.trim().toLowerCase();
  if (limpio.length === 0) {
    if (!obligatorio) return { valido: true };
    return { valido: false, mensaje: `${nombreCampo} es obligatorio.` };
  }
  const regexCorreo = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!regexCorreo.test(limpio) || limpio.length > 254) {
    return {
      valido: false,
      mensaje: `Ingresa un correo electrónico con formato válido (ejemplo: usuario@dominio.com).`,
    };
  }
  return { valido: true };
}

/**
 * 4. Validación de Celular / Teléfono
 * En Perú el celular móvil consta de 9 dígitos numéricos e inicia habitualmente con 9.
 * Si es opcional y está vacío, es válido.
 */
export function validarCelular(
  celular: string | null | undefined,
  obligatorio: boolean = false
): ResultadoValidacion {
  if (!celular || typeof celular !== "string" || celular.trim().length === 0) {
    if (!obligatorio) return { valido: true };
    return { valido: false, mensaje: "El número de celular es obligatorio." };
  }
  const limpio = celular.trim().replace(/[\s-]/g, "");
  if (!/^\d+$/.test(limpio)) {
    return {
      valido: false,
      mensaje: "El celular solo debe contener dígitos numéricos.",
    };
  }
  if (!limpio.startsWith("9")) {
    return {
      valido: false,
      mensaje: `El celular debe iniciar con 9 (ingresaste: "${limpio}").`,
    };
  }
  if (limpio.length !== 9) {
    return {
      valido: false,
      mensaje: `El celular debe contener exactamente 9 dígitos (has ingresado ${limpio.length} de 9).`,
    };
  }
  return { valido: true };
}

/**
 * 5. Validación de Código de Sistema (ej. departamentos, servicios, categorías)
 * Debe ser alfanumérico en mayúsculas, guiones y sin espacios.
 */
export function validarCodigo(
  codigo: string | null | undefined,
  min: number = 2,
  max: number = 20,
  nombreCampo: string = "El código"
): ResultadoValidacion {
  if (!codigo || typeof codigo !== "string") {
    return { valido: false, mensaje: `${nombreCampo} es obligatorio.` };
  }
  const limpio = codigo.trim().toUpperCase();
  if (limpio.length < min || limpio.length > max) {
    return {
      valido: false,
      mensaje: `${nombreCampo} debe tener entre ${min} y ${max} caracteres.`,
    };
  }
  if (!/^[A-Z0-9_-]+$/.test(limpio)) {
    return {
      valido: false,
      mensaje: `${nombreCampo} solo puede contener letras en mayúscula, números, guiones y guiones bajos (sin espacios).`,
    };
  }
  return { valido: true };
}

/**
 * 6. Validación de Longitud de Texto General (Título, Asunto, etc.)
 */
export function validarTexto(
  texto: string | null | undefined,
  min: number,
  max: number,
  nombreCampo: string,
  obligatorio: boolean = true
): ResultadoValidacion {
  if (!texto || typeof texto !== "string" || texto.trim().length === 0) {
    if (!obligatorio) return { valido: true };
    return { valido: false, mensaje: `${nombreCampo} es obligatorio.` };
  }
  const limpio = texto.trim();
  if (limpio.length < min) {
    return {
      valido: false,
      mensaje: `${nombreCampo} debe tener al menos ${min} caracteres (actualmente tiene ${limpio.length}).`,
    };
  }
  if (limpio.length > max) {
    return {
      valido: false,
      mensaje: `${nombreCampo} no puede superar los ${max} caracteres (actualmente tiene ${limpio.length}).`,
    };
  }
  return { valido: true };
}

/**
 * 7. Validación de Números Positivos (SLA, Horas, Costos, Capacidades)
 */
export function validarNumeroPositivo(
  valor: number | string | null | undefined,
  nombreCampo: string,
  min: number = 0,
  max: number = 999999
): ResultadoValidacion {
  if (valor === null || valor === undefined || valor === "") {
    return { valido: false, mensaje: `${nombreCampo} es obligatorio.` };
  }
  const num = typeof valor === "string" ? Number(valor) : valor;
  if (isNaN(num)) {
    return { valido: false, mensaje: `${nombreCampo} debe ser un valor numérico.` };
  }
  if (num < min) {
    return { valido: false, mensaje: `${nombreCampo} debe ser mayor o igual a ${min}.` };
  }
  if (num > max) {
    return { valido: false, mensaje: `${nombreCampo} no puede exceder ${max}.` };
  }
  return { valido: true };
}

/**
 * 8. Validación de Fechas no Pasadas (para fechas deseadas o ventanas programadas)
 */
export function validarFechaNoPasada(
  fechaIso: string | null | undefined,
  nombreCampo: string = "La fecha seleccionada"
): ResultadoValidacion {
  if (!fechaIso) return { valido: true };
  const d = new Date(fechaIso);
  if (isNaN(d.getTime())) {
    return { valido: false, mensaje: `${nombreCampo} no tiene un formato válido.` };
  }
  const hoy = new Date();
  hoy.setMinutes(hoy.getMinutes() - 5); // 5 min de tolerancia
  if (d < hoy) {
    return {
      valido: false,
      mensaje: `${nombreCampo} no puede ser una fecha u hora anterior al momento actual.`,
    };
  }
  return { valido: true };
}

/**
 * 9. Validación de Archivos Adjuntos
 */
export const EXTENSIONES_PELIGROSAS = [
  ".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".msi", ".com", ".scr", ".jar", ".pif"
];

export function validarArchivoAdjunto(
  nombreArchivo: string,
  tamanoBytes: number,
  maxMegabytes: number = 5
): ResultadoValidacion {
  const ext = "." + nombreArchivo.split(".").pop()?.toLowerCase();
  if (EXTENSIONES_PELIGROSAS.includes(ext)) {
    return {
      valido: false,
      mensaje: `El archivo "${nombreArchivo}" tiene una extensión no permitida por políticas de seguridad (${ext}).`,
    };
  }
  const maxBytes = maxMegabytes * 1024 * 1024;
  if (tamanoBytes > maxBytes) {
    return {
      valido: false,
      mensaje: `El archivo "${nombreArchivo}" supera el límite de ${maxMegabytes} MB permitidos.`,
    };
  }
  return { valido: true };
}

/**
 * 10. Validación de Tiempos SLA / OLA (ITIL v4)
 * El tiempo de primera respuesta debe ser estrictamente menor al tiempo de resolución total.
 */
export function validarSlaTiempos(
  respuestaHoras: number | null | undefined,
  resolucionHoras: number | null | undefined
): ResultadoValidacion {
  const resp = Number(respuestaHoras);
  const reso = Number(resolucionHoras);
  if (isNaN(resp) || resp <= 0) {
    return { valido: false, mensaje: "El SLA de primera respuesta debe ser un número positivo mayor a 0." };
  }
  if (isNaN(reso) || reso <= 0) {
    return { valido: false, mensaje: "El SLA de resolución total debe ser un número positivo mayor a 0." };
  }
  if (resp >= reso) {
    return {
      valido: false,
      mensaje: `El SLA de primera respuesta (${resp} h) no puede ser igual o mayor al SLA de resolución total (${reso} h). La atención inicial debe preceder a la resolución del servicio según los estándares de ITIL v4.`,
    };
  }
  return { valido: true };
}
