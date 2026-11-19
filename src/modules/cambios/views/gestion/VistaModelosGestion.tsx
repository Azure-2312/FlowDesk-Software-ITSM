"use client";

import { useEffect, useState } from "react";

interface Modelo {
  id_modelo: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: string;
  version_modelo: string | null;
  riesgo_fijo: string | null;
  autorizacion_automatica: boolean | null;
  veces_usado: number | null;
  veces_exitoso: number | null;
  veces_fallido: number | null;
  umbral_tasa_fallo_pct: number | null;
  umbral_fallos_consecutivos: number | null;
  ultimo_uso: string | null;
  fecha_creacion: string;
}

const COLORES: Record<string, { bg: string; fg: string }> = {
  BORRADOR: { bg: "#fef3c7", fg: "#92400e" },
  EN_REVISION: { bg: "#e0f2fe", fg: "#0369a1" },
  APROBADO: { bg: "#dcfce7", fg: "#166534" },
  PUBLICADO: { bg: "#dcfce7", fg: "#166534" },
  SUSPENDIDO: { bg: "#fee2e2", fg: "#b91c1c" },
  RETIRADO: { bg: "#e5e7eb", fg: "#374151" },
  ARCHIVADO: { bg: "#e5e7eb", fg: "#374151" },
};

function tasa(m: Modelo) {
  const exitos = m.veces_exitoso ?? 0;
  const fallos = m.veces_fallido ?? 0;
  const total = exitos + fallos;
  return total > 0 ? Math.round((exitos / total) * 100) : null;
}

export default function VistaModelosGestion() {
  const [items, setItems] = useState<Modelo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    titulo: "",
    descripcion: "",
    justificacion: "",
    motivo: "Mantenimiento preventivo",
    entorno: "Producción",
    riesgo_fijo: "bajo",
    impacto: "Bajo",
    urgencia: "Baja",
    duracion_estimada: "30m",
    anticipacion_horas: 24,
    plan_implementacion: "",
    plan_rollback: "",
    plan_pruebas: "",
    criterios_exito: "",
    estado: "APROBADO",
  });

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cambios/gestion/modelos?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) setItems(Array.isArray(json) ? json : []);
      else setError(json.error ?? "No se pudieron cargar los modelos.");
    } catch {
      setError("Error de conexión al cargar los modelos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function proponer() {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/cambios/gestion/modelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo proponer el modelo.");
      else {
        setOk(json.mensaje ?? "Modelo de cambio estándar registrado.");
        setForm({
          codigo: "",
          nombre: "",
          titulo: "",
          descripcion: "",
          justificacion: "",
          motivo: "Mantenimiento preventivo",
          entorno: "Producción",
          riesgo_fijo: "bajo",
          impacto: "Bajo",
          urgencia: "Baja",
          duracion_estimada: "30m",
          anticipacion_horas: 24,
          plan_implementacion: "",
          plan_rollback: "",
          plan_pruebas: "",
          criterios_exito: "",
          estado: "APROBADO",
        });
        setMostrarForm(false);
        await cargar();
      }
    } catch {
      setError("Error de conexión al proponer el modelo.");
    } finally {
      setProcesando(false);
    }
  }

  async function cambiarEstado(idModelo: number, estado: string) {
    setProcesando(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/cambios/gestion/modelos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_modelo: idModelo, estado }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error ?? "No se pudo cambiar el estado.");
      else {
        setOk(json.mensaje ?? "Estado actualizado.");
        await cargar();
      }
    } catch {
      setError("Error de conexión al cambiar el estado.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Modelos de cambio estándar</h1>
        <p>Consulta, propone y suspende modelos preautorizados, con sus métricas de éxito y umbrales de control.</p>
      </div>

      {ok && <p role="status" style={{ color: "#15803d", fontWeight: 600, marginBottom: 12 }}>{ok}</p>}
      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div style={{ marginBottom: 14 }}>
        <button className="boton-primario" style={{ width: "auto" }} onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "Proponer nuevo modelo"}
        </button>
      </div>

      {mostrarForm && (
        <div className="tarjeta-formulario" style={{ marginBottom: 24, padding: 24, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>Crear Modelo de Cambio Estándar</h2>
              <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>Define la plantilla completa con los mismos parámetros y planes técnicos requeridos por un ticket de cambio normal.</p>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0369a1", backgroundColor: "#e0f2fe", padding: "4px 10px", borderRadius: 999 }}>
              Preaprobado ITIL v4
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Fila 1: Código, Nombre y Título sugerido */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Código Identificador *
                <input
                  type="text"
                  placeholder="ej. MOD_REINICIO_APP"
                  value={form.codigo}
                  onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value.toUpperCase() }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
                />
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Nombre del Modelo *
                <input
                  type="text"
                  placeholder="ej. Reinicio preventivo de microservicio"
                  value={form.nombre}
                  onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
                />
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Título Sugerido del Ticket
                <input
                  type="text"
                  placeholder="ej. RFC Estándar - Reinicio en horario valle"
                  value={form.titulo}
                  onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
                />
              </label>
            </div>

            {/* Fila 2: Descripción y Justificación */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Descripción del Procedimiento *
                <textarea
                  rows={2}
                  placeholder="Detalla qué realiza este cambio y cuándo aplica..."
                  value={form.descripcion}
                  onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
                />
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Justificación / Motivo del Cambio *
                <textarea
                  rows={2}
                  placeholder="Motivo técnico del procedimiento (ej. Mantenimiento rutinario para liberar memoria)..."
                  value={form.justificacion}
                  onChange={(e) => setForm((p) => ({ ...p, justificacion: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
                />
              </label>
            </div>

            {/* Fila 3: Parámetros técnicos: Entorno, Riesgo, Impacto, Urgencia, Duración y Anticipación */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, backgroundColor: "#f8fafc", padding: 12, borderRadius: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Entorno Objetivo
                <select
                  value={form.entorno}
                  onChange={(e) => setForm((p) => ({ ...p, entorno: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                >
                  <option value="Producción">Producción</option>
                  <option value="Preproducción">Preproducción</option>
                  <option value="Staging">Staging</option>
                  <option value="Pruebas">Pruebas / QA</option>
                  <option value="Desarrollo">Desarrollo</option>
                </select>
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Nivel de Riesgo Fijo
                <select
                  value={form.riesgo_fijo}
                  onChange={(e) => setForm((p) => ({ ...p, riesgo_fijo: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                >
                  <option value="bajo">Bajo (Estándar)</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                </select>
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Impacto Predeterminado
                <select
                  value={form.impacto}
                  onChange={(e) => setForm((p) => ({ ...p, impacto: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                >
                  <option value="Bajo">Bajo (Localizado)</option>
                  <option value="Medio">Medio (Un departamento)</option>
                  <option value="Alto">Alto (Múltiples servicios)</option>
                  <option value="Crítico">Crítico (Toda la organización)</option>
                </select>
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Urgencia Predeterminada
                <select
                  value={form.urgencia}
                  onChange={(e) => setForm((p) => ({ ...p, urgencia: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Duración Estimada
                <input
                  type="text"
                  placeholder="ej. 30m, 1h"
                  value={form.duracion_estimada}
                  onChange={(e) => setForm((p) => ({ ...p, duracion_estimada: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                />
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Anticipación (Horas)
                <input
                  type="number"
                  min={1}
                  value={form.anticipacion_horas}
                  onChange={(e) => setForm((p) => ({ ...p, anticipacion_horas: Number(e.target.value) }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                />
              </label>
            </div>

            {/* Fila 4: Planes de Implementación y Rollback (Requeridos para cambios) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Plan de Implementación (Paso a Paso) *
                <textarea
                  rows={4}
                  placeholder={"1. Ejecutar verificación previa de servicios.\n2. Aplicar cambio o reinicio seguro.\n3. Monitorear logs de inicialización."}
                  value={form.plan_implementacion}
                  onChange={(e) => setForm((p) => ({ ...p, plan_implementacion: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, fontFamily: "monospace" }}
                />
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Plan de Contingencia / Rollback *
                <textarea
                  rows={4}
                  placeholder={"1. En caso de timeout, detener proceso.\n2. Restaurar binarios o configuración anterior.\n3. Confirmar estabilización del nodo."}
                  value={form.plan_rollback}
                  onChange={(e) => setForm((p) => ({ ...p, plan_rollback: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, fontFamily: "monospace" }}
                />
              </label>
            </div>

            {/* Fila 5: Plan de Pruebas y Criterios de Éxito */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Plan de Pruebas / Verificación *
                <textarea
                  rows={3}
                  placeholder="Verificar endpoint /healthz, ping a base de datos y respuesta en menos de 200ms."
                  value={form.plan_pruebas}
                  onChange={(e) => setForm((p) => ({ ...p, plan_pruebas: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
                />
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Criterios de Éxito
                <textarea
                  rows={3}
                  placeholder="El microservicio responde código HTTP 200 y cero errores 5xx en los logs durante 15 minutos."
                  value={form.criterios_exito}
                  onChange={(e) => setForm((p) => ({ ...p, criterios_exito: e.target.value }))}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
                />
              </label>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
            <button
              type="button"
              className="boton-secundario"
              style={{ width: "auto" }}
              disabled={procesando}
              onClick={() => setMostrarForm(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto" }}
              disabled={procesando || !form.codigo.trim() || !form.nombre.trim()}
              onClick={proponer}
            >
              {procesando ? "Guardando..." : "Guardar Modelo Estándar"}
            </button>
          </div>
        </div>
      )}

      {cargando ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay modelos de cambio estándar registrados.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Código</th><th>Nombre</th><th>Estado</th><th>Versión</th><th>Uso</th><th>Tasa de éxito</th><th>Umbrales</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => {
                const color = COLORES[m.estado] ?? { bg: "#e5e7eb", fg: "#374151" };
                const t = tasa(m);
                return (
                  <tr key={m.id_modelo}>
                    <td><strong>{m.codigo}</strong></td>
                    <td>{m.nombre}{m.descripcion && <div style={{ fontSize: 11.5, color: "#6b7280" }}>{m.descripcion}</div>}</td>
                    <td><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, backgroundColor: color.bg, color: color.fg }}>{m.estado}</span></td>
                    <td>{m.version_modelo ?? "—"}</td>
                    <td>{m.veces_usado ?? 0}</td>
                    <td>{t === null ? "—" : `${t}%`}</td>
                    <td style={{ fontSize: 11.5, color: "#6b7280" }}>
                      fallo {m.umbral_tasa_fallo_pct ?? "—"}% · consec. {m.umbral_fallos_consecutivos ?? "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {m.estado !== "APROBADO" && m.estado !== "PUBLICADO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px", backgroundColor: "#f0fdf4", color: "#15803d", borderColor: "#bbf7d0" }} disabled={procesando} onClick={() => cambiarEstado(m.id_modelo, "APROBADO")}>Aprobar</button>}
                        {m.estado !== "SUSPENDIDO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(m.id_modelo, "SUSPENDIDO")}>Suspender</button>}
                        {m.estado !== "RETIRADO" && m.estado !== "ARCHIVADO" && <button className="boton-secundario" style={{ width: "auto", fontSize: 11.5, padding: "5px 9px" }} disabled={procesando} onClick={() => cambiarEstado(m.id_modelo, "RETIRADO")}>Retirar</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
