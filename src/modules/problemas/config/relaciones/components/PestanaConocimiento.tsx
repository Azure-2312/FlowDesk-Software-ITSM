"use client";

import React, { useState } from "react";

interface ConfigConocimiento {
  generar_al_publicar_ke: boolean;
  generar_al_resolver: boolean;
  generar_al_cerrar: boolean;
  solo_manual: boolean;
  tipo_articulo_por_evento: {
    publicar_ke?: string;
    resolver?: string;
    cerrar?: string;
  };
  plantilla_mapeo: {
    sintomas?: string;
    causa?: string;
    workaround?: string;
    solucion?: string;
    servicios_ci?: string;
    referencia?: string;
    palabras_clave?: string;
  };
  audiencia_defecto: string;
  id_categoria_defecto: number;
  responsable_revision: string;
  articulo_obligatorio_para_cerrar: boolean;
  excepciones_codigos_cierre: string[];
  estado_inicial_borrador: string;
}

interface Props {
  config: ConfigConocimiento;
  onChange: (nuevaConfig: ConfigConocimiento) => void;
  onMarcarModificado: () => void;
}

export function PestanaConocimiento({ config, onChange, onMarcarModificado }: Props) {
  const [modalVistaPrevia, setModalVistaPrevia] = useState(false);

  function actualizar(campo: keyof ConfigConocimiento, valor: any) {
    onChange({ ...config, [campo]: valor });
    onMarcarModificado();
  }

  const codigosCierreExcepcion = [
    "Cerrado – no reproducible",
    "Cerrado – duplicado",
    "Cerrado – responsabilidad de tercero",
    "Cerrado – riesgo aceptado (requiere aprobación)"
  ];

  function toggleExcepcion(cod: string) {
    const actuales = config.excepciones_codigos_cierre || [];
    const actualizados = actuales.includes(cod)
      ? actuales.filter((c) => c !== cod)
      : [...actuales, cod];
    actualizar("excepciones_codigos_cierre", actualizados);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#0f172a" }}>
          1.3.4.3.5 Conocimiento (Knowledge Management)
        </h2>
        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
          Automatiza la generación de artículos de la base de conocimiento (KEDB/KB) a partir del ciclo de vida de los problemas para capitalizar lecciones aprendidas y soluciones comprobadas.
        </p>
      </div>

      {/* DISPARADORES DE GENERACIÓN DE ARTÍCULOS */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Disparadores Automáticos de Artículos de Conocimiento
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.generar_al_publicar_ke ?? true}
              onChange={(e) => actualizar("generar_al_publicar_ke", e.target.checked)}
            />
            <span>Generar borrador al <strong>Publicar Error Conocido</strong> (Tipo: Workaround)</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.generar_al_resolver ?? true}
              onChange={(e) => actualizar("generar_al_resolver", e.target.checked)}
            />
            <span>Generar borrador al <strong>Resolver el Problema</strong> (Tipo: Solución definitiva)</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.generar_al_cerrar ?? false}
              onChange={(e) => actualizar("generar_al_cerrar", e.target.checked)}
            />
            <span>Generar borrador al <strong>Cerrar el Problema</strong> (Tipo: Guía de resolución)</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.solo_manual ?? false}
              onChange={(e) => actualizar("solo_manual", e.target.checked)}
            />
            <span>Desactivar disparadores automáticos (Solo permitir generación manual)</span>
          </label>
        </div>
      </div>

      {/* PLANTILLA Y MAPEO DE CAMPOS DEL PROBLEMA */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: 0, color: "#1e293b" }}>
              Mapeo de Secciones del Artículo de Conocimiento
            </h3>
            <p style={{ margin: "2px 0 0 0", color: "#64748b", fontSize: 12.5 }}>
              Estructura normalizada en la base de conocimiento según la información investigada en el ticket.
            </p>
          </div>
          <button
            type="button"
            className="boton-secundario"
            style={{ width: "auto", padding: "4px 12px", fontSize: 12 }}
            onClick={() => setModalVistaPrevia(true)}
          >
            Vista previa con problema real
          </button>
        </div>

        <div className="contenedor-tabla">
          <table className="tabla" style={{ fontSize: 12.5 }}>
            <thead>
              <tr>
                <th>Sección del Artículo</th>
                <th style={{ width: 40, textAlign: "center" }}>←</th>
                <th>Campo Fuente del Problema</th>
                <th>Descripción de Contenido</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Síntomas Detectados</strong></td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>←</td>
                <td><code>Descripción inicial y patrones observados</code></td>
                <td style={{ color: "#64748b" }}>Transfiere la sintomatología y manifestaciones de falla</td>
              </tr>
              <tr>
                <td><strong>Causa Raíz Diagnosticada</strong></td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>←</td>
                <td><code>Causa raíz y método de análisis</code></td>
                <td style={{ color: "#64748b" }}>Documenta el origen técnico verificado</td>
              </tr>
              <tr>
                <td><strong>Solución Temporal (Workaround)</strong></td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>←</td>
                <td><code>Procedimiento de Workaround</code></td>
                <td style={{ color: "#64748b" }}>Instrucciones paso a paso para sortear el fallo</td>
              </tr>
              <tr>
                <td><strong>Solución Permanente Definitiva</strong></td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>←</td>
                <td><code>Solución permanente / RFC</code></td>
                <td style={{ color: "#64748b" }}>Acción correctiva implementada</td>
              </tr>
              <tr>
                <td><strong>Servicios y Activos Afectados</strong></td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>←</td>
                <td><code>Lista de CI y Servicios</code></td>
                <td style={{ color: "#64748b" }}>Etiquetas y metadatos de configuración CMDB</td>
              </tr>
              <tr>
                <td><strong>Trazabilidad y Referencia</strong></td>
                <td style={{ textAlign: "center", color: "#3b82f6" }}>←</td>
                <td><code>Vínculo institucional al problema</code></td>
                <td style={{ color: "#64748b" }}>Enlace permanente PRB-xxxxxx</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* GOBERNANZA DE REVISIÓN Y OBLIGATORIEDAD DE CIERRE */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Gobernanza de Revisión y Requisitos de Cierre
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="campo">
            <label>Responsable de Revisión del Artículo</label>
            <select
              className="input-base"
              value={config.responsable_revision || "responsable_categoria"}
              onChange={(e) => actualizar("responsable_revision", e.target.value)}
            >
              <option value="responsable_categoria">Responsable de la categoría de conocimiento (1.7.1)</option>
              <option value="autor_problema">Especialista que diagnosticó el problema</option>
              <option value="gestor_problemas">Gestor de Problemas institucional</option>
            </select>
          </div>

          <div className="campo">
            <label>Estado Inicial del Artículo Generado</label>
            <input
              type="text"
              className="input-base"
              value="Borrador"
              disabled
              style={{ backgroundColor: "#f8fafc", color: "#64748b" }}
            />
            <span style={{ fontSize: 11, color: "#64748b" }}>Requiere revisión formal antes de pasar a Publicado</span>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.articulo_obligatorio_para_cerrar ?? false}
              onChange={(e) => actualizar("articulo_obligatorio_para_cerrar", e.target.checked)}
            />
            <span>
              <strong>¿Es obligatorio publicar un artículo de conocimiento para autorizar el cierre del problema?</strong>
            </span>
          </label>
        </div>

        {config.articulo_obligatorio_para_cerrar && (
          <div style={{ backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
              Excepciones permitidas sin exigencia de artículo (Casillas por código de cierre):
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {codigosCierreExcepcion.map((cod) => (
                <label key={cod} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={(config.excepciones_codigos_cierre || []).includes(cod)}
                    onChange={() => toggleExcepcion(cod)}
                  />
                  <span>{cod}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE VISTA PREVIA DEL ARTÍCULO */}
      {modalVistaPrevia && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            maxWidth: 650,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: 24,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px 0", color: "#0f172a" }}>
              Vista Previa: Borrador Generado en Base de Conocimiento (KB)
            </h3>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, backgroundColor: "#fafafa" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0284c7", textTransform: "uppercase", marginBottom: 4 }}>
                Borrador KB · Origen: PRB-000412
              </div>
              <h4 style={{ margin: "0 0 12px 0", fontSize: 16, color: "#0f172a" }}>
                Solución Permanente: Desbordamiento de Cola de Impresión en Servidor Spooler
              </h4>

              <div style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: 12, color: "#475569" }}>1. Síntomas Observados:</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#334155" }}>
                  Impresoras térmicas de almacén dejan de responder y los trabajos quedan en estado 'Enviando a cola'.
                </p>
              </div>

              <div style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: 12, color: "#475569" }}>2. Causa Raíz Comprobada:</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#334155" }}>
                  Fallo de memoria en el driver v6.2 no liberaba los handles de subproceso RPC.
                </p>
              </div>

              <div style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: 12, color: "#475569" }}>3. Solución Temporal / Workaround:</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#334155" }}>
                  Ejecutar el script programado de limpieza de colas Spooler mediante PowerShell.
                </p>
              </div>

              <div>
                <strong style={{ fontSize: 12, color: "#475569" }}>4. Solución Definitiva Implementada:</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: 12.5, color: "#334155" }}>
                  Actualización a paquete de controladores v6.8 y migración a protocolo TCP Raw 9100.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                type="button"
                className="boton-primario"
                style={{ width: "auto", padding: "6px 18px", fontSize: 13 }}
                onClick={() => setModalVistaPrevia(false)}
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
