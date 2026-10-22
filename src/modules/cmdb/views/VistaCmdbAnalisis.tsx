"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type CiItem = {
  id_ci: number;
  codigo_ci: string;
  nombre: string;
  tipo_ci: string;
  ambiente: string;
  criticidad: string;
};

type NodoTopologia = CiItem & {
  es_raiz: boolean;
  nivel_asc: number | null;
  nivel_desc: number | null;
};

type Arista = { id_ci_padre: number; id_ci_hijo: number; tipo_relacion: string };

type Tab = "reconciliacion" | "topologia" | "impacto" | "historial";

const COLOR_TIPO: Record<string, string> = {
  APLICACION: "#2563eb",
  SERVIDOR_LOGICO: "#7c3aed",
  BASE_DATOS: "#0891b2",
  NODO_RED: "#ea580c",
  SERVICIO_TI: "#059669",
};

function colorNodo(n: NodoTopologia): string {
  if (n.es_raiz) return "#0f172a";
  return COLOR_TIPO[n.tipo_ci] || "#64748b";
}

function MapaTopologia({ datos }: { datos: any }) {
  const nodos: NodoTopologia[] = datos?.nodos || [];
  const aristas: Arista[] = datos?.aristas || [];
  const W = 940;
  const H = 500;
  const cx = W / 2;
  const cy = H / 2;

  const raiz = nodos.find((n) => n.es_raiz);
  const abajo = nodos.filter((n) => !n.es_raiz && n.nivel_desc != null);
  const arriba = nodos.filter((n) => !n.es_raiz && n.nivel_desc == null && n.nivel_asc != null);

  const posiciones = new Map<number, { x: number; y: number }>();
  if (raiz) posiciones.set(raiz.id_ci, { x: cx, y: cy });

  function ubicar(lista: NodoTopologia[], lado: 1 | -1, nivelDe: (n: NodoTopologia) => number) {
    const porNivel = new Map<number, NodoTopologia[]>();
    for (const n of lista) {
      const nivel = nivelDe(n);
      if (!porNivel.has(nivel)) porNivel.set(nivel, []);
      porNivel.get(nivel)!.push(n);
    }
    for (const [nivel, grupo] of porNivel) {
      const radio = 155 + (nivel - 1) * 85;
      const total = grupo.length;
      const spread = Math.PI * 0.9;
      grupo.forEach((n, i) => {
        const frac = total === 1 ? 0.5 : (i + 0.5) / total;
        const local = -spread / 2 + frac * spread;
        const angulo = lado === 1 ? local : Math.PI - local;
        posiciones.set(n.id_ci, {
          x: cx + radio * Math.cos(angulo),
          y: cy + radio * Math.sin(angulo),
        });
      });
    }
  }
  ubicar(abajo, 1, (n) => n.nivel_desc ?? 1);
  ubicar(arriba, -1, (n) => n.nivel_asc ?? 1);

  if (nodos.length === 0) {
    return <div style={{ padding: 24, color: "#64748b" }}>Sin elementos para dibujar.</div>;
  }

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8 }}
      >
        {aristas.map((a, i) => {
          const p1 = posiciones.get(a.id_ci_padre);
          const p2 = posiciones.get(a.id_ci_hijo);
          if (!p1 || !p2) return null;
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray={a.tipo_relacion === "CONECTADO_CON" ? "5 4" : undefined}
            />
          );
        })}
        {nodos.map((n) => {
          const p = posiciones.get(n.id_ci);
          if (!p) return null;
          const r = n.es_raiz ? 18 : 12;
          return (
            <g key={n.id_ci}>
              <title>
                [{n.codigo_ci}] {n.nombre} — {n.tipo_ci} / {n.ambiente} ({n.criticidad})
              </title>
              <circle cx={p.x} cy={p.y} r={r} fill={colorNodo(n)} stroke="#ffffff" strokeWidth={2} />
              <text
                x={p.x}
                y={p.y + r + 13}
                textAnchor="middle"
                fontSize={n.es_raiz ? 12.5 : 10.5}
                fontWeight={n.es_raiz ? 700 : 500}
                fill="#334155"
              >
                {n.codigo_ci}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 12, fontSize: 12, color: "#475569" }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 6, background: "#0f172a", marginRight: 6 }} />CI analizado</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 6, background: "#f59e0b", marginRight: 6 }} />Depende de (upstream)</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 6, background: "#2563eb", marginRight: 6 }} />Dependientes (downstream)</span>
      </div>
    </div>
  );
}

export default function VistaCmdbAnalisis() {
  const [tab, setTab] = useState<Tab>("reconciliacion");
  const [listaCis, setListaCis] = useState<CiItem[]>([]);
  const [idCi, setIdCi] = useState<number | "">("");
  const [profundidad, setProfundidad] = useState(2);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconciliacion, setReconciliacion] = useState<any>(null);
  const [topologia, setTopologia] = useState<any>(null);
  const [impacto, setImpacto] = useState<any>(null);
  const [historial, setHistorial] = useState<any>(null);

  useEffect(() => {
    fetch("/api/activos/cmdb?estado=activos")
      .then((r) => r.json())
      .then((d) => setListaCis(d.elementos || []))
      .catch(() => setError("No se pudo cargar la lista de elementos de configuración."));
  }, []);

  const cargar = useCallback(async () => {
    setError(null);
    setCargando(true);
    try {
      if (tab === "reconciliacion") {
        const r = await fetch("/api/activos/cmdb/analisis?vista=reconciliacion");
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Error");
        setReconciliacion(d);
      } else {
        if (!idCi) {
          setCargando(false);
          return;
        }
        if (tab === "topologia") {
          const r = await fetch(`/api/activos/cmdb/analisis?vista=topologia&id_ci=${idCi}&profundidad=${profundidad}`);
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Error");
          setTopologia(d);
        } else if (tab === "impacto") {
          const r = await fetch(`/api/activos/cmdb/analisis?vista=impacto&id_ci=${idCi}`);
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Error");
          setImpacto(d);
        } else {
          const r = await fetch(`/api/activos/cmdb/analisis?vista=historial&id_ci=${idCi}`);
          const d = await r.json();
          if (!r.ok) throw new Error(d.error || "Error");
          setHistorial(d);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Error de conexión al consultar el análisis de la CMDB.");
    } finally {
      setCargando(false);
    }
  }, [tab, idCi, profundidad]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const requiereCi = tab !== "reconciliacion";

  const tabs: { id: Tab; label: string }[] = [
    { id: "reconciliacion", label: "Reconciliación Activo ↔ CI" },
    { id: "topologia", label: "Mapa de Topología" },
    { id: "impacto", label: "Análisis de Impacto" },
    { id: "historial", label: "Historial de Configuración" },
  ];

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Análisis e Impacto de la CMDB</h1>
          <p className="descripcion">
            Topología de dependencias, análisis de impacto en fallas y cambios, reconciliación Activo ↔ CI e historial de configuración (ITIL v4).
          </p>
        </div>
        <Link
          href="/activos/cmdb"
          className="boton-secundario"
          style={{ textDecoration: "none", fontSize: 13, padding: "8px 14px" }}
        >
          ← Volver a la CMDB
        </Link>
      </div>

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Pestanas */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1px solid #e2e8f0", marginBottom: 18 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? "2px solid #2563eb" : "2px solid transparent",
              color: tab === t.id ? "#2563eb" : "#64748b",
              fontWeight: 600,
              fontSize: 13.5,
              padding: "10px 12px",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Selector de CI */}
      {requiereCi && (
        <div className="barra-filtros" style={{ marginBottom: 18 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Elemento de Configuración (CI)</label>
            <select
              className="input-base"
              value={idCi}
              onChange={(e) => setIdCi(e.target.value ? Number(e.target.value) : "")}
              style={{ fontSize: 13, backgroundColor: "white", width: "100%" }}
            >
              <option value="">— Seleccionar CI —</option>
              {listaCis.map((c) => (
                <option key={c.id_ci} value={c.id_ci}>
                  [{c.codigo_ci}] {c.nombre} ({c.tipo_ci})
                </option>
              ))}
            </select>
          </div>
          {tab === "topologia" && (
            <div>
              <label style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Profundidad</label>
              <select
                className="input-base"
                value={profundidad}
                onChange={(e) => setProfundidad(Number(e.target.value))}
                style={{ fontSize: 13, backgroundColor: "white" }}
              >
                <option value={1}>1 nivel</option>
                <option value={2}>2 niveles</option>
                <option value={3}>3 niveles</option>
                <option value={4}>4 niveles</option>
              </select>
            </div>
          )}
        </div>
      )}

      {cargando && <div style={{ padding: "28px 0", textAlign: "center", color: "#64748b" }}>Consultando la CMDB...</div>}

      {!cargando && requiereCi && !idCi && (
        <div style={{ padding: "28px 0", textAlign: "center", color: "#64748b" }}>
          Seleccione un Elemento de Configuración para continuar.
        </div>
      )}

      {/* 1. Reconciliacion */}
      {!cargando && tab === "reconciliacion" && reconciliacion && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { l: "CIs activos", v: reconciliacion.resumen.totalCi, c: "#0f172a" },
              { l: "Relaciones", v: reconciliacion.resumen.totalRelaciones, c: "#2563eb" },
              { l: "Activos sin CI", v: reconciliacion.resumen.activosSinCi, c: "#dc2626" },
              { l: "CIs sin activo", v: reconciliacion.resumen.ciSinActivo, c: "#ea580c" },
              { l: "CIs sin relaciones", v: reconciliacion.resumen.ciSinRelaciones, c: "#7c3aed" },
              { l: "CIs sin soporte", v: reconciliacion.resumen.ciSinSoporte, c: "#0891b2" },
            ].map((k) => (
              <div key={k.l} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{k.l}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: k.c, marginTop: 4 }}>{k.v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <ListaReconciliacion titulo="Activos sin CI asociado" descripcion="Bienes patrimoniales que aún no tienen un Elemento de Configuración." items={reconciliacion.activosSinCi} campos={["codigo_patrimonial", "tipo_activo", "marca", "estado_activo"]} />
            <ListaReconciliacion titulo="CIs sin activo vinculado" descripcion="Configuraciones lógicas o de servicio sin bien patrimonial de respaldo." items={reconciliacion.ciSinActivo} campos={["codigo_ci", "nombre", "tipo_ci", "criticidad"]} />
            <ListaReconciliacion titulo="CIs sin relaciones de topología" descripcion="Nodos aislados: no aportan valor al análisis de impacto." items={reconciliacion.ciSinRelaciones} campos={["codigo_ci", "nombre", "tipo_ci", "criticidad"]} />
            <ListaReconciliacion titulo="CIs sin departamento de soporte" descripcion="Sin responsable de soporte asignado." items={reconciliacion.ciSinSoporte} campos={["codigo_ci", "nombre", "tipo_ci", "criticidad"]} />
          </div>
        </div>
      )}

      {/* 2. Topologia */}
      {!cargando && tab === "topologia" && topologia && (
        <div>
          <div style={{ marginBottom: 12, fontSize: 13, color: "#475569" }}>
            Centro: <strong>[{topologia.ci.codigo_ci}]</strong> {topologia.ci.nombre} — profundidad {topologia.profundidad}.
          </div>
          <MapaTopologia datos={topologia} />
        </div>
      )}

      {/* 3. Impacto */}
      {!cargando && tab === "impacto" && impacto && (
        <div>
          <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: 14, marginBottom: 18 }}>
            <div style={{ fontSize: 13, color: "#9a3412" }}>
              Si falla <strong>[{impacto.ci.codigo_ci}] {impacto.ci.nombre}</strong>, el impacto operativo alcanza{" "}
              <strong>{impacto.afectados.length}</strong> CI(s) dependiente(s) y arrastra{" "}
              <strong>{impacto.tickets.length}</strong> ticket(s), <strong>{impacto.cambios.length}</strong> cambio(s) y{" "}
              <strong>{impacto.problemas.length}</strong> problema(s).
            </div>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 10px 0" }}>CIs afectados (dependen de este)</h3>
          {impacto.afectados.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Ningún CI depende de este elemento.</div>
          ) : (
            <div className="contenedor-tabla" style={{ marginBottom: 22 }}>
              <table className="tabla">
                <thead><tr><th>Código CI</th><th>Nombre</th><th>Tipo</th><th>Ambiente</th><th>Criticidad</th></tr></thead>
                <tbody>
                  {impacto.afectados.map((a: any) => (
                    <tr key={a.id_ci}>
                      <td><strong style={{ fontFamily: "monospace", color: "#2563eb" }}>{a.codigo_ci}</strong></td>
                      <td>{a.nombre}</td>
                      <td>{a.tipo_ci}</td>
                      <td>{a.ambiente}</td>
                      <td>{a.criticidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
            <BloqueImpacto titulo="Tickets vinculados" items={impacto.tickets} keyCodigo="codigo_ticket" />
            <BloqueImpacto titulo="Cambios (RFC) vinculados" items={impacto.cambios} keyCodigo="codigo_cambio" />
            <BloqueImpacto titulo="Problemas vinculados" items={impacto.problemas} keyCodigo="codigo_problema" />
          </div>
        </div>
      )}

      {/* 4. Historial */}
      {!cargando && tab === "historial" && historial && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 13, color: "#475569" }}>
            Historial de configuración de <strong>[{historial.ci.codigo_ci}]</strong> {historial.ci.nombre}.
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 10px 0" }}>Actualizaciones derivadas de cambios</h3>
          {historial.actualizaciones.length === 0 ? (
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Sin actualizaciones registradas.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
              {historial.actualizaciones.map((u: any) => (
                <div key={u.id_actualizacion} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 13, color: "#0f172a" }}>{u.tipo_operacion} — {u.estado}</strong>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{new Date(u.fecha_creacion).toLocaleString()}</span>
                  </div>
                  {u.codigo_cambio && <div style={{ fontSize: 12, color: "#2563eb", marginTop: 2 }}>RFC {u.codigo_cambio}: {u.cambio_titulo}</div>}
                  {u.detalle && <div style={{ fontSize: 12.5, color: "#475569", marginTop: 3 }}>{u.detalle}</div>}
                  {u.usuario && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Aplicado por {u.usuario}</div>}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <ListaReconciliacion titulo="Líneas base" descripcion="Instantáneas de configuración del CI." items={historial.lineasBase} campos={["nombre", "total_elementos", "fecha_creacion"]} />
            <ListaReconciliacion titulo="Inexactitudes reportadas" descripcion="Discrepancias de exactitud de la CMDB." items={historial.inexactitudes} campos={["descripcion", "estado", "fecha_creacion"]} />
          </div>
        </div>
      )}
    </div>
  );
}

function ListaReconciliacion({
  titulo,
  descripcion,
  items,
  campos,
}: {
  titulo: string;
  descripcion: string;
  items: any[];
  campos: string[];
}) {
  return (
    <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
      <h4 style={{ margin: "0 0 4px 0", fontSize: 14, color: "#1e293b", fontWeight: 700 }}>
        {titulo} <span style={{ color: "#64748b", fontWeight: 500 }}>({items?.length ?? 0})</span>
      </h4>
      <p style={{ margin: "0 0 10px 0", fontSize: 12, color: "#64748b" }}>{descripcion}</p>
      {!items || items.length === 0 ? (
        <div style={{ padding: 12, textAlign: "center", color: "#16a34a", fontSize: 12.5 }}>Sin pendientes.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
          {items.map((it, i) => (
            <div key={i} style={{ fontSize: 12.5, color: "#334155", padding: "6px 10px", background: "#f8fafc", borderRadius: 6 }}>
              {campos.map((c) => (it[c] != null && it[c] !== "" ? String(it[c]) : null)).filter(Boolean).join(" · ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BloqueImpacto({ titulo, items, keyCodigo }: { titulo: string; items: any[]; keyCodigo: string }) {
  return (
    <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
      <h4 style={{ margin: "0 0 10px 0", fontSize: 14, color: "#1e293b", fontWeight: 700 }}>
        {titulo} <span style={{ color: "#64748b", fontWeight: 500 }}>({items?.length ?? 0})</span>
      </h4>
      {!items || items.length === 0 ? (
        <div style={{ padding: 12, textAlign: "center", color: "#94a3b8", fontSize: 12.5, fontStyle: "italic" }}>Sin registros.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
          {items.map((it, i) => (
            <div key={i} style={{ fontSize: 12.5, color: "#334155", padding: "6px 10px", background: "#f8fafc", borderRadius: 6 }}>
              <strong style={{ fontFamily: "monospace", color: "#2563eb" }}>{it[keyCodigo]}</strong> — {it.titulo}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
