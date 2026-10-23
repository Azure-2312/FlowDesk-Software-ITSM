"use client";

import { useMemo, useState } from "react";

type Turno = "MANANA" | "TARDE" | "NOCHE" | "GUARDIA_24X7";

interface EventoTurno {
  id: number;
  id_usuario_tecnico: number;
  tecnico_nombre: string;
  fecha: string;
  turno: Turno;
  notas?: string;
}

interface Props {
  eventos: EventoTurno[];
  tecnicos: { id_usuario: number; nombre: string }[];
  onCrear?: (datos: { id_usuario_tecnico: number; fecha: string; turno: Turno; notas?: string }) => void;
}

const TURNOS: { clave: Turno; etiqueta: string; color: string }[] = [
  { clave: "MANANA", etiqueta: "Mañana", color: "#22c55e" },
  { clave: "TARDE", etiqueta: "Tarde", color: "#f59e0b" },
  { clave: "NOCHE", etiqueta: "Noche", color: "#6366f1" },
  { clave: "GUARDIA_24X7", etiqueta: "Guardia 24x7", color: "#ef4444" },
];

function obtenerDiasDelMes(fecha: Date) {
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth();
  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);
  const dias: Date[] = [];
  const offset = (primerDia.getDay() + 6) % 7; // Lunes como primer día
  for (let i = 0; i < offset; i++) {
    dias.push(new Date(anio, mes, -offset + i + 1));
  }
  for (let d = 1; d <= ultimoDia.getDate(); d++) {
    dias.push(new Date(anio, mes, d));
  }
  while (dias.length % 7 !== 0) {
    const ultimo = dias[dias.length - 1];
    dias.push(new Date(ultimo.getFullYear(), ultimo.getMonth(), ultimo.getDate() + 1));
  }
  return dias;
}

function formatearISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarioTurnosTecnicos({ eventos, tecnicos, onCrear }: Props) {
  const [fechaBase, setFechaBase] = useState(() => new Date());
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [idTecnico, setIdTecnico] = useState("");
  const [turno, setTurno] = useState<Turno>("MANANA");
  const [notas, setNotas] = useState("");

  const dias = useMemo(() => obtenerDiasDelMes(fechaBase), [fechaBase]);
  const mesActual = fechaBase.getMonth();
  const anioActual = fechaBase.getFullYear();
  const eventosPorDia = useMemo(() => {
    const mapa = new Map<string, EventoTurno[]>();
    eventos.forEach((e) => {
      const lista = mapa.get(e.fecha) ?? [];
      lista.push(e);
      mapa.set(e.fecha, lista);
    });
    return mapa;
  }, [eventos]);

  function cambiarMes(delta: number) {
    setFechaBase((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    setSeleccionado(null);
  }

  function guardar() {
    if (!onCrear || !seleccionado || !idTecnico) return;
    onCrear({
      id_usuario_tecnico: Number(idTecnico),
      fecha: seleccionado,
      turno,
      notas: notas.trim() || undefined,
    });
    setNotas("");
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
        <button type="button" onClick={() => cambiarMes(-1)} style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: 600 }}>← Anterior</button>
        <strong style={{ fontSize: 14 }}>{fechaBase.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}</strong>
        <button type="button" onClick={() => cambiarMes(1)} style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: 600 }}>Siguiente →</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #e2e8f0" }}>
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
          <div key={d} style={{ padding: "8px 10px", textAlign: "center", fontSize: 12, color: "#475569", fontWeight: 600 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {dias.map((dia, idx) => {
          const iso = formatearISO(dia);
          const fueraMes = dia.getMonth() !== mesActual;
          const esHoy = formatearISO(new Date()) === iso;
          const lista = eventosPorDia.get(iso) ?? [];
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSeleccionado(iso)}
              style={{
                minHeight: 90,
                padding: 8,
                textAlign: "left",
                border: "none",
                borderRight: "1px solid #f1f5f9",
                borderBottom: "1px solid #f1f5f9",
                background: seleccionado === iso ? "#eff6ff" : "#fff",
                cursor: "pointer",
                opacity: fueraMes ? 0.4 : 1,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: esHoy ? 700 : 500, color: esHoy ? "#2563eb" : "#334155" }}>{dia.getDate()}</span>
                {esHoy && <span style={{ fontSize: 10, color: "#2563eb" }}>Hoy</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {lista.slice(0, 2).map((ev) => {
                  const turnoInfo = TURNOS.find((t) => t.clave === ev.turno);
                  return (
                    <div key={ev.id} style={{ fontSize: 11, padding: "2px 6px", borderRadius: 999, background: `${turnoInfo?.color}15`, color: turnoInfo?.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ev.tecnico_nombre} · {turnoInfo?.etiqueta}
                    </div>
                  );
                })}
                {lista.length > 2 && <span style={{ fontSize: 10, color: "#64748b" }}>+{lista.length - 2} más</span>}
              </div>
            </button>
          );
        })}
      </div>
      {seleccionado && onCrear && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end", padding: 12, borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <div style={{ fontSize: 12, color: "#475569" }}>
            <strong>Asignar turno</strong> · {seleccionado}
          </div>
          <label style={{ fontSize: 12, color: "#475569" }}>
            Técnico
            <select value={idTecnico} onChange={(e) => setIdTecnico(e.target.value)} style={{ display: "block", marginTop: 4, padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
              <option value="">Selecciona...</option>
              {tecnicos.map((t) => <option key={t.id_usuario} value={t.id_usuario}>{t.nombre}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#475569" }}>
            Turno
            <select value={turno} onChange={(e) => setTurno(e.target.value as Turno)} style={{ display: "block", marginTop: 4, padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }}>
              {TURNOS.map((t) => <option key={t.clave} value={t.clave}>{t.etiqueta}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12, color: "#475569", flex: 1, minWidth: 200 }}>
            Notas
            <input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observaciones" style={{ display: "block", width: "100%", marginTop: 4, padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </label>
          <button type="button" onClick={guardar} disabled={!idTecnico} className="boton-primario" style={{ width: "auto", padding: "7px 14px" }}>Guardar turno</button>
        </div>
      )}
    </div>
  );
}
