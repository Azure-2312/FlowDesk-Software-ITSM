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
  const deshabilitadoPorBloqueo = !!bloqueadoPorOtro;

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
        minWidth: 1000,
      }}
    >
      {/* Lado Izquierdo: Información de versión y estado */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="badge-itil"
            style={{
              backgroundColor: hayBorrador ? "#fef3c7" : "#dcfce7",
              color: hayBorrador ? "#92400e" : "#166534",
              border: `1px solid ${hayBorrador ? "#fde68a" : "#86efac"}`,
              fontWeight: 700,
              fontSize: 12,
              padding: "4px 8px",
            }}
          >
            {hayBorrador ? "Borrador con cambios sin publicar" : `Publicada v${versionPublicada}`}
          </span>
          {hayBorrador && (
            <span style={{ fontSize: 11, color: "#d97706", fontWeight: 600 }}>
              (Cambios pendientes de aprobación técnica)
            </span>
          )}
        </div>

        {fechaPublicada && (
          <span style={{ fontSize: 11.5, color: "#64748b" }}>
            Última publicación: {new Date(fechaPublicada).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
            {autorPublicada ? ` por ${autorPublicada}` : ""}
          </span>
        )}

        {bloqueadoPorOtro && (
          <span
            style={{
              fontSize: 11,
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "2px 8px",
              borderRadius: 4,
              border: "1px solid #fca5a5",
              fontWeight: 600,
            }}
          >
            En edición por {bloqueadoPorOtro} (Solo lectura)
          </span>
        )}
      </div>

      {/* Lado Derecho: Botones de Acción (Sección 3.1) */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          className="boton-secundario"
          onClick={onGuardarBorrador}
          disabled={guardando || deshabilitadoPorBloqueo || !puedeEditar}
          style={{ fontSize: 12, padding: "7px 12px", opacity: deshabilitadoPorBloqueo ? 0.5 : 1 }}
          title="Guardar borrador de trabajo sin alterar la versión en producción"
        >
          {guardando ? "Guardando..." : "Guardar borrador"}
        </button>

        <button
          type="button"
          className="boton-secundario"
          onClick={onVistaPrevia}
          style={{ fontSize: 12, padding: "7px 12px" }}
          title="Previsualizar cómo se comporta el formulario o ticket según el rol"
        >
          Vista previa
        </button>

        <button
          type="button"
          className="boton-primario"
          onClick={onAbrirPublicar}
          disabled={publicando || deshabilitadoPorBloqueo || !puedePublicar}
          style={{
            fontSize: 12,
            padding: "7px 16px",
            backgroundColor: "#2563eb",
            fontWeight: 700,
            opacity: deshabilitadoPorBloqueo || !puedePublicar ? 0.5 : 1,
          }}
          title="Abre el modal de publicación formal con análisis de impacto y diff"
        >
          {publicando ? "Publicando..." : "Publicar..."}
        </button>

        <span style={{ width: 1, height: 20, backgroundColor: "#cbd5e1", margin: "0 4px" }} />

        <button
          type="button"
          onClick={onDescartar}
          disabled={!hayBorrador || deshabilitadoPorBloqueo || !puedeEditar}
          style={{
            fontSize: 12,
            color: hayBorrador ? "#dc2626" : "#94a3b8",
            background: "none",
            border: "none",
            cursor: hayBorrador ? "pointer" : "default",
            padding: "6px 8px",
            fontWeight: 600,
          }}
          title="Descartar borrador y recargar la última versión publicada"
        >
          Descartar cambios
        </button>

        <button
          type="button"
          onClick={onRestaurarFabrica}
          disabled={deshabilitadoPorBloqueo || !puedeEditar}
          style={{
            fontSize: 12,
            color: "#475569",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 8px",
          }}
          title="Restaurar valores de fábrica ITIL v4 de esta pestaña"
        >
          Restaurar fábrica
        </button>

        <button
          type="button"
          onClick={onVerHistorial}
          style={{
            fontSize: 12,
            color: "#2563eb",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 8px",
            fontWeight: 600,
          }}
          title="Consultar historial inmutable de versiones de esta pestaña"
        >
          Historial de versiones
        </button>

        <button
          type="button"
          onClick={onExportar}
          style={{
            fontSize: 12,
            color: "#475569",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 6px",
          }}
          title="Exportar configuración de la pestaña a archivo JSON"
        >
          Exportar
        </button>

        <button
          type="button"
          onClick={onImportar}
          disabled={deshabilitadoPorBloqueo || !puedeEditar}
          style={{
            fontSize: 12,
            color: "#475569",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 6px",
          }}
          title="Importar configuración JSON en borrador"
        >
          Importar
        </button>
      </div>
    </footer>
  );
};
