"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Pestanas from "@/shared/components/ui/Pestanas";
import { ACCIONES } from "@/shared/lib/capacidades";
import { usePuede } from "@/shared/components/layout/PermisosProvider";

export default function PaginaMisCambios() {
  const puedeRfc = usePuede(ACCIONES.CAMBIO_RFC_REGISTRAR);
  const [cambios, setCambios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [segmento, setSegmento] = useState<"todos" | "normal" | "estandar" | "emergencia">("todos");
  const [busqueda, setBusqueda] = useState("");

  async function cargarCambios() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cambios?vista=mis_cambios&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setCambios(Array.isArray(data) ? data : []);
      } else {
        setError("No se pudieron cargar los cambios RFC.");
      }
    } catch {
      setError("Error de conexión al cargar cambios.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCambios();
  }, []);

  const cambiosFiltrados = useMemo(() => {
    return cambios.filter((c) => {
      if (segmento === "normal" && c.tipo_cambio !== "NORMAL") return false;
      if (segmento === "estandar" && c.tipo_cambio !== "ESTANDAR") return false;
      if (segmento === "emergencia" && c.tipo_cambio !== "EMERGENCIA") return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const matchCod = c.codigo_cambio?.toLowerCase().includes(q);
        const matchTit = c.titulo?.toLowerCase().includes(q);
        if (!matchCod && !matchTit) return false;
      }

      return true;
    });
  }, [cambios, segmento, busqueda]);

  const TEXTOS_SEGMENTO = {
    todos: { titulo: "Mis cambios en trámite", descripcion: "Solicitudes de cambio (RFC) propuestas por ti o asignadas a tu responsabilidad." },
    normal: { titulo: "Mis cambios normales en trámite", descripcion: "RFC normales: requieren evaluación de riesgo y aprobación del CAB." },
    estandar: { titulo: "Mis cambios estándar en trámite", descripcion: "RFC basadas en un modelo de cambio estándar preautorizado." },
    emergencia: { titulo: "Mis cambios de emergencia en trámite", descripcion: "RFC de emergencia: se evalúan por el ECAB con un flujo acelerado." },
  } as const;
  const textos = TEXTOS_SEGMENTO[segmento];

  return (
    <div className="vista-contenedor">
      <Pestanas
        items={[
          { id: "todos", etiqueta: "Todos", contador: cambios.length },
          { id: "normal", etiqueta: "Normales" },
          { id: "estandar", etiqueta: "Estándar" },
          { id: "emergencia", etiqueta: "Emergencia" },
        ]}
        activa={segmento}
        onCambiar={setSegmento}
      />

      <div className="cabecera-pagina">
        <div>
          <h1 className="titulo-pagina">{textos.titulo}</h1>
          <p className="descripcion-pagina">
            {textos.descripcion} ({cambiosFiltrados.length} cambios)
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {puedeRfc && (<>
          <Link href="/plataforma/cambios/nuevo" className="boton-primario">
            Registrar solicitud RFC
          </Link>
          </>)}
          <button className="boton-secundario" type="button" onClick={() => cargarCambios()}>
            Actualizar
          </button>
        </div>
      </div>

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando solicitudes de cambio...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!cargando && !error && cambiosFiltrados.length === 0 && (
        <div
          className="estado-vacio"
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
            No tienes solicitudes de cambio en esta vista
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            Puedes registrar una nueva solicitud RFC para mantenimientos o actualizaciones programadas.
          </p>
        </div>
      )}

      {!cargando && !error && cambiosFiltrados.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tipo</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Estado</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Prioridad</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Ventana Programada</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cambiosFiltrados.map((c) => (
                <tr key={c.id_cambio} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2563eb" }}>
                    {c.codigo_cambio}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor:
                          c.tipo_cambio === "EMERGENCIA"
                            ? "#fee2e2"
                            : c.tipo_cambio === "ESTANDAR"
                            ? "#dbeafe"
                            : "#f1f5f9",
                        color:
                          c.tipo_cambio === "EMERGENCIA"
                            ? "#991b1b"
                            : c.tipo_cambio === "ESTANDAR"
                            ? "#1e40af"
                            : "#334155",
                      }}
                    >
                      {c.tipo_cambio}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#1e293b", fontWeight: 500, maxWidth: 320 }}>
                    {c.titulo}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: "#f1f5f9",
                        color: "#334155",
                      }}
                    >
                      {c.estado_nombre}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569" }}>
                      {c.prioridad_nombre || "Media"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>
                    {c.ventana_inicio
                      ? new Date(c.ventana_inicio).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Por programar"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link
                      href="/plataforma/cambios/mis-cambios?vista=por-implementar"
                      className="boton-secundario boton-sm"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
