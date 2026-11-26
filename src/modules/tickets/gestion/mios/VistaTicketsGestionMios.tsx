"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Pestanas from "@/shared/components/ui/Pestanas";
import { Ticket } from "@/types";

export default function PaginaMisTickets({
  tipoFijo,
  rutaDetalleBase,
  rutaCrear,
  titulo,
}: {
  tipoFijo?: "1" | "2";
  rutaDetalleBase?: string;
  rutaCrear?: string;
  titulo?: string;
} = {}) {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pestañas requeridas: "en_proceso" | "finalizados" | "todos"
  const [pestana, setPestana] = useState<"en_proceso" | "finalizados" | "todos">("en_proceso");
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>(tipoFijo ?? "todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [categorias, setCategorias] = useState<{ id_categoria: number; nombre: string; id_tipo_ticket: number | null }[]>([]);

  async function cargarMisTickets() {
    setCargando(true);
    setError(null);
    try {
      const endpoint = tipoFijo === "1" ? "/api/incidentes" : tipoFijo === "2" ? "/api/solicitudes" : "/api/tickets";
      const [resTickets, resCat] = await Promise.all([
        fetch(`${endpoint}?vista=mios&_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }).then((r) => r.json()),
        fetch("/api/tickets/catalogos").then((r) => r.json()).catch(() => ({})),
      ]);

      if (resTickets.error) {
        setError(resTickets.error || "No se pudieron obtener tus tickets");
        return;
      }
      setTickets(resTickets.tickets || []);
      if (resCat?.categorias) {
        setCategorias(resCat.categorias);
      }
    } catch {
      setError("Error de conexión al cargar tus tickets");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarMisTickets();
  }, []);

  // Métricas
  const totalTickets = tickets.length;
  const ticketsEnProceso = tickets.filter((t) => [1, 2, 3, 4].includes(t.id_estado));
  const ticketsFinalizados = tickets.filter((t) => [5, 6, 7].includes(t.id_estado));

  // Categorías disponibles según tipo
  const categoriasDisponibles = useMemo(() => {
    if (categorias.length > 0) {
      if (filtroTipo === "todos") return categorias;
      return categorias.filter((c) => String(c.id_tipo_ticket) === filtroTipo);
    }
    const mapa = new Map<number, string>();
    tickets.forEach((t) => {
      if (t.id_categoria && t.categoria_nombre) {
        if (filtroTipo === "todos" || String(t.id_tipo_ticket) === filtroTipo) {
          mapa.set(t.id_categoria, t.categoria_nombre);
        }
      }
    });
    return Array.from(mapa.entries()).map(([id, nombre]) => ({
      id_categoria: id,
      nombre,
      id_tipo_ticket: null,
    }));
  }, [categorias, tickets, filtroTipo]);

  // Cantidad de filtros avanzados activos
  const cantidadFiltrosActivos =
    (filtroTipo !== "todos" ? 1 : 0) +
    (filtroCategoria !== "todos" ? 1 : 0) +
    (filtroPrioridad !== "todos" ? 1 : 0) +
    (filtroEstado !== "todos" ? 1 : 0);

  // Filtrado según pestaña y filtros
  const ticketsFiltrados = useMemo(() => {
    let lista = tickets;

    if (pestana === "en_proceso") {
      lista = ticketsEnProceso;
    } else if (pestana === "finalizados") {
      lista = ticketsFinalizados;
    }

    if (filtroTipo !== "todos") {
      lista = lista.filter((t) => String(t.id_tipo_ticket) === filtroTipo);
    }

    if (filtroCategoria !== "todos") {
      lista = lista.filter((t) => String(t.id_categoria) === filtroCategoria);
    }

    if (filtroPrioridad !== "todos") {
      lista = lista.filter(
        (t) =>
          String(t.id_prioridad) === filtroPrioridad ||
          t.prioridad_codigo?.toUpperCase() === filtroPrioridad.toUpperCase()
      );
    }

    if (filtroEstado !== "todos") {
      lista = lista.filter(
        (t) =>
          String(t.id_estado) === filtroEstado ||
          t.estado_codigo?.toUpperCase() === filtroEstado.toUpperCase()
      );
    }

    if (busqueda.trim()) {
      const b = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (t) =>
          t.codigo_ticket?.toLowerCase().includes(b) ||
          t.titulo?.toLowerCase().includes(b) ||
          t.servicio_nombre?.toLowerCase().includes(b) ||
          t.categoria_nombre?.toLowerCase().includes(b)
      );
    }

    return lista;
  }, [tickets, pestana, filtroTipo, filtroCategoria, filtroPrioridad, filtroEstado, busqueda, ticketsEnProceso, ticketsFinalizados]);

  return (
    <div className="vista-contenedor" style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Cabecera */}
      <div
        className="cabecera-pagina"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <span className="badge-tag" style={{ display: "inline-block", marginBottom: 6, backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
            Mesa de Ayuda & Casos Personales (ITIL v4)
          </span>
          <h1 className="titulo-pagina">
            {titulo ?? "Mis Tickets"}
          </h1>
          <p className="descripcion-pagina">
            Consulta y realiza seguimiento de todos tus tickets reportados en la Mesa de Servicio.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={cargarMisTickets}
            className="boton-secundario"
          >
            Actualizar
          </button>
          <Link
            href={rutaCrear ?? (tipoFijo === "1" ? "/plataforma/incidentes/crear" : "/plataforma/solicitudes/crear")}
            className="boton-primario"
          >
            Crear ticket
          </Link>
        </div>
      </div>

      <Pestanas
        items={[
          { id: "en_proceso", etiqueta: "En proceso", contador: ticketsEnProceso.length },
          { id: "finalizados", etiqueta: "Finalizados", contador: ticketsFinalizados.length },
          { id: "todos", etiqueta: "Todos", contador: totalTickets },
        ]}
        activa={pestana}
        onCambiar={setPestana}
      />

      {/* Barra de Búsqueda y Botón Filtrar */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          padding: "12px 18px",
          marginBottom: 16,
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Barra de texto a la izquierda */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <input
              type="text"
              className="input-base"
              placeholder="Buscar por código, título o servicio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ width: "100%", fontSize: 12.5, padding: "7px 12px" }}
            />
          </div>

          {/* Botón Filtrar a la derecha */}
          <button
            type="button"
            onClick={() => setMostrarFiltros((prev) => !prev)}
            className="boton-secundario"
          >
            Filtrar
            {cantidadFiltrosActivos > 0 && (
              <span
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: 10,
                }}
              >
                {cantidadFiltrosActivos}
              </span>
            )}
          </button>
        </div>

        {/* Panel Desplegable de Filtros: Tipo, Categoría, Prioridad, Estado */}
        {mostrarFiltros && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))",
                gap: 12,
              }}
            >
              {/* Filtro por Tipo */}
              {!tipoFijo && (
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  Tipo de Ticket
                </label>
                <select
                  className="input-base"
                  value={filtroTipo}
                  onChange={(e) => {
                    setFiltroTipo(e.target.value);
                    setFiltroCategoria("todos");
                  }}
                  style={{ fontSize: 12.5 }}
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="1">Incidentes</option>
                  <option value="2">Solicitudes de Servicio</option>
                </select>
              </div>
              )}

              {/* Filtro por Categoría */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  Categoría
                </label>
                <select
                  className="input-base"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  style={{ fontSize: 12.5 }}
                >
                  <option value="todos">Todas las categorías</option>
                  {categoriasDisponibles.map((cat) => (
                    <option key={cat.id_categoria} value={String(cat.id_categoria)}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Prioridad */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  Prioridad
                </label>
                <select
                  className="input-base"
                  value={filtroPrioridad}
                  onChange={(e) => setFiltroPrioridad(e.target.value)}
                  style={{ fontSize: 12.5 }}
                >
                  <option value="todos">Todas las prioridades</option>
                  <option value="P1">P1 - Crítica</option>
                  <option value="P2">P2 - Alta</option>
                  <option value="P3">P3 - Media</option>
                  <option value="P4">P4 - Baja</option>
                </select>
              </div>

              {/* Filtro por Estado */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  Estado
                </label>
                <select
                  className="input-base"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  style={{ fontSize: 12.5 }}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="1">Abierto</option>
                  <option value="2">Asignado</option>
                  <option value="3">En Atención / Proceso</option>
                  <option value="4">En Espera / Pausa</option>
                  <option value="5">Resuelto</option>
                  <option value="6">Cerrado</option>
                  <option value="7">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Acciones de los filtros */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 11.5, color: "#64748b" }}>
                {ticketsFiltrados.length} ticket(s) encontrado(s) con los filtros actuales
              </span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {cantidadFiltrosActivos > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroTipo("todos");
                      setFiltroCategoria("todos");
                      setFiltroPrioridad("todos");
                      setFiltroEstado("todos");
                    }}
                    className="boton-enlace"
                  >
                    Limpiar filtros
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMostrarFiltros(false)}
                  className="boton-secundario"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista / Tabla de Tickets */}
      {cargando ? (
        <div style={{ padding: 40, textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
          Cargando tus tickets...
        </div>
      ) : error ? (
        <div style={{ padding: 20, backgroundColor: "#fee2e2", borderRadius: 8, color: "#991b1b" }}>
          {error}
        </div>
      ) : ticketsFiltrados.length === 0 ? (
        <div
          className="estado-vacio"
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
            No se encontraron tickets en esta vista
          </div>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 18, maxWidth: 460, margin: "0 auto 18px auto" }}>
            {busqueda
              ? "No hay resultados para el término de búsqueda ingresado. Prueba con otro código o palabra clave."
              : pestana === "en_proceso"
              ? "Actualmente no tienes tickets activos en proceso. ¿Necesitas ayuda técnica o reportar una avería?"
              : "No tienes tickets registrados en este historial."}
          </p>
          <Link
            href={rutaCrear ?? (tipoFijo === "1" ? "/plataforma/incidentes/crear" : "/plataforma/solicitudes/crear")}
            className="boton-primario"
          >
            Crear ticket
          </Link>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <table className="tabla-base" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#475569" }}>CÓDIGO</th>
                <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#475569" }}>TIPO</th>
                <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#475569" }}>TÍTULO / SERVICIO</th>
                <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#475569" }}>PRIORIDAD</th>
                <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#475569" }}>ESTADO</th>
                <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#475569" }}>FECHA</th>
                <th style={{ padding: "12px 16px", fontSize: 11.5, fontWeight: 700, color: "#475569", textAlign: "right" }}>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.map((t) => {
                const esIncidente = t.id_tipo_ticket === 1;
                return (
                  <tr
                    key={t.id_ticket}
                    onClick={() => router.push(rutaDetalleBase ? `${rutaDetalleBase}/${t.id_ticket}` : (esIncidente ? `/plataforma/incidentes/${t.id_ticket}` : `/plataforma/solicitudes/${t.id_ticket}`))}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                  >
                    {/* Código */}
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        {t.codigo_ticket}
                      </span>
                    </td>

                    {/* Tipo */}
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        className={`badge-itil ${esIncidente ? "badge-tipo-incidente" : "badge-tipo-solicitud"}`}
                        style={{ fontSize: 10.5 }}
                      >
                        {esIncidente ? "Incidente" : "Solicitud"}
                      </span>
                    </td>

                    {/* Título / Servicio */}
                    <td style={{ padding: "12px 16px", maxWidth: 360 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0f172a",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.titulo}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "#64748b",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: 2,
                        }}
                      >
                        {t.servicio_nombre || t.categoria_nombre || "Servicio General"}
                      </div>
                    </td>

                    {/* Prioridad */}
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        className="badge-itil"
                        style={{
                          backgroundColor: t.prioridad_color ? `${t.prioridad_color}18` : "#f1f5f9",
                          color: t.prioridad_color || "#475569",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {t.prioridad_nombre || t.prioridad_codigo}
                      </span>
                    </td>

                    {/* Estado */}
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        className="badge-itil"
                        style={{
                          backgroundColor: t.estado_color ? `${t.estado_color}20` : "#f1f5f9",
                          color: t.estado_color || "#334155",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {t.estado_nombre}
                      </span>
                    </td>

                    {/* Fecha de Registro */}
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>
                      {new Date(t.fecha_creacion).toLocaleDateString([], {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Botón Acción -> Navega a la página completa */}
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(rutaDetalleBase ? `${rutaDetalleBase}/${t.id_ticket}` : (esIncidente ? `/plataforma/incidentes/${t.id_ticket}` : `/plataforma/solicitudes/${t.id_ticket}`));
                        }}
                        className="boton-secundario"
                      >
                        Ver ticket
                      </button>
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
