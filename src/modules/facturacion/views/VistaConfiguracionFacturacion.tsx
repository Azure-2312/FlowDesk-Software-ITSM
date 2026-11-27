"use client";

// Activos → Configuración → Facturación electrónica (solo Administrador).
// Parámetros de la integración con Nubefact (proveedor autorizado por SUNAT),
// prueba de conexión y datos tributarios de cada proveedor.

import { useCallback, useEffect, useState } from "react";

export default function VistaConfiguracionFacturacion() {
  const [datos, setDatos] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [prueba, setPrueba] = useState<any>(null);
  const [probando, setProbando] = useState(false);
  const [editando, setEditando] = useState<any>(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`/api/facturacion/configuracion?_t=${Date.now()}`, { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo cargar la configuración.");
      setDatos(d);
      setConfig(d.config);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function guardar() {
    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      const res = await fetch("/api/facturacion/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo guardar.");
      setAviso("Configuración guardada.");
      await cargar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function probar() {
    setProbando(true);
    setPrueba(null);
    try {
      const res = await fetch("/api/facturacion/configuracion/probar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ruta: config?.ruta ?? "",
          serie_factura: config?.serie_factura,
          tiempo_espera_ms: config?.tiempo_espera_ms,
        }),
      });
      const d = await res.json();
      setPrueba(res.ok ? d : { ok: false, pasos: [{ paso: "Prueba", ok: false, detalle: d.error }] });
    } finally {
      setProbando(false);
    }
  }

  async function guardarProveedor() {
    setError(null);
    setAviso(null);
    const res = await fetch(`/api/facturacion/proveedores/${editando.id_proveedor}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editando),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(d.error || "No se pudo guardar el proveedor.");
      return;
    }
    setEditando(null);
    setAviso("Datos del proveedor guardados.");
    cargar();
  }

  const set = (k: string, v: unknown) => setConfig((c: any) => ({ ...c, [k]: v }));
  const rejilla = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 14 } as const;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <div>
          <h1 className="titulo-pagina">Facturación electrónica (SUNAT)</h1>
          <p className="descripcion-pagina">
            Emisión de facturas y boletas electrónicas a SUNAT a través de Nubefact, proveedor autorizado por SUNAT. El token de
            Nubefact se define en el servidor (variable NUBEFACT_TOKEN), nunca en esta pantalla.
          </p>
        </div>
      </div>

      {error && <div className="mensaje-error">{error}</div>}
      {aviso && <div className="mensaje-exito">{aviso}</div>}

      {!config ? (
        !error && <div className="estado-vacio">Cargando configuración...</div>
      ) : (
        <>
          <section className="tarjeta-contenido" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Conexión con Nubefact</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13 }}>{config.habilitado ? "Integración activa" : "Integración inactiva"}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={config.habilitado}
                  className={config.habilitado ? "interruptor interruptor-activo" : "interruptor"}
                  title={config.habilitado ? "Desactivar integración" : "Activar integración"}
                  onClick={() => set("habilitado", !config.habilitado)}
                />
              </div>
            </div>
            <div style={rejilla}>
              <div className="campo">
                <label className="etiqueta">Ruta de la cuenta (API Integración)</label>
                <input className="input-base" value={config.ruta} onChange={(e) => set("ruta", e.target.value.trim())} placeholder="https://api.nubefact.com/api/v1/..." />
              </div>
              <div className="campo">
                <label className="etiqueta">Serie de facturas</label>
                <input className="input-base" maxLength={4} value={config.serie_factura} onChange={(e) => set("serie_factura", e.target.value.toUpperCase())} />
              </div>
              <div className="campo">
                <label className="etiqueta">Serie de boletas</label>
                <input className="input-base" maxLength={4} value={config.serie_boleta} onChange={(e) => set("serie_boleta", e.target.value.toUpperCase())} />
              </div>
              <div className="campo">
                <label className="etiqueta">Tiempo de espera (ms)</label>
                <input type="number" className="input-base" value={config.tiempo_espera_ms} onChange={(e) => set("tiempo_espera_ms", Number(e.target.value))} />
              </div>
              <div className="campo">
                <label className="etiqueta">Token en el servidor</label>
                <div style={{ fontSize: 13, paddingTop: 8 }}>
                  {datos.credenciales.token ? "Configurado (NUBEFACT_TOKEN)" : "Sin token: defina NUBEFACT_TOKEN en el servidor"}
                </div>
              </div>
            </div>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: "16px 0 10px" }}>Institución (cliente de los comprobantes)</h3>
            <div style={rejilla}>
              <div className="campo">
                <label className="etiqueta">RUC *</label>
                <input className="input-base" maxLength={11} value={config.ruc_institucion} onChange={(e) => set("ruc_institucion", e.target.value.replace(/\D/g, ""))} />
              </div>
              <div className="campo">
                <label className="etiqueta">Razón social</label>
                <input className="input-base" value={config.razon_social_institucion} onChange={(e) => set("razon_social_institucion", e.target.value)} />
              </div>
              <div className="campo">
                <label className="etiqueta">Dirección fiscal</label>
                <input className="input-base" value={config.direccion_institucion} onChange={(e) => set("direccion_institucion", e.target.value)} />
              </div>
            </div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, marginTop: 12 }}>
              <input type="checkbox" checked={config.exigir_conformidad_para_costo} onChange={(e) => set("exigir_conformidad_para_costo", e.target.checked)} />
              Registrar el costo de compra en los activos cuando el área da conformidad
            </label>

            {prueba && (
              <div className={prueba.ok ? "mensaje-exito" : "mensaje-error"} style={{ marginTop: 14 }}>
                {prueba.pasos.map((p: any) => (
                  <div key={p.paso}>
                    {p.ok ? "Correcto" : "Falló"} · {p.paso}: {p.detalle}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 14, flexWrap: "wrap" }}>
              <button type="button" className="boton-secundario" disabled={probando} onClick={probar}>
                {probando ? "Probando..." : "Probar conexión"}
              </button>
              <button type="button" className="boton-primario" disabled={guardando} onClick={guardar}>
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </section>

          <section className="tarjeta-contenido">
            <h2 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Datos tributarios de los proveedores</h2>
            <p className="descripcion-pagina" style={{ marginBottom: 14 }}>
              Los comprobantes se emiten desde la cuenta de Nubefact; el RUC y la razón social del proveedor identifican a quién corresponde cada comprobante en FlowDesk.
            </p>
            {datos.proveedores.length === 0 ? (
              <div className="estado-vacio">No hay proveedores registrados. Créelos en Activos → Contratos y proveedores.</div>
            ) : (
              <div className="contenedor-tabla">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Proveedor</th>
                      <th>RUC</th>
                      <th>Estado</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {datos.proveedores.map((p: any) => (
                      <tr key={p.id_proveedor}>
                        <td>
                          {p.razon_social || p.nombre}
                          <div style={{ fontSize: 11.5, color: "var(--color-texto-tenue)" }}>{p.codigo_proveedor}</div>
                        </td>
                        <td>{p.ruc || "—"}</td>
                        <td>
                          <span className={p.habilitado_sunat ? "insignia insignia-exito" : "insignia insignia-aviso"}>
                            {p.habilitado_sunat ? "Con RUC" : "Sin RUC"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button type="button" className="boton-secundario boton-sm" onClick={() => setEditando({ ...p })}>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {editando && (
        <div className="modal-overlay" onClick={() => setEditando(null)}>
          <div className="modal-contenido" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--color-borde)" }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{editando.nombre}</h2>
              <p className="descripcion-pagina">Datos tributarios del proveedor</p>
            </div>
            <div style={{ padding: "18px 22px", ...rejilla }}>
              {[
                ["ruc", "RUC"],
                ["razon_social", "Razón social"],
              ].map(([k, etiqueta]) => (
                <div className="campo" key={k}>
                  <label className="etiqueta">{etiqueta}</label>
                  <input
                    className="input-base"
                    value={editando[k] ?? ""}
                    onChange={(e) => setEditando((x: any) => ({ ...x, [k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 22px", borderTop: "1px solid var(--color-borde)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" className="boton-secundario" onClick={() => setEditando(null)}>
                Cancelar
              </button>
              <button type="button" className="boton-primario" onClick={guardarProveedor}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
