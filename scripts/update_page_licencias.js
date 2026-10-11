const fs = require('fs');

const content = `"use client";

import { useEffect, useState, FormEvent } from "react";
import { LicenciaSoftware } from "@/types";

type ModoVista = "tabla" | "nuevo" | "editar";

export default function PaginaLicenciasActivos() {
  const [licencias, setLicencias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<ModoVista>("tabla");

  // Formulario de licencia (nuevo o editar)
  const [licenciaSeleccionada, setLicenciaSeleccionada] = useState<any | null>(null);
  const [nombreSoftware, setNombreSoftware] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [claveLicencia, setClaveLicencia] = useState("");
  const [tipoLicencia, setTipoLicencia] = useState("SUSCRIPCION_ANUAL");
  const [cantidadAdquirida, setCantidadAdquirida] = useState(10);
  const [cantidadEnUso, setCantidadEnUso] = useState(0);
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [costoAnual, setCostoAnual] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  async function cargarLicencias() {
    setCargando(true);
    try {
      const res = await fetch("/api/activos/licencias");
      const data = await res.json();
      if (Array.isArray(data)) setLicencias(data);
    } catch (err) {
      console.error("Error al cargar licencias:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarLicencias();
  }, []);

  function abrirCrear() {
    setLicenciaSeleccionada(null);
    setNombreSoftware("");
    setFabricante("");
    setClaveLicencia("");
    setTipoLicencia("SUSCRIPCION_ANUAL");
    setCantidadAdquirida(10);
    setCantidadEnUso(0);
    setFechaVencimiento("");
    setCostoAnual("");
    setErrorForm(null);
    setVista("nuevo");
  }

  function abrirEditar(l: any) {
    setLicenciaSeleccionada(l);
    setNombreSoftware(l.nombre_software || "");
    setFabricante(l.fabricante || "");
    setClaveLicencia(l.clave_licencia || "");
    setTipoLicencia(l.tipo_licencia || "SUSCRIPCION_ANUAL");
    setCantidadAdquirida(l.cantidad_adquirida || 1);
    setCantidadEnUso(l.cantidad_en_uso || 0);
    setFechaVencimiento(l.fecha_vencimiento ? l.fecha_vencimiento.slice(0, 10) : "");
    setCostoAnual(l.costo_anual != null ? String(l.costo_anual) : "");
    setErrorForm(null);
    setVista("editar");
  }

  async function guardarLicencia(e: FormEvent) {
    e.preventDefault();
    setErrorForm(null);

    if (!nombreSoftware.trim() || !fabricante.trim() || !cantidadAdquirida) {
      setErrorForm("Nombre del software, fabricante y cantidad son requeridos.");
      return;
    }

    setGuardando(true);
    try {
      const url = "/api/activos/licencias";
      const method = vista === "editar" ? "PATCH" : "POST";
      const payload: any = {
        nombre_software: nombreSoftware.trim(),
        fabricante: fabricante.trim(),
        clave_licencia: claveLicencia.trim() || null,
        tipo_licencia: tipoLicencia,
        cantidad_adquirida: Number(cantidadAdquirida),
        cantidad_en_uso: Number(cantidadEnUso) || 0,
        fecha_vencimiento: fechaVencimiento || null,
        costo_anual: costoAnual ? Number(costoAnual) : null,
      };

      if (vista === "editar" && licenciaSeleccionada) {
        payload.id_licencia = licenciaSeleccionada.id_licencia;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorForm(data.error || "No se pudo guardar la licencia.");
        return;
      }

      setMensajeExito(vista === "editar" ? "Licencia actualizada con éxito." : "Licencia registrada correctamente.");
      setTimeout(() => setMensajeExito(null), 4000);
      setVista("tabla");
      await cargarLicencias();
    } catch {
      setErrorForm("Error de conexión al guardar la licencia.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      {/* VISTA: CREAR O EDITAR */}
      {vista !== "tabla" ? (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                {vista === "nuevo" ? "Registrar Licencia de Software" : \`Editar Licencia: \${licenciaSeleccionada?.nombre_software}\`}
              </h1>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
                Gestión de activos de software (SAM - ITIL v4). Defina métricas de licenciamiento y control contractual.
              </p>
            </div>
            <button
              type="button"
              className="boton-mini"
              onClick={() => setVista("tabla")}
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              Volver a Licencias
            </button>
          </div>

          {errorForm && (
            <div className="mensaje-error" style={{ marginBottom: 16 }}>
              {errorForm}
            </div>
          )}

          <div className="contenedor-tabla" style={{ padding: 28, backgroundColor: "#ffffff" }}>
            <form onSubmit={guardarLicencia}>
              <div className="campo" style={{ marginBottom: 18 }}>
                <label className="etiqueta" style={{ fontWeight: 600 }}>Nombre del Software y Edición *</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej. Microsoft 365 E5 Corporativo"
                  value={nombreSoftware}
                  onChange={(e) => setNombreSoftware(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Fabricante / Proveedor *</label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ej. Microsoft Corporation"
                    value={fabricante}
                    onChange={(e) => setFabricante(e.target.value)}
                    required
                  />
                </div>

                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Modelo de Licencia *</label>
                  <select
                    className="input-base"
                    value={tipoLicencia}
                    onChange={(e) => setTipoLicencia(e.target.value)}
                  >
                    <option value="SUSCRIPCION_ANUAL">Suscripción Cloud Anual</option>
                    <option value="PERPETUA">Perpetua (On-Premise)</option>
                    <option value="POR_VOLUMEN">Por Volumen Empresarial</option>
                    <option value="OEM">OEM Adherida a Equipo</option>
                  </select>
                </div>
              </div>

              <div className="campo" style={{ marginBottom: 18 }}>
                <label className="etiqueta" style={{ fontWeight: 600 }}>Clave de Activación / License Key / ID de Contrato</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX o ID de suscripción"
                  value={claveLicencia}
                  onChange={(e) => setClaveLicencia(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Asientos Adquiridos *</label>
                  <input
                    type="number"
                    className="input-base"
                    min={1}
                    value={cantidadAdquirida}
                    onChange={(e) => setCantidadAdquirida(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Asientos Asignados en Uso</label>
                  <input
                    type="number"
                    className="input-base"
                    min={0}
                    value={cantidadEnUso}
                    onChange={(e) => setCantidadEnUso(Number(e.target.value))}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Fecha de Vencimiento</label>
                  <input
                    type="date"
                    className="input-base"
                    value={fechaVencimiento}
                    onChange={(e) => setFechaVencimiento(e.target.value)}
                  />
                </div>

                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Costo Anual Referencial ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-base"
                    placeholder="0.00"
                    value={costoAnual}
                    onChange={(e) => setCostoAnual(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: 18 }}>
                <button type="button" className="boton-mini" onClick={() => setVista("tabla")} style={{ padding: "9px 18px" }}>
                  Cancelar
                </button>
                <button type="submit" className="boton-primario" style={{ width: "auto", padding: "9px 24px" }} disabled={guardando}>
                  {guardando ? "Guardando..." : vista === "editar" ? "Actualizar Licencia" : "Guardar Licencia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* VISTA: TABLA PRINCIPAL */
        <>
          <div className="cabecera-pagina">
            <div>
              <h1>Control de Licenciamiento de Software y Contratos (SAM - ITIL v4)</h1>
              <p className="descripcion">
                Supervisión de cumplimiento de licencias (Software Asset Management), asignación de asientos y vencimiento de garantías.
              </p>
            </div>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={abrirCrear}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Registrar Licencia
            </button>
          </div>

          {mensajeExito && (
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
              {mensajeExito}
            </div>
          )}

          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 8,
              padding: "14px 18px",
              marginBottom: 20,
              fontSize: 12.5,
              color: "#166534",
              lineHeight: 1.6,
            }}
          >
            <strong>Cumplimiento de Propiedad Intelectual (ISO 27001 / SAM):</strong> Permite verificar en tiempo real que la cantidad de software instalado en estaciones de trabajo y servidores no sobrepase los asientos contratados.
          </div>

          {cargando ? (
            <div className="contenedor-tabla" style={{ padding: 32, textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
              Consultando licencias y contratos de software...
            </div>
          ) : licencias.length === 0 ? (
            <div className="contenedor-tabla" style={{ padding: 36, textAlign: "center", backgroundColor: "#f8fafc" }}>
              <p style={{ margin: 0, color: "#64748b", fontWeight: 600 }}>
                No hay licencias de software registradas en el repositorio SAM.
              </p>
            </div>
          ) : (
            <div className="contenedor-tabla">
              <div style={{ overflowX: "auto" }}>
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Software y Edición</th>
                      <th>Fabricante</th>
                      <th>Modelo</th>
                      <th style={{ textAlign: "center" }}>Adquiridas</th>
                      <th style={{ textAlign: "center" }}>En Uso</th>
                      <th style={{ textAlign: "center" }}>Disponibles</th>
                      <th>% Utilización</th>
                      <th>Vencimiento</th>
                      <th>Estado Contractual</th>
                      <th style={{ textAlign: "right" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licencias.map((l) => (
                      <tr key={l.id_licencia}>
                        <td style={{ fontWeight: 600 }}>{l.nombre_software}</td>
                        <td>{l.fabricante}</td>
                        <td>
                          <span className="badge-itil" style={{ backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}>
                            {l.tipo_licencia}
                          </span>
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 600 }}>{l.cantidad_adquirida}</td>
                        <td style={{ textAlign: "center", fontWeight: 600, color: l.cantidad_en_uso >= l.cantidad_adquirida ? "#dc2626" : "#0f172a" }}>
                          {l.cantidad_en_uso}
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 600, color: l.licencias_disponibles <= 2 ? "#dc2626" : "#166534" }}>
                          {l.licencias_disponibles}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, backgroundColor: "#e2e8f0", height: 6, borderRadius: 3, overflow: "hidden" }}>
                              <div
                                style={{
                                  width: \`\${Math.min(100, Number(l.porcentaje_uso) || 0)}%\`,
                                  backgroundColor: Number(l.porcentaje_uso) >= 95 ? "#dc2626" : Number(l.porcentaje_uso) >= 80 ? "#f59e0b" : "#16a34a",
                                  height: "100%",
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>{l.porcentaje_uso}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {l.fecha_vencimiento ? new Date(l.fecha_vencimiento).toLocaleDateString() : "Perpetua"}
                        </td>
                        <td>
                          <span
                            className="badge-itil"
                            style={{
                              backgroundColor: l.estado_cumplimiento === "VIGENTE" ? "#ecfdf5" : l.estado_cumplimiento === "POR_VENCER" ? "#fffbeb" : "#fee2e2",
                              color: l.estado_cumplimiento === "VIGENTE" ? "#065f46" : l.estado_cumplimiento === "POR_VENCER" ? "#92400e" : "#991b1b",
                              border: \`1px solid \${l.estado_cumplimiento === "VIGENTE" ? "#a7f3d0" : l.estado_cumplimiento === "POR_VENCER" ? "#fde68a" : "#fca5a5"}\`,
                            }}
                          >
                            {l.estado_cumplimiento}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="boton-mini"
                            onClick={() => abrirEditar(l)}
                            style={{ fontSize: 12, padding: "4px 8px" }}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/app/(app)/activos/licencias/page.tsx', content, 'utf8');
console.log('src/app/(app)/activos/licencias/page.tsx updated successfully');
