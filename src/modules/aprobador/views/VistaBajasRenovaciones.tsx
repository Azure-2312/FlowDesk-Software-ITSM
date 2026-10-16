"use client";

import { useEffect, useState } from "react";

interface Baja {
  id_solicitud: number;
  id_activo: number;
  motivo: string;
  fecha_solicitud: string;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
  costo_compra: number;
  solicitante_nombre: string | null;
}

interface Renovacion {
  id_licencia: number;
  nombre_software: string;
  fabricante: string;
  tipo_licencia: string;
  cantidad_adquirida: number;
  cantidad_en_uso: number;
  fecha_vencimiento: string | null;
  costo_anual: number;
  dias_restantes: number;
}

function fecha(valor: string | null) {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function soles(n: number) {
  return `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;
}

export default function VistaBajasRenovaciones() {
  const [bajas, setBajas] = useState<Baja[]>([]);
  const [renovaciones, setRenovaciones] = useState<Renovacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/aprobador/activos?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setBajas(Array.isArray(json?.bajas) ? json.bajas : []);
        setRenovaciones(Array.isArray(json?.renovaciones) ? json.renovaciones : []);
      } else setError(json.error ?? "No se pudieron cargar las solicitudes.");
    } catch {
      setError("Error de conexión al cargar las solicitudes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function decidir(tipo: "BAJA" | "RENOVACION", id: number, decision: "APROBADO" | "RECHAZADO") {
    const comentario = window.prompt(`Comentario de la decisión (${decision}):`) ?? "";
    if (comentario.trim().length < 3) {
      setError("El comentario es obligatorio (mínimo 3 caracteres).");
      return;
    }
    const clave = `${tipo}-${id}`;
    setProcesando(clave);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/aprobador/activos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, id, decision, comentario }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo registrar la decisión.");
      else {
        setOk("Decisión registrada.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al registrar la decisión.");
    } finally {
      setProcesando(null);
    }
  }

  if (cargando) return <div className="vista-contenedor"><p>Cargando...</p></div>;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Bajas y renovaciones por monto</h1>
        <p>Autoriza las solicitudes cuyo monto supera el umbral definido.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="tarjeta-formulario">
        <h2>Bajas de activos por monto</h2>
        {bajas.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>No hay bajas pendientes sobre el umbral.</p>
        ) : (
          <table className="tabla-datos">
            <thead>
              <tr><th>Código</th><th>Activo</th><th>Monto</th><th>Motivo</th><th>Solicitante</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {bajas.map((b) => {
                const clave = `BAJA-${b.id_solicitud}`;
                return (
                  <tr key={b.id_solicitud}>
                    <td><strong>{b.codigo_patrimonial}</strong></td>
                    <td>{b.tipo_activo} {b.marca} {b.modelo}</td>
                    <td><strong>{soles(b.costo_compra)}</strong></td>
                    <td>{b.motivo}</td>
                    <td>{b.solicitante_nombre ?? "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="boton-primario" style={{ width: "auto", fontSize: 12, padding: "5px 10px" }} disabled={procesando === clave} onClick={() => decidir("BAJA", b.id_solicitud, "APROBADO")}>Aprobar</button>
                        <button className="boton-secundario" style={{ width: "auto", fontSize: 12, padding: "5px 10px" }} disabled={procesando === clave} onClick={() => decidir("BAJA", b.id_solicitud, "RECHAZADO")}>Rechazar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="tarjeta-formulario">
        <h2>Renovaciones de licencias por vencer</h2>
        {renovaciones.length === 0 ? (
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>No hay renovaciones pendientes sobre el umbral.</p>
        ) : (
          <table className="tabla-datos">
            <thead>
              <tr><th>Software</th><th>Fabricante</th><th>Costo anual</th><th>Vence</th><th>Días</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {renovaciones.map((r) => {
                const clave = `RENOVACION-${r.id_licencia}`;
                return (
                  <tr key={r.id_licencia}>
                    <td><strong>{r.nombre_software}</strong></td>
                    <td>{r.fabricante}</td>
                    <td><strong>{soles(r.costo_anual)}</strong></td>
                    <td style={{ color: r.dias_restantes <= 30 ? "#b91c1c" : undefined, fontWeight: r.dias_restantes <= 30 ? 600 : undefined }}>{fecha(r.fecha_vencimiento)}</td>
                    <td>{r.dias_restantes}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="boton-primario" style={{ width: "auto", fontSize: 12, padding: "5px 10px" }} disabled={procesando === clave} onClick={() => decidir("RENOVACION", r.id_licencia, "APROBADO")}>Aprobar</button>
                        <button className="boton-secundario" style={{ width: "auto", fontSize: 12, padding: "5px 10px" }} disabled={procesando === clave} onClick={() => decidir("RENOVACION", r.id_licencia, "RECHAZADO")}>Rechazar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
