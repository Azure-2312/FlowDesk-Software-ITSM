"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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
    titulo: "Clases de CI",
    descripcion: "Clases físicas y lógicas de la CMDB, atributos obligatorios por clase, relaciones mínimas y participación en tickets."
  },
  {
    id: "tipos_relacion",
    numero: "1.5.4.2",
    titulo: "Tipos de relación",
    descripcion: "Catálogo de relaciones topológicas ITIL, dirección de propagación de fallos, matriz de clases permitidas y simulador."
  },
  {
    id: "criticidad_entornos",
    numero: "1.5.4.3",
    titulo: "Criticidad y entornos",
    descripcion: "Escala de criticidad con RTO/RPO, motor de cálculo de criticidad efectiva por topología y entornos operacionales."
  },
  {
    id: "reglas_integridad",
    numero: "1.5.4.4",
    titulo: "Reglas de integridad",
    descripcion: "Controles de coherencia topológica, prevención de CI huérfanos, validación de ciclos y diagnóstico en vivo."
  },
  {
    id: "fuentes_atributos_protegidos",
    numero: "1.5.4.5",
    titulo: "Fuentes y atributos protegidos",
    descripcion: "Jerarquía de fuentes de datos autorizadas, reconciliación y bloqueo de modificaciones sin cambio formal (RFC)."
  },
  {
    id: "auditoria_lineas_base",
    numero: "1.5.4.6",
    titulo: "Auditoría de CMDB y líneas base",
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

  // Estados de control y autoría
  const [versionPublicada, setVersionPublicada] = useState<number>(1);
  const [fechaPublicada, setFechaPublicada] = useState<string>("");
  const [autorPublicada, setAutorPublicada] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);
  const [bloqueadoPorOtro, setBloqueadoPorOtro] = useState<string | undefined>(undefined);
  const [puedeEditar, setPuedeEditar] = useState<boolean>(true);

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
        `/api/cmdb/configuracion/relaciones/configuracion?pestana=${tabActiva}`
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
  };

  // Guardar y Aplicar Relaciones CMDB Directamente
  const handleGuardarRelaciones = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/cmdb/configuracion/relaciones/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo: `Actualización de relaciones CMDB (${pestanaInfo.titulo})`,
          diff: { tipo: "modificacion_cmdb", pestana: tabActiva }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar la configuración.");
      }

      mostrarToast(data.mensaje || "Configuración de CMDB y relaciones guardada exitosamente.");
      cargarDatos();
    } catch (err: any) {
      mostrarToast(err.message || "Error al guardar la configuración.");
    } finally {
      setGuardando(false);
    }
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

      {/* Encabezado Principal Estandarizado ARQ-3 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded">
                  CMDB ITIL
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Elementos de Configuración y Relaciones de CMDB
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Modelado de clases lógicas y físicas, tipos de enlace topológico, propagación de impacto, integridad y auditoría continua.
              </p>
              <div className="text-[11px] text-slate-400 mt-1">
                Última modificación por <span className="font-medium text-slate-600">{autorPublicada || "Administrador"}</span> {fechaPublicada && `el ${new Date(fechaPublicada).toLocaleString()}`}
              </div>
            </div>

            {/* Accesos directos y acciones del encabezado */}
            <div className="flex flex-wrap items-center gap-2">
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
              <Link
                href="/plataforma/activos/configuracion/licencias-contratos"
                className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium"
              >
                Licencias y Contratos
              </Link>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ● Configuración Activa
              </span>
              <button
                type="button"
                onClick={handleGuardarRelaciones}
                disabled={guardando || !puedeEditar}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5"
              >
                {guardando ? "Guardando..." : "Guardar Relaciones CMDB"}
              </button>
            </div>
          </div>

          {/* Barra de Pestañas sin números */}
          <div className="flex space-x-1 border-b border-slate-200 mt-6 overflow-x-auto">
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
    </div>
  );
}
