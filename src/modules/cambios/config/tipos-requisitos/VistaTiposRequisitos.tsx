"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BarraAccionesComun } from "@/shared/components/admin/BarraAccionesComun";
import { ModalPublicacion } from "@/shared/components/admin/ModalPublicacion";
import { ModalHistorialVersiones } from "../formulario/components/ModalHistorialVersiones";
import { ModalRestaurarFabrica } from "../formulario/components/ModalRestaurarFabrica";

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

  // Snapshot activo
  const [configSnapshot, setConfigSnapshot] = useState<any>({});

  // Modales
  const [modalPublicarAbierto, setModalPublicarAbierto] = useState<boolean>(false);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState<boolean>(false);
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState<boolean>(false);
  const [versionesHistorial, setVersionesHistorial] = useState<any[]>([]);
  const [rfcsAbiertasAfectadas, setRfcsAbiertasAfectadas] = useState<number>(0);

  // Cargar datos de la pestaña activa
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const res = await fetch(`/api/admin/cambios/tipos-requisitos/configuracion?pestana=${tabActiva}`);
      if (!res.ok) throw new Error("Error al obtener la configuración del servidor");
      const data = await res.json();

      setVersionPublicada(data.version_publicada?.numero_version || 1);
      setFechaPublicada(data.version_publicada?.fecha_creacion || "");
      setHayBorrador(!!data.borrador);
      setBloqueadoPorOtro(
        data.bloqueo && !data.bloqueo.bloqueado_por_mi ? data.bloqueo.usuario_nombre : undefined
      );
      setRfcsAbiertasAfectadas(data.rfcs_abiertas_impactadas || 0);
      setVersionesHistorial(data.historial_versiones || []);

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

  // Guardar borrador
  const handleGuardarBorrador = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/admin/cambios/tipos-requisitos/configuracion", {
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

  // Descartar borrador
  const handleDescartarBorrador = async () => {
    if (!confirm("¿Deseas descartar todas las modificaciones del borrador y volver a la versión publicada?")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/cambios/tipos-requisitos/configuracion?pestana=${tabActiva}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al descartar");
      await cargarDatos();
      alert("Borrador descartado.");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Publicar versión formal
  const handleConfirmarPublicacion = async (motivo: string) => {
    try {
      setPublicando(true);
      const res = await fetch("/api/admin/cambios/tipos-requisitos/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          motivo,
          impacto_resumen: `Publicación en Submódulo 1.3.3.2 (${PESTANAS_INFO[tabActiva].titulo})`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al publicar");
      alert(data.mensaje || "Versión publicada exitosamente.");
      setModalPublicarAbierto(false);
      await cargarDatos();
    } catch (err: any) {
      alert("Error al publicar: " + err.message);
    } finally {
      setPublicando(false);
    }
  };

  // Restaurar de fábrica
  const handleRestaurarFabrica = async () => {
    try {
      const res = await fetch("/api/admin/cambios/tipos-requisitos/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "restaurar_fabrica",
          pestana: tabActiva
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al restaurar");
      alert("Se cargaron los valores de fábrica ITIL v4 en el borrador.");
      setModalRestaurarAbierto(false);
      await cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Restaurar versión histórica
  const handleRestaurarVersionHistorica = async (idVersion: number) => {
    try {
      const res = await fetch("/api/admin/cambios/tipos-requisitos/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "restaurar_version",
          pestana: tabActiva,
          version_id_origen: idVersion
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al restaurar versión");
      alert(data.mensaje);
      setModalHistorialAbierto(false);
      await cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{ paddingBottom: 90, minWidth: 1000, maxWidth: 1400, margin: "0 auto", padding: "20px 24px 100px" }}>
      {/* Navegación y Encabezado del Módulo */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748b", marginBottom: 6 }}>
          <Link href="/plataforma/cambios" style={{ color: "#2563eb", textDecoration: "none" }}>
            Cambios
          </Link>
          <span>/</span>
          <Link href="/plataforma/admin/procesos/cambios" style={{ color: "#2563eb", textDecoration: "none" }}>
            Configuración
          </Link>
          <span>/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>Tipos de cambio y requisitos</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: "0 0 4px 0", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>
              Tipos de Cambio y Requisitos
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
              Gobierno de directrices ITIL v4: tipos normativos, matriz de autoridad, catálogo de modelos estándar y reglas de elevación.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/plataforma/admin/procesos/cambios/formulario"
              style={{
                padding: "6px 12px",
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
                padding: "6px 12px",
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
          </div>
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
                setHayBorrador(true);
              }}
              onIrAMatrizAutoridad={() => setTabActiva("matriz_autoridad")}
            />
          )}

          {tabActiva === "matriz_autoridad" && (
            <PestanaMatrizAutoridad
              config={configSnapshot}
              onChange={(nuevo) => {
                setConfigSnapshot(nuevo);
                setHayBorrador(true);
              }}
            />
          )}

          {tabActiva === "modelos_estandar" && (
            <PestanaModelosEstandar
              config={configSnapshot}
              onChange={(nuevo) => {
                setConfigSnapshot(nuevo);
                setHayBorrador(true);
              }}
            />
          )}

          {tabActiva === "reglas_clasificacion" && (
            <PestanaReglasClasificacion
              config={configSnapshot}
              onChange={(nuevo) => {
                setConfigSnapshot(nuevo);
                setHayBorrador(true);
              }}
            />
          )}
        </div>
      )}

      {/* Barra de Acciones Común (Pattern 3.1) */}
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
        onVistaPrevia={() => {}}
        onAbrirPublicar={() => setModalPublicarAbierto(true)}
        onDescartar={handleDescartarBorrador}
        onRestaurarFabrica={() => setModalRestaurarAbierto(true)}
        onVerHistorial={() => setModalHistorialAbierto(true)}
        onExportar={() => {
          const blob = new Blob([JSON.stringify(configSnapshot, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `config_1.3.3.2_${tabActiva}_v${versionPublicada}.json`;
          a.click();
        }}
        onImportar={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".json";
          input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event: any) => {
              try {
                const parsed = JSON.parse(event.target.result);
                setConfigSnapshot(parsed);
                setHayBorrador(true);
                alert("Archivo JSON cargado exitosamente en borrador.");
              } catch (err: any) {
                alert("Error al leer el archivo JSON: " + err.message);
              }
            };
            reader.readAsText(file);
          };
          input.click();
        }}
      />

      {/* Modal de Publicación Formal con Diff */}
      <ModalPublicacion
        abierto={modalPublicarAbierto}
        versionActual={versionPublicada}
        diffs={[]}
        ticketsAbiertosAfectados={rfcsAbiertasAfectadas}
        onConfirmar={handleConfirmarPublicacion}
        onCerrar={() => setModalPublicarAbierto(false)}
      />

      {/* Modal de Historial de Versiones */}
      <ModalHistorialVersiones
        abierto={modalHistorialAbierto}
        versiones={versionesHistorial}
        versionActual={versionPublicada}
        onRestaurarComoBorrador={(v) => handleRestaurarVersionHistorica(v.id_version)}
        onCerrar={() => setModalHistorialAbierto(false)}
      />

      {/* Modal de Restaurar Valores de Fábrica */}
      <ModalRestaurarFabrica
        abierto={modalRestaurarAbierto}
        onConfirmar={handleRestaurarFabrica}
        onCerrar={() => setModalRestaurarAbierto(false)}
      />
    </div>
  );
}
