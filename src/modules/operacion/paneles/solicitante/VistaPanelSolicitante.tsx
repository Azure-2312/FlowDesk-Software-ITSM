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
  articulos: { id_articulo: number; titulo: string }[];
}

function Kpi({ titulo, valor, color, subtitulo }: { titulo: string; valor: string | number; color?: string; subtitulo?: string }) {
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

function fechaCorta(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaPanelSolicitante() {
  const [data, setData] = useState<PanelSolicitante | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarDatos() {
    setCargando(true);
    setError(null);
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
            Portal de Autoservicio & Solicitudes (ITIL v4)
          </span>
          <h1 className="titulo-pagina">Panel del solicitante</h1>
          <p className="descripcion-pagina">Estado de mis solicitudes y las guías disponibles para resolver por mi cuenta.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/plataforma/solicitudes/crear"
            className="boton-primario"
          >
            + Nueva Solicitud
          </Link>
          <button
            type="button"
            className="boton-secundario"
            onClick={cargarDatos}
            title="Actualizar panel"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: 16, marginBottom: 24 }}>
        <Kpi titulo="Tickets abiertos" valor={data.kpis.abiertos} subtitulo="En curso o en atención" />
        <Kpi titulo="En espera" valor={data.kpis.en_espera} color={data.kpis.en_espera > 0 ? "#b45309" : undefined} subtitulo="Esperando información o tercero" />
        <Kpi titulo="Resueltos (30 días)" valor={data.kpis.resueltos_30d} subtitulo="Atendidos con éxito" />
        <Kpi titulo="Fuera de plazo" valor={data.kpis.vencidos} color={data.kpis.vencidos > 0 ? "#b91c1c" : undefined} subtitulo={data.kpis.vencidos > 0 ? "Requiere seguimiento" : "Sin incidencias fuera de SLA"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 16, marginBottom: 16 }}>
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
            <Link href="/plataforma/incidentes/crear" className="boton-secundario" >Registrar un incidente</Link>
            <Link href="/plataforma/servicios/catalogo?vista=explorar&tipo=incidente" className="boton-secundario" >Reportar un incidente</Link>
            <Link href="/plataforma/servicios/catalogo?vista=explorar&tipo=solicitud" className="boton-secundario" >Pedir un servicio</Link>
            <Link href="/plataforma/incidentes/mios" className="boton-secundario" >Ver mis incidentes</Link>
            <Link href="/plataforma/conocimiento/base" className="boton-secundario" >Base de conocimiento</Link>
          </div>
        </div>
      </div>

      <div>
        <div className="estado-vacio" style={{ margin: 0 }} >
          <h2>Guías que pueden ayudarte (Autoservicio)</h2>
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
