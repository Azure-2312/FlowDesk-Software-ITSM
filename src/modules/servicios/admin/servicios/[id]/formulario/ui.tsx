"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { CampoFormularioServicio, ReglaEscalamientoServicio, ServicioCatalogo } from "@/types";

type Departamento = { id_departamento: number; nombre: string; codigo: string };
const campoVacio = (): CampoFormularioServicio => ({
  clave: "nuevo_campo",
  etiqueta: "Nuevo campo",
  tipo: "texto",
  obligatorio: false,
  ayuda: "",
  opciones: [],
});

export default function FormularioServicioConfig({ id }: { id: string }) {
  const [servicio, setServicio] = useState<ServicioCatalogo | null>(null);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [campos, setCampos] = useState<CampoFormularioServicio[]>([]);
  const [resolver, setResolver] = useState("");
  const [escalamientos, setEscalamientos] = useState<ReglaEscalamientoServicio[]>([]);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    (async () => {
      const [rs, rd] = await Promise.all([
        fetch(`/api/servicios/${id}`, { cache: "no-store" }),
        fetch("/api/departamentos-ti", { cache: "no-store" }),
      ]);
      const [ds, dd] = await Promise.all([rs.json(), rd.json()]);
      if (!rs.ok) {
        setError(ds.error || "No se pudo cargar el servicio");
        return;
      }
      const s = ds.servicio as ServicioCatalogo;
      setServicio(s);
      setCampos((s.esquema_formulario || []).map((c) => ({ ...c, opciones: c.opciones || [] })));
      setResolver(s.id_departamento_resolutor ? String(s.id_departamento_resolutor) : "");
      setEscalamientos(s.reglas_escalamiento || []);
      setDepartamentos(dd.departamentos || []);
    })().catch(() => setError("Error de conexión"));
  }, [id]);

  function actualizar(i: number, patch: Partial<CampoFormularioServicio>) {
    setCampos((xs) => xs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }

  async function guardar() {
    setError("");
    setOk("");
    setGuardando(true);
    try {
      const r = await fetch(`/api/servicios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          esquema_formulario: campos.map((c) => ({
            ...c,
            opciones: c.tipo === "lista" ? c.opciones : [],
          })),
          id_departamento_resolutor: resolver || null,
          reglas_escalamiento: escalamientos,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "No se guardó");
        return;
      }
      setServicio(d.servicio);
      setOk("Formulario, grupo inicial y escalamiento guardados correctamente.");
      setTimeout(() => setOk(""), 4000);
    } catch {
      setError("Error de conexión al guardar");
    } finally {
      setGuardando(false);
    }
  }

  if (!servicio && !error) return <div className="vista-contenedor">Cargando configuración…</div>;

  return (
    <div className="vista-contenedor">
      {/* Cabecera Estandarizada con Acciones a la Derecha */}
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
            Formulario y Enrutamiento del Servicio
          </h1>
          <p className="subtitulo" style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            {servicio ? `[${servicio.codigo_servicio}] ${servicio.nombre}` : ""} · Configuración de captura en el portal y grupo resolutor institucional.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link className="boton-secundario" href="/plataforma/servicios/configuracion" style={{ padding: "8px 14px", textDecoration: "none" }}>
            Volver al catálogo
          </Link>
          <button
            className="boton-primario"
            onClick={guardar}
            disabled={guardando}
            style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
          >
            {guardando ? "Guardando…" : "Guardar Configuración"}
          </button>
        </div>
      </div>

      {error && <p className="mensaje-error" role="alert" style={{ marginBottom: 16 }}>{error}</p>}
      {ok && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {ok}
        </div>
      )}

      {/* ARQUITECTURA SPLIT-SCREEN 50% / 50% */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* COLUMNA IZQUIERDA: GESTIÓN DE CAMPOS Y ENRUTAMIENTO */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="tarjeta-formulario" style={{ backgroundColor: "#ffffff", padding: 20, borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 2px 0", color: "#0f172a" }}>
                  Campos Personalizados del Formulario
                </h2>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                  Defina los atributos requeridos al solicitante en el portal de autoservicio.
                </p>
              </div>
              <button
                type="button"
                className="boton-secundario"
                onClick={() => setCampos((xs) => [...xs, campoVacio()])}
                style={{ fontSize: 12, padding: "6px 12px" }}
              >
                + Agregar campo
              </button>
            </div>

            {campos.length === 0 ? (
              <div style={{ padding: 18, textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1", color: "#64748b", fontSize: 12.5 }}>
                Este servicio no añade campos propios. El formulario conservará los campos base: título, descripción, impacto, urgencia y adjuntos.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {campos.map((c, i) => (
                  <article
                    key={`${i}-${c.clave}`}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: 14,
                      backgroundColor: "#f8fafc",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 600 }}>
                        Etiqueta
                        <input
                          className="input-base"
                          value={c.etiqueta}
                          onChange={(e) => actualizar(i, { etiqueta: e.target.value })}
                          style={{ marginTop: 4 }}
                        />
                      </label>
                      <label style={{ fontSize: 12, fontWeight: 600 }}>
                        Clave interna
                        <input
                          className="input-base"
                          value={c.clave}
                          onChange={(e) => actualizar(i, { clave: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
                          style={{ marginTop: 4 }}
                        />
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "center" }}>
                      <label style={{ fontSize: 12, fontWeight: 600 }}>
                        Tipo de control
                        <select
                          className="input-base"
                          value={c.tipo}
                          onChange={(e) => actualizar(i, { tipo: e.target.value as CampoFormularioServicio["tipo"] })}
                          style={{ marginTop: 4 }}
                        >
                          {[
                            ["texto", "Texto simple"],
                            ["area", "Área de texto largo"],
                            ["numero", "Numérico"],
                            ["fecha", "Fecha"],
                            ["correo", "Correo electrónico"],
                            ["lista", "Lista desplegable"],
                            ["casilla", "Casilla de verificación"],
                          ].map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 18 }}>
                        <input
                          type="checkbox"
                          checked={c.obligatorio}
                          onChange={(e) => actualizar(i, { obligatorio: e.target.checked })}
                          style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                        />
                        Obligatorio
                      </label>

                      <button
                        type="button"
                        onClick={() => setCampos((xs) => xs.filter((_, j) => j !== i))}
                        style={{
                          backgroundColor: "#fef2f2",
                          border: "1px solid #fecaca",
                          color: "#dc2626",
                          padding: "6px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: "pointer",
                          marginTop: 18,
                        }}
                      >
                        Quitar
                      </button>
                    </div>

                    <label style={{ fontSize: 12, fontWeight: 600 }}>
                      Ayuda o instrucciones al usuario
                      <input
                        className="input-base"
                        value={c.ayuda || ""}
                        placeholder="Texto de apoyo que aparecerá debajo del campo..."
                        onChange={(e) => actualizar(i, { ayuda: e.target.value })}
                        style={{ marginTop: 4 }}
                      />
                    </label>

                    {c.tipo === "lista" && (
                      <label style={{ fontSize: 12, fontWeight: 600 }}>
                        Opciones de la lista (separadas por coma)
                        <input
                          className="input-base"
                          value={(c.opciones || []).join(", ")}
                          placeholder="Opción 1, Opción 2, Opción 3..."
                          onChange={(e) =>
                            actualizar(i, {
                              opciones: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                            })
                          }
                          style={{ marginTop: 4 }}
                        />
                      </label>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="tarjeta-formulario" style={{ backgroundColor: "#ffffff", padding: 20, borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 2px 0", color: "#0f172a" }}>
              Grupo Resolutor Inicial y Escalamiento
            </h2>
            <p style={{ margin: "0 0 12px 0", fontSize: 12, color: "#64748b" }}>
              Enrutamiento automático al registrar el requerimiento en el portal.
            </p>
            <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 6 }}>
              Grupo Técnico Responsable
            </label>
            <select
              className="input-base"
              value={resolver}
              onChange={(e) => setResolver(e.target.value)}
              style={{ marginBottom: 16 }}
            >
              <option value="">Mesa de Ayuda (N1) predeterminada</option>
              {departamentos.map((d) => (
                <option key={d.id_departamento} value={d.id_departamento}>
                  {d.nombre} ({d.codigo})
                </option>
              ))}
            </select>

            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
              Reglas de Escalamiento por Vencimiento
            </h3>
            {escalamientos.map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 10, alignItems: "end", marginBottom: 8 }}>
                <label style={{ fontSize: 11.5 }}>
                  Tras (horas)
                  <input
                    className="input-base"
                    type="number"
                    min="1"
                    value={r.despues_horas}
                    onChange={(e) =>
                      setEscalamientos((xs) =>
                        xs.map((x, j) => (j === i ? { ...x, despues_horas: Number(e.target.value) } : x))
                      )
                    }
                  />
                </label>
                <label style={{ fontSize: 11.5 }}>
                  Escalar a
                  <select
                    className="input-base"
                    value={r.id_departamento}
                    onChange={(e) =>
                      setEscalamientos((xs) =>
                        xs.map((x, j) => (j === i ? { ...x, id_departamento: Number(e.target.value) } : x))
                      )
                    }
                  >
                    {departamentos.map((d) => (
                      <option key={d.id_departamento} value={d.id_departamento}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="boton-secundario"
                  type="button"
                  onClick={() => setEscalamientos((xs) => xs.filter((_, j) => j !== i))}
                  style={{ padding: "8px 12px" }}
                >
                  Quitar
                </button>
              </div>
            ))}
            <button
              className="boton-secundario"
              type="button"
              onClick={() =>
                departamentos.length &&
                setEscalamientos((xs) => [
                  ...xs,
                  { despues_horas: 8, id_departamento: departamentos[0].id_departamento },
                ])
              }
              disabled={!departamentos.length}
              style={{ fontSize: 12, padding: "6px 12px", marginTop: 6 }}
            >
              + Agregar regla de escalamiento
            </button>
          </section>
        </div>

        {/* COLUMNA DERECHA: SIMULADOR EN VIVO DEL FORMULARIO EN EL PORTAL */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            border: "2px solid #3b82f6",
            padding: 20,
            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.08)",
            position: "sticky",
            top: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1px solid #e2e8f0", paddingBottom: 10 }}>
            <div>
              <strong style={{ fontSize: 13.5, color: "#0f172a" }}>
                Simulador del Portal de Autoservicio
              </strong>
              <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>
                Previsualización en tiempo real de la captura del usuario solicitante
              </span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, backgroundColor: "#eff6ff", color: "#2563eb" }}>
              En Vivo
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Campos Base Estándar de la Plataforma */}
            <div className="campo">
              <label style={{ fontSize: 12, fontWeight: 600 }}>Título de la Solicitud *</label>
              <input className="input-base" disabled value={`Solicitud de ${servicio?.nombre || "Servicio TI"}`} />
            </div>

            <div className="campo">
              <label style={{ fontSize: 12, fontWeight: 600 }}>Descripción y Justificación *</label>
              <textarea className="input-base" disabled rows={2} placeholder="Describa el detalle de su requerimiento institucional..." />
            </div>

            {/* Campos Dinámicos Configurados */}
            {campos.length === 0 ? (
              <div style={{ padding: 12, textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px dashed #cbd5e1", color: "#64748b", fontSize: 12 }}>
                No hay campos adicionales configurados para este servicio.
              </div>
            ) : (
              campos.map((c) => (
                <div key={c.clave} className="campo">
                  <label style={{ fontSize: 12, fontWeight: 600 }}>
                    {c.etiqueta} {c.obligatorio && <span style={{ color: "#dc2626" }}>*</span>}
                  </label>
                  {c.tipo === "lista" ? (
                    <select className="input-base" disabled>
                      <option>Seleccione una opción...</option>
                      {(c.opciones || []).map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : c.tipo === "area" ? (
                    <textarea className="input-base" disabled placeholder={c.ayuda || "Ingrese información..."} rows={2} />
                  ) : c.tipo === "casilla" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <input type="checkbox" disabled style={{ width: 16, height: 16 }} />
                      <span style={{ fontSize: 12.5, color: "#475569" }}>{c.ayuda || c.etiqueta}</span>
                    </div>
                  ) : (
                    <input className="input-base" disabled type={c.tipo === "correo" ? "email" : c.tipo === "numero" ? "number" : c.tipo === "fecha" ? "date" : "text"} placeholder={c.ayuda || `Ejemplo de ${c.etiqueta}...`} />
                  )}
                  {c.ayuda && c.tipo !== "casilla" && (
                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>{c.ayuda}</span>
                  )}
                </div>
              ))
            )}

            <div style={{ paddingTop: 10, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
              <button type="button" disabled className="boton-primario" style={{ width: "auto", opacity: 0.6, fontSize: 12, padding: "6px 14px" }}>
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
