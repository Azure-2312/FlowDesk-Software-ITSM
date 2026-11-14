"use client";

import React, { useState, useEffect } from "react";

interface CatalogoItem {
  id_item: number;
  catalogo: string;
  id_padre?: number | null;
  padre_nombre?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  color: string;
  orden: number;
  activo: boolean;
  es_sistema: boolean;
  atributos?: any;
  usos_count: number;
}

// Los 10 catálogos ordenados estrictamente según su aparición en el ciclo de vida de un cambio (ITIL v4)
const CATALOGOS_CAMBIOS = [
  // 1. Fase de Solicitud / Alta Inicial del Cambio
  {
    id: "categorias_cambio",
    nombre: "Categorías de cambio",
    desc: "Clasificación jerárquica en 2 niveles de la infraestructura y servicios afectados",
    dondeSeAplica: "Formulario de Solicitud (Fase 1), plantillas RFC y categorización técnica",
    protegido: false,
  },
  {
    id: "origenes",
    nombre: "Orígenes del cambio",
    desc: "Procedencia formal del requerimiento (Problema, Incidente, Proyecto, Solicitud)",
    dondeSeAplica: "Formulario de Solicitud (Fase 1) y vinculación con ticket de origen",
    protegido: false,
  },
  {
    id: "entornos",
    nombre: "Entornos operativos",
    desc: "Ambientes tecnológicos intervenidos (Producción, Preproducción, Pruebas)",
    dondeSeAplica: "Formulario de Solicitud (Fase 1) y cálculo automático de criticidad",
    protegido: false,
  },
  {
    id: "medios_emergencia",
    nombre: "Medios de autorización de emergencia",
    desc: "Canales de dictamen verbal o inmediato en situaciones de crisis (ECAB)",
    dondeSeAplica: "Formulario de Alta de Emergencia (Fase 1) y dictamen urgente ECAB",
    protegido: false,
  },

  // 2. Fase de Planificación Técnica y Evaluación CAB
  {
    id: "tipos_dependencia",
    nombre: "Tipos de dependencia",
    desc: "Relaciones de precedencia, concurrencia o bloqueo entre múltiples RFCs",
    dondeSeAplica: "Planificación técnica, calendario y análisis de conflictos de ventanas",
    protegido: true,
  },
  {
    id: "motivos_aplazamiento",
    nombre: "Motivos de aplazamiento",
    desc: "Causales formales de postergación o reprogramación de la ventana de ejecución",
    dondeSeAplica: "Planificación / Calendario al reprogramar una RFC",
    protegido: false,
  },
  {
    id: "motivos_rechazo",
    nombre: "Motivos de rechazo",
    desc: "Causales formales de denegación por el Gestor de Cambios o el Comité CAB",
    dondeSeAplica: "Evaluación y aprobación al rechazar una RFC",
    protegido: false,
  },

  // 3. Fase de Ejecución, Cierre y Auditoría
  {
    id: "resultados_implementacion",
    nombre: "Resultados de implementación",
    desc: "Dictamen técnico tras ejecutar la ventana (Exitoso, Fallido, Rollback parcial)",
    dondeSeAplica: "Fase de Ejecución / Implementación y automatización del flujo",
    protegido: true,
  },
  {
    id: "causas_fallo",
    nombre: "Causas de fallo",
    desc: "Factores raíz registrados ante un resultado fallido o marcha atrás",
    dondeSeAplica: "Registro de fallo, ejecución de rollback y análisis post-implementación (PIR)",
    protegido: false,
  },
  {
    id: "codigos_cierre",
    nombre: "Códigos de cierre",
    desc: "Estado de culminación formal y efectos en los indicadores de éxito (KPI)",
    dondeSeAplica: "Cierre formal de la RFC tras completar la revisión post-cambio",
    protegido: false,
  },
];

export const PestanaCatalogos: React.FC = () => {
  const [catalogoSeleccionado, setCatalogoSeleccionado] = useState<string>("categorias_cambio");
  const [categoriaPadreActivaId, setCategoriaPadreActivaId] = useState<number | null>(null);
  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");

  // Modales
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [itemEditar, setItemEditar] = useState<CatalogoItem | null>(null);

  // Campos para nuevo / edición
  const [formCodigo, setFormCodigo] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formColor, setFormColor] = useState("#475569");
  const [formIdPadre, setFormIdPadre] = useState<number | "">("");
  const [errorModal, setErrorModal] = useState("");

  const categoriasPadre = items.filter((i) => !i.id_padre && i.activo);
  const catPadreActual = items.find((i) => i.id_item === categoriaPadreActivaId) || null;

  const cargarCatalogo = async (cat: string) => {
    setCargando(true);
    try {
      const res = await fetch(`/api/cambios/configuracion/catalogos?catalogo=${cat}`);
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Respuesta no JSON al cargar catálogo:", text);
        return;
      }
      if (data.ok && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Error al cargar catálogo:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCatalogo(catalogoSeleccionado);
  }, [catalogoSeleccionado]);

  const abrirCrear = () => {
    setFormCodigo("");
    setFormNombre("");
    setFormDescripcion("");
    setFormColor("#2563eb");
    if (catalogoSeleccionado === "categorias_cambio" && categoriaPadreActivaId !== null) {
      setFormIdPadre(categoriaPadreActivaId);
    } else {
      setFormIdPadre("");
    }
    setErrorModal("");
    setModalNuevoAbierto(true);
  };

  const abrirEditar = (item: CatalogoItem) => {
    setItemEditar(item);
    setFormNombre(item.nombre);
    setFormDescripcion(item.descripcion || "");
    setFormColor(item.color || "#475569");
    setFormIdPadre(item.id_padre || "");
    setErrorModal("");
    setModalEditarAbierto(true);
  };

  const guardarNuevo = async () => {
    if (!formCodigo.trim() || !formNombre.trim()) {
      setErrorModal("Código y nombre son obligatorios.");
      return;
    }

    try {
      const res = await fetch("/api/cambios/configuracion/catalogos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catalogo: catalogoSeleccionado,
          codigo: formCodigo,
          nombre: formNombre,
          descripcion: formDescripcion,
          color: formColor,
          id_padre: formIdPadre || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorModal(data.error || "Error al crear elemento.");
        return;
      }

      setModalNuevoAbierto(false);
      cargarCatalogo(catalogoSeleccionado);
    } catch (err: any) {
      setErrorModal(err.message || "Error al conectar.");
    }
  };

  const guardarEdicion = async () => {
    if (!itemEditar || !formNombre.trim()) {
      setErrorModal("El nombre es obligatorio.");
      return;
    }

    try {
      const res = await fetch("/api/cambios/configuracion/catalogos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_item: itemEditar.id_item,
          nombre: formNombre,
          descripcion: formDescripcion,
          color: formColor,
          id_padre: formIdPadre || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorModal(data.error || "Error al actualizar.");
        return;
      }

      setModalEditarAbierto(false);
      cargarCatalogo(catalogoSeleccionado);
    } catch (err: any) {
      setErrorModal(err.message || "Error al conectar.");
    }
  };

  const alternarActivo = async (item: CatalogoItem) => {
    try {
      const res = await fetch("/api/cambios/configuracion/catalogos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_item: item.id_item, activo: !item.activo }),
      });
      const data = await res.json();
      if (res.ok) {
        cargarCatalogo(catalogoSeleccionado);
      } else {
        alert(data.error || "No se pudo cambiar el estado.");
      }
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  const eliminarItem = async (item: CatalogoItem) => {
    if (!confirm(`¿Está seguro de eliminar "${item.nombre}"?`)) return;
    try {
      const res = await fetch(`/api/cambios/configuracion/catalogos?id_item=${item.id_item}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        cargarCatalogo(catalogoSeleccionado);
      } else {
        alert(data.error || "No se pudo eliminar.");
      }
    } catch (err) {
      console.error("Error al eliminar elemento:", err);
    }
  };

  // Filtrado de items
  const itemsFiltrados = items.filter((it) => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return (
      it.nombre.toLowerCase().includes(txt) ||
      it.codigo.toLowerCase().includes(txt) ||
      (it.descripcion && it.descripcion.toLowerCase().includes(txt))
    );
  });

  const categoriasPrincipales = items.filter((it) => !it.id_padre);
  const categoriasPrincipalesFiltradas = categoriasPrincipales.filter((it) => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return (
      it.nombre.toLowerCase().includes(txt) ||
      it.codigo.toLowerCase().includes(txt) ||
      (it.descripcion && it.descripcion.toLowerCase().includes(txt))
    );
  });

  const subcategorias = items.filter((it) => it.id_padre === categoriaPadreActivaId);
  const subcategoriasFiltradas = subcategorias.filter((it) => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return (
      it.nombre.toLowerCase().includes(txt) ||
      it.codigo.toLowerCase().includes(txt) ||
      (it.descripcion && it.descripcion.toLowerCase().includes(txt))
    );
  });

  const catalogosEditables = CATALOGOS_CAMBIOS.filter((c) => !c.protegido);
  const catalogosProtegidos = CATALOGOS_CAMBIOS.filter((c) => c.protegido);
  const catalogoActual = CATALOGOS_CAMBIOS.find((c) => c.id === catalogoSeleccionado);
  const tieneItemsProtegidos = items.some((i) => i.es_sistema);

  const renderBotonCatalogo = (cat: (typeof CATALOGOS_CAMBIOS)[number]) => {
    const activo = catalogoSeleccionado === cat.id;
    return (
      <div
        key={cat.id}
        onClick={() => {
          setCatalogoSeleccionado(cat.id);
          setCategoriaPadreActivaId(null);
          setFiltroTexto("");
        }}
        style={{
          padding: "12px 14px",
          borderRadius: 8,
          cursor: "pointer",
          backgroundColor: "#ffffff",
          border: activo ? "2px solid #2563eb" : "1px solid #cbd5e1",
          boxShadow: activo ? "0 2px 6px rgba(37,99,235,0.08)" : "0 1px 2px rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: activo ? 700 : 600, color: activo ? "#1d4ed8" : "#1e293b" }}>
            {cat.nombre}
          </span>
          {cat.protegido && (
            <span
              title="Catálogo fijo del sistema: no permite agregar ni eliminar valores porque controla reglas internas del flujo"
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 4,
                backgroundColor: "#f1f5f9",
                color: "#475569",
                border: "1px solid #cbd5e1",
                whiteSpace: "nowrap",
              }}
            >
              Fijo (Sistema)
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: "#64748b", lineHeight: 1.35 }}>{cat.desc}</span>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: 16, alignItems: "start" }}>
      {/* Columna Izquierda: Tarjetas de catálogos en una sola lista unificada */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: "2px 4px 6px 4px" }}>
          Catálogos de Gestión de Cambios
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CATALOGOS_CAMBIOS.map(renderBotonCatalogo)}
        </div>
      </div>

      {/* Columna Derecha: Tarjeta unificada para todo el espacio del catálogo */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 10,
          border: "1px solid #cbd5e1",
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        {/* Cabecera unificada: Título a la izquierda, Búsqueda + Botón a la derecha */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
            paddingBottom: 14,
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div>
            {catalogoSeleccionado === "categorias_cambio" && categoriaPadreActivaId !== null ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaPadreActivaId(null);
                    setFiltroTexto("");
                  }}
                  className="boton-secundario"
                  style={{ width: "auto", fontSize: 11.5, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  ← Volver a Categorías Principales
                </button>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: catPadreActual?.color || "#2563eb", display: "inline-block" }} />
                  {catPadreActual?.nombre} · Subcategorías
                </h3>
              </div>
            ) : catalogoSeleccionado === "categorias_cambio" ? (
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Categorías de cambio
              </h3>
            ) : (
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {catalogoActual?.nombre}
              </h3>
            )}
          </div>

          {/* Pegado a la derecha: Buscador + Botón de Acción */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="text"
              className="input-base"
              placeholder={
                catalogoSeleccionado === "categorias_cambio"
                  ? categoriaPadreActivaId !== null
                    ? `Buscar subcategoría...`
                    : "Buscar categoría principal..."
                  : "Buscar en este catálogo..."
              }
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              style={{ width: 230, fontSize: 12 }}
            />

            {catalogoActual?.protegido ? (
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: "6px 12px",
                  borderRadius: 6,
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  whiteSpace: "nowrap",
                }}
              >
                Lista fija del sistema
              </span>
            ) : (
              <button
                type="button"
                className="boton-primario"
                onClick={abrirCrear}
                style={{ width: "auto", fontSize: 12.5, padding: "7px 16px", backgroundColor: "#2563eb", whiteSpace: "nowrap" }}
              >
                {catalogoSeleccionado === "categorias_cambio"
                  ? categoriaPadreActivaId !== null
                    ? "Agregar subcategoría"
                    : "Agregar categoría principal"
                  : "+ Nuevo Valor"}
              </button>
            )}
          </div>
        </div>

        {/* Contenido: Botones de Categorías Principales O Tabla de Subcategorías O Tabla Estándar */}
        {cargando ? (
          <div style={{ textAlign: "center", padding: 32, color: "#2563eb" }}>Cargando catálogo...</div>
        ) : catalogoSeleccionado === "categorias_cambio" && categoriaPadreActivaId === null ? (
          /* Nivel 1: Botones de Categorías Principales */
          categoriasPrincipalesFiltradas.length === 0 ? (
            <div className="tarjeta-formulario" style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
              No se encontraron categorías principales que coincidan con la búsqueda.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
              {categoriasPrincipalesFiltradas.map((cat) => {
                const subcats = items.filter((sub) => sub.id_padre === cat.id_item);
                return (
                  <div
                    key={cat.id_item}
                    onClick={() => {
                      setCategoriaPadreActivaId(cat.id_item);
                      setFiltroTexto("");
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      position: "relative",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: 10,
                      padding: "16px 16px 14px 16px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 120,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#2563eb";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.12)";
                      e.currentTarget.style.backgroundColor = "#fafafa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }}
                  >
                    {/* Botón Lapicito de edición en la esquina superior derecha */}
                    <button
                      type="button"
                      title={`Editar ${cat.nombre}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirEditar(cat);
                      }}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#ffffff",
                        color: "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: 13,
                        transition: "all 0.15s ease",
                        zIndex: 2,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#eff6ff";
                        e.currentTarget.style.color = "#2563eb";
                        e.currentTarget.style.borderColor = "#bfdbfe";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                        e.currentTarget.style.color = "#475569";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                      }}
                    >
                      ✏️
                    </button>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 36, marginBottom: 6 }}>
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: cat.color || "#2563eb",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
                          {cat.nombre}
                        </span>
                      </div>

                      {cat.descripcion && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                            margin: "0 0 10px 0",
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {cat.descripcion}
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: 8,
                        borderTop: "1px solid #f1f5f9",
                        marginTop: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#1e40af",
                          backgroundColor: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        {subcats.length} subcategoría{subcats.length === 1 ? "" : "s"}
                      </span>

                      <span style={{ fontSize: 11.5, fontWeight: 600, color: "#2563eb", display: "flex", alignItems: "center", gap: 4 }}>
                        Ingresar →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : catalogoSeleccionado === "categorias_cambio" && categoriaPadreActivaId !== null ? (
          /* Nivel 2: Tabla de Subcategorías de la Categoría Principal Activa */
          <div className="contenedor-tabla">
            <table className="tabla">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>Color</th>
                  <th>Subcategoría</th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th style={{ width: 80, textAlign: "center" }}>Usos</th>
                  <th style={{ width: 90 }}>Estado</th>
                  <th style={{ width: 140 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {subcategoriasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
                      No hay subcategorías registradas en <strong>{catPadreActual?.nombre}</strong>. Haz clic en <strong>+ Nuevo Valor</strong> arriba para agregar una subcategoría.
                    </td>
                  </tr>
                ) : (
                  subcategoriasFiltradas.map((it) => (
                    <tr key={it.id_item}>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            backgroundColor: it.color || "#475569",
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 600, color: "#1e293b" }}>
                        {it.nombre}
                        {it.es_sistema && (
                          <span
                            title="Valor base protegido por el sistema"
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: 4,
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              border: "1px solid #cbd5e1",
                            }}
                          >
                            Protegido (Sistema)
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 11.5, color: "#64748b" }}>{it.codigo}</td>
                      <td style={{ fontSize: 12, color: "#475569" }}>{it.descripcion || "—"}</td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: it.usos_count > 0 ? "#2563eb" : "#94a3b8" }}>
                        {it.usos_count}
                      </td>
                      <td>
                        <span
                          className="badge-itil"
                          style={{
                            backgroundColor: it.activo ? "#dcfce7" : "#f1f5f9",
                            color: it.activo ? "#166534" : "#64748b",
                            border: `1px solid ${it.activo ? "#86efac" : "#cbd5e1"}`,
                            fontSize: 10.5,
                            fontWeight: 700,
                          }}
                        >
                          {it.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            className="boton-mini"
                            onClick={() => abrirEditar(it)}
                            style={{ fontSize: 11, padding: "2px 6px" }}
                          >
                            Editar
                          </button>
                          {!it.es_sistema && (
                            <button
                              type="button"
                              className="boton-mini"
                              onClick={() => alternarActivo(it)}
                              style={{ fontSize: 11, padding: "2px 6px" }}
                            >
                              {it.activo ? "Desact" : "Act"}
                            </button>
                          )}
                          {!it.es_sistema && it.usos_count === 0 && (
                            <button
                              type="button"
                              className="boton-mini boton-mini-peligro"
                              onClick={() => eliminarItem(it)}
                              style={{ fontSize: 11, padding: "2px 6px" }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Otros Catálogos: Tabla Estándar */
          <div className="contenedor-tabla">
            <table className="tabla">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>Color</th>
                  <th>Nombre</th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th style={{ width: 80, textAlign: "center" }}>Usos</th>
                  <th style={{ width: 90 }}>Estado</th>
                  <th style={{ width: 140 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {itemsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
                      No hay registros en este catálogo.
                    </td>
                  </tr>
                ) : (
                  itemsFiltrados.map((it) => (
                    <tr key={it.id_item}>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            backgroundColor: it.color || "#475569",
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 600, color: "#1e293b" }}>
                        {it.nombre}
                        {it.es_sistema && (
                          <span
                            title="Valor base protegido por el sistema: controla lógica interna del flujo (no eliminable ni desactivable)"
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "1px 6px",
                              borderRadius: 4,
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              border: "1px solid #cbd5e1",
                            }}
                          >
                            Protegido (Sistema)
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 11.5, color: "#64748b" }}>{it.codigo}</td>
                      <td style={{ fontSize: 12, color: "#475569" }}>{it.descripcion || "—"}</td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: it.usos_count > 0 ? "#2563eb" : "#94a3b8" }}>
                        {it.usos_count}
                      </td>
                      <td>
                        <span
                          className="badge-itil"
                          style={{
                            backgroundColor: it.activo ? "#dcfce7" : "#f1f5f9",
                            color: it.activo ? "#166534" : "#64748b",
                            border: `1px solid ${it.activo ? "#86efac" : "#cbd5e1"}`,
                            fontSize: 10.5,
                            fontWeight: 700,
                          }}
                        >
                          {it.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            className="boton-mini"
                            onClick={() => abrirEditar(it)}
                            style={{ fontSize: 11, padding: "2px 6px" }}
                          >
                            Editar
                          </button>
                          {!it.es_sistema && (
                            <button
                              type="button"
                              className="boton-mini"
                              onClick={() => alternarActivo(it)}
                              style={{ fontSize: 11, padding: "2px 6px" }}
                            >
                              {it.activo ? "Desact" : "Act"}
                            </button>
                          )}
                          {!it.es_sistema && it.usos_count === 0 && (
                            <button
                              type="button"
                              className="boton-mini boton-mini-peligro"
                              onClick={() => eliminarItem(it)}
                              style={{ fontSize: 11, padding: "2px 6px" }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear Nuevo Elemento */}
      {modalNuevoAbierto && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }} onClick={() => setModalNuevoAbierto(false)}>
          <div className="modal-contenido" style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 480, width: "100%", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>
              {catalogoSeleccionado === "categorias_cambio"
                ? categoriaPadreActivaId !== null
                  ? `Nueva Subcategoría en: ${catPadreActual?.nombre}`
                  : "Nueva Categoría Principal de Cambio"
                : `Nuevo Valor en ${catalogoActual?.nombre}`}
            </h3>

            {catalogoSeleccionado === "categorias_cambio" && categoriaPadreActivaId !== null && (
              <div style={{ padding: "8px 12px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, fontSize: 12, color: "#1e40af", marginBottom: 12 }}>
                <strong>Categoría Principal asignada:</strong> {catPadreActual?.nombre}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  {catalogoSeleccionado === "categorias_cambio"
                    ? categoriaPadreActivaId !== null
                      ? "Nombre de la subcategoría"
                      : "Nombre de la categoría principal"
                    : "Nombre del valor"}{" "}
                  <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={formNombre}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormNombre(v);
                    if (!formCodigo) setFormCodigo(v.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30));
                  }}
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Código único <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={formCodigo}
                  onChange={(e) => setFormCodigo(e.target.value.toLowerCase())}
                  style={{ width: "100%", fontSize: 12, fontFamily: "monospace" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Descripción explicativa
                </label>
                <textarea
                  className="input-base"
                  rows={2}
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  style={{ width: "100%", fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Color distintivo
                </label>
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  style={{ width: 48, height: 32, cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: 4 }}
                />
              </div>
            </div>

            {errorModal && (
              <div style={{ marginTop: 12, padding: "8px 12px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontSize: 12 }}>
                {errorModal}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button type="button" className="boton-secundario" onClick={() => setModalNuevoAbierto(false)}>
                Cancelar
              </button>
              <button type="button" className="boton-primario" onClick={guardarNuevo} style={{ width: "auto", padding: "8px 16px", backgroundColor: "#2563eb" }}>
                {catalogoSeleccionado === "categorias_cambio"
                  ? categoriaPadreActivaId !== null
                    ? "Guardar Subcategoría"
                    : "Guardar Categoría Principal"
                  : "Guardar Valor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Elemento */}
      {modalEditarAbierto && itemEditar && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }} onClick={() => setModalEditarAbierto(false)}>
          <div className="modal-contenido" style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 480, width: "100%", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>
              {catalogoSeleccionado === "categorias_cambio"
                ? !itemEditar.id_padre
                  ? `Editar Categoría Principal: ${itemEditar.nombre}`
                  : `Editar Subcategoría: ${itemEditar.nombre}`
                : `Editar Valor: ${itemEditar.nombre}`}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Nombre
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              {catalogoSeleccionado === "categorias_cambio" && itemEditar.id_padre && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Categoría Padre
                  </label>
                  <select
                    className="input-base"
                    value={formIdPadre}
                    onChange={(e) => setFormIdPadre(e.target.value ? Number(e.target.value) : "")}
                    style={{ width: "100%", fontSize: 12 }}
                  >
                    {categoriasPadre
                      .filter((cp) => cp.id_item !== itemEditar.id_item)
                      .map((cp) => (
                        <option key={cp.id_item} value={cp.id_item}>
                          {cp.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Descripción
                </label>
                <textarea
                  className="input-base"
                  rows={2}
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  style={{ width: "100%", fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Color
                </label>
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  style={{ width: 48, height: 32, cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: 4 }}
                />
              </div>
            </div>

            {errorModal && (
              <div style={{ marginTop: 12, padding: "8px 12px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontSize: 12 }}>
                {errorModal}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button type="button" className="boton-secundario" onClick={() => setModalEditarAbierto(false)}>
                Cancelar
              </button>
              <button type="button" className="boton-primario" onClick={guardarEdicion} style={{ width: "auto", padding: "8px 16px", backgroundColor: "#2563eb" }}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
