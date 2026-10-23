"use client";

import { useEffect, useState } from "react";

interface ArticuloOpcion {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  categoria_nombre?: string;
}

interface ModalVincularArticuloTicketProps {
  idTicket: number;
  abierto: boolean;
  alCerrar: () => void;
  alVincularExitoso: () => void;
}

export default function ModalVincularArticuloTicket({
  idTicket,
  abierto,
  alCerrar,
  alVincularExitoso,
}: ModalVincularArticuloTicketProps) {
  const [busqueda, setBusqueda] = useState("");
  const [articulos, setArticulos] = useState<ArticuloOpcion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [vinculando, setVinculando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!abierto) return;
    async function buscar() {
      setCargando(true);
      setError("");
      try {
        const url = busqueda.trim()
          ? `/api/conocimiento?buscar=${encodeURIComponent(busqueda.trim())}`
          : "/api/conocimiento";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setArticulos(Array.isArray(data) ? data : []);
        }
      } catch (e: any) {
        setError("Error al buscar artículos");
      } finally {
        setCargando(false);
      }
    }
    const timer = setTimeout(buscar, 300);
    return () => clearTimeout(timer);
  }, [busqueda, abierto]);

  async function ejecutarVinculo(idArticulo: number) {
    setVinculando(true);
    setError("");
    try {
      const res = await fetch("/api/conocimiento/vinculo-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_articulo: idArticulo,
          id_ticket: idTicket,
          resolvio_ticket: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo vincular");
      alVincularExitoso();
      alCerrar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setVinculando(false);
    }
  }

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Vincular Artículo de Conocimiento al Ticket #{idTicket}
          </h3>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 rounded text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar artículo por título, código o tema..."
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg">
          {cargando ? (
            <div className="p-4 text-center text-xs text-slate-500">Buscando soluciones...</div>
          ) : articulos.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">No se encontraron artículos.</div>
          ) : (
            articulos.map((art) => (
              <div
                key={art.id_articulo}
                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="max-w-xs">
                  <span className="text-[10px] font-mono font-bold text-blue-600 block">
                    {art.codigo_articulo}
                  </span>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {art.titulo}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={vinculando}
                  onClick={() => ejecutarVinculo(art.id_articulo)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors shrink-0"
                >
                  Vincular
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={alCerrar}
            className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
