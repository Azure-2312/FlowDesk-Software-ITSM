"use client";

import React, { useState } from "react";

interface CampoPersonalizado {
  id_campo: number;
  entidad: string;
  codigo: string;
  etiqueta: string;
  descripcion?: string;
  tipo: string;
  activo: boolean;
  propiedades?: any;
  formularios_visibles?: any;
  pestana_vista?: string;
  seccion?: string;
  obligatorio?: string;
  orden: number;
  veces_usado: number;
  creador_nombre?: string;
  fecha_creacion: string;
}

interface PestanaCamposPersonalizadosProps {
  campos: CampoPersonalizado[];
  limite: number;
  onRecargar: () => void;
}

export const PestanaCamposPersonalizados: React.FC<PestanaCamposPersonalizadosProps> = ({
  campos,
  limite,
  onRecargar,
}) => {
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [modalAsistenteAbierto, setModalAsistenteAbierto] = useState(false);
  const [pasoAsistente, setPasoAsistente] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState("");

  // Estado del nuevo campo en el asistente de 5 pasos
  const [nuevoCampo, setNuevoCampo] = useState<{
    tipo: string;
    etiqueta: string;
    codigo: string;
    ayuda: string;
    opciones: string;
    seccion: string;
    obligatorio: string;
    tiposCambio: string[];
  }>({
    tipo: "texto",
    etiqueta: "",
    codigo: "",
    ayuda: "",
    opciones: "",
    seccion: "Sección A — Identificación",
    obligatorio: "no",
    tiposCambio: ["NORMAL", "ESTANDAR", "EMERGENCIA"],
  });

  const abrirModalCrear = () => {
    setNuevoCampo({
      tipo: "texto",
      etiqueta: "",
      codigo: "",
      ayuda: "",
      opciones: "",
      seccion: "Sección A — Identificación",
      obligatorio: "no",
      tiposCambio: ["NORMAL", "ESTANDAR", "EMERGENCIA"],
    });
    setPasoAsistente(1);
    setErrorModal("");
    setModalAsistenteAbierto(true);
  };

  const manejarGuardarNuevo = async () => {
    setErrorModal("");
    if (!nuevoCampo.etiqueta.trim() || !nuevoCampo.codigo.trim()) {
      setErrorModal("La etiqueta y el código son obligatorios.");
      return;
    }

    try {
      setGuardando(true);
      const res = await fetch("/api/cambios/configuracion/campos-personalizados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: nuevoCampo.codigo,
          etiqueta: nuevoCampo.etiqueta,
          descripcion: nuevoCampo.ayuda,
          tipo: nuevoCampo.tipo,
          seccion: nuevoCampo.seccion,
          obligatorio: nuevoCampo.obligatorio,
          propiedades: {
            opciones: nuevoCampo.opciones ? nuevoCampo.opciones.split("\n").map((o) => o.trim()).filter(Boolean) : [],
            tipos_cambio: nuevoCampo.tiposCambio,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorModal(data.error || "No se pudo crear el campo.");
        return;
      }

      setModalAsistenteAbierto(false);
      onRecargar();
    } catch (err: any) {
      setErrorModal(err.message || "Error al conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  const alternarEstado = async (c: CampoPersonalizado) => {
    try {
      const res = await fetch("/api/cambios/configuracion/campos-personalizados", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_campo: c.id_campo, activo: !c.activo }),
      });
      if (res.ok) onRecargar();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  const eliminarCampo = async (c: CampoPersonalizado) => {
    if (!confirm(`¿Está seguro de eliminar o desactivar el campo "${c.etiqueta}"?`)) return;
    try {
      const res = await fetch(`/api/cambios/configuracion/campos-personalizados?id_campo=${c.id_campo}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.mensaje || "Operación realizada.");
        onRecargar();
      } else {
        alert(data.error || "No se pudo eliminar.");
      }
    } catch (err) {
      console.error("Error al eliminar campo:", err);
    }
  };

  // Filtrado de campos
  const camposFiltrados = campos.filter((c) => {
    const coincideTexto = !filtroTexto || c.etiqueta.toLowerCase().includes(filtroTexto.toLowerCase()) || c.codigo.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideEstado = filtroEstado === "TODOS" || (filtroEstado === "ACTIVOS" && c.activo) || (filtroEstado === "INACTIVOS" && !c.activo);
    return coincideTexto && coincideEstado;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Barra de cabecera con límite y botón de nuevo campo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#ffffff",
          padding: "14px 18px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Catálogo de Campos Personalizados de RFC
          </h3>
          <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
            Extensión dinámica del formulario y ticket para capturar atributos técnicos específicos ({campos.length} de {limite} campos utilizados).
          </p>
        </div>

        <button
          type="button"
          className="boton-primario"
          onClick={abrirModalCrear}
          disabled={campos.length >= limite}
          style={{ fontSize: 12, padding: "7px 14px", backgroundColor: "#7c3aed" }}
        >
          + Nuevo Campo Personalizado
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          type="text"
          className="input-base"
          placeholder="Buscar por etiqueta o código interno..."
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          style={{ maxWidth: 320, fontSize: 12 }}
        />
        <select
          className="input-base"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{ width: "auto", fontSize: 12 }}
        >
          <option value="TODOS">Todos los estados</option>
          <option value="ACTIVOS">Solo activos</option>
          <option value="INACTIVOS">Solo inactivos</option>
        </select>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>
          {camposFiltrados.length} campo(s) encontrados
        </span>
      </div>

      {/* Tabla de Campos Personalizados */}
      <div className="contenedor-tabla">
        <table className="tabla">
          <thead>
            <tr>
              <th>Etiqueta</th>
              <th>Código interno</th>
              <th>Tipo de dato</th>
              <th>Sección en formulario</th>
              <th>Obligatoriedad</th>
              <th>RFCs que lo usan</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {camposFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
                  No se encontraron campos personalizados para Gestión de Cambios.
                </td>
              </tr>
            ) : (
              camposFiltrados.map((c) => (
                <tr key={c.id_campo}>
                  <td style={{ fontWeight: 600, color: "#1e293b" }}>{c.etiqueta}</td>
                  <td style={{ fontFamily: "monospace", color: "#64748b", fontSize: 11.5 }}>{c.codigo}</td>
                  <td>
                    <span className="badge-itil" style={{ backgroundColor: "#f3e8ff", color: "#6b21a8", fontSize: 11 }}>
                      {c.tipo}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{c.seccion || "Sección A"}</td>
                  <td style={{ fontSize: 12, textTransform: "capitalize" }}>{c.obligatorio || "No"}</td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: c.veces_usado > 0 ? "#2563eb" : "#94a3b8" }}>
                    {c.veces_usado}
                  </td>
                  <td>
                    <span
                      className="badge-itil"
                      style={{
                        backgroundColor: c.activo ? "#dcfce7" : "#f1f5f9",
                        color: c.activo ? "#166534" : "#64748b",
                        border: `1px solid ${c.activo ? "#86efac" : "#cbd5e1"}`,
                        fontWeight: 700,
                      }}
                    >
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="boton-mini"
                        onClick={() => alternarEstado(c)}
                        style={{ fontSize: 11, padding: "3px 6px" }}
                      >
                        {c.activo ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        type="button"
                        className="boton-mini"
                        onClick={() => eliminarCampo(c)}
                        style={{ fontSize: 11, padding: "3px 6px", color: "#dc2626" }}
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
      </div>

      {/* Modal Asistente de 5 Pasos para Nuevo Campo Personalizado */}
      {modalAsistenteAbierto && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 20,
          }}
          onClick={() => setModalAsistenteAbierto(false)}
        >
          <div
            className="modal-contenido"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              maxWidth: 640,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Asistente */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase" }}>
                  Paso {pasoAsistente} de 5
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "2px 0 0 0" }}>
                  {pasoAsistente === 1 && "1. Seleccione el Tipo de Control"}
                  {pasoAsistente === 2 && "2. Identificación y Etiquetas"}
                  {pasoAsistente === 3 && "3. Opciones y Configuración de Tipo"}
                  {pasoAsistente === 4 && "4. Ubicación y Tipos de Cambio"}
                  {pasoAsistente === 5 && "5. Resumen y Confirmación"}
                </h3>
              </div>
              <button
                type="button"
                className="modal-cerrar-boton"
                onClick={() => setModalAsistenteAbierto(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            {/* Barra de Progreso de 5 Pasos */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((p) => (
                <div
                  key={p}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: p <= pasoAsistente ? "#7c3aed" : "#e2e8f0",
                  }}
                />
              ))}
            </div>

            {/* Contenido según el paso */}
            <div style={{ minHeight: 240, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Paso 1: Tipo */}
              {pasoAsistente === 1 && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                    Tipo de dato para la RFC:
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { id: "texto", nombre: "Texto Corto", desc: "Cadena de una línea hasta 150 caracteres" },
                      { id: "area", nombre: "Texto Enriquecido / Área", desc: "Texto multilínea con formato" },
                      { id: "numero", nombre: "Número Entero / Decimal", desc: "Cantidades, montos o métricas" },
                      { id: "fecha", nombre: "Fecha / Fecha y Hora", desc: "Selectores temporales" },
                      { id: "lista", nombre: "Lista Desplegable", desc: "Opciones predefinidas de selección única" },
                      { id: "casilla", nombre: "Casilla Sí / No", desc: "Valor booleano de verificación" },
                      { id: "referencia_ci", nombre: "Referencia a CI de CMDB", desc: "Vínculo con elemento de configuración" },
                      { id: "referencia_ticket", nombre: "Referencia a Ticket", desc: "Vínculo con incidente o problema" },
                    ].map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setNuevoCampo({ ...nuevoCampo, tipo: t.id })}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: `1.5px solid ${nuevoCampo.tipo === t.id ? "#7c3aed" : "#e2e8f0"}`,
                          backgroundColor: nuevoCampo.tipo === t.id ? "#faf5ff" : "#ffffff",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 12, color: nuevoCampo.tipo === t.id ? "#6b21a8" : "#1e293b" }}>
                          {t.nombre}
                        </div>
                        <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2 }}>{t.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paso 2: Identificación */}
              {pasoAsistente === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                      Etiqueta del Campo <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-base"
                      value={nuevoCampo.etiqueta}
                      onChange={(e) => {
                        const val = e.target.value;
                        const codigoAuto = val.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
                        setNuevoCampo({ ...nuevoCampo, etiqueta: val, codigo: nuevoCampo.codigo ? nuevoCampo.codigo : `cf_${codigoAuto}` });
                      }}
                      placeholder="Ej. ID de Licencia de Tercero"
                      style={{ width: "100%", fontSize: 12.5 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                      Código Interno <span style={{ color: "#dc2626" }}>*</span> (Inmutable)
                    </label>
                    <input
                      type="text"
                      className="input-base"
                      value={nuevoCampo.codigo}
                      onChange={(e) => setNuevoCampo({ ...nuevoCampo, codigo: e.target.value.toLowerCase() })}
                      placeholder="cf_licencia_tercero"
                      style={{ width: "100%", fontSize: 12, fontFamily: "monospace" }}
                    />
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      Debe comenzar con el prefijo "cf_". No podrá modificarse tras su creación.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                      Texto de Ayuda / Tooltip
                    </label>
                    <textarea
                      className="input-base"
                      rows={2}
                      value={nuevoCampo.ayuda}
                      onChange={(e) => setNuevoCampo({ ...nuevoCampo, ayuda: e.target.value })}
                      placeholder="Instrucciones breves para el especialista que solicita el cambio..."
                      style={{ width: "100%", fontSize: 12 }}
                    />
                  </div>
                </div>
              )}

              {/* Paso 3: Opciones según tipo */}
              {pasoAsistente === 3 && (
                <div>
                  {nuevoCampo.tipo === "lista" ? (
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                        Opciones de la lista desplegable (una por línea):
                      </label>
                      <textarea
                        className="input-base"
                        rows={5}
                        value={nuevoCampo.opciones}
                        onChange={(e) => setNuevoCampo({ ...nuevoCampo, opciones: e.target.value })}
                        placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
                        style={{ width: "100%", fontSize: 12 }}
                      />
                    </div>
                  ) : (
                    <div style={{ padding: 20, backgroundColor: "#f8fafc", borderRadius: 8, textAlign: "center", color: "#64748b" }}>
                      <p style={{ fontSize: 13, margin: 0 }}>
                        El tipo <strong>{nuevoCampo.tipo}</strong> no requiere lista de opciones personalizada.
                      </p>
                      <p style={{ fontSize: 11.5, margin: "6px 0 0 0" }}>
                        Las validaciones de formato estándar se aplicarán automáticamente.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Paso 4: Ubicación y tipos de cambio aplicables */}
              {pasoAsistente === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                      Sección del Formulario en la que se ubicará:
                    </label>
                    <select
                      className="input-base"
                      value={nuevoCampo.seccion}
                      onChange={(e) => setNuevoCampo({ ...nuevoCampo, seccion: e.target.value })}
                      style={{ width: "100%", fontSize: 12 }}
                    >
                      <option value="Sección A — Identificación">Sección A — Identificación</option>
                      <option value="Sección B — Justificación y descripción">Sección B — Justificación y descripción</option>
                      <option value="Sección C — Alcance y CMDB">Sección C — Alcance y CMDB</option>
                      <option value="Sección D — Evaluación inicial">Sección D — Evaluación inicial</option>
                      <option value="Sección E — Programación y Calendario">Sección E — Programación y Calendario</option>
                      <option value="Sección F — Planes y Responsables">Sección F — Planes y Responsables</option>
                      <option value="Sección H — Evidencias y Documentación">Sección H — Evidencias y Documentación</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                      Tipos de cambio a los que aplica:
                    </label>
                    <div style={{ display: "flex", gap: 12 }}>
                      {["NORMAL", "ESTANDAR", "EMERGENCIA"].map((t) => {
                        const marcado = nuevoCampo.tiposCambio.includes(t);
                        return (
                          <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={marcado}
                              onChange={() => {
                                const nuevos = marcado
                                  ? nuevoCampo.tiposCambio.filter((x) => x !== t)
                                  : [...nuevoCampo.tiposCambio, t];
                                setNuevoCampo({ ...nuevoCampo, tiposCambio: nuevos });
                              }}
                            />
                            {t}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                      Obligatoriedad base:
                    </label>
                    <select
                      className="input-base"
                      value={nuevoCampo.obligatorio}
                      onChange={(e) => setNuevoCampo({ ...nuevoCampo, obligatorio: e.target.value })}
                      style={{ width: "100%", fontSize: 12 }}
                    >
                      <option value="no">Opcional</option>
                      <option value="si">Siempre Obligatorio</option>
                      <option value="segun_tipo">Según Tipo de Cambio</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Paso 5: Resumen */}
              {pasoAsistente === 5 && (
                <div style={{ backgroundColor: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div><strong>Etiqueta:</strong> {nuevoCampo.etiqueta}</div>
                  <div><strong>Código interno:</strong> <code>{nuevoCampo.codigo}</code></div>
                  <div><strong>Tipo:</strong> {nuevoCampo.tipo}</div>
                  <div><strong>Sección:</strong> {nuevoCampo.seccion}</div>
                  <div><strong>Obligatoriedad:</strong> {nuevoCampo.obligatorio}</div>
                  <div><strong>Tipos de cambio:</strong> {nuevoCampo.tiposCambio.join(", ")}</div>
                  {nuevoCampo.ayuda && <div><strong>Ayuda:</strong> {nuevoCampo.ayuda}</div>}
                </div>
              )}
            </div>

            {errorModal && (
              <div style={{ marginTop: 12, padding: "8px 12px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontSize: 12 }}>
                {errorModal}
              </div>
            )}

            {/* Botones de navegación del asistente */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                onClick={() => setPasoAsistente(Math.max(1, pasoAsistente - 1))}
                disabled={pasoAsistente === 1}
                style={{ fontSize: 12 }}
              >
                ← Atrás
              </button>

              {pasoAsistente < 5 ? (
                <button
                  type="button"
                  className="boton-primario"
                  onClick={() => {
                    if (pasoAsistente === 2 && (!nuevoCampo.etiqueta.trim() || !nuevoCampo.codigo.trim())) {
                      setErrorModal("Etiqueta y código son obligatorios para continuar.");
                      return;
                    }
                    setErrorModal("");
                    setPasoAsistente(pasoAsistente + 1);
                  }}
                  style={{ fontSize: 12, backgroundColor: "#7c3aed" }}
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="button"
                  className="boton-primario"
                  onClick={manejarGuardarNuevo}
                  disabled={guardando}
                  style={{ fontSize: 12, backgroundColor: "#16a34a" }}
                >
                  {guardando ? "Creando campo..." : "Confirmar y Crear Campo"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
