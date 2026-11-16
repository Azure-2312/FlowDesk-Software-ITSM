"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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
    titulo: "Ciclos de vida y estados",
    descripcion: "Ciclos autorizados, tipos de estado ITIL, flags de inventario físico, disponibilidad CMDB y soporte en incidentes."
  },
  {
    id: "transiciones_reglas",
    numero: "1.5.2.2",
    titulo: "Transiciones y reglas",
    descripcion: "Matriz de transiciones, grafo SVG interactivo, condiciones previas, aprobaciones y automatizaciones de estado."
  },
  {
    id: "asignacion_custodia",
    numero: "1.5.2.3",
    titulo: "Asignación, custodia y devolución",
    descripcion: "Custodio único inmutable, límites por colaborador, aceptación digital, actas y checklist de devolución."
  },
  {
    id: "adquisicion_recepcion",
    numero: "1.5.2.4",
    titulo: "Adquisición y recepción",
    descripcion: "Vínculo con solicitudes de servicio, datos de compra y formulario de recepción física por escaneo."
  },
  {
    id: "mantenimiento_fin_vida",
    numero: "1.5.2.5",
    titulo: "Mantenimiento y fin de vida",
    descripcion: "Planes preventivos con emisión de RFCs estándar, cálculo de garantías y anticipación de obsolescencia (EOL/EOS)."
  },
  {
    id: "baja_disposicion",
    numero: "1.5.2.6",
    titulo: "Baja y disposición",
    descripcion: "Motivos autorizados, borrado seguro obligatorio (ISO 27001), bloqueos de integridad y actas patrimoniales."
  }
];

const TAB_POR_SLUG: Record<string, TabId> = {
  "ciclos-estados": "ciclos_estados",
  "transiciones": "transiciones_reglas",
  "custodia": "asignacion_custodia",
  "recepcion": "adquisicion_recepcion",
  "mantenimiento": "mantenimiento_fin_vida",
  "baja": "baja_disposicion",
};

const SLUG_POR_TAB: Record<TabId, string> = {
  ciclos_estados: "ciclos-estados",
  transiciones_reglas: "transiciones",
  asignacion_custodia: "custodia",
  adquisicion_recepcion: "recepcion",
  mantenimiento_fin_vida: "mantenimiento",
  baja_disposicion: "baja",
};

export default function CiclosVidaTransicionesPage() {
  const [tabActiva, setTabActiva] = useState<TabId>("ciclos_estados");
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
        `/api/activos/configuracion/ciclos-vida-transiciones/configuracion?pestana=${tabActiva}`
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
  const handleSnapshotChange = (nuevosDatos: any, pestanaId: string = tabActiva) => {
    setConfigSnapshot(nuevosDatos);
    setSnapshotsPorTab((prev) => ({ ...prev, [pestanaId]: nuevosDatos }));
    setTabsModificadas((prev) => new Set(prev).add(pestanaId));
  };

  // Guardar y Aplicar Ciclos de Vida Directamente
  const handleGuardarCiclosVida = async () => {
    try {
      setGuardando(true);
      const tabsAGuardar = tabsModificadas.size > 0 ? Array.from(tabsModificadas) : [tabActiva];

      for (const tId of tabsAGuardar) {
        const snap = snapshotsPorTab[tId] || (tId === tabActiva ? configSnapshot : null);
        if (!snap) continue;
        const res = await fetch("/api/activos/configuracion/ciclos-vida-transiciones/configuracion", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pestana: tId,
            snapshot: snap,
            motivo: `Guardado y aplicación de ciclos de vida en pestaña ${tId}`,
            diff: { tipo: "modificacion_general", pestana: tId }
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Error al guardar configuración en pestaña ${tId}`);
        }
      }

      setTabsModificadas(new Set());
      mostrarToast("Ciclos de vida y transiciones guardados exitosamente.");
      cargarDatos();
    } catch (err: any) {
      mostrarToast(err.message || "Error al guardar la configuración.");
    } finally {
      setGuardando(false);
    }
  };

  // Solicitar control concurrente
  const handleSolicitarControl = async () => {
    try {
      const res = await fetch("/api/activos/configuracion/ciclos-vida-transiciones/configuracion", {
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", width: "100%", boxSizing: "border-box", padding: "32px 48px 48px 48px" }}>
      <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto 0 0" }}>
        {/* Toast informativo */}
        {toastMensaje && (
          <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium border border-slate-700 animate-in fade-in duration-200">
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
              Ciclos de Vida y Reglas de Transición
            </h1>
            <p style={{ margin: "8px 0 0 0", color: "#64748b", fontSize: 13.5, lineHeight: 1.5 }}>
              {pestanaInfo.descripcion}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, paddingTop: 4 }}>
            <button
              type="button"
              onClick={handleGuardarCiclosVida}
              disabled={guardando || estaBloqueado || !puedeEditar}
              className="boton-primario"
              style={{ padding: "9px 22px", fontSize: 13, width: "auto", fontWeight: 700 }}
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
              className="px-3 py-1 bg-white text-amber-800 font-bold rounded shadow-sm hover:bg-amber-50 transition-colors"
            >
              Solicitar control
            </button>
          </div>
        )}

        {/* Barra de pestañas horizontales corporativa */}
        <div style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #e2e8f0",
          marginBottom: 28,
          justifyContent: "flex-start",
          overflowX: "auto"
        }}>
          {PESTANAS.map((tab) => {
            const activa = tabActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => cambiarTab(tab.id)}
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
                {tab.titulo}
              </button>
            );
          })}
        </div>

        {/* Cuerpo de la pantalla con las tarjetas */}
        <div style={{ width: "100%" }}>
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
            <div style={{ display: tabActiva === "ciclos_estados" ? "block" : "none" }}>
              <PestanaCiclosEstados
                datos={snapshotsPorTab["ciclos_estados"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "ciclos_estados")}
                bloqueado={estaBloqueado}
              />
            </div>
            <div style={{ display: tabActiva === "transiciones_reglas" ? "block" : "none" }}>
              <PestanaTransicionesReglas
                datos={snapshotsPorTab["transiciones_reglas"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "transiciones_reglas")}
                bloqueado={estaBloqueado}
              />
            </div>
            <div style={{ display: tabActiva === "asignacion_custodia" ? "block" : "none" }}>
              <PestanaAsignacionCustodia
                datos={snapshotsPorTab["asignacion_custodia"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "asignacion_custodia")}
                bloqueado={estaBloqueado}
              />
            </div>
            <div style={{ display: tabActiva === "adquisicion_recepcion" ? "block" : "none" }}>
              <PestanaAdquisicionRecepcion
                datos={snapshotsPorTab["adquisicion_recepcion"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "adquisicion_recepcion")}
                bloqueado={estaBloqueado}
              />
            </div>
            <div style={{ display: tabActiva === "mantenimiento_fin_vida" ? "block" : "none" }}>
              <PestanaMantenimientoFinVida
                datos={snapshotsPorTab["mantenimiento_fin_vida"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "mantenimiento_fin_vida")}
                bloqueado={estaBloqueado}
              />
            </div>
            <div style={{ display: tabActiva === "baja_disposicion" ? "block" : "none" }}>
              <PestanaBajaDisposicion
                datos={snapshotsPorTab["baja_disposicion"] || configSnapshot}
                onChange={(d) => handleSnapshotChange(d, "baja_disposicion")}
                bloqueado={estaBloqueado}
              />
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
