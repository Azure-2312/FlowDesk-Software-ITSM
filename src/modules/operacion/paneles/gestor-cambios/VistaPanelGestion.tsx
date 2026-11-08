"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Panel {
  kpis: {
    por_evaluar: number;
    autorizaciones_pendientes: number;
    cambios_hoy: number;
    conflictos: number;
    pir_vencidas: number;
    emergencias_abiertas: number;
  };
  proximos: {
    id_cambio: number;
    codigo_cambio: string;
    titulo: string;
    estado_nombre: string;
    ventana_inicio: string;
    ventana_fin: string;
    tipo_cambio: string;
    responsable_nombre: string | null;
  }[];
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

export default function VistaPanelGestion() {
  const [data, setData] = useState<Panel | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarDatos() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/operacion/paneles/cambios?_t=${Date.now()}`);
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
            Habilitación del Cambio & Calendario RFC (ITIL v4)
          </span>
          <h1 style={{ margin: 0 }}>Panel de gestión de cambios</h1>
          <p style={{ marginTop: 4, color: "#64748b", fontSize: 13.5 }}>RFC por evaluar, autorizaciones pendientes, cambios de hoy, conflictos y PIR vencidas.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/plataforma/cambios/gestion/crear"
            className="boton-primario"
            style={{ textDecoration: "none", fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            + Crear Cambio (RFC)
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
        <Kpi titulo="Por evaluar" valor={data.kpis.por_evaluar} color={data.kpis.por_evaluar > 0 ? "#b45309" : undefined} subtitulo={data.kpis.por_evaluar > 0 ? "Pendiente análisis de impacto" : "Al día"} />
        <Kpi titulo="Autorizaciones pendientes" valor={data.kpis.autorizaciones_pendientes} subtitulo="En revisión CAB" />
        <Kpi titulo="Cambios de hoy" valor={data.kpis.cambios_hoy} subtitulo="Ventana activa" />
        <Kpi titulo="Conflictos" valor={data.kpis.conflictos} color={data.kpis.conflictos > 0 ? "#b91c1c" : undefined} subtitulo={data.kpis.conflictos > 0 ? "Colisiones detectadas" : "0 conflictos"} />
        <Kpi titulo="PIR vencidas" valor={data.kpis.pir_vencidas} color={data.kpis.pir_vencidas > 0 ? "#b91c1c" : undefined} subtitulo={data.kpis.pir_vencidas > 0 ? "Revisión post-impl. pendiente" : "0 pendientes"} />
        <Kpi titulo="Emergencias abiertas" valor={data.kpis.emergencias_abiertas} subtitulo="Comité ECAB requerido" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Accesos rápidos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/plataforma/cambios/gestion/evaluacion" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Bandeja de evaluación</Link>
            <Link href="/plataforma/cambios/gestion/autorizaciones" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Autorizaciones</Link>
            <Link href="/plataforma/cambios/gestion/conflictos" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Conflictos y capacidad</Link>
            <Link href="/plataforma/cambios/gestion/pir" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Revisión post-implementación</Link>
          </div>
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Próximos cambios programados</h2>
          {data.proximos.length === 0 ? (
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>No hay cambios programados próximos.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.proximos.map((c) => (
                <li key={c.id_cambio} style={{ fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                  <strong>{c.codigo_cambio}</strong> · {c.titulo}
                  <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>
                    {fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)} · {c.estado_nombre} · {c.responsable_nombre ?? "sin responsable"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
