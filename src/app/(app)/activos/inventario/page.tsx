"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Activo } from "@/types";

type ModoVista = "tabla" | "nuevo" | "editar" | "baja" | "historial";

function ContenidoInventarioActivos() {
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
  const [idModelo, setIdModelo] = useState<number | "">("");
  const [estadoActivo, setEstadoActivo] = useState("EN_OPERACION");
  const [costoCompra, setCostoCompra] = useState("");
  const [motivoBaja, setMotivoBaja] = useState("");
  const [motivoTransicion, setMotivoTransicion] = useState("");

  // Parámetros y Pestañas ITAM
  const searchParams = useSearchParams();
  const seccionParam = searchParams.get("seccion");
  const [pestanaItam, setPestanaItam] = useState<"inventario" | "tipos" | "ciclo-vida">(
    seccionParam === "tipos" ? "tipos" : seccionParam === "ciclo-vida" ? "ciclo-vida" : "inventario"
  );

  useEffect(() => {
    if (seccionParam === "tipos") setPestanaItam("tipos");
    else if (seccionParam === "ciclo-vida") setPestanaItam("ciclo-vida");
  }, [seccionParam]);

  // Modelos y Ciclo de Vida ITAM
  const [modelos, setModelos] = useState<any[]>([]);
  const [tiposCatalogo, setTiposCatalogo] = useState<any[]>([]);
  const [historialActivo, setHistorialActivo] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Formulario nuevo modelo
  const [modalNuevoModelo, setModalNuevoModelo] = useState(false);
  const [nuevoTipoActivoId, setNuevoTipoActivoId] = useState<number>(1);
  const [nuevoFabricante, setNuevoFabricante] = useState("");
  const [nuevoNombreModelo, setNuevoNombreModelo] = useState("");
  const [nuevaVidaUtil, setNuevaVidaUtil] = useState<number>(36);
  const [nuevoMetodoDep, setNuevoMetodoDep] = useState("LINEAL");
  const [nuevoResidualPct, setNuevoResidualPct] = useState<number>(10);
  const [guardandoModelo, setGuardandoModelo] = useState(false);

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
    fetch("/api/activos/modelos").then(r => r.json()).then(d => {
      if (Array.isArray(d?.modelos)) setModelos(d.modelos);
    }).catch(() => {});
    fetch("/api/activos/tipos").then(r => r.json()).then(d => {
      if (Array.isArray(d?.tipos)) setTiposCatalogo(d.tipos);
    }).catch(() => {});
  }, [filtroTipo, filtroEstado]);

  async function registrarModelo(e: FormEvent) {
    e.preventDefault();
    setGuardandoModelo(true);
    setError(null);
    setMensajeExito(null);
    try {
      const res = await fetch("/api/activos/modelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_tipo_activo: nuevoTipoActivoId,
          fabricante: nuevoFabricante.trim(),
          nombre_modelo: nuevoNombreModelo.trim(),
          vida_util_meses: Number(nuevaVidaUtil),
          metodo_depreciacion: nuevoMetodoDep,
          valor_residual_pct: Number(nuevoResidualPct),
        }),
      });

      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "No se pudo registrar el modelo de activo");
        return;
      }

      setMensajeExito(`Modelo [${nuevoFabricante} ${nuevoNombreModelo}] registrado exitosamente.`);
      setModalNuevoModelo(false);
      setNuevoFabricante("");
      setNuevoNombreModelo("");
      const mRes = await fetch("/api/activos/modelos").then(r => r.json());
      if (Array.isArray(mRes?.modelos)) setModelos(mRes.modelos);
    } catch {
      setError("Error de red al registrar modelo de activo");
    } finally {
      setGuardandoModelo(false);
    }
  }

  function abrirNuevo() {
    setCodigoPatrimonial("");
    setNumeroSerie("");
    setTipoActivo("LAPTOP");
    setMarca("");
    setModelo("");
    setIdModelo("");
    setEstadoActivo("EN_STOCK");
    setCostoCompra("");
    setMotivoTransicion("");
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
    setIdModelo((a as any).id_modelo || "");
    setEstadoActivo(a.estado_activo);
    setCostoCompra(a.costo_compra ? String(a.costo_compra) : "");
    setMotivoTransicion("");
    setError(null);
    setMensajeExito(null);
    setVista("editar");
  }

  async function abrirHistorial(a: Activo) {
    setActivoSeleccionado(a);
    setVista("historial");
    setCargandoHistorial(true);
    setError(null);
    try {
      const res = await fetch(`/api/activos/${a.id_activo}/historial`);
      const data = await res.json();
      if (Array.isArray(data?.historial)) setHistorialActivo(data.historial);
      else setHistorialActivo([]);
    } catch {
      setError("Error al cargar historial del activo.");
    } finally {
      setCargandoHistorial(false);
    }
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
          id_modelo: idModelo ? Number(idModelo) : null,
          estado_activo: estadoActivo,
          costo_compra: costoCompra ? Number(costoCompra) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar el activo.");
        return;
      }

      setMensajeExito(`Activo [${codigoPatrimonial.toUpperCase()}] registrado con éxito.`);
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
          id_modelo: idModelo ? Number(idModelo) : null,
          estado_activo: estadoActivo,
          costo_compra: costoCompra ? Number(costoCompra) : null,
          motivo: motivoTransicion.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo actualizar el activo.");
        return;
      }

      setMensajeExito(`Activo [${codigoPatrimonial.toUpperCase()}] actualizado con éxito.`);
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
          ? `Activo [${activoSeleccionado.codigo_patrimonial}] dado de baja exitosamente.`
          : `Activo [${activoSeleccionado.codigo_patrimonial}] reincorporado a operación.`
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

      {/* Selector de Pestaña ITAM */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
        <button
          type="button"
          onClick={() => { setPestanaItam("inventario"); setVista("tabla"); }}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: pestanaItam === "inventario" ? 700 : 500,
            backgroundColor: pestanaItam === "inventario" ? "#2563eb" : "#f1f5f9",
            color: pestanaItam === "inventario" ? "#ffffff" : "#475569",
            border: "none",
            cursor: "pointer",
          }}
        >
          Inventario Operativo (Hardware y Custodia)
        </button>
        <button
          type="button"
          onClick={() => setPestanaItam("tipos")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: pestanaItam === "tipos" ? 700 : 500,
            backgroundColor: pestanaItam === "tipos" ? "#2563eb" : "#f1f5f9",
            color: pestanaItam === "tipos" ? "#ffffff" : "#475569",
            border: "none",
            cursor: "pointer",
          }}
        >
          Tipos, Modelos y Reglas de Depreciación
        </button>
        <button
          type="button"
          onClick={() => setPestanaItam("ciclo-vida")}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: pestanaItam === "ciclo-vida" ? 700 : 500,
            backgroundColor: pestanaItam === "ciclo-vida" ? "#2563eb" : "#f1f5f9",
            color: pestanaItam === "ciclo-vida" ? "#ffffff" : "#475569",
            border: "none",
            cursor: "pointer",
          }}
        >
          Ciclo de Vida y Transiciones Autorizadas
        </button>
      </div>

      {/* 1. SECCIÓN: INVENTARIO DE HARDWARE */}
      {pestanaItam === "inventario" && (
        <>
          {/* 1.1 VISTA DEDICADA: REGISTRAR NUEVO ACTIVO */}
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
                Volver al Inventario de Activos
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
                Volver al Inventario de Activos
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
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

            {modelos.length > 0 && (
              <div className="campo" style={{ marginBottom: 16 }}>
                <label>Modelo Catálogo ITAM</label>
                <select
                  className="input-base"
                  value={idModelo}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : "";
                    setIdModelo(id);
                    if (id) {
                      const mod = modelos.find((m) => m.id_modelo === id);
                      if (mod) {
                        setMarca(mod.fabricante);
                        setModelo(mod.nombre_modelo);
                      }
                    }
                  }}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="">-- Modelo libre o no homologado --</option>
                  {modelos.map((m: any) => (
                    <option key={m.id_modelo} value={m.id_modelo}>
                      [{m.tipo_nombre}] {m.fabricante} {m.nombre_modelo} (Vida útil: {m.vida_util_meses || 36}m)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activoSeleccionado && estadoActivo !== activoSeleccionado.estado_activo && (
              <div className="campo" style={{ marginBottom: 16 }}>
                <label>Motivo / Justificación de la Transición de Estado *</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Justifique el cambio de estado (ej: Reparación por falla de RAM, retorno a stock)"
                  value={motivoTransicion}
                  onChange={(e) => setMotivoTransicion(e.target.value)}
                  required
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
            Volver al Inventario de Activos
          </button>

          <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 6px 0", color: activoSeleccionado.estado_activo !== "BAJA" ? "#b91c1c" : "#16a34a" }}>
            {activoSeleccionado.estado_activo !== "BAJA"
              ? `Dar de Baja Activo: [${activoSeleccionado.codigo_patrimonial}] ${activoSeleccionado.marca} ${activoSeleccionado.modelo}`
              : `Reactivar Activo: [${activoSeleccionado.codigo_patrimonial}] ${activoSeleccionado.marca} ${activoSeleccionado.modelo}`}
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

      {/* 3.5 VISTA: HISTORIAL DE CICLO DE VIDA Y CUSTODIA */}
      {vista === "historial" && activoSeleccionado && (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Historial de Ciclo de Vida: [{activoSeleccionado.codigo_patrimonial}] {activoSeleccionado.marca} {activoSeleccionado.modelo}
              </h1>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
                Trazabilidad completa de estados, reasignaciones de custodia y justificaciones según ITIL v4 e ISO/IEC 20000.
              </p>
            </div>
            <button
              type="button"
              className="boton-secundario"
              onClick={() => { setVista("tabla"); setActivoSeleccionado(null); }}
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              Volver a Inventario
            </button>
          </div>

          <div className="contenedor-tabla">
            <h2 style={{ fontSize: 15, margin: "16px 16px 8px" }}>Eventos y Transiciones Registradas</h2>
            {cargandoHistorial ? (
              <p style={{ padding: 16 }}>Cargando línea de tiempo del activo...</p>
            ) : historialActivo.length === 0 ? (
              <p style={{ padding: 16, color: "#64748b" }}>Este activo no cuenta con transiciones históricas registradas.</p>
            ) : (
              <table className="tabla" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Estado Anterior</th>
                    <th>Estado Nuevo</th>
                    <th>Custodio</th>
                    <th>Motivo / Justificación</th>
                    <th>Registrado Por</th>
                  </tr>
                </thead>
                <tbody>
                  {historialActivo.map((h: any) => (
                    <tr key={h.id_historial}>
                      <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                        {new Date(h.fecha).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge-itil" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>
                          {h.estado_anterior || "INICIAL"}
                        </span>
                      </td>
                      <td>
                        <span className="badge-itil" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", fontWeight: 700 }}>
                          {h.estado_nuevo}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {h.custodio_nuevo_nombre ? (
                          <span>{h.custodio_nuevo_nombre}</span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>Sin custodio</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {h.motivo || "-"}
                      </td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>
                        {h.usuario_registro_nombre || "Sistema"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
              style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
              onClick={abrirNuevo}
            >
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
                            title="Historial de ciclo de vida"
                            onClick={() => abrirHistorial(a)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </button>
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
        </>
      )}

      {/* 2. SECCIÓN: TIPOS, MODELOS Y REGLAS DE DEPRECIACIÓN */}
      {pestanaItam === "tipos" && (
        <div>
          <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1>Catálogo Maestro de Tipos, Modelos y Reglas de Depreciación ITAM</h1>
              <p className="descripcion">
                Gobernanza de hardware homologado según ITIL v4 e ISO 20000: Modelado de marcas, modelos, cálculo de depreciación lineal contable y ciclos de vida útil.
              </p>
            </div>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
              onClick={() => setModalNuevoModelo(true)}
            >
              Registrar Modelo Homologado
            </button>
          </div>

          <div className="contenedor-tabla" style={{ padding: 20, backgroundColor: "#ffffff", marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
              Modelos de Hardware Homologados y Fórmulas Contables
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: 12.5, color: "#64748b" }}>
              Cada modelo establece su vida útil en meses y su depreciación lineal anual para la valorización patrimonial automática.
            </p>

            <table className="tabla-datos">
              <thead>
                <tr>
                  <th>Clase / Tipo</th>
                  <th>Fabricante</th>
                  <th>Nombre del Modelo</th>
                  <th style={{ textAlign: "center" }}>Vida Útil</th>
                  <th style={{ textAlign: "center" }}>Método Contable</th>
                  <th style={{ textAlign: "center" }}>Valor Residual</th>
                  <th style={{ textAlign: "center" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {modelos.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "#64748b" }}>
                      No se han registrado modelos de hardware aún.
                    </td>
                  </tr>
                ) : (
                  modelos.map((m: any) => (
                    <tr key={m.id_modelo}>
                      <td>
                        <span className="badge-itil" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", fontWeight: 600 }}>
                          {m.tipo_nombre || m.tipo_codigo || "HARDWARE"}
                        </span>
                      </td>
                      <td><strong style={{ color: "#0f172a" }}>{m.fabricante}</strong></td>
                      <td>{m.nombre_modelo}</td>
                      <td style={{ textAlign: "center", fontWeight: 600, color: "#334155" }}>
                        {m.vida_util_meses ? `${m.vida_util_meses} meses (${Math.round(m.vida_util_meses / 12)} años)` : "36 meses"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ padding: "2px 8px", backgroundColor: "#f1f5f9", borderRadius: 4, fontSize: 11, fontWeight: 600, color: "#475569" }}>
                          {m.metodo_depreciacion || "LINEAL"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600, color: "#15803d" }}>
                        {m.valor_residual_pct !== undefined ? `${m.valor_residual_pct}%` : "10%"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>
                          Homologado
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SECCIÓN: CICLO DE VIDA Y TRANSICIONES AUTORIZADAS */}
      {pestanaItam === "ciclo-vida" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="cabecera-pagina">
            <div>
              <h1>Matriz Formal de Ciclo de Vida y Transiciones Autorizadas (ITAM)</h1>
              <p className="descripcion">
                Gobernanza patrimonial según ITIL v4 e ISO/IEC 20000: Matriz de estados autorizados, compuertas de seguridad y control estricto de custodios.
              </p>
            </div>
          </div>

          <div className="contenedor-tabla" style={{ padding: 20, backgroundColor: "#ffffff" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
              Estados Patrimoniales del Inventario
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: 12.5, color: "#64748b" }}>
              Definición de los estados del ciclo de vida de equipamiento tecnológico.
            </p>

            <table className="tabla-datos">
              <thead>
                <tr>
                  <th style={{ width: 160 }}>Estado Patrimonial</th>
                  <th>Definición Operativa</th>
                  <th style={{ width: 180 }}>Imputación Contable</th>
                  <th style={{ width: 140, textAlign: "center" }}>Disponibilidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="badge-itil" style={{ backgroundColor: "#e2e8f0", color: "#334155" }}>EN_STOCK</span></td>
                  <td>Activo en almacén tecnológico o bodega central listo para entrega a usuario o servidor listo para despliegue.</td>
                  <td>Activo en custodia TI (Sin amortización por uso)</td>
                  <td style={{ textAlign: "center", color: "#16a34a", fontWeight: 700 }}>Disponible</td>
                </tr>
                <tr>
                  <td><span className="badge-itil" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>EN_OPERACION / ASIGNADO</span></td>
                  <td>Activo en producción asignado a un colaborador custodio o prestando servicios críticos de infraestructura.</td>
                  <td>Activo en uso (Depreciación lineal activa)</td>
                  <td style={{ textAlign: "center", color: "#2563eb", fontWeight: 700 }}>Asignado</td>
                </tr>
                <tr>
                  <td><span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>MANTENIMIENTO</span></td>
                  <td>Activo enviado a soporte técnico, laboratorio interno o servicio oficial por falla física o garantía.</td>
                  <td>Activo en reparación técnica</td>
                  <td style={{ textAlign: "center", color: "#d97706", fontWeight: 700 }}>En Taller</td>
                </tr>
                <tr>
                  <td><span className="badge-itil" style={{ backgroundColor: "#f1f5f9", color: "#475569" }}>RETIRADO</span></td>
                  <td>Activo desinstalado temporalmente de producción, en evaluación de obsolescencia o renovación de parque informático.</td>
                  <td>Activo en reserva de sustitución</td>
                  <td style={{ textAlign: "center", color: "#64748b", fontWeight: 700 }}>Inactivo</td>
                </tr>
                <tr>
                  <td><span className="badge-itil" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>BAJA PATRIMONIAL</span></td>
                  <td>Retiro definitivo y desecho del activo por daño irreparable, robo o fin de vida útil. Estado irreversible.</td>
                  <td>Baja en libros contables (Amortización total)</td>
                  <td style={{ textAlign: "center", color: "#dc2626", fontWeight: 700 }}>No Disponible</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="contenedor-tabla" style={{ padding: 20, backgroundColor: "#ffffff" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
              Matriz de Transiciones Autorizadas y Reglas de Seguridad
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: 12.5, color: "#64748b" }}>
              Compuertas formales para transicionar activos en la plataforma.
            </p>

            <table className="tabla-datos">
              <thead>
                <tr>
                  <th>Estado Origen</th>
                  <th>Destino Permitido</th>
                  <th>Roles Autorizados</th>
                  <th>Compuerta / Requisito Obligatorio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>EN_STOCK</strong></td>
                  <td>EN_OPERACION</td>
                  <td>Gestor de Activos, Supervisor TI</td>
                  <td>Asignación formal de colaborador custodio con DNI y departamento.</td>
                </tr>
                <tr>
                  <td><strong>EN_OPERACION</strong></td>
                  <td>EN_STOCK</td>
                  <td>Gestor de Activos, Técnico</td>
                  <td>Acta de devolución de equipo (cese laboral o recambio). Desvincula custodio.</td>
                </tr>
                <tr>
                  <td><strong>EN_OPERACION / EN_STOCK</strong></td>
                  <td>MANTENIMIENTO</td>
                  <td>Técnico, Gestor de Activos</td>
                  <td>Registro del ticket de incidente o falla que sustenta el ingreso a taller.</td>
                </tr>
                <tr>
                  <td><strong>MANTENIMIENTO</strong></td>
                  <td>EN_STOCK / EN_OPERACION</td>
                  <td>Técnico, Gestor de Activos</td>
                  <td>Dictamen de conformidad técnica y pruebas de operatividad superadas.</td>
                </tr>
                <tr>
                  <td><strong>Cualquier Estado</strong></td>
                  <td>BAJA PATRIMONIAL</td>
                  <td>Administrador, Gestor de Activos</td>
                  <td>Sustento formal obligatorio (mínimo 5 caracteres) y registro en auditoría.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL REGISTRO NUEVO MODELO */}
      {modalNuevoModelo && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: 8, padding: 24, maxWidth: 500, width: "100%", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Registrar Nuevo Modelo de Hardware Homologado
            </h3>
            <form onSubmit={registrarModelo}>
              <div className="campo">
                <label className="etiqueta">Tipo de Activo (*)</label>
                <select
                  className="input-base"
                  value={nuevoTipoActivoId}
                  onChange={(e) => setNuevoTipoActivoId(Number(e.target.value))}
                  required
                >
                  {tiposCatalogo.map((t: any) => (
                    <option key={t.id_tipo_activo} value={t.id_tipo_activo}>
                      [{t.clase}] {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="campo">
                <label className="etiqueta">Fabricante / Marca (*)</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej. Dell, Lenovo, HP, Cisco, Apple"
                  value={nuevoFabricante}
                  onChange={(e) => setNuevoFabricante(e.target.value)}
                  required
                />
              </div>
              <div className="campo">
                <label className="etiqueta">Nombre del Modelo (*)</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej. Latitude 5440, ThinkPad T14 Gen 4, Catalyst 2960"
                  value={nuevoNombreModelo}
                  onChange={(e) => setNuevoNombreModelo(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="campo">
                  <label className="etiqueta">Vida Útil (Meses) (*)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    className="input-base"
                    value={nuevaVidaUtil}
                    onChange={(e) => setNuevaVidaUtil(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="campo">
                  <label className="etiqueta">Valor Residual (%) (*)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    className="input-base"
                    value={nuevoResidualPct}
                    onChange={(e) => setNuevoResidualPct(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div className="campo">
                <label className="etiqueta">Método de Depreciación</label>
                <select
                  className="input-base"
                  value={nuevoMetodoDep}
                  onChange={(e) => setNuevoMetodoDep(e.target.value)}
                >
                  <option value="LINEAL">Depreciación Lineal Contable (Estándar)</option>
                  <option value="SALDOS_DECRECIENTES">Saldos Decrecientes / Acelerada</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setModalNuevoModelo(false)}
                  style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-primario"
                  style={{ width: "auto", padding: "8px 16px" }}
                  disabled={guardandoModelo}
                >
                  {guardandoModelo ? "Guardando..." : "Guardar Modelo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaginaInventarioActivos() {
  return (
    <Suspense fallback={<div className="vista-contenedor"><p>Cargando inventario de activos...</p></div>}>
      <ContenidoInventarioActivos />
    </Suspense>
  );
}

