// ============================================================================
// GESTIÓN DEL CONOCIMIENTO (KCS): BASE DE ARTÍCULOS Y GUÍAS DE AUTOAYUDA
// ============================================================================
// Repositorio de soluciones técnicas verificadas y guías operativas: búsqueda
// por palabras clave, categorización, métricas de utilidad y lectura en Markdown.
// ============================================================================

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ValoracionArticulo, {
  type ConteoValoracion,
  type VotoArticulo,
} from "@/modules/conocimiento/components/ValoracionArticulo";

// ----------------------------------------------------------------------------
// 1. MODELO DE DATOS: Estructura del artículo KCS y métricas de utilidad
// ----------------------------------------------------------------------------
interface Articulo {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  contenido_markdown: string;
  categoria_nombre?: string;
  autor_nombre?: string;
  visitas: number;
  utilidad_positiva: number;
  utilidad_negativa?: number;
  fecha_publicacion?: string;
  mi_voto?: VotoArticulo | null;
}

export default function PaginaBaseConocimiento() {
  // --------------------------------------------------------------------------
  // 2. ESTADOS LOCALES: Listado de artículos, término de búsqueda y visor
  // --------------------------------------------------------------------------
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);
  const [cargandoLectura, setCargandoLectura] = useState(false);

  // --------------------------------------------------------------------------
  // 3. CONSULTA A LA API: Obtención de artículos publicados desde /api/conocimiento
  // --------------------------------------------------------------------------
  async function cargarArticulos() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/conocimiento?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setArticulos(Array.isArray(data) ? data : []);
      } else {
        const data = await res.json();
        setError(data.error || "Error al cargar artículos de conocimiento");
      }
    } catch {
      setError("Error de red al consultar la base de conocimiento");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarArticulos();
  }, []);

  // Al abrir un artículo se consulta su ficha: cuenta la lectura y trae el
  // voto de quien lo lee junto con los contadores actualizados.
  async function abrirArticulo(art: Articulo) {
    setArticuloSeleccionado(art);
    setCargandoLectura(true);
    try {
      const res = await fetch(`/api/conocimiento/${art.id_articulo}`);
      if (res.ok) {
        const ficha = await res.json();
        const actualizado: Articulo = {
          ...art,
          visitas: ficha.visitas,
          utilidad_positiva: ficha.utilidad_positiva,
          utilidad_negativa: ficha.utilidad_negativa,
          mi_voto: ficha.mi_voto ?? null,
        };
        setArticuloSeleccionado((actual) => (actual?.id_articulo === art.id_articulo ? actualizado : actual));
        setArticulos((lista) => lista.map((a) => (a.id_articulo === art.id_articulo ? actualizado : a)));
      }
    } finally {
      setCargandoLectura(false);
    }
  }

  function aplicarValoracion(idArticulo: number, conteo: ConteoValoracion) {
    const aplicar = (a: Articulo) => (a.id_articulo === idArticulo ? { ...a, ...conteo } : a);
    setArticulos((lista) => lista.map(aplicar));
    setArticuloSeleccionado((actual) => (actual ? aplicar(actual) : actual));
  }

  // --------------------------------------------------------------------------
  // 4. FILTRADO REACTIVO: Búsqueda dinámica en tiempo real por título y texto
  // --------------------------------------------------------------------------
  const articulosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return articulos;
    const q = busqueda.toLowerCase();
    return articulos.filter(
      (a) =>
        a.titulo.toLowerCase().includes(q) ||
        a.contenido_markdown.toLowerCase().includes(q) ||
        (a.categoria_nombre && a.categoria_nombre.toLowerCase().includes(q))
    );
  }, [articulos, busqueda]);

  // --------------------------------------------------------------------------
  // 5. RENDERIZADO VISUAL: Barra de búsqueda, listado de tarjetas y lector modal
  // --------------------------------------------------------------------------
  return (
    <div className="vista-contenedor" style={{ maxWidth: 1000, margin: "0 auto", paddingBottom: 60 }}>
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 className="titulo-pagina">Base de conocimiento KCS</h1>
          <p className="descripcion-pagina">
            Consulta procedimientos, soluciones a errores conocidos y guías oficiales de soporte.
          </p>
        </div>
        <Link
          href="/plataforma/conocimiento/crear"
          className="boton-primario"
        >
          <span>+ Redactar artículo</span>
        </Link>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          type="search"
          className="input-base"
          placeholder="Buscar soluciones, síntomas o procedimientos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: "100%", padding: "12px 16px", fontSize: 15 }}
        />
      </div>

      {cargando ? (
        <p className="mensaje-cargando">Cargando base de conocimiento...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : articulosFiltrados.length === 0 ? (
        <p className="mensaje-vacio">No se encontraron artículos con el término buscado.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {articulosFiltrados.map((art) => (
            <div
              key={art.id_articulo}
              className="tarjeta"
              style={{
                padding: 18,
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                cursor: "pointer",
                transition: "border-color 0.15s ease",
              }}
              onClick={() => abrirArticulo(art)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>{art.titulo}</h3>
                <span className="badge-categoria" style={{ fontSize: 11, padding: "2px 8px", backgroundColor: "#f1f5f9", borderRadius: 4, color: "#475569" }}>
                  {art.categoria_nombre || "General"}
                </span>
              </div>
              <p style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: 13, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {art.contenido_markdown.replace(/[#*`_]/g, "").slice(0, 160)}...
              </p>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#94a3b8" }}>
                <span>Código: <strong>{art.codigo_articulo}</strong></span>
                <span>Lecturas: {art.visitas}</span>
                <span>Votos útiles: {art.utilidad_positiva}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visor modal del artículo completo */}
      {articuloSeleccionado && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setArticuloSeleccionado(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 10,
              width: "100%",
              maxWidth: 750,
              maxHeight: "85vh",
              overflowY: "auto",
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>{articuloSeleccionado.codigo_articulo}</span>
                <h2 style={{ margin: "4px 0 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{articuloSeleccionado.titulo}</h2>
              </div>
              <button className="boton-icono boton-sm"
                type="button"
                onClick={() => setArticuloSeleccionado(null)}
              >
                ×
              </button>
            </div>
            <div style={{ whiteSpace: "pre-wrap", color: "#334155", fontSize: 14.5, lineHeight: 1.6 }}>
              {articuloSeleccionado.contenido_markdown}
            </div>
            {cargandoLectura ? (
              <p className="mensaje-cargando" style={{ marginTop: 24 }}>Cargando valoraciones...</p>
            ) : (
              <ValoracionArticulo
                idArticulo={articuloSeleccionado.id_articulo}
                utilidad_positiva={articuloSeleccionado.utilidad_positiva}
                utilidad_negativa={articuloSeleccionado.utilidad_negativa ?? 0}
                mi_voto={articuloSeleccionado.mi_voto ?? null}
                onValorado={(conteo) => aplicarValoracion(articuloSeleccionado.id_articulo, conteo)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
