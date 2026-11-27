"use client";

import React, { useState } from "react";
import { TablaDobleScroll } from "@/shared/components/ui/TablaDobleScroll";

interface ReglaUmbral {
  id_regla: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  activa: boolean;
  estados_incluidos: string[];
  prioridad_minima: string;
  servicios_incluidos: number[];
  categorias_incluidas: number[];
  agrupar_por: string;
  sensibilidad_texto?: string;
  umbral_incidentes: number;
  ventana_horas: number;
  accion: string;
  prioridad_problema: string;
  evitar_duplicados: boolean;
  enfriamiento_horas: number;
  notificar_destinatarios: string[];
  ultima_ejecucion?: string;
  problemas_generados: number;
  total_ejecuciones?: number;
}

interface Props {
  reglas: ReglaUmbral[];
  catalogos: {
    servicios: any[];
    categorias: any[];
    clasesCI: string[];
  };
  onActualizar: () => void;
  onMarcarModificado: () => void;
}

export function PestanaUmbral({ reglas, catalogos, onActualizar, onMarcarModificado }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [reglaEditando, setReglaEditando] = useState<ReglaUmbral | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [agruparPor, setAgruparPor] = useState("servicio");
  const [sensibilidadTexto, setSensibilidadTexto] = useState("media");
  const [umbralIncidentes, setUmbralIncidentes] = useState(3);
  const [ventanaHoras, setVentanaHoras] = useState(24);
  const [accion, setAccion] = useState("crear_automatico");
  const [prioridadProblema, setPrioridadProblema] = useState("maxima_incidentes");
  const [prioridadMinima, setPrioridadMinima] = useState("P4");
  const [evitarDuplicados, setEvitarDuplicados] = useState(true);
  const [enfriamientoHoras, setEnfriamientoHoras] = useState(24);
  const [activa, setActiva] = useState(false);

  // Historial de ejecuciones
  const [modalEjecuciones, setModalEjecuciones] = useState(false);
  const [ejecuciones, setEjecuciones] = useState<any[]>([]);
  const [reglaSeleccionadaHistorial, setReglaSeleccionadaHistorial] = useState<ReglaUmbral | null>(null);

  function abrirCrear() {
    setReglaEditando(null);
    setNombre("");
    setDescripcion("");
    setAgruparPor("servicio");
    setSensibilidadTexto("media");
    setUmbralIncidentes(3);
    setVentanaHoras(24);
    setAccion("crear_automatico");
    setPrioridadProblema("maxima_incidentes");
    setPrioridadMinima("P4");
    setEvitarDuplicados(true);
    setEnfriamientoHoras(24);
    setActiva(false);
    setErrorModal(null);
    setModalAbierto(true);
  }

  function abrirEditar(r: ReglaUmbral) {
    setReglaEditando(r);
    setNombre(r.nombre);
    setDescripcion(r.descripcion || "");
    setAgruparPor(r.agrupar_por);
    setSensibilidadTexto(r.sensibilidad_texto || "media");
    setUmbralIncidentes(r.umbral_incidentes);
    setVentanaHoras(r.ventana_horas);
    setAccion(r.accion);
    setPrioridadProblema(r.prioridad_problema);
    setPrioridadMinima(r.prioridad_minima);
    setEvitarDuplicados(r.evitar_duplicados);
    setEnfriamientoHoras(r.enfriamiento_horas);
    setActiva(r.activa);
    setErrorModal(null);
    setModalAbierto(true);
  }

  async function guardarRegla(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorModal("El nombre de la regla es obligatorio");
      return;
    }

    setCargando(true);
    setErrorModal(null);

    try {
      const payload = {
        id_regla: reglaEditando ? reglaEditando.id_regla : undefined,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        agrupar_por: agruparPor,
        sensibilidad_texto: sensibilidadTexto,
        umbral_incidentes: Number(umbralIncidentes),
        ventana_horas: Number(ventanaHoras),
        accion,
        prioridad_problema: prioridadProblema,
        prioridad_minima: prioridadMinima,
        evitar_duplicados: evitarDuplicados,
        enfriamiento_horas: Number(enfriamientoHoras),
        activa
      };

      const res = await fetch("/api/problemas/configuracion/relaciones/umbral", {
        method: reglaEditando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reglaEditando ? payload : { accion: "crear", regla: payload })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar regla");
      }

      setModalAbierto(false);
      onMarcarModificado();
      onActualizar();
    } catch (err: any) {
      setErrorModal(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function toggleActiva(r: ReglaUmbral) {
    try {
      const res = await fetch("/api/problemas/configuracion/relaciones/umbral", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_regla: r.id_regla, activa: !r.activa })
      });
      if (res.ok) {
        onMarcarModificado();
        onActualizar();
      }
    } catch {
      // Ignorar error
    }
  }

  async function duplicarRegla(r: ReglaUmbral) {
    try {
      const res = await fetch("/api/problemas/configuracion/relaciones/umbral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "duplicar", regla: { id_regla: r.id_regla } })
      });
      if (res.ok) {
        onMarcarModificado();
        onActualizar();
      }
    } catch {
      // Ignorar error
    }
  }

  async function eliminarRegla(id: number) {
    if (!confirm("¿Está seguro de eliminar esta regla de detección proactiva?")) return;
    try {
      const res = await fetch(`/api/problemas/configuracion/relaciones/umbral?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        onMarcarModificado();
        onActualizar();
      }
    } catch {
      // Ignorar error
    }
  }

  async function verHistorial(r: ReglaUmbral) {
    setReglaSeleccionadaHistorial(r);
    setModalEjecuciones(true);
    try {
      const res = await fetch(`/api/problemas/configuracion/relaciones/umbral?id_regla=${r.id_regla}`);
      const data = await res.json();
      if (data.ok) {
        setEjecuciones(data.ejecuciones || []);
      }
    } catch {
      setEjecuciones([]);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Encabezado descriptivo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="titulo-pagina">
            Creación automática de problemas por umbral
          </h1>
          <p className="descripcion-pagina">
            Detecta clusters de incidentes recurrentes y genera proactivamente problemas o sugerencias de investigación antes de que escalen a fallas mayores.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="boton-primario"
            onClick={abrirCrear}
          >
            Nueva regla
          </button>
        </div>
      </div>

      {/* Tabla de Reglas */}
      <div className="contenedor-tabla">
        <TablaDobleScroll minWidth={950}>
        <table className="tabla">
          <thead>
            <tr>
              <th style={{ width: 45 }}>Ord</th>
              <th>Nombre de la Regla</th>
              <th>Agrupa Por</th>
              <th>Umbral y Ventana</th>
              <th>Acción</th>
              <th style={{ textAlign: "center" }}>Estado</th>
              <th>Última Evaluación</th>
              <th style={{ textAlign: "center" }}>Prb Generados</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reglas.length === 0 ? (
              <tr>
                <td colSpan={9} className="celda-vacia">
                  No hay reglas de umbral configuradas. Haga clic en "Nueva regla" para definir una.
                </td>
              </tr>
            ) : (
              reglas.map((r) => (
                <tr key={r.id_regla}>
                  <td style={{ color: "#64748b", fontWeight: 600 }}>{r.orden}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{r.nombre}</div>
                    {r.descripcion && (
                      <div style={{ fontSize: 12, color: "#64748b" }}>{r.descripcion}</div>
                    )}
                  </td>
                  <td>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 11.5,
                      fontWeight: 600,
                      backgroundColor: "#f1f5f9",
                      color: "#334155"
                    }}>
                      {r.agrupar_por === "servicio" ? "Servicio de TI" :
                       r.agrupar_por === "categoria" ? "Categoría" :
                       r.agrupar_por === "ci" ? "Elemento de Configuración (CI)" :
                       r.agrupar_por === "codigo_resolucion" ? "Código de Resolución" : "Texto Similar"}
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5, color: "#334155" }}>
                    <strong>≥ {r.umbral_incidentes}</strong> incidentes en {r.ventana_horas >= 24 ? `${Math.round(r.ventana_horas / 24)} días` : `${r.ventana_horas} horas`}
                  </td>
                  <td>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: r.accion === "crear_automatico" ? "#ecfdf5" : "#fef3c7",
                      color: r.accion === "crear_automatico" ? "#065f46" : "#92400e"
                    }}>
                      {r.accion === "crear_automatico" ? "Crear Automático" : "Solo Sugerir"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button className="boton-enlace"
                      type="button"
                      onClick={() => toggleActiva(r)}
                      title={r.activa ? "Pausar regla" : "Activar regla"}
                    >
                      <span className={`badge ${r.activa ? "badge-activo" : "badge-inactivo"}`}>
                        {r.activa ? "Activa" : "Pausada"}
                      </span>
                    </button>
                  </td>
                  <td style={{ fontSize: 12, color: "#64748b" }}>
                    {r.ultima_ejecucion ? new Date(r.ultima_ejecucion).toLocaleString() : "Sin evaluar aún"}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "#0284c7" }}>
                    {r.problemas_generados || 0}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6 }}>
                      <button
                        type="button"
                        className="boton-secundario"
                        onClick={() => abrirEditar(r)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="boton-secundario"
                        onClick={() => duplicarRegla(r)}
                        title="Duplicar regla"
                      >
                        Duplicar
                      </button>
                      <button className="boton-peligro boton-sm"
                        type="button"
                        onClick={() => eliminarRegla(r.id_regla)}
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

      {/* MODAL: CREAR / EDITAR REGLA DE UMBRAL */}
      {modalAbierto && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            maxWidth: 700,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: 24,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a" }}>
              {reglaEditando ? "Editar Regla de Detección por Umbral" : "Nueva Regla de Detección por Umbral"}
            </h3>

            {errorModal && (
              <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: 6, fontSize: 12.5, marginBottom: 14 }}>
                {errorModal}
              </div>
            )}

            <form onSubmit={guardarRegla}>
              <div className="campo" style={{ marginBottom: 14 }}>
                <label>Nombre de la Regla *</label>
                <input
                  type="text"
                  className="input-base"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. 5 incidentes del mismo servicio en 48 horas"
                  required
                />
              </div>

              <div className="campo" style={{ marginBottom: 14 }}>
                <label>Descripción / Justificación Operativa</label>
                <textarea
                  className="input-base"
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Explique el propósito y objetivo de la regla de detección..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div className="campo">
                  <label>Criterio de Agrupación (Agrupar por) *</label>
                  <select
                    className="input-base"
                    value={agruparPor}
                    onChange={(e) => setAgruparPor(e.target.value)}
                  >
                    <option value="servicio">Servicio del Catálogo</option>
                    <option value="categoria">Categoría de Incidente</option>
                    <option value="ci">Elemento de Configuración (CI)</option>
                    <option value="clase_ci">Clase de Activo / CI</option>
                    <option value="codigo_resolucion">Código de Resolución</option>
                    <option value="texto_similar">Texto Similar / Palabras Clave</option>
                  </select>
                </div>

                <div className="campo">
                  <label>Prioridad Mínima del Incidente</label>
                  <select
                    className="input-base"
                    value={prioridadMinima}
                    onChange={(e) => setPrioridadMinima(e.target.value)}
                  >
                    <option value="P4">P4 - Todas las prioridades (P1 a P4)</option>
                    <option value="P3">P3 - Media o superior (P1 a P3)</option>
                    <option value="P2">P2 - Alta o superior (P1 a P2)</option>
                    <option value="P1">P1 - Solo Críticos (P1)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div className="campo">
                  <label>Umbral Mínimo (≥ N Incidentes) *</label>
                  <input
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
                  <label>Ventana Móvil de Evaluación (Horas) *</label>
                  <input
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div className="campo">
                  <label>Acción al Superar Umbral *</label>
                  <select
                    className="input-base"
                    value={accion}
                    onChange={(e) => setAccion(e.target.value)}
                  >
                    <option value="crear_automatico">Crear problema automáticamente</option>
                    <option value="sugerir">Solo sugerir (notificar al Gestor)</option>
                  </select>
                </div>

                <div className="campo">
                  <label>Prioridad del Problema Generado</label>
                  <select
                    className="input-base"
                    value={prioridadProblema}
                    onChange={(e) => setPrioridadProblema(e.target.value)}
                  >
                    <option value="maxima_incidentes">Máxima entre los incidentes detectados</option>
                    <option value="fija_p1">Fija: P1 (Crítica)</option>
                    <option value="fija_p2">Fija: P2 (Alta)</option>
                    <option value="fija_p3">Fija: P3 (Media)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 10 }}>
                  <input
                    type="checkbox"
                    id="chk-duplicados"
                    checked={evitarDuplicados}
                    onChange={(e) => setEvitarDuplicados(e.target.checked)}
                  />
                  <label htmlFor="chk-duplicados" style={{ fontSize: 13, cursor: "pointer" }}>
                    Vincular a problema existente si ya hay uno abierto
                  </label>
                </div>

                <div className="campo">
                  <label>Enfriamiento (Horas)</label>
                  <input
                    type="number"
                    min={0}
                    className="input-base"
                    value={enfriamientoHoras}
                    onChange={(e) => setEnfriamientoHoras(parseInt(e.target.value, 10) || 0)}
                  />
                  <span style={{ fontSize: 11, color: "#64748b" }}>Pausa de disparo para el mismo cluster</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-primario"
                  disabled={cargando}
                >
                  {cargando ? "Guardando..." : "Guardar Regla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
