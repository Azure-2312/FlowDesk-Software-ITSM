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
      <div className="cabecera-pagina" style={{ marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
            {titulo}
          </h1>
          <p className="subtitulo" style={{ margin: 0, fontSize: 13.5, color: "#64748b" }}>
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
          paddingBottom: 10,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setTabActiva("campos")}
          style={{
            padding: "8px 18px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: tabActiva === "campos" ? 700 : 500,
            backgroundColor: tabActiva === "campos" ? "#2563eb" : "#f1f5f9",
            color: tabActiva === "campos" ? "#ffffff" : "#475569",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Campos</span>
        </button>

        <button
          type="button"
          onClick={() => setTabActiva("personalizados")}
          style={{
            padding: "8px 18px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: tabActiva === "personalizados" ? 700 : 500,
            backgroundColor: tabActiva === "personalizados" ? "#2563eb" : "#f1f5f9",
            color: tabActiva === "personalizados" ? "#ffffff" : "#475569",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span>Campos personalizados</span>
        </button>

        <button
          type="button"
          onClick={() => setTabActiva("niveles_solicitante")}
          style={{
            padding: "8px 18px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: tabActiva === "niveles_solicitante" ? 700 : 500,
            backgroundColor: tabActiva === "niveles_solicitante" ? "#2563eb" : "#f1f5f9",
            color: tabActiva === "niveles_solicitante" ? "#ffffff" : "#475569",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>Niveles de solicitante (VIP)</span>
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
