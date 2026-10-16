"use client";

import { useEffect, useState, useMemo } from "react";

interface Fila {
  id_usuario: number;
  usuario_nombre: string;
  correo_electronico: string;
  id_perfil: number;
  perfil_nombre: string;
  ultimo_acceso: string | null;
  ultima_decision: string | null;
  fecha_decision: string | null;
}

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaRecertificacion() {
  const [items, setItems] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/auditor/accesos/recertificacion?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudo cargar la recertificación.");
    } catch {
      setError("Error de conexión al cargar la recertificación.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter((f) => `${f.usuario_nombre} ${f.correo_electronico} ${f.perfil_nombre}`.toLowerCase().includes(q));
  }, [items, busqueda]);

  async function decidir(fila: Fila, decision: "CONFIRMADO" | "RETIRADO") {
    const comentario = window.prompt(`Comentario de la recertificación (${decision}):`) ?? "";
    setProcesando(`${fila.id_usuario}-${fila.id_perfil}`);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/auditor/accesos/recertificacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: fila.id_usuario, id_perfil: fila.id_perfil, decision, comentario }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la recertificación.");
      else {
        setOk(`Acceso de ${fila.usuario_nombre} (${fila.perfil_nombre}) ${decision.toLowerCase()}.`);
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la recertificación.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Recertificación de accesos</h1>
        <p>Revisión periódica de usuarios y perfiles con confirmación o retiro recomendado.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por usuario, correo o perfil..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: "100%", maxWidth: 420, padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
        />
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : filtrados.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay accesos que coincidan.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Usuario</th><th>Perfil</th><th>Último acceso</th><th>Última decisión</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filtrados.map((f) => {
                const clave = `${f.id_usuario}-${f.id_perfil}`;
                return (
                  <tr key={clave}>
                    <td>
                      <strong>{f.usuario_nombre}</strong>
                      <div style={{ fontSize: 11.5, color: "#6b7280" }}>{f.correo_electronico}</div>
                    </td>
                    <td>{f.perfil_nombre}</td>
                    <td>{fecha(f.ultimo_acceso)}</td>
                    <td>
                      {f.ultima_decision ? (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: f.ultima_decision === "CONFIRMADO" ? "#dcfce7" : "#fee2e2", color: f.ultima_decision === "CONFIRMADO" ? "#166534" : "#b91c1c" }}>
                          {f.ultima_decision}
                        </span>
                      ) : (
                        <span style={{ color: "#9ca3af", fontSize: 12 }}>Pendiente</span>
                      )}
                      {f.fecha_decision && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{fecha(f.fecha_decision)}</div>}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button className="boton-primario" style={{ width: "auto", fontSize: 12, padding: "5px 10px" }} disabled={procesando === clave} onClick={() => decidir(f, "CONFIRMADO")}>Confirmar</button>
                        <button className="boton-secundario" style={{ width: "auto", fontSize: 12, padding: "5px 10px" }} disabled={procesando === clave} onClick={() => decidir(f, "RETIRADO")}>Retirar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
