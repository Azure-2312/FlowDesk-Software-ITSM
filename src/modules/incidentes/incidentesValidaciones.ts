import { validarTexto } from "@/shared/lib/validaciones";
import { sanitizarTexto } from "@/shared/lib/security";

export interface ResultadoValidacionIncidente {
  esValido: boolean;
  errores: Record<string, string>;
}

export function validarCrearIncidente(datos: {
  titulo?: unknown;
  descripcion?: unknown;
  id_servicio?: unknown;
}): ResultadoValidacionIncidente {
  const errores: Record<string, string> = {};

  const resTitulo = validarTexto(
    typeof datos.titulo === "string" ? datos.titulo : "",
    5,
    150,
    "Título del incidente",
    true
  );
  if (!resTitulo.valido && resTitulo.mensaje) {
    errores.titulo = resTitulo.mensaje;
  }

  const resDesc = validarTexto(
    typeof datos.descripcion === "string" ? datos.descripcion : "",
    10,
    2000,
    "Descripción detallada",
    true
  );
  if (!resDesc.valido && resDesc.mensaje) {
    errores.descripcion = resDesc.mensaje;
  }

  if (!datos.id_servicio || isNaN(Number(datos.id_servicio))) {
    errores.id_servicio = "Debe seleccionar un servicio válido del catálogo";
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
  };
}

export function sanitizarDatosIncidente(datos: {
  titulo: string;
  descripcion: string;
}) {
  return {
    titulo: sanitizarTexto(datos.titulo),
    descripcion: sanitizarTexto(datos.descripcion),
  };
}
