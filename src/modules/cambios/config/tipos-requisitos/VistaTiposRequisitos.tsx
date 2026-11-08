"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import { PestanaTiposCambio } from "./components/PestanaTiposCambio";
import { PestanaMatrizAutoridad } from "./components/PestanaMatrizAutoridad";
import { PestanaModelosEstandar } from "./components/PestanaModelosEstandar";
import { PestanaReglasClasificacion } from "./components/PestanaReglasClasificacion";

type TabId = "tipos" | "matriz_autoridad" | "modelos_estandar" | "reglas_clasificacion";

const PESTANAS_INFO: Record<TabId, { numero: string; titulo: string; descripcion: string }> = {
  tipos: {
    numero: "1.3.3.2.1",
    titulo: "Tipos de cambio",
    descripcion: "Definición de tipos (Estándar, Normal, Emergencia), requisitos de campos y parámetros de ventana."
  },
  matriz_autoridad: {
    numero: "1.3.3.2.2",
    titulo: "Matriz de autoridad",
    descripcion: "Asignación jerárquica de etapas de aprobación según riesgo, criticidad y condiciones técnicas."
  },
  modelos_estandar: {
    numero: "1.3.3.2.3",
    titulo: "Modelos de cambio estándar",
    descripcion: "Catálogo de procedimientos rutinarios preautorizados con elegibilidad y control de calidad."
  },
  reglas_clasificacion: {
    numero: "1.3.3.2.4",
    titulo: "Reglas de clasificación",
    descripcion: "Reglas automáticas de reclasificación de tipo, elevación de autoridad y bloqueos normativos."
  }
};

export default function ConfiguracionTiposRequisitosPage() {
  const [tabActiva, setTabActiva] = useState<TabId>("tipos");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estados de control y autoría
  const [versionPublicada, setVersionPublicada] = useState<number>(1);
  const [fechaPublicada, setFechaPublicada] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);
  const [bloqueadoPorOtro, setBloqueadoPorOtro] = useState<string | undefined>(undefined);
  const [puedeEditar, setPuedeEditar] = useState<boolean>(true);

  // Snapshot activo
  const [configSnapshot, setConfigSnapshot] = useState<any>({});

  // Cargar datos de la pestaña activa
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const res = await fetch(`/api/cambios/configuracion/tipos-requisitos/configuracion?pestana=${tabActiva}`);
      if (!res.ok) throw new Error("Error al obtener la configuración del servidor");
      const data = await res.json();

      setVersionPublicada(data.version_publicada?.numero_version || 1);
      setFechaPublicada(data.version_publicada?.fecha_creacion || "");
      setBloqueadoPorOtro(
        data.bloqueo && !data.bloqueo.bloqueado_por_mi ? data.bloqueo.usuario_nombre : undefined
      );

      const snap = data.borrador?.snapshot || data.version_publicada?.snapshot || {};
      setConfigSnapshot(snap);
    } catch (err: any) {
      setErrorCarga(err.message || "Error al cargar configuración");
    } finally {
      setCargando(false);
    }
  }, [tabActiva]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Guardar y Aplicar Configuración Directamente
  const handleGuardarConfiguracion = async () => {
    try {
      setGuardando(true);
      const resBorrador = await fetch("/api/cambios/configuracion/tipos-requisitos/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "guardar_borrador",
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo: "Guardado directo de tipos y requisitos"
        })
      });
      if (!resBorrador.ok) throw new Error("Error al guardar la configuración");

      // Auto-publicar para persistir en activo
      await fetch("/api/cambios/configuracion/tipos-requisitos/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          motivo: "Actualización de tipos y requisitos de cambio",
          impacto_resumen: `Publicación en Submódulo 1.3.3.2 (${PESTANAS_INFO[tabActiva].titulo})`
        })
      });

      alert("Tipos y requisitos de cambio guardados exitosamente.");
      await cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
      <div style={{ minWidth: 1000, maxWidth: 1400, margin: "0 auto", padding: "20px 24px 32px 24px", flex: 1, width: "100%", boxSizing: "border-box" }}>
        {/* Encabezado Principal Estandarizado ARQ-2 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          backgroundColor: "#ffffff",
          padding: "18px 24px",
          borderRadius: 8,
          border: "1px solid #e2e8f0"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>Flujo ITIL</span>
              <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#0f172a" }}>
                Tipos de Cambio y Requisitos
              </h1>
            </div>
            <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#64748b" }}>
              Gobierno de directrices ITIL v4: tipos normativos, matriz de autoridad, catálogo de modelos estándar y reglas de elevación.
            </p>
            <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
              Última modificación {fechaPublicada ? `el ${new Date(fechaPublicada).toLocaleString()}` : "por el Administrador"}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/plataforma/cambios/configuracion/formulario"
              style={{
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#475569",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                textDecoration: "none"
              }}
            >
              ← Ir a Formulario
            </Link>
            <Link
              href="/plataforma/cambios/gestion/todos"
              style={{
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 600,
                color: "#2563eb",
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 6,
                textDecoration: "none"
              }}
            >
              Ver RFCs Operativas
            </Link>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>
              ● Configuración Activa
            </span>
            <button
              type="button"
              onClick={handleGuardarConfiguracion}
              disabled={guardando || !puedeEditar}
              style={{
                backgroundColor: guardando ? "#93c5fd" : "#2563eb",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: guardando || !puedeEditar ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              {guardando ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </div>

      {/* Selector de Pestañas de 1.3.3.2 */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #cbd5e1",
          marginBottom: 20,
          backgroundColor: "#ffffff",
          borderRadius: "8px 8px 0 0",
          padding: "4px 8px 0"
        }}
      >
        {(["tipos", "matriz_autoridad", "modelos_estandar", "reglas_clasificacion"] as TabId[]).map((tab) => {
          const info = PESTANAS_INFO[tab];
          const activa = tabActiva === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setTabActiva(tab)}
              style={{
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: activa ? 700 : 500,
                color: activa ? "#2563eb" : "#475569",
                border: "none",
                borderBottom: activa ? "3px solid #2563eb" : "3px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {info.titulo}
            </button>
          );
        })}
      </div>

      {/* Contenido Principal de la Pestaña Activa */}
      {cargando ? (
        <div style={{ padding: 48, textAlign: "center", color: "#64748b", backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1" }}>
          Cargando configuración de {PESTANAS_INFO[tabActiva].titulo}...
        </div>
      ) : errorCarga ? (
        <div style={{ padding: 24, backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: 8, border: "1px solid #fecaca" }}>
          <strong>Error al cargar pestaña:</strong> {errorCarga}
        </div>
      ) : (
        <div>
          {tabActiva === "tipos" && (
            <PestanaTiposCambio
              config={configSnapshot}
              onChange={(nuevo) => {
                setConfigSnapshot(nuevo);
              }}
              onIrAMatrizAutoridad={() => setTabActiva("matriz_autoridad")}
            />
          )}

          {tabActiva === "matriz_autoridad" && (
            <PestanaMatrizAutoridad
              config={configSnapshot}
              onChange={(nuevo) => {
                setConfigSnapshot(nuevo);
              }}
            />
          )}

          {tabActiva === "modelos_estandar" && (
            <PestanaModelosEstandar
              config={configSnapshot}
              onChange={(nuevo) => {
                setConfigSnapshot(nuevo);
              }}
            />
          )}

          {tabActiva === "reglas_clasificacion" && (
            <PestanaReglasClasificacion
              config={configSnapshot}
              onChange={(nuevo) => {
                setConfigSnapshot(nuevo);
              }}
            />
          )}
        </div>
      )}
      </div>
    </div>
  );
}
