import { validarTexto } from "@/shared/lib/validaciones";
import { sanitizarTexto } from "@/shared/lib/security";

export interface ResultadoValidacionCategoria {
  esValido: boolean;
  errores: Record<string, string>;
}

export function validarCrearCategoria(datos: {
  nombre?: unknown;
  descripcion?: unknown;
}): ResultadoValidacionCategoria {
  const errores: Record<string, string> = {};

  const resNombre = validarTexto(
    typeof datos.nombre === "string" ? datos.nombre : "",
    3,
    100,
    "Nombre de categoría",
    true
  );
  if (!resNombre.valido && resNombre.mensaje) {
    errores.nombre = resNombre.mensaje;
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
  };
}

export function sanitizarDatosCategoria(datos: {
  nombre: string;
  descripcion?: string;
  icono?: string;
  orden?: number;
}) {
  return {
    nombre: sanitizarTexto(datos.nombre),
    descripcion: datos.descripcion ? sanitizarTexto(datos.descripcion) : null,
    icono: datos.icono ? sanitizarTexto(datos.icono) : null,
    orden: Number.isInteger(datos.orden) ? Number(datos.orden) : 0,
  };
}
