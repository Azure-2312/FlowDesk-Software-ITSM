"use client";

import React from "react";
import Link from "next/link";

export default function ProblemasHubPage() {
  return (
    <div style={{ padding: "24px 28px", minWidth: 1200, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        <Link href="/plataforma/problemas" style={{ color: "#2563eb", textDecoration: "none" }}>
          Problemas
        </Link>
        {" / "}
        <span style={{ color: "#0f172a", fontWeight: 600 }}>Configuración del proceso</span>
      </nav>

      {/* Cabecera */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "24px 28px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        marginBottom: 24
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
          Gestión de Problemas (ITIL 4 / ISO 20000)
        </h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14, maxWidth: 900 }}>
          Centro de administración y gobernanza de la práctica de Gestión de Problemas. Reduzca la probabilidad y el impacto de los incidentes identificando sus causas reales o potenciales y gestionando errores conocidos (KEDB).
        </p>
      </div>

      {/* Grid de las 3 Pantallas de Configuración */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {/* Tarjeta Formulario */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          padding: 22,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{
                display: "inline-block",
                padding: "3px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: "#dbeafe",
                color: "#1e40af"
              }}>
                1.3.3.1
              </span>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Configuración de formulario
              </h2>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px 0", lineHeight: 1.5 }}>
              Editor visual de campos de captura, atributos personalizados, listas desplegables, matriz de prioridad ITIL (Impacto × Urgencia), plantillas preconfiguradas y composición de la vista del ticket.
            </p>
            <ul style={{ margin: "0 0 16px 0", paddingLeft: 18, fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>
              <li>Campos estándar</li>
              <li>Campos personalizados</li>
              <li>Listas y catálogos</li>
              <li>Matriz de prioridad</li>
              <li>Plantillas de problema</li>
              <li>Vista del ticket</li>
            </ul>
          </div>
          <Link
            href="/plataforma/admin/procesos/problemas/formulario"
            className="boton-primario"
            style={{ textAlign: "center", textDecoration: "none", padding: "8px 16px", fontSize: 13 }}
          >
            Abrir Configuración de Formulario →
          </Link>
        </div>

        {/* Tarjeta Flujo */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          padding: 22,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{
                display: "inline-block",
                padding: "3px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: "#e0e7ff",
                color: "#3730a3"
              }}>
                1.3.3.2
              </span>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Flujo de investigación y seguimiento
              </h2>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px 0", lineHeight: 1.5 }}>
              Ciclo de vida de investigación con matriz y grafo de transiciones, asignación automática con disponibilidad, metas operativas (OLA), reglas de escalamiento, política de reapertura y revisión de problemas mayores (PIR).
            </p>
            <ul style={{ margin: "0 0 16px 0", paddingLeft: 18, fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>
              <li>Estados</li>
              <li>Transiciones y acciones</li>
              <li>Asignación y disponibilidad</li>
              <li>Objetivos de tiempo (OLA P1 a P4)</li>
              <li>Escalamiento y alertas</li>
              <li>Reapertura controlada</li>
              <li>Tareas y paquetes de investigación</li>
              <li>Problemas mayores y revisión (PIR)</li>
            </ul>
          </div>
          <Link
            href="/plataforma/admin/procesos/problemas/flujo"
            className="boton-primario"
            style={{ textAlign: "center", textDecoration: "none", padding: "8px 16px", fontSize: 13 }}
          >
            Abrir Flujo de Investigación →
          </Link>
        </div>

        {/* Tarjeta Relaciones */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          padding: 22,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{
                display: "inline-block",
                padding: "3px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: "#fef3c7",
                color: "#92400e"
              }}>
                1.3.3.3
              </span>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Relaciones e integraciones
              </h2>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px 0", lineHeight: 1.5 }}>
              Integración holística con incidentes (detección por umbrales y resolución asistida), base de errores conocidos (KEDB), solicitudes de cambio (RFC), generación de artículos de conocimiento y sincronización con CMDB.
            </p>
            <ul style={{ margin: "0 0 16px 0", paddingLeft: 18, fontSize: 12.5, color: "#475569", lineHeight: 1.6 }}>
              <li>Creación automática por umbral</li>
              <li>Incidentes vinculados y workarounds</li>
              <li>Errores conocidos (KEDB)</li>
              <li>Cambios (RFC)</li>
              <li>Conocimiento (KB)</li>
              <li>CI y servicios (CMDB)</li>
            </ul>
          </div>
          <Link
            href="/plataforma/admin/procesos/problemas/relaciones"
            className="boton-primario"
            style={{ textAlign: "center", textDecoration: "none", padding: "8px 16px", fontSize: 13 }}
          >
            Abrir Relaciones e Integraciones →
          </Link>
        </div>
      </div>
    </div>
  );
}
