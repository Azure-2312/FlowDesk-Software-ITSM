"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

const ANCHO_MINIMO = 260;
const ANCHO_MAXIMO = 500;
const ANCHO_PREDETERMINADO = 290;
const CLAVE_STORAGE = "flowdesk_sidebar_width";

interface Props {
  children: React.ReactNode;
}

/**
 * Contenedor redimensionable con el mouse para el menu lateral (sidebar).
 * - Permite estirar o encoger el menu arrastrando el borde derecho.
 * - Doble clic en la manija restaura el ancho predeterminado (290px).
 * - Persiste el ancho elegido por el usuario en localStorage.
 * - Limita el ancho entre 260px y 500px para mantener usabilidad.
 */
export default function BarraLateral({ children }: Props) {
  const [ancho, setAncho] = useState<number>(ANCHO_PREDETERMINADO);
  const [arrastrando, setArrastrando] = useState<boolean>(false);
  const arrastrandoRef = useRef<boolean>(false);

  // Cargar ancho guardado en localStorage al montar en cliente
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE);
      if (guardado) {
        const parsed = parseInt(guardado, 10);
        if (!isNaN(parsed) && parsed >= ANCHO_MINIMO && parsed <= ANCHO_MAXIMO) {
          setAncho(parsed);
          document.documentElement.style.setProperty("--ancho-sidebar", `${parsed}px`);
        }
      } else {
        document.documentElement.style.setProperty("--ancho-sidebar", `${ANCHO_PREDETERMINADO}px`);
      }
    } catch {
      // Ignorar fallo de acceso a localStorage en entornos restringidos
    }
  }, []);

  const actualizarAncho = useCallback((nuevoAncho: number) => {
    const ajustado = Math.min(ANCHO_MAXIMO, Math.max(ANCHO_MINIMO, Math.round(nuevoAncho)));
    setAncho(ajustado);
    document.documentElement.style.setProperty("--ancho-sidebar", `${ajustado}px`);
    try {
      localStorage.setItem(CLAVE_STORAGE, String(ajustado));
    } catch {
      // Ignorar fallo
    }
  }, []);

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
    <aside
      className="barra-lateral"
      style={{
        width: `${ancho}px`,
        minWidth: `${ancho}px`,
        maxWidth: `${ancho}px`,
      }}
    >
      {children}

      {/* Manija interactiva en el borde derecho para estirar con el mouse */}
      <div
        className={`manija-redimension-sidebar ${arrastrando ? "arrastrando" : ""}`}
        onMouseDown={iniciarArrastre}
        onDoubleClick={restaurarPredeterminado}
        title="Arrastra para redimensionar el menú lateral. Doble clic para reiniciar a 290px."
        aria-label="Redimensionar menú lateral"
        role="separator"
        aria-orientation="vertical"
      />
    </aside>
  );
}
