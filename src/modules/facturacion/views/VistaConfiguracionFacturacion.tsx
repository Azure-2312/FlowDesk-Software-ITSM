"use client";

// Activos → Configuración → Facturación electrónica (solo Administrador).
// Parámetros de la integración fact_api, prueba de conexión y vínculo de cada
// proveedor con su empresa/sucursal en fact_api.

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
      const res = await fetch("/api/facturacion/configuracion/probar", { method: "POST" });
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
    setAviso("Vínculo del proveedor guardado.");
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
            Integración con la API de facturación electrónica (fact_api) para los comprobantes de los proveedores de activos. Las
            credenciales de la API se definen en el servidor (FACT_API_EMAIL / FACT_API_PASSWORD o FACT_API_TOKEN), no aquí.
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
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Conexión con fact_api</h2>
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
                <label className="etiqueta">URL base de fact_api</label>
                <input className="input-base" value={config.url_base} onChange={(e) => set("url_base", e.target.value)} placeholder="https://facturacion.midominio.pe" />
              </div>
              <div className="campo">
                <label className="etiqueta">Tiempo de espera (ms)</label>
                <input type="number" className="input-base" value={config.tiempo_espera_ms} onChange={(e) => set("tiempo_espera_ms", Number(e.target.value))} />
              </div>
              <div className="campo">
                <label className="etiqueta">Credenciales en el servidor</label>
                <div style={{ fontSize: 13, paddingTop: 8 }}>
                  {datos.credenciales.token
                    ? "Token configurado (FACT_API_TOKEN)"
                    : datos.credenciales.usuario
                    ? "Usuario configurado (FACT_API_EMAIL)"
                    : "Sin credenciales: defina las variables de entorno"}
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
            <h2 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Proveedores habilitados para emitir</h2>
            <p className="descripcion-pagina" style={{ marginBottom: 14 }}>
              Cada proveedor necesita su RUC y el ID de su empresa y sucursal en fact_api (donde están su certificado y credenciales SOL).
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
                      <th>Empresa / sucursal fact_api</th>
                      <th>Series</th>
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
                          {p.fact_company_id ?? "—"} / {p.fact_branch_id ?? "—"}
                        </td>
                        <td>
                          {p.serie_factura} · {p.serie_boleta}
                        </td>
                        <td>
                          <span className={p.habilitado_sunat ? "insignia insignia-exito" : "insignia insignia-aviso"}>
                            {p.habilitado_sunat ? "Habilitado" : "Sin vínculo"}
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
              <p className="descripcion-pagina">Datos tributarios y vínculo con fact_api</p>
            </div>
            <div style={{ padding: "18px 22px", ...rejilla }}>
              {[
                ["ruc", "RUC"],
                ["razon_social", "Razón social"],
                ["fact_company_id", "ID empresa (company_id)"],
                ["fact_branch_id", "ID sucursal (branch_id)"],
                ["serie_factura", "Serie de facturas"],
                ["serie_boleta", "Serie de boletas"],
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
