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
 * - Botón de contraer/expandir ubicado en el punto medio de la altura, en el límite derecho.
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

  const actualizarAncho = useCallback(
    (nuevoAncho: number) => {
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
    },
    [colapsado]
  );

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
      {/* Botón flotante pegado al límite izquierdo a media altura para expandir cuando está colapsado */}
      {colapsado && (
        <button
          type="button"
          onClick={alternarColapso}
          title="Expandir menú lateral (Ctrl+B)"
          aria-label="Expandir menú lateral"
          style={{
            position: "fixed",
            top: "50%",
            left: 0,
            transform: "translateY(-50%)",
            zIndex: 9999,
            width: 22,
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
            borderLeft: "none",
            borderRadius: "0 6px 6px 0",
            color: "#cbd5e1",
            cursor: "pointer",
            boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.35)",
            transition: "all 0.15s ease",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2563eb";
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1e293b";
            e.currentTarget.style.borderColor = "#475569";
            e.currentTarget.style.color = "#cbd5e1";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
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
        {/* Botón en medio de toda la altura pegado al límite derecho para contraer el menú */}
        {!colapsado && (
          <button
            type="button"
            onClick={alternarColapso}
            title="Contraer menú lateral (Ctrl+B)"
            aria-label="Contraer menú lateral"
            style={{
              position: "absolute",
              top: "50%",
              right: "-11px",
              transform: "translateY(-50%)",
              zIndex: 85,
              width: 22,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "6px",
              color: "#cbd5e1",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.35)",
              transition: "all 0.15s ease",
              padding: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2563eb";
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1e293b";
              e.currentTarget.style.borderColor = "#475569";
              e.currentTarget.style.color = "#cbd5e1";
            }}
          >
            <svg
              width="14"
              height="14"
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
