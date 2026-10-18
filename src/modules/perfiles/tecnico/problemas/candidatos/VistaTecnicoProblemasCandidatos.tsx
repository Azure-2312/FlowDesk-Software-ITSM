"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ticket } from "@/types";

interface GrupoCandidato {
  criterio: string;
  servicio_nombre?: string;
  categoria_nombre?: string;
  totalIncidentes: number;
  tickets: Ticket[];
}

export default function PaginaCandidatosProblema() {
  const router = useRouter();
  const [candidatos, setCandidatos] = useState<GrupoCandidato[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function detectarCandidatos() {
      setCargando(true);
      try {
        const res = await fetch(`/api/tickets?vista=todos&_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          const todos: Ticket[] = data.tickets || [];
          const incidentes = todos.filter((t) => t.id_tipo_ticket === 1);

          // Agrupar por categoría
          const agrupados: Record<string, Ticket[]> = {};
          incidentes.forEach((t) => {
            const cat = t.categoria_nombre || "General";
            if (!agrupados[cat]) agrupados[cat] = [];
            agrupados[cat].push(t);
          });

          const lista: GrupoCandidato[] = Object.entries(agrupados)
            .filter(([_, arr]) => arr.length >= 2)
            .map(([cat, arr]) => ({
              criterio: `Incidentes recurrentes en categoría: ${cat}`,
              categoria_nombre: cat,
              totalIncidentes: arr.length,
              tickets: arr,
            }));

          setCandidatos(lista);
        }
      } catch (e) {
        console.error("Error al detectar candidatos a problema:", e);
      } finally {
        setCargando(false);
      }
    }
    detectarCandidatos();
  }, []);

  function crearProblemaConIncidentes(g: GrupoCandidato) {
    const tituloSugerido = `Problema recurrente detectado en ${g.categoria_nombre}`;
    router.push(`/tecnico/problemas/nuevo?titulo=${encodeURIComponent(tituloSugerido)}`);
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Candidatos a problema (Gestión proactiva)
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
          Identificación de incidentes recurrentes sobre el mismo servicio o categoría para análisis de causa raíz
        </p>
      </div>

      {cargando ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Analizando patrones de incidentes recurrentes...
        </div>
      ) : candidatos.length === 0 ? (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
            No se han detectado incidentes recurrentes
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            No hay grupos de incidentes que superen el umbral de recurrencia en el periodo actual.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {candidatos.map((g, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                padding: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {g.totalIncidentes} incidentes vinculables
                    </span>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                      {g.criterio}
                    </h2>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
                    Patrón detectado por repetición de fallas en la misma clasificación técnica.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => crearProblemaConIncidentes(g)}
                  style={{
                    padding: "7px 14px",
                    backgroundColor: "#2563eb",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  Crear problema con estos incidentes
                </button>
              </div>

              {/* Lista de incidentes del grupo */}
              <div style={{ backgroundColor: "#f8fafc", borderRadius: 6, padding: "8px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Incidentes en este grupo:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {g.tickets.map((t) => (
                    <Link
                      key={t.id_ticket}
                      href={`/tickets/${t.id_ticket}`}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 4,
                        fontSize: 12,
                        color: "#2563eb",
                        textDecoration: "none",
                      }}
                    >
                      {t.codigo_ticket}: {t.titulo}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
