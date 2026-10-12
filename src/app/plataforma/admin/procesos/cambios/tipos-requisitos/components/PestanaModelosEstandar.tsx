"use client";

import React, { useState, useEffect } from "react";

interface ModeloEstandar {
  id_modelo: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria_id?: number;
  categoria_nombre?: string;
  estado: "BORRADOR" | "EN_REVISION" | "APROBADO" | "SUSPENDIDO" | "RETIRADO";
  version_modelo: number;
  propietario_id?: number;
  propietario_nombre?: string;
  vigencia_desde?: string;
  vigencia_hasta?: string;
  servicios_aplicables: string[];
  clases_ci_aplicables: string[];
  entornos_permitidos: string[];
  riesgo_fijo: string;
  autorizacion_automatica: boolean;
  etapa_minima_id?: string;
  lista_elegibilidad: string[];
  contenido_prellenado: {
    motivo?: string;
    plan_implementacion?: string;
    plan_rollback?: string;
    plan_pruebas?: string;
    criterios_exito?: string;
    duracion_estimada?: string;
  };
  campos_bloqueados: string[];
  ventanas_permitidas: string[];
  anticipacion_horas: number;
  limite_frecuencia_ci: number;
  paquete_tareas: any[];
  checklist_items: string[];
  control_calidad_activo: boolean;
  umbral_tasa_fallo_pct: number;
  umbral_fallos_consecutivos: number;
  dias_observacion_calidad: number;
  revision_periodica_meses: number;
  fecha_ultima_revision?: string;
  veces_usado: number;
  veces_exitoso: number;
  veces_fallido: number;
  tasa_exito_pct: number;
  incidentes_asociados: number;
  ultimo_uso?: string;
}

interface PestanaModelosEstandarProps {
  config: any;
  onChange: (nuevo: any) => void;
}

export const PestanaModelosEstandar: React.FC<PestanaModelosEstandarProps> = () => {
  const [modelos, setModelos] = useState<ModeloEstandar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [subpestanaEditor, setSubpestanaEditor] = useState<number>(1);
  const [modeloEnEdicion, setModeloEnEdicion] = useState<Partial<ModeloEstandar> | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [nuevaCondicionElegibilidad, setNuevaCondicionElegibilidad] = useState("");

  const cargarModelos = async () => {
    try {
      setCargando(true);
      let url = "/api/admin/cambios/modelos-estandar?";
      if (filtroEstado !== "todos") url += `estado=${filtroEstado}&`;
      if (busqueda.trim()) url += `busqueda=${encodeURIComponent(busqueda.trim())}&`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.modelos) {
        setModelos(data.modelos);
      }
    } catch (err: any) {
      console.error("Error al cargar modelos:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarModelos();
  }, [filtroEstado]);

  const abrirNuevoModelo = () => {
    setModeloEnEdicion({
      codigo: "mod_" + Date.now().toString(36),
      nombre: "Nuevo procedimiento estándar",
      descripcion: "",
      estado: "BORRADOR",
      version_modelo: 1,
      riesgo_fijo: "bajo",
      autorizacion_automatica: true,
      anticipacion_horas: 24,
      limite_frecuencia_ci: 5,
      entornos_permitidos: ["produccion", "preproduccion", "pruebas", "desarrollo"],
      lista_elegibilidad: [
        "Se probó previamente el procedimiento en ambiente controlado.",
        "Existe respaldo verificado previo al inicio de los trabajos."
      ],
      contenido_prellenado: {
        motivo: "Procedimiento operativo estándar de mantenimiento recurrente.",
        plan_implementacion: "1. Notificar inicio de ventana.\n2. Ejecutar comandos autorizados.\n3. Verificar estado de salud del servicio.",
        plan_rollback: "Ejecutar comando de reversión y validar retorno a estado inicial.",
        plan_pruebas: "Verificación de conectividad y endpoints de prueba.",
        duracion_estimada: "30m"
      },
      campos_bloqueados: ["plan_implementacion", "plan_rollback"],
      control_calidad_activo: true,
      umbral_tasa_fallo_pct: 10.0,
      umbral_fallos_consecutivos: 2,
      dias_observacion_calidad: 90,
      revision_periodica_meses: 6,
      veces_usado: 0,
      veces_exitoso: 0,
      veces_fallido: 0,
      tasa_exito_pct: 100
    });
    setSubpestanaEditor(1);
    setModalAbierto(true);
  };

  const abrirEditarModelo = (m: ModeloEstandar) => {
    setModeloEnEdicion(JSON.parse(JSON.stringify(m)));
    setSubpestanaEditor(1);
    setModalAbierto(true);
  };

  const ejecutarTransicion = async (id: number, transicion: string) => {
    try {
      const res = await fetch("/api/admin/cambios/modelos-estandar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_modelo: id, transicion_estado: transicion })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al procesar la transición");
        return;
      }
      alert(data.mensaje);
      cargarModelos();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const guardarModelo = async () => {
    if (!modeloEnEdicion?.nombre || !modeloEnEdicion.codigo) {
      alert("El código y el nombre del modelo son obligatorios.");
      return;
    }

    try {
      setGuardando(true);
      const esEdicion = !!modeloEnEdicion.id_modelo;
      const res = await fetch("/api/admin/cambios/modelos-estandar", {
        method: esEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modeloEnEdicion)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al guardar modelo");
        return;
      }
      alert(data.mensaje);
      setModalAbierto(false);
      setModeloEnEdicion(null);
      cargarModelos();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarModelo = async (id: number) => {
    if (!confirm("¿Deseas eliminar este modelo de cambio estándar?")) return;
    try {
      const res = await fetch(`/api/admin/cambios/modelos-estandar?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo eliminar el modelo");
        return;
      }
      alert(data.mensaje);
      cargarModelos();
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const agregarCondicionElegibilidad = () => {
    if (!nuevaCondicionElegibilidad.trim()) return;
    const actuales = modeloEnEdicion?.lista_elegibilidad || [];
    setModeloEnEdicion({
      ...modeloEnEdicion,
      lista_elegibilidad: [...actuales, nuevaCondicionElegibilidad.trim()]
    });
    setNuevaCondicionElegibilidad("");
  };

  const quitarCondicionElegibilidad = (index: number) => {
    const actuales = modeloEnEdicion?.lista_elegibilidad || [];
    setModeloEnEdicion({
      ...modeloEnEdicion,
      lista_elegibilidad: actuales.filter((_, i) => i !== index)
    });
  };

  const toggleBloqueoCampo = (campo: string) => {
    const actuales = modeloEnEdicion?.campos_bloqueados || [];
    const existe = actuales.includes(campo);
    setModeloEnEdicion({
      ...modeloEnEdicion,
      campos_bloqueados: existe ? actuales.filter((c) => c !== campo) : [...actuales, campo]
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Cabecera y Filtros */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          backgroundColor: "#ffffff",
          borderRadius: 8,
          border: "1px solid #cbd5e1"
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
            Catálogo de Modelos de Cambio Estándar (Preautorizados)
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
            Los modelos aprobados preautorizan cambios de bajo riesgo con planes y requisitos fijados.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ padding: "6px 10px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 6 }}
          >
            <option value="todos">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="EN_REVISION">En revisión</option>
            <option value="APROBADO">Aprobado</option>
            <option value="SUSPENDIDO">Suspendido</option>
            <option value="RETIRADO">Retirado</option>
          </select>

          <button
            type="button"
            onClick={abrirNuevoModelo}
            style={{
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 600,
              backgroundColor: "#16a34a",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            + Nuevo modelo
          </button>
        </div>
      </div>

      {/* Tabla de Modelos */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
              <th style={{ padding: "10px 14px", color: "#475569" }}>Nombre y Código</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 110 }}>Estado</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 90 }}>Riesgo</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 100 }}>Veces Usado</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 90 }}>% Éxito</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 120 }}>Versión</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 230, textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                  Cargando catálogo de modelos estándar...
                </td>
              </tr>
            ) : modelos.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#64748b" }}>
                  No se encontraron modelos de cambio estándar registrados.
                </td>
              </tr>
            ) : (
              modelos.map((m) => {
                const badgeColor =
                  m.estado === "APROBADO"
                    ? { bg: "#dcfce7", text: "#166534" }
                    : m.estado === "EN_REVISION"
                    ? { bg: "#fef3c7", text: "#92400e" }
                    : m.estado === "SUSPENDIDO"
                    ? { bg: "#fee2e2", text: "#991b1b" }
                    : m.estado === "RETIRADO"
                    ? { bg: "#f1f5f9", text: "#475569" }
                    : { bg: "#e2e8f0", text: "#1e293b" };

                return (
                  <tr key={m.id_modelo} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <strong style={{ color: "#1e293b", display: "block" }}>{m.nombre}</strong>
                      <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{m.codigo}</span>
                    </td>

                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 4,
                          backgroundColor: badgeColor.bg,
                          color: badgeColor.text
                        }}
                      >
                        {m.estado}
                      </span>
                    </td>

                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#16a34a" }}>
                        {m.riesgo_fijo || "bajo"}
                      </span>
                    </td>

                    <td style={{ padding: "10px 14px", color: "#334155", fontWeight: 600 }}>
                      {m.veces_usado || 0}
                    </td>

                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: (m.tasa_exito_pct || 100) >= 90 ? "#16a34a" : "#dc2626"
                        }}
                      >
                        {m.tasa_exito_pct || 100}%
                      </span>
                    </td>

                    <td style={{ padding: "10px 14px", color: "#64748b", fontSize: 11.5 }}>
                      v{m.version_modelo || 1}
                    </td>

                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => abrirEditarModelo(m)}
                          style={{ padding: "3px 7px", fontSize: 11, border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", backgroundColor: "#ffffff" }}
                        >
                          Editar
                        </button>

                        {m.estado === "BORRADOR" && (
                          <button
                            type="button"
                            onClick={() => ejecutarTransicion(m.id_modelo, "enviar_revision")}
                            style={{ padding: "3px 7px", fontSize: 11, border: "1px solid #fef08a", borderRadius: 4, cursor: "pointer", backgroundColor: "#fef9c3", color: "#854d0e" }}
                          >
                            Enviar a revisión
                          </button>
                        )}

                        {(m.estado === "EN_REVISION" || m.estado === "BORRADOR") && (
                          <button
                            type="button"
                            onClick={() => ejecutarTransicion(m.id_modelo, "aprobar")}
                            style={{ padding: "3px 7px", fontSize: 11, border: "1px solid #bbf7d0", borderRadius: 4, cursor: "pointer", backgroundColor: "#dcfce7", color: "#166534", fontWeight: 600 }}
                          >
                            Aprobar
                          </button>
                        )}

                        {m.estado === "APROBADO" && (
                          <button
                            type="button"
                            onClick={() => ejecutarTransicion(m.id_modelo, "suspender")}
                            style={{ padding: "3px 7px", fontSize: 11, border: "1px solid #fecaca", borderRadius: 4, cursor: "pointer", backgroundColor: "#fff1f2", color: "#b91c1c" }}
                          >
                            Suspender
                          </button>
                        )}

                        {m.estado !== "RETIRADO" && (
                          <button
                            type="button"
                            onClick={() => ejecutarTransicion(m.id_modelo, "retirar")}
                            style={{ padding: "3px 7px", fontSize: 11, border: "1px solid #e2e8f0", borderRadius: 4, cursor: "pointer", backgroundColor: "#f1f5f9", color: "#475569" }}
                          >
                            Retirar
                          </button>
                        )}

                        {Number(m.veces_usado || 0) === 0 && (
                          <button
                            type="button"
                            onClick={() => eliminarModelo(m.id_modelo)}
                            style={{ padding: "3px 7px", fontSize: 11, border: "1px solid #fecaca", borderRadius: 4, cursor: "pointer", backgroundColor: "#fff1f2", color: "#b91c1c" }}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal de Modelo con 9 Pestañas Internas */}
      {modalAbierto && modeloEnEdicion && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              maxWidth: 880,
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Cabecera del Editor */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 2px 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                  {modeloEnEdicion.id_modelo ? `Editar Modelo Estándar: ${modeloEnEdicion.nombre}` : "Nuevo Modelo de Cambio Estándar"}
                </h3>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  Estado: <strong>{modeloEnEdicion.estado}</strong> · Versión v{modeloEnEdicion.version_modelo || 1}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}
              >
                ×
              </button>
            </div>

            {/* Selector de las 9 Pestañas Internas */}
            <div style={{ display: "flex", borderBottom: "1px solid #cbd5e1", backgroundColor: "#f8fafc", overflowX: "auto" }}>
              {[
                { n: 1, label: "1. General" },
                { n: 2, label: "2. Alcance" },
                { n: 3, label: "3. Riesgo y Autoridad" },
                { n: 4, label: "4. Elegibilidad" },
                { n: 5, label: "5. Contenido Prellenado" },
                { n: 6, label: "6. Programación" },
                { n: 7, label: "7. Tareas" },
                { n: 8, label: "8. Control Calidad" },
                { n: 9, label: "9. Revisión Periódica" }
              ].map((tab) => (
                <button
                  key={tab.n}
                  type="button"
                  onClick={() => setSubpestanaEditor(tab.n)}
                  style={{
                    padding: "9px 14px",
                    fontSize: 12,
                    fontWeight: subpestanaEditor === tab.n ? 700 : 500,
                    border: "none",
                    borderBottom: subpestanaEditor === tab.n ? "2px solid #16a34a" : "2px solid transparent",
                    backgroundColor: subpestanaEditor === tab.n ? "#ffffff" : "transparent",
                    color: subpestanaEditor === tab.n ? "#166534" : "#64748b",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido según Pestaña Interna */}
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* 1. General */}
              {subpestanaEditor === 1 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                      Nombre del modelo estándar (5–80 caracteres):
                    </label>
                    <input
                      type="text"
                      value={modeloEnEdicion.nombre || ""}
                      onChange={(e) => setModeloEnEdicion({ ...modeloEnEdicion, nombre: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                      Código identificador único (prefijo mod_):
                    </label>
                    <input
                      type="text"
                      disabled={!!modeloEnEdicion.id_modelo}
                      value={modeloEnEdicion.codigo || ""}
                      onChange={(e) => setModeloEnEdicion({ ...modeloEnEdicion, codigo: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6, fontFamily: "monospace" }}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                      Descripción y alcance operativo:
                    </label>
                    <textarea
                      rows={3}
                      value={modeloEnEdicion.descripcion || ""}
                      onChange={(e) => setModeloEnEdicion({ ...modeloEnEdicion, descripcion: e.target.value })}
                      style={{ width: "100%", padding: "8px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6 }}
                    />
                  </div>
                </div>
              )}

              {/* 2. Alcance */}
              {subpestanaEditor === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                    Restringe qué servicios o entornos operativos están autorizados para aplicar este modelo de cambio.
                  </p>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                      Entornos permitidos:
                    </label>
                    <div style={{ display: "flex", gap: 12 }}>
                      {["produccion", "preproduccion", "pruebas", "desarrollo"].map((env) => {
                        const check = (modeloEnEdicion.entornos_permitidos || []).includes(env);
                        return (
                          <label key={env} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1e293b" }}>
                            <input
                              type="checkbox"
                              checked={check}
                              onChange={(e) => {
                                const prev = modeloEnEdicion.entornos_permitidos || [];
                                const next = e.target.checked ? [...prev, env] : prev.filter((x) => x !== env);
                                setModeloEnEdicion({ ...modeloEnEdicion, entornos_permitidos: next });
                              }}
                            />
                            {env}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Riesgo y Autoridad */}
              {subpestanaEditor === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6, border: "1px solid #bbf7d0" }}>
                    <strong style={{ color: "#166534", display: "block", fontSize: 12.5, marginBottom: 4 }}>
                      Directriz de Riesgo ITIL v4:
                    </strong>
                    <span style={{ fontSize: 12, color: "#166534" }}>
                      Los modelos estándar tienen riesgo fijo <strong>BAJO</strong> predeterminado. Si durante la operación el cambio presentara un riesgo superior, el motor de clasificación lo reclasificará automáticamente a Normal.
                    </span>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1e293b", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={modeloEnEdicion.autorizacion_automatica !== false}
                      onChange={(e) => setModeloEnEdicion({ ...modeloEnEdicion, autorizacion_automatica: e.target.checked })}
                    />
                    Preautorización automática del sistema (Sin intervención de aprobadores)
                  </label>
                </div>
              )}

              {/* 4. Elegibilidad */}
              {subpestanaEditor === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                    Lista de condiciones obligatorias que el solicitante debe verificar y confirmar antes de registrar la RFC:
                  </p>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Nueva condición de elegibilidad..."
                      value={nuevaCondicionElegibilidad}
                      onChange={(e) => setNuevaCondicionElegibilidad(e.target.value)}
                      style={{ flex: 1, padding: "7px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6 }}
                    />
                    <button
                      type="button"
                      onClick={agregarCondicionElegibilidad}
                      style={{ padding: "7px 14px", fontSize: 12, fontWeight: 600, backgroundColor: "#16a34a", color: "#ffffff", border: "none", borderRadius: 6, cursor: "pointer" }}
                    >
                      + Agregar
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(modeloEnEdicion.lista_elegibilidad || []).map((cond, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          backgroundColor: "#f8fafc",
                          borderRadius: 6,
                          border: "1px solid #e2e8f0"
                        }}
                      >
                        <span style={{ fontSize: 12.5, color: "#1e293b" }}>{cond}</span>
                        <button
                          type="button"
                          onClick={() => quitarCondicionElegibilidad(idx)}
                          style={{ background: "none", border: "none", color: "#dc2626", fontSize: 13, cursor: "pointer", fontWeight: 700 }}
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Contenido Prellenado */}
              {subpestanaEditor === 5 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                        Plan detallado de implementación:
                      </label>
                      <label style={{ fontSize: 11.5, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                        <input
                          type="checkbox"
                          checked={(modeloEnEdicion.campos_bloqueados || []).includes("plan_implementacion")}
                          onChange={() => toggleBloqueoCampo("plan_implementacion")}
                        />
                        Bloquear para que el usuario no lo modifique
                      </label>
                    </div>
                    <textarea
                      rows={3}
                      value={modeloEnEdicion.contenido_prellenado?.plan_implementacion || ""}
                      onChange={(e) =>
                        setModeloEnEdicion({
                          ...modeloEnEdicion,
                          contenido_prellenado: {
                            ...modeloEnEdicion.contenido_prellenado,
                            plan_implementacion: e.target.value
                          }
                        })
                      }
                      style={{ width: "100%", padding: "7px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6 }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                        Plan de Rollback (Obligatorio para aprobar el modelo):
                      </label>
                      <label style={{ fontSize: 11.5, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                        <input
                          type="checkbox"
                          checked={(modeloEnEdicion.campos_bloqueados || []).includes("plan_rollback")}
                          onChange={() => toggleBloqueoCampo("plan_rollback")}
                        />
                        Bloquear edición
                      </label>
                    </div>
                    <textarea
                      rows={2}
                      value={modeloEnEdicion.contenido_prellenado?.plan_rollback || ""}
                      onChange={(e) =>
                        setModeloEnEdicion({
                          ...modeloEnEdicion,
                          contenido_prellenado: {
                            ...modeloEnEdicion.contenido_prellenado,
                            plan_rollback: e.target.value
                          }
                        })
                      }
                      style={{ width: "100%", padding: "7px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6 }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                        Plan de pruebas:
                      </label>
                      <textarea
                        rows={2}
                        value={modeloEnEdicion.contenido_prellenado?.plan_pruebas || ""}
                        onChange={(e) =>
                          setModeloEnEdicion({
                            ...modeloEnEdicion,
                            contenido_prellenado: {
                              ...modeloEnEdicion.contenido_prellenado,
                              plan_pruebas: e.target.value
                            }
                          })
                        }
                        style={{ width: "100%", padding: "7px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                        Duración estimada de ejecución:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. 30m, 1h"
                        value={modeloEnEdicion.contenido_prellenado?.duracion_estimada || ""}
                        onChange={(e) =>
                          setModeloEnEdicion({
                            ...modeloEnEdicion,
                            contenido_prellenado: {
                              ...modeloEnEdicion.contenido_prellenado,
                              duracion_estimada: e.target.value
                            }
                          })
                        }
                        style={{ width: "100%", padding: "7px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Programación */}
              {subpestanaEditor === 6 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                      Anticipación mínima requerida (horas):
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={modeloEnEdicion.anticipacion_horas || 24}
                      onChange={(e) => setModeloEnEdicion({ ...modeloEnEdicion, anticipacion_horas: Number(e.target.value) })}
                      style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                      Límite de frecuencia de ejecución por CI:
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={modeloEnEdicion.limite_frecuencia_ci || 5}
                      onChange={(e) => setModeloEnEdicion({ ...modeloEnEdicion, limite_frecuencia_ci: Number(e.target.value) })}
                      style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                    />
                  </div>
                </div>
              )}

              {/* 7. Tareas */}
              {subpestanaEditor === 7 && (
                <div>
                  <p style={{ margin: "0 0 10px 0", fontSize: 12, color: "#64748b" }}>
                    Paquete de tareas operativas y checklist técnico que se crearán automáticamente al programar una RFC con este modelo estándar.
                  </p>
                  <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 12, color: "#475569" }}>
                      Se integran las tareas predeterminadas de fase Pre-implementación, Implementación y Validación definidas en el Submódulo 1.3.3.3.6.
                    </span>
                  </div>
                </div>
              )}

              {/* 8. Control de Calidad Automático */}
              {subpestanaEditor === 8 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#1e293b", fontWeight: 700 }}>
                    <input
                      type="checkbox"
                      checked={modeloEnEdicion.control_calidad_activo !== false}
                      onChange={(e) => setModeloEnEdicion({ ...modeloEnEdicion, control_calidad_activo: e.target.checked })}
                    />
                    Control de Calidad Automático Activo
                  </label>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                        Umbral tasa de fallo (%):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={modeloEnEdicion.umbral_tasa_fallo_pct || 10.0}
                        onChange={(e) => setModeloEnEdicion({ ...modeloEnEdicion, umbral_tasa_fallo_pct: Number(e.target.value) })}
                        style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                        Fallos consecutivos límite:
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={modeloEnEdicion.umbral_fallos_consecutivos || 2}
                        onChange={(e) => setModeloEnEdicion({ ...modeloEnEdicion, umbral_fallos_consecutivos: Number(e.target.value) })}
                        style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                        Días de observación:
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={modeloEnEdicion.dias_observacion_calidad || 90}
                        onChange={(e) => setModeloEnEdicion({ ...modeloEnEdicion, dias_observacion_calidad: Number(e.target.value) })}
                        style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                      />
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: 11.5, color: "#991b1b" }}>
                    * Al superarse estos umbrales de fallo, el sistema <strong>suspende automáticamente</strong> el modelo y las nuevas solicitudes se reclasifican a Normal notificando al Gestor de Cambios.
                  </p>
                </div>
              )}

              {/* 9. Revisión Periódica */}
              {subpestanaEditor === 9 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                      Periodicidad de revisión técnica (meses):
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={modeloEnEdicion.revision_periodica_meses || 6}
                      onChange={(e) => setModeloEnEdicion({ ...modeloEnEdicion, revision_periodica_meses: Number(e.target.value) })}
                      style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                      Fecha de última revisión:
                    </label>
                    <input
                      type="text"
                      disabled
                      value={modeloEnEdicion.fecha_ultima_revision ? new Date(modeloEnEdicion.fecha_ultima_revision).toLocaleDateString() : "Sin revisiones aún"}
                      style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6, backgroundColor: "#f8fafc" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pie del Editor */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                style={{ padding: "7px 14px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6, backgroundColor: "#ffffff", cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarModelo}
                disabled={guardando}
                style={{ padding: "7px 16px", fontSize: 12.5, fontWeight: 600, backgroundColor: "#16a34a", color: "#ffffff", border: "none", borderRadius: 6, cursor: "pointer" }}
              >
                {guardando ? "Guardando..." : "Guardar modelo estándar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
