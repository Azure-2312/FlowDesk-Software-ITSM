"use client";

import { useEffect, useState, useMemo } from "react";

interface Activo {
  id_activo: number;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  estado_activo: string;
  fecha_adquisicion: string | null;
  fecha_fin_garantia: string | null;
  custodio_nombre: string | null;
}

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function VistaActivosArea() {
  const [items, setItems] = useState<Activo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/perfiles/gestor-area/activos?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setItems(Array.isArray(json) ? json : []);
        else setError(json.error ?? "No se pudieron cargar los activos.");
      } catch {
        setError("Error de conexión al cargar los activos.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter((a) =>
      [a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo, a.custodio_nombre ?? ""].join(" ").toLowerCase().includes(q)
    );
  }, [items, busqueda]);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Activos de mi área</h1>
        <p>Equipos en custodia de los colaboradores de mi departamento (sin datos financieros).</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por código, tipo, marca o custodio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: "100%", maxWidth: 420, padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
        />
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : filtrados.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          {items.length === 0 ? "No hay activos asignados a mi área." : "No se encontraron activos con ese criterio."}
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Código</th><th>Tipo</th><th>Marca / Modelo</th><th>Custodio</th><th>Estado</th><th>Garantía hasta</th></tr>
            </thead>
            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id_activo}>
                  <td><strong>{a.codigo_patrimonial}</strong></td>
                  <td>{a.tipo_activo}</td>
                  <td>{a.marca} {a.modelo}</td>
                  <td>{a.custodio_nombre ?? "—"}</td>
                  <td>{a.estado_activo}</td>
                  <td>{fecha(a.fecha_fin_garantia)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
