"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import VistaConfigCategorias from "./categorias/VistaConfigCategorias";

interface Articulo {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  contenido_markdown?: string;
  estado_editorial: string;
  version?: number;
  visitas: number;
  utilidad_positiva: number;
  utilidad_negativa: number;
  fecha_creacion: string;
  fecha_publicacion: string | null;
  id_categoria: number;
  categoria: string | null;
  autor: string;
  audiencia_perfiles?: number[];
}

interface CategoriaConocimiento {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  codigo_corto: string;
  estado_registro: boolean;
  total_articulos: number;
}

interface PerfilItem {
  id_perfil: number;
  nombre: string;
  codigo: string;
}

interface PoliticasKCS {
  perfiles_redaccion: number[];
  perfiles_aprobacion: number[];
  requiere_aprobacion_previa: boolean;
  frecuencia_revision_dias: number;
  permitir_calificacion_csat: boolean;
}

export default function GobiernoConocimiento({
  pestanaFija,
}: {
  pestanaFija?: "articulos" | "politicas";
} = {}) {
  const [pestañaActiva, setPestañaActiva] = useState<"articulos" | "politicas">(
    pestanaFija || "articulos"
  );

  // Estado de Artículos
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // Diálogo Retirar
  const [idRetirar, setIdRetirar] = useState<number | null>(null);
  const [motivoRetiro, setMotivoRetiro] = useState("");

  // Estado de Categorías
  const [categorias, setCategorias] = useState<CategoriaConocimiento[]>([]);

  // Estado de Políticas KCS
  const [perfiles, setPerfiles] = useState<PerfilItem[]>([]);
  const [politicas, setPoliticas] = useState<PoliticasKCS>({
    perfiles_redaccion: [1, 2, 4, 8],
    perfiles_aprobacion: [1, 4],
    requiere_aprobacion_previa: true,
    frecuencia_revision_dias: 90,
    permitir_calificacion_csat: true,
  });
  const [guardandoPoliticas, setGuardandoPoliticas] = useState(false);

  async function cargarArticulos() {
    setCargando(true);
    try {
      const r = await fetch("/api/conocimiento", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "No se pudo cargar la lista de artículos");
        return;
      }
      setArticulos(d.articulos || []);
    } catch {
      setError("Error de conexión al cargar artículos.");
    } finally {
      setCargando(false);
    }
  }

  async function cargarCategorias() {
    try {
      const r = await fetch("/api/conocimiento/categorias", { cache: "no-store" });
      const d = await r.json();
      if (r.ok) {
        setCategorias(d.categorias || []);
      }
    } catch {
      console.error("Error al cargar categorías");
    }
  }

  async function cargarPoliticas() {
    try {
      const r = await fetch("/api/conocimiento/politicas", { cache: "no-store" });
      const d = await r.json();
      if (r.ok) {
        if (d.politicas) setPoliticas(d.politicas);
        if (d.perfiles) setPerfiles(d.perfiles);
      }
    } catch {
      console.error("Error al cargar políticas KCS");
    }
  }

  useEffect(() => {
    if (pestanaFija) {
      setPestañaActiva(pestanaFija);
    }
    cargarArticulos();
    cargarCategorias();
    cargarPoliticas();
  }, [pestanaFija]);

  async function accionTransicion(id: number, accionNombre: string, payloadExtra: any = {}) {
    setError("");
    setOk("");
    try {
      const r = await fetch(`/api/conocimiento/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: accionNombre, ...payloadExtra }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "No se pudo actualizar el estado editorial");
        return;
      }
      setOk(`Estado editorial actualizado exitosamente.`);
      setTimeout(() => setOk(""), 4000);
      setIdRetirar(null);
      setMotivoRetiro("");
      await cargarArticulos();
    } catch {
      setError("Error de conexión al actualizar artículo.");
    }
  }

  async function guardarPoliticasKCS() {
    setGuardandoPoliticas(true);
    setError("");
    setOk("");
    try {
      const r = await fetch("/api/conocimiento/politicas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(politicas),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "No se pudieron guardar las políticas KCS");
        return;
      }
      setOk("Políticas de gobernanza KCS actualizadas y auditadas exitosamente.");
      setTimeout(() => setOk(""), 4000);
    } catch {
      setError("Error de conexión al guardar políticas");
    } finally {
      setGuardandoPoliticas(false);
    }
  }

  const articulosFiltrados = articulos.filter((a) => {
    if (filtroEstado !== "TODOS" && a.estado_editorial !== filtroEstado) return false;
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase().trim();
      return (
        a.titulo.toLowerCase().includes(b) ||
        a.codigo_articulo.toLowerCase().includes(b) ||
        (a.categoria && a.categoria.toLowerCase().includes(b)) ||
        a.autor.toLowerCase().includes(b)
      );
    }
    return true;
  });

  const conteoEnRevision = articulos.filter((a) => a.estado_editorial === "EN_REVISION").length;
  const conteoPublicados = articulos.filter((a) => a.estado_editorial === "PUBLICADO").length;
  const conteoBorradores = articulos.filter((a) => a.estado_editorial === "BORRADOR").length;

  return (
    <div className="vista-contenedor">
      {/* Navegación por Pestañas (si no está fijada externamente) */}
      {!pestanaFija && (
        <div className="pestanas">
          <button
            type="button"
            onClick={() => setPestañaActiva("articulos")}
            className={pestañaActiva === "articulos" ? "pestana pestana-activa" : "pestana"}
          >
            Artículos y Ciclo de Vida Editorial
          </button>

          <button
            type="button"
            onClick={() => setPestañaActiva("politicas")}
            className={pestañaActiva === "politicas" ? "pestana pestana-activa" : "pestana"}
          >
            Gobernanza, Políticas KCS y Categorías
          </button>
        </div>
      )}

      {/* Cabecera Principal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "nowrap", gap: 16, marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="titulo-pagina">
            {pestañaActiva === "articulos" ? "Artículos y ciclo de vida editorial" : "Gobernanza, políticas KCS y categorías"}
          </h1>
          <p className="descripcion-pagina">
            {pestañaActiva === "articulos" ? "Supervise el ciclo editorial de los artículos técnicos y audite su trazabilidad." : "Configure las políticas de redacción, las categorías y las compuertas de publicación del autoservicio."}
          </p>
        </div>
        {pestañaActiva === "politicas" && (
          <button
            type="button"
            className="boton-primario"
            onClick={guardarPoliticasKCS}
            disabled={guardandoPoliticas}
            style={{ flexShrink: 0 }}
          >
            {guardandoPoliticas ? "Guardando..." : "Guardar Configuración"}
          </button>
        )}
      </div>

      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 16 }}>{error}</p>}
      {ok && <p role="status" className="mensaje-exito" style={{ padding: "8px 12px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 6, marginBottom: 16 }}>{ok}</p>}

      {/* PESTAÑA 1: ARTÍCULOS Y CICLO EDITORIAL */}
      {pestañaActiva === "articulos" && (
        <div>
          {/* Métricas Resumen */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>En Revisión Técnica</span>
              <p style={{ fontSize: 24, fontWeight: 700, margin: "6px 0 0", color: "#d97706" }}>{conteoEnRevision}</p>
            </div>
            <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Artículos Publicados</span>
              <p style={{ fontSize: 24, fontWeight: 700, margin: "6px 0 0", color: "#16a34a" }}>{conteoPublicados}</p>
            </div>
            <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Borradores / En Curso</span>
              <p style={{ fontSize: 24, fontWeight: 700, margin: "6px 0 0", color: "#64748b" }}>{conteoBorradores}</p>
            </div>
            <div style={{ background: "#ffffff", padding: "16px 20px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Total Catálogo Base</span>
              <p style={{ fontSize: 24, fontWeight: 700, margin: "6px 0 0", color: "#0f172a" }}>{articulos.length}</p>
            </div>
          </div>

          {/* Filtros y Búsqueda */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Buscar por título, código, categoría o autor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input-base"
              style={{ flex: 1, minWidth: 260 }}
            />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="input-base"
              style={{ width: "auto" }}
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="PUBLICADO">Publicado</option>
              <option value="RETIRADO">Retirado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>

          {/* Diálogo de Retiro */}
          {idRetirar !== null && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#92400e" }}>
                Confirmar Retiro del Artículo (Despublicación Oficial)
              </h3>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "#78350f" }}>
                El artículo dejará de ser accesible para los solicitantes en el portal de autoservicio. Indique la justificación técnica o motivo de obsolescencia:
              </p>
              <textarea
                value={motivoRetiro}
                onChange={(e) => setMotivoRetiro(e.target.value)}
                placeholder="Ejemplo: Solución técnica obsoleta por actualización de sistema a versión v2.4..."
                className="input-base"
                style={{ width: "100%", height: 70, marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => { setIdRetirar(null); setMotivoRetiro(""); }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="boton-peligro"
                  disabled={!motivoRetiro.trim()}
                  onClick={() => accionTransicion(idRetirar, "RETIRAR", { motivo: motivoRetiro })}
                >
                  Confirmar Retiro
                </button>
              </div>
            </div>
          )}

          {/* Tabla de Artículos */}
          {cargando ? (
            <p>Cargando inventario maestro de artículos...</p>
          ) : articulosFiltrados.length === 0 ? (
            <div className="estado-vacio">
              No se encontraron artículos con los criterios seleccionados.
            </div>
          ) : (
            <div style={{ background: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <tr>
                    <th style={{ padding: "10px 14px" }}>Código</th>
                    <th style={{ padding: "10px 14px" }}>Título</th>
                    <th style={{ padding: "10px 14px" }}>Categoría</th>
                    <th style={{ padding: "10px 14px" }}>Autor</th>
                    <th style={{ padding: "10px 14px" }}>Estado</th>
                    <th style={{ padding: "10px 14px", textAlign: "center" }}>CSAT (+ / -)</th>
                    <th style={{ padding: "10px 14px", textAlign: "right" }}>Acciones de Ciclo de Vida</th>
                  </tr>
                </thead>
                <tbody>
                  {articulosFiltrados.map((a) => (
                    <tr key={a.id_articulo} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", fontWeight: 600, color: "#334155" }}>
                        {a.codigo_articulo}
                      </td>
                      <td style={{ padding: "10px 14px", fontWeight: 500, color: "#0f172a" }}>
                        {a.titulo}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#475569" }}>
                        {a.categoria || "Sin categoría"}
                      </td>
                      <td style={{ padding: "10px 14px", color: "#475569" }}>
                        {a.autor}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor:
                            a.estado_editorial === "PUBLICADO" ? "#dcfce7" :
                            a.estado_editorial === "EN_REVISION" ? "#fef3c7" :
                            a.estado_editorial === "RETIRADO" ? "#fee2e2" : "#f1f5f9",
                          color:
                            a.estado_editorial === "PUBLICADO" ? "#166534" :
                            a.estado_editorial === "EN_REVISION" ? "#92400e" :
                            a.estado_editorial === "RETIRADO" ? "#991b1b" : "#475569",
                        }}>
                          {a.estado_editorial}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center", color: "#475569" }}>
                        <span style={{ color: "#16a34a", fontWeight: 600 }}>+{a.utilidad_positiva}</span> / <span style={{ color: "#dc2626" }}>-{a.utilidad_negativa}</span>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                          {a.estado_editorial === "EN_REVISION" && (
                            <>
                              <button className="boton-primario boton-sm"
                                type="button"
                                onClick={() => accionTransicion(a.id_articulo, "APROBAR")}
                              >
                                Aprobar
                              </button>
                              <button className="boton-peligro boton-sm"
                                type="button"
                                onClick={() => accionTransicion(a.id_articulo, "RECHAZAR")}
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {a.estado_editorial === "PUBLICADO" && (
                            <button className="boton-peligro boton-sm"
                              type="button"
                              onClick={() => setIdRetirar(a.id_articulo)}
                            >
                              Retirar
                            </button>
                          )}
                          <Link
                            href={`/plataforma/conocimiento/configuracion/articulos/${a.id_articulo}/editar`}
                            className="boton-secundario boton-sm"
                          >
                            Editar
                          </Link>
                          <Link
                            href={`/plataforma/conocimiento/configuracion/articulos/${a.id_articulo}/historial`}
                            className="boton-secundario boton-sm"
                          >
                            Historial
                          </Link>
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

      {/* PESTAÑA 2: GOBERNANZA, POLÍTICAS KCS Y CATEGORÍAS */}
      {pestañaActiva === "politicas" && (
        <div style={{ maxWidth: 960 }}>
          <div className="tarjeta-formulario" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 14, color: "#0f172a" }}>
              Control de Roles y Autorizaciones Editoriales KCS
            </h3>
            <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
              Configure la segregación de responsabilidades: determine quiénes están facultados para escribir borradores técnicos y quiénes poseen la autoridad para aprobar y publicar contenidos visibles para los solicitantes.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Quién puede redactar */}
            <div className="tarjeta-formulario">
              <strong style={{ fontSize: 13, color: "#1e293b", display: "block", marginBottom: 4 }}>
                1. Perfiles Habilitados para Redactar Soluciones y Artículos (Autores KCS):
              </strong>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>
                Los usuarios con estos perfiles podrán redactar borradores técnicos y remitirlos a revisión.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 8 }}>
                {perfiles.map((p) => {
                  const check = politicas.perfiles_redaccion.includes(p.id_perfil);
                  return (
                    <label key={p.id_perfil} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={check}
                        onChange={(e) => {
                          const nuevo = e.target.checked
                            ? [...politicas.perfiles_redaccion, p.id_perfil]
                            : politicas.perfiles_redaccion.filter((id) => id !== p.id_perfil);
                          setPoliticas({ ...politicas, perfiles_redaccion: nuevo });
                        }}
                      />
                      <span>{p.nombre}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Quién puede aprobar */}
            <div className="tarjeta-formulario">
              <strong style={{ fontSize: 13, color: "#1e293b", display: "block", marginBottom: 4 }}>
                2. Perfiles Habilitados para Aprobar y Publicar (Editores / Supervisores KCS):
              </strong>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>
                Solo los usuarios con estos perfiles pueden autorizar la publicación oficial hacia el autoservicio.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 8 }}>
                {perfiles.map((p) => {
                  const check = politicas.perfiles_aprobacion.includes(p.id_perfil);
                  return (
                    <label key={p.id_perfil} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={check}
                        onChange={(e) => {
                          const nuevo = e.target.checked
                            ? [...politicas.perfiles_aprobacion, p.id_perfil]
                            : politicas.perfiles_aprobacion.filter((id) => id !== p.id_perfil);
                          setPoliticas({ ...politicas, perfiles_aprobacion: nuevo });
                        }}
                      />
                      <span>{p.nombre}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Flujo de Aprobación Previa */}
            <div className="tarjeta-formulario">
              <strong style={{ fontSize: 13, color: "#1e293b", display: "block", marginBottom: 8 }}>
                3. Compuerta de Aprobación Obligatoria y Ciclo de Vigencia:
              </strong>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={politicas.requiere_aprobacion_previa}
                    onChange={(e) => setPoliticas({ ...politicas, requiere_aprobacion_previa: e.target.checked })}
                  />
                  <span>
                    <strong>Exigir aprobación previa obligatoria:</strong> Ningún artículo redactado podrá visualizarse en el portal de autoservicio hasta que un revisor autorizado lo apruebe.
                  </span>
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                  <span style={{ fontSize: 12.5, color: "#334155" }}>Frecuencia de auditoría de vigencia:</span>
                  <select
                    className="input-base"
                    value={politicas.frecuencia_revision_dias}
                    onChange={(e) => setPoliticas({ ...politicas, frecuencia_revision_dias: Number(e.target.value) })}
                    style={{ width: "auto", fontSize: 12.5 }}
                  >
                    <option value={30}>Cada 30 días (Mensual)</option>
                    <option value={90}>Cada 90 días (Trimestral - Recomendado ITIL)</option>
                    <option value={180}>Cada 180 días (Semestral)</option>
                    <option value={365}>Cada 365 días (Anual)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Administración de Categorías */}
            <div style={{ marginTop: 12 }}>
              <VistaConfigCategorias />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
