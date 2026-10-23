"use client";

import { useEffect, useState } from "react";

interface Universo {
  tickets: number;
  cambios: number;
  bajas: number;
}

interface Fila {
  id: number;
  codigo: string;
  titulo: string;
  estado: string;
  responsable: string | null;
  fecha_creacion: string | null;
}

const TIPOS = [
  { valor: "tickets", etiqueta: "Tickets" },
  { valor: "cambios", etiqueta: "Cambios (RFC)" },
  { valor: "bajas", etiqueta: "Bajas de activos" },
];

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function VistaMuestreo() {
  const [universo, setUniverso] = useState<Universo | null>(null);
  const [tipo, setTipo] = useState("tickets");
  const [tamano, setTamano] = useState(10);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [generado, setGenerado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/seguridad/muestreo?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setUniverso(json);
      } catch {
        /* silencioso */
      }
    })();
  }, []);

  async function generar() {
    setCargando(true);
    setError(null);
    setGenerado(false);
    try {
      const res = await fetch("/api/seguridad/muestreo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, tamano }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo generar el muestreo.");
      else {
        setFilas(Array.isArray(json.muestra) ? json.muestra : []);
        setGenerado(true);
      }
    } catch {
      setError("Error de conexión al generar el muestreo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Muestreo de auditoría</h1>
        <p>Selecciona muestras aleatorias de tickets, cambios y bajas para revisión.</p>
      </div>

      <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Universo
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              {TIPOS.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}{universo ? ` (${universo[t.valor as keyof Universo]})` : ""}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Tamaño
            <input type="number" min={1} max={100} value={tamano} onChange={(e) => setTamano(Number(e.target.value))} style={{ display: "block", width: 100, marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <button className="boton-primario" style={{ width: "auto" }} onClick={generar} disabled={cargando}>
            {cargando ? "Generando..." : "Generar muestra"}
          </button>
        </div>
        {error && <p role="alert" className="mensaje-error" style={{ marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </div>

      {generado && (
        filas.length === 0 ? (
          <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
            No hay elementos en el universo seleccionado.
          </div>
        ) : (
          <div className="tarjeta-formulario">
            <h2>Muestra de {filas.length} elementos</h2>
            <table className="tabla-datos">
              <thead>
                <tr><th>Código</th><th>Título</th><th>Estado</th><th>Responsable</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={`${f.id}-${f.codigo}`}>
                    <td><strong>{f.codigo}</strong></td>
                    <td>{f.titulo}</td>
                    <td>{f.estado}</td>
                    <td>{f.responsable ?? "—"}</td>
                    <td>{fechaHora(f.fecha_creacion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
