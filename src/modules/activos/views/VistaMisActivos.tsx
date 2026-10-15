"use client";

import { useEffect, useState, useMemo } from "react";

interface Activo {
  id_activo: number;
  codigo_patrimonial: string;
  numero_serie: string | null;
  tipo_activo: string;
  marca: string;
  modelo: string;
  departamento_nombre: string | null;
  estado_activo: string;
  fecha_adquisicion: string | null;
  fecha_fin_garantia: string | null;
  nombre_modelo: string | null;
  modelo_fabricante: string | null;
}

function formatearFecha(valor: string | null) {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function VistaMisActivos() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/activos/mis-activos?_t=${Date.now()}`);
      const data = await res.json();
      if (res.ok) {
        setActivos(Array.isArray(data) ? data : []);
      } else {
        setError(data.error ?? "No se pudieron cargar tus activos.");
      }
    } catch {
      setError("Error de conexión al cargar tus activos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return activos;
    return activos.filter((a) =>
      [a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo, a.numero_serie ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [activos, busqueda]);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Mis activos</h1>
        <p>Equipos y licencias que tienes asignados como custodio.</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar por código, tipo, marca o serie..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1, minWidth: 240, padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
        />
        <button type="button" className="boton-secundario" onClick={cargar} style={{ width: "auto" }}>
          Actualizar
        </button>
      </div>

      {cargando ? (
        <p>Cargando activos...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : filtrados.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          {activos.length === 0
            ? "No tienes activos asignados actualmente."
            : "No se encontraron activos con ese criterio de búsqueda."}
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Marca / Modelo</th>
                <th>Serie</th>
                <th>Departamento</th>
                <th>Estado</th>
                <th>Garantía hasta</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id_activo}>
                  <td><strong>{a.codigo_patrimonial}</strong></td>
                  <td>{a.tipo_activo}</td>
                  <td>{a.marca} {a.modelo}</td>
                  <td>{a.numero_serie ?? "—"}</td>
                  <td>{a.departamento_nombre ?? "—"}</td>
                  <td>{a.estado_activo}</td>
                  <td>{formatearFecha(a.fecha_fin_garantia)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
