"use client";

import React, { useEffect, useState } from "react";

export interface PrioridadConfigProblemas {
  usar_matriz_propia: boolean;
  permitir_prioridad_manual: boolean;
  perfiles_prioridad_manual: number[];
  recalcular_al_cambiar: boolean;
  tooltips_impacto: Record<string, string>;
  tooltips_urgencia: Record<string, string>;
}

interface PestanaPrioridadProps {
  prioridades: any[];
  celdasCompartidas: any[];
  celdasProblemas: any[];
  config: PrioridadConfigProblemas;
  puedeEditar: boolean;
  onGuardar: (config: PrioridadConfigProblemas, celdasProblemas: any[]) => void | Promise<void>;
}

const TOOLTIPS_DEFECTO: PrioridadConfigProblemas = {
  usar_matriz_propia: false,
  permitir_prioridad_manual: true,
  perfiles_prioridad_manual: [1, 10, 4],
  recalcular_al_cambiar: true,
  tooltips_impacto: {
    "1": "Baja: afecta a funciones accesorias o a un único usuario sin impacto en operaciones críticas.",
    "2": "Media: degradación parcial del rendimiento de un servicio sin paralización total.",
    "3": "Alta: afectación crítica o interrupción total de un servicio esencial o más de 100 usuarios.",
  },
  tooltips_urgencia: {
    "1": "Baja: la investigación puede programarse de forma estándar sin riesgo de recurrencia inmediata.",
    "2": "Media: existen incidentes concurrentes o riesgo de recurrencia en horas punta.",
    "3": "Alta: incidentes activos bloqueantes o compromiso de continuidad de negocio inminente.",
  },
};

// 3 = Alta, 2 = Media, 1 = Baja (orientación de la matriz institucional)
const NIVELES = [
  { valor: 3, etiqueta: "Alta" },
  { valor: 2, etiqueta: "Media" },
  { valor: 1, etiqueta: "Baja" },
];

const PERFILES_MANUAL = [
  { id: 1, nombre: "Administrador" },
  { id: 10, nombre: "Gestor de Problemas" },
  { id: 4, nombre: "Supervisor" },
  { id: 7, nombre: "Especialista de TI" },
];

const PALETA_NIVEL: Record<number, { bg: string; text: string }> = {
  1: { bg: "#fee2e2", text: "#991b1b" },
  2: { bg: "#ffedd5", text: "#9a3412" },
  3: { bg: "#fef3c7", text: "#92400e" },
  4: { bg: "#f0fdf4", text: "#166534" },
  5: { bg: "#f1f5f9", text: "#475569" },
};

export const PestanaPrioridad: React.FC<PestanaPrioridadProps> = ({
  prioridades,
  celdasCompartidas,
  celdasProblemas,
  config,
  puedeEditar,
  onGuardar,
}) => {
  const [configLocal, setConfigLocal] = useState<PrioridadConfigProblemas>({
    ...TOOLTIPS_DEFECTO,
    ...config,
    tooltips_impacto: { ...TOOLTIPS_DEFECTO.tooltips_impacto, ...(config?.tooltips_impacto || {}) },
    tooltips_urgencia: { ...TOOLTIPS_DEFECTO.tooltips_urgencia, ...(config?.tooltips_urgencia || {}) },
  });
  const [celdasLocal, setCeldasLocal] = useState<any[]>(celdasProblemas || []);
  const [guardando, setGuardando] = useState(false);

  // Sincronizar cuando el padre recarga los datos
  useEffect(() => {
    setConfigLocal({
      ...TOOLTIPS_DEFECTO,
      ...config,
      tooltips_impacto: { ...TOOLTIPS_DEFECTO.tooltips_impacto, ...(config?.tooltips_impacto || {}) },
      tooltips_urgencia: { ...TOOLTIPS_DEFECTO.tooltips_urgencia, ...(config?.tooltips_urgencia || {}) },
    });
  }, [config]);

  useEffect(() => {
    setCeldasLocal(celdasProblemas || []);
  }, [celdasProblemas]);

  const obtenerPrioridad = (id: number) => prioridades.find((p) => p.id_prioridad === id);

  const resolverCelda = (celdas: any[], nivelImpacto: number, nivelUrgencia: number) =>
    celdas.find((c) => c.nivel_impacto === nivelImpacto && c.nivel_urgencia === nivelUrgencia);

  const estiloPrioridad = (idPrioridad: number) => {
    const prioridad = obtenerPrioridad(idPrioridad);
    if (prioridad?.color) {
      return { backgroundColor: prioridad.color, color: "#ffffff" };
    }
    const c = PALETA_NIVEL[prioridad?.nivel || 3] || { bg: "#f1f5f9", text: "#334155" };
    return { backgroundColor: c.bg, color: c.text };
  };

  const etiquetaPrioridad = (idPrioridad: number) => {
    const prioridad = obtenerPrioridad(idPrioridad);
    return prioridad ? `${prioridad.codigo} - ${prioridad.nombre}` : `P${idPrioridad}`;
  };

  const actualizarCelda = (nivelImpacto: number, nivelUrgencia: number, idPrioridad: number) => {
    setCeldasLocal((prev) => {
      const existe = prev.find((c) => c.nivel_impacto === nivelImpacto && c.nivel_urgencia === nivelUrgencia);
      if (existe) {
        return prev.map((c) =>
          c.nivel_impacto === nivelImpacto && c.nivel_urgencia === nivelUrgencia ? { ...c, id_prioridad: idPrioridad } : c
        );
      }
      return [...prev, { nivel_impacto: nivelImpacto, nivel_urgencia: nivelUrgencia, id_prioridad: idPrioridad }];
    });
  };

  const manejarGuardar = async () => {
    try {
      setGuardando(true);
      await onGuardar(configLocal, celdasLocal);
    } finally {
      setGuardando(false);
    }
  };

  const renderMatriz = (celdas: any[], editable: boolean, prefijo: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "120px repeat(3, 1fr)", gap: 8, maxWidth: 680 }}>
      <div style={{ padding: 8, fontWeight: 700, fontSize: 11, color: "#64748b", textAlign: "center" }}>
        IMPACTO \ URG
      </div>
      {NIVELES.map((u) => (
        <div
          key={`${prefijo}-h-${u.valor}`}
          style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}
        >
          {u.etiqueta} (U{u.valor})
        </div>
      ))}

      {NIVELES.map((i) => (
        <React.Fragment key={`${prefijo}-fila-${i.valor}`}>
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", display: "flex", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}>
            {i.etiqueta} (I{i.valor})
          </div>
          {NIVELES.map((u) => {
            const celda = resolverCelda(celdas, i.valor, u.valor);
            if (editable) {
              return (
                <select
                  key={`${prefijo}-${i.valor}-${u.valor}`}
                  className="input-base"
                  value={celda?.id_prioridad ?? ""}
                  onChange={(e) => actualizarCelda(i.valor, u.valor, Number(e.target.value))}
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textAlign: "center",
                    padding: "8px 6px",
                    ...estiloPrioridad(celda?.id_prioridad),
                  }}
                >
                  <option value="" disabled>
                    Sin asignar
                  </option>
                  {prioridades.map((p) => (
                    <option key={p.id_prioridad} value={p.id_prioridad} style={{ color: "#0f172a", backgroundColor: "#ffffff" }}>
                      {p.codigo} - {p.nombre}
                    </option>
                  ))}
                </select>
              );
            }
            return (
              <div
                key={`${prefijo}-${i.valor}-${u.valor}`}
                style={{
                  padding: "10px 8px",
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: 12,
                  textAlign: "center",
                  border: "1px solid rgba(0,0,0,0.06)",
                  ...estiloPrioridad(celda?.id_prioridad),
                }}
              >
                {celda ? obtenerPrioridad(celda.id_prioridad)?.codigo || `P${celda.id_prioridad}` : "—"}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Aclaración ITIL 4 de Gobernanza */}
      <div
        style={{
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 8,
          padding: "14px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 18, color: "#2563eb" }}>ℹ️</span>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", margin: 0 }}>
            Principio ITIL 4: Independencia entre Prioridad Técnica y Riesgo
          </h4>
          <p style={{ fontSize: 12, color: "#1e3a8a", margin: "4px 0 0 0", lineHeight: 1.5 }}>
            La <strong>prioridad</strong> se calcula mediante la matriz institucional de <em>Impacto × Urgencia</em>{" "}
            compartida con Incidentes y Cambios. La prioridad técnica no debe confundirse con la severidad ni con la
            autoridad resolutora del problema.
          </p>
        </div>
      </div>

      {/* Matriz Compartida (solo lectura) */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span className="badge-itil" style={{ backgroundColor: "#dcfce7", color: "#166534", fontWeight: 700 }}>
            MATRIZ COMPARTIDA
          </span>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Matriz Institucional de Prioridad (Incidentes, Problemas y Cambios)
          </h4>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 14px 0" }}>
          Garantiza coherencia institucional absoluta: un problema con el mismo impacto y urgencia recibe exactamente la
          misma prioridad técnica que un incidente o cambio.
        </p>
        {renderMatriz(celdasCompartidas, false, "compartida")}
      </div>

      {/* Matriz Propia de Problemas (editable) */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span className="badge-itil" style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontWeight: 700 }}>
            MATRIZ DE PROBLEMAS
          </span>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Matriz de Prioridad de Gestión de Problemas
          </h4>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 14px 0" }}>
          Se utiliza cuando la opción "Usar matriz propia para problemas" está habilitada. Si está deshabilitada, se
          aplica la matriz compartida.
        </p>
        {renderMatriz(celdasLocal, puedeEditar, "problemas")}

        {/* Interruptor Usar Matriz Propia */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="checkbox"
            id="chk-matriz-propia-problemas"
            checked={configLocal.usar_matriz_propia}
            disabled={!puedeEditar}
            onChange={(e) => {
              if (e.target.checked) {
                if (
                  confirm(
                    "¿Desea habilitar una matriz de prioridad independiente para Problemas? Esto separará las prioridades calculadas respecto a Incidentes y Cambios."
                  )
                ) {
                  setConfigLocal({ ...configLocal, usar_matriz_propia: true });
                }
              } else {
                setConfigLocal({ ...configLocal, usar_matriz_propia: false });
              }
            }}
          />
          <label htmlFor="chk-matriz-propia-problemas" style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", cursor: "pointer" }}>
            Usar matriz propia para Gestión de Problemas (Desactivado por defecto)
          </label>
        </div>
      </div>

      {/* Opciones de Priorización */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
          Opciones de Priorización
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="checkbox"
              id="chk-prioridad-manual"
              checked={configLocal.permitir_prioridad_manual}
              disabled={!puedeEditar}
              onChange={(e) => setConfigLocal({ ...configLocal, permitir_prioridad_manual: e.target.checked })}
            />
            <label htmlFor="chk-prioridad-manual" style={{ fontSize: 12.5, color: "#1e293b", cursor: "pointer" }}>
              Permitir la modificación manual de la prioridad calculada (con trazabilidad en bitácora)
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="checkbox"
              id="chk-recalcular"
              checked={configLocal.recalcular_al_cambiar}
              disabled={!puedeEditar}
              onChange={(e) => setConfigLocal({ ...configLocal, recalcular_al_cambiar: e.target.checked })}
            />
            <label htmlFor="chk-recalcular" style={{ fontSize: 12.5, color: "#1e293b", cursor: "pointer" }}>
              Recalcular automáticamente la prioridad cuando cambien el impacto o la urgencia
            </label>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
              Perfiles autorizados a modificar la prioridad manualmente:
            </label>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {PERFILES_MANUAL.map((p) => {
                const marcado = configLocal.perfiles_prioridad_manual?.includes(p.id);
                return (
                  <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={Boolean(marcado)}
                      disabled={!puedeEditar}
                      onChange={() => {
                        const actuales = configLocal.perfiles_prioridad_manual || [];
                        const nuevos = marcado ? actuales.filter((x) => x !== p.id) : [...actuales, p.id];
                        setConfigLocal({ ...configLocal, perfiles_prioridad_manual: nuevos });
                      }}
                    />
                    {p.nombre}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Textos de Ayuda y Tooltips */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
          Textos Guía y Tooltips Específicos para el Formulario de Problema
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Tooltips de Impacto */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>Tooltips de Impacto</span>
            {[
              { key: "3", etiqueta: "Impacto Alto" },
              { key: "2", etiqueta: "Impacto Medio" },
              { key: "1", etiqueta: "Impacto Bajo" },
            ].map((t) => (
              <div key={`imp-${t.key}`}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                  {t.etiqueta}:
                </label>
                <textarea
                  className="input-base"
                  rows={2}
                  disabled={!puedeEditar}
                  value={configLocal.tooltips_impacto?.[t.key] || ""}
                  onChange={(e) =>
                    setConfigLocal({
                      ...configLocal,
                      tooltips_impacto: { ...configLocal.tooltips_impacto, [t.key]: e.target.value },
                    })
                  }
                  style={{ width: "100%", fontSize: 11.5 }}
                />
              </div>
            ))}
          </div>

          {/* Tooltips de Urgencia */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0891b2" }}>Tooltips de Urgencia</span>
            {[
              { key: "3", etiqueta: "Urgencia Alta" },
              { key: "2", etiqueta: "Urgencia Media" },
              { key: "1", etiqueta: "Urgencia Baja" },
            ].map((t) => (
              <div key={`urg-${t.key}`}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                  {t.etiqueta}:
                </label>
                <textarea
                  className="input-base"
                  rows={2}
                  disabled={!puedeEditar}
                  value={configLocal.tooltips_urgencia?.[t.key] || ""}
                  onChange={(e) =>
                    setConfigLocal({
                      ...configLocal,
                      tooltips_urgencia: { ...configLocal.tooltips_urgencia, [t.key]: e.target.value },
                    })
                  }
                  style={{ width: "100%", fontSize: 11.5 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acción de guardado */}
      {puedeEditar && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="boton-primario"
            onClick={manejarGuardar}
            disabled={guardando}
            style={{ fontSize: 12.5, padding: "9px 18px", backgroundColor: "#16a34a" }}
          >
            {guardando ? "Guardando..." : "Guardar matriz y opciones de prioridad"}
          </button>
        </div>
      )}
    </div>
  );
};
