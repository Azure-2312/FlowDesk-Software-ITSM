"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Panel {
  kpis: {
    abiertos: number;
    sin_asignar: number;
    vencidos: number;
    por_vencer: number;
    csat_promedio: number | null;
  };
  alertas: {
    incidentes_mayores: number;
    p1p2_sin_asignar: number;
    aprobaciones_pendientes: number;
    tecnicos_sobrecargados: number;
  };
  tecnicos: {
    id_usuario: number;
    nombre: string;
    asignados_abiertos: number;
    vencidos: number;
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

export default function VistaPanelSupervisor() {
  const [data, setData] = useState<Panel | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/supervisor/panel?_t=${Date.now()}`);
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

  const alertas = [
    { texto: "Incidentes mayores abiertos", valor: data.alertas.incidentes_mayores, href: "/plataforma/supervisor/incidentes-mayores" },
    { texto: "P1/P2 sin asignar", valor: data.alertas.p1p2_sin_asignar, href: "/plataforma/tickets/gestion/asignar" },
    { texto: "Aprobaciones de RFC pendientes", valor: data.alertas.aprobaciones_pendientes, href: "/plataforma/supervisor/cambios/aprobaciones" },
    { texto: "Técnicos sobrecargados", valor: data.alertas.tecnicos_sobrecargados, href: "/plataforma/tickets/gestion/tecnicos" },
  ];

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Panel de supervisión</h1>
        <p>Estado del equipo de mi área técnica en un vistazo.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Tickets abiertos" valor={data.kpis.abiertos} />
        <Kpi titulo="Sin asignar" valor={data.kpis.sin_asignar} color={data.kpis.sin_asignar > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Vencidos" valor={data.kpis.vencidos} color={data.kpis.vencidos > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Por vencer (4 h)" valor={data.kpis.por_vencer} color={data.kpis.por_vencer > 0 ? "#b45309" : undefined} />
        <Kpi titulo="CSAT promedio" valor={data.kpis.csat_promedio ?? "—"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Alertas y riesgos</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {alertas.map((a) => (
              <li key={a.texto} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                <Link href={a.href} style={{ color: "#1d4ed8", textDecoration: "none" }}>{a.texto}</Link>
                <span style={{ fontWeight: 700, color: a.valor > 0 ? "#b91c1c" : "#6b7280" }}>{a.valor}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Accesos rápidos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/plataforma/tickets/gestion/asignar" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Centro de asignación</Link>
            <Link href="/plataforma/tickets/gestion/tecnicos" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Monitoreo de técnicos</Link>
            <Link href="/plataforma/supervisor/incidentes-mayores" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Declarar incidente mayor</Link>
          </div>
        </div>
      </div>

      <div className="tarjeta-formulario">
        <h2>Carga del equipo</h2>
        {data.tecnicos.length === 0 ? (
          <p>No hay técnicos asociados a mi área.</p>
        ) : (
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Técnico</th>
                <th style={{ textAlign: "right" }}>Abiertos</th>
                <th style={{ textAlign: "right" }}>Vencidos</th>
                <th>Carga</th>
              </tr>
            </thead>
            <tbody>
              {data.tecnicos.map((t) => (
                <tr key={t.id_usuario}>
                  <td>{t.nombre}</td>
                  <td style={{ textAlign: "right" }}>{t.asignados_abiertos}</td>
                  <td style={{ textAlign: "right", color: t.vencidos > 0 ? "#b91c1c" : undefined }}>{t.vencidos}</td>
                  <td>{t.asignados_abiertos >= 10 ? "Alta" : t.asignados_abiertos >= 5 ? "Media" : "Normal"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
