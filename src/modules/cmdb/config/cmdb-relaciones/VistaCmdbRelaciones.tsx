"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import { BarraAccionesComun } from "@/shared/components/admin/BarraAccionesComun";
import { ModalPublicacion } from "@/shared/components/admin/ModalPublicacion";
import { ModalHistorialVersiones } from "@/shared/components/admin/ModalHistorialVersiones";
import { ModalRestaurarFabrica } from "@/shared/components/admin/ModalRestaurarFabrica";
import { ModalVistaPrevia } from "@/shared/components/admin/ModalVistaPrevia";

import { PestanaClasesCI } from "./components/PestanaClasesCI";
import { PestanaTiposRelacion } from "./components/PestanaTiposRelacion";
import { PestanaCriticidadEntornos } from "./components/PestanaCriticidadEntornos";
import { PestanaReglasIntegridad } from "./components/PestanaReglasIntegridad";
import { PestanaFuentesAtributosProtegidos } from "./components/PestanaFuentesAtributosProtegidos";
import { PestanaAuditoriaLineasBase } from "./components/PestanaAuditoriaLineasBase";

type TabId =
  | "clases_ci"
  | "tipos_relacion"
  | "criticidad_entornos"
  | "reglas_integridad"
  | "fuentes_atributos_protegidos"
  | "auditoria_lineas_base";

interface PestanaMetadata {
  id: TabId;
  numero: string;
  titulo: string;
  descripcion: string;
}

const PESTANAS: PestanaMetadata[] = [
  {
    id: "clases_ci",
    numero: "1.5.4.1",
    titulo: "1.5.4.1 Clases de CI",
    descripcion: "Clases físicas y lógicas de la CMDB, atributos obligatorios por clase, relaciones mínimas y participación en tickets."
  },
  {
    id: "tipos_relacion",
    numero: "1.5.4.2",
    titulo: "1.5.4.2 Tipos de relación",
    descripcion: "Catálogo de relaciones topológicas ITIL, dirección de propagación de fallos, matriz de clases permitidas y simulador."
  },
  {
    id: "criticidad_entornos",
    numero: "1.5.4.3",
    titulo: "1.5.4.3 Criticidad y entornos",
    descripcion: "Escala de criticidad con RTO/RPO, motor de cálculo de criticidad efectiva por topología y entornos operacionales."
  },
  {
    id: "reglas_integridad",
    numero: "1.5.4.4",
    titulo: "1.5.4.4 Reglas de integridad",
    descripcion: "Controles de coherencia topológica, prevención de CI huérfanos, validación de ciclos y diagnóstico en vivo."
  },
  {
    id: "fuentes_atributos_protegidos",
    numero: "1.5.4.5",
    titulo: "1.5.4.5 Fuentes y atributos protegidos",
    descripcion: "Jerarquía de fuentes de datos autorizadas, reconciliación y bloqueo de modificaciones sin cambio formal (RFC)."
  },
  {
    id: "auditoria_lineas_base",
    numero: "1.5.4.6",
    titulo: "1.5.4.6 Auditoría de CMDB y líneas base",
    descripcion: "Campañas de verificación de exactitud, metas institucionales y snapshots inmutables para comparación histórica."
  }
];

const TAB_POR_SLUG: Record<string, TabId> = {
  "clases-ci": "clases_ci",
  "relaciones": "tipos_relacion",
  "criticidad": "criticidad_entornos",
  "integridad": "reglas_integridad",
  "fuentes": "fuentes_atributos_protegidos",
  "lineas-base": "auditoria_lineas_base",
};

const SLUG_POR_TAB: Record<TabId, string> = {
  clases_ci: "clases-ci",
  tipos_relacion: "relaciones",
  criticidad_entornos: "criticidad",
  reglas_integridad: "integridad",
  fuentes_atributos_protegidos: "fuentes",
  auditoria_lineas_base: "lineas-base",
};

export default function CmdbRelacionesConfigPage() {
  const [tabActiva, setTabActiva] = useState<TabId>("clases_ci");
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
        `/api/admin/activos-config/cmdb-relaciones/configuracion?pestana=${tabActiva}`
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
        setErrorCarga(data.error || "Error al cargar la configuración de CMDB y relaciones.");
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
      const res = await fetch("/api/admin/activos-config/cmdb-relaciones/configuracion", {
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
      const res = await fetch("/api/admin/activos-config/cmdb-relaciones/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo,
          diff: { tipo: "modificacion_cmdb", pestana: tabActiva }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al publicar la configuración.");
      }

      mostrarToast(data.mensaje || `Versión v${data.nueva_version} de CMDB publicada exitosamente.`);
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
        `/api/admin/activos-config/cmdb-relaciones/configuracion?pestana=${tabActiva}`,
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
      const res = await fetch("/api/admin/activos-config/cmdb-relaciones/configuracion", {
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
      const res = await fetch("/api/admin/activos-config/cmdb-relaciones/configuracion", {
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
        pantalla: "1.5.4",
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
    a.download = `config_154_${tabActiva}_v${versionPublicada}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarToast("Configuración de CMDB exportada en formato JSON.");
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
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
            <span className="text-slate-800 font-semibold">1.5.4 Tipos de CI y relaciones de CMDB</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Elementos de Configuración y Relaciones de CMDB
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Modelado de clases lógicas y físicas, tipos de enlace topológico, propagación de impacto, integridad y auditoría continua.
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
              <Link
                href="/admin/activos-config/licencias-contratos"
                className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
              >
                1.5.3 Licencias y Contratos
              </Link>
              <span className="px-2.5 py-1 text-xs rounded border border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold">
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

          {/* Barra de Pestañas (1.5.4.1 a 1.5.4.6) */}
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
            {tabActiva === "clases_ci" && (
              <PestanaClasesCI
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
            {tabActiva === "tipos_relacion" && (
              <PestanaTiposRelacion
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
            {tabActiva === "criticidad_entornos" && (
              <PestanaCriticidadEntornos
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
            {tabActiva === "reglas_integridad" && (
              <PestanaReglasIntegridad
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
            {tabActiva === "fuentes_atributos_protegidos" && (
              <PestanaFuentesAtributosProtegidos
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
            {tabActiva === "auditoria_lineas_base" && (
              <PestanaAuditoriaLineasBase
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            )}
          </div>
        )}
      </main>
      </div>

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
        modulo="cmdb"
        tituloModulo="Gestión de la Configuración (CMDB)"
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
