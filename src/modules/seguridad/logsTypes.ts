export interface LogAccesoItem {
  id_log: number;
  id_usuario: number | null;
  usuario_nombre?: string | null;
  correo_intento: string;
  exitoso: boolean;
  ip: string;
  fecha: string;
}
