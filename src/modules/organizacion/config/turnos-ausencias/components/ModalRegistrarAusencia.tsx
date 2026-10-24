"use client";

import { FormEvent, useState } from "react";

interface Props {
  abierto: boolean;
  tecnicos: { id_usuario: number; nombre: string }[];
  tecnicoPreseleccionado?: number;
  onCerrar: () => void;
  onGuardar: (datos: { id_usuario_tecnico: number; id_usuario_reemplazo?: number; fecha_desde: string; fecha_hasta: string; motivo: string }) => Promise<void> | void;
}

export default function ModalRegistrarAusencia({ abierto, tecnicos, tecnicoPreseleccionado, onCerrar, onGuardar }: Props) {
  const [tecnico, setTecnico] = useState(tecnicoPreseleccionado?.toString() ?? "");
  const [reemplazo, setReemplazo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!abierto) return null;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!tecnico || !desde || !hasta || !motivo.trim()) {
      setError("Completa técnico, fechas y motivo.");
      return;
    }
    if (reemplazo && reemplazo === tecnico) {
      setError("El técnico de reemplazo debe ser distinto al ausente.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({
        id_usuario_tecnico: Number(tecnico),
        id_usuario_reemplazo: reemplazo ? Number(reemplazo) : undefined,
        fecha_desde: desde,
        fecha_hasta: hasta,
        motivo: motivo.trim(),
      });
      setTecnico(tecnicoPreseleccionado?.toString() ?? "");
      setReemplazo("");
      setDesde("");
      setHasta("");
      setMotivo("");
      onCerrar();
    } catch (err: any) {
      setError(err?.message ?? "No se pudo registrar la ausencia.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ width: "min(640px, 100%)", background: "#fff", borderRadius: 12, boxShadow: "0 40px 60px -40px rgba(15,23,42,0.9)", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Registrar ausencia con reemplazo</h2>
            <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>La designación de técnico de reemplazo es obligatoria cuando aplica cobertura.</p>
          </div>
          <button type="button" onClick={onCerrar} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }}>×</button>
        </div>
        <form onSubmit={enviar} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: 20 }}>
          <label style={{ gridColumn: "1 / -1", fontSize: 13, color: "#475569" }}>
            Técnico ausente *
            <select value={tecnico} onChange={(e) => setTecnico(e.target.value)} required style={{ display: "block", width: "100%", marginTop: 6, padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }}>
              <option value="">Selecciona...</option>
              {tecnicos.map((t) => <option key={t.id_usuario} value={t.id_usuario}>{t.nombre}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 13, color: "#475569" }}>
            Fecha desde *
            <input type="datetime-local" value={desde} onChange={(e) => setDesde(e.target.value)} required style={{ display: "block", width: "100%", marginTop: 6, padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }} />
          </label>
          <label style={{ fontSize: 13, color: "#475569" }}>
            Fecha hasta *
            <input type="datetime-local" value={hasta} onChange={(e) => setHasta(e.target.value)} required style={{ display: "block", width: "100%", marginTop: 6, padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }} />
          </label>
          <label style={{ gridColumn: "1 / -1", fontSize: 13, color: "#475569" }}>
            Técnico de reemplazo (obligatorio para cobertura)
            <select value={reemplazo} onChange={(e) => setReemplazo(e.target.value)} style={{ display: "block", width: "100%", marginTop: 6, padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }}>
              <option value="">Sin reemplazo asignado</option>
              {tecnicos.filter((t) => t.id_usuario.toString() !== tecnico).map((t) => <option key={t.id_usuario} value={t.id_usuario}>{t.nombre}</option>)}
            </select>
          </label>
          <label style={{ gridColumn: "1 / -1", fontSize: 13, color: "#475569" }}>
            Motivo *
            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} required rows={3} placeholder="Vacaciones, permiso médico, capacitación, guardia..." style={{ display: "block", width: "100%", marginTop: 6, padding: "9px 12px", borderRadius: 10, border: "1px solid #cbd5e1", resize: "vertical" }} />
          </label>
          {error && <div style={{ gridColumn: "1 / -1", color: "#dc2626", fontSize: 13 }}>{error}</div>}
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" onClick={onCerrar} className="boton-secundario" style={{ width: "auto" }}>Cancelar</button>
            <button type="submit" disabled={guardando} className="boton-primario" style={{ width: "auto" }}>{guardando ? "Registrando..." : "Registrar ausencia"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
