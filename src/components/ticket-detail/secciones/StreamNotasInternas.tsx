"use client";

import { useState, FormEvent } from "react";
import { ComentarioTicket } from "@/types";

interface Props {
  comentarios: ComentarioTicket[];
  onEnviarComentario: (comentario: string, esInterno: boolean) => Promise<void>;
  enviandoComentario: boolean;
}

export default function StreamNotasInternas({
  comentarios,
  onEnviarComentario,
  enviandoComentario,
}: Props) {
  const [nuevaNota, setNuevaNota] = useState("");

  // Filtrar notas tecnicas internas
  const notasInternas = comentarios.filter((c) => c.es_interno);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nuevaNota.trim()) return;

    await onEnviarComentario(nuevaNota.trim(), true);
    setNuevaNota("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Alerta de Confidencialidad SoD */}
      <div
        style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 6,
          padding: "8px 12px",
          fontSize: 11.5,
          color: "#92400e",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <strong style={{ textTransform: "uppercase", fontSize: 11 }}>Privacidad Garantizada:</strong>
        <span>Estas notas tecnicas (Work Notes) son estrictamente internas para TI. El solicitante nunca tendra acceso a ellas.</span>
      </div>

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
        {notasInternas.length === 0 ? (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              backgroundColor: "#fefce8",
              borderRadius: 8,
              border: "1px dashed #fef08a",
              color: "#854d0e",
              fontSize: 12.5,
            }}
          >
            No hay notas tecnicas registradas todavia. Documenta aqui logs de error, comandos o hipotesis de investigacion.
          </div>
        ) : (
          notasInternas.map((c) => (
            <div
              key={c.id_comentario}
              style={{
                backgroundColor: "#fffdf0",
                border: "1px solid #fef08a",
                borderRadius: 8,
                padding: "12px 14px",
                boxShadow: "0 1px 2px rgba(234, 179, 8, 0.05)",
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
                  <span style={{ fontWeight: 600, color: "#78350f", fontSize: 13 }}>
                    {c.usuario_nombre}
                  </span>
                  <span
                    className="badge-itil"
                    style={{
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      fontSize: 10.5,
                      border: "1px solid #fde68a",
                    }}
                  >
                    Nota Interna TI
                  </span>
                </div>
                <span style={{ color: "#a16207", fontSize: 11 }}>
                  {new Date(c.fecha_creacion).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  color: "#451a03",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  fontFamily: "inherit",
                }}
              >
                {c.comentario}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Formulario de Registro de Nota Interna */}
      <form onSubmit={handleSubmit} style={{ marginTop: 4 }}>
        <textarea
          value={nuevaNota}
          onChange={(e) => setNuevaNota(e.target.value)}
          placeholder="Escribe un reporte de diagnostico, configuracion o apunte privado para el equipo de TI..."
          rows={2}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 6,
            border: "1px solid #fde047",
            backgroundColor: "#fefce8",
            fontSize: 12.5,
            marginBottom: 8,
            resize: "vertical",
          }}
          required
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            className="boton-primario"
            style={{
              width: "auto",
              fontSize: 12.5,
              padding: "7px 18px",
              backgroundColor: "#d97706",
              borderColor: "#b45309",
            }}
            disabled={enviandoComentario || !nuevaNota.trim()}
          >
            {enviandoComentario ? "Guardando..." : "Guardar nota tecnica interna"}
          </button>
        </div>
      </form>
    </div>
  );
}
