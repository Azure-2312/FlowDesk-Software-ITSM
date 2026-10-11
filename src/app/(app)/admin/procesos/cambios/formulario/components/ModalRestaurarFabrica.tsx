"use client";

import React, { useState } from "react";

interface ModalRestaurarFabricaProps {
  abierto: boolean;
  onConfirmar: () => Promise<void>;
  onCerrar: () => void;
}

export const ModalRestaurarFabrica: React.FC<ModalRestaurarFabricaProps> = ({
  abierto,
  onConfirmar,
  onCerrar,
}) => {
  const [palabra, setPalabra] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  if (!abierto) return null;

  const esValido = palabra === "RESTAURAR";

  const handleConfirmar = async () => {
    if (!esValido) {
      setErrorLocal("Debe escribir exactamente RESTAURAR en mayúsculas.");
      return;
    }

    try {
      setProcesando(true);
      setErrorLocal("");
      await onConfirmar();
      onCerrar();
    } catch (err: any) {
      setErrorLocal(err.message || "Error al restaurar valores de fábrica");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
      }}
      onClick={onCerrar}
    >
      <div
        className="modal-contenido"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          maxWidth: 480,
          width: "100%",
          padding: 24,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          border: "1px solid #fecaca",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
            }}
          >
            !
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Restaurar Valores de Fábrica
            </h3>
            <span style={{ fontSize: 11.5, color: "#b91c1c", fontWeight: 600 }}>
              Acción crítica de reconfiguración
            </span>
          </div>
        </div>

        <p style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5, margin: "0 0 16px 0" }}>
          Esta acción reemplazará la configuración de esta pestaña por la plantilla institucional de fábrica ITIL v4. La configuración se cargará en borrador activo sin alterar la producción hasta que decida publicarla formalmente.
        </p>

        <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#991b1b", marginBottom: 6 }}>
            Para confirmar, escriba la palabra <span style={{ textDecoration: "underline" }}>RESTAURAR</span>:
          </label>
          <input
            type="text"
            className="input-base"
            value={palabra}
            onChange={(e) => {
              setPalabra(e.target.value);
              if (errorLocal) setErrorLocal("");
            }}
            placeholder="RESTAURAR"
            style={{ width: "100%", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}
          />
        </div>

        {errorLocal && (
          <div style={{ padding: "8px 12px", backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: 6, color: "#991b1b", fontSize: 12, marginBottom: 16 }}>
            {errorLocal}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="boton-secundario" onClick={onCerrar} disabled={procesando} style={{ fontSize: 12.5 }}>
            Cancelar
          </button>
          <button
            type="button"
            className="boton-primario"
            onClick={handleConfirmar}
            disabled={!esValido || procesando}
            style={{
              fontSize: 12.5,
              backgroundColor: "#dc2626",
              opacity: !esValido || procesando ? 0.5 : 1,
            }}
          >
            {procesando ? "Restaurando..." : "Confirmar Restauración"}
          </button>
        </div>
      </div>
    </div>
  );
};
