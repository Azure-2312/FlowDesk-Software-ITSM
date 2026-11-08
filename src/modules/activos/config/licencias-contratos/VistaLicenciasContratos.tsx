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

  // Snapshot de datos de la pestaña actual
  const [configSnapshot, setConfigSnapshot] = useState<any>({});

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
  const handleSnapshotChange = (nuevosDatos: any) => {
    setConfigSnapshot(nuevosDatos);
  };

  // Guardar configuración directa
  const handleGuardarConfiguracion = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/activos/configuracion/licencias-contratos/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo: `Actualización de licencias y contratos en pestaña ${pestanaInfo.titulo}`,
          diff: { tipo: "modificacion_general", pestana: tabActiva }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar la configuración.");
      }

      mostrarToast(data.mensaje || "Configuración guardada exitosamente.");
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Toast flotante */}
      {toastMensaje && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-sm transition-opacity">
          {toastMensaje}
        </div>
      )}

      {/* Encabezado canónico ARQ-4: Configuración de Catálogos */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Gestión SAM &amp; Contratos
                </span>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Licencias de Software y Contratos TI
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ● Configuración Activa
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                Definición de métricas SAM, modalidades contractuales, umbrales de sobreuso, alertas de expiración y políticas de renovación.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleImportar}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                title="Importar catálogo JSON"
              >
                Importar JSON
              </button>
              <button
                onClick={handleExportar}
                className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                title="Exportar catálogo JSON"
              >
                Exportar JSON
              </button>
              <button
                onClick={handleGuardarConfiguracion}
                disabled={guardando || Boolean(bloqueadoPorOtro)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar Licencias y Contratos"}
              </button>
            </div>
          </div>

          {/* Accesos directos a las pantallas del Módulo Activos y CMDB */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Vistas de Activos:</span>
            <Link
              href="/plataforma/activos/configuracion/tipos-modelos-atributos"
              className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
            >
              Tipos y Modelos
            </Link>
            <Link
              href="/plataforma/activos/configuracion/ciclos-vida-transiciones"
              className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
            >
              Ciclos de Vida
            </Link>
            <span className="px-2.5 py-1 text-xs rounded border border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold">
              Licencias y Contratos
            </span>
          </div>

          {/* Barra de Pestañas sin números */}
          <div className="flex space-x-1 border-b border-slate-200 mt-4 overflow-x-auto">
            {PESTANAS.map((pestana) => {
              const activa = tabActiva === pestana.id;
              return (
                <button
                  key={pestana.id}
                  onClick={() => cambiarTab(pestana.id)}
                  className={`py-2.5 px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activa
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  {pestana.titulo}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido Principal de la Pestaña Activa */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner informativo de pestaña */}
        <div className="bg-white border-l-4 border-indigo-500 p-4 rounded-r-lg shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">{pestanaInfo.titulo}</h2>
              <p className="text-xs text-slate-600 mt-0.5">{pestanaInfo.descripcion}</p>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              Versión activa: v{versionPublicada}
            </div>
          </div>
        </div>

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
            {tabActiva === "tipos_licencia_metricas" && (
              <PestanaTiposLicencia
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
            {tabActiva === "tipos_contrato_proveedores" && (
              <PestanaTiposContrato
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
            {tabActiva === "formulario_licencia_contrato" && (
              <PestanaFormularioLicenciaContrato
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
            {tabActiva === "cumplimiento_sobreuso" && (
              <PestanaCumplimientoSobreuso
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
            {tabActiva === "alertas_vencimiento_garantia" && (
              <PestanaAlertasVencimiento
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
            {tabActiva === "renovacion" && (
              <PestanaRenovacion
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
