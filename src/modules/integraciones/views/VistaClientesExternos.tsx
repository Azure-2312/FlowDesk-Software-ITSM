"use client";

import { useState } from "react";

interface ClienteExterno {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  direccion: string;
  ubigeo: string;
  fecha_registro: string;
}

interface Extraccion {
  equipo: string;
  total_informado: number;
  truncado: boolean;
  origen: string;
  fecha_extraccion: string;
  clientes: ClienteExterno[];
}

const FORMATOS = [
  { codigo: "xlsx", etiqueta: "Excel" },
  { codigo: "pdf", etiqueta: "PDF" },
  { codigo: "csv", etiqueta: "CSV" },
  { codigo: "json", etiqueta: "JSON" },
] as const;

const URL_API = "/api/integraciones/clientes-externos";

export default function VistaClientesExternos() {
  const [datos, setDatos] = useState<Extraccion | null>(null);
  const [cargando, setCargando] = useState(false);
  const [descargando, setDescargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");

  async function consultar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(URL_API, { cache: "no-store" });
      const cuerpo = await res.json();
      if (!res.ok) throw new Error(cuerpo.error || "No se pudo consultar la API externa");
      setDatos(cuerpo);
    } catch (e: any) {
      setError(e.message || "Error de conexión");
    } finally {
      setCargando(false);
    }
  }

  async function descargar(formato: string) {
    setDescargando(formato);
    setError(null);
    try {
      const res = await fetch(`${URL_API}?formato=${formato}`, { cache: "no-store" });
      if (!res.ok) {
        const cuerpo = await res.json().catch(() => ({}));
        throw new Error(cuerpo.error || "No se pudo generar el archivo");
      }
      const nombre = /filename="([^"]+)"/.exec(res.headers.get("content-disposition") || "")?.[1] || `clientes.${formato}`;
      const url = URL.createObjectURL(await res.blob());
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombre;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message || "Error de conexión");
    } finally {
      setDescargando(null);
    }
  }

  const ocupado = cargando || descargando !== null;
  const termino = filtro.trim().toLowerCase();
  const visibles = (datos?.clientes || []).filter(
    (c) => !termino || `${c.nombres} ${c.apellidos} ${c.correo}`.toLowerCase().includes(termino)
  );

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina">
        <h1 className="titulo-pagina">Clientes de empresa externa</h1>
        <p className="descripcion-pagina">
          Lista los clientes de la empresa del Equipo 10 a través de su API. La consulta se hace desde el servidor con una clave
          privada, los datos no se guardan en FlowDesk y cada extracción queda en la bitácora.
        </p>
      </div>

      <div className="tarjeta" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "#334155", flex: 1, minWidth: 220 }}>
            {datos ? (
              <>
                <strong>{datos.clientes.length}</strong> clientes de <strong>{datos.equipo}</strong> · {datos.origen} · consultado el{" "}
                {new Date(datos.fecha_extraccion).toLocaleString("es-PE")}
              </>
            ) : (
              "La primera consulta puede tardar hasta un minuto si el servidor del otro equipo está inactivo."
            )}
          </div>
          <button type="button" className="boton-primario" onClick={consultar} disabled={ocupado}>
            {cargando ? "Consultando..." : datos ? "Volver a consultar" : "Listar clientes"}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>Descargar todos:</span>
          {FORMATOS.map((f) => (
            <button key={f.codigo} type="button" className="boton-secundario boton-sm" disabled={ocupado} onClick={() => descargar(f.codigo)}>
              {descargando === f.codigo ? "Generando..." : f.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}
      {datos?.truncado && (
        <div className="mensaje-error" style={{ marginBottom: 16 }}>
          La empresa externa informó {datos.total_informado} clientes; por seguridad se extraen como máximo 5000.
        </div>
      )}

      {datos && (
        datos.clientes.length === 0 ? (
          <div className="estado-vacio">
            <p style={{ margin: 0 }}>La empresa externa no tiene clientes registrados.</p>
          </div>
        ) : (
          <>
            <div className="barra-filtros" style={{ marginBottom: 12 }}>
              <input className="input-base" placeholder="Filtrar por nombre o correo..." value={filtro}
                onChange={(e) => setFiltro(e.target.value)} style={{ maxWidth: 360 }} aria-label="Filtrar clientes" />
            </div>
            <div className="contenedor-tabla" style={{ overflowX: "auto" }}>
              <table className="tabla-datos" style={{ minWidth: 900 }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                    <th>Ubigeo</th>
                    <th>Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((c, i) => (
                    <tr key={`${c.id}-${i}`}>
                      <td style={{ fontSize: 12, fontFamily: "monospace" }}>{c.id}</td>
                      <td>{c.nombres}</td>
                      <td>{c.apellidos}</td>
                      <td style={{ fontSize: 12.5 }}>{c.correo}</td>
                      <td style={{ fontSize: 12.5 }}>{c.telefono || "—"}</td>
                      <td style={{ fontSize: 12.5 }}>{c.direccion || "—"}</td>
                      <td style={{ fontSize: 12, fontFamily: "monospace" }}>{c.ubigeo || "—"}</td>
                      <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                        {c.fecha_registro ? new Date(c.fecha_registro).toLocaleDateString("es-PE") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  );
}
