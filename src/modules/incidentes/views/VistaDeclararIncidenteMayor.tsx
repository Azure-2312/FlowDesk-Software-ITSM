"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InvolucradoItem {
  id_usuario: number;
  nombre: string;
  correo: string;
  cargo: string;
  departamento: string;
  tipo: "tecnico" | "gestor_area" | "gestor_modulo" | "otro";
}

interface InvolucradoSeleccionado {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol_crisis: string;
  tipo: "tecnico" | "gestor_area" | "gestor_modulo" | "otro";
}

interface InvolucradosDisponibles {
  tecnicos: InvolucradoItem[];
  gestoresArea: InvolucradoItem[];
  gestoresModulo: InvolucradoItem[];
  otros: InvolucradoItem[];
}

export default function VistaDeclararIncidenteMayor() {
  const router = useRouter();

  // Campos principales
  const [titulo, setTitulo] = useState("");
  const [severidad, setSeveridad] = useState("P1");
  const [salaVirtual, setSalaVirtual] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Involucrados seleccionados
  const [involucrados, setInvolucrados] = useState<InvolucradoSeleccionado[]>([]);

  // Directorio disponible
  const [disponibles, setDisponibles] = useState<InvolucradosDisponibles>({
    tecnicos: [],
    gestoresArea: [],
    gestoresModulo: [],
    otros: [],
  });
  const [cargandoDisponibles, setCargandoDisponibles] = useState(true);

  // Selector activo
  const [tabTipo, setTabTipo] = useState<"tecnico" | "gestor_area" | "gestor_modulo" | "otro">("tecnico");
  const [busquedaPersona, setBusquedaPersona] = useState("");
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState<number | "">("");
  const [rolPersonalizado, setRolPersonalizado] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarDirectorio() {
      setCargandoDisponibles(true);
      try {
        const res = await fetch("/api/tickets/incidentes-mayores?recurso=involucrados");
        if (res.ok) {
          const json = await res.json();
          setDisponibles(json);
        }
      } catch (e) {
        console.error("Error al cargar directorio de involucrados:", e);
      } finally {
        setCargandoDisponibles(false);
      }
    }
    cargarDirectorio();
  }, []);

  // Lista según la pestaña seleccionada
  const listaActual = (
    tabTipo === "tecnico"
      ? disponibles.tecnicos
      : tabTipo === "gestor_area"
      ? disponibles.gestoresArea
      : tabTipo === "gestor_modulo"
      ? disponibles.gestoresModulo
      : disponibles.otros
  ).filter((item) => {
    if (!busquedaPersona.trim()) return true;
    const q = busquedaPersona.toLowerCase();
    return item.nombre.toLowerCase().includes(q) || item.correo.toLowerCase().includes(q);
  });

  function agregarInvolucrado() {
    if (!usuarioSeleccionadoId) return;
    const id = Number(usuarioSeleccionadoId);
    if (involucrados.some((inv) => inv.id_usuario === id)) {
      alert("Este colaborador ya está en la lista de involucrados.");
      return;
    }

    const todos = [
      ...disponibles.tecnicos,
      ...disponibles.gestoresArea,
      ...disponibles.gestoresModulo,
      ...disponibles.otros,
    ];
    const u = todos.find((x) => x.id_usuario === id);
    if (!u) return;

    const rolPorDefecto =
      tabTipo === "tecnico"
        ? "Especialista Técnico / Resolutor"
        : tabTipo === "gestor_area"
        ? "Gestor de Área Afectada"
        : tabTipo === "gestor_modulo"
        ? "Gestor de Módulo TI"
        : "Involucrado Institucional";

    setInvolucrados((prev) => [
      ...prev,
      {
        id_usuario: u.id_usuario,
        nombre: u.nombre,
        correo: u.correo,
        tipo: u.tipo,
        rol_crisis: rolPersonalizado.trim() || rolPorDefecto,
      },
    ]);

    setUsuarioSeleccionadoId("");
    setRolPersonalizado("");
  }

  function quitarInvolucrado(idUsuario: number) {
    setInvolucrados((prev) => prev.filter((i) => i.id_usuario !== idUsuario));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || titulo.trim().length < 5) {
      setError("El título del incidente mayor debe tener al menos 5 caracteres.");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const res = await fetch("/api/tickets/incidentes-mayores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || null,
          severidad,
          sala_virtual: salaVirtual.trim() || null,
          involucrados,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo declarar el incidente mayor.");
        setGuardando(false);
      } else {
        router.push("/plataforma/incidentes/mayores?vista=listado");
      }
    } catch {
      setError("Error de conexión al enviar el formulario.");
      setGuardando(false);
    }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <span
            style={{
              display: "inline-block",
              marginBottom: 6,
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Sala de Crisis · ITIL v4 Incident Management
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Declarar Incidente Mayor
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            Formulario independiente de activación y convocatoria de crisis con equipo multidisciplinario.
          </p>
        </div>

        <Link
          href="/plataforma/incidentes/mayores?vista=listado"
          className="boton-secundario"
          style={{ textDecoration: "none", fontSize: 13, padding: "8px 16px" }}
        >
          ← Volver a la Bandeja
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {error && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              color: "#b91c1c",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Sección 1: Datos del Incidente */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>
            1. Información de la Crisis
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Título del Incidente Mayor *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Indisponibilidad total del Core Transaccional y Pasarela de Pagos"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  fontSize: 13,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Severidad de Crisis *
              </label>
              <select
                value={severidad}
                onChange={(e) => setSeveridad(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  fontSize: 13,
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="P1">P1 - Crítica (Interrupción total del servicio de negocio)</option>
                <option value="P2">P2 - Alta (Degradación severa con riesgo inminente)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              Sala Virtual de Crisis (Enlace de Coordinación Google Meet / Teams / Zoom)
            </label>
            <input
              type="url"
              value={salaVirtual}
              onChange={(e) => setSalaVirtual(e.target.value)}
              placeholder="https://meet.google.com/xyz-abcd-efg"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                fontSize: 13,
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              Descripción y Alcance del Impacto
            </label>
            <textarea
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalle el alcance de la falla, sistemas afectados, indicios iniciales y acciones inmediatas tomadas..."
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                fontSize: 13,
              }}
            />
          </div>
        </div>

        {/* Sección 2: Convocatoria de Involucrados */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                2. Equipo de Crisis e Involucrados Convocados
              </h2>
              <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
                Agregue técnicos resolutores, gestores de área, gestores de módulos y cualquier otro actor necesario.
              </p>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: "#f1f5f9",
                padding: "4px 10px",
                borderRadius: 12,
                color: "#334155",
              }}
            >
              {involucrados.length} involucrados asignados
            </span>
          </div>

          {/* Selector de Involucrados */}
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 20 }}>
            {/* Pestañas de Roles */}
            <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #cbd5e1", paddingBottom: 10, marginBottom: 14 }}>
              {[
                { id: "tecnico", label: "Técnicos Resolutores" },
                { id: "gestor_area", label: "Gestores de Área" },
                { id: "gestor_modulo", label: "Gestores de Módulos TI" },
                { id: "otro", label: "Otros Involucrados" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTabTipo(t.id as any);
                    setUsuarioSeleccionadoId("");
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: tabTipo === t.id ? "#2563eb" : "#e2e8f0",
                    color: tabTipo === t.id ? "#ffffff" : "#475569",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Selector y buscador */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 4 }}>
                  Filtrar por nombre o correo
                </label>
                <input
                  type="text"
                  placeholder="Buscar persona..."
                  value={busquedaPersona}
                  onChange={(e) => setBusquedaPersona(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 4 }}>
                  Seleccionar Colaborador *
                </label>
                <select
                  value={usuarioSeleccionadoId}
                  onChange={(e) => setUsuarioSeleccionadoId(e.target.value ? Number(e.target.value) : "")}
                  disabled={cargandoDisponibles}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, backgroundColor: "#ffffff" }}
                >
                  <option value="">-- Elija un colaborador ({listaActual.length} disponibles) --</option>
                  {listaActual.map((item) => (
                    <option key={item.id_usuario} value={item.id_usuario}>
                      {item.nombre} ({item.correo}) - {item.cargo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 4 }}>
                  Rol en la Crisis (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Especialista DBA / Enlace con Negocio"
                  value={rolPersonalizado}
                  onChange={(e) => setRolPersonalizado(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12 }}
                />
              </div>

              <button
                type="button"
                onClick={agregarInvolucrado}
                disabled={!usuarioSeleccionadoId}
                style={{
                  padding: "8px 16px",
                  backgroundColor: usuarioSeleccionadoId ? "#059669" : "#94a3b8",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: usuarioSeleccionadoId ? "pointer" : "not-allowed",
                  height: 35,
                }}
              >
                + Agregar
              </button>
            </div>
          </div>

          {/* Tabla de Involucrados Asignados */}
          {involucrados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 16px", color: "#64748b", fontSize: 13, border: "1px dashed #cbd5e1", borderRadius: 6 }}>
              Aún no ha agregado involucrados a este incidente mayor. Utilice el selector de arriba para convocar al equipo de respuesta.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "8px 12px" }}>Tipo</th>
                  <th style={{ padding: "8px 12px" }}>Colaborador</th>
                  <th style={{ padding: "8px 12px" }}>Correo Institucional</th>
                  <th style={{ padding: "8px 12px" }}>Rol Designado en Crisis</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {involucrados.map((inv) => (
                  <tr key={inv.id_usuario} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 12px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 10.5,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          textTransform: "uppercase",
                          backgroundColor:
                            inv.tipo === "tecnico"
                              ? "#eff6ff"
                              : inv.tipo === "gestor_area"
                              ? "#fef3c7"
                              : inv.tipo === "gestor_modulo"
                              ? "#ede9fe"
                              : "#f1f5f9",
                          color:
                            inv.tipo === "tecnico"
                              ? "#1d4ed8"
                              : inv.tipo === "gestor_area"
                              ? "#b45309"
                              : inv.tipo === "gestor_modulo"
                              ? "#6d28d9"
                              : "#334155",
                        }}
                      >
                        {inv.tipo.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px", fontWeight: 600, color: "#0f172a" }}>{inv.nombre}</td>
                    <td style={{ padding: "8px 12px", color: "#64748b" }}>{inv.correo}</td>
                    <td style={{ padding: "8px 12px", color: "#334155", fontWeight: 500 }}>{inv.rol_crisis}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => quitarInvolucrado(inv.id_usuario)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#dc2626",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Botones de Acción */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Link
            href="/plataforma/incidentes/mayores?vista=listado"
            style={{
              padding: "10px 18px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              color: "#334155",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={guardando}
            style={{
              padding: "10px 24px",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: guardando ? "not-allowed" : "pointer",
            }}
          >
            {guardando ? "Declarando Incidente..." : "🚨 Declarar y Convocar Sala de Crisis"}
          </button>
        </div>
      </form>
    </div>
  );
}
