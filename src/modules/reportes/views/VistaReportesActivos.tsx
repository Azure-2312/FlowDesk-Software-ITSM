"use client";

import { useEffect, useState } from "react";

interface Resumen {
  total: number;
  en_operacion: number;
  en_stock: number;
  en_reparacion: number;
  en_baja: number;
  costo_total: number;
}

interface PorTipo {
  tipo_activo: string;
  total: number;
  costo: number;
}

interface Antiguedad {
  rango: string;
  total: number;
}

interface Datos {
  resumen: Resumen;
  porTipo: PorTipo[];
  antiguedad: Antiguedad[];
  garantias: { vigentes: number; vencidas: number; sin_dato: number };
  exactitud: { total_ci: number; incompletos: number; sin_relaciones: number; inexactitudes: number; cumplimiento: number | null };
}

function Kpi({ titulo, valor, sufijo, color }: { titulo: string; valor: number | string; sufijo?: string; color?: string }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? "#0f172a", marginTop: 6 }}>{valor}{sufijo && <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 3 }}>{sufijo}</span>}</div>
    </div>
  );
}

export default function VistaReportesActivos() {
  const [data, setData] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/gestor-activos/reportes?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setData(json);
        else setError(json.error ?? "No se pudieron cargar los reportes.");
      } catch {
        setError("Error de conexión al cargar los reportes.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <div className="vista-contenedor"><p>Cargando...</p></div>;
  if (error) return <div className="vista-contenedor"><p role="alert" className="mensaje-error">{error}</p></div>;
  if (!data) return null;

  const r = data.resumen;
  const totalAntiguedad = data.antiguedad.reduce((acc, a) => acc + Number(a.total), 0);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Reportes de activos</h1>
        <p>Distribución por estado y tipo, antigüedad, costos, garantías y exactitud de la CMDB.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Activos totales" valor={r.total} />
        <Kpi titulo="En operación" valor={r.en_operacion} color="#166534" />
        <Kpi titulo="En stock" valor={r.en_stock} />
        <Kpi titulo="En reparación" valor={r.en_reparacion} color={r.en_reparacion > 0 ? "#b45309" : undefined} />
        <Kpi titulo="En baja" valor={r.en_baja} color={r.en_baja > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Costo total" valor={Number(r.costo_total).toLocaleString("es-PE", { minimumFractionDigits: 2 })} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Por tipo de activo</h2>
          {data.porTipo.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Sin datos.</p>
          ) : (
            <table className="tabla-datos">
              <thead><tr><th>Tipo</th><th>Total</th><th>Costo</th></tr></thead>
              <tbody>
                {data.porTipo.map((t) => (
                  <tr key={t.tipo_activo}>
                    <td><strong>{t.tipo_activo}</strong></td>
                    <td>{t.total}</td>
                    <td>{Number(t.costo).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Antigüedad</h2>
          {data.antiguedad.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Sin datos.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.antiguedad.map((a) => {
                const pct = totalAntiguedad > 0 ? Math.round((Number(a.total) / totalAntiguedad) * 100) : 0;
                return (
                  <div key={a.rango}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                      <span>{a.rango}</span>
                      <span style={{ color: "#6b7280" }}>{a.total} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, backgroundColor: "#e2e8f0", borderRadius: 999, marginTop: 4 }}>
                      <div style={{ height: 6, width: `${pct}%`, backgroundColor: "#1d4ed8", borderRadius: 999 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Garantías</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Vigentes</span><strong style={{ color: "#166534" }}>{data.garantias.vigentes}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Vencidas</span><strong style={{ color: data.garantias.vencidas > 0 ? "#b91c1c" : undefined }}>{data.garantias.vencidas}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Sin dato</span><strong style={{ color: "#6b7280" }}>{data.garantias.sin_dato}</strong></div>
          </div>
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Exactitud de CMDB</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>CI totales</span><strong>{data.exactitud.total_ci}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>CI incompletos</span><strong style={{ color: data.exactitud.incompletos > 0 ? "#b45309" : undefined }}>{data.exactitud.incompletos}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>CI sin relaciones</span><strong>{data.exactitud.sin_relaciones}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Inexactitudes abiertas</span><strong style={{ color: data.exactitud.inexactitudes > 0 ? "#b91c1c" : undefined }}>{data.exactitud.inexactitudes}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Cumplimiento</span><strong style={{ color: "#166534" }}>{data.exactitud.cumplimiento === null ? "—" : `${data.exactitud.cumplimiento}%`}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
