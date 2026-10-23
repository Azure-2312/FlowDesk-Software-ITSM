"use client";

import { useEffect, useState } from "react";

interface LogItem {
  id_log: number;
  id_usuario: number;
  usuario_nombre: string;
  usuario_correo: string;
  modulo: string;
  accion: string;
  descripcion: string;
  detalles: any;
  direccion_ip: string;
  fecha_creacion: string;
}

export default function PaginaAuditoriaSistema() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroModulo, setFiltroModulo] = useState("");
  const [filtroAccion, setFiltroAccion] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [logSeleccionado, setLogSeleccionado] = useState<LogItem | null>(null);

  async function cargarLogs() {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtroModulo) params.set("modulo", filtroModulo);
      if (filtroAccion) params.set("accion", filtroAccion);
      if (fechaDesde) params.set("fecha_desde", fechaDesde);
      if (fechaHasta) params.set("fecha_hasta", fechaHasta);
      if (busqueda.trim()) params.set("buscar", busqueda.trim());

      const res = await fetch(`/api/seguridad/auditoria?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo cargar la bitácora de auditoría.");
        return;
      }
      setLogs(data.logs || []);
    } catch {
      setError("Error de conexión al cargar la bitácora.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarLogs();
  }, [filtroModulo, filtroAccion, fechaDesde, fechaHasta]);

  function exportarCSV() {
    if (logs.length === 0) return;
    const encabezados = ["ID", "Fecha", "Usuario", "Correo", "Modulo", "Accion", "Descripcion", "IP"];
    const filas = logs.map((l) => [
      l.id_log,
      `"${new Date(l.fecha_creacion).toISOString()}"`,
      `"${(l.usuario_nombre || "").replace(/"/g, '""')}"`,
      `"${(l.usuario_correo || "").replace(/"/g, '""')}"`,
      `"${(l.modulo || "").replace(/"/g, '""')}"`,
      `"${(l.accion || "").replace(/"/g, '""')}"`,
      `"${(l.descripcion || "").replace(/"/g, '""')}"`,
      `"${l.direccion_ip || "127.0.0.1"}"`,
    ]);
    const contenido = "\uFEFF" + [encabezados.join(";"), ...filas.map((f) => f.join(";"))].join("\r\n");
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `auditoria_sistema_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Bitácora de Auditoría Integral del Sistema (Audit Trail)</h1>
          <p className="subtitulo">
            Registro cronológico inmutable de todas las acciones de configuración, modificaciones de parámetros, SLAs, altas y eventos de seguridad ejecutados en la plataforma.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="boton-secundario"
            onClick={exportarCSV}
            disabled={logs.length === 0}
            style={{ fontSize: 13, padding: "8px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar CSV
          </button>
          <button
            className="boton-mini"
            onClick={cargarLogs}
            disabled={cargando}
            title="Actualizar bitácora"
            aria-label="Actualizar bitácora"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 10px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
        <input
          type="text"
          className="input-base"
          placeholder="Buscar descripción o usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") cargarLogs(); }}
          style={{ fontSize: 13 }}
        />

        <select
          className="input-base"
          value={filtroModulo}
          onChange={(e) => setFiltroModulo(e.target.value)}
          style={{ fontSize: 13 }}
        >
          <option value="">Todos los Módulos</option>
          <option value="SERVICIOS">Catálogo y SLAs</option>
          <option value="NOTIFICACIONES">Notificaciones y Correos</option>
          <option value="CAMBIOS">Gestión de Cambios y RFC</option>
          <option value="TICKETS">Tickets y Vistas</option>
          <option value="CMDB">CMDB y Activos</option>
          <option value="ORGANIZACION">Organización y Soporte</option>
          <option value="MANTENIMIENTO">Mantenimiento y Purga</option>
          <option value="SEGURIDAD">Seguridad y Credenciales</option>
          <option value="PORTAL">Portal de Autoservicio</option>
        </select>

        <select
          className="input-base"
          value={filtroAccion}
          onChange={(e) => setFiltroAccion(e.target.value)}
          style={{ fontSize: 13 }}
        >
          <option value="">Todas las Acciones</option>
          <option value="ACTUALIZAR_SLA_SERVICIO">Actualizar SLA de Servicio</option>
          <option value="ACTUALIZAR_SERVICIO">Actualizar Servicio</option>
          <option value="CREAR_SERVICIO">Crear Servicio</option>
          <option value="ACTUALIZAR_CONFIGURACION_RFC">Actualizar Esquema RFC</option>
          <option value="ACTUALIZAR_REGLA_NOTIFICACION">Actualizar Notificación</option>
          <option value="ACTUALIZAR_AUDIENCIA_PORTAL">Actualizar Audiencia Portal</option>
          <option value="ACTUALIZAR_DEPARTAMENTO_TI">Actualizar Grupo TI</option>
          <option value="PURGA_HISTORICA_TICKETS">Purga de Datos</option>
          <option value="RESTABLECER_CONTRASENA">Restablecer Contraseña</option>
          <option value="SUSPENDER_USUARIO">Suspender Usuario</option>
          <option value="REACTIVAR_USUARIO">Reactivar Usuario</option>
          <option value="BLOQUEO_AUTOMATICO_INTENTOS">Bloqueo por Intentos</option>
        </select>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Desde:</span>
          <input
            type="date"
            className="input-base"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            style={{ fontSize: 12, flex: 1 }}
          />
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Hasta:</span>
          <input
            type="date"
            className="input-base"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            style={{ fontSize: 12, flex: 1 }}
          />
        </div>
      </div>

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Tabla de Logs */}
      {cargando ? (
        <div className="contenedor-tabla" style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
          Consultando registros de auditoría...
        </div>
      ) : logs.length === 0 ? (
        <div className="contenedor-tabla" style={{ padding: 36, textAlign: "center", color: "#64748b" }}>
          No hay eventos de auditoría registrados con los filtros seleccionados.
        </div>
      ) : (
        <div className="contenedor-tabla">
          <div style={{ overflowX: "auto" }}>
            <table className="tabla-datos">
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Fecha y Hora</th>
                  <th>Usuario Responsable</th>
                  <th>Módulo</th>
                  <th>Acción</th>
                  <th>Descripción del Evento</th>
                  <th>Dirección IP</th>
                  <th style={{ textAlign: "center", width: 80 }}>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id_log}>
                    <td style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>
                      {new Date(log.fecha_creacion).toLocaleString()}
                    </td>
                    <td>
                      <strong style={{ fontSize: 12.5, color: "#0f172a" }}>
                        {log.usuario_nombre || "Sistema"}
                      </strong>
                      <span style={{ display: "block", fontSize: 11, color: "#64748b" }}>
                        {log.usuario_correo}
                      </span>
                    </td>
                    <td>
                      <span className="badge-itil" style={{ backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}>
                        {log.modulo}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          backgroundColor: log.accion.includes("CREAR")
                            ? "#ecfdf5"
                            : log.accion.includes("PURGA") || log.accion.includes("BLOQUEO") || log.accion.includes("SUSPENDER")
                            ? "#fef2f2"
                            : "#eff6ff",
                          color: log.accion.includes("CREAR")
                            ? "#047857"
                            : log.accion.includes("PURGA") || log.accion.includes("BLOQUEO") || log.accion.includes("SUSPENDER")
                            ? "#b91c1c"
                            : "#1d4ed8",
                        }}
                      >
                        {log.accion}
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5, color: "#334155" }}>
                      {log.descripcion}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 11.5, color: "#64748b" }}>
                      {log.direccion_ip || "127.0.0.1"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="boton-mini"
                        onClick={() => setLogSeleccionado(log)}
                        title="Ver detalles del evento"
                        aria-label="Ver detalles del evento"
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 8px" }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Inspector de Detalles del Evento */}
      {logSeleccionado && (
        <div className="modal-overlay" onClick={() => setLogSeleccionado(null)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 650, backgroundColor: "#ffffff", padding: 24, borderRadius: 8 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Inspección de Registro Forense #{logSeleccionado.id_log}
                </h2>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  {new Date(logSeleccionado.fecha_creacion).toLocaleString()} | IP: {logSeleccionado.direccion_ip || "127.0.0.1"}
                </span>
              </div>
              <button
                type="button"
                className="boton-mini"
                onClick={() => setLogSeleccionado(null)}
                style={{ padding: "4px 8px" }}
              >
                Cerrar
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16, fontSize: 12.5, backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600 }}>Usuario Responsable</span>
                <strong>{logSeleccionado.usuario_nombre || "Sistema"}</strong>
                <div style={{ fontSize: 11, color: "#64748b" }}>{logSeleccionado.usuario_correo}</div>
              </div>
              <div>
                <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600 }}>Módulo y Acción</span>
                <span className="badge-itil" style={{ backgroundColor: "#e0f2fe", color: "#0369a1", marginRight: 6 }}>{logSeleccionado.modulo}</span>
                <strong>{logSeleccionado.accion}</strong>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                Descripción del Evento
              </span>
              <p style={{ margin: 0, fontSize: 13, color: "#1e293b", padding: 10, backgroundColor: "#f1f5f9", borderRadius: 6 }}>
                {logSeleccionado.descripcion}
              </p>
            </div>

            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                Detalles y Modificaciones Específicas
              </span>
              {logSeleccionado.detalles && typeof logSeleccionado.detalles === "object" && logSeleccionado.detalles.cambios ? (
                <div style={{ border: "1px solid #cbd5e1", borderRadius: 6, overflow: "hidden" }}>
                  <table className="tabla-datos" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>Parámetro / Campo</th>
                        <th>Valor Anterior</th>
                        <th>Valor Nuevo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(logSeleccionado.detalles.cambios).map(([campo, val]: [string, any]) => (
                        <tr key={campo}>
                          <td style={{ fontWeight: 600, fontFamily: "monospace" }}>{campo}</td>
                          <td style={{ color: "#dc2626", backgroundColor: "#fff5f5" }}>
                            {String(val.anterior ?? "N/A")}
                          </td>
                          <td style={{ color: "#166534", backgroundColor: "#f0fdf4", fontWeight: 600 }}>
                            {String(val.nuevo ?? "N/A")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <pre
                  style={{
                    backgroundColor: "#0f172a",
                    color: "#38bdf8",
                    padding: 12,
                    borderRadius: 6,
                    fontSize: 11.5,
                    overflowX: "auto",
                    maxHeight: 220,
                  }}
                >
                  {JSON.stringify(logSeleccionado.detalles || {}, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
