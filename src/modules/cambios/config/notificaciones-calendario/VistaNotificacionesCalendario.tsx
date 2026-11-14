"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { PestanaNotificaciones } from "./components/PestanaNotificaciones";
import { PestanaVentanasMantenimiento } from "./components/PestanaVentanasMantenimiento";
import { PestanaPeriodosCongelamiento } from "./components/PestanaPeriodosCongelamiento";
import { PestanaFeriados } from "./components/PestanaFeriados";
import { PestanaConflictosCapacidad } from "./components/PestanaConflictosCapacidad";
import { PestanaPresentacionCalendario } from "./components/PestanaPresentacionCalendario";

type TabId = 
  | "notificaciones" 
  | "ventanas_mantenimiento" 
  | "periodos_congelamiento" 
  | "feriados" 
  | "conflictos_capacidad" 
  | "presentacion_calendario";

const PESTANAS_INFO: Record<TabId, { numero: string; titulo: string; descripcion: string }> = {
  notificaciones: {
    numero: "1.3.3.4.1",
    titulo: "Notificaciones",
    descripcion: "32 eventos de dominio ITIL v4, canales, destinatarios, comunicados de interrupción y horas de silencio."
  },
  ventanas_mantenimiento: {
    numero: "1.3.3.4.2",
    titulo: "Ventanas de mantenimiento",
    descripcion: "Horarios autorizados de intervención, recurrencias, capacidades simultáneas y límites acumulados."
  },
  periodos_congelamiento: {
    numero: "1.3.3.4.3",
    titulo: "Períodos de congelamiento",
    descripcion: "Restricción de cambios durante cierres contables y campañas. Bloqueo total, con excepción o advertencia."
  },
  feriados: {
    numero: "1.3.3.4.4",
    titulo: "Feriados y días no laborables",
    descripcion: "Calendario de feriados nacionales e institucionales y políticas de bloqueo por tipo de cambio."
  },
  conflictos_capacidad: {
    numero: "1.3.3.4.5",
    titulo: "Conflictos y capacidad",
    descripcion: "Reglas de solapamiento de CIs, servicios, implementadores, tolerancias y simulador de disponibilidad."
  },
  presentacion_calendario: {
    numero: "1.3.3.4.6",
    titulo: "Presentación del calendario",
    descripcion: "Configuración visual de 5.1.2: criterios cromáticos, vistas, capas, tooltips y suscripción ICS."
  }
};

const MAPA_VISTAS_TABS: Record<string, TabId> = {
  feriados: "feriados",
  congelamiento: "periodos_congelamiento",
  ventanas: "ventanas_mantenimiento",
  notificaciones: "notificaciones",
  conflictos: "conflictos_capacidad",
  presentacion: "presentacion_calendario",
};

function resolverTab(vistaParam: string | null): TabId {
  return (vistaParam && MAPA_VISTAS_TABS[vistaParam]) || "notificaciones";
}

export default function NotificacionesCalendarioPage() {
  const searchParams = useSearchParams();
  const [tabActiva, setTabActiva] = useState<TabId>(() => resolverTab(searchParams.get("vista")));

  useEffect(() => {
    setTabActiva(resolverTab(searchParams.get("vista")));
  }, [searchParams]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estados de autoría y guardado
  const [versionPublicada, setVersionPublicada] = useState<number>(1);
  const [fechaPublicada, setFechaPublicada] = useState<string>("");
  const [autorPublicada, setAutorPublicada] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);
  const [bloqueadoPorOtro, setBloqueadoPorOtro] = useState<string | undefined>(undefined);

  // Snapshot activo de la pestaña
  const [configSnapshot, setConfigSnapshot] = useState<any>({});

  // Catálogos auxiliares (usuarios, departamentos, servicios, CI)
  const [catalogoUsuarios, setCatalogoUsuarios] = useState<any[]>([]);
  const [catalogoDepartamentos, setCatalogoDepartamentos] = useState<any[]>([]);
  const [catalogoServicios, setCatalogoServicios] = useState<any[]>([]);
  const [catalogoCI, setCatalogoCI] = useState<any[]>([]);

  // Cargar configuración de la pestaña seleccionada
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const res = await fetch(`/api/cambios/configuracion/notificaciones-calendario/configuracion?pestana=${tabActiva}`);
      if (!res.ok) throw new Error("Error al obtener la configuración del servidor");
      const data = await res.json();

      setVersionPublicada(data.version_publicada?.numero_version || 1);
      setFechaPublicada(data.version_publicada?.fecha_creacion || "");
      setAutorPublicada(data.version_publicada?.autor_nombre || "Sistema");
      setBloqueadoPorOtro(
        data.bloqueo && !data.bloqueo.bloqueado_por_mi ? data.bloqueo.usuario_nombre : undefined
      );

      if (data.catalogo_usuarios) setCatalogoUsuarios(data.catalogo_usuarios);
      if (data.catalogo_departamentos) setCatalogoDepartamentos(data.catalogo_departamentos);
      if (data.catalogo_servicios) setCatalogoServicios(data.catalogo_servicios);
      if (data.catalogo_ci) setCatalogoCI(data.catalogo_ci);

      // Cargar snapshot activo
      const snapshotCargado = data.borrador?.snapshot || data.version_publicada?.snapshot || {};
      setConfigSnapshot(snapshotCargado);
    } catch (err: any) {
      console.error(err);
      setErrorCarga(err.message || "Error al conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }, [tabActiva]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Guardar configuración directa
  const handleGuardarConfiguracion = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/cambios/configuracion/notificaciones-calendario/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo: `Actualización de calendario en pestaña ${PESTANAS_INFO[tabActiva].titulo}`,
          impacto_resumen: `Guardado directo de pestaña ${PESTANAS_INFO[tabActiva].titulo}`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar la configuración");

      alert("Configuración guardada exitosamente.");
      await cargarDatos();
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Exportar configuración a JSON
  const handleExportar = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configSnapshot, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `config_1.3.3.4_${tabActiva}_v${versionPublicada}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar configuración desde JSON
  const handleImportar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          setConfigSnapshot(parsed);
          alert("Configuración cargada desde JSON. Haga clic en 'Guardar Configuración' para aplicar.");
        } catch {
          alert("El archivo seleccionado no es un JSON válido.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const infoPestana = PESTANAS_INFO[tabActiva];
  const deshabilitadoEdicion = !!bloqueadoPorOtro;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Encabezado Corporativo Formal */}
      <header className="bg-white px-8 pt-7 pb-4 border-b border-slate-100">
        <div style={{ maxWidth: 1400, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
              Notificaciones y Calendario de Cambios
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: 13, lineHeight: 1.45 }}>
              Gobierno de eventos ITIL v4, alertas multicanal, ventanas de mantenimiento autorizadas y períodos de congelamiento de infraestructura.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleGuardarConfiguracion}
              type="button"
              disabled={guardando || deshabilitadoEdicion}
              className="boton-primario"
              style={{ padding: "8px 18px", fontSize: 13, width: "auto", fontWeight: 700 }}
            >
              {guardando ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </div>

        {/* Banner de bloqueo concurrente si aplica */}
        {bloqueadoPorOtro && (
          <div style={{ maxWidth: 1400, marginTop: 14, background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: 6, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Esta pestaña está siendo editada actualmente por <strong>{bloqueadoPorOtro}</strong>. Está en modo de solo lectura.</span>
            <button
              onClick={() => alert("Se ha solicitado el control de la sesión de edición al administrador.")}
              style={{ padding: "4px 10px", background: "#991b1b", color: "#ffffff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12 }}
            >
              Solicitar Control
            </button>
          </div>
        )}
      </header>

      {/* Navegación horizontal de pestañas */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1400, padding: "0 32px", display: "flex", gap: 8, overflowX: "auto" }}>
        {(Object.keys(PESTANAS_INFO) as TabId[]).map((tabKey) => {
          const tab = PESTANAS_INFO[tabKey];
          const activa = tabActiva === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => setTabActiva(tabKey)}
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
                transition: "all 0.15s ease"
              }}
            >
              {tab.titulo}
            </button>
          );
        })}
        </div>
      </div>

      {/* Contenido de la Pestaña Activa */}
      {cargando ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
          Cargando configuración del submódulo...
        </div>
      ) : errorCarga ? (
        <div style={{ padding: 40, textAlign: "center", color: "#b91c1c" }}>
          Error: {errorCarga}
          <div style={{ marginTop: 12 }}>
            <button onClick={cargarDatos} style={{ padding: "6px 14px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Reintentar
            </button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 1400, width: "100%", padding: "28px 32px", margin: "0 auto 0 0" }}>
          {tabActiva === "notificaciones" && (
            <PestanaNotificaciones
              config={configSnapshot}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
              usuarios={catalogoUsuarios}
              departamentos={catalogoDepartamentos}
            />
          )}

          {tabActiva === "ventanas_mantenimiento" && (
            <PestanaVentanasMantenimiento
              config={configSnapshot}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
              servicios={catalogoServicios}
              departamentos={catalogoDepartamentos}
            />
          )}

          {tabActiva === "periodos_congelamiento" && (
            <PestanaPeriodosCongelamiento
              config={configSnapshot}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
              servicios={catalogoServicios}
              ciList={catalogoCI}
              departamentos={catalogoDepartamentos}
            />
          )}

          {tabActiva === "feriados" && (
            <PestanaFeriados
              config={configSnapshot}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
            />
          )}

          {tabActiva === "conflictos_capacidad" && (
            <PestanaConflictosCapacidad
              config={configSnapshot}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
              servicios={catalogoServicios}
              ciList={catalogoCI}
              usuarios={catalogoUsuarios}
            />
          )}

          {tabActiva === "presentacion_calendario" && (
            <PestanaPresentacionCalendario
              config={configSnapshot}
              onChange={(nuevo) => setConfigSnapshot(nuevo)}
            />
          )}
        </div>
      )}
      </div>
    </div>
  );
}
