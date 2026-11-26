"use client";

import { useEffect, useState } from "react";

interface Credencial {
  id_credencial: number;
  nombre_grupo: string;
  contacto: string | null;
  client_id: string;
  limite_rpm: number;
  estado: boolean;
  vigente: boolean;
  fecha_creacion: string;
  fecha_expiracion: string | null;
  fecha_rotacion: string | null;
  ultimo_acceso: string | null;
  total_peticiones: number;
  tokens_activos: number;
  ips_permitidas: string[] | null;
  creado_por: string | null;
}

interface SecretoEmitido {
  client_id: string;
  client_secret: string;
  titulo: string;
}

type Confirmacion = { tipo: "revocar" | "rotar"; credencial: Credencial } | null;

function fecha(valor: string | null) {
  return valor ? new Date(valor).toLocaleString("es-PE") : "—";
}

export default function VistaCredencialesApi() {
  const [credenciales, setCredenciales] = useState<Credencial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre_grupo: "", contacto: "", dias_vigencia: "30", limite_rpm: "60", ips_permitidas: "" });
  const [secreto, setSecreto] = useState<SecretoEmitido | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion>(null);
  const [procesando, setProcesando] = useState(false);
  const [origen, setOrigen] = useState("");

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/integraciones/credenciales", { cache: "no-store" });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error || "No se pudieron cargar las credenciales");
      setCredenciales(datos.credenciales || []);
    } catch (e: any) {
      setError(e.message || "Error de conexión");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    setOrigen(window.location.origin);
    cargar();
  }, []);

  async function emitir(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setErrorForm(null);
    try {
      const res = await fetch("/api/integraciones/credenciales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dias_vigencia: Number(form.dias_vigencia),
          limite_rpm: Number(form.limite_rpm),
        }),
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error || "No se pudo emitir la credencial");
      setFormAbierto(false);
      setForm({ nombre_grupo: "", contacto: "", dias_vigencia: "30", limite_rpm: "60", ips_permitidas: "" });
      setSecreto({ ...datos.credencial, titulo: "Credencial emitida" });
      cargar();
    } catch (e: any) {
      setErrorForm(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function ejecutarConfirmacion() {
    if (!confirmacion) return;
    setProcesando(true);
    setError(null);
    try {
      const res = await fetch(`/api/integraciones/credenciales/${confirmacion.credencial.id_credencial}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: confirmacion.tipo }),
      });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error || "No se pudo completar la acción");
      if (confirmacion.tipo === "rotar") {
        setSecreto({ ...datos.credencial, titulo: "Nuevo secreto generado" });
      } else {
        setAviso(`La credencial de ${confirmacion.credencial.nombre_grupo} fue revocada. Sus tokens dejaron de funcionar.`);
      }
      setConfirmacion(null);
      cargar();
    } catch (e: any) {
      setError(e.message);
      setConfirmacion(null);
    } finally {
      setProcesando(false);
    }
  }

  async function copiar(texto: string, clave: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      setCopiado(null);
    }
  }

  function insigniaEstado(c: Credencial) {
    if (!c.estado) return <span className="insignia insignia-peligro">Revocada</span>;
    if (!c.vigente) return <span className="insignia insignia-aviso">Vencida</span>;
    return <span className="insignia insignia-exito">Vigente</span>;
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="titulo-pagina">Credenciales de acceso</h1>
          <p className="descripcion-pagina">
            Credenciales para que otros equipos consulten los Solicitantes de FlowDesk en modo lectura. El secreto se muestra una
            sola vez y se canjea por un token temporal de 15 minutos.
          </p>
        </div>
        <button type="button" className="boton-primario" onClick={() => { setErrorForm(null); setFormAbierto(true); }}>
          Emitir credencial
        </button>
      </div>

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}
      {aviso && <div className="mensaje-exito" style={{ marginBottom: 16 }}>{aviso}</div>}

      {cargando ? (
        <p className="descripcion">Cargando credenciales...</p>
      ) : credenciales.length === 0 ? (
        <div className="estado-vacio">
          <p style={{ margin: 0 }}>Aún no hay credenciales emitidas. Emita una para entregarla al otro equipo.</p>
        </div>
      ) : (
        <div className="contenedor-tabla" style={{ overflowX: "auto" }}>
          <table className="tabla-datos" style={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th>Equipo o sistema</th>
                <th>Client ID</th>
                <th>Estado</th>
                <th>Vence</th>
                <th>Último acceso</th>
                <th style={{ textAlign: "right" }}>Peticiones</th>
                <th style={{ textAlign: "right" }}>Tokens activos</th>
                <th>IPs permitidas</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {credenciales.map((c) => (
                <tr key={c.id_credencial}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.nombre_grupo}</div>
                    {c.contacto && <div style={{ fontSize: 11.5, color: "#64748b" }}>{c.contacto}</div>}
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{c.client_id}</td>
                  <td>{insigniaEstado(c)}</td>
                  <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{fecha(c.fecha_expiracion)}</td>
                  <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{fecha(c.ultimo_acceso)}</td>
                  <td style={{ textAlign: "right" }}>{c.total_peticiones}</td>
                  <td style={{ textAlign: "right" }}>{c.tokens_activos}</td>
                  <td style={{ fontSize: 11.5, fontFamily: "monospace" }}>
                    {c.ips_permitidas?.length ? c.ips_permitidas.join(", ") : "Cualquiera"}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {c.estado && (
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button type="button" className="boton-secundario boton-sm" onClick={() => setConfirmacion({ tipo: "rotar", credencial: c })}>
                          Rotar secreto
                        </button>
                        <button type="button" className="boton-peligro boton-sm" onClick={() => setConfirmacion({ tipo: "revocar", credencial: c })}>
                          Revocar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="tarjeta" style={{ marginTop: 20, padding: 20 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>Cómo se conecta el otro equipo</h3>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: "#334155" }}>
          <li>
            Pide un token: <code>POST {origen}/api/v1/auth/token</code> con JSON{" "}
            <code>{`{"client_id": "...", "client_secret": "..."}`}</code>
          </li>
          <li>
            Consulta los solicitantes: <code>GET {origen}/api/v1/solicitantes?pagina=1&amp;por_pagina=50</code> con el encabezado{" "}
            <code>Authorization: Bearer &lt;access_token&gt;</code>
          </li>
          <li>El token vence a los 15 minutos; al vencer, se pide uno nuevo con la misma credencial.</li>
        </ol>
        <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "#64748b" }}>
          Entregue el client_id y el client_secret por un canal privado (nunca en un enlace ni en un repositorio). Solo se aceptan
          conexiones HTTPS; tras 5 intentos fallidos la credencial se bloquea 15 minutos.
        </p>
      </div>

      {formAbierto && (
        <div className="modal-overlay" onClick={() => !guardando && setFormAbierto(false)}>
          <div className="modal-contenido" style={{ maxWidth: 520, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 4px", fontSize: 17 }}>Emitir credencial</h2>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
              Acceso de solo lectura a los Solicitantes activos de FlowDesk.
            </p>
            <form onSubmit={emitir}>
              <div className="campo">
                <label htmlFor="cred-nombre">Equipo o sistema</label>
                <input id="cred-nombre" required minLength={3} maxLength={100} value={form.nombre_grupo}
                  onChange={(e) => setForm({ ...form, nombre_grupo: e.target.value })} placeholder="Equipo 10 · Carrito de compras" />
              </div>
              <div className="campo">
                <label htmlFor="cred-contacto">Contacto responsable</label>
                <input id="cred-contacto" maxLength={100} value={form.contacto}
                  onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="Nombre o correo del responsable" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <div className="campo">
                  <label htmlFor="cred-vigencia">Vigencia</label>
                  <select id="cred-vigencia" value={form.dias_vigencia} onChange={(e) => setForm({ ...form, dias_vigencia: e.target.value })}>
                    <option value="7">7 días</option>
                    <option value="30">30 días</option>
                    <option value="60">60 días</option>
                    <option value="90">90 días</option>
                    <option value="180">180 días</option>
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="cred-limite">Peticiones por minuto</label>
                  <input id="cred-limite" type="number" min={5} max={600} value={form.limite_rpm}
                    onChange={(e) => setForm({ ...form, limite_rpm: e.target.value })} />
                </div>
              </div>
              <div className="campo">
                <label htmlFor="cred-ips">IPs permitidas (opcional)</label>
                <textarea id="cred-ips" value={form.ips_permitidas} onChange={(e) => setForm({ ...form, ips_permitidas: e.target.value })}
                  placeholder="Separadas por coma. Vacío = cualquier IP." style={{ minHeight: 60 }} />
              </div>
              {errorForm && <div className="mensaje-error" style={{ marginBottom: 12 }}>{errorForm}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="boton-secundario" disabled={guardando} onClick={() => setFormAbierto(false)}>Cancelar</button>
                <button type="submit" className="boton-primario" disabled={guardando}>{guardando ? "Emitiendo..." : "Emitir"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {secreto && (
        <div className="modal-overlay">
          <div className="modal-contenido" style={{ maxWidth: 560, padding: 24 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 17 }}>{secreto.titulo}</h2>
            <div className="mensaje-error" style={{ margin: "8px 0 16px" }}>
              Copie el secreto ahora: por seguridad no se vuelve a mostrar. Si se pierde, rote el secreto.
            </div>
            {([["Client ID", secreto.client_id, "id"], ["Client secret", secreto.client_secret, "secreto"]] as const).map(([etiqueta, valor, clave]) => (
              <div className="campo" key={clave}>
                <label>{etiqueta}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input readOnly value={valor} style={{ fontFamily: "monospace", fontSize: 12 }} onFocus={(e) => e.target.select()} />
                  <button type="button" className="boton-secundario" onClick={() => copiar(valor, clave)} style={{ flexShrink: 0 }}>
                    {copiado === clave ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" className="boton-primario" onClick={() => setSecreto(null)}>Ya lo guardé</button>
            </div>
          </div>
        </div>
      )}

      {confirmacion && (
        <div className="modal-overlay" onClick={() => !procesando && setConfirmacion(null)}>
          <div className="modal-contenido" style={{ maxWidth: 460, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 8px", fontSize: 17 }}>
              {confirmacion.tipo === "revocar" ? "Revocar credencial" : "Rotar secreto"}
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "#334155" }}>
              {confirmacion.tipo === "revocar"
                ? `${confirmacion.credencial.nombre_grupo} perderá el acceso de inmediato y sus tokens dejarán de funcionar. No se puede deshacer.`
                : `Se generará un secreto nuevo para ${confirmacion.credencial.nombre_grupo}. El anterior y sus tokens dejarán de funcionar.`}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" className="boton-secundario" disabled={procesando} onClick={() => setConfirmacion(null)}>Cancelar</button>
              <button type="button" className={confirmacion.tipo === "revocar" ? "boton-peligro" : "boton-primario"} disabled={procesando} onClick={ejecutarConfirmacion}>
                {procesando ? "Procesando..." : confirmacion.tipo === "revocar" ? "Revocar" : "Rotar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
