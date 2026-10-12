"use client";

import React, { useState } from "react";
import { Edit2, Send, Eye, Bell, Mail, AlertTriangle, CheckCircle2, X, Check } from "./Iconos";

interface PestanaNotificacionesProps {
  config: any;
  onChange: (nuevoConfig: any) => void;
  usuarios: any[];
  departamentos: any[];
}

export function PestanaNotificaciones({ config, onChange, usuarios, departamentos }: PestanaNotificacionesProps) {
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCanal, setFiltroCanal] = useState("todos");
  const [eventoEditando, setEventoEditando] = useState<any | null>(null);
  const [eventoPrueba, setEventoPrueba] = useState<any | null>(null);
  const [eventoVistaPrevia, setEventoVistaPrevia] = useState<any | null>(null);
  const [pruebaDestinatario, setPruebaDestinatario] = useState("");
  const [pruebaEnviada, setPruebaEnviada] = useState(false);

  const eventos: any[] = config.eventos || [];
  const comunicado = config.comunicado_interrupcion || {
    activo: true,
    momentos_envio: ["T-48h", "T-2h"],
    plantilla: "",
    audiencia: "areas_afectadas"
  };

  const eventosFiltrados = eventos.filter((e: any) => {
    const cumpleTexto = (e.nombre || "").toLowerCase().includes(filtroTexto.toLowerCase()) ||
                        (e.evento || "").toLowerCase().includes(filtroTexto.toLowerCase()) ||
                        (e.descripcion || "").toLowerCase().includes(filtroTexto.toLowerCase());
    const cumpleCanal = filtroCanal === "todos" ? true : (e.canales || []).includes(filtroCanal);
    return cumpleTexto && cumpleCanal;
  });

  const actualizarEvento = (eventoActualizado: any) => {
    const nuevos = eventos.map((e: any) => e.evento === eventoActualizado.evento ? eventoActualizado : e);
    onChange({ ...config, eventos: nuevos });
    setEventoEditando(null);
  };

  const toggleActivo = (eventoCodigo: string) => {
    const nuevos = eventos.map((e: any) => {
      if (e.evento === eventoCodigo) {
        if (e.inmutable && e.activo) {
          alert("Este evento normativo (Emergencia o fallo) no puede ser desactivado para el Gestor de Cambios.");
          return e;
        }
        return { ...e, activo: !e.activo };
      }
      return e;
    });
    onChange({ ...config, eventos: nuevos });
  };

  const actualizarComunicado = (campo: string, valor: any) => {
    onChange({
      ...config,
      comunicado_interrupcion: {
        ...comunicado,
        [campo]: valor
      }
    });
  };

  const actualizarOpcionesGenerales = (campo: string, valor: any) => {
    onChange({
      ...config,
      [campo]: valor
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Panel Superior: Comunicado de interrupción y opciones de digest */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Comunicado de interrupción */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={18} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1e293b" }}>
                Comunicado de Interrupción a Usuarios
              </h3>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={comunicado.activo}
                onChange={(e) => actualizarComunicado("activo", e.target.checked)}
              />
              Habilitado
            </label>
          </div>
          <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#64748b" }}>
            Notificación institucional enviada automáticamente a los usuarios de las áreas afectadas cuando una RFC programada indique <strong>requiere_interrupcion = Sí</strong>.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            <div>
              <span style={{ fontWeight: 500, color: "#334155" }}>Momentos de envío programados:</span>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {(comunicado.momentos_envio || []).map((momento: string, idx: number) => (
                  <span key={idx} style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                    {momento}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontWeight: 500, color: "#334155" }}>Audiencia destinataria:</span>
              <span style={{ marginLeft: 8, color: "#0f172a" }}>Usuarios de las áreas afectadas por la RFC</span>
            </div>
          </div>
        </div>

        {/* Políticas generales de despacho */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Mail size={18} color="#059669" />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1e293b" }}>
              Políticas de Despacho y Silencio
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config.no_notificar_al_autor !== false}
                onChange={(e) => actualizarOpcionesGenerales("no_notificar_al_autor", e.target.checked)}
              />
              <span>No notificar al propio autor que ejecuta la acción (evita redundancia)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!config.agrupar_resumen_diario}
                onChange={(e) => actualizarOpcionesGenerales("agrupar_resumen_diario", e.target.checked)}
              />
              <span>Agrupar notificaciones informativas de baja prioridad en resumen diario (Digest)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!config.horas_silencio?.activa}
                onChange={(e) => actualizarOpcionesGenerales("horas_silencio", {
                  ...config.horas_silencio,
                  activa: e.target.checked,
                  inicio: "22:00",
                  fin: "07:00",
                  excepto_emergencias: true
                })}
              />
              <span>Activar horas de silencio nocturnas (22:00 a 07:00, excepto cambios de Emergencia)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "12px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="text"
            placeholder="Buscar por evento, nombre o descripción..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, width: 320 }}
          />
          <select
            value={filtroCanal}
            onChange={(e) => setFiltroCanal(e.target.value)}
            style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
          >
            <option value="todos">Todos los canales</option>
            <option value="correo">Correo electrónico</option>
            <option value="sistema">Notificación en sistema</option>
            <option value="sms">SMS</option>
          </select>
        </div>
        <div style={{ fontSize: 13, color: "#64748b" }}>
          Mostrando <strong>{eventosFiltrados.length}</strong> de {eventos.length} eventos normativos
        </div>
      </div>

      {/* Cuadrícula de 32 Eventos */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
          <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Evento de Dominio</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Descripción</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Canales</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Destinatarios</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Anticipación</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "center" }}>Activo</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {eventosFiltrados.map((ev: any, idx: number) => (
              <tr key={ev.evento || idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#fbfcfe" }}>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{ev.nombre}</div>
                  <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{ev.evento}</div>
                  {ev.inmutable && (
                    <span style={{ fontSize: 10, background: "#fee2e2", color: "#b91c1c", padding: "1px 6px", borderRadius: 4, fontWeight: 600, marginTop: 2, display: "inline-block" }}>
                      Crítico ITIL (No desactivable)
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 14px", color: "#475569", maxWidth: 260 }}>
                  {ev.descripcion}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(ev.canales || []).map((c: string) => (
                      <span key={c} style={{ background: c === "correo" ? "#e0e7ff" : c === "sms" ? "#fef3c7" : "#f1f5f9", color: c === "correo" ? "#3730a3" : c === "sms" ? "#92400e" : "#334155", padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 500, textTransform: "capitalize" }}>
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(ev.destinatarios || []).slice(0, 3).map((d: string) => (
                      <span key={d} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>
                        {d.replace(/_/g, " ")}
                      </span>
                    ))}
                    {(ev.destinatarios || []).length > 3 && (
                      <span style={{ fontSize: 11, color: "#64748b", alignSelf: "center" }}>
                        +{(ev.destinatarios || []).length - 3} más
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: "10px 14px", color: "#64748b", fontSize: 12 }}>
                  {ev.anticipacion || "Inmediata"}
                </td>
                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                  <button
                    onClick={() => toggleActivo(ev.evento)}
                    style={{
                      background: ev.activo ? "#10b981" : "#cbd5e1",
                      border: "none",
                      color: "#ffffff",
                      borderRadius: 12,
                      width: 36,
                      height: 20,
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.2s"
                    }}
                    title={ev.activo ? "Desactivar evento" : "Activar evento"}
                  >
                    <div style={{
                      position: "absolute",
                      top: 2,
                      left: ev.activo ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#ffffff",
                      transition: "left 0.2s"
                    }} />
                  </button>
                </td>
                <td style={{ padding: "10px 14px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    <button
                      onClick={() => setEventoEditando({ ...ev })}
                      style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                      title="Editar configuración del evento"
                    >
                      <Edit2 size={12} /> Editar
                    </button>
                    <button
                      onClick={() => { setEventoVistaPrevia(ev); }}
                      style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#334155", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                      title="Vista previa de plantilla"
                    >
                      <Eye size={12} /> Previa
                    </button>
                    <button
                      onClick={() => { setEventoPrueba(ev); setPruebaEnviada(false); setPruebaDestinatario("admin@empresa.com"); }}
                      style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                      title="Enviar prueba"
                    >
                      <Send size={12} /> Probar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Editar Evento */}
      {eventoEditando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 24, width: 640, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>Editar Evento: {eventoEditando.nombre}</h3>
                <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>{eventoEditando.evento}</span>
              </div>
              <button onClick={() => setEventoEditando(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13 }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Descripción</label>
                <input
                  type="text"
                  value={eventoEditando.descripcion || ""}
                  onChange={(e) => setEventoEditando({ ...eventoEditando, descripcion: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Canales Habilitados</label>
                <div style={{ display: "flex", gap: 16 }}>
                  {["correo", "sistema", "sms"].map((c) => (
                    <label key={c} style={{ display: "flex", alignItems: "center", gap: 6, textTransform: "capitalize", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={(eventoEditando.canales || []).includes(c)}
                        onChange={(e) => {
                          const canales = eventoEditando.canales || [];
                          const nuevos = e.target.checked ? [...canales, c] : canales.filter((x: string) => x !== c);
                          setEventoEditando({ ...eventoEditando, canales: nuevos });
                        }}
                      />
                      {c === "correo" ? "Correo electrónico" : c === "sistema" ? "Notificación en sistema" : "SMS"}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Destinatarios Automáticos</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  {[
                    "solicitante", "implementador", "equipo_implementador", "evaluador",
                    "aprobadores_etapa_actual", "miembros_comite", "gestor_cambios",
                    "supervisor_grupo", "responsables_servicios", "gestores_area_afectadas",
                    "gestor_activos_cmdb", "direccion"
                  ].map((d) => (
                    <label key={d} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={(eventoEditando.destinatarios || []).includes(d)}
                        onChange={(e) => {
                          const dest = eventoEditando.destinatarios || [];
                          const nuevos = e.target.checked ? [...dest, d] : dest.filter((x: string) => x !== d);
                          setEventoEditando({ ...eventoEditando, destinatarios: nuevos });
                        }}
                      />
                      {d.replace(/_/g, " ")}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Plantilla de Mensaje</label>
                <input
                  type="text"
                  value={eventoEditando.plantilla || ""}
                  onChange={(e) => setEventoEditando({ ...eventoEditando, plantilla: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Tiempo de Anticipación</label>
                <input
                  type="text"
                  placeholder="Ej: Inmediata, T-48h, T-2h, 75% del plazo"
                  value={eventoEditando.anticipacion || ""}
                  onChange={(e) => setEventoEditando({ ...eventoEditando, anticipacion: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <button
                onClick={() => setEventoEditando(null)}
                style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#ffffff", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
              >
                Cancelar
              </button>
              <button
                onClick={() => actualizarEvento(eventoEditando)}
                style={{ padding: "8px 16px", border: "none", background: "#2563eb", color: "#ffffff", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vista Previa */}
      {eventoVistaPrevia && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 24, width: 560, maxWidth: "90vw", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Vista Previa de Notificación: {eventoVistaPrevia.nombre}</h3>
              <button onClick={() => setEventoVistaPrevia(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: 16, fontSize: 13 }}>
              <div style={{ marginBottom: 8, color: "#64748b" }}>
                <strong>Asunto:</strong> [Gestión de Cambios] {eventoVistaPrevia.nombre} - RFC-000142
              </div>
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, color: "#1e293b", lineHeight: 1.6 }}>
                <p>Estimado(a) usuario,</p>
                <p>Le notificamos que se ha registrado el siguiente evento sobre la solicitud de cambio:</p>
                <div style={{ background: "#ffffff", padding: 12, borderRadius: 4, border: "1px solid #e2e8f0", margin: "10px 0" }}>
                  <div><strong>Código RFC:</strong> RFC-000142</div>
                  <div><strong>Título:</strong> Actualización de firmware en switches de core</div>
                  <div><strong>Tipo de Cambio:</strong> Normal</div>
                  <div><strong>Estado:</strong> Programado</div>
                  <div><strong>Ventana prevista:</strong> 2026-10-15 22:00 a 2026-10-16 04:00</div>
                  <div><strong>Implementador:</strong> Roberto Flores</div>
                </div>
                <p style={{ fontSize: 12, color: "#64748b" }}>
                  Este es un mensaje automático generado por el Sistema de Gestión de Cambios ITIL v4.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={() => setEventoVistaPrevia(null)}
                style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#ffffff", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Enviar Prueba */}
      {eventoPrueba && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 24, width: 480, maxWidth: "90vw", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>Enviar Notificación de Prueba</h3>
              <button onClick={() => setEventoPrueba(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            {pruebaEnviada ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle2 size={40} color="#10b981" style={{ margin: "0 auto 12px auto" }} />
                <h4 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>Mensaje de prueba simulado</h4>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                  Se despachó correctamente a <strong>{pruebaDestinatario}</strong> a través de los canales configurados ({eventoPrueba.canales?.join(", ")}).
                </p>
                <button
                  onClick={() => setEventoPrueba(null)}
                  style={{ marginTop: 16, padding: "8px 16px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                >
                  Aceptar
                </button>
              </div>
            ) : (
              <div>
                <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "#64748b" }}>
                  Simular envío del evento <strong>{eventoPrueba.nombre}</strong> con datos de ejemplo para verificar el formato y la plantilla.
                </p>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>Correo destinatario de prueba</label>
                  <input
                    type="email"
                    value={pruebaDestinatario}
                    onChange={(e) => setPruebaDestinatario(e.target.value)}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button
                    onClick={() => setEventoPrueba(null)}
                    style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#ffffff", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setPruebaEnviada(true)}
                    style={{ padding: "8px 16px", border: "none", background: "#059669", color: "#ffffff", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Send size={14} /> Disparar Prueba
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
