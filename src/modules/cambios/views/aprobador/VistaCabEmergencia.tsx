"use client";

import { useEffect, useState } from "react";

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  justificacion: string;
  ventana_inicio: string;
  ventana_fin: string;
  fecha_creacion: string;
  impacto_nombre: string | null;
  solicitante_nombre: string | null;
}

interface Decision {
  id_ecab: number;
  id_cambio: number;
  decision: string;
  condiciones: string | null;
  plazo_horas: number | null;
  revision_retroactiva: boolean;
  fecha_decision: string;
  codigo_cambio: string;
  titulo: string;
  aprobador_nombre: string | null;
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function VistaCabEmergencia() {
  const [pendientes, setPendientes] = useState<Cambio[]>([]);
  const [recientes, setRecientes] = useState<Decision[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cambios/cab/emergencia?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setPendientes(Array.isArray(json?.pendientes) ? json.pendientes : []);
        setRecientes(Array.isArray(json?.recientes) ? json.recientes : []);
      } else setError(json.error ?? "No se pudo cargar el ECAB.");
    } catch {
      setError("Error de conexión al cargar el ECAB.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function decidir(idCambio: number, decision: "APROBADO" | "RECHAZADO") {
    let condiciones = "";
    let plazo = 0;
    if (decision === "APROBADO") {
      condiciones = window.prompt("Condiciones y plazo de revisión retroactiva:") ?? "";
      plazo = Number(window.prompt("Plazo en horas para la revisión retroactiva:", "24") ?? "0");
    }
    const clave = idCambio;
    setProcesando(clave);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/cambios/cab/emergencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cambio: idCambio, decision, condiciones, plazo_horas: plazo }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar el dictamen.");
      else {
        setOk("Dictamen del ECAB registrado.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar el dictamen.");
    } finally {
      setProcesando(null);
    }
  }

  if (cargando) return <div className="vista-contenedor"><p>Cargando...</p></div>;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Comité de emergencia (ECAB)</h1>
        <p>Decisión rápida sobre cambios de emergencia, con plazo y revisión retroactiva.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario">
        <h2>Emergencias pendientes</h2>
        {pendientes.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>No hay cambios de emergencia pendientes.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pendientes.map((c) => (
              <div key={c.id_cambio} style={{ border: "1px solid #fecaca", borderRadius: 10, padding: 12 }}>
                <strong style={{ fontSize: 14 }}>{c.codigo_cambio} · {c.titulo}</strong>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  Impacto {c.impacto_nombre ?? "—"} · Solicita {c.solicitante_nombre ?? "—"} · Creada {fechaHora(c.fecha_creacion)}
                </div>
                <div style={{ fontSize: 12.5, color: "#374151", marginTop: 6 }}>Ventana: {fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)}</div>
                <p style={{ fontSize: 12.5, color: "#374151", marginTop: 8, whiteSpace: "pre-wrap" }}>{c.justificacion}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => decidir(c.id_cambio, "APROBADO")}>Aprobar con condiciones</button>
                  <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === c.id_cambio} onClick={() => decidir(c.id_cambio, "RECHAZADO")}>Rechazar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tarjeta-formulario">
        <h2>Dictámenes recientes</h2>
        {recientes.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Sin dictámenes registrados.</p>
        ) : (
          <table className="tabla-datos">
            <thead>
              <tr><th>RFC</th><th>Título</th><th>Decisión</th><th>Condiciones</th><th>Plazo</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {recientes.map((d) => (
                <tr key={d.id_ecab}>
                  <td><strong>{d.codigo_cambio}</strong></td>
                  <td>{d.titulo}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: d.decision === "APROBADO" ? "#dcfce7" : "#fee2e2", color: d.decision === "APROBADO" ? "#166534" : "#b91c1c" }}>
                      {d.decision}
                    </span>
                  </td>
                  <td>{d.condiciones ?? "—"}</td>
                  <td>{d.plazo_horas ? `${d.plazo_horas} h` : "—"}</td>
                  <td>{fechaHora(d.fecha_decision)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
