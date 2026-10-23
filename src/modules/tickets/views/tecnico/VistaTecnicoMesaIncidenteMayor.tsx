"use client";

import { useEffect, useState } from "react";

interface TicketRef {
  id_ticket: number;
  codigo_ticket: string;
  titulo: string;
  fecha_creacion: string;
}

interface IncidenteMayor {
  id_incidente_mayor: number;
  codigo: string;
  titulo: string;
  descripcion: string | null;
  severidad: string | null;
  estado: string | null;
  sala_virtual: string | null;
  comunicados: string[] | null;
  fecha_declaracion: string | null;
  fecha_cierre: string | null;
  id_problema: number | null;
  codigo_problema: string | null;
  problema_titulo: string | null;
  id_ticket: number | null;
  codigo_ticket: string | null;
  tickets: TicketRef[];
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE");
}

function colorSeveridad(sev: string | null) {
  switch ((sev ?? "").toUpperCase()) {
    case "CRITICA": return { bg: "#fee2e2", fg: "#991b1b" };
    case "ALTA": return { bg: "#ffedd5", fg: "#9a3412" };
    case "MEDIA": return { bg: "#fef9c3", fg: "#854d0e" };
    default: return { bg: "#e2e8f0", fg: "#334155" };
  }
}

export default function VistaTecnicoMesaIncidenteMayor() {
  const [incidentes, setIncidentes] = useState<IncidenteMayor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [comunicado, setComunicado] = useState<Record<number, string>>({});
  const [enviando, setEnviando] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets/incidente-mayor?_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "No se pudieron obtener los incidentes mayores.");
        return;
      }
      setIncidentes(Array.isArray(data.incidentes) ? data.incidentes : []);
    } catch {
      setError("Error de conexión al cargar los incidentes mayores.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function enviarComunicado(id: number) {
    const texto = (comunicado[id] ?? "").trim();
    if (!texto) {
      setError("Escribe el comunicado antes de enviarlo.");
      return;
    }
    setEnviando(id);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/tickets/incidente-mayor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_incidente_mayor: id, comunicado: texto }),
      });
      const data = await res.json();
      if (!res.ok || data.error) setError(data.error || "No se pudo registrar el comunicado.");
      else {
        setOk("Comunicado publicado.");
        setComunicado((prev) => ({ ...prev, [id]: "" }));
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar el comunicado.");
    } finally {
      setEnviando(null);
    }
  }

  const activos = incidentes.filter((i) => (i.estado ?? "").toUpperCase() !== "CERRADO");
  const cerrados = incidentes.filter((i) => (i.estado ?? "").toUpperCase() === "CERRADO");

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Incidente mayor (sala de crisis)</h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Coordinación cuando el Supervisor declara un incidente mayor: línea de tiempo, tickets vinculados y comunicados.
          </p>
        </div>
        <button type="button" onClick={cargar} style={{ padding: "8px 14px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, color: "#334155", cursor: "pointer" }}>
          Actualizar
        </button>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" style={{ color: "#b91c1c", fontWeight: 600, marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : incidentes.length === 0 ? (
        <div style={{ textAlign: "center", color: "#64748b", fontSize: 13, border: "1px dashed #cbd5e1", borderRadius: 10, padding: 32 }}>
          No hay incidentes mayores declarados.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[...activos, ...cerrados].map((i) => {
            const sev = colorSeveridad(i.severidad);
            const activo = (i.estado ?? "").toUpperCase() !== "CERRADO";
            return (
              <div key={i.id_incidente_mayor} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 18, background: "#ffffff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <strong style={{ fontSize: 15, color: "#0f172a" }}>{i.codigo}</strong>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: sev.bg, color: sev.fg, fontWeight: 700 }}>{i.severidad ?? "—"}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: activo ? "#fee2e2" : "#dcfce7", color: activo ? "#991b1b" : "#166534", fontWeight: 700 }}>{i.estado ?? "—"}</span>
                    </div>
                    <div style={{ fontSize: 14, color: "#0f172a", marginTop: 6 }}>{i.titulo}</div>
                    {i.descripcion && <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>{i.descripcion}</div>}
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                      Problema {i.codigo_problema ?? "—"} · Ticket {i.codigo_ticket ?? "—"}
                      {i.sala_virtual ? ` · Sala: ${i.sala_virtual}` : ""}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Línea de tiempo</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, borderLeft: "2px solid #e2e8f0", paddingLeft: 14 }}>
                      <li style={{ fontSize: 12.5, color: "#334155", marginBottom: 6 }}>
                        <strong>Declarado</strong> · {fechaHora(i.fecha_declaracion)}
                      </li>
                      {(i.comunicados ?? []).map((c, idx) => (
                        <li key={idx} style={{ fontSize: 12.5, color: "#334155", marginBottom: 6 }}>{c}</li>
                      ))}
                      {i.fecha_cierre && (
                        <li style={{ fontSize: 12.5, color: "#166534" }}><strong>Cerrado</strong> · {fechaHora(i.fecha_cierre)}</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Tickets vinculados</div>
                    {i.tickets.length === 0 ? (
                      <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>Sin tickets vinculados al problema.</p>
                    ) : (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                        {i.tickets.map((t) => (
                          <li key={t.id_ticket} style={{ fontSize: 12.5, color: "#334155" }}>
                            <strong>{t.codigo_ticket}</strong> · {t.titulo}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {activo && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                    <label style={{ fontSize: 12, color: "#334155", display: "block" }}>
                      Nuevo comunicado
                      <textarea
                        value={comunicado[i.id_incidente_mayor] ?? ""}
                        onChange={(e) => setComunicado((prev) => ({ ...prev, [i.id_incidente_mayor]: e.target.value }))}
                        rows={2}
                        style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={enviando === i.id_incidente_mayor}
                      onClick={() => enviarComunicado(i.id_incidente_mayor)}
                      style={{ marginTop: 8, padding: "8px 16px", backgroundColor: "#1d4ed8", color: "#ffffff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      {enviando === i.id_incidente_mayor ? "Publicando..." : "Publicar comunicado"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
