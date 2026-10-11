const fs = require('fs');

const content = `"use client";

import { useEffect, useState, FormEvent } from "react";
import { Activo } from "@/types";

type ModoVista = "tabla" | "nuevo" | "editar" | "baja";

export default function PaginaInventarioActivos() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");

  // Modo de vista: sin modales flotantes
  const [vista, setVista] = useState<ModoVista>("tabla");
  const [activoSeleccionado, setActivoSeleccionado] = useState<Activo | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Formulario Crear / Editar
  const [codigoPatrimonial, setCodigoPatrimonial] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [tipoActivo, setTipoActivo] = useState("LAPTOP");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [estadoActivo, setEstadoActivo] = useState("EN_OPERACION");
  const [costoCompra, setCostoCompra] = useState("");
  const [motivoBaja, setMotivoBaja] = useState("");

  async function cargarActivos() {
    setCargando(true);
    setError(null);
    try {
      const url = new URL("/api/activos", window.location.origin);
      if (filtroTipo !== "TODOS") url.searchParams.set("tipo", filtroTipo);
      if (filtroEstado !== "TODOS") url.searchParams.set("estado", filtroEstado);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (Array.isArray(data)) {
        setActivos(data);
      }
    } catch (err) {
      console.error("Error al cargar activos:", err);
      setError("Error de conexión al cargar inventario de activos");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarActivos();
  }, [filtroTipo, filtroEstado]);

  function abrirNuevo() {
    setCodigoPatrimonial("");
    setNumeroSerie("");
    setTipoActivo("LAPTOP");
    setMarca("");
    setModelo("");
    setEstadoActivo("EN_OPERACION");
    setCostoCompra("");
    setError(null);
    setMensajeExito(null);
    setVista("nuevo");
  }

  function abrirEditar(a: Activo) {
    setActivoSeleccionado(a);
    setCodigoPatrimonial(a.codigo_patrimonial);
    setNumeroSerie(a.numero_serie || "");
    setTipoActivo(a.tipo_activo);
    setMarca(a.marca);
    setModelo(a.modelo);
    setEstadoActivo(a.estado_activo);
    setCostoCompra(a.costo_compra ? String(a.costo_compra) : "");
    setError(null);
    setMensajeExito(null);
    setVista("editar");
  }

  function abrirBaja(a: Activo) {
    setActivoSeleccionado(a);
    setMotivoBaja("");
    setError(null);
    setMensajeExito(null);
    setVista("baja");
  }

  async function registrarActivo(e: FormEvent) {
    e.preventDefault();
    if (!codigoPatrimonial.trim() || !marca.trim() || !modelo.trim()) {
      setError("Código patrimonial, marca y modelo son obligatorios.");
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch("/api/activos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo_patrimonial: codigoPatrimonial.trim().toUpperCase(),
          numero_serie: numeroSerie.trim() || null,
          tipo_activo: tipoActivo,
          marca: marca.trim(),
          modelo: modelo.trim(),
          estado_activo: estadoActivo,
          costo_compra: costoCompra ? Number(costoCompra) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar el activo.");
        return;
      }

      setMensajeExito(\`Activo [\${codigoPatrimonial.toUpperCase()}] registrado con éxito.\`);
      setVista("tabla");
      await cargarActivos();
    } catch {
      setError("Error de conexión al registrar activo.");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarEdicionActivo(e: FormEvent) {
    e.preventDefault();
    if (!activoSeleccionado) return;

    if (!codigoPatrimonial.trim() || !marca.trim() || !modelo.trim()) {
      setError("Código patrimonial, marca y modelo son obligatorios.");
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch("/api/activos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_activo: activoSeleccionado.id_activo,
          codigo_patrimonial: codigoPatrimonial.trim().toUpperCase(),
          numero_serie: numeroSerie.trim() || null,
          tipo_activo: tipoActivo,
          marca: marca.trim(),
          modelo: modelo.trim(),
          estado_activo: estadoActivo,
          costo_compra: costoCompra ? Number(costoCompra) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo actualizar el activo.");
        return;
      }

      setMensajeExito(\`Activo [\${codigoPatrimonial.toUpperCase()}] actualizado con éxito.\`);
      setVista("tabla");
      setActivoSeleccionado(null);
      await cargarActivos();
    } catch {
      setError("Error de conexión al actualizar el activo.");
    } finally {
      setGuardando(false);
    }
  }

  async function confirmarBajaActivo(e: FormEvent) {
    e.preventDefault();
    if (!activoSeleccionado) return;

    const esBaja = activoSeleccionado.estado_activo !== "BAJA";
    if (esBaja && motivoBaja.trim().length < 5) {
      setError("Debe ingresar una justificación detallada (mínimo 5 caracteres) para dar de baja el activo.");
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch("/api/activos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_activo: activoSeleccionado.id_activo,
          estado_activo: esBaja ? "BAJA" : "EN_OPERACION",
          motivo_inactivacion: esBaja ? motivoBaja.trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo actualizar el estado del activo.");
        return;
      }

      setMensajeExito(
        esBaja
          ? \`Activo [\${activoSeleccionado.codigo_patrimonial}] dado de baja exitosamente.\`
          : \`Activo [\${activoSeleccionado.codigo_patrimonial}] reincorporado a operación.\`
      );
      setVista("tabla");
      setActivoSeleccionado(null);
      await cargarActivos();
    } catch {
      setError("Error de conexión al dar de baja el activo.");
    } finally {
      setGuardando(false);
    }
  }

  // Filtrado local por búsqueda
  const activosFiltrados = activos.filter((a) => {
    if (!busqueda.trim()) return true;
    const b = busqueda.toLowerCase();
    return (
      a.codigo_patrimonial.toLowerCase().includes(b) ||
      (a.numero_serie && a.numero_serie.toLowerCase().includes(b)) ||
      a.marca.toLowerCase().includes(b) ||
      a.modelo.toLowerCase().includes(b)
    );
  });

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

      {/* 1. VISTA DEDICADA: REGISTRAR NUEVO ACTIVO */}
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
                ← Volver al Inventario de Activos
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Registrar Nuevo Activo de Hardware (HAM - ITIL v4)
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Control patrimonial de hardware corporativo, trazabilidad por número de serie y asignación operativa.
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
                form="form-nuevo-activo"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Registrando..." : "Registrar Activo"}
              </button>
            </div>
          </div>

          <form id="form-nuevo-activo" onSubmit={registrarActivo}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Código Patrimonial *</label>
                <input
                  type="text"
                  className="input-base"
                  style={{ fontFamily: "monospace", textTransform: "uppercase" }}
                  placeholder="Ej: ACT-LP-012, ACT-SRV-004"
                  value={codigoPatrimonial}
                  onChange={(e) => setCodigoPatrimonial(e.target.value.toUpperCase())}
                  required
                  autoFocus
                />
              </div>

              <div className="campo">
                <label>Número de Serie de Fabricante</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej: 5CD2348X9Z, SN-789456123"
                  value={numeroSerie}
                  onChange={(e) => setNumeroSerie(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Tipo de Activo *</label>
                <select
                  className="input-base"
                  value={tipoActivo}
                  onChange={(e) => setTipoActivo(e.target.value)}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="LAPTOP">Laptop / Portátil</option>
                  <option value="SERVIDOR">Servidor Físico</option>
                  <option value="SWITCH">Switch / Equipo de Red</option>
                  <option value="DESKTOP">Estación de Trabajo</option>
                  <option value="IMPRESORA">Impresora Corporativa</option>
                </select>
              </div>

              <div className="campo">
                <label>Marca *</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej: Lenovo, Dell, Cisco, HP"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  required
                />
              </div>

              <div className="campo">
                <label>Modelo *</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej: ThinkPad T14 Gen 3, Catalyst 9300"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div className="campo">
                <label>Estado Operativo Inicial *</label>
                <select
                  className="input-base"
                  value={estadoActivo}
                  onChange={(e) => setEstadoActivo(e.target.value)}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="EN_OPERACION">En Operación (Asignado)</option>
                  <option value="EN_STOCK">En Stock / Almacén disponible</option>
                  <option value="MANTENIMIENTO">En Mantenimiento Técnico</option>
                </select>
              </div>

              <div className="campo">
                <label>Costo de Compra (S/.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-base"
                  value={costoCompra}
                  onChange={(e) => setCostoCompra(e.target.value)}
                  placeholder="Ej: 4500.00"
                />
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
                {guardando ? "Registrando..." : "Registrar Activo"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. VISTA DEDICADA: EDITAR ACTIVO */}
      {vista === "editar" && activoSeleccionado && (
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
                  setActivoSeleccionado(null);
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
                ← Volver al Inventario de Activos
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Editar Activo: [{activoSeleccionado.codigo_patrimonial}] {activoSeleccionado.marca} {activoSeleccionado.modelo}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Ajuste los datos patrimoniales, marca, modelo, estado y costo del activo.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setActivoSeleccionado(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="form-editar-activo"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>

          <form id="form-editar-activo" onSubmit={guardarEdicionActivo}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Código Patrimonial *</label>
                <input
                  type="text"
                  className="input-base"
                  style={{ fontFamily: "monospace", textTransform: "uppercase" }}
                  value={codigoPatrimonial}
                  onChange={(e) => setCodigoPatrimonial(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="campo">
                <label>Número de Serie</label>
                <input
                  type="text"
                  className="input-base"
                  value={numeroSerie}
                  onChange={(e) => setNumeroSerie(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Tipo de Activo *</label>
                <select
                  className="input-base"
                  value={tipoActivo}
                  onChange={(e) => setTipoActivo(e.target.value)}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="LAPTOP">Laptop / Portátil</option>
                  <option value="SERVIDOR">Servidor Físico</option>
                  <option value="SWITCH">Switch / Equipo de Red</option>
                  <option value="DESKTOP">Estación de Trabajo</option>
                  <option value="IMPRESORA">Impresora Corporativa</option>
                </select>
              </div>

              <div className="campo">
                <label>Marca *</label>
                <input
                  type="text"
                  className="input-base"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  required
                />
              </div>

              <div className="campo">
                <label>Modelo *</label>
                <input
                  type="text"
                  className="input-base"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div className="campo">
                <label>Estado Operativo *</label>
                <select
                  className="input-base"
                  value={estadoActivo}
                  onChange={(e) => setEstadoActivo(e.target.value)}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="EN_OPERACION">En Operación</option>
                  <option value="EN_STOCK">En Stock / Almacén</option>
                  <option value="MANTENIMIENTO">En Mantenimiento</option>
                  <option value="BAJA">Dado de Baja</option>
                </select>
              </div>

              <div className="campo">
                <label>Costo de Compra (S/.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-base"
                  value={costoCompra}
                  onChange={(e) => setCostoCompra(e.target.value)}
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
                  setActivoSeleccionado(null);
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

      {/* 3. VISTA DEDICADA: DAR DE BAJA ACTIVO */}
      {vista === "baja" && activoSeleccionado && (
        <div style={{ maxWidth: 700, margin: "0 auto", backgroundColor: "#ffffff", padding: 28, borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <button
            type="button"
            onClick={() => {
              setVista("tabla");
              setActivoSeleccionado(null);
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
            ← Volver al Inventario de Activos
          </button>

          <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px 0", color: activoSeleccionado.estado_activo !== "BAJA" ? "#b91c1c" : "#16a34a" }}>
            {activoSeleccionado.estado_activo !== "BAJA"
              ? \`Dar de Baja Activo: [\${activoSeleccionado.codigo_patrimonial}] \${activoSeleccionado.marca} \${activoSeleccionado.modelo}\`
              : \`Reactivar Activo: [\${activoSeleccionado.codigo_patrimonial}] \${activoSeleccionado.marca} \${activoSeleccionado.modelo}\`}
          </h2>

          <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: 13 }}>
            {activoSeleccionado.estado_activo !== "BAJA"
              ? "Dar de baja un activo lo retira del stock operacional y del inventario activo. Debe justificar el motivo del desecho o baja patrimonial."
              : "Reincorporar este activo lo devuelve al estado En Operación."}
          </p>

          <form onSubmit={confirmarBajaActivo}>
            {activoSeleccionado.estado_activo !== "BAJA" && (
              <div className="campo" style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                  Motivo de la Baja Patrimonial *
                </label>
                <textarea
                  className="input-base"
                  rows={4}
                  placeholder="Ej. Daño irreparable en placa madre, obsolescencia por fin de vida útil (5 años), reposición por garantía..."
                  value={motivoBaja}
                  onChange={(e) => setMotivoBaja(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setActivoSeleccionado(null);
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
                  backgroundColor: activoSeleccionado.estado_activo !== "BAJA" ? "#dc2626" : "#16a34a",
                }}
                disabled={guardando}
              >
                {guardando
                  ? "Procesando..."
                  : activoSeleccionado.estado_activo !== "BAJA"
                  ? "Confirmar Baja Patrimonial"
                  : "Confirmar Reactivación"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. VISTA PRINCIPAL: TABLA DE ACTIVOS */}
      {vista === "tabla" && (
        <div>
          <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1>Inventario de Activos Tecnológicos (Hardware y Equipamiento)</h1>
              <p className="descripcion">
                Control patrimonial ITIL v4: Identificación por serie, asignación departamental y ciclo de vida de equipamiento físico.
              </p>
            </div>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13 }}
              onClick={abrirNuevo}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Registrar Activo
            </button>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="barra-filtros" style={{ marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <input
                type="text"
                className="input-base"
                placeholder="Buscar por código, serie, marca o modelo..."
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
                <option value="TODOS">Todos los tipos</option>
                <option value="LAPTOP">Laptops</option>
                <option value="SERVIDOR">Servidores</option>
                <option value="SWITCH">Switches / Red</option>
                <option value="DESKTOP">Estaciones de Escritorio</option>
                <option value="IMPRESORA">Impresoras</option>
              </select>
            </div>

            <div>
              <select
                className="input-base"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{ fontSize: 13, backgroundColor: "white" }}
              >
                <option value="TODOS">Todos los estados</option>
                <option value="EN_OPERACION">En Operación</option>
                <option value="EN_STOCK">En Stock</option>
                <option value="MANTENIMIENTO">En Mantenimiento</option>
                <option value="BAJA">De Baja</option>
              </select>
            </div>
          </div>

          {/* Tabla de Activos */}
          {cargando ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
              Cargando activos de hardware...
            </div>
          ) : activosFiltrados.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
              No se encontraron activos con los criterios seleccionados.
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Código Patrimonial</th>
                    <th>N° Serie</th>
                    <th>Tipo</th>
                    <th>Marca y Modelo</th>
                    <th>Custodio Asignado</th>
                    <th>Departamento</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {activosFiltrados.map((a) => (
                    <tr key={a.id_activo}>
                      <td>
                        <strong style={{ fontFamily: "monospace", color: "#2563eb", fontSize: 12.5 }}>
                          {a.codigo_patrimonial}
                        </strong>
                      </td>
                      <td style={{ fontSize: 12, fontFamily: "monospace", color: "#475569" }}>
                        {a.numero_serie || "—"}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            backgroundColor: "#f1f5f9",
                            color: "#334155",
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          {a.tipo_activo}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{a.marca} {a.modelo}</div>
                        {a.motivo_inactivacion && (
                          <div style={{ fontSize: 11, color: "#dc2626", fontStyle: "italic" }}>
                            Baja: {a.motivo_inactivacion}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 12.5, color: "#334155" }}>
                        {a.custodio_nombre || <span style={{ color: "#9ca3af" }}>Sin custodio</span>}
                      </td>
                      <td style={{ fontSize: 12.5, color: "#475569" }}>
                        {a.departamento_nombre || "—"}
                      </td>
                      <td>
                        <span
                          className={
                            "badge " +
                            (a.estado_activo === "EN_OPERACION"
                              ? "badge-activo"
                              : a.estado_activo === "BAJA"
                              ? "badge-inactivo"
                              : "badge-pendiente")
                          }
                        >
                          {a.estado_activo}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 5 }}>
                          <button
                            type="button"
                            className="boton-accion-icono"
                            title="Editar activo"
                            onClick={() => abrirEditar(a)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className={"boton-accion-icono " + (a.estado_activo !== "BAJA" ? "boton-accion-peligro" : "")}
                            title={a.estado_activo !== "BAJA" ? "Dar de baja activo" : "Reactivar activo"}
                            onClick={() => abrirBaja(a)}
                          >
                            {a.estado_activo !== "BAJA" ? (
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

fs.writeFileSync('src/app/(app)/activos/inventario/page.tsx', content, 'utf8');
console.log('src/app/(app)/activos/inventario/page.tsx updated without floating modals');
