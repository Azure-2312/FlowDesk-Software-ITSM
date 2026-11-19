"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ModeloEstandar {
  id_modelo: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  estado: string;
  version_modelo: string | number | null;
  riesgo_fijo: string | null;
  autorizacion_automatica: boolean | null;
  veces_usado: number | null;
  veces_exitoso: number | null;
  veces_fallido: number | null;
  contenido_prellenado?: {
    titulo?: string;
    motivo?: string;
    justificacion?: string;
    entorno?: string;
    impacto?: string;
    urgencia?: string;
    plan_implementacion?: string;
    plan_rollback?: string;
    plan_pruebas?: string;
    criterios_exito?: string;
    duracion_estimada?: string;
  };
}

export default function VistaModelosCambioUnificada() {
  const router = useRouter();
  const [pestanaActiva, setPestanaActiva] = useState<"plantillas" | "crear">("plantillas");
  const [items, setItems] = useState<ModeloEstandar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Estado del formulario para crear nuevo modelo estándar
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

  async function cargarModelos() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cambios/gestion/modelos?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setItems(Array.isArray(json) ? json : []);
      } else {
        setError(json.error ?? "No se pudieron cargar los modelos.");
      }
    } catch {
      setError("Error de conexión al cargar los modelos estándar.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarModelos();
  }, []);

  async function registrarModelo(e: React.FormEvent) {
    e.preventDefault();
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
      if (!res.ok) {
        setError(json.error ?? "No se pudo registrar el modelo estándar.");
      } else {
        setOk(json.mensaje ?? "Modelo de cambio estándar registrado exitosamente.");
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
        await cargarModelos();
        setPestanaActiva("plantillas");
      }
    } catch {
      setError("Error de conexión al guardar el modelo estándar.");
    } finally {
      setProcesando(false);
    }
  }

  const itemsFiltrados = items.filter((m) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      m.codigo.toLowerCase().includes(q) ||
      m.nombre.toLowerCase().includes(q) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", boxSizing: "border-box" }}>
      {/* 1. Encabezado */}
      <div style={{ marginBottom: 20 }}>
        <span
          style={{
            display: "inline-block",
            marginBottom: 6,
            backgroundColor: "#dcfce7",
            color: "#166534",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          Gestión de Cambios · Modelos Preautorizados (ITIL v4)
        </span>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Modelos de Cambio Estándar
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
          Catálogo oficial de procedimientos operativos estándar. Selecciona una plantilla para iniciar un cambio preaprobado o crea un nuevo modelo técnico.
        </p>
      </div>

      {ok && (
        <div style={{ padding: "12px 16px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          {ok}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* 2. Selector de Pestañas Internas (Plantillas vs Crear Modelo) */}
      <div style={{ display: "flex", gap: 8, borderBottom: "2px solid #e2e8f0", marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setPestanaActiva("plantillas")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: pestanaActiva === "plantillas" ? "3px solid #2563eb" : "3px solid transparent",
            backgroundColor: "transparent",
            color: pestanaActiva === "plantillas" ? "#2563eb" : "#64748b",
            fontWeight: pestanaActiva === "plantillas" ? 700 : 500,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: -2,
          }}
        >
          <span>📋 Plantillas de Cambio</span>
          <span style={{ fontSize: 11, backgroundColor: pestanaActiva === "plantillas" ? "#dbeafe" : "#f1f5f9", color: pestanaActiva === "plantillas" ? "#1e40af" : "#64748b", padding: "2px 8px", borderRadius: 999 }}>
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("crear")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: pestanaActiva === "crear" ? "3px solid #2563eb" : "3px solid transparent",
            backgroundColor: "transparent",
            color: pestanaActiva === "crear" ? "#2563eb" : "#64748b",
            fontWeight: pestanaActiva === "crear" ? 700 : 500,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: -2,
          }}
        >
          <span>➕ Crear Modelo</span>
        </button>
      </div>

      {/* 3. Contenido: Pestaña Plantillas */}
      {pestanaActiva === "plantillas" && (
        <div>
          {/* Barra de búsqueda */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Buscar modelo estándar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: 380,
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 13,
                backgroundColor: "#ffffff",
              }}
            />
            <div style={{ fontSize: 12.5, color: "#64748b" }}>
              Mostrando {itemsFiltrados.length} de {items.length} modelos autorizados
            </div>
          </div>

          {cargando ? (
            <div style={{ padding: 48, textAlign: "center", color: "#64748b", fontSize: 14 }}>
              Cargando modelos de cambio estándar...
            </div>
          ) : itemsFiltrados.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", backgroundColor: "#ffffff", borderRadius: 10, border: "1px dashed #cbd5e1", color: "#64748b", fontSize: 14 }}>
              No se encontraron modelos de cambio estándar.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
              {itemsFiltrados.map((m) => {
                const pre = m.contenido_prellenado;
                return (
                  <div
                    key={m.id_modelo}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      padding: 20,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 14,
                      transition: "box-shadow 0.15s ease",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 800, color: "#2563eb", backgroundColor: "#eff6ff", padding: "2px 8px", borderRadius: 4, border: "1px solid #bfdbfe" }}>
                          {m.codigo}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: 999 }}>
                          {m.estado}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" }}>
                        {m.nombre}
                      </h3>

                      <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 12px 0", lineHeight: 1.45 }}>
                        {m.descripcion || "Procedimiento operativo estándar preautorizado por el Comité de Cambios."}
                      </p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11.5, color: "#475569", backgroundColor: "#f8fafc", padding: 10, borderRadius: 6, marginBottom: 8 }}>
                        <div><strong>Riesgo Fijo:</strong> {m.riesgo_fijo ? m.riesgo_fijo.toUpperCase() : "BAJO"}</div>
                        <div><strong>Entorno:</strong> {pre?.entorno || "Producción"}</div>
                        <div><strong>Duración:</strong> {pre?.duracion_estimada || "30m"}</div>
                        <div><strong>Usos / Éxitos:</strong> {m.veces_usado ?? 0} ({m.veces_exitoso ?? 0} OK)</div>
                      </div>

                      {pre?.plan_implementacion && (
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>
                          <strong>Plan predefinido:</strong>
                          <div style={{ marginTop: 2, fontStyle: "italic", maxHeight: 40, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {pre.plan_implementacion.substring(0, 100)}...
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12, display: "flex", justifyContent: "flex-end" }}>
                      <Link
                        href={`/plataforma/cambios/nuevo?tipo=ESTANDAR&modelo=${m.id_modelo}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 16px",
                          backgroundColor: "#16a34a",
                          color: "#ffffff",
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 700,
                          textDecoration: "none",
                          boxShadow: "0 1px 2px rgba(22, 163, 74, 0.2)",
                        }}
                      >
                        <span>⚡ Crear cambio con este modelo</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. Contenido: Pestaña Crear Nuevo Modelo */}
      {pestanaActiva === "crear" && (
        <form onSubmit={registrarModelo} style={{ backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ marginBottom: 18, borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>Registrar Nuevo Modelo de Cambio Estándar</h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>
              Define la plantilla técnica con todos los datos y planes de contingencia para que pueda ser ejecutado sin requerir aprobación del CAB en cada ocasión.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Fila 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Código Identificador *
                <input
                  type="text"
                  placeholder="ej. MOD_REINICIO_APP"
                  value={form.codigo}
                  onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value.toUpperCase() }))}
                  required
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
                  required
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

            {/* Fila 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Descripción del Procedimiento *
                <textarea
                  rows={2}
                  placeholder="Detalla qué realiza este cambio y cuándo aplica..."
                  value={form.descripcion}
                  onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                  required
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
                  required
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13 }}
                />
              </label>
            </div>

            {/* Fila 3: Parámetros técnicos */}
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
                Impacto
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
                Urgencia
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

            {/* Fila 4: Planes de ejecución */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Plan de Implementación (Paso a Paso) *
                <textarea
                  rows={4}
                  placeholder={"1. Ejecutar verificación previa de servicios.\n2. Aplicar cambio o reinicio seguro.\n3. Monitorear logs de inicialización."}
                  value={form.plan_implementacion}
                  onChange={(e) => setForm((p) => ({ ...p, plan_implementacion: e.target.value }))}
                  required
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
                  required
                  style={{ display: "block", width: "100%", marginTop: 4, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, fontFamily: "monospace" }}
                />
              </label>
            </div>

            {/* Fila 5: Pruebas y Criterios */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                Plan de Pruebas / Verificación *
                <textarea
                  rows={3}
                  placeholder="Verificar endpoint /healthz, ping a base de datos y respuesta en menos de 200ms."
                  value={form.plan_pruebas}
                  onChange={(e) => setForm((p) => ({ ...p, plan_pruebas: e.target.value }))}
                  required
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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
            <button
              type="button"
              className="boton-secundario"
              style={{ width: "auto" }}
              disabled={procesando}
              onClick={() => setPestanaActiva("plantillas")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="boton-primario"
              style={{ width: "auto" }}
              disabled={procesando || !form.codigo.trim() || !form.nombre.trim()}
            >
              {procesando ? "Guardando modelo..." : "Guardar y Publicar Modelo Estándar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
