"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PanelSolicitante {
  kpis: {
    abiertos: number;
    en_espera: number;
    resueltos_30d: number;
    vencidos: number;
  };
  ticketsRecientes: {
    id_ticket: number;
    codigo_ticket: string;
    titulo: string;
    tipo: string | null;
    estado: string | null;
    color_estado: string | null;
    fecha_creacion: string;
    fecha_limite_sla: string | null;
  }[];
  activos: {
    codigo_patrimonial: string | null;
    tipo_activo: string | null;
    marca: string | null;
    modelo: string | null;
    estado_activo: string | null;
  }[];
  articulos: { id_articulo: number; titulo: string }[];
}

function Kpi({ titulo, valor, color }: { titulo: string; valor: string | number; color?: string }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? "#0f172a", marginTop: 6 }}>{valor}</div>
    </div>
  );
}

function fechaCorta(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaPanelSolicitante() {
  const [data, setData] = useState<PanelSolicitante | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/operacion/paneles/solicitante?_t=${Date.now()}`);
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
        <h1>Panel del solicitante</h1>
        <p>Estado de mis solicitudes, mis activos asignados y las guías disponibles para resolver por mi cuenta.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Tickets abiertos" valor={data.kpis.abiertos} />
        <Kpi titulo="En espera" valor={data.kpis.en_espera} color={data.kpis.en_espera > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Resueltos (30 días)" valor={data.kpis.resueltos_30d} />
        <Kpi titulo="Fuera de plazo" valor={data.kpis.vencidos} color={data.kpis.vencidos > 0 ? "#b91c1c" : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Mis últimos tickets</h2>
          {data.ticketsRecientes.length === 0 ? (
            <p>Todavía no registraste ningún ticket.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {data.ticketsRecientes.map((t) => (
                <li key={t.id_ticket} style={{ fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                  <Link href={`/plataforma/tickets/${t.id_ticket}`} style={{ fontWeight: 600, color: "#1d4ed8" }}>
                    {t.codigo_ticket}
                  </Link>{" "}
                  · {t.titulo}
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {t.tipo ?? "—"} · <span style={{ color: t.color_estado ?? undefined }}>{t.estado ?? "—"}</span> · creado {fechaCorta(t.fecha_creacion)}
                    {t.fecha_limite_sla ? ` · límite ${fechaCorta(t.fecha_limite_sla)}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Accesos rápidos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/plataforma/tickets/gestion/crear" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Registrar un ticket</Link>
            <Link href="/plataforma/tickets/catalogo?tipo=incidente" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Reportar un incidente</Link>
            <Link href="/plataforma/tickets/catalogo?tipo=solicitud" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Pedir un servicio</Link>
            <Link href="/plataforma/tickets" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Ver todos mis tickets</Link>
            <Link href="/plataforma/activos/mis-activos" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Mis activos asignados</Link>
            <Link href="/plataforma/conocimiento" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Base de conocimiento</Link>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Mis activos</h2>
          {data.activos.length === 0 ? (
            <p>No tienes activos asignados.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.activos.map((a) => (
                <li key={a.codigo_patrimonial ?? `${a.tipo_activo}-${a.modelo}`} style={{ fontSize: 13 }}>
                  <strong>{a.codigo_patrimonial ?? "Sin código"}</strong> · {[a.tipo_activo, a.marca, a.modelo].filter(Boolean).join(" ")}
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{a.estado_activo ?? "—"}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Guías que pueden ayudarte</h2>
          {data.articulos.length === 0 ? (
            <p>No hay artículos publicados todavía.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.articulos.map((a) => (
                <li key={a.id_articulo} style={{ fontSize: 13 }}>
                  <Link href={`/plataforma/conocimiento/${a.id_articulo}`} style={{ color: "#1d4ed8" }}>{a.titulo}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
