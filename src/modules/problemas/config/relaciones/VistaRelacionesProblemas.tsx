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
    <div style={{ minWidth: 1280, backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
      <div style={{ padding: "20px 28px 32px 28px", flex: 1 }}>
        {/* Encabezado Principal Estandarizado ARQ-3 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          backgroundColor: "#ffffff",
          padding: "18px 24px",
          borderRadius: 8,
          border: "1px solid #e2e8f0"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>Relaciones ITIL</span>
              <h1 style={{ fontSize: 21, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Relación con Incidentes, Errores Conocidos y Conocimiento
              </h1>
            </div>
            <p style={{ margin: "6px 0 0 0", color: "#64748b", fontSize: 13 }}>
              Integra y coordina el ciclo de vida de problemas con la mesa de incidentes, base de errores conocidos (KEDB), solicitudes de cambio (RFC), artículos de conocimiento y elementos de configuración de la CMDB.
            </p>
            <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
              Última modificación por <strong style={{ color: "#475569" }}>{autorPublicada || "Administrador"}</strong>
              {fechaPublicada && ` el ${new Date(fechaPublicada).toLocaleString()}`}
            </div>
          </div>

          {/* Acciones y estado del encabezado */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}>
              ● Configuración Activa
            </span>
            <button
              type="button"
              onClick={handleGuardarRelaciones}
              disabled={guardando || !puedeEditar}
              style={{
                backgroundColor: guardando ? "#93c5fd" : "#2563eb",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: guardando || !puedeEditar ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              {guardando ? "Guardando..." : "Guardar Relaciones"}
            </button>
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
    </div>
  );
}
