"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PerfilConOpciones, OpcionMenuAdmin } from "@/types";

interface FormularioPerfil {
  id_perfil: number | null;
  nombre: string;
  descripcion: string;
  opciones_ids: number[];
}

const FORMULARIO_VACIO: FormularioPerfil = {
  id_perfil: null,
  nombre: "",
  descripcion: "",
  opciones_ids: [],
};

export default function PaginaPerfiles({ soloLectura = false }: { soloLectura?: boolean }) {
  const router = useRouter();
  const [perfiles, setPerfiles] = useState<PerfilConOpciones[]>([]);
  const [opcionesMenu, setOpcionesMenu] = useState<OpcionMenuAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState<FormularioPerfil>(FORMULARIO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [respPerfiles, respMenu] = await Promise.all([
        fetch("/api/identidades/perfiles?todos=true").then((r) => r.json()),
        fetch("/api/menu/admin").then((r) => r.json()),
      ]);

      setPerfiles(respPerfiles.perfiles ?? []);
      setOpcionesMenu(respMenu.opciones ?? []);
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
    if (soloLectura) return;
    setFormulario(FORMULARIO_VACIO);
    setError(null);
    setMostrarFormulario(true);
  }

  function abrirFormularioEditar(perfil: PerfilConOpciones) {
    setFormulario({
      id_perfil: perfil.id_perfil,
      nombre: perfil.nombre,
      descripcion: perfil.descripcion ?? "",
      opciones_ids: perfil.opciones_ids ?? [],
    });
    setError(null);
    setMostrarFormulario(true);
  }

  // Obtiene los IDs de todos los ancestros hacia arriba en la jerarquía
  function obtenerAncestros(idOpcion: number, opciones: OpcionMenuAdmin[]): number[] {
    const ancestros: number[] = [];
    let actual = opciones.find((o) => o.id_opcion_menu === idOpcion);
    while (actual && actual.id_padre !== null) {
      ancestros.push(actual.id_padre);
      actual = opciones.find((o) => o.id_opcion_menu === actual!.id_padre);
    }
    return ancestros;
  }

  // Obtiene los IDs de todos los descendientes hacia abajo en la jerarquía
  function obtenerDescendientes(idOpcion: number, opciones: OpcionMenuAdmin[]): number[] {
    const descendientes: number[] = [];
    function buscarHijos(padreId: number) {
      const hijos = opciones.filter((o) => o.id_padre === padreId);
      hijos.forEach((h) => {
        descendientes.push(h.id_opcion_menu);
        buscarHijos(h.id_opcion_menu);
      });
    }
    buscarHijos(idOpcion);
    return descendientes;
  }

  interface NodoPermisoTree extends OpcionMenuAdmin {
    hijos: NodoPermisoTree[];
  }

  function construirArbolPermisos(opciones: OpcionMenuAdmin[]): NodoPermisoTree[] {
    const mapa = new Map<number, NodoPermisoTree>();
    opciones.forEach((op) => mapa.set(op.id_opcion_menu, { ...op, hijos: [] }));
    const raiz: NodoPermisoTree[] = [];
    opciones.forEach((op) => {
      const nodo = mapa.get(op.id_opcion_menu)!;
      if (op.id_padre === null) {
        raiz.push(nodo);
      } else {
        const padre = mapa.get(op.id_padre);
        if (padre) padre.hijos.push(nodo);
        else raiz.push(nodo);
      }
    });
    return raiz;
  }

  function alternarOpcionEnFormulario(idOpcion: number) {
    setFormulario((prev) => {
      const yaMarcado = prev.opciones_ids.includes(idOpcion);
      const descendientes = obtenerDescendientes(idOpcion, opcionesMenu);
      const ancestros = obtenerAncestros(idOpcion, opcionesMenu);

      let nuevosIds: number[];

      if (yaMarcado) {
        // Al desmarcar: quitamos la opción y todos sus descendientes
        const idsAQuitar = new Set([idOpcion, ...descendientes]);
        nuevosIds = prev.opciones_ids.filter((id) => !idsAQuitar.has(id));

        // Limpieza de carpetas vacías: si un ancestro quedó sin NINGÚN descendiente seleccionado, se desmarca automáticamente
        ancestros.forEach((ancestroId) => {
          const descDeAncestro = obtenerDescendientes(ancestroId, opcionesMenu);
          const tieneDescendientesActivos = descDeAncestro.some((dId) => nuevosIds.includes(dId));
          if (!tieneDescendientesActivos) {
            nuevosIds = nuevosIds.filter((id) => id !== ancestroId);
          }
        });
      } else {
        // Al marcar: agregamos la opción, todos sus descendientes (si es un módulo/categoría) y sus ancestros (para que la ruta exista)
        const idsAAgregar = [idOpcion, ...descendientes, ...ancestros];
        nuevosIds = Array.from(new Set([...prev.opciones_ids, ...idsAAgregar]));
      }

      return {
        ...prev,
        opciones_ids: nuevosIds,
      };
    });
  }

  function marcarTodasOpciones() {
    setFormulario((prev) => ({
      ...prev,
      opciones_ids: opcionesMenu.map((o) => o.id_opcion_menu),
    }));
  }

  function desmarcarTodasOpciones() {
    setFormulario((prev) => ({
      ...prev,
      opciones_ids: [],
    }));
  }

  function renderizarNodo(nodo: NodoPermisoTree) {
    const marcado = formulario.opciones_ids.includes(nodo.id_opcion_menu);
    const tieneHijos = nodo.hijos.length > 0;
    const esNivel1 = nodo.id_padre === null;

    return (
      <div key={nodo.id_opcion_menu} style={{ marginLeft: esNivel1 ? 0 : 20, marginTop: 4 }}>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontWeight: esNivel1 ? 700 : tieneHijos ? 600 : 400,
            color: esNivel1 ? "#0f172a" : "#334155",
            fontSize: esNivel1 ? 14 : 13,
          }}
        >
          <input
            type="checkbox"
            checked={marcado}
            onChange={() => alternarOpcionEnFormulario(nodo.id_opcion_menu)}
            disabled={soloLectura}
            style={{ accentColor: "#2563eb", cursor: soloLectura ? "default" : "pointer", width: 16, height: 16 }}
          />
          <span>{nodo.nombre}</span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>({nodo.url_menu || "carpeta"})</span>
        </label>
        {tieneHijos && (
          <div style={{ marginLeft: 8, paddingLeft: 12, borderLeft: "1px solid #e2e8f0" }}>
            {nodo.hijos.map((hijo) => renderizarNodo(hijo))}
          </div>
        )}
      </div>
    );
  }

  async function manejarEnvioFormulario(e: FormEvent) {
    e.preventDefault();
    if (soloLectura) return;
    setError(null);
    setGuardando(true);

    const esEdicion = formulario.id_perfil !== null;
    const url = esEdicion ? `/api/identidades/perfiles/${formulario.id_perfil}` : "/api/identidades/perfiles";
    const metodo = esEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario),
      });
      const datos = await res.json();

      if (!res.ok) {
        setError(datos.error ?? "No se pudo guardar el perfil");
        return;
      }

      mostrarNotificacion(esEdicion ? "Perfil actualizado con éxito" : "Perfil creado con éxito");
      setMostrarFormulario(false);
      await cargarDatos();
      router.refresh();
    } catch {
      setError("Error de conexión al guardar el perfil");
    } finally {
      setGuardando(false);
    }
  }

  async function alternarEstado(perfil: PerfilConOpciones) {
    if (soloLectura) return;
    const accion = perfil.estado_registro ? "desactivar" : "activar";
    if (!confirm(`¿Seguro que deseas ${accion} el perfil "${perfil.nombre}"?`)) return;

    try {
      const res = await fetch(`/api/identidades/perfiles/${perfil.id_perfil}`, { method: "DELETE" });
      const datos = await res.json();

      if (!res.ok) {
        alert(datos.error ?? "No se pudo cambiar el estado del perfil");
        return;
      }

      mostrarNotificacion(`Perfil ${accion === "activar" ? "activado" : "desactivado"} correctamente`);
      await cargarDatos();
      router.refresh();
    } catch {
      alert("Error de conexión al cambiar estado");
    }
  }

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

      {soloLectura && (
        <div style={{
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          color: "#1e40af",
          padding: "10px 14px",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 500,
        }}>
          Modo auditoría: consulta de perfiles y permisos en solo lectura. No puedes crear, editar ni desactivar perfiles.
        </div>
      )}

      {mostrarFormulario ? (
        /* VISTA DEDICADA: ALTA / EDICIÓN DE PERFIL A PANTALLA COMPLETA */
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
                ← Volver a la lista de perfiles
              </button>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                {soloLectura
                  ? `Permisos del Perfil: "${formulario.nombre}"`
                  : formulario.id_perfil === null
                    ? "Crear Nuevo Perfil de Usuario"
                    : `Editando Permisos del Perfil: "${formulario.nombre}"`}
              </h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
                {soloLectura
                  ? "Consulta de la matriz de permisos y opciones de menú asignadas al perfil (RBAC / SoD)."
                  : "Configure las identidades de acceso y los privilegios jerárquicos sobre las opciones de menú (RBAC / SoD)."}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 16px", fontSize: 13 }}
                onClick={() => setMostrarFormulario(false)}
              >
                {soloLectura ? "Cerrar" : "Cancelar"}
              </button>
              {!soloLectura && (
                <button
                  type="submit"
                  form="formulario-perfil"
                  className="boton-primario"
                  style={{ width: "auto", padding: "8px 20px", fontSize: 13 }}
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : formulario.id_perfil === null ? "Crear Perfil" : "Guardar Cambios"}
                </button>
              )}
            </div>
          </div>

          <form id="formulario-perfil" onSubmit={manejarEnvioFormulario}>
            {error && <div className="mensaje-error">{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div className="campo">
                <label>Nombre del perfil *</label>
                <input
                  className="input-base"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  placeholder="Ej. Auditor, Soporte Nivel 2"
                  required
                  autoFocus
                  disabled={soloLectura}
                />
              </div>

              <div className="campo">
                <label>Descripción del Perfil</label>
                <input
                  className="input-base"
                  value={formulario.descripcion}
                  onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                  placeholder="Detalle de las responsabilidades funcionales y alcance de este rol"
                  disabled={soloLectura}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                  flexWrap: "wrap",
                  gap: 8
                }}
              >
                <div>
                  <label style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                    Matriz de Permisos y Opciones de Menú
                  </label>
                  <span style={{ fontSize: 12.5, color: "#64748b", marginLeft: 8 }}>
                    ({formulario.opciones_ids.length} de {opcionesMenu.length} seleccionadas)
                  </span>
                </div>
                {!soloLectura && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      onClick={marcarTodasOpciones}
                      style={{
                        fontSize: 12,
                        background: "none",
                        border: "none",
                        color: "#2563eb",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontWeight: 600,
                      }}
                    >
                      Marcar todas
                    </button>
                    <span style={{ color: "#cbd5e1" }}>|</span>
                    <button
                      type="button"
                      onClick={desmarcarTodasOpciones}
                      style={{
                        fontSize: 12,
                        background: "none",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontWeight: 600,
                      }}
                    >
                      Desmarcar todas
                    </button>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  maxHeight: "65vh",
                  overflowY: "auto",
                  padding: "16px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                }}
              >
                {construirArbolPermisos(opcionesMenu).map((raiz) => renderizarNodo(raiz))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                onClick={() => setMostrarFormulario(false)}
              >
                {soloLectura ? "Cerrar" : "Cancelar"}
              </button>
              {!soloLectura && (
                <button
                  type="submit"
                  className="boton-primario"
                  style={{ width: "auto", padding: "8px 24px", fontSize: 13 }}
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : formulario.id_perfil === null ? "Crear Perfil" : "Guardar Cambios"}
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* VISTA DE TABLA PRINCIPAL DE PERFILES */
        <div>
          <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <div>
              <h1>Perfiles y Permisos (RBAC)</h1>
              <p>
                Catálogo de roles del sistema, asignación de permisos de acceso a las opciones del menú y gobierno de privilegios.
              </p>
            </div>
            {!soloLectura && (
              <button className="boton-primario" style={{ width: "auto", padding: "8px 16px", fontSize: 13 }} onClick={abrirFormularioNuevo}>
                + Nuevo perfil
              </button>
            )}
          </div>

          {cargando ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#6b7280" }}>
              Cargando perfiles del sistema...
            </div>
          ) : perfiles.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#6b7280" }}>
              No hay perfiles registrados en el sistema.
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Permisos</th>
                    <th>Usuarios asignados</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {perfiles.map((perfil) => {
                    const esAdmin = perfil.id_perfil === 1;
                    return (
                      <tr key={perfil.id_perfil}>
                        <td style={{ color: "#9ca3af" }}>{perfil.id_perfil}</td>
                        <td style={{ fontWeight: 600 }}>{perfil.nombre}</td>
                        <td style={{ color: "#4b5563", fontSize: 13, maxWidth: 320 }}>
                          {perfil.descripcion || "—"}
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>
                            {perfil.opciones_ids?.length ?? 0} opciones
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: "#4b5563" }}>
                            {perfil.total_usuarios ?? 0} usuario{(perfil.total_usuarios ?? 0) !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td>
                          <span className={"badge " + (perfil.estado_registro ? "badge-activo" : "badge-inactivo")}>
                            {perfil.estado_registro ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 6 }}>
                            {soloLectura ? (
                              <button
                                type="button"
                                className="boton-accion-icono"
                                title="Ver permisos"
                                onClick={() => abrirFormularioEditar(perfil)}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="boton-accion-icono"
                                  title="Editar permisos"
                                  onClick={() => abrirFormularioEditar(perfil)}
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>

                                {!esAdmin && (
                                  <button
                                    type="button"
                                    className="boton-accion-icono boton-accion-peligro"
                                    title={perfil.estado_registro ? "Desactivar perfil" : "Activar perfil"}
                                    onClick={() => alternarEstado(perfil)}
                                  >
                                    {perfil.estado_registro ? (
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
                                )}
                              </>
                            )}
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
