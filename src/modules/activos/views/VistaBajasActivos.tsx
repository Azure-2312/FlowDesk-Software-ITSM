"use client";

import { useEffect, useState } from "react";

interface Baja {
  id_solicitud: number;
  motivo: string;
  estado: string;
  fecha_solicitud: string;
  comentario_resolucion: string | null;
  destino_final: string | null;
  borrado_seguro: boolean | null;
  acta: string | null;
  fecha_disposicion: string | null;
  id_activo: number;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  solicitante_nombre: string | null;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  PENDIENTE: { bg: "#fef3c7", fg: "#92400e" },
  APROBADA: { bg: "#dcfce7", fg: "#166534" },
  RECHAZADA: { bg: "#fee2e2", fg: "#b91c1c" },
};

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaBajasActivos() {
  const [items, setItems] = useState<Baja[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [disposicion, setDisposicion] = useState<number | null>(null);
  const [form, setForm] = useState({ destino_final: "RECICLAJE", borrado_seguro: true, acta: "" });

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/gestor-activos/bajas?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar las bajas.");
    } catch {
      setError("Error de conexión al cargar las bajas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function resolver(idSolicitud: number, decision: string) {
    setProcesando(idSolicitud);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/gestor-activos/bajas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_solicitud: idSolicitud, decision }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo resolver la baja.");
      else {
        setOk(json.mensaje ?? "Solicitud resuelta.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al resolver la baja.");
    } finally {
      setProcesando(null);
    }
  }

  async function registrarDisposicion(idSolicitud: number) {
    if (form.acta.trim().length < 5) {
      setError("El acta de disposición debe describir el destino y el borrado seguro.");
      return;
    }
    setProcesando(idSolicitud);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/gestor-activos/bajas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_solicitud: idSolicitud, ...form }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la disposición.");
      else {
        setOk(json.mensaje ?? "Disposición registrada.");
        setDisposicion(null);
        setForm({ destino_final: "RECICLAJE", borrado_seguro: true, acta: "" });
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la disposición.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Gestión de bajas</h1>
        <p>Resuelve solicitudes de baja y registra el borrado seguro, el acta y el destino final del activo.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay solicitudes de baja.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((b) => {
            const color = COLORES[b.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
            const conActa = Boolean(b.acta);
            return (
              <div key={b.id_solicitud} className="tarjeta-formulario" style={{ margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ maxWidth: 620 }}>
                    <strong style={{ fontSize: 14 }}>{b.codigo_patrimonial} · {b.tipo_activo} {b.marca} {b.modelo}</strong>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{b.motivo}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      Solicita {b.solicitante_nombre ?? "—"} · {fecha(b.fecha_solicitud)}
                    </div>
                    {b.estado === "APROBADA" && conActa && (
                      <div style={{ fontSize: 12, color: "#166534", marginTop: 4 }}>
                        Disposición: {b.destino_final} · borrado seguro {b.borrado_seguro ? "sí" : "no"} · {fecha(b.fecha_disposicion)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg, height: "fit-content" }}>{b.estado}</span>
                    {b.estado === "PENDIENTE" && (
                      <>
                        <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === b.id_solicitud} onClick={() => resolver(b.id_solicitud, "APROBAR")}>Aprobar</button>
                        <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando === b.id_solicitud} onClick={() => resolver(b.id_solicitud, "RECHAZAR")}>Rechazar</button>
                      </>
                    )}
                    {b.estado === "APROBADA" && !conActa && (
                      <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setDisposicion(disposicion === b.id_solicitud ? null : b.id_solicitud)}>
                        {disposicion === b.id_solicitud ? "Cerrar" : "Registrar disposición"}
                      </button>
                    )}
                  </div>
                </div>
                {disposicion === b.id_solicitud && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
                      <label style={{ fontSize: 12, color: "#374151" }}>
                        Destino final
                        <select value={form.destino_final} onChange={(e) => setForm((p) => ({ ...p, destino_final: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
                          <option value="REVENTA">Reventa</option>
                          <option value="DONACION">Donación</option>
                          <option value="RECICLAJE">Reciclaje</option>
                          <option value="DESTRUCCION">Destrucción</option>
                        </select>
                      </label>
                      <label style={{ fontSize: 12, color: "#374151", display: "flex", gap: 6, alignItems: "center", paddingBottom: 8 }}>
                        <input type="checkbox" checked={form.borrado_seguro} onChange={(e) => setForm((p) => ({ ...p, borrado_seguro: e.target.checked }))} />
                        Borrado seguro de datos
                      </label>
                    </div>
                    <textarea rows={3} placeholder="Acta de disposición (responsable, procedimiento, evidencias)" value={form.acta} onChange={(e) => setForm((p) => ({ ...p, acta: e.target.value }))} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }} />
                    <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === b.id_solicitud} onClick={() => registrarDisposicion(b.id_solicitud)}>Guardar disposición</button>
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
