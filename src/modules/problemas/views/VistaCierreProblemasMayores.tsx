"use client";

// ============================================================================
// CIERRE DE PROBLEMAS MAYORES (Aprobador)
// ----------------------------------------------------------------------------
// Los problemas mayores (impacto alto o prioridad crítica) que el Gestor de
// Problemas dejó en "Resuelto" esperan aquí la aceptación del riesgo residual.
// Autorizar los cierra; devolver los regresa a investigación con el motivo.
// ============================================================================

import { useEffect, useState } from "react";
import Link from "next/link";
import { ACCIONES } from "@/shared/lib/capacidades";
import { usePuede } from "@/shared/components/layout/PermisosProvider";

interface Pendiente {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  causa_raiz: string | null;
  workaround: string | null;
  solucion_definitiva: string | null;
  impacto_nombre: string | null;
  prioridad_nombre: string | null;
  asignado_nombre: string | null;
  devoluciones: number;
}

interface Decision {
  id_cierre: number;
  decision: string;
  riesgo_aceptado: string | null;
  comentario: string | null;
  fecha_decision: string;
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  aprobador_nombre: string | null;
}

const campo = { display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 } as const;

function fecha(valor: string) {
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}

export default function VistaCierreProblemasMayores() {
  const puedeDecidir = usePuede(ACCIONES.PROBLEMA_CIERRE_AUTORIZAR);
  const [pendientes, setPendientes] = useState<Pendiente[]>([]);
  const [historial, setHistorial] = useState<Decision[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [textos, setTextos] = useState<Record<number, { riesgo: string; comentario: string }>>({});

  async function cargar() {
    setCargando(true);
    try {
      const res = await fetch(`/api/problemas/mayores?_t=${Date.now()}`);
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudieron cargar los problemas mayores.");
      else {
        setPendientes(Array.isArray(json.pendientes) ? json.pendientes : []);
        setHistorial(Array.isArray(json.historial) ? json.historial : []);
      }
    } catch {
      setError("Error de conexión al cargar los problemas mayores.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function setTexto(id: number, clave: "riesgo" | "comentario", valor: string) {
    setTextos((prev) => ({ ...prev, [id]: { riesgo: prev[id]?.riesgo ?? "", comentario: prev[id]?.comentario ?? "", [clave]: valor } }));
  }

  async function decidir(id: number, decision: "APROBADO" | "RECHAZADO") {
    setProcesando(id);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/problemas/mayores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_problema: id, decision, riesgo_aceptado: textos[id]?.riesgo, comentario: textos[id]?.comentario }),
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
        <h1 className="titulo-pagina">Cierre de problemas mayores</h1>
        <p className="descripcion-pagina">
          Problemas de impacto alto o prioridad crítica que ya están resueltos. Autoriza el cierre aceptando el riesgo residual, o
          devuélvelos a investigación indicando qué falta.
        </p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : pendientes.length === 0 ? (
        <div className="estado-vacio">No hay problemas mayores esperando autorización de cierre.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pendientes.map((p) => (
            <div key={p.id_problema} className="tarjeta-formulario" style={{ margin: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <Link href={`/plataforma/problemas/${p.id_problema}`} style={{ fontWeight: 700, color: "#1d4ed8" }}>{p.codigo_problema}</Link>
                  {" · "}{p.titulo}
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                    Impacto {p.impacto_nombre ?? "—"} · Prioridad {p.prioridad_nombre ?? "—"} · Resolvió {p.asignado_nombre ?? "—"}
                    {p.devoluciones > 0 ? ` · Devuelto ${p.devoluciones} ${p.devoluciones === 1 ? "vez" : "veces"}` : ""}
                  </div>
                </div>
              </div>
              <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 10, fontSize: 12.5, margin: "12px 0" }}>
                <div><dt style={{ fontWeight: 700, color: "#374151" }}>Causa raíz</dt><dd style={{ margin: 0 }}>{p.causa_raiz || "Sin registrar"}</dd></div>
                <div><dt style={{ fontWeight: 700, color: "#374151" }}>Solución definitiva</dt><dd style={{ margin: 0 }}>{p.solucion_definitiva || "Sin registrar"}</dd></div>
                <div><dt style={{ fontWeight: 700, color: "#374151" }}>Workaround</dt><dd style={{ margin: 0 }}>{p.workaround || "—"}</dd></div>
              </dl>
              {puedeDecidir && (
                <div style={{ display: "grid", gap: 10, borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                  <label style={{ fontSize: 12, color: "#374151" }}>
                    Riesgo residual que se acepta (para autorizar)
                    <textarea rows={2} value={textos[p.id_problema]?.riesgo ?? ""} onChange={(e) => setTexto(p.id_problema, "riesgo", e.target.value)} style={campo} />
                  </label>
                  <label style={{ fontSize: 12, color: "#374151" }}>
                    Observación (obligatoria para devolver)
                    <textarea rows={2} value={textos[p.id_problema]?.comentario ?? ""} onChange={(e) => setTexto(p.id_problema, "comentario", e.target.value)} style={campo} />
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="boton-primario" disabled={procesando === p.id_problema} onClick={() => decidir(p.id_problema, "APROBADO")}>
                      Autorizar cierre
                    </button>
                    <button className="boton-secundario" disabled={procesando === p.id_problema} onClick={() => decidir(p.id_problema, "RECHAZADO")}>
                      Devolver a investigación
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="tarjeta-formulario" style={{ marginTop: 20 }}>
        <h2>Decisiones recientes</h2>
        {historial.length === 0 ? (
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Todavía no hay decisiones registradas.</p>
        ) : (
          <table className="tabla-datos">
            <thead>
              <tr><th>Problema</th><th>Decisión</th><th>Riesgo aceptado / observación</th><th>Aprobador</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id_cierre}>
                  <td><Link href={`/plataforma/problemas/${h.id_problema}`} style={{ color: "#1d4ed8" }}>{h.codigo_problema}</Link></td>
                  <td>{h.decision === "APROBADO" ? "Cierre autorizado" : "Devuelto"}</td>
                  <td>{h.riesgo_aceptado || h.comentario || "—"}</td>
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
