"use client";

import { useEffect, useState } from "react";

interface Modelo {
  id_modelo: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: string;
  version_modelo: string;
  riesgo_fijo: string | null;
  autorizacion_automatica: boolean;
  veces_usado: number;
  veces_exitoso: number;
  veces_fallido: number;
  ultimo_uso: string | null;
}

export default function VistaModelosCambio() {
  const [items, setItems] = useState<Modelo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/perfiles/aprobador/cambios/modelos?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setItems(Array.isArray(json) ? json : []);
        else setError(json.error ?? "No se pudieron cargar los modelos.");
      } catch {
        setError("Error de conexión al cargar los modelos.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Modelos de cambio estándar</h1>
        <p>Catálogo de cambios preautorizados y su desempeño histórico.</p>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay modelos de cambio estándar registrados.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Código</th><th>Nombre</th><th>Estado</th><th>Riesgo</th><th>Autoaut.</th><th>Usos</th><th>Éxito</th><th>Fallo</th></tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id_modelo}>
                  <td><strong>{m.codigo}</strong></td>
                  <td>{m.nombre}</td>
                  <td>{m.estado}</td>
                  <td>{m.riesgo_fijo ?? "—"}</td>
                  <td>{m.autorizacion_automatica ? "Sí" : "No"}</td>
                  <td>{m.veces_usado}</td>
                  <td style={{ color: "#15803d" }}>{m.veces_exitoso}</td>
                  <td style={{ color: m.veces_fallido > 0 ? "#b91c1c" : undefined }}>{m.veces_fallido}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
