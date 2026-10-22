"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface CategoriaItem {
  id_categoria: number;
  nombre: string;
  codigo_corto: string;
}

export default function PaginaEditarArticuloConocimiento() {
  const params = useParams();
  const router = useRouter();
  const idArticulo = params?.id as string;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [codigoArticulo, setCodigoArticulo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [idCategoria, setIdCategoria] = useState<number>(1);
  const [estadoEditorial, setEstadoEditorial] = useState("PUBLICADO");
  const [tipoPlantilla, setTipoPlantilla] = useState("GUIA");
  const [clasificacionSeguridad, setClasificacionSeguridad] = useState("INTERNO");
  const [contenidoMarkdown, setContenidoMarkdown] = useState("");
  const [vistaPrevia, setVistaPrevia] = useState(false);

  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);

  useEffect(() => {
    async function inicializar() {
      if (!idArticulo) return;
      setCargando(true);
      setError(null);
      try {
        const [resArticulo, resCategorias] = await Promise.all([
          fetch(`/api/admin/conocimiento/${idArticulo}`),
          fetch("/api/admin/conocimiento/categorias"),
        ]);

        if (!resArticulo.ok) {
          const d = await resArticulo.json().catch(() => null);
          throw new Error(d?.error || "No se pudo obtener el artículo solicitado.");
        }

        const dataArt = await resArticulo.json();
        const art = dataArt.articulo;
        if (art) {
          setCodigoArticulo(art.codigo_articulo || "");
          setTitulo(art.titulo || "");
          setIdCategoria(art.id_categoria || 1);
          setEstadoEditorial(art.estado_editorial || "BORRADOR");
          setTipoPlantilla(art.tipo_plantilla || "GUIA");
          setClasificacionSeguridad(art.clasificacion_seguridad || "INTERNO");
          setContenidoMarkdown(art.contenido_markdown || "");
        }

        if (resCategorias.ok) {
          const dataCat = await resCategorias.json();
          setCategorias(dataCat.categorias || []);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar los datos del artículo.");
      } finally {
        setCargando(false);
      }
    }

    inicializar();
  }, [idArticulo]);

  async function manejarGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !contenidoMarkdown.trim()) {
      setError("El título y el contenido son campos obligatorios.");
      return;
    }

    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch(`/api/admin/conocimiento/${idArticulo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          contenido_markdown: contenidoMarkdown.trim(),
          id_categoria: idCategoria,
          estado_editorial: estadoEditorial,
          tipo_plantilla: tipoPlantilla,
          clasificacion_seguridad: clasificacionSeguridad,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar el artículo.");
      }

      setMensajeExito("Artículo actualizado exitosamente. Se ha generado una nueva versión en la trazabilidad.");
      setTimeout(() => {
        router.push("/plataforma/admin/conocimiento-config");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="py-20 text-center text-slate-500 text-sm">
          Cargando artículo para edición administrativa...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Navegación y Encabezado */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/plataforma/admin" className="hover:text-blue-600 transition-colors">
            Administración
          </Link>
          <span>/</span>
          <Link href="/plataforma/admin/conocimiento-config" className="hover:text-blue-600 transition-colors">
            Base de Conocimiento
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">Editar {codigoArticulo}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Edición Administrativa de Artículo
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Código institucional: <span className="font-mono font-semibold text-blue-600">{codigoArticulo}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/plataforma/admin/conocimiento-config/articulos/${idArticulo}/historial`}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Ver Historial
            </Link>
            <Link
              href="/plataforma/admin/conocimiento-config"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Volver a la Lista
            </Link>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs">
          {mensajeExito} Redirigiendo al catálogo...
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* Formulario de Edición */}
      <form onSubmit={manejarGuardar} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Título del Artículo
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              placeholder="Ej: Guía de resolución de conectividad remota VPN"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Categoría
              </label>
              <select
                value={idCategoria}
                onChange={(e) => setIdCategoria(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              >
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre} ({cat.codigo_corto})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Estado Editorial
              </label>
              <select
                value={estadoEditorial}
                onChange={(e) => setEstadoEditorial(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium"
              >
                <option value="PUBLICADO">PUBLICADO</option>
                <option value="EN_REVISION">EN_REVISION</option>
                <option value="BORRADOR">BORRADOR</option>
                <option value="RETIRADO">RETIRADO</option>
                <option value="ARCHIVADO">ARCHIVADO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Plantilla KCS
              </label>
              <select
                value={tipoPlantilla}
                onChange={(e) => setTipoPlantilla(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              >
                <option value="GUIA">Guía Paso a Paso</option>
                <option value="RESOLUCION_PROBLEMA">Resolución de Problema</option>
                <option value="PREGUNTA_FRECUENTE">Preguntas Frecuentes (FAQ)</option>
                <option value="PROCEDIMIENTO_ESTANDAR">Procedimiento Operativo (SOP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Clasificación de Seguridad
              </label>
              <select
                value={clasificacionSeguridad}
                onChange={(e) => setClasificacionSeguridad(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              >
                <option value="PUBLICO">Público (Solicitantes y Clientes)</option>
                <option value="INTERNO">Interno (Personal Institucional)</option>
                <option value="CONFIDENCIAL_TI">Confidencial TI (Solo Especialistas)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Contenido del Artículo (Markdown)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVistaPrevia(false)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    !vistaPrevia
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setVistaPrevia(true)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    vistaPrevia
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Vista Previa
                </button>
              </div>
            </div>

            {!vistaPrevia ? (
              <textarea
                required
                rows={14}
                value={contenidoMarkdown}
                onChange={(e) => setContenidoMarkdown(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white leading-relaxed"
                placeholder="Escriba las instrucciones, requisitos, solución técnica y recomendaciones..."
              />
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[300px] text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                {contenidoMarkdown.trim() ? (
                  contenidoMarkdown
                ) : (
                  <span className="text-slate-400 italic">No hay contenido redactado para visualizar.</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/plataforma/admin/conocimiento-config"
            className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={guardando}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {guardando ? "Guardando Cambios..." : "Guardar Modificaciones"}
          </button>
        </div>
      </form>
    </div>
  );
}
