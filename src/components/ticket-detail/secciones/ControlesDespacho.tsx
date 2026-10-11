"use client";

import { useState } from "react";
import { Ticket, CatalogosTickets } from "@/types";

interface Props {
  ticket: Ticket;
  catalogos: CatalogosTickets | null;
  onEjecutarAccion: (payload: { id_usuario_asignado: number | null }) => Promise<void>;
  ejecutandoAccion: boolean;
}

export default function ControlesDespacho({
  ticket,
  catalogos,
  onEjecutarAccion,
  ejecutandoAccion,
}: Props) {
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<number | "">(
    ticket.id_usuario_asignado || ""
  );
  const [abierto, setAbierto] = useState(false);

  return (
    <div
      style={{
        backgroundColor: abierto ? "#f8fafc" : "transparent",
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "10px 14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: abierto ? 10 : 0 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block" }}>
            Despacho y Balanceo de Carga
          </span>
          <span style={{ fontSize: 12.5, color: "#0f172a", fontWeight: 600 }}>
            Tecnico actual: {ticket.tecnico_nombre || "Sin asignar"}
          </span>
        </div>

        <button
          type="button"
          className="boton-mini"
          onClick={() => setAbierto(!abierto)}
          style={{ backgroundColor: abierto ? "#e2e8f0" : "#ffffff", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          {abierto ? "Cerrar Panel" : ticket.id_usuario_asignado ? "Reasignar Especialista" : "Asignar Especialista"}
        </button>
      </div>

      {abierto && (
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 10, marginTop: 4 }}>
          <label style={{ fontSize: 12, color: "#475569", display: "block", marginBottom: 6 }}>
            Selecciona el tecnico responsable segun su carga operativa:
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              value={tecnicoSeleccionado}
              onChange={(e) => setTecnicoSeleccionado(e.target.value ? Number(e.target.value) : "")}
              style={{
                flex: 1,
                minWidth: 260,
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 12.5,
                backgroundColor: "#ffffff",
              }}
            >
              <option value="">Selecciona un tecnico disponible...</option>
              {catalogos?.tecnicos.map((tec) => (
                <option key={tec.id_usuario} value={tec.id_usuario}>
                  {tec.nombre} ({tec.correo}) {tec.tickets_activos !== undefined ? `[${tec.tickets_activos} activos]` : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", fontSize: 12, padding: "7px 16px" }}
              onClick={async () => {
                await onEjecutarAccion({ id_usuario_asignado: tecnicoSeleccionado ? Number(tecnicoSeleccionado) : null });
                setAbierto(false);
              }}
              disabled={ejecutandoAccion || !tecnicoSeleccionado}
            >
              {ejecutandoAccion ? "Guardando..." : "Confirmar Asignacion"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
