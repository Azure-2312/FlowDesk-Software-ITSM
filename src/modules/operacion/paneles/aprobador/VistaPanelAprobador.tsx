"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Panel {
  kpis: { pendientes: number; por_vencer: number; bajas_pendientes: number; problemas_pendientes: number };
  proximaReunion: { id_reunion: number; titulo: string; fecha_reunion: string; tipo: string } | null;
  decisionesRecientes: { id_cambio_aprobacion: number; decision: string; fecha_decision: string; codigo_cambio: string; titulo: string }[];
}

function Kpi({ titulo, valor, color, subtitulo }: { titulo: string; valor: number; color?: string; subtitulo?: string }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "16px 18px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {titulo}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color ?? "#0f172a", marginTop: 8 }}>
        {valor}
      </div>
      {subtitulo && (
        <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
          {subtitulo}
        </span>
      )}
    </div>
  );
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  APROBADO: { bg: "#dcfce7", fg: "#166534" },
  RECHAZADO: { bg: "#fee2e2", fg: "#b91c1c" },
  OBSERVADO: { bg: "#fef3c7", fg: "#92400e" },
};

export default function VistaPanelAprobador() {
  const [data, setData] = useState<Panel | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarDatos() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/operacion/paneles/aprobador?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setData(json);
      else setError(json.error ?? "No se pudo cargar el panel.");
    } catch {
      setError("Error de conexión al cargar el panel.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  if (cargando) return <div className="vista-contenedor"><p>Cargando panel...</p></div>;
  if (error) return <div className="vista-contenedor"><p role="alert" className="mensaje-error">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <span className="badge-tag" style={{ display: "inline-block", marginBottom: 6, backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
            Comité CAB & Autorización de Negocio (ITIL v4)
          </span>
          <h1 style={{ margin: 0 }}>Panel del aprobador</h1>
          <p style={{ marginTop: 4, color: "#64748b", fontSize: 13.5 }}>Pendientes por vencer, reuniones del comité y decisiones recientes.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/plataforma/cambios/cab/agenda"
            className="boton-primario"
            style={{ textDecoration: "none", fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Agenda del CAB
          </Link>
          <button
            type="button"
            className="boton-secundario"
            onClick={cargarDatos}
            style={{ fontSize: 13, padding: "8px 12px", cursor: "pointer" }}
            title="Actualizar panel"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Kpi titulo="Cambios por decidir" valor={data.kpis.pendientes} color={data.kpis.pendientes > 0 ? "#b45309" : undefined} subtitulo={data.kpis.pendientes > 0 ? "Votación pendiente" : "Sin casos pendientes"} />
        <Kpi titulo="Por vencer (48 h)" valor={data.kpis.por_vencer} color={data.kpis.por_vencer > 0 ? "#b91c1c" : undefined} subtitulo={data.kpis.por_vencer > 0 ? "Urgencia alta" : "Plazos en orden"} />
        <Kpi titulo="Bajas por monto" valor={data.kpis.bajas_pendientes} subtitulo="Activos de alto valor" />
        <Kpi titulo="Problemas mayores" valor={data.kpis.problemas_pendientes} subtitulo="RCA en revisión" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Próxima reunión del CAB</h2>
          {data.proximaReunion ? (
            <div style={{ fontSize: 13 }}>
              <strong>{data.proximaReunion.titulo}</strong>
              <div style={{ color: "#6b7280", marginTop: 4 }}>
                {fechaHora(data.proximaReunion.fecha_reunion)} · {data.proximaReunion.tipo}
              </div>
              <Link href="/plataforma/cambios/cab/agenda" className="boton-secundario" style={{ display: "inline-block", marginTop: 10, textDecoration: "none" }}>Ver agenda</Link>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>No hay reuniones programadas. <Link href="/plataforma/cambios/cab/agenda">Programar</Link></p>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Decisiones recientes</h2>
          {data.decisionesRecientes.length === 0 ? (
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Aún no has registrado decisiones.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.decisionesRecientes.map((d) => {
                const color = COLORES[d.decision] ?? { bg: "#e5e7eb", fg: "#374151" };
                return (
                  <li key={d.id_cambio_aprobacion} style={{ fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 999, backgroundColor: color.bg, color: color.fg, marginRight: 8 }}>{d.decision}</span>
                    <strong>{d.codigo_cambio}</strong> · {d.titulo}
                    <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>{fechaHora(d.fecha_decision)}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
