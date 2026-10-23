"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Panel {
  kpis: {
    total_activos: number;
    garantias_por_vencer: number;
    sobreuso_licencias: number;
    inexactitudes_abiertas: number;
    campanas_activas: number;
    actas_pendientes: number;
  };
  garantiasPorVencer: { id_activo: number; codigo_patrimonial: string; tipo_activo: string; marca: string; modelo: string; fecha_fin_garantia: string; dias_restantes: number }[];
  campanasActivas: { id_campana: number; codigo: string; nombre: string; alcance: string | null; fecha_fin: string | null; estado: string; items: number; verificados: number }[];
}

function Kpi({ titulo, valor, color }: { titulo: string; valor: number; color?: string }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? "#0f172a", marginTop: 6 }}>{valor}</div>
    </div>
  );
}

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaPanelGestorActivos() {
  const [data, setData] = useState<Panel | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/activos/panel?_t=${Date.now()}`);
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
        <h1>Panel de activos y CMDB</h1>
        <p>Garantías por vencer, sobreuso de licencias, inexactitudes de CMDB, campañas activas y actas pendientes.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Activos totales" valor={data.kpis.total_activos} />
        <Kpi titulo="Garantías por vencer" valor={data.kpis.garantias_por_vencer} color={data.kpis.garantias_por_vencer > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Licencias en sobreuso" valor={data.kpis.sobreuso_licencias} color={data.kpis.sobreuso_licencias > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Inexactitudes CMDB" valor={data.kpis.inexactitudes_abiertas} color={data.kpis.inexactitudes_abiertas > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Campañas activas" valor={data.kpis.campanas_activas} />
        <Kpi titulo="Actas pendientes" valor={data.kpis.actas_pendientes} color={data.kpis.actas_pendientes > 0 ? "#b45309" : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Accesos rápidos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/plataforma/activos/importacion" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Importación masiva</Link>
            <Link href="/plataforma/activos/asignaciones" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Asignaciones y actas</Link>
            <Link href="/plataforma/activos/licencias/cumplimiento" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Cumplimiento de licencias</Link>
            <Link href="/plataforma/cmdb/auditoria" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Auditoría de CMDB</Link>
          </div>
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Garantías por vencer</h2>
          {data.garantiasPorVencer.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>No hay garantías próximas a vencer.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.garantiasPorVencer.map((g) => (
                <li key={g.id_activo} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                  <strong>{g.codigo_patrimonial}</strong> · {g.tipo_activo} {g.marca} {g.modelo}
                  <div style={{ fontSize: 11.5, color: Number(g.dias_restantes) < 0 ? "#b91c1c" : "#b45309", marginTop: 2 }}>
                    Vence {fecha(g.fecha_fin_garantia)} ({Math.round(Number(g.dias_restantes))} días)
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Campañas activas</h2>
          {data.campanasActivas.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>No hay campañas de inventario abiertas.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.campanasActivas.map((c) => (
                <li key={c.id_campana} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                  <strong>{c.codigo}</strong> · {c.nombre}
                  <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>
                    {c.verificados}/{c.items} verificados · cierra {fecha(c.fecha_fin)}
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
