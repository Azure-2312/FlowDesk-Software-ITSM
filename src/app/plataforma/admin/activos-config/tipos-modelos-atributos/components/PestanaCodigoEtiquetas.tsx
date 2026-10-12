"use client";

import React, { useState } from "react";

interface ConfiguracionEtiquetas {
  formato_codigo?: string;
  alcance_correlativo?: "global" | "por_clase" | "por_tipo" | "por_anio";
  reinicio_anual?: boolean;
  longitud_correlativo?: number;
  separador?: string;
  simbolo_etiqueta?: "qr" | "barras" | "ambos";
  contenido_qr?: "enlace_ficha" | "solo_codigo";
  tamano_etiqueta?: string;
  mostrar_logo?: boolean;
  mostrar_codigo?: boolean;
  mostrar_nombre?: boolean;
  mostrar_tipo?: boolean;
  mostrar_ubicacion?: boolean;
}

interface Props {
  datos: ConfiguracionEtiquetas;
  onChange: (nuevosDatos: any) => void;
  bloqueado: boolean;
}

export function PestanaCodigoEtiquetas({ datos, onChange, bloqueado }: Props) {
  const cfg = datos || {};
  const [prefijoPrueba, setPrefijoPrueba] = useState("LAP");
  const [ejemplosGenerados, setEjemplosGenerados] = useState<string[]>([]);

  const actualizar = (clave: keyof ConfiguracionEtiquetas, valor: any) => {
    if (bloqueado) return;
    onChange({ ...cfg, [clave]: valor });
  };

  const generarEjemplos = () => {
    const anio = new Date().getFullYear();
    const len = cfg.longitud_correlativo || 6;
    const sep = cfg.separador !== undefined ? cfg.separador : "-";
    const ejemplos = [];
    for (let i = 1; i <= 5; i++) {
      const corr = String(i * 123).padStart(len, "0");
      ejemplos.push(`${prefijoPrueba}${sep}${anio}${sep}${corr}`);
    }
    setEjemplosGenerados(ejemplos);
  };

  const codigoMuestra = `${prefijoPrueba}-${new Date().getFullYear()}-000123`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Columna Izquierda: Formato de Código */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px 0", color: "#0f172a" }}>
          Nomenclatura y Secuencias de Código
        </h3>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px 0" }}>
          El código del activo es un identificador patrimonial único e inmutable que no se reutiliza ni tras la baja.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
              Patrón de Formato
            </label>
            <input
              type="text"
              className="input-base"
              value={cfg.formato_codigo || "{PREFIJO_TIPO}-{AAAA}-{CORRELATIVO:6}"}
              disabled={bloqueado}
              onChange={(e) => actualizar("formato_codigo", e.target.value)}
              style={{ width: "100%", fontSize: 13, fontFamily: "monospace" }}
            />
            <span style={{ fontSize: 11, color: "#64748b", display: "block", marginTop: 4 }}>
              Fichas disponibles: <code>{"{PREFIJO_TIPO}"}</code>, <code>{"{PREFIJO_CLASE}"}</code>, <code>{"{AAAA}"}</code>, <code>{"{CORRELATIVO:n}"}</code>
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
                Alcance del Correlativo
              </label>
              <select
                className="input-base"
                value={cfg.alcance_correlativo || "por_tipo"}
                disabled={bloqueado}
                onChange={(e) => actualizar("alcance_correlativo", e.target.value)}
                style={{ width: "100%", fontSize: 12 }}
              >
                <option value="global">Secuencia Global</option>
                <option value="por_clase">Por Clase de Activo</option>
                <option value="por_tipo">Por Tipo de Activo</option>
                <option value="por_anio">Por Año</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
                Dígitos del Correlativo
              </label>
              <input
                type="number"
                min={3}
                max={10}
                className="input-base"
                value={cfg.longitud_correlativo || 6}
                disabled={bloqueado}
                onChange={(e) => actualizar("longitud_correlativo", parseInt(e.target.value, 10) || 6)}
                style={{ width: "100%", fontSize: 12 }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={cfg.reinicio_anual || false}
                disabled={bloqueado}
                onChange={(e) => actualizar("reinicio_anual", e.target.checked)}
              />
              <span>Reiniciar correlativo a 1 al inicio de cada año fiscal</span>
            </label>
          </div>

          <div style={{ marginTop: 12, padding: 14, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>Simulador de Códigos</span>
              <button
                type="button"
                className="boton-mini"
                onClick={generarEjemplos}
                style={{ fontSize: 11 }}
              >
                Probar Formato
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>Prefijo prueba:</span>
              <input
                type="text"
                className="input-base"
                value={prefijoPrueba}
                onChange={(e) => setPrefijoPrueba(e.target.value.toUpperCase())}
                style={{ width: 80, fontSize: 11, padding: "2px 6px" }}
              />
            </div>
            {ejemplosGenerados.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {ejemplosGenerados.map((ej, idx) => (
                  <code key={idx} style={{ fontSize: 12, color: "#0369a1", backgroundColor: "#ffffff", padding: "3px 8px", borderRadius: 4, border: "1px solid #e2e8f0" }}>
                    {ej}
                  </code>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
                Presione &quot;Probar Formato&quot; para generar 5 muestras con la regla actual.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Plantilla de Etiquetas Físicas */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px 0", color: "#0f172a" }}>
          Etiquetas Físicas e Identificación QR
        </h3>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px 0" }}>
          Diseño e impresión de marbetes patrimoniales adhesivos con código de barras y QR para inventario móvil.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
                Símbolo Impreso
              </label>
              <select
                className="input-base"
                value={cfg.simbolo_etiqueta || "ambos"}
                disabled={bloqueado}
                onChange={(e) => actualizar("simbolo_etiqueta", e.target.value)}
                style={{ width: "100%", fontSize: 12 }}
              >
                <option value="qr">Solo Código QR</option>
                <option value="barras">Solo Código de Barras (Code 128)</option>
                <option value="ambos">QR y Código de Barras</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
                Contenido del QR
              </label>
              <select
                className="input-base"
                value={cfg.contenido_qr || "enlace_ficha"}
                disabled={bloqueado}
                onChange={(e) => actualizar("contenido_qr", e.target.value)}
                style={{ width: "100%", fontSize: 12 }}
              >
                <option value="enlace_ficha">Enlace directo a ficha web</option>
                <option value="solo_codigo">Solo código patrimonial</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
              Dimensiones de Etiqueta (Ancho x Alto mm)
            </label>
            <select
              className="input-base"
              value={cfg.tamano_etiqueta || "50x25"}
              disabled={bloqueado}
              onChange={(e) => actualizar("tamano_etiqueta", e.target.value)}
              style={{ width: "100%", fontSize: 12 }}
            >
              <option value="50x25">Estándar ITAM (50 x 25 mm)</option>
              <option value="60x30">Mediana Rack / Servidores (60 x 30 mm)</option>
              <option value="40x20">Compacta Periféricos (40 x 20 mm)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
              Campos Visibles en Etiqueta
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
                <input
                  type="checkbox"
                  checked={cfg.mostrar_logo ?? true}
                  disabled={bloqueado}
                  onChange={(e) => actualizar("mostrar_logo", e.target.checked)}
                />
                <span>Logo corporativo</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
                <input
                  type="checkbox"
                  checked={cfg.mostrar_codigo ?? true}
                  disabled={bloqueado}
                  onChange={(e) => actualizar("mostrar_codigo", e.target.checked)}
                />
                <span>Código en texto legible</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
                <input
                  type="checkbox"
                  checked={cfg.mostrar_nombre ?? true}
                  disabled={bloqueado}
                  onChange={(e) => actualizar("mostrar_nombre", e.target.checked)}
                />
                <span>Nombre de equipo</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
                <input
                  type="checkbox"
                  checked={cfg.mostrar_tipo ?? true}
                  disabled={bloqueado}
                  onChange={(e) => actualizar("mostrar_tipo", e.target.checked)}
                />
                <span>Tipo de activo</span>
              </label>
            </div>
          </div>

          {/* Maqueta en vivo de la etiqueta */}
          <div style={{ marginTop: 10, padding: 16, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #cbd5e1" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Vista Previa de Etiqueta Impresa
            </span>
            <div
              style={{
                width: "280px",
                height: "120px",
                backgroundColor: "#ffffff",
                border: "2px solid #0f172a",
                borderRadius: 4,
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                {cfg.mostrar_logo && (
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#2563eb", letterSpacing: 0.5 }}>
                    ITSM INSTITUCIONAL
                  </span>
                )}
                {cfg.mostrar_codigo && (
                  <strong style={{ fontSize: 13, fontFamily: "monospace", color: "#0f172a" }}>
                    {codigoMuestra}
                  </strong>
                )}
                {cfg.mostrar_nombre && (
                  <span style={{ fontSize: 10, color: "#334155" }}>
                    ThinkPad X1 Carbon
                  </span>
                )}
                {cfg.mostrar_tipo && (
                  <span style={{ fontSize: 9, color: "#64748b" }}>
                    Laptop Corporativa
                  </span>
                )}
              </div>

              {/* Simulación vectorial de QR */}
              <div
                style={{
                  width: 58,
                  height: 58,
                  border: "1px solid #0f172a",
                  padding: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#ffffff"
                }}
              >
                <svg viewBox="0 0 24 24" width="50" height="50" fill="#0f172a">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v4h-2v-4zm-4-4h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-2 4h2v2h-2v-2zm2 2h2v2h-2v-2zm-4-2h2v2h-2v-2z" />
                </svg>
              </div>
            </div>

            <div style={{ marginTop: 12, textAlign: "right" }}>
              <button
                type="button"
                className="boton-secundario"
                onClick={() => window.print()}
                style={{ fontSize: 11 }}
              >
                Imprimir Lote de Prueba
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
