"use client";

import { useEffect, useState } from "react";

interface Sod {
  autoaprobacionTickets: any[];
  autoaprobacionCambios: any[];
  aprobadorResolutor: any[];
  perfilesIncompatibles: any[];
}

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Seccion({ titulo, descripcion, filas, columnas }: {
  titulo: string;
  descripcion: string;
  filas: any[];
  columnas: { clave: string; etiqueta: string }[];
}) {
  return (
    <div className="tarjeta-formulario">
      <h2>{titulo}</h2>
      <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 0 }}>{descripcion}</p>
      {filas.length === 0 ? (
        <p style={{ color: "#15803d", fontSize: 13, margin: 0 }}>Sin hallazgos.</p>
      ) : (
        <table className="tabla-datos">
          <thead>
            <tr>{columnas.map((c) => <th key={c.clave}>{c.etiqueta}</th>)}</tr>
          </thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i}>
                {columnas.map((c) => (
                  <td key={c.clave}>{c.clave === "fecha" || c.clave.endsWith("fecha") ? fechaHora(f[c.clave]) : Array.isArray(f[c.clave]) ? f[c.clave].join(", ") : String(f[c.clave] ?? "—")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function VistaSod() {
  const [data, setData] = useState<Sod | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/auditor/cumplimiento/sod?_t=${Date.now()}`);
        const json = await res.json();
        if (res.ok) setData(json);
        else setError(json.error ?? "No se pudo analizar la segregación de funciones.");
      } catch {
        setError("Error de conexión al analizar la segregación de funciones.");
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
        <h1>Segregación de funciones</h1>
        <p>Detección de aprobaciones del mismo usuario, autoaprobaciones y excepciones de perfiles.</p>
      </div>

      <Seccion
        titulo="Autoaprobación en tickets"
        descripcion="El aprobador del ticket es también su solicitante."
        filas={data.autoaprobacionTickets}
        columnas={[
          { clave: "codigo_ticket", etiqueta: "Ticket" },
          { clave: "titulo", etiqueta: "Título" },
          { clave: "usuario_nombre", etiqueta: "Usuario" },
          { clave: "estado_decision", etiqueta: "Decisión" },
          { clave: "fecha_decision", etiqueta: "Fecha" },
        ]}
      />
      <Seccion
        titulo="Autoaprobación en cambios"
        descripcion="El aprobador de la RFC es también su solicitante."
        filas={data.autoaprobacionCambios}
        columnas={[
          { clave: "codigo_cambio", etiqueta: "RFC" },
          { clave: "titulo", etiqueta: "Título" },
          { clave: "usuario_nombre", etiqueta: "Usuario" },
          { clave: "decision", etiqueta: "Decisión" },
          { clave: "fecha_decision", etiqueta: "Fecha" },
        ]}
      />
      <Seccion
        titulo="Aprobador que también resuelve"
        descripcion="El aprobador del ticket es el técnico asignado a su atención."
        filas={data.aprobadorResolutor}
        columnas={[
          { clave: "codigo_ticket", etiqueta: "Ticket" },
          { clave: "titulo", etiqueta: "Título" },
          { clave: "usuario_nombre", etiqueta: "Usuario" },
          { clave: "estado_decision", etiqueta: "Decisión" },
          { clave: "fecha_decision", etiqueta: "Fecha" },
        ]}
      />
      <Seccion
        titulo="Perfiles incompatibles o acumulación de roles"
        descripcion="Usuarios con perfiles Aprobador y Técnico simultáneos, o con cuatro o más perfiles."
        filas={data.perfilesIncompatibles}
        columnas={[
          { clave: "usuario_nombre", etiqueta: "Usuario" },
          { clave: "perfiles", etiqueta: "Perfiles" },
        ]}
      />
    </div>
  );
}
