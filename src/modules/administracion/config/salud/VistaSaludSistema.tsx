"use client";

import { useEffect, useState } from "react";

interface SaludSistema {
  estado: "ok" | "degradado";
  base_datos: {
    conectada: boolean;
    nombre: string;
    version: string;
    tamano: string;
    latencia_ms: number;
  };
  conexiones: {
    activas: number;
    totales: number;
    maximo: number;
  };
  tablas: { tabla: string; registros: number }[];
  verificado_en: string;
}

function Tarjeta({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="tarjeta-formulario" style={{ margin: 0 }}>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4 }}>{titulo}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginTop: 6 }}>{valor}</div>
      {detalle && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{detalle}</div>}
    </div>
  );
}

export default function VistaSaludSistema() {
  const [salud, setSalud] = useState<SaludSistema | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/salud-sistema?_t=${Date.now()}`);
      const data = await res.json();
      if (res.ok) {
        setSalud(data);
      } else {
        setError(data.error ?? "No se pudo obtener la salud del sistema.");
      }
    } catch {
      setError("Error de conexión al consultar la salud del sistema.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Salud del sistema</h1>
        <p>Estado de la base de datos, conexiones y volumen de información.</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <button type="button" className="boton-secundario" onClick={cargar} style={{ width: "auto" }} disabled={cargando}>
          {cargando ? "Verificando..." : "Verificar de nuevo"}
        </button>
      </div>

      {cargando && !salud ? (
        <p>Verificando el estado del sistema...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : salud ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                display: "inline-block",
                padding: "5px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: salud.estado === "ok" ? "#dcfce7" : "#fef3c7",
                color: salud.estado === "ok" ? "#166534" : "#92400e",
              }}
            >
              {salud.estado === "ok" ? "OPERATIVO" : "DEGRADADO"}
            </span>
            <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 10 }}>
              Verificado: {new Date(salud.verificado_en).toLocaleString("es-PE")}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
            <Tarjeta titulo="Base de datos" valor={salud.base_datos.nombre} detalle={salud.base_datos.version} />
            <Tarjeta titulo="Tamaño" valor={salud.base_datos.tamano} detalle={`Latencia: ${salud.base_datos.latencia_ms} ms`} />
            <Tarjeta
              titulo="Conexiones"
              valor={`${salud.conexiones.totales} / ${salud.conexiones.maximo}`}
              detalle={`${salud.conexiones.activas} activas`}
            />
          </div>

          <div className="tarjeta-formulario">
            <h2>Volumen de información</h2>
            <table className="tabla-datos">
              <thead>
                <tr>
                  <th>Entidad</th>
                  <th style={{ textAlign: "right" }}>Registros</th>
                </tr>
              </thead>
              <tbody>
                {salud.tablas.map((t) => (
                  <tr key={t.tabla}>
                    <td>{t.tabla}</td>
                    <td style={{ textAlign: "right" }}>{t.registros.toLocaleString("es-PE")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
