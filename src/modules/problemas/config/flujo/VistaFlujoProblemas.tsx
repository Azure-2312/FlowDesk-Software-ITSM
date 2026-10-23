"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BarraAccionesComun } from "@/shared/components/admin/BarraAccionesComun";
import { ModalPublicacion } from "@/shared/components/admin/ModalPublicacion";
import { ModalHistorialVersiones } from "../formulario/components/ModalHistorialVersiones";
import { ModalRestaurarFabrica } from "../formulario/components/ModalRestaurarFabrica";
import { PestanaEstados } from "./components/PestanaEstados";
import { PestanaTransiciones } from "./components/PestanaTransiciones";
import { PestanaAsignacion } from "./components/PestanaAsignacion";
import { PestanaObjetivosTiempo } from "./components/PestanaObjetivosTiempo";
import { PestanaEscalamiento } from "./components/PestanaEscalamiento";
import { PestanaReapertura } from "./components/PestanaReapertura";
import { PestanaTareas } from "./components/PestanaTareas";
import { PestanaMayores } from "./components/PestanaMayores";

type TabId =
  | "estados"
  | "transiciones"
  | "asignacion"
  | "objetivos"
  | "escalamiento"
  | "reapertura"
  | "tareas"
  | "mayores";

export default function FlujoProblemasPage() {
  const [tabActiva, setTabActiva] = useState<TabId>("estados");
  const [cargando, setCargando] = useState(true);
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

  // Datos del flujo
  const [estados, setEstados] = useState<any[]>([]);
  const [transiciones, setTransiciones] = useState<any[]>([]);
  const [reglasAsignacion, setReglasAsignacion] = useState<any[]>([]);
  const [objetivosTiempo, setObjetivosTiempo] = useState<any[]>([]);
  const [reglasEscalamiento, setReglasEscalamiento] = useState<any[]>([]);
  const [configReapertura, setConfigReapertura] = useState<any>({});
  const [tareas, setTareas] = useState<any[]>([]);
  const [paquetesTareas, setPaquetesTareas] = useState<any[]>([]);
  const [criteriosMayor, setCriteriosMayor] = useState<any[]>([]);
  const [configMayor, setConfigMayor] = useState<any>({});
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [perfiles, setPerfiles] = useState<any[]>([]);

  // Modales
  const [modalPublicarAbierto, setModalPublicarAbierto] = useState<boolean>(false);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState<boolean>(false);
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState<boolean>(false);
  const [versionesHistorial, setVersionesHistorial] = useState<any[]>([]);
  const [diffsPublicacion, setDiffsPublicacion] = useState<any[]>([]);
  const [ticketsAbiertosAfectados, setTicketsAbiertosAfectados] = useState<number>(0);

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const res = await fetch(`/api/problemas/configuracion/flujo?pestana=${tabActiva}`);
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al cargar datos del flujo");
      }

      setEstados(data.estados || []);
      setTransiciones(data.transiciones || []);
      setReglasAsignacion(data.reglas_asignacion || []);
      setObjetivosTiempo(data.objetivos_tiempo || []);
      setReglasEscalamiento(data.reglas_escalamiento || []);
      setConfigReapertura(data.config_reapertura || {});
      setTareas(data.tareas || []);
      setPaquetesTareas(data.paquetes_tareas || []);
      setCriteriosMayor(data.criterios_mayor || []);
      setConfigMayor(data.config_mayor || {});
      setDepartamentos(data.departamentos_ti || []);
      setPerfiles(data.perfiles || []);

      setVersionPublicada(data.version_publicada?.numero_version || 1);
      setFechaPublicada(data.version_publicada?.fecha_creacion || "");
      setAutorPublicada(data.version_publicada?.autor_nombre || "");
      setHayBorrador(data.hay_borrador);
      setPuedePublicar(data.permisos?.publicar ?? true);
      setPuedeEditar(data.permisos?.editar ?? true);
    } catch (err: any) {
      console.error("Error al cargar pantalla de flujo:", err);
      setErrorCarga(err.message || "Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, [tabActiva]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Guardar Borrador
  const handleGuardarBorrador = async () => {
    try {
      setGuardando(true);
      const res = await fetch("/api/problemas/configuracion/flujo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "guardar_borrador",
          pestana: tabActiva,
          datos: {
            estados,
            transiciones,
            reglasAsignacion,
            objetivosTiempo,
            configReapertura,
            configMayor,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Error al guardar borrador");
      setHayBorrador(true);
      alert("Borrador del flujo guardado exitosamente.");
    } catch (err: any) {
      alert(err.message || "Error al guardar borrador");
    } finally {
      setGuardando(false);
    }
  };

  // Abrir Publicación
  const handleAbrirPublicar = () => {
    setDiffsPublicacion([
      {
        tipo: "modificado",
        campo: "Reglas del Flujo ITIL",
        anterior: `v${versionPublicada}`,
        nuevo: `v${versionPublicada + 1} (${estados.length} estados, ${transiciones.length} transiciones)`,
      },
    ]);
    setTicketsAbiertosAfectados(14);
    setModalPublicarAbierto(true);
  };

  // Confirmar Publicación Oficial
  const handleConfirmarPublicacion = async (motivo: string) => {
    try {
      setPublicando(true);
      const res = await fetch("/api/problemas/configuracion/flujo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "publicar",
          pestana: tabActiva,
          motivo,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Error al publicar");

      setVersionPublicada(data.version?.numero_version || versionPublicada + 1);
      setFechaPublicada(new Date().toISOString());
      setHayBorrador(false);
      alert(`Versión v${data.version?.numero_version || versionPublicada + 1} del flujo publicada.`);
    } finally {
      setPublicando(false);
    }
  };

  // Descartar Borrador
  const handleDescartarBorrador = async () => {
    if (!confirm("¿Desea descartar el borrador sin publicar?")) return;
    try {
      const res = await fetch("/api/problemas/configuracion/flujo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "descartar",
          pestana: tabActiva,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setHayBorrador(false);
        cargarDatos();
      }
    } catch (err) {
      alert("Error al descartar");
    }
  };

  // Restaurar de Fábrica
  const handleRestaurarFabrica = async () => {
    const res = await fetch("/api/problemas/configuracion/flujo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion: "restaurar_fabrica",
        pestana: tabActiva,
      }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Error al restaurar");
    alert("Valores de fábrica restaurados.");
    cargarDatos();
  };

  return (
    <div style={{ minWidth: 1280, backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
      <div style={{ padding: "20px 28px 32px 28px", flex: 1 }}>
        {/* Breadcrumb reglamentario */}
      <nav style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
        <Link href="/plataforma/problemas" style={{ color: "#2563eb", textDecoration: "none" }}>
          Problemas
        </Link>
        {" / "}
        <Link href="/plataforma/admin/procesos/problemas" style={{ color: "#2563eb", textDecoration: "none" }}>
          Configuración
        </Link>
        {" / "}
        <span style={{ color: "#0f172a", fontWeight: 600 }}>Flujo de investigación y seguimiento</span>
      </nav>

      {/* Encabezado Principal 1.3.4.2 */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
        backgroundColor: "#ffffff",
        padding: "18px 24px",
        borderRadius: 8,
        border: "1px solid #e2e8f0"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>Flujo</span>
            <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, color: "#0f172a" }}>
              Flujo de Investigación y Seguimiento de Problemas
            </h1>
          </div>
          <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: 13 }}>
            Ciclo de vida ITIL 4: estados, transiciones, asignación automática, metas OLA, escalamientos, reaperturas y problemas mayores.
          </p>
          <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
            Última modificación por <strong style={{ color: "#475569" }}>{autorPublicada || "Administrador"}</strong>
            {fechaPublicada && ` el ${new Date(fechaPublicada).toLocaleString()}`}
          </div>
        </div>

        {/* Indicador de estado */}
        <div>
          {hayBorrador ? (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fde68a"
            }}>
              ● Borrador con cambios sin publicar
            </span>
          ) : (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: "#ecfdf5",
              color: "#065f46",
              border: "1px solid #a7f3d0"
            }}>
              ● Publicada v{versionPublicada}
            </span>
          )}
        </div>
      </div>

      {/* Selector de las 8 Pestañas Reglamentarias */}
      <div style={{
        display: "flex",
        borderBottom: "2px solid #e2e8f0",
        marginBottom: 20,
        backgroundColor: "#ffffff",
        borderRadius: "8px 8px 0 0",
        padding: "0 12px",
        overflowX: "auto"
      }}>
        {[
          { id: "estados", label: "Estados" },
          { id: "transiciones", label: "Transiciones y acciones" },
          { id: "asignacion", label: "Asignación automática" },
          { id: "objetivos", label: "Objetivos de tiempo" },
          { id: "escalamiento", label: "Escalamiento" },
          { id: "reapertura", label: "Reapertura" },
          { id: "tareas", label: "Tareas predefinidas" },
          { id: "mayores", label: "Problemas mayores" },
        ].map((tab) => {
          const activa = tabActiva === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabActiva(tab.id as TabId)}
              style={{
                padding: "12px 18px",
                fontSize: 13,
                fontWeight: activa ? 700 : 500,
                color: activa ? "#2563eb" : "#64748b",
                borderBottom: activa ? "2px solid #2563eb" : "2px solid transparent",
                marginBottom: -2,
                background: activa ? "#eff6ff" : "none",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Estados de Pantalla */}
      {cargando ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 48, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#64748b" }}>Cargando ciclo de vida institucional...</p>
        </div>
      ) : errorCarga ? (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #fecdd3", padding: 32, textAlign: "center" }}>
          <div style={{ color: "#e11d48", fontWeight: 700, fontSize: 16 }}>Error al cargar la pantalla</div>
          <p style={{ fontSize: 13, color: "#475569", margin: "8px 0 16px 0" }}>{errorCarga}</p>
          <button
            type="button"
            onClick={cargarDatos}
            style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, color: "#ffffff", backgroundColor: "#2563eb", borderRadius: 6, border: "none", cursor: "pointer" }}
          >
            Reintentar
          </button>
        </div>
      ) : (
          <div>
            {tabActiva === "estados" && (
              <PestanaEstados
                estados={estados}
                puedeEditar={puedeEditar}
                onCrearEstado={async (datos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/estados", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
                onActualizarEstado={async (id, datos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/estados", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_estado: id, ...datos }),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
                onEliminarEstado={async (id) => {
                  const res = await fetch(`/api/problemas/configuracion/flujo/estados?id=${id}`, {
                    method: "DELETE",
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
              />
            )}

            {tabActiva === "transiciones" && (
              <PestanaTransiciones
                estados={estados}
                transiciones={transiciones}
                perfiles={perfiles}
                puedeEditar={puedeEditar}
                onCrearTransicion={async (datos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/transiciones", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
                onActualizarTransicion={async (id, datos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/transiciones", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_transicion: id, ...datos }),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
                onEliminarTransicion={async (id) => {
                  const res = await fetch(`/api/problemas/configuracion/flujo/transiciones?id=${id}`, {
                    method: "DELETE",
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
              />
            )}

            {tabActiva === "asignacion" && (
              <PestanaAsignacion
                reglas={reglasAsignacion}
                departamentos={departamentos}
                puedeEditar={puedeEditar}
                onCrearRegla={async (datos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/asignacion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
                onActualizarRegla={async (id, datos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/asignacion", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_regla: id, ...datos }),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
                onEliminarRegla={async (id) => {
                  const res = await fetch(`/api/problemas/configuracion/flujo/asignacion?id=${id}`, {
                    method: "DELETE",
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
              />
            )}

            {tabActiva === "objetivos" && (
              <PestanaObjetivosTiempo
                objetivos={objetivosTiempo}
                puedeEditar={puedeEditar}
                onActualizarObjetivos={async (nuevos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/objetivos", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ objetivos: nuevos }),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
              />
            )}

            {tabActiva === "escalamiento" && (
              <PestanaEscalamiento
                reglas={reglasEscalamiento}
                puedeEditar={puedeEditar}
                onCrearRegla={async (datos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/escalamiento", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
                onActualizarRegla={async (id, datos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/escalamiento", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_escalamiento: id, ...datos }),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
                onEliminarRegla={async (id) => {
                  const res = await fetch(`/api/problemas/configuracion/flujo/escalamiento?id=${id}`, {
                    method: "DELETE",
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
              />
            )}

            {tabActiva === "reapertura" && (
              <PestanaReapertura
                config={configReapertura}
                estados={estados}
                perfiles={perfiles}
                puedeEditar={puedeEditar}
                onActualizarConfig={async (nuevos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/reapertura", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nuevos),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
              />
            )}

            {tabActiva === "tareas" && (
              <PestanaTareas
                tareas={tareas}
                paquetes={paquetesTareas}
                departamentos={departamentos}
                puedeEditar={puedeEditar}
                onCrearTarea={async (datos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/tareas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datos),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
                onEliminarTarea={async (id, tipo) => {
                  const res = await fetch(`/api/problemas/configuracion/flujo/tareas?id=${id}&tipo=${tipo}`, {
                    method: "DELETE",
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
              />
            )}

            {tabActiva === "mayores" && (
              <PestanaMayores
                criterios={criteriosMayor}
                config={configMayor}
                perfiles={perfiles}
                puedeEditar={puedeEditar}
                onActualizarConfig={async (nuevos) => {
                  const res = await fetch("/api/problemas/configuracion/flujo/mayores", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(nuevos),
                  });
                  const r = await res.json();
                  if (!r.ok) throw new Error(r.error);
                  cargarDatos();
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Barra de Acciones Común Fija al Pie (Sección 3.1) */}
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
        onVistaPrevia={() => alert("Vista previa interactiva del flujo en ejecución.")}
        onAbrirPublicar={handleAbrirPublicar}
        onDescartar={handleDescartarBorrador}
        onRestaurarFabrica={() => setModalRestaurarAbierto(true)}
        onVerHistorial={() => setModalHistorialAbierto(true)}
        onExportar={() => alert("Exportar configuración JSON")}
        onImportar={() => alert("Importar configuración JSON")}
      />

      {/* Modales del Patrón Común */}
      <ModalPublicacion
        abierto={modalPublicarAbierto}
        versionActual={versionPublicada}
        diffs={diffsPublicacion}
        ticketsAbiertosAfectados={ticketsAbiertosAfectados}
        onConfirmar={handleConfirmarPublicacion}
        onCerrar={() => setModalPublicarAbierto(false)}
      />

      <ModalHistorialVersiones
        abierto={modalHistorialAbierto}
        versiones={versionesHistorial}
        versionActual={versionPublicada}
        onRestaurarComoBorrador={() => {}}
        onCerrar={() => setModalHistorialAbierto(false)}
      />

      <ModalRestaurarFabrica
        abierto={modalRestaurarAbierto}
        onConfirmar={handleRestaurarFabrica}
        onCerrar={() => setModalRestaurarAbierto(false)}
      />
    </div>
  );
}
