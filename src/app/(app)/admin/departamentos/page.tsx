"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DepartamentoTI, UsuarioConPerfiles } from "@/types";
import { validarCodigo, validarTexto, validarNumeroPositivo } from "@/lib/validaciones";
import { AlertaCampo } from "@/components/ui/AlertaCampo";

interface TecnicoDepto {
  id_tecnico_detalle: number;
  id_usuario: number;
  nombres: string;
  apellido_paterno: string;
  nombre_completo: string;
  correo_electronico: string;
  celular: string | null;
  nivel_soporte: 1 | 2 | 3;
  capacidad_maxima_tickets: number;
  estado_operativo: string;
  especialidad_principal: string | null;
  tickets_activos: number;
}

type ModoVista = "tabla" | "crear" | "editar" | "tecnicos";

export default function PaginaAdminDepartamentos() {
  const [departamentos, setDepartamentos] = useState<DepartamentoTI[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioConPerfiles[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modo de vista: sin modales flotantes
  const [vista, setVista] = useState<ModoVista>("tabla");

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activos" | "inactivos">("activos");

  // Estados de edición / detalle
  const [deptoEditando, setDeptoEditando] = useState<DepartamentoTI | null>(null);
  const [deptoVerTecnicos, setDeptoVerTecnicos] = useState<DepartamentoTI | null>(null);
  const [tecnicosDelDepto, setTecnicosDelDepto] = useState<TecnicoDepto[]>([]);
  const [tecnicoNuevoId, setTecnicoNuevoId] = useState("");
  const [cargandoTecnicos, setCargandoTecnicos] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Formulario Crear / Editar
  const [formCodigo, setFormCodigo] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formSupervisorId, setFormSupervisorId] = useState<string>("");
  const [formTiempoOlaHoras, setFormTiempoOlaHoras] = useState<number>(8);
  const [formTiempoOlaCriticoHrs, setFormTiempoOlaCriticoHrs] = useState<number>(2);
  const [formActivo, setFormActivo] = useState(true);

  async function cargarDatos() {
    setCargando(true);
    setError(null);
    try {
      const [resDeptos, resUsuarios] = await Promise.all([
        fetch("/api/departamentos-ti").then((r) => r.json()),
        fetch("/api/usuarios").then((r) => r.json()),
      ]);

      if (resDeptos.error) {
        setError(resDeptos.error);
        return;
      }

      setDepartamentos(resDeptos.departamentos || []);
      setUsuarios(resUsuarios.usuarios || []);
    } catch {
      setError("Error de conexión al cargar departamentos de TI");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function abrirCrear() {
    setFormCodigo("");
    setFormNombre("");
    setFormDescripcion("");
    setFormSupervisorId("");
    setFormTiempoOlaHoras(8);
    setFormTiempoOlaCriticoHrs(2);
    setFormActivo(true);
    setError(null);
    setMensajeExito(null);
    setVista("crear");
  }

  function abrirEditar(dep: DepartamentoTI) {
    setDeptoEditando(dep);
    setFormCodigo(dep.codigo);
    setFormNombre(dep.nombre);
    setFormDescripcion(dep.descripcion || "");
    setFormSupervisorId(dep.id_supervisor ? String(dep.id_supervisor) : "");
    setFormTiempoOlaHoras(dep.tiempo_ola_horas || 8);
    setFormTiempoOlaCriticoHrs(dep.tiempo_ola_critico_hrs || 2);
    setFormActivo(dep.estado_registro);
    setError(null);
    setMensajeExito(null);
    setVista("editar");
  }

  async function abrirVerTecnicos(dep: DepartamentoTI) {
    setDeptoVerTecnicos(dep);
    setCargandoTecnicos(true);
    setTecnicosDelDepto([]);
    setVista("tecnicos");
    try {
      const res = await fetch(`/api/departamentos-ti/${dep.id_departamento}`);
      const data = await res.json();
      if (res.ok) {
        setTecnicosDelDepto(data.tecnicos || []);
      }
    } catch {
      console.error("Error al obtener técnicos del departamento");
    } finally {
      setCargandoTecnicos(false);
    }
  }

  async function agregarTecnicoAlArea() {
    if (!deptoVerTecnicos || !tecnicoNuevoId) return;
    setError(null); setGuardando(true);
    try {
      const res=await fetch("/api/tecnicos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id_usuario:Number(tecnicoNuevoId),id_departamento:deptoVerTecnicos.id_departamento,nivel_soporte:1,capacidad_maxima_tickets:8,estado_operativo:"DISPONIBLE"})});
      const data=await res.json(); if(!res.ok){setError(data.error||"No se pudo añadir el técnico");return}
      setTecnicoNuevoId("");setMensajeExito("Técnico añadido al departamento.");await abrirVerTecnicos(deptoVerTecnicos);await cargarDatos();
    } catch {setError("Error al añadir el técnico.")} finally {setGuardando(false)}
  }

  async function retirarTecnico(t:TecnicoDepto) {
    if(!confirm(`¿Retirar a ${t.nombre_completo} de la plantilla activa? Se conservarán su usuario y los tickets históricos.`)) return;
    const res=await fetch(`/api/tecnicos/${t.id_usuario}`,{method:"DELETE"});const data=await res.json();if(!res.ok){setError(data.error||"No se pudo retirar");return}if(deptoVerTecnicos)await abrirVerTecnicos(deptoVerTecnicos);
  }

  async function guardarNuevo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    const vCod = validarCodigo(formCodigo, 2, 20, "El código del departamento");
    if (!vCod.valido) { setError(vCod.mensaje!); return; }

    const vNom = validarTexto(formNombre, 3, 100, "El nombre del departamento", true);
    if (!vNom.valido) { setError(vNom.mensaje!); return; }

    if (formDescripcion) {
      const vDesc = validarTexto(formDescripcion, 3, 500, "La descripción", false);
      if (!vDesc.valido) { setError(vDesc.mensaje!); return; }
    }

    const vOla = validarNumeroPositivo(formTiempoOlaHoras, "El tiempo OLA", 1, 720);
    if (!vOla.valido) { setError(vOla.mensaje!); return; }

    const vOlaCrit = validarNumeroPositivo(formTiempoOlaCriticoHrs, "El tiempo OLA crítico", 1, 720);
    if (!vOlaCrit.valido) { setError(vOlaCrit.mensaje!); return; }

    setGuardando(true);

    try {
      const res = await fetch("/api/departamentos-ti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: formCodigo.trim().toUpperCase(),
          nombre: formNombre.trim(),
          descripcion: formDescripcion.trim() || null,
          id_supervisor: formSupervisorId ? parseInt(formSupervisorId, 10) : null,
          tiempo_ola_horas: formTiempoOlaHoras,
          tiempo_ola_critico_hrs: formTiempoOlaCriticoHrs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar el departamento");
        return;
      }

      setMensajeExito(`Departamento [${data.departamento.codigo}] registrado con éxito.`);
      setVista("tabla");
      await cargarDatos();
    } catch {
      setError("Error de conexión al crear el departamento");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarEdicion(e: React.FormEvent) {
    e.preventDefault();
    if (!deptoEditando) return;

    setError(null);
    setMensajeExito(null);

    const vCod = validarCodigo(formCodigo, 2, 20, "El código del departamento");
    if (!vCod.valido) { setError(vCod.mensaje!); return; }

    const vNom = validarTexto(formNombre, 3, 100, "El nombre del departamento", true);
    if (!vNom.valido) { setError(vNom.mensaje!); return; }

    if (formDescripcion) {
      const vDesc = validarTexto(formDescripcion, 3, 500, "La descripción", false);
      if (!vDesc.valido) { setError(vDesc.mensaje!); return; }
    }

    const vOla = validarNumeroPositivo(formTiempoOlaHoras, "El tiempo OLA", 1, 720);
    if (!vOla.valido) { setError(vOla.mensaje!); return; }

    const vOlaCrit = validarNumeroPositivo(formTiempoOlaCriticoHrs, "El tiempo OLA crítico", 1, 720);
    if (!vOlaCrit.valido) { setError(vOlaCrit.mensaje!); return; }

    setGuardando(true);

    try {
      const res = await fetch(`/api/departamentos-ti/${deptoEditando.id_departamento}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: formCodigo.trim().toUpperCase(),
          nombre: formNombre.trim(),
          descripcion: formDescripcion.trim() || null,
          id_supervisor: formSupervisorId ? parseInt(formSupervisorId, 10) : null,
          tiempo_ola_horas: formTiempoOlaHoras,
          tiempo_ola_critico_hrs: formTiempoOlaCriticoHrs,
          estado_registro: formActivo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo actualizar el departamento");
        return;
      }

      setMensajeExito(`Departamento [${data.departamento.codigo}] actualizado exitosamente.`);
      setVista("tabla");
      setDeptoEditando(null);
      await cargarDatos();
    } catch {
      setError("Error de conexión al actualizar");
    } finally {
      setGuardando(false);
    }
  }

  // Filtrado de departamentos
  const deptosFiltrados = departamentos.filter((d) => {
    if (filtroEstado === "activos" && !d.estado_registro) return false;
    if (filtroEstado === "inactivos" && d.estado_registro) return false;
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase();
      const coincideCodigo = d.codigo.toLowerCase().includes(b);
      const coincideNombre = d.nombre.toLowerCase().includes(b);
      const coincideDesc = (d.descripcion || "").toLowerCase().includes(b);
      const coincideSupervisor = (d.supervisor_nombre || "").toLowerCase().includes(b);
      if (!coincideCodigo && !coincideNombre && !coincideDesc && !coincideSupervisor) return false;
    }
    return true;
  });

  const totalDeptos = departamentos.length;
  const activosDeptos = departamentos.filter((d) => d.estado_registro).length;
  const conSupervisor = departamentos.filter((d) => d.id_supervisor != null).length;
  const totalTecnicosDesplegados = departamentos.reduce((acc, d) => acc + (Number(d.cantidad_tecnicos) || 0), 0);

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

      {/* 1. VISTA DEDICADA: CREAR O EDITAR DEPARTAMENTO (REEMPLAZA LA TABLA COMPLETAMENTE) */}
      {(vista === "crear" || vista === "editar") && (
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
                  setDeptoEditando(null);
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
                Volver a Departamentos de TI
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                {vista === "crear"
                  ? "Registrar Nuevo Departamento de TI"
                  : `Editar Departamento [${deptoEditando?.codigo}]: ${deptoEditando?.nombre}`}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Configure los parámetros operativos, acuerdos OLA y la supervisión responsable del área técnica.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setDeptoEditando(null);
                }}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="form-departamento"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : vista === "crear" ? "Registrar Departamento" : "Guardar Cambios"}
              </button>
            </div>
          </div>

          <form id="form-departamento" onSubmit={vista === "crear" ? guardarNuevo : guardarEdicion}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              <div className="campo">
                <label>Código Mnemotécnico Corporativo *</label>
                <input
                  type="text"
                  className="input-base"
                  maxLength={20}
                  style={{ fontFamily: "monospace", textTransform: "uppercase" }}
                  placeholder="Ej: DEP-CLOUD, DEP-DBA, DEP-DEVOPS"
                  value={formCodigo}
                  onChange={(e) => setFormCodigo(e.target.value.toUpperCase())}
                  required
                  autoFocus
                />
                {formCodigo.length > 0 && (() => {
                  const v = validarCodigo(formCodigo, 2, 20, "El código");
                  return v.valido ? <AlertaCampo exito="Código válido." /> : <AlertaCampo error={v.mensaje} />;
                })()}
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Identificador corporativo único para ruteo inteligente de tickets.
                </span>
              </div>

              <div className="campo">
                <label>Nombre del Departamento *</label>
                <input
                  type="text"
                  className="input-base"
                  maxLength={100}
                  placeholder="Ej: Infraestructura Cloud y DevOps"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                />
                {formNombre.length > 0 && (() => {
                  const v = validarTexto(formNombre, 2, 100, "El nombre", true);
                  return v.valido ? <AlertaCampo exito="Nombre válido." /> : <AlertaCampo error={v.mensaje} />;
                })()}
              </div>
            </div>

            <div className="campo" style={{ marginBottom: 18 }}>
              <label>Descripción de Alcance y Responsabilidades (Acuerdo OLA)</label>
              <textarea
                className="input-base"
                rows={3}
                placeholder="Describe las funciones principales de soporte, entregables y tipos de requerimiento que atiende el área técnica..."
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
              <div className="campo">
                <label>Acuerdo OLA Estándar (horas máximas de resolución) *</label>
                <input
                  type="number"
                  min={1}
                  max={720}
                  className="input-base"
                  value={formTiempoOlaHoras}
                  onChange={(e) => setFormTiempoOlaHoras(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Tiempo límite interno de atención para requerimientos ordinarios.
                </span>
              </div>

              <div className="campo">
                <label>Acuerdo OLA Crítico P1/P2 (horas máximas) *</label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  className="input-base"
                  value={formTiempoOlaCriticoHrs}
                  onChange={(e) => setFormTiempoOlaCriticoHrs(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  required
                />
                <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, display: "block" }}>
                  Tiempo de respuesta inmediata ante incidentes mayores y contingencias.
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24, alignItems: "center" }}>
              <div className="campo">
                <label>Supervisor / Jefe de Área Responsable</label>
                <select
                  className="input-base"
                  value={formSupervisorId}
                  onChange={(e) => setFormSupervisorId(e.target.value)}
                  style={{ backgroundColor: "white" }}
                >
                  <option value="">— Sin supervisor asignado (pendiente) —</option>
                  {usuarios.map((u) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombres} {u.apellido_paterno} ({u.correo_electronico})
                    </option>
                  ))}
                </select>
              </div>

              {vista === "editar" && (
                <div className="campo" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 12 }}>
                    <input
                      type="checkbox"
                      checked={formActivo}
                      onChange={(e) => setFormActivo(e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>
                      Departamento Operativo Activo
                    </span>
                  </label>
                  <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
                    Si se desactiva, los tickets nuevos no podrán ser canalizados a esta área.
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => {
                  setVista("tabla");
                  setDeptoEditando(null);
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
                {guardando ? "Guardando..." : vista === "crear" ? "Registrar Departamento" : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. VISTA DEDICADA: PLANTILLA DE TÉCNICOS DEL DEPARTAMENTO */}
      {vista === "tecnicos" && deptoVerTecnicos && (
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
                  setDeptoVerTecnicos(null);
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
                Volver a Departamentos de TI
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Especialistas Asignados: [{deptoVerTecnicos.codigo}] {deptoVerTecnicos.nombre}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Plantilla técnica, nivel de soporte (L1/L2/L3), carga de trabajo (WIP) y estado de disponibilidad.
              </p>
            </div>
            <Link
              href="/admin/tecnicos"
              className="boton-primario"
              style={{ width: "auto", padding: "8px 16px", fontSize: 13, textDecoration: "none" }}
            >
              Gestionar Especialistas
            </Link>
          </div>

          {cargandoTecnicos ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
              Cargando nómina de técnicos...
            </div>
          ) : tecnicosDelDepto.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
              <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
                No hay técnicos enrolados actualmente en este departamento.
              </p>
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Técnico Especialista</th>
                    <th>Nivel de Soporte</th>
                    <th>Especialidad</th>
                    <th style={{ textAlign: "center" }}>Capacidad WIP</th>
                    <th style={{ textAlign: "center" }}>Tickets Activos</th>
                    <th>Estado Operativo</th>
                    <th>Contacto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tecnicosDelDepto.map((t) => (
                    <tr key={t.id_tecnico_detalle}>
                      <td>
                        <strong>{t.nombre_completo}</strong>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{t.correo_electronico}</div>
                      </td>
                      <td>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: t.nivel_soporte === 1 ? "#dbeafe" : t.nivel_soporte === 2 ? "#e0e7ff" : "#fef3c7",
                          color: t.nivel_soporte === 1 ? "#1e40af" : t.nivel_soporte === 2 ? "#3730a3" : "#92400e",
                        }}>
                          Nivel {t.nivel_soporte} ({t.nivel_soporte === 1 ? "Mesa / Triage" : t.nivel_soporte === 2 ? "Especialista" : "Ingeniería"})
                        </span>
                      </td>
                      <td style={{ color: "#475569" }}>{t.especialidad_principal || "General"}</td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>{t.capacidad_maxima_tickets}</td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          fontWeight: 700,
                          color: t.tickets_activos >= t.capacidad_maxima_tickets ? "#dc2626" : "#16a34a",
                        }}>
                          {t.tickets_activos}
                        </span>
                      </td>
                      <td>
                        <span className={"badge " + (t.estado_operativo === "DISPONIBLE" ? "badge-activo" : "badge-inactivo")}>
                          {t.estado_operativo}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>{t.celular || "—"}</td>
                      <td><button type="button" className="boton-secundario" onClick={()=>retirarTecnico(t)}>Retirar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="tarjeta-formulario" style={{display:"flex",gap:10,alignItems:"end",flexWrap:"wrap",marginTop:16}}>
            <label style={{minWidth:300}}>Añadir usuario a este equipo TI<select className="input-base" value={tecnicoNuevoId} onChange={e=>setTecnicoNuevoId(e.target.value)}><option value="">Seleccionar usuario</option>{usuarios.filter(u=>!tecnicosDelDepto.some(t=>t.id_usuario===u.id_usuario)&&u.estado_registro).map(u=><option key={u.id_usuario} value={u.id_usuario}>{u.nombres} {u.apellido_paterno} · {u.correo_electronico}</option>)}</select></label>
            <button type="button" className="boton-primario" onClick={agregarTecnicoAlArea} disabled={!tecnicoNuevoId||guardando}>Añadir técnico L1</button>
            {error&&<p role="alert" className="mensaje-error">{error}</p>}
          </div>
        </div>
      )}

      {/* 3. VISTA PRINCIPAL: TABLA DE DEPARTAMENTOS */}
      {vista === "tabla" && (
        <div>
          {/* Cabecera Principal */}
          <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1>Departamentos y Grupos de Soporte de TI</h1>
              <p>
                Estructura organizacional y áreas resolutoras de TI (ITIL 4 / COBIT 2019): unidades operativas, jefaturas responsables y acuerdos de nivel operativo (OLA).
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Link href="/admin/tecnicos" className="boton-secundario" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", padding: "8px 14px", fontSize: 13 }}>
                Ver plantilla de técnicos
              </Link>
              <button type="button" className="boton-primario" onClick={abrirCrear} style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}>
                Nuevo Departamento
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
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Total Departamentos</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>{totalDeptos}</div>
              <div style={{ fontSize: 11.5, color: "#16a34a", marginTop: 2 }}>{activosDeptos} activos</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Con Jefatura Asignada</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>{conSupervisor}</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>de {totalDeptos} áreas</div>
            </div>

            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Técnicos Desplegados</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#16a34a", marginTop: 4 }}>{totalTecnicosDesplegados}</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>capacidad operativa</div>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="barra-filtros" style={{ marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <input
                type="text"
                className="input-base"
                placeholder="Buscar por código, nombre, supervisor o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: "100%", fontSize: 13 }}
              />
            </div>
            <div>
              <select
                className="input-base"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as any)}
                style={{ fontSize: 13, backgroundColor: "white" }}
              >
                <option value="todos">Todos los Estados</option>
                <option value="activos">Departamentos Activos</option>
                <option value="inactivos">Departamentos Inactivos</option>
              </select>
            </div>
          </div>

          {/* Tabla de Departamentos */}
          {cargando ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
              Cargando departamentos de TI...
            </div>
          ) : deptosFiltrados.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
              No se encontraron departamentos con los criterios especificados.
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Departamento</th>
                    <th>Jefatura / Supervisor</th>
                    <th style={{ textAlign: "center" }}>Técnicos</th>
                    <th>Acuerdos OLA</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {deptosFiltrados.map((d) => (
                    <tr key={d.id_departamento}>
                      <td>
                        <strong style={{ fontFamily: "monospace", color: "#2563eb" }}>{d.codigo}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{d.nombre}</div>
                        <div style={{ fontSize: 12, color: "#64748b", maxWidth: 320 }}>{d.descripcion || "—"}</div>
                      </td>
                      <td>
                        {d.supervisor_nombre ? (
                          <div>
                            <div style={{ fontWeight: 500 }}>{d.supervisor_nombre}</div>
                            <div style={{ fontSize: 11.5, color: "#64748b" }}>{d.supervisor_correo}</div>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>Sin supervisor</span>
                        )}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => abrirVerTecnicos(d)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#2563eb",
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          title="Ver nómina de técnicos"
                        >
                          {d.cantidad_tecnicos || 0}
                        </button>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, color: "#334155" }}>
                          Estándar: <strong>{d.tiempo_ola_horas || 8}h</strong>
                        </div>
                        <div style={{ fontSize: 11.5, color: "#dc2626" }}>
                          Crítico: <strong>{d.tiempo_ola_critico_hrs || 2}h</strong>
                        </div>
                      </td>
                      <td>
                        <span className={"badge " + (d.estado_registro ? "badge-activo" : "badge-inactivo")}>
                          {d.estado_registro ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            type="button"
                            className="boton-accion-icono"
                            title="Editar departamento"
                            onClick={() => abrirEditar(d)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="boton-accion-icono"
                            title="Ver técnicos del área"
                            onClick={() => abrirVerTecnicos(d)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
      )}
    </div>
  );
}
