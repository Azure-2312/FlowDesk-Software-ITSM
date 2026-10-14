"use client";

import React from "react";

export interface BarraAccionesComunProps {
  versionPublicada: number;
  fechaPublicada?: string;
  autorPublicada?: string;
  hayBorrador: boolean;
  guardando: boolean;
  publicando: boolean;
  bloqueadoPorOtro?: string;
  puedePublicar: boolean;
  puedeEditar: boolean;
  onGuardarBorrador: () => void;
  onVistaPrevia: () => void;
  onAbrirPublicar: () => void;
  onDescartar: () => void;
  onRestaurarFabrica: () => void;
  onVerHistorial: () => void;
  onExportar: () => void;
  onImportar: () => void;
}

export const BarraAccionesComun: React.FC<BarraAccionesComunProps> = ({
  versionPublicada,
  fechaPublicada,
  autorPublicada,
  hayBorrador,
  guardando,
  publicando,
  bloqueadoPorOtro,
  puedePublicar,
  puedeEditar,
  onGuardarBorrador,
  onVistaPrevia,
  onAbrirPublicar,
  onDescartar,
  onRestaurarFabrica,
  onVerHistorial,
  onExportar,
  onImportar,
}) => {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: "#ffffff",
        borderTop: "1px solid #cbd5e1",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 -4px 14px rgba(0, 0, 0, 0.08)",
        minWidth: 1200,
      }}
    >
      {/* 1. Estado de la version y borrador (Izquierda) */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 9,
              height: 9,
              borderRadius: "50%",
              backgroundColor: hayBorrador ? "#f59e0b" : "#10b981",
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
            v{versionPublicada} (Publicada)
          </span>
          {hayBorrador && (
            <span
              style={{
                backgroundColor: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Borrador con cambios no publicados
            </span>
          )}
        </div>

        {fechaPublicada && (
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Ultima publicacion: {fechaPublicada} {autorPublicada && `por ${autorPublicada}`}
          </span>
        )}

        {bloqueadoPorOtro && (
          <span
            style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            Bloqueado por: {bloqueadoPorOtro}
          </span>
        )}
      </div>

      {/* 2. Botones de accion (Derecha) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 8 }}>
          <button
            type="button"
            onClick={onExportar}
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              padding: "7px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            Exportar
          </button>
          <button
            type="button"
            onClick={onImportar}
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              padding: "7px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            Importar
          </button>
        </div>

        <button
          type="button"
          onClick={onVerHistorial}
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            padding: "7px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            color: "#334155",
            cursor: "pointer",
          }}
        >
          Historial
        </button>

        <button
          type="button"
          onClick={onRestaurarFabrica}
          disabled={!puedeEditar || !!bloqueadoPorOtro}
          style={{
            backgroundColor: "#fff1f2",
            border: "1px solid #fecdd3",
            borderRadius: 6,
            padding: "7px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            color: "#be123c",
            cursor: puedeEditar && !bloqueadoPorOtro ? "pointer" : "not-allowed",
            opacity: puedeEditar && !bloqueadoPorOtro ? 1 : 0.5,
          }}
        >
          Restaurar Fabrica
        </button>

        <button
          type="button"
          onClick={onDescartar}
          disabled={!hayBorrador || !puedeEditar || !!bloqueadoPorOtro}
          style={{
            backgroundColor: "transparent",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            padding: "7px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            color: hayBorrador && puedeEditar && !bloqueadoPorOtro ? "#dc2626" : "#94a3b8",
            cursor: hayBorrador && puedeEditar && !bloqueadoPorOtro ? "pointer" : "not-allowed",
            opacity: hayBorrador && puedeEditar && !bloqueadoPorOtro ? 1 : 0.5,
          }}
        >
          Descartar borrador
        </button>

        <button
          type="button"
          onClick={onVistaPrevia}
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 6,
            padding: "7px 14px",
            fontSize: 12.5,
            fontWeight: 600,
            color: "#1d4ed8",
            cursor: "pointer",
          }}
        >
          Vista previa
        </button>

        <button
          type="button"
          onClick={onGuardarBorrador}
          disabled={guardando || !puedeEditar || !!bloqueadoPorOtro}
          style={{
            backgroundColor: "#f59e0b",
            border: "1px solid #d97706",
            borderRadius: 6,
            padding: "7px 18px",
            fontSize: 13,
            fontWeight: 700,
            color: "#ffffff",
            cursor: !guardando && puedeEditar && !bloqueadoPorOtro ? "pointer" : "not-allowed",
            opacity: !guardando && puedeEditar && !bloqueadoPorOtro ? 1 : 0.5,
          }}
        >
          {guardando ? "Guardando..." : "Guardar borrador"}
        </button>

        <button
          type="button"
          onClick={onAbrirPublicar}
          disabled={publicando || !puedePublicar || !!bloqueadoPorOtro}
          style={{
            backgroundColor: "#2563eb",
            border: "1px solid #1d4ed8",
            borderRadius: 6,
            padding: "7px 20px",
            fontSize: 13,
            fontWeight: 700,
            color: "#ffffff",
            cursor: !publicando && puedePublicar && !bloqueadoPorOtro ? "pointer" : "not-allowed",
            opacity: !publicando && puedePublicar && !bloqueadoPorOtro ? 1 : 0.5,
          }}
        >
          {publicando ? "Publicando..." : "Publicar cambios"}
        </button>
      </div>
    </footer>
  );
};
