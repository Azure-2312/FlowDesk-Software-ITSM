"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PanelAdministrador {
  kpis: {
    tickets_abiertos: number;
    sla_vencidos: number;
    cambios_activos: number;
    problemas_abiertos: number;
    usuarios_activos: number;
    accesos_fallidos: number;
  };
  ticketsPorTipo: { tipo: string; abiertos: number }[];
  accesosFallidos: { correo_intento: string | null; ip: string | null; fecha: string }[];
  usuariosSinPerfil: { id_usuario: number; nombre: string; correo_electronico: string }[];
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

export default function VistaPanelAdministrador() {
  const [data, setData] = useState<PanelAdministrador | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/operacion/paneles/administrador?_t=${Date.now()}`);
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
        <h1>Panel de administración</h1>
        <p>Estado global de la mesa de servicio, los cambios en curso, las identidades y los accesos.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Tickets abiertos" valor={data.kpis.tickets_abiertos} />
        <Kpi titulo="SLA vencidos" valor={data.kpis.sla_vencidos} color={data.kpis.sla_vencidos > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Cambios en curso" valor={data.kpis.cambios_activos} />
        <Kpi titulo="Problemas" valor={data.kpis.problemas_abiertos} />
        <Kpi titulo="Usuarios activos" valor={data.kpis.usuarios_activos} />
        <Kpi titulo="Accesos fallidos (7d)" valor={data.kpis.accesos_fallidos} color={data.kpis.accesos_fallidos > 0 ? "#b45309" : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Accesos rápidos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/plataforma/seguridad/usuarios" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Gestión de usuarios</Link>
            <Link href="/plataforma/seguridad/perfiles" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Perfiles y permisos</Link>
            <Link href="/plataforma/operacion/menu" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Estructura del menú</Link>
            <Link href="/plataforma/operacion/salud-sistema" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Salud del sistema</Link>
            <Link href="/plataforma/seguridad/seguridad-logs" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Registros de seguridad</Link>
            <Link href="/plataforma/reportes/operativos" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Indicadores operativos y SLA</Link>
          </div>
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Tickets abiertos por tipo</h2>
          {data.ticketsPorTipo.length === 0 ? (
            <p>No hay tickets abiertos.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.ticketsPorTipo.map((t) => (
                <li key={t.tipo} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                  <span>{t.tipo}</span>
                  <strong>{t.abiertos}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Accesos fallidos recientes</h2>
          {data.accesosFallidos.length === 0 ? (
            <p>Sin intentos fallidos registrados.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.accesosFallidos.map((a, i) => (
                <li key={`${a.fecha}-${i}`} style={{ fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                  <strong>{a.correo_intento ?? "—"}</strong>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{fechaHora(a.fecha)} · IP {a.ip ?? "—"}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Usuarios sin perfil asignado</h2>
          {data.usuariosSinPerfil.length === 0 ? (
            <p>Todos los usuarios activos tienen al menos un perfil.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {data.usuariosSinPerfil.map((u) => (
                <li key={u.id_usuario} style={{ fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                  <Link href={`/plataforma/seguridad/usuarios/${u.id_usuario}`} style={{ color: "#1d4ed8", fontWeight: 600 }}>{u.nombre}</Link>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{u.correo_electronico}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
