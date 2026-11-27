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
  /**
   * Regla: las pestañas van ARRIBA del título de la pantalla. Solo un selector
   * dentro de una tarjeta/panel ("panel") o de la ficha de un registro ("ficha")
   * puede ir debajo; se marca aquí para que el verificador lo acepte.
   */
  ambito?: "panel" | "ficha";
}

/**
 * Pestañas del sistema de diseño para cambiar de sección dentro de una vista
 * (estado local). Comparte forma y clases con <PestanasVista>, que hace lo
 * mismo pero sincronizado con la URL (?vista=). Ninguna vista debe dibujar
 * pestañas propias. Siempre se ubican antes del título (ver RanuraSubpestanas).
 */
export default function Pestanas<T extends string = string>({
  items,
  activa,
  onCambiar,
  className = "",
  etiquetaAccesible = "Secciones",
  ambito,
}: PestanasProps<T>) {
  return (
    <div className={`pestanas ${className}`.trim()} role="tablist" aria-label={etiquetaAccesible} data-ambito={ambito}>
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
