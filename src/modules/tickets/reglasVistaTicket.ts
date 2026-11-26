// ============================================================================
// REGLAS DE VISTA DEL TICKET POR PERFIL / USUARIO (ITIL v4)
// ============================================================================
// Única fuente de verdad para la configuración "Reglas operativas"
// (clave `vistas_ticket_perfil` en configuracion_sistema). La usan:
//   - la pantalla de configuración (Incidentes/Solicitudes → Reglas operativas)
//   - el detalle del ticket (/plataforma/incidentes|solicitudes|tickets/[id])
// así lo que el administrador configura es exactamente lo que ve cada perfil.
// ============================================================================

export interface ReglasVistaTicket {
  habilitado: boolean;
  ver_incidentes: boolean;
  ver_solicitudes: boolean;
  ver_problemas: boolean;
  ver_cambios: boolean;
  /** Pestaña "Comunicación interna" (notas técnicas, ITIL: registro de trabajo) */
  seccion_notas_internas: boolean;
  /** Pestaña "Comunicación" con el solicitante */
  seccion_respuestas_publicas: boolean;
  /** Elemento de configuración (CI) vinculado */
  seccion_cmdb: boolean;
  /** Compromisos SLA (tiempos objetivo y vencimientos) */
  seccion_costos_sla: boolean;
  /** Línea de tiempo de estados y acciones de transición */
  seccion_transiciones: boolean;
}

export type VistasTicketConfig = Record<string, Partial<ReglasVistaTicket>>;

/** Claves históricas usadas por la configuración para los primeros perfiles */
export const CLAVE_LEGADA_PERFIL: Record<number, string> = {
  1: "administrador",
  2: "tecnico",
  3: "solicitante",
  4: "supervisor",
  5: "gestor_area",
};

export function clavePerfil(idPerfil: number): string {
  return CLAVE_LEGADA_PERFIL[idPerfil] || `perfil_${idPerfil}`;
}

/** Valores por defecto cuando el administrador aún no configuró un perfil */
export function reglasPorDefecto(idPerfil?: number | null): ReglasVistaTicket {
  // Personal de operación y gestión de servicio (ITIL: practicantes) ve el
  // detalle técnico; el solicitante (consumidor del servicio) solo su caso.
  const operativo = idPerfil != null && [1, 2, 4, 6, 8, 9, 10].includes(idPerfil);
  return {
    habilitado: true,
    ver_incidentes: true,
    ver_solicitudes: true,
    ver_problemas: operativo,
    ver_cambios: operativo,
    seccion_notas_internas: operativo,
    seccion_respuestas_publicas: true,
    seccion_cmdb: operativo,
    seccion_costos_sla: operativo,
    // Transiciones: solo practicantes de la práctica (Admin, Técnico, Supervisor)
    seccion_transiciones: idPerfil != null && [1, 2, 4].includes(idPerfil),
  };
}

/**
 * Resuelve las reglas efectivas: configuración del usuario → de su perfil
 * activo → valores por defecto. Los campos no definidos heredan el defecto.
 */
export function resolverReglasVistaTicket(
  vistas: VistasTicketConfig | null | undefined,
  idPerfil?: number | null,
  idUsuario?: number | null
): ReglasVistaTicket {
  const base = reglasPorDefecto(idPerfil);
  if (!vistas) return base;
  const porUsuario = idUsuario != null ? vistas[`usuario_${idUsuario}`] : undefined;
  const porPerfil =
    idPerfil != null ? vistas[clavePerfil(idPerfil)] || vistas[`perfil_${idPerfil}`] : undefined;
  const elegida = porUsuario || porPerfil;
  if (!elegida || elegida.habilitado === false) return base;
  return { ...base, ...elegida, habilitado: true } as ReglasVistaTicket;
}

/** Parámetros operativos del flujo (clave `flujo_estados_acciones`) */
export interface FlujoEstadosAcciones {
  horas_reapertura: number;
  horas_cierre_tacito: number;
  pausar_sla_en_espera: boolean;
  permitir_autoasignacion_n1: boolean;
  exigir_solucion_al_resolver: boolean;
}

export const FLUJO_POR_DEFECTO: FlujoEstadosAcciones = {
  horas_reapertura: 48,
  horas_cierre_tacito: 48,
  pausar_sla_en_espera: true,
  permitir_autoasignacion_n1: true,
  exigir_solucion_al_resolver: true,
};

export function resolverFlujoEstados(valor: Partial<FlujoEstadosAcciones> | null | undefined): FlujoEstadosAcciones {
  return { ...FLUJO_POR_DEFECTO, ...(valor || {}) };
}
