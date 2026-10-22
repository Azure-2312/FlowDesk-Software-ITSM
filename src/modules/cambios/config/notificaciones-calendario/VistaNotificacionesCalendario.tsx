"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BarraAccionesComun } from "@/shared/components/admin/BarraAccionesComun";
import { ModalPublicacion } from "@/shared/components/admin/ModalPublicacion";
import { ModalHistorialVersiones } from "../formulario/components/ModalHistorialVersiones";
import { ModalRestaurarFabrica } from "../formulario/components/ModalRestaurarFabrica";

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

export default function NotificacionesCalendarioPage() {
  const searchParams = useSearchParams();
  const [tabActiva, setTabActiva] = useState<TabId>(() => {
    const vistaParam = searchParams.get("vista");
    if (vistaParam === "feriados") return "feriados";
    if (vistaParam === "congelamiento") return "periodos_congelamiento";
    if (vistaParam === "ventanas") return "ventanas_mantenimiento";
    if (vistaParam === "notificaciones") return "notificaciones";
    if (vistaParam === "conflictos") return "conflictos_capacidad";
    if (vistaParam === "presentacion") return "presentacion_calendario";
    return "notificaciones";
  });

  useEffect(() => {
    const vistaParam = searchParams.get("vista");
    if (vistaParam === "feriados") setTabActiva("feriados");
    else if (vistaParam === "congelamiento") setTabActiva("periodos_congelamiento");
    else if (vistaParam === "ventanas") setTabActiva("ventanas_mantenimiento");
    else if (vistaParam === "notificaciones") setTabActiva("notificaciones");
    else if (vistaParam === "conflictos") setTabActiva("conflictos_capacidad");
    else if (vistaParam === "presentacion") setTabActiva("presentacion_calendario");
  }, [searchParams]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estados de control de versiones y autoría (Pattern 3.1)
  const [versionPublicada, setVersionPublicada] = useState<number>(1);
  const [fechaPublicada, setFechaPublicada] = useState<string>("");
  const [autorPublicada, setAutorPublicada] = useState<string>("");
  const [hayBorrador, setHayBorrador] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [publicando, setPublicando] = useState<boolean>(false);
  const [bloqueadoPorOtro, setBloqueadoPorOtro] = useState<string | undefined>(undefined);
  const [puedePublicar, setPuedePublicar] = useState<boolean>(true);
  const [puedeEditar, setPuedeEditar] = useState<boolean>(true);

  // Snapshot activo de la pestaña
  const [configSnapshot, setConfigSnapshot] = useState<any>({});
  const [diffPreview, setDiffPreview] = useState<any>(null);

  // Catálogos auxiliares (usuarios, departamentos, servicios, CI)
  const [catalogoUsuarios, setCatalogoUsuarios] = useState<any[]>([]);
  const [catalogoDepartamentos, setCatalogoDepartamentos] = useState<any[]>([]);
  const [catalogoServicios, setCatalogoServicios] = useState<any[]>([]);
  const [catalogoCI, setCatalogoCI] = useState<any[]>([]);

  // Modales Pattern 3.1
  const [modalPublicarAbierto, setModalPublicarAbierto] = useState<boolean>(false);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState<boolean>(false);
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState<boolean>(false);
  const [versionesHistorial, setVersionesHistorial] = useState<any[]>([]);
  const [rfcsAbiertasAfectadas, setRfcsAbiertasAfectadas] = useState<number>(0);

  // Cargar configuración de la pestaña seleccionada
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const res = await fetch(`/api/admin/cambios/notificaciones-calendario/configuracion?pestana=${tabActiva}`);
      if (!res.ok) throw new Error("Error al obtener la configuración del servidor");
      const data = await res.json();

      setVersionPublicada(data.version_publicada?.numero_version || 1);
      setFechaPublicada(data.version_publicada?.fecha_creacion || "");
      setAutorPublicada(data.version_publicada?.autor_nombre || "Sistema");
      setHayBorrador(!!data.borrador);
      setBloqueadoPorOtro(
        data.bloqueo && !data.bloqueo.bloqueado_por_mi ? data.bloqueo.usuario_nombre : undefined
      );
      setRfcsAbiertasAfectadas(data.rfcs_abiertas_impactadas || 0);
      setVersionesHistorial(data.historial_versiones || []);
      setDiffPreview(data.diff_preview || null);

      if (data.catalogo_usuarios) setCatalogoUsuarios(data.catalogo_usuarios);
      if (data.catalogo_departamentos) setCatalogoDepartamentos(data.catalogo_departamentos);
      if (data.catalogo_servicios) setCatalogoServicios(data.catalogo_servicios);
      if (data.catalogo_ci) setCatalogoCI(data.catalogo_ci);

      // Cargar snapshot activo (borrador o versión publicada)
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

  // Guardar Borrador (Pattern 3.1)
  const handleGuardarBorrador = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/admin/cambios/notificaciones-calendario/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "guardar_borrador",
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo: "Guardado manual de borrador de trabajo"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar borrador");

      setHayBorrador(true);
      setDiffPreview(data.borrador?.diff || null);
      alert("Borrador guardado exitosamente.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar Publicación (Pattern 3.1)
  const handleConfirmarPublicacion = async (motivo: string) => {
    try {
      setPublicando(true);
      const res = await fetch("/api/admin/cambios/notificaciones-calendario/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: tabActiva,
          snapshot: configSnapshot,
          motivo,
          impacto_resumen: `Publicación de pestaña ${PESTANAS_INFO[tabActiva].titulo}`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al publicar versión");

      setModalPublicarAbierto(false);
      await cargarDatos();
      alert(`Versión publicada exitosamente (v${data.version?.numero_version || versionPublicada + 1}).`);
    } catch (err: any) {
      alert("Error al publicar: " + err.message);
      throw err;
    } finally {
      setPublicando(false);
    }
  };

  // Descartar Borrador
  const handleDescartarBorrador = async () => {
    if (!confirm("Se perderán todos los cambios no publicados de esta pestaña. ¿Desea continuar?")) {
      return;
    }
    try {
      setCargando(true);
      const res = await fetch(`/api/admin/cambios/notificaciones-calendario/configuracion?pestana=${tabActiva}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Error al descartar borrador");
      await cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  // Restaurar de fábrica
  const handleRestaurarFabrica = async () => {
    try {
      setCargando(true);
      const res = await fetch("/api/admin/cambios/notificaciones-calendario/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "restaurar_fabrica",
          pestana: tabActiva
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al restaurar valores de fábrica");
      setModalRestaurarAbierto(false);
      await cargarDatos();
      alert("Se han cargado los valores de fábrica en su borrador de trabajo.");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  // Restaurar versión del historial como borrador
  const handleRestaurarVersion = async (versionId: number) => {
    try {
      setCargando(true);
      const res = await fetch("/api/admin/cambios/notificaciones-calendario/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "restaurar_version",
          pestana: tabActiva,
          version_id_origen: versionId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al restaurar versión histórica");
      setModalHistorialAbierto(false);
      await cargarDatos();
      alert(`Se ha restaurado la versión en su borrador de trabajo.`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setCargando(false);
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
          alert("Configuración cargada en borrador. Guarde o publique para aplicar.");
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

  // Diffs para el modal de publicación
  const diffItems = [
    ...(diffPreview?.agregados || []).map((desc: string) => ({ tipo: "agregado" as const, campo: desc })),
    ...(diffPreview?.modificados || []).map((desc: string) => ({ tipo: "modificado" as const, campo: desc })),
    ...(diffPreview?.eliminados || []).map((desc: string) => ({ tipo: "eliminado" as const, campo: desc }))
  ];

  return (
    <div style={{ paddingBottom: 24, minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* 3.1.1 Breadcrumb */}
      <nav style={{ padding: "12px 24px", fontSize: 13, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#ffffff" }}>
        <Link href="/plataforma/cambios" style={{ color: "#2563eb", textDecoration: "none" }}>Cambios</Link>
        {" > "}
        <Link href="/plataforma/admin/procesos/cambios" style={{ color: "#2563eb", textDecoration: "none" }}>Configuración</Link>
        {" > "}
        <span style={{ color: "#1e293b", fontWeight: 600 }}>Notificaciones de cambios</span>
        {" > "}
        <span style={{ color: "#0f172a", fontWeight: 600 }}>{infoPestana.titulo}</span>
      </nav>

      {/* 3.1.2 Encabezado y Estado de la Configuración */}
      <header style={{ padding: "20px 24px", background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: "0 0 6px 0", fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
              {infoPestana.titulo}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
              {infoPestana.descripcion}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            {hayBorrador ? (
              <span style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "4px 10px", borderRadius: 16, fontSize: 12, fontWeight: 600 }}>
                Borrador con cambios sin publicar
              </span>
            ) : (
              <span style={{ display: "inline-block", background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: 16, fontSize: 12, fontWeight: 600 }}>
                Publicada v{versionPublicada}
              </span>
            )}
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
              Última modificación por {autorPublicada} el {fechaPublicada ? new Date(fechaPublicada).toLocaleString() : "Registro de sistema"}
            </div>
          </div>
        </div>

        {/* Banner de bloqueo concurrente si aplica */}
        {bloqueadoPorOtro && (
          <div style={{ marginTop: 14, background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: 6, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

      {/* Navegación horizontal de pestañas (1.3.3.4.1 a 1.3.3.4.6) */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "0 24px", display: "flex", gap: 8, overflowX: "auto" }}>
        {(Object.keys(PESTANAS_INFO) as TabId[]).map((tabKey) => {
          const tab = PESTANAS_INFO[tabKey];
          const activa = tabActiva === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => setTabActiva(tabKey)}
              style={{
                padding: "12px 16px",
                border: "none",
                background: "transparent",
                borderBottom: activa ? "2px solid #2563eb" : "2px solid transparent",
                color: activa ? "#2563eb" : "#64748b",
                fontWeight: activa ? 600 : 500,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease"
              }}
            >
              {tab.numero} {tab.titulo.split(" ")[1]}
            </button>
          );
        })}
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
        <div style={{ padding: "24px 28px" }}>
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

      {/* Barra de Acciones Común Pattern 3.1 */}
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
        onVistaPrevia={() => {
          alert("Vista previa activa: está visualizando la configuración tal como se comportará en ejecución.");
        }}
        onAbrirPublicar={() => setModalPublicarAbierto(true)}
        onDescartar={handleDescartarBorrador}
        onRestaurarFabrica={() => setModalRestaurarAbierto(true)}
        onVerHistorial={() => setModalHistorialAbierto(true)}
        onExportar={handleExportar}
        onImportar={handleImportar}
      />

      {/* Modal de Publicación con Diff Semántico */}
      {modalPublicarAbierto && (
        <ModalPublicacion
          abierto={modalPublicarAbierto}
          versionActual={versionPublicada}
          diffs={diffItems}
          ticketsAbiertosAfectados={rfcsAbiertasAfectadas}
          onConfirmar={handleConfirmarPublicacion}
          onCerrar={() => setModalPublicarAbierto(false)}
        />
      )}

      {/* Modal de Historial de Versiones */}
      {modalHistorialAbierto && (
        <ModalHistorialVersiones
          abierto={modalHistorialAbierto}
          versiones={versionesHistorial}
          versionActual={versionPublicada}
          onRestaurarComoBorrador={(v) => handleRestaurarVersion(v.id_version)}
          onCerrar={() => setModalHistorialAbierto(false)}
        />
      )}

      {/* Modal de Restaurar Valores de Fábrica */}
      {modalRestaurarAbierto && (
        <ModalRestaurarFabrica
          abierto={modalRestaurarAbierto}
          onConfirmar={handleRestaurarFabrica}
          onCerrar={() => setModalRestaurarAbierto(false)}
        />
      )}
    </div>
  );
}
