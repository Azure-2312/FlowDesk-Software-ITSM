// ============================================================================
// GESTIÓN DE PROBLEMAS Y ERRORES CONOCIDOS (KEDB): Workspace de Investigación
// ============================================================================
// Permite registrar problemas mayores, documentar causas raíz (RCA), registrar
// soluciones temporales (workarounds) y publicar en la base KEDB (ITIL v4).
// ============================================================================

"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

// ----------------------------------------------------------------------------
// 1. MODELO DE DATOS: Estructura de Problema, estado, causa raíz y KEDB
// ----------------------------------------------------------------------------
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
  // --------------------------------------------------------------------------
  // 2. ESTADOS LOCALES: Lista de problemas, formulario de alta y banderas
  // --------------------------------------------------------------------------
  const [items, setItems] = useState<Problema[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // --------------------------------------------------------------------------
  // 3. CONSULTA A LA API: Carga el listado completo o exclusivo para la KEDB
  // --------------------------------------------------------------------------
  async function cargar() {
    setCargando(true);
    const res = await fetch(`/api/problemas${soloKedb ? "?kedb=true" : ""}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) setError(data.error || "No se pudieron cargar los problemas");
    else setItems(Array.isArray(data) ? data : []);
    setCargando(false);
  }

  useEffect(() => { void cargar(); }, [soloKedb]);

  // --------------------------------------------------------------------------
  // 4. REGISTRO FORMAL: Envía un nuevo problema a la API con título y detalle
  // --------------------------------------------------------------------------
  async function crear(e: FormEvent) {
    e.preventDefault(); setError(""); setGuardando(true);
    const res = await fetch("/api/problemas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titulo, descripcion }) });
    const data = await res.json();
    setGuardando(false);
    if (!res.ok) { setError(data.error || "No se pudo registrar el problema"); return; }
    setTitulo(""); setDescripcion(""); await cargar();
  }

  // --------------------------------------------------------------------------
  // 5. RENDERIZADO VISUAL: Encabezado, formulario de creación y tabla KEDB
  // --------------------------------------------------------------------------
  return <div className="vista-contenedor">
    <div className="cabecera-pagina"><div><h1>{soloKedb ? "Errores conocidos (KEDB)" : "Gestión de problemas"}</h1><p className="subtitulo">Investiga causas raíz, relaciona incidentes y publica workarounds para reducir recurrencias.</p></div></div>
    {error && <p role="alert" className="mensaje-error">{error}</p>}
    {puedeCrear && !soloKedb && <form onSubmit={crear} className="tarjeta-formulario" style={{ display: "grid", gap: 12, marginBottom: 20 }}>
      <h2 style={{ margin: 0 }}>Registrar problema</h2>
      <input className="input-base" required maxLength={180} value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título del problema" />
      <textarea className="input-base" required rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción del comportamiento anómalo o falla" />
      <button className="boton-primario" disabled={guardando}>{guardando ? "Registrando..." : "Guardar problema"}</button>
    </form>}
    {cargando ? <p className="mensaje-cargando">Cargando problemas...</p> : items.length === 0 ? <p className="mensaje-vacio">No hay registros para mostrar.</p> : <div className="contenedor-tabla"><table className="tabla-registros"><thead><tr><th>Código</th><th>Título</th><th>Estado</th><th>Causa raíz</th><th>Solución temporal</th><th>Incidentes</th></tr></thead><tbody>{items.map(p => <tr key={p.id_problema}><td><Link href={`/plataforma/problemas/${p.id_problema}`} className="enlace-tabla">{p.codigo_problema}</Link></td><td>{p.titulo}</td><td><span className="badge-estado">{p.estado_nombre}</span></td><td>{p.causa_raiz || "Pendiente de análisis"}</td><td>{p.workaround || "Sin solución provisional"}</td><td>{p.incidentes_asociados?.length || 0}</td></tr>)}</tbody></table></div>}
  </div>;
}
