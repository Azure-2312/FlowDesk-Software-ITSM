"use client";

import Link from "next/link";
import { DefinicionVista } from "@/shared/lib/vistas";

export interface PestanasVistaProps {
  vistas: DefinicionVista[];
  vistaActiva: string;
  urlBase: string;
  filtrosSecundarios?: Record<string, string | number | boolean | undefined | null>;
  className?: string;
}

/**
 * Componente unificado de pestañas de vista (N1).
 * - Renderiza enlaces con ?vista=<codigo>.
 * - Conserva filtros secundarios especificados (alcance, tipo, solo-mios, abrir, etc.).
 * - Oculta la barra de pestañas si solo hay 1 vista disponible.
 * - Resalta la vista activa con indicador visual azul institucional.
 */
export default function PestanasVista({
  vistas,
  vistaActiva,
  urlBase,
  filtrosSecundarios = {},
  className = "",
}: PestanasVistaProps) {
  if (!vistas || vistas.length <= 1) {
    return null;
  }

  // Serializa los filtros secundarios conservados
  function construirUrlVista(codigoVista: string): string {
    const params = new URLSearchParams();
    params.set("vista", codigoVista);

    Object.entries(filtrosSecundarios).forEach(([clave, valor]) => {
      if (clave !== "vista" && valor !== undefined && valor !== null && valor !== "") {
        params.set(clave, String(valor));
      }
    });

    return `${urlBase}?${params.toString()}`;
  }

  return (
    <nav
      className={`pestanas-vista-nav ${className}`}
      aria-label="Pestañas de vista"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        borderBottom: "1px solid #e2e8f0",
        marginBottom: 0,
        // En pantallas estrechas las pestañas pasan a otra fila en vez de
        // quedar ocultas detrás de un scroll horizontal.
        flexWrap: "wrap",
      }}
    >
      {vistas.map((vista) => {
        const estaActiva = vista.codigo === vistaActiva;
        return (
          <Link
            key={vista.codigo}
            href={construirUrlVista(vista.codigo)}
            replace
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: estaActiva ? 600 : 500,
              color: estaActiva ? "#2563eb" : "#64748b",
              borderBottom: estaActiva ? "2px solid #2563eb" : "2px solid transparent",
              marginBottom: -1,
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              borderRadius: "4px 4px 0 0",
            }}
            aria-current={estaActiva ? "page" : undefined}
          >
            <span>{vista.etiqueta}</span>
          </Link>
        );
      })}
    </nav>
  );
}
