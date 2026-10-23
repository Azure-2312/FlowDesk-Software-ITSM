"use client";

import { useEffect, useState } from "react";

interface Actualizacion {
  id_actualizacion: number;
  tipo_operacion: string;
  detalle: string | null;
  estado: string;
  fecha_creacion: string;
  fecha_aplicacion: string | null;
  codigo_cambio: string | null;
  cambio_titulo: string | null;
  codigo_ci: string | null;
  ci_nombre: string | null;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  PENDIENTE: { bg: "#fef3c7", fg: "#92400e" },
  APLICADO: { bg: "#dcfce7", fg: "#166534" },
  DESCARTADO: { bg: "#e5e7eb", fg: "#374151" },
};

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function VistaCmdbActualizaciones() {
  const [items, setItems] = useState<Actualizacion[]>([]);
  const [pendientes, setPendientes] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<number | "generar" | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cmdb/actualizaciones?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setItems(Array.isArray(json?.actualizaciones) ? json.actualizaciones : []);
        setPendientes(json?.pendientes ?? 0);
      } else setError(json.error ?? "No se pudieron cargar las actualizaciones.");
    } catch {
      setError("Error de conexión al cargar las actualizaciones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function accion(cuerpo: Record<string, unknown>, marca: number | "generar") {
    setProcesando(marca);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/cmdb/actualizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo procesar.");
      else {
        setOk(json.mensaje ?? "Operación completada.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al procesar.");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Actualizaciones de CMDB desde cambios</h1>
        <p>Aplica a la CMDB lo propuesto en las RFC cerradas y controla los pendientes.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <button className="boton-primario" style={{ width: "auto" }} disabled={procesando === "generar"} onClick={() => accion({ accion: "generar" }, "generar")}>
          {procesando === "generar" ? "Generando..." : "Generar desde cambios cerrados"}
        </button>
        <span style={{ fontSize: 13, color: "#6b7280" }}>{pendientes} actualización(es) pendiente(s)</span>
      </div>

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay actualizaciones registradas.</div>
      ) : (
        <table className="tabla-datos">
          <thead><tr><th>RFC</th><th>CI</th><th>Operación</th><th>Detalle</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>
            {items.map((a) => {
              const color = COLORES[a.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
              return (
                <tr key={a.id_actualizacion}>
                  <td>{a.codigo_cambio ?? "—"}{a.cambio_titulo && <div style={{ fontSize: 11.5, color: "#6b7280" }}>{a.cambio_titulo}</div>}</td>
                  <td>{a.codigo_ci ?? "—"}{a.ci_nombre && <div style={{ fontSize: 11.5, color: "#6b7280" }}>{a.ci_nombre}</div>}</td>
                  <td>{a.tipo_operacion}</td>
                  <td style={{ fontSize: 12, color: "#6b7280" }}>{a.detalle ?? "—"}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{a.estado}</span></td>
                  <td>{fechaHora(a.fecha_aplicacion ?? a.fecha_creacion)}</td>
                  <td>
                    {a.estado === "PENDIENTE" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando === a.id_actualizacion} onClick={() => accion({ accion: "resolver", id_actualizacion: a.id_actualizacion, decision: "APLICAR" }, a.id_actualizacion)}>Aplicar</button>
                        <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando === a.id_actualizacion} onClick={() => accion({ accion: "resolver", id_actualizacion: a.id_actualizacion, decision: "DESCARTAR" }, a.id_actualizacion)}>Descartar</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
