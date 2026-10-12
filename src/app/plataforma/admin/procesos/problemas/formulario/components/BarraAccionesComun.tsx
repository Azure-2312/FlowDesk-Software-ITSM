"use client";

import React from "react";

interface BarraAccionesComunProps {
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
      {/* Información de Versión e Indicadores */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #a7f3d0",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#10b981",
              }}
            />
            Publicada v{versionPublicada}
          </span>
          {fechaPublicada && (
            <span style={{ fontSize: 12, color: "#64748b" }}>
              ({new Date(fechaPublicada).toLocaleDateString()} {autorPublicada ? `por ${autorPublicada}` : ""})
            </span>
          )}
        </div>

        {hayBorrador && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fde68a",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: "#d97706",
              }}
            />
            Borrador sin publicar (v{versionPublicada + 1})
          </span>
        )}

        {bloqueadoPorOtro && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            }}
          >
            Bloqueado por: {bloqueadoPorOtro}
          </span>
        )}
      </div>

      {/* Controles de Acción Principal (7 botones según especificación) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* 1. Exportar / Importar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, borderRight: "1px solid #e2e8f0", paddingRight: 10, marginRight: 4 }}>
          <button
            type="button"
            onClick={onExportar}
            title="Exportar configuración en formato JSON"
            style={{
              backgroundColor: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={onImportar}
            disabled={!puedeEditar || !!bloqueadoPorOtro}
            title="Importar archivo JSON de configuración"
            style={{
              backgroundColor: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "#334155",
              cursor: puedeEditar && !bloqueadoPorOtro ? "pointer" : "not-allowed",
              opacity: puedeEditar && !bloqueadoPorOtro ? 1 : 0.5,
            }}
          >
            Importar
          </button>
        </div>

        {/* 2. Historial de versiones */}
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
          Historial de versiones
        </button>

        {/* 3. Restaurar de fábrica */}
        <button
          type="button"
          onClick={onRestaurarFabrica}
          disabled={!puedeEditar || !!bloqueadoPorOtro}
          title="Restablece la configuración predeterminada de fábrica"
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
          Restaurar de fábrica
        </button>

        {/* 4. Descartar cambios */}
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

        {/* 5. Vista previa */}
        <button
          type="button"
          onClick={onVistaPrevia}
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 6,
            padding: "7px 16px",
            fontSize: 12.5,
            fontWeight: 600,
            color: "#1d4ed8",
            cursor: "pointer",
          }}
        >
          Vista previa
        </button>

        {/* 6. Guardar borrador */}
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

        {/* 7. Publicar */}
        <button
          type="button"
          onClick={onAbrirPublicar}
          disabled={publicando || !puedePublicar || !!bloqueadoPorOtro}
          title={
            !puedePublicar
              ? "Solo el perfil Administrador cuenta con privilegios para publicar versiones oficiales"
              : "Publica los cambios y crea una nueva versión oficial inmutable"
          }
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
