// ============================================================================
// SERVICIO CENTRALIZADO DE NOTIFICACIONES IN-APP (N2 - FASE 2)
// ============================================================================
// Único punto de entrada del sistema para la emisión y consulta de eventos.
// Reemplaza integralmente SMTP, WhatsApp, SMS y Webhooks.
// ============================================================================

import { query, transaccion } from "@/shared/lib/db";
import {
  CodigoEventoNotificacion,
  CATALOGO_EVENTOS_NOTIFICACION,
} from "@/shared/lib/eventos-notificacion";

export interface ParametrosNotificar {
  usuarios: number[] | number;
  evento: CodigoEventoNotificacion;
  entidad_tipo: "ticket" | "rfc" | "problema" | "articulo" | "activo" | "delegacion" | "sistema";
  entidad_id?: number | null;
  url_destino?: string;
  variables?: Record<string, any>;
  tituloPersonalizado?: string;
  mensajePersonalizado?: string;
}

export interface NotificacionRegistro {
  id: number;
  usuario_id: number;
  evento: string;
  titulo: string;
  mensaje: string;
  entidad_tipo: string;
  entidad_id: number | null;
  url_destino: string;
  leida: boolean;
  creada_en: string;
  leida_en: string | null;
}

/**
 * Emite una notificación in-app para uno o más usuarios destinatarios.
 */
export async function notificar(params: ParametrosNotificar): Promise<{ emitidas: number }> {
  const { usuarios, evento, entidad_tipo, entidad_id, variables = {} } = params;
  const def = CATALOGO_EVENTOS_NOTIFICACION[evento];

  const { titulo: titDef, mensaje: msjDef, urlDestino: urlDef } = def
    ? def.construirMensaje({ entidadId: entidad_id, ...variables })
    : { titulo: "Notificación del sistema", mensaje: "Tiene una nueva actualización.", urlDestino: "/plataforma/inicio" };

  const tituloFinal = params.tituloPersonalizado || titDef;
  const mensajeFinal = params.mensajePersonalizado || msjDef;
  const urlFinal = params.url_destino || urlDef;

  const listaUsuarios = Array.from(new Set(Array.isArray(usuarios) ? usuarios : [usuarios])).filter(Boolean);
  if (listaUsuarios.length === 0) return { emitidas: 0 };

  await transaccion(async (client) => {
    for (const uid of listaUsuarios) {
      await client.query(
        `INSERT INTO notificaciones 
          (usuario_id, evento, titulo, mensaje, entidad_tipo, entidad_id, url_destino, leida, creada_en)
         VALUES ($1, $2, $3, $4, $5, $6, $7, false, CURRENT_TIMESTAMP)`,
        [uid, evento, tituloFinal, mensajeFinal, entidad_tipo, entidad_id || null, urlFinal]
      );
    }
  });

  return { emitidas: listaUsuarios.length };
}

/**
 * Consulta las notificaciones de un usuario con paginación y filtro.
 */
export async function obtenerNotificacionesUsuario(
  usuarioId: number,
  opciones: { soloSinLeer?: boolean; limite?: number; pagina?: number } = {}
): Promise<{ notificaciones: NotificacionRegistro[]; total: number; noLeidas: number }> {
  const { soloSinLeer = false, limite = 10, pagina = 1 } = opciones;
  const offset = (pagina - 1) * limite;

  const whereClause = soloSinLeer
    ? "WHERE usuario_id = $1 AND leida = false"
    : "WHERE usuario_id = $1";

  const totalRes = await query<{ count: string }>(
    `SELECT count(*) FROM notificaciones ${whereClause}`,
    [usuarioId]
  );
  const total = Number(totalRes[0]?.count || 0);

  const noLeidasRes = await query<{ count: string }>(
    `SELECT count(*) FROM notificaciones WHERE usuario_id = $1 AND leida = false`,
    [usuarioId]
  );
  const noLeidas = Number(noLeidasRes[0]?.count || 0);

  const filas = await query<NotificacionRegistro>(
    `SELECT id, usuario_id, evento, titulo, mensaje, entidad_tipo, entidad_id, url_destino, leida, creada_en, leida_en
     FROM notificaciones
     ${whereClause}
     ORDER BY creada_en DESC
     LIMIT $2 OFFSET $3`,
    [usuarioId, limite, offset]
  );

  return {
    notificaciones: filas,
    total,
    noLeidas,
  };
}

/**
 * Marca una notificación como leída.
 */
export async function marcarNotificacionLeida(idNotificacion: number, usuarioId: number): Promise<boolean> {
  const res = await query(
    `UPDATE notificaciones
     SET leida = true, leida_en = CURRENT_TIMESTAMP
     WHERE id = $1 AND usuario_id = $2`,
    [idNotificacion, usuarioId]
  );
  return true;
}

/**
 * Marca todas las notificaciones de un usuario como leídas.
 */
export async function marcarTodasNotificacionesLeidas(usuarioId: number): Promise<boolean> {
  await query(
    `UPDATE notificaciones
     SET leida = true, leida_en = CURRENT_TIMESTAMP
     WHERE usuario_id = $1 AND leida = false`,
    [usuarioId]
  );
  return true;
}

/**
 * Obtiene el contador instantáneo de notificaciones no leídas para la campana de cabecera.
 */
export async function contarNotificacionesNoLeidas(usuarioId: number): Promise<number> {
  const res = await query<{ count: string }>(
    `SELECT count(*) FROM notificaciones WHERE usuario_id = $1 AND leida = false`,
    [usuarioId]
  );
  return Number(res[0]?.count || 0);
}
