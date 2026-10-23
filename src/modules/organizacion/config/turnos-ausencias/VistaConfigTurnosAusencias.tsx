"use client";

import { useEffect, useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Trash2 } from "@/shared/components/ui/Iconos";
import CalendarioTurnosTecnicos from "./components/CalendarioTurnosTecnicos";
import ModalRegistrarAusencia from "./components/ModalRegistrarAusencia";

type Turno = "MANANA" | "TARDE" | "NOCHE" | "GUARDIA_24X7";

const ETIQUETAS_TURNO: Record<Turno, string> = {
  MANANA: "Mañana",
  TARDE: "Tarde",
  NOCHE: "Noche",
  GUARDIA_24X7: "Guardia 24x7",
};

interface Tecnico {
  id_usuario: number;
  nombre: string;
}

interface EventoTurno {
  id: number;
  id_usuario_tecnico: number;
  tecnico_nombre: string;
  fecha: string;
  turno: Turno;
  notas?: string;
}

interface Ausencia {
  id_ausencia: number;
  id_usuario_tecnico: number;
  tecnico_nombre: string;
  fecha_desde: string;
  fecha_hasta: string;
  motivo: string;
  id_usuario_reemplazo?: number | null;
  reemplazo_nombre?: string | null;
}

function normalizarTecnicos(json: any): Tecnico[] {
  const lista = Array.isArray(json) ? json : json?.tecnicos ?? json?.data ?? [];
  return (lista as any[]).map((t) => ({
    id_usuario: t.id_usuario ?? t.id ?? 0,
    nombre:
      t.nombre ??
      t.nombre_completo ??
      [t.nombres, t.apellido_paterno].filter(Boolean).join(" ") ??
      `Usuario ${t.id_usuario}`,
  }));
}

function normalizarTurnos(json: any): EventoTurno[] {
  const lista = Array.isArray(json) ? json : json?.turnos ?? [];
  return (lista as any[]).map((t) => ({
    id: t.id_turno ?? t.id ?? 0,
    id_usuario_tecnico: t.id_usuario_tecnico,
    tecnico_nombre: t.tecnico_nombre ?? `Usuario ${t.id_usuario_tecnico}`,
    fecha: String(t.fecha ?? "").slice(0, 10),
    turno: t.turno,
    notas: t.notas ?? undefined,
  }));
}

function formatearFecha(fecha: string) {
  if (!fecha) return "—";
  const valor = new Date(`${fecha.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(valor.getTime())) return fecha;
  return valor.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function VistaConfigTurnosAusencias() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [eventos, setEventos] = useState<EventoTurno[]>([]);
  const [ausencias, setAusencias] = useState<Ausencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const [resTec, resAus, resTurnos] = await Promise.all([
        fetch(`/api/tecnicos?_t=${Date.now()}`),
        fetch(`/api/organizacion/equipo/ausencias?_t=${Date.now()}`),
        fetch(`/api/organizacion/equipo/turnos?_t=${Date.now()}`),
      ]);

      const [jsonTec, jsonAus, jsonTurnos] = await Promise.all([
        resTec.json(),
        resAus.json(),
        resTurnos.json(),
      ]);

      if (!resTec.ok) {
        throw new Error(jsonTec?.error ?? "No se pudieron cargar los técnicos.");
      }
      if (!resAus.ok) {
        throw new Error(jsonAus?.error ?? "No se pudieron cargar las ausencias.");
      }
      if (!resTurnos.ok) {
        throw new Error(jsonTurnos?.error ?? "No se pudo cargar el calendario de turnos.");
      }

      setTecnicos(normalizarTecnicos(jsonTec));
      setAusencias(Array.isArray(jsonAus?.ausencias) ? jsonAus.ausencias : []);
      setEventos(normalizarTurnos(jsonTurnos));
    } catch (err: any) {
      setError(err?.message ?? "Error de conexión al cargar turnos y ausencias.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function registrarAusencia(datos: {
    id_usuario_tecnico: number;
    id_usuario_reemplazo?: number;
    fecha_desde: string;
    fecha_hasta: string;
    motivo: string;
  }) {
    try {
      const res = await fetch("/api/organizacion/equipo/ausencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const json = await res.json();
      if (!res.ok || json.ok === false) {
        throw new Error(json.error ?? "No se pudo registrar la ausencia.");
      }
      setOk("Ausencia registrada correctamente.");
      setTimeout(() => setOk(null), 4000);
      await cargar();
    } catch (err: any) {
      throw new Error(err?.message ?? "Error de conexión al registrar la ausencia.");
    }
  }

  async function asignarTurno(datos: {
    id_usuario_tecnico: number;
    fecha: string;
    turno: Turno;
    notas?: string;
  }) {
    setError(null);
    try {
      const res = await fetch("/api/organizacion/equipo/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const json = await res.json();

      if (!res.ok || json.ok === false) {
        setError(json.error ?? "No se pudo asignar el turno.");
        return;
      }

      setOk("Turno guardado correctamente.");
      setTimeout(() => setOk(null), 4000);
      await cargar();
    } catch {
      setError("Error de conexión al asignar el turno.");
    }
  }

  async function eliminarTurno(id: number) {
    if (!window.confirm("¿Eliminar este turno de la agenda?")) return;

    setError(null);
    try {
      const res = await fetch(`/api/organizacion/equipo/turnos?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || json.ok === false) {
        setError(json.error ?? "No se pudo eliminar el turno.");
        return;
      }
      setOk("Turno eliminado.");
      setTimeout(() => setOk(null), 4000);
      await cargar();
    } catch {
      setError("Error de conexión al eliminar el turno.");
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <h1>Gestión de Turnos y Ausencias</h1>
          <p>Turnos operativos (Mañana, Tarde, Noche, Guardias 24x7) y registro de ausencias con designación de técnico de reemplazo.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="boton-secundario" style={{ width: "auto" }} onClick={() => setModalAbierto(true)}>
            Registrar ausencia con reemplazo
          </button>
        </div>
      </div>

      {ok && <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{ok}</div>}
      {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      <section style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16 }}>Calendario de guardias y turnos</h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>Asigna turnos por técnico y visualiza la cobertura del mes. No se permiten turnos en fechas con ausencia registrada.</p>
          </div>
        </div>
        {cargando ? (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>Cargando agenda...</div>
        ) : (
          <CalendarioTurnosTecnicos eventos={eventos} tecnicos={tecnicos} onCrear={asignarTurno} />
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16 }}>Turnos registrados</h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>Agenda persistida de turnos y guardias del equipo.</p>
          </div>
        </div>
        {cargando ? (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>Cargando turnos...</div>
        ) : eventos.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>Sin turnos registrados.</div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Técnico</th>
                  <th>Turno</th>
                  <th>Notas</th>
                  <th style={{ textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((evento) => (
                  <tr key={evento.id}>
                    <td>{formatearFecha(evento.fecha)}</td>
                    <td style={{ fontWeight: 600 }}>{evento.tecnico_nombre}</td>
                    <td>{ETIQUETAS_TURNO[evento.turno] ?? evento.turno}</td>
                    <td style={{ color: "#64748b" }}>{evento.notas || "—"}</td>
                    <td style={{ textAlign: "right" }}>
                      <BotonIcono
                        variante="peligro"
                        icono={<Trash2 size={13} />}
                        titulo="Eliminar turno"
                        ariaLabel="Eliminar turno"
                        onClick={() => eliminarTurno(evento.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16 }}>Ausencias registradas</h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>Listado de licencias, permisos y ausencias con seguimiento de reemplazo. Una ausencia vigente marca al técnico como no disponible para asignaciones.</p>
          </div>
        </div>
        {cargando ? (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>Cargando...</div>
        ) : ausencias.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#64748b", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>Sin ausencias registradas.</div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Técnico</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Motivo</th>
                  <th>Reemplazo</th>
                </tr>
              </thead>
              <tbody>
                {ausencias.map((a) => (
                  <tr key={a.id_ausencia}>
                    <td style={{ fontWeight: 600 }}>{a.tecnico_nombre}</td>
                    <td>{String(a.fecha_desde).replace("T", " ").slice(0, 16)}</td>
                    <td>{String(a.fecha_hasta).replace("T", " ").slice(0, 16)}</td>
                    <td>{a.motivo}</td>
                    <td>{a.reemplazo_nombre ?? (a.id_usuario_reemplazo ? `ID: ${a.id_usuario_reemplazo}` : "—")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ModalRegistrarAusencia
        abierto={modalAbierto}
        tecnicos={tecnicos}
        onCerrar={() => setModalAbierto(false)}
        onGuardar={registrarAusencia}
      />
    </div>
  );
}
