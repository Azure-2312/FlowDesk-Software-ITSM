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

function Kpi({ titulo, valor, color }: { titulo: string; valor: number; color?: string }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? "#0f172a", marginTop: 6 }}>{valor}</div>
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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/gestor-problemas/panel?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setData(json);
        else setError(json.error ?? "No se pudo cargar el panel.");
      } catch {
        setError("Error de conexión al cargar el panel.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <div className="vista-contenedor"><p>Cargando panel...</p></div>;
  if (error) return <div className="vista-contenedor"><p role="alert" className="mensaje-error">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Panel de gestión de problemas</h1>
        <p>Problemas abiertos, sin asignar, por vencer, mayores activos, errores conocidos y candidatos detectados.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Abiertos" valor={data.kpis.abiertos} />
        <Kpi titulo="Sin asignar" valor={data.kpis.sin_asignar} color={data.kpis.sin_asignar > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Vencidos" valor={data.kpis.vencidos} color={data.kpis.vencidos > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Por vencer (24 h)" valor={data.kpis.por_vencer} color={data.kpis.por_vencer > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Problemas mayores" valor={data.kpis.mayores_activos} color={data.kpis.mayores_activos > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Errores conocidos" valor={data.kpis.kedb_marcados} />
        <Kpi titulo="Candidatos" valor={data.kpis.candidatos} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Accesos rápidos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/plataforma/gestor-problemas/asignacion" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Bandeja y asignación</Link>
            <Link href="/plataforma/gestor-problemas/candidatos" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Candidatos a problema</Link>
            <Link href="/plataforma/gestor-problemas/analisis" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Análisis de causa raíz</Link>
            <Link href="/plataforma/gestor-problemas/mayores" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Problemas mayores</Link>
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
