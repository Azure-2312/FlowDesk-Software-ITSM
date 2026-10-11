"use client";

import { useState } from "react";
import { Ticket, SesionUsuario } from "@/types";

interface Props {
  ticket: Ticket;
  sesion: SesionUsuario;
  onEjecutarAccion: (payload: { calificacion_csat: number; comentario_csat?: string }) => Promise<void>;
  ejecutandoAccion: boolean;
}

export default function TarjetaCalificacionCsat({
  ticket,
  sesion,
  onEjecutarAccion,
  ejecutandoAccion,
}: Props) {
  const [calificacionCsat, setCalificacionCsat] = useState<number>(5);
  const [comentarioCsat, setComentarioCsat] = useState("");

  const esResueltoOCerrado = ticket.id_estado === 5 || ticket.id_estado === 6;
  if (!esResueltoOCerrado) {
    return null;
  }

  const esMiTicketSolicitante = ticket.id_usuario_solicitante === sesion.id_usuario;

  return (
    <div
      style={{
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: 8,
        padding: "14px 16px",
      }}
    >
      <strong style={{ color: "#166534", fontSize: 13, display: "block", marginBottom: 4 }}>
        Evaluacion de Calidad y Satisfaccion del Servicio (CSAT - ITIL 4)
      </strong>

      {ticket.calificacion_csat ? (
        <div style={{ fontSize: 12.5, color: "#14532d" }}>
          Calificacion registrada: <strong>{ticket.calificacion_csat} de 5 estrellas</strong>
          {ticket.comentario_csat && (
            <div style={{ marginTop: 4, fontStyle: "italic" }}>
              Comentario del usuario: &quot;{ticket.comentario_csat}&quot;
            </div>
          )}
          {ticket.fecha_csat && (
            <div style={{ fontSize: 10.5, color: "#15803d", marginTop: 4 }}>
              Evaluado el {new Date(ticket.fecha_csat).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
            </div>
          )}
        </div>
      ) : esMiTicketSolicitante ? (
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: 11.5, color: "#166534", display: "block", marginBottom: 6 }}>
            Por favor califica la atencion recibida por la Mesa de Ayuda:
          </span>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map((estrella) => (
              <button
                key={estrella}
                type="button"
                onClick={() => setCalificacionCsat(estrella)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: `2px solid ${calificacionCsat === estrella ? "#16a34a" : "#cbd5e1"}`,
                  backgroundColor: calificacionCsat === estrella ? "#dcfce7" : "#ffffff",
                  color: calificacionCsat === estrella ? "#15803d" : "#475569",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {estrella} Estrella{estrella > 1 ? "s" : ""}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="input-base"
            style={{ width: "100%", fontSize: 12, marginBottom: 8 }}
            placeholder="Comentario sobre la atencion recibida (opcional)..."
            value={comentarioCsat}
            onChange={(e) => setComentarioCsat(e.target.value)}
          />
          <button
            type="button"
            className="boton-primario"
            style={{ width: "auto", fontSize: 11.5, backgroundColor: "#16a34a", borderColor: "#15803d" }}
            onClick={() =>
              onEjecutarAccion({
                calificacion_csat: calificacionCsat,
                comentario_csat: comentarioCsat.trim() || undefined,
              })
            }
            disabled={ejecutandoAccion}
          >
            {ejecutandoAccion ? "Enviando..." : "Enviar Calificacion CSAT"}
          </button>
        </div>
      ) : (
        <span style={{ fontSize: 11.5, color: "#15803d", fontStyle: "italic" }}>
          Pendiente de evaluacion por parte del solicitante.
        </span>
      )}
    </div>
  );
}
