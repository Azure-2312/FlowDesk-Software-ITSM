"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Problema {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  estado_nombre?: string;
  prioridad_nombre?: string | null;
  asignado?: string | null;
  fecha_objetivo?: string | null;
  horas_restantes?: number | null;
  fecha_creacion?: string;
}

interface Kedb {
  id_error_conocido: number;
  codigo_kedb: string;
  titulo: string;
  fecha_publicacion: string | null;
  codigo_problema: string | null;
}

interface Panel {
  kpis: {
    abiertos: number;
    sin_asignar: number;
    vencidos: number;
    por_vencer: number;
    kedb_marcados: number;
    mayores_activos: number;
    candidatos: number;
  };
  kedb: Kedb[];
  proximos: Problema[];
  sin_asignar: Problema[];
  candidatos: { dimension: string; valor: string; total: number }[];
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

function fecha(valor: string | null | undefined) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaPanelGestorProblemas() {
  const [data, setData] = useState<Panel | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarDatos() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/problemas/gestion/panel?_t=${Date.now()}`);
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
            Gestión de Problemas & Catálogo KEDB (ITIL v4)
          </span>
          <h1 style={{ margin: 0 }}>Panel de gestión de problemas</h1>
          <p style={{ marginTop: 4, color: "#64748b", fontSize: 13.5 }}>Problemas abiertos, sin asignar, por vencer, mayores activos, errores conocidos y candidatos detectados.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/plataforma/problemas/gestion/nuevo"
            className="boton-primario"
            style={{ textDecoration: "none", fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            + Registrar Problema
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Kpi titulo="Abiertos" valor={data.kpis.abiertos} subtitulo="Investigaciones activas" />
        <Kpi titulo="Sin asignar" valor={data.kpis.sin_asignar} color={data.kpis.sin_asignar > 0 ? "#b45309" : undefined} subtitulo={data.kpis.sin_asignar > 0 ? "Requiere especialista" : "Todos asignados"} />
        <Kpi titulo="Vencidos" valor={data.kpis.vencidos} color={data.kpis.vencidos > 0 ? "#b91c1c" : undefined} subtitulo={data.kpis.vencidos > 0 ? "Objetivo sobrepasado" : "0 fuera de fecha"} />
        <Kpi titulo="Por vencer (24 h)" valor={data.kpis.por_vencer} color={data.kpis.por_vencer > 0 ? "#b45309" : undefined} subtitulo="Próximos a límite" />
        <Kpi titulo="Problemas mayores" valor={data.kpis.mayores_activos} color={data.kpis.mayores_activos > 0 ? "#b91c1c" : undefined} subtitulo="Comité RCA convocado" />
        <Kpi titulo="Errores conocidos" valor={data.kpis.kedb_marcados} subtitulo="Artículos en KEDB" />
        <Kpi titulo="Candidatos" valor={data.kpis.candidatos} subtitulo="Incidentes recurrentes" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Accesos rápidos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/plataforma/problemas/gestion/asignacion" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Bandeja y asignación</Link>
            <Link href="/plataforma/problemas/gestion/candidatos" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Candidatos a problema</Link>
            <Link href="/plataforma/problemas/gestion/analisis" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Análisis de causa raíz</Link>
            <Link href="/plataforma/problemas/gestion/mayores" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Problemas mayores</Link>
          </div>
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Próximos a vencer</h2>
          {data.proximos.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Sin problemas con objetivo de tiempo definido.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.proximos.map((p) => (
                <li key={p.id_problema} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                  <strong>{p.codigo_problema}</strong> · {p.titulo}
                  <div style={{ fontSize: 11.5, color: (p.horas_restantes ?? 1) < 0 ? "#b91c1c" : "#b45309", marginTop: 2 }}>
                    Objetivo {fecha(p.fecha_objetivo)} · {p.horas_restantes ?? 0} h · {p.asignado ?? "sin asignar"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Sin asignar</h2>
          {data.sin_asignar.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Todos los problemas abiertos tienen responsable.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.sin_asignar.map((p) => (
                <li key={p.id_problema} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                  <strong>{p.codigo_problema}</strong> · {p.titulo}
                  <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>{p.prioridad_nombre ?? "Sin prioridad"} · {fecha(p.fecha_creacion)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Errores conocidos (KEDB)</h2>
          {data.kedb.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>No hay errores conocidos publicados.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.kedb.map((k) => (
                <li key={k.id_error_conocido} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                  <strong>{k.codigo_kedb}</strong> · {k.titulo}
                  <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>{k.codigo_problema ?? "—"} · {fecha(k.fecha_publicacion)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
