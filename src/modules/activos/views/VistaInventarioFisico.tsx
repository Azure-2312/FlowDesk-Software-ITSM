"use client";

import { useEffect, useState } from "react";

interface Campana {
  id_campana: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  alcance: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: string;
  responsable_nombre: string | null;
  items: number;
  pendientes: number;
  discrepancias: number;
}

interface Activo {
  id_activo: number;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  departamento_nombre: string | null;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
}

interface ItemCampana {
  id_item: number;
  estado_verificacion: string;
  fecha_verificacion: string | null;
  observacion: string | null;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  departamento_nombre: string | null;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  PENDIENTE: { bg: "#fef3c7", fg: "#92400e" },
  VERIFICADO: { bg: "#dcfce7", fg: "#166534" },
  DISCREPANCIA: { bg: "#fee2e2", fg: "#b91c1c" },
  ABIERTA: { bg: "#dbeafe", fg: "#1d4ed8" },
  CERRADA: { bg: "#e5e7eb", fg: "#374151" },
};

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaInventarioFisico() {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [form, setForm] = useState({ nombre: "", alcance: "", fecha_inicio: "", fecha_fin: "", id_responsable: "" });
  const [detalle, setDetalle] = useState<{ campana: Campana; items: ItemCampana[] } | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/activos/inventario-fisico?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setCampanas(Array.isArray(json?.campanas) ? json.campanas : []);
        setActivos(Array.isArray(json?.activos) ? json.activos : []);
        setUsuarios(Array.isArray(json?.usuarios) ? json.usuarios : []);
      } else setError(json.error ?? "No se pudieron cargar las campañas.");
    } catch {
      setError("Error de conexión al cargar las campañas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function alternar(id: number) {
    setSeleccion((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function crear() {
    if (form.nombre.trim().length < 5 || seleccion.length === 0) {
      setError("Indica un nombre y selecciona al menos un activo.");
      return;
    }
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/activos/inventario-fisico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, activos: seleccion }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo crear la campaña.");
      else {
        setOk(json.mensaje ?? "Campaña creada.");
        setForm({ nombre: "", alcance: "", fecha_inicio: "", fecha_fin: "", id_responsable: "" });
        setSeleccion([]);
        await cargar();
      }
    } catch {
      setError("Error de conexión al crear la campaña.");
    } finally {
      setProcesando(false);
    }
  }

  async function verDetalle(idCampana: number) {
    setError(null);
    try {
      const res = await fetch(`/api/activos/inventario-fisico?id_campana=${idCampana}&_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setDetalle(json);
      else setError(json.error ?? "No se pudo cargar el detalle.");
    } catch {
      setError("Error de conexión al cargar el detalle.");
    }
  }

  async function cerrar(idCampana: number) {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/activos/inventario-fisico", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_campana: idCampana }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo cerrar la campaña.");
      else {
        setOk(json.mensaje ?? "Campaña cerrada.");
        setDetalle(null);
        await cargar();
      }
    } catch {
      setError("Error de conexión al cerrar la campaña.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Inventario físico (campañas)</h1>
        <p>Crea campañas de conteo, revisa discrepancias y cierra con acta. El conteo en campo lo realiza el técnico.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Nueva campaña</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, color: "#374151", flex: "1 1 260px" }}>
            Nombre
            <input type="text" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Alcance
            <input type="text" value={form.alcance} onChange={(e) => setForm((p) => ({ ...p, alcance: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 160 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Inicio
            <input type="date" value={form.fecha_inicio} onChange={(e) => setForm((p) => ({ ...p, fecha_inicio: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Fin
            <input type="date" value={form.fecha_fin} onChange={(e) => setForm((p) => ({ ...p, fecha_fin: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Responsable
            <select value={form.id_responsable} onChange={(e) => setForm((p) => ({ ...p, id_responsable: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 200 }}>
              <option value="">Yo mismo</option>
              {usuarios.map((u) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>)}
            </select>
          </label>
        </div>
        <h3 style={{ marginTop: 14, fontSize: 13 }}>Activos a verificar ({seleccion.length})</h3>
        <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: 8, padding: 8 }}>
          {activos.map((a) => (
            <label key={a.id_activo} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, padding: "4px", cursor: "pointer" }}>
              <input type="checkbox" checked={seleccion.includes(a.id_activo)} onChange={() => alternar(a.id_activo)} />
              <span><strong>{a.codigo_patrimonial}</strong> · {a.tipo_activo} {a.marca} {a.modelo} · {a.departamento_nombre ?? "sin área"}</span>
            </label>
          ))}
        </div>
        <button className="boton-primario" style={{ width: "auto", marginTop: 10 }} disabled={procesando} onClick={crear}>{procesando ? "Creando..." : "Crear campaña"}</button>
      </div>

      <h2>Campañas</h2>
      {cargando ? (
        <p>Cargando...</p>
      ) : campanas.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay campañas registradas.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {campanas.map((c) => {
            const color = COLORES[c.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
            return (
              <div key={c.id_campana} className="tarjeta-formulario" style={{ margin: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <strong style={{ fontSize: 13.5 }}>{c.codigo} · {c.nombre}</strong>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                      {c.alcance ?? "sin alcance"} · {fecha(c.fecha_inicio)} → {fecha(c.fecha_fin)} · {c.responsable_nombre ?? "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      {c.items} items · {c.pendientes} pendientes · {c.discrepancias} discrepancias
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{c.estado}</span>
                    <button className="boton-secundario" style={{ width: "auto" }} onClick={() => verDetalle(c.id_campana)}>Ver detalle</button>
                    {c.estado === "ABIERTA" && <button className="boton-secundario" style={{ width: "auto" }} disabled={procesando} onClick={() => cerrar(c.id_campana)}>Cerrar con acta</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detalle && (
        <div className="tarjeta-formulario" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Detalle: {detalle.campana.nombre}</h2>
            <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setDetalle(null)}>Cerrar</button>
          </div>
          <table className="tabla-datos">
            <thead><tr><th>Código</th><th>Tipo</th><th>Área</th><th>Estado</th><th>Verificado</th><th>Observación</th></tr></thead>
            <tbody>
              {detalle.items.map((it) => (
                <tr key={it.id_item}>
                  <td><strong>{it.codigo_patrimonial}</strong></td>
                  <td>{it.tipo_activo} {it.marca} {it.modelo}</td>
                  <td>{it.departamento_nombre ?? "—"}</td>
                  <td>{it.estado_verificacion}</td>
                  <td>{fecha(it.fecha_verificacion)}</td>
                  <td>{it.observacion ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
