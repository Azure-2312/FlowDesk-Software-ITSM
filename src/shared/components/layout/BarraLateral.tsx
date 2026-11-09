"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const ANCHO_MINIMO = 260;
const ANCHO_MAXIMO = 500;
const ANCHO_PREDETERMINADO = 290;
const CLAVE_STORAGE = "flowdesk_sidebar_width";
const CLAVE_COLAPSO = "flowdesk_sidebar_colapsado";

interface Props {
  children: React.ReactNode;
}

/**
 * Contenedor redimensionable y colapsable para el menú lateral (sidebar).
 * - Permite contraer y expandir el menú para maximizar el área de trabajo.
 * - Soporta redimensión arrastrando el borde derecho.
 * - Doble clic en la manija restaura el ancho predeterminado (290px).
 * - Atajo de teclado: Ctrl+B para alternar visibilidad.
 */
export default function BarraLateral({ children }: Props) {
  const [ancho, setAncho] = useState<number>(ANCHO_PREDETERMINADO);
  const [colapsado, setColapsado] = useState<boolean>(false);
  const [arrastrando, setArrastrando] = useState<boolean>(false);
  const arrastrandoRef = useRef<boolean>(false);

  // Cargar ancho y estado de colapso desde localStorage al montar en cliente
  useEffect(() => {
    try {
      const colapsadoGuardado = localStorage.getItem(CLAVE_COLAPSO) === "true";
      setColapsado(colapsadoGuardado);

      const guardado = localStorage.getItem(CLAVE_STORAGE);
      if (guardado) {
        const parsed = parseInt(guardado, 10);
        if (!isNaN(parsed) && parsed >= ANCHO_MINIMO && parsed <= ANCHO_MAXIMO) {
          setAncho(parsed);
          document.documentElement.style.setProperty(
            "--ancho-sidebar",
            colapsadoGuardado ? "0px" : `${parsed}px`
          );
          return;
        }
      }
      document.documentElement.style.setProperty(
        "--ancho-sidebar",
        colapsadoGuardado ? "0px" : `${ANCHO_PREDETERMINADO}px`
      );
    } catch {
      // Ignorar fallo de acceso a localStorage
    }
  }, []);

  const alternarColapso = useCallback(() => {
    setColapsado((prev) => {
      const nuevo = !prev;
      document.documentElement.style.setProperty(
        "--ancho-sidebar",
        nuevo ? "0px" : `${ancho}px`
      );
      try {
        localStorage.setItem(CLAVE_COLAPSO, String(nuevo));
      } catch {
        // Ignorar
      }
      return nuevo;
    });
  }, [ancho]);

  // Atajo de teclado: Ctrl + B para contraer/expandir menú
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        alternarColapso();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [alternarColapso]);

  const actualizarAncho = useCallback((nuevoAncho: number) => {
    const ajustado = Math.min(ANCHO_MAXIMO, Math.max(ANCHO_MINIMO, Math.round(nuevoAncho)));
    setAncho(ajustado);
    if (!colapsado) {
      document.documentElement.style.setProperty("--ancho-sidebar", `${ajustado}px`);
    }
    try {
      localStorage.setItem(CLAVE_STORAGE, String(ajustado));
    } catch {
      // Ignorar fallo
    }
  }, [colapsado]);

  const iniciarArrastre = (e: React.MouseEvent) => {
    e.preventDefault();
    arrastrandoRef.current = true;
    setArrastrando(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const restaurarPredeterminado = () => {
    actualizarAncho(ANCHO_PREDETERMINADO);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!arrastrandoRef.current) return;
      actualizarAncho(e.clientX);
    };

    const handleMouseUp = () => {
      if (arrastrandoRef.current) {
        arrastrandoRef.current = false;
        setArrastrando(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [actualizarAncho]);

  return (
    <>
      {/* Botón flotante para expandir el menú cuando está colapsado */}
      {colapsado && (
        <button
          type="button"
          onClick={alternarColapso}
          title="Expandir menú lateral (Ctrl+B)"
          aria-label="Expandir menú lateral"
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            border: "1px solid #334155",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1e293b";
            e.currentTarget.style.borderColor = "#3b82f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#0f172a";
            e.currentTarget.style.borderColor = "#334155";
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span>Menú</span>
        </button>
      )}

      <aside
        className={`barra-lateral ${colapsado ? "colapsada" : ""}`}
        style={
          colapsado
            ? { width: 0, minWidth: 0, maxWidth: 0 }
            : {
                width: `${ancho}px`,
                minWidth: `${ancho}px`,
                maxWidth: `${ancho}px`,
              }
        }
      >
        {/* Botón superior para contraer el menú */}
        {!colapsado && (
          <button
            type="button"
            onClick={alternarColapso}
            title="Contraer menú lateral (Ctrl+B)"
            aria-label="Contraer menú lateral"
            style={{
              position: "absolute",
              top: 14,
              right: 12,
              zIndex: 65,
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: 4,
              color: "#94a3b8",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.backgroundColor = "#374151";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.backgroundColor = "#1f2937";
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {children}

        {/* Manija interactiva en el borde derecho para estirar con el mouse */}
        {!colapsado && (
          <div
            className={`manija-redimension-sidebar ${arrastrando ? "arrastrando" : ""}`}
            onMouseDown={iniciarArrastre}
            onDoubleClick={restaurarPredeterminado}
            title="Arrastra para redimensionar el menú lateral. Doble clic para reiniciar a 290px."
            aria-label="Redimensionar menú lateral"
            role="separator"
            aria-orientation="vertical"
          />
        )}
      </aside>
    </>
  );
}
