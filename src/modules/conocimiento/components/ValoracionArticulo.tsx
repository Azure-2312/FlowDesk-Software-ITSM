"use client";

import { useState } from "react";

export type VotoArticulo = "POSITIVO" | "NEGATIVO";

export interface ConteoValoracion {
  utilidad_positiva: number;
  utilidad_negativa: number;
  mi_voto: VotoArticulo | null;
}

interface Props extends ConteoValoracion {
  idArticulo: number;
  /** Avisa los contadores nuevos para que la vista que lo contiene se actualice. */
  onValorado?: (conteo: ConteoValoracion) => void;
}

/**
 * "¿Te resultó útil este artículo?": un voto por usuario. Si la persona ya
 * votó, su elección queda marcada y puede cambiarla.
 */
export default function ValoracionArticulo({
  idArticulo,
  utilidad_positiva,
  utilidad_negativa,
  mi_voto,
  onValorado,
}: Props) {
  const [votando, setVotando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function votar(voto: VotoArticulo) {
    if (votando || voto === mi_voto) return;
    setVotando(true);
    setMensaje(null);
    try {
      const res = await fetch(`/api/conocimiento/${idArticulo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voto_utilidad: voto }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMensaje(data?.error ?? "No se pudo registrar tu valoración. Inténtalo de nuevo.");
        return;
      }
      onValorado?.({
        utilidad_positiva: data.utilidad_positiva,
        utilidad_negativa: data.utilidad_negativa,
        mi_voto: data.mi_voto,
      });
      setMensaje(data.mensaje ?? "¡Gracias! Tu valoración fue registrada.");
    } catch {
      setMensaje("Error de conexión al registrar tu valoración.");
    } finally {
      setVotando(false);
    }
  }

  return (
    <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid #f1f5f9" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
          {mi_voto ? "Ya valoraste este artículo (puedes cambiar tu voto)" : "¿Te resultó útil este artículo?"}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className={mi_voto === "POSITIVO" ? "boton-primario" : "boton-secundario"}
            type="button"
            aria-pressed={mi_voto === "POSITIVO"}
            onClick={() => votar("POSITIVO")}
            disabled={votando}
          >
            Útil ({utilidad_positiva})
          </button>
          <button
            className={mi_voto === "NEGATIVO" ? "boton-peligro" : "boton-secundario"}
            type="button"
            aria-pressed={mi_voto === "NEGATIVO"}
            onClick={() => votar("NEGATIVO")}
            disabled={votando}
          >
            No útil ({utilidad_negativa})
          </button>
        </div>
      </div>
      {mensaje && <div style={{ marginTop: 12, fontSize: 12.5, color: "#475569" }}>{mensaje}</div>}
    </div>
  );
}
