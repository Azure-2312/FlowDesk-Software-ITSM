"use client";

import { useEffect, useState } from "react";

interface Registro {
  id_log: number;
  direccion: "ENTRANTE" | "SALIENTE" | "ADMIN";
  grupo_identificado: string | null;
  metodo: string;
  ruta: string;
  codigo_estado: number;
  ip_origen: string | null;
  tiempo_respuesta_ms: number | null;
  mensaje_error: string | null;
  detalle: string | null;
  fecha_registro: string;
  usuario: string | null;
}

interface Resumen {
  exitosas: number;
  rechazadas: number;
  bloqueadas: number;
  extracciones: number;
}

const DIRECCIONES: Record<string, string> = {
  ENTRANTE: "Entrante",
  SALIENTE: "Saliente",
  ADMIN: "Administración",
};

function insigniaCodigo(codigo: number) {
  const clase = codigo < 400 ? "insignia-exito" : codigo === 429 ? "insignia-aviso" : "insignia-peligro";
  return <span className={`insignia ${clase}`}>{codigo}</span>;
}

export default function VistaBitacoraApi() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [direccion, setDireccion] = useState("");
  const [resultado, setResultado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (direccion) params.set("direccion", direccion);
      if (resultado) params.set("resultado", resultado);
      const res = await fetch(`/api/integraciones/bitacora?${params}`, { cache: "no-store" });
      const datos = await res.json();
      if (!res.ok) throw new Error(datos.error || "No se pudo cargar la bitácora");
      setRegistros(datos.registros || []);
      setResumen(datos.resumen_24h || null);
    } catch (e: any) {
      setError(e.message || "Error de conexión");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, [direccion, resultado]);

  const tarjetas: [string, number | undefined][] = [
    ["Peticiones aceptadas", resumen?.exitosas],
    ["Rechazadas (401/403)", resumen?.rechazadas],
    ["Bloqueadas (429)", resumen?.bloqueadas],
    ["Extracciones externas", resumen?.extracciones],
  ];

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h1 className="titulo-pagina">Bitácora de la API</h1>
          <p className="descripcion-pagina">
            Registro inmutable de cada petición recibida, cada consulta a empresas externas y cada cambio de credenciales. La base
            de datos impide modificar o borrar estos registros.
          </p>
        </div>
        <button type="button" className="boton-secundario" onClick={cargar} disabled={cargando}>
          Actualizar
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: 12, marginBottom: 16 }}>
        {tarjetas.map(([titulo, valor]) => (
          <div key={titulo} className="tarjeta" style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{titulo} · 24 h</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{valor ?? "—"}</div>
          </div>
        ))}
      </div>

      <div className="barra-filtros" style={{ marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <select className="input-base" value={direccion} onChange={(e) => setDireccion(e.target.value)} style={{ maxWidth: 240 }} aria-label="Dirección">
          <option value="">Todas las direcciones</option>
          <option value="ENTRANTE">Entrantes (otros equipos → FlowDesk)</option>
          <option value="SALIENTE">Salientes (FlowDesk → empresas externas)</option>
          <option value="ADMIN">Administración de credenciales</option>
        </select>
        <select className="input-base" value={resultado} onChange={(e) => setResultado(e.target.value)} style={{ maxWidth: 200 }} aria-label="Resultado">
          <option value="">Todos los resultados</option>
          <option value="exito">Solo aceptadas</option>
          <option value="error">Solo rechazadas o con error</option>
        </select>
      </div>

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

      {cargando ? (
        <p className="descripcion">Cargando bitácora...</p>
      ) : registros.length === 0 ? (
        <div className="estado-vacio">
          <p style={{ margin: 0 }}>No hay registros con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="contenedor-tabla" style={{ overflowX: "auto" }}>
          <table className="tabla-datos" style={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th>Fecha y hora</th>
                <th>Dirección</th>
                <th>Origen o destino</th>
                <th>Operación</th>
                <th>Resultado</th>
                <th>IP</th>
                <th style={{ textAlign: "right" }}>Tiempo</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id_log}>
                  <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{new Date(r.fecha_registro).toLocaleString("es-PE")}</td>
                  <td style={{ fontSize: 12 }}>{DIRECCIONES[r.direccion] || r.direccion}</td>
                  <td style={{ fontSize: 12.5 }}>
                    <div style={{ fontWeight: 600 }}>{r.grupo_identificado || "Sin identificar"}</div>
                    {r.usuario && <div style={{ fontSize: 11.5, color: "#64748b" }}>por {r.usuario}</div>}
                  </td>
                  <td style={{ fontSize: 12, fontFamily: "monospace" }}>{r.metodo} {r.ruta}</td>
                  <td>{insigniaCodigo(r.codigo_estado)}</td>
                  <td style={{ fontSize: 11.5, fontFamily: "monospace" }}>{r.ip_origen || "—"}</td>
                  <td style={{ fontSize: 12, textAlign: "right" }}>{r.tiempo_respuesta_ms ?? "—"} ms</td>
                  <td style={{ fontSize: 12, color: r.mensaje_error ? "#b91c1c" : "#334155" }}>{r.mensaje_error || r.detalle || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
