"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Campo = {
  clave: string;
  etiqueta: string;
  tipo: "texto" | "area" | "numero" | "fecha" | "correo" | "lista";
  obligatorio: boolean;
  opciones?: string[];
  ayuda?: string;
};

type Config = {
  perfiles_solicitantes: number[];
  tipos_rfc: string[];
  exige_ci: boolean;
  exige_plan_pruebas: boolean;
  permite_emergencia: boolean;
  campos_personalizados: Campo[];
  exige_rollback: boolean;
  duracion_maxima_horas: number;
};

const inicial: Config = {
  perfiles_solicitantes: [2, 8],
  tipos_rfc: ["ESTANDAR", "NORMAL", "EMERGENCIA"],
  exige_ci: false,
  exige_plan_pruebas: false,
  permite_emergencia: true,
  campos_personalizados: [],
  exige_rollback: true,
  duracion_maxima_horas: 24,
};

function ContenidoConfiguracionRfc() {
  const searchParams = useSearchParams();
  const seccionParam = searchParams.get("seccion");

  const [seccionActiva, setSeccionActiva] = useState<"formulario" | "requisitos" | "aprobaciones">(
    seccionParam === "requisitos"
      ? "requisitos"
      : seccionParam === "aprobaciones"
      ? "aprobaciones"
      : "formulario"
  );

  const [c, setC] = useState<Config>(inicial);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (seccionParam === "requisitos" || seccionParam === "aprobaciones" || seccionParam === "formulario") {
      setSeccionActiva(seccionParam);
    }
  }, [seccionParam]);

  useEffect(() => {
    fetch("/api/cambios/configuracion/rfc", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (r.ok) setC({ ...inicial, ...d, campos_personalizados: d.campos_personalizados || [] });
        else setError(d.error || "No se pudo cargar la configuración de RFC");
      })
      .finally(() => setCargando(false));
  }, []);

  function togglePerfil(id: number) {
    setC((p) => ({
      ...p,
      perfiles_solicitantes: p.perfiles_solicitantes.includes(id)
        ? p.perfiles_solicitantes.filter((x) => x !== id)
        : [...p.perfiles_solicitantes, id],
    }));
  }

  function actualizar(i: number, patch: Partial<Campo>) {
    setC((p) => ({
      ...p,
      campos_personalizados: p.campos_personalizados.map((f, j) => (j === i ? { ...f, ...patch } : f)),
    }));
  }

  async function guardar() {
    setError("");
    setOk("");
    setGuardando(true);
    try {
      const r = await fetch("/api/cambios/configuracion/rfc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "No se guardó");
        return;
      }
      setC({ ...inicial, ...d, campos_personalizados: d.campos_personalizados || [] });
      setOk("Esquema RFC guardado exitosamente. El formulario y la validación del API aplican esta configuración.");
      setTimeout(() => setOk(""), 4000);
    } catch {
      setError("Error de conexión al guardar configuración");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1>Configurador de Gestión de Cambios (RFC)</h1>
          <p className="subtitulo">
            Parametrice los requisitos, campos dinámicos de captura y flujos de evaluación colegiada del comité CAB para el ciclo de vida de cambios tecnológicos.
          </p>
        </div>
      </div>

      {error && <p className="mensaje-error" role="alert" style={{ marginBottom: 16 }}>{error}</p>}
      {ok && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {ok}
        </div>
      )}

      {/* Pestañas de Navegación de Sección RFC */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
        <button
          type="button"
          onClick={() => setSeccionActiva("formulario")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: seccionActiva === "formulario" ? 700 : 500,
            backgroundColor: seccionActiva === "formulario" ? "#2563eb" : "#f1f5f9",
            color: seccionActiva === "formulario" ? "#ffffff" : "#475569",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          Formulario RFC y Campos Dinámicos
        </button>
        <button
          type="button"
          onClick={() => setSeccionActiva("requisitos")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: seccionActiva === "requisitos" ? 700 : 500,
            backgroundColor: seccionActiva === "requisitos" ? "#2563eb" : "#f1f5f9",
            color: seccionActiva === "requisitos" ? "#ffffff" : "#475569",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          Tipos de Cambio y Requisitos Base
        </button>
        <button
          type="button"
          onClick={() => setSeccionActiva("aprobaciones")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: seccionActiva === "aprobaciones" ? 700 : 500,
            backgroundColor: seccionActiva === "aprobaciones" ? "#2563eb" : "#f1f5f9",
            color: seccionActiva === "aprobaciones" ? "#ffffff" : "#475569",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          Flujo de Evaluación, Autorización (CAB) y Revisión
        </button>
      </div>

      {cargando ? (
        <div className="contenedor-tabla" style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
          Cargando configuración RFC…
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {/* SECCIÓN 1: FORMULARIO Y CAMPOS PERSONALIZADOS */}
          {seccionActiva === "formulario" && (
            <>
              <section className="tarjeta-formulario">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 16 }}>Campos Personalizados del Formulario RFC</h2>
                    <p className="subtitulo" style={{ margin: "4px 0 0 0", fontSize: 12.5 }}>
                      Los campos adicionales se almacenan en el registro de cambio y sus validaciones son verificadas estrictamente en el servidor.
                    </p>
                  </div>
                  <button
                    className="boton-secundario"
                    onClick={() =>
                      setC((p) => ({
                        ...p,
                        campos_personalizados: [
                          ...p.campos_personalizados,
                          { clave: `campo_${Date.now().toString().slice(-4)}`, etiqueta: "Nuevo Campo Personalizado", tipo: "texto", obligatorio: false, opciones: [] },
                        ],
                      }))
                    }
                  >
                    Agregar Campo
                  </button>
                </div>

                {c.campos_personalizados.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: 13, fontStyle: "italic", margin: "14px 0" }}>
                    No se han definido campos adicionales. El formulario utilizará los campos base predeterminados.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {c.campos_personalizados.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 150px auto",
                          gap: 10,
                          alignItems: "end",
                          borderBottom: "1px solid #e2e8f0",
                          paddingBottom: 12,
                        }}
                      >
                        <label>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Etiqueta del Campo</span>
                          <input
                            className="input-base"
                            value={f.etiqueta}
                            onChange={(e) => actualizar(i, { etiqueta: e.target.value })}
                          />
                        </label>
                        <label>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Identificador Técnico (Clave)</span>
                          <input
                            className="input-base"
                            value={f.clave}
                            onChange={(e) =>
                              actualizar(i, { clave: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })
                            }
                          />
                        </label>
                        <label>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Tipo de Dato</span>
                          <select
                            className="input-base"
                            value={f.tipo}
                            onChange={(e) => actualizar(i, { tipo: e.target.value as Campo["tipo"] })}
                          >
                            {["texto", "area", "numero", "fecha", "correo", "lista"].map((t) => (
                              <option key={t} value={t}>
                                {t.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={f.obligatorio}
                              onChange={(e) => actualizar(i, { obligatorio: e.target.checked })}
                              style={{ width: 16, height: 16 }}
                            />
                            Obligatorio
                          </label>
                          <button
                            className="boton-mini"
                            type="button"
                            onClick={() =>
                              setC((p) => ({
                                ...p,
                                campos_personalizados: p.campos_personalizados.filter((_, j) => j !== i),
                              }))
                            }
                            style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                          >
                            Eliminar
                          </button>
                        </div>
                        {f.tipo === "lista" && (
                          <label style={{ gridColumn: "1 / span 2" }}>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>Opciones (separadas por coma)</span>
                            <input
                              className="input-base"
                              value={(f.opciones || []).join(", ")}
                              onChange={(e) =>
                                actualizar(i, {
                                  opciones: e.target.value.split(",").map((x) => x.trim()).filter(Boolean),
                                })
                              }
                            />
                          </label>
                        )}
                        <label style={{ gridColumn: f.tipo === "lista" ? "3 / span 2" : "1 / span 4" }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Texto de Ayuda / Placeholder</span>
                          <input
                            className="input-base"
                            value={f.ayuda || ""}
                            onChange={(e) => actualizar(i, { ayuda: e.target.value })}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Vista Previa Interactiva */}
              <section className="tarjeta-formulario">
                <h3 style={{ margin: "0 0 4px 0", fontSize: 15 }}>Vista Previa de la Ficha de Solicitud RFC</h3>
                <p className="subtitulo" style={{ margin: "0 0 16px 0", fontSize: 12 }}>
                  Previsualización en tiempo real del formulario que completará el solicitante técnico.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 14,
                    backgroundColor: "#f8fafc",
                    padding: 18,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <label style={{ fontSize: 13, fontWeight: 600 }}>
                    Título del Cambio *
                    <input className="input-base" placeholder="Título resumido del cambio en infraestructura" disabled />
                  </label>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>
                    Tipo de RFC *
                    <select className="input-base" disabled>
                      <option>Seleccione tipo de RFC</option>
                      {c.tipos_rfc.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  {c.exige_ci && (
                    <label style={{ fontSize: 13, fontWeight: 600 }}>
                      Elemento CI de CMDB Afectado *
                      <select className="input-base" disabled>
                        <option>Seleccionar elemento CMDB afectado</option>
                      </select>
                    </label>
                  )}
                  <label style={{ fontSize: 13, fontWeight: 600 }}>
                    Ventana de Ejecución Máxima ({c.duracion_maxima_horas}h) *
                    <input className="input-base" type="text" placeholder="Inicio y fin programado" disabled />
                  </label>
                  {c.exige_plan_pruebas && (
                    <label style={{ gridColumn: "1 / -1", fontSize: 13, fontWeight: 600 }}>
                      Protocolo y Plan de Pruebas Previas *
                      <textarea className="input-base" rows={2} placeholder="Evidencias en entorno Staging / Laboratorio" disabled />
                    </label>
                  )}
                  {c.exige_rollback && (
                    <label style={{ gridColumn: "1 / -1", fontSize: 13, fontWeight: 600 }}>
                      Plan de Reversión / Rollback Obligatorio *
                      <textarea className="input-base" rows={2} placeholder="Procedimiento de retorno seguro ante fallos" disabled />
                    </label>
                  )}
                  {c.campos_personalizados.map((cp) => (
                    <label key={cp.clave} style={{ fontSize: 13, fontWeight: 600 }}>
                      {cp.etiqueta} {cp.obligatorio ? "*" : ""}
                      {cp.tipo === "area" ? (
                        <textarea className="input-base" rows={2} placeholder={cp.ayuda} disabled />
                      ) : (
                        <input className="input-base" placeholder={cp.ayuda} disabled />
                      )}
                    </label>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* SECCIÓN 2: TIPOS DE CAMBIO Y REQUISITOS */}
          {seccionActiva === "requisitos" && (
            <>
              <section className="tarjeta-formulario">
                <h2 style={{ margin: "0 0 10px 0", fontSize: 16 }}>Perfiles Habilitados para Originar RFCs</h2>
                <p style={{ margin: "0 0 14px 0", fontSize: 12.5, color: "#64748b" }}>
                  Por segregación SoD, el Administrador no crea RFCs operativas. Especifique qué roles técnicos pueden registrar solicitudes:
                </p>
                <div style={{ display: "flex", gap: 24 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={c.perfiles_solicitantes.includes(2)}
                      onChange={() => togglePerfil(2)}
                      style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                    Perfil Técnico Resolutor (L2/L3)
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={c.perfiles_solicitantes.includes(8)}
                      onChange={() => togglePerfil(8)}
                      style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                    Perfil Gestor de Cambios
                  </label>
                </div>
              </section>

              <section className="tarjeta-formulario">
                <h2 style={{ margin: "0 0 10px 0", fontSize: 16 }}>Requisitos Obligatorios y Compuertas Base</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>Exigir Elemento de Configuración Afectado (CMDB)</strong>
                      <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Obliga a vincular el servidor, red o base de datos impactada.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={c.exige_ci}
                      onChange={(e) => setC((p) => ({ ...p, exige_ci: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                  </label>

                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>Exigir Plan de Pruebas de Laboratorio / Staging</strong>
                      <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Obliga a documentar pruebas previas antes de enviar a evaluación.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={c.exige_plan_pruebas}
                      onChange={(e) => setC((p) => ({ ...p, exige_plan_pruebas: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                  </label>

                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>Exigir Plan de Reversión (Rollback) Obligatorio</strong>
                      <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Control estricto ITIL para restaurar el servicio ante incidencias.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={c.exige_rollback}
                      onChange={(e) => setC((p) => ({ ...p, exige_rollback: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                  </label>

                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>Permitir Cambios de Emergencia (ECAB)</strong>
                      <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Habilita el circuito urgente para restaurar servicios caídos.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={c.permite_emergencia}
                      onChange={(e) => setC((p) => ({ ...p, permite_emergencia: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                  </label>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>Duración Máxima de Ventana de Mantenimiento</strong>
                      <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Límite máximo permitido en horas para ejecutar la intervención técnica.</span>
                    </div>
                    <input
                      className="input-base"
                      type="number"
                      min="1"
                      max="720"
                      value={c.duracion_maxima_horas}
                      onChange={(e) => setC((p) => ({ ...p, duracion_maxima_horas: Number(e.target.value) }))}
                      style={{ width: 100 }}
                    />
                  </div>
                </div>
              </section>

              <section className="tarjeta-formulario">
                <h3 style={{ margin: "0 0 10px 0", fontSize: 15 }}>Tipos de RFC Admitidos en la Plataforma</h3>
                {[
                  ["ESTANDAR", "Cambio Estándar (Preautorizado, bajo riesgo y recurrente)"],
                  ["NORMAL", "Cambio Normal (Evaluación colegiada por el comité CAB)"],
                  ["EMERGENCIA", "Cambio de Emergencia (Aprobación expedita por ECAB para incidencias P1)"],
                ].map(([id, label]) => (
                  <label key={id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={c.tipos_rfc.includes(id)}
                      onChange={() =>
                        setC((p) => ({
                          ...p,
                          tipos_rfc: p.tipos_rfc.includes(id)
                            ? p.tipos_rfc.filter((x) => x !== id)
                            : [...p.tipos_rfc, id],
                        }))
                      }
                      style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                    />
                    {label}
                  </label>
                ))}
              </section>
            </>
          )}

          {/* SECCIÓN 3: EVALUACIÓN, AUTORIZACIÓN Y REVISIÓN POSTERIOR */}
          {seccionActiva === "aprobaciones" && (
            <section className="tarjeta-formulario">
              <h2 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Flujo de Evaluación, Autorización y Revisión Posterior (PIR)</h2>
              <p style={{ margin: "0 0 16px 0", fontSize: 12.5, color: "#64748b" }}>
                Gobernanza del circuito de cambio según la tipología ITIL y las compuertas de control de despliegue.
              </p>

              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span className="badge-itil" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>Cambio Estándar</span>
                    <strong style={{ fontSize: 13.5, color: "#0f172a" }}>Preautorizado por Política</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: "#475569" }}>
                    No requiere convocatoria del comité CAB. El solicitante programa la ventana de mantenimiento y ejecuta conforme al protocolo operativo estandarizado (SOP).
                  </p>
                </div>

                <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span className="badge-itil" style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}>Cambio Normal</span>
                    <strong style={{ fontSize: 13.5, color: "#0f172a" }}>Evaluación Colegiada CAB</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: "#475569" }}>
                    Requiere análisis de riesgo y votación mayoritaria del Comité Asesor de Cambios (perfil 7: Aprobador CAB), con coordinación y dictamen final por el Gestor de Cambios (perfil 8).
                  </p>
                </div>

                <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span className="badge-itil" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>Cambio de Emergencia</span>
                    <strong style={{ fontSize: 13.5, color: "#0f172a" }}>Autorización Rápida ECAB</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: "#475569" }}>
                    Convocatoria inmediata del Comité de Emergencia (ECAB). Exige registro de incidente crítico de origen y documentación posterior obligatoria.
                  </p>
                </div>

                <div style={{ padding: 14, backgroundColor: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span className="badge-itil" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Revisión Posterior (PIR)</span>
                    <strong style={{ fontSize: 13.5, color: "#166534" }}>Post-Implementation Review</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: "#166534" }}>
                    Una vez completado el cambio, el Gestor de Cambios valida el cumplimiento de objetivos, evalúa incidencias generadas y emite el acta de cierre o lecciones aprendidas.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* BARRA INFERIOR DE FINALIZACIÓN Y GUARDADO */}
      <div
        className="contenedor-tabla"
        style={{
          marginTop: 24,
          padding: "20px 24px",
          backgroundColor: "#ffffff",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>
              Finalizar y Guardar Configuración RFC
            </strong>
            <span style={{ fontSize: 12.5, color: "#64748b" }}>
              Guarde para persistir los requisitos, validaciones y circuitos de aprobación CAB del ciclo de cambios tecnológicos.
            </span>
          </div>
          <button
            type="button"
            className="boton-primario"
            style={{ width: "auto", minWidth: 240, padding: "12px 28px", fontSize: 13.5, fontWeight: 700 }}
            onClick={guardar}
            disabled={guardando || cargando}
          >
            {guardando ? "Guardando..." : "Guardar Esquema RFC"}
          </button>
        </div>

        {ok && (
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              padding: "10px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {ok}
          </div>
        )}

        {error && (
          <div className="mensaje-error" style={{ margin: 0 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfiguracionRfc() {
  return (
    <Suspense fallback={<div className="vista-contenedor"><p>Cargando configurador de cambios RFC...</p></div>}>
      <ContenidoConfiguracionRfc />
    </Suspense>
  );
}
