"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  RefreshCw,
  AlertTriangle,
  Users,
  ShieldAlert,
  Shield,
  Layers,
  Database,
  CheckCircle2,
  ChevronRight,
  UserX,
} from "@/shared/components/ui/Iconos";

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

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}

const ACCESOS_RAPIDOS = [
  {
    href: "/plataforma/seguridad/usuarios",
    titulo: "Gestión de usuarios",
    descripcion: "Cuentas, estados de activación y seguridad",
    icono: Users,
    color: "#2563eb",
    bgColor: "#eff6ff",
  },
  {
    href: "/plataforma/seguridad/perfiles",
    titulo: "Perfiles y permisos",
    descripcion: "Matriz RBAC institucional y capacidades",
    icono: Shield,
    color: "#4f46e5",
    bgColor: "#eef2ff",
  },
  {
    href: "/plataforma/operacion/menu",
    titulo: "Estructura del menú",
    descripcion: "Jerarquía y opciones visibles por perfil",
    icono: Layers,
    color: "#0891b2",
    bgColor: "#ecfeff",
  },
  {
    href: "/plataforma/operacion/salud-sistema",
    titulo: "Salud del sistema",
    descripcion: "Conexiones PostgreSQL, cola y tareas",
    icono: Database,
    color: "#059669",
    bgColor: "#f0fdf4",
  },
  {
    href: "/plataforma/seguridad/seguridad-logs",
    titulo: "Registros de seguridad",
    descripcion: "Auditoría de eventos y bitácora de accesos",
    icono: ShieldAlert,
    color: "#d97706",
    bgColor: "#fffbeb",
  },
  {
    href: "/plataforma/reportes/operativos",
    titulo: "Indicadores operativos y SLA",
    descripcion: "Métricas de servicio, tiempos y cumplimiento",
    icono: FileText,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
  },
];

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

  if (cargando) {
    return (
      <div className="vista-contenedor" style={{ padding: "40px 28px", textAlign: "center" }}>
        <p style={{ color: "#64748b", fontSize: 14 }}>Cargando panel de administración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vista-contenedor" style={{ padding: "24px 28px" }}>
        <p role="alert" className="mensaje-error">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const totalTickets = data.ticketsPorTipo.reduce((acc, t) => acc + t.abiertos, 0);

  return (
    <div className="vista-contenedor">
      {/* Cabecera ejecutiva */}
      <div className="cabecera-pagina" style={{ marginBottom: 24 }}>
        <div>
          <h1>Panel de administración</h1>
          <p>Estado global de la mesa de servicio, los cambios en curso, las identidades y los accesos.</p>
        </div>
      </div>

      {/* Grid de KPIs principales */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* KPI 1: Tickets Abiertos */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "16px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Tickets abiertos
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={16} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 10 }}>
            {data.kpis.tickets_abiertos}
          </div>
          <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
            Mesa de servicio activa
          </span>
        </div>

        {/* KPI 2: SLA Vencidos */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: `1px solid ${data.kpis.sla_vencidos > 0 ? "#fecaca" : "#e2e8f0"}`,
            borderRadius: 12,
            padding: "16px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: data.kpis.sla_vencidos > 0 ? "#991b1b" : "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
              SLA vencidos
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: data.kpis.sla_vencidos > 0 ? "#fef2f2" : "#f8fafc", color: data.kpis.sla_vencidos > 0 ? "#dc2626" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: data.kpis.sla_vencidos > 0 ? "#dc2626" : "#0f172a", marginTop: 10 }}>
            {data.kpis.sla_vencidos}
          </div>
          <span style={{ fontSize: 11.5, color: data.kpis.sla_vencidos > 0 ? "#dc2626" : "#16a34a", fontWeight: 600, marginTop: 4 }}>
            {data.kpis.sla_vencidos > 0 ? "Atención requerida" : "Todos en objetivo SLA"}
          </span>
        </div>

        {/* KPI 3: Cambios en Curso */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "16px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Cambios en curso
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#eef2ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RefreshCw size={16} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 10 }}>
            {data.kpis.cambios_activos}
          </div>
          <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
            RFCs en evaluación o ejecución
          </span>
        </div>

        {/* KPI 4: Problemas Abiertos */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "16px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Problemas
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 10 }}>
            {data.kpis.problemas_abiertos}
          </div>
          <span style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
            Investigaciones de causa raíz
          </span>
        </div>

        {/* KPI 5: Usuarios Activos */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "16px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Usuarios activos
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", marginTop: 10 }}>
            {data.kpis.usuarios_activos}
          </div>
          <span style={{ fontSize: 11.5, color: "#16a34a", fontWeight: 600, marginTop: 4 }}>
            Identidades operativas
          </span>
        </div>

        {/* KPI 6: Accesos Fallidos */}
        <div
          style={{
            backgroundColor: "#ffffff",
            border: `1px solid ${data.kpis.accesos_fallidos > 0 ? "#fed7aa" : "#e2e8f0"}`,
            borderRadius: 12,
            padding: "16px 18px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: data.kpis.accesos_fallidos > 0 ? "#9a3412" : "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Accesos fallidos (7d)
            </span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: data.kpis.accesos_fallidos > 0 ? "#fff7ed" : "#f8fafc", color: data.kpis.accesos_fallidos > 0 ? "#ea580c" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: data.kpis.accesos_fallidos > 0 ? "#c2410c" : "#0f172a", marginTop: 10 }}>
            {data.kpis.accesos_fallidos}
          </div>
          <span style={{ fontSize: 11.5, color: data.kpis.accesos_fallidos > 0 ? "#ea580c" : "#16a34a", fontWeight: 600, marginTop: 4 }}>
            {data.kpis.accesos_fallidos > 0 ? "Intentos registrados" : "Sin incidentes de acceso"}
          </span>
        </div>
      </div>

      {/* Fila Media: Accesos Rápidos (Grid de Tarjetas) y Tickets Abiertos por Tipo */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        {/* Accesos Rápidos */}
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0f172a" }}>Accesos rápidos</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
              Navegación directa a módulos de configuración y control operativo.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {ACCESOS_RAPIDOS.map((item) => {
              const Icono = item.icono;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.borderColor = "#93c5fd";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      backgroundColor: item.bgColor,
                      color: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icono size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.titulo}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.descripcion}
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tickets Abiertos por Tipo con Barras de Distribución */}
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0f172a" }}>Tickets abiertos por tipo</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
              Distribución de la carga de trabajo activa según tipología de ticket.
            </p>
          </div>

          {data.ticketsPorTipo.length === 0 ? (
            <div style={{ padding: "30px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
              <CheckCircle2 size={24} style={{ color: "#16a34a", margin: "0 auto 6px auto" }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: "#334155", margin: 0 }}>No hay tickets abiertos</p>
              <p style={{ fontSize: 11.5, color: "#64748b", margin: "4px 0 0 0" }}>La mesa de servicio no tiene peticiones pendientes.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {data.ticketsPorTipo.map((t, idx) => {
                const porcentaje = totalTickets > 0 ? Math.round((t.abiertos / totalTickets) * 100) : 0;
                const colorBarra = idx === 0 ? "#2563eb" : idx === 1 ? "#d97706" : idx === 2 ? "#7c3aed" : "#059669";
                return (
                  <div key={t.tipo}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: colorBarra }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{t.tipo}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{porcentaje}%</span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#0f172a",
                            backgroundColor: "#f1f5f9",
                            padding: "2px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {t.abiertos}
                        </span>
                      </div>
                    </div>
                    {/* Barra de progreso */}
                    <div style={{ width: "100%", height: 8, backgroundColor: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${porcentaje}%`,
                          height: "100%",
                          backgroundColor: colorBarra,
                          borderRadius: 999,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fila Inferior: Accesos Fallidos Recientes y Usuarios sin Perfil */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 20,
        }}
      >
        {/* Accesos Fallidos Recientes */}
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0f172a" }}>Accesos fallidos recientes</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
              Intentos de autenticación no autorizados o credenciales erróneas.
            </p>
          </div>

          {data.accesosFallidos.length === 0 ? (
            <div style={{ padding: "26px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
              <CheckCircle2 size={22} style={{ color: "#16a34a", margin: "0 auto 6px auto" }} />
              <p style={{ fontSize: 12.5, fontWeight: 600, color: "#334155", margin: 0 }}>Sin intentos fallidos registrados</p>
              <p style={{ fontSize: 11.5, color: "#64748b", margin: "2px 0 0 0" }}>No hay alertas de seguridad en los últimos 7 días.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.accesosFallidos.map((a, i) => (
                <div
                  key={`${a.fecha}-${i}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fee2e2",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ShieldAlert size={14} />
                    </div>
                    <div>
                      <strong style={{ fontSize: 12.5, color: "#991b1b" }}>{a.correo_intento ?? "—"}</strong>
                      <div style={{ fontSize: 11, color: "#7f1d1d", marginTop: 2 }}>IP: {a.ip ?? "—"}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, color: "#991b1b", fontWeight: 600, fontFamily: "monospace" }}>
                    {fechaHora(a.fecha)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usuarios sin Perfil Asignado */}
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0f172a" }}>Usuarios sin perfil asignado</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
              Identidades activas que requieren asignación de rol en el sistema RBAC.
            </p>
          </div>

          {data.usuariosSinPerfil.length === 0 ? (
            <div style={{ padding: "26px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
              <CheckCircle2 size={22} style={{ color: "#16a34a", margin: "0 auto 6px auto" }} />
              <p style={{ fontSize: 12.5, fontWeight: 600, color: "#334155", margin: 0 }}>Gobernanza completa de identidades</p>
              <p style={{ fontSize: 11.5, color: "#64748b", margin: "2px 0 0 0" }}>Todos los usuarios activos tienen al menos un perfil asignado.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.usuariosSinPerfil.map((u) => (
                <div
                  key={u.id_usuario}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UserX size={14} />
                    </div>
                    <div>
                      <Link
                        href={`/plataforma/seguridad/usuarios/${u.id_usuario}`}
                        style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", textDecoration: "none" }}
                      >
                        {u.nombre}
                      </Link>
                      <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>{u.correo_electronico}</div>
                    </div>
                  </div>
                  <Link
                    href={`/plataforma/seguridad/usuarios/${u.id_usuario}`}
                    className="boton-mini"
                    style={{ textDecoration: "none" }}
                  >
                    Asignar perfil
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
