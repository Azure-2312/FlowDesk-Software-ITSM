"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Ban, Play } from "@/shared/components/ui/Iconos";
import { AlertaCampo } from "@/shared/components/ui/AlertaCampo";

interface Fabricante {
  id: number;
  nombre: string;
  sitio_web?: string;
  contacto_soporte?: string;
  activo: boolean;
  total_modelos?: number;
}

interface Modelo {
  id: number;
  fabricante_id: number;
  tipo_id: string;
  nombre: string;
  numero_parte: string;
  garantia_meses: number;
  vida_util_meses: number;
  eol?: string;
  eos?: string;
  activo: boolean;
}

interface Props {
  datos: {
    fabricantes?: Fabricante[];
    modelos?: Modelo[];
  };
  onChange: (nuevosDatos: any) => void;
  bloqueado: boolean;
}

export function PestanaFabricantesModelos({ datos, onChange, bloqueado }: Props) {
  const fabricantes: Fabricante[] = datos?.fabricantes || [];
  const modelos: Modelo[] = datos?.modelos || [];

  const [seccionActiva, setSeccionActiva] = useState<"fabricantes" | "modelos">("fabricantes");
  const [filtroFabricante, setFiltroFabricante] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");

  // Formulario rápido nuevo fabricante
  const [nuevoFabNombre, setNuevoFabNombre] = useState("");
  const [nuevoFabWeb, setNuevoFabWeb] = useState("");
  const [nuevoFabContacto, setNuevoFabContacto] = useState("");
  const [errorFab, setErrorFab] = useState<string | null>(null);

  // Formulario rápido nuevo modelo
  const [nuevoModFabId, setNuevoModFabId] = useState<number>(fabricantes[0]?.id || 1);
  const [nuevoModTipoId, setNuevoModTipoId] = useState("portatil");
  const [nuevoModNombre, setNuevoModNombre] = useState("");
  const [nuevoModParte, setNuevoModParte] = useState("");
  const [nuevoModGarantia, setNuevoModGarantia] = useState<number>(36);
  const [nuevoModVida, setNuevoModVida] = useState<number>(48);
  const [errorMod, setErrorMod] = useState<string | null>(null);

  const agregarFabricante = () => {
    setErrorFab(null);
    if (!nuevoFabNombre.trim()) {
      setErrorFab("Ingresa el nombre del fabricante (mínimo 2 caracteres).");
      return;
    }
    if (nuevoFabWeb.trim() && !nuevoFabWeb.trim().startsWith("http")) {
      setErrorFab("El sitio web debe comenzar con https:// o http://");
      return;
    }
    if (bloqueado) return;
    const nuevoId = (fabricantes.length > 0 ? Math.max(...fabricantes.map((f) => f.id)) : 0) + 1;
    const nuevoFab: Fabricante = {
      id: nuevoId,
      nombre: nuevoFabNombre.trim(),
      sitio_web: nuevoFabWeb.trim() || undefined,
      contacto_soporte: nuevoFabContacto.trim() || undefined,
      activo: true,
      total_modelos: 0
    };
    onChange({ ...datos, fabricantes: [...fabricantes, nuevoFab] });
    setNuevoFabNombre("");
    setNuevoFabWeb("");
    setNuevoFabContacto("");
  };

  const toggleEstadoFabricante = (fabId: number) => {
    if (bloqueado) return;
    const fabsActualizados = fabricantes.map((f) =>
      f.id === fabId ? { ...f, activo: !f.activo } : f
    );
    onChange({ ...datos, fabricantes: fabsActualizados });
  };

  const agregarModelo = () => {
    setErrorMod(null);
    if (!nuevoModNombre.trim()) {
      setErrorMod("Ingresa el nombre del modelo homologado.");
      return;
    }
    if (!nuevoModParte.trim()) {
      setErrorMod("Ingresa el número de parte (P/N) del fabricante.");
      return;
    }
    if (bloqueado) return;
    const nuevoId = (modelos.length > 0 ? Math.max(...modelos.map((m) => m.id)) : 0) + 1;
    const nuevoMod: Modelo = {
      id: nuevoId,
      fabricante_id: Number(nuevoModFabId),
      tipo_id: nuevoModTipoId,
      nombre: nuevoModNombre.trim(),
      numero_parte: nuevoModParte.trim(),
      garantia_meses: Number(nuevoModGarantia) || 36,
      vida_util_meses: Number(nuevoModVida) || 48,
      activo: true
    };
    onChange({ ...datos, modelos: [...modelos, nuevoMod] });
    setNuevoModNombre("");
    setNuevoModParte("");
  };

  const toggleEstadoModelo = (modId: number) => {
    if (bloqueado) return;
    const modsActualizados = modelos.map((m) =>
      m.id === modId ? { ...m, activo: !m.activo } : m
    );
    onChange({ ...datos, modelos: modsActualizados });
  };

  const modelosFiltrados = modelos.filter((m) => {
    const cumpleFab = filtroFabricante === "TODOS" || m.fabricante_id === Number(filtroFabricante);
    const cumpleBusq = m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.numero_parte.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleFab && cumpleBusq;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Subnavegador */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className={seccionActiva === "fabricantes" ? "boton-principal" : "boton-secundario"}
            onClick={() => setSeccionActiva("fabricantes")}
            style={{ fontSize: 12.5 }}
          >
            Catálogo de Fabricantes ({fabricantes.length})
          </button>
          <button
            type="button"
            className={seccionActiva === "modelos" ? "boton-principal" : "boton-secundario"}
            onClick={() => setSeccionActiva("modelos")}
            style={{ fontSize: 12.5 }}
          >
            Catálogo de Modelos Homologados ({modelos.length})
          </button>
        </div>

        <input
          type="text"
          className="input-base"
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ fontSize: 12, padding: "6px 12px", width: 220 }}
        />
      </div>

      {seccionActiva === "fabricantes" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Tabla de fabricantes */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "8px 12px" }}>Fabricante</th>
                  <th style={{ padding: "8px 12px" }}>Sitio Web Oficial</th>
                  <th style={{ padding: "8px 12px" }}>Contacto de Soporte</th>
                  <th style={{ padding: "8px 12px" }}>Modelos Registrados</th>
                  <th style={{ padding: "8px 12px" }}>Estado</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {fabricantes
                  .filter((f) => f.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                  .map((f) => {
                    const cantModelos = modelos.filter((m) => m.fabricante_id === f.id).length;
                    return (
                      <tr key={f.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 12px", fontWeight: 700, color: "#1e293b" }}>{f.nombre}</td>
                        <td style={{ padding: "8px 12px", color: "#2563eb" }}>
                          {f.sitio_web ? (
                            <a href={f.sitio_web} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                              {f.sitio_web}
                            </a>
                          ) : "—"}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#64748b" }}>{f.contacto_soporte || "—"}</td>
                        <td style={{ padding: "8px 12px" }}>{cantModelos} modelos</td>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, backgroundColor: f.activo ? "#dcfce7" : "#fee2e2", color: f.activo ? "#166534" : "#991b1b" }}>
                            {f.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right" }}>
                          <BotonIcono
                            variante={f.activo ? "peligro" : "normal"}
                            icono={f.activo ? <Ban size={14} /> : <Play size={14} />}
                            titulo={f.activo ? "Desactivar fabricante" : "Activar fabricante"}
                            ariaLabel={f.activo ? "Desactivar fabricante" : "Activar fabricante"}
                            disabled={bloqueado}
                            onClick={() => toggleEstadoFabricante(f.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Formulario nuevo fabricante */}
          {!bloqueado && (
            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px 0", color: "#0f172a" }}>
                Registrar Nuevo Fabricante
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "flex-end" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                    Nombre del Fabricante *
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ej. Palo Alto Networks"
                    value={nuevoFabNombre}
                    onChange={(e) => setNuevoFabNombre(e.target.value)}
                    style={{ fontSize: 12, width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                    Sitio Web
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="https://..."
                    value={nuevoFabWeb}
                    onChange={(e) => setNuevoFabWeb(e.target.value)}
                    style={{ fontSize: 12, width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                    Correo / Soporte
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="soporte@paloaltonetworks.com"
                    value={nuevoFabContacto}
                    onChange={(e) => setNuevoFabContacto(e.target.value)}
                    style={{ fontSize: 12, width: "100%" }}
                  />
                </div>
                <button
                  type="button"
                  className="boton-principal"
                  onClick={agregarFabricante}
                  style={{ fontSize: 12, padding: "8px 16px" }}
                >
                  Guardar Fabricante
                </button>
              </div>
              {errorFab && <AlertaCampo error={errorFab} />}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Filtro de modelos por fabricante */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Filtrar por fabricante:</span>
            <select
              className="input-base"
              value={filtroFabricante}
              onChange={(e) => setFiltroFabricante(e.target.value)}
              style={{ fontSize: 12, padding: "4px 10px" }}
            >
              <option value="TODOS">Todos los fabricantes</option>
              {fabricantes.map((f) => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>

          {/* Tabla de modelos */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "8px 12px" }}>Modelo</th>
                  <th style={{ padding: "8px 12px" }}>Fabricante</th>
                  <th style={{ padding: "8px 12px" }}>Número de Parte (P/N)</th>
                  <th style={{ padding: "8px 12px" }}>Tipo Asignado</th>
                  <th style={{ padding: "8px 12px" }}>Garantía Estándar</th>
                  <th style={{ padding: "8px 12px" }}>Vida Útil</th>
                  <th style={{ padding: "8px 12px" }}>Estado</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {modelosFiltrados.map((m) => {
                  const fab = fabricantes.find((f) => f.id === m.fabricante_id);
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 700, color: "#1e293b" }}>{m.nombre}</td>
                      <td style={{ padding: "8px 12px" }}>{fab?.nombre || "—"}</td>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace" }}>{m.numero_parte || "—"}</td>
                      <td style={{ padding: "8px 12px" }}>{m.tipo_id}</td>
                      <td style={{ padding: "8px 12px" }}>{m.garantia_meses} meses</td>
                      <td style={{ padding: "8px 12px" }}>{m.vida_util_meses} meses</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, backgroundColor: m.activo ? "#dcfce7" : "#fee2e2", color: m.activo ? "#166534" : "#991b1b" }}>
                          {m.activo ? "Homologado" : "Inactivo"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        <BotonIcono
                          variante={m.activo ? "peligro" : "normal"}
                          icono={m.activo ? <Ban size={14} /> : <Play size={14} />}
                          titulo={m.activo ? "Desactivar modelo" : "Activar modelo"}
                          ariaLabel={m.activo ? "Desactivar modelo" : "Activar modelo"}
                          disabled={bloqueado}
                          onClick={() => toggleEstadoModelo(m.id)}
                        />
                      </td>
                    </tr>
                  );
                })}
                {modelosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 16, textAlign: "center", color: "#94a3b8" }}>
                      No se encontraron modelos con los criterios seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Formulario nuevo modelo */}
          {!bloqueado && (
            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px 0", color: "#0f172a" }}>
                Homologar Nuevo Modelo de Activo
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, alignItems: "flex-end" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                    Fabricante *
                  </label>
                  <select
                    className="input-base"
                    value={nuevoModFabId}
                    onChange={(e) => setNuevoModFabId(Number(e.target.value))}
                    style={{ fontSize: 12, width: "100%" }}
                  >
                    {fabricantes.map((f) => (
                      <option key={f.id} value={f.id}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                    Nombre del Modelo *
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ej. MacBook Pro 16"
                    value={nuevoModNombre}
                    onChange={(e) => setNuevoModNombre(e.target.value)}
                    style={{ fontSize: 12, width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                    Número de Parte / SKU
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="MNW83LL/A"
                    value={nuevoModParte}
                    onChange={(e) => setNuevoModParte(e.target.value)}
                    style={{ fontSize: 12, width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                    Garantía (Meses)
                  </label>
                  <input
                    type="number"
                    className="input-base"
                    value={nuevoModGarantia}
                    onChange={(e) => setNuevoModGarantia(Number(e.target.value))}
                    style={{ fontSize: 12, width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                    Vida Útil (Meses)
                  </label>
                  <input
                    type="number"
                    className="input-base"
                    value={nuevoModVida}
                    onChange={(e) => setNuevoModVida(Number(e.target.value))}
                    style={{ fontSize: 12, width: "100%" }}
                  />
                </div>
                <button
                  type="button"
                  className="boton-principal"
                  onClick={agregarModelo}
                  style={{ fontSize: 12, padding: "8px 16px" }}
                >
                  Guardar Modelo
                </button>
              </div>
              {errorMod && <AlertaCampo error={errorMod} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
