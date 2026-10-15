"use client";

import { useEffect, useState } from "react";

interface Problema {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  prioridad_nombre: string | null;
  fecha_creacion: string;
  asignado_nombre: string | null;
}

interface Tecnico {
  id_usuario: number;
  nombre: string;
}

function normalizarTecnicos(json: any): Tecnico[] {
  const lista = Array.isArray(json) ? json : json?.tecnicos ?? json?.data ?? [];
  return (lista as any[]).map((t) => ({
    id_usuario: t.id_usuario ?? t.id ?? 0,
    nombre: t.nombre ?? t.nombre_completo ?? [t.nombres, t.apellido_paterno].filter(Boolean).join(" ") ?? `Usuario ${t.id_usuario}`,
  }));
}

export default function VistaAsignacionProblemas() {
  const [problemas, setProblemas] = useState<Problema[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [seleccion, setSeleccion] = useState<Record<number, string>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const [resP, resT] = await Promise.all([
        fetch(`/api/supervisor/problemas/asignar?_t=${Date.now()}`).then((r) => r.json()),
        fetch(`/api/tecnicos?_t=${Date.now()}`).then((r) => r.json()),
      ]);
      setProblemas(Array.isArray(resP) ? resP : []);
      setTecnicos(normalizarTecnicos(resT));
    } catch {
      setError("Error de conexión al cargar los problemas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function asignar(idProblema: number) {
    const idUsuarioAsignado = Number(seleccion[idProblema] || 0);
    if (!idUsuarioAsignado) {
      setError("Selecciona un responsable antes de asignar.");
      return;
    }
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/supervisor/problemas/asignar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_problema: idProblema, id_usuario_asignado: idUsuarioAsignado }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo asignar el problema.");
      else {
        setOk("Problema asignado.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al asignar.");
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Asignación de problemas</h1>
        <p>Reparte los problemas de mi área mientras no exista un Gestor de Problemas dedicado.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : problemas.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay problemas registrados en mi área.
        </div>
      ) : (
        <div className="tarjeta-formulario">
          <table className="tabla-datos">
            <thead>
              <tr><th>Código</th><th>Título</th><th>Prioridad</th><th>Responsable actual</th><th>Asignar a</th></tr>
            </thead>
            <tbody>
              {problemas.map((p) => (
                <tr key={p.id_problema}>
                  <td><strong>{p.codigo_problema}</strong></td>
                  <td>{p.titulo}</td>
                  <td>{p.prioridad_nombre ?? "—"}</td>
                  <td>{p.asignado_nombre ?? "Sin asignar"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <select
                        value={seleccion[p.id_problema] ?? ""}
                        onChange={(e) => setSeleccion((s) => ({ ...s, [p.id_problema]: e.target.value }))}
                        style={{ padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
                      >
                        <option value="">Selecciona...</option>
                        {tecnicos.map((t) => <option key={t.id_usuario} value={t.id_usuario}>{t.nombre}</option>)}
                      </select>
                      <button className="boton-primario" style={{ width: "auto" }} onClick={() => asignar(p.id_problema)}>Asignar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
