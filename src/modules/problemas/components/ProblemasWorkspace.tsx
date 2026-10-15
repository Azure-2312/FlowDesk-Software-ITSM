"use client";

import { FormEvent, useEffect, useState } from "react";

type Problema = {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  descripcion: string;
  estado_nombre: string;
  causa_raiz?: string | null;
  workaround?: string | null;
  es_error_conocido: boolean;
  incidentes_asociados?: { codigo_ticket: string; titulo: string }[];
};

export default function ProblemasWorkspace({ puedeCrear, soloKedb = false }: { puedeCrear: boolean; soloKedb?: boolean }) {
  const [items, setItems] = useState<Problema[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    const res = await fetch(`/api/problemas${soloKedb ? "?kedb=true" : ""}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) setError(data.error || "No se pudieron cargar los problemas");
    else setItems(Array.isArray(data) ? data : []);
    setCargando(false);
  }

  useEffect(() => { void cargar(); }, [soloKedb]);

  async function crear(e: FormEvent) {
    e.preventDefault(); setError(""); setGuardando(true);
    const res = await fetch("/api/problemas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titulo, descripcion }) });
    const data = await res.json();
    setGuardando(false);
    if (!res.ok) { setError(data.error || "No se pudo registrar el problema"); return; }
    setTitulo(""); setDescripcion(""); await cargar();
  }

  return <div className="vista-contenedor">
    <div className="cabecera-pagina"><div><h1>{soloKedb ? "Errores conocidos (KEDB)" : "Gestión de problemas"}</h1><p className="subtitulo">Investiga causas raíz, relaciona incidentes y publica workarounds para reducir recurrencias.</p></div></div>
    {error && <p role="alert" className="mensaje-error">{error}</p>}
    {puedeCrear && !soloKedb && <form onSubmit={crear} className="tarjeta-formulario" style={{ display: "grid", gap: 12, marginBottom: 20 }}>
      <h2 style={{ margin: 0 }}>Registrar problema</h2>
      <input className="input-base" required maxLength={180} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título del problema" />
      <textarea className="input-base" required rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Síntomas, alcance e incidentes recurrentes" />
      <button className="boton-principal" disabled={guardando}>{guardando ? "Guardando…" : "Crear problema"}</button>
    </form>}
    {cargando ? <p>Cargando…</p> : items.length === 0 ? <p>No hay problemas{soloKedb ? " conocidos" : " registrados"}.</p> : <div style={{ display: "grid", gap: 12 }}>
      {items.map(p => <article key={p.id_problema} className="tarjeta" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><strong>{p.codigo_problema} · {p.titulo}</strong><span>{p.estado_nombre}</span></div>
        <p>{p.descripcion}</p>
        {p.causa_raiz && <p><b>Causa raíz:</b> {p.causa_raiz}</p>}
        {p.workaround && <p><b>Workaround:</b> {p.workaround}</p>}
        <small>Incidentes asociados: {p.incidentes_asociados?.map(i => i.codigo_ticket).join(", ") || "Ninguno"}</small>
      </article>)}
    </div>}
  </div>;
}
