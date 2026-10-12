export interface UsuarioSesion {
  id_usuario: number;
  nombre_usuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
  id_perfil: number;
  nombre_perfil: string;
  perfiles: PerfilAsignado[];
  perfilActivo?: PerfilAsignado;
}

export interface PerfilAsignado {
  id_perfil: number;
  nombre: string;
  es_perfil_defecto?: boolean;
}

export interface CredencialesInput {
  usuario: string;
  clave: string;
  captcha?: string;
}

export interface CaptchaData {
  svg: string;
  texto: string;
}
