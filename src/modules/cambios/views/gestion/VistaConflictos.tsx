"use client";

import { useEffect, useState } from "react";

interface Solapamiento {
  codigo_a: string;
  codigo_b: string;
  titulo_a: string;
  titulo_b: string;
  inicio_a: string;
  fin_a: string;
  inicio_b: string;
  fin_b: string;
  mismo_ci: boolean;
}

interface Afectado {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  ventana_inicio: string;
  ventana_fin: string;
  congelamiento?: string;
  severidad?: string;
  feriado?: string;
  feriado_inicio?: string;
  feriado_fin?: string;
}

interface Capacidad {
  dia: string;
  total: number;
}

interface Duracion {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  ventana_inicio: string;
  ventana_fin: string;
  horas: number;
}

interface Datos {
  solapamientos: Solapamiento[];
  congelamientos: Afectado[];
  feriados: Afectado[];
  capacidad: Capacidad[];
  duraciones: Duracion[];
  parametros: { max_simultaneo: number; duracion_maxima_horas: number };
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function Seccion({ titulo, color, children, total }: { titulo: string; color: string; children: React.ReactNode; total: number }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>{titulo}</h2>
        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, backgroundColor: total > 0 ? color : "#e5e7eb", color: total > 0 ? "#fff" : "#374151" }}>{total}</span>
      </div>
      {total === 0 ? <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Sin incidencias.</p> : children}
    </div>
  );
}

export default function VistaConflictos() {
  const [data, setData] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/perfiles/gestor-cambios/conflictos?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setData(json);
        else setError(json.error ?? "No se pudieron cargar los conflictos.");
      } catch {
        setError("Error de conexión al cargar los conflictos.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <div className="vista-contenedor"><p>Cargando...</p></div>;
  if (error) return <div className="vista-contenedor"><p role="alert" className="mensaje-error">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Conflictos y capacidad</h1>
        <p>Solapamientos entre RFC, choques con congelamientos y feriados, capacidad diaria y duraciones fuera de política.</p>
      </div>

      <p style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 16 }}>
        Parámetros vigentes: máximo {data.parametros.max_simultaneo} cambios simultáneos por día · duración máxima de ventana {data.parametros.duracion_maxima_horas} h.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <Seccion titulo="Solapamientos entre RFC" color="#b91c1c" total={data.solapamientos.length}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {data.solapamientos.map((s, i) => (
              <li key={i} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                <strong>{s.codigo_a}</strong> vs <strong>{s.codigo_b}</strong>
                {s.mismo_ci && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: "#b91c1c" }}>[mismo CI]</span>}
                <div style={{ color: "#6b7280", marginTop: 3 }}>{s.titulo_a} · {fechaHora(s.inicio_a)} → {fechaHora(s.fin_a)}</div>
                <div style={{ color: "#6b7280" }}>{s.titulo_b} · {fechaHora(s.inicio_b)} → {fechaHora(s.fin_b)}</div>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Congelamientos" color="#b45309" total={data.congelamientos.length}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {data.congelamientos.map((c, i) => (
              <li key={i} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                <strong>{c.codigo_cambio}</strong> · {c.titulo}
                <div style={{ color: "#6b7280", marginTop: 3 }}>Congelamiento: {c.congelamiento} ({c.severidad ?? "—"})</div>
                <div style={{ color: "#6b7280" }}>Ventana: {fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)}</div>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Feriados" color="#b45309" total={data.feriados.length}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {data.feriados.map((f, i) => (
              <li key={i} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                <strong>{f.codigo_cambio}</strong> · {f.titulo}
                <div style={{ color: "#6b7280", marginTop: 3 }}>Feriado: {f.feriado}</div>
                <div style={{ color: "#6b7280" }}>Ventana: {fechaHora(f.ventana_inicio)} → {fechaHora(f.ventana_fin)}</div>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Capacidad diaria excedida" color="#b91c1c" total={data.capacidad.length}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {data.capacidad.map((c, i) => (
              <li key={i} style={{ fontSize: 12.5 }}>
                {new Date(c.dia).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })} · {c.total} cambios programados
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Duraciones fuera de política" color="#b45309" total={data.duraciones.length}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {data.duraciones.map((d, i) => (
              <li key={i} style={{ fontSize: 12.5 }}>
                <strong>{d.codigo_cambio}</strong> · {Math.round(Number(d.horas))} h ({d.titulo})
              </li>
            ))}
          </ul>
        </Seccion>
      </div>
    </div>
  );
}
