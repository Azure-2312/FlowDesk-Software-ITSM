"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BarraAccionesComun } from "@/shared/components/admin/BarraAccionesComun";
import { ModalPublicacion } from "@/shared/components/admin/ModalPublicacion";
import { ModalHistorialVersiones } from "../formulario/components/ModalHistorialVersiones";
import { ModalRestaurarFabrica } from "../formulario/components/ModalRestaurarFabrica";

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
    titulo: "1.3.3.3.4 Comités (CAB y ECAB)",
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

  // Estados de control de versiones y autoría
  const [versionPublicada, setVersionPublicada] = useState<number>(1);
  const [fechaPublicada, setFechaPublicada] = useState<string>("");
  const [autorPublicada, setAutorPublicada] = useState<string>("");
  const [hayBorrador, setHayBorrador] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [publicando, setPublicando] = useState<boolean>(false);
  const [bloqueadoPorOtro, setBloqueadoPorOtro] = useState<string | undefined>(undefined);
  const [puedePublicar, setPuedePublicar] = useState<boolean>(true);
  const [puedeEditar, setPuedeEditar] = useState<boolean>(true);

  // Snapshot activo de la pestaña
  const [configSnapshot, setConfigSnapshot] = useState<any>({});
  const [diffPreview, setDiffPreview] = useState<any>(null);

  // Catálogos auxiliares (usuarios, departamentos)
  const [catalogoUsuarios, setCatalogoUsuarios] = useState<any[]>([]);
  const [catalogoDepartamentos, setCatalogoDepartamentos] = useState<any[]>([]);

  // Modales Pattern 3.1
  const [modalPublicarAbierto, setModalPublicarAbierto] = useState<boolean>(false);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState<boolean>(false);
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState<boolean>(false);
  const [versionesHistorial, setVersionesHistorial] = useState<any[]>([]);
  const [rfcsAbiertasAfectadas, setRfcsAbiertasAfectadas] = useState<number>(0);

  // Cargar configuración de la pestaña seleccionada
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const res = await fetch(`/api/admin/cambios/flujo-evaluacion/configuracion?pestana=${tabActiva}`);
      if (!res.ok) throw new Error("Error al obtener la configuración del servidor");
      const data = await res.json();

      setVersionPublicada(data.version_publicada?.numero_version || 1);
      setFechaPublicada(data.version_publicada?.fecha_creacion || "");
      setAutorPublicada(data.version_publicada?.autor_nombre || "Sistema");
      setHayBorrador(!!data.borrador);
      setBloqueadoPorOtro(
        data.bloqueo && !data.bloqueo.bloqueado_por_mi ? data.bloqueo.usuario_nombre : undefined
      );
      setRfcsAbiertasAfectadas(data.rfcs_abiertas_impactadas || 0);
      setVersionesHistorial(data.historial_versiones || []);
      setDiffPreview(data.diff_preview || null);

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

  // Guardar borrador (Pattern 3.1)
  const handleGuardarBorrador = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/admin/cambios/flujo-evaluacion/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "guardar_borrador",
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo: "Borrador de cambios en edición"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar borrador");
      setHayBorrador(true);
      await cargarDatos();
      alert("Borrador guardado exitosamente.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Publicar versión formal con Diff (Pattern 3.1)
  const handleConfirmarPublicacion = async (motivo: string) => {
    try {
      setPublicando(true);
      const res = await fetch("/api/admin/cambios/flujo-evaluacion/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo,
          impacto_resumen: "Publicación de versión formal de flujo y auditoría"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al publicar versión");

      setModalPublicarAbierto(false);
      await cargarDatos();
      alert(`Versión ${data.version?.numero_version || versionPublicada + 1} publicada exitosamente.`);
    } catch (err: any) {
      alert("Error al publicar: " + err.message);
    } finally {
      setPublicando(false);
    }
  };

  // Descartar borrador
  const handleDescartarBorrador = async () => {
    if (!confirm("¿Está seguro de descartar el borrador actual? Se perderán las modificaciones no publicadas.")) {
      return;
    }
    try {
      setCargando(true);
      const res = await fetch(`/api/admin/cambios/flujo-evaluacion/configuracion?pestana=${tabActiva}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Error al descartar borrador");
      await cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  // Restaurar de fábrica
  const handleRestaurarFabrica = async () => {
    try {
      setCargando(true);
      const res = await fetch("/api/admin/cambios/flujo-evaluacion/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "restaurar_fabrica",
          pestana: tabActiva
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al restaurar valores de fábrica");
      setModalRestaurarAbierto(false);
      await cargarDatos();
      alert("Se han cargado los valores de fábrica en su borrador de trabajo.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  // Restaurar versión del historial como borrador
  const handleRestaurarVersion = async (versionId: number) => {
    try {
      setCargando(true);
      const res = await fetch("/api/admin/cambios/flujo-evaluacion/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "restaurar_version",
          pestana: tabActiva,
          version_id_origen: versionId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al restaurar versión histórica");
      setModalHistorialAbierto(false);
      await cargarDatos();
      alert(data.mensaje || "Versión cargada como borrador.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  // Exportar configuración JSON
  const handleExportar = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configSnapshot, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `config_cambios_1.3.3.3_${tabActiva}_v${versionPublicada}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar configuración JSON
  const handleImportar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          setConfigSnapshot(imported);
          alert("Archivo JSON cargado correctamente. Guarde el borrador o publique los cambios.");
        } catch {
          alert("El archivo seleccionado no tiene un formato JSON válido.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const deshabilitadoEdicion = !puedeEditar || !!bloqueadoPorOtro;

  return (
    <div style={{ padding: "24px 32px 24px 32px", maxWidth: "1600px", margin: "0 auto", color: "#1e293b", display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* Migas de pan y encabezado */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "6px" }}>
          <Link href="/plataforma/cambios" style={{ color: "#64748b", textDecoration: "none" }}>
            Cambios
          </Link>
          {" / "}
          <Link href="/plataforma/admin/procesos/cambios" style={{ color: "#64748b", textDecoration: "none" }}>
            Configuración
          </Link>
          {" / "}
          <span style={{ color: "#1e293b", fontWeight: 600 }}>Flujo de evaluación, autorización y revisión posterior</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>
              Flujo de Evaluación, Autorización y Revisión Posterior (PIR)
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#475569", margin: 0 }}>
              Ciclo de vida de la RFC (ITIL 4 / COBIT BAI06 / ISO 20000): estados, transiciones, comités CAB/ECAB, tareas y auditoría PIR.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href="/plataforma/admin/procesos/cambios/tipos-requisitos"
              style={{
                fontSize: "0.8rem",
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                color: "#334155",
                textDecoration: "none",
                fontWeight: 600
              }}
            >
              ← Tipos y Requisitos
            </Link>
            <Link
              href="/plataforma/admin/procesos/cambios/notificaciones-calendario"
              style={{
                fontSize: "0.8rem",
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                color: "#334155",
                textDecoration: "none",
                fontWeight: 600
              }}
            >
              Notificaciones y Calendario →
            </Link>
          </div>
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

      {/* Barra de Acciones Común Pattern 3.1 */}
      <BarraAccionesComun
        versionPublicada={versionPublicada}
        fechaPublicada={fechaPublicada}
        autorPublicada={autorPublicada}
        hayBorrador={hayBorrador}
        guardando={guardando}
        publicando={publicando}
        bloqueadoPorOtro={bloqueadoPorOtro}
        puedePublicar={puedePublicar}
        puedeEditar={puedeEditar}
        onGuardarBorrador={handleGuardarBorrador}
        onVistaPrevia={() => {
          alert("Vista previa activa: está visualizando la configuración tal como se comportará en ejecución.");
        }}
        onAbrirPublicar={() => setModalPublicarAbierto(true)}
        onDescartar={handleDescartarBorrador}
        onRestaurarFabrica={() => setModalRestaurarAbierto(true)}
        onVerHistorial={() => setModalHistorialAbierto(true)}
        onExportar={handleExportar}
        onImportar={handleImportar}
      />

      {/* Modal de Publicación con Diff Semántico */}
      {modalPublicarAbierto && (
        <ModalPublicacion
          abierto={modalPublicarAbierto}
          versionActual={versionPublicada}
          diffs={[]}
          ticketsAbiertosAfectados={rfcsAbiertasAfectadas}
          onConfirmar={handleConfirmarPublicacion}
          onCerrar={() => setModalPublicarAbierto(false)}
        />
      )}

      {/* Modal de Historial de Versiones */}
      {modalHistorialAbierto && (
        <ModalHistorialVersiones
          abierto={modalHistorialAbierto}
          versiones={versionesHistorial}
          versionActual={versionPublicada}
          onRestaurarComoBorrador={(v) => handleRestaurarVersion(v.id_version)}
          onCerrar={() => setModalHistorialAbierto(false)}
        />
      )}

      {/* Modal de Restaurar Valores de Fábrica */}
      {modalRestaurarAbierto && (
        <ModalRestaurarFabrica
          abierto={modalRestaurarAbierto}
          onConfirmar={handleRestaurarFabrica}
          onCerrar={() => setModalRestaurarAbierto(false)}
        />
      )}
    </div>
  );
}
