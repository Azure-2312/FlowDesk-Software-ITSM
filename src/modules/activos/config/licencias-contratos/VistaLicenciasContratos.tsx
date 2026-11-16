"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import { PestanaTiposLicencia } from "./components/PestanaTiposLicencia";
import { PestanaTiposContrato } from "./components/PestanaTiposContrato";
import { PestanaFormularioLicenciaContrato } from "./components/PestanaFormularioLicenciaContrato";
import { PestanaCumplimientoSobreuso } from "./components/PestanaCumplimientoSobreuso";
import { PestanaAlertasVencimiento } from "./components/PestanaAlertasVencimiento";
import { PestanaRenovacion } from "./components/PestanaRenovacion";

type TabId =
  | "tipos_licencia_metricas"
  | "tipos_contrato_proveedores"
  | "formulario_licencia_contrato"
  | "cumplimiento_sobreuso"
  | "alertas_vencimiento_garantia"
  | "renovacion";

interface PestanaMetadata {
  id: TabId;
  numero: string;
  titulo: string;
  descripcion: string;
}

const PESTANAS: PestanaMetadata[] = [
  {
    id: "tipos_licencia_metricas",
    numero: "1.5.3.1",
    titulo: "Tipos de licencia y métricas",
    descripcion: "Métricas de consumo SAM (usuario nominal, concurrente, core, dispositivo), vigencia y catálogo de software homologado."
  },
  {
    id: "tipos_contrato_proveedores",
    numero: "1.5.3.2",
    titulo: "Tipos de contrato y proveedores",
    descripcion: "Modalidades de contratos de TI, preavisos de no renovación, renovación automática y categorización de proveedores homologados."
  },
  {
    id: "formulario_licencia_contrato",
    numero: "1.5.3.3",
    titulo: "Formulario de licencia y contrato",
    descripcion: "Esquema de campos por sección, niveles de obligatoriedad, reglas de integridad y atributos estructurales protegidos."
  },
  {
    id: "cumplimiento_sobreuso",
    numero: "1.5.3.4",
    titulo: "Cumplimiento y sobreuso",
    descripcion: "Cálculo automático de estados de cumplimiento, umbral de riesgo, bloqueo de sobreasignación y reclamación por baja."
  },
  {
    id: "alertas_vencimiento_garantia",
    numero: "1.5.3.5",
    titulo: "Alertas de vencimiento y garantía",
    descripcion: "Cuadrícula de notificaciones preventivas para contratos, software, garantías de hardware y fin de vida útil."
  },
  {
    id: "renovacion",
    numero: "1.5.3.6",
    titulo: "Renovación",
    descripcion: "Generación automática de solicitudes de renovación antes del vencimiento, aprobaciones financieras por montos y motivos de descarte."
  }
];

const TAB_POR_SLUG: Record<string, TabId> = {
  "tipos-licencia": "tipos_licencia_metricas",
  "tipos-contrato": "tipos_contrato_proveedores",
  "formulario": "formulario_licencia_contrato",
  "cumplimiento": "cumplimiento_sobreuso",
  "alertas": "alertas_vencimiento_garantia",
  "renovacion": "renovacion",
};

const SLUG_POR_TAB: Record<TabId, string> = {
  tipos_licencia_metricas: "tipos-licencia",
  tipos_contrato_proveedores: "tipos-contrato",
  formulario_licencia_contrato: "formulario",
  cumplimiento_sobreuso: "cumplimiento",
  alertas_vencimiento_garantia: "alertas",
  renovacion: "renovacion",
};

export default function LicenciasContratosConfigPage() {
  const [tabActiva, setTabActiva] = useState<TabId>("tipos_licencia_metricas");
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Control de enlaces profundos (?vista=)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const vistaParam = params.get("vista");
      if (vistaParam && TAB_POR_SLUG[vistaParam]) {
        setTabActiva(TAB_POR_SLUG[vistaParam]);
      }
    }
  }, []);

  const cambiarTab = (nuevaTab: TabId) => {
    setTabActiva(nuevaTab);
    const slug = SLUG_POR_TAB[nuevaTab];
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (slug) {
        url.searchParams.set("vista", slug);
      } else {
        url.searchParams.delete("vista");
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Estados de autoría y guardado
  const [versionPublicada, setVersionPublicada] = useState<number>(1);
  const [fechaPublicada, setFechaPublicada] = useState<string>("");
  const [autorPublicada, setAutorPublicada] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);
  const [bloqueadoPorOtro, setBloqueadoPorOtro] = useState<string | undefined>(undefined);

  // Snapshot de datos de la pestaña actual y tracking de pestañas modificadas
  const [configSnapshot, setConfigSnapshot] = useState<any>({});
  const [snapshotsPorTab, setSnapshotsPorTab] = useState<Record<string, any>>({});
  const [tabsModificadas, setTabsModificadas] = useState<Set<string>>(new Set());

  // Toast
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const pestanaInfo = PESTANAS.find((p) => p.id === tabActiva) || PESTANAS[0];

  // Cargar datos de la pestaña activa desde la API
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const res = await fetch(
        `/api/activos/configuracion/licencias-contratos/configuracion?pestana=${tabActiva}`
      );
      const data = await res.json();

      if (res.ok) {
        setVersionPublicada(data.version_publicada?.numero_version || 1);
        setFechaPublicada(data.version_publicada?.fecha_creacion || "");
        setAutorPublicada(data.version_publicada?.autor_nombre || "Administrador");

        const snapshotActual = data.borrador?.snapshot || data.version_publicada?.snapshot || {};
        setConfigSnapshot(snapshotActual);
        setSnapshotsPorTab((prev) => ({
          ...prev,
          [tabActiva]: prev[tabActiva] !== undefined ? prev[tabActiva] : snapshotActual,
        }));

        if (data.bloqueo && !data.bloqueo.bloqueado_por_mi) {
          setBloqueadoPorOtro(data.bloqueo.usuario_nombre);
        } else {
          setBloqueadoPorOtro(undefined);
        }
      } else {
        setErrorCarga(data.error || "Error al cargar la configuración de licencias y contratos.");
      }
    } catch (err: any) {
      console.error("Error al cargar configuración:", err);
      setErrorCarga(err.message || "Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  }, [tabActiva]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Manejador de cambio de datos en los componentes hijos
  const handleSnapshotChange = (nuevosDatos: any, pestanaId: string = tabActiva) => {
    setConfigSnapshot(nuevosDatos);
    setSnapshotsPorTab((prev) => ({ ...prev, [pestanaId]: nuevosDatos }));
    setTabsModificadas((prev) => new Set(prev).add(pestanaId));
  };

  // Guardar configuración directa coordinada
  const handleGuardarConfiguracion = async () => {
    try {
      setGuardando(true);
      const tabsAGuardar = tabsModificadas.size > 0 ? Array.from(tabsModificadas) : [tabActiva];

      for (const tId of tabsAGuardar) {
        const snap = snapshotsPorTab[tId] || (tId === tabActiva ? configSnapshot : null);
        if (!snap) continue;
        const res = await fetch("/api/activos/configuracion/licencias-contratos/configuracion", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pestana: tId,
            snapshot: snap,
            motivo: `Actualización de licencias y contratos en pestaña ${tId}`,
            diff: { tipo: "modificacion_general", pestana: tId }
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Error al guardar configuración en pestaña ${tId}`);
        }
      }

      setTabsModificadas(new Set());
      mostrarToast("Configuración guardada exitosamente.");
      cargarDatos();
    } catch (err: any) {
      mostrarToast(err.message || "Error al guardar la configuración.");
    } finally {
      setGuardando(false);
    }
  };

  // Exportar configuración JSON
  const handleExportar = () => {
    const jsonStr = JSON.stringify(
      {
        modulo: "activos_y_cmdb",
        pantalla: "1.5.3",
        pestana: tabActiva,
        version: versionPublicada,
        fecha: new Date().toISOString(),
        configuracion: configSnapshot
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `config_153_${tabActiva}_v${versionPublicada}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarToast("Configuración exportada en formato JSON.");
  };

  // Importar configuración JSON
  const handleImportar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        if (json.configuracion) {
          setConfigSnapshot(json.configuracion);
          mostrarToast("Configuración cargada desde JSON. Haga clic en 'Guardar Licencias y Contratos' para aplicar.");
        } else {
          mostrarToast("El archivo no tiene el formato esperado.");
        }
      } catch (err: any) {
        mostrarToast("Error al procesar el archivo JSON: " + err.message);
      }
    };
    input.click();
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", width: "100%", boxSizing: "border-box", padding: "32px 48px 48px 48px" }}>
      <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto 0 0" }}>
        {/* Toast flotante */}
        {toastMensaje && (
          <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-sm transition-opacity">
            {toastMensaje}
          </div>
        )}

        {/* Encabezado Principal Estandarizado (Con márgenes superiores y laterales) */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 24,
          marginBottom: 20
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>
              Licencias de Software y Contratos TI
            </h1>
            <p style={{ margin: "8px 0 0 0", color: "#64748b", fontSize: 13.5, lineHeight: 1.5 }}>
              Definición de métricas SAM, modalidades contractuales, umbrales de sobreuso, alertas de expiración y políticas de renovación.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, paddingTop: 4 }}>
            <button
              onClick={handleGuardarConfiguracion}
              type="button"
              disabled={guardando || Boolean(bloqueadoPorOtro)}
              className="boton-primario"
              style={{ padding: "9px 22px", fontSize: 13, width: "auto", fontWeight: 700 }}
            >
              {guardando ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </div>

        {/* Navegación horizontal de pestañas */}
        <div style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #e2e8f0",
          marginBottom: 28,
          justifyContent: "flex-start",
          overflowX: "auto"
        }}>
          {PESTANAS.map((pestana) => {
            const activa = tabActiva === pestana.id;
            return (
              <button
                key={pestana.id}
                onClick={() => cambiarTab(pestana.id)}
                style={{
                  padding: "12px 18px",
                  border: "none",
                  background: "transparent",
                  borderBottom: activa ? "2px solid #2563eb" : "2px solid transparent",
                  color: activa ? "#2563eb" : "#64748b",
                  fontWeight: activa ? 600 : 500,
                  fontSize: 13.5,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {pestana.titulo}
              </button>
            );
          })}
        </div>

        {/* Contenido Principal de la Pestaña Activa */}
        <div style={{ width: "100%" }}>

        {/* Error o Spinner de Carga */}
        {errorCarga && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg text-rose-800 text-sm mb-6 flex items-center justify-between">
            <div>
              <strong>Error de carga:</strong> {errorCarga}
            </div>
            <button
              onClick={cargarDatos}
              className="px-3 py-1 bg-white border border-rose-300 text-rose-700 text-xs rounded hover:bg-rose-100"
            >
              Reintentar
            </button>
          </div>
        )}

        {cargando ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-3"></div>
            <p className="text-sm font-medium">Cargando configuración de {pestanaInfo.titulo}...</p>
          </div>
        ) : (
          <div>
            <div style={{ display: tabActiva === "tipos_licencia_metricas" ? "block" : "none" }}>
              <PestanaTiposLicencia
                datos={snapshotsPorTab["tipos_licencia_metricas"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "tipos_licencia_metricas")}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            </div>
            <div style={{ display: tabActiva === "tipos_contrato_proveedores" ? "block" : "none" }}>
              <PestanaTiposContrato
                datos={snapshotsPorTab["tipos_contrato_proveedores"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "tipos_contrato_proveedores")}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            </div>
            <div style={{ display: tabActiva === "formulario_licencia_contrato" ? "block" : "none" }}>
              <PestanaFormularioLicenciaContrato
                datos={snapshotsPorTab["formulario_licencia_contrato"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "formulario_licencia_contrato")}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            </div>
            <div style={{ display: tabActiva === "cumplimiento_sobreuso" ? "block" : "none" }}>
              <PestanaCumplimientoSobreuso
                datos={snapshotsPorTab["cumplimiento_sobreuso"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "cumplimiento_sobreuso")}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            </div>
            <div style={{ display: tabActiva === "alertas_vencimiento_garantia" ? "block" : "none" }}>
              <PestanaAlertasVencimiento
                datos={snapshotsPorTab["alertas_vencimiento_garantia"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "alertas_vencimiento_garantia")}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            </div>
            <div style={{ display: tabActiva === "renovacion" ? "block" : "none" }}>
              <PestanaRenovacion
                datos={snapshotsPorTab["renovacion"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "renovacion")}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
