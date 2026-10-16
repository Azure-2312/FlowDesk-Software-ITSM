"use client";

import { useEffect, useState } from "react";

interface Contrato {
  id_asignacion: number;
  id_licencia: number;
  nombre_software: string;
  fabricante: string;
  tipo_licencia: string;
  fecha_vencimiento: string | null;
  cantidad_adquirida: number;
  cantidad_en_uso: number;
  fecha_asignacion: string;
  usuario_nombre: string | null;
}

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function porVencer(valor: string | null) {
  if (!valor) return false;
  const dias = (new Date(valor).getTime() - Date.now()) / 86400000;
  return dias >= 0 && dias <= 60;
}

export default function VistaContratosArea() {
  const [items, setItems] = useState<Contrato[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/gestor-area/contratos?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setItems(Array.isArray(json) ? json : []);
        else setError(json.error ?? "No se pudieron cargar las licencias.");
      } catch {
        setError("Error de conexión al cargar las licencias.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Licencias y contratos de mi departamento</h1>
        <p>Software asignado a los colaboradores de mi área y sus vencimientos.</p>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay licencias asignadas a mi área.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Software</th><th>Fabricante</th><th>Tipo</th><th>Colaborador</th><th>Asignada</th><th>Vence</th></tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id_asignacion}>
                  <td><strong>{c.nombre_software}</strong></td>
                  <td>{c.fabricante}</td>
                  <td>{c.tipo_licencia}</td>
                  <td>{c.usuario_nombre ?? "—"}</td>
                  <td>{fecha(c.fecha_asignacion)}</td>
                  <td style={{ color: porVencer(c.fecha_vencimiento) ? "#b45309" : undefined, fontWeight: porVencer(c.fecha_vencimiento) ? 600 : undefined }}>
                    {fecha(c.fecha_vencimiento)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
