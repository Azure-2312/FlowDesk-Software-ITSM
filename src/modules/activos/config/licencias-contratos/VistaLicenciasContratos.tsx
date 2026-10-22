"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import { BarraAccionesComun } from "@/shared/components/admin/BarraAccionesComun";
import { ModalPublicacion } from "@/shared/components/admin/ModalPublicacion";
import { ModalHistorialVersiones } from "@/shared/components/admin/ModalHistorialVersiones";
import { ModalRestaurarFabrica } from "@/shared/components/admin/ModalRestaurarFabrica";
import { ModalVistaPrevia } from "@/shared/components/admin/ModalVistaPrevia";

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
    titulo: "1.5.3.1 Tipos de licencia y métricas",
    descripcion: "Métricas de consumo SAM (usuario nominal, concurrente, core, dispositivo), vigencia y catálogo de software homologado."
  },
  {
    id: "tipos_contrato_proveedores",
    numero: "1.5.3.2",
    titulo: "1.5.3.2 Tipos de contrato y proveedores",
    descripcion: "Modalidades de contratos de TI, preavisos de no renovación, renovación automática y categorización de proveedores homologados."
  },
  {
    id: "formulario_licencia_contrato",
    numero: "1.5.3.3",
    titulo: "1.5.3.3 Formulario de licencia y contrato",
    descripcion: "Esquema de campos por sección, niveles de obligatoriedad, reglas de integridad y atributos estructurales protegidos."
  },
  {
    id: "cumplimiento_sobreuso",
    numero: "1.5.3.4",
    titulo: "1.5.3.4 Cumplimiento y sobreuso",
    descripcion: "Cálculo automático de estados de cumplimiento, umbral de riesgo, bloqueo de sobreasignación y reclamación por baja."
  },
  {
    id: "alertas_vencimiento_garantia",
    numero: "1.5.3.5",
    titulo: "1.5.3.5 Alertas de vencimiento y garantía",
    descripcion: "Cuadrícula de notificaciones preventivas para contratos, software, garantías de hardware y fin de vida útil."
  },
  {
    id: "renovacion",
    numero: "1.5.3.6",
    titulo: "1.5.3.6 Renovación",
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

  // Snapshot de datos de la pestaña actual
  const [configSnapshot, setConfigSnapshot] = useState<any>({});
  const [historialVersiones, setHistorialVersiones] = useState<any[]>([]);
  const [totalActivosAfectados, setTotalActivosAfectados] = useState<number>(0);
  const [diffsCalculados, setDiffsCalculados] = useState<any[]>([]);

  // Modales
  const [modalVistaPreviaAbierto, setModalVistaPreviaAbierto] = useState<boolean>(false);
  const [modalPublicarAbierto, setModalPublicarAbierto] = useState<boolean>(false);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState<boolean>(false);
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState<boolean>(false);

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
        `/api/admin/activos-config/licencias-contratos/configuracion?pestana=${tabActiva}`
      );
      const data = await res.json();

      if (res.ok) {
        setVersionPublicada(data.version_publicada?.numero_version || 1);
        setFechaPublicada(data.version_publicada?.fecha_creacion || "");
        setAutorPublicada(data.version_publicada?.autor_nombre || "Administrador");
        setHayBorrador(data.tiene_borrador);

        const snapshotActual = data.borrador?.snapshot || data.version_publicada?.snapshot || {};
        setConfigSnapshot(snapshotActual);

        setHistorialVersiones(data.historial_versiones || []);
        setTotalActivosAfectados(data.total_activos || 0);

        if (data.bloqueo && !data.bloqueo.bloqueado_por_mi) {
          setBloqueadoPorOtro(data.bloqueo.usuario_nombre);
        } else {
          setBloqueadoPorOtro(undefined);
        }

        // Formar diffs para el modal de publicación
        if (data.diff_preview?.cambios) {
          setDiffsCalculados(
            data.diff_preview.cambios.map((c: string) => ({
              tipo: "modificado",
              campo: c
            }))
          );
        } else {
          setDiffsCalculados([]);
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
    setHayBorrador(true);
  };

  // Guardar borrador
  const handleGuardarBorrador = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/admin/activos-config/licencias-contratos/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo: `Guardado de borrador en pestaña ${pestanaInfo.titulo}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setHayBorrador(true);
        mostrarToast("Borrador guardado exitosamente.");
        cargarDatos();
      } else {
        mostrarToast(data.error || "No se pudo guardar el borrador.");
      }
    } catch (err: any) {
      mostrarToast(err.message || "Error al guardar el borrador.");
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar publicación
  const handleConfirmarPublicacion = async (motivo: string) => {
    try {
      setPublicando(true);
      const res = await fetch("/api/admin/activos-config/licencias-contratos/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo,
          diff: { tipo: "modificacion_general", pestana: tabActiva }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al publicar la configuración.");
      }

      mostrarToast(data.mensaje || `Versión v${data.nueva_version} publicada exitosamente.`);
      setHayBorrador(false);
      cargarDatos();
    } finally {
      setPublicando(false);
    }
  };

  // Descartar borrador
  const handleDescartarBorrador = async () => {
    if (!confirm("Se perderán todos los cambios del borrador sin publicar. ¿Desea continuar?")) return;
    try {
      const res = await fetch(
        `/api/admin/activos-config/licencias-contratos/configuracion?pestana=${tabActiva}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        mostrarToast("Borrador descartado. Se restauró la versión publicada.");
        setHayBorrador(false);
        cargarDatos();
      }
    } catch (err: any) {
      mostrarToast(err.message || "Error al descartar el borrador.");
    }
  };

  // Restaurar valores de fábrica
  const handleRestaurarFabrica = async () => {
    try {
      const res = await fetch("/api/admin/activos-config/licencias-contratos/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          accion: "restaurar_fabrica"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setHayBorrador(true);
        mostrarToast("Valores de fábrica cargados en el borrador.");
        cargarDatos();
      } else {
        mostrarToast(data.error || "No se pudo restaurar los valores de fábrica.");
      }
    } catch (err: any) {
      mostrarToast(err.message || "Error al restaurar valores de fábrica.");
    }
  };

  // Restaurar versión específica desde modal de historial
  const handleRestaurarVersionComoBorrador = async (version: any) => {
    try {
      const res = await fetch("/api/admin/activos-config/licencias-contratos/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          snapshot: version.snapshot,
          motivo: `Restaurada versión v${version.numero_version} en borrador`
        })
      });
      if (res.ok) {
        mostrarToast(`Versión v${version.numero_version} cargada en borrador.`);
        setModalHistorialAbierto(false);
        setHayBorrador(true);
        cargarDatos();
      }
    } catch (err: any) {
      mostrarToast(err.message || "Error al restaurar la versión.");
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
          setHayBorrador(true);
          mostrarToast("Configuración importada en borrador. Guarde o publique para aplicar.");
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
    <div className="min-h-screen bg-slate-50 flex flex-col pb-6">
      {/* Toast flotante */}
      {toastMensaje && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-sm transition-opacity">
          {toastMensaje}
        </div>
      )}

      {/* Migas de pan y Encabezado de Navegación del Módulo */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
            <Link href="/admin" className="hover:text-slate-800">
              Administración
            </Link>
            <span>/</span>
            <Link href="/admin/activos-config/tipos-modelos-atributos" className="hover:text-slate-800">
              Activos y CMDB
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">1.5.3 Licencias y contratos</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Licencias de Software y Contratos TI
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Definición de métricas SAM, modalidades contractuales, umbrales de sobreuso, alertas de expiración y políticas de renovación.
              </p>
            </div>

            {/* Accesos directos a las pantallas del Módulo 1.5 */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <Link
                href="/admin/activos-config/tipos-modelos-atributos"
                className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
              >
                1.5.1 Tipos y Modelos
              </Link>
              <Link
                href="/admin/activos-config/ciclos-vida-transiciones"
                className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
              >
                1.5.2 Ciclos de Vida
              </Link>
              <span className="px-2.5 py-1 text-xs rounded border border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold">
                1.5.3 Licencias y Contratos
              </span>
              <span className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-slate-100 text-slate-400 font-medium cursor-not-allowed">
                1.5.4 Relaciones CMDB
              </span>
              <span className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-slate-100 text-slate-400 font-medium cursor-not-allowed">
                1.5.5 Integridad CMDB
              </span>
              <span className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-slate-100 text-slate-400 font-medium cursor-not-allowed">
                1.5.6 Auditoría
              </span>
            </div>
          </div>

          {/* Barra de Pestañas (1.5.3.1 a 1.5.3.6) */}
          <div className="flex space-x-1 border-b border-slate-200 mt-6 overflow-x-auto">
            {PESTANAS.map((pestana) => {
              const activa = tabActiva === pestana.id;
              return (
                <button
                  key={pestana.id}
                  onClick={() => cambiarTab(pestana.id)}
                  className={`py-2.5 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activa
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  <span className="font-mono mr-1.5 opacity-75">{pestana.numero}</span>
                  {pestana.titulo.split(" ").slice(1).join(" ")}
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
              Versión publicada: v{versionPublicada}
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

      {/* Barra de Acciones Común Flotante (Patrón 3.1) */}
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
        onVistaPrevia={() => setModalVistaPreviaAbierto(true)}
        onAbrirPublicar={() => setModalPublicarAbierto(true)}
        onDescartar={handleDescartarBorrador}
        onRestaurarFabrica={() => setModalRestaurarAbierto(true)}
        onVerHistorial={() => setModalHistorialAbierto(true)}
        onExportar={handleExportar}
        onImportar={handleImportar}
      />

      {/* Modales del Patrón 3.1 */}
      <ModalVistaPrevia
        abierto={modalVistaPreviaAbierto}
        modulo="activos"
        tituloModulo="Licencias y Contratos (SAM)"
        onCerrar={() => setModalVistaPreviaAbierto(false)}
      />

      <ModalPublicacion
        abierto={modalPublicarAbierto}
        versionActual={versionPublicada}
        diffs={diffsCalculados}
        ticketsAbiertosAfectados={totalActivosAfectados}
        onConfirmar={handleConfirmarPublicacion}
        onCerrar={() => setModalPublicarAbierto(false)}
      />

      <ModalRestaurarFabrica
        abierto={modalRestaurarAbierto}
        onConfirmar={handleRestaurarFabrica}
        onCerrar={() => setModalRestaurarAbierto(false)}
      />

      <ModalHistorialVersiones
        abierto={modalHistorialAbierto}
        versiones={historialVersiones}
        versionActual={versionPublicada}
        onRestaurarComoBorrador={handleRestaurarVersionComoBorrador}
        onCerrar={() => setModalHistorialAbierto(false)}
      />
    </div>
  );
}
