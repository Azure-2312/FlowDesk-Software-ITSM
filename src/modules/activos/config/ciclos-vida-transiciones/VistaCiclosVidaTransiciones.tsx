"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import { BarraAccionesComun } from "@/shared/components/admin/BarraAccionesComun";
import { ModalPublicacion } from "@/shared/components/admin/ModalPublicacion";
import { ModalHistorialVersiones } from "@/shared/components/admin/ModalHistorialVersiones";
import { ModalRestaurarFabrica } from "@/shared/components/admin/ModalRestaurarFabrica";

import { PestanaCiclosEstados } from "./components/PestanaCiclosEstados";
import { PestanaTransicionesReglas } from "./components/PestanaTransicionesReglas";
import { PestanaAsignacionCustodia } from "./components/PestanaAsignacionCustodia";
import { PestanaAdquisicionRecepcion } from "./components/PestanaAdquisicionRecepcion";
import { PestanaMantenimientoFinVida } from "./components/PestanaMantenimientoFinVida";
import { PestanaBajaDisposicion } from "./components/PestanaBajaDisposicion";

type TabId =
  | "ciclos_estados"
  | "transiciones_reglas"
  | "asignacion_custodia"
  | "adquisicion_recepcion"
  | "mantenimiento_fin_vida"
  | "baja_disposicion";

interface PestanaMetadata {
  id: TabId;
  numero: string;
  titulo: string;
  descripcion: string;
}

const PESTANAS: PestanaMetadata[] = [
  {
    id: "ciclos_estados",
    numero: "1.5.2.1",
    titulo: "1.5.2.1 Ciclos de vida y estados",
    descripcion: "Ciclos autorizados, tipos de estado ITIL, flags de inventario físico, disponibilidad CMDB y soporte en incidentes."
  },
  {
    id: "transiciones_reglas",
    numero: "1.5.2.2",
    titulo: "1.5.2.2 Transiciones y reglas",
    descripcion: "Matriz de transiciones, grafo SVG interactivo, condiciones previas, aprobaciones y automatizaciones de estado."
  },
  {
    id: "asignacion_custodia",
    numero: "1.5.2.3",
    titulo: "1.5.2.3 Asignación, custodia y devolución",
    descripcion: "Custodio único inmutable, límites por colaborador, aceptación digital, actas y checklist de devolución."
  },
  {
    id: "adquisicion_recepcion",
    numero: "1.5.2.4",
    titulo: "1.5.2.4 Adquisición y recepción",
    descripcion: "Vínculo con solicitudes de servicio (1.2.2), datos de compra y formulario de recepción física por escaneo."
  },
  {
    id: "mantenimiento_fin_vida",
    numero: "1.5.2.5",
    titulo: "1.5.2.5 Mantenimiento y fin de vida",
    descripcion: "Planes preventivos con emisión de RFCs estándar, cálculo de garantías y anticipación de obsolescencia (EOL/EOS)."
  },
  {
    id: "baja_disposicion",
    numero: "1.5.2.6",
    titulo: "1.5.2.6 Baja y disposición",
    descripcion: "Motivos autorizados, borrado seguro obligatorio (ISO 27001), bloqueos de integridad y actas patrimoniales."
  }
];

export default function CiclosVidaTransicionesPage() {
  const [tabActiva, setTabActiva] = useState<TabId>("ciclos_estados");
  const [cargando, setCargando] = useState<boolean>(true);
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

  // Snapshot de datos de la pestaña actual
  const [configSnapshot, setConfigSnapshot] = useState<any>({});
  const [historialVersiones, setHistorialVersiones] = useState<any[]>([]);
  const [totalActivosAfectados, setTotalActivosAfectados] = useState<number>(0);
  const [diffsCalculados, setDiffsCalculados] = useState<any[]>([]);

  // Modales
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
        `/api/admin/activos-config/ciclos-vida-transiciones/configuracion?pestana=${tabActiva}`
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
        setErrorCarga(data.error || "Error al cargar la configuración de ciclos de vida.");
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
      const res = await fetch("/api/admin/activos-config/ciclos-vida-transiciones/configuracion", {
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
      const res = await fetch("/api/admin/activos-config/ciclos-vida-transiciones/configuracion", {
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
        `/api/admin/activos-config/ciclos-vida-transiciones/configuracion?pestana=${tabActiva}`,
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
      const res = await fetch("/api/admin/activos-config/ciclos-vida-transiciones/configuracion", {
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
      const res = await fetch("/api/admin/activos-config/ciclos-vida-transiciones/configuracion", {
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
        pantalla: "1.5.2",
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
    a.download = `config_ciclos_152_${tabActiva}_v${versionPublicada}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarToast("Configuración exportada en formato JSON firmado.");
  };

  // Importar configuración JSON
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
        if (json.modulo !== "activos_y_cmdb" || json.pantalla !== "1.5.2") {
          alert("El archivo JSON no corresponde a la configuración de Ciclos y Transiciones (Pantalla 1.5.2).");
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
      const res = await fetch("/api/admin/activos-config/ciclos-vida-transiciones/configuracion", {
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
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24">
      {/* Toast informativo */}
      {toastMensaje && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium border border-slate-700 animate-in fade-in duration-200">
          {toastMensaje}
        </div>
      )}

      {/* 1. Breadcrumb */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <Link href="/admin" className="hover:text-indigo-600 transition-colors">
            Configuración
          </Link>
          <span>&gt;</span>
          <span className="text-slate-600">Activos y CMDB</span>
          <span>&gt;</span>
          <span className="text-slate-600 font-semibold">1.5.2 Ciclos de vida y transiciones</span>
          <span>&gt;</span>
          <span className="text-indigo-600 font-bold">{pestanaInfo.titulo}</span>
        </div>
      </div>

      {/* 2. Encabezado principal */}
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

      {/* 3. Barra de pestañas horizontales (6 pestañas) */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Pestañas de ciclos de vida">
            {PESTANAS.map((tab) => {
              const activa = tabActiva === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
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

      {/* 4. Cuerpo de la pantalla */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
        {cargando ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-slate-700">Cargando ciclo de vida y reglas...</p>
            <p className="text-xs text-slate-400 mt-1">Sincronizando estados y matriz de transiciones</p>
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
            {tabActiva === "ciclos_estados" && (
              <PestanaCiclosEstados
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "transiciones_reglas" && (
              <PestanaTransicionesReglas
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "asignacion_custodia" && (
              <PestanaAsignacionCustodia
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "adquisicion_recepcion" && (
              <PestanaAdquisicionRecepcion
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "mantenimiento_fin_vida" && (
              <PestanaMantenimientoFinVida
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
            {tabActiva === "baja_disposicion" && (
              <PestanaBajaDisposicion
                datos={configSnapshot}
                onChange={handleSnapshotChange}
                bloqueado={estaBloqueado}
              />
            )}
          </div>
        )}
      </main>

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
        onVistaPrevia={() => mostrarToast("Vista previa activa en el lienzo actual.")}
        onAbrirPublicar={() => setModalPublicarAbierto(true)}
        onDescartar={handleDescartarBorrador}
        onRestaurarFabrica={() => setModalRestaurarAbierto(true)}
        onVerHistorial={() => setModalHistorialAbierto(true)}
        onExportar={handleExportar}
        onImportar={handleImportar}
      />

      {/* Modales del Patrón 3.1 */}
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
