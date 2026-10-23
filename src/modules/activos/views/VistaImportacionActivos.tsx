"use client";

import { useEffect, useState } from "react";

interface Importacion {
  id_importacion: number;
  nombre_archivo: string | null;
  total_filas: number;
  filas_validas: number;
  filas_invalidas: number;
  estado: string;
  fecha_creacion: string;
  fecha_aplicacion: string | null;
  usuario_nombre: string | null;
}

const PLANTILLA = "codigo_patrimonial,numero_serie,tipo_activo,marca,modelo\nPAT-1001,SN-ABC123,LAPTOP,Dell,Latitude 5420";

function fechaHora(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  VALIDADO: { bg: "#fef3c7", fg: "#92400e" },
  APLICADO: { bg: "#dcfce7", fg: "#166534" },
  REVERTIDO: { bg: "#e5e7eb", fg: "#374151" },
};

export default function VistaImportacionActivos() {
  const [items, setItems] = useState<Importacion[]>([]);
  const [texto, setTexto] = useState(PLANTILLA);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<string[]>([]);
  const [procesando, setProcesando] = useState<number | "validar" | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/activos/importacion?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar las importaciones.");
    } catch {
      setError("Error de conexión al cargar las importaciones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function parsear(): any[] {
    const lineas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lineas.length <= 1) return [];
    const cabecera = lineas[0].split(",").map((h) => h.trim());
    return lineas.slice(1).map((linea) => {
      const valores = linea.split(",").map((v) => v.trim());
      const obj: any = {};
      cabecera.forEach((col, i) => { obj[col] = valores[i] ?? ""; });
      return obj;
    });
  }

  async function accion(accion: string, idImportacion?: number) {
    setProcesando(accion === "validar" ? "validar" : idImportacion ?? null);
    setError(null);
    setOk(null);
    setDetalle([]);
    try {
      const cuerpo: any = { accion };
      if (accion === "validar") {
        const filas = parsear();
        if (filas.length === 0) { setError("Pega al menos una fila de datos (además de la cabecera)."); setProcesando(null); return; }
        cuerpo.filas = filas;
        cuerpo.nombre_archivo = "lote.csv";
      } else {
        cuerpo.id_importacion = idImportacion;
      }
      const res = await fetch("/api/activos/importacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo procesar.");
      else {
        setOk(json.mensaje ?? "Operación completada.");
        if (Array.isArray(json.invalidas) && json.invalidas.length) {
          setDetalle(json.invalidas.map((x: any) => `Fila ${x.fila}: ${x.motivo}`));
        }
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
        <h1>Importación masiva de activos</h1>
        <p>Validación en seco, mapeo por cabecera y reversión del lote importado.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}
      {detalle.length > 0 && (
        <ul style={{ fontSize: 12.5, color: "#b45309", marginBottom: 12 }}>
          {detalle.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      )}

      <div className="tarjeta-formulario" style={{ marginBottom: 20 }}>
        <h2>Pegar lote (CSV)</h2>
        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 0 }}>Cabecera esperada: codigo_patrimonial, numero_serie, tipo_activo, marca, modelo.</p>
        <textarea rows={8} value={texto} onChange={(e) => setTexto(e.target.value)} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontFamily: "monospace", fontSize: 12.5 }} />
        <button className="boton-primario" style={{ width: "auto", marginTop: 10 }} disabled={procesando === "validar"} onClick={() => accion("validar")}>
          {procesando === "validar" ? "Validando..." : "Validar en seco"}
        </button>
      </div>

      <h2>Historial de importaciones</h2>
      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>No hay importaciones registradas.</div>
      ) : (
        <table className="tabla-datos">
          <thead><tr><th>Archivo</th><th>Total</th><th>Válidas</th><th>Inválidas</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
          <tbody>
            {items.map((i) => {
              const color = COLORES[i.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
              return (
                <tr key={i.id_importacion}>
                  <td>{i.nombre_archivo ?? "—"}</td>
                  <td>{i.total_filas}</td>
                  <td>{i.filas_validas}</td>
                  <td>{i.filas_invalidas}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{i.estado}</span></td>
                  <td>{fechaHora(i.fecha_creacion)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {i.estado === "VALIDADO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando === i.id_importacion} onClick={() => accion("aplicar", i.id_importacion)}>Aplicar</button>}
                      {i.estado === "APLICADO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando === i.id_importacion} onClick={() => accion("revertir", i.id_importacion)}>Revertir</button>}
                    </div>
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
