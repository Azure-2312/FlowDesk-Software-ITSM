"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Sun, Download, Upload, AlertCircle, X, Check } from "./Iconos";

interface PestanaFeriadosProps {
  config: any;
  onChange: (nuevoConfig: any) => void;
}

export function PestanaFeriados({ config, onChange }: PestanaFeriadosProps) {
  const [feriadoEditando, setFeriadoEditando] = useState<any | null>(null);
  const [esNuevo, setEsNuevo] = useState(false);
  const [modalCsvAbierto, setModalCsvAbierto] = useState(false);
  const [csvTexto, setCsvTexto] = useState("");
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvResultado, setCsvResultado] = useState<string | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const feriados: any[] = config.feriados || [];
  const politicas = config.politicas || {
    estandar: "bloquear",
    normal: "advertir",
    emergencia: "ignorar",
    fin_de_semana_estandar: "bloquear",
    fin_de_semana_normal: "advertir",
    fin_de_semana_emergencia: "ignorar",
    dias_no_laborables_semana: [6, 0]
  };

  const abrirEditor = (f?: any) => {
    setErrorValidacion(null);
    if (f) {
      setFeriadoEditando({ ...f });
      setEsNuevo(false);
    } else {
      const hoy = new Date().toISOString().substring(0, 10);
      setFeriadoEditando({
        id: Date.now(),
        fecha_inicio: hoy,
        fecha_fin: hoy,
        nombre: "",
        tipo: "nacional",
        alcance: "toda_la_organizacion",
        recurrente_anual: true,
        activo: true
      });
      setEsNuevo(true);
    }
  };

  const guardarFeriado = () => {
    if (!feriadoEditando.nombre.trim()) {
      setErrorValidacion("El nombre del feriado es obligatorio");
      return;
    }
    if (!feriadoEditando.fecha_inicio) {
      setErrorValidacion("La fecha de inicio es obligatoria");
      return;
    }

    let nuevos: any[];
    if (esNuevo) {
      nuevos = [...feriados, feriadoEditando];
    } else {
      nuevos = feriados.map((f: any) => f.id === feriadoEditando.id ? feriadoEditando : f);
    }

    onChange({ ...config, feriados: nuevos });
    setFeriadoEditando(null);
  };

  const toggleActivo = (id: any) => {
    const nuevos = feriados.map((f: any) => f.id === id ? { ...f, activo: !f.activo } : f);
    onChange({ ...config, feriados: nuevos });
  };

  const eliminarFeriado = (id: any) => {
    if (confirm("¿Está seguro de eliminar este feriado del calendario?")) {
      const nuevos = feriados.filter((f: any) => f.id !== id);
      onChange({ ...config, feriados: nuevos });
    }
  };

  const actualizarPolitica = (campo: string, valor: any) => {
    onChange({
      ...config,
      politicas: {
        ...politicas,
        [campo]: valor
      }
    });
  };

  const exportarCsv = () => {
    window.open("/api/admin/cambios/notificaciones-calendario/feriados/csv", "_blank");
  };

  const importarCsv = async () => {
    setCsvError(null);
    setCsvResultado(null);
    if (!csvTexto.trim()) {
      setCsvError("Por favor ingrese o pegue el contenido CSV");
      return;
    }

    try {
      const res = await fetch("/api/admin/cambios/notificaciones-calendario/feriados/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvTexto })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al importar");

      setCsvResultado(`Se importaron ${data.importados} registros exitosamente.`);
      setTimeout(() => {
        setModalCsvAbierto(false);
      }, 1500);
    } catch (err: any) {
      setCsvError(err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Panel Superior: Políticas en Feriados y Fines de Semana */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Sun size={18} color="#d97706" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
            Políticas de Ejecución en Días No Laborables y Feriados
          </h3>
        </div>
        <p style={{ margin: "0 0 16px 0", fontSize: 13, color: "#64748b" }}>
          Regula el comportamiento del sistema cuando una RFC se programa en días no laborables institucionales o feriados nacionales.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, fontSize: 13 }}>
          <div style={{ background: "#f8fafc", padding: 14, borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: 14, color: "#0f172a" }}>Comportamiento en Días Feriados</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Cambio Estándar:</span>
                <select
                  value={politicas.estandar}
                  onChange={(e) => actualizarPolitica("estandar", e.target.value)}
                  style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12 }}
                >
                  <option value="bloquear">Bloquear</option>
                  <option value="advertir">Advertir</option>
                  <option value="ignorar">Ignorar</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Cambio Normal:</span>
                <select
                  value={politicas.normal}
                  onChange={(e) => actualizarPolitica("normal", e.target.value)}
                  style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12 }}
                >
                  <option value="bloquear">Bloquear</option>
                  <option value="advertir">Advertir</option>
                  <option value="ignorar">Ignorar</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Cambio de Emergencia:</span>
                <select
                  value={politicas.emergencia}
                  onChange={(e) => actualizarPolitica("emergencia", e.target.value)}
                  style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12 }}
                >
                  <option value="bloquear">Bloquear</option>
                  <option value="advertir">Advertir</option>
                  <option value="ignorar">Ignorar (Libre)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: 14, borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: 14, color: "#0f172a" }}>Comportamiento en Fin de Semana (Sáb/Dom)</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Cambio Estándar:</span>
                <select
                  value={politicas.fin_de_semana_estandar}
                  onChange={(e) => actualizarPolitica("fin_de_semana_estandar", e.target.value)}
                  style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12 }}
                >
                  <option value="bloquear">Bloquear</option>
                  <option value="advertir">Advertir</option>
                  <option value="ignorar">Ignorar</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Cambio Normal:</span>
                <select
                  value={politicas.fin_de_semana_normal}
                  onChange={(e) => actualizarPolitica("fin_de_semana_normal", e.target.value)}
                  style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12 }}
                >
                  <option value="bloquear">Bloquear</option>
                  <option value="advertir">Advertir</option>
                  <option value="ignorar">Ignorar</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Cambio de Emergencia:</span>
                <select
                  value={politicas.fin_de_semana_emergencia}
                  onChange={(e) => actualizarPolitica("fin_de_semana_emergencia", e.target.value)}
                  style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12 }}
                >
                  <option value="bloquear">Bloquear</option>
                  <option value="advertir">Advertir</option>
                  <option value="ignorar">Ignorar (Libre)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cabecera de la tabla de feriados */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1e293b" }}>Catálogo de Feriados Institucionales y Nacionales</h4>
          <span style={{ fontSize: 12, color: "#64748b" }}>Tabla compartida con el resto de procesos de TI.</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={exportarCsv}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#334155", cursor: "pointer" }}
          >
            <Download size={13} /> Exportar CSV
          </button>
          <button
            onClick={() => { setModalCsvAbierto(true); setCsvTexto(""); setCsvError(null); setCsvResultado(null); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "#334155", cursor: "pointer" }}
          >
            <Upload size={13} /> Importar CSV
          </button>
          <button
            onClick={() => abrirEditor()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#059669", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#ffffff", cursor: "pointer" }}
          >
            <Plus size={13} /> Nuevo Feriado
          </button>
        </div>
      </div>

      {/* Tabla de Feriados */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Fecha / Rango</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Nombre de la Festividad</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Tipo</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Alcance</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Recurrente Anual</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "center" }}>Activo</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {feriados.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                  No hay feriados registrados en el calendario.
                </td>
              </tr>
            ) : (
              feriados.map((f: any, idx: number) => {
                const rangoStr = f.fecha_inicio === f.fecha_fin || !f.fecha_fin
                  ? f.fecha_inicio
                  : `${f.fecha_inicio} al ${f.fecha_fin}`;

                return (
                  <tr key={f.id || idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#fbfcfe" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1e293b", fontFamily: "monospace" }}>
                      {rangoStr}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#0f172a", fontWeight: 500 }}>
                      {f.nombre}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ background: f.tipo === "nacional" ? "#eff6ff" : "#fef3c7", color: f.tipo === "nacional" ? "#1d4ed8" : "#92400e", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, textTransform: "capitalize" }}>
                        {f.tipo}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textTransform: "capitalize", color: "#475569" }}>
                      {f.alcance?.replace(/_/g, " ")}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#475569" }}>
                      {f.recurrente_anual ? "Sí (Anual)" : "No (Fecha única)"}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <button
                        onClick={() => toggleActivo(f.id)}
                        style={{
                          background: f.activo ? "#10b981" : "#cbd5e1",
                          border: "none",
                          color: "#ffffff",
                          borderRadius: 12,
                          width: 36,
                          height: 20,
                          cursor: "pointer",
                          position: "relative"
                        }}
                        title={f.activo ? "Desactivar feriado" : "Activar feriado"}
                      >
                        <div style={{
                          position: "absolute",
                          top: 2,
                          left: f.activo ? 18 : 2,
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
                          onClick={() => abrirEditor(f)}
                          style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                        >
                          <Edit2 size={12} /> Editar
                        </button>
                        <button
                          onClick={() => eliminarFeriado(f.id)}
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

      {/* Modal Editor de Feriado */}
      {feriadoEditando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 24, width: 560, maxWidth: "90vw", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>
                {esNuevo ? "Nuevo Feriado o Día No Laborable" : `Editar: ${feriadoEditando.nombre}`}
              </h3>
              <button onClick={() => setFeriadoEditando(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
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
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Nombre de la Festividad *</label>
                <input
                  type="text"
                  value={feriadoEditando.nombre}
                  onChange={(e) => setFeriadoEditando({ ...feriadoEditando, nombre: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  placeholder="Ej: Fiestas Patrias"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Fecha Inicio *</label>
                  <input
                    type="date"
                    value={feriadoEditando.fecha_inicio}
                    onChange={(e) => setFeriadoEditando({ ...feriadoEditando, fecha_inicio: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Fecha Fin</label>
                  <input
                    type="date"
                    value={feriadoEditando.fecha_fin || feriadoEditando.fecha_inicio}
                    onChange={(e) => setFeriadoEditando({ ...feriadoEditando, fecha_fin: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Tipo de Festividad</label>
                  <select
                    value={feriadoEditando.tipo}
                    onChange={(e) => setFeriadoEditando({ ...feriadoEditando, tipo: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  >
                    <option value="nacional">Feriado Nacional</option>
                    <option value="institucional">Día No Laborable Institucional</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Alcance</label>
                  <select
                    value={feriadoEditando.alcance}
                    onChange={(e) => setFeriadoEditando({ ...feriadoEditando, alcance: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  >
                    <option value="toda_la_organizacion">Toda la organización</option>
                    <option value="sede">Sede específica</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={!!feriadoEditando.recurrente_anual}
                    onChange={(e) => setFeriadoEditando({ ...feriadoEditando, recurrente_anual: e.target.checked })}
                  />
                  <span>Recurrente anualmente en el mismo día del año</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <button
                onClick={() => setFeriadoEditando(null)}
                style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#ffffff", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
              >
                Cancelar
              </button>
              <button
                onClick={guardarFeriado}
                style={{ padding: "8px 16px", border: "none", background: "#059669", color: "#ffffff", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
              >
                Guardar Feriado
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
              <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Importar Feriados desde CSV</h3>
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
              Pegue las líneas CSV con encabezado: <code>fecha_inicio,fecha_fin,nombre,tipo,alcance,recurrente_anual,activo</code>
            </p>

            <textarea
              rows={6}
              value={csvTexto}
              onChange={(e) => setCsvTexto(e.target.value)}
              placeholder="2026-07-28,2026-07-28,Fiestas Patrias,nacional,toda_la_organizacion,true,true"
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
                style={{ padding: "8px 16px", border: "none", background: "#059669", color: "#ffffff", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
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
