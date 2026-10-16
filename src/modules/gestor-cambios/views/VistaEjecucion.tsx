"use client";

import { useEffect, useState } from "react";

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  estado_nombre: string;
  ventana_inicio: string;
  ventana_fin: string;
  ventana_excedida: boolean;
  responsable_nombre: string | null;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function VistaEjecucion() {
  const [items, setItems] = useState<Cambio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [extender, setExtender] = useState<Record<number, { fin: string; motivo: string }>>({});
  const [abierto, setAbierto] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/gestor-cambios/ejecucion?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json?.enEjecucion) ? json.enEjecucion : []);
      else setError(json.error ?? "No se pudo cargar la ejecución.");
    } catch {
      setError("Error de conexión al cargar la ejecución.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function accion(idCambio: number, cuerpo: Record<string, unknown>) {
    setProcesando(idCambio);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/gestor-cambios/ejecucion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cambio: idCambio, ...cuerpo }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo procesar la acción.");
      else {
        setOk(json.mensaje ?? "Acción registrada.");
        setAbierto(null);
        await cargar();
      }
    } catch {
      setError("Error de conexión al procesar la acción.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Seguimiento de ejecución</h1>
        <p>Cambios en ejecución, extensiones de ventana, rollbacks y cierre exitoso o fallido.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay cambios en ejecución en este momento.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((c) => (
            <div key={c.id_cambio} className="tarjeta-formulario" style={{ margin: 0, borderLeft: c.ventana_excedida ? "4px solid #b91c1c" : undefined }}>
              <strong style={{ fontSize: 14 }}>{c.codigo_cambio} · {c.titulo}</strong>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                {c.tipo_cambio} · {c.estado_nombre} · Responsable {c.responsable_nombre ?? "—"}
              </div>
              <div style={{ fontSize: 12, color: c.ventana_excedida ? "#b91c1c" : "#374151", fontWeight: c.ventana_excedida ? 600 : undefined, marginTop: 4 }}>
                Ventana: {fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)} {c.ventana_excedida ? "· excedida" : ""}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => accion(c.id_cambio, { accion: "resultado", resultado: "EXITOSO" })}>Cerrar exitoso</button>
                <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => accion(c.id_cambio, { accion: "resultado", resultado: "ROLLBACK", motivo: "Rollback manual desde el tablero" })}>Rollback</button>
                <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => accion(c.id_cambio, { accion: "resultado", resultado: "FALLIDO", motivo: "Implementación fallida desde el tablero" })}>Marcar fallido</button>
                <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setAbierto(abierto === c.id_cambio ? null : c.id_cambio)}>
                  {abierto === c.id_cambio ? "Cerrar" : "Extender ventana"}
                </button>
              </div>
              {abierto === c.id_cambio && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                  <label style={{ fontSize: 12, color: "#374151" }}>
                    Nueva fecha de fin
                    <input
                      type="datetime-local"
                      value={extender[c.id_cambio]?.fin ?? ""}
                      onChange={(e) => setExtender((prev) => ({ ...prev, [c.id_cambio]: { fin: e.target.value, motivo: prev[c.id_cambio]?.motivo ?? "" } }))}
                      style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}
                    />
                  </label>
                  <label style={{ fontSize: 12, color: "#374151", flex: "1 1 260px" }}>
                    Motivo
                    <input
                      type="text"
                      value={extender[c.id_cambio]?.motivo ?? ""}
                      onChange={(e) => setExtender((prev) => ({ ...prev, [c.id_cambio]: { fin: prev[c.id_cambio]?.fin ?? "", motivo: e.target.value } }))}
                      style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}
                    />
                  </label>
                  <button
                    className="boton-primario"
                    style={{ width: "auto" }}
                    disabled={procesando === c.id_cambio}
                    onClick={() => accion(c.id_cambio, { accion: "extender", ventana_fin: extender[c.id_cambio]?.fin, motivo: extender[c.id_cambio]?.motivo })}
                  >
                    Aplicar extensión
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
