"use client";

import { useEffect, useState } from "react";

interface Cambio {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  tipo_cambio: string;
  estado_nombre: string;
  ventana_inicio: string;
  ventana_fin: string;
  fecha_creacion?: string;
  fecha_modificacion?: string | null;
  motivo?: string;
  solicitante_nombre: string | null;
}

interface Data {
  sinAutorizacion: Cambio[];
  fueraDeVentana: Cambio[];
}

function fechaHora(valor: string | null | undefined) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function Tabla({ titulo, descripcion, filas, conMotivo }: { titulo: string; descripcion: string; filas: Cambio[]; conMotivo?: boolean }) {
  return (
    <div className="tarjeta-formulario">
      <h2>{titulo}</h2>
      <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 0 }}>{descripcion}</p>
      {filas.length === 0 ? (
        <p style={{ color: "#15803d", fontSize: 13, margin: 0 }}>Sin hallazgos.</p>
      ) : (
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>RFC</th><th>Título</th><th>Tipo</th><th>Estado</th><th>Ventana</th>
              {conMotivo && <th>Motivo</th>}
              <th>Solicitante</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((c) => (
              <tr key={c.id_cambio}>
                <td><strong>{c.codigo_cambio}</strong></td>
                <td>{c.titulo}</td>
                <td>{c.tipo_cambio}</td>
                <td>{c.estado_nombre}</td>
                <td>{fechaHora(c.ventana_inicio)} → {fechaHora(c.ventana_fin)}</td>
                {conMotivo && <td style={{ color: "#b45309", fontWeight: 600 }}>{c.motivo}</td>}
                <td>{c.solicitante_nombre ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function VistaCambiosIrregulares() {
  const [data, setData] = useState<Data | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/perfiles/auditor/cumplimiento/cambios?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setData(json);
        else setError(json.error ?? "No se pudieron cargar los cambios.");
      } catch {
        setError("Error de conexión al cargar los cambios.");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <div className="vista-contenedor"><p>Cargando...</p></div>;
  if (error) return <div className="vista-contenedor"><p role="alert" className="mensaje-error">{error}</p></div>;
  if (!data) return null;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Cambios sin autorización o fuera de ventana</h1>
        <p>RFC ejecutadas o cerradas sin aprobación registrada, o cuya ventana no se respetó.</p>
      </div>

      <Tabla
        titulo="Cambios sin autorización"
        descripcion="RFC en ejecución o exitosas sin una aprobación APROBADO registrada en el comité."
        filas={data.sinAutorizacion}
      />
      <Tabla
        titulo="Cambios fuera de ventana"
        descripcion="RFC con ventana vencida sin ejecutar, o cerradas antes/después de su ventana autorizada."
        filas={data.fueraDeVentana}
        conMotivo
      />
    </div>
  );
}
