"use client";

// Reglas de umbral de recurrencia (ITIL v4 – Gestión de Problemas proactiva).
// Estas reglas las usa gestionProblemasService para proponer "Candidatos a
// problema" cuando un mismo servicio/categoría/CI acumula incidentes.

import { useEffect, useState } from "react";
import { PestanaUmbral } from "../relaciones/components/PestanaUmbral";

export default function VistaUmbralProblemas() {
  const [reglas, setReglas] = useState<any[]>([]);
  const [catalogos, setCatalogos] = useState<any>({ servicios: [], categorias: [], clasesCI: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/problemas/configuracion/relaciones", { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo cargar la configuración.");
      setReglas(d.reglasUmbral || []);
      setCatalogos(d.catalogosAuxiliares || { servicios: [], categorias: [], clasesCI: [] });
    } catch (e: any) {
      setError(e.message || "Error de conexión.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  if (cargando) return <div className="mensaje-cargando">Cargando reglas de umbral...</div>;
  if (error) return <div className="mensaje-error">{error}</div>;

  return (
    <div className="vista-contenedor">
      <PestanaUmbral reglas={reglas} catalogos={catalogos} onActualizar={cargar} onMarcarModificado={() => {}} />
    </div>
  );
}
