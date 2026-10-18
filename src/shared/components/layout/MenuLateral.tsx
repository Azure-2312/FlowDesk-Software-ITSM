"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OpcionMenuArbol } from "@/types";

interface Props {
  opciones: OpcionMenuArbol[];
  nivel?: number;
}

function algunDescendienteCoincide(opcion: OpcionMenuArbol, ruta: string): boolean {
  if (!opcion.hijos || opcion.hijos.length === 0) return false;
  return opcion.hijos.some(
    (h) => h.url_menu === ruta || algunDescendienteCoincide(h, ruta)
  );
}

/**
 * Renderiza el árbol jerárquico del menú (hasta 3 o más niveles).
 * - Soporta contadores (badges) en tiempo real para perfiles operativos (Técnico).
 * - Respeta opciones abiertas por defecto y persistencia de acordeón.
 * - Las hojas terminales se resaltan con fondo activo azul.
 */
export default function Menu({ opciones, nivel = 1 }: Props) {
  const pathname = usePathname();

  // Estados de contadores en tiempo real
  const [contadores, setContadores] = useState<Record<string, { total: number; color: "gris" | "ambar" | "rojo" }>>({});

  useEffect(() => {
    // Si alguna opción del menú requiere contadores, consultamos el endpoint
    const tieneContadores = opciones.some(
      (o) => Boolean(o.contador_clave) || (o.hijos && o.hijos.some((h) => Boolean(h.contador_clave)))
    );

    if (tieneContadores && nivel === 1) {
      async function cargarContadores() {
        try {
          const res = await fetch("/api/perfiles/tecnico/contadores", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            setContadores(data);
          }
        } catch {
          // Ignorar fallo de red silencioso
        }
      }

      cargarContadores();
      const intervalo = setInterval(cargarContadores, 25000); // 25s
      return () => clearInterval(intervalo);
    }
  }, [opciones, nivel]);

  // Expandir nodos que tengan hijos y estén marcados como abiertos por defecto o por ruta activa
  const [expandidos, setExpandidos] = useState<Set<number>>(() => {
    return new Set(
      opciones
        .filter((o) => o.hijos.length > 0 && (o.abierto_por_defecto || true))
        .map((o) => o.id_opcion_menu)
    );
  });

  // Auto-expandir carpetas si el pathname coincide con alguno de sus descendientes
  useEffect(() => {
    opciones.forEach((op) => {
      if (op.hijos.length > 0 && algunDescendienteCoincide(op, pathname)) {
        setExpandidos((prev) => new Set([...prev, op.id_opcion_menu]));
      }
    });
  }, [pathname, opciones]);

  if (opciones.length === 0) return null;

  const claseLista =
    nivel === 1
      ? "menu-nivel-1"
      : nivel === 2
      ? "menu-hijos-nivel-2"
      : nivel === 3
      ? "menu-hijos-nivel-3"
      : "menu-hijos-nivel-4";

  function alternarExpandido(id: number) {
    setExpandidos((anterior) => {
      const copia = new Set(anterior);
      copia.has(id) ? copia.delete(id) : copia.add(id);
      return copia;
    });
  }

  return (
    <ul className={claseLista}>
      {opciones.map((opcion) => {
        const tieneHijos = Boolean(opcion.hijos && opcion.hijos.length > 0);
        const estaExpandido = expandidos.has(opcion.id_opcion_menu);
        const tieneDescendienteActivo = tieneHijos && algunDescendienteCoincide(opcion, pathname);

        // Regla de la arquitectura del menú: url_menu vacío = CARPETA (no navega,
        // solo despliega/contrae); url_menu con valor = PÁGINA (navega).
        // Por eso SOLO una página con URL recibe el estado activo azul.
        const navegable = !tieneHijos && Boolean(opcion.url_menu);
        const estaActivo =
          navegable &&
          (pathname === opcion.url_menu || pathname.startsWith(opcion.url_menu.split("?")[0] + "/"));

        const badge = opcion.contador_clave ? contadores[opcion.contador_clave] : null;

        return (
          <li key={opcion.id_opcion_menu} className={tieneHijos ? "menu-nodo-padre" : "menu-nodo-hoja"}>
            <div className="menu-fila">
              {tieneHijos ? (
                // Carpeta contenedora: despliega / contrae hijos.
                // Cuando una carpeta tenga url_menu (página resumen de la carpeta),
                // el clic debería desplegar y el doble clic navegar.
                <button
                  type="button"
                  className={"menu-item menu-item-carpeta" + (tieneDescendienteActivo ? " menu-carpeta-activa" : "")}
                  onClick={() => alternarExpandido(opcion.id_opcion_menu)}
                  aria-expanded={estaExpandido}
                >
                  <span className="menu-texto-carpeta" style={{ flex: 1, textAlign: "left" }}>
                    {opcion.nombre}
                  </span>
                  <span
                    className="menu-icono-flecha"
                    style={{
                      transform: estaExpandido ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                    }}
                    aria-hidden="true"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </button>
              ) : navegable ? (
                // Página terminal: navega
                <Link
                  href={opcion.url_menu}
                  className={"menu-item" + (estaActivo ? " menu-item-activo" : "")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {opcion.nombre}
                  </span>
                  {badge && badge.total > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 10,
                        padding: "1px 6px",
                        lineHeight: "14px",
                        backgroundColor:
                          badge.color === "rojo"
                            ? "#ef4444"
                            : badge.color === "ambar"
                            ? "#f59e0b"
                            : "#475569",
                        color: "#ffffff",
                        flexShrink: 0,
                      }}
                    >
                      {badge.total}
                    </span>
                  )}
                </Link>
              ) : (
                // Carpeta sin subopciones activas (url_menu vacío): no navega
                <span
                  className="menu-item"
                  style={{ display: "flex", alignItems: "center", gap: 6, cursor: "default" }}
                  aria-disabled="true"
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {opcion.nombre}
                  </span>
                </span>
              )}
            </div>

            {tieneHijos && estaExpandido && (
              <Menu opciones={opcion.hijos} nivel={nivel + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}
