"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PestanaCamposMesa, PestanaCamposMesaHandle } from "./formulario/components/PestanaCamposMesa";
import { PestanaCamposPersonalizadosMesa } from "./formulario/components/PestanaCamposPersonalizadosMesa";
import { PestanaNivelesSolicitante, PestanaNivelesSolicitanteHandle } from "./formulario/components/PestanaNivelesSolicitante";

export interface VistaConfiguracionFormularioMesaProps {
  tipo: "incidente" | "solicitud";
}

function ContenidoConfiguracionFormularioMesa({ tipo }: VistaConfiguracionFormularioMesaProps) {
  const camposMesaRef = useRef<PestanaCamposMesaHandle | null>(null);
  const nivelesRef = useRef<PestanaNivelesSolicitanteHandle | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensajeGlobal, setMensajeGlobal] = useState<string | null>(null);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

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

  const handleGuardarConfiguracion = async () => {
    setGuardando(true);
    setMensajeGlobal(null);
    setErrorGlobal(null);

    try {
      // Guardar de manera coordinada la configuración de todas las pestañas
      await Promise.all([
        camposMesaRef.current ? camposMesaRef.current.guardarConfiguracion() : Promise.resolve(),
        nivelesRef.current ? nivelesRef.current.guardarConfiguracion() : Promise.resolve(),
      ]);

      setMensajeGlobal("Toda la configuración del formulario (campos y niveles de solicitante) se guardó exitosamente.");
      setTimeout(() => setMensajeGlobal(null), 4500);
    } catch (err: any) {
      setErrorGlobal(err.message || "Ocurrió un error al persistir la configuración completa.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="vista-contenedor">
      {/* Cabecera Principal con Botón Guardar Configuración (solo texto) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div>
          <h1 className="titulo-pagina">
            {titulo}
          </h1>
          <p className="descripcion-pagina">
            {descripcion}
          </p>
        </div>

        <button
          type="button"
          className="boton-primario"
          onClick={handleGuardarConfiguracion}
          disabled={guardando}
          style={{ flexShrink: 0 }}
        >
          {guardando ? "Guardando..." : "Guardar Configuración"}
        </button>
      </div>

      {/* Alertas globales de guardado */}
      {mensajeGlobal && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          {mensajeGlobal}
        </div>
      )}
      {errorGlobal && (
        <div className="mensaje-error" style={{ marginBottom: 16 }}>
          {errorGlobal}
        </div>
      )}

      {/* Selector de Pestañas Homogéneo */}
      <div
        className="pestanas"
      >
        <button
          type="button"
          onClick={() => setTabActiva("campos")}
          className={tabActiva === "campos" ? "pestana pestana-activa" : "pestana"}
        >
          Campos
        </button>

        <button
          type="button"
          onClick={() => setTabActiva("personalizados")}
          className={tabActiva === "personalizados" ? "pestana pestana-activa" : "pestana"}
        >
          Campos personalizados
        </button>

        <button
          type="button"
          onClick={() => setTabActiva("niveles_solicitante")}
          className={tabActiva === "niveles_solicitante" ? "pestana pestana-activa" : "pestana"}
        >
          Niveles de solicitante (VIP)
        </button>
      </div>

      {/* Contenido persistente de pestañas: se mantienen montadas para no perder cambios en memoria */}
      <div style={{ display: tabActiva === "campos" ? "block" : "none" }}>
        <PestanaCamposMesa
          ref={camposMesaRef}
          tipo={tipo}
        />
      </div>

      <div style={{ display: tabActiva === "personalizados" ? "block" : "none" }}>
        <PestanaCamposPersonalizadosMesa tipo={tipo} />
      </div>

      <div style={{ display: tabActiva === "niveles_solicitante" ? "block" : "none" }}>
        <PestanaNivelesSolicitante
          ref={nivelesRef}
        />
      </div>
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
