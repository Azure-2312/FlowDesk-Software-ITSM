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
 * Pestañas de vista sincronizadas con la URL (?vista=<codigo>).
 * - Conserva filtros secundarios especificados (alcance, tipo, solo-mios, abrir, etc.).
 * - Oculta la barra de pestañas si solo hay 1 vista disponible.
 * - Usa las clases .pestanas/.pestana del sistema de diseño: misma forma que
 *   <Pestanas> (pestañas con estado local). No se envuelve en tarjetas.
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
    <nav className={`pestanas ${className}`.trim()} aria-label="Pestañas de vista">
      {vistas.map((vista) => {
        const estaActiva = vista.codigo === vistaActiva;
        return (
          <Link
            key={vista.codigo}
            href={construirUrlVista(vista.codigo)}
            replace
            className={estaActiva ? "pestana pestana-activa" : "pestana"}
            aria-current={estaActiva ? "page" : undefined}
          >
            {vista.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
