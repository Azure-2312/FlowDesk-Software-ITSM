"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PestanaComites } from "@/modules/cambios/config/comites/PestanaComites";
import { AlertCircle, CheckCircle2, RefreshCw } from "@/shared/components/ui/Iconos";

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
      <div className="vista-contenedor" style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <RefreshCw size={16} style={{ animation: "spin 1s linear infinite", color: "#2563eb" }} />
          <span>Cargando miembros y quórum del CAB/ECAB...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="vista-contenedor" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#991b1b",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {exito && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #86efac",
            borderRadius: "8px",
            color: "#166534",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{exito}</span>
        </div>
      )}

      <PestanaComites
        snapshot={snapshot}
        catalogoUsuarios={catalogoUsuarios}
        onChange={handleChange}
        disabled={guardando}
        onGuardar={handleGuardar}
        guardando={guardando}
      />
    </div>
  );
}
