"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { ElementoConfiguracion, CIRelacion } from "@/types";

type ModoVista = "tabla" | "nuevo" | "editar" | "relaciones" | "desactivar";

export default function PaginaMapaCMDB() {
  const [elementos, setElementos] = useState<ElementoConfiguracion[]>([]);
  const [relaciones, setRelaciones] = useState<CIRelacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [filtroCriticidad, setFiltroCriticidad] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("activos");
  const [busqueda, setBusqueda] = useState<string>("");

  // Modo de vista: sin ventanas flotantes
  const [vista, setVista] = useState<ModoVista>("tabla");
  const [ciSeleccionado, setCiSeleccionado] = useState<ElementoConfiguracion | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Formulario Crear / Editar
  const [codigoCi, setCodigoCi] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipoCi, setTipoCi] = useState("APLICACION");
  const [ambiente, setAmbiente] = useState<"PRODUCCION" | "QA" | "DESARROLLO">("PRODUCCION");
  const [criticidad, setCriticidad] = useState<"CRITICA" | "ALTA" | "MEDIA" | "BAJA">("ALTA");
  const [ipPrincipal, setIpPrincipal] = useState("");
  const [versionSoftware, setVersionSoftware] = useState("");
  const [idDepartamentoSoporte, setIdDepartamentoSoporte] = useState<number>(4);
  const [idPadreRelacion, setIdPadreRelacion] = useState<number | "">("");
  const [tipoRelacion, setTipoRelacion] = useState<"DEPENDE_DE" | "ALBERGA_A" | "CONECTADO_CON">("DEPENDE_DE");

  // Nueva relación en vista relaciones
  const [relacionDestinoId, setRelacionDestinoId] = useState<number | "">("");
  const [relacionTipoNueva, setRelacionTipoNueva] = useState<"DEPENDE_DE" | "ALBERGA_A" | "CONECTADO_CON">("DEPENDE_DE");

  // Desactivación con motivo obligatorio
  const [motivoDesactivacion, setMotivoDesactivacion] = useState("");

  async function cargarCMDB() {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtroTipo) params.set("tipo", filtroTipo);
      if (filtroCriticidad) params.set("criticidad", filtroCriticidad);
      if (filtroEstado) params.set("estado", filtroEstado);

      const res = await fetch(`/api/activos/cmdb?${params.toString()}`);
      const data = await res.json();
      if (data.elementos) setElementos(data.elementos);
      if (data.relaciones) setRelaciones(data.relaciones);
    } catch (err) {
      console.error("Error al cargar CMDB:", err);
      setError("Error de conexión al cargar la base de datos de configuración (CMDB)");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCMDB();
  }, [filtroTipo, filtroCriticidad, filtroEstado]);

  function abrirNuevo() {
    setCodigoCi("");
    setNombre("");
    setTipoCi("APLICACION");
    setAmbiente("PRODUCCION");
    setCriticidad("ALTA");
    setIpPrincipal("");
    setVersionSoftware("");
    setIdDepartamentoSoporte(4);
    setIdPadreRelacion("");
    setTipoRelacion("DEPENDE_DE");
    setError(null);
    setMensajeExito(null);
    setVista("nuevo");
  }

  function abrirEditar(ci: ElementoConfiguracion) {
    setCiSeleccionado(ci);
    setCodigoCi(ci.codigo_ci);
    setNombre(ci.nombre);
    setTipoCi(ci.tipo_ci);
    setAmbiente(ci.ambiente);
    setCriticidad(ci.criticidad);
    setIpPrincipal(ci.ip_principal || "");
    setVersionSoftware(ci.version_software || "");
    setIdDepartamentoSoporte(ci.id_departamento_soporte || 4);
    setError(null);
    setMensajeExito(null);
    setVista("editar");
  }

  function abrirRelaciones(ci: ElementoConfiguracion) {
    setCiSeleccionado(ci);
    setRelacionDestinoId("");
    setRelacionTipoNueva("DEPENDE_DE");
    setError(null);
    setMensajeExito(null);
    setVista("relaciones");
  }

  function abrirDesactivar(ci: ElementoConfiguracion) {
    setCiSeleccionado(ci);
    setMotivoDesactivacion("");
    setError(null);
    setMensajeExito(null);
    setVista("desactivar");
  }

  async function registrarCI(e: FormEvent) {
    e.preventDefault();
    if (!codigoCi.trim() || !nombre.trim()) {
      setError("Código de CI y nombre descriptivo son requeridos.");
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const payload: any = {
        codigo_ci: codigoCi.trim().toUpperCase(),
        nombre: nombre.trim(),
        tipo_ci: tipoCi,
        ambiente,
        criticidad,
        ip_principal: ipPrincipal.trim() || null,
        version_software: versionSoftware.trim() || null,
        id_departamento_soporte: Number(idDepartamentoSoporte),
      };

      if (idPadreRelacion) {
        payload.relacion = {
          id_ci_padre: Number(idPadreRelacion),
          tipo_relacion: tipoRelacion,
        };
      }

      const res = await fetch("/api/activos/cmdb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar el Elemento de Configuración.");
        return;
      }

      setMensajeExito(`Elemento de Configuración [${codigoCi.toUpperCase()}] registrado exitosamente en la CMDB.`);
      setVista("tabla");
      await cargarCMDB();
    } catch {
      setError("Error de conexión al guardar el CI.");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarEdicionCI(e: FormEvent) {
    e.preventDefault();
    if (!ciSeleccionado) return;

    if (!codigoCi.trim() || !nombre.trim()) {
      setError("Código de CI y nombre son campos obligatorios.");
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch("/api/activos/cmdb", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_ci: ciSeleccionado.id_ci,
          codigo_ci: codigoCi.trim().toUpperCase(),
          nombre: nombre.trim(),
          tipo_ci: tipoCi,
          ambiente,
          criticidad,
          ip_principal: ipPrincipal.trim() || null,
          version_software: versionSoftware.trim() || null,
          id_departamento_soporte: Number(idDepartamentoSoporte),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo actualizar el CI.");
        return;
      }

      setMensajeExito(`Elemento de Configuración [${codigoCi.toUpperCase()}] actualizado correctamente.`);
      setVista("tabla");
      setCiSeleccionado(null);
      await cargarCMDB();
    } catch {
      setError("Error de conexión al actualizar el CI.");
    } finally {
      setGuardando(false);
    }
  }

  async function agregarRelacion(e: FormEvent) {
    e.preventDefault();
    if (!ciSeleccionado || !relacionDestinoId) return;

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch("/api/activos/cmdb/relaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_ci_padre: Number(relacionDestinoId),
          id_ci_hijo: ciSeleccionado.id_ci,
          tipo_relacion: relacionTipoNueva,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo crear la relación");
        return;
      }

      setMensajeExito("Relación de topología agregada exitosamente.");
      setRelacionDestinoId("");
      await cargarCMDB();
    } catch {
      setError("Error de conexión al agregar relación.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarRelacion(idPadre: number, idHijo: number) {
    if (!confirm("¿Seguro que deseas eliminar este enlace de dependencia en la CMDB?")) return;

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch(`/api/activos/cmdb/relaciones?id_ci_padre=${idPadre}&id_ci_hijo=${idHijo}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo eliminar la relación");
        return;
      }

      setMensajeExito("Relación eliminada exitosamente de la topología.");
      await cargarCMDB();
    } catch {
      setError("Error de conexión al eliminar relación.");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarBajaCI(e: FormEvent) {
    e.preventDefault();
    if (!ciSeleccionado) return;

    const nuevoEstado = !ciSeleccionado.estado_registro;
    if (!nuevoEstado && motivoDesactivacion.trim().length < 5) {
      setError("Debe ingresar una justificación detallada (mínimo 5 caracteres) para dar de baja el CI.");
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch("/api/activos/cmdb", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_ci: ciSeleccionado.id_ci,
          estado_registro: nuevoEstado,
          motivo_inactivacion: nuevoEstado ? null : motivoDesactivacion.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo cambiar el estado del CI.");
        return;
      }

      setMensajeExito(
        nuevoEstado
          ? `Elemento de Configuración [${ciSeleccionado.codigo_ci}] reactivado exitosamente.`
          : `Elemento de Configuración [${ciSeleccionado.codigo_ci}] dado de baja. Justificación registrada en auditoría.`
      );
      setVista("tabla");
      setCiSeleccionado(null);
      await cargarCMDB();
    } catch {
      setError("Error de conexión al cambiar estado del CI.");
    } finally {
      setGuardando(false);
    }
  }

  // Filtrado local por búsqueda
  const elementosFiltrados = elementos.filter((ci) => {
    if (!busqueda.trim()) return true;
    const b = busqueda.toLowerCase();
    return (
      ci.codigo_ci.toLowerCase().includes(b) ||
      ci.nombre.toLowerCase().includes(b) ||
      (ci.ip_principal && ci.ip_principal.toLowerCase().includes(b)) ||
      (ci.tipo_ci && ci.tipo_ci.toLowerCase().includes(b))
    );
  });

  // Métricas
  const totalCIs = elementos.length;
  const criticos = elementos.filter((e) => e.criticidad === "CRITICA").length;
  const enProduccion = elementos.filter((e) => e.ambiente === "PRODUCCION").length;

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

      {/* 1. VISTA DEDICADA: REGISTRAR NUEVO CI A PANTALLA COMPLETA */}
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
                Volver al Mapa de Topología CMDB
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Registrar Nuevo Elemento de Configuración (CI)
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Modelo de datos ITIL v4: Identifique la entidad técnica, infraestructura lógica o servicio y enlace sus dependencias operativas.
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
                form="form-nuevo-ci"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Registrando..." : "Registrar CI"}
              </button>
            </div>
          </div>

          <form id="form-nuevo-ci" onSubmit={registrarCI}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Código Único de CI *</label>
                <input
                  type="text"
                  className="input-base"
                  style={{ fontFamily: "monospace", textTransform: "uppercase" }}
                  placeholder="Ej: CI-SRV-APP-02, CI-BD-CRM-01"
                  value={codigoCi}
                  onChange={(e) => setCodigoCi(e.target.value.toUpperCase())}
                  required
                  autoFocus
                />
              </div>

              <div className="campo">
                <label>Nombre Descriptivo del Elemento *</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej: Servidor de Aplicaciones Transaccionales Node.js"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Tipo de CI *</label>
                <select
                  className="input-base"
                  value={tipoCi}
                  onChange={(e) => setTipoCi(e.target.value)}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="APLICACION">Aplicación / Módulo</option>
                  <option value="SERVIDOR_LOGICO">Servidor Lógico / VM</option>
                  <option value="BASE_DATOS">Base de Datos / Clúster</option>
                  <option value="NODO_RED">Nodo de Red / Switch / Router</option>
                  <option value="SERVICIO_TI">Servicio TI Consolidado</option>
                </select>
              </div>

              <div className="campo">
                <label>Ambiente de Despliegue *</label>
                <select
                  className="input-base"
                  value={ambiente}
                  onChange={(e) => setAmbiente(e.target.value as any)}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="PRODUCCION">Producción (Live)</option>
                  <option value="QA">Calidad / QA</option>
                  <option value="DESARROLLO">Desarrollo / Dev</option>
                </select>
              </div>

              <div className="campo">
                <label>Nivel de Criticidad Operativa *</label>
                <select
                  className="input-base"
                  value={criticidad}
                  onChange={(e) => setCriticidad(e.target.value as any)}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="CRITICA">Crítica (Interrupción total del negocio)</option>
                  <option value="ALTA">Alta (Afecta operaciones clave)</option>
                  <option value="MEDIA">Media (Degradación no bloqueante)</option>
                  <option value="BAJA">Baja (Mínimo impacto)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
              <div className="campo">
                <label>Dirección IP o Endpoint Principal</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej: 10.0.1.25, https://app.empresa.local"
                  value={ipPrincipal}
                  onChange={(e) => setIpPrincipal(e.target.value)}
                />
              </div>

              <div className="campo">
                <label>Versión de Software / SO / Firmware</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej: Ubuntu 22.04 LTS / PostgreSQL 16.2 / v2.4.0"
                  value={versionSoftware}
                  onChange={(e) => setVersionSoftware(e.target.value)}
                />
              </div>
            </div>

            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>
                Enlace Inicial de Topología y Dependencia (Opcional)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="campo">
                  <label>Depende de / Conecta con (CI Padre):</label>
                  <select
                    className="input-base"
                    value={idPadreRelacion}
                    onChange={(e) => setIdPadreRelacion(e.target.value ? Number(e.target.value) : "")}
                    style={{ backgroundColor: "white" }}
                  >
                    <option value="">— Sin relación inicial (nodo aislado) —</option>
                    {elementos.map((el) => (
                      <option key={el.id_ci} value={el.id_ci}>
                        [{el.codigo_ci}] {el.nombre} ({el.tipo_ci})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campo">
                  <label>Tipo de Relación de Topología:</label>
                  <select
                    className="input-base"
                    value={tipoRelacion}
                    onChange={(e) => setTipoRelacion(e.target.value as any)}
                    style={{ backgroundColor: "white" }}
                  >
                    <option value="DEPENDE_DE">DEPENDE_DE (Falla del padre afecta a este CI)</option>
                    <option value="ALBERGA_A">ALBERGA_A (Este CI es alojado por el padre)</option>
                    <option value="CONECTADO_CON">CONECTADO_CON (Enlace de red o API bidireccional)</option>
                  </select>
                </div>
              </div>
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
                {guardando ? "Registrando..." : "Registrar Elemento de Configuración"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. VISTA DEDICADA: EDITAR CI A PANTALLA COMPLETA */}
      {vista === "editar" && ciSeleccionado && (
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
                  setCiSeleccionado(null);
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
                Volver al Mapa de Topología CMDB
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Editar Elemento de Configuración: [{ciSeleccionado.codigo_ci}] {ciSeleccionado.nombre}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Ajuste los atributos técnicos, direcciones de red, ambiente y criticidad operativa del CI.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setCiSeleccionado(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="form-editar-ci"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>

          <form id="form-editar-ci" onSubmit={guardarEdicionCI}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Código Único de CI *</label>
                <input
                  type="text"
                  className="input-base"
                  style={{ fontFamily: "monospace", textTransform: "uppercase" }}
                  value={codigoCi}
                  onChange={(e) => setCodigoCi(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="campo">
                <label>Nombre Descriptivo del CI *</label>
                <input
                  type="text"
                  className="input-base"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Tipo de CI *</label>
                <select
                  className="input-base"
                  value={tipoCi}
                  onChange={(e) => setTipoCi(e.target.value)}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="APLICACION">Aplicación / Módulo</option>
                  <option value="SERVIDOR_LOGICO">Servidor Lógico / VM</option>
                  <option value="BASE_DATOS">Base de Datos / Clúster</option>
                  <option value="NODO_RED">Nodo de Red / Switch / Router</option>
                  <option value="SERVICIO_TI">Servicio TI Consolidado</option>
                </select>
              </div>

              <div className="campo">
                <label>Ambiente de Despliegue *</label>
                <select
                  className="input-base"
                  value={ambiente}
                  onChange={(e) => setAmbiente(e.target.value as any)}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="PRODUCCION">Producción (Live)</option>
                  <option value="QA">Calidad / QA</option>
                  <option value="DESARROLLO">Desarrollo / Dev</option>
                </select>
              </div>

              <div className="campo">
                <label>Criticidad Operativa *</label>
                <select
                  className="input-base"
                  value={criticidad}
                  onChange={(e) => setCriticidad(e.target.value as any)}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="CRITICA">Crítica (Interrupción total del negocio)</option>
                  <option value="ALTA">Alta (Afecta operaciones clave)</option>
                  <option value="MEDIA">Media (Degradación no bloqueante)</option>
                  <option value="BAJA">Baja (Mínimo impacto)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div className="campo">
                <label>Dirección IP o Endpoint Principal</label>
                <input
                  type="text"
                  className="input-base"
                  value={ipPrincipal}
                  onChange={(e) => setIpPrincipal(e.target.value)}
                />
              </div>

              <div className="campo">
                <label>Versión de Software / SO / Firmware</label>
                <input
                  type="text"
                  className="input-base"
                  value={versionSoftware}
                  onChange={(e) => setVersionSoftware(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setCiSeleccionado(null);
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

      {/* 3. VISTA DEDICADA: GESTIÓN DE TOPOLOGÍA Y DEPENDENCIAS DE ESTE CI */}
      {vista === "relaciones" && ciSeleccionado && (
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
                  setCiSeleccionado(null);
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
                Volver al Mapa de Topología CMDB
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Gestión de Topología y Dependencias: [{ciSeleccionado.codigo_ci}] {ciSeleccionado.nombre}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Configure las aristas de dependencia lógica en el repositorio maestro de configuración para análisis de impacto en fallas y RFCs.
              </p>
            </div>
            <button
              type="button"
              className="boton-secundario"
              style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
              onClick={() => {
                setVista("tabla");
                setCiSeleccionado(null);
              }}
            >
              Cerrar y Volver
            </button>
          </div>

          {/* Formulario para agregar nueva dependencia */}
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px 0", color: "#1e293b" }}>
              Enlazar Nueva Dependencia para este CI
            </h3>
            <form onSubmit={agregarRelacion} style={{ display: "grid", gridTemplateColumns: "2fr 2fr auto", gap: 12, alignItems: "flex-end" }}>
              <div className="campo" style={{ margin: 0 }}>
                <label>Vincular con Elemento de Configuración:</label>
                <select
                  className="input-base"
                  value={relacionDestinoId}
                  onChange={(e) => setRelacionDestinoId(e.target.value ? Number(e.target.value) : "")}
                  style={{ backgroundColor: "white" }}
                  required
                >
                  <option value="">— Seleccionar CI de la CMDB —</option>
                  {elementos
                    .filter((e) => e.id_ci !== ciSeleccionado.id_ci)
                    .map((e) => (
                      <option key={e.id_ci} value={e.id_ci}>
                        [{e.codigo_ci}] {e.nombre} ({e.tipo_ci} / {e.ambiente})
                      </option>
                    ))}
                </select>
              </div>

              <div className="campo" style={{ margin: 0 }}>
                <label>Tipo de Relación de Dependencia:</label>
                <select
                  className="input-base"
                  value={relacionTipoNueva}
                  onChange={(e) => setRelacionTipoNueva(e.target.value as any)}
                  style={{ backgroundColor: "white" }}
                  required
                >
                  <option value="DEPENDE_DE">DEPENDE_DE (Este CI depende del seleccionado)</option>
                  <option value="ALBERGA_A">ALBERGA_A (Este CI es alojado por el seleccionado)</option>
                  <option value="CONECTADO_CON">CONECTADO_CON (Conexión de red / API bidireccional)</option>
                </select>
              </div>

              <button
                type="submit"
                className="boton-primario"
                style={{ width: "auto", padding: "9px 18px", fontSize: 13 }}
                disabled={guardando || !relacionDestinoId}
              >
                {guardando ? "Vinculando..." : "Vincular Arista"}
              </button>
            </form>
          </div>

          {/* Lista de relaciones existentes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Dependencias Upstream: de quién depende este CI */}
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: 14, color: "#1e293b", fontWeight: 700 }}>
                Dependencias Hacia Arriba (Upstream)
              </h4>
              <p style={{ margin: "0 0 12px 0", fontSize: 12, color: "#64748b" }}>
                Elementos de los cuales depende [{ciSeleccionado.codigo_ci}]. Si estos CIs fallan, afectan a este servicio.
              </p>

              {relaciones.filter((r) => r.id_ci_hijo === ciSeleccionado.id_ci).length === 0 ? (
                <div style={{ padding: 16, textAlign: "center", color: "#9ca3af", fontSize: 12.5, fontStyle: "italic" }}>
                  No tiene dependencias hacia arriba registradas.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {relaciones
                    .filter((r) => r.id_ci_hijo === ciSeleccionado.id_ci)
                    .map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 6,
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: 13, color: "#2563eb", fontFamily: "monospace" }}>
                            [{r.padre_codigo}]
                          </strong>{" "}
                          <span style={{ fontSize: 13, color: "#1e293b" }}>{r.padre_nombre}</span>
                          <div style={{ fontSize: 11, color: "#64748b" }}>Tipo: {r.tipo_relacion}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarRelacion(r.id_ci_padre, r.id_ci_hijo)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: "underline",
                          }}
                        >
                          Desvincular
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Dependencias Downstream: quiénes dependen de este CI */}
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: 14, color: "#1e293b", fontWeight: 700 }}>
                Servicios y CIs Dependientes (Downstream)
              </h4>
              <p style={{ margin: "0 0 12px 0", fontSize: 12, color: "#64748b" }}>
                Elementos que dependen directamente de [{ciSeleccionado.codigo_ci}]. Si este CI cae, estos servicios se verán impactados.
              </p>

              {relaciones.filter((r) => r.id_ci_padre === ciSeleccionado.id_ci).length === 0 ? (
                <div style={{ padding: 16, textAlign: "center", color: "#9ca3af", fontSize: 12.5, fontStyle: "italic" }}>
                  Ningún otro CI depende directamente de este elemento.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {relaciones
                    .filter((r) => r.id_ci_padre === ciSeleccionado.id_ci)
                    .map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 6,
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: 13, color: "#2563eb", fontFamily: "monospace" }}>
                            [{r.hijo_codigo}]
                          </strong>{" "}
                          <span style={{ fontSize: 13, color: "#1e293b" }}>{r.hijo_nombre}</span>
                          <div style={{ fontSize: 11, color: "#64748b" }}>Tipo: {r.tipo_relacion}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => eliminarRelacion(r.id_ci_padre, r.id_ci_hijo)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            textDecoration: "underline",
                          }}
                        >
                          Desvincular
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. VISTA DEDICADA: DAR DE BAJA O REACTIVAR CI CON JUSTIFICACIÓN */}
      {vista === "desactivar" && ciSeleccionado && (
        <div style={{ maxWidth: 700, margin: "0 auto", backgroundColor: "#ffffff", padding: 28, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <button
            type="button"
            onClick={() => {
              setVista("tabla");
              setCiSeleccionado(null);
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
            Volver al Mapa de Topología CMDB
          </button>

          <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px 0", color: ciSeleccionado.estado_registro !== false ? "#b91c1c" : "#16a34a" }}>
            {ciSeleccionado.estado_registro !== false
              ? `Dar de Baja Elemento de Configuración: [${ciSeleccionado.codigo_ci}] ${ciSeleccionado.nombre}`
              : `Reactivar Elemento de Configuración: [${ciSeleccionado.codigo_ci}] ${ciSeleccionado.nombre}`}
          </h2>

          <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: 13 }}>
            {ciSeleccionado.estado_registro !== false
              ? "Dar de baja un CI retira el elemento de la topología operacional activa. Por gobernanza ITIL e ISO 20000, debe registrar la causa justificada (decomisionamiento de servidor, migración a nube, reemplazo por obsolescencia)."
              : "Reactivar este CI lo reincorpora inmediatamente al mapa de topología activo y a la evaluación de cambios."}
          </p>

          {ciSeleccionado.motivo_inactivacion && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b" }}>Último motivo de baja registrado:</div>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#7f1d1d" }}>
                "{ciSeleccionado.motivo_inactivacion}"
              </p>
              {ciSeleccionado.usuario_inactivacion_nombre && (
                <div style={{ fontSize: 11, color: "#b91c1c", marginTop: 4 }}>
                  Registrado por: <strong>{ciSeleccionado.usuario_inactivacion_nombre}</strong> el {new Date(ciSeleccionado.fecha_inactivacion || "").toLocaleString()}
                </div>
              )}
            </div>
          )}

          <form onSubmit={confirmarBajaCI}>
            {ciSeleccionado.estado_registro !== false && (
              <div className="campo" style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                  Motivo o Justificación Técnica de la Baja / Decommissioning *
                </label>
                <textarea
                  className="input-base"
                  rows={4}
                  placeholder="Detalle la justificación técnica del retiro (ej. Servidor físico decomisionado tras migración a AWS, reemplazo por falla irreparable, fin de ciclo de vida útil)..."
                  value={motivoDesactivacion}
                  onChange={(e) => setMotivoDesactivacion(e.target.value)}
                  required
                  autoFocus
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Este registro mantendrá la trazabilidad de auditoría para la certificación ISO 20000 / 27001.
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
                  setCiSeleccionado(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="boton-primario"
                style={{
                  width: "auto",
                  padding: "8px 24px",
                  fontSize: 13,
                  backgroundColor: ciSeleccionado.estado_registro !== false ? "#dc2626" : "#16a34a",
                }}
                disabled={guardando}
              >
                {guardando
                  ? "Procesando..."
                  : ciSeleccionado.estado_registro !== false
                  ? "Confirmar Baja del CI"
                  : "Confirmar Reactivación"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. VISTA PRINCIPAL: TABLA DE ELEMENTOS DE CONFIGURACIÓN */}
      {vista === "tabla" && (
        <div>
          <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1>Base de Datos de Configuración (CMDB - Configuration Management)</h1>
              <p className="descripcion">
                Modelado integral de Elementos de Configuración (CI), topología de dependencias y análisis de impacto en fallas y cambios (ITIL v4 / ISO 20000).
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link
                href="/plataforma/activos/cmdb/analisis"
                className="boton-secundario"
                style={{ textDecoration: "none", fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center" }}
              >
                Análisis e Impacto
              </Link>
              <Link
                href="/plataforma/activos/cmdb/tipos"
                className="boton-secundario"
                style={{ textDecoration: "none", fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center" }}
              >
                Modelar Clases y Tipos CI
              </Link>
              <button
                type="button"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={abrirNuevo}
              >
                Registrar CI
              </button>
            </div>
          </div>

          {/* Tarjetas de Indicadores */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Total CIs Monitoreados</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>{totalCIs}</div>
              <div style={{ fontSize: 11.5, color: "#16a34a", marginTop: 2 }}>{enProduccion} en Producción</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Criticidad Crítica</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#dc2626", marginTop: 4 }}>{criticos}</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>impacto vital al negocio</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Aristas de Dependencia</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>{relaciones.length}</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>enlaces topológicos activos</div>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="barra-filtros" style={{ marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input
                type="text"
                className="input-base"
                placeholder="Buscar por código CI, nombre, IP o tipo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: "100%", fontSize: 13 }}
              />
            </div>

            <div>
              <select
                className="input-base"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                style={{ fontSize: 13, backgroundColor: "white" }}
              >
                <option value="">Todos los Tipos de CI</option>
                <option value="APLICACION">Aplicaciones</option>
                <option value="SERVIDOR_LOGICO">Servidores Lógicos</option>
                <option value="BASE_DATOS">Bases de Datos</option>
                <option value="NODO_RED">Nodos de Red</option>
                <option value="SERVICIO_TI">Servicios TI</option>
              </select>
            </div>

            <div>
              <select
                className="input-base"
                value={filtroCriticidad}
                onChange={(e) => setFiltroCriticidad(e.target.value)}
                style={{ fontSize: 13, backgroundColor: "white" }}
              >
                <option value="">Toda Criticidad</option>
                <option value="CRITICA">Crítica</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>

            <div>
              <select
                className="input-base"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{ fontSize: 13, backgroundColor: "white" }}
              >
                <option value="activos">CIs Activos</option>
                <option value="inactivos">CIs Dados de Baja</option>
                <option value="todos">Todos los Estados</option>
              </select>
            </div>
          </div>

          {/* Tabla de CIs */}
          {cargando ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
              Cargando repositorio maestro CMDB...
            </div>
          ) : elementosFiltrados.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
              No se encontraron Elementos de Configuración registrados.
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Código CI</th>
                    <th>Elemento de Configuración</th>
                    <th>Tipo</th>
                    <th>Ambiente</th>
                    <th>Dirección / IP</th>
                    <th>Criticidad</th>
                    <th>Topología / Dependencias</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {elementosFiltrados.map((ci) => {
                    const dependenciasDeEste = relaciones.filter((r) => r.id_ci_padre === ci.id_ci);
                    const dependeDe = relaciones.filter((r) => r.id_ci_hijo === ci.id_ci);

                    return (
                      <tr key={ci.id_ci}>
                        <td>
                          <strong style={{ fontFamily: "monospace", color: "#2563eb", fontSize: 12.5 }}>
                            {ci.codigo_ci}
                          </strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{ci.nombre}</div>
                          {ci.version_software && (
                            <div style={{ fontSize: 11.5, color: "#64748b" }}>Versión: {ci.version_software}</div>
                          )}
                          {ci.estado_registro === false && ci.motivo_inactivacion && (
                            <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2, fontStyle: "italic" }}>
                              Motivo baja: {ci.motivo_inactivacion}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontFamily: "monospace",
                              backgroundColor: "#f1f5f9",
                              color: "#334155",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            {ci.tipo_ci}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: ci.ambiente === "PRODUCCION" ? "#16a34a" : ci.ambiente === "QA" ? "#2563eb" : "#ca8a04",
                            }}
                          >
                            {ci.ambiente}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, fontFamily: "monospace", color: "#475569" }}>
                          {ci.ip_principal || "—"}
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              fontSize: 10.5,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              backgroundColor:
                                ci.criticidad === "CRITICA"
                                  ? "#fee2e2"
                                  : ci.criticidad === "ALTA"
                                  ? "#ffedd5"
                                  : ci.criticidad === "MEDIA"
                                  ? "#fef9c3"
                                  : "#f1f5f9",
                              color:
                                ci.criticidad === "CRITICA"
                                  ? "#b91c1c"
                                  : ci.criticidad === "ALTA"
                                  ? "#c2410c"
                                  : ci.criticidad === "MEDIA"
                                  ? "#854d0e"
                                  : "#475569",
                            }}
                          >
                            {ci.criticidad}
                          </span>
                        </td>
                        <td style={{ fontSize: 11.5, maxWidth: 300 }}>
                          {dependeDe.length > 0 && (
                            <div style={{ marginBottom: 4 }}>
                              <span style={{ color: "#64748b", fontWeight: 600 }}>Depende de: </span>
                              {dependeDe.map((d) => (
                                <span key={d.id_ci_padre} style={{ color: "#0369a1", marginRight: 4 }}>
                                  [{d.padre_codigo}]
                                </span>
                              ))}
                            </div>
                          )}
                          {dependenciasDeEste.length > 0 && (
                            <div>
                              <span style={{ color: "#64748b", fontWeight: 600 }}>Impacta a: </span>
                              {dependenciasDeEste.map((d) => (
                                <span key={d.id_ci_hijo} style={{ color: "#b91c1c", marginRight: 4 }}>
                                  [{d.hijo_codigo}]
                                </span>
                              ))}
                            </div>
                          )}
                          {dependeDe.length === 0 && dependenciasDeEste.length === 0 && (
                            <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Sin enlaces</span>
                          )}
                        </td>
                        <td>
                          <span className={"badge " + (ci.estado_registro !== false ? "badge-activo" : "badge-inactivo")}>
                            {ci.estado_registro !== false ? "Operativo" : "Baja"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 5 }}>
                            <button
                              type="button"
                              className="boton-accion-icono"
                              title="Editar atributos del CI"
                              onClick={() => abrirEditar(ci)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="boton-accion-icono"
                              title="Gestionar relaciones y topología"
                              onClick={() => abrirRelaciones(ci)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="6" height="6" rx="1" />
                                <rect x="16" y="16" width="6" height="6" rx="1" />
                                <path d="M5 8v6a2 2 0 0 0 2 2h9" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className={"boton-accion-icono " + (ci.estado_registro !== false ? "boton-accion-peligro" : "")}
                              title={ci.estado_registro !== false ? "Dar de baja CI con justificación" : "Reactivar CI"}
                              onClick={() => abrirDesactivar(ci)}
                            >
                              {ci.estado_registro !== false ? (
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
