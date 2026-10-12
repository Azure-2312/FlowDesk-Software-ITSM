"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaginaCrearArticulo() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [idCategoria, setIdCategoria] = useState(1);
  const [plantilla, setPlantilla] = useState("libre");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function aplicarPlantilla(tipo: string) {
    setPlantilla(tipo);
    if (tipo === "error_conocido") {
      setContenido(
`### Descripción del problema
Explica aquí la manifestación del incidente...

### Síntomas y mensajes de error
- Síntoma 1
- Error en logs

### Causa raíz identificada
Explicación de la causa técnica...

### Solución temporal (Workaround)
1. Paso 1...
2. Paso 2...
3. Reiniciar el servicio...`
      );
    } else if (tipo === "procedimiento") {
      setContenido(
`### Objetivo del procedimiento
Propósito de esta guía técnica...

### Requisitos previos
- Permiso de administrador
- Herramienta instalada

### Pasos de ejecución
1. Acceder al servidor...
2. Ejecutar el comando...
3. Verificar el estado...

### Verificación y pruebas
Confirmar que el servicio responde correctamente...`
      );
    } else {
      setContenido("");
    }
  }

  async function guardarArticulo(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || titulo.trim().length < 5) {
      setError("El título debe tener al menos 5 caracteres.");
      return;
    }
    if (!contenido.trim() || contenido.trim().length < 20) {
      setError("El contenido debe tener al menos 20 caracteres.");
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      const res = await fetch("/api/conocimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          contenido_markdown: contenido.trim(),
          id_categoria: idCategoria,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "No fue posible guardar el artículo.");
        return;
      }

      router.push("/tecnico/conocimiento/mis-articulos");
    } catch {
      setError("Error de conexión al guardar el artículo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Crear artículo de conocimiento
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
          Redacción de documentación técnica y procedimientos para revisión editorial y publicación
        </p>
      </div>

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <form onSubmit={guardarArticulo} style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Título del artículo *
            </label>
            <input
              type="text"
              placeholder="Ej. Guía para configuración de cliente VPN..."
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

          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Cargar plantilla ITIL
            </label>
            <select
              value={plantilla}
              onChange={(e) => aplicarPlantilla(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13.5,
              }}
            >
              <option value="libre">Formato libre</option>
              <option value="error_conocido">Plantilla Error Conocido</option>
              <option value="procedimiento">Plantilla Procedimiento Estándar</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
            Contenido técnico (Markdown) *
          </label>
          <textarea
            placeholder="Escribe el contenido detallado del artículo..."
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={14}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 6,
              border: "1px solid #cbd5e1",
              fontSize: 13.5,
              fontFamily: "monospace",
              lineHeight: 1.5,
              boxSizing: "border-box",
            }}
            required
          />
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
            {guardando ? "Enviando..." : "Enviar a revisión editorial"}
          </button>
        </div>
      </form>
    </div>
  );
}
