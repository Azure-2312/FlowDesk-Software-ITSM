"use client";

// ============================================================================
// RENOVACIONES DE LICENCIAS POR MONTO (Aprobador)
// ----------------------------------------------------------------------------
// Licencias cuyo costo anual alcanza el umbral y vencen en los próximos 90
// días. Aprobar extiende la vigencia un año; rechazar deja que venza.
// ============================================================================

import { useEffect, useState } from "react";
import { ACCIONES } from "@/shared/lib/capacidades";
import { usePuede } from "@/shared/components/layout/PermisosProvider";

interface Renovacion {
  id_licencia: number;
  nombre_software: string;
  fabricante: string | null;
  tipo_licencia: string | null;
  cantidad_adquirida: number;
  cantidad_en_uso: number;
  fecha_vencimiento: string;
  costo_anual: number;
  dias_restantes: number;
}

interface Decision {
  id_aprobacion_monto: number;
  decision: string;
  comentario: string | null;
  monto: number;
  fecha_decision: string;
  nombre_software: string;
  aprobador_nombre: string | null;
}

function fecha(valor: string) {
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function soles(valor: number) {
  return `S/ ${Number(valor || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function VistaRenovacionesLicencias() {
  const puedeDecidir = usePuede(ACCIONES.RENOVACION_LICENCIA_DECIDIR);
  const [pendientes, setPendientes] = useState<Renovacion[]>([]);
  const [historial, setHistorial] = useState<Decision[]>([]);
  const [comentarios, setComentarios] = useState<Record<number, string>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    try {
      const res = await fetch(`/api/activos/aprobaciones?_t=${Date.now()}`);
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudieron cargar las renovaciones.");
      else {
        setPendientes(Array.isArray(json.renovaciones) ? json.renovaciones : []);
        setHistorial(Array.isArray(json.historialRenovaciones) ? json.historialRenovaciones : []);
      }
    } catch {
      setError("Error de conexión al cargar las renovaciones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function decidir(id: number, decision: "APROBADO" | "RECHAZADO") {
    setProcesando(id);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/activos/aprobaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "RENOVACION", id, decision, comentario: comentarios[id] ?? "" }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la decisión.");
      else {
        setOk(json.mensaje ?? "Decisión registrada.");
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
        <h1 className="titulo-pagina">Renovaciones de licencias</h1>
        <p className="descripcion-pagina">
          Licencias de costo anual alto que vencen en los próximos 90 días. Aprobar extiende la vigencia un año; rechazar deja que venza.
        </p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : pendientes.length === 0 ? (
        <div className="estado-vacio">No hay renovaciones esperando tu decisión.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pendientes.map((r) => (
            <div key={r.id_licencia} className="tarjeta-formulario" style={{ margin: 0 }}>
              <strong style={{ fontSize: 14 }}>{r.nombre_software}</strong>
              <div style={{ fontSize: 12.5, color: "#374151", marginTop: 4 }}>
                {r.fabricante ?? "—"} · {r.tipo_licencia ?? "—"} · {r.cantidad_en_uso} de {r.cantidad_adquirida} en uso
              </div>
              <div style={{ fontSize: 12.5, marginTop: 4, color: Number(r.dias_restantes) <= 15 ? "#b91c1c" : "#374151" }}>
                Costo anual {soles(r.costo_anual)} · Vence el {fecha(r.fecha_vencimiento)}
                {Number(r.dias_restantes) < 0 ? " (ya venció)" : ` (en ${r.dias_restantes} días)`}
              </div>
              {puedeDecidir && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                  <label style={{ fontSize: 12, color: "#374151", flex: "1 1 260px" }}>
                    Sustento de la decisión
                    <input
                      type="text"
                      value={comentarios[r.id_licencia] ?? ""}
                      onChange={(e) => setComentarios((prev) => ({ ...prev, [r.id_licencia]: e.target.value }))}
                      style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}
                    />
                  </label>
                  <button className="boton-primario" disabled={procesando === r.id_licencia} onClick={() => decidir(r.id_licencia, "APROBADO")}>
                    Aprobar renovación
                  </button>
                  <button className="boton-secundario" disabled={procesando === r.id_licencia} onClick={() => decidir(r.id_licencia, "RECHAZADO")}>
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="tarjeta-formulario" style={{ marginTop: 20 }}>
        <h2>Decisiones recientes</h2>
        {historial.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Todavía no hay decisiones de renovación.</p>
        ) : (
          <table className="tabla-datos">
            <thead>
              <tr><th>Licencia</th><th>Decisión</th><th>Monto</th><th>Sustento</th><th>Aprobador</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id_aprobacion_monto}>
                  <td>{h.nombre_software}</td>
                  <td>{h.decision === "APROBADO" ? "Aprobada" : "Rechazada"}</td>
                  <td>{soles(h.monto)}</td>
                  <td>{h.comentario ?? "—"}</td>
                  <td>{h.aprobador_nombre ?? "—"}</td>
                  <td>{fecha(h.fecha_decision)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
