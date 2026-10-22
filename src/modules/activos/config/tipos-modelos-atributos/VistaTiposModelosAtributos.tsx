"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import { BarraAccionesComun } from "@/shared/components/admin/BarraAccionesComun";
import { ModalPublicacion } from "@/shared/components/admin/ModalPublicacion";
import { ModalHistorialVersiones } from "@/shared/components/admin/ModalHistorialVersiones";
import { ModalRestaurarFabrica } from "@/shared/components/admin/ModalRestaurarFabrica";
import { ModalVistaPrevia } from "@/shared/components/admin/ModalVistaPrevia";

import { PestanaClasesTipos } from "./components/PestanaClasesTipos";
import { PestanaFabricantesModelos } from "./components/PestanaFabricantesModelos";
import { PestanaAtributosTipo } from "./components/PestanaAtributosTipo";
import { PestanaFormularioActivo } from "./components/PestanaFormularioActivo";
import { PestanaCodigoEtiquetas } from "./components/PestanaCodigoEtiquetas";
import { PestanaUbicaciones } from "./components/PestanaUbicaciones";
import { PestanaCatalogosAuxiliares } from "./components/PestanaCatalogosAuxiliares";
import { PestanaFichaListado } from "./components/PestanaFichaListado";
import { PestanaImportacionInventario } from "./components/PestanaImportacionInventario";

type TabId =
  | "clases_tipos"
  | "fabricantes_modelos"
  | "atributos"
  | "formulario_activo"
  | "codigo_etiquetas"
  | "ubicaciones"
  | "catalogos_auxiliares"
  | "ficha_listado"
  | "importacion_inventario";

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
    titulo: "1.5.1.1 Jerarquía de clases y tipos",
    descripcion: "Definición de clases, tipos subordinados, gobernanza de inventario, soporte y relación con Incidentes."
  },
  {
    id: "fabricantes_modelos",
    numero: "1.5.1.2",
    titulo: "1.5.1.2 Fabricantes y modelos",
    descripcion: "Catálogo de marcas certificadas, modelos homologados, garantías estándar y fechas de fin de soporte."
  },
  {
    id: "atributos",
    numero: "1.5.1.3",
    titulo: "1.5.1.3 Atributos por tipo",
    descripcion: "Esquema dinámico de especificaciones técnicas por clase y tipo con banderas de unicidad y confidencialidad."
  },
  {
    id: "formulario_activo",
    numero: "1.5.1.4",
    titulo: "1.5.1.4 Formulario del activo",
    descripcion: "Estructura por secciones A-G, campos obligatorios condicionales, anchos de grilla y campos bloqueados."
  },
  {
    id: "codigo_etiquetas",
    numero: "1.5.1.5",
    titulo: "1.5.1.5 Código de activo y etiquetas",
    descripcion: "Constructor del código patrimonial por tokens, alcance correlativo y diseño de etiquetas físicas con código QR."
  },
  {
    id: "ubicaciones",
    numero: "1.5.1.6",
    titulo: "1.5.1.6 Ubicaciones",
    descripcion: "Jerarquía de 5 niveles (Sede > Edificio > Piso > Ambiente > Rack), capacidades U y trazabilidad de activos."
  },
  {
    id: "catalogos_auxiliares",
    numero: "1.5.1.7",
    titulo: "1.5.1.7 Listas y catálogos auxiliares",
    descripcion: "Listas maestras para condición física, monedas base, adquisición, tipos de documento y centros de costo."
  },
  {
    id: "ficha_listado",
    numero: "1.5.1.8",
    titulo: "1.5.1.8 Ficha del activo y listado",
    descripcion: "Configuración de la cabecera fija (5.1), 11 pestañas de la ficha, panel lateral y columnas del inventario 7.1."
  },
  {
    id: "importacion_inventario",
    numero: "1.5.1.9",
    titulo: "1.5.1.9 Importación e inventario físico",
    descripcion: "Perfiles de carga masiva, validación en seco (Dry Run), campañas de auditoría física y generación de actas."
  }
];

const TAB_POR_SLUG: Record<string, TabId> = {
  "clases-tipos": "clases_tipos",
  "fabricantes": "fabricantes_modelos",
  "atributos": "atributos",
  "formulario": "formulario_activo",
  "codigo-etiquetas": "codigo_etiquetas",
  "ubicaciones": "ubicaciones",
  "catalogos": "catalogos_auxiliares",
  "ficha-listado": "ficha_listado",
  "importacion": "importacion_inventario",
};

const SLUG_POR_TAB: Record<TabId, string> = {
  clases_tipos: "clases-tipos",
  fabricantes_modelos: "fabricantes",
  atributos: "atributos",
  formulario_activo: "formulario",
  codigo_etiquetas: "codigo-etiquetas",
  ubicaciones: "ubicaciones",
  catalogos_auxiliares: "catalogos",
  ficha_listado: "ficha-listado",
  importacion_inventario: "importacion",
};

export default function TiposModelosAtributosPage() {
  const [tabActiva, setTabActiva] = useState<TabId>("clases_tipos");
  const [vistaExclusiva, setVistaExclusiva] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Control de enlaces profundos (?vista=)
  useEffect(() => {
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
        `/api/admin/activos-config/tipos-modelos-atributos/configuracion?pestana=${tabActiva}`
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
  const handleSnapshotChange = (nuevosDatos: any) => {
    setConfigSnapshot(nuevosDatos);
    setHayBorrador(true);
  };

  // Guardar borrador
  const handleGuardarBorrador = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/admin/activos-config/tipos-modelos-atributos/configuracion", {
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

  // Abrir modal de publicación
  const handleAbrirPublicar = () => {
    setModalPublicarAbierto(true);
  };

  // Confirmar publicación
  const handleConfirmarPublicacion = async (motivo: string) => {
    try {
      setPublicando(true);
      const res = await fetch("/api/admin/activos-config/tipos-modelos-atributos/configuracion", {
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
        `/api/admin/activos-config/tipos-modelos-atributos/configuracion?pestana=${tabActiva}`,
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
      const res = await fetch("/api/admin/activos-config/tipos-modelos-atributos/configuracion", {
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

  // Restaurar versión específica desde el modal de historial
  const handleRestaurarVersionComoBorrador = async (version: any) => {
    try {
      const res = await fetch("/api/admin/activos-config/tipos-modelos-atributos/configuracion", {
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
          alert("El archivo JSON no corresponde a la configuración de Activos y CMDB (Pantalla 1.5.1).");
          return;
        }
        if (json.configuracion) {
          setConfigSnapshot(json.configuracion);
          setHayBorrador(true);
          mostrarToast("Configuración cargada en borrador desde JSON. Verifique y guarde.");
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
      const res = await fetch("/api/admin/activos-config/tipos-modelos-atributos/configuracion", {
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Toast informativo */}
      {toastMensaje && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium border border-slate-700 animate-in fade-in duration-200">
          {toastMensaje}
        </div>
      )}

      {/* 1. Breadcrumb de navegación */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <Link href="/admin" className="hover:text-indigo-600 transition-colors">
            Configuración
          </Link>
          <span>&gt;</span>
          <span className="text-slate-600">Activos y CMDB</span>
          <span>&gt;</span>
          <span className="text-slate-600 font-semibold">1.5.1 Tipos, modelos y atributos</span>
          <span>&gt;</span>
          <span className="text-indigo-600 font-bold">{pestanaInfo.titulo}</span>
        </div>
      </div>

      {/* 2. Encabezado principal e indicador de versión */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {pestanaInfo.titulo}
              </h1>
              {hayBorrador ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  Borrador con cambios sin publicar
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Publicada v{versionPublicada}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-4xl">
              {pestanaInfo.descripcion}
            </p>
            <div className="text-[11px] text-slate-400 mt-1">
              Última modificación por{" "}
              <span className="font-medium text-slate-600">
                {autorPublicada || "Administrador"}
              </span>{" "}
              el{" "}
              <span className="font-mono text-slate-600">
                {fechaPublicada ? new Date(fechaPublicada).toLocaleString() : "Versión de fábrica"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de bloqueo concurrente si aplica */}
      {bloqueadoPorOtro && (
        <div className="bg-amber-500 text-white px-6 py-2.5 text-xs font-medium flex items-center justify-between shadow-sm">
          <div>
            Esta pestaña se encuentra en edición exclusiva por <span className="font-bold underline">{bloqueadoPorOtro}</span>. 
            El modo de solo lectura está activo.
          </div>
          <button
            onClick={handleSolicitarControl}
            className="px-3 py-1 bg-white text-amber-800 font-bold rounded shadow-sm hover:bg-amber-50 transition-colors"
          >
            Solicitar control
          </button>
        </div>
      )}

      {/* 3. Barra de pestañas horizontales (9 pestañas) - Solo visible si no es una vista profunda exclusiva del Gestor de Activos */}
      {!vistaExclusiva && (
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Pestañas de configuración">
              {PESTANAS.map((tab) => {
                const activa = tabActiva === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => cambiarTab(tab.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                      activa
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {tab.titulo}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* 4. Cuerpo de la pantalla con el componente activo */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
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
              className="px-4 py-2 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div>
            {tabActiva === "clases_tipos" && (
              <PestanaClasesTipos
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "fabricantes_modelos" && (
              <PestanaFabricantesModelos
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "atributos" && (
              <PestanaAtributosTipo
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "formulario_activo" && (
              <PestanaFormularioActivo
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "codigo_etiquetas" && (
              <PestanaCodigoEtiquetas
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "ubicaciones" && (
              <PestanaUbicaciones
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "catalogos_auxiliares" && (
              <PestanaCatalogosAuxiliares
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "ficha_listado" && (
              <PestanaFichaListado
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "importacion_inventario" && (
              <PestanaImportacionInventario
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
          </div>
        )}
      </main>
      </div>

      {/* 5. Barra de acciones fija al pie (Patrón 3.1) */}
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
        onAbrirPublicar={handleAbrirPublicar}
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
        tituloModulo="Activos y CMDB (HAM/SAM)"
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
