"use client";

import React from "react";

export interface BotonIconoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icono: React.ReactNode;
  titulo: string;
  ariaLabel?: string;
  /** "peligro" pinta el icono en rojo (eliminar, dar de baja). */
  variante?: "normal" | "peligro" | "primario" | "exito";
}

/**
 * Botón de solo icono del sistema de diseño (.boton-icono). Exige título para
 * accesibilidad, ya que no lleva texto visible.
 */
export const BotonIcono: React.FC<BotonIconoProps> = ({
  icono,
  titulo,
  ariaLabel,
  variante = "normal",
  className = "",
  ...props
}) => {
  const clases = ["boton-icono", "boton-sm", variante === "peligro" ? "boton-icono-peligro" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" title={titulo} aria-label={ariaLabel || titulo} className={clases} {...props}>
      {icono}
    </button>
  );
};
