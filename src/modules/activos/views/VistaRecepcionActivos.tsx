"use client";

import { useEffect, useState } from "react";

interface Recepcion {
  id_recepcion: number;
  codigo: string;
  documento: string | null;
  fecha_recepcion: string | null;
  total_items: number;
  estado: string;
  proveedor_nombre: string | null;
  usuario_nombre: string | null;
}

interface Proveedor {
  id_proveedor: number;
  nombre: string;
}

interface Item {
  tipo_activo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  codigo_patrimonial: string;
  fecha_fin_garantia: string;
}

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const ITEM_VACIO: Item = { tipo_activo: "LAPTOP", marca: "", modelo: "", numero_serie: "", codigo_patrimonial: "", fecha_fin_garantia: "" };

export default function VistaRecepcionActivos() {
  const [recepciones, setRecepciones] = useState<Recepcion[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [form, setForm] = useState({ id_proveedor: "", documento: "", id_solicitud_origen: "" });
  const [items, setItems] = useState<Item[]>([{ ...ITEM_VACIO }]);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/gestor-activos/recepcion?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setRecepciones(Array.isArray(json?.recepciones) ? json.recepciones : []);
        setProveedores(Array.isArray(json?.proveedores) ? json.proveedores : []);
      } else setError(json.error ?? "No se pudieron cargar las recepciones.");
    } catch {
      setError("Error de conexión al cargar las recepciones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function actualizarItem(i: number, campo: keyof Item, valor: string) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: valor } : it)));
  }

  async function registrar() {
    const validos = items.filter((it) => it.tipo_activo && it.marca && it.modelo);
    if (validos.length === 0) {
      setError("Completa al menos un equipo con tipo, marca y modelo.");
      return;
    }
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/gestor-activos/recepcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_proveedor: form.id_proveedor || undefined,
          documento: form.documento || undefined,
          id_solicitud_origen: form.id_solicitud_origen || undefined,
          items: validos,
        }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la recepción.");
      else {
        setOk(json.mensaje ?? "Recepción registrada.");
        setForm({ id_proveedor: "", documento: "", id_solicitud_origen: "" });
        setItems([{ ...ITEM_VACIO }]);
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la recepción.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Recepción de adquisiciones</h1>
        <p>Recepciona lotes con series y garantía, y vincula cada ingreso a su solicitud de origen.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Nueva recepción</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Proveedor
            <select value={form.id_proveedor} onChange={(e) => setForm((p) => ({ ...p, id_proveedor: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 220 }}>
              <option value="">Sin proveedor</option>
              {proveedores.map((p) => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Documento (guía/factura)
            <input type="text" value={form.documento} onChange={(e) => setForm((p) => ({ ...p, documento: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 200 }} />
          </label>
          <label style={{ fontSize: 12, color: "#374151" }}>
            Solicitud de origen (id)
            <input type="number" value={form.id_solicitud_origen} onChange={(e) => setForm((p) => ({ ...p, id_solicitud_origen: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 160 }} />
          </label>
        </div>

        <h3 style={{ marginTop: 16, fontSize: 13 }}>Equipos recibidos</h3>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 8 }}>
            <input type="text" placeholder="Tipo" value={it.tipo_activo} onChange={(e) => actualizarItem(i, "tipo_activo", e.target.value)} style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 120 }} />
            <input type="text" placeholder="Marca" value={it.marca} onChange={(e) => actualizarItem(i, "marca", e.target.value)} style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 130 }} />
            <input type="text" placeholder="Modelo" value={it.modelo} onChange={(e) => actualizarItem(i, "modelo", e.target.value)} style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 140 }} />
            <input type="text" placeholder="Serie" value={it.numero_serie} onChange={(e) => actualizarItem(i, "numero_serie", e.target.value)} style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 140 }} />
            <input type="text" placeholder="Código patrimonial" value={it.codigo_patrimonial} onChange={(e) => actualizarItem(i, "codigo_patrimonial", e.target.value)} style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 160 }} />
            <input type="date" title="Fin de garantía" value={it.fecha_fin_garantia} onChange={(e) => actualizarItem(i, "fecha_fin_garantia", e.target.value)} style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
            {items.length > 1 && <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}>Quitar</button>}
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="boton-secundario" style={{ width: "auto" }} onClick={() => setItems((prev) => [...prev, { ...ITEM_VACIO }])}>Agregar equipo</button>
          <button className="boton-primario" style={{ width: "auto" }} disabled={procesando} onClick={registrar}>{procesando ? "Registrando..." : "Registrar recepción"}</button>
        </div>
      </div>

      <h2>Recepciones registradas</h2>
      {cargando ? (
        <p>Cargando...</p>
      ) : recepciones.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay recepciones registradas.</div>
      ) : (
        <table className="tabla-datos">
          <thead><tr><th>Código</th><th>Proveedor</th><th>Documento</th><th>Fecha</th><th>Items</th><th>Estado</th><th>Registró</th></tr></thead>
          <tbody>
            {recepciones.map((r) => (
              <tr key={r.id_recepcion}>
                <td><strong>{r.codigo}</strong></td>
                <td>{r.proveedor_nombre ?? "—"}</td>
                <td>{r.documento ?? "—"}</td>
                <td>{fecha(r.fecha_recepcion)}</td>
                <td>{r.total_items}</td>
                <td>{r.estado}</td>
                <td>{r.usuario_nombre ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
