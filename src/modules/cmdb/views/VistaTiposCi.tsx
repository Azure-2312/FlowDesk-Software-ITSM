"use client";

import { useEffect, useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface TipoCI {
  id_tipo_ci: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  icono: string;
  atributos_requeridos: string[];
  reglas_impacto: Array<{ relacion: string; tipo_destino: string; impacto: string }>;
  estado_registro: boolean;
}

function ContenidoModeladoTiposCI() {
  const searchParams = useSearchParams();
  const modoParam = searchParams.get("modo");
  const esModoAdmin = modoParam === "admin";

  const [tipos, setTipos] = useState<TipoCI[]>([]);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<"tabla" | "nuevo">("tabla");

  // Formulario nuevo tipo
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("INFRAESTRUCTURA");
  const [atributosTxt, setAtributosTxt] = useState("ip_principal, ram_gb, ubicacion");
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargarTipos() {
    setCargando(true);
    try {
      const res = await fetch("/api/cmdb/tipos");
      const data = await res.json();
      if (Array.isArray(data.tipos)) setTipos(data.tipos);
    } catch {
      setError("Error al cargar tipos de Elementos de Configuración.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTipos();
  }, []);

  async function guardarTipoCI(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      const atributosArray = atributosTxt
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const res = await fetch("/api/cmdb/tipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: codigo.trim().toUpperCase(),
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          categoria,
          atributos_requeridos: atributosArray,
          reglas_impacto: [
            { relacion: "DEPENDE_DE", tipo_destino: "BD", impacto: "ALTO" },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar el tipo de CI.");
        return;
      }

      setMensajeExito(`Tipo de CI [${data.tipo.codigo}] modelado exitosamente.`);
      setTimeout(() => setMensajeExito(null), 4000);
      setVista("tabla");
      setCodigo("");
      setNombre("");
      setDescripcion("");
      await cargarTipos();
    } catch {
      setError("Error de conexión al guardar tipo de CI.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="vista-contenedor">
      {vista === "nuevo" ? (
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Modelar Nueva Clase de Elemento de Configuración (CI)
              </h1>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
                Defina las clases de infraestructura (Servidores, Routers, Bases de Datos) y sus atributos técnicos obligatorios.
              </p>
            </div>
            <button
              type="button"
              className="boton-mini"
              onClick={() => setVista("tabla")}
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              Volver a Tipos de CI
            </button>
          </div>

          {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="contenedor-tabla" style={{ padding: 26, backgroundColor: "#ffffff" }}>
            <form onSubmit={guardarTipoCI}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, marginBottom: 16 }}>
                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Código de Clase *</label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ej. SRV_HYPERVISOR"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    required
                  />
                </div>

                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Nombre del Tipo de CI *</label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ej. Servidor Hipervisor de Virtualización"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Categoría Tecnológica *</label>
                  <select
                    className="input-base"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                  >
                    <option value="INFRAESTRUCTURA">Infraestructura y Cómputo</option>
                    <option value="APLICACION">Bases de Datos y Aplicaciones</option>
                    <option value="RED">Redes y Conectividad Perimetral</option>
                    <option value="LICENCIA">Licenciamiento y Contratos</option>
                    <option value="SERVICIO">Servicios de Negocio</option>
                  </select>
                </div>

                <div className="campo">
                  <label className="etiqueta" style={{ fontWeight: 600 }}>Atributos Requeridos (separados por coma)</label>
                  <input
                    type="text"
                    className="input-base"
                    value={atributosTxt}
                    onChange={(e) => setAtributosTxt(e.target.value)}
                    placeholder="ip_privada, ram_gb, cores..."
                  />
                </div>
              </div>

              <div className="campo" style={{ marginBottom: 20 }}>
                <label className="etiqueta" style={{ fontWeight: 600 }}>Descripción Técnica y Alcance de Impacto</label>
                <textarea
                  className="input-base"
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalle el rol de este tipo de CI dentro de la arquitectura corporativa..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                <button type="button" className="boton-mini" onClick={() => setVista("tabla")}>
                  Cancelar
                </button>
                <button type="submit" className="boton-primario" style={{ width: "auto" }} disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar Tipo de CI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1>Modelado de Clases y Tipos de Elementos CMDB</h1>
              <p className="subtitulo">
                Defina las clases de infraestructura tecnológica (Servidores, Software, Routers, Licencias) y cómo se relacionan entre sí para mapear automáticamente el impacto de una falla o cambio.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href="/activos/cmdb"
                className="boton-secundario"
                style={{ textDecoration: "none", fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center" }}
              >
                Ver Mapa de Topología
              </Link>
              <button
                type="button"
                className="boton-primario"
                style={{ width: "auto", fontSize: 13, padding: "8px 16px" }}
                onClick={() => setVista("nuevo")}
              >
                + Modelar Nueva Clase CI
              </button>
            </div>
          </div>

          {mensajeExito && (
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
              {mensajeExito}
            </div>
          )}

          {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

          {cargando ? (
            <div className="contenedor-tabla" style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
              Consultando modelo de CMDB...
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla-datos">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre de la Clase</th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th>Atributos Técnicos Obligatorios</th>
                    <th>Reglas de Impacto</th>
                  </tr>
                </thead>
                <tbody>
                  {tipos.map((t) => (
                    <tr key={t.id_tipo_ci}>
                      <td>
                        <strong style={{ fontFamily: "monospace", color: "#2563eb", fontSize: 12.5 }}>
                          {t.codigo}
                        </strong>
                      </td>
                      <td style={{ fontWeight: 600, color: "#0f172a" }}>
                        {t.nombre}
                      </td>
                      <td>
                        <span className="badge-itil" style={{ backgroundColor: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1" }}>
                          {t.categoria}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "#475569", maxWidth: 280 }}>
                        {t.descripcion || "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {Array.isArray(t.atributos_requeridos) && t.atributos_requeridos.length > 0 ? (
                            t.atributos_requeridos.map((at, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: 10.5,
                                  fontFamily: "monospace",
                                  backgroundColor: "#eff6ff",
                                  color: "#1e40af",
                                  border: "1px solid #bfdbfe",
                                  padding: "1px 5px",
                                  borderRadius: 4,
                                }}
                              >
                                {at}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: 11, color: "#94a3b8" }}>Estándar</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>
                          Propagación activa
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PaginaModeladoTiposCI() {
  return (
    <Suspense fallback={<div className="vista-contenedor"><p>Cargando modelado de tipos CI...</p></div>}>
      <ContenidoModeladoTiposCI />
    </Suspense>
  );
}
