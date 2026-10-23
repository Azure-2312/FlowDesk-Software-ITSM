"use client";

import { useEffect, useState } from "react";

interface Resumen {
  total_ci: number;
  sin_ip: number;
  sin_version: number;
  sin_departamento: number;
  sin_activo: number;
  criticos: number;
  exactitud: number | null;
}

interface Ci {
  id_ci: number;
  codigo_ci: string;
  nombre: string;
  tipo_ci: string;
  ambiente: string;
}

interface Inexactitud {
  id_inexactitud: number;
  descripcion: string;
  estado: string;
  fecha_creacion: string;
  codigo_ci: string | null;
  ci_nombre: string | null;
  reporta_nombre: string | null;
}

function Kpi({ titulo, valor, sufijo, color }: { titulo: string; valor: number | string; sufijo?: string; color?: string }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? "#0f172a", marginTop: 6 }}>{valor}{sufijo && <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 3 }}>{sufijo}</span>}</div>
    </div>
  );
}

export default function VistaCmdbAuditoria() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [sinRelaciones, setSinRelaciones] = useState<Ci[]>([]);
  const [inexactitudes, setInexactitudes] = useState<Inexactitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cmdb/auditoria?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) {
          setResumen(json?.resumen ?? null);
          setSinRelaciones(Array.isArray(json?.sinRelaciones) ? json.sinRelaciones : []);
          setInexactitudes(Array.isArray(json?.inexactitudesAbiertas) ? json.inexactitudesAbiertas : []);
        } else setError(json.error ?? "No se pudo cargar la auditoría.");
      } catch {
        setError("Error de conexión al cargar la auditoría.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <div className="vista-contenedor"><p>Cargando...</p></div>;
  if (error) return <div className="vista-contenedor"><p role="alert" className="mensaje-error">{error}</p></div>;
  if (!resumen) return null;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Calidad y auditoría de CMDB</h1>
        <p>Completitud de atributos, CIs sin relaciones y exactitud general de la configuración.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="CI totales" valor={resumen.total_ci} />
        <Kpi titulo="Sin IP" valor={resumen.sin_ip} color={resumen.sin_ip > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Sin versión" valor={resumen.sin_version} color={resumen.sin_version > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Sin área de soporte" valor={resumen.sin_departamento} />
        <Kpi titulo="Sin activo vinculado" valor={resumen.sin_activo} />
        <Kpi titulo="Críticos" valor={resumen.criticos} color="#b91c1c" />
        <Kpi titulo="Exactitud" valor={resumen.exactitud === null ? "—" : resumen.exactitud} sufijo={resumen.exactitud === null ? undefined : "%"} color="#166534" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>CI sin relaciones</h2>
          {sinRelaciones.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>Todos los CI tienen al menos una relación.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {sinRelaciones.map((c) => (
                <li key={c.id_ci} style={{ fontSize: 12.5 }}>
                  <strong>{c.codigo_ci}</strong> · {c.nombre} <span style={{ color: "#6b7280" }}>({c.tipo_ci}, {c.ambiente})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Inexactitudes abiertas</h2>
          {inexactitudes.length === 0 ? (
            <p style={{ fontSize: 12.5, color: "#6b7280", margin: 0 }}>No hay inexactitudes abiertas.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {inexactitudes.map((i) => (
                <li key={i.id_inexactitud} style={{ fontSize: 12.5, borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                  <strong>{i.codigo_ci ?? "—"}</strong> · {i.descripcion}
                  <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 2 }}>{i.estado} · reporta {i.reporta_nombre ?? "—"}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
