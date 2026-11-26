"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NotificacionRegistro } from "@/shared/lib/notificacionesService";

export default function VistaNotificacionesInApp() {
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<NotificacionRegistro[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [noLeidas, setNoLeidas] = useState<number>(0);
  const [filtroSinLeer, setFiltroSinLeer] = useState<boolean>(false);
  const [pagina, setPagina] = useState<number>(1);
  const [cargando, setCargando] = useState<boolean>(true);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const limite = 15;

  async function cargarNotificaciones(p = pagina, sinLeer = filtroSinLeer) {
    setCargando(true);
    try {
      const queryParams = new URLSearchParams({
        pagina: String(p),
        limite: String(limite),
        sinLeer: sinLeer ? "1" : "0",
      });
      const res = await fetch(`/api/notificaciones?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data.notificaciones || []);
        setTotal(data.total || 0);
        setNoLeidas(data.noLeidas || 0);
      }
    } catch {
      setMensaje("Error al conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarNotificaciones(pagina, filtroSinLeer);
  }, [pagina, filtroSinLeer]);

  async function navegarYMarcar(notif: NotificacionRegistro) {
    if (!notif.leida) {
      fetch(`/api/notificaciones/${notif.id}/leer`, { method: "PUT" }).catch(() => {});
      setNoLeidas((prev) => Math.max(0, prev - 1));
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n))
      );
    }
    router.push(notif.url_destino);
  }

  async function marcarUnaLeida(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    try {
      await fetch(`/api/notificaciones/${id}/leer`, { method: "PUT" });
      setNoLeidas((prev) => Math.max(0, prev - 1));
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch {
      // Error
    }
  }

  async function marcarTodasLeidas() {
    try {
      await fetch("/api/notificaciones", { method: "PUT" });
      setNoLeidas(0);
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      setMensaje("Todas las notificaciones han sido marcadas como leídas");
      setTimeout(() => setMensaje(null), 3000);
    } catch {
      // Error
    }
  }

  const totalPaginas = Math.ceil(total / limite) || 1;

  return (
    <div className="vista-contenedor" style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      <div
        className="cabecera-seccion"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Centro de Notificaciones
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>
            Eventos operacionales y requerimientos asignados directamente en el sistema.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {noLeidas > 0 && (
            <button
              type="button"
              className="boton-secundario"
              onClick={marcarTodasLeidas}
              style={{ fontSize: 12, padding: "6px 14px", height: "auto" }}
            >
              Marcar todas como leídas
            </button>
          )}

          <div
            style={{
              display: "inline-flex",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setFiltroSinLeer(false);
                setPagina(1);
              }}
              style={{
                border: "none",
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: !filtroSinLeer ? 700 : 500,
                backgroundColor: !filtroSinLeer ? "#2563eb" : "#ffffff",
                color: !filtroSinLeer ? "#ffffff" : "#475569",
                cursor: "pointer",
              }}
            >
              Todas ({total})
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltroSinLeer(true);
                setPagina(1);
              }}
              style={{
                border: "none",
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: filtroSinLeer ? 700 : 500,
                backgroundColor: filtroSinLeer ? "#2563eb" : "#ffffff",
                color: filtroSinLeer ? "#ffffff" : "#475569",
                cursor: "pointer",
                borderLeft: "1px solid #cbd5e1",
              }}
            >
              Sin leer ({noLeidas})
            </button>
          </div>
        </div>
      </div>

      {mensaje && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {mensaje}
        </div>
      )}

      {cargando ? (
        <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
          Cargando notificaciones...
        </div>
      ) : notificaciones.length === 0 ? (
        <div
          style={{
            padding: 60,
            textAlign: "center",
            backgroundColor: "#f8fafc",
            borderRadius: 10,
            border: "1px dashed #cbd5e1",
          }}
        >
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#475569" }}>
            No hay notificaciones para mostrar
          </p>
          <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#94a3b8" }}>
            {filtroSinLeer
              ? "Está al día. No tiene eventos pendientes sin leer."
              : "Aún no ha recibido notificaciones en su bandeja."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notificaciones.map((notif) => (
            <div
              key={notif.id}
              onClick={() => navegarYMarcar(notif)}
              style={{
                padding: "14px 18px",
                borderRadius: 8,
                border: notif.leida ? "1px solid #e2e8f0" : "1px solid #bfdbfe",
                backgroundColor: notif.leida ? "#ffffff" : "#f0f7ff",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = notif.leida ? "#f8fafc" : "#e0f2fe";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = notif.leida ? "#ffffff" : "#f0f7ff";
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {!notif.leida && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#2563eb",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: notif.leida ? 600 : 700,
                      color: "#0f172a",
                    }}
                  >
                    {notif.titulo}
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: 4,
                      backgroundColor: "#e2e8f0",
                      color: "#475569",
                    }}
                  >
                    {notif.entidad_tipo}
                  </span>
                </div>
                <p style={{ margin: "4px 0", fontSize: 13, color: "#334155", lineHeight: 1.4 }}>
                  {notif.mensaje}
                </p>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {new Date(notif.creada_en).toLocaleDateString()} a las{" "}
                  {new Date(notif.creada_en).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {!notif.leida && (
                  <button
                    type="button"
                    onClick={(e) => marcarUnaLeida(e, notif.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#64748b",
                      fontSize: 12,
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 4,
                    }}
                    title="Marcar como leída"
                  >
                    Leída
                  </button>
                )}
                <span style={{ color: "#2563eb", fontSize: 13, fontWeight: 600 }}>
                  Abrir →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button
            type="button"
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            className="boton-secundario"
            style={{ fontSize: 12, padding: "4px 12px" }}
          >
             Anterior
          </button>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Página {pagina} de {totalPaginas}
          </span>
          <button
            type="button"
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            className="boton-secundario"
            style={{ fontSize: 12, padding: "4px 12px" }}
          >
            Siguiente 
          </button>
        </div>
      )}
    </div>
  );
}
