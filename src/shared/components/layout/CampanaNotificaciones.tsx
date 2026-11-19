"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NotificacionRegistro } from "@/shared/lib/notificacionesService";

export default function CampanaNotificaciones() {
  const router = useRouter();
  const [noLeidas, setNoLeidas] = useState<number>(0);
  const [abierto, setAbierto] = useState<boolean>(false);
  const [ultimas, setUltimas] = useState<NotificacionRegistro[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Carga contador de no leídas
  async function actualizarContador() {
    if (typeof document !== "undefined" && document.hidden) return;
    try {
      const res = await fetch("/api/notificaciones/contador", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setNoLeidas(data.noLeidas || 0);
      }
    } catch {
      // Ignorar fallo de red silencioso
    }
  }

  // Carga las últimas 10 para el desplegable
  async function cargarUltimas() {
    setCargando(true);
    try {
      const res = await fetch("/api/notificaciones?limite=10", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUltimas(data.notificaciones || []);
        setNoLeidas(data.noLeidas || 0);
      }
    } catch {
      // Fallo de red
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    actualizarContador();
    const intervalo = setInterval(actualizarContador, 35000); // Polling cada 35s
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    function handleClickAfuera(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    if (abierto) {
      document.addEventListener("mousedown", handleClickAfuera);
      cargarUltimas();
    }
    return () => document.removeEventListener("mousedown", handleClickAfuera);
  }, [abierto]);

  async function navegarYMarcar(notif: NotificacionRegistro) {
    if (!notif.leida) {
      fetch(`/api/notificaciones/${notif.id}/leer`, { method: "PUT" }).catch(() => {});
      setNoLeidas((prev) => Math.max(0, prev - 1));
    }
    setAbierto(false);
    router.push(notif.url_destino);
  }

  async function marcarTodas() {
    try {
      await fetch("/api/notificaciones", { method: "PUT" });
      setNoLeidas(0);
      setUltimas((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch {
      // Error
    }
  }

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        style={{
          background: abierto ? "#1e293b" : "transparent",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: "6px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: abierto ? "#60a5fa" : "#cbd5e1",
          borderRadius: 6,
          transition: "all 0.15s ease",
        }}
        title="Notificaciones del sistema"
        aria-label="Notificaciones del sistema"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {noLeidas > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              backgroundColor: "#ef4444",
              color: "#ffffff",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: "50%",
              minWidth: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            {noLeidas > 99 ? "99+" : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: 0,
            width: 360,
            maxHeight: 480,
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            boxShadow: "0 -10px 25px -5px rgba(0, 0, 0, 0.15), 0 -8px 10px -6px rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Cabecera */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f8fafc",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              Notificaciones {noLeidas > 0 && `(${noLeidas} sin leer)`}
            </span>
            {noLeidas > 0 && (
              <button
                type="button"
                onClick={marcarTodas}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* Lista desplegable */}
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 350 }}>
            {cargando && ultimas.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                Cargando...
              </div>
            ) : ultimas.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                No tiene notificaciones pendientes.
              </div>
            ) : (
              ultimas.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => navegarYMarcar(notif)}
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: notif.leida ? "#ffffff" : "#f0f7ff",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = notif.leida ? "#f8fafc" : "#e0f2fe";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notif.leida ? "#ffffff" : "#f0f7ff";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: notif.leida ? 600 : 700, color: "#1e293b" }}>
                      {notif.titulo}
                    </span>
                    {!notif.leida && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#2563eb",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 11.5, color: "#475569", lineHeight: 1.4 }}>
                    {notif.mensaje}
                  </p>
                  <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                    {new Date(notif.creada_en).toLocaleDateString()} {new Date(notif.creada_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pie */}
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid #e2e8f0",
              textAlign: "center",
              backgroundColor: "#f8fafc",
            }}
          >
            <Link
              href="/plataforma/notificaciones"
              onClick={() => setAbierto(false)}
              style={{
                fontSize: 12,
                color: "#2563eb",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Ver todas las notificaciones →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
