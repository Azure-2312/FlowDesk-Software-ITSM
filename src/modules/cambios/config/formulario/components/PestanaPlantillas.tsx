"use client";

import React, { useState, useEffect, useCallback } from "react";
import TablaDobleScroll from "@/shared/components/ui/TablaDobleScroll";

interface CategoriaCambio {
  id_item: number;
  catalogo: string;
  id_padre?: number | null;
  padre_nombre?: string;
  codigo: string;
  nombre: string;
  activo: boolean;
}

interface ModeloEstandar {
  id_modelo: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria_id?: number | null;
  categoria_nombre?: string;
  estado: "BORRADOR" | "EN_REVISION" | "APROBADO" | "SUSPENDIDO" | "RETIRADO";
  version_modelo: number;
  riesgo_fijo: string;
  autorizacion_automatica: boolean;
  lista_elegibilidad: string[];
  contenido_prellenado: {
    motivo?: string;
    plan_implementacion?: string;
    plan_rollback?: string;
    plan_pruebas?: string;
    criterios_exito?: string;
    requiere_interrupcion?: boolean;
    duracion_estimada?: string;
  };
  veces_usado: number;
  veces_exitoso: number;
  tasa_exito_pct: number;
}

export const PestanaPlantillas: React.FC = () => {
  const [modelos, setModelos] = useState<ModeloEstandar[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCambio[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<number | "">("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");

  // Modal Editor de Modelo
  const [modalEditorAbierto, setModalEditorAbierto] = useState(false);
  const [pestañaModal, setPestañaModal] = useState<"general" | "elegibilidad" | "planes">("general");
  const [errorModal, setErrorModal] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [nuevaCondicion, setNuevaCondicion] = useState("");

  const [modeloActivo, setModeloActivo] = useState<Partial<ModeloEstandar>>({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria_id: null,
    estado: "APROBADO",
    version_modelo: 1,
    riesgo_fijo: "bajo",
    autorizacion_automatica: true,
    lista_elegibilidad: [],
    contenido_prellenado: {
      motivo: "",
      plan_implementacion: "",
      plan_rollback: "",
      plan_pruebas: "",
      criterios_exito: "",
      requiere_interrupcion: false,
    },
  });

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resMod, resCat] = await Promise.all([
        fetch("/api/cambios/configuracion/modelos-estandar"),
        fetch("/api/cambios/configuracion/catalogos?catalogo=categorias_cambio"),
      ]);

      const dataMod = await resMod.json().catch(() => ({}));
      const dataCat = await resCat.json().catch(() => ({}));

      if (Array.isArray(dataMod.modelos)) {
        setModelos(dataMod.modelos);
      }
      if (dataCat.ok && Array.isArray(dataCat.items)) {
        setCategorias(dataCat.items);
      }
    } catch (err) {
      console.error("Error al cargar modelos estándar:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirCrearModelo = () => {
    setModeloActivo({
      codigo: `mod_${Date.now().toString(36)}`,
      nombre: "",
      descripcion: "",
      categoria_id: filtroCategoria ? Number(filtroCategoria) : null,
      estado: "APROBADO",
      version_modelo: 1,
      riesgo_fijo: "bajo",
      autorizacion_automatica: true,
      lista_elegibilidad: [
        "El procedimiento se ejecutó con éxito al menos 3 veces de forma controlada.",
        "Existe plan de rollback probado y verificado.",
      ],
      contenido_prellenado: {
        motivo: "Procedimiento operativo estándar recurrente de bajo riesgo.",
        plan_implementacion: "1. Notificar inicio de ventana técnica.\n2. Ejecutar procedimiento operativo validado.\n3. Verificar telemetría y salud del servicio.",
        plan_rollback: "1. Revertir cambios ejecutados.\n2. Restaurar configuración base previa.\n3. Comprobar operatividad normal.",
        plan_pruebas: "1. Verificación de logs y puertos.\n2. Prueba de humo y conectividad de usuarios.",
        criterios_exito: "1. Cero alertas críticas en monitoreo.\n2. Servicio restablecido y validado.",
        requiere_interrupcion: false,
      },
    });
    setPestañaModal("general");
    setErrorModal("");
    setModalEditorAbierto(true);
  };

  const abrirEditarModelo = (m: ModeloEstandar) => {
    setModeloActivo(JSON.parse(JSON.stringify(m)));
    setPestañaModal("general");
    setErrorModal("");
    setModalEditorAbierto(true);
  };

  const cambiarEstadoModelo = async (id: number, transicion: string) => {
    try {
      const res = await fetch("/api/cambios/configuracion/modelos-estandar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_modelo: id, transicion_estado: transicion }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo cambiar el estado del modelo.");
        return;
      }
      cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const eliminarModelo = async (m: ModeloEstandar) => {
    if (!confirm(`¿Desea eliminar el modelo estándar "${m.nombre}"?`)) return;
    try {
      const res = await fetch(`/api/cambios/configuracion/modelos-estandar?id=${m.id_modelo}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        cargarDatos();
      } else {
        alert(data.error || "No se pudo eliminar el modelo estándar.");
      }
    } catch (err) {
      console.error("Error al eliminar modelo estándar:", err);
    }
  };

  const agregarCondicion = () => {
    if (!nuevaCondicion.trim()) return;
    const actuales = modeloActivo.lista_elegibilidad || [];
    setModeloActivo({
      ...modeloActivo,
      lista_elegibilidad: [...actuales, nuevaCondicion.trim()],
    });
    setNuevaCondicion("");
  };

  const quitarCondicion = (idx: number) => {
    const actuales = modeloActivo.lista_elegibilidad || [];
    setModeloActivo({
      ...modeloActivo,
      lista_elegibilidad: actuales.filter((_, i) => i !== idx),
    });
  };

  const guardarModelo = async () => {
    if (!modeloActivo.nombre?.trim() || (!modeloActivo.id_modelo && !modeloActivo.codigo?.trim())) {
      setErrorModal("El nombre y código identificador son obligatorios.");
      return;
    }

    try {
      setGuardando(true);
      setErrorModal("");
      const esEdicion = !!modeloActivo.id_modelo;
      const res = await fetch("/api/cambios/configuracion/modelos-estandar", {
        method: esEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modeloActivo),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorModal(data.error || "Error al guardar el modelo estándar.");
        return;
      }

      setModalEditorAbierto(false);
      cargarDatos();
    } catch (err: any) {
      setErrorModal(err.message || "Error de red al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const categoriasPadre = categorias.filter((c) => !c.id_padre);
  const obtenerHijas = (idPadre: number) => categorias.filter((c) => c.id_padre === idPadre);

  const modelosFiltrados = modelos.filter((m) => {
    if (filtroEstado !== "todos" && m.estado !== filtroEstado) {
      return false;
    }
    if (filtroCategoria !== "") {
      const catId = Number(filtroCategoria);
      const hijasIds = obtenerHijas(catId).map((h) => h.id_item);
      const coincide = m.categoria_id === catId || (m.categoria_id ? hijasIds.includes(m.categoria_id) : false);
      if (!coincide) return false;
    }
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return (
      m.nombre.toLowerCase().includes(txt) ||
      m.codigo.toLowerCase().includes(txt) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(txt)) ||
      (m.categoria_nombre && m.categoria_nombre.toLowerCase().includes(txt))
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Cabecera Informativa */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#ffffff",
          padding: "16px 20px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>📋</span>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Modelos de Cambio Estándar (Preautorizados)
            </h3>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0 0" }}>
            Catálogo institucional unificado según directrices ITIL v4. Los modelos en estado <strong>Aprobado</strong> aparecen
            directamente en el formulario operativo al seleccionar la modalidad <strong>Cambio Estándar</strong>, prellenando
            automáticamente planes técnicos, pruebas y rollback.
          </p>
        </div>

        <button
          type="button"
          className="boton-primario"
          onClick={abrirCrearModelo}
          style={{ width: "auto", fontSize: 13, padding: "8px 16px", backgroundColor: "#16a34a" }}
        >
          Nuevo Modelo Estándar
        </button>
      </div>

      {/* Barra de Filtros */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <input
          type="text"
          className="input-base"
          placeholder="Buscar por nombre, código o descripción..."
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          style={{ maxWidth: 360, fontSize: 12 }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Categoría Técnica:</label>
          <select
            className="input-base"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value ? Number(e.target.value) : "")}
            style={{ fontSize: 12, minWidth: 200 }}
          >
            <option value="">Todas las categorías</option>
            {categoriasPadre.map((cp) => {
              const hijas = obtenerHijas(cp.id_item);
              return (
                <React.Fragment key={cp.id_item}>
                  <option value={cp.id_item}>{cp.nombre}</option>
                  {hijas.map((h) => (
                    <option key={h.id_item} value={h.id_item}>
                      &nbsp;&nbsp;↳ {h.nombre}
                    </option>
                  ))}
                </React.Fragment>
              );
            })}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Estado:</label>
          <select
            className="input-base"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{ fontSize: 12, minWidth: 140 }}
          >
            <option value="todos">Todos los estados</option>
            <option value="APROBADO">Aprobado</option>
            <option value="BORRADOR">Borrador</option>
            <option value="EN_REVISION">En revisión</option>
            <option value="SUSPENDIDO">Suspendido</option>
          </select>
        </div>

        <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>
          {modelosFiltrados.length} modelo(s) registrado(s)
        </span>
      </div>

      {/* Tabla de Modelos */}
      <div className="contenedor-tabla">
        {cargando ? (
          <div style={{ textAlign: "center", padding: 32, color: "#2563eb" }}>Cargando catálogo de modelos...</div>
        ) : (
          <TablaDobleScroll>
            <table className="tabla" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Nombre del Modelo y Código</th>
                  <th>Categoría Técnica</th>
                  <th style={{ width: 110, textAlign: "center" }}>Estado</th>
                  <th style={{ width: 90, textAlign: "center" }}>Riesgo</th>
                  <th style={{ width: 80, textAlign: "center" }}>Usos</th>
                  <th style={{ width: 90, textAlign: "center" }}>% Éxito</th>
                  <th style={{ width: 220, textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
              {modelosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
                    No se encontraron modelos de cambio estándar con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                modelosFiltrados.map((m) => {
                  const esAprobado = m.estado === "APROBADO";
                  return (
                    <tr key={m.id_modelo}>
                      <td>
                        <strong style={{ color: "#0f172a", display: "block", fontSize: 13 }}>{m.nombre}</strong>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b" }}>{m.codigo}</span>
                      </td>
                      <td style={{ fontSize: 12, color: "#334155" }}>
                        {m.categoria_nombre ? (
                          <span style={{ padding: "2px 8px", borderRadius: 4, backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", fontWeight: 500 }}>
                            {m.categoria_nombre}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Sin categoría</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className="badge-itil"
                          style={{
                            backgroundColor: esAprobado ? "#dcfce7" : m.estado === "SUSPENDIDO" ? "#fee2e2" : "#fef9c3",
                            color: esAprobado ? "#15803d" : m.estado === "SUSPENDIDO" ? "#991b1b" : "#854d0e",
                            fontSize: 10.5,
                            fontWeight: 700,
                          }}
                        >
                          {m.estado}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase" }}>
                          {m.riesgo_fijo || "bajo"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: m.veces_usado > 0 ? "#2563eb" : "#94a3b8" }}>
                        {m.veces_usado || 0}
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: (m.tasa_exito_pct || 100) >= 90 ? "#16a34a" : "#dc2626" }}>
                        {m.tasa_exito_pct || 100}%
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                          {esAprobado ? (
                            <button
                              type="button"
                              className="boton-mini"
                              onClick={() => cambiarEstadoModelo(m.id_modelo, "suspender")}
                              style={{
                                fontSize: 11,
                                padding: "4px 8px",
                                backgroundColor: "#fef2f2",
                                color: "#b91c1c",
                                border: "1px solid #fecaca",
                                fontWeight: 600,
                              }}
                            >
                              Suspender
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="boton-mini"
                              onClick={() => cambiarEstadoModelo(m.id_modelo, "aprobar")}
                              style={{
                                fontSize: 11,
                                padding: "4px 8px",
                                backgroundColor: "#f0fdf4",
                                color: "#15803d",
                                border: "1px solid #bbf7d0",
                                fontWeight: 600,
                              }}
                            >
                              Aprobar
                            </button>
                          )}
                          <button
                            type="button"
                            className="boton-mini"
                            onClick={() => abrirEditarModelo(m)}
                            style={{ fontSize: 11, padding: "4px 8px" }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="boton-mini boton-mini-peligro"
                            onClick={() => eliminarModelo(m)}
                            style={{ fontSize: 11, padding: "4px 8px" }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </TablaDobleScroll>
        )}
      </div>

      {/* Modal Editor de Modelo Estándar */}
      {modalEditorAbierto && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setModalEditorAbierto(false)}
        >
          <div
            className="modal-contenido"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              maxWidth: 820,
              width: "100%",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-ticket-cabecera">
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {modeloActivo.id_modelo ? `Editar Modelo Estándar: ${modeloActivo.nombre}` : "Nuevo Modelo de Cambio Estándar"}
              </h3>
              <button type="button" className="modal-cerrar-boton" onClick={() => setModalEditorAbierto(false)}>
                ✕
              </button>
            </div>

            <div className="modal-ticket-cuerpo">
              {/* Pestañas internas */}
              <div style={{ display: "flex", gap: 6, borderBottom: "1px solid #e2e8f0" }}>
                {[
                  { id: "general", label: "1. Datos Generales y Categoría" },
                  { id: "elegibilidad", label: "2. Criterios de Elegibilidad" },
                  { id: "planes", label: "3. Planes Técnicos y Rollback" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPestañaModal(tab.id as any)}
                    style={{
                      padding: "8px 14px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      color: pestañaModal === tab.id ? "#16a34a" : "#64748b",
                      borderBottom: `2px solid ${pestañaModal === tab.id ? "#16a34a" : "transparent"}`,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 1. Datos Generales */}
              {pestañaModal === "general" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                      Nombre del Modelo Estándar <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-base"
                      value={modeloActivo.nombre || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setModeloActivo({
                          ...modeloActivo,
                          nombre: v,
                          codigo: modeloActivo.codigo ? modeloActivo.codigo : `mod_${v.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30)}`,
                        });
                      }}
                      placeholder="p.ej. Reinicio programado de nodo de aplicación"
                      style={{ width: "100%", fontSize: 12.5 }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                        Código Identificador <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="input-base"
                        value={modeloActivo.codigo || ""}
                        onChange={(e) => setModeloActivo({ ...modeloActivo, codigo: e.target.value.toLowerCase() })}
                        disabled={!!modeloActivo.id_modelo}
                        style={{ width: "100%", fontSize: 12, fontFamily: "monospace" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                        Categoría Técnica Vinculada <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <select
                        className="input-base"
                        value={modeloActivo.categoria_id || ""}
                        onChange={(e) =>
                          setModeloActivo({
                            ...modeloActivo,
                            categoria_id: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        style={{ width: "100%", fontSize: 12 }}
                      >
                        <option value="">— Seleccionar categoría técnica</option>
                        {categoriasPadre.map((padre) => {
                          const hijas = obtenerHijas(padre.id_item);
                          return (
                            <React.Fragment key={padre.id_item}>
                              <option value={padre.id_item} style={{ fontWeight: "bold" }}>📁 {padre.nombre}</option>
                              {hijas.map((h) => (
                                <option key={h.id_item} value={h.id_item}>
                                  &nbsp;&nbsp;&nbsp;&nbsp;↳ {h.nombre}
                                </option>
                              ))}
                            </React.Fragment>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                      Descripción y Alcance Operativo
                    </label>
                    <textarea
                      className="input-base"
                      rows={3}
                      value={modeloActivo.descripcion || ""}
                      onChange={(e) => setModeloActivo({ ...modeloActivo, descripcion: e.target.value })}
                      placeholder="Describa el alcance de este procedimiento operativo estándar..."
                      style={{ width: "100%", fontSize: 12 }}
                    />
                  </div>

                  <div style={{ padding: 12, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 12, color: "#166534" }}>
                    ℹ️ <strong>Riesgo Fijo ITIL v4:</strong> Todo modelo estándar se registra con nivel de riesgo <strong>Bajo</strong> y autorización preaprobada automática.
                  </div>
                </div>
              )}

              {/* 2. Criterios de Elegibilidad */}
              {pestañaModal === "elegibilidad" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                    Condiciones estrictas que deben verificarse antes de permitir que un solicitante ejecute este cambio bajo la modalidad Estándar sin convocar al comité CAB:
                  </p>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      className="input-base"
                      placeholder="Nueva condición de elegibilidad (ej. Se validó respaldo previo en NAS)..."
                      value={nuevaCondicion}
                      onChange={(e) => setNuevaCondicion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          agregarCondicion();
                        }
                      }}
                      style={{ flex: 1, fontSize: 12 }}
                    />
                    <button
                      type="button"
                      className="boton-secundario"
                      onClick={agregarCondicion}
                      style={{ fontSize: 12, padding: "6px 12px" }}
                    >
                      + Agregar Criterio
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                    {(modeloActivo.lista_elegibilidad || []).length === 0 ? (
                      <div style={{ padding: 16, backgroundColor: "#f8fafc", borderRadius: 6, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                        No hay criterios definidos. Se recomienda al menos 1 condición para autorizar el modelo.
                      </div>
                    ) : (
                      modeloActivo.lista_elegibilidad!.map((cond, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "#f8fafc",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #e2e8f0",
                            fontSize: 12,
                          }}
                        >
                          <span style={{ color: "#334155" }}>✅ {cond}</span>
                          <button
                            type="button"
                            onClick={() => quitarCondicion(idx)}
                            style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 14 }}
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 3. Planes Técnicos Prellenados */}
              {pestañaModal === "planes" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                      Motivo / Justificación Predefinida <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <textarea
                      className="input-base"
                      rows={2}
                      value={modeloActivo.contenido_prellenado?.motivo || ""}
                      onChange={(e) =>
                        setModeloActivo({
                          ...modeloActivo,
                          contenido_prellenado: { ...modeloActivo.contenido_prellenado, motivo: e.target.value },
                        })
                      }
                      style={{ width: "100%", fontSize: 12 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                      Plan de Implementación Paso a Paso <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <textarea
                      className="input-base"
                      rows={3}
                      value={modeloActivo.contenido_prellenado?.plan_implementacion || ""}
                      onChange={(e) =>
                        setModeloActivo({
                          ...modeloActivo,
                          contenido_prellenado: { ...modeloActivo.contenido_prellenado, plan_implementacion: e.target.value },
                        })
                      }
                      style={{ width: "100%", fontSize: 12 }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                        Plan de Pruebas <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        className="input-base"
                        rows={2}
                        value={modeloActivo.contenido_prellenado?.plan_pruebas || ""}
                        onChange={(e) =>
                          setModeloActivo({
                            ...modeloActivo,
                            contenido_prellenado: { ...modeloActivo.contenido_prellenado, plan_pruebas: e.target.value },
                          })
                        }
                        style={{ width: "100%", fontSize: 12 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                        Criterios de Éxito <span style={{ color: "#dc2626" }}>*</span>
                      </label>
                      <textarea
                        className="input-base"
                        rows={2}
                        value={modeloActivo.contenido_prellenado?.criterios_exito || ""}
                        onChange={(e) =>
                          setModeloActivo({
                            ...modeloActivo,
                            contenido_prellenado: { ...modeloActivo.contenido_prellenado, criterios_exito: e.target.value },
                          })
                        }
                        style={{ width: "100%", fontSize: 12 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                      Plan de Rollback (Obligatorio ITIL v4) <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <textarea
                      className="input-base"
                      rows={2}
                      value={modeloActivo.contenido_prellenado?.plan_rollback || ""}
                      onChange={(e) =>
                        setModeloActivo({
                          ...modeloActivo,
                          contenido_prellenado: { ...modeloActivo.contenido_prellenado, plan_rollback: e.target.value },
                        })
                      }
                      style={{ width: "100%", fontSize: 12 }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      id="mod-interrupcion"
                      checked={!!modeloActivo.contenido_prellenado?.requiere_interrupcion}
                      onChange={(e) =>
                        setModeloActivo({
                          ...modeloActivo,
                          contenido_prellenado: { ...modeloActivo.contenido_prellenado, requiere_interrupcion: e.target.checked },
                        })
                      }
                    />
                    <label htmlFor="mod-interrupcion" style={{ fontSize: 12, color: "#334155" }}>
                      ¿Este procedimiento operativo estándar requiere interrupción o caída de servicio?
                    </label>
                  </div>
                </div>
              )}

              {errorModal && (
                <div style={{ padding: "8px 12px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontSize: 12 }}>
                  {errorModal}
                </div>
              )}
            </div>

            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <button type="button" className="boton-secundario" onClick={() => setModalEditorAbierto(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="boton-primario"
                onClick={guardarModelo}
                disabled={guardando}
                style={{ width: "auto", padding: "8px 16px", backgroundColor: "#16a34a" }}
              >
                {guardando ? "Guardando..." : "Guardar Modelo Estándar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
