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

interface VistaTiposRequisitosProps {
  pestanaFija?: TabId;
}

export default function ConfiguracionTiposRequisitosPage({ pestanaFija }: VistaTiposRequisitosProps = {}) {
  const [tabActiva, setTabActiva] = useState<TabId>(pestanaFija || "tipos");

  useEffect(() => {
    if (pestanaFija) {
      setTabActiva(pestanaFija);
    }
  }, [pestanaFija]);
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
  const [snapshotsPorTab, setSnapshotsPorTab] = useState<Record<string, any>>({});
  const [tabsModificadas, setTabsModificadas] = useState<Set<string>>(new Set());

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
      setSnapshotsPorTab((prev) => ({
        ...prev,
        [tabActiva]: prev[tabActiva] !== undefined ? prev[tabActiva] : snap,
      }));
    } catch (err: any) {
      setErrorCarga(err.message || "Error al cargar configuración");
    } finally {
      setCargando(false);
    }
  }, [tabActiva]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const actualizarSnapshotPestana = (nuevoSnap: any, pestanaId: string = tabActiva) => {
    setConfigSnapshot(nuevoSnap);
    setSnapshotsPorTab((prev) => ({ ...prev, [pestanaId]: nuevoSnap }));
    setTabsModificadas((prev) => new Set(prev).add(pestanaId));
  };

  // Guardar y Aplicar Configuración Directamente
  const handleGuardarConfiguracion = async () => {
    try {
      setGuardando(true);
      const tabsAGuardar = tabsModificadas.size > 0 ? Array.from(tabsModificadas) : [tabActiva];

      for (const tId of tabsAGuardar) {
        const snap = snapshotsPorTab[tId] || (tId === tabActiva ? configSnapshot : null);
        if (!snap) continue;

        const resBorrador = await fetch("/api/cambios/configuracion/tipos-requisitos/configuracion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accion: "guardar_borrador",
            pestana: tId,
            snapshot: snap,
            motivo: `Guardado directo de tipos y requisitos en pestaña ${tId}`
          })
        });
        if (!resBorrador.ok) throw new Error(`Error al guardar configuración en pestaña ${tId}`);

        // Auto-publicar para persistir en activo
        await fetch("/api/cambios/configuracion/tipos-requisitos/configuracion", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pestana: tId,
            motivo: "Actualización de tipos y requisitos de cambio",
            impacto_resumen: `Publicación en Submódulo 1.3.3.2 (${PESTANAS_INFO[tId as TabId]?.titulo || tId})`
          })
        });
      }

      setTabsModificadas(new Set());
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
      <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto 0 0", padding: "28px 32px 32px 32px", flex: 1, boxSizing: "border-box" }}>
        {/* Encabezado Principal Estandarizado */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 16
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              Tipos de Cambio y Requisitos
            </h1>
            <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#64748b", lineHeight: 1.45 }}>
              Gobierno de directrices ITIL v4: tipos normativos, matriz de autoridad, catálogo de modelos estándar y reglas de elevación.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={handleGuardarConfiguracion}
              disabled={guardando || !puedeEditar}
              className="boton-primario"
              style={{ width: "auto", padding: "8px 18px", fontSize: 13, flexShrink: 0 }}
            >
              {guardando ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </div>

      {/* Selector de Pestañas */}
      {/* Selector de Pestañas (solo si no es pestaña fija) */}
      {!pestanaFija && (
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #e2e8f0",
          marginBottom: 24,
          justifyContent: "flex-start",
          overflowX: "auto"
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
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: activa ? 600 : 500,
                color: activa ? "#2563eb" : "#64748b",
                border: "none",
                borderBottom: activa ? "2px solid #2563eb" : "2px solid transparent",
                backgroundColor: "transparent",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {info.titulo}
            </button>
          );
        })}
      </div>
      )}

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
          <div style={{ display: tabActiva === "tipos" ? "block" : "none" }}>
            <PestanaTiposCambio
              config={snapshotsPorTab["tipos"] || configSnapshot}
              onChange={(nuevo) => {
                actualizarSnapshotPestana(nuevo, "tipos");
              }}
              onIrAMatrizAutoridad={() => setTabActiva("matriz_autoridad")}
            />
          </div>

          <div style={{ display: tabActiva === "matriz_autoridad" ? "block" : "none" }}>
            <PestanaMatrizAutoridad
              config={snapshotsPorTab["matriz_autoridad"] || configSnapshot}
              onChange={(nuevo) => {
                actualizarSnapshotPestana(nuevo, "matriz_autoridad");
              }}
            />
          </div>

          <div style={{ display: tabActiva === "modelos_estandar" ? "block" : "none" }}>
            <PestanaModelosEstandar
              config={snapshotsPorTab["modelos_estandar"] || configSnapshot}
              onChange={(nuevo) => {
                actualizarSnapshotPestana(nuevo, "modelos_estandar");
              }}
            />
          </div>

          <div style={{ display: tabActiva === "reglas_clasificacion" ? "block" : "none" }}>
            <PestanaReglasClasificacion
              config={snapshotsPorTab["reglas_clasificacion"] || configSnapshot}
              onChange={(nuevo) => {
                actualizarSnapshotPestana(nuevo, "reglas_clasificacion");
              }}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
