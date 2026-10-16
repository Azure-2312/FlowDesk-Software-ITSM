"use client";

import { useEffect, useState } from "react";

interface Licencia {
  id_licencia: number;
  nombre_software: string;
  fabricante: string | null;
  tipo_licencia: string | null;
  cantidad_adquirida: number;
  cantidad_en_uso: number;
  fecha_vencimiento: string | null;
  costo_anual: number | null;
  exceso: number;
  disponibles: number;
  vencida: boolean;
  asignadas_activas: number;
}

interface Resumen {
  total_licencias: number;
  total_adquiridas: number;
  total_en_uso: number;
  en_sobreuso: number;
  vencidas: number;
  costo_anual: number;
}

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaCumplimientoLicencias() {
  const [licencias, setLicencias] = useState<Licencia[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/gestor-activos/licencias/cumplimiento?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) {
          setLicencias(Array.isArray(json?.licencias) ? json.licencias : []);
          setResumen(json?.resumen ?? null);
        } else setError(json.error ?? "No se pudo cargar el cumplimiento.");
      } catch {
        setError("Error de conexión al cargar el cumplimiento.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Cumplimiento y sobreuso de licencias</h1>
        <p>Compara licencias adquiridas contra las asignadas, detecta sobreuso y controla vencimientos.</p>
      </div>

      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <>
          {resumen && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 22 }}>
              <div className="tarjeta-formulario" style={{ margin: 0 }}><div style={{ fontSize: 12, color: "#6b7280" }}>LICENCIAS</div><div style={{ fontSize: 24, fontWeight: 700 }}>{resumen.total_licencias}</div></div>
              <div className="tarjeta-formulario" style={{ margin: 0 }}><div style={{ fontSize: 12, color: "#6b7280" }}>ADQUIRIDAS</div><div style={{ fontSize: 24, fontWeight: 700 }}>{resumen.total_adquiridas}</div></div>
              <div className="tarjeta-formulario" style={{ margin: 0 }}><div style={{ fontSize: 12, color: "#6b7280" }}>EN USO</div><div style={{ fontSize: 24, fontWeight: 700 }}>{resumen.total_en_uso}</div></div>
              <div className="tarjeta-formulario" style={{ margin: 0 }}><div style={{ fontSize: 12, color: "#6b7280" }}>EN SOBREUSO</div><div style={{ fontSize: 24, fontWeight: 700, color: resumen.en_sobreuso > 0 ? "#b91c1c" : undefined }}>{resumen.en_sobreuso}</div></div>
              <div className="tarjeta-formulario" style={{ margin: 0 }}><div style={{ fontSize: 12, color: "#6b7280" }}>VENCIDAS</div><div style={{ fontSize: 24, fontWeight: 700, color: resumen.vencidas > 0 ? "#b45309" : undefined }}>{resumen.vencidas}</div></div>
              <div className="tarjeta-formulario" style={{ margin: 0 }}><div style={{ fontSize: 12, color: "#6b7280" }}>COSTO ANUAL</div><div style={{ fontSize: 24, fontWeight: 700 }}>{Number(resumen.costo_anual).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</div></div>
            </div>
          )}

          {licencias.length === 0 ? (
            <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay licencias registradas.</div>
          ) : (
            <table className="tabla-datos">
              <thead><tr><th>Software</th><th>Tipo</th><th>Adquiridas</th><th>En uso</th><th>Disponibles</th><th>Asignaciones activas</th><th>Vence</th><th>Estado</th></tr></thead>
              <tbody>
                {licencias.map((l) => {
                  const sobreuso = Number(l.exceso) > 0;
                  return (
                    <tr key={l.id_licencia} style={{ backgroundColor: sobreuso ? "#fef2f2" : undefined }}>
                      <td><strong>{l.nombre_software}</strong>{l.fabricante && <div style={{ fontSize: 11.5, color: "#6b7280" }}>{l.fabricante}</div>}</td>
                      <td>{l.tipo_licencia ?? "—"}</td>
                      <td>{l.cantidad_adquirida}</td>
                      <td>{l.cantidad_en_uso}</td>
                      <td>{l.disponibles}</td>
                      <td>{l.asignadas_activas}</td>
                      <td>{fecha(l.fecha_vencimiento)}</td>
                      <td>
                        {sobreuso ? (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: "#fee2e2", color: "#b91c1c" }}>SOBREUSO +{l.exceso}</span>
                        ) : l.vencida ? (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: "#fef3c7", color: "#92400e" }}>VENCIDA</span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: "#dcfce7", color: "#166534" }}>OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
