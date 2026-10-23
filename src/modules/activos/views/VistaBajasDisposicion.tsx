"use client";

import { useEffect, useState } from "react";

interface Baja {
  id_activo: number;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  motivo_inactivacion: string | null;
  fecha_inactivacion: string | null;
  responsable_nombre: string | null;
  ci_activos: number;
  motivo_historial: string | null;
}

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaBajasDisposicion() {
  const [items, setItems] = useState<Baja[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/activos/bajas/auditoria?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setItems(Array.isArray(json) ? json : []);
        else setError(json.error ?? "No se pudieron cargar las bajas.");
      } catch {
        setError("Error de conexión al cargar las bajas.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Consulta de bajas</h1>
        <p>Actas de baja, sustento de la inactivación y consistencia con la CMDB (solo lectura).</p>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay activos dados de baja.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Código</th><th>Activo</th><th>Baja</th><th>Motivo</th><th>Responsable</th><th>CI activos</th></tr>
            </thead>
            <tbody>
              {items.map((a) => {
                const sinMotivo = !a.motivo_inactivacion && !a.motivo_historial;
                const ciInconsistente = a.ci_activos > 0;
                return (
                  <tr key={a.id_activo}>
                    <td><strong>{a.codigo_patrimonial}</strong></td>
                    <td>{a.tipo_activo} {a.marca} {a.modelo}</td>
                    <td>{fecha(a.fecha_inactivacion)}</td>
                    <td style={{ color: sinMotivo ? "#b91c1c" : undefined, fontWeight: sinMotivo ? 600 : undefined }}>
                      {a.motivo_inactivacion ?? a.motivo_historial ?? "Sin sustento"}
                    </td>
                    <td>{a.responsable_nombre ?? "—"}</td>
                    <td style={{ color: ciInconsistente ? "#b45309" : undefined, fontWeight: ciInconsistente ? 600 : undefined }}>
                      {a.ci_activos}{ciInconsistente ? " ⚠" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
