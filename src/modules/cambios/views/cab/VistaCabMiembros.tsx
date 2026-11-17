"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PestanaComites } from "@/modules/cambios/config/flujo-evaluacion/components/PestanaComites";

export default function VistaCabMiembros() {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<any>({});
  const [catalogoUsuarios, setCatalogoUsuarios] = useState<any[]>([]);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await fetch(`/api/cambios/configuracion/flujo-evaluacion/configuracion?pestana=comites&_t=${Date.now()}`);
      if (!res.ok) throw new Error("Error al obtener la configuración de comités");
      const data = await res.json();
      if (data.catalogo_usuarios) setCatalogoUsuarios(data.catalogo_usuarios);
      const snap = data.borrador?.snapshot || data.version_publicada?.snapshot || {};
      setSnapshot(snap);
    } catch (err: any) {
      setError(err.message || "Error al cargar configuración de comités");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleChange = (nuevoSnapshot: any) => {
    setSnapshot((prev: any) => ({
      ...prev,
      ...nuevoSnapshot,
      comites: nuevoSnapshot,
    }));
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setError(null);
      setExito(null);

      const res = await fetch("/api/cambios/configuracion/flujo-evaluacion/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pestana: "comites",
          snapshot,
          motivo: "Actualización de miembros y quórum de CAB/ECAB",
          impacto_resumen: "Actualización de miembros y reglas de quórum",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar la configuración");
      }

      setExito("Configuración de comités guardada exitosamente.");
      setTimeout(() => setExito(null), 3500);
    } catch (err: any) {
      setError(err.message || "Error al guardar configuración");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Cargando miembros y quórum del CAB/ECAB...
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 0" }}>
      {error && (
        <div style={{ marginBottom: 16, padding: "10px 14px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontSize: 13 }}>
          {error}
        </div>
      )}
      {exito && (
        <div style={{ marginBottom: 16, padding: "10px 14px", backgroundColor: "#dcfce7", border: "1px solid #86efac", borderRadius: 6, color: "#166534", fontSize: 13 }}>
          {exito}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          type="button"
          onClick={handleGuardar}
          disabled={guardando}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 13,
            cursor: guardando ? "not-allowed" : "pointer",
            opacity: guardando ? 0.7 : 1,
          }}
        >
          {guardando ? "Guardando..." : "Guardar miembros y quórum"}
        </button>
      </div>

      <PestanaComites
        snapshot={snapshot}
        catalogoUsuarios={catalogoUsuarios}
        onChange={handleChange}
        disabled={guardando}
      />
    </div>
  );
}
