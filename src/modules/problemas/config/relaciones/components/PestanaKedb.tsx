"use client";

import React, { useState } from "react";

interface ConfigKedb {
  req_workaround: boolean;
  req_sintomas: boolean;
  req_servicio_ci: boolean;
  req_causa_raiz: boolean;
  req_instrucciones_paso_paso: boolean;
  req_aprobacion_gestor: boolean;
  perfil_aprobador: number;
  estados_ciclo: string[];
  publicacion_directa_perfiles: number[];
  revision_periodica_meses: number;
  recordatorio_dias_antes: number;
  pasar_a_revision_si_vence: boolean;
  retiro_automatico_solucion_permanente: boolean;
  audiencia_mesa_servicio: boolean;
  audiencia_tecnicos_todos: boolean;
  audiencia_tecnicos_grupo: boolean;
  audiencia_autoservicio_portal: boolean;
  sugerir_ke_en_incidente: boolean;
  peso_servicio: number;
  peso_categoria: number;
  peso_ci: number;
  peso_clase_ci: number;
  peso_palabras_titulo: number;
  peso_palabras_descripcion: number;
  umbral_minimo_coincidencia: number;
  maximo_sugerencias: number;
  campos_ke: any[];
}

interface Props {
  config: ConfigKedb;
  onChange: (nuevaConfig: ConfigKedb) => void;
  onMarcarModificado: () => void;
}

export function PestanaKedb({ config, onChange, onMarcarModificado }: Props) {
  const [modalProbarAbierto, setModalProbarAbierto] = useState(false);
  const [modalCamposAbierto, setModalCamposAbierto] = useState(false);

  // Formulario de prueba
  const [pruebaTitulo, setPruebaTitulo] = useState("Lentitud en impresión y trabajos pendientes en spooler");
  const [pruebaDesc, setPruebaDesc] = useState("Los usuarios de administración no pueden imprimir facturas.");
  const [resultadoPrueba, setResultadoPrueba] = useState<any[] | null>(null);
  const [probando, setProbando] = useState(false);

  function actualizar(campo: keyof ConfigKedb, valor: any) {
    onChange({ ...config, [campo]: valor });
    onMarcarModificado();
  }

  async function ejecutarPrueba() {
    setProbando(true);
    try {
      const res = await fetch("/api/problemas/configuracion/relaciones/kedb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "probar_coincidencia",
          prueba: {
            titulo: pruebaTitulo,
            descripcion: pruebaDesc,
            id_servicio: 1,
            texto_ci: "SRV-PRINT-01"
          }
        })
      });
      const data = await res.json();
      if (data.ok) {
        setResultadoPrueba(data.sugerencias || []);
      }
    } catch {
      // Ignorar error
    } finally {
      setProbando(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#0f172a" }}>
          1.3.4.3.3 Errores conocidos (KEDB - Known Error Database)
        </h2>
        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
          Gobierna los criterios de calidad para catalogar un error conocido, su ciclo de vida, vigencia de workarounds y el motor semántico de sugerencia para la mesa de ayuda.
        </p>
      </div>

      {/* BLOQUE 1: REQUISITOS DE PROMOCIÓN A KE */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Bloque 1 — Requisitos de Promoción (Checklist Obligatorio)
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.req_workaround ?? true}
              onChange={(e) => actualizar("req_workaround", e.target.checked)}
            />
            <span>Workaround descrito con claridad (Requerido de fábrica)</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.req_sintomas ?? true}
              onChange={(e) => actualizar("req_sintomas", e.target.checked)}
            />
            <span>Síntomas y patrones de detección documentados</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.req_servicio_ci ?? true}
              onChange={(e) => actualizar("req_servicio_ci", e.target.checked)}
            />
            <span>Servicio de TI y/o Elemento de Configuración (CI) asignado</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.req_causa_raiz ?? false}
              onChange={(e) => actualizar("req_causa_raiz", e.target.checked)}
            />
            <span>
              Causa raíz identificada (<em>Opcional en ITIL: admite KE provisional sin causa final</em>)
            </span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.req_instrucciones_paso_paso ?? true}
              onChange={(e) => actualizar("req_instrucciones_paso_paso", e.target.checked)}
            />
            <span>Instrucciones de mitigación paso a paso</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.req_aprobacion_gestor ?? true}
              onChange={(e) => actualizar("req_aprobacion_gestor", e.target.checked)}
            />
            <span>Aprobación formal del Gestor de Problemas para publicar</span>
          </label>
        </div>
      </div>

      {/* BLOQUE 2: CICLO DE VIDA Y REVISIÓN PERIÓDICA */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Bloque 2 — Ciclo de Vida y Gobierno de Calidad
        </h3>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>Estados requeridos:</span>
          {(config.estados_ciclo || ["Borrador", "En revisión", "Publicado", "Retirado"]).map((st, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: i === 2 ? "#dcfce7" : i === 3 ? "#fee2e2" : "#f1f5f9",
                color: i === 2 ? "#15803d" : i === 3 ? "#b91c1c" : "#334155"
              }}
            >
              {st} {i < 3 ? "→" : ""}
            </span>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
          <div className="campo">
            <label>Periodicidad de Revisión de Validez (Meses)</label>
            <input
              type="number"
              min={1}
              max={36}
              className="input-base"
              value={config.revision_periodica_meses || 6}
              onChange={(e) => actualizar("revision_periodica_meses", parseInt(e.target.value, 10) || 6)}
            />
            <span style={{ fontSize: 11, color: "#64748b" }}>Valor estándar: 6 meses</span>
          </div>

          <div className="campo">
            <label>Anticipación de Alerta de Vencimiento (Días)</label>
            <input
              type="number"
              min={1}
              max={60}
              className="input-base"
              value={config.recordatorio_dias_antes || 15}
              onChange={(e) => actualizar("recordatorio_dias_antes", parseInt(e.target.value, 10) || 15)}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.pasar_a_revision_si_vence ?? true}
              onChange={(e) => actualizar("pasar_a_revision_si_vence", e.target.checked)}
            />
            <span>Pasar a estado <strong>"En revisión"</strong> automáticamente si vence el plazo sin renovación</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.retiro_automatico_solucion_permanente ?? true}
              onChange={(e) => actualizar("retiro_automatico_solucion_permanente", e.target.checked)}
            />
            <span>Retirar automáticamente el error conocido al implementar con éxito la solución definitiva</span>
          </label>
        </div>
      </div>

      {/* BLOQUE 3 Y 4: AUDIENCIA Y MOTOR DE COINCIDENCIA */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Bloques 3 y 4 — Audiencia y Algoritmo de Sugerencia en Tickets
        </h3>

        {/* Audiencia */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
            Audiencia por Defecto de los Errores Conocidos:
          </label>
          <div style={{ display: "flex", gap: 18 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config.audiencia_mesa_servicio ?? true}
                onChange={(e) => actualizar("audiencia_mesa_servicio", e.target.checked)}
              />
              <span>Mesa de Ayuda (L1)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config.audiencia_tecnicos_todos ?? true}
                onChange={(e) => actualizar("audiencia_tecnicos_todos", e.target.checked)}
              />
              <span>Técnicos de todos los grupos</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config.audiencia_tecnicos_grupo ?? true}
                onChange={(e) => actualizar("audiencia_tecnicos_grupo", e.target.checked)}
              />
              <span>Técnicos del grupo resolutor</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config.audiencia_autoservicio_portal ?? false}
                onChange={(e) => actualizar("audiencia_autoservicio_portal", e.target.checked)}
              />
              <span>Portal de Autoservicio de Usuarios</span>
            </label>
          </div>
        </div>

        {/* Ponderación de pesos */}
        <div style={{ backgroundColor: "#f8fafc", padding: 14, borderRadius: 6, border: "1px solid #e2e8f0", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b" }}>
              Ponderación de Coincidencia Semántica (Pesos 1 al 5):
            </span>
            <button
              type="button"
              className="boton-secundario"
              style={{ width: "auto", padding: "4px 10px", fontSize: 12 }}
              onClick={() => {
                setModalProbarAbierto(true);
                ejecutarPrueba();
              }}
            >
              Probar Coincidencia
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>
                Elemento de Configuración (CI): <strong>{config.peso_ci || 5}</strong>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={config.peso_ci || 5}
                onChange={(e) => actualizar("peso_ci", parseInt(e.target.value, 10))}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>
                Palabras Clave en Título: <strong>{config.peso_palabras_titulo || 4}</strong>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={config.peso_palabras_titulo || 4}
                onChange={(e) => actualizar("peso_palabras_titulo", parseInt(e.target.value, 10))}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>
                Servicio Afectado: <strong>{config.peso_servicio || 4}</strong>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={config.peso_servicio || 4}
                onChange={(e) => actualizar("peso_servicio", parseInt(e.target.value, 10))}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>
                Palabras en Síntomas / Descripción: <strong>{config.peso_palabras_descripcion || 3}</strong>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={config.peso_palabras_descripcion || 3}
                onChange={(e) => actualizar("peso_palabras_descripcion", parseInt(e.target.value, 10))}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>
                Categoría del Incidente: <strong>{config.peso_categoria || 3}</strong>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={config.peso_categoria || 3}
                onChange={(e) => actualizar("peso_categoria", parseInt(e.target.value, 10))}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, color: "#64748b", display: "block" }}>
                Clase de Activo / CI: <strong>{config.peso_clase_ci || 2}</strong>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={config.peso_clase_ci || 2}
                onChange={(e) => actualizar("peso_clase_ci", parseInt(e.target.value, 10))}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="campo">
            <label>Umbral Mínimo de Coincidencia para Sugerir (%)</label>
            <input
              type="number"
              min={10}
              max={100}
              className="input-base"
              value={config.umbral_minimo_coincidencia || 60}
              onChange={(e) => actualizar("umbral_minimo_coincidencia", parseInt(e.target.value, 10) || 60)}
            />
          </div>

          <div className="campo">
            <label>Tope Máximo de Sugerencias Simultáneas</label>
            <input
              type="number"
              min={1}
              max={10}
              className="input-base"
              value={config.maximo_sugerencias || 5}
              onChange={(e) => actualizar("maximo_sugerencias", parseInt(e.target.value, 10) || 5)}
            />
          </div>
        </div>
      </div>

      {/* BLOQUE 5: CAMPOS DEL REGISTRO KEDB */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: 0, color: "#1e293b" }}>
              Bloque 5 — Estructura de Campos del Registro de Error Conocido
            </h3>
            <p style={{ margin: "2px 0 0 0", color: "#64748b", fontSize: 12.5 }}>
              Campos normativos que componen la ficha del KEDB.
            </p>
          </div>
          <button
            type="button"
            className="boton-primario"
            style={{ width: "auto", padding: "6px 14px", fontSize: 12.5 }}
            onClick={() => setModalCamposAbierto(true)}
          >
            Configurar campos del KE...
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(config.campos_ke || []).map((c: any, i: number) => (
            <span
              key={i}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                fontSize: 12,
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                color: "#334155",
                fontWeight: 500
              }}
            >
              {c.nombre} {c.obligatorio ? <strong style={{ color: "#e11d48" }}>*</strong> : ""}
            </span>
          ))}
        </div>
      </div>

      {/* MODAL DE PROBAR COINCIDENCIA */}
      {modalProbarAbierto && (
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
            maxWidth: 700,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: 24,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px 0", color: "#0f172a" }}>
              Simulador de Coincidencia de Errores Conocidos
            </h3>

            <div className="campo" style={{ marginBottom: 12 }}>
              <label>Título de Incidente de Prueba</label>
              <input
                type="text"
                className="input-base"
                value={pruebaTitulo}
                onChange={(e) => setPruebaTitulo(e.target.value)}
              />
            </div>

            <div className="campo" style={{ marginBottom: 14 }}>
              <label>Descripción / Síntomas del Incidente</label>
              <textarea
                className="input-base"
                rows={2}
                value={pruebaDesc}
                onChange={(e) => setPruebaDesc(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button
                type="button"
                className="boton-primario"
                style={{ width: "auto", padding: "6px 16px", fontSize: 13 }}
                onClick={ejecutarPrueba}
                disabled={probando}
              >
                {probando ? "Calculando..." : "Evaluar Coincidencia"}
              </button>
            </div>

            {resultadoPrueba && (
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>
                  Errores Conocidos Sugeridos (Umbral mínimo: {config.umbral_minimo_coincidencia}%):
                </div>
                {resultadoPrueba.length === 0 ? (
                  <div style={{ color: "#64748b", fontSize: 12.5, textAlign: "center", padding: "14px 0" }}>
                    Ningún error conocido alcanzó el porcentaje mínimo de coincidencia.
                  </div>
                ) : (
                  resultadoPrueba.map((ke: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: 12,
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        marginBottom: 10,
                        backgroundColor: ke.supera_umbral ? "#f0fdf4" : "#f8fafc"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                          [{ke.id_ke}] {ke.titulo}
                        </span>
                        <strong style={{ color: ke.supera_umbral ? "#16a34a" : "#ca8a04", fontSize: 13 }}>
                          {ke.porcentaje_coincidencia}% coincidencia
                        </strong>
                      </div>
                      <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>
                        <strong>Workaround:</strong> {ke.workaround}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "6px 16px", fontSize: 13 }}
                onClick={() => setModalProbarAbierto(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CAMPOS DEL KE */}
      {modalCamposAbierto && (
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
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px 0", color: "#0f172a" }}>
              Editor de Campos de la Ficha de Error Conocido
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: 12.5, color: "#64748b" }}>
              Define la obligatoriedad y presencia de cada atributo en el catálogo KEDB.
            </p>

            <table className="tabla" style={{ fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Etiqueta / Nombre</th>
                  <th>Tipo de Dato</th>
                  <th style={{ textAlign: "center" }}>Obligatorio</th>
                </tr>
              </thead>
              <tbody>
                {(config.campos_ke || []).map((c: any, i: number) => (
                  <tr key={i}>
                    <td><code>{c.codigo}</code></td>
                    <td><strong>{c.nombre}</strong></td>
                    <td style={{ color: "#64748b" }}>{c.tipo}</td>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={c.obligatorio}
                        onChange={(e) => {
                          const nuevos = [...config.campos_ke];
                          nuevos[i] = { ...nuevos[i], obligatorio: e.target.checked };
                          actualizar("campos_ke", nuevos);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                type="button"
                className="boton-primario"
                style={{ width: "auto", padding: "6px 18px", fontSize: 13 }}
                onClick={() => setModalCamposAbierto(false)}
              >
                Aceptar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
