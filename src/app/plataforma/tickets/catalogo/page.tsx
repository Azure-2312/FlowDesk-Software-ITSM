"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServicioCatalogo } from "@/types";

type Categoria = {
  id_categoria: number;
  id_tipo_ticket: number | null;
  nombre: string;
  codigo_corto?: string;
  sla_default_respuesta?: number;
  sla_default_resolucion?: number;
  descripcion?: string | null;
  estado_registro?: boolean;
};

function IconoCategoria({ nombre, codigo }: { nombre: string; codigo?: string }) {
  const n = (nombre || "").toLowerCase();
  const c = (codigo || "").toUpperCase();

  if (n.includes("red") || c === "RED") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    );
  }
  if (n.includes("seguridad") || n.includes("certificado") || c === "SEC") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  if (n.includes("hardware") || n.includes("equipo") || c === "HW") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  }
  if (n.includes("software") || n.includes("aplicaci") || n.includes("instalaci") || c === "SW") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }
  if (n.includes("usuario") || n.includes("acceso") || c === "ACC") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (n.includes("servidor") || n.includes("infraestructura") || c === "INF") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
        <line x1="10" y1="6" x2="10.01" y2="6" />
        <line x1="10" y1="18" x2="10.01" y2="18" />
      </svg>
    );
  }
  if (n.includes("base de datos") || n.includes("almacenamiento") || c === "DB") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    );
  }
  if (n.includes("telefon") || c === "TEL") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  if (n.includes("impresi") || c === "PRN") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    );
  }
  if (n.includes("correo") || n.includes("mensajer") || c === "MAIL") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    );
  }
  if (n.includes("cloud") || n.includes("nube") || c === "CLD") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    );
  }
  if (n.includes("copia") || n.includes("backup") || n.includes("dato") || c === "BKP") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#65a30d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
      </svg>
    );
  }
  if (n.includes("capacita") || c === "CAP") {
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

function ContenidoCatalogo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramTipo = searchParams.get("tipo");
  const paramCat = searchParams.get("categoria");

  const esSolicitud = paramTipo === "solicitud" || paramTipo === "2";
  const idTipoFiltro = esSolicitud ? 2 : 1;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [servicios, setServicios] = useState<ServicioCatalogo[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  async function cargarDatos() {
    setCargando(true);
    setError(null);
    try {
      const [resCat, resSrv] = await Promise.all([
        fetch("/api/tickets/catalogos"),
        fetch("/api/servicios?estado=activos"),
      ]);

      const [dataCat, dataSrv] = await Promise.all([resCat.json(), resSrv.json()]);

      if (dataCat.categorias) {
        setCategorias(dataCat.categorias);
      }
      if (dataSrv.servicios) {
        setServicios(dataSrv.servicios);
      }

      // Si viene categoría preseleccionada por query param
      if (paramCat && dataCat.categorias) {
        const encontrada = dataCat.categorias.find(
          (c: Categoria) => String(c.id_categoria) === String(paramCat)
        );
        if (encontrada) {
          setCategoriaSeleccionada(encontrada);
        }
      }
    } catch {
      setError("Error de conexión al cargar el catálogo de servicios corporativos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // Categorías correspondientes al tipo activo
  const categoriasDelTipo = useMemo(() => {
    return categorias.filter((c) => c.id_tipo_ticket === idTipoFiltro && c.estado_registro !== false);
  }, [categorias, idTipoFiltro]);

  // Categorías filtradas por búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return categoriasDelTipo;
    const q = busqueda.toLowerCase().trim();
    return categoriasDelTipo.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(q))
    );
  }, [categoriasDelTipo, busqueda]);

  // Servicios de la categoría seleccionada
  const serviciosDeCategoria = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    let lista = servicios.filter(
      (s) => s.id_categoria === categoriaSeleccionada.id_categoria && s.estado_registro !== false
    );

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (s) =>
          s.nombre.toLowerCase().includes(q) ||
          s.codigo_servicio.toLowerCase().includes(q) ||
          (s.descripcion_comercial && s.descripcion_comercial.toLowerCase().includes(q)) ||
          (s.entregable && s.entregable.toLowerCase().includes(q))
      );
    }

    return lista;
  }, [servicios, categoriaSeleccionada, busqueda]);

  function solicitarServicio(s: ServicioCatalogo) {
    const tipoStr = s.id_tipo_ticket === 1 ? "1" : "2";
    router.push(
      `/tickets/gestion/crear?tipo=${tipoStr}&servicio=${encodeURIComponent(s.codigo_servicio)}&categoria=${s.id_categoria || ""}&titulo=${encodeURIComponent(s.nombre)}`
    );
  }

  return (
    <div className="vista-contenedor" style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Cabecera Principal */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          {esSolicitud ? "Catálogo de Solicitudes de Servicio" : "Catálogo de Incidentes"}
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4, marginBottom: 0 }}>
          {esSolicitud
            ? "Explora las categorías y servicios disponibles para requerimientos, trámites y nuevas solicitudes institucionales."
            : "Explora las categorías y servicios oficiales para el reporte de incidentes técnicos e interrupciones del servicio."}
        </p>
      </div>

      {cargando ? (
        <div style={{ padding: 40, textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
          Cargando catálogo oficial de servicios...
        </div>
      ) : error ? (
        <div style={{ padding: 18, backgroundColor: "#fee2e2", borderRadius: 8, color: "#991b1b" }}>
          {error}
        </div>
      ) : categoriaSeleccionada === null ? (
        /* ========================================================================= */
        /* VISTA 1: GRID DE CATEGORÍAS COMO BOTONES/TARJETAS (IGUAL AL ADMINISTRADOR)*/
        /* ========================================================================= */
        <div>
          {/* Barra de Filtro de Categorías */}
          <div className="barra-filtros" style={{ marginBottom: 20 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <input
                type="text"
                className="input-base"
                placeholder="Buscar categoría por nombre o descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: "100%", fontSize: 13 }}
              />
            </div>
            {busqueda && (
              <button
                type="button"
                className="boton-secundario"
                onClick={() => setBusqueda("")}
                style={{ width: "auto" }}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Grid de Tarjetas de Categorías */}
          {categoriasFiltradas.length === 0 ? (
            <div style={{ padding: "36px 20px", textAlign: "center", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: 8 }}>
              No se encontraron categorías que coincidan con "{busqueda}".
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
              {categoriasFiltradas.map((cat) => {
                const serviciosDeCat = servicios.filter((s) => s.id_categoria === cat.id_categoria && s.estado_registro !== false);

                return (
                  <div
                    key={cat.id_categoria}
                    onClick={() => {
                      setCategoriaSeleccionada(cat);
                      setBusqueda("");
                    }}
                    className="tarjeta"
                    style={{
                      cursor: "pointer",
                      padding: 20,
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 16,
                      transition: "all 0.15s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 8,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconoCategoria nombre={cat.nombre} codigo={cat.codigo_corto} />
                      </div>
                      <div>
                        <h3 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                          {cat.nombre}
                        </h3>
                        <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
                          {cat.descripcion || `Gestión y servicios de ${cat.nombre}`}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: serviciosDeCat.length > 0 ? "#2563eb" : "#94a3b8" }}>
                        {serviciosDeCat.length} {serviciosDeCat.length === 1 ? "servicio" : "servicios"}
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#2563eb", display: "inline-flex", alignItems: "center", gap: 4 }}>
                        Ver servicios
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* VISTA 2: SERVICIOS DE LA CATEGORÍA SELECCIONADA (EXACTO A CAPTURA USUARIO) */
        /* ========================================================================= */
        <div>
          {/* Cabecera de la Categoría y Enlace Volver */}
          <div
            style={{
              marginBottom: 16,
              paddingBottom: 14,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setCategoriaSeleccionada(null);
                setBusqueda("");
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "none",
                color: "#2563eb",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 10,
                padding: 0,
              }}
            >
              Volver a Categorías de {esSolicitud ? "Solicitudes" : "Incidentes"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 8,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconoCategoria nombre={categoriaSeleccionada.nombre} codigo={categoriaSeleccionada.codigo_corto} />
              </div>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Categoría: {categoriaSeleccionada.nombre}
                </h2>
                <p style={{ margin: "2px 0 0 0", color: "#64748b", fontSize: 12.5 }}>
                  {categoriaSeleccionada.descripcion || "Servicios catalogados en esta categoría técnica."} (SLA defecto: {categoriaSeleccionada.sla_default_respuesta || 2}h resp. / {categoriaSeleccionada.sla_default_resolucion || 24}h resol.)
                </p>
              </div>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="barra-filtros" style={{ marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <input
                type="text"
                className="input-base"
                placeholder="Buscar servicio por código o nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ width: "100%", fontSize: 13 }}
              />
            </div>
            <div>
              <span
                style={{
                  fontSize: 12,
                  color: "#475569",
                  padding: "6px 12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  display: "inline-block",
                }}
              >
                Servicios Activos
              </span>
            </div>
          </div>

          {/* Estado vacío o Tabla de Servicios */}
          {serviciosDeCategoria.length === 0 ? (
            <div
              style={{
                padding: "48px 20px",
                textAlign: "center",
                backgroundColor: "#f8fafc",
                borderRadius: 8,
                border: "1px dashed #cbd5e1",
              }}
            >
              <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
                {busqueda
                  ? `No se encontraron servicios que coincidan con "${busqueda}".`
                  : "Todavía no hay ningún servicio configurado en esta categoría."}
              </p>
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Servicio / Entregable</th>
                    <th>SLA Resp.</th>
                    <th>SLA Resol.</th>
                    <th>Aprobación</th>
                    <th>Costo Ref.</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {serviciosDeCategoria.map((s) => (
                    <tr key={s.id_servicio}>
                      <td>
                        <strong style={{ fontFamily: "monospace", color: "#2563eb", fontSize: 12.5 }}>
                          {s.codigo_servicio}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{s.nombre}</div>
                        <div style={{ fontSize: 12, color: "#64748b", maxWidth: 420 }}>
                          Entregable: {s.entregable || "Atención estándar bajo el catálogo oficial de TI."}
                        </div>
                      </td>
                      <td style={{ fontSize: 12.5, fontWeight: 500 }}>{s.sla_horas_respuesta || 2}h</td>
                      <td style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a" }}>{s.sla_horas_resolucion || 24}h</td>
                      <td>
                        {s.requiere_aprobacion ? (
                          <span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#92400e", fontSize: 11 }}>
                            Requiere Jefatura
                          </span>
                        ) : (
                          <span style={{ fontSize: 11.5, color: "#64748b" }}>Pre-aprobado</span>
                        )}
                      </td>
                      <td style={{ fontSize: 12.5, color: "#334155" }}>
                        S/. {Number(s.costo_referencial || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className="badge badge-activo">
                          Activo
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="boton-primario"
                          style={{
                            width: "auto",
                            padding: "6px 14px",
                            fontSize: 12.5,
                            whiteSpace: "nowrap",
                          }}
                          onClick={() => solicitarServicio(s)}
                        >
                          {esSolicitud ? "Solicitar servicio" : "Reportar incidente"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PaginaCatalogo() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Cargando catálogo...</div>}>
      <ContenidoCatalogo />
    </Suspense>
  );
}
