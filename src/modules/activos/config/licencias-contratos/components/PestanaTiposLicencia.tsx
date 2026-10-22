"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Edit2, Ban, Play, X } from "@/shared/components/ui/Iconos";

export type MetricaLicencia =
  | "usuario_nominal"
  | "usuario_concurrente"
  | "dispositivo"
  | "nucleo_procesador"
  | "servidor_instancia"
  | "sitio_corporativa"
  | "sin_limite";

export interface TipoLicenciaItem {
  id: string;
  codigo: string;
  nombre: string;
  metrica: MetricaLicencia;
  vence: boolean;
  requiere_clave: boolean;
  reasignable: boolean;
  requiere_contrato: boolean;
  activo: boolean;
}

export interface SoftwareCatalogoItem {
  id: number;
  producto: string;
  editor: string;
  categoria: string;
  condicion: "autorizado" | "restringido" | "prohibido";
}

export interface TiposLicenciaData {
  tipos_licencia?: TipoLicenciaItem[];
  catalogo_software?: SoftwareCatalogoItem[];
}

interface Props {
  datos: TiposLicenciaData;
  onChange: (nuevosDatos: TiposLicenciaData) => void;
  bloqueado: boolean;
}

export function PestanaTiposLicencia({ datos, onChange, bloqueado }: Props) {
  const [subSeccion, setSubSeccion] = useState<"tipos" | "software">("tipos");
  const [modalTipo, setModalTipo] = useState<{ abierto: boolean; tipo?: TipoLicenciaItem; esNuevo: boolean }>({
    abierto: false,
    esNuevo: true
  });
  const [formTipo, setFormTipo] = useState<Partial<TipoLicenciaItem>>({});
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const tipos: TipoLicenciaItem[] = datos?.tipos_licencia || [];
  const software: SoftwareCatalogoItem[] = datos?.catalogo_software || [];

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const abrirEdicion = (item?: TipoLicenciaItem) => {
    if (bloqueado) return;
    if (item) {
      setFormTipo({ ...item });
      setModalTipo({ abierto: true, tipo: item, esNuevo: false });
    } else {
      setFormTipo({
        codigo: "",
        nombre: "",
        metrica: "usuario_nominal",
        vence: true,
        requiere_clave: true,
        reasignable: true,
        requiere_contrato: false,
        activo: true
      });
      setModalTipo({ abierto: true, esNuevo: true });
    }
  };

  const guardarTipo = () => {
    if (bloqueado || !formTipo.nombre || !formTipo.codigo) return;
    let actualizados: TipoLicenciaItem[];
    if (modalTipo.esNuevo) {
      const nuevo: TipoLicenciaItem = {
        id: (formTipo.codigo || `tl_${Date.now()}`).toLowerCase(),
        codigo: formTipo.codigo.toUpperCase(),
        nombre: formTipo.nombre,
        metrica: formTipo.metrica || "usuario_nominal",
        vence: !!formTipo.vence,
        requiere_clave: !!formTipo.requiere_clave,
        reasignable: !!formTipo.reasignable,
        requiere_contrato: !!formTipo.requiere_contrato,
        activo: true
      };
      actualizados = [...tipos, nuevo];
    } else {
      actualizados = tipos.map((t) => (t.id === formTipo.id ? ({ ...t, ...formTipo } as TipoLicenciaItem) : t));
    }
    onChange({ ...datos, tipos_licencia: actualizados });
    setModalTipo({ abierto: false, esNuevo: true });
    mostrarToast("Tipo de licencia guardado en borrador.");
  };

  const toggleTipoActivo = (id: string) => {
    if (bloqueado) return;
    const act = tipos.map((t) => (t.id === id ? { ...t, activo: !t.activo } : t));
    onChange({ ...datos, tipos_licencia: act });
  };

  const cambiarCondicionSoftware = (id: number, nuevaCondicion: "autorizado" | "restringido" | "prohibido") => {
    if (bloqueado) return;
    const act = software.map((s) => (s.id === id ? { ...s, condicion: nuevaCondicion } : s));
    onChange({ ...datos, catalogo_software: act });
    mostrarToast("Condición de software actualizada.");
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
            1.5.3.1 Tipos de licencia, métricas de consumo y catálogo de software
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Definición de esquemas de derechos de software (SAM), métricas de cómputo y políticas de autorización de productos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-navegación */}
          <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-semibold">
            <button
              onClick={() => setSubSeccion("tipos")}
              className={`px-3 py-1 rounded-md transition-colors ${
                subSeccion === "tipos" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tipos de licencia ({tipos.length})
            </button>
            <button
              onClick={() => setSubSeccion("software")}
              className={`px-3 py-1 rounded-md transition-colors ${
                subSeccion === "software" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Catálogo de software ({software.length})
            </button>
          </div>

          {subSeccion === "tipos" && (
            <button
              onClick={() => abrirEdicion()}
              disabled={bloqueado}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
            >
              + Nuevo tipo de licencia
            </button>
          )}
        </div>
      </div>

      {/* 1. Tabla de Tipos de Licencia */}
      {subSeccion === "tipos" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Nombre del tipo</th>
                  <th className="py-2.5 px-3">Métrica de consumo</th>
                  <th className="py-2.5 px-3 text-center">¿Vence?</th>
                  <th className="py-2.5 px-3 text-center">Clave serial</th>
                  <th className="py-2.5 px-3 text-center">Reasignable</th>
                  <th className="py-2.5 px-3 text-center">Exige contrato</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tipos.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{t.codigo}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{t.nombre}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {t.metrica.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {t.vence ? (
                        <span className="text-amber-700 font-semibold">Término / Anual</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">Perpetua</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {t.requiere_clave ? <span className="text-indigo-600 font-bold">Si (Sensible)</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {t.reasignable ? <span className="text-emerald-600 font-bold">Si</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {t.requiere_contrato ? <span className="text-purple-600 font-bold">Si</span> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {t.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right"><div style={{ display: "inline-flex", gap: 4 }}><BotonIcono variante="normal" icono={<Edit2 size={13} />} titulo="Editar tipo de licencia" ariaLabel="Editar tipo de licencia" disabled={bloqueado} onClick={() => abrirEdicion(t)} /><BotonIcono variante={t.activo ? "peligro" : "normal"} icono={t.activo ? <Ban size={13} /> : <Play size={13} />} titulo={t.activo ? "Desactivar tipo" : "Activar tipo"} ariaLabel={t.activo ? "Desactivar tipo" : "Activar tipo"} disabled={bloqueado} onClick={() => toggleTipoActivo(t.id)} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Catálogo de Software Homologado */}
      {subSeccion === "software" && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h4 className="text-sm font-bold text-slate-800">
              Catálogo de productos de software y condición de autorización
            </h4>
            <p className="text-xs text-slate-500">
              Gobernanza de software permitido en el parque tecnológico corporativo para detección de activos no autorizados.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Producto de software</th>
                  <th className="py-2.5 px-3">Editor / Fabricante</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Condición institucional</th>
                  <th className="py-2.5 px-3 text-right">Modificar condición</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {software.map((sw) => (
                  <tr key={sw.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{sw.producto}</td>
                    <td className="py-2.5 px-3 text-slate-600">{sw.editor}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{sw.categoria}</td>
                    <td className="py-2.5 px-3">
                      {sw.condicion === "autorizado" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Autorizado
                        </span>
                      )}
                      {sw.condicion === "restringido" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Restringido (Exige aprobación)
                        </span>
                      )}
                      {sw.condicion === "prohibido" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                          Prohibido (Genera alerta)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <select
                        value={sw.condicion}
                        disabled={bloqueado}
                        onChange={(e) => cambiarCondicionSoftware(sw.id, e.target.value as any)}
                        className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700"
                      >
                        <option value="autorizado">Autorizado</option>
                        <option value="restringido">Restringido</option>
                        <option value="prohibido">Prohibido</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Tipo */}
      {modalTipo.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                {modalTipo.esNuevo ? "Nuevo tipo de licencia" : "Editar tipo de licencia"}
              </h3>
              <button onClick={() => setModalTipo({ abierto: false, esNuevo: true })} className="text-slate-400 hover:text-slate-600 font-bold text-xs">
                Cerrar
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Código (inmutable)</label>
                <input
                  type="text"
                  disabled={!modalTipo.esNuevo}
                  value={formTipo.codigo || ""}
                  onChange={(e) => setFormTipo({ ...formTipo, codigo: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono uppercase"
                  placeholder="EJ: SUBS_USER"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre descriptivo</label>
                <input
                  type="text"
                  value={formTipo.nombre || ""}
                  onChange={(e) => setFormTipo({ ...formTipo, nombre: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                  placeholder="EJ: Suscripción por usuario activo"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Métrica de consumo SAM</label>
                <select
                  value={formTipo.metrica || "usuario_nominal"}
                  onChange={(e) => setFormTipo({ ...formTipo, metrica: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="usuario_nominal">Usuario nominal (Asignado a persona)</option>
                  <option value="usuario_concurrente">Usuario concurrente (Puestos simultáneos)</option>
                  <option value="dispositivo">Dispositivo (Ligado a equipo físico)</option>
                  <option value="nucleo_procesador">Por núcleo de procesador (Core-based)</option>
                  <option value="servidor_instancia">Por servidor / instancia virtual</option>
                  <option value="sitio_corporativa">Corporativa o de sitio (Enterprise)</option>
                  <option value="sin_limite">Sin límite (Código abierto / Libre)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formTipo.vence}
                    onChange={(e) => setFormTipo({ ...formTipo, vence: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Licencia con fecha de vencimiento (Término)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formTipo.requiere_clave}
                    onChange={(e) => setFormTipo({ ...formTipo, requiere_clave: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Requiere clave o número de serie (Cifrado sensible)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formTipo.reasignable}
                    onChange={(e) => setFormTipo({ ...formTipo, reasignable: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Permite reasignación a otro usuario o activo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formTipo.requiere_contrato}
                    onChange={(e) => setFormTipo({ ...formTipo, requiere_contrato: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">Exige asociar un contrato con proveedor (Módulo 8)</span>
                </label>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setModalTipo({ abierto: false, esNuevo: true })} className="px-3 py-1.5 text-xs font-semibold text-slate-600">
                Cancelar
              </button>
              <button
                onClick={guardarTipo}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm"
              >
                Guardar tipo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
