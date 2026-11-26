"use client";

// Registro de un comprobante de proveedor (queda en BORRADOR hasta enviarlo a SUNAT).

import { useEffect, useMemo, useState } from "react";
import { formatoMonto } from "./ComprobantesWorkspace";

interface Item {
  id_activo: string;
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: string;
  valor_unitario: string;
}

const ITEM_VACIO: Item = { id_activo: "", codigo: "", descripcion: "", unidad: "NIU", cantidad: "1", valor_unitario: "" };
const hoy = () => new Date().toISOString().slice(0, 10);

export default function FormularioComprobante({ onCerrar, onCreado }: { onCerrar: () => void; onCreado: (id: number) => void }) {
  const [cat, setCat] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [f, setF] = useState({
    id_proveedor: "",
    tipo_documento: "01",
    id_recepcion: "",
    id_contrato: "",
    id_departamento_empresa: "",
    fecha_emision: hoy(),
    fecha_vencimiento: "",
    moneda: "PEN",
    forma_pago: "Contado",
    observaciones: "",
  });
  const [items, setItems] = useState<Item[]>([{ ...ITEM_VACIO }]);

  useEffect(() => {
    fetch("/api/facturacion/catalogos", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "No se pudieron cargar los catálogos.");
        setCat(d);
      })
      .catch((e) => setError(e.message));
  }, []);

  const proveedor = cat?.proveedores.find((p: any) => String(p.id_proveedor) === f.id_proveedor);
  const recepciones = (cat?.recepciones || []).filter((r: any) => !f.id_proveedor || String(r.id_proveedor) === f.id_proveedor);
  const contratos = (cat?.contratos || []).filter((r: any) => !f.id_proveedor || String(r.id_proveedor) === f.id_proveedor);

  const totales = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + (Number(i.cantidad) || 0) * (Number(i.valor_unitario) || 0), 0);
    const igv = subtotal * 0.18;
    return { subtotal, igv, total: subtotal + igv };
  }, [items]);

  const cambiar = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));
  const cambiarItem = (n: number, k: keyof Item, v: string) =>
    setItems((xs) =>
      xs.map((it, i) => {
        if (i !== n) return it;
        const nuevo = { ...it, [k]: v };
        if (k === "id_activo" && v) {
          const a = cat?.activos.find((x: any) => String(x.id_activo) === v);
          if (a) {
            nuevo.codigo = nuevo.codigo || a.codigo_patrimonial;
            nuevo.descripcion = nuevo.descripcion || [a.tipo_activo, a.marca, a.modelo].filter(Boolean).join(" ");
          }
        }
        return nuevo;
      })
    );

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      const cuerpo = {
        ...f,
        id_proveedor: Number(f.id_proveedor) || null,
        id_recepcion: Number(f.id_recepcion) || null,
        id_contrato: Number(f.id_contrato) || null,
        id_departamento_empresa: Number(f.id_departamento_empresa) || null,
        fecha_vencimiento: f.fecha_vencimiento || null,
        items: items.map((i, n) => ({
          id_activo: Number(i.id_activo) || null,
          codigo: i.codigo || `ITEM${String(n + 1).padStart(3, "0")}`,
          descripcion: i.descripcion,
          unidad: i.unidad,
          cantidad: Number(i.cantidad),
          valor_unitario: Number(i.valor_unitario),
        })),
      };
      const res = await fetch("/api/facturacion/comprobantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo registrar.");
      onCreado(d.id_comprobante);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  const rejilla = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 12 } as const;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" style={{ overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--color-borde)", display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Registrar comprobante de proveedor</h2>
            <p className="descripcion-pagina">Queda en borrador; el número lo asigna SUNAT/fact_api al emitirlo.</p>
          </div>
          <button type="button" className="boton-icono" onClick={onCerrar} title="Cerrar" aria-label="Cerrar">
            ×
          </button>
        </div>

        <div style={{ padding: "18px 22px" }}>
          {error && <div className="mensaje-error">{error}</div>}
          {!cat ? (
            !error && <div className="estado-vacio">Cargando catálogos...</div>
          ) : (
            <>
              <div style={rejilla}>
                <div className="campo">
                  <label className="etiqueta">Proveedor *</label>
                  <select className="input-base" value={f.id_proveedor} onChange={(e) => cambiar("id_proveedor", e.target.value)}>
                    <option value="">Seleccione...</option>
                    {cat.proveedores.map((p: any) => (
                      <option key={p.id_proveedor} value={p.id_proveedor} disabled={!p.habilitado_sunat}>
                        {p.nombre} {p.ruc ? `· ${p.ruc}` : ""} {p.habilitado_sunat ? "" : "(sin vínculo SUNAT)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label className="etiqueta">Tipo *</label>
                  <select className="input-base" value={f.tipo_documento} onChange={(e) => cambiar("tipo_documento", e.target.value)}>
                    <option value="01">Factura (01) {proveedor ? `· serie ${proveedor.serie_factura}` : ""}</option>
                    <option value="03">Boleta (03) {proveedor ? `· serie ${proveedor.serie_boleta}` : ""}</option>
                  </select>
                </div>
                <div className="campo">
                  <label className="etiqueta">Área destinataria</label>
                  <select className="input-base" value={f.id_departamento_empresa} onChange={(e) => cambiar("id_departamento_empresa", e.target.value)}>
                    <option value="">Sin área (solo TI)</option>
                    {cat.areas.map((a: any) => (
                      <option key={a.id_departamento_empresa} value={a.id_departamento_empresa}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label className="etiqueta">Recepción de activos</label>
                  <select className="input-base" value={f.id_recepcion} onChange={(e) => cambiar("id_recepcion", e.target.value)}>
                    <option value="">Ninguna</option>
                    {recepciones.map((r: any) => (
                      <option key={r.id_recepcion} value={r.id_recepcion}>
                        {r.codigo} {r.documento ? `· ${r.documento}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label className="etiqueta">Contrato</label>
                  <select className="input-base" value={f.id_contrato} onChange={(e) => cambiar("id_contrato", e.target.value)}>
                    <option value="">Ninguno</option>
                    {contratos.map((r: any) => (
                      <option key={r.id_contrato} value={r.id_contrato}>
                        {r.codigo} · {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label className="etiqueta">Fecha de emisión *</label>
                  <input type="date" className="input-base" value={f.fecha_emision} onChange={(e) => cambiar("fecha_emision", e.target.value)} />
                </div>
                <div className="campo">
                  <label className="etiqueta">Vencimiento</label>
                  <input type="date" className="input-base" value={f.fecha_vencimiento} onChange={(e) => cambiar("fecha_vencimiento", e.target.value)} />
                </div>
                <div className="campo">
                  <label className="etiqueta">Moneda / pago</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select className="input-base" value={f.moneda} onChange={(e) => cambiar("moneda", e.target.value)}>
                      <option value="PEN">Soles (PEN)</option>
                      <option value="USD">Dólares (USD)</option>
                    </select>
                    <select className="input-base" value={f.forma_pago} onChange={(e) => cambiar("forma_pago", e.target.value)}>
                      <option value="Contado">Contado</option>
                      <option value="Credito">Crédito</option>
                    </select>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "18px 0 8px" }}>Ítems (valores sin IGV, IGV 18%)</h3>
              <div className="contenedor-tabla">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th style={{ minWidth: 170 }}>Activo (opcional)</th>
                      <th style={{ minWidth: 200 }}>Descripción *</th>
                      <th style={{ width: 80 }}>Unidad</th>
                      <th style={{ width: 90 }}>Cantidad</th>
                      <th style={{ width: 120 }}>V. unitario</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, n) => (
                      <tr key={n}>
                        <td>
                          <select className="input-base" value={it.id_activo} onChange={(e) => cambiarItem(n, "id_activo", e.target.value)}>
                            <option value="">—</option>
                            {cat.activos.map((a: any) => (
                              <option key={a.id_activo} value={a.id_activo}>
                                {a.codigo_patrimonial}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input className="input-base" value={it.descripcion} onChange={(e) => cambiarItem(n, "descripcion", e.target.value)} />
                        </td>
                        <td>
                          <input className="input-base" maxLength={3} value={it.unidad} onChange={(e) => cambiarItem(n, "unidad", e.target.value.toUpperCase())} />
                        </td>
                        <td>
                          <input type="number" min="0.001" step="any" className="input-base" value={it.cantidad} onChange={(e) => cambiarItem(n, "cantidad", e.target.value)} />
                        </td>
                        <td>
                          <input type="number" min="0" step="0.01" className="input-base" value={it.valor_unitario} onChange={(e) => cambiarItem(n, "valor_unitario", e.target.value)} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="boton-icono boton-sm boton-icono-peligro"
                            title="Quitar ítem"
                            aria-label="Quitar ítem"
                            disabled={items.length === 1}
                            onClick={() => setItems((xs) => xs.filter((_, i) => i !== n))}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                <button type="button" className="boton-secundario boton-sm" onClick={() => setItems((xs) => [...xs, { ...ITEM_VACIO }])}>
                  Agregar ítem
                </button>
                <div style={{ fontSize: 13 }}>
                  Subtotal {formatoMonto(f.moneda, totales.subtotal)} · IGV {formatoMonto(f.moneda, totales.igv)} ·{" "}
                  <strong>Total {formatoMonto(f.moneda, totales.total)}</strong>
                </div>
              </div>

              <div className="campo" style={{ marginTop: 14 }}>
                <label className="etiqueta">Observaciones</label>
                <textarea className="input-base" rows={2} value={f.observaciones} onChange={(e) => cambiar("observaciones", e.target.value)} />
              </div>
            </>
          )}
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid var(--color-borde)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" className="boton-secundario" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className="boton-primario" disabled={guardando || !cat} onClick={guardar}>
            {guardando ? "Guardando..." : "Guardar borrador"}
          </button>
        </div>
      </div>
    </div>
  );
}
