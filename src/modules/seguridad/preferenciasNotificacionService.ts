import { queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Preferencias de notificación del usuario autenticado.
 * Módulo `seguridad` (convención: servicios en la raíz del módulo).
 */

export interface PreferenciaNotificacion {
  id_usuario: number;
  correo_tickets: boolean;
  correo_cambios: boolean;
  correo_problemas: boolean;
  correo_conocimiento: boolean;
  resumen_diario: boolean;
  canal_preferido: string;
  fecha_actualizacion: string | null;
}

const CANALES_VALIDOS = ["CORREO", "PLATAFORMA", "AMBOS"] as const;

const DEFAULTS: Omit<PreferenciaNotificacion, "id_usuario" | "fecha_actualizacion"> = {
  correo_tickets: true,
  correo_cambios: true,
  correo_problemas: true,
  correo_conocimiento: false,
  resumen_diario: false,
  canal_preferido: "CORREO",
};

export async function obtenerPreferencias(idUsuario: number): Promise<PreferenciaNotificacion> {
  const fila = await queryRow<PreferenciaNotificacion>(
    `SELECT id_usuario, correo_tickets, correo_cambios, correo_problemas,
            correo_conocimiento, resumen_diario, canal_preferido, fecha_actualizacion
     FROM preferencia_notificacion
     WHERE id_usuario = $1`,
    [idUsuario]
  );

  if (fila) return fila;

  return { id_usuario: idUsuario, ...DEFAULTS, fecha_actualizacion: null };
}

function comoBooleano(valor: unknown, porDefecto: boolean): boolean {
  if (typeof valor === "boolean") return valor;
  if (valor === "true" || valor === 1 || valor === "1") return true;
  if (valor === "false" || valor === 0 || valor === "0") return false;
  return porDefecto;
}

export async function guardarPreferencias(
  idUsuario: number,
  body: Record<string, unknown>
): Promise<PreferenciaNotificacion> {
  const canal = String(body.canal_preferido ?? "CORREO").toUpperCase();
  if (!CANALES_VALIDOS.includes(canal as (typeof CANALES_VALIDOS)[number])) {
    throw new ErrorDominio("El canal preferido no es válido.", 400);
  }

  const fila = await queryRow<PreferenciaNotificacion>(
    `INSERT INTO preferencia_notificacion (
       id_usuario, correo_tickets, correo_cambios, correo_problemas,
       correo_conocimiento, resumen_diario, canal_preferido, fecha_actualizacion
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, now())
     ON CONFLICT (id_usuario) DO UPDATE SET
       correo_tickets = EXCLUDED.correo_tickets,
       correo_cambios = EXCLUDED.correo_cambios,
       correo_problemas = EXCLUDED.correo_problemas,
       correo_conocimiento = EXCLUDED.correo_conocimiento,
       resumen_diario = EXCLUDED.resumen_diario,
       canal_preferido = EXCLUDED.canal_preferido,
       fecha_actualizacion = now()
     RETURNING id_usuario, correo_tickets, correo_cambios, correo_problemas,
               correo_conocimiento, resumen_diario, canal_preferido, fecha_actualizacion`,
    [
      idUsuario,
      comoBooleano(body.correo_tickets, DEFAULTS.correo_tickets),
      comoBooleano(body.correo_cambios, DEFAULTS.correo_cambios),
      comoBooleano(body.correo_problemas, DEFAULTS.correo_problemas),
      comoBooleano(body.correo_conocimiento, DEFAULTS.correo_conocimiento),
      comoBooleano(body.resumen_diario, DEFAULTS.resumen_diario),
      canal,
    ]
  );

  return fila as PreferenciaNotificacion;
}
