"use client";

import { useEffect, useState, FormEvent } from "react";

interface Ausencia {
  id_ausencia: number;
  id_usuario_tecnico: number;
  fecha_desde: string;
  fecha_hasta: string;
  motivo: string;
  tecnico_nombre: string;
}

interface Tecnico {
  id_usuario: number;
  nombre: string;
}

function normalizarTecnicos(json: any): Tecnico[] {
  const lista = Array.isArray(json) ? json : json?.tecnicos ?? json?.data ?? [];
  return (lista as any[]).map((t) => ({
    id_usuario: t.id_usuario ?? t.id ?? 0,
    nombre:
      t.nombre ??
      t.nombre_completo ??
      [t.nombres, t.apellido_paterno].filter(Boolean).join(" ") ??
      `Usuario ${t.id_usuario}`,
  }));
}

export default function VistaAusenciasEquipo() {
  const [ausencias, setAusencias] = useState<Ausencia[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [idTecnico, setIdTecnico] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [motivo, setMotivo] = useState("");

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const [resA, resT] = await Promise.all([
        fetch(`/api/supervisor/ausencias?_t=${Date.now()}`).then((r) => r.json()),
        fetch(`/api/tecnicos?_t=${Date.now()}`).then((r) => r.json()),
      ]);
      setAusencias(Array.isArray(resA?.ausencias) ? resA.ausencias : []);
      setTecnicos(normalizarTecnicos(resT));
    } catch {
      setError("Error de conexión al cargar las ausencias.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/supervisor/ausencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario_tecnico: Number(idTecnico), fecha_desde: desde, fecha_hasta: hasta, motivo }),
      });
      const json = await res.json();
      if (!res.ok || json.ok === false) setError(json.error ?? "No se pudo registrar la ausencia.");
      else {
        setOk("Ausencia registrada.");
        setIdTecnico(""); setDesde(""); setHasta(""); setMotivo("");
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la ausencia.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: number) {
    if (!window.confirm("¿Eliminar esta ausencia?")) return;
    try {
      const res = await fetch(`/api/supervisor/ausencias?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || json.ok === false) setError(json.error ?? "No se pudo eliminar.");
      else await cargar();
    } catch {
      setError("Error de conexión al eliminar.");
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Ausencias y guardias del equipo</h1>
        <p>Registra y edita las ausencias de mi equipo; las usa la asignación automática.</p>
      </div>

      <form onSubmit={crear} className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Registrar ausencia</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: 12, color: "#374151", minWidth: 200 }}>
            Técnico
            <select value={idTecnico} onChange={(e) => setIdTecnico(e.target.value)} required style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value="">Selecciona...</option>
              {tecnicos.map((t) => <option key={t.id_usuario} value={t.id_usuario}>{t.nombre}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Desde
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} required style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Hasta
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} required style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151", flex: 1, minWidth: 200 }}>
            Motivo
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} required placeholder="Vacaciones, permiso, capacitación..." style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <button className="boton-primario" style={{ width: "auto" }} disabled={guardando}>
            {guardando ? "Guardando..." : "Registrar"}
          </button>
        </div>
        {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginTop: 10, marginBottom: 0 }}>{ok}</p>}
        {error && <p role="alert" className="mensaje-error" style={{ marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </form>

      {cargando ? (
        <p>Cargando...</p>
      ) : ausencias.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay ausencias registradas.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Técnico</th><th>Desde</th><th>Hasta</th><th>Motivo</th><th></th></tr>
            </thead>
            <tbody>
              {ausencias.map((a) => (
                <tr key={a.id_ausencia}>
                  <td>{a.tecnico_nombre}</td>
                  <td>{String(a.fecha_desde).slice(0, 10)}</td>
                  <td>{String(a.fecha_hasta).slice(0, 10)}</td>
                  <td>{a.motivo}</td>
                  <td><button className="boton-secundario" style={{ width: "auto" }} onClick={() => eliminar(a.id_ausencia)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
