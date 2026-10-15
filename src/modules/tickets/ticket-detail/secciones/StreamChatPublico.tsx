"use client";

import { useState, FormEvent } from "react";
import { ComentarioTicket } from "@/types";

interface Props {
  comentarios: ComentarioTicket[];
  onEnviarComentario: (comentario: string, esInterno: boolean) => Promise<void>;
  enviandoComentario: boolean;
  placeholder?: string;
  esConsumidor?: boolean;
  soloLectura?: boolean;
}

export default function StreamChatPublico({
  comentarios,
  onEnviarComentario,
  enviandoComentario,
  placeholder = "Escribe un mensaje, actualizacion o consulta...",
  esConsumidor = false,
  soloLectura = false,
}: Props) {
  const [nuevoComentario, setNuevoComentario] = useState("");

  // Filtrar estrictamente solo comentarios publicos
  const comentariosPublicos = comentarios.filter((c) => !c.es_interno);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    await onEnviarComentario(nuevoComentario.trim(), false);
    setNuevoComentario("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          maxHeight: 280,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          paddingRight: 4,
        }}
      >
        {comentariosPublicos.length === 0 ? (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              backgroundColor: "#f8fafc",
              borderRadius: 8,
              border: "1px dashed #cbd5e1",
              color: "#64748b",
              fontSize: 12.5,
            }}
          >
            {esConsumidor
              ? "Aun no hay mensajes en esta conversacion. Puedes escribirle a la mesa de ayuda a continuacion."
              : "No hay comentarios publicos con el usuario en este ticket."}
          </div>
        ) : (
          comentariosPublicos.map((c) => (
            <div
              key={c.id_comentario}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "12px 14px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>
                    {c.usuario_nombre}
                  </span>
                  <span
                    className="badge-itil"
                    style={{
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                      fontSize: 10.5,
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    Mensaje Publico
                  </span>
                </div>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>
                  {new Date(c.fecha_creacion).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#334155",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                }}
              >
                {c.comentario}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Formulario de Envio Publico */}
      {!soloLectura && <form onSubmit={handleSubmit} style={{ marginTop: 4 }}>
        <textarea
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          placeholder={placeholder}
          rows={2}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            fontSize: 12.5,
            marginBottom: 8,
            backgroundColor: "#ffffff",
            resize: "vertical",
          }}
          required
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            className="boton-primario"
            style={{ width: "auto", fontSize: 12.5, padding: "7px 18px" }}
            disabled={enviandoComentario || !nuevoComentario.trim()}
          >
            {enviandoComentario ? "Enviando..." : esConsumidor ? "Enviar mensaje a TI" : "Publicar respuesta al cliente"}
          </button>
        </div>
      </form>}
    </div>
  );
}
