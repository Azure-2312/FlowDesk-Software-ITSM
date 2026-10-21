"use client";

import React, { useState } from "react";
import { Plus, Edit2, Copy, Trash2, Snowflake, Download, Upload, AlertTriangle, AlertCircle, X, Check } from "@/shared/components/ui/Iconos";

interface PestanaPeriodosCongelamientoProps {
  config: any;
  onChange: (nuevoConfig: any) => void;
  servicios: any[];
  ciList: any[];
  departamentos: any[];
}

export function PestanaPeriodosCongelamiento({ config, onChange, servicios, ciList, departamentos }: PestanaPeriodosCongelamientoProps) {
  const [periodoEditando, setPeriodoEditando] = useState<any | null>(null);
  const [esNuevo, setEsNuevo] = useState(false);
  const [modalCsvAbierto, setModalCsvAbierto] = useState(false);
  const [csvTexto, setCsvTexto] = useState("");
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvResultado, setCsvResultado] = useState<string | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const periodos: any[] = config.periodos || [];
  const motivos = config.motivos_catalogo || [
    { codigo: "cierre_contable", nombre: "Cierre contable / fiscal" },
    { codigo: "campana", nombre: "Campaña comercial o institucional" },
    { codigo: "fin_de_ano", nombre: "Festividades de fin de año" },
    { codigo: "evento_institucional", nombre: "Evento institucional de alta visibilidad" },
    { codigo: "auditoria", nombre: "Auditoría de cumplimiento o regulatoria" },
    { codigo: "otro", nombre: "Otro motivo justificado" }
  ];

  const abrirEditor = (p?: any) => {
    setErrorValidacion(null);
    if (p) {
      setPeriodoEditando({ ...p });
      setEsNuevo(false);
    } else {
      setPeriodoEditando({
        id: Date.now(),
        nombre: "",
        motivo: "cierre_contable",
        descripcion: "",
        fecha_inicio: new Date().toISOString().substring(0, 16),
        fecha_fin: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().substring(0, 16),
        recurrente_anual: false,
        mes_dia_inicio: null,
        mes_dia_fin: null,
        alcance_tipo: "toda_la_organizacion",
        id_servicios: [],
        id_ci: [],
        id_departamentos: [],
        severidad: "bloqueo_total",
        tipos_exentos: ["emergencia"],
        dias_aviso_anticipado: 7,
        color: "#dc2626",
        activo: true
      });
      setEsNuevo(true);
    }
  };

  const guardarPeriodo = () => {
    if (!periodoEditando.nombre.trim()) {
      setErrorValidacion("El nombre del período de congelamiento es obligatorio");
      return;
    }
    if (!periodoEditando.fecha_inicio || !periodoEditando.fecha_fin) {
      setErrorValidacion("Las fechas de inicio y fin son obligatorias");
      return;
    }
    if (new Date(periodoEditando.fecha_inicio) >= new Date(periodoEditando.fecha_fin)) {
      setErrorValidacion("La fecha de inicio debe ser estrictamente anterior a la fecha de fin");
      return;
    }

    let nuevos: any[];
    if (esNuevo) {
      nuevos = [...periodos, periodoEditando];
    } else {
      nuevos = periodos.map((p: any) => p.id === periodoEditando.id ? periodoEditando : p);
    }

    onChange({ ...config, periodos: nuevos });
    setPeriodoEditando(null);
  };

  const duplicarPeriodo = (p: any) => {
    const copia = {
      ...p,
      id: Date.now(),
      nombre: `${p.nombre} (Copia)`,
      activo: false
    };
    onChange({ ...config, periodos: [...periodos, copia] });
  };

  const toggleActivo = (id: any) => {
    const nuevos = periodos.map((p: any) => p.id === id ? { ...p, activo: !p.activo } : p);
    onChange({ ...config, periodos: nuevos });
  };

  const eliminarPeriodo = (id: any) => {
    if (confirm("¿Está seguro de eliminar este período de congelamiento?")) {
      const nuevos = periodos.filter((p: any) => p.id !== id);
      onChange({ ...config, periodos: nuevos });
    }
  };

  const exportarCsv = () => {
    window.open("/api/admin/cambios/notificaciones-calendario/congelamiento/csv", "_blank");
  };

  const importarCsv = async () => {
    setCsvError(null);
    setCsvResultado(null);
    if (!csvTexto.trim()) {
      setCsvError("Por favor ingrese o pegue el contenido CSV");
      return;
    }

    try {
      const res = await fetch("/api/admin/cambios/notificaciones-calendario/congelamiento/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvTexto })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al importar");

      setCsvResultado(`Se importaron ${data.importados} registros.`);
      // Refrescar lista localmente simulada
      setTimeout(() => {
        setModalCsvAbierto(false);
      }, 1500);
    } catch (err: any) {
      setCsvError(err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "14px 18px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Snowflake size={18} color="#dc2626" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
              Períodos de Congelamiento (Change Freeze)
            </h3>
          </div>
          <p style={{ margin: "2px 0 0 0", fontSize: 13, color: "#64748b" }}>
            Bloqueo estricto o condicionado de cambios durante cierres contables, auditorías o campañas institucionales. Evaluado en el registro y programación de RFCs.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={exportarCsv}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontWeight: 500, color: "#334155", cursor: "pointer" }}
          >
            <Download size={14} /> Exportar CSV
          </button>
          <button
            onClick={() => { setModalCsvAbierto(true); setCsvTexto(""); setCsvError(null); setCsvResultado(null); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontWeight: 500, color: "#334155", cursor: "pointer" }}
          >
            <Upload size={14} /> Importar CSV
          </button>
          <button
            onClick={() => abrirEditor()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#dc2626", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, color: "#ffffff", cursor: "pointer" }}
          >
            <Plus size={15} /> Nuevo Período
          </button>
        </div>
      </div>

      {/* Tabla de Períodos */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Nombre y Severidad</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Motivo</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Vigencia (Inicio - Fin)</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Alcance</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Tipos Exentos</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Aviso Previo</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "center" }}>Activo</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {periodos.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                  No hay períodos de congelamiento configurados. Cree uno nuevo para proteger fechas críticas.
                </td>
              </tr>
            ) : (
              periodos.map((p: any, idx: number) => {
                const fIniStr = p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : "";
                const fFinStr = p.fecha_fin ? new Date(p.fecha_fin).toLocaleDateString() : "";
                const severidadColor = p.severidad === "bloqueo_total" ? "#dc2626" : p.severidad === "bloqueo_con_excepcion" ? "#ea580c" : "#d97706";
                const severidadEtiqueta = p.severidad === "bloqueo_total" ? "Bloqueo Total (Solo ECAB)" : p.severidad === "bloqueo_con_excepcion" ? "Bloqueo con Excepción" : "Advertencia";

                return (
                  <tr key={p.id || idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#fbfcfe" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: p.color || "#dc2626", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>{p.nombre}</div>
                          <span style={{ fontSize: 11, color: severidadColor, fontWeight: 600 }}>
                            {severidadEtiqueta}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", textTransform: "capitalize", color: "#475569" }}>
                      {motivos.find((m: any) => m.codigo === p.motivo)?.nombre || p.motivo?.replace(/_/g, " ")}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#334155" }}>
                      <div>{fIniStr} a {fFinStr}</div>
                      {p.recurrente_anual && (
                        <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 500 }}>Recurrente anual ({p.mes_dia_inicio} al {p.mes_dia_fin})</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px", textTransform: "capitalize", color: "#475569" }}>
                      {p.alcance_tipo?.replace(/_/g, " ")}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {(p.tipos_exentos || []).map((t: string) => (
                          <span key={t} style={{ background: "#f1f5f9", color: "#334155", padding: "1px 6px", borderRadius: 4, fontSize: 11, textTransform: "capitalize" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#64748b" }}>
                      {p.dias_aviso_anticipado} días antes
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <button
                        onClick={() => toggleActivo(p.id)}
                        style={{
                          background: p.activo ? "#10b981" : "#cbd5e1",
                          border: "none",
                          color: "#ffffff",
                          borderRadius: 12,
                          width: 36,
                          height: 20,
                          cursor: "pointer",
                          position: "relative"
                        }}
                        title={p.activo ? "Desactivar período" : "Activar período"}
                      >
                        <div style={{
                          position: "absolute",
                          top: 2,
                          left: p.activo ? 18 : 2,
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: "#ffffff",
                          transition: "left 0.2s"
                        }} />
                      </button>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <button
                          onClick={() => abrirEditor(p)}
                          style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                        >
                          <Edit2 size={12} /> Editar
                        </button>
                        <button
                          onClick={() => duplicarPeriodo(p)}
                          style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#475569", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                          title="Duplicar"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={() => eliminarPeriodo(p.id)}
                          style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                          title="Eliminar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Editor de Período */}
      {periodoEditando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 24, width: 680, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>
                {esNuevo ? "Nuevo Período de Congelamiento" : `Editar: ${periodoEditando.nombre}`}
              </h3>
              <button onClick={() => setPeriodoEditando(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            {errorValidacion && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "8px 12px", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
                <AlertCircle size={16} />
                <span>{errorValidacion}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13 }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Nombre del Período *</label>
                <input
                  type="text"
                  value={periodoEditando.nombre}
                  onChange={(e) => setPeriodoEditando({ ...periodoEditando, nombre: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  placeholder="Ej: Cierre de Balance Anual"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Motivo Institucional</label>
                  <select
                    value={periodoEditando.motivo}
                    onChange={(e) => setPeriodoEditando({ ...periodoEditando, motivo: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  >
                    {motivos.map((m: any) => (
                      <option key={m.codigo} value={m.codigo}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Severidad de Bloqueo *</label>
                  <select
                    value={periodoEditando.severidad}
                    onChange={(e) => setPeriodoEditando({ ...periodoEditando, severidad: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  >
                    <option value="bloqueo_total">Bloqueo Total (Solo Emergencia con ECAB)</option>
                    <option value="bloqueo_con_excepcion">Bloqueo con Excepción (Requiere aprobación)</option>
                    <option value="advertencia">Advertencia Informativa</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Fecha y Hora Inicio *</label>
                  <input
                    type="datetime-local"
                    value={periodoEditando.fecha_inicio ? new Date(periodoEditando.fecha_inicio).toISOString().substring(0, 16) : ""}
                    onChange={(e) => setPeriodoEditando({ ...periodoEditando, fecha_inicio: new Date(e.target.value).toISOString() })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Fecha y Hora Fin *</label>
                  <input
                    type="datetime-local"
                    value={periodoEditando.fecha_fin ? new Date(periodoEditando.fecha_fin).toISOString().substring(0, 16) : ""}
                    onChange={(e) => setPeriodoEditando({ ...periodoEditando, fecha_fin: new Date(e.target.value).toISOString() })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={!!periodoEditando.recurrente_anual}
                    onChange={(e) => setPeriodoEditando({ ...periodoEditando, recurrente_anual: e.target.checked })}
                  />
                  <span>Período recurrente todos los años en las mismas fechas</span>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Alcance</label>
                  <select
                    value={periodoEditando.alcance_tipo}
                    onChange={(e) => setPeriodoEditando({ ...periodoEditando, alcance_tipo: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  >
                    <option value="toda_la_organizacion">Toda la organización</option>
                    <option value="servicios">Servicios específicos</option>
                    <option value="ci">CIs específicos</option>
                    <option value="departamentos">Departamentos específicos</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Días de Aviso Previo</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={periodoEditando.dias_aviso_anticipado}
                    onChange={(e) => setPeriodoEditando({ ...periodoEditando, dias_aviso_anticipado: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Color Identificador</label>
                  <input
                    type="color"
                    value={periodoEditando.color || "#dc2626"}
                    onChange={(e) => setPeriodoEditando({ ...periodoEditando, color: e.target.value })}
                    style={{ width: "100%", height: 38, padding: 2, border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 6 }}>Tipos Exentos de Congelamiento</label>
                <div style={{ display: "flex", gap: 16 }}>
                  {["estandar", "normal", "emergencia"].map((t) => (
                    <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, textTransform: "capitalize", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={(periodoEditando.tipos_exentos || []).includes(t)}
                        onChange={(e) => {
                          const actual = periodoEditando.tipos_exentos || [];
                          const nuevos = e.target.checked ? [...actual, t] : actual.filter((x: string) => x !== t);
                          setPeriodoEditando({ ...periodoEditando, tipos_exentos: nuevos });
                        }}
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <button
                onClick={() => setPeriodoEditando(null)}
                style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#ffffff", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
              >
                Cancelar
              </button>
              <button
                onClick={guardarPeriodo}
                style={{ padding: "8px 16px", border: "none", background: "#dc2626", color: "#ffffff", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
              >
                Guardar Período
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Importar CSV */}
      {modalCsvAbierto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 24, width: 560, maxWidth: "90vw", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Importar Períodos de Congelamiento desde CSV</h3>
              <button onClick={() => setModalCsvAbierto(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            {csvError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
                {csvError}
              </div>
            )}
            {csvResultado && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
                {csvResultado}
              </div>
            )}

            <p style={{ margin: "0 0 10px 0", fontSize: 13, color: "#64748b" }}>
              Pegue las líneas CSV con encabezado: <code>nombre,motivo,fecha_inicio,fecha_fin,recurrente_anual,alcance_tipo,severidad,dias_aviso_anticipado,color,activo</code>
            </p>

            <textarea
              rows={6}
              value={csvTexto}
              onChange={(e) => setCsvTexto(e.target.value)}
              placeholder="Cierre Anual,cierre_contable,2026-12-20,2027-01-05,true,toda_la_organizacion,bloqueo_total,15,#ef4444,true"
              style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, fontFamily: "monospace" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
              <button
                onClick={() => setModalCsvAbierto(false)}
                style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#ffffff", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
              >
                Cerrar
              </button>
              <button
                onClick={importarCsv}
                style={{ padding: "8px 16px", border: "none", background: "#2563eb", color: "#ffffff", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
              >
                Procesar e Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
