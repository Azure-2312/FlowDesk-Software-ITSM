"use client";

import { useEffect, useState, useMemo } from "react";

interface Activo {
  id_activo: number;
  codigo_patrimonial: string;
  numero_serie: string | null;
  tipo_activo: string;
  marca: string;
  modelo: string;
  departamento_nombre: string | null;
  estado_activo: string;
  fecha_adquisicion: string | null;
  fecha_fin_garantia: string | null;
  nombre_modelo: string | null;
  modelo_fabricante: string | null;
}

interface ActaPendiente {
  id_acta: number;
  id_activo: number;
  tipo: string;
  estado: string;
  creado_en: string;
  codigo_patrimonial: string;
  tipo_activo: string;
  marca: string;
  modelo: string;
}

function formatearFecha(valor: string | null) {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleDateString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default function VistaMisActivos() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [actas, setActas] = useState<Record<number, ActaPendiente>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [actaSeleccionada, setActaSeleccionada] = useState<ActaPendiente | null>(null);
  const [observaciones, setObservaciones] = useState("");
  const [aceptando, setAceptando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const [resActivos, resActas] = await Promise.all([
        fetch(`/api/activos/mis-activos?_t=${Date.now()}`),
        fetch(`/api/activos/mis-activos/aceptar?_t=${Date.now()}`),
      ]);

      const dataActivos = await resActivos.json();
      if (resActivos.ok) {
        setActivos(Array.isArray(dataActivos) ? dataActivos : []);
      } else {
        setError(dataActivos.error ?? "No se pudieron cargar tus activos.");
      }

      if (resActas.ok) {
        const dataActas = await resActas.json();
        const mapa: Record<number, ActaPendiente> = {};
        (Array.isArray(dataActas) ? dataActas : []).forEach((acta: ActaPendiente) => {
          mapa[acta.id_activo] = acta;
        });
        setActas(mapa);
      }
    } catch {
      setError("Error de conexión al cargar tus activos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function confirmarAceptacion() {
    if (!actaSeleccionada) return;
    setAceptando(true);
    setErrorAccion(null);
    try {
      const res = await fetch("/api/activos/mis-activos/aceptar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_activo: actaSeleccionada.id_activo,
          observaciones: observaciones.trim() || null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErrorAccion(data?.error ?? "No se pudo aceptar el acta.");
        return;
      }
      setMensaje(data?.mensaje ?? "Acta de entrega aceptada.");
      setActaSeleccionada(null);
      setObservaciones("");
      await cargar();
    } catch {
      setErrorAccion("Error de conexión al aceptar el acta.");
    } finally {
      setAceptando(false);
    }
  }

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return activos;
    return activos.filter((a) =>
      [a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo, a.numero_serie ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [activos, busqueda]);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Mis activos</h1>
        <p>Equipos y licencias que tienes asignados como custodio.</p>
      </div>

      {mensaje && (
        <p role="status" style={{ color: "#065f46", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
          {mensaje}
        </p>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar por código, tipo, marca o serie..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1, minWidth: 240, padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
        />
        <button type="button" className="boton-secundario" onClick={cargar} style={{ width: "auto" }}>
          Actualizar
        </button>
      </div>

      {cargando ? (
        <p>Cargando activos...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : filtrados.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          {activos.length === 0
            ? "No tienes activos asignados actualmente."
            : "No se encontraron activos con ese criterio de búsqueda."}
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Marca / Modelo</th>
                <th>Serie</th>
                <th>Departamento</th>
                <th>Estado</th>
                <th>Garantía hasta</th>
                <th>Acta</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id_activo}>
                  <td><strong>{a.codigo_patrimonial}</strong></td>
                  <td>{a.tipo_activo}</td>
                  <td>{a.marca} {a.modelo}</td>
                  <td>{a.numero_serie ?? "—"}</td>
                  <td>{a.departamento_nombre ?? "—"}</td>
                  <td>{a.estado_activo}</td>
                  <td>{formatearFecha(a.fecha_fin_garantia)}</td>
                  <td>
                    {actas[a.id_activo] ? (
                      <button
                        type="button"
                        className="boton-secundario"
                        style={{ width: "auto", padding: "4px 10px", fontSize: 12 }}
                        onClick={() => {
                          setActaSeleccionada(actas[a.id_activo]);
                          setObservaciones("");
                          setErrorAccion(null);
                          setMensaje(null);
                        }}
                      >
                        Aceptar acta
                      </button>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actaSeleccionada && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => (!aceptando ? setActaSeleccionada(null) : undefined)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              width: "100%",
              maxWidth: 520,
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
              Aceptar acta de entrega
            </h2>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 16px" }}>
              Confirmas la recepción del activo <strong>{actaSeleccionada.codigo_patrimonial}</strong>{" "}
              ({actaSeleccionada.marca} {actaSeleccionada.modelo}) bajo tu custodia.
            </p>

            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              Observaciones (opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={3}
              placeholder="Estado del equipo, accesorios recibidos, incidencias..."
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                fontSize: 13,
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />

            {errorAccion && (
              <p role="alert" className="mensaje-error" style={{ marginTop: 12 }}>{errorAccion}</p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto" }}
                onClick={() => setActaSeleccionada(null)}
                disabled={aceptando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="boton-primario"
                style={{ width: "auto" }}
                onClick={confirmarAceptacion}
                disabled={aceptando}
              >
                {aceptando ? "Aceptando..." : "Aceptar acta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
