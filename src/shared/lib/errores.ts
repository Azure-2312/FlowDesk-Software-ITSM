/**
 * Error de dominio reutilizable por los servicios de modulo.
 *
 * Permite que la capa de servicio valide reglas de negocio y que el
 * controlador (capa web) traduzca el resultado a una respuesta HTTP sin
 * duplicar mensajes ni codigos de estado.
 */
export class ErrorDominio extends Error {
  readonly estado: number;

  constructor(mensaje: string, estado = 400) {
    super(mensaje);
    this.name = "ErrorDominio";
    this.estado = estado;
  }
}

/** Respuesta JSON de error uniforme para los controladores. */
export function respuestaError(error: unknown, mensajeInterno: string) {
  if (error instanceof ErrorDominio) {
    return { error: error.message, status: error.estado };
  }
  return { error: mensajeInterno, status: 500 };
}
