"use client";

import { useEffect, useState, useMemo, FormEvent } from "react";
import { validarTexto, validarNumeroPositivo, validarSlaTiempos } from "@/shared/lib/validaciones";
import { AlertaCampo } from "@/shared/components/ui/AlertaCampo";

export interface CategoriaAdmin {
  id_categoria: number;
  id_tipo_ticket: number;
  tipo_nombre: string;
  tipo_codigo: string;
  nombre: string;
  codigo_corto: string;
  descripcion: string | null;
  sla_default_respuesta: number;
  sla_default_resolucion: number;
  estado_registro: boolean;
  id_padre: number | null;
  categoria_padre_nombre: string | null;
  total_servicios: number;
  servicios_activos: number;
  total_tickets: number;
}

function IconoCategoriaMini({ nombre, codigo }: { nombre: string; codigo?: string }) {
  const n = (nombre || "").toLowerCase();
  const c = (codigo || "").toUpperCase();

  if (n.includes("red") || c === "RED") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    );
  }
  if (n.includes("seguridad") || n.includes("certificado") || c === "SEC") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (n.includes("hardware") || n.includes("equipo") || c === "HW") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }
  if (n.includes("software") || n.includes("aplicaci") || n.includes("instalaci") || c === "SW") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }
  if (n.includes("usuario") || n.includes("acceso") || c === "ACC") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (n.includes("servidor") || n.includes("infraestructura") || c === "INF") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    );
  }
  if (n.includes("base de datos") || n.includes("almacenamiento") || c === "DB") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    );
  }
  if (n.includes("telefon") || c === "TEL") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  if (n.includes("impresi") || c === "PRN") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    );
  }
  if (n.includes("correo") || n.includes("mensajer") || c === "MAIL") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

export function GestionCategorias({ onActualizar }: { onActualizar?: () => void }) {
  const [categorias, setCategorias] = useState<CategoriaAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeInfo, setMensajeInfo] = useState<string | null>(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "1" | "2">("todos");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("activos");
  const [busqueda, setBusqueda] = useState("");

  // Modo de vista: lista vs formulario (crear / editar)
  const [modoEdicion, setModoEdicion] = useState<"ninguno" | "crear" | "editar">("ninguno");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaAdmin | null>(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<CategoriaAdmin | null>(null);

  // Campos del formulario y seguimiento de validaciones en tiempo real
  const [formNombre, setFormNombre] = useState("");
  const [formTipo, setFormTipo] = useState<number>(1);
  const [formCodigoCorto, setFormCodigoCorto] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formSlaRespuesta, setFormSlaRespuesta] = useState<number | string>(4);
  const [formSlaResolucion, setFormSlaResolucion] = useState<number | string>(24);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Control de interacción para validaciones dinámicas
  const [tocado, setTocado] = useState<{
    nombre?: boolean;
    codigo?: boolean;
    slaRespuesta?: boolean;
    slaResolucion?: boolean;
    descripcion?: boolean;
  }>({});
  const [intentadoGuardar, setIntentadoGuardar] = useState(false);

  async function cargarCategorias() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categorias?estado=todos");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudieron cargar las categorías.");
        return;
      }
      setCategorias(data.categorias || []);
      if (onActualizar) onActualizar();
    } catch {
      setError("Error de conexión al cargar la lista de categorías.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCategorias();
  }, []);

  // Filtrado reactivo en memoria
  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((c) => {
      if (filtroTipo !== "todos" && String(c.id_tipo_ticket) !== filtroTipo) {
        return false;
      }
      if (filtroEstado === "activos" && !c.estado_registro) {
        return false;
      }
      if (filtroEstado === "inactivos" && c.estado_registro) {
        return false;
      }
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincideNombre = c.nombre.toLowerCase().includes(q);
        const coincideCodigo = c.codigo_corto.toLowerCase().includes(q);
        const coincideDesc = (c.descripcion || "").toLowerCase().includes(q);
        if (!coincideNombre && !coincideCodigo && !coincideDesc) return false;
      }
      return true;
    });
  }, [categorias, filtroTipo, filtroEstado, busqueda]);

  // Métricas rápidas
  const totalCategorias = categorias.length;
  const cantIncidentes = categorias.filter((c) => c.id_tipo_ticket === 1).length;
  const cantSolicitudes = categorias.filter((c) => c.id_tipo_ticket === 2).length;
  const cantActivas = categorias.filter((c) => c.estado_registro).length;

  function abrirCrear() {
    setCategoriaSeleccionada(null);
    setFormNombre("");
    setFormTipo(filtroTipo === "2" ? 2 : 1);
    setFormCodigoCorto("");
    setFormDescripcion("");
    setFormSlaRespuesta(4);
    setFormSlaResolucion(24);
    setErrorForm(null);
    setTocado({});
    setIntentadoGuardar(false);
    setModoEdicion("crear");
  }

  function abrirEditar(c: CategoriaAdmin) {
    setCategoriaSeleccionada(c);
    setFormNombre(c.nombre);
    setFormTipo(c.id_tipo_ticket);
    setFormCodigoCorto(c.codigo_corto);
    setFormDescripcion(c.descripcion || "");
    setFormSlaRespuesta(c.sla_default_respuesta || 4);
    setFormSlaResolucion(c.sla_default_resolucion || 24);
    setErrorForm(null);
    setTocado({});
    setIntentadoGuardar(false);
    setModoEdicion("editar");
  }

  function cerrarFormulario() {
    setModoEdicion("ninguno");
    setCategoriaSeleccionada(null);
    setErrorForm(null);
    setTocado({});
    setIntentadoGuardar(false);
  }

  async function alternarEstado(c: CategoriaAdmin) {
    const nuevoEstado = !c.estado_registro;
    try {
      const res = await fetch(`/api/admin/categorias/${c.id_categoria}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_registro: nuevoEstado }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo actualizar el estado de la categoría.");
        return;
      }
      setMensajeInfo(
        nuevoEstado
          ? `Categoría [${c.codigo_corto}] ${c.nombre} activada. Ahora está disponible en el catálogo y formularios.`
          : `Categoría [${c.codigo_corto}] ${c.nombre} desactivada. Oculta para nuevos tickets y catálogo.`
      );
      await cargarCategorias();
    } catch {
      alert("Error de conexión al cambiar el estado.");
    }
  }

  async function ejecutarEliminar(c: CategoriaAdmin) {
    try {
      const res = await fetch(`/api/admin/categorias/${c.id_categoria}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo eliminar la categoría.");
        return;
      }
      setCategoriaAEliminar(null);
      setMensajeInfo(data.mensaje || `Categoría "${c.nombre}" procesada.`);
      await cargarCategorias();
    } catch {
      alert("Error de conexión al eliminar la categoría.");
    }
  }

  // Estilo visual estándar para campos con error (borde rojo y fondo tenue, sin emojis ni alertas verdes)
  const estiloInputError = {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  };

  // Validaciones en tiempo real para el formulario
  // 1. Nombre de categoría
  const nombreTrim = formNombre.trim();
  const nombreTocado = Boolean(tocado.nombre || intentadoGuardar || formNombre.length > 0);
  let errorNombre: string | null = null;
  if (nombreTocado) {
    if (!nombreTrim) {
      errorNombre = "El nombre de la categoría es obligatorio.";
    } else if (nombreTrim.length < 3) {
      errorNombre = `El nombre debe tener al menos 3 caracteres (actualmente tiene ${nombreTrim.length}).`;
    } else if (nombreTrim.length > 60) {
      errorNombre = `El nombre no puede superar los 60 caracteres (actualmente tiene ${nombreTrim.length}).`;
    } else {
      const existeDuplicadoNombre = categorias.some(
        (c) =>
          c.id_tipo_ticket === formTipo &&
          c.nombre.trim().toLowerCase() === nombreTrim.toLowerCase() &&
          c.id_categoria !== categoriaSeleccionada?.id_categoria
      );
      if (existeDuplicadoNombre) {
        errorNombre = `Ya existe una categoría denominada "${nombreTrim}" para este tipo de requerimiento.`;
      }
    }
  }

  // 2. Código Corto Mnemónico
  const codTrim = formCodigoCorto.trim().toUpperCase();
  const codigoTocado = Boolean(tocado.codigo || intentadoGuardar || formCodigoCorto.length > 0);
  let errorCodigo: string | null = null;
  if (codigoTocado) {
    if (!codTrim) {
      errorCodigo = "El código corto es obligatorio.";
    } else if (/[^A-Z0-9]/.test(codTrim)) {
      errorCodigo = "El código corto solo puede contener letras mayúsculas y números (sin espacios ni caracteres especiales).";
    } else if (codTrim.length < 2) {
      errorCodigo = `El código corto debe contener al menos 2 caracteres (actualmente tiene ${codTrim.length}).`;
    } else if (codTrim.length > 10) {
      errorCodigo = "El código corto no puede exceder los 10 caracteres.";
    } else {
      const existeDuplicadoCodigo = categorias.some(
        (c) =>
          c.id_tipo_ticket === formTipo &&
          c.codigo_corto.trim().toUpperCase() === codTrim &&
          c.id_categoria !== categoriaSeleccionada?.id_categoria
      );
      if (existeDuplicadoCodigo) {
        errorCodigo = `El código corto "${codTrim}" ya está registrado para este tipo de requerimiento. Elija otro código.`;
      }
    }
  }

  // 3. SLAs de respuesta y resolución
  const numSlaResp = Number(formSlaRespuesta);
  const numSlaReso = Number(formSlaResolucion);
  const slaRespTocado = Boolean(tocado.slaRespuesta || intentadoGuardar || String(formSlaRespuesta).length > 0);
  const slaResoTocado = Boolean(tocado.slaResolucion || intentadoGuardar || String(formSlaResolucion).length > 0);

  let errorSlaRespuesta: string | null = null;
  if (slaRespTocado) {
    if (isNaN(numSlaResp) || formSlaRespuesta === "" || formSlaRespuesta === null || formSlaRespuesta === undefined) {
      errorSlaRespuesta = "El SLA de primera respuesta es obligatorio.";
    } else if (numSlaResp < 0.5) {
      errorSlaRespuesta = "El SLA de primera respuesta debe ser de al menos 0.5 horas (30 minutos).";
    } else if (numSlaResp > 720) {
      errorSlaRespuesta = "El SLA de primera respuesta no puede superar las 720 horas (30 días).";
    }
  }

  let errorSlaResolucion: string | null = null;
  if (slaResoTocado) {
    if (isNaN(numSlaReso) || formSlaResolucion === "" || formSlaResolucion === null || formSlaResolucion === undefined) {
      errorSlaResolucion = "El SLA de resolución total es obligatorio.";
    } else if (numSlaReso < 1) {
      errorSlaResolucion = "El SLA de resolución total debe ser de al menos 1 hora.";
    } else if (numSlaReso > 720) {
      errorSlaResolucion = "El SLA de resolución total no puede superar las 720 horas (30 días).";
    }
  }

  // Cross-field SLA check ITIL v4: Primera respuesta < Resolución total
  const valSlaCruzado = validarSlaTiempos(numSlaResp, numSlaReso);
  const errorSlaCruzado =
    !errorSlaRespuesta && !errorSlaResolucion && !valSlaCruzado.valido
      ? valSlaCruzado.mensaje
      : null;

  // 4. Descripción funcional
  const descTocado = Boolean(tocado.descripcion || intentadoGuardar || formDescripcion.length > 0);
  let errorDescripcion: string | null = null;
  if (descTocado && formDescripcion.length > 200) {
    errorDescripcion = `La descripción funcional no puede superar los 200 caracteres (actualmente tiene ${formDescripcion.length}).`;
  }

  // Estado global de validez del formulario
  const formularioValido = Boolean(
    nombreTrim.length >= 3 &&
    nombreTrim.length <= 60 &&
    !errorNombre &&
    codTrim.length >= 2 &&
    codTrim.length <= 10 &&
    !errorCodigo &&
    !errorSlaRespuesta &&
    !errorSlaResolucion &&
    valSlaCruzado.valido &&
    !errorDescripcion
  );

  async function guardarFormulario(e: FormEvent) {
    e.preventDefault();
    setIntentadoGuardar(true);
    setErrorForm(null);

    if (!formularioValido) {
      setErrorForm("Por favor, revise y corrija los campos marcados en rojo antes de continuar.");
      return;
    }

    const codLimpio = codTrim.replace(/[^A-Z0-9]/g, "");

    setGuardando(true);
    try {
      const url = modoEdicion === "crear" ? "/api/admin/categorias" : `/api/admin/categorias/${categoriaSeleccionada?.id_categoria}`;
      const method = modoEdicion === "crear" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formNombre.trim(),
          id_tipo_ticket: formTipo,
          codigo_corto: codLimpio,
          descripcion: formDescripcion.trim() || null,
          sla_default_respuesta: numSlaResp,
          sla_default_resolucion: numSlaReso,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorForm(data.error || "No se pudo guardar la categoría.");
        return;
      }

      setMensajeInfo(data.mensaje || `Categoría "${formNombre.trim()}" guardada exitosamente.`);
      cerrarFormulario();
      await cargarCategorias();
    } catch {
      setErrorForm("Error de conexión al guardar la categoría.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      {/* Mensajes de Estado Generales */}
      {error && (
        <div className="mensaje-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {mensajeInfo && (
        <div
          style={{
            backgroundColor: "#f1f5f9",
            border: "1px solid #cbd5e1",
            color: "#1e293b",
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{mensajeInfo}</span>
          <button
            type="button"
            onClick={() => setMensajeInfo(null)}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontWeight: 700 }}
          >
            Cerrar
          </button>
        </div>
      )}

      {/* MODAL / VISTA DE FORMULARIO: CREAR O EDITAR */}
      {modoEdicion !== "ninguno" && (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #cbd5e1",
            borderRadius: 10,
            padding: 22,
            marginBottom: 24,
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                {modoEdicion === "crear" ? "Registrar Nueva Categoría en el Catálogo" : `Editar Categoría: ${categoriaSeleccionada?.nombre}`}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 12.5 }}>
                Esta categoría agrupará servicios corporativos y estará disponible tanto en los botones del catálogo como en las listas desplegables de tickets.
              </p>
            </div>
            <button
              type="button"
              className="boton-secundario"
              style={{ width: "auto", padding: "6px 12px", fontSize: 12 }}
              onClick={cerrarFormulario}
            >
              Cerrar Formulario
            </button>
          </div>

          {errorForm && (
            <div className="mensaje-error" style={{ marginBottom: 16 }}>
              {errorForm}
            </div>
          )}

          <form onSubmit={guardarFormulario} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ margin: 0 }}>Nombre de la Categoría *</label>
                  <span style={{ fontSize: 11, color: formNombre.length > 50 ? "#dc2626" : "#64748b" }}>
                    {formNombre.length} / 60
                  </span>
                </div>
                <input
                  type="text"
                  className="input-base"
                  maxLength={60}
                  placeholder="Ej: Redes y Conectividad Institucional"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  onBlur={() => setTocado((prev) => ({ ...prev, nombre: true }))}
                  style={errorNombre ? estiloInputError : undefined}
                  autoFocus
                />
                {errorNombre && <AlertaCampo error={errorNombre} />}
              </div>

              <div className="campo">
                <label>Tipo de Requerimiento Oficial *</label>
                <select
                  className="input-base"
                  value={formTipo}
                  onChange={(e) => setFormTipo(Number(e.target.value))}
                  disabled={modoEdicion === "editar" && Boolean(categoriaSeleccionada && categoriaSeleccionada.total_servicios > 0)}
                >
                  <option value={1}>Incidente (Fallas, averías e interrupciones)</option>
                  <option value={2}>Solicitud de Servicio (Peticiones, accesos y trámites)</option>
                </select>
                {modoEdicion === "editar" && categoriaSeleccionada && categoriaSeleccionada.total_servicios > 0 && (
                  <span style={{ fontSize: 11, color: "#64748b", marginTop: 3, display: "block" }}>
                    No se puede cambiar el tipo porque ya tiene servicios asociados.
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Código Corto Mnemónico *</label>
                <input
                  type="text"
                  className="input-base"
                  maxLength={10}
                  placeholder="Ej: RED, SW, HW, ACC"
                  value={formCodigoCorto}
                  onChange={(e) => setFormCodigoCorto(e.target.value.toUpperCase())}
                  onBlur={() => setTocado((prev) => ({ ...prev, codigo: true }))}
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    ...(errorCodigo ? estiloInputError : {}),
                  }}
                />
                {errorCodigo && <AlertaCampo error={errorCodigo} />}
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                  Se usa como prefijo para los códigos de servicios (ej: SRV-INC-RED-001).
                </span>
              </div>

              <div className="campo">
                <label>SLA Defecto Primera Respuesta (Horas) *</label>
                <input
                  type="number"
                  className="input-base"
                  min={0.5}
                  max={720}
                  step={0.5}
                  value={formSlaRespuesta}
                  onChange={(e) => setFormSlaRespuesta(e.target.value === "" ? "" : Number(e.target.value))}
                  onBlur={() => setTocado((prev) => ({ ...prev, slaRespuesta: true }))}
                  style={(errorSlaRespuesta || errorSlaCruzado) ? estiloInputError : undefined}
                />
                {errorSlaRespuesta && <AlertaCampo error={errorSlaRespuesta} />}
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                  Tiempo inicial de atención técnica para esta categoría.
                </span>
              </div>

              <div className="campo">
                <label>SLA Defecto Resolución Total (Horas) *</label>
                <input
                  type="number"
                  className="input-base"
                  min={1}
                  max={720}
                  step={1}
                  value={formSlaResolucion}
                  onChange={(e) => setFormSlaResolucion(e.target.value === "" ? "" : Number(e.target.value))}
                  onBlur={() => setTocado((prev) => ({ ...prev, slaResolucion: true }))}
                  style={(errorSlaResolucion || errorSlaCruzado) ? estiloInputError : undefined}
                />
                {errorSlaResolucion && <AlertaCampo error={errorSlaResolucion} />}
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                  Tiempo máximo para restaurar o entregar el requerimiento.
                </span>
              </div>
            </div>

            {errorSlaCruzado && (
              <div style={{ marginBottom: 16 }}>
                <AlertaCampo error={errorSlaCruzado} />
              </div>
            )}

            <div className="campo" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ margin: 0 }}>Descripción Funcional (Opcional)</label>
                <span style={{ fontSize: 11, color: formDescripcion.length > 180 ? "#dc2626" : "#64748b" }}>
                  {formDescripcion.length} / 200
                </span>
              </div>
              <textarea
                className="input-base"
                maxLength={200}
                rows={2}
                placeholder="Breve resumen de los requerimientos y equipos que atiende esta categoría técnica..."
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
                onBlur={() => setTocado((prev) => ({ ...prev, descripcion: true }))}
                style={errorDescripcion ? estiloInputError : undefined}
              />
              {errorDescripcion && <AlertaCampo error={errorDescripcion} />}
              <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                Esta descripción se muestra a los usuarios en las tarjetas del portal de autoservicio.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={cerrarFormulario}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="boton-primario"
                style={{
                  width: "auto",
                  padding: "8px 22px",
                  fontSize: 13,
                  opacity: (!formularioValido || guardando) ? 0.6 : 1,
                  cursor: (!formularioValido || guardando) ? "not-allowed" : "pointer",
                }}
                disabled={guardando || !formularioValido}
              >
                {guardando ? "Guardando cambios..." : modoEdicion === "crear" ? "Registrar Categoría" : "Guardar Modificaciones"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {categoriaAEliminar && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 10,
              maxWidth: 520,
              width: "100%",
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 10px 0", color: "#0f172a" }}>
              Confirmar Eliminación de Categoría
            </h3>
            <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.5, margin: "0 0 16px 0" }}>
              ¿Está seguro de que desea eliminar la categoría <strong>[{categoriaAEliminar.codigo_corto}] {categoriaAEliminar.nombre}</strong>?
            </p>

            {categoriaAEliminar.total_servicios > 0 || categoriaAEliminar.total_tickets > 0 ? (
              <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, padding: 12, marginBottom: 18, fontSize: 12.5, color: "#9a3412" }}>
                <strong>Nota de seguridad ITIL v4:</strong> Esta categoría tiene <strong>{categoriaAEliminar.total_servicios} servicio(s)</strong> y <strong>{categoriaAEliminar.total_tickets} ticket(s)</strong> asociados.
                Para preservar el historial y las auditorías, el sistema la <strong>deshabilitará</strong> en lugar de borrarla físicamente. Ya no aparecerá en el catálogo ni en los formularios de nuevos tickets.
              </div>
            ) : (
              <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 18px 0" }}>
                Esta categoría no tiene servicios ni tickets vinculados. Será eliminada permanentemente de la base de datos.
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => setCategoriaAEliminar(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13, backgroundColor: "#dc2626" }}
                onClick={() => ejecutarEliminar(categoriaAEliminar)}
              >
                Confirmar y Proceder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANEL PRINCIPAL: TABLA DE CATEGORÍAS */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
        {/* Cabecera y Botón Nueva Categoría */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0f172a" }}>
              Clasificación y Configuración de Categorías (ITIL v4)
            </h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
              Administre las categorías maestras que agrupan los servicios y rigen los tiempos base de SLA en el catálogo y los formularios.
            </p>
          </div>
          <button
            type="button"
            className="boton-primario"
            style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
            onClick={abrirCrear}
          >
            + Nueva Categoría
          </button>
        </div>

        {/* Tarjetas de Métricas Rápidas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
          <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Total Categorías</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{totalCategorias}</div>
          </div>
          <div style={{ padding: "12px 14px", backgroundColor: "#fff7ed", borderRadius: 8, border: "1px solid #ffedd5" }}>
            <span style={{ fontSize: 11.5, color: "#c2410c", fontWeight: 600 }}>Incidentes</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#ea580c", marginTop: 2 }}>{cantIncidentes}</div>
          </div>
          <div style={{ padding: "12px 14px", backgroundColor: "#eff6ff", borderRadius: 8, border: "1px solid #dbeafe" }}>
            <span style={{ fontSize: 11.5, color: "#1d4ed8", fontWeight: 600 }}>Solicitudes</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#2563eb", marginTop: 2 }}>{cantSolicitudes}</div>
          </div>
          <div style={{ padding: "12px 14px", backgroundColor: "#f0fdf4", borderRadius: 8, border: "1px solid #dcfce7" }}>
            <span style={{ fontSize: 11.5, color: "#15803d", fontWeight: 600 }}>Activas en Catálogo</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#16a34a", marginTop: 2 }}>{cantActivas}</div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          {/* Tabs por Tipo */}
          <div style={{ display: "flex", gap: 6, backgroundColor: "#f1f5f9", padding: 4, borderRadius: 8 }}>
            <button
              type="button"
              onClick={() => setFiltroTipo("todos")}
              style={{
                border: "none",
                background: filtroTipo === "todos" ? "#ffffff" : "transparent",
                color: filtroTipo === "todos" ? "#0f172a" : "#64748b",
                fontWeight: filtroTipo === "todos" ? 700 : 500,
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12.5,
                cursor: "pointer",
                boxShadow: filtroTipo === "todos" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              Todas ({totalCategorias})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo("1")}
              style={{
                border: "none",
                background: filtroTipo === "1" ? "#ffffff" : "transparent",
                color: filtroTipo === "1" ? "#c2410c" : "#64748b",
                fontWeight: filtroTipo === "1" ? 700 : 500,
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12.5,
                cursor: "pointer",
                boxShadow: filtroTipo === "1" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              Incidentes ({cantIncidentes})
            </button>
            <button
              type="button"
              onClick={() => setFiltroTipo("2")}
              style={{
                border: "none",
                background: filtroTipo === "2" ? "#ffffff" : "transparent",
                color: filtroTipo === "2" ? "#1d4ed8" : "#64748b",
                fontWeight: filtroTipo === "2" ? 700 : 500,
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12.5,
                cursor: "pointer",
                boxShadow: filtroTipo === "2" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              Solicitudes ({cantSolicitudes})
            </button>
          </div>

          {/* Filtro Estado y Búsqueda */}
          <div style={{ display: "flex", gap: 10, flex: 1, justifyContent: "flex-end", minWidth: 280 }}>
            <select
              className="input-base"
              style={{ width: "auto", fontSize: 12.5, padding: "6px 10px" }}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Solo activas</option>
              <option value="inactivos">Solo inactivas</option>
            </select>

            <input
              type="text"
              className="input-base"
              placeholder="Buscar por nombre, código o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ maxWidth: 300, fontSize: 12.5 }}
            />
          </div>
        </div>

        {/* Tabla de Categorías */}
        {cargando ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b", fontSize: 13 }}>
            Cargando categorías oficiales...
          </div>
        ) : categoriasFiltradas.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, color: "#64748b" }}>
            <p style={{ margin: "0 0 10px 0", fontSize: 13.5 }}>
              No se encontraron categorías que coincidan con los filtros aplicados.
            </p>
            <button
              type="button"
              className="boton-secundario"
              style={{ width: "auto", padding: "6px 14px", fontSize: 12 }}
              onClick={abrirCrear}
            >
              + Crear la primera categoría
            </button>
          </div>
        ) : (
          <div className="contenedor-tabla">
            <table className="tabla">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>Icono</th>
                  <th>Categoría y Descripción</th>
                  <th>Tipo</th>
                  <th>Código</th>
                  <th>SLA Base</th>
                  <th>Servicios</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categoriasFiltradas.map((c) => (
                  <tr key={c.id_categoria} style={{ opacity: c.estado_registro ? 1 : 0.65 }}>
                    <td>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 6,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconoCategoriaMini nombre={c.nombre} codigo={c.codigo_corto} />
                      </div>
                    </td>

                    <td>
                      <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>
                        {c.nombre}
                      </strong>
                      <span style={{ fontSize: 11.5, color: "#64748b", display: "block", marginTop: 2, lineHeight: 1.3 }}>
                        {c.descripcion || "Sin descripción funcional registrada."}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 4,
                          backgroundColor: c.id_tipo_ticket === 1 ? "#ffedd5" : "#dbeafe",
                          color: c.id_tipo_ticket === 1 ? "#9a3412" : "#1e40af",
                        }}
                      >
                        {c.id_tipo_ticket === 1 ? "Incidente" : "Solicitud"}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: "#f1f5f9",
                          color: "#334155",
                          padding: "2px 6px",
                          borderRadius: 4,
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        {c.codigo_corto}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 600 }}>
                        {c.sla_default_respuesta}h resp. / {c.sla_default_resolucion}h resol.
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: c.total_servicios > 0 ? "#2563eb" : "#94a3b8",
                        }}
                      >
                        {c.total_servicios} {c.total_servicios === 1 ? "servicio" : "servicios"} ({c.servicios_activos} activos)
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 4,
                          backgroundColor: c.estado_registro ? "#dcfce7" : "#fee2e2",
                          color: c.estado_registro ? "#166534" : "#991b1b",
                        }}
                      >
                        {c.estado_registro ? "Activa" : "Inactiva"}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="boton-accion-icono"
                          title="Editar categoría"
                          aria-label="Editar categoría"
                          onClick={() => abrirEditar(c)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="boton-accion-icono"
                          title={c.estado_registro ? "Desactivar categoría del catálogo" : "Activar categoría"}
                          aria-label={c.estado_registro ? "Desactivar categoría" : "Activar categoría"}
                          onClick={() => alternarEstado(c)}
                        >
                          {c.estado_registro ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="15" y1="9" x2="9" y2="15" />
                              <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="9 12 11 14 15 10" />
                            </svg>
                          )}
                        </button>

                        <button
                          type="button"
                          className="boton-accion-icono"
                          title="Eliminar categoría"
                          aria-label="Eliminar categoría"
                          onClick={() => setCategoriaAEliminar(c)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionCategorias;
