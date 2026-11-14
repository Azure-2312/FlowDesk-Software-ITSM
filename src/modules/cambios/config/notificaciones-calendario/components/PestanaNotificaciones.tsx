"use client";

import React, { useState } from "react";
import { Bell, Trash2, Edit2, Plus, ArrowRight } from "@/shared/components/ui/Iconos";

export interface NotificacionElemento {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  tiene_boton?: boolean;
  boton_texto?: string;
  boton_enlace?: string;
  icono?: string;
}

interface PestanaNotificacionesProps {
  config: any;
  onChange: (nuevoConfig: any) => void;
  usuarios?: any[];
  departamentos?: any[];
}

const NOTIFICACIONES_DEFECTO: NotificacionElemento[] = [
  {
    id: "notif_rfc_solicitada",
    nombre: "RFC Solicitada",
    descripcion: "Se ha registrado formalmente una nueva solicitud de cambio en el sistema.",
    activo: true,
    tiene_boton: true,
    boton_texto: "Ver Solicitud",
    boton_enlace: "/plataforma/cambios",
    icono: "📥",
  },
  {
    id: "notif_evaluacion_cab",
    nombre: "Evaluación Técnica CAB Requerida",
    descripcion: "El cambio requiere análisis y dictamen por parte del comité evaluador.",
    activo: true,
    tiene_boton: true,
    boton_texto: "Evaluar RFC",
    boton_enlace: "/plataforma/cambios",
    icono: "⚖️",
  },
  {
    id: "notif_dictamen_emitido",
    nombre: "Dictamen Emitido",
    descripcion: "La solicitud de cambio ha sido aprobada o rechazada por la autoridad correspondiente.",
    activo: true,
    tiene_boton: true,
    boton_texto: "Ver Dictamen",
    boton_enlace: "/plataforma/cambios",
    icono: "✅",
  },
  {
    id: "notif_ventana_abierta",
    nombre: "Ventana de Ejecución Abierta",
    descripcion: "La ventana de trabajo autorizada se encuentra en curso para los especialistas técnicos.",
    activo: true,
    tiene_boton: true,
    boton_texto: "Ir al Ticket",
    boton_enlace: "/plataforma/cambios",
    icono: "🚀",
  },
  {
    id: "notif_rollback",
    nombre: "Alerta de Rollback / Contingencia",
    descripcion: "Alerta urgente en la plataforma: se ha activado la marcha atrás de la intervención.",
    activo: true,
    tiene_boton: true,
    boton_texto: "Ver Incidencia",
    boton_enlace: "/plataforma/cambios",
    icono: "⚠️",
  },
  {
    id: "notif_pir_pendiente",
    nombre: "Revisión Post-Implementación (PIR)",
    descripcion: "Recordatorio institucional para registrar causas de fallo, downtime y lecciones aprendidas.",
    activo: true,
    tiene_boton: true,
    boton_texto: "Completar PIR",
    boton_enlace: "/plataforma/cambios",
    icono: "📋",
  },
];

export function PestanaNotificaciones({ config, onChange }: PestanaNotificacionesProps) {
  // Manejo de la lista de notificaciones (compatibilidad con eventos o lista directa)
  const notificacionesList: NotificacionElemento[] =
    config.notificaciones && config.notificaciones.length > 0
      ? config.notificaciones
      : config.eventos && config.eventos.length > 0
      ? config.eventos.map((e: any) => ({
          id: e.evento || e.id || `notif_${Math.random()}`,
          nombre: e.nombre || "Notificación del Sistema",
          descripcion: e.descripcion || "",
          activo: e.activo !== false,
          tiene_boton: Boolean(e.tiene_boton || e.boton_texto),
          boton_texto: e.boton_texto || "Ver detalles",
          boton_enlace: e.boton_enlace || "/plataforma/cambios",
          icono: e.icono || "🔔",
        }))
      : NOTIFICACIONES_DEFECTO;

  const notificacionesPlataforma = config.notificaciones_plataforma ?? {
    activo: true,
    sonido: true,
    badge_rojo: true,
    comunicado_interrupcion: true,
  };

  // Estados de modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<Omit<NotificacionElemento, "id">>({
    nombre: "",
    descripcion: "",
    activo: true,
    tiene_boton: false,
    boton_texto: "Ver más",
    boton_enlace: "/plataforma/cambios",
    icono: "🔔",
  });

  const actualizarOpcionPlataforma = (campo: string, valor: boolean) => {
    const nuevo = {
      ...config,
      notificaciones_plataforma: {
        ...notificacionesPlataforma,
        [campo]: valor,
      },
    };
    onChange(nuevo);
  };

  const alternarActivo = (id: string) => {
    const nuevas = notificacionesList.map((n) => (n.id === id ? { ...n, activo: !n.activo } : n));
    onChange({
      ...config,
      notificaciones: nuevas,
      eventos: nuevas.map((n) => ({ evento: n.id, nombre: n.nombre, descripcion: n.descripcion, activo: n.activo })),
    });
  };

  const eliminarNotificacion = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta notificación?")) {
      const nuevas = notificacionesList.filter((n) => n.id !== id);
      onChange({
        ...config,
        notificaciones: nuevas,
        eventos: nuevas.map((n) => ({ evento: n.id, nombre: n.nombre, descripcion: n.descripcion, activo: n.activo })),
      });
    }
  };

  const abrirModalCrear = () => {
    setEditandoId(null);
    setFormulario({
      nombre: "",
      descripcion: "",
      activo: true,
      tiene_boton: false,
      boton_texto: "Ver detalles",
      boton_enlace: "/plataforma/cambios",
      icono: "🔔",
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (notif: NotificacionElemento) => {
    setEditandoId(notif.id);
    setFormulario({
      nombre: notif.nombre,
      descripcion: notif.descripcion,
      activo: notif.activo,
      tiene_boton: Boolean(notif.tiene_boton),
      boton_texto: notif.boton_texto || "Ver detalles",
      boton_enlace: notif.boton_enlace || "/plataforma/cambios",
      icono: notif.icono || "🔔",
    });
    setModalAbierto(true);
  };

  const guardarModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formulario.nombre.trim()) {
      alert("Por favor ingresa un nombre para la notificación.");
      return;
    }

    let nuevas: NotificacionElemento[];
    if (editandoId) {
      nuevas = notificacionesList.map((n) =>
        n.id === editandoId
          ? {
              ...n,
              nombre: formulario.nombre,
              descripcion: formulario.descripcion,
              activo: formulario.activo,
              tiene_boton: formulario.tiene_boton,
              boton_texto: formulario.tiene_boton ? formulario.boton_texto : undefined,
              boton_enlace: formulario.tiene_boton ? formulario.boton_enlace : undefined,
            }
          : n
      );
    } else {
      const nuevoItem: NotificacionElemento = {
        id: `notif_${Date.now()}`,
        nombre: formulario.nombre,
        descripcion: formulario.descripcion,
        activo: formulario.activo,
        tiene_boton: formulario.tiene_boton,
        boton_texto: formulario.tiene_boton ? formulario.boton_texto : undefined,
        boton_enlace: formulario.tiene_boton ? formulario.boton_enlace : undefined,
        icono: formulario.icono || "🔔",
      };
      nuevas = [...notificacionesList, nuevoItem];
    }

    onChange({
      ...config,
      notificaciones: nuevas,
      eventos: nuevas.map((n) => ({ evento: n.id, nombre: n.nombre, descripcion: n.descripcion, activo: n.activo })),
    });
    setModalAbierto(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* 1. Tarjeta Resumen: Notificaciones en Plataforma (In-App) */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          padding: "18px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Centro de Notificaciones en Plataforma
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
              Las alertas se envían de forma instantánea a la campana y bandeja interna de cada usuario en FlowDesk.
            </p>
          </div>
        </div>

        {/* 3 Opciones Rápidas */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid #f1f5f9",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#1e293b", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={notificacionesPlataforma.badge_rojo}
              onChange={(e) => actualizarOpcionPlataforma("badge_rojo", e.target.checked)}
            />
            <span>Mostrar distintivo rojo (badge) en la campana</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#1e293b", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={notificacionesPlataforma.sonido}
              onChange={(e) => actualizarOpcionPlataforma("sonido", e.target.checked)}
            />
            <span>Reproducir sonido discreto al recibir notificación</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#1e293b", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={notificacionesPlataforma.comunicado_interrupcion}
              onChange={(e) => actualizarOpcionPlataforma("comunicado_interrupcion", e.target.checked)}
            />
            <span>Avisar interrupción a usuarios de áreas afectadas</span>
          </label>
        </div>
      </div>

      {/* 2. Listado y Gestión de Notificaciones del Sistema (CRUD) */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Notificaciones de la Plataforma
            </h4>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
              Crea, edita o elimina las notificaciones simples que emitirá el sistema:
            </p>
          </div>

          <button
            type="button"
            onClick={abrirModalCrear}
            style={{
              padding: "7px 14px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <Plus size={15} />
            Nueva Notificación
          </button>
        </div>

        {/* Lista de Notificaciones */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notificacionesList.map((notif) => (
            <div
              key={notif.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                backgroundColor: notif.activo ? "#ffffff" : "#f8fafc",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 20 }}>{notif.icono || "🔔"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: notif.activo ? "#0f172a" : "#94a3b8" }}>
                      {notif.nombre}
                    </span>
                    {notif.tiene_boton && notif.boton_texto && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 4,
                          backgroundColor: "#eff6ff",
                          color: "#1d4ed8",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        Botón: {notif.boton_texto} <ArrowRight size={10} />
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0 0" }}>
                    {notif.descripcion || "Sin descripción"}
                  </p>
                </div>
              </div>

              {/* Acciones: Activar/Inactivar, Editar, Eliminar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => alternarActivo(notif.id)}
                  style={{
                    backgroundColor: notif.activo ? "#16a34a" : "#cbd5e1",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 12,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  title={notif.activo ? "Desactivar notificación" : "Activar notificación"}
                >
                  {notif.activo ? "Activo ✓" : "Inactivo"}
                </button>

                <button
                  type="button"
                  onClick={() => abrirModalEditar(notif)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#f8fafc",
                    color: "#334155",
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  title="Editar notificación"
                >
                  <Edit2 size={13} /> Editar
                </button>

                <button
                  type="button"
                  onClick={() => eliminarNotificacion(notif.id)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: "1px solid #fecaca",
                    backgroundColor: "#fef2f2",
                    color: "#dc2626",
                    fontSize: 11.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  title="Eliminar notificación"
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Crear / Editar Notificación */}
      {modalAbierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 10,
              padding: 24,
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>
              {editandoId ? "Editar Notificación" : "Nueva Notificación"}
            </h3>

            <form onSubmit={guardarModal} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Nombre de la Notificación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Aviso de Actualización del Sistema"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 13,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                  Descripción o Mensaje *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Mensaje que se proyectará a los usuarios en la campana..."
                  value={formulario.descripcion}
                  onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 13,
                  }}
                />
              </div>

              {/* Botón de acción opcional */}
              <div style={{ backgroundColor: "#f8fafc", padding: "10px 14px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: "#1e293b", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formulario.tiene_boton}
                    onChange={(e) => setFormulario({ ...formulario, tiene_boton: e.target.checked })}
                  />
                  <span>¿Agregar botón de acción en la notificación?</span>
                </label>

                {formulario.tiene_boton && (
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 2 }}>
                        Texto del Botón
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Ver Detalles"
                        value={formulario.boton_texto}
                        onChange={(e) => setFormulario({ ...formulario, boton_texto: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: 12,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 2 }}>
                        Enlace o Ruta de Destino
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: /plataforma/cambios"
                        value={formulario.boton_enlace}
                        onChange={(e) => setFormulario({ ...formulario, boton_enlace: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                          fontSize: 12,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontSize: 12.5,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "7px 18px",
                    borderRadius: 6,
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {editandoId ? "Actualizar" : "Crear Notificación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
