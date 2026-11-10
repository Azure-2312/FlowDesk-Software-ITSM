"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Users,
  ShieldAlert,
  Shield,
  Layers,
  Database,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Lock,
  ShieldCheck,
} from "@/shared/components/ui/Iconos";

interface LogAccesoItem {
  id_log: number;
  correo_intento: string | null;
  exitoso: boolean;
  ip: string | null;
  fecha: string;
  usuario_nombre: string | null;
}

interface LogAuditoriaItem {
  id_log: number;
  modulo: string;
  accion: string;
  descripcion: string;
  detalles: any;
  direccion_ip: string | null;
  fecha_creacion: string;
  admin_nombre: string | null;
  admin_correo: string | null;
}

interface UsuarioModificadoItem {
  id_usuario: number;
  nombre_completo: string;
  correo_electronico: string;
  celular: string | null;
  fecha_modificacion: string | null;
  fecha_creacion: string;
  modificado_por: string | null;
  perfiles_asignados: string;
}

interface UsuarioSinPerfilItem {
  id_usuario: number;
  nombre: string;
  correo_electronico: string;
  fecha_creacion: string;
}

interface PanelAdministrador {
  kpis: {
    usuarios_activos: number;
    accesos_fallidos: number;
    logins_hoy: number;
    cambios_configuracion_30d: number;
    usuarios_sin_perfil: number;
    perfiles_activos: number;
  };
  logsInicioSesion: LogAccesoItem[];
  logsAuditoriaConfiguracion: LogAuditoriaItem[];
  usuariosModificadosRecientes: UsuarioModificadoItem[];
  usuariosSinPerfil: UsuarioSinPerfilItem[];
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
    href: "/plataforma/seguridad/auditoria-sistema",
    titulo: "Auditoría de configuración",
    descripcion: "Trazabilidad de cambios hechos por administradores",
    icono: Sliders,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
  },
];

export default function VistaPanelAdministrador() {
  const [data, setData] = useState<PanelAdministrador | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPanel = async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await fetch(`/api/operacion/paneles/administrador?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setData(json);
      else setError(json.error ?? "No se pudo cargar el panel.");
    } catch {
      setError("Error de conexión al cargar el panel.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPanel();
  }, []);

  if (cargando) {
    return (
      <div className="vista-contenedor" style={{ padding: "40px 28px", textAlign: "center" }}>
        <p style={{ color: "#64748b", fontSize: 14 }}>Cargando panel de administración del sistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vista-contenedor" style={{ padding: "24px 28px" }}>
        <p role="alert" className="mensaje-error">{error}</p>
        <button type="button" onClick={cargarPanel} className="boton-primario" style={{ marginTop: 12 }}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="vista-contenedor" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Cabecera del Administrador */}
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <span className="badge-tag" style={{ display: "inline-block", marginBottom: 6, backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
            Administración del Sistema & Seguridad ITIL
          </span>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Panel de administración</h1>
          <p style={{ marginTop: 4, color: "#64748b", fontSize: 13.5 }}>
            Supervisión integral de seguridad, eventos de autenticación, trazabilidad de identidades y auditoría de cambios del sistema.
          </p>
        </div>
        <button
          type="button"
          onClick={cargarPanel}
          className="boton-secundario"
          style={{ fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          title="Actualizar panel"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* Grid de 6 KPIs estrictamente administrativos (Seguridad y Gobernanza) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
        }}
      >
        {/* KPI 1: Usuarios Activos */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Usuarios activos</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={15} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 8 }}>{data.kpis.usuarios_activos}</div>
          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginTop: 2, display: "block" }}>Cuentas operativas</span>
        </div>

        {/* KPI 2: Accesos Fallidos */}
        <div style={{ backgroundColor: "#ffffff", border: `1px solid ${data.kpis.accesos_fallidos > 0 ? "#fed7aa" : "#e2e8f0"}`, borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: data.kpis.accesos_fallidos > 0 ? "#9a3412" : "#64748b", textTransform: "uppercase" }}>Accesos fallidos (7d)</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: data.kpis.accesos_fallidos > 0 ? "#fff7ed" : "#f8fafc", color: data.kpis.accesos_fallidos > 0 ? "#ea580c" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldAlert size={15} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: data.kpis.accesos_fallidos > 0 ? "#c2410c" : "#0f172a", marginTop: 8 }}>{data.kpis.accesos_fallidos}</div>
          <span style={{ fontSize: 11, color: data.kpis.accesos_fallidos > 0 ? "#ea580c" : "#16a34a", fontWeight: 600, marginTop: 2, display: "block" }}>
            {data.kpis.accesos_fallidos > 0 ? "Alertas de autenticación" : "Sin incidentes"}
          </span>
        </div>

        {/* KPI 3: Inicios de Sesión Hoy */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Logins hoy</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={15} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 8 }}>{data.kpis.logins_hoy}</div>
          <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 600, marginTop: 2, display: "block" }}>Autenticaciones exitosas</span>
        </div>

        {/* KPI 4: Cambios de Configuración */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Cambios sistema (30d)</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "#f5f3ff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sliders size={15} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 8 }}>{data.kpis.cambios_configuracion_30d}</div>
          <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600, marginTop: 2, display: "block" }}>Ajustes por administradores</span>
        </div>

        {/* KPI 5: Usuarios sin Perfil */}
        <div style={{ backgroundColor: "#ffffff", border: `1px solid ${data.kpis.usuarios_sin_perfil > 0 ? "#fecaca" : "#e2e8f0"}`, borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: data.kpis.usuarios_sin_perfil > 0 ? "#b91c1c" : "#64748b", textTransform: "uppercase" }}>Sin perfil asignado</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: data.kpis.usuarios_sin_perfil > 0 ? "#fef2f2" : "#f8fafc", color: data.kpis.usuarios_sin_perfil > 0 ? "#dc2626" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={15} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: data.kpis.usuarios_sin_perfil > 0 ? "#dc2626" : "#0f172a", marginTop: 8 }}>{data.kpis.usuarios_sin_perfil}</div>
          <span style={{ fontSize: 11, color: data.kpis.usuarios_sin_perfil > 0 ? "#dc2626" : "#16a34a", fontWeight: 600, marginTop: 2, display: "block" }}>
            {data.kpis.usuarios_sin_perfil > 0 ? "Requieren asignación" : "Gobernanza RBAC al 100%"}
          </span>
        </div>

        {/* KPI 6: Perfiles Activos */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Perfiles de roles</span>
            <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "#ecfeff", color: "#0891b2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={15} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 8 }}>{data.kpis.perfiles_activos}</div>
          <span style={{ fontSize: 11, color: "#0891b2", fontWeight: 600, marginTop: 2, display: "block" }}>Roles institucionales</span>
        </div>
      </div>

      {/* Fila 1: Logs de Autenticación y Auditoría de Configuración del Sistema */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 16 }}>
        {/* Panel 1: Logs de Inicio de Sesión y Seguridad */}
        <div className="tarjeta-formulario" style={{ margin: 0, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0f172a" }}>Eventos de Inicio de Sesión y Accesos</h2>
              <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                Registro cronológico de intentos de autenticación exitosos y fallidos.
              </p>
            </div>
            <Link
              href="/plataforma/seguridad/seguridad-logs"
              style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Ver todos →
            </Link>
          </div>

          {data.logsInicioSesion.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>No hay eventos de acceso registrados.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.logsInicioSesion.map((log) => (
                <div
                  key={log.id_log}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    backgroundColor: log.exitoso ? "#f8fafc" : "#fef2f2",
                    border: `1px solid ${log.exitoso ? "#e2e8f0" : "#fecaca"}`,
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        backgroundColor: log.exitoso ? "#dcfce7" : "#fee2e2",
                        color: log.exitoso ? "#166534" : "#991b1b",
                        border: `1px solid ${log.exitoso ? "#bbf7d0" : "#fca5a5"}`,
                        flexShrink: 0,
                      }}
                    >
                      {log.exitoso ? "OK" : "FALLIDO"}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ color: "#0f172a", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {log.usuario_nombre || log.correo_intento || "Desconocido"}
                      </strong>
                      <span style={{ fontSize: 11, color: "#64748b" }}>
                        IP: {log.ip || "Local"} · {log.correo_intento}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace", flexShrink: 0 }}>
                    {fechaHora(log.fecha)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel 2: Logs de Auditoría de Configuración del Sistema (Admin Changes) */}
        <div className="tarjeta-formulario" style={{ margin: 0, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0f172a" }}>Cambios de Configuración del Sistema</h2>
              <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                Acciones realizadas por administradores sobre parámetros y formularios.
              </p>
            </div>
            <Link
              href="/plataforma/seguridad/auditoria-sistema"
              style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Auditoría completa →
            </Link>
          </div>

          {data.logsAuditoriaConfiguracion.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
              <CheckCircle2 size={20} style={{ color: "#16a34a", margin: "0 auto 6px auto" }} />
              <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>Sin cambios de configuración registrados.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.logsAuditoriaConfiguracion.map((aud) => (
                <div
                  key={aud.id_log}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "8px 12px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 12,
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, backgroundColor: "#e0e7ff", color: "#3730a3" }}>
                        {aud.modulo}
                      </span>
                      <strong style={{ color: "#0f172a", fontSize: 11.5 }}>{aud.admin_nombre || "Administrador"}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: 11.5, color: "#334155", lineHeight: 1.35 }}>
                      {aud.descripcion}
                    </p>
                    <span style={{ fontSize: 10.5, color: "#94a3b8" }}>IP: {aud.direccion_ip || "Local"}</span>
                  </div>
                  <span style={{ fontSize: 10.5, color: "#64748b", fontFamily: "monospace", flexShrink: 0 }}>
                    {fechaHora(aud.fecha_creacion)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fila 2: Trazabilidad de Colaboradores Modificados Recientemente & Accesos Rápidos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 16 }}>
        {/* Panel 3: Trazabilidad Reciente de Colaboradores y Perfiles */}
        <div className="tarjeta-formulario" style={{ margin: 0, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0f172a" }}>Trazabilidad de Cuentas y Colaboradores</h2>
              <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                Identidades con actualizaciones de datos de contacto o roles asignados.
              </p>
            </div>
            <Link
              href="/plataforma/seguridad/usuarios"
              style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", textDecoration: "none", whiteSpace: "nowrap" }}
            >
              Gestionar cuentas →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.usuariosModificadosRecientes.map((usr) => (
              <div
                key={usr.id_usuario}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 12px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Link
                      href={`/plataforma/seguridad/usuarios`}
                      style={{ fontSize: 12.5, fontWeight: 700, color: "#1d4ed8", textDecoration: "none" }}
                    >
                      {usr.nombre_completo}
                    </Link>
                    <span style={{ fontSize: 11, color: "#64748b" }}>({usr.correo_electronico})</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                    <strong>Celular:</strong> {usr.celular || "Sin celular"} · <strong>Roles:</strong> {usr.perfiles_asignados}
                  </div>
                  {usr.modificado_por && (
                    <div style={{ fontSize: 10.5, color: "#94a3b8" }}>
                      Modificado por: {usr.modificado_por}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10.5, color: "#64748b", fontFamily: "monospace", flexShrink: 0, marginLeft: 8 }}>
                  {fechaHora(usr.fecha_modificacion || usr.fecha_creacion)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 4: Accesos Rápidos de Gobernanza */}
        <div className="tarjeta-formulario" style={{ margin: 0, padding: 18 }}>
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0f172a" }}>Accesos Rápidos de Administración</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
              Navegación directa a módulos normativos y de seguridad.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
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
                    gap: 10,
                    padding: "10px 12px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.borderColor = "#93c5fd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: item.bgColor,
                      color: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icono size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.titulo}
                    </div>
                    <div style={{ fontSize: 10.5, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.descripcion}
                    </div>
                  </div>
                  <ChevronRight size={13} style={{ color: "#94a3b8", flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
