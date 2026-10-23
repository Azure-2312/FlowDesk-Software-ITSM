"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Panel {
  kpis: {
    eventos_auditoria: number;
    accesos_fallidos: number;
    cambios_sin_aprobacion: number;
    cmdb_inconsistencias: number;
    bajas_mes: number;
    informes_abiertos: number;
  };
  hallazgos: { tipo: string; severidad: "ALTA" | "MEDIA" | "BAJA"; detalle: string; referencia: string }[];
}

const COLOR_SEVERIDAD: Record<string, { bg: string; fg: string }> = {
  ALTA: { bg: "#fee2e2", fg: "#b91c1c" },
  MEDIA: { bg: "#fef3c7", fg: "#92400e" },
  BAJA: { bg: "#e0e7ff", fg: "#3730a3" },
};

function Kpi({ titulo, valor, color }: { titulo: string; valor: number; color?: string }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{titulo}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color ?? "#0f172a", marginTop: 6 }}>{valor}</div>
    </div>
  );
}

export default function VistaPanelAuditoria() {
  const [data, setData] = useState<Panel | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/operacion/paneles/auditor?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setData(json);
        else setError(json.error ?? "No se pudo cargar el panel.");
      } catch {
        setError("Error de conexión al cargar el panel.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <div className="vista-contenedor"><p>Cargando panel...</p></div>;
  if (error) return <div className="vista-contenedor"><p role="alert" className="mensaje-error">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Panel de auditoría</h1>
        <p>Hallazgos, cumplimiento y muestras pendientes (solo lectura).</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 24 }}>
        <Kpi titulo="Eventos (30 días)" valor={data.kpis.eventos_auditoria} />
        <Kpi titulo="Accesos fallidos (7 días)" valor={data.kpis.accesos_fallidos} color={data.kpis.accesos_fallidos > 0 ? "#b45309" : undefined} />
        <Kpi titulo="Cambios sin aprobación" valor={data.kpis.cambios_sin_aprobacion} color={data.kpis.cambios_sin_aprobacion > 0 ? "#b91c1c" : undefined} />
        <Kpi titulo="Inconsistencias CMDB" valor={data.kpis.cmdb_inconsistencias} />
        <Kpi titulo="Bajas del mes" valor={data.kpis.bajas_mes} />
        <Kpi titulo="Informes abiertos" valor={data.kpis.informes_abiertos} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Accesos rápidos</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/plataforma/seguridad/cumplimiento/sod" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Segregación de funciones</Link>
            <Link href="/plataforma/seguridad/cumplimiento/cambios" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Cambios sin autorización</Link>
            <Link href="/plataforma/cmdb/auditor/resultados" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Resultados de CMDB</Link>
            <Link href="/plataforma/reportes/auditoria" className="boton-secundario" style={{ textAlign: "center", textDecoration: "none" }}>Informes de auditoría</Link>
          </div>
        </div>

        <div className="tarjeta-formulario" style={{ margin: 0 }}>
          <h2>Hallazgos recientes</h2>
          {data.hallazgos.length === 0 ? (
            <p>Sin hallazgos relevantes.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {data.hallazgos.map((h, i) => {
                const color = COLOR_SEVERIDAD[h.severidad] ?? COLOR_SEVERIDAD.BAJA;
                return (
                  <li key={i} style={{ fontSize: 13, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 999, backgroundColor: color.bg, color: color.fg, marginRight: 8 }}>
                      {h.severidad}
                    </span>
                    <strong>{h.tipo}</strong>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{h.detalle} · {h.referencia}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
