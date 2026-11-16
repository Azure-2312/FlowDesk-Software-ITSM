"use client";

import { useEffect, useState, FormEvent } from "react";

interface Preferencias {
  correo_tickets: boolean;
  correo_cambios: boolean;
  correo_problemas: boolean;
  correo_conocimiento: boolean;
  resumen_diario: boolean;
  canal_preferido: string;
  fecha_actualizacion: string | null;
}

const INTERRUPTORES: { clave: keyof Preferencias; titulo: string; detalle: string }[] = [
  { clave: "correo_tickets", titulo: "Tickets e incidentes", detalle: "Avisos de asignación, comentarios y cambios de estado de tus tickets." },
  { clave: "correo_cambios", titulo: "Cambios (RFC)", detalle: "Avisos de ventanas de mantenimiento y decisiones sobre cambios." },
  { clave: "correo_problemas", titulo: "Problemas y errores conocidos", detalle: "Novedades sobre problemas que afectan a tus servicios." },
  { clave: "correo_conocimiento", titulo: "Conocimiento", detalle: "Publicación o actualización de artículos relevantes." },
  { clave: "resumen_diario", titulo: "Resumen diario", detalle: "Un correo consolidado con la actividad pendiente del día." },
];

export default function VistaPreferenciasNotificacion() {
  const [preferencias, setPreferencias] = useState<Preferencias | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/mi-cuenta/notificaciones?_t=${Date.now()}`);
      const data = await res.json();
      if (res.ok && data.preferencias) {
        setPreferencias(data.preferencias);
      } else {
        setError(data.error ?? "No se pudieron cargar tus preferencias.");
      }
    } catch {
      setError("Error de conexión al cargar tus preferencias.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function alternar(clave: keyof Preferencias) {
    setPreferencias((prev) => (prev ? { ...prev, [clave]: !prev[clave] } : prev));
  }

  async function guardar(e?: FormEvent) {
    if (e) e.preventDefault();
    if (!preferencias) return;
    setGuardando(true);
    setError(null);
    setExito(null);
    try {
      const res = await fetch("/api/mi-cuenta/notificaciones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferencias),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudieron guardar tus preferencias.");
        return;
      }
      setPreferencias(data.preferencias);
      setExito("Tus preferencias de notificación se guardaron correctamente.");
      setTimeout(() => setExito(null), 4000);
    } catch {
      setError("Error de conexión al guardar tus preferencias.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista-contenedor" style={{ maxWidth: 1400, width: "100%" }}>
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "nowrap", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>Preferencias de notificación</h1>
          <p>Elige qué avisos quieres recibir y por qué canal.</p>
        </div>
        <button
          type="button"
          onClick={() => guardar()}
          className="boton-primario"
          style={{ width: "auto", padding: "8px 18px", fontSize: 13, flexShrink: 0 }}
          disabled={guardando || !preferencias}
        >
          {guardando ? "Guardando..." : "Guardar Preferencias"}
        </button>
      </div>

      {exito && (
        <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: 13, fontWeight: 500 }}>
          {exito}
        </div>
      )}

      {cargando ? (
        <p className="descripcion">Cargando preferencias...</p>
      ) : error ? (
        <div className="mensaje-error">{error}</div>
      ) : preferencias ? (
        <form onSubmit={guardar}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 20, alignItems: "start" }}>
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
              <h2 style={{ fontSize: 16, margin: 0, marginBottom: 4, color: "#0f172a" }}>Canal preferido</h2>
              <p className="descripcion">Por dónde quieres recibir los avisos del sistema.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {[
                  { valor: "CORREO", texto: "Correo electrónico institucional" },
                  { valor: "PLATAFORMA", texto: "Solo en la plataforma (campana de avisos)" },
                  { valor: "AMBOS", texto: "Correo institucional y plataforma" },
                ].map((op) => (
                  <label
                    key={op.valor}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      border: preferencias.canal_preferido === op.valor ? "1px solid #2563eb" : "1px solid #e5e7eb",
                      borderRadius: 8,
                      fontSize: 13,
                      cursor: "pointer",
                      backgroundColor: preferencias.canal_preferido === op.valor ? "#eff6ff" : "#f9fafb",
                    }}
                  >
                    <input
                      type="radio"
                      name="canal"
                      value={op.valor}
                      checked={preferencias.canal_preferido === op.valor}
                      onChange={() => setPreferencias({ ...preferencias, canal_preferido: op.valor })}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontWeight: preferencias.canal_preferido === op.valor ? 600 : 400, color: "#0f172a" }}>
                      {op.texto}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
              <h2 style={{ fontSize: 16, margin: 0, marginBottom: 4, color: "#0f172a" }}>Tipos de aviso</h2>
              <p className="descripcion">Activa o desactiva cada categoría de evento.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {INTERRUPTORES.map((item) => {
                  const activo = Boolean(preferencias[item.clave]);
                  return (
                    <label
                      key={String(item.clave)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        padding: "12px 14px",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      <span>
                        <strong style={{ fontSize: 13.5, color: "#0f172a" }}>{item.titulo}</strong>
                        <span style={{ display: "block", fontSize: 12, color: "#6b7280", marginTop: 2 }}>{item.detalle}</span>
                      </span>
                      <input type="checkbox" checked={activo} onChange={() => alternar(item.clave)} style={{ width: 18, height: 18 }} />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
