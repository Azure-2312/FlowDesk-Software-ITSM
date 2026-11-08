"use client";

import React, { useState, useEffect } from "react";
import { CampoFormulario } from "./PestanaCampos";

interface ModalEditarPropiedadesCampoProps {
  abierto: boolean;
  seccionId: string;
  campo: CampoFormulario | null;
  onCerrar: () => void;
  onGuardar: (seccionId: string, codigo: string, patch: Partial<CampoFormulario>) => void;
  puedeEditar?: boolean;
}

export const ModalEditarPropiedadesCampo: React.FC<ModalEditarPropiedadesCampoProps> = ({
  abierto,
  seccionId,
  campo,
  onCerrar,
  onGuardar,
  puedeEditar = true,
}) => {
  const [etiqueta, setEtiqueta] = useState("");
  const [ayuda, setAyuda] = useState("");
  const [ancho, setAncho] = useState<"1/3" | "1/2" | "2/3" | "completo">("completo");
  const [placeholder, setPlaceholder] = useState("");
  const [obligatorio, setObligatorio] = useState<"si" | "no" | "segun_prioridad" | "condicional">("si");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (campo) {
      setEtiqueta(campo.etiqueta || "");
      setAyuda(campo.ayuda || "");
      setAncho(campo.ancho || "completo");
      setPlaceholder(campo.placeholder || "");
      setObligatorio(campo.obligatorio || "si");
      setVisible(campo.visible !== false);
    }
  }, [campo]);

  if (!abierto || !campo) return null;

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeEditar) return;
    onGuardar(seccionId, campo.codigo, {
      etiqueta: etiqueta.trim() || campo.codigo,
      ayuda: ayuda.trim(),
      ancho,
      placeholder: placeholder.trim(),
      obligatorio,
      visible,
    });
    onCerrar();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onCerrar}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: 540,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 4,
                  textTransform: "uppercase",
                }}
              >
                Configurar Campo
              </span>
              <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
                {campo.codigo} ({campo.tipo})
              </span>
            </div>
            <h3 style={{ margin: "4px 0 0 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              {campo.etiqueta || campo.codigo}
            </h3>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="boton-accion-icono"
            title="Cerrar modal"
            aria-label="Cerrar modal"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Formulario de Propiedades */}
        <form onSubmit={handleGuardar} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Etiqueta Visible */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
              Etiqueta visible *
            </label>
            <input
              type="text"
              className="input-base"
              value={etiqueta}
              disabled={!puedeEditar}
              onChange={(e) => setEtiqueta(e.target.value)}
              placeholder="Ej: Título del problema..."
              required
              style={{ width: "100%", fontSize: 13 }}
            />
          </div>

          {/* Texto de Ayuda / Tooltip */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
              Texto de ayuda (Tooltip)
            </label>
            <textarea
              className="input-base"
              rows={2}
              value={ayuda}
              disabled={!puedeEditar}
              onChange={(e) => setAyuda(e.target.value)}
              placeholder="Instrucciones breves para el usuario al rellenar el campo..."
              style={{ width: "100%", fontSize: 12, resize: "vertical" }}
            />
          </div>

          {/* Ancho y Obligatoriedad en Dos Columnas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                Ancho en el formulario
              </label>
              <select
                className="input-base"
                value={ancho}
                disabled={!puedeEditar}
                onChange={(e) => setAncho(e.target.value as any)}
                style={{ width: "100%", fontSize: 12 }}
              >
                <option value="completo">Ancho Completo (100%)</option>
                <option value="1/2">Medio Ancho (50%)</option>
                <option value="1/3">Un Tercio (33%)</option>
                <option value="2/3">Dos Tercios (66%)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                Obligatoriedad
              </label>
              <select
                className="input-base"
                value={obligatorio}
                disabled={!puedeEditar}
                onChange={(e) => setObligatorio(e.target.value as any)}
                style={{ width: "100%", fontSize: 12 }}
              >
                <option value="si">Siempre Obligatorio</option>
                <option value="segun_prioridad">Según Prioridad P1-P5</option>
                <option value="condicional">Condicional (Por Regla)</option>
                <option value="no">Opcional</option>
              </select>
            </div>
          </div>

          {/* Placeholder orientativo */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
              Texto de marcador (Placeholder)
            </label>
            <input
              type="text"
              className="input-base"
              value={placeholder}
              disabled={!puedeEditar}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="Texto orientativo que se muestra cuando el campo está vacío..."
              style={{ width: "100%", fontSize: 12 }}
            />
          </div>

          {/* Visibilidad */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <input
              type="checkbox"
              id="chk-visible-prb"
              checked={visible}
              disabled={!puedeEditar}
              onChange={(e) => setVisible(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <label htmlFor="chk-visible-prb" style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b", cursor: "pointer" }}>
              Campo visible en el formulario
            </label>
          </div>

          {/* Botones de Acción */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              paddingTop: 14,
              borderTop: "1px solid #e2e8f0",
              marginTop: 6,
            }}
          >
            <button
              type="button"
              onClick={onCerrar}
              className="boton-mini"
              style={{ padding: "7px 14px", fontSize: 12 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!puedeEditar}
              className="boton-primario"
              style={{ padding: "7px 16px", fontSize: 12, width: "auto" }}
            >
              Guardar Propiedades
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
