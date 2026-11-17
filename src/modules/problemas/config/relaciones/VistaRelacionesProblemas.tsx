"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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

  // Estados de control y autoría
  const [versionPublicada, setVersionPublicada] = useState<number>(1);
  const [fechaPublicada, setFechaPublicada] = useState<string>("");
  const [autorPublicada, setAutorPublicada] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);
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

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorCarga(null);

      const res = await fetch("/api/problemas/configuracion/relaciones");
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
      setCatalogosAuxiliares(d.catalogosAuxiliares || { servicios: [], categorias: [], clasesCI: [] });

      if (d.versionPublicada) {
        setVersionPublicada(d.versionPublicada.numero_version || 1);
        setFechaPublicada(d.versionPublicada.fecha_publicacion || new Date().toISOString());
        setAutorPublicada(d.versionPublicada.autor_nombre || "Sistema Base");
      }
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
    // Para reactividad local
  }

  // Guardar y Aplicar Relaciones Directamente
  async function handleGuardarRelaciones() {
    setGuardando(true);
    try {
      const resGuardar = await fetch("/api/problemas/configuracion/relaciones", {
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

      const dataGuardar = await resGuardar.json();
      if (!resGuardar.ok) throw new Error(dataGuardar.error || "Error al guardar relaciones");

      // Auto-publicar para persistir versión activa
      await fetch("/api/problemas/configuracion/relaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "publicar",
          motivo: "Actualización de relaciones y umbrales de problemas"
        })
      });

      alert("Configuración de relaciones guardada exitosamente.");
      cargarDatos();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setGuardando(false);
    }
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
    <div style={{ width: "100%", backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column", flex: 1 }}>
      <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: "24px 32px", flex: 1, boxSizing: "border-box" }}>
        {/* Encabezado Principal Estandarizado */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 16
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#0f172a" }}>
              Relación con Incidentes, Errores Conocidos y Conocimiento
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: 13, lineHeight: 1.45 }}>
              Integra y coordina el ciclo de vida de problemas con la mesa de incidentes, base de errores conocidos (KEDB), solicitudes de cambio (RFC), artículos de conocimiento y elementos de configuración de la CMDB.
            </p>
          </div>

          {/* Acciones y estado del encabezado */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={handleGuardarRelaciones}
              disabled={guardando || !puedeEditar}
              className="boton-primario"
              style={{ width: "auto", padding: "8px 18px", fontSize: 13, flexShrink: 0 }}
            >
              {guardando ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </div>

      {/* 3. BARRA DE PESTAÑAS */}
      <div style={{
        display: "flex",
        gap: 8,
        borderBottom: "1px solid #e2e8f0",
        marginBottom: 24,
        justifyContent: "flex-start",
        overflowX: "auto",
        scrollbarWidth: "none"
      }}>
        {tabs.map((tab) => {
          const activa = tabActiva === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabActiva(tab.id)}
              style={{
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: activa ? 600 : 500,
                color: activa ? "#2563eb" : "#64748b",
                borderBottom: activa ? "2px solid #2563eb" : "2px solid transparent",
                background: "transparent",
                border: "none",
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
          <div style={{ display: tabActiva === "umbral" ? "block" : "none" }}>
            <PestanaUmbral
              reglas={reglasUmbral}
              catalogos={catalogosAuxiliares}
              onActualizar={cargarDatos}
              onMarcarModificado={marcarModificado}
            />
          </div>

          <div style={{ display: tabActiva === "incidentes" ? "block" : "none" }}>
            <PestanaIncidentesVinculados
              config={configIncidentes}
              onChange={setConfigIncidentes}
              onMarcarModificado={marcarModificado}
            />
          </div>

          <div style={{ display: tabActiva === "kedb" ? "block" : "none" }}>
            <PestanaKedb
              config={configKedb}
              onChange={setConfigKedb}
              onMarcarModificado={marcarModificado}
            />
          </div>

          <div style={{ display: tabActiva === "rfc" ? "block" : "none" }}>
            <PestanaRfc
              config={configRfc}
              onChange={setConfigRfc}
              onMarcarModificado={marcarModificado}
            />
          </div>

          <div style={{ display: tabActiva === "conocimiento" ? "block" : "none" }}>
            <PestanaConocimiento
              config={configConocimiento}
              onChange={setConfigConocimiento}
              onMarcarModificado={marcarModificado}
            />
          </div>

          <div style={{ display: tabActiva === "cmdb" ? "block" : "none" }}>
            <PestanaCmdb
              config={configCmdb}
              clasesDisponibles={catalogosAuxiliares.clasesCI || []}
              onChange={setConfigCmdb}
              onMarcarModificado={marcarModificado}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
