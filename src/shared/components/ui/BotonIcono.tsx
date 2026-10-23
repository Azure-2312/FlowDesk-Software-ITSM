"use client";

import React from "react";

export interface BotonIconoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icono: React.ReactNode;
  titulo: string;
  ariaLabel?: string;
  variante?: "normal" | "peligro" | "primario" | "exito";
}

export const BotonIcono: React.FC<BotonIconoProps> = ({
  icono,
  titulo,
  ariaLabel,
  variante = "normal",
  disabled,
  className = "",
  style,
  ...props
}) => {
  const baseClass =
    variante === "peligro"
      ? "boton-accion-icono boton-accion-peligro"
      : variante === "primario"
      ? "boton-accion-icono boton-accion-primario"
      : variante === "exito"
      ? "boton-accion-icono boton-accion-exito"
      : "boton-accion-icono";

  return (
    <button
      type="button"
      title={titulo}
      aria-label={ariaLabel || titulo}
      disabled={disabled}
      className={`${baseClass} ${className}`.trim()}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        ...style,
      }}
      {...props}
    >
      {icono}
    </button>
  );
};
