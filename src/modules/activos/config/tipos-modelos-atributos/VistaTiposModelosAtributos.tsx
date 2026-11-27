"use client";

import React, { useEffect, useState, useCallback } from "react";

import { PestanaClasesTipos } from "./components/PestanaClasesTipos";
import { PestanaFabricantesModelos } from "./components/PestanaFabricantesModelos";
import { PestanaAtributosTipo } from "./components/PestanaAtributosTipo";
import { PestanaUbicaciones } from "./components/PestanaUbicaciones";
import { PestanaCatalogosAuxiliares } from "./components/PestanaCatalogosAuxiliares";
import { ContenedorSubpestanas, RanuraSubpestanas, SeccionSubpestanas } from "@/shared/components/ui/RanuraSubpestanas";

type TabId =
  | "clases_tipos"
  | "fabricantes_modelos"
  | "atributos"
  | "ubicaciones"
  | "catalogos_auxiliares";

interface PestanaMetadata {
  id: TabId;
  numero: string;
  titulo: string;
  descripcion: string;
}

const PESTANAS: PestanaMetadata[] = [
  {
    id: "clases_tipos",
    numero: "1.5.1.1",
    titulo: "Jerarquía de clases y tipos",
    descripcion: "Definición de clases, tipos subordinados, gobernanza de inventario, soporte y relación con Incidentes."
  },
  {
    id: "fabricantes_modelos",
    numero: "1.5.1.2",
    titulo: "Fabricantes y modelos",
    descripcion: "Catálogo de marcas certificadas, modelos homologados, garantías estándar y fechas de fin de soporte."
  },
  {
    id: "atributos",
    numero: "1.5.1.3",
    titulo: "Atributos por tipo",
    descripcion: "Esquema dinámico de especificaciones técnicas por clase y tipo con banderas de unicidad y confidencialidad."
  },
  {
    id: "ubicaciones",
    numero: "1.5.1.6",
    titulo: "Ubicaciones",
    descripcion: "Jerarquía de 5 niveles (Sede > Edificio > Piso > Ambiente > Rack), capacidades U y trazabilidad de activos."
  },
  {
    id: "catalogos_auxiliares",
    numero: "1.5.1.7",
    titulo: "Listas y catálogos auxiliares",
    descripcion: "Listas maestras para condición física, monedas base, adquisición, tipos de documento y centros de costo."
  }
];

const TAB_POR_SLUG: Record<string, TabId> = {
  "clases-tipos": "clases_tipos",
  "fabricantes": "fabricantes_modelos",
  "atributos": "atributos",
  "ubicaciones": "ubicaciones",
  "catalogos": "catalogos_auxiliares",
};

const SLUG_POR_TAB: Record<TabId, string> = {
  clases_tipos: "clases-tipos",
  fabricantes_modelos: "fabricantes",
  atributos: "atributos",
  ubicaciones: "ubicaciones",
  catalogos_auxiliares: "catalogos",
};

export default function TiposModelosAtributosPage({
  vistaInicial,
  vistaActivaN1,
}: {
  vistaInicial?: string;
  vistaActivaN1?: string;
} = {}) {
  const getTabInicial = (): TabId => {
    if (vistaActivaN1 === "fabricantes-modelos") return "fabricantes_modelos";
    if (vistaActivaN1 === "ubicaciones") return "ubicaciones";
    if (vistaActivaN1 === "listas") return "catalogos_auxiliares";
    if (vistaActivaN1 === "tipos-atributos") return "clases_tipos";
    if (vistaInicial && TAB_POR_SLUG[vistaInicial]) return TAB_POR_SLUG[vistaInicial];
    return "clases_tipos";
  };

  const [tabActiva, setTabActiva] = useState<TabId>(getTabInicial());
  const [vistaExclusiva, setVistaExclusiva] = useState<string | null>(
    vistaActivaN1 && vistaActivaN1 !== "tipos-atributos" ? vistaActivaN1 : vistaInicial || null
  );
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Control de enlaces profundos (?vista=)
  useEffect(() => {
    if (vistaInicial && TAB_POR_SLUG[vistaInicial]) {
      setTabActiva(TAB_POR_SLUG[vistaInicial]);
      setVistaExclusiva(vistaInicial);
      return;
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const vistaParam = params.get("vista");
      if (vistaParam && TAB_POR_SLUG[vistaParam]) {
        setTabActiva(TAB_POR_SLUG[vistaParam]);
        // Si viene desde un ítem de menú específico (Gestor de Activos), se detecta la vista exclusiva
        if (["fabricantes", "catalogos", "ubicaciones"].includes(vistaParam)) {
          setVistaExclusiva(vistaParam);
        }
      }
    }
  }, [vistaInicial]);

  const cambiarTab = (nuevaTab: TabId) => {
    setTabActiva(nuevaTab);
    if (vistaActivaN1) return; // la URL (?vista=) pertenece a las pestañas de la página
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

  // Cuando la pantalla ya tiene pestañas de página (?vista= de Configuración de
  // activos), aquí solo se muestran las secciones propias de esa vista; las demás
  // ya son pestañas de la página y no se repiten.
  const SECCIONES_POR_VISTA_N1: Record<string, TabId[]> = {
    "tipos-atributos": ["clases_tipos", "atributos"],
    "fabricantes-modelos": ["fabricantes_modelos"],
    ubicaciones: ["ubicaciones"],
    listas: ["catalogos_auxiliares"],
  };
  const pestanasVisibles = vistaActivaN1
    ? PESTANAS.filter((p) => (SECCIONES_POR_VISTA_N1[vistaActivaN1] ?? []).includes(p.id))
    : vistaExclusiva
    ? []
    : PESTANAS;

  // Cargar datos de la pestaña activa desde la API
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const res = await fetch(
        `/api/activos/configuracion/tipos-modelos-atributos/configuracion?pestana=${tabActiva}`
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
        setErrorCarga(data.error || "Error al cargar la configuración de activos.");
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
        const res = await fetch("/api/activos/configuracion/tipos-modelos-atributos/configuracion", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pestana: tId,
            snapshot: snap,
            motivo: `Actualización de catálogo en pestaña ${tId}`,
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

  // Exportar configuración a archivo JSON
  const handleExportar = () => {
    const jsonStr = JSON.stringify(
      {
        modulo: "activos_y_cmdb",
        pantalla: "1.5.1",
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
    a.download = `config_activos_151_${tabActiva}_v${versionPublicada}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarToast("Configuración exportada en formato JSON firmado.");
  };

  // Importar configuración desde archivo JSON
  const handleImportar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        if (json.modulo !== "activos_y_cmdb" || json.pantalla !== "1.5.1") {
          alert("El archivo JSON no corresponde a la configuración de Activos y CMDB.");
          return;
        }
        if (json.configuracion) {
          setConfigSnapshot(json.configuracion);
          mostrarToast("Configuración cargada desde JSON. Haga clic en 'Guardar Configuración' para aplicar.");
        }
      } catch (err) {
        alert("El archivo seleccionado no es un JSON válido.");
      }
    };
    input.click();
  };

  // Solicitar control concurrente
  const handleSolicitarControl = async () => {
    try {
      const res = await fetch("/api/activos/configuracion/tipos-modelos-atributos/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          accion: "solicitar_control"
        })
      });
      const data = await res.json();
      if (res.ok) {
        mostrarToast("Control concedido exitosamente.");
        setBloqueadoPorOtro(undefined);
        cargarDatos();
      } else {
        mostrarToast(data.error || "No se pudo tomar control.");
      }
    } catch (err: any) {
      mostrarToast(err.message || "Error al solicitar control.");
    }
  };

  const estaBloqueado = !!bloqueadoPorOtro;

  return (
    <ContenedorSubpestanas>
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", width: "100%", boxSizing: "border-box", padding: "32px 48px 48px 48px" }}>
      <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto 0 0" }}>
        {/* Toast informativo */}
        {toastMensaje && (
          <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium border border-slate-700 animate-in fade-in duration-200">
            {toastMensaje}
          </div>
        )}

        {/* Pestañas arriba (y sub-pestañas de la sección); el título es el de la pestaña activa */}
        {pestanasVisibles.length > 1 && (
          <div className="pestanas">
            {pestanasVisibles.map((tab) => {
              const activa = tabActiva === tab.id;
              return (
                <button type="button"
                  key={tab.id}
                  onClick={() => cambiarTab(tab.id)}
                  className={activa ? "pestana pestana-activa" : "pestana"}
                >
                  {tab.titulo}
                </button>
              );
            })}
          </div>
        )}
        <RanuraSubpestanas />

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
              {pestanaInfo.titulo}
            </h1>
            <p className="descripcion-pagina">
              {pestanaInfo.descripcion}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, paddingTop: 4 }}>
            <button
              onClick={handleGuardarConfiguracion}
              type="button"
              disabled={guardando || estaBloqueado}
              className="boton-primario"
            >
              {guardando ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </div>

        {/* Banner de bloqueo concurrente si aplica */}
        {bloqueadoPorOtro && (
          <div className="bg-amber-500 text-white px-6 py-2.5 text-xs font-medium flex items-center justify-between rounded-lg shadow-sm mb-6">
            <div>
              Esta pestaña se encuentra en edición exclusiva por <span className="font-bold underline">{bloqueadoPorOtro}</span>. 
              El modo de solo lectura está activo.
            </div>
            <button
              onClick={handleSolicitarControl}
              className="boton-secundario"
            >
              Solicitar control
            </button>
          </div>
        )}

        {/* 4. Cuerpo de la pantalla con el componente activo */}
        <div style={{ width: "100%" }}>
        {cargando ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-700">Cargando configuración del módulo...</p>
            <p className="text-xs text-slate-400 mt-1">Sincronizando versiones y esquema de gobernanza</p>
          </div>
        ) : errorCarga ? (
          <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center">
            <p className="text-sm font-bold text-red-800 mb-2">Error al cargar datos</p>
            <p className="text-xs text-red-600 mb-4">{errorCarga}</p>
            <button
              onClick={cargarDatos}
              className="boton-peligro boton-sm"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: tabActiva === "clases_tipos" ? "block" : "none" }}>
              <SeccionSubpestanas activa={tabActiva === "clases_tipos"}>
                <PestanaClasesTipos
                  datos={snapshotsPorTab["clases_tipos"] || configSnapshot}
                  onChange={(d) => handleSnapshotChange(d, "clases_tipos")}
                  bloqueado={estaBloqueado}
                />
              </SeccionSubpestanas>
            </div>
            <div style={{ display: tabActiva === "fabricantes_modelos" ? "block" : "none" }}>
              <SeccionSubpestanas activa={tabActiva === "fabricantes_modelos"}>
                <PestanaFabricantesModelos
                  datos={snapshotsPorTab["fabricantes_modelos"] || configSnapshot}
                  onChange={(d) => handleSnapshotChange(d, "fabricantes_modelos")}
                  bloqueado={estaBloqueado}
                />
              </SeccionSubpestanas>
            </div>
            <div style={{ display: tabActiva === "atributos" ? "block" : "none" }}>
              <SeccionSubpestanas activa={tabActiva === "atributos"}>
                <PestanaAtributosTipo
                  datos={snapshotsPorTab["atributos"] || configSnapshot}
                  onChange={(d) => handleSnapshotChange(d, "atributos")}
                  bloqueado={estaBloqueado}
                />
              </SeccionSubpestanas>
            </div>
            <div style={{ display: tabActiva === "ubicaciones" ? "block" : "none" }}>
              <SeccionSubpestanas activa={tabActiva === "ubicaciones"}>
                <PestanaUbicaciones
                  datos={snapshotsPorTab["ubicaciones"] || configSnapshot}
                  onChange={(d) => handleSnapshotChange(d, "ubicaciones")}
                  bloqueado={estaBloqueado}
                />
              </SeccionSubpestanas>
            </div>
            <div style={{ display: tabActiva === "catalogos_auxiliares" ? "block" : "none" }}>
              <SeccionSubpestanas activa={tabActiva === "catalogos_auxiliares"}>
                <PestanaCatalogosAuxiliares
                  datos={snapshotsPorTab["catalogos_auxiliares"] || configSnapshot}
                  onChange={(d) => handleSnapshotChange(d, "catalogos_auxiliares")}
                  bloqueado={estaBloqueado}
                />
              </SeccionSubpestanas>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
    </ContenedorSubpestanas>
  );
}
