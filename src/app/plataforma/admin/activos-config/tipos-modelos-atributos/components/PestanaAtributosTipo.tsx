"use client";

import React, { useState } from "react";

interface AtributoTecnico {
  id: number;
  clase_id: string;
  codigo: string;
  etiqueta: string;
  tipo_dato: string;
  obligatorio: "siempre" | "segun_estado" | "no";
  unico: boolean;
  sensible: boolean;
  protegido: boolean;
  aparece_en_incidentes: boolean;
  cuenta_completitud: boolean;
  orden: number;
}

interface Props {
  datos: {
    atributos_base?: AtributoTecnico[];
  };
  onChange: (nuevosDatos: any) => void;
  bloqueado: boolean;
}

const CLASES_CATALOGO = [
  { id: "TODOS", nombre: "Todos los atributos" },
  { id: "hardware", nombre: "Hardware" },
  { id: "red", nombre: "Equipos de Red" },
  { id: "software", nombre: "Software" },
  { id: "base_datos", nombre: "Base de Datos" },
  { id: "infraestructura_virtual", nombre: "Infraestructura Virtual" }
];

export function PestanaAtributosTipo({ datos, onChange, bloqueado }: Props) {
  const atributos: AtributoTecnico[] = datos?.atributos_base || [];
  const [filtroClase, setFiltroClase] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");

  // Formulario nuevo atributo
  const [nuevoEtiqueta, setNuevoEtiqueta] = useState("");
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoClase, setNuevoClase] = useState("hardware");
  const [nuevoTipoDato, setNuevoTipoDato] = useState("texto_corto");
  const [nuevoObligatorio, setNuevoObligatorio] = useState<"siempre" | "segun_estado" | "no">("no");
  const [nuevoUnico, setNuevoUnico] = useState(false);
  const [nuevoSensible, setNuevoSensible] = useState(false);
  const [nuevoProtegido, setNuevoProtegido] = useState(false);
  const [nuevoIncidentes, setNuevoIncidentes] = useState(false);

  const agregarAtributo = () => {
    if (!nuevoEtiqueta.trim() || !nuevoCodigo.trim() || bloqueado) return;
    const nuevoId = (atributos.length > 0 ? Math.max(...atributos.map((a) => a.id)) : 0) + 1;
    const nuevoAttr: AtributoTecnico = {
      id: nuevoId,
      clase_id: nuevoClase,
      codigo: nuevoCodigo.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      etiqueta: nuevoEtiqueta.trim(),
      tipo_dato: nuevoTipoDato,
      obligatorio: nuevoObligatorio,
      unico: nuevoUnico,
      sensible: nuevoSensible,
      protegido: nuevoProtegido,
      aparece_en_incidentes: nuevoIncidentes,
      cuenta_completitud: true,
      orden: atributos.length + 1
    };
    onChange({ ...datos, atributos_base: [...atributos, nuevoAttr] });
    setNuevoEtiqueta("");
    setNuevoCodigo("");
    setNuevoUnico(false);
    setNuevoSensible(false);
    setNuevoProtegido(false);
    setNuevoIncidentes(false);
  };

  const eliminarAtributo = (id: number) => {
    if (bloqueado) return;
    const filtrados = atributos.filter((a) => a.id !== id);
    onChange({ ...datos, atributos_base: filtrados });
  };

  const toggleBooleano = (id: number, campo: keyof AtributoTecnico) => {
    if (bloqueado) return;
    const actualizados = atributos.map((a) =>
      a.id === id ? { ...a, [campo]: !a[campo] } : a
    );
    onChange({ ...datos, atributos_base: actualizados });
  };

  const atributosFiltrados = atributos.filter((a) => {
    const cumpleClase = filtroClase === "TODOS" || a.clase_id === filtroClase;
    const cumpleBusq = a.etiqueta.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.codigo.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleClase && cumpleBusq;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Barra de filtros */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffffff", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Clase / Familia:</span>
          <select
            className="input-base"
            value={filtroClase}
            onChange={(e) => setFiltroClase(e.target.value)}
            style={{ fontSize: 12, padding: "5px 12px" }}
          >
            {CLASES_CATALOGO.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          className="input-base"
          placeholder="Buscar atributo por etiqueta o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ fontSize: 12, padding: "6px 12px", width: 280 }}
        />
      </div>

      {/* Tabla de atributos técnicos */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
              <th style={{ padding: "8px 10px" }}>Etiqueta</th>
              <th style={{ padding: "8px 10px" }}>Código</th>
              <th style={{ padding: "8px 10px" }}>Clase</th>
              <th style={{ padding: "8px 10px" }}>Tipo de Dato</th>
              <th style={{ padding: "8px 10px" }}>Obligatorio</th>
              <th style={{ padding: "8px 10px", textAlign: "center" }}>Único</th>
              <th style={{ padding: "8px 10px", textAlign: "center" }}>Sensible</th>
              <th style={{ padding: "8px 10px", textAlign: "center" }}>Protegido (RFC)</th>
              <th style={{ padding: "8px 10px", textAlign: "center" }}>En Incidentes</th>
              <th style={{ padding: "8px 10px", textAlign: "right" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {atributosFiltrados.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 10px", fontWeight: 700, color: "#1e293b" }}>{a.etiqueta}</td>
                <td style={{ padding: "8px 10px", fontFamily: "monospace", color: "#64748b" }}>{a.codigo}</td>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, backgroundColor: "#f1f5f9", fontWeight: 600 }}>
                    {a.clase_id}
                  </span>
                </td>
                <td style={{ padding: "8px 10px", color: "#0369a1" }}>{a.tipo_dato}</td>
                <td style={{ padding: "8px 10px" }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 4,
                      backgroundColor: a.obligatorio === "siempre" ? "#fef3c7" : "#f1f5f9",
                      color: a.obligatorio === "siempre" ? "#92400e" : "#475569"
                    }}
                  >
                    {a.obligatorio}
                  </span>
                </td>
                <td style={{ padding: "8px 10px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={a.unico}
                    disabled={bloqueado}
                    onChange={() => toggleBooleano(a.id, "unico")}
                  />
                </td>
                <td style={{ padding: "8px 10px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={a.sensible}
                    disabled={bloqueado}
                    onChange={() => toggleBooleano(a.id, "sensible")}
                  />
                </td>
                <td style={{ padding: "8px 10px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={a.protegido}
                    disabled={bloqueado}
                    onChange={() => toggleBooleano(a.id, "protegido")}
                  />
                </td>
                <td style={{ padding: "8px 10px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={a.aparece_en_incidentes}
                    disabled={bloqueado}
                    onChange={() => toggleBooleano(a.id, "aparece_en_incidentes")}
                  />
                </td>
                <td style={{ padding: "8px 10px", textAlign: "right" }}>
                  <button
                    type="button"
                    className="boton-mini"
                    disabled={bloqueado}
                    onClick={() => eliminarAtributo(a.id)}
                    style={{ fontSize: 11, color: "#ef4444" }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {atributosFiltrados.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: 16, textAlign: "center", color: "#94a3b8" }}>
                  No se encontraron atributos con los criterios indicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Creador de nuevo atributo */}
      {!bloqueado && (
        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px 0", color: "#0f172a" }}>
            Agregar Nuevo Atributo Técnico Parametrizado
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                Etiqueta Visible *
              </label>
              <input
                type="text"
                className="input-base"
                placeholder="Ej. Dirección IP Secundaria"
                value={nuevoEtiqueta}
                onChange={(e) => setNuevoEtiqueta(e.target.value)}
                style={{ fontSize: 12, width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                Código Interno (snake_case) *
              </label>
              <input
                type="text"
                className="input-base"
                placeholder="ip_secundaria"
                value={nuevoCodigo}
                onChange={(e) => setNuevoCodigo(e.target.value)}
                style={{ fontSize: 12, width: "100%" }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                Clase Destino *
              </label>
              <select
                className="input-base"
                value={nuevoClase}
                onChange={(e) => setNuevoClase(e.target.value)}
                style={{ fontSize: 12, width: "100%" }}
              >
                <option value="hardware">Hardware</option>
                <option value="red">Equipos de Red</option>
                <option value="software">Software</option>
                <option value="base_datos">Base de Datos</option>
                <option value="infraestructura_virtual">Infraestructura Virtual</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                Tipo de Dato *
              </label>
              <select
                className="input-base"
                value={nuevoTipoDato}
                onChange={(e) => setNuevoTipoDato(e.target.value)}
                style={{ fontSize: 12, width: "100%" }}
              >
                <option value="texto_corto">Texto corto</option>
                <option value="texto_largo">Texto largo</option>
                <option value="entero">Entero</option>
                <option value="decimal">Decimal</option>
                <option value="fecha">Fecha</option>
                <option value="ip">Dirección IP</option>
                <option value="mac">Dirección MAC</option>
                <option value="lista">Lista seleccionable</option>
                <option value="archivo">Archivo / Evidencia</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                Obligatoriedad
              </label>
              <select
                className="input-base"
                value={nuevoObligatorio}
                onChange={(e) => setNuevoObligatorio(e.target.value as any)}
                style={{ fontSize: 12, width: "100%" }}
              >
                <option value="no">Opcional</option>
                <option value="siempre">Siempre obligatorio</option>
                <option value="segun_estado">Obligatorio según estado</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
              <input type="checkbox" checked={nuevoUnico} onChange={(e) => setNuevoUnico(e.target.checked)} />
              <span>Valor único</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
              <input type="checkbox" checked={nuevoSensible} onChange={(e) => setNuevoSensible(e.target.checked)} />
              <span>Sensible (Cifrado y enmascarado)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
              <input type="checkbox" checked={nuevoProtegido} onChange={(e) => setNuevoProtegido(e.target.checked)} />
              <span>Protegido (Requiere RFC)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
              <input type="checkbox" checked={nuevoIncidentes} onChange={(e) => setNuevoIncidentes(e.target.checked)} />
              <span>Visible en selector de incidentes</span>
            </label>
          </div>

          <button
            type="button"
            className="boton-principal"
            onClick={agregarAtributo}
            style={{ fontSize: 12, padding: "8px 18px" }}
          >
            Guardar Atributo
          </button>
        </div>
      )}
    </div>
  );
}
