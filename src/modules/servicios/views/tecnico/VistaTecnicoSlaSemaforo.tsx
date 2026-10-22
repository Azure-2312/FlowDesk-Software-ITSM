"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Ticket } from "@/types";

export default function PaginaSlaSemaforo() {
  const [alcance, setAlcance] = useState<"mios" | "area">("mios");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarTickets() {
    setCargando(true);
    setError(null);
    try {
      const vista = alcance === "mios" ? "asignados" : "departamento";
      const res = await fetch(`/api/tickets?vista=${vista}&_t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "No se pudieron obtener los tickets.");
        return;
      }
      setTickets(data.tickets || []);
    } catch {
      setError("Error de conexión al cargar el semáforo de SLA.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTickets();
  }, [alcance]);

  // Clasificación en 4 columnas Kanban de solo lectura
  const columnas = useMemo(() => {
    const vencidos: Ticket[] = [];
    const enRiesgo: Ticket[] = [];
    const enCurso: Ticket[] = [];
    const enPausa: Ticket[] = [];

    tickets.forEach((t) => {
      if (t.id_estado === 4) {
        enPausa.push(t);
      } else if (t.sla_vencido) {
        vencidos.push(t);
      } else if ((t.minutos_restantes_sla ?? 9999) <= 60 && (t.minutos_restantes_sla ?? 9999) > 0) {
        enRiesgo.push(t);
      } else {
        enCurso.push(t);
      }
    });

    return { vencidos, enRiesgo, enCurso, enPausa };
  }, [tickets]);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1500, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Semáforo de SLA de mi cola
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Tablero visual de seguimiento proactivo según tiempos de expiración y estado de pausas
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", borderRadius: 6, border: "1px solid #cbd5e1", overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setAlcance("mios")}
              style={{
                padding: "7px 14px",
                border: "none",
                fontSize: 12.5,
                fontWeight: alcance === "mios" ? 600 : 500,
                backgroundColor: alcance === "mios" ? "#2563eb" : "#ffffff",
                color: alcance === "mios" ? "#ffffff" : "#475569",
                cursor: "pointer",
              }}
            >
              Mis tickets
            </button>
            <button
              type="button"
              onClick={() => setAlcance("area")}
              style={{
                padding: "7px 14px",
                border: "none",
                fontSize: 12.5,
                fontWeight: alcance === "area" ? 600 : 500,
                backgroundColor: alcance === "area" ? "#2563eb" : "#ffffff",
                color: alcance === "area" ? "#ffffff" : "#475569",
                cursor: "pointer",
              }}
            >
              Mi departamento
            </button>
          </div>

          <button
            type="button"
            onClick={cargarTickets}
            style={{
              padding: "7px 14px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 12.5,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Calculando tiempos de SLA...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Columnas Kanban */}
      {!cargando && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, alignItems: "start" }}>
          {/* Columna 1: Vencidos */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", backgroundColor: "#fee2e2", borderBottom: "1px solid #fecaca", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#991b1b" }}>Vencidos</span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", backgroundColor: "#ef4444", color: "#ffffff", borderRadius: 10 }}>
                {columnas.vencidos.length}
              </span>
            </div>
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 350 }}>
              {columnas.vencidos.length === 0 ? (
                <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>Sin tickets vencidos</div>
              ) : (
                columnas.vencidos.map((t) => (
                  <div key={t.id_ticket} style={{ backgroundColor: "#ffffff", border: "1px solid #fca5a5", borderRadius: 6, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>{t.codigo_ticket}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626" }}>{t.prioridad_codigo}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 8, lineHeight: 1.3 }}>
                      {t.titulo}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 10 }}>
                      {t.solicitante_nombre}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>Plazo expirado</span>
                      <Link href={`/tickets/${t.id_ticket}`} style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>
                        Abrir
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna 2: En Riesgo */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", backgroundColor: "#fef3c7", borderBottom: "1px solid #fde68a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>En riesgo (menor a 1h)</span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", backgroundColor: "#f59e0b", color: "#ffffff", borderRadius: 10 }}>
                {columnas.enRiesgo.length}
              </span>
            </div>
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 350 }}>
              {columnas.enRiesgo.length === 0 ? (
                <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>Sin tickets en riesgo inmediato</div>
              ) : (
                columnas.enRiesgo.map((t) => (
                  <div key={t.id_ticket} style={{ backgroundColor: "#ffffff", border: "1px solid #fcd34d", borderRadius: 6, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>{t.codigo_ticket}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706" }}>{t.prioridad_codigo}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 8, lineHeight: 1.3 }}>
                      {t.titulo}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 10 }}>
                      {t.solicitante_nombre}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#d97706", fontWeight: 600 }}>
                        {t.minutos_restantes_sla} min restantes
                      </span>
                      <Link href={`/tickets/${t.id_ticket}`} style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>
                        Abrir
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna 3: En Curso */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", backgroundColor: "#dcfce7", borderBottom: "1px solid #bbf7d0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>En curso (dentro de plazo)</span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", backgroundColor: "#16a34a", color: "#ffffff", borderRadius: 10 }}>
                {columnas.enCurso.length}
              </span>
            </div>
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 350 }}>
              {columnas.enCurso.length === 0 ? (
                <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>Sin tickets en curso</div>
              ) : (
                columnas.enCurso.map((t) => (
                  <div key={t.id_ticket} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 6, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>{t.codigo_ticket}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>{t.prioridad_codigo}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 8, lineHeight: 1.3 }}>
                      {t.titulo}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 10 }}>
                      {t.solicitante_nombre}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#16a34a" }}>
                        {Math.round((t.minutos_restantes_sla ?? 0) / 60)}h restantes
                      </span>
                      <Link href={`/tickets/${t.id_ticket}`} style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>
                        Abrir
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna 4: En Pausa */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", backgroundColor: "#e2e8f0", borderBottom: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>En pausa</span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", backgroundColor: "#64748b", color: "#ffffff", borderRadius: 10 }}>
                {columnas.enPausa.length}
              </span>
            </div>
            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, minHeight: 350 }}>
              {columnas.enPausa.length === 0 ? (
                <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "24px 0" }}>Sin tickets en pausa</div>
              ) : (
                columnas.enPausa.map((t) => (
                  <div key={t.id_ticket} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 6, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>{t.codigo_ticket}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>{t.prioridad_codigo}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 8, lineHeight: 1.3 }}>
                      {t.titulo}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginBottom: 10 }}>
                      {t.solicitante_nombre}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#64748b" }}>Reloj SLA pausado</span>
                      <Link href={`/tickets/${t.id_ticket}`} style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>
                        Abrir
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
