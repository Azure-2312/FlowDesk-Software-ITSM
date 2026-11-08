"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import { PestanaEstados } from "./components/PestanaEstados";
import { PestanaTransiciones } from "./components/PestanaTransiciones";
import { PestanaEtapasAprobacion } from "./components/PestanaEtapasAprobacion";
import { PestanaComites } from "./components/PestanaComites";
import { PestanaPlazosEscalamiento } from "./components/PestanaPlazosEscalamiento";
import { PestanaTareasChecklists } from "./components/PestanaTareasChecklists";
import { PestanaImplementacionCierre } from "./components/PestanaImplementacionCierre";
import { PestanaPir } from "./components/PestanaPir";

type TabId = 
  | "estados" 
  | "transiciones" 
  | "etapas_aprobacion" 
  | "comites" 
  | "plazos_escalamiento" 
  | "tareas_checklists" 
  | "implementacion_cierre" 
  | "pir";

const PESTANAS_INFO: Record<TabId, { numero: string; titulo: string; descripcion: string }> = {
  estados: {
    numero: "1.3.3.3.1",
    titulo: "Estados",
    descripcion: "Catálogo de estados del ciclo de vida, políticas de edición, relojes SLA y visibilidad en calendario."
  },
  transiciones: {
    numero: "1.3.3.3.2",
    titulo: "Transiciones y acciones",
    descripcion: "Flujo de transiciones, perfiles autorizados, precondiciones normativas y automatizaciones."
  },
  etapas_aprobacion: {
    numero: "1.3.3.3.3",
    titulo: "Etapas de aprobación",
    descripcion: "Catálogo de etapas de control, reglas de decisión y segregación obligatoria de funciones (SoD)."
  },
  comites: {
    numero: "1.3.3.3.4",
    titulo: "Comités (CAB y ECAB)",
    descripcion: "Gobernanza del Change Advisory Board y Emergency CAB: miembros, quórum, desempate y agendas."
  },
  plazos_escalamiento: {
    numero: "1.3.3.3.5",
    titulo: "Plazos y escalamiento",
    descripcion: "Matriz de tiempos máximos por prioridad, alertas preventivas y escalamiento jerárquico sin autoaprobación."
  },
  tareas_checklists: {
    numero: "1.3.3.3.6",
    titulo: "Tareas y checklists",
    descripcion: "Catálogo de tareas operativas por fase, paquetes predeterminados y checklist Go/No-Go."
  },
  implementacion_cierre: {
    numero: "1.3.3.3.7",
    titulo: "Implementación y cierre",
    descripcion: "Acciones automáticas ante fallo o rollback, sincronización con CMDB y políticas de cierre inmutable."
  },
  pir: {
    numero: "1.3.3.3.8",
    titulo: "Revisión post-implementación (PIR)",
    descripcion: "Cuestionario de 12 preguntas de auditoría, ventana de observación de incidentes y matriz de exigencia."
  }
};

export default function FlujoEvaluacionPage() {
  const [tabActiva, setTabActiva] = useState<TabId>("estados");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estados de control y autoría
  const [versionPublicada, setVersionPublicada] = useState<number>(1);
  const [fechaPublicada, setFechaPublicada] = useState<string>("");
  const [autorPublicada, setAutorPublicada] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);
  const [bloqueadoPorOtro, setBloqueadoPorOtro] = useState<string | undefined>(undefined);
  const [puedeEditar, setPuedeEditar] = useState<boolean>(true);

  // Snapshot activo de la pestaña
  const [configSnapshot, setConfigSnapshot] = useState<any>({});

  // Catálogos auxiliares (usuarios, departamentos)
  const [catalogoUsuarios, setCatalogoUsuarios] = useState<any[]>([]);
  const [catalogoDepartamentos, setCatalogoDepartamentos] = useState<any[]>([]);

  // Cargar configuración de la pestaña seleccionada
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const res = await fetch(`/api/cambios/configuracion/flujo-evaluacion/configuracion?pestana=${tabActiva}`);
      if (!res.ok) throw new Error("Error al obtener la configuración del servidor");
      const data = await res.json();

      setVersionPublicada(data.version_publicada?.numero_version || 1);
      setFechaPublicada(data.version_publicada?.fecha_creacion || "");
      setAutorPublicada(data.version_publicada?.autor_nombre || "Sistema");
      setBloqueadoPorOtro(
        data.bloqueo && !data.bloqueo.bloqueado_por_mi ? data.bloqueo.usuario_nombre : undefined
      );

      if (data.catalogo_usuarios) setCatalogoUsuarios(data.catalogo_usuarios);
      if (data.catalogo_departamentos) setCatalogoDepartamentos(data.catalogo_departamentos);

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

  // Guardar y Aplicar Cambios Directamente
  const handleGuardarCambios = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/cambios/configuracion/flujo-evaluacion/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo: "Actualización de configuración de flujo",
          impacto_resumen: "Publicación de configuración de flujo y auditoría"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar configuración");
      alert("Flujo de evaluación y autorización guardado exitosamente.");
      await cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const deshabilitadoEdicion = !puedeEditar || !!bloqueadoPorOtro;

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
      <div style={{ padding: "24px 32px 32px 32px", flex: 1, maxWidth: "1600px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        {/* Encabezado Principal Estandarizado ARQ-2 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          backgroundColor: "#ffffff",
          padding: "18px 24px",
          borderRadius: 8,
          border: "1px solid #e2e8f0"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>Flujo ITIL</span>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Flujo de Evaluación, Autorización y Revisión Posterior (PIR)
              </h1>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#64748b", margin: "6px 0 0 0" }}>
              Ciclo de vida de la RFC (ITIL 4 / COBIT BAI06 / ISO 20000): estados, transiciones, comités CAB/ECAB, tareas y auditoría PIR.
            </p>
            <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
              Última modificación por <strong style={{ color: "#475569" }}>{autorPublicada || "Administrador"}</strong>
              {fechaPublicada && ` el ${new Date(fechaPublicada).toLocaleString()}`}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>
              ● Configuración Activa
            </span>
            <button
              type="button"
              onClick={handleGuardarCambios}
              disabled={guardando || deshabilitadoEdicion}
              style={{
                backgroundColor: guardando ? "#93c5fd" : "#2563eb",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: guardando || deshabilitadoEdicion ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>

      {/* Alerta de bloqueo concurrente si otro usuario está editando */}
      {bloqueadoPorOtro && (
        <div style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#991b1b",
          fontSize: "0.85rem"
        }}>
          <strong>Edición Concurrente Bloqueada:</strong> La pestaña actual está siendo editada por el usuario <strong>{bloqueadoPorOtro}</strong>. Los cambios están en modo solo lectura.
        </div>
      )}

      {/* Barra de pestañas horizontales numeradas */}
      <div style={{
        display: "flex",
        gap: "4px",
        borderBottom: "2px solid #e2e8f0",
        marginBottom: "24px",
        overflowX: "auto"
      }}>
        {(Object.keys(PESTANAS_INFO) as TabId[]).map((tId) => {
          const info = PESTANAS_INFO[tId];
          const activa = tabActiva === tId;
          return (
            <button
              key={tId}
              onClick={() => setTabActiva(tId)}
              style={{
                padding: "10px 14px",
                border: "none",
                borderBottom: activa ? "2px solid #2563eb" : "2px solid transparent",
                backgroundColor: "transparent",
                color: activa ? "#2563eb" : "#64748b",
                fontWeight: activa ? 700 : 500,
                fontSize: "0.82rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                marginBottom: "-2px",
                transition: "all 0.15s ease"
              }}
            >
              {info.titulo}
            </button>
          );
        })}
      </div>

      {/* Contenido dinámico según pestaña activa */}
      {cargando ? (
        <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
          Cargando configuración del servidor...
        </div>
      ) : errorCarga ? (
        <div style={{ padding: "20px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", color: "#991b1b" }}>
          {errorCarga}
        </div>
      ) : (
        <div>
          {tabActiva === "estados" && (
            <PestanaEstados
              snapshot={configSnapshot}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
              disabled={deshabilitadoEdicion}
            />
          )}

          {tabActiva === "transiciones" && (
            <PestanaTransiciones
              snapshot={configSnapshot}
              estadosDisponibles={configSnapshot.estados}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
              disabled={deshabilitadoEdicion}
            />
          )}

          {tabActiva === "etapas_aprobacion" && (
            <PestanaEtapasAprobacion
              snapshot={configSnapshot}
              catalogoUsuarios={catalogoUsuarios}
              catalogoDepartamentos={catalogoDepartamentos}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
              disabled={deshabilitadoEdicion}
            />
          )}

          {tabActiva === "comites" && (
            <PestanaComites
              snapshot={configSnapshot}
              catalogoUsuarios={catalogoUsuarios}
              onChange={(nuevo) => setConfigSnapshot({ comites: nuevo })}
              disabled={deshabilitadoEdicion}
            />
          )}

          {tabActiva === "plazos_escalamiento" && (
            <PestanaPlazosEscalamiento
              snapshot={configSnapshot}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
              disabled={deshabilitadoEdicion}
            />
          )}

          {tabActiva === "tareas_checklists" && (
            <PestanaTareasChecklists
              snapshot={configSnapshot}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
              disabled={deshabilitadoEdicion}
            />
          )}

          {tabActiva === "implementacion_cierre" && (
            <PestanaImplementacionCierre
              snapshot={configSnapshot}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
              disabled={deshabilitadoEdicion}
            />
          )}

          {tabActiva === "pir" && (
            <PestanaPir
              snapshot={configSnapshot}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
              disabled={deshabilitadoEdicion}
            />
          )}
        </div>
      )}
      </div>
    </div>
  );
}
