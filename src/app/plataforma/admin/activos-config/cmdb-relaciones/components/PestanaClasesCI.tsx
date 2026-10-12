"use client";

import React, { useState } from "react";

export interface ClaseCIItem {
  id: string;
  nombre: string;
  es_ci: boolean;
  inventariable: boolean;
  atributos_obligatorios: string[];
  relaciones_minimas: string[];
  participa_impacto: boolean;
  mostrar_mapa: boolean;
  mostrar_incidentes: boolean;
  mostrar_problemas: boolean;
  mostrar_cambios: boolean;
  frecuencia_auditoria: "mensual" | "trimestral" | "semestral" | "anual";
  activa: boolean;
  color_topologia?: string;
}

export interface ClasesCIData {
  clases?: ClaseCIItem[];
}

interface Props {
  datos: ClasesCIData;
  onChange: (nuevosDatos: ClasesCIData) => void;
  bloqueado: boolean;
}

const ATRIBUTOS_CMDB_DISPONIBLES = [
  { id: "criticidad", label: "Nivel de criticidad" },
  { id: "entorno", label: "Entorno de operación" },
  { id: "responsable_tecnico", label: "Responsable técnico del CI" },
  { id: "responsable_negocio", label: "Responsable de negocio / Propietario" },
  { id: "servicios_soporta", label: "Servicios de negocio que soporta" },
  { id: "ubicacion", label: "Ubicación física / Sede" }
];

export function PestanaClasesCI({ datos, onChange, bloqueado }: Props) {
  const clases: ClaseCIItem[] = datos?.clases || [];

  const [modalEdicion, setModalEdicion] = useState<{
    abierto: boolean;
    clase?: ClaseCIItem;
    esLogica: boolean;
  }>({
    abierto: false,
    esLogica: false
  });

  const [formClase, setFormClase] = useState<Partial<ClaseCIItem>>({});
  const [modalDiagrama, setModalDiagrama] = useState(false);
  const [nuevaRelacionTexto, setNuevaRelacionTexto] = useState("");
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const handleToggleActiva = (id: string) => {
    if (bloqueado) return;
    const actualizadas = clases.map((c) => (c.id === id ? { ...c, activa: !c.activa } : c));
    onChange({ ...datos, clases: actualizadas });
  };

  const abrirNuevaClaseLogica = () => {
    setFormClase({
      id: `clase_logica_${Date.now()}`,
      nombre: "",
      es_ci: true,
      inventariable: false,
      atributos_obligatorios: ["criticidad", "entorno", "responsable_tecnico"],
      relaciones_minimas: [],
      participa_impacto: true,
      mostrar_mapa: true,
      mostrar_incidentes: true,
      mostrar_problemas: true,
      mostrar_cambios: true,
      frecuencia_auditoria: "trimestral",
      activa: true,
      color_topologia: "#4f46e5"
    });
    setModalEdicion({ abierto: true, esLogica: true });
  };

  const abrirEditar = (item: ClaseCIItem) => {
    setFormClase({ ...item });
    setModalEdicion({ abierto: true, clase: item, esLogica: !item.inventariable });
  };

  const alternarAtributoObligatorio = (attrId: string) => {
    const actuales = formClase.atributos_obligatorios || [];
    if (actuales.includes(attrId)) {
      setFormClase({
        ...formClase,
        atributos_obligatorios: actuales.filter((a) => a !== attrId)
      });
    } else {
      setFormClase({
        ...formClase,
        atributos_obligatorios: [...actuales, attrId]
      });
    }
  };

  const agregarRelacionMinima = () => {
    if (!nuevaRelacionTexto.trim()) return;
    const actuales = formClase.relaciones_minimas || [];
    setFormClase({
      ...formClase,
      relaciones_minimas: [...actuales, nuevaRelacionTexto.trim()]
    });
    setNuevaRelacionTexto("");
  };

  const quitarRelacionMinima = (idx: number) => {
    const actuales = formClase.relaciones_minimas || [];
    setFormClase({
      ...formClase,
      relaciones_minimas: actuales.filter((_, i) => i !== idx)
    });
  };

  const guardarClase = () => {
    if (bloqueado || !formClase.nombre?.trim()) return;
    let actualizadas: ClaseCIItem[];
    if (modalEdicion.clase) {
      actualizadas = clases.map((c) => (c.id === formClase.id ? (formClase as ClaseCIItem) : c));
    } else {
      actualizadas = [...clases, formClase as ClaseCIItem];
    }
    onChange({ ...datos, clases: actualizadas });
    setModalEdicion({ abierto: false, esLogica: false });
    mostrarToast("Clase de CI actualizada exitosamente.");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMensaje && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-sm transition-opacity">
          {toastMensaje}
        </div>
      )}

      {/* Encabezado y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Clases de Elementos de Configuración (CMDB)
          </h2>
          <p className="text-sm text-slate-500">
            Gobierno de clases físicas y lógicas que forman la topología de servicios, atributos obligatorios y participación en procesos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalDiagrama(true)}
            className="px-3 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-medium rounded-md shadow-sm"
          >
            Ver diagrama de clases
          </button>
          <button
            type="button"
            disabled={bloqueado}
            onClick={abrirNuevaClaseLogica}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm disabled:opacity-50"
          >
            + Clase de CI lógica
          </button>
        </div>
      </div>

      {/* Tabla de Clases */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Clase de Elemento</th>
                <th className="px-4 py-3 text-center">Tipo de Entidad</th>
                <th className="px-4 py-3">Atributos CMDB Obligatorios</th>
                <th className="px-4 py-3">Relaciones Mínimas</th>
                <th className="px-4 py-3 text-center">Impacto</th>
                <th className="px-4 py-3 text-center">Auditoría</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clases.map((clase) => (
                <tr key={clase.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={bloqueado}
                      onClick={() => handleToggleActiva(clase.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        clase.activa
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {clase.activa ? "Activa" : "Inactiva"}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: clase.color_topologia || "#4f46e5" }}
                      ></span>
                      <span className="font-semibold text-slate-900">{clase.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {clase.inventariable ? (
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                        Física / Inventario
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                        Lógica / Servicio
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {clase.atributos_obligatorios.map((att) => (
                        <span key={att} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                          {att.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex flex-wrap gap-1">
                      {clase.relaciones_minimas && clase.relaciones_minimas.length > 0 ? (
                        clase.relaciones_minimas.map((rel, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium">
                            {rel}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">Ninguna</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {clase.participa_impacto ? (
                      <span className="text-emerald-700 font-semibold">Si</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center capitalize text-slate-600">
                    {clase.frecuencia_auditoria || "trimestral"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => abrirEditar(clase)}
                      className="text-indigo-600 hover:text-indigo-900 font-semibold"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Diagrama Conceptual SVG */}
      {modalDiagrama && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Diagrama Conceptual de Clases CI y Relaciones
              </h3>
              <button
                type="button"
                onClick={() => setModalDiagrama(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md overflow-x-auto flex justify-center">
              <svg width="680" height="300" viewBox="0 0 680 300" className="max-w-full">
                {/* Nivel Superior: Servicios */}
                <rect x="240" y="20" width="200" height="50" rx="8" fill="#4338ca" stroke="#312e81" strokeWidth="2" />
                <text x="340" y="50" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                  Servicios TI / Negocio
                </text>

                {/* Flechas hacia aplicaciones y bases de datos */}
                <line x1="300" y1="70" x2="180" y2="120" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrow)" />
                <line x1="380" y1="70" x2="500" y2="120" stroke="#6366f1" strokeWidth="2" markerEnd="url(#arrow)" />

                {/* Nivel Medio: Software y Datos */}
                <rect x="80" y="120" width="200" height="50" rx="8" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
                <text x="180" y="150" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Software y Aplicaciones
                </text>

                <rect x="400" y="120" width="200" height="50" rx="8" fill="#0d9488" stroke="#0f766e" strokeWidth="2" />
                <text x="500" y="150" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Bases de Datos
                </text>

                {/* Flechas hacia infraestructura */}
                <line x1="180" y1="170" x2="250" y2="220" stroke="#0284c7" strokeWidth="2" />
                <line x1="500" y1="170" x2="430" y2="220" stroke="#0d9488" strokeWidth="2" />

                {/* Nivel Inferior: Infraestructura Física y Virtual */}
                <rect x="140" y="220" width="180" height="50" rx="8" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                <text x="230" y="250" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Hardware y Máquinas
                </text>

                <rect x="360" y="220" width="180" height="50" rx="8" fill="#475569" stroke="#334155" strokeWidth="2" />
                <text x="450" y="250" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                  Redes y Gabinetes
                </text>

                {/* Definicion de marcadores */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
              Modelo visual de herencia y dependencias directas: los servicios de alto nivel dependen de plataformas de datos y software, los cuales se ejecutan sobre la infraestructura física y virtual subyacente.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalDiagrama(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold"
              >
                Cerrar vista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar / Nueva Clase CI */}
      {modalEdicion.abierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {modalEdicion.clase ? `Editar Clase: ${modalEdicion.clase.nombre}` : "Nueva Clase de CI Lógica"}
              </h3>
              <button
                type="button"
                onClick={() => setModalEdicion({ abierto: false, esLogica: false })}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Clase</label>
                <input
                  type="text"
                  value={formClase.nombre || ""}
                  onChange={(e) => setFormClase({ ...formClase, nombre: e.target.value })}
                  placeholder="Ej: Servicio de Negocio, Clúster Kubernetes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Frecuencia de Auditoría</label>
                  <select
                    value={formClase.frecuencia_auditoria || "trimestral"}
                    onChange={(e) => setFormClase({ ...formClase, frecuencia_auditoria: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                  >
                    <option value="mensual">Mensual (Críticos)</option>
                    <option value="trimestral">Trimestral (Estándar)</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color para Mapa de Topología</label>
                  <input
                    type="color"
                    value={formClase.color_topologia || "#4f46e5"}
                    onChange={(e) => setFormClase({ ...formClase, color_topologia: e.target.value })}
                    className="w-full h-9 p-1 border border-slate-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Atributos Obligatorios */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Atributos CMDB Obligatorios para esta Clase
                </label>
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded border border-slate-200">
                  {ATRIBUTOS_CMDB_DISPONIBLES.map((att) => {
                    const seleccionado = (formClase.atributos_obligatorios || []).includes(att.id);
                    return (
                      <label key={att.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => alternarAtributoObligatorio(att.id)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
                        />
                        <span>{att.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Relaciones Mínimas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relaciones Mínimas Obligatorias (Reglas de Completitud)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={nuevaRelacionTexto}
                    onChange={(e) => setNuevaRelacionTexto(e.target.value)}
                    placeholder="Ej: Se ejecuta en, Depende de, Soporta a..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={agregarRelacionMinima}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(formClase.relaciones_minimas || []).map((rel, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded text-xs"
                    >
                      {rel}
                      <button
                        type="button"
                        onClick={() => quitarRelacionMinima(idx)}
                        className="text-indigo-400 hover:text-indigo-700 font-bold"
                      >
                        quitar
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggles de Procesos */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chkImpacto"
                    checked={formClase.participa_impacto ?? true}
                    onChange={(e) => setFormClase({ ...formClase, participa_impacto: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <label htmlFor="chkImpacto" className="text-xs text-slate-700 font-medium">
                    Participa en el motor de análisis de impacto de Cambios e Incidentes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chkMapa"
                    checked={formClase.mostrar_mapa ?? true}
                    onChange={(e) => setFormClase({ ...formClase, mostrar_mapa: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <label htmlFor="chkMapa" className="text-xs text-slate-700 font-medium">
                    Visible en el Mapa de Topología CMDB (Módulo 7.2)
                  </label>
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <span className="text-xs font-semibold text-slate-700">Ofrecer en selector de:</span>
                  <label className="flex items-center gap-1 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={formClase.mostrar_incidentes ?? true}
                      onChange={(e) => setFormClase({ ...formClase, mostrar_incidentes: e.target.checked })}
                    />
                    Incidentes
                  </label>
                  <label className="flex items-center gap-1 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={formClase.mostrar_problemas ?? true}
                      onChange={(e) => setFormClase({ ...formClase, mostrar_problemas: e.target.checked })}
                    />
                    Problemas
                  </label>
                  <label className="flex items-center gap-1 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={formClase.mostrar_cambios ?? true}
                      onChange={(e) => setFormClase({ ...formClase, mostrar_cambios: e.target.checked })}
                    />
                    Cambios (RFC)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalEdicion({ abierto: false, esLogica: false })}
                className="px-3.5 py-1.5 border border-slate-300 rounded text-xs text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarClase}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
