"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { OpcionMenuAdmin, Perfil } from "@/types";

interface FormularioOpcionMenu {
  id_opcion_menu: number | null;
  nombre: string;
  url_menu: string;
  descripcion: string;
  id_padre: number | null;
  orden: number;
  perfiles_ids: number[];
}

const FORMULARIO_VACIO: FormularioOpcionMenu = {
  id_opcion_menu: null,
  nombre: "",
  url_menu: "",
  descripcion: "",
  id_padre: null,
  orden: 1,
  perfiles_ids: [],
};

export default function PaginaOpcionesMenu() {
  const router = useRouter();
  const [opciones, setOpciones] = useState<OpcionMenuAdmin[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState<FormularioOpcionMenu>(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [respMenu, respPerfiles] = await Promise.all([
        fetch("/api/menu/admin").then((r) => r.json()),
        fetch("/api/identidades/perfiles").then((r) => r.json()),
      ]);

      setOpciones(respMenu.opciones ?? []);
      setPerfiles(respPerfiles.perfiles ?? []);
    } catch {
      setError("Error al cargar datos desde el servidor");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function mostrarNotificacion(msj: string) {
    setMensajeExito(msj);
    setTimeout(() => setMensajeExito(null), 4000);
  }

  function abrirFormularioNuevo() {
    setFormulario(FORMULARIO_VACIO);
    setError(null);
    setMostrarFormulario(true);
  }

  function abrirFormularioEditar(op: OpcionMenuAdmin) {
    setFormulario({
      id_opcion_menu: op.id_opcion_menu,
      nombre: op.nombre,
      url_menu: op.url_menu,
      descripcion: op.descripcion ?? "",
      id_padre: op.id_padre,
      orden: op.orden,
      perfiles_ids: op.perfiles_ids ?? [],
    });
    setError(null);
    setMostrarFormulario(true);
  }

  function alternarPerfilEnFormulario(idPerfil: number) {
    setFormulario((prev) => {
      const existe = prev.perfiles_ids.includes(idPerfil);
      return {
        ...prev,
        perfiles_ids: existe
          ? prev.perfiles_ids.filter((id) => id !== idPerfil)
          : [...prev.perfiles_ids, idPerfil],
      };
    });
  }

  async function manejarEnvioFormulario(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    const esEdicion = formulario.id_opcion_menu !== null;
    const url = esEdicion ? `/api/menu/admin/${formulario.id_opcion_menu}` : "/api/menu/admin";
    const metodo = esEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario),
      });
      const datos = await res.json();

      if (!res.ok) {
        setError(datos.error ?? "No se pudo guardar la opción de menú");
        return;
      }

      mostrarNotificacion(esEdicion ? "Opción de menú actualizada con éxito" : "Opción de menú creada con éxito");
      setMostrarFormulario(false);
      await cargarDatos();
      router.refresh();
    } catch {
      setError("Error de conexión al guardar la opción");
    } finally {
      setGuardando(false);
    }
  }

  async function alternarEstado(op: OpcionMenuAdmin) {
    const accion = op.estado_registro ? "desactivar" : "activar";
    if (!confirm(`¿Seguro que deseas ${accion} la opción "${op.nombre}"?`)) return;

    try {
      const res = await fetch(`/api/menu/admin/${op.id_opcion_menu}`, { method: "DELETE" });
      const datos = await res.json();

      if (!res.ok) {
        alert(datos.error ?? "No se pudo cambiar el estado de la opción");
        return;
      }

      mostrarNotificacion(`Opción ${accion === "activar" ? "activada" : "desactivada"} correctamente`);
      await cargarDatos();
      router.refresh();
    } catch {
      alert("Error de conexión al cambiar estado");
    }
  }

  // Candidatos válidos para ser padre:
  // - Opciones que no superen el límite de niveles y no sea la misma opción que estamos editando
  const padresDisponibles = opciones.filter(
    (o) => o.nivel < 5 && o.id_opcion_menu !== formulario.id_opcion_menu
  );

  return (
    <div className="vista-contenedor">
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

      {mostrarFormulario ? (
        /* VISTA DEDICADA: FORMULARIO A PANTALLA COMPLETA */
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
              borderBottom: "1px solid #e2e8f0"
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
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
                  padding: 0
                }}
              >
                Volver a la estructura del menú
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                {formulario.id_opcion_menu === null
                  ? "Crear Nueva Opción de Menú"
                  : `Editando Opción: "${formulario.nombre}"`}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                Configure la jerarquía (hasta 3 niveles), ruta URL y visibilidad para cada perfil del sistema.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="formulario-opcion-menu"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : formulario.id_opcion_menu === null ? "Crear Opción" : "Guardar Cambios"}
              </button>
            </div>
          </div>

          <form id="formulario-opcion-menu" onSubmit={manejarEnvioFormulario}>
            {error && <div className="mensaje-error">{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Nombre de la opción *</label>
                <input
                  className="input-base"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  placeholder="Ej. Auditoría, Mantenimiento"
                  required
                  autoFocus
                />
              </div>

              <div className="campo">
                <label>Ruta URL de navegación</label>
                <input
                  className="input-base"
                  value={formulario.url_menu}
                  onChange={(e) => setFormulario({ ...formulario, url_menu: e.target.value })}
                  placeholder="Ej. /admin/auditoria (vacío = carpeta)"
                />
                <small style={{ color: "#64748b", fontSize: 11 }}>
                  Déjala vacía si es una carpeta que solo agrupa subopciones: no navega.
                </small>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="campo">
                <label>Opción padre (Jerarquía)</label>
                <select
                  className="input-base"
                  value={formulario.id_padre ?? ""}
                  onChange={(e) => setFormulario({
                    ...formulario,
                    id_padre: e.target.value ? Number(e.target.value) : null
                  })}
                  style={{
                    width: "100%",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">— Ninguna (Nivel 1 - Raíz) —</option>
                  {padresDisponibles.map((p) => (
                    <option key={p.id_opcion_menu} value={p.id_opcion_menu}>
                      {p.nombre} (Nivel {p.nivel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label>Orden visual numérico *</label>
                <input
                  className="input-base"
                  type="number"
                  min="1"
                  max="99"
                  value={formulario.orden}
                  onChange={(e) => setFormulario({ ...formulario, orden: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="campo" style={{ marginBottom: 20 }}>
              <label>Descripción funcional</label>
              <input
                className="input-base"
                value={formulario.descripcion}
                onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                placeholder="Descripción breve del módulo, catálogo o pantalla"
              />
            </div>

            <div className="campo" style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", marginBottom: 8, display: "block" }}>
                Perfiles con acceso a esta opción ({formulario.perfiles_ids.length} seleccionados)
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 10,
                  padding: 16,
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                }}
              >
                {perfiles.map((p) => {
                  const seleccionado = formulario.perfiles_ids.includes(p.id_perfil);
                  return (
                    <label
                      key={p.id_perfil}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        cursor: "pointer",
                        padding: "6px 8px",
                        borderRadius: 6,
                        backgroundColor: seleccionado ? "#eff6ff" : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => alternarPerfilEnFormulario(p.id_perfil)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontWeight: seleccionado ? 600 : 400, color: seleccionado ? "#1d4ed8" : "#374151" }}>
                        {p.nombre}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 24px", fontSize: 13 }}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : formulario.id_opcion_menu === null ? "Crear Opción" : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* VISTA DE TABLA PRINCIPAL DE OPCIONES DE MENÚ */
        <div>
          <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <h1>Estructura del Menú Lateral</h1>
              <p>
                Jerarquía del menú del sistema (hasta 3 niveles de profundidad) y asignación de permisos por perfil.
              </p>
            </div>
            <button className="boton-primario" style={{ width: "auto", padding: "8px 18px", fontSize: 13 }} onClick={abrirFormularioNuevo}>
              Nueva opción
            </button>
          </div>

          {cargando ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#6b7280" }}>
              Cargando opciones de menú...
            </div>
          ) : opciones.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#6b7280" }}>
              No hay opciones de menú configuradas.
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Ruta URL</th>
                    <th>Opción Padre</th>
                    <th style={{ textAlign: "center" }}>Nivel</th>
                    <th style={{ textAlign: "center" }}>Orden</th>
                    <th>Perfiles Autorizados</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {opciones.map((o) => (
                    <tr key={o.id_opcion_menu}>
                      <td>
                        <strong>{o.nombre}</strong>
                      </td>
                      <td>
                        {o.url_menu ? (
                          <code style={{ fontSize: 12, backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: 4, color: "#0f172a" }}>
                            {o.url_menu}
                          </code>
                        ) : (
                          <span style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>carpeta</span>
                        )}
                      </td>
                      <td style={{ color: "#64748b" }}>{o.nombre_padre || "—"}</td>
                      <td style={{ textAlign: "center" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: o.nivel === 1 ? "#dbeafe" : o.nivel === 2 ? "#e0e7ff" : "#fef3c7",
                          color: o.nivel === 1 ? "#1e40af" : o.nivel === 2 ? "#3730a3" : "#92400e"
                        }}>
                          Nivel {o.nivel}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", fontWeight: 600 }}>{o.orden}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 280 }}>
                          {o.perfiles_ids.length === 0 ? (
                            <span style={{ fontSize: 12, color: "#9ca3af" }}>Ninguno</span>
                          ) : (
                            o.perfiles_ids.map((idPerfil) => {
                              const p = perfiles.find((perf) => perf.id_perfil === idPerfil);
                              return (
                                <span key={idPerfil} className="chip-perfil">
                                  {p ? p.nombre : `Perfil ${idPerfil}`}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={"badge " + (o.estado_registro ? "badge-activo" : "badge-inactivo")}>
                          {o.estado_registro ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            type="button"
                            className="boton-accion-icono"
                            onClick={() => abrirFormularioEditar(o)}
                            title="Editar opción de menú"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className={"boton-accion-icono " + (o.estado_registro ? "boton-accion-peligro" : "")}
                            onClick={() => alternarEstado(o)}
                            title={o.estado_registro ? "Desactivar opción de menú" : "Activar opción de menú"}
                          >
                            {o.estado_registro ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
