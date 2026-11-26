"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TablaDobleScroll } from "@/shared/components/ui/TablaDobleScroll";

interface ErrorConocidoItem {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  descripcion: string;
  estado_nombre: string;
  id_impacto: number;
  impacto_nombre?: string;
  id_urgencia: number;
  urgencia_nombre?: string;
  metodo_analisis: string | null;
  causa_raiz: string | null;
  workaround: string | null;
  incidentes_asociados?: { codigo_ticket: string; titulo: string }[];
}

export default function VistaKedb() {
  const router = useRouter();
  const [pestanaActiva, setPestanaActiva] = useState<"plantillas" | "registrar" | "aprobar">("plantillas");
  const [items, setItems] = useState<ErrorConocidoItem[]>([]);
  const [propuestas, setPropuestas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Estado del formulario de nuevo error conocido
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    causa_raiz: "",
    workaround: "",
    id_impacto: 2,
    id_urgencia: 2,
    metodo_analisis: "5_porques",
  });

  async function cargarKedb() {
    setCargando(true);
    setError(null);
    try {
      const [resKedb, resTodos] = await Promise.all([
        fetch(`/api/problemas?kedb=true&_t=${Date.now()}`),
        fetch(`/api/problemas?vista=todos&_t=${Date.now()}`),
      ]);

      const dataKedb = await resKedb.json();
      if (resKedb.ok) {
        setItems(Array.isArray(dataKedb) ? dataKedb : []);
      } else {
        setError(dataKedb.error || "No se pudieron cargar los errores conocidos.");
      }

      if (resTodos.ok) {
        const dataTodos = await resTodos.json();
        if (Array.isArray(dataTodos)) {
          const pends = dataTodos.filter(
            (p: any) => !p.es_error_conocido && (p.causa_raiz || p.workaround)
          );
          setPropuestas(pends);
        }
      }
    } catch {
      setError("Error de conexión al cargar la base de errores conocidos (KEDB).");
    } finally {
      setCargando(false);
    }
  }

  async function aprobarKedb(idProblema: number) {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch(`/api/problemas/${idProblema}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ es_error_conocido: true, id_estado: 4 }),
      });
      if (res.ok) {
        setOk("Publicación en KEDB aprobada exitosamente.");
        await cargarKedb();
      } else {
        const j = await res.json();
        setError(j.error || "No se pudo aprobar la publicación.");
      }
    } catch {
      setError("Error de conexión al aprobar KEDB.");
    } finally {
      setProcesando(false);
    }
  }

  async function rechazarKedb(idProblema: number) {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch(`/api/problemas/${idProblema}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ es_error_conocido: false, id_estado: 2 }),
      });
      if (res.ok) {
        setOk("Caso devuelto a investigación.");
        await cargarKedb();
      } else {
        const j = await res.json();
        setError(j.error || "No se pudo rechazar.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setProcesando(false);
    }
  }

  useEffect(() => {
    cargarKedb();
  }, []);

  async function registrarErrorConocido(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim() || form.titulo.trim().length < 5) {
      setError("El título debe tener al menos 5 caracteres.");
      return;
    }
    if (!form.descripcion.trim() || form.descripcion.trim().length < 15) {
      setError("La descripción debe tener al menos 15 caracteres.");
      return;
    }
    if (!form.causa_raiz.trim()) {
      setError("Debe documentar la causa raíz identificada para este error conocido.");
      return;
    }
    if (!form.workaround.trim()) {
      setError("Debe documentar la solución temporal (workaround) para mitigación rápida.");
      return;
    }

    setProcesando(true);
    setError(null);
    setOk(null);

    try {
      const res = await fetch("/api/problemas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          causa_raiz: form.causa_raiz.trim(),
          workaround: form.workaround.trim(),
          id_impacto: form.id_impacto,
          id_urgencia: form.id_urgencia,
          metodo_analisis: form.metodo_analisis,
          es_error_conocido: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No fue posible registrar el error conocido.");
      } else {
        setOk(`Error conocido registrado exitosamente con código ${data.codigo_problema || ""}.`);
        setForm({
          titulo: "",
          descripcion: "",
          causa_raiz: "",
          workaround: "",
          id_impacto: 2,
          id_urgencia: 2,
          metodo_analisis: "5_porques",
        });
        await cargarKedb();
        setPestanaActiva("plantillas");
      }
    } catch {
      setError("Error de conexión al registrar el error conocido.");
    } finally {
      setProcesando(false);
    }
  }

  const itemsFiltrados = items.filter((k) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      k.codigo_problema.toLowerCase().includes(q) ||
      k.titulo.toLowerCase().includes(q) ||
      (k.descripcion && k.descripcion.toLowerCase().includes(q)) ||
      (k.causa_raiz && k.causa_raiz.toLowerCase().includes(q)) ||
      (k.workaround && k.workaround.toLowerCase().includes(q))
    );
  });

  return (
    <div className="vista-contenedor">
      {/* 1. Cabecera */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="titulo-pagina">
          Base de errores conocidos (KEDB)
        </h1>
        <p className="descripcion-pagina">
          Repositorio institucional de causas raíz documentadas y soluciones temporales (workarounds) para acelerar la resolución de incidentes.
        </p>
      </div>

      {ok && (
        <div style={{ padding: "12px 16px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          {ok}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* 2. Selector de Pestañas */}
      <div className="pestanas">
        <button
          type="button"
          onClick={() => setPestanaActiva("plantillas")}
          className={pestanaActiva === "plantillas" ? "pestana pestana-activa" : "pestana"}
        >
          <span>Catálogo de errores conocidos</span>
          <span style={{ fontSize: 11, backgroundColor: pestanaActiva === "plantillas" ? "#dbeafe" : "#f1f5f9", color: pestanaActiva === "plantillas" ? "#1e40af" : "#64748b", padding: "2px 8px", borderRadius: 999 }}>
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("registrar")}
          className={pestanaActiva === "registrar" ? "pestana pestana-activa" : "pestana"}
        >
          <span>Registrar error conocido</span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("aprobar")}
          className={pestanaActiva === "aprobar" ? "pestana pestana-activa" : "pestana"}
        >
          <span>Aprobar publicaciones</span>
          <span style={{ fontSize: 11, backgroundColor: propuestas.length > 0 ? "#fef3c7" : "#f1f5f9", color: propuestas.length > 0 ? "#92400e" : "#64748b", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
            {propuestas.length}
          </span>
        </button>
      </div>

      {/* 3. Contenido: Pestaña Plantillas / Catálogo */}
      {pestanaActiva === "plantillas" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Buscar error conocido por síntoma, causa raíz o workaround..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: 420,
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                backgroundColor: "#ffffff",
              }}
            />
            <div style={{ fontSize: 12.5, color: "#64748b" }}>
              Mostrando {itemsFiltrados.length} de {items.length} artículos KEDB
            </div>
          </div>

          {cargando ? (
            <div style={{ padding: 48, textAlign: "center", color: "#64748b", fontSize: 14 }}>
              Cargando catálogo de errores conocidos (KEDB)...
            </div>
          ) : itemsFiltrados.length === 0 ? (
            <div className="estado-vacio">
              No se encontraron errores conocidos registrados.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {itemsFiltrados.map((k) => (
                <div
                  key={k.id_problema}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    padding: "20px 24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#be185d", backgroundColor: "#fce7f3", padding: "2px 8px", borderRadius: 4, border: "1px solid #f472b6" }}>
                          {k.codigo_problema}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#ecfdf5", color: "#065f46", padding: "2px 8px", borderRadius: 999 }}>
                          KEDB Oficial
                        </span>
                        <span style={{ fontSize: 11.5, color: "#64748b" }}>
                          Severidad: <strong>Impacto {k.impacto_nombre || (k.id_impacto === 3 ? "Alto" : "Medio")}</strong> · <strong>Urgencia {k.urgencia_nombre || (k.id_urgencia === 3 ? "Alta" : "Media")}</strong>
                        </span>
                      </div>
                      <h3 style={{ fontSize: 16.5, fontWeight: 700, color: "#0f172a", margin: "4px 0" }}>
                        {k.titulo}
                      </h3>
                      <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0 0", lineHeight: 1.45 }}>
                        {k.descripcion}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <Link
                        href={`/plataforma/problemas/crear?titulo=${encodeURIComponent(k.titulo)}&descripcion=${encodeURIComponent(
                          `${k.descripcion}\n\n[Causa Raíz Documentada]: ${k.causa_raiz || "N/A"}\n[Solución Temporal (Workaround)]: ${k.workaround || "N/A"}`
                        )}&impacto=${k.id_impacto || 2}&urgencia=${k.id_urgencia || 2}&metodo=${encodeURIComponent(k.metodo_analisis || "5_porques")}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          backgroundColor: "#2563eb",
                          color: "#ffffff",
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 700,
                          textDecoration: "none",
                          boxShadow: "0 1px 2px rgba(37, 99, 235, 0.2)",
                        }}
                      >
                        <span>Crear problema con esta plantilla</span>
                      </Link>
                    </div>
                  </div>

                  {/* Cuadros comparativos de Causa Raíz vs Solución Temporal */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Causa Raíz Identificada (RCA)
                      </div>
                      <div style={{ fontSize: 12.5, color: "#7f1d1d", marginTop: 4, lineHeight: 1.4 }}>
                        {k.causa_raiz || "Pendiente de formalizar en expediente técnico."}
                      </div>
                    </div>

                    <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #dcfce7", borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Solución Temporal / Workaround (Mitigación Rápida)
                      </div>
                      <div style={{ fontSize: 12.5, color: "#14532d", marginTop: 4, lineHeight: 1.4 }}>
                        {k.workaround || "Sin solución provisional registrada."}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Contenido: Pestaña Registrar Error Conocido */}
      {pestanaActiva === "registrar" && (
        <form onSubmit={registrarErrorConocido} style={{ backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ marginBottom: 18, borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>Registrar Nuevo Error Conocido (KEDB)</h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>
              Publica un artículo de conocimiento de causa raíz con su correspondiente solución de contingencia (Workaround) para soporte técnico.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                Título del Error Conocido *
              </label>
              <input
                type="text"
                placeholder="ej. Saturación de pool de memoria en balanceador perimetral"
                value={form.titulo}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                required
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13.5, boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                Descripción de la Falla y Síntomas Observados *
              </label>
              <textarea
                rows={3}
                placeholder="Describe bajo qué condiciones ocurre la falla, qué errores arroja y qué usuarios resultan afectados..."
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                required
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13.5, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#991b1b", marginBottom: 4 }}>
                  Causa Raíz Identificada (RCA) *
                </label>
                <textarea
                  rows={4}
                  placeholder="Explica técnicamente qué componente o fallo de código origina el problema..."
                  value={form.causa_raiz}
                  onChange={(e) => setForm((p) => ({ ...p, causa_raiz: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, backgroundColor: "#fff5f5", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#166534", marginBottom: 4 }}>
                  Solución Temporal / Workaround (Mitigación Rápida) *
                </label>
                <textarea
                  rows={4}
                  placeholder="Detalla los pasos que el técnico debe aplicar de inmediato para restaurar la operatividad..."
                  value={form.workaround}
                  onChange={(e) => setForm((p) => ({ ...p, workaround: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #86efac", borderRadius: 8, fontSize: 13, backgroundColor: "#f0fdf4", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, backgroundColor: "#f8fafc", padding: 14, borderRadius: 8 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Impacto Típico
                </label>
                <select
                  value={form.id_impacto}
                  onChange={(e) => setForm((p) => ({ ...p, id_impacto: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                >
                  <option value={3}>Alto</option>
                  <option value={2}>Medio</option>
                  <option value={1}>Bajo</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Urgencia Típica
                </label>
                <select
                  value={form.id_urgencia}
                  onChange={(e) => setForm((p) => ({ ...p, id_urgencia: Number(e.target.value) }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                >
                  <option value={3}>Alta</option>
                  <option value={2}>Media</option>
                  <option value={1}>Baja</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Método de Análisis
                </label>
                <select
                  value={form.metodo_analisis}
                  onChange={(e) => setForm((p) => ({ ...p, metodo_analisis: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                >
                  <option value="5_porques">5 Porqués</option>
                  <option value="arbol_fallas">Árbol de Fallas (FTA)</option>
                  <option value="ishikawa">Diagrama de Ishikawa</option>
                  <option value="linea_tiempo">Línea de tiempo</option>
                  <option value="otro">Análisis Técnico Libre</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
            <button
              type="button"
              className="boton-secundario"
              disabled={procesando}
              onClick={() => setPestanaActiva("plantillas")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="boton-primario"
              disabled={procesando || !form.titulo.trim()}
            >
              {procesando ? "Guardando en KEDB..." : "Registrar Error en KEDB"}
            </button>
          </div>
        </form>
      )}

      {/* 5. Pestaña: Aprobar Publicaciones KEDB (Supervisión) */}
      {pestanaActiva === "aprobar" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Propuestas de Errores Conocidos y Soluciones Temporales Pendientes de Aprobación
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
              Revisa los análisis de causa raíz y workarounds documentados por los técnicos resolutores para aprobar su publicación oficial en la base KEDB.
            </p>
          </div>

          {propuestas.length === 0 ? (
            <div className="estado-vacio">
              <div style={{ fontWeight: 600, fontSize: 13.5, color: "#1e293b" }}>No hay publicaciones KEDB pendientes de revisión</div>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: "4px 0 0" }}>
                Todos los análisis y workarounds registrados ya se encuentran aprobados o en investigación.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {propuestas.map((p) => (
                <div
                  key={p.id_problema}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", backgroundColor: "#fef3c7", color: "#92400e", borderRadius: 4, textTransform: "uppercase" }}>
                          Propuesta KEDB
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>{p.codigo_problema}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>{p.titulo}</h3>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="boton-secundario"
                        type="button"
                        disabled={procesando}
                        onClick={() => rechazarKedb(p.id_problema)}
                      >
                        Devolver a investigación
                      </button>
                      <button className="boton-primario"
                        type="button"
                        disabled={procesando}
                        onClick={() => aprobarKedb(p.id_problema)}
                      >
                        Aprobar y publicar en KEDB
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 }}>{p.descripcion}</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, fontSize: 12 }}>
                    <div>
                      <strong style={{ color: "#334155", display: "block", marginBottom: 2 }}>Causa raíz identificada:</strong>
                      <span style={{ color: "#1e293b" }}>{p.causa_raiz || "Pendiente de redacción"}</span>
                    </div>
                    <div>
                      <strong style={{ color: "#334155", display: "block", marginBottom: 2 }}>Solución temporal (workaround):</strong>
                      <span style={{ color: "#1e293b" }}>{p.workaround || "Sin workaround documentado"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
