"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ErrorConocidoItem {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  descripcion: string;
  id_impacto: number;
  id_urgencia: number;
  metodo_analisis: string | null;
  causa_raiz: string | null;
  workaround: string | null;
}

function FormularioProblemasCrear() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [titulo, setTitulo] = useState(searchParams.get("titulo") || "");
  const [descripcion, setDescripcion] = useState(searchParams.get("descripcion") || "");
  const [idImpacto, setIdImpacto] = useState<number>(Number(searchParams.get("impacto")) || 2);
  const [idUrgencia, setIdUrgencia] = useState<number>(Number(searchParams.get("urgencia")) || 2);
  const [metodoAnalisis, setMetodoAnalisis] = useState(searchParams.get("metodo") || "5_porques");

  const [listaKedb, setListaKedb] = useState<ErrorConocidoItem[]>([]);
  const [cargandoKedb, setCargandoKedb] = useState(false);
  const [idKedbSeleccionado, setIdKedbSeleccionado] = useState<string>("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar errores conocidos para permitir prellenado directo en el formulario
  useEffect(() => {
    async function cargarKedb() {
      setCargandoKedb(true);
      try {
        const res = await fetch("/api/problemas?kedb=true");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setListaKedb(data);
        }
      } catch (err) {
        console.error("Error al cargar KEDB:", err);
      } finally {
        setCargandoKedb(false);
      }
    }
    cargarKedb();
  }, []);

  function aplicarPlantillaKedb(idStr: string) {
    setIdKedbSeleccionado(idStr);
    if (!idStr) return;

    const encontrado = listaKedb.find((k) => String(k.id_problema) === idStr);
    if (!encontrado) return;

    setTitulo(encontrado.titulo);
    setDescripcion(
      `${encontrado.descripcion}\n\n[Causa Raíz Documentada]: ${encontrado.causa_raiz || "N/A"}\n[Solución Temporal (Workaround)]: ${encontrado.workaround || "N/A"}`
    );
    setIdImpacto(encontrado.id_impacto || 2);
    setIdUrgencia(encontrado.id_urgencia || 2);
    setMetodoAnalisis(encontrado.metodo_analisis || "5_porques");
  }

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

      router.push("/plataforma/problemas/bandeja?vista=historial");
    } catch {
      setError("Error de conexión al registrar el problema.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "2px 8px", borderRadius: 4 }}>
              Investigación de Problemas (ITIL v4)
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Registrar problema
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            Iniciación formal de investigación de causa raíz según el proceso ITIL Problem Management.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/plataforma/problemas/bandeja?vista=historial");
            }
          }}
          className="boton-secundario"
          style={{ width: "auto", fontSize: 12.5, padding: "8px 16px" }}
        >
          Volver a Historial
        </button>
      </div>

      {/* Banner / Selector de Prellenado desde KEDB */}
      <div
        style={{
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 8,
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e40af" }}>
              Prellenar formulario desde Error Conocido (KEDB)
            </div>
            <div style={{ fontSize: 12, color: "#3b82f6" }}>
              Selecciona un artículo documentado para autocompletar síntomas, severidad y causas.
            </div>
          </div>
        </div>

        <select
          value={idKedbSeleccionado}
          onChange={(e) => aplicarPlantillaKedb(e.target.value)}
          disabled={cargandoKedb || listaKedb.length === 0}
          style={{
            padding: "8px 12px",
            border: "1px solid #93c5fd",
            borderRadius: 6,
            fontSize: 12.5,
            backgroundColor: "#ffffff",
            color: "#1e3a8a",
            fontWeight: 600,
            maxWidth: 340,
          }}
        >
          <option value="">-- Seleccionar Error Conocido --</option>
          {listaKedb.map((k) => (
            <option key={k.id_problema} value={k.id_problema}>
              {k.codigo_problema} - {k.titulo.substring(0, 45)}...
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={registrarProblema} style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
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
            rows={6}
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
              <option value="linea_tiempo">Línea de tiempo</option>
              <option value="arbol_fallas">Árbol de Fallas (FTA)</option>
              <option value="otro">Análisis Técnico Libre</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/plataforma/problemas/bandeja?vista=historial");
              }
            }}
            className="boton-secundario"
            style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="boton-primario"
            style={{ width: "auto", padding: "8px 22px", fontSize: 13 }}
          >
            {guardando ? "Registrando..." : "Registrar problema"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function VistaProblemasCrear() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Cargando formulario...</div>}>
      <FormularioProblemasCrear />
    </Suspense>
  );
}
