"use client";

import { useEffect, useState } from "react";

type CiItem = {
  id_ci: number;
  codigo_ci: string;
  nombre: string;
  tipo_ci: string;
  ambiente: string;
  criticidad: string;
};

interface Solapamiento {
  codigo_a: string;
  codigo_b: string;
  titulo_a: string;
  titulo_b: string;
  inicio_a: string;
  fin_a: string;
  inicio_b: string;
  fin_b: string;
  mismo_ci: boolean;
}

interface Afectado {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  ventana_inicio: string;
  ventana_fin: string;
  congelamiento?: string;
  severidad?: string;
  feriado?: string;
  feriado_inicio?: string;
  feriado_fin?: string;
}

interface Capacidad {
  dia: string;
  total: number;
}

interface Duracion {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  ventana_inicio: string;
  ventana_fin: string;
  horas: number;
}

interface Datos {
  solapamientos: Solapamiento[];
  congelamientos: Afectado[];
  feriados: Afectado[];
  capacidad: Capacidad[];
  duraciones: Duracion[];
  parametros: { max_simultaneo: number; duracion_maxima_horas: number };
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function Seccion({ titulo, color, children, total }: { titulo: string; color: string; children: React.ReactNode; total: number }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>{titulo}</h2>
        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, backgroundColor: total > 0 ? color : "#e5e7eb", color: total > 0 ? "#fff" : "#374151" }}>{total}</span>
      </div>
      {total === 0 ? <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Sin incidencias.</p> : children}
    </div>
  );
}

export default function VistaConflictos() {
  const [data, setData] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [listaCis, setListaCis] = useState<CiItem[]>([]);
  const [idCiSeleccionado, setIdCiSeleccionado] = useState<number | "">("");
  const [impactoCi, setImpactoCi] = useState<any>(null);
  const [cargandoCi, setCargandoCi] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cambios/gestion/conflictos?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setData(json);
        else setError(json.error ?? "No se pudieron cargar los conflictos.");
      } catch {
        setError("Error de conexión al cargar los conflictos.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  useEffect(() => {
    fetch("/api/activos/cmdb?estado=activos")
      .then((r) => r.json())
      .then((d) => setListaCis(Array.isArray(d?.elementos) ? d.elementos : []))
      .catch(() => setListaCis([]));
  }, []);

  const cargarImpactoCi = async (idCi: number) => {
    setCargandoCi(true);
    setImpactoCi(null);
    try {
      const r = await fetch(`/api/activos/cmdb/analisis?vista=impacto&id_ci=${idCi}`);
      const d = await r.json();
      if (r.ok) setImpactoCi(d);
      else setImpactoCi(null);
    } catch {
      setImpactoCi(null);
    } finally {
      setCargandoCi(false);
    }
  };

  if (cargando) return <div className="vista-contenedor"><p>Cargando...</p></div>;
  if (error) return <div className="vista-contenedor"><p role="alert" className="mensaje-error">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Conflictos y capacidad</h1>
        <p>Solapamientos entre RFC, choques con congelamientos y feriados, capacidad diaria y duraciones fuera de política.</p>
      </div>

      <p style={{ fontSize: 12.5, color: "#6b7280", marginBottom: 16 }}>
        Parámetros vigentes: máximo {data.parametros.max_simultaneo} cambios simultáneos por día · duración máxima de ventana {data.parametros.duracion_maxima_horas} h.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <Seccion titulo="Solapamientos entre RFC" color="#b91c1c" total={data.solapamientos.length}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {data.solapamientos.map((s, i) => (
              <li key={i} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                <strong>{s.codigo_a}</strong> vs <strong>{s.codigo_b}</strong>
                {s.mismo_ci && <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: "#b91c1c" }}>[mismo CI]</span>}
                <div style={{ color: "#6b7280", marginTop: 3 }}>{s.titulo_a} · {fechaHora(s.inicio_a)} → {fechaHora(s.fin_a)}</div>
                <div style={{ color: "#6b7280" }}>{s.titulo_b} · {fechaHora(s.inicio_b)} → {fechaHora(s.fin_b)}</div>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Congelamientos" color="#b45309" total={data.congelamientos.length}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {data.congelamientos.map((c, i) => (
              <li key={i} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                <strong>{c.codigo_cambio}</strong> · {c.titulo}
                <div style={{ color: "#6b7280", marginTop: 3 }}>Congelamiento: {c.congelamiento} ({c.severidad ?? "—"})</div>
                <div style={{ color: "#6b7280" }}>Ventana: {fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)}</div>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Feriados" color="#b45309" total={data.feriados.length}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {data.feriados.map((f, i) => (
              <li key={i} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                <strong>{f.codigo_cambio}</strong> · {f.titulo}
                <div style={{ color: "#6b7280", marginTop: 3 }}>Feriado: {f.feriado}</div>
                <div style={{ color: "#6b7280" }}>Ventana: {fechaHora(f.ventana_inicio)} → {fechaHora(f.ventana_fin)}</div>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Capacidad diaria excedida" color="#b91c1c" total={data.capacidad.length}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {data.capacidad.map((c, i) => (
              <li key={i} style={{ fontSize: 12.5 }}>
                {new Date(c.dia).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })} · {c.total} cambios programados
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion titulo="Duraciones fuera de política" color="#b45309" total={data.duraciones.length}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {data.duraciones.map((d, i) => (
              <li key={i} style={{ fontSize: 12.5 }}>
                <strong>{d.codigo_cambio}</strong> · {Math.round(Number(d.horas))} h ({d.titulo})
              </li>
            ))}
          </ul>
        </Seccion>

        <div className="tarjeta-formulario" style={{ margin: 0, gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ margin: 0 }}>Impacto en CMDB por CI</h2>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, backgroundColor: "#e5e7eb", color: "#374151" }}>
              {listaCis.length} CI(s) disponibles
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Seleccionar Elemento de Configuración (CI)
              </label>
              <select
                className="input-base"
                value={idCiSeleccionado}
                onChange={(e) => {
                  const v = e.target.value;
                  setIdCiSeleccionado(v ? Number(v) : "");
                  if (!v) setImpactoCi(null);
                }}
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
            {idCiSeleccionado !== "" && (
              <button
                type="button"
                disabled={cargandoCi}
                onClick={() => cargarImpactoCi(idCiSeleccionado as number)}
                style={{
                  padding: "8px 16px",
                  fontSize: 13,
                  backgroundColor: cargandoCi ? "#9ca3af" : "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: cargandoCi ? "not-allowed" : "pointer",
                }}
              >
                {cargandoCi ? "Consultando..." : "Ver impacto"}
              </button>
            )}
          </div>

          {cargandoCi && (
            <div style={{ padding: 16, color: "#6b7280", fontSize: 12.5, textAlign: "center" }}>
              Consultando impacto en la CMDB...
            </div>
          )}

          {!cargandoCi && idCiSeleccionado !== "" && !impactoCi && (
            <div style={{ padding: 16, color: "#9ca3af", fontSize: 12.5, textAlign: "center" }}>
              Seleccione un CI y presione "Ver impacto".
            </div>
          )}

          {!cargandoCi && impactoCi && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 12 }}>
              <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#9a3412", fontWeight: 700, textTransform: "uppercase" }}>CI analizado</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  <strong>[{impactoCi.ci?.codigo_ci}]</strong> {impactoCi.ci?.nombre}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{impactoCi.ci?.tipo_ci} · {impactoCi.ci?.criticidad}</div>
              </div>
              <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#166534", fontWeight: 700, textTransform: "uppercase" }}>CIs afectados</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{impactoCi.afectados?.length ?? 0}</div>
              </div>
              <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#1d4ed8", fontWeight: 700, textTransform: "uppercase" }}>Tickets vinculados</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{impactoCi.tickets?.length ?? 0}</div>
              </div>
              <div style={{ backgroundColor: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700, textTransform: "uppercase" }}>Cambios (RFC) vinculados</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{impactoCi.cambios?.length ?? 0}</div>
              </div>
              <div style={{ backgroundColor: "#f3e8ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, textTransform: "uppercase" }}>Problemas vinculados</div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{impactoCi.problemas?.length ?? 0}</div>
              </div>
            </div>
          )}

          {!cargandoCi && impactoCi && impactoCi.afectados && impactoCi.afectados.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 14, margin: "0 0 8px 0", color: "#1e293b" }}>CIs dependientes (downstream)</h3>
              <table className="tabla" style={{ width: "100%", fontSize: 12.5 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Código CI</th>
                    <th style={{ textAlign: "left" }}>Nombre</th>
                    <th style={{ textAlign: "left" }}>Tipo</th>
                    <th style={{ textAlign: "left" }}>Ambiente</th>
                    <th style={{ textAlign: "left" }}>Criticidad</th>
                  </tr>
                </thead>
                <tbody>
                  {impactoCi.afectados.map((a: any) => (
                    <tr key={a.id_ci} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "6px 4px", fontFamily: "monospace", color: "#2563eb" }}>{a.codigo_ci}</td>
                      <td style={{ padding: "6px 4px" }}>{a.nombre}</td>
                      <td style={{ padding: "6px 4px" }}>{a.tipo_ci}</td>
                      <td style={{ padding: "6px 4px" }}>{a.ambiente}</td>
                      <td style={{ padding: "6px 4px" }}>{a.criticidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
