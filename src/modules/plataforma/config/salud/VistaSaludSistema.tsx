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

interface TareaProgramada {
  id_tarea: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  frecuencia: string | null;
  ultima_ejecucion: string | null;
  proxima_ejecucion: string | null;
  estado: string | null;
  duracion_ms: number | null;
  ultimo_resultado: string | null;
  activo: boolean;
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

function formatearFecha(valor: string | null): string {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleString("es-PE");
}

/** Colores de la insignia según el estado de una tarea programada. */
function coloresEstadoTarea(estado: string | null) {
  switch (estado) {
    case "exitoso":
      return { backgroundColor: "#dcfce7", color: "#166534" };
    case "advertencia":
      return { backgroundColor: "#fef3c7", color: "#92400e" };
    case "fallido":
      return { backgroundColor: "#fee2e2", color: "#991b1b" };
    default:
      return { backgroundColor: "#e5e7eb", color: "#374151" };
  }
}

function Insignia({ texto, colores }: { texto: string; colores: { backgroundColor: string; color: string } }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        ...colores,
      }}
    >
      {texto}
    </span>
  );
}

export default function VistaSaludSistema() {
  const [salud, setSalud] = useState<SaludSistema | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tareas, setTareas] = useState<TareaProgramada[]>([]);
  const [cargandoTareas, setCargandoTareas] = useState(true);
  const [errorTareas, setErrorTareas] = useState<string | null>(null);
  const [tareaEnCurso, setTareaEnCurso] = useState<number | null>(null);

  const [aviso, setAviso] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/operacion/salud-sistema?_t=${Date.now()}`);
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

  async function cargarTareas() {
    setCargandoTareas(true);
    setErrorTareas(null);
    try {
      const res = await fetch(`/api/operacion/salud-sistema/tareas?_t=${Date.now()}`);
      const data = await res.json();
      if (res.ok) {
        setTareas(data);
      } else {
        setErrorTareas(data.error ?? "No se pudieron obtener las tareas programadas.");
      }
    } catch {
      setErrorTareas("Error de conexión al consultar las tareas programadas.");
    } finally {
      setCargandoTareas(false);
    }
  }

  async function ejecutarTarea(idTarea: number) {
    setTareaEnCurso(idTarea);
    setAviso(null);
    try {
      const res = await fetch(`/api/operacion/salud-sistema/tareas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tarea: idTarea }),
      });
      const data = await res.json();
      if (res.ok) {
        setAviso(`Tarea "${data.nombre}" ejecutada correctamente.`);
        await cargarTareas();
      } else {
        setAviso(data.error ?? "No se pudo ejecutar la tarea.");
      }
    } catch {
      setAviso("Error de conexión al ejecutar la tarea.");
    } finally {
      setTareaEnCurso(null);
    }
  }

  useEffect(() => {
    cargar();
    cargarTareas();
  }, []);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "nowrap", gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1>Salud del sistema</h1>
          <p>Estado de la base de datos, conexiones y volumen de información.</p>
        </div>
        <button type="button" className="boton-primario" onClick={cargar} style={{ width: "auto", padding: "8px 18px", fontSize: 13, flexShrink: 0 }} disabled={cargando}>
          {cargando ? "Verificando..." : "Verificar Estado"}
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
            <div style={{ overflowX: "auto" }}>
              <table className="tabla-datos" style={{ minWidth: 600 }}>
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
        </div>
      </>
    ) : null}

      {aviso && (
        <p
          role="status"
          style={{
            marginTop: 16,
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: "#eff6ff",
            color: "#1e40af",
            border: "1px solid #bfdbfe",
          }}
        >
          {aviso}
        </p>
      )}

      {/* Tareas programadas */}
      <div className="tarjeta-formulario" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Tareas programadas</h2>
          <button
            type="button"
            className="boton-secundario"
            style={{ width: "auto" }}
            onClick={cargarTareas}
            disabled={cargandoTareas}
          >
            {cargandoTareas ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {cargandoTareas && tareas.length === 0 ? (
          <p>Cargando tareas programadas...</p>
        ) : errorTareas ? (
          <p role="alert" className="mensaje-error">{errorTareas}</p>
        ) : tareas.length === 0 ? (
          <p>No hay tareas programadas registradas.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="tabla-datos" style={{ minWidth: 750 }}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Frecuencia</th>
                <th>Última ejecución</th>
                <th>Próxima ejecución</th>
                <th>Estado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareas.map((t) => (
                <tr key={t.id_tarea}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.nombre}</div>
                    {t.descripcion && (
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{t.descripcion}</div>
                    )}
                  </td>
                  <td>{t.frecuencia ?? "—"}</td>
                  <td>{formatearFecha(t.ultima_ejecucion)}</td>
                  <td>{formatearFecha(t.proxima_ejecucion)}</td>
                  <td>
                    <Insignia texto={t.estado ?? "sin estado"} colores={coloresEstadoTarea(t.estado)} />
                    {!t.activo && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: "#6b7280" }}>inactiva</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="boton-secundario"
                      style={{ width: "auto", padding: "4px 10px", fontSize: 12 }}
                      onClick={() => ejecutarTarea(t.id_tarea)}
                      disabled={tareaEnCurso === t.id_tarea || !t.activo}
                    >
                      {tareaEnCurso === t.id_tarea ? "Ejecutando..." : "Ejecutar ahora"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
