"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

interface TablaDobleScrollProps {
  children: React.ReactNode;
  minWidth?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente que renderiza una barra de desplazamiento horizontal sincronizada
 * tanto en la parte superior como en la inferior de la tabla.
 * Permite navegar tablas anchas sin tener que desplazarse hasta el fondo de la pantalla.
 */
export function TablaDobleScroll({
  children,
  minWidth,
  className = "",
  style = {},
}: TablaDobleScrollProps) {
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState<number>(0);
  const [hasOverflow, setHasOverflow] = useState<boolean>(false);

  const updateWidth = useCallback(() => {
    if (bottomScrollRef.current) {
      const sw = bottomScrollRef.current.scrollWidth;
      const cw = bottomScrollRef.current.clientWidth;
      setScrollWidth(sw);
      setHasOverflow(sw > cw + 2);
    }
  }, []);

  useEffect(() => {
    updateWidth();
    const el = bottomScrollRef.current;
    if (!el) return;

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateWidth();
      });
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    }

    const handleWindowResize = () => updateWidth();
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [updateWidth]);

  // Sincronización bidireccional entre la barra superior y la inferior
  useEffect(() => {
    const topEl = topScrollRef.current;
    const bottomEl = bottomScrollRef.current;
    if (!topEl || !bottomEl) return;

    let activeSync: "top" | "bottom" | null = null;

    const handleTopScroll = () => {
      if (activeSync === "bottom") return;
      activeSync = "top";
      bottomEl.scrollLeft = topEl.scrollLeft;
      requestAnimationFrame(() => {
        activeSync = null;
      });
    };

    const handleBottomScroll = () => {
      if (activeSync === "top") return;
      activeSync = "bottom";
      topEl.scrollLeft = bottomEl.scrollLeft;
      requestAnimationFrame(() => {
        activeSync = null;
      });
    };

    topEl.addEventListener("scroll", handleTopScroll, { passive: true });
    bottomEl.addEventListener("scroll", handleBottomScroll, { passive: true });

    return () => {
      topEl.removeEventListener("scroll", handleTopScroll);
      bottomEl.removeEventListener("scroll", handleBottomScroll);
    };
  }, [hasOverflow]);

  return (
    <div
      className={`tabla-doble-scroll-wrapper ${className}`}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* Scrollbar horizontal superior sincronizado */}
      {hasOverflow && (
        <div
          ref={topScrollRef}
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            width: "100%",
            height: "14px",
            marginBottom: "6px",
            backgroundColor: "#f1f5f9",
            borderRadius: "4px",
            border: "1px solid #e2e8f0",
          }}
          title="Desplazamiento horizontal (barra superior)"
        >
          <div
            style={{
              width: `${scrollWidth}px`,
              height: "1px",
              minWidth: "100%",
            }}
          />
        </div>
      )}

      {/* Contenedor inferior de tabla con scroll horizontal */}
      <div
        ref={bottomScrollRef}
        style={{
          overflowX: "auto",
          width: "100%",
        }}
      >
        {minWidth ? (
          <div style={{ minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth, width: "100%" }}>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default TablaDobleScroll;
