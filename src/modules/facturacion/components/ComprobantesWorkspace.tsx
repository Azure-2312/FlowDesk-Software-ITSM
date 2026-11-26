"use client";

// ============================================================================
// COMPROBANTES ELECTRÓNICOS DE PROVEEDORES (SUNAT vía Nubefact)
// Un solo espacio de trabajo sobre la misma base de información; el `modo`
// (pestaña autorizada al perfil) decide qué se lista y qué acciones se ofrecen:
//   registro     → Gestor de Activos / Admin: registrar, emitir a SUNAT, consultar estado
//   conformidad  → Gestor de Área: dar conformidad a los comprobantes de su área
//   consulta     → Auditor / Gestor de Activos / Admin: consulta y trazabilidad (solo lectura)
// ============================================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import Pestanas from "@/shared/components/ui/Pestanas";
import FormularioComprobante from "./FormularioComprobante";

export type ModoComprobantes = "registro" | "conformidad" | "consulta";

interface FilaComprobante {
  id_comprobante: number;
  codigo: string;
  tipo_documento: "01" | "03";
  serie: string;
  correlativo: string | null;
  fecha_emision: string;
  moneda: string;
  total: string;
  estado: string;
  estado_sunat: string | null;
  mensaje_sunat: string | null;
  conformidad: string;
  proveedor: string;
  proveedor_ruc: string | null;
  area: string | null;
  recepcion_codigo: string | null;
}

const TIPO: Record<string, string> = { "01": "Factura", "03": "Boleta" };

const CLASE_ESTADO: Record<string, string> = {
  BORRADOR: "insignia",
  REGISTRADO: "insignia insignia-info",
  ACEPTADO: "insignia insignia-exito",
  RECHAZADO: "insignia insignia-peligro",
  ERROR: "insignia insignia-peligro",
  ANULADO: "insignia",
};
const CLASE_CONFORMIDAD: Record<string, string> = {
  PENDIENTE: "insignia insignia-aviso",
  CONFORME: "insignia insignia-exito",
  OBSERVADO: "insignia insignia-peligro",
};

const TEXTOS: Record<ModoComprobantes, { titulo: string; descripcion: string }> = {
  registro: {
    titulo: "Comprobantes electrónicos de proveedores",
    descripcion:
      "Registro de facturas y boletas de los proveedores de activos, emisión y envío a SUNAT mediante la API de facturación electrónica.",
  },
  conformidad: {
    titulo: "Conformidad de comprobantes",
    descripcion:
      "Comprobantes aceptados por SUNAT por bienes entregados a tu área. Tu conformidad confirma la recepción y registra el costo en los activos.",
  },
  consulta: {
    titulo: "Consulta de comprobantes electrónicos",
    descripcion: "Consulta de todos los comprobantes de proveedores, su estado en SUNAT, la conformidad del área y su trazabilidad.",
  },
};

export function numeroComprobante(c: { serie: string; correlativo: string | null }) {
  return c.correlativo ? `${c.serie}-${c.correlativo}` : `${c.serie}-(por asignar)`;
}

export function formatoMonto(moneda: string, monto: string | number) {
  const n = Number(monto || 0);
  return `${moneda === "USD" ? "US$" : "S/"} ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fecha(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(String(v).length <= 10 ? `${v}T00:00:00` : v).toLocaleDateString("es-PE");
}

export default function ComprobantesWorkspace({ modo }: { modo: ModoComprobantes }) {
  const [filas, setFilas] = useState<FilaComprobante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [filtro, setFiltro] = useState<string>(modo === "conformidad" ? "pendientes" : "todos");
  const [abierto, setAbierto] = useState<number | null>(null);
  const [creando, setCreando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/facturacion/comprobantes?_t=${Date.now()}`, { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudieron cargar los comprobantes.");
      setFilas(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const pestanas = useMemo(() => {
    if (modo === "conformidad") {
      const pend = filas.filter((f) => f.estado === "ACEPTADO" && f.conformidad === "PENDIENTE").length;
      return [
        { id: "pendientes", etiqueta: "Por dar conformidad", contador: pend },
        { id: "atendidos", etiqueta: "Atendidos" },
        { id: "todos", etiqueta: "Todos de mi área" },
      ];
    }
    const cuenta = (e: string[]) => filas.filter((f) => e.includes(f.estado)).length;
    return [
      { id: "todos", etiqueta: "Todos", contador: filas.length },
      { id: "por-enviar", etiqueta: "Por enviar", contador: cuenta(["BORRADOR", "ERROR"]) },
      { id: "pendientes-sunat", etiqueta: "Pendientes en SUNAT", contador: cuenta(["REGISTRADO"]) },
      { id: "aceptados", etiqueta: "Aceptados", contador: cuenta(["ACEPTADO"]) },
      { id: "rechazados", etiqueta: "Rechazados", contador: cuenta(["RECHAZADO"]) },
    ];
  }, [filas, modo]);

  const visibles = useMemo(() => {
    let lista = filas;
    if (modo === "conformidad") {
      if (filtro === "pendientes") lista = lista.filter((f) => f.estado === "ACEPTADO" && f.conformidad === "PENDIENTE");
      if (filtro === "atendidos") lista = lista.filter((f) => f.conformidad !== "PENDIENTE");
    } else {
      if (filtro === "por-enviar") lista = lista.filter((f) => ["BORRADOR", "ERROR"].includes(f.estado));
      if (filtro === "pendientes-sunat") lista = lista.filter((f) => f.estado === "REGISTRADO");
      if (filtro === "aceptados") lista = lista.filter((f) => f.estado === "ACEPTADO");
      if (filtro === "rechazados") lista = lista.filter((f) => f.estado === "RECHAZADO");
    }
    const q = texto.trim().toLowerCase();
    if (q) {
      lista = lista.filter((f) =>
        [f.codigo, f.proveedor, f.proveedor_ruc, numeroComprobante(f), f.area, f.recepcion_codigo]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return lista;
  }, [filas, filtro, texto, modo]);

  // El título corresponde a la pestaña activa; "Todos" usa el título general del modo.
  const TITULO_FILTRO: Record<string, string> = {
    "por-enviar": "Comprobantes por enviar a SUNAT",
    aceptados: "Comprobantes aceptados por SUNAT",
    rechazados: "Comprobantes rechazados por SUNAT",
    pendientes: "Comprobantes por dar conformidad",
    atendidos: "Comprobantes con conformidad registrada",
  };
  const titulo = TITULO_FILTRO[filtro] ?? TEXTOS[modo].titulo;
  const { descripcion } = TEXTOS[modo];

  return (
    <div className="vista-contenedor">
      <Pestanas items={pestanas} activa={filtro} onCambiar={setFiltro} />

      <div className="cabecera-pagina">
        <div>
          <h1 className="titulo-pagina">{titulo}</h1>
          <p className="descripcion-pagina">{descripcion}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="boton-secundario" onClick={cargar} disabled={cargando}>
            Actualizar
          </button>
          {modo === "registro" && (
            <button type="button" className="boton-primario" onClick={() => setCreando(true)}>
              Registrar comprobante
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <input
          className="input-base"
          placeholder="Buscar por código, proveedor, RUC, serie-número, área o recepción..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>

      {error && <div className="mensaje-error">{error}</div>}

      {cargando ? (
        <div className="estado-vacio">Cargando comprobantes...</div>
      ) : visibles.length === 0 ? (
        <div className="estado-vacio">
          {modo === "conformidad" && filtro === "pendientes"
            ? "No hay comprobantes pendientes de conformidad para tu área."
            : "No hay comprobantes que coincidan con el filtro."}
        </div>
      ) : (
        <div className="contenedor-tabla tarjeta-contenido" style={{ padding: 0 }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Comprobante</th>
                <th>Proveedor</th>
                <th>Emisión</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th>SUNAT</th>
                <th>Conformidad</th>
                {modo !== "conformidad" && <th>Área</th>}
                <th />
              </tr>
            </thead>
            <tbody>
              {visibles.map((f) => (
                <tr key={f.id_comprobante}>
                  <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{f.codigo}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {TIPO[f.tipo_documento]}
                    <div style={{ fontSize: 11.5, color: "var(--color-texto-tenue)" }}>{numeroComprobante(f)}</div>
                  </td>
                  <td>
                    <div>{f.proveedor}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-texto-tenue)" }}>RUC {f.proveedor_ruc || "—"}</div>
                  </td>
                  <td>{fecha(f.fecha_emision)}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{formatoMonto(f.moneda, f.total)}</td>
                  <td>
                    <span className={CLASE_ESTADO[f.estado] || "insignia"} title={f.mensaje_sunat || undefined}>
                      {f.estado}
                    </span>
                  </td>
                  <td>
                    {f.estado === "ACEPTADO" ? (
                      <span className={CLASE_CONFORMIDAD[f.conformidad] || "insignia"}>{f.conformidad}</span>
                    ) : (
                      <span className="insignia">No aplica</span>
                    )}
                  </td>
                  {modo !== "conformidad" && <td>{f.area || "—"}</td>}
                  <td style={{ textAlign: "right" }}>
                    <button type="button" className="boton-secundario boton-sm" onClick={() => setAbierto(f.id_comprobante)}>
                      {modo === "conformidad" && f.estado === "ACEPTADO" && f.conformidad === "PENDIENTE" ? "Revisar" : "Ver detalle"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {abierto != null && (
        <DetalleComprobante id={abierto} modo={modo} onCerrar={() => setAbierto(null)} onCambio={cargar} />
      )}
      {creando && (
        <FormularioComprobante
          onCerrar={() => setCreando(false)}
          onCreado={(id) => {
            setCreando(false);
            cargar();
            setAbierto(id);
          }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Detalle: mismas secciones para todos; las acciones dependen del modo
// ----------------------------------------------------------------------------

function DetalleComprobante({
  id,
  modo,
  onCerrar,
  onCambio,
}: {
  id: number;
  modo: ModoComprobantes;
  onCerrar: () => void;
  onCambio: () => void;
}) {
  const [c, setC] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [seccion, setSeccion] = useState<"items" | "trazabilidad">("items");
  const [observacion, setObservacion] = useState("");

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`/api/facturacion/comprobantes/${id}?_t=${Date.now()}`, { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo cargar el comprobante.");
      setC(d);
    } catch (e: any) {
      setError(e.message);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function accion(ruta: string, metodo: string, cuerpo?: unknown, exito?: string) {
    setOcupado(true);
    setError(null);
    setAviso(null);
    try {
      const res = await fetch(`/api/facturacion/comprobantes/${id}${ruta}`, {
        method: metodo,
        headers: cuerpo ? { "Content-Type": "application/json" } : undefined,
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || "La operación no se completó.");
      setAviso(exito || d.mensaje || "Operación realizada.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setOcupado(false);
      await cargar();
      onCambio();
    }
  }

  const puedeEmitir = modo === "registro" && c && ["BORRADOR", "ERROR"].includes(c.estado);
  const puedeConsultar = modo === "registro" && c?.correlativo && !["BORRADOR", "ERROR"].includes(c.estado);
  const puedeConformidad = modo === "conformidad" && c?.estado === "ACEPTADO" && c?.conformidad !== "CONFORME";
  const hayArchivos = Boolean(c?.correlativo) && !["BORRADOR", "ERROR"].includes(c?.estado);

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" style={{ overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--color-borde)", display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
              {c ? `${TIPO[c.tipo_documento]} ${numeroComprobante(c)}` : "Comprobante"}
            </h2>
            {c && (
              <p className="descripcion-pagina">
                {c.codigo} · {c.proveedor} (RUC {c.proveedor_ruc || "—"})
              </p>
            )}
          </div>
          <button type="button" className="boton-icono" onClick={onCerrar} title="Cerrar" aria-label="Cerrar">
            ×
          </button>
        </div>

        <div style={{ padding: "18px 22px" }}>
          {error && <div className="mensaje-error">{error}</div>}
          {aviso && <div className="mensaje-exito">{aviso}</div>}
          {!c ? (
            !error && <div className="estado-vacio">Cargando...</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(170px, 100%), 1fr))", gap: 14, marginBottom: 16 }}>
                <Dato etiqueta="Estado SUNAT">
                  <span className={CLASE_ESTADO[c.estado] || "insignia"}>{c.estado}</span>
                </Dato>
                <Dato etiqueta="Conformidad del área">
                  <span className={CLASE_CONFORMIDAD[c.conformidad] || "insignia"}>{c.conformidad}</span>
                </Dato>
                <Dato etiqueta="Total">{formatoMonto(c.moneda, c.total)}</Dato>
                <Dato etiqueta="Emisión / vencimiento">
                  {fecha(c.fecha_emision)} / {fecha(c.fecha_vencimiento)}
                </Dato>
                <Dato etiqueta="Área destinataria">{c.area || "—"}</Dato>
                <Dato etiqueta="Recepción / contrato">
                  {c.recepcion_codigo || "—"} / {c.contrato_codigo || "—"}
                </Dato>
                <Dato etiqueta="Forma de pago">{c.forma_pago}</Dato>
                <Dato etiqueta="Estado en SUNAT">{c.estado_sunat || "—"}</Dato>
              </div>

              {c.mensaje_sunat && (
                <div className={c.estado === "ACEPTADO" ? "mensaje-exito" : "mensaje-error"}>Respuesta: {c.mensaje_sunat}</div>
              )}
              {c.observacion_conformidad && (
                <div className={c.conformidad === "CONFORME" ? "mensaje-exito" : "mensaje-error"}>
                  Comentario del área ({c.usuario_conformidad_nombre || "—"}): {c.observacion_conformidad}
                </div>
              )}

              <Pestanas
                items={[
                  { id: "items", etiqueta: "Ítems", contador: c.items.length },
                  { id: "trazabilidad", etiqueta: "Trazabilidad", contador: c.eventos.length },
                ]}
                activa={seccion}
                onCambiar={setSeccion}
              />

              {seccion === "items" ? (
                <div className="contenedor-tabla">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Descripción</th>
                        <th>Activo</th>
                        <th style={{ textAlign: "right" }}>Cant.</th>
                        <th style={{ textAlign: "right" }}>V. unitario</th>
                        <th style={{ textAlign: "right" }}>IGV</th>
                        <th style={{ textAlign: "right" }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.items.map((i: any) => (
                        <tr key={i.id_detalle}>
                          <td>
                            {i.descripcion}
                            <div style={{ fontSize: 11.5, color: "var(--color-texto-tenue)" }}>
                              {i.codigo} · {i.unidad}
                            </div>
                          </td>
                          <td>{i.codigo_patrimonial || "—"}</td>
                          <td style={{ textAlign: "right" }}>{Number(i.cantidad)}</td>
                          <td style={{ textAlign: "right" }}>{formatoMonto(c.moneda, i.valor_unitario)}</td>
                          <td style={{ textAlign: "right" }}>{formatoMonto(c.moneda, i.igv)}</td>
                          <td style={{ textAlign: "right" }}>{formatoMonto(c.moneda, i.total)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={4} style={{ textAlign: "right", fontWeight: 600 }}>
                          Subtotal {formatoMonto(c.moneda, c.subtotal)} · IGV {formatoMonto(c.moneda, c.igv)}
                        </td>
                        <td colSpan={2} style={{ textAlign: "right", fontWeight: 700 }}>
                          {formatoMonto(c.moneda, c.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : c.eventos.length === 0 ? (
                <div className="estado-vacio">Sin eventos registrados.</div>
              ) : (
                <div className="contenedor-tabla">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Acción</th>
                        <th>Estado</th>
                        <th>Usuario / perfil</th>
                        <th>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.eventos.map((e: any) => (
                        <tr key={e.id_evento}>
                          <td style={{ whiteSpace: "nowrap" }}>{new Date(e.fecha).toLocaleString("es-PE")}</td>
                          <td>{e.accion.replace(/_/g, " ")}</td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {e.estado_anterior || "—"} → {e.estado_nuevo || "—"}
                          </td>
                          <td>
                            {e.usuario || "—"}
                            <div style={{ fontSize: 11.5, color: "var(--color-texto-tenue)" }}>{e.perfil || ""}</div>
                          </td>
                          <td style={{ fontSize: 12, color: "var(--color-texto-secundario)" }}>
                            {e.detalle?.mensaje || e.detalle?.observacion || (e.detalle?.activos_actualizados != null ? `${e.detalle.activos_actualizados} activo(s) con costo actualizado` : "")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {puedeConformidad && (
                <div className="tarjeta-contenido" style={{ marginTop: 16 }}>
                  <label className="etiqueta" htmlFor="obs-conformidad">
                    Observación (obligatoria si observas el comprobante)
                  </label>
                  <textarea
                    id="obs-conformidad"
                    className="input-base"
                    rows={3}
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Ej.: se recibieron 4 de 5 equipos; falta el cargador del ítem 2."
                  />
                </div>
              )}
            </>
          )}
        </div>

        {c && (
          <div style={{ padding: "14px 22px", borderTop: "1px solid var(--color-borde)", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" }}>
            {hayArchivos && (
              <>
                <a className="boton-secundario" href={`/api/facturacion/comprobantes/${id}/archivo?tipo=pdf`}>Descargar PDF</a>
                <a className="boton-secundario" href={`/api/facturacion/comprobantes/${id}/archivo?tipo=xml`}>XML</a>
                {c.estado === "ACEPTADO" && (
                  <a className="boton-secundario" href={`/api/facturacion/comprobantes/${id}/archivo?tipo=cdr`}>CDR</a>
                )}
              </>
            )}
            {modo === "registro" && c.estado === "BORRADOR" && (
              <button type="button" className="boton-peligro" disabled={ocupado} onClick={() => accion("", "DELETE", undefined, "Borrador anulado.")}>
                Anular borrador
              </button>
            )}
            {puedeConsultar && (
              <button type="button" className="boton-secundario" disabled={ocupado} onClick={() => accion("/estado", "POST", undefined, "Estado actualizado desde SUNAT.")}>
                Consultar estado en SUNAT
              </button>
            )}
            {puedeEmitir && (
              <button type="button" className="boton-primario" disabled={ocupado} onClick={() => accion("/emitir", "POST")}>
                {ocupado ? "Enviando..." : c.estado === "BORRADOR" ? "Emitir y enviar a SUNAT" : "Reintentar envío"}
              </button>
            )}
            {puedeConformidad && (
              <>
                <button
                  type="button"
                  className="boton-peligro"
                  disabled={ocupado}
                  onClick={() => accion("/conformidad", "POST", { decision: "OBSERVADO", observacion }, "Comprobante observado.")}
                >
                  Observar
                </button>
                <button
                  type="button"
                  className="boton-primario"
                  disabled={ocupado}
                  onClick={() => accion("/conformidad", "POST", { decision: "CONFORME", observacion: observacion || null }, "Conformidad registrada.")}
                >
                  Dar conformidad
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--color-texto-tenue)", marginBottom: 3 }}>{etiqueta}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{children}</div>
    </div>
  );
}
