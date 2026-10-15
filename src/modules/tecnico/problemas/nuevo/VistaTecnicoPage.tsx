"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaginaRegistrarProblema() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [idImpacto, setIdImpacto] = useState(2);
  const [idUrgencia, setIdUrgencia] = useState(2);
  const [metodoAnalisis, setMetodoAnalisis] = useState("5_porques");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function registrarProblema(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || titulo.trim().length < 5) {
      setError("El título debe tener al menos 5 caracteres.");
      return;
    }
    if (!descripcion.trim() || descripcion.trim().length < 15) {
      setError("La descripción debe tener al menos 15 caracteres.");
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      const res = await fetch("/api/problemas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          id_impacto: idImpacto,
          id_urgencia: idUrgencia,
          metodo_analisis: metodoAnalisis,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "No fue posible registrar el problema.");
        return;
      }

      router.push("/tecnico/problemas/asignados");
    } catch {
      setError("Error de conexión al registrar el problema.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Registrar nuevo problema
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
          Iniciación formal de investigación de causa raíz según el proceso ITIL Problem Management
        </p>
      </div>

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={registrarProblema} style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Título del problema *
          </label>
          <input
            type="text"
            placeholder="Ej. Caídas recurrentes del servicio de correo corporativo..."
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              fontSize: 13.5,
              boxSizing: "border-box",
            }}
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Descripción y síntomas observados *
          </label>
          <textarea
            placeholder="Describe detalladamente los síntomas, alcance y condiciones en las que se manifiesta el problema..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={5}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              fontSize: 13.5,
              boxSizing: "border-box",
            }}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Impacto
            </label>
            <select
              value={idImpacto}
              onChange={(e) => setIdImpacto(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13,
              }}
            >
              <option value={3}>Alto</option>
              <option value={2}>Medio</option>
              <option value={1}>Bajo</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Urgencia
            </label>
            <select
              value={idUrgencia}
              onChange={(e) => setIdUrgencia(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13,
              }}
            >
              <option value={3}>Alta</option>
              <option value={2}>Media</option>
              <option value={1}>Baja</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Método de análisis
            </label>
            <select
              value={metodoAnalisis}
              onChange={(e) => setMetodoAnalisis(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13,
              }}
            >
              <option value="5_porques">5 Porqués</option>
              <option value="ishikawa">Diagrama de Ishikawa</option>
              <option value="arbol_fallas">Árbol de Fallas (FTA)</option>
              <option value="otro">Análisis Técnico Libre</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "9px 18px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 13,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            style={{
              padding: "9px 22px",
              backgroundColor: "#2563eb",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
              cursor: guardando ? "not-allowed" : "pointer",
            }}
          >
            {guardando ? "Registrando..." : "Registrar problema"}
          </button>
        </div>
      </form>
    </div>
  );
}
