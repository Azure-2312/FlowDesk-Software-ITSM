"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Panel {
  departamento: string;
  kpis: {
    abiertos: number;
    cerrados: number;
    aprobaciones_pendientes: number;
    vencidos: number;
    csat_promedio: number | null;
  };
  cambiosProximos: {
    id_cambio: number;
    codigo_cambio: string;
    titulo: string;
    tipo_cambio: string;
    estado_nombre: string;
    ventana_inicio: string;
    ventana_fin: string;
  }[];
}

function Kpi({ titulo, valor, color }: { titulo: string; valor: string | number; color?: string }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? "#0f172a", marginTop: 6 }}>{valor}</div>
    </div>
  );
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function VistaPanelArea() {
  const [data, setData] = useState<Panel | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/perfiles/gestor-area/panel?_t=${Date.now()}`);
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
        <h1>Panel del área</h1>
        <p>Resumen de {data.departamento}: solicitudes, aprobaciones y cambios que afectan a mi área.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Tickets abiertos" valor={data.kpis.abiertos} />
        <Kpi titulo="Aprobaciones pendientes" valor={data.kpis.aprobaciones_pendientes} color={data.kpis.aprobaciones_pendientes > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Vencidos" valor={data.kpis.vencidos} color={data.kpis.vencidos > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Cerrados" valor={data.kpis.cerrados} />
        <Kpi titulo="Satisfacción" valor={data.kpis.csat_promedio ?? "—"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Accesos rápidos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/plataforma/tickets/gestion/aprobaciones" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Mis aprobaciones de solicitudes</Link>
            <Link href="/plataforma/perfiles/gestor-area/cambios/aprobaciones" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Aprobación de negocio de cambios</Link>
            <Link href="/plataforma/tickets/gestion/departamento" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Tickets de mi departamento</Link>
            <Link href="/plataforma/perfiles/gestor-area/reportes" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Reportes del área</Link>
          </div>
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Cambios próximos que afectan a mi área</h2>
          {data.cambiosProximos.length === 0 ? (
            <p>No hay cambios programados que afecten a mi área.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {data.cambiosProximos.map((c) => (
                <li key={c.id_cambio} style={{ fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                  <strong>{c.codigo_cambio}</strong> · {c.titulo}
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {c.estado_nombre} · {fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)}
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
