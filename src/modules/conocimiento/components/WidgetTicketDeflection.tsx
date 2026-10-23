"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ArticuloSugerido {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  categoria_nombre?: string;
  utilidad_positiva: number;
}

interface WidgetTicketDeflectionProps {
  textoBusqueda: string;
  onDeflexionExitosa?: () => void;
}

export default function WidgetTicketDeflection({
  textoBusqueda,
  onDeflexionExitosa,
}: WidgetTicketDeflectionProps) {
  const [sugerencias, setSugerencias] = useState<ArticuloSugerido[]>([]);
  const [cargando, setCargando] = useState(false);
  const [articuloResuelto, setArticuloResuelto] = useState<number | null>(null);

  useEffect(() => {
    if (!textoBusqueda || textoBusqueda.trim().length < 4) {
      setSugerencias([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCargando(true);
      try {
        const res = await fetch(`/api/conocimiento?buscar=${encodeURIComponent(textoBusqueda.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setSugerencias(data.slice(0, 3));
          }
        }
      } catch {
        // Silencioso
      } finally {
        setCargando(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [textoBusqueda]);

  async function marcarResuelto(idArticulo: number) {
    setArticuloResuelto(idArticulo);
    try {
      await fetch("/api/deflexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "MARCAR_DEFLEXION",
          id_log: 1, // Log contextual
          id_articulo: idArticulo,
        }),
      });
    } catch {
      // Silencioso
    }
    if (onDeflexionExitosa) {
      onDeflexionExitosa();
    }
  }

  if (sugerencias.length === 0 && !cargando) {
    return null;
  }

  return (
    <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
          ¿Alguna de estas guías resuelve tu problema?
        </span>
        {cargando && <span className="text-xs text-slate-400">Buscando...</span>}
      </div>

      <div className="space-y-2">
        {sugerencias.map((art) => (
          <div
            key={art.id_articulo}
            className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-blue-600">
                  {art.codigo_articulo}
                </span>
                {art.categoria_nombre && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {art.categoria_nombre}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {art.titulo}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/plataforma/conocimiento/${art.id_articulo}`}
                target="_blank"
                className="px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded font-medium transition-colors"
              >
                Ver Guía
              </Link>
              <button
                type="button"
                onClick={() => marcarResuelto(art.id_articulo)}
                disabled={articuloResuelto === art.id_articulo}
                className="px-2.5 py-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 rounded font-medium transition-colors"
              >
                {articuloResuelto === art.id_articulo ? "¡Resuelto!" : "Esto me sirvió"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
