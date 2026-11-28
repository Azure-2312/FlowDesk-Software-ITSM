"use client";

// Reglas de detección de candidatos a problema. Una regla NO crea problemas:
// el grupo de incidentes que supera el umbral aparece en Gestión de Problemas →
// Candidatos y el Gestor decide si lo convierte en problema.

import React, { useState } from "react";
import { TablaDobleScroll } from "@/shared/components/ui/TablaDobleScroll";

interface ReglaUmbral {
  id_regla: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  activa: boolean;
  prioridad_minima: string;
  agrupar_por: string;
  umbral_incidentes: number;
  ventana_horas: number;
}

interface Props {
  reglas: ReglaUmbral[];
  catalogos?: unknown;
  onActualizar: () => void;
  onMarcarModificado: () => void;
}

const DIMENSIONES: Record<string, string> = {
  servicio: "Servicio del catálogo",
  categoria: "Categoría del incidente",
  ci: "Elemento de configuración (CI)",
  resolucion: "Categoría de resolución",
};

function textoVentana(horas: number) {
  return horas >= 24 && horas % 24 === 0 ? `${horas / 24} día(s)` : `${horas} horas`;
}

export function PestanaUmbral({ reglas, onActualizar, onMarcarModificado }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reglaEditando, setReglaEditando] = useState<ReglaUmbral | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [errorTabla, setErrorTabla] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [agruparPor, setAgruparPor] = useState("servicio");
  const [umbralIncidentes, setUmbralIncidentes] = useState(3);
  const [ventanaHoras, setVentanaHoras] = useState(24);
  const [prioridadMinima, setPrioridadMinima] = useState("P4");
  const [activa, setActiva] = useState(false);

  function abrirCrear() {
    setReglaEditando(null);
    setNombre("");
    setDescripcion("");
    setAgruparPor("servicio");
    setUmbralIncidentes(3);
    setVentanaHoras(24);
    setPrioridadMinima("P4");
    setActiva(false);
    setErrorModal(null);
    setModalAbierto(true);
  }

  function abrirEditar(r: ReglaUmbral) {
    setReglaEditando(r);
    setNombre(r.nombre);
    setDescripcion(r.descripcion || "");
    setAgruparPor(DIMENSIONES[r.agrupar_por] ? r.agrupar_por : "servicio");
    setUmbralIncidentes(r.umbral_incidentes);
    setVentanaHoras(r.ventana_horas);
    setPrioridadMinima(r.prioridad_minima || "P4");
    setActiva(r.activa);
    setErrorModal(null);
    setModalAbierto(true);
  }

  async function enviar(metodo: "POST" | "PUT" | "DELETE", cuerpo?: unknown, sufijo = "") {
    const res = await fetch(`/api/problemas/configuracion/relaciones/umbral${sufijo}`, {
      method: metodo,
      headers: cuerpo ? { "Content-Type": "application/json" } : undefined,
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "No se pudo guardar la regla.");
    onMarcarModificado();
    onActualizar();
  }

  async function guardarRegla(e: React.FormEvent) {
    e.preventDefault();
    if (nombre.trim().length < 3) {
      setErrorModal("El nombre de la regla debe tener al menos 3 caracteres.");
      return;
    }
    setCargando(true);
    setErrorModal(null);
    const payload = {
      id_regla: reglaEditando?.id_regla,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      agrupar_por: agruparPor,
      umbral_incidentes: Number(umbralIncidentes),
      ventana_horas: Number(ventanaHoras),
      prioridad_minima: prioridadMinima,
      activa,
    };
    try {
      await enviar(reglaEditando ? "PUT" : "POST", reglaEditando ? payload : { accion: "crear", regla: payload });
      setModalAbierto(false);
    } catch (err: any) {
      setErrorModal(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function accionTabla(fn: () => Promise<void>) {
    setErrorTabla(null);
    try {
      await fn();
    } catch (err: any) {
      setErrorTabla(err.message);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="titulo-pagina">Reglas de detección de candidatos</h1>
          <p className="descripcion-pagina">
            Cuando un servicio, categoría, CI o código de resolución acumula incidentes por encima del umbral, el grupo
            aparece en Gestión de Problemas → Candidatos. El Gestor de Problemas revisa cada candidato y decide si lo
            convierte en problema; las reglas no crean problemas por sí solas.
          </p>
        </div>
        <button type="button" className="boton-primario" onClick={abrirCrear}>
          Nueva regla
        </button>
      </div>

      {errorTabla && <div className="mensaje-error">{errorTabla}</div>}

      <div className="contenedor-tabla">
        <TablaDobleScroll minWidth={800}>
          <table className="tabla">
            <thead>
              <tr>
                <th style={{ width: 45 }}>Ord</th>
                <th>Nombre de la regla</th>
                <th>Agrupa por</th>
                <th>Umbral y ventana</th>
                <th>Prioridad mínima</th>
                <th style={{ textAlign: "center" }}>Estado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reglas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="celda-vacia">
                    No hay reglas configuradas. Haga clic en "Nueva regla" para definir una.
                  </td>
                </tr>
              ) : (
                reglas.map((r) => (
                  <tr key={r.id_regla}>
                    <td style={{ color: "#64748b", fontWeight: 600 }}>{r.orden}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{r.nombre}</div>
                      {r.descripcion && <div style={{ fontSize: 12, color: "#64748b" }}>{r.descripcion}</div>}
                    </td>
                    <td style={{ fontSize: 12.5 }}>{DIMENSIONES[r.agrupar_por] ?? r.agrupar_por}</td>
                    <td style={{ fontSize: 12.5, color: "#334155" }}>
                      <strong>≥ {r.umbral_incidentes}</strong> incidentes en {textoVentana(r.ventana_horas)}
                    </td>
                    <td style={{ fontSize: 12.5 }}>{r.prioridad_minima === "P4" ? "Todas" : r.prioridad_minima === "P1" ? "Solo P1" : `${r.prioridad_minima} o superior`}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="boton-enlace"
                        type="button"
                        onClick={() => accionTabla(() => enviar("PUT", { id_regla: r.id_regla, activa: !r.activa }))}
                        title={r.activa ? "Pausar regla" : "Activar regla"}
                      >
                        <span className={`badge ${r.activa ? "badge-activo" : "badge-inactivo"}`}>
                          {r.activa ? "Activa" : "Pausada"}
                        </span>
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button type="button" className="boton-secundario" onClick={() => abrirEditar(r)}>
                          Editar
                        </button>
                        <button
                          type="button"
                          className="boton-secundario"
                          onClick={() => accionTabla(() => enviar("POST", { accion: "duplicar", regla: { id_regla: r.id_regla } }))}
                        >
                          Duplicar
                        </button>
                        <button
                          className="boton-peligro boton-sm"
                          type="button"
                          onClick={() => {
                            if (confirm("¿Eliminar esta regla de detección?")) {
                              accionTabla(() => enviar("DELETE", undefined, `?id=${r.id_regla}`));
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TablaDobleScroll>
      </div>

      {modalAbierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 10,
              maxWidth: 640,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a" }}>
              {reglaEditando ? "Editar regla de detección" : "Nueva regla de detección"}
            </h3>

            {errorModal && (
              <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: 6, fontSize: 12.5, marginBottom: 14 }}>
                {errorModal}
              </div>
            )}

            <form onSubmit={guardarRegla}>
              <div className="campo" style={{ marginBottom: 14 }}>
                <label htmlFor="regla-nombre">Nombre de la regla *</label>
                <input
                  id="regla-nombre"
                  type="text"
                  className="input-base"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. 5 incidentes del mismo servicio en 48 horas"
                  required
                />
              </div>

              <div className="campo" style={{ marginBottom: 14 }}>
                <label htmlFor="regla-descripcion">Descripción</label>
                <textarea
                  id="regla-descripcion"
                  className="input-base"
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Para qué sirve esta regla de detección..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 14, marginBottom: 14 }}>
                <div className="campo">
                  <label htmlFor="regla-agrupar">Agrupar por *</label>
                  <select id="regla-agrupar" className="input-base" value={agruparPor} onChange={(e) => setAgruparPor(e.target.value)}>
                    {Object.entries(DIMENSIONES).map(([valor, etiqueta]) => (
                      <option key={valor} value={valor}>{etiqueta}</option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="regla-prioridad">Prioridad mínima del incidente</label>
                  <select id="regla-prioridad" className="input-base" value={prioridadMinima} onChange={(e) => setPrioridadMinima(e.target.value)}>
                    <option value="P4">Todas las prioridades (P1 a P4)</option>
                    <option value="P3">P3 o superior (P1 a P3)</option>
                    <option value="P2">P2 o superior (P1 y P2)</option>
                    <option value="P1">Solo críticos (P1)</option>
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="regla-umbral">Umbral (≥ N incidentes) *</label>
                  <input
                    id="regla-umbral"
                    type="number"
                    min={1}
                    max={100}
                    className="input-base"
                    value={umbralIncidentes}
                    onChange={(e) => setUmbralIncidentes(parseInt(e.target.value, 10) || 1)}
                    required
                  />
                </div>
                <div className="campo">
                  <label htmlFor="regla-ventana">Ventana de evaluación (horas) *</label>
                  <input
                    id="regla-ventana"
                    type="number"
                    min={1}
                    max={720}
                    className="input-base"
                    value={ventanaHoras}
                    onChange={(e) => setVentanaHoras(parseInt(e.target.value, 10) || 24)}
                    required
                  />
                  <span style={{ fontSize: 11, color: "#64748b" }}>24 = 1 día, 168 = 7 días, 720 = 30 días</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <input id="regla-activa" type="checkbox" checked={activa} onChange={(e) => setActiva(e.target.checked)} />
                <label htmlFor="regla-activa" style={{ fontSize: 13, cursor: "pointer" }}>
                  Regla activa
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                <button type="button" className="boton-secundario" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="boton-primario" disabled={cargando}>
                  {cargando ? "Guardando..." : "Guardar regla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
