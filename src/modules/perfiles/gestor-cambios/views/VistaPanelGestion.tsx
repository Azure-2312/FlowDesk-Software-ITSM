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

function Kpi({ titulo, valor, color }: { titulo: string; valor: number; color?: string }) {
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

export default function VistaPanelGestion() {
  const [data, setData] = useState<Panel | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/gestor-cambios/panel?_t=${Date.now()}`);
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
        <h1>Panel de gestión de cambios</h1>
        <p>RFC por evaluar, autorizaciones pendientes, cambios de hoy, conflictos y PIR vencidas.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Por evaluar" valor={data.kpis.por_evaluar} color={data.kpis.por_evaluar > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Autorizaciones pendientes" valor={data.kpis.autorizaciones_pendientes} />
        <Kpi titulo="Cambios de hoy" valor={data.kpis.cambios_hoy} />
        <Kpi titulo="Conflictos" valor={data.kpis.conflictos} color={data.kpis.conflictos > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="PIR vencidas" valor={data.kpis.pir_vencidas} color={data.kpis.pir_vencidas > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Emergencias abiertas" valor={data.kpis.emergencias_abiertas} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Accesos rápidos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/plataforma/gestor-cambios/evaluacion" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Bandeja de evaluación</Link>
            <Link href="/plataforma/gestor-cambios/autorizaciones" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Autorizaciones</Link>
            <Link href="/plataforma/gestor-cambios/conflictos" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Conflictos y capacidad</Link>
            <Link href="/plataforma/gestor-cambios/pir" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Revisión post-implementación</Link>
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
