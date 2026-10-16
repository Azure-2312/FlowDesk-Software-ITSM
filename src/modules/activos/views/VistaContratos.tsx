"use client";

import { useEffect, useState } from "react";

interface Contrato {
  id_contrato: number;
  codigo: string;
  nombre: string;
  tipo: string | null;
  descripcion: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  monto: number | null;
  moneda: string | null;
  cobertura: string | null;
  renovacion_automatica: boolean;
  dias_aviso: number;
  estado: string;
  proveedor_nombre: string | null;
  dias_para_vencer: number | null;
}

interface Proveedor {
  id_proveedor: number;
  nombre: string;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  VIGENTE: { bg: "#dcfce7", fg: "#166534" },
  POR_VENCER: { bg: "#fef3c7", fg: "#92400e" },
  VENCIDO: { bg: "#fee2e2", fg: "#b91c1c" },
  RENOVADO: { bg: "#dbeafe", fg: "#1d4ed8" },
  CANCELADO: { bg: "#e5e7eb", fg: "#374151" },
};

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaContratos() {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ codigo: "", nombre: "", id_proveedor: "", tipo: "", fecha_inicio: "", fecha_fin: "", monto: "", moneda: "PEN", cobertura: "", renovacion_automatica: false, dias_aviso: "30" });

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/gestor-activos/contratos?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setContratos(Array.isArray(json?.contratos) ? json.contratos : []);
        setProveedores(Array.isArray(json?.proveedores) ? json.proveedores : []);
      } else setError(json.error ?? "No se pudieron cargar los contratos.");
    } catch {
      setError("Error de conexión al cargar los contratos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function crear() {
    if (form.codigo.trim().length < 3 || form.nombre.trim().length < 3) {
      setError("Indica el código y el nombre del contrato.");
      return;
    }
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/gestor-activos/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar.");
      else {
        setOk(json.mensaje ?? "Contrato registrado.");
        setForm({ codigo: "", nombre: "", id_proveedor: "", tipo: "", fecha_inicio: "", fecha_fin: "", monto: "", moneda: "PEN", cobertura: "", renovacion_automatica: false, dias_aviso: "30" });
        setMostrarForm(false);
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar.");
    } finally {
      setProcesando(false);
    }
  }

  async function cambiarEstado(idContrato: number, estado: string) {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/gestor-activos/contratos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_contrato: idContrato, estado }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo actualizar.");
      else {
        setOk(json.mensaje ?? "Contrato actualizado.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al actualizar.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Contratos y cobertura</h1>
        <p>Registra contratos con proveedores, su cobertura, montos y vigencias.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div style={{ marginBottom: 14 }}>
        <button className="boton-primario" style={{ width: "auto" }} onClick={() => setMostrarForm((v) => !v)}>{mostrarForm ? "Cancelar" : "Nuevo contrato"}</button>
      </div>

      {mostrarForm && (
        <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
          <h2>Nuevo contrato</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ fontSize: 12, color: "#374151" }}>
              Código
              <input type="text" value={form.codigo} onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 140 }} />
            </label>
            <label style={{ fontSize: 12, color: "#374151", flex: "1 1 240px" }}>
              Nombre
              <input type="text" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8 }} />
            </label>
            <label style={{ fontSize: 12, color: "#374151" }}>
              Proveedor
              <select value={form.id_proveedor} onChange={(e) => setForm((p) => ({ ...p, id_proveedor: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, minWidth: 200 }}>
                <option value="">Sin proveedor</option>
                {proveedores.map((p) => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12, color: "#374151" }}>
              Tipo
              <input type="text" value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 140 }} />
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
              Monto
              <input type="number" value={form.monto} onChange={(e) => setForm((p) => ({ ...p, monto: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 130 }} />
            </label>
            <label style={{ fontSize: 12, color: "#374151" }}>
              Días de aviso
              <input type="number" value={form.dias_aviso} onChange={(e) => setForm((p) => ({ ...p, dias_aviso: e.target.value }))} style={{ display: "block", marginTop: 4, padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 8, width: 110 }} />
            </label>
            <label style={{ fontSize: 12, color: "#374151", display: "flex", gap: 6, alignItems: "center", paddingBottom: 8 }}>
              <input type="checkbox" checked={form.renovacion_automatica} onChange={(e) => setForm((p) => ({ ...p, renovacion_automatica: e.target.checked }))} />
              Renovación automática
            </label>
          </div>
          <label style={{ fontSize: 12, color: "#374151", display: "block", marginTop: 10 }}>
            Cobertura
            <textarea rows={2} value={form.cobertura} onChange={(e) => setForm((p) => ({ ...p, cobertura: e.target.value }))} style={{ display: "block", width: "100%", marginTop: 4, padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }} />
          </label>
          <button className="boton-primario" style={{ width: "auto", marginTop: 10 }} disabled={procesando} onClick={crear}>{procesando ? "Guardando..." : "Registrar contrato"}</button>
        </div>
      )}

      {cargando ? (
        <p>Cargando...</p>
      ) : contratos.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay contratos registrados.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="tabla-datos">
            <thead><tr><th>Código</th><th>Nombre</th><th>Proveedor</th><th>Vigencia</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {contratos.map((c) => {
                const color = COLORES[c.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
                const dias = c.dias_para_vencer === null ? null : Math.round(Number(c.dias_para_vencer));
                return (
                  <tr key={c.id_contrato}>
                    <td><strong>{c.codigo}</strong></td>
                    <td>{c.nombre}{c.cobertura && <div style={{ fontSize: 11.5, color: "#6b7280" }}>{c.cobertura}</div>}</td>
                    <td>{c.proveedor_nombre ?? "—"}</td>
                    <td>{fecha(c.fecha_inicio)} → {fecha(c.fecha_fin)}{dias !== null && <div style={{ fontSize: 11.5, color: dias < 0 ? "#b91c1c" : dias <= c.dias_aviso ? "#b45309" : "#6b7280" }}>{dias < 0 ? `vencido hace ${-dias} días` : `en ${dias} días`}</div>}</td>
                    <td>{c.monto === null ? "—" : `${Number(c.monto).toLocaleString("es-PE", { minimumFractionDigits: 2 })} ${c.moneda ?? ""}`}</td>
                    <td><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{c.estado}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {c.estado !== "VIGENTE" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(c.id_contrato, "VIGENTE")}>Vigente</button>}
                        {c.estado !== "CANCELADO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(c.id_contrato, "CANCELADO")}>Cancelar</button>}
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
