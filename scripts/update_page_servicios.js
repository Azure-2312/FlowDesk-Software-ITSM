const fs = require('fs');

const content = `"use client";

import { useEffect, useState } from "react";
import { ServicioCatalogo, ServicioWorkflowPaso } from "@/types";

type ModoVista = "tabla" | "nuevo" | "editar" | "workflow" | "desactivar";

export default function PaginaAdminServicios() {
  const [servicios, setServicios] = useState<ServicioCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("activos");
  const [busqueda, setBusqueda] = useState<string>("");

  // Modo de vista: sin modales flotantes
  const [vista, setVista] = useState<ModoVista>("tabla");
  const [servicioSeleccionado, setServicioSeleccionado] = useState<ServicioCatalogo | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Formulario de edición de servicio
  const [formNombre, setFormNombre] = useState("");
  const [formTipo, setFormTipo] = useState<number>(2);
  const [formCategoria, setFormCategoria] = useState<number>(4);
  const [formSlaRespuesta, setFormSlaRespuesta] = useState<number>(4);
  const [formSlaResolucion, setFormSlaResolucion] = useState<number>(24);
  const [formRequiereAprobacion, setFormRequiereAprobacion] = useState<boolean>(false);
  const [formCosto, setFormCosto] = useState<number>(0);
  const [formEntregable, setFormEntregable] = useState<string>("");
  const [formDescripcion, setFormDescripcion] = useState<string>("");

  // Formulario de nuevo servicio
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState<number>(2);
  const [nuevaCategoria, setNuevaCategoria] = useState<number>(4);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevoEntregable, setNuevoEntregable] = useState("");
  const [nuevoRequiereAprobacion, setNuevoRequiereAprobacion] = useState(false);
  const [nuevoSlaRespuesta, setNuevoSlaRespuesta] = useState<number>(2);
  const [nuevoSlaResolucion, setNuevoSlaResolucion] = useState<number>(24);
  const [nuevoCosto, setNuevoCosto] = useState<number>(0);

  // Gestión de Workflow dinámico
  const [pasosWorkflow, setPasosWorkflow] = useState<ServicioWorkflowPaso[]>([]);

  // Gestión de Desactivación con motivo obligatorio
  const [motivoDesactivacion, setMotivoDesactivacion] = useState("");

  async function cargarServicios() {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtroTipo) params.set("id_tipo", filtroTipo);
      if (filtroEstado) params.set("estado", filtroEstado);
      if (busqueda.trim()) params.set("buscar", busqueda.trim());

      const res = await fetch(\`/api/servicios?\${params.toString()}\`);
      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo cargar el catálogo");
        return;
      }
      setServicios(datos.servicios || []);
    } catch {
      setError("Error de conexión al cargar servicios");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarServicios();
  }, [filtroTipo, filtroEstado]);

  function abrirNuevo() {
    setNuevoCodigo(\`SRV-CUST-\${servicios.length + 1 < 10 ? "0" : ""}\${servicios.length + 1}\`);
    setNuevoTipo(2);
    setNuevaCategoria(4);
    setNuevoNombre("");
    setNuevaDescripcion("");
    setNuevoEntregable("");
    setNuevoRequiereAprobacion(false);
    setNuevoSlaRespuesta(2);
    setNuevoSlaResolucion(24);
    setNuevoCosto(0);
    setError(null);
    setMensajeExito(null);
    setVista("nuevo");
  }

  function abrirEdicion(s: ServicioCatalogo) {
    setServicioSeleccionado(s);
    setFormNombre(s.nombre);
    setFormTipo(s.id_tipo_ticket);
    setFormCategoria(s.id_categoria);
    setFormSlaRespuesta(s.sla_horas_respuesta);
    setFormSlaResolucion(s.sla_horas_resolucion);
    setFormRequiereAprobacion(s.requiere_aprobacion);
    setFormCosto(Number(s.costo_referencial) || 0);
    setFormEntregable(s.entregable);
    setFormDescripcion(s.descripcion_comercial);
    setError(null);
    setMensajeExito(null);
    setVista("editar");
  }

  function abrirWorkflow(s: ServicioCatalogo) {
    setServicioSeleccionado(s);
    setPasosWorkflow(
      s.pasos && s.pasos.length > 0
        ? JSON.parse(JSON.stringify(s.pasos))
        : [
            {
              id_paso: 1,
              id_servicio: s.id_servicio,
              orden: 1,
              codigo_paso: "PASO-01",
              nombre_paso: "Recepción y Registro",
              rol_ejecutor: "Mesa de Ayuda (N1)",
              es_compuerta_aprobacion: false,
              pausa_sla: false,
              estado_registro: true,
            },
          ]
    );
    setError(null);
    setMensajeExito(null);
    setVista("workflow");
  }

  function abrirDesactivar(s: ServicioCatalogo) {
    setServicioSeleccionado(s);
    setMotivoDesactivacion("");
    setError(null);
    setMensajeExito(null);
    setVista("desactivar");
  }

  async function registrarNuevoServicio(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch("/api/servicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo_servicio: nuevoCodigo,
          id_tipo_ticket: nuevoTipo,
          id_categoria: nuevaCategoria,
          nombre: nuevoNombre,
          descripcion_comercial: nuevaDescripcion,
          entregable: nuevoEntregable,
          requiere_aprobacion: nuevoRequiereAprobacion,
          sla_horas_respuesta: nuevoSlaRespuesta,
          sla_horas_resolucion: nuevoSlaResolucion,
          costo_referencial: nuevoCosto,
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo registrar el nuevo servicio");
        return;
      }

      setMensajeExito(\`Servicio [\${nuevoCodigo.toUpperCase()}] registrado con workflow inicial exitosamente.\`);
      setVista("tabla");
      await cargarServicios();
    } catch {
      setError("Error de conexión al registrar el servicio");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarCambiosServicio(e: React.FormEvent) {
    e.preventDefault();
    if (!servicioSeleccionado) return;

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch(\`/api/servicios/\${servicioSeleccionado.id_servicio}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formNombre,
          id_tipo_ticket: formTipo,
          id_categoria: formCategoria,
          sla_horas_respuesta: formSlaRespuesta,
          sla_horas_resolucion: formSlaResolucion,
          requiere_aprobacion: formRequiereAprobacion,
          costo_referencial: formCosto,
          entregable: formEntregable,
          descripcion_comercial: formDescripcion,
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo guardar la configuración");
        return;
      }

      setMensajeExito(\`Servicio [\${servicioSeleccionado.codigo_servicio}] actualizado correctamente.\`);
      setVista("tabla");
      setServicioSeleccionado(null);
      await cargarServicios();
    } catch {
      setError("Error de conexión al actualizar el servicio");
    } finally {
      setGuardando(false);
    }
  }

  // Funciones de gestión de workflow
  function agregarPasoWorkflow() {
    const nuevoOrden = pasosWorkflow.length + 1;
    const nuevoPaso: ServicioWorkflowPaso = {
      id_paso: Date.now(),
      id_servicio: servicioSeleccionado?.id_servicio || 0,
      orden: nuevoOrden,
      codigo_paso: \`PASO-0\${nuevoOrden}\`,
      nombre_paso: \`Paso \${nuevoOrden}\`,
      rol_ejecutor: "Soporte Nivel 2",
      es_compuerta_aprobacion: false,
      pausa_sla: false,
      estado_registro: true,
    };
    setPasosWorkflow([...pasosWorkflow, nuevoPaso]);
  }

  function eliminarPasoWorkflow(indice: number) {
    if (pasosWorkflow.length <= 1) {
      alert("El workflow debe contener al menos un paso.");
      return;
    }
    const filtrados = pasosWorkflow.filter((_, i) => i !== indice);
    // Reordenar
    const reordenados = filtrados.map((p, i) => ({
      ...p,
      orden: i + 1,
      codigo_paso: \`PASO-0\${i + 1}\`,
    }));
    setPasosWorkflow(reordenados);
  }

  function actualizarPasoWorkflow(indice: number, campo: keyof ServicioWorkflowPaso, valor: any) {
    const copia = [...pasosWorkflow];
    copia[indice] = { ...copia[indice], [campo]: valor };
    setPasosWorkflow(copia);
  }

  async function guardarWorkflow(e: React.FormEvent) {
    e.preventDefault();
    if (!servicioSeleccionado) return;

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch(\`/api/servicios/\${servicioSeleccionado.id_servicio}/workflow\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pasos: pasosWorkflow }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo actualizar el workflow");
        return;
      }

      setMensajeExito(\`Workflow del servicio [\${servicioSeleccionado.codigo_servicio}] guardado exitosamente.\`);
      setVista("tabla");
      setServicioSeleccionado(null);
      await cargarServicios();
    } catch {
      setError("Error de conexión al guardar el workflow");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarCambioEstado(e: React.FormEvent) {
    e.preventDefault();
    if (!servicioSeleccionado) return;

    const nuevoEstado = !servicioSeleccionado.estado_registro;

    if (!nuevoEstado && motivoDesactivacion.trim().length < 5) {
      setError("Debe ingresar una justificación detallada (mínimo 5 caracteres) para deshabilitar el servicio.");
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch(\`/api/servicios/\${servicioSeleccionado.id_servicio}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado_registro: nuevoEstado,
          motivo_inactivacion: nuevoEstado ? null : motivoDesactivacion.trim(),
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo actualizar el estado del servicio");
        return;
      }

      setMensajeExito(
        nuevoEstado
          ? \`Servicio [\${servicioSeleccionado.codigo_servicio}] reactivado exitosamente.\`
          : \`Servicio [\${servicioSeleccionado.codigo_servicio}] deshabilitado. Motivo registrado para auditoría.\`
      );
      setVista("tabla");
      setServicioSeleccionado(null);
      await cargarServicios();
    } catch {
      setError("Error de conexión al cambiar estado del servicio");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      {error && (
        <div className="mensaje-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {mensajeExito && (
        <div style={{
          backgroundColor: "#ecfdf5",
          border: "1px solid #a7f3d0",
          color: "#065f46",
          padding: "10px 14px",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 500,
        }}>
          {mensajeExito}
        </div>
      )}

      {/* 1. VISTA DEDICADA: NUEVO SERVICIO A PANTALLA COMPLETA */}
      {vista === "nuevo" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 12,
              paddingBottom: 14,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => setVista("tabla")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: 6,
                  padding: 0,
                }}
              >
                ← Volver al Catálogo de Servicios
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Registrar Nuevo Servicio en el Catálogo (ITIL v4)
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Defina los acuerdos de nivel de servicio (SLA), entregables oficiales, costos referenciales y requisitos de aprobación.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => setVista("tabla")}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="form-nuevo-servicio"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Registrando..." : "Registrar Servicio"}
              </button>
            </div>
          </div>

          <form id="form-nuevo-servicio" onSubmit={registrarNuevoServicio}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Código Oficial del Servicio *</label>
                <input
                  type="text"
                  className="input-base"
                  style={{ fontFamily: "monospace", textTransform: "uppercase" }}
                  value={nuevoCodigo}
                  onChange={(e) => setNuevoCodigo(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="campo">
                <label>Nombre Comercial del Servicio *</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej: Aprovisionamiento de Laptop Corporativa para Nuevo Ingreso"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Tipo ITIL v4 *</label>
                <select
                  className="input-base"
                  value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(parseInt(e.target.value, 10))}
                  style={{ backgroundColor: "white" }}
                >
                  <option value={1}>Requerimiento de Servicio (Service Request)</option>
                  <option value={2}>Incidente Operativo (Incident Management)</option>
                </select>
              </div>

              <div className="campo">
                <label>Categoría Funcional *</label>
                <select
                  className="input-base"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(parseInt(e.target.value, 10))}
                  style={{ backgroundColor: "white" }}
                >
                  <option value={1}>Hardware y Equipamiento Físico</option>
                  <option value={2}>Software, Aplicaciones y ERP</option>
                  <option value={3}>Redes, Comunicaciones y Conectividad</option>
                  <option value={4}>Identidades, Cuentas y Accesos</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>SLA Primera Respuesta (Horas) *</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  className="input-base"
                  value={nuevoSlaRespuesta}
                  onChange={(e) => setNuevoSlaRespuesta(parseInt(e.target.value, 10) || 1)}
                  required
                />
              </div>

              <div className="campo">
                <label>SLA Resolución Total (Horas) *</label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  className="input-base"
                  value={nuevoSlaResolucion}
                  onChange={(e) => setNuevoSlaResolucion(parseInt(e.target.value, 10) || 1)}
                  required
                />
              </div>

              <div className="campo">
                <label>Costo Referencial (S/.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-base"
                  value={nuevoCosto}
                  onChange={(e) => setNuevoCosto(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="campo" style={{ marginBottom: 16 }}>
              <label>Entregable Oficial del Servicio (Criterio de Aceptación)</label>
              <textarea
                className="input-base"
                rows={2}
                placeholder="Ej. Equipo configurado con imagen corporativa entregado con acta de conformidad firmada."
                value={nuevoEntregable}
                onChange={(e) => setNuevoEntregable(e.target.value)}
                required
              />
            </div>

            <div className="campo" style={{ marginBottom: 16 }}>
              <label>Descripción Comercial y Alcance Detallado</label>
              <textarea
                className="input-base"
                rows={3}
                placeholder="Detalle de qué incluye y qué no incluye este servicio del catálogo..."
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
                required
              />
            </div>

            <div className="campo" style={{ marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={nuevoRequiereAprobacion}
                  onChange={(e) => setNuevoRequiereAprobacion(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>
                  Requiere Aprobación Previa de Jefatura / Gestor de Área
                </span>
              </label>
              <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                Si se activa, el ticket pasará por una compuerta jerárquica de validación antes de ser despachado a los técnicos.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => setVista("tabla")}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 24px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Registrando..." : "Registrar Servicio"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. VISTA DEDICADA: EDITAR PARÁMETROS DEL SERVICIO */}
      {vista === "editar" && servicioSeleccionado && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 12,
              paddingBottom: 14,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: 6,
                  padding: 0,
                }}
              >
                ← Volver al Catálogo de Servicios
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Editar Servicio: [{servicioSeleccionado.codigo_servicio}] {servicioSeleccionado.nombre}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Ajuste los Acuerdos de Nivel de Servicio (SLA), entregables oficiales, costos y compuertas de aprobación.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="form-editar-servicio"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>

          <form id="form-editar-servicio" onSubmit={guardarCambiosServicio}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Nombre del Servicio *</label>
                <input
                  type="text"
                  className="input-base"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                />
              </div>

              <div className="campo">
                <label>Tipo ITIL *</label>
                <select
                  className="input-base"
                  value={formTipo}
                  onChange={(e) => setFormTipo(parseInt(e.target.value, 10))}
                  style={{ backgroundColor: "white" }}
                >
                  <option value={1}>Requerimiento de Servicio</option>
                  <option value={2}>Incidente Operativo</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>SLA Primera Respuesta (Horas) *</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  className="input-base"
                  value={formSlaRespuesta}
                  onChange={(e) => setFormSlaRespuesta(parseInt(e.target.value, 10) || 1)}
                  required
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Tiempo límite de contacto inicial.
                </span>
              </div>

              <div className="campo">
                <label>SLA Resolución Total (Horas) *</label>
                <input
                  type="number"
                  min="1"
                  max="720"
                  className="input-base"
                  value={formSlaResolucion}
                  onChange={(e) => setFormSlaResolucion(parseInt(e.target.value, 10) || 1)}
                  required
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Tiempo máximo de entrega y cierre.
                </span>
              </div>

              <div className="campo">
                <label>Costo Referencial (S/.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-base"
                  value={formCosto}
                  onChange={(e) => setFormCosto(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="campo" style={{ marginBottom: 16 }}>
              <label>Entregable Oficial del Servicio</label>
              <textarea
                className="input-base"
                rows={2}
                value={formEntregable}
                onChange={(e) => setFormEntregable(e.target.value)}
                required
              />
            </div>

            <div className="campo" style={{ marginBottom: 16 }}>
              <label>Descripción Comercial / Alcance</label>
              <textarea
                className="input-base"
                rows={3}
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
                required
              />
            </div>

            <div className="campo" style={{ marginBottom: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formRequiereAprobacion}
                  onChange={(e) => setFormRequiereAprobacion(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>
                  Requiere Aprobación de Jefatura (Compuerta Jerárquica)
                </span>
              </label>
              <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                Si se activa, el ticket pasará por validación del Gestor de Área antes de ser asignado a un técnico.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 24px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. VISTA DEDICADA: CONFIGURADOR DE WORKFLOW DEL SERVICIO */}
      {vista === "workflow" && servicioSeleccionado && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 12,
              paddingBottom: 14,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: 6,
                  padding: 0,
                }}
              >
                ← Volver al Catálogo de Servicios
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Diseñador de Workflow: [{servicioSeleccionado.codigo_servicio}] {servicioSeleccionado.nombre}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Configure los pasos secuenciales de atención, compuertas de aprobación jerárquica, roles ejecutores y reglas de pausa de SLA.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="form-workflow"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando Workflow..." : "Guardar Workflow"}
              </button>
            </div>
          </div>

          <form id="form-workflow" onSubmit={guardarWorkflow}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                Pasos del Flujo de Trabajo ({pasosWorkflow.length} definidos)
              </span>
              <button
                type="button"
                className="boton-secundario"
                onClick={agregarPasoWorkflow}
                style={{ width: "auto", padding: "6px 14px", fontSize: 12.5, fontWeight: 600, color: "#2563eb", borderColor: "#bfdbfe", backgroundColor: "#eff6ff" }}
              >
                + Agregar Paso Operativo
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {pasosWorkflow.map((paso, idx) => (
                <div
                  key={paso.id_paso || idx}
                  style={{
                    backgroundColor: "#ffffff",
                    border: paso.es_compuerta_aprobacion ? "1px solid #fef08a" : "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 16,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          backgroundColor: paso.es_compuerta_aprobacion ? "#ca8a04" : "#2563eb",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <strong style={{ fontSize: 14, color: "#0f172a" }}>
                        Paso #{idx + 1}: {paso.nombre_paso || "Sin título"}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => eliminarPasoWorkflow(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Eliminar este paso
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr", gap: 14, marginBottom: 12 }}>
                    <div className="campo">
                      <label>Código de Paso *</label>
                      <input
                        type="text"
                        className="input-base"
                        style={{ fontFamily: "monospace", fontSize: 12.5 }}
                        value={paso.codigo_paso}
                        onChange={(e) => actualizarPasoWorkflow(idx, "codigo_paso", e.target.value.toUpperCase())}
                        required
                      />
                    </div>

                    <div className="campo">
                      <label>Nombre del Paso Operativo *</label>
                      <input
                        type="text"
                        className="input-base"
                        value={paso.nombre_paso}
                        onChange={(e) => actualizarPasoWorkflow(idx, "nombre_paso", e.target.value)}
                        placeholder="Ej. Diagnóstico Técnico L1, Instalación de Software, etc."
                        required
                      />
                    </div>

                    <div className="campo">
                      <label>Rol o Perfil Ejecutor *</label>
                      <select
                        className="input-base"
                        value={paso.rol_ejecutor}
                        onChange={(e) => actualizarPasoWorkflow(idx, "rol_ejecutor", e.target.value)}
                        style={{ backgroundColor: "white" }}
                        required
                      >
                        <option value="Mesa de Ayuda (N1)">Mesa de Ayuda (N1)</option>
                        <option value="Soporte Nivel 2">Soporte Nivel 2 (Campo)</option>
                        <option value="Ingeniería Nivel 3">Ingeniería Nivel 3</option>
                        <option value="Jefe de Área / Supervisor">Jefe de Área / Supervisor</option>
                        <option value="Gestor de Activos">Gestor de Activos</option>
                        <option value="Aprobador CAB">Aprobador CAB</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 24, alignItems: "center", paddingTop: 8, borderTop: "1px dashed #e2e8f0" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={paso.es_compuerta_aprobacion}
                        onChange={(e) => actualizarPasoWorkflow(idx, "es_compuerta_aprobacion", e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
                        Es Compuerta de Aprobación Jerárquica (Gateway)
                      </span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={paso.pausa_sla}
                        onChange={(e) => actualizarPasoWorkflow(idx, "pausa_sla", e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0369a1" }}>
                        Pausar temporizador de SLA en este paso
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 24px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar Workflow"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. VISTA DEDICADA: DESHABILITAR / REACTIVAR SERVICIO CON JUSTIFICACIÓN OBLIGATORIA */}
      {vista === "desactivar" && servicioSeleccionado && (
        <div style={{ maxWidth: 700, margin: "0 auto", backgroundColor: "#ffffff", padding: 28, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <button
            type="button"
            onClick={() => {
              setVista("tabla");
              setServicioSeleccionado(null);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              color: "#2563eb",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: 14,
              padding: 0,
            }}
          >
            ← Volver al Catálogo de Servicios
          </button>

          <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px 0", color: servicioSeleccionado.estado_registro ? "#b91c1c" : "#16a34a" }}>
            {servicioSeleccionado.estado_registro
              ? \`Deshabilitar Servicio: [\${servicioSeleccionado.codigo_servicio}] \${servicioSeleccionado.nombre}\`
              : \`Reactivar Servicio: [\${servicioSeleccionado.codigo_servicio}] \${servicioSeleccionado.nombre}\`}
          </h2>

          <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: 13 }}>
            {servicioSeleccionado.estado_registro
              ? "Al deshabilitar un servicio, los usuarios solicitantes ya no podrán seleccionarlo en el Portal de Autoservicio. Para mantener la trazabilidad y que los demás administradores y auditores conozcan el motivo, debe registrar una justificación formal."
              : "Al reactivar este servicio, volverá a estar disponible de inmediato en el catálogo corporativo para todos los usuarios autorizados."}
          </p>

          {servicioSeleccionado.motivo_inactivacion && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b" }}>Último motivo de desactivación registrado:</div>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#7f1d1d" }}>
                "{servicioSeleccionado.motivo_inactivacion}"
              </p>
              {servicioSeleccionado.usuario_inactivacion_nombre && (
                <div style={{ fontSize: 11, color: "#b91c1c", marginTop: 4 }}>
                  Registrado por: <strong>{servicioSeleccionado.usuario_inactivacion_nombre}</strong> el {new Date(servicioSeleccionado.fecha_inactivacion || "").toLocaleString()}
                </div>
              )}
            </div>
          )}

          <form onSubmit={confirmarCambioEstado}>
            {servicioSeleccionado.estado_registro && (
              <div className="campo" style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                  Motivo o Justificación de la Desactivación *
                </label>
                <textarea
                  className="input-base"
                  rows={4}
                  placeholder="Explique detalladamente por qué se da de baja este servicio (ej. Reemplazado por nueva plataforma SaaS, obsolescencia técnica, cambio de proveedor, etc.)..."
                  value={motivoDesactivacion}
                  onChange={(e) => setMotivoDesactivacion(e.target.value)}
                  required
                  autoFocus
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Este registro quedará grabado en los registros de auditoría y será visible para todos los administradores.
                </span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setServicioSeleccionado(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={servicioSeleccionado.estado_registro ? "boton-primario" : "boton-primario"}
                style={{
                  width: "auto",
                  padding: "8px 24px",
                  fontSize: 13,
                  backgroundColor: servicioSeleccionado.estado_registro ? "#dc2626" : "#16a34a",
                }}
                disabled={guardando}
              >
                {guardando
                  ? "Procesando..."
                  : servicioSeleccionado.estado_registro
                  ? "Confirmar Desactivación"
                  : "Confirmar Reactivación"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. VISTA PRINCIPAL: TABLA DE SERVICIOS */}
      {vista === "tabla" && (
        <div>
          <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1>Gestión del Catálogo de Servicios (ITIL v4)</h1>
              <p>
                Administración integral del portafolio corporativo, Acuerdos SLA, compuertas jerárquicas y workflows operativos por servicio.
              </p>
            </div>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", padding: "8px 16px", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={abrirNuevo}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Servicio
            </button>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="barra-filtros" style={{ marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input
                type="text"
                className="input-base"
                placeholder="Buscar por código, nombre o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") cargarServicios();
                }}
                style={{ width: "100%", fontSize: 13 }}
              />
            </div>

            <div>
              <select
                className="input-base"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={{ fontSize: 13, backgroundColor: "#ffffff" }}
              >
                <option value="">Todos los Tipos ITIL</option>
                <option value="1">Requerimientos de Servicio</option>
                <option value="2">Incidentes Operativos</option>
              </select>
            </div>

            <div>
              <select
                className="input-base"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{ fontSize: 13, backgroundColor: "#ffffff" }}
              >
                <option value="activos">Servicios Activos</option>
                <option value="inactivos">Servicios Deshabilitados</option>
                <option value="todos">Todos los Estados</option>
              </select>
            </div>

            <div>
              <button
                type="button"
                className="boton-primario"
                style={{ padding: "8px 16px", fontSize: 13 }}
                onClick={cargarServicios}
              >
                Filtrar
              </button>
            </div>
          </div>

          {/* Tabla de Servicios */}
          {cargando ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
              Cargando catálogo corporativo...
            </div>
          ) : servicios.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
              No se encontraron servicios registrados con los criterios especificados.
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Servicio / Entregable</th>
                    <th>Tipo ITIL</th>
                    <th>Categoría</th>
                    <th>SLA Resp.</th>
                    <th>SLA Resol.</th>
                    <th>Aprobación</th>
                    <th>Costo Ref.</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {servicios.map((s) => (
                    <tr key={s.id_servicio}>
                      <td>
                        <strong style={{ fontFamily: "monospace", color: "#2563eb", fontSize: 12.5 }}>
                          {s.codigo_servicio}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{s.nombre}</div>
                        <div style={{ fontSize: 12, color: "#64748b", maxWidth: 320 }}>
                          Entregable: {s.entregable}
                        </div>
                        {!s.estado_registro && s.motivo_inactivacion && (
                          <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2, fontStyle: "italic" }}>
                            Motivo baja: {s.motivo_inactivacion}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge-itil" style={{ backgroundColor: s.id_tipo_ticket === 1 ? "#e0f2fe" : "#fef3c7", color: s.id_tipo_ticket === 1 ? "#0369a1" : "#92400e" }}>
                          {s.tipo_nombre || (s.id_tipo_ticket === 1 ? "Requerimiento" : "Incidente")}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, color: "#334155" }}>{s.categoria_nombre}</span>
                      </td>
                      <td style={{ fontSize: 12.5, fontWeight: 500 }}>{s.sla_horas_respuesta}h</td>
                      <td style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>{s.sla_horas_resolucion}h</td>
                      <td>
                        {s.requiere_aprobacion ? (
                          <span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#92400e", fontSize: 11 }}>
                            Requiere Jefatura
                          </span>
                        ) : (
                          <span style={{ fontSize: 11.5, color: "#64748b" }}>Pre-aprobado</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12.5, color: "#334155" }}>
                        S/. {Number(s.costo_referencial || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={"badge " + (s.estado_registro ? "badge-activo" : "badge-inactivo")}>
                          {s.estado_registro ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 5 }}>
                          <button
                            type="button"
                            className="boton-accion-icono"
                            title="Editar parámetros y SLA del servicio"
                            onClick={() => abrirEdicion(s)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="boton-accion-icono"
                            title="Diseñar workflow de pasos"
                            onClick={() => abrirWorkflow(s)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="8" y1="6" x2="21" y2="6" />
                              <line x1="8" y1="12" x2="21" y2="12" />
                              <line x1="8" y1="18" x2="21" y2="18" />
                              <line x1="3" y1="6" x2="3.01" y2="6" />
                              <line x1="3" y1="12" x2="3.01" y2="12" />
                              <line x1="3" y1="18" x2="3.01" y2="18" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className={"boton-accion-icono " + (s.estado_registro ? "boton-accion-peligro" : "")}
                            title={s.estado_registro ? "Deshabilitar servicio con justificación" : "Reactivar servicio"}
                            onClick={() => abrirDesactivar(s)}
                          >
                            {s.estado_registro ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                                <line x1="12" y1="2" x2="12" y2="12" />
                              </svg>
                            )}
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
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/app/(app)/admin/servicios/page.tsx', content, 'utf8');
console.log('src/app/(app)/admin/servicios/page.tsx updated with full-page views, workflow editor, and deactivation justification');
