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

  // Snapshot activo de la pestaña y tracking de pestañas modificadas
  const [configSnapshot, setConfigSnapshot] = useState<any>({});
  const [snapshotsPorTab, setSnapshotsPorTab] = useState<Record<string, any>>({});
  const [tabsModificadas, setTabsModificadas] = useState<Set<string>>(new Set());

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

  // Guardar y Aplicar Cambios Directamente de forma coordinada
  const handleGuardarCambios = async () => {
    try {
      setGuardando(true);
      const tabsAGuardar = tabsModificadas.size > 0 ? Array.from(tabsModificadas) : [tabActiva];

      for (const tId of tabsAGuardar) {
        const snap = snapshotsPorTab[tId] || (tId === tabActiva ? configSnapshot : null);
        if (!snap) continue;
        const res = await fetch("/api/cambios/configuracion/flujo-evaluacion/configuracion", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pestana: tId,
            snapshot: snap,
            motivo: `Actualización de configuración de flujo en pestaña ${tId}`,
            impacto_resumen: "Publicación de configuración de flujo y auditoría"
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Error al guardar configuración en pestaña ${tId}`);
      }

      setTabsModificadas(new Set());
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
      <div style={{ padding: "28px 32px 32px 32px", flex: 1, width: "100%", maxWidth: 1400, margin: "0 auto 0 0", boxSizing: "border-box" }}>
        {/* Encabezado Principal Estandarizado */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 16
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
              Flujo de Evaluación, Autorización y Revisión Posterior (PIR)
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: 13, lineHeight: 1.45 }}>
              Ciclo de vida de la RFC (ITIL 4 / COBIT BAI06 / ISO 20000): estados, transiciones, comités CAB/ECAB, tareas y auditoría PIR.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={handleGuardarCambios}
              disabled={guardando || deshabilitadoEdicion}
              className="boton-primario"
              style={{ width: "auto", padding: "8px 18px", fontSize: 13, flexShrink: 0 }}
            >
              {guardando ? "Guardando..." : "Guardar Configuración"}
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

      {/* Barra de pestañas horizontales */}
      <div style={{
        display: "flex",
        gap: 8,
        borderBottom: "1px solid #e2e8f0",
        marginBottom: 24,
        justifyContent: "flex-start",
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
                padding: "10px 16px",
                border: "none",
                borderBottom: activa ? "2px solid #2563eb" : "2px solid transparent",
                backgroundColor: "transparent",
                color: activa ? "#2563eb" : "#64748b",
                fontWeight: activa ? 600 : 500,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap"
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
          <div style={{ display: tabActiva === "estados" ? "block" : "none" }}>
            <PestanaEstados
              snapshot={snapshotsPorTab["estados"] || configSnapshot}
              onChange={(nuevo) => actualizarSnapshotPestana(nuevo, "estados")}
              disabled={deshabilitadoEdicion}
            />
          </div>

          <div style={{ display: tabActiva === "transiciones" ? "block" : "none" }}>
            <PestanaTransiciones
              snapshot={snapshotsPorTab["transiciones"] || configSnapshot}
              estadosDisponibles={(snapshotsPorTab["transiciones"] || configSnapshot).estados}
              onChange={(nuevo) => actualizarSnapshotPestana(nuevo, "transiciones")}
              disabled={deshabilitadoEdicion}
            />
          </div>

          <div style={{ display: tabActiva === "etapas_aprobacion" ? "block" : "none" }}>
            <PestanaEtapasAprobacion
              snapshot={snapshotsPorTab["etapas_aprobacion"] || configSnapshot}
              catalogoUsuarios={catalogoUsuarios}
              catalogoDepartamentos={catalogoDepartamentos}
              onChange={(nuevo) => actualizarSnapshotPestana(nuevo, "etapas_aprobacion")}
              disabled={deshabilitadoEdicion}
            />
          </div>

          <div style={{ display: tabActiva === "comites" ? "block" : "none" }}>
            <PestanaComites
              snapshot={snapshotsPorTab["comites"] || configSnapshot}
              catalogoUsuarios={catalogoUsuarios}
              onChange={(nuevo) => actualizarSnapshotPestana({ comites: nuevo }, "comites")}
              disabled={deshabilitadoEdicion}
            />
          </div>

          <div style={{ display: tabActiva === "plazos_escalamiento" ? "block" : "none" }}>
            <PestanaPlazosEscalamiento
              snapshot={snapshotsPorTab["plazos_escalamiento"] || configSnapshot}
              onChange={(nuevo) => actualizarSnapshotPestana(nuevo, "plazos_escalamiento")}
              disabled={deshabilitadoEdicion}
            />
          </div>

          <div style={{ display: tabActiva === "tareas_checklists" ? "block" : "none" }}>
            <PestanaTareasChecklists
              snapshot={snapshotsPorTab["tareas_checklists"] || configSnapshot}
              onChange={(nuevo) => actualizarSnapshotPestana(nuevo, "tareas_checklists")}
              disabled={deshabilitadoEdicion}
            />
          </div>

          <div style={{ display: tabActiva === "implementacion_cierre" ? "block" : "none" }}>
            <PestanaImplementacionCierre
              snapshot={snapshotsPorTab["implementacion_cierre"] || configSnapshot}
              onChange={(nuevo) => actualizarSnapshotPestana(nuevo, "implementacion_cierre")}
              disabled={deshabilitadoEdicion}
            />
          </div>

          <div style={{ display: tabActiva === "pir" ? "block" : "none" }}>
            <PestanaPir
              snapshot={snapshotsPorTab["pir"] || configSnapshot}
              onChange={(nuevo) => actualizarSnapshotPestana(nuevo, "pir")}
              disabled={deshabilitadoEdicion}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
