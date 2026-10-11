"use client";

import React from "react";

interface AlertaCampoProps {
  error?: string | null;
  exito?: string | null;
  info?: string | null;
}

/**
 * Componente unificado para alertas y validaciones en tiempo real debajo de inputs.
 * Cumple con la directiva de cero emojis y diseño formal accesible.
 */
export function AlertaCampo({ error, exito, info }: AlertaCampoProps) {
  if (error) {
    return (
      <span
        role="alert"
        style={{
          display: "block",
          fontSize: 11.5,
          color: "#b91c1c",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          padding: "3px 8px",
          borderRadius: 4,
          marginTop: 4,
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {error}
      </span>
    );
  }

  if (exito) {
    return (
      <span
        style={{
          display: "block",
          fontSize: 11.5,
          color: "#15803d",
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          padding: "3px 8px",
          borderRadius: 4,
          marginTop: 4,
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {exito}
      </span>
    );
  }

  if (info) {
    return (
      <span
        style={{
          display: "block",
          fontSize: 11.5,
          color: "#64748b",
          marginTop: 4,
          lineHeight: 1.4,
        }}
      >
        {info}
      </span>
    );
  }

  return null;
}
