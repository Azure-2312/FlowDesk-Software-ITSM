import { generarCaptchaDesafio, verificarCaptcha } from "@/shared/lib/security";

export interface CaptchaResultado {
  token: string;
  svg: string;
}

export function generarNuevoCaptcha(): CaptchaResultado {
  const desafio = generarCaptchaDesafio();
  return {
    token: desafio.token,
    svg: desafio.svg,
  };
}

export function validarCodigoCaptcha(token: string, respuestaUsuario: string): boolean {
  const resultado = verificarCaptcha(token, respuestaUsuario);
  return resultado.valido;
}
