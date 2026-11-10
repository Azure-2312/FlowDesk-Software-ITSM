"use client";

import React, { useState, useEffect } from "react";

export interface CampoMesa {
  codigo: string;
  etiqueta: string;
  tipo: string;
  visible: boolean;
  obligatorio: "si" | "no" | "condicional" | "segun_prioridad";
  ancho?: "1/3" | "1/2" | "2/3" | "completo";
  placeholder?: string;
  ayuda?: string;
  opciones?: string;
  bloqueado?: boolean;
  es_personalizado?: boolean;
  prioridad_minima?: number; // 1 (VIP) a 5 (Estándar)
}

interface ModalEditarPropiedadesCampoMesaProps {
  abierto: boolean;
  seccionId: string;
  seccionesDisponibles?: { id: string; label: string }[];
  campo: CampoMesa | null;
  onCerrar: () => void;
  onGuardar: (
    seccionId: string,
    codigo: string,
    patch: Partial<CampoMesa>,
    nuevaSeccionId?: string
  ) => void;
}

export const ModalEditarPropiedadesCampoMesa: React.FC<ModalEditarPropiedadesCampoMesaProps> = ({
  abierto,
  seccionId,
  seccionesDisponibles = [],
  campo,
  onCerrar,
  onGuardar,
}) => {
  const [etiqueta, setEtiqueta] = useState("");
  const [ayuda, setAyuda] = useState("");
  const [ancho, setAncho] = useState<"1/3" | "1/2" | "2/3" | "completo">("completo");
  const [placeholder, setPlaceholder] = useState("");
  const [obligatorio, setObligatorio] = useState<"si" | "no" | "condicional" | "segun_prioridad">("si");
  const [visible, setVisible] = useState(true);
  const [prioridadMinima, setPrioridadMinima] = useState<number>(5);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<string>(seccionId);

  useEffect(() => {
    if (campo) {
      setEtiqueta((campo.etiqueta || "").replace(/\s*\(Opcional\)\s*/gi, "").trim());
      setAyuda(campo.ayuda || "");
      setAncho(campo.ancho || "completo");
      setPlaceholder(campo.placeholder || "");
      setObligatorio(campo.obligatorio || "si");
      setVisible(campo.visible !== false);
      setPrioridadMinima(campo.prioridad_minima ?? 5);
      setSeccionSeleccionada(seccionId);
    }
  }, [campo, seccionId]);

  if (!abierto || !campo) return null;

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(
      seccionId,
      campo.codigo,
      {
        etiqueta: etiqueta.trim() || campo.codigo,
        ayuda: ayuda.trim(),
        ancho,
        placeholder: placeholder.trim(),
        obligatorio,
        visible,
        prioridad_minima: prioridadMinima,
      },
      seccionSeleccionada !== seccionId ? seccionSeleccionada : undefined
    );
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
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Editar Propiedades del Campo
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
              Código interno: <code style={{ color: "#2563eb", fontWeight: 600 }}>{campo.codigo}</code> · Tipo: {campo.tipo}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            style={{
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#64748b",
              padding: 4,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleGuardar} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 13 }}>
          {/* Etiqueta y Sección Destino */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 5 }}>
                Etiqueta Visible en el Formulario *
              </label>
              <input
                type="text"
                className="input-base"
                value={etiqueta}
                onChange={(e) => setEtiqueta(e.target.value)}
                placeholder="Ej. Título o Síntoma Observado"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 5 }}>
                Sección del Formulario *
              </label>
              <select
                className="input-base"
                value={seccionSeleccionada}
                onChange={(e) => setSeccionSeleccionada(e.target.value)}
                style={{ backgroundColor: "#ffffff" }}
              >
                {seccionesDisponibles.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 5 }}>
                Ancho en el Formulario
              </label>
              <select
                className="input-base"
                value={ancho}
                onChange={(e) => setAncho(e.target.value as any)}
              >
                <option value="completo">Ancho completo (100%)</option>
                <option value="1/2">Medio ancho (50%)</option>
                <option value="1/3">Un tercio (33%)</option>
                <option value="2/3">Dos tercios (66%)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 5 }}>
                Regla de Obligatoriedad
              </label>
              <select
                className="input-base"
                value={obligatorio}
                onChange={(e) => setObligatorio(e.target.value as any)}
              >
                <option value="si">Siempre Obligatorio</option>
                <option value="no">Opcional</option>
                <option value="condicional">Condicional</option>
                <option value="segun_prioridad">Según Prioridad</option>
              </select>
            </div>
          </div>

          {/* Configuración de Prioridad del Solicitante / VIP */}
          <div style={{ padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 5 }}>
              Nivel de Solicitante Requerido para Ver este Campo (VIP / Jerarquía)
            </label>
            <select
              className="input-base"
              value={prioridadMinima}
              onChange={(e) => setPrioridadMinima(Number(e.target.value))}
              style={{ backgroundColor: "#ffffff" }}
            >
              <option value={5}>Nivel 5 — Prioridad Estándar (Todos los colaboradores ven el campo)</option>
              <option value={4}>Nivel 4 — Prioridad Operativa (Técnicos) o superior</option>
              <option value={3}>Nivel 3 — Prioridad Preferente o superior (Jefes de Área y Coordinadores)</option>
              <option value={2}>Nivel 2 — Prioridad Ejecutiva o superior (Gerentes y Subgerentes)</option>
              <option value={1}>Nivel 1 — Solo Prioridad VIP (Directores y Alta Dirección)</option>
            </select>
            <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
              Si el solicitante que abre el formulario tiene un nivel inferior al seleccionado, este campo permanecerá oculto.
            </span>
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 5 }}>
              Texto de Marcador de Posición (Placeholder)
            </label>
            <input
              type="text"
              className="input-base"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="Instrucción corta dentro del campo..."
            />
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 5 }}>
              Texto de Ayuda / Instrucción (Tooltip)
            </label>
            <textarea
              className="input-base"
              rows={2}
              value={ayuda}
              onChange={(e) => setAyuda(e.target.value)}
              placeholder="Oriente al solicitante sobre qué información debe registrar en este campo..."
            />
          </div>

          <div style={{ display: "flex", gap: 16, padding: "8px 12px", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "#2563eb" }}
              />
              Visible en el formulario de captura
            </label>
          </div>

          {/* Botones de acción */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
            <button
              type="button"
              className="boton-secundario"
              onClick={onCerrar}
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="boton-primario"
              style={{ padding: "8px 20px", fontSize: 13 }}
            >
              Aplicar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
