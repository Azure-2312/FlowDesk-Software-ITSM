"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { BarraAccionesComun } from "@/shared/components/admin/BarraAccionesComun";
import { ModalPublicacion } from "@/shared/components/admin/ModalPublicacion";
import { ModalHistorialVersiones } from "../formulario/components/ModalHistorialVersiones";
import { ModalRestaurarFabrica } from "../formulario/components/ModalRestaurarFabrica";

import { PestanaUmbral } from "./components/PestanaUmbral";
import { PestanaIncidentesVinculados } from "./components/PestanaIncidentesVinculados";
import { PestanaKedb } from "./components/PestanaKedb";
import { PestanaRfc } from "./components/PestanaRfc";
import { PestanaConocimiento } from "./components/PestanaConocimiento";
import { PestanaCmdb } from "./components/PestanaCmdb";

type TabId =
  | "umbral"
  | "incidentes"
  | "kedb"
  | "rfc"
  | "conocimiento"
  | "cmdb";

export default function RelacionesProblemasPage() {
  const [tabActiva, setTabActiva] = useState<TabId>("umbral");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estados de control de versiones y autoría
  const [versionPublicada, setVersionPublicada] = useState<number>(1);
  const [fechaPublicada, setFechaPublicada] = useState<string>("");
  const [autorPublicada, setAutorPublicada] = useState<string>("");
  const [hayBorrador, setHayBorrador] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [publicando, setPublicando] = useState<boolean>(false);
  const [puedePublicar, setPuedePublicar] = useState<boolean>(true);
  const [puedeEditar, setPuedeEditar] = useState<boolean>(true);

  // Datos de las 6 pestañas
  const [reglasUmbral, setReglasUmbral] = useState<any[]>([]);
  const [configIncidentes, setConfigIncidentes] = useState<any>({});
  const [configKedb, setConfigKedb] = useState<any>({});
  const [configRfc, setConfigRfc] = useState<any>({});
  const [configConocimiento, setConfigConocimiento] = useState<any>({});
  const [configCmdb, setConfigCmdb] = useState<any>({});
  const [catalogosAuxiliares, setCatalogosAuxiliares] = useState<any>({
    servicios: [],
    categorias: [],
    clasesCI: []
  });

  // Modales
  const [modalPublicarAbierto, setModalPublicarAbierto] = useState<boolean>(false);
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState<boolean>(false);
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState<boolean>(false);
  const [versionesHistorial, setVersionesHistorial] = useState<any[]>([]);
  const [diffsPublicacion, setDiffsPublicacion] = useState<any[]>([]);

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const res = await fetch("/api/admin/problemas/relaciones");
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al cargar configuración de relaciones");
      }

      const d = data.datos || {};
      setReglasUmbral(d.reglasUmbral || []);
      setConfigIncidentes(d.configIncidentes || {});
      setConfigKedb(d.configKedb || {});
      setConfigRfc(d.configRfc || {});
      setConfigConocimiento(d.configConocimiento || {});
      setConfigCmdb(d.configCmdb || {});
      setVersionesHistorial(d.versiones || []);
      setCatalogosAuxiliares(d.catalogosAuxiliares || { servicios: [], categorias: [], clasesCI: [] });

      if (d.versionPublicada) {
        setVersionPublicada(d.versionPublicada.numero_version || 1);
        setFechaPublicada(d.versionPublicada.fecha_publicacion || new Date().toISOString());
        setAutorPublicada(d.versionPublicada.autor_nombre || "Sistema Base");
      }

      setHayBorrador(false);
    } catch (err: any) {
      console.error(err);
      setErrorCarga(err.message || "Error de conexión");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  function marcarModificado() {
    setHayBorrador(true);
  }

  // Guardar Borrador
  async function handleGuardarBorrador() {
    setGuardando(true);
    try {
      const res = await fetch("/api/admin/problemas/relaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "guardar_borrador",
          datos: {
            configIncidentes,
            configKedb,
            configRfc,
            configConocimiento,
            configCmdb
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar borrador");

      setHayBorrador(false);
      alert("Borrador guardado exitosamente");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setGuardando(false);
    }
  }

  // Abrir Modal de Publicación
  function handleAbrirPublicar() {
    const diffs: any[] = [];
    if (hayBorrador) {
      diffs.push({
        tipo: "modificado",
        campo: "Políticas de Integración",
        antes: "Configuración v" + versionPublicada,
        despues: "Nuevas reglas operativas ajustadas en borrador"
      });
    }

    setDiffsPublicacion(diffs.length > 0 ? diffs : [
      {
        tipo: "modificado",
        campo: "Relaciones e Integraciones",
        antes: `Versión publicada v${versionPublicada}`,
        despues: `Ajustes validados para la versión v${versionPublicada + 1}`
      }
    ]);
    setModalPublicarAbierto(true);
  }

  // Confirmar Publicación
  async function handleConfirmarPublicacion(motivo: string) {
    setPublicando(true);
    try {
      const res = await fetch("/api/admin/problemas/relaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "publicar",
          motivo
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al publicar");

      setModalPublicarAbierto(false);
      setHayBorrador(false);
      alert(`Configuración publicada exitosamente como v${data.version?.numero_version || versionPublicada + 1}`);
      cargarDatos();
    } catch (err: any) {
      alert("Error al publicar: " + err.message);
    } finally {
      setPublicando(false);
    }
  }

  // Descartar Cambios
  async function handleDescartarCambios() {
    if (!confirm("¿Está seguro de descartar todos los cambios del borrador y volver a la última versión publicada?")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/problemas/relaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "descartar" })
      });
      if (res.ok) {
        alert("Cambios descartados exitosamente");
        cargarDatos();
      }
    } catch {
      alert("Error al descartar cambios");
    }
  }

  // Restaurar Fábrica
  async function handleConfirmarRestauracion() {
    try {
      const res = await fetch("/api/admin/problemas/relaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "restaurar_fabrica",
          confirmacion: "RESTAURAR"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al restaurar");

      setModalRestaurarAbierto(false);
      alert(data.mensaje || "Valores de fábrica restaurados");
      cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }

  // Exportar configuración a JSON
  function handleExportar() {
    const configSnapshot = {
      modulo: "Relación con incidentes, errores conocidos y conocimiento",
      version_esquema: "1.0",
      fecha_exportacion: new Date().toISOString(),
      datos: {
        reglasUmbral,
        configIncidentes,
        configKedb,
        configRfc,
        configConocimiento,
        configCmdb
      }
    };

    const blob = new Blob([JSON.stringify(configSnapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `config_problemas_relaciones_v${versionPublicada}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Importar configuración desde JSON
  function handleImportar() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (!json.datos) throw new Error("Archivo JSON no compatible con el esquema de relaciones");

          if (json.datos.configIncidentes) setConfigIncidentes(json.datos.configIncidentes);
          if (json.datos.configKedb) setConfigKedb(json.datos.configKedb);
          if (json.datos.configRfc) setConfigRfc(json.datos.configRfc);
          if (json.datos.configConocimiento) setConfigConocimiento(json.datos.configConocimiento);
          if (json.datos.configCmdb) setConfigCmdb(json.datos.configCmdb);

          marcarModificado();
          alert("Configuración cargada en borrador. Revise las pestañas y pulse 'Guardar borrador' o 'Publicar'.");
        } catch (err: any) {
          alert("Error al importar archivo: " + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: "umbral", label: "Creación por umbral" },
    { id: "incidentes", label: "Incidentes vinculados" },
    { id: "kedb", label: "Errores conocidos (KEDB)" },
    { id: "rfc", label: "Cambios (RFC)" },
    { id: "conocimiento", label: "Conocimiento" },
    { id: "cmdb", label: "CI y servicios (CMDB)" }
  ];

  return (
    <div style={{ minWidth: 1280, backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
      <div style={{ padding: "20px 28px 32px 28px", flex: 1 }}>
        {/* 1. BREADCRUMB */}
      <nav style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
        <Link href="/plataforma/problemas" style={{ color: "#2563eb", textDecoration: "none" }}>
          Problemas
        </Link>
        {" / "}
        <Link href="/plataforma/admin/procesos/problemas" style={{ color: "#2563eb", textDecoration: "none" }}>
          Configuración
        </Link>
        {" / "}
        <span style={{ color: "#0f172a", fontWeight: 600 }}>Relación con incidentes, errores conocidos y conocimiento</span>
      </nav>

      {/* 2. ENCABEZADO */}
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
          <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, color: "#0f172a" }}>
            Relación con Incidentes, Errores Conocidos y Conocimiento
          </h1>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
            Integra y coordina el ciclo de vida de problemas con la mesa de incidentes, base de errores conocidos (KEDB), solicitudes de cambio (RFC), artículos de conocimiento y elementos de configuración de la CMDB (ITIL 4: <em>Think and work holistically</em>).
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
              padding: "6px 12px",
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
              padding: "6px 12px",
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

      {/* 3. BARRA DE PESTAÑAS */}
      <div style={{
        display: "flex",
        borderBottom: "2px solid #e2e8f0",
        marginBottom: 20,
        backgroundColor: "#ffffff",
        borderRadius: "8px 8px 0 0",
        padding: "0 12px",
        overflowX: "auto"
      }}>
        {tabs.map((tab) => {
          const activa = tabActiva === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabActiva(tab.id)}
              style={{
                padding: "12px 18px",
                fontSize: 13,
                fontWeight: activa ? 700 : 500,
                color: activa ? "#2563eb" : "#64748b",
                borderBottom: activa ? "2px solid #2563eb" : "2px solid transparent",
                marginBottom: -2,
                background: "none",
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

      {/* 4. CONTENIDO DE LA PESTAÑA ACTIVA */}
      {cargando ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
          Cargando configuración de integraciones y relaciones...
        </div>
      ) : errorCarga ? (
        <div style={{
          padding: 24,
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 8,
          color: "#991b1b",
          textAlign: "center"
        }}>
          <p style={{ margin: "0 0 12px 0", fontWeight: 600 }}>{errorCarga}</p>
          <button
            type="button"
            className="boton-primario"
            style={{ width: "auto", padding: "6px 16px" }}
            onClick={cargarDatos}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div>
          {tabActiva === "umbral" && (
            <PestanaUmbral
              reglas={reglasUmbral}
              catalogos={catalogosAuxiliares}
              onActualizar={cargarDatos}
              onMarcarModificado={marcarModificado}
            />
          )}

          {tabActiva === "incidentes" && (
            <PestanaIncidentesVinculados
              config={configIncidentes}
              onChange={setConfigIncidentes}
              onMarcarModificado={marcarModificado}
            />
          )}

          {tabActiva === "kedb" && (
            <PestanaKedb
              config={configKedb}
              onChange={setConfigKedb}
              onMarcarModificado={marcarModificado}
            />
          )}

          {tabActiva === "rfc" && (
            <PestanaRfc
              config={configRfc}
              onChange={setConfigRfc}
              onMarcarModificado={marcarModificado}
            />
          )}

          {tabActiva === "conocimiento" && (
            <PestanaConocimiento
              config={configConocimiento}
              onChange={setConfigConocimiento}
              onMarcarModificado={marcarModificado}
            />
          )}

          {tabActiva === "cmdb" && (
            <PestanaCmdb
              config={configCmdb}
              clasesDisponibles={catalogosAuxiliares.clasesCI || []}
              onChange={setConfigCmdb}
              onMarcarModificado={marcarModificado}
            />
          )}
        </div>
      )}
      </div>

      {/* 5. BARRA DE ACCIONES FIJA INFERIOR (PATRÓN COMÚN) */}
      <BarraAccionesComun
        versionPublicada={versionPublicada}
        fechaPublicada={fechaPublicada}
        autorPublicada={autorPublicada}
        hayBorrador={hayBorrador}
        guardando={guardando}
        publicando={publicando}
        puedePublicar={puedePublicar}
        puedeEditar={puedeEditar}
        onGuardarBorrador={handleGuardarBorrador}
        onVistaPrevia={() => alert("Vista previa interactiva activa para la pestaña " + tabActiva)}
        onAbrirPublicar={handleAbrirPublicar}
        onDescartar={handleDescartarCambios}
        onRestaurarFabrica={() => setModalRestaurarAbierto(true)}
        onVerHistorial={() => setModalHistorialAbierto(true)}
        onExportar={handleExportar}
        onImportar={handleImportar}
      />

      {/* MODAL: PUBLICACIÓN */}
      <ModalPublicacion
        abierto={modalPublicarAbierto}
        versionActual={versionPublicada}
        diffs={diffsPublicacion}
        ticketsAbiertosAfectados={0}
        onCerrar={() => setModalPublicarAbierto(false)}
        onConfirmar={handleConfirmarPublicacion}
      />

      {/* MODAL: HISTORIAL DE VERSIONES */}
      <ModalHistorialVersiones
        abierto={modalHistorialAbierto}
        versiones={versionesHistorial}
        versionActual={versionPublicada}
        onCerrar={() => setModalHistorialAbierto(false)}
        onRestaurarComoBorrador={(v: any) => {
          alert(`Restaurando versión v${v.numero_version}...`);
          cargarDatos();
        }}
      />

      {/* MODAL: RESTAURAR VALORES DE FÁBRICA */}
      <ModalRestaurarFabrica
        abierto={modalRestaurarAbierto}
        onCerrar={() => setModalRestaurarAbierto(false)}
        onConfirmar={handleConfirmarRestauracion}
      />
    </div>
  );
}
