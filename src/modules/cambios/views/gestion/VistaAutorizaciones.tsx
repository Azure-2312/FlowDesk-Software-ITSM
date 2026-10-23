"use client";

import { useEffect, useState } from "react";

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  estado_nombre: string;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  ventana_inicio: string | null;
  ventana_fin: string | null;
  impacto_nombre: string | null;
  dias_pendiente: number;
  aprobados: number;
  rechazados: number;
  observados: number;
}

interface Detalle {
  id_cambio: number;
  decision: string;
  comentario: string | null;
  fecha_decision: string;
  aprobador_nombre: string | null;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  APROBADO: { bg: "#dcfce7", fg: "#166534" },
  RECHAZADO: { bg: "#fee2e2", fg: "#b91c1c" },
  OBSERVADO: { bg: "#fef3c7", fg: "#92400e" },
};

export default function VistaAutorizaciones() {
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [detalle, setDetalle] = useState<Detalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [expandido, setExpandido] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cambios/gestion/autorizaciones?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setCambios(Array.isArray(json?.cambios) ? json.cambios : []);
        setDetalle(Array.isArray(json?.detalle) ? json.detalle : []);
      } else setError(json.error ?? "No se pudo cargar el seguimiento.");
    } catch {
      setError("Error de conexión al cargar el seguimiento.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function notificar(idCambio: number, tipo: string) {
    setProcesando(idCambio);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/cambios/gestion/autorizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cambio: idCambio, tipo }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la acción.");
      else setOk(json.mensaje ?? "Acción registrada.");
    } catch {
      setError("Error de conexión al registrar la acción.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Seguimiento de etapas de aprobación</h1>
        <p>Etapas pendientes, plazos, recordatorios y escalamiento de las RFC en autorización.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : cambios.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay RFC en proceso de autorización.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cambios.map((c) => {
            const dias = Math.round(Number(c.dias_pendiente));
            const vencido = dias >= 3;
            const votos = detalle.filter((d) => d.id_cambio === c.id_cambio);
            return (
              <div key={c.id_cambio} className="tarjeta-formulario" style={{ margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ maxWidth: 640 }}>
                    <strong style={{ fontSize: 14 }}>{c.codigo_cambio} · {c.titulo}</strong>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      {c.tipo_cambio} · Impacto {c.impacto_nombre ?? "—"} · Ventana {fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 6, color: vencido ? "#b91c1c" : "#374151", fontWeight: vencido ? 600 : undefined }}>
                      {dias} día(s) en autorización {vencido ? "· plazo excedido" : ""}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      Aprobados {c.aprobados} · Observados {c.observados} · Rechazados {c.rechazados}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => notificar(c.id_cambio, "RECORDATORIO")}>Recordar</button>
                    <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => notificar(c.id_cambio, "ESCALAMIENTO")}>Escalar</button>
                    <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setExpandido(expandido === c.id_cambio ? null : c.id_cambio)}>
                      {expandido === c.id_cambio ? "Ocultar" : "Votos"}
                    </button>
                  </div>
                </div>
                {expandido === c.id_cambio && (
                  <div style={{ marginTop: 12 }}>
                    {votos.length === 0 ? (
                      <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Aún no hay dictámenes registrados.</p>
                    ) : (
                      <table className="tabla-datos">
                        <thead><tr><th>Fecha</th><th>Aprobador</th><th>Decisión</th><th>Comentario</th></tr></thead>
                        <tbody>
                          {votos.map((v, i) => {
                            const color = COLORES[v.decision] ?? { bg: "#e5e7eb", fg: "#374151" };
                            return (
                              <tr key={i}>
                                <td>{fechaHora(v.fecha_decision)}</td>
                                <td>{v.aprobador_nombre ?? "—"}</td>
                                <td><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{v.decision}</span></td>
                                <td>{v.comentario ?? "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
