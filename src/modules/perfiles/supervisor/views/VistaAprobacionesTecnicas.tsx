"use client";

import { useEffect, useState } from "react";

interface Rfc {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  ventana_inicio: string;
  ventana_fin: string;
  justificacion: string;
  solicitante_nombre: string | null;
  fecha_creacion: string;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function VistaAprobacionesTecnicas() {
  const [items, setItems] = useState<Rfc[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/perfiles/supervisor/cambios/aprobaciones?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar las aprobaciones.");
    } catch {
      setError("Error de conexión al cargar las aprobaciones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function decidir(idCambio: number, decision: "APROBAR" | "RECHAZAR") {
    const comentario = window.prompt(`Comentario para ${decision === "APROBAR" ? "aprobar" : "rechazar"} la RFC (opcional):`) ?? "";
    setProcesando(idCambio);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/perfiles/supervisor/cambios/aprobaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cambio: idCambio, decision, comentario }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la decisión.");
      else {
        setOk("Decisión registrada correctamente.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la decisión.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Aprobaciones técnicas de RFC</h1>
        <p>Etapa Técnica de las solicitudes de cambio de mi área. Segregación de funciones.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay RFC pendientes de aprobación técnica.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((c) => (
            <div key={c.id_cambio} className="tarjeta-formulario" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{c.codigo_cambio} · {c.titulo}</strong>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {c.tipo_cambio} · Solicita {c.solicitante_nombre ?? "—"} · Creada {fechaHora(c.fecha_creacion)}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#374151", marginTop: 6 }}>
                    Ventana: {fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => decidir(c.id_cambio, "APROBAR")}>
                    Aprobar
                  </button>
                  <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => decidir(c.id_cambio, "RECHAZAR")}>
                    Rechazar
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: "#374151", marginTop: 10, marginBottom: 0 }}>{c.justificacion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
