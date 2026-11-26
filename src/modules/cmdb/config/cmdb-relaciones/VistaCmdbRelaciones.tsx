"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import { PestanaClasesCI } from "./components/PestanaClasesCI";
import { PestanaTiposRelacion } from "./components/PestanaTiposRelacion";

type TabId =
  | "clases_ci"
  | "tipos_relacion";

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
    descripcion: "Catálogo de relaciones topológicas ITIL, dirección de propagación de fallos y matriz de clases permitidas."
  }
];

const TAB_POR_SLUG: Record<string, TabId> = {
  "clases-ci": "clases_ci",
  "clases": "clases_ci",
  "relaciones": "tipos_relacion",
};

const SLUG_POR_TAB: Record<TabId, string> = {
  clases_ci: "clases",
  tipos_relacion: "relaciones",
};

export default function CmdbRelacionesConfigPage({
  pestanaFija,
}: {
  pestanaFija?: TabId | string;
} = {}) {
  const tabInicial: TabId = pestanaFija && TAB_POR_SLUG[pestanaFija]
    ? TAB_POR_SLUG[pestanaFija]
    : pestanaFija === "tipos_relacion" || pestanaFija === "relaciones"
    ? "tipos_relacion"
    : "clases_ci";

  const [tabActiva, setTabActiva] = useState<TabId>(tabInicial);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Control de enlaces profundos (?vista=)
  useEffect(() => {
    if (pestanaFija) {
      if (pestanaFija === "tipos_relacion" || pestanaFija === "relaciones") {
        setTabActiva("tipos_relacion");
      } else {
        setTabActiva("clases_ci");
      }
      return;
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const vistaParam = params.get("vista");
      if (vistaParam && TAB_POR_SLUG[vistaParam]) {
        setTabActiva(TAB_POR_SLUG[vistaParam]);
      }
    }
  }, [pestanaFija]);

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
        `/api/cmdb/configuracion/relaciones/configuracion?pestana=${tabActiva}`
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
  const handleSnapshotChange = (nuevosDatos: any, pestanaId: string = tabActiva) => {
    setConfigSnapshot(nuevosDatos);
    setSnapshotsPorTab((prev) => ({ ...prev, [pestanaId]: nuevosDatos }));
    setTabsModificadas((prev) => new Set(prev).add(pestanaId));
  };

  // Guardar y Aplicar Relaciones CMDB Directamente
  const handleGuardarRelaciones = async () => {
    try {
      setGuardando(true);
      const tabsAGuardar = tabsModificadas.size > 0 ? Array.from(tabsModificadas) : [tabActiva];

      for (const tId of tabsAGuardar) {
        const snap = snapshotsPorTab[tId] || (tId === tabActiva ? configSnapshot : null);
        if (!snap) continue;
        const res = await fetch("/api/cmdb/configuracion/relaciones/configuracion", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pestana: tId,
            snapshot: snap,
            motivo: `Actualización de relaciones CMDB en pestaña ${tId}`,
            diff: { tipo: "modificacion_cmdb", pestana: tId }
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Error al guardar configuración en pestaña ${tId}`);
        }
      }

      setTabsModificadas(new Set());
      mostrarToast("Configuración de CMDB y relaciones guardada exitosamente.");
      cargarDatos();
    } catch (err: any) {
      mostrarToast(err.message || "Error al guardar la configuración.");
    } finally {
      setGuardando(false);
    }
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
            <h1 className="titulo-pagina">
              Elementos de Configuración y Relaciones de CMDB
            </h1>
            <p className="descripcion-pagina">
              Modelado de clases lógicas y físicas, tipos de enlace topológico, propagación de impacto, integridad y auditoría continua.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, paddingTop: 4 }}>
            <button
              type="button"
              onClick={handleGuardarRelaciones}
              disabled={guardando || !puedeEditar}
              className="boton-primario"
            >
              {guardando ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </div>

        {/* Navegación horizontal de pestañas */}
        {!pestanaFija && (
          <div className="pestanas">
            {PESTANAS.map((pestana) => {
              const activa = tabActiva === pestana.id;
              return (
                <button type="button"
                  key={pestana.id}
                  onClick={() => cambiarTab(pestana.id)}
                  className={activa ? "pestana pestana-activa" : "pestana"}
                >
                  {pestana.titulo}
                </button>
              );
            })}
          </div>
        )}

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
              className="boton-peligro boton-sm"
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
            <div style={{ display: tabActiva === "clases_ci" ? "block" : "none" }}>
              <PestanaClasesCI
                datos={snapshotsPorTab["clases_ci"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "clases_ci")}
                bloqueado={Boolean(bloqueadoPorOtro)}
              />
            </div>
            <div style={{ display: tabActiva === "tipos_relacion" ? "block" : "none" }}>
              <PestanaTiposRelacion
                datos={snapshotsPorTab["tipos_relacion"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "tipos_relacion")}
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
