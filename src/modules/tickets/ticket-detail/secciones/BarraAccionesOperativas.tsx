"use client";

import { useState } from "react";
import { Ticket, CatalogosTickets, SesionUsuario } from "@/types";

interface Props {
  ticket: Ticket;
  catalogos: CatalogosTickets | null;
  sesion: SesionUsuario;
  onEjecutarAccion: (payload: any) => Promise<void>;
  onElevarAProblema?: () => Promise<void>;
  ejecutandoAccion: boolean;
  elevandoProblema?: boolean;
}

export default function BarraAccionesOperativas({
  ticket,
  catalogos,
  sesion,
  onEjecutarAccion,
  onElevarAProblema,
  ejecutandoAccion,
  elevandoProblema = false,
}: Props) {
  const [modoAccion, setModoAccion] = useState<"ninguna" | "espera" | "resolver" | "reabrir">("ninguna");
  const [motivoEsperaSeleccionado, setMotivoEsperaSeleccionado] = useState<number>(1);
  const [solucionTexto, setSolucionTexto] = useState("");
  const [categoriaResolucion, setCategoriaResolucion] = useState("CONFIGURACION");
  const [motivoReapertura, setMotivoReapertura] = useState("");

  const idPerfil = sesion.perfilActivo?.id_perfil;
  const esAdmin = idPerfil === 1;
  const esTecnico = idPerfil === 2;
  const esSupervisor = idPerfil === 4;
  const esSupervisorOAdmin = esAdmin || esSupervisor;

  const esTecnicoAsignado = esTecnico && ticket.id_usuario_asignado === sesion.id_usuario;
  const puedeOperar = esSupervisorOAdmin || esTecnicoAsignado;
  const horasDesdeResolucion = ticket.fecha_resolucion
    ? (Date.now() - new Date(ticket.fecha_resolucion).getTime()) / (1000 * 60 * 60)
    : 0;

  if (ticket.es_terminal) {
    return null;
  }

  return (
    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "block" }}>
            Transiciones de Estado ITIL v4
          </span>
          <span style={{ fontSize: 11.5, color: "#64748b" }}>
            {esSupervisorOAdmin
              ? "Control de supervisión: despacho y transiciones de flujo"
              : "Operaciones de mesa técnica sobre el ticket"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {/* Si es técnico y el ticket no está asignado: Tomar ticket */}
          {esTecnico && !ticket.id_usuario_asignado && (
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", fontSize: 12, padding: "6px 12px", backgroundColor: "#2563eb", display: "inline-flex", alignItems: "center", gap: 5 }}
              onClick={() => onEjecutarAccion({ id_usuario_asignado: sesion.id_usuario, id_estado: 3 })}
              disabled={ejecutandoAccion}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {ejecutandoAccion ? "Tomando..." : "Tomar ticket y atender"}
            </button>
          )}

          {/* Iniciar atención si está abierto o asignado */}
          {(ticket.id_estado === 1 || ticket.id_estado === 2) && puedeOperar && (
            <button
              type="button"
              className="boton-mini"
              style={{ backgroundColor: "#f59e0b", color: "#ffffff", borderColor: "#d97706", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
              onClick={() => onEjecutarAccion({ id_estado: 3 })}
              disabled={ejecutandoAccion}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Iniciar atencion
            </button>
          )}

          {/* En proceso -> Pausar SLA o Resolver */}
          {ticket.id_estado === 3 && puedeOperar && (
            <>
              <button
                type="button"
                className="boton-mini"
                style={{ backgroundColor: "#f97316", color: "#ffffff", borderColor: "#ea580c", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
                onClick={() => setModoAccion(modoAccion === "espera" ? "ninguna" : "espera")}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pausar (En espera)
              </button>
              <button
                type="button"
                className="boton-mini"
                style={{ backgroundColor: "#10b981", color: "#ffffff", borderColor: "#059669", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
                onClick={() => setModoAccion(modoAccion === "resolver" ? "ninguna" : "resolver")}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Resolver ticket
              </button>
            </>
          )}

          {/* En espera -> Reanudar */}
          {ticket.id_estado === 4 && puedeOperar && (
            <button
              type="button"
              className="boton-mini"
              style={{ backgroundColor: "#f59e0b", color: "#ffffff", borderColor: "#d97706", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
              onClick={() => onEjecutarAccion({ id_estado: 3 })}
              disabled={ejecutandoAccion}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Reanudar atencion
            </button>
          )}

          {/* Resuelto -> Confirmar o Reabrir */}
          {ticket.id_estado === 5 && (
            <>
              <button
                type="button"
                className="boton-mini"
                style={{ backgroundColor: "#047857", color: "#ffffff", borderColor: "#065f46", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
                onClick={() => onEjecutarAccion({ id_estado: 6 })}
                disabled={ejecutandoAccion}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Cerrar conformidad
              </button>

              {horasDesdeResolucion <= 48 ? (
                <button
                  type="button"
                  className="boton-mini"
                  style={{ backgroundColor: "#dc2626", color: "#ffffff", borderColor: "#b91c1c", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
                  onClick={() => setModoAccion(modoAccion === "reabrir" ? "ninguna" : "reabrir")}
                  disabled={ejecutandoAccion}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 4v6h6" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Reabrir (48h)
                </button>
              ) : (
                <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
                  Ventana 48h vencida
                </span>
              )}
            </>
          )}

          {/* Elevar a Problema ITIL */}
          {ticket.tipo_codigo === "INCIDENTE" && !ticket.id_problema && puedeOperar && onElevarAProblema && (
            <button
              type="button"
              className="boton-mini"
              style={{ backgroundColor: "#7c3aed", color: "#ffffff", borderColor: "#6d28d9", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
              onClick={onElevarAProblema}
              disabled={elevandoProblema || ejecutandoAccion}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {elevandoProblema ? "Elevando..." : "Elevar a Problema ITIL"}
            </button>
          )}
        </div>
      </div>

      {/* Subformulario de Pausa de SLA */}
      {modoAccion === "espera" && (
        <div
          style={{
            backgroundColor: "#fff7ed",
            border: "1px solid #fed7aa",
            padding: 14,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 600, color: "#9a3412", display: "block", marginBottom: 4 }}>
            Motivo reglamentario de pausa del SLA:
          </label>
          <select
            value={motivoEsperaSeleccionado}
            onChange={(e) => setMotivoEsperaSeleccionado(Number(e.target.value))}
            style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #fdba74", marginBottom: 10, fontSize: 12.5 }}
          >
            {catalogos?.motivosEspera.map((m) => (
              <option key={m.id_motivo_espera} value={m.id_motivo_espera}>
                {m.nombre}
              </option>
            ))}
          </select>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="boton-mini" onClick={() => setModoAccion("ninguna")}>
              Cancelar
            </button>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", backgroundColor: "#ea580c" }}
              onClick={async () => {
                await onEjecutarAccion({ id_estado: 4, id_motivo_espera: motivoEsperaSeleccionado });
                setModoAccion("ninguna");
              }}
              disabled={ejecutandoAccion}
            >
              Confirmar y Pausar SLA
            </button>
          </div>
        </div>
      )}

      {/* Subformulario de Resolucion */}
      {modoAccion === "resolver" && (
        <div
          style={{
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            padding: 14,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#065f46", display: "block", marginBottom: 4 }}>
              Causa Raiz / Categoria de Resolucion:
            </label>
            <select
              value={categoriaResolucion}
              onChange={(e) => setCategoriaResolucion(e.target.value)}
              style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #6ee7b7", fontSize: 12.5 }}
            >
              <option value="CONFIGURACION">Configuracion incorrecta / Parametros</option>
              <option value="HARDWARE">Falla fisica / Reparacion de hardware</option>
              <option value="SOFTWARE_BUG">Defecto de software / Parche / Actualizacion</option>
              <option value="CAPACITACION">Capacitacion / Orientacion a usuario</option>
              <option value="RED_CONECTIVIDAD">Problema de red / Telecomunicaciones / VPN</option>
              <option value="ACCESOS_PERMISOS">Habilitacion de accesos / Roles / Contrasena</option>
              <option value="TERCEROS_PROVEEDOR">Falla atribuible a proveedor externo</option>
            </select>
          </div>

          <label style={{ fontSize: 12, fontWeight: 600, color: "#065f46", display: "block", marginBottom: 4 }}>
            Solucion o Workaround Documentado (Obligatorio ITIL v4):
          </label>
          <textarea
            value={solucionTexto}
            onChange={(e) => setSolucionTexto(e.target.value)}
            placeholder="Describe que acciones tecnicas se realizaron para restaurar el servicio..."
            rows={3}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #6ee7b7", fontSize: 12.5, marginBottom: 8 }}
            required
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="boton-mini" onClick={() => setModoAccion("ninguna")}>
              Cancelar
            </button>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", backgroundColor: "#10b981" }}
              onClick={async () => {
                await onEjecutarAccion({
                  id_estado: 5,
                  solucion_aplicada: solucionTexto.trim(),
                  categoria_resolucion: categoriaResolucion,
                });
                setModoAccion("ninguna");
              }}
              disabled={ejecutandoAccion || !solucionTexto.trim()}
            >
              Guardar y Resolver Ticket
            </button>
          </div>
        </div>
      )}

      {/* Subformulario de Reapertura */}
      {modoAccion === "reabrir" && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            padding: 14,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 600, color: "#991b1b", display: "block", marginBottom: 4 }}>
            Motivo obligatorio de reapertura (Ventana 48h):
          </label>
          <textarea
            rows={2}
            className="input-base"
            style={{ width: "100%", fontSize: 12.5, marginBottom: 8 }}
            placeholder="Explica detalladamente por que persiste la falla..."
            value={motivoReapertura}
            onChange={(e) => setMotivoReapertura(e.target.value)}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="boton-mini" onClick={() => setModoAccion("ninguna")}>
              Cancelar
            </button>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", backgroundColor: "#dc2626", borderColor: "#b91c1c" }}
              onClick={async () => {
                if (!motivoReapertura.trim() || motivoReapertura.trim().length < 8) {
                  alert("Debe ingresar un motivo detallado (minimo 8 caracteres).");
                  return;
                }
                await onEjecutarAccion({ es_reapertura: true, motivo_reapertura: motivoReapertura.trim() });
                setModoAccion("ninguna");
              }}
              disabled={ejecutandoAccion}
            >
              Confirmar Reapertura
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
