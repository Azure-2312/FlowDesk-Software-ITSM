"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PestanaCamposMesa } from "./formulario/components/PestanaCamposMesa";
import { PestanaCamposPersonalizadosMesa } from "./formulario/components/PestanaCamposPersonalizadosMesa";
import { PestanaNivelesSolicitante } from "./formulario/components/PestanaNivelesSolicitante";

export interface VistaConfiguracionFormularioMesaProps {
  tipo: "incidente" | "solicitud";
}

function ContenidoConfiguracionFormularioMesa({ tipo }: VistaConfiguracionFormularioMesaProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tabActiva, setTabActiva] = useState<"campos" | "personalizados" | "niveles_solicitante">(
    tabParam === "personalizados"
      ? "personalizados"
      : tabParam === "niveles_solicitante"
      ? "niveles_solicitante"
      : "campos"
  );

  const esIncidente = tipo === "incidente";
  const titulo = esIncidente
    ? "Configuración de Formulario: Incidentes"
    : "Configuración de Formulario: Solicitudes de Servicio";
  const descripcion = esIncidente
    ? "Estructura, obligatoriedad, distribución de ancho y orden de los campos del formulario de reporte de incidentes y fallas técnicas."
    : "Estructura, obligatoriedad, distribución de ancho y orden de los campos del formulario de requerimiento de servicios y accesos.";

  return (
    <div className="vista-contenedor">
      {/* Cabecera Principal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
            {titulo}
          </h1>
          <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: 13, lineHeight: 1.45 }}>
            {descripcion}
          </p>
        </div>
      </div>

      {/* Selector de Pestañas Homogéneo */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #e2e8f0",
          marginBottom: 24,
          justifyContent: "flex-start",
          overflowX: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => setTabActiva("campos")}
          style={{
            padding: "10px 16px",
            border: "none",
            background: "transparent",
            borderBottom: tabActiva === "campos" ? "2px solid #2563eb" : "2px solid transparent",
            color: tabActiva === "campos" ? "#2563eb" : "#64748b",
            fontWeight: tabActiva === "campos" ? 600 : 500,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Campos
        </button>

        <button
          type="button"
          onClick={() => setTabActiva("personalizados")}
          style={{
            padding: "10px 16px",
            border: "none",
            background: "transparent",
            borderBottom: tabActiva === "personalizados" ? "2px solid #2563eb" : "2px solid transparent",
            color: tabActiva === "personalizados" ? "#2563eb" : "#64748b",
            fontWeight: tabActiva === "personalizados" ? 600 : 500,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Campos personalizados
        </button>

        <button
          type="button"
          onClick={() => setTabActiva("niveles_solicitante")}
          style={{
            padding: "10px 16px",
            border: "none",
            background: "transparent",
            borderBottom: tabActiva === "niveles_solicitante" ? "2px solid #2563eb" : "2px solid transparent",
            color: tabActiva === "niveles_solicitante" ? "#2563eb" : "#64748b",
            fontWeight: tabActiva === "niveles_solicitante" ? 600 : 500,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Niveles de solicitante (VIP)
        </button>
      </div>

      {/* Contenido según pestaña */}
      {tabActiva === "campos" ? (
        <PestanaCamposMesa tipo={tipo} />
      ) : tabActiva === "personalizados" ? (
        <PestanaCamposPersonalizadosMesa tipo={tipo} />
      ) : (
        <PestanaNivelesSolicitante />
      )}
    </div>
  );
}

export default function VistaConfiguracionFormularioMesa(props: VistaConfiguracionFormularioMesaProps) {
  return (
    <Suspense fallback={<div className="vista-contenedor"><p>Cargando configuración de formulario...</p></div>}>
      <ContenidoConfiguracionFormularioMesa {...props} />
    </Suspense>
  );
}
