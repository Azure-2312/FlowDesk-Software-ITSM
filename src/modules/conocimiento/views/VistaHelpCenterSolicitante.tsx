"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface ArticuloSimple {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  categoria_nombre?: string;
  visitas: number;
  utilidad_positiva: number;
}

export default function VistaHelpCenterSolicitante() {
  const [articulos, setArticulos] = useState<ArticuloSimple[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const res = await fetch("/api/conocimiento");
        if (res.ok) {
          const data = await res.json();
          setArticulos(Array.isArray(data) ? data : []);
        }
      } catch {
        // Silencioso
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const articulosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return articulos;
    const q = busqueda.toLowerCase().trim();
    return articulos.filter(
      (a) =>
        a.titulo.toLowerCase().includes(q) ||
        a.categoria_nombre?.toLowerCase().includes(q) ||
        a.codigo_articulo.toLowerCase().includes(q)
    );
  }, [articulos, busqueda]);

  const masPopulares = useMemo(() => {
    return [...articulos]
      .sort((a, b) => b.utilidad_positiva + b.visitas - (a.utilidad_positiva + a.visitas))
      .slice(0, 5);
  }, [articulos]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="text-center space-y-3 py-6 px-4 bg-gradient-to-b from-blue-50/60 to-transparent dark:from-blue-950/20 rounded-2xl border border-blue-100/60 dark:border-blue-900/30">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/40 px-3 py-1 rounded-full">
          Centro de Ayuda y Autoservicio
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          ¿En qué podemos ayudarte hoy?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Encuentra guías paso a paso, respuestas a preguntas frecuentes y soluciones inmediatas sin esperar a un técnico.
        </p>

        <div className="max-w-2xl mx-auto pt-2">
          <div className="relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Busca por síntoma, problema o palabra clave (ej. VPN, Correo, Impresora)..."
              className="w-full pl-4 pr-10 py-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {busqueda ? `Resultados de búsqueda (${articulosFiltrados.length})` : "Artículos Disponibles"}
            </h2>
            <Link
              href="/plataforma/solicitudes/crear"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              ¿No encontraste lo que buscabas? Abrir ticket
            </Link>
          </div>

          {cargando ? (
            <div className="py-12 text-center text-sm text-slate-500">Cargando base de conocimiento...</div>
          ) : articulosFiltrados.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No encontramos artículos que coincidan con tu búsqueda.
              </p>
              <Link
                href="/plataforma/solicitudes/crear"
                className="inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Crear una Solicitud de Soporte
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {articulosFiltrados.map((art) => (
                <Link
                  key={art.id_articulo}
                  href={`/plataforma/conocimiento/${art.id_articulo}`}
                  className="block p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                      {art.codigo_articulo}
                    </span>
                    {art.categoria_nombre && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {art.categoria_nombre}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600">
                    {art.titulo}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>{art.visitas} lecturas</span>
                    <span>{art.utilidad_positiva} personas lo encontraron útil</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Soluciones Más Populares
            </h3>
            <div className="space-y-2.5">
              {masPopulares.map((art, idx) => (
                <Link
                  key={art.id_articulo}
                  href={`/plataforma/conocimiento/${art.id_articulo}`}
                  className="flex items-start gap-2.5 text-xs group"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 group-hover:text-blue-600 font-medium line-clamp-2">
                    {art.titulo}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              ¿Problema urgente en producción?
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Si tu sistema presenta una caída total o bloqueo que impide operar, contacta a la mesa de ayuda para declarar un incidente de severidad alta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
