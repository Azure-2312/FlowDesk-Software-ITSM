"use client";

import type { ReactNode } from "react";

export interface ItemPestana<T extends string = string> {
  id: T;
  etiqueta: ReactNode;
  /** Número opcional que se muestra junto a la etiqueta (p. ej. pendientes) */
  contador?: number | null;
  deshabilitada?: boolean;
}

export interface PestanasProps<T extends string = string> {
  items: ItemPestana<T>[];
  activa: T;
  onCambiar: (id: T) => void;
  className?: string;
  etiquetaAccesible?: string;
}

/**
 * Pestañas del sistema de diseño para cambiar de sección dentro de una vista
 * (estado local). Comparte forma y clases con <PestanasVista>, que hace lo
 * mismo pero sincronizado con la URL (?vista=). Ninguna vista debe dibujar
 * pestañas propias.
 */
export default function Pestanas<T extends string = string>({
  items,
  activa,
  onCambiar,
  className = "",
  etiquetaAccesible = "Secciones",
}: PestanasProps<T>) {
  return (
    <div className={`pestanas ${className}`.trim()} role="tablist" aria-label={etiquetaAccesible}>
      {items.map((item) => {
        const estaActiva = item.id === activa;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={estaActiva}
            disabled={item.deshabilitada}
            className={estaActiva ? "pestana pestana-activa" : "pestana"}
            onClick={() => onCambiar(item.id)}
          >
            {item.etiqueta}
            {item.contador != null && <span className="pestana-contador">{item.contador}</span>}
          </button>
        );
      })}
    </div>
  );
}
