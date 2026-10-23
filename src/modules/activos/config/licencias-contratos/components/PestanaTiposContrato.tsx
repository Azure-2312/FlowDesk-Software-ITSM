"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Edit2, Ban, Play, X } from "@/shared/components/ui/Iconos";

export interface TipoContratoItem {
  id: string;
  nombre: string;
  recurrente: boolean;
  renovacion_automatica: boolean;
  exige_sla: boolean;
  preaviso_dias: number;
  activo: boolean;
}

export interface EstadoProveedorItem {
  id: string;
  nombre: string;
  permite_nuevos_contratos: boolean;
}

export interface TiposContratoData {
  tipos_contrato?: TipoContratoItem[];
  categorias_proveedor?: string[];
  estados_proveedor?: EstadoProveedorItem[];
}

interface Props {
  datos: TiposContratoData;
  onChange: (nuevosDatos: TiposContratoData) => void;
  bloqueado: boolean;
}

export function PestanaTiposContrato({ datos, onChange, bloqueado }: Props) {
  const [subSeccion, setSubSeccion] = useState<"contratos" | "proveedores">("contratos");
  const [modalContrato, setModalContrato] = useState<{ abierto: boolean; item?: TipoContratoItem; esNuevo: boolean }>({
    abierto: false,
    esNuevo: true
  });
  const [formContrato, setFormContrato] = useState<Partial<TipoContratoItem>>({});
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const tiposContrato: TipoContratoItem[] = datos?.tipos_contrato || [];
  const categorias: string[] = datos?.categorias_proveedor || [
    "Fabricante",
    "Distribuidor Autorizado",
    "Servicios TI",
    "Telecomunicaciones",
    "Consultoría"
  ];
  const estadosProveedor: EstadoProveedorItem[] = datos?.estados_proveedor || [
    { id: "activo", nombre: "Activo", permite_nuevos_contratos: true },
    { id: "evaluacion", nombre: "En evaluación", permite_nuevos_contratos: true },
    { id: "suspendido", nombre: "Suspendido temporalmente", permite_nuevos_contratos: false },
    { id: "bloqueado", nombre: "Bloqueado por incumplimiento", permite_nuevos_contratos: false }
  ];

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const abrirEdicionContrato = (item?: TipoContratoItem) => {
    if (bloqueado) return;
    if (item) {
      setFormContrato({ ...item });
      setModalContrato({ abierto: true, item, esNuevo: false });
    } else {
      setFormContrato({
        id: `tc_${Date.now()}`,
        nombre: "",
        recurrente: true,
        renovacion_automatica: true,
        exige_sla: true,
        preaviso_dias: 60,
        activo: true
      });
      setModalContrato({ abierto: true, esNuevo: true });
    }
  };

  const guardarContrato = () => {
    if (bloqueado || !formContrato.nombre) return;
    let actualizados: TipoContratoItem[];
    if (modalContrato.esNuevo) {
      const nuevo: TipoContratoItem = {
        id: formContrato.id || `tc_${Date.now()}`,
        nombre: formContrato.nombre,
        recurrente: !!formContrato.recurrente,
        renovacion_automatica: !!formContrato.renovacion_automatica,
        exige_sla: !!formContrato.exige_sla,
        preaviso_dias: formContrato.preaviso_dias || 60,
        activo: true
      };
      actualizados = [...tiposContrato, nuevo];
    } else {
      actualizados = tiposContrato.map((t) => (t.id === formContrato.id ? ({ ...t, ...formContrato } as TipoContratoItem) : t));
    }
    onChange({ ...datos, tipos_contrato: actualizados });
    setModalContrato({ abierto: false, esNuevo: true });
    mostrarToast("Tipo de contrato guardado en borrador.");
  };

  const toggleContratoActivo = (id: string) => {
    if (bloqueado) return;
    const act = tiposContrato.map((t) => (t.id === id ? { ...t, activo: !t.activo } : t));
    onChange({ ...datos, tipos_contrato: act });
  };

  const toggleEstadoProveedorPermite = (id: string) => {
    if (bloqueado) return;
    const act = estadosProveedor.map((e) => (e.id === id ? { ...e, permite_nuevos_contratos: !e.permite_nuevos_contratos } : e));
    onChange({ ...datos, estados_proveedor: act });
    mostrarToast("Estado de proveedor actualizado.");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMensaje && (
        <div className="fixed bottom-20 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium border border-slate-700">
          {toastMensaje}
        </div>
      )}

      {/* Encabezado */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Tipos de contrato y catálogos de proveedores
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuración de modalidades contractuales TI, preavisos de no renovación y estados de evaluación de proveedores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-navegación */}
          <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-semibold">
            <button
              onClick={() => setSubSeccion("contratos")}
              className={`px-3 py-1 rounded-md transition-colors ${
                subSeccion === "contratos" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tipos de contrato ({tiposContrato.length})
            </button>
            <button
              onClick={() => setSubSeccion("proveedores")}
              className={`px-3 py-1 rounded-md transition-colors ${
                subSeccion === "proveedores" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Gobernanza de proveedores
            </button>
          </div>

          {subSeccion === "contratos" && (
            <button
              onClick={() => abrirEdicionContrato()}
              disabled={bloqueado}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
            >
              + Nuevo tipo de contrato
            </button>
          )}
        </div>
      </div>

      {/* 1. Tipos de contrato */}
      {subSeccion === "contratos" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Modalidad contractual</th>
                  <th className="py-2.5 px-3 text-center">Monto recurrente</th>
                  <th className="py-2.5 px-3 text-center">Renovación automática</th>
                  <th className="py-2.5 px-3 text-center">Exige niveles SLA</th>
                  <th className="py-2.5 px-3">Preaviso límite</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tiposContrato.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{t.nombre}</td>
                    <td className="py-2.5 px-3 text-center">
                      {t.recurrente ? <span className="text-emerald-600 font-bold">Periódico</span> : <span className="text-slate-400">Pago único</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {t.renovacion_automatica ? <span className="text-indigo-600 font-bold">Si</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {t.exige_sla ? <span className="text-purple-600 font-bold">Exigido</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{t.preaviso_dias} días antes</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {t.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => abrirEdicionContrato(t)}
                        disabled={bloqueado}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => toggleContratoActivo(t.id)}
                        disabled={bloqueado}
                        className="text-slate-600 hover:text-slate-800"
                      >
                        {t.activo ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Gobernanza de proveedores */}
      {subSeccion === "proveedores" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Categorías de proveedores */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Categorías de proveedores homologadas
            </h4>
            <p className="text-[11px] text-slate-400">
              Clasificación estratégica para auditoría de suministro de servicios tecnológicos.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {categorias.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Estados de proveedores y restricciones */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Estados de proveedor y restricción de contratación
            </h4>
            <p className="text-[11px] text-slate-400">
              Proveedores bloqueados o suspendidos no podrán seleccionarse en órdenes ni contratos.
            </p>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              {estadosProveedor.map((ep) => (
                <div key={ep.id} className="p-3 flex items-center justify-between text-xs bg-white">
                  <span className="font-bold text-slate-800">{ep.nombre}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ep.permite_nuevos_contratos}
                      disabled={bloqueado}
                      onChange={() => toggleEstadoProveedorPermite(ep.id)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span className="text-slate-600 font-medium">Permite adjudicar contratos</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Tipo Contrato */}
      {modalContrato.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                {modalContrato.esNuevo ? "Nuevo tipo de contrato" : "Editar tipo de contrato"}
              </h3>
              <button onClick={() => setModalContrato({ abierto: false, esNuevo: true })} className="text-slate-400 hover:text-slate-600 font-bold text-xs">
                Cerrar
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de modalidad contractual</label>
                <input
                  type="text"
                  value={formContrato.nombre || ""}
                  onChange={(e) => setFormContrato({ ...formContrato, nombre: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                  placeholder="EJ: Servicios de ciberseguridad gestionada"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Días de preaviso de no renovación</label>
                <input
                  type="number"
                  value={formContrato.preaviso_dias || 60}
                  onChange={(e) => setFormContrato({ ...formContrato, preaviso_dias: parseInt(e.target.value, 10) })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formContrato.recurrente}
                    onChange={(e) => setFormContrato({ ...formContrato, recurrente: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Monto periódico recurrente (mensual/anual)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formContrato.renovacion_automatica}
                    onChange={(e) => setFormContrato({ ...formContrato, renovacion_automatica: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Admite cláusula de renovación automática</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formContrato.exige_sla}
                    onChange={(e) => setFormContrato({ ...formContrato, exige_sla: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Exige compromisos y niveles de servicio (SLA)</span>
                </label>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setModalContrato({ abierto: false, esNuevo: true })} className="px-3 py-1.5 text-xs font-semibold text-slate-600">
                Cancelar
              </button>
              <button
                onClick={guardarContrato}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm"
              >
                Guardar contrato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
