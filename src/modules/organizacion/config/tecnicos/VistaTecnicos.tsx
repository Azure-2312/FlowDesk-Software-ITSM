"use client";

import { useEffect, useState } from "react";
import { DepartamentoTI, TecnicoConCarga, UsuarioConPerfiles } from "@/types";

type ModoVista = "tabla" | "enrolar" | "editar";

export default function PaginaAdminTecnicos() {
  const [tecnicos, setTecnicos] = useState<TecnicoConCarga[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoTI[]>([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<UsuarioConPerfiles[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [filtroDepto, setFiltroDepto] = useState<string>("");
  const [filtroNivel, setFiltroNivel] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");

  // Modo de vista: sin ventanas flotantes
  const [vista, setVista] = useState<ModoVista>("tabla");
  const [tecnicoEditando, setTecnicoEditando] = useState<TecnicoConCarga | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Formulario de edición
  const [formDepto, setFormDepto] = useState<number>(1);
  const [formNivel, setFormNivel] = useState<1 | 2 | 3>(1);
  const [formCapacidad, setFormCapacidad] = useState<number>(8);
  const [formEstado, setFormEstado] = useState<string>("DISPONIBLE");
  const [formEspecialidad, setFormEspecialidad] = useState<string>("");

  // Formulario de enrolar nuevo
  const [enrolarUsuarioId, setEnrolarUsuarioId] = useState<number>(0);
  const [enrolarDepto, setEnrolarDepto] = useState<number>(1);
  const [enrolarNivel, setEnrolarNivel] = useState<1 | 2 | 3>(1);
  const [enrolarCapacidad, setEnrolarCapacidad] = useState<number>(8);
  const [enrolarEspecialidad, setEnrolarEspecialidad] = useState<string>("");

  // Gestión de Ausencias (1.4.3 e integración con 1.3.4.2.3)
  const [ausencias, setAusencias] = useState<any[]>([]);
  const [cargandoAusencias, setCargandoAusencias] = useState(false);
  const [formAusAbierto, setFormAusAbierto] = useState(false);
  const [ausenciaEditando, setAusenciaEditando] = useState<any | null>(null);
  const [ausTecnicoId, setAusTecnicoId] = useState<number>(0);
  const [ausFechaDesde, setAusFechaDesde] = useState<string>("");
  const [ausFechaHasta, setAusFechaHasta] = useState<string>("");
  const [ausMotivo, setAusMotivo] = useState<string>("");
  const [guardandoAusencia, setGuardandoAusencia] = useState(false);
  const [errorAusencia, setErrorAusencia] = useState<string | null>(null);

  async function cargarDatos() {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtroDepto) params.set("id_departamento", filtroDepto);
      if (filtroNivel) params.set("nivel", filtroNivel);

      const [resTec, resDep, resUsu] = await Promise.all([
        fetch(`/api/tecnicos?${params.toString()}`).then((r) => r.json()),
        fetch("/api/departamentos-ti").then((r) => r.json()),
        fetch("/api/usuarios").then((r) => r.json()),
      ]);

      setDepartamentos(resDep.departamentos || []);
      setUsuariosDisponibles(resUsu.usuarios || []);

      if (resTec.error) {
        setError(resTec.error);
        return;
      }

      setTecnicos(resTec.tecnicos || []);
    } catch {
      setError("Error de conexion al cargar datos de tecnicos");
    } finally {
      setCargando(false);
    }
  }

  async function cargarAusencias() {
    setCargandoAusencias(true);
    try {
      const res = await fetch("/api/admin/tecnicos/ausencias").then((r) => r.json());
      if (res.ok && res.ausencias) {
        setAusencias(res.ausencias);
      }
    } catch {
      // Ignorar error no crítico
    } finally {
      setCargandoAusencias(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [filtroDepto, filtroNivel]);

  useEffect(() => {
    cargarAusencias();
  }, []);

  function formatearParaInput(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function abrirNuevaAusencia() {
    setAusenciaEditando(null);
    setAusTecnicoId(tecnicos[0]?.id_usuario || 0);
    const ahora = new Date();
    const manana = new Date(ahora.getTime() + 24 * 3600 * 1000);
    setAusFechaDesde(formatearParaInput(ahora));
    setAusFechaHasta(formatearParaInput(manana));
    setAusMotivo("");
    setErrorAusencia(null);
    setFormAusAbierto(true);
  }

  function abrirEditarAusencia(a: any) {
    setAusenciaEditando(a);
    setAusTecnicoId(a.id_usuario_tecnico);
    setAusFechaDesde(formatearParaInput(new Date(a.fecha_desde)));
    setAusFechaHasta(formatearParaInput(new Date(a.fecha_hasta)));
    setAusMotivo(a.motivo);
    setErrorAusencia(null);
    setFormAusAbierto(true);
  }

  function cancelarFormAusencia() {
    setFormAusAbierto(false);
    setAusenciaEditando(null);
    setErrorAusencia(null);
  }

  async function guardarAusencia(e: React.FormEvent) {
    e.preventDefault();
    if (!ausTecnicoId || !ausFechaDesde || !ausFechaHasta || !ausMotivo.trim()) {
      setErrorAusencia("Por favor complete todos los campos requeridos.");
      return;
    }
    if (new Date(ausFechaHasta) <= new Date(ausFechaDesde)) {
      setErrorAusencia("La fecha final debe ser posterior a la fecha inicial.");
      return;
    }

    setGuardandoAusencia(true);
    setErrorAusencia(null);
    try {
      const payload = {
        id_ausencia: ausenciaEditando ? ausenciaEditando.id_ausencia : undefined,
        id_usuario_tecnico: ausTecnicoId,
        fecha_desde: new Date(ausFechaDesde).toISOString(),
        fecha_hasta: new Date(ausFechaHasta).toISOString(),
        motivo: ausMotivo.trim(),
      };

      const res = await fetch("/api/admin/tecnicos/ausencias", {
        method: ausenciaEditando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorAusencia(data.error || "Error al registrar la ausencia");
        return;
      }

      setFormAusAbierto(false);
      setAusenciaEditando(null);
      await cargarAusencias();
    } catch {
      setErrorAusencia("Error de conexión al procesar la ausencia");
    } finally {
      setGuardandoAusencia(false);
    }
  }

  async function eliminarAusencia(id: number) {
    if (!confirm("¿Está seguro de eliminar esta ausencia?")) return;
    try {
      const res = await fetch(`/api/admin/tecnicos/ausencias?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await cargarAusencias();
      }
    } catch {
      // Ignorar error
    }
  }

  function abrirEdicion(tec: TecnicoConCarga) {
    setTecnicoEditando(tec);
    setFormDepto(tec.id_departamento);
    setFormNivel(tec.nivel_soporte);
    setFormCapacidad(tec.capacidad_maxima_tickets);
    setFormEstado(tec.estado_operativo);
    setFormEspecialidad(tec.especialidad_principal || "");
    setError(null);
    setMensajeExito(null);
    setVista("editar");
  }

  function abrirEnrolar() {
    setEnrolarUsuarioId(0);
    setEnrolarDepto(departamentos[0]?.id_departamento || 1);
    setEnrolarNivel(1);
    setEnrolarCapacidad(8);
    setEnrolarEspecialidad("");
    setError(null);
    setMensajeExito(null);
    setVista("enrolar");
  }

  async function guardarEdicion(e: React.FormEvent) {
    e.preventDefault();
    if (!tecnicoEditando) return;

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch(`/api/tecnicos/${tecnicoEditando.id_usuario}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_departamento: formDepto,
          nivel_soporte: formNivel,
          capacidad_maxima_tickets: formCapacidad,
          estado_operativo: formEstado,
          especialidad_principal: formEspecialidad,
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo actualizar el técnico");
        return;
      }

      setMensajeExito(`Perfil técnico de [${tecnicoEditando.nombre_completo}] actualizado exitosamente.`);
      setVista("tabla");
      setTecnicoEditando(null);
      await cargarDatos();
    } catch {
      setError("Error de conexión al actualizar");
    } finally {
      setGuardando(false);
    }
  }

  async function registrarEnrolamiento(e: React.FormEvent) {
    e.preventDefault();
    if (!enrolarUsuarioId) {
      setError("Seleccione un usuario para enrolar");
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch("/api/tecnicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: enrolarUsuarioId,
          id_departamento: enrolarDepto,
          nivel_soporte: enrolarNivel,
          capacidad_maxima_tickets: enrolarCapacidad,
          especialidad_principal: enrolarEspecialidad,
          estado_operativo: "DISPONIBLE",
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo enrolar al técnico");
        return;
      }

      setMensajeExito("Técnico enrolado y asignado al departamento exitosamente.");
      setVista("tabla");
      setEnrolarUsuarioId(0);
      setEnrolarEspecialidad("");
      await cargarDatos();
    } catch {
      setError("Error de conexión al enrolar técnico");
    } finally {
      setGuardando(false);
    }
  }

  // Filtrado local por búsqueda
  const tecnicosFiltrados = tecnicos.filter((t) => {
    if (!busqueda.trim()) return true;
    const term = busqueda.toLowerCase();
    return (
      t.nombre_completo.toLowerCase().includes(term) ||
      t.correo_electronico.toLowerCase().includes(term) ||
      t.departamento_nombre?.toLowerCase().includes(term) ||
      (t.especialidad_principal && t.especialidad_principal.toLowerCase().includes(term))
    );
  });

  const totalN1 = tecnicos.filter((t) => t.nivel_soporte === 1).length;
  const totalN2 = tecnicos.filter((t) => t.nivel_soporte === 2).length;
  const totalN3 = tecnicos.filter((t) => t.nivel_soporte === 3).length;
  const totalDisponibles = tecnicos.filter((t) => t.estado_operativo === "DISPONIBLE").length;

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

      {/* 1. VISTA DEDICADA: EDITAR TÉCNICO A PANTALLA COMPLETA */}
      {vista === "editar" && tecnicoEditando && (
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
                  setTecnicoEditando(null);
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
                ← Volver a plantilla de técnicos
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Configurar Parámetros Operativos: {tecnicoEditando.nombre_completo}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Ajuste el nivel de soporte (L1/L2/L3), capacidad máxima WIP, departamento y disponibilidad del especialista.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setTecnicoEditando(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="form-editar-tecnico"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>

          <form id="form-editar-tecnico" onSubmit={guardarEdicion}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              <div className="campo">
                <label>Departamento de TI *</label>
                <select
                  className="input-base"
                  value={formDepto}
                  onChange={(e) => setFormDepto(parseInt(e.target.value, 10))}
                  style={{ backgroundColor: "white" }}
                  required
                >
                  {departamentos.map((d) => (
                    <option key={d.id_departamento} value={d.id_departamento}>
                      {d.nombre} ({d.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label>Nivel de Soporte ITIL *</label>
                <select
                  className="input-base"
                  value={formNivel}
                  onChange={(e) => setFormNivel(parseInt(e.target.value, 10) as 1 | 2 | 3)}
                  style={{ backgroundColor: "white" }}
                  required
                >
                  <option value={1}>Nivel 1 (Mesa de Ayuda / Triaje / FCR)</option>
                  <option value={2}>Nivel 2 (Soporte Técnico en Sitio / Campo)</option>
                  <option value={3}>Nivel 3 (Infraestructura / Especialista Senior)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              <div className="campo">
                <label>Tope Máximo de Carga Simultánea (WIP) *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="input-base"
                  value={formCapacidad}
                  onChange={(e) => setFormCapacidad(parseInt(e.target.value, 10) || 1)}
                  required
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Límite máximo de tickets en estado abierto o en proceso antes de alertar saturación.
                </span>
              </div>

              <div className="campo">
                <label>Disponibilidad Operativa en Turno *</label>
                <select
                  className="input-base"
                  value={formEstado}
                  onChange={(e) => setFormEstado(e.target.value)}
                  style={{ backgroundColor: "white" }}
                  required
                >
                  <option value="DISPONIBLE">Disponible (Recibe tickets nuevos por dispatch)</option>
                  <option value="EN_ATENCION">En Atención / Ocupado en campo</option>
                  <option value="EN_GUARDIA">En Guardia (Horario nocturno / fin de semana)</option>
                  <option value="EN_RECESO">En Receso Temporal</option>
                  <option value="VACACIONES">De Vacaciones / Licencia Médica</option>
                </select>
              </div>
            </div>

            <div className="campo" style={{ marginBottom: 24 }}>
              <label>Especialidad Principal, Tecnologías o Certificaciones</label>
              <input
                type="text"
                className="input-base"
                value={formEspecialidad}
                onChange={(e) => setFormEspecialidad(e.target.value)}
                placeholder="Ej. Redes Cisco CCNA, Telefonía IP, VMware ESXi, Azure Cloud, Linux RedHat..."
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setTecnicoEditando(null);
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

      {/* 2. VISTA DEDICADA: ENROLAR NUEVO TÉCNICO A PANTALLA COMPLETA */}
      {vista === "enrolar" && (
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
                ← Volver a plantilla de técnicos
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Enrolar Usuario en la Estructura de Soporte Técnico
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Asigne a un usuario corporativo un área resolutora, nivel de soporte ITIL y límite de capacidad operativa.
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
                form="form-enrolar-tecnico"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Enrolando..." : "Enrolar Técnico"}
              </button>
            </div>
          </div>

          <form id="form-enrolar-tecnico" onSubmit={registrarEnrolamiento}>
            <div className="campo" style={{ marginBottom: 18 }}>
              <label>Seleccionar Usuario Corporativo *</label>
              <select
                className="input-base"
                value={enrolarUsuarioId}
                onChange={(e) => setEnrolarUsuarioId(parseInt(e.target.value, 10))}
                style={{ backgroundColor: "white" }}
                required
              >
                <option value={0}>— Seleccione un usuario registrado —</option>
                {usuariosDisponibles.map((u) => (
                  <option key={u.id_usuario} value={u.id_usuario}>
                    {u.nombres} {u.apellido_paterno} {u.apellido_materno || ""} ({u.correo_electronico})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                El usuario debe existir previamente en el módulo de Identidades y Accesos.
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              <div className="campo">
                <label>Departamento de Adscripción *</label>
                <select
                  className="input-base"
                  value={enrolarDepto}
                  onChange={(e) => setEnrolarDepto(parseInt(e.target.value, 10))}
                  style={{ backgroundColor: "white" }}
                  required
                >
                  {departamentos.map((d) => (
                    <option key={d.id_departamento} value={d.id_departamento}>
                      {d.nombre} ({d.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label>Nivel de Soporte Inicial *</label>
                <select
                  className="input-base"
                  value={enrolarNivel}
                  onChange={(e) => setEnrolarNivel(parseInt(e.target.value, 10) as 1 | 2 | 3)}
                  style={{ backgroundColor: "white" }}
                  required
                >
                  <option value={1}>Nivel 1 (Mesa de Ayuda / Triaje / FCR)</option>
                  <option value={2}>Nivel 2 (Soporte Técnico en Sitio / Campo)</option>
                  <option value={3}>Nivel 3 (Infraestructura / Especialista Senior)</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              <div className="campo">
                <label>Capacidad Máxima WIP (Tickets) *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="input-base"
                  value={enrolarCapacidad}
                  onChange={(e) => setEnrolarCapacidad(parseInt(e.target.value, 10) || 1)}
                  required
                />
              </div>

              <div className="campo">
                <label>Especialidad Principal o Rol Técnico</label>
                <input
                  type="text"
                  className="input-base"
                  value={enrolarEspecialidad}
                  onChange={(e) => setEnrolarEspecialidad(e.target.value)}
                  placeholder="Ej. Redes Cisco, Microinformática, Base de Datos..."
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
                {guardando ? "Enrolando..." : "Enrolar Técnico"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. VISTA PRINCIPAL: TABLA DE TÉCNICOS */}
      {vista === "tabla" && (
        <div>
          <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1>Gestión de Especialistas Técnicos (Capacidad y Carga WIP)</h1>
              <p>
                Gobierno de recursos resolutores (ITIL 4 / ISO 20000): nivelación de soporte (Tier 1/2/3), límites de saturación (WIP) y disponibilidad operativa.
              </p>
            </div>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
              onClick={abrirEnrolar}
            >
              + Enrolar Nuevo Técnico
            </button>
          </div>

          {/* Tarjetas de Indicadores */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Disponibles Hoy</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#16a34a", marginTop: 4 }}>{totalDisponibles}</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>de {tecnicos.length} técnicos</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Nivel 1 (Mesa)</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>{totalN1}</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>resolución en primer contacto</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Nivel 2 (Campo)</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#7c3aed", marginTop: 4 }}>{totalN2}</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>atención en sitio</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Nivel 3 (Senior)</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#ea580c", marginTop: 4 }}>{totalN3}</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>ingeniería de sistemas</div>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="barra-filtros" style={{ marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                className="input-base"
                placeholder="Buscar por especialista, correo, departamento o especialidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: "100%", fontSize: 13 }}
              />
            </div>

            <div>
              <select
                className="input-base"
                value={filtroDepto}
                onChange={(e) => setFiltroDepto(e.target.value)}
                style={{ fontSize: 13, backgroundColor: "white" }}
              >
                <option value="">Todos los Departamentos</option>
                {departamentos.map((d) => (
                  <option key={d.id_departamento} value={d.id_departamento}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="input-base"
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value)}
                style={{ fontSize: 13, backgroundColor: "white" }}
              >
                <option value="">Todos los Niveles</option>
                <option value="1">Nivel 1 (Mesa de Ayuda)</option>
                <option value="2">Nivel 2 (Soporte en Sitio)</option>
                <option value="3">Nivel 3 (Infraestructura / Especialista)</option>
              </select>
            </div>
          </div>

          {/* Tabla de Técnicos */}
          {cargando ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
              Cargando nómina de técnicos...
            </div>
          ) : tecnicosFiltrados.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
              No se encontraron técnicos registrados con los criterios especificados.
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Especialista Técnico</th>
                    <th>Departamento</th>
                    <th>Nivel de Soporte</th>
                    <th>Especialidad Principal</th>
                    <th>Disponibilidad</th>
                    <th style={{ textAlign: "center" }}>Capacidad WIP</th>
                    <th style={{ width: 140 }}>Carga Activa</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tecnicosFiltrados.map((tec) => {
                    const ratio = tec.capacidad_maxima_tickets > 0 ? tec.tickets_activos / tec.capacidad_maxima_tickets : 0;
                    const porcentaje = Math.min(100, Math.round(ratio * 100));
                    let colorBarra = "#16a34a";
                    if (ratio >= 0.85) colorBarra = "#dc2626";
                    else if (ratio >= 0.6) colorBarra = "#eab308";

                    return (
                      <tr key={tec.id_tecnico_detalle}>
                        <td>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{tec.nombre_completo}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{tec.correo_electronico}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: 13, color: "#334155" }}>{tec.departamento_nombre || "—"}</span>
                        </td>
                        <td>
                          <span style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor: tec.nivel_soporte === 1 ? "#dbeafe" : tec.nivel_soporte === 2 ? "#e0e7ff" : "#fef3c7",
                            color: tec.nivel_soporte === 1 ? "#1e40af" : tec.nivel_soporte === 2 ? "#3730a3" : "#92400e",
                          }}>
                            Nivel {tec.nivel_soporte}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12.5, color: "#475569" }}>
                            {tec.especialidad_principal || "Generalista"}
                          </span>
                        </td>
                        <td>
                          <span className={"badge " + (tec.estado_operativo === "DISPONIBLE" ? "badge-activo" : "badge-inactivo")}>
                            {tec.estado_operativo}
                          </span>
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 600, fontSize: 13 }}>
                          {tec.capacidad_maxima_tickets}
                        </td>
                        <td>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                            <span style={{ color: "#64748b" }}>
                              {tec.tickets_activos} / {tec.capacidad_maxima_tickets}
                            </span>
                            <strong style={{ color: colorBarra }}>{porcentaje}%</strong>
                          </div>
                          <div style={{ width: "100%", height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${porcentaje}%`,
                                height: "100%",
                                backgroundColor: colorBarra,
                                borderRadius: 3,
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="boton-accion-icono"
                            onClick={() => abrirEdicion(tec)}
                            title="Configurar técnico"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* SECCIÓN MÍNIMA: AUSENCIAS Y LICENCIAS OPERATIVAS (1.4.3) */}
          <div style={{ marginTop: 36, borderTop: "2px solid #e2e8f0", paddingTop: 24, paddingBottom: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Ausencias y Licencias Operativas
                </h2>
                <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                  Técnicos con ausencia vigente registrada en este catálogo son excluidos automáticamente de las reglas de asignación y enrutamiento con verificación de disponibilidad.
                </p>
              </div>
              {!formAusAbierto && (
                <button
                  type="button"
                  className="boton-primario"
                  style={{ width: "auto", padding: "7px 14px", fontSize: 13 }}
                  onClick={abrirNuevaAusencia}
                >
                  + Registrar ausencia
                </button>
              )}
            </div>

            {/* Formulario en tarjeta para Crear / Editar Ausencia */}
            {formAusAbierto && (
              <div style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                padding: "18px 20px",
                marginBottom: 20,
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: "0 0 14px 0" }}>
                  {ausenciaEditando ? "Editar Registro de Ausencia" : "Registrar Nueva Ausencia"}
                </h3>

                {errorAusencia && (
                  <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", border: "1px solid #fecaca", padding: "8px 12px", borderRadius: 6, fontSize: 12.5, marginBottom: 14 }}>
                    {errorAusencia}
                  </div>
                )}

                <form onSubmit={guardarAusencia}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div className="campo">
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Técnico Asignado *</label>
                      <select
                        className="input-base"
                        value={ausTecnicoId}
                        onChange={(e) => setAusTecnicoId(parseInt(e.target.value, 10))}
                        style={{ backgroundColor: "white", fontSize: 13 }}
                        required
                      >
                        <option value={0}>— Seleccionar Técnico —</option>
                        {tecnicos.map((t) => (
                          <option key={t.id_usuario} value={t.id_usuario}>
                            {t.nombre_completo} ({t.departamento_nombre || "TI"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="campo">
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Fecha y Hora Desde *</label>
                      <input
                        type="datetime-local"
                        className="input-base"
                        value={ausFechaDesde}
                        onChange={(e) => setAusFechaDesde(e.target.value)}
                        style={{ backgroundColor: "white", fontSize: 13 }}
                        required
                      />
                    </div>

                    <div className="campo">
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Fecha y Hora Hasta *</label>
                      <input
                        type="datetime-local"
                        className="input-base"
                        value={ausFechaHasta}
                        onChange={(e) => setAusFechaHasta(e.target.value)}
                        style={{ backgroundColor: "white", fontSize: 13 }}
                        required
                      />
                    </div>
                  </div>

                  <div className="campo" style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Motivo de la Ausencia *</label>
                    <input
                      type="text"
                      className="input-base"
                      placeholder="Ej. Vacaciones anuales, Licencia médica, Capacitación externa, Turno especial..."
                      value={ausMotivo}
                      onChange={(e) => setAusMotivo(e.target.value)}
                      style={{ backgroundColor: "white", fontSize: 13 }}
                      required
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button
                      type="button"
                      className="boton-secundario"
                      style={{ width: "auto", padding: "6px 14px", fontSize: 13 }}
                      onClick={cancelarFormAusencia}
                      disabled={guardandoAusencia}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="boton-primario"
                      style={{ width: "auto", padding: "6px 18px", fontSize: 13 }}
                      disabled={guardandoAusencia}
                    >
                      {guardandoAusencia ? "Guardando..." : ausenciaEditando ? "Actualizar Ausencia" : "Guardar Ausencia"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabla de ausencias */}
            {cargandoAusencias ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                Cargando ausencias...
              </div>
            ) : ausencias.length === 0 ? (
              <div style={{
                padding: "24px 16px",
                textAlign: "center",
                backgroundColor: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: 8,
                color: "#64748b",
                fontSize: 13,
              }}>
                No hay ausencias programadas registradas en el sistema. Todos los técnicos se consideran disponibles según su estado base.
              </div>
            ) : (
              <div className="contenedor-tabla">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Técnico</th>
                      <th>Desde</th>
                      <th>Hasta</th>
                      <th>Motivo</th>
                      <th>Estado de Cobertura</th>
                      <th style={{ textAlign: "right" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ausencias.map((a) => {
                      const ahora = new Date();
                      const d = new Date(a.fecha_desde);
                      const h = new Date(a.fecha_hasta);
                      const esVigente = ahora >= d && ahora <= h;
                      const esFutura = ahora < d;

                      return (
                        <tr key={a.id_ausencia}>
                          <td>
                            <strong style={{ color: "#0f172a" }}>{a.tecnico_nombre || `Técnico #${a.id_usuario_tecnico}`}</strong>
                          </td>
                          <td style={{ fontSize: 12.5, color: "#334155" }}>
                            {new Date(a.fecha_desde).toLocaleString()}
                          </td>
                          <td style={{ fontSize: 12.5, color: "#334155" }}>
                            {new Date(a.fecha_hasta).toLocaleString()}
                          </td>
                          <td style={{ fontSize: 13, color: "#475569" }}>{a.motivo}</td>
                          <td>
                            {esVigente ? (
                              <span style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 600,
                                backgroundColor: "#fee2e2",
                                color: "#991b1b",
                              }}>
                                Ausencia Activa
                              </span>
                            ) : esFutura ? (
                              <span style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 600,
                                backgroundColor: "#e0e7ff",
                                color: "#3730a3",
                              }}>
                                Programada
                              </span>
                            ) : (
                              <span style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 600,
                                backgroundColor: "#f1f5f9",
                                color: "#64748b",
                              }}>
                                Concluida
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: 6 }}>
                              <button
                                type="button"
                                className="boton-secundario"
                                style={{ width: "auto", padding: "4px 8px", fontSize: 12 }}
                                onClick={() => abrirEditarAusencia(a)}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                style={{
                                  background: "transparent",
                                  border: "1px solid #fecaca",
                                  borderRadius: 4,
                                  color: "#dc2626",
                                  padding: "4px 8px",
                                  fontSize: 12,
                                  cursor: "pointer",
                                }}
                                onClick={() => eliminarAusencia(a.id_ausencia)}
                              >
                                Eliminar
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
        </div>
      )}
    </div>
  );
}
