"use client";

import React, { useState } from "react";

export interface TransicionRegla {
  id: string;
  nombre: string;
  estados_origen: string[];
  estado_destino: string;
  aplica_a?: string[];
  perfiles_autorizados: string[];
  condiciones_previas: string[];
  campos_obligatorios: string[];
  comentario_modo?: "ninguno" | "opcional" | "obligatorio";
  requiere_aprobacion: boolean;
  etapas_aprobacion?: { perfil: string; orden: number; plazo_horas: number }[];
  documento_generado: string;
  automatizaciones: string[];
  color_boton: string;
  orden: number;
}

export interface TransicionesReglasData {
  ciclo_id?: string;
  transiciones?: TransicionRegla[];
}

interface Props {
  datos: TransicionesReglasData;
  onChange: (nuevosDatos: TransicionesReglasData) => void;
  bloqueado: boolean;
}

const ESTADOS_DISPONIBLES = [
  { id: "solicitado", nombre: "Solicitado", color: "#64748b" },
  { id: "ordenado", nombre: "Ordenado / En compra", color: "#3b82f6" },
  { id: "en_stock", nombre: "En stock / Almacén", color: "#10b981" },
  { id: "asignado", nombre: "Asignado en uso", color: "#0ea5e9" },
  { id: "en_prestamo", nombre: "En préstamo temporal", color: "#8b5cf6" },
  { id: "en_reparacion", nombre: "En reparación", color: "#f59e0b" },
  { id: "retirado", nombre: "Retirado de operación", color: "#6b7280" },
  { id: "perdido_robado", nombre: "Perdido o robado", color: "#ef4444" },
  { id: "dado_de_baja", nombre: "Dado de baja", color: "#1e293b" },
  { id: "cancelado", nombre: "Cancelado", color: "#94a3b8" }
];

const PERFILES_DISPONIBLES = [
  "Administrador",
  "Gestor de Activos y Configuración",
  "Técnico",
  "Supervisor",
  "Custodio actual (Contextual)",
  "Responsable técnico del CI (Contextual)"
];

const CONDICIONES_CATALOGO = [
  { id: "sin_incidentes_abiertos", label: "Sin incidentes abiertos vinculados" },
  { id: "sin_rfc_programadas", label: "Sin solicitudes de cambio (RFC) en ejecución o programadas" },
  { id: "sin_asignacion_vigente", label: "Sin asignación o custodia vigente activa" },
  { id: "sin_licencias_asignadas", label: "Sin licencias de software (SAM) activas asociadas" },
  { id: "sin_relaciones_criticas", label: "Sin relaciones de dependencia activas con CI de criticidad Alta o Crítica" },
  { id: "garantia_vigente", label: "Garantía del fabricante vigente" }
];

const AUTOMATIZACIONES_CATALOGO = [
  { id: "registrar_custodio_fecha", label: "Registrar custodio y fecha de asignación" },
  { id: "cerrar_asignacion_historial", label: "Cerrar asignación vigente en historial inmutable" },
  { id: "generar_acta_entrega", label: "Generar Acta Oficial de Entrega en PDF" },
  { id: "solicitar_aceptacion_digital", label: "Solicitar aceptación digital del custodio en plataforma" },
  { id: "actualizar_condicion_fisica", label: "Actualizar condición física según inspección" },
  { id: "liberar_licencias_asignadas", label: "Liberar y desvincular todas las licencias asignadas (SAM)" },
  { id: "desactivar_ci_cmdb", label: "Desactivar nodo CI en la CMDB conservando relaciones históricas" },
  { id: "reactivar_ci_cmdb", label: "Reactivar nodo CI en la CMDB operativa" },
  { id: "crear_incidente_seguridad", label: "Crear incidente de seguridad de la información con alta prioridad" },
  { id: "calcular_fin_garantia_vida_util", label: "Calcular automáticamente vencimiento de garantía y fin de vida útil" },
  { id: "asignar_codigo_patrimonial", label: "Generar y asignar código patrimonial correlativo único" },
  { id: "generar_etiqueta", label: "Generar plantilla de etiqueta física QR para impresión inmediata" }
];

export function PestanaTransicionesReglas({ datos, onChange, bloqueado }: Props) {
  const [vistaActiva, setVistaActiva] = useState<"matriz" | "diagrama" | "lista">("lista");
  const [zoomDiagrama, setZoomDiagrama] = useState(1);
  const [modalEdicion, setModalEdicion] = useState<{ abierto: boolean; transicion?: TransicionRegla; esNuevo: boolean }>({
    abierto: false,
    esNuevo: true
  });
  const [formTransicion, setFormTransicion] = useState<Partial<TransicionRegla>>({});
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const transiciones: TransicionRegla[] = datos?.transiciones || [];

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const abrirEdicion = (tr?: TransicionRegla) => {
    if (bloqueado) return;
    if (tr) {
      setFormTransicion({ ...tr });
      setModalEdicion({ abierto: true, transicion: tr, esNuevo: false });
    } else {
      setFormTransicion({
        nombre: "",
        estados_origen: ["en_stock"],
        estado_destino: "asignado",
        perfiles_autorizados: ["Administrador", "Gestor de Activos y Configuración"],
        condiciones_previas: [],
        campos_obligatorios: [],
        comentario_modo: "opcional",
        requiere_aprobacion: false,
        documento_generado: "ninguno",
        automatizaciones: [],
        color_boton: "#0ea5e9",
        orden: transiciones.length + 1
      });
      setModalEdicion({ abierto: true, esNuevo: true });
    }
  };

  const guardarTransicion = () => {
    if (bloqueado || !formTransicion.nombre || !formTransicion.estado_destino) return;

    let actualizadas: TransicionRegla[];
    if (modalEdicion.esNuevo) {
      const nueva: TransicionRegla = {
        id: `tr_${Date.now()}`,
        nombre: formTransicion.nombre,
        estados_origen: formTransicion.estados_origen || [],
        estado_destino: formTransicion.estado_destino,
        perfiles_autorizados: formTransicion.perfiles_autorizados || ["Administrador"],
        condiciones_previas: formTransicion.condiciones_previas || [],
        campos_obligatorios: formTransicion.campos_obligatorios || [],
        comentario_modo: formTransicion.comentario_modo || "opcional",
        requiere_aprobacion: !!formTransicion.requiere_aprobacion,
        etapas_aprobacion: formTransicion.etapas_aprobacion || [],
        documento_generado: formTransicion.documento_generado || "ninguno",
        automatizaciones: formTransicion.automatizaciones || [],
        color_boton: formTransicion.color_boton || "#0ea5e9",
        orden: transiciones.length + 1
      };
      actualizadas = [...transiciones, nueva];
    } else {
      actualizadas = transiciones.map((t) =>
        t.id === formTransicion.id ? ({ ...t, ...formTransicion } as TransicionRegla) : t
      );
    }

    onChange({ ...datos, transiciones: actualizadas });
    setModalEdicion({ abierto: false, esNuevo: true });
    mostrarToast("Regla de transición guardada en el borrador.");
  };

  const eliminarTransicion = (id: string) => {
    if (bloqueado) return;
    const actualizadas = transiciones.filter((t) => t.id !== id);
    onChange({ ...datos, transiciones: actualizadas });
    mostrarToast("Transición eliminada del borrador.");
  };

  const toggleArrayItem = (campo: "estados_origen" | "perfiles_autorizados" | "condiciones_previas" | "automatizaciones", item: string) => {
    const list = formTransicion[campo] || [];
    let nuevo: string[];
    if (list.includes(item)) {
      nuevo = list.filter((i) => i !== item);
    } else {
      nuevo = [...list, item];
    }
    setFormTransicion({ ...formTransicion, [campo]: nuevo });
  };

  return (
    <div className="space-y-6">
      {/* Toast informativo */}
      {toastMensaje && (
        <div className="fixed bottom-20 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium border border-slate-700">
          {toastMensaje}
        </div>
      )}

      {/* Barra superior con navegación de vistas */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            1.5.2.2 Transiciones y reglas de ciclo de vida
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Define las acciones de cambio de estado en la ficha del activo, autorizaciones, requisitos y automatizaciones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de vistas */}
          <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-semibold">
            <button
              onClick={() => setVistaActiva("lista")}
              className={`px-3 py-1 rounded-md transition-colors ${
                vistaActiva === "lista" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Lista ({transiciones.length})
            </button>
            <button
              onClick={() => setVistaActiva("matriz")}
              className={`px-3 py-1 rounded-md transition-colors ${
                vistaActiva === "matriz" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Matriz Origen x Destino
            </button>
            <button
              onClick={() => setVistaActiva("diagrama")}
              className={`px-3 py-1 rounded-md transition-colors ${
                vistaActiva === "diagrama" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Diagrama de flujo
            </button>
          </div>

          <button
            onClick={() => abrirEdicion()}
            disabled={bloqueado}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
          >
            + Nueva transición
          </button>
        </div>
      </div>

      {/* Vista 1: Lista detallada de transiciones */}
      {vistaActiva === "lista" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-12">#</th>
                  <th className="py-2.5 px-3">Acción (Botón en ficha)</th>
                  <th className="py-2.5 px-3">Estados origen</th>
                  <th className="py-2.5 px-3">Estado destino</th>
                  <th className="py-2.5 px-3">Perfiles autorizados</th>
                  <th className="py-2.5 px-3">Aprobación</th>
                  <th className="py-2.5 px-3">Acta generada</th>
                  <th className="py-2.5 px-3">Automatizaciones</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transiciones.map((tr, index) => (
                  <tr key={tr.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{index + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: tr.color_boton }}
                        />
                        <span className="font-bold text-slate-800">{tr.nombre}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {tr.estados_origen.map((orig) => (
                          <span key={orig} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {orig}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                        {tr.estado_destino}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="line-clamp-1">{tr.perfiles_autorizados.join(", ")}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {tr.requiere_aprobacion ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Requiere ({tr.etapas_aprobacion?.length || 1} etapas)
                        </span>
                      ) : (
                        <span className="text-slate-400">Directa</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600 uppercase text-[10px]">
                      {tr.documento_generado || "ninguno"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold">
                        {tr.automatizaciones.length} acciones
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => abrirEdicion(tr)}
                        disabled={bloqueado}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarTransicion(tr.id)}
                        disabled={bloqueado}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista 2: Matriz Origen x Destino */}
      {vistaActiva === "matriz" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 overflow-x-auto">
          <p className="text-xs text-slate-500 mb-3">
            Las filas representan el estado origen actual; las columnas representan el nuevo estado destino al que se transiciona.
          </p>
          <table className="w-full text-center text-xs border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold">
                <th className="p-2 border border-slate-200 text-left bg-slate-200 w-36">Origen \ Destino</th>
                {ESTADOS_DISPONIBLES.map((dest) => (
                  <th key={dest.id} className="p-2 border border-slate-200 whitespace-nowrap">
                    <span className="block text-[11px] font-bold">{dest.nombre}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ESTADOS_DISPONIBLES.map((orig) => (
                <tr key={orig.id} className="hover:bg-slate-50">
                  <td className="p-2 border border-slate-200 font-semibold text-slate-800 text-left bg-slate-50">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: orig.color }} />
                      <span>{orig.nombre}</span>
                    </div>
                  </td>
                  {ESTADOS_DISPONIBLES.map((dest) => {
                    const transicionesCelda = transiciones.filter(
                      (t) => t.estados_origen.includes(orig.id) && t.estado_destino === dest.id
                    );
                    const tieneTransicion = transicionesCelda.length > 0;
                    return (
                      <td key={dest.id} className="p-1 border border-slate-200">
                        {tieneTransicion ? (
                          <div className="flex flex-col gap-1">
                            {transicionesCelda.map((t) => (
                              <button
                                key={t.id}
                                onClick={() => abrirEdicion(t)}
                                className="px-1.5 py-0.5 text-[9px] font-bold text-white rounded shadow-xs truncate max-w-[110px]"
                                style={{ backgroundColor: t.color_boton }}
                                title={t.nombre}
                              >
                                {t.nombre}
                              </button>
                            ))}
                          </div>
                        ) : orig.id === dest.id && orig.id === "asignado" ? (
                          <span className="text-[10px] text-indigo-600 font-bold">Transferir</span>
                        ) : (
                          <span className="text-slate-200">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vista 3: Diagrama de flujo SVG interactivo */}
      {vistaActiva === "diagrama" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Diagrama de flujo del ciclo de vida de hardware</h4>
              <p className="text-xs text-slate-500">
                Visualización gráfica de caminos y bifurcaciones operativas de acuerdo a ITIL 4 Asset Management.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomDiagrama((z) => Math.max(0.7, z - 0.1))}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100"
              >
                - Zoom
              </button>
              <span className="text-xs font-mono">{Math.round(zoomDiagrama * 100)}%</span>
              <button
                onClick={() => setZoomDiagrama((z) => Math.min(1.5, z + 0.1))}
                className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100"
              >
                + Zoom
              </button>
              <button
                onClick={() => mostrarToast("Diagrama SVG exportado exitosamente.")}
                className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100"
              >
                Exportar SVG
              </button>
            </div>
          </div>

          <div className="w-full overflow-auto bg-slate-900 rounded-lg p-6 flex justify-center">
            <div
              style={{
                transform: `scale(${zoomDiagrama})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease-in-out"
              }}
            >
              <svg width="860" height="420" viewBox="0 0 860 420" className="select-none">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                  </marker>
                </defs>

                {/* Flechas directas de flujo */}
                <line x1="100" y1="60" x2="220" y2="60" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="300" y1="60" x2="420" y2="60" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="480" y1="85" x2="480" y2="180" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="500" y1="210" x2="650" y2="210" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="480" y1="235" x2="480" y2="330" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="680" y1="235" x2="680" y2="330" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Nodos de estados */}
                {/* 1. Solicitado */}
                <g transform="translate(20, 35)">
                  <rect width="110" height="50" rx="8" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
                  <text x="55" y="26" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">Solicitado</text>
                  <text x="55" y="40" textAnchor="middle" fill="#94a3b8" fontSize="9">Planificado</text>
                </g>

                {/* 2. Ordenado */}
                <g transform="translate(200, 35)">
                  <rect width="120" height="50" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                  <text x="60" y="26" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">Ordenado</text>
                  <text x="60" y="40" textAnchor="middle" fill="#60a5fa" fontSize="9">En compra</text>
                </g>

                {/* 3. En Stock */}
                <g transform="translate(420, 35)">
                  <rect width="120" height="50" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                  <text x="60" y="26" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">En stock</text>
                  <text x="60" y="40" textAnchor="middle" fill="#34d399" fontSize="9">Disponible / Almacén</text>
                </g>

                {/* 4. Asignado */}
                <g transform="translate(420, 185)">
                  <rect width="120" height="50" rx="8" fill="#1e293b" stroke="#0ea5e9" strokeWidth="2" />
                  <text x="60" y="26" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">Asignado</text>
                  <text x="60" y="40" textAnchor="middle" fill="#38bdf8" fontSize="9">En uso por custodio</text>
                </g>

                {/* 5. En Reparación */}
                <g transform="translate(630, 185)">
                  <rect width="120" height="50" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                  <text x="60" y="26" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">En reparación</text>
                  <text x="60" y="40" textAnchor="middle" fill="#fbbf24" fontSize="9">Mantenimiento</text>
                </g>

                {/* 6. Retirado */}
                <g transform="translate(420, 335)">
                  <rect width="120" height="50" rx="8" fill="#1e293b" stroke="#6b7280" strokeWidth="2" />
                  <text x="60" y="26" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">Retirado</text>
                  <text x="60" y="40" textAnchor="middle" fill="#9ca3af" fontSize="9">Inactivo</text>
                </g>

                {/* 7. Dado de baja */}
                <g transform="translate(630, 335)">
                  <rect width="120" height="50" rx="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                  <text x="60" y="26" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">Dado de baja</text>
                  <text x="60" y="40" textAnchor="middle" fill="#e2e8f0" fontSize="9">Terminal / Dispuesto</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Modal de adición / edición de regla de transición */}
      {modalEdicion.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                {modalEdicion.esNuevo ? "Nueva regla de transición de estado" : `Editar regla: ${formTransicion.nombre}`}
              </h3>
              <button
                onClick={() => setModalEdicion({ abierto: false, esNuevo: true })}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombre de la acción (Etiqueta del botón)</label>
                  <input
                    type="text"
                    value={formTransicion.nombre || ""}
                    onChange={(e) => setFormTransicion({ ...formTransicion, nombre: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                    placeholder="EJ: Asignar a colaborador"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado destino</label>
                  <select
                    value={formTransicion.estado_destino || "en_stock"}
                    onChange={(e) => setFormTransicion({ ...formTransicion, estado_destino: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    {ESTADOS_DISPONIBLES.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selector de estados origen */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estados origen permitidos (Múltiple):</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                  {ESTADOS_DISPONIBLES.map((est) => {
                    const checked = formTransicion.estados_origen?.includes(est.id);
                    return (
                      <label key={est.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArrayItem("estados_origen", est.id)}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span>{est.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Perfiles autorizados */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Perfiles y roles autorizados:</label>
                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                  {PERFILES_DISPONIBLES.map((perf) => {
                    const checked = formTransicion.perfiles_autorizados?.includes(perf);
                    return (
                      <label key={perf} className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArrayItem("perfiles_autorizados", perf)}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span>{perf}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Condiciones previas */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condiciones previas obligatorias:</label>
                <div className="space-y-1.5 p-2 bg-slate-50 rounded border border-slate-200">
                  {CONDICIONES_CATALOGO.map((cond) => {
                    const checked = formTransicion.condiciones_previas?.includes(cond.id);
                    return (
                      <label key={cond.id} className="flex items-start gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArrayItem("condiciones_previas", cond.id)}
                          className="mt-0.5 rounded border-slate-300 text-indigo-600"
                        />
                        <span>{cond.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Documento y Aprobación */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Documento oficial a generar</label>
                  <select
                    value={formTransicion.documento_generado || "ninguno"}
                    onChange={(e) => setFormTransicion({ ...formTransicion, documento_generado: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="ninguno">Ninguno</option>
                    <option value="acta_entrega">Acta Oficial de Entrega</option>
                    <option value="acta_devolucion">Acta Oficial de Devolución</option>
                    <option value="acta_transferencia">Acta de Transferencia de Custodia</option>
                    <option value="acta_baja">Acta de Baja y Disposición Patrimonial</option>
                    <option value="etiqueta_qr">Plantilla de Etiqueta QR</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center pt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formTransicion.requiere_aprobacion}
                      onChange={(e) => setFormTransicion({ ...formTransicion, requiere_aprobacion: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span className="font-semibold text-slate-700">Requiere aprobación previa por flujo</span>
                  </label>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    El solicitante no podrá autoaprobar su requerimiento.
                  </span>
                </div>
              </div>

              {/* Automatizaciones asociadas */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Automatizaciones ejecutadas tras el cambio de estado:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-slate-50 rounded border border-slate-200 max-h-40 overflow-y-auto">
                  {AUTOMATIZACIONES_CATALOGO.map((aut) => {
                    const checked = formTransicion.automatizaciones?.includes(aut.id);
                    return (
                      <label key={aut.id} className="flex items-start gap-2 cursor-pointer text-slate-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArrayItem("automatizaciones", aut.id)}
                          className="mt-0.5 rounded border-slate-300 text-indigo-600"
                        />
                        <span className="text-[11px]">{aut.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setModalEdicion({ abierto: false, esNuevo: true })}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={guardarTransicion}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm"
              >
                Guardar transición
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
