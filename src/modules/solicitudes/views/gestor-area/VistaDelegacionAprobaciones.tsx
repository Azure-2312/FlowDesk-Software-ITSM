"use client";

import { useEffect, useState, FormEvent } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Trash2 } from "@/shared/components/ui/Iconos";

interface Delegacion {
  id_delegacion: number;
  id_usuario_delegado: number;
  delegado_nombre: string;
  fecha_desde: string;
  fecha_hasta: string;
  motivo: string | null;
  fecha_creacion: string;
}

interface Colaborador {
  id_usuario: number;
  nombres: string;
  apellido_paterno: string;
}

export default function VistaDelegacionAprobaciones() {
  const [items, setItems] = useState<Delegacion[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [idDelegado, setIdDelegado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [motivo, setMotivo] = useState("");

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const [resD, resC] = await Promise.all([
        fetch(`/api/solicitudes/delegacion?_t=${Date.now()}`).then((r) => r.json()),
        fetch(`/api/area/colaboradores?_t=${Date.now()}`).then((r) => r.json()),
      ]);
      setItems(Array.isArray(resD) ? resD : []);
      setColaboradores(Array.isArray(resC?.colaboradores) ? resC.colaboradores : []);
    } catch {
      setError("Error de conexión al cargar las delegaciones.");
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
      const res = await fetch("/api/solicitudes/delegacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario_delegado: Number(idDelegado), fecha_desde: desde, fecha_hasta: hasta, motivo }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la delegación.");
      else {
        setOk("Delegación registrada.");
        setIdDelegado(""); setDesde(""); setHasta(""); setMotivo("");
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la delegación.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: number) {
    if (!window.confirm("¿Eliminar esta delegación?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/solicitudes/delegacion?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo eliminar.");
      else await cargar();
    } catch {
      setError("Error de conexión al eliminar.");
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Delegación de aprobaciones</h1>
        <p>Delega temporalmente mis aprobaciones a un suplente de mi área por ausencia.</p>
      </div>

      <form onSubmit={crear} className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Nueva delegación</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ fontSize: 12, color: "#374151", minWidth: 220 }}>
            Suplente
            <select value={idDelegado} onChange={(e) => setIdDelegado(e.target.value)} required style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <option value="">Selecciona...</option>
              {colaboradores.map((c) => (
                <option key={c.id_usuario} value={c.id_usuario}>{c.nombres} {c.apellido_paterno}</option>
              ))}
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
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Vacaciones, viaje..." style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <button className="boton-primario" style={{ width: "auto" }} disabled={guardando}>
            {guardando ? "Guardando..." : "Delegar"}
          </button>
        </div>
        {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginTop: 10, marginBottom: 0 }}>{ok}</p>}
        {error && <p role="alert" className="mensaje-error" style={{ marginTop: 10, marginBottom: 0 }}>{error}</p>}
      </form>

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay delegaciones activas.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Suplente</th><th>Desde</th><th>Hasta</th><th>Motivo</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id_delegacion}>
                  <td>{d.delegado_nombre}</td>
                  <td>{String(d.fecha_desde).slice(0, 10)}</td>
                  <td>{String(d.fecha_hasta).slice(0, 10)}</td>
                  <td>{d.motivo ?? "—"}</td>
                  <td>
                    <BotonIcono
                      variante="peligro"
                      icono={<Trash2 size={13} />}
                      titulo="Eliminar delegación"
                      ariaLabel="Eliminar delegación"
                      onClick={() => eliminar(d.id_delegacion)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
