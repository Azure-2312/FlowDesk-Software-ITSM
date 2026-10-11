"use client";

import React, { useState } from "react";

export type PoliticaEdicion = "solo_rfc" | "excepcion_con_motivo" | "libre";

export interface FuenteDatoItem {
  id: string;
  nombre: string;
  prioridad: number;
  confiable: boolean;
  bloqueado: boolean;
}

export interface AtributoProtegidoItem {
  id: string;
  clase: string;
  atributo: string;
  entorno: string;
  criticidad_minima: string;
  politica: PoliticaEdicion;
}

export interface FuentesAtributosProtegidosData {
  fuentes?: FuenteDatoItem[];
  atributos_protegidos?: AtributoProtegidoItem[];
}

interface Props {
  datos: FuentesAtributosProtegidosData;
  onChange: (nuevosDatos: FuentesAtributosProtegidosData) => void;
  bloqueado: boolean;
}

export function PestanaFuentesAtributosProtegidos({ datos, onChange, bloqueado }: Props) {
  const fuentes: FuenteDatoItem[] = datos?.fuentes || [];
  const protegidos: AtributoProtegidoItem[] = datos?.atributos_protegidos || [];

  const [modalAtributo, setModalAtributo] = useState<{ abierto: boolean; item?: AtributoProtegidoItem; esNuevo: boolean }>({
    abierto: false,
    esNuevo: true
  });
  const [formAtributo, setFormAtributo] = useState<Partial<AtributoProtegidoItem>>({});
  const [simuladorAbierto, setSimuladorAbierto] = useState(false);

  // Estados de simulación
  const [simAtributo, setSimAtributo] = useState("ip_principal");
  const [simEntorno, setSimEntorno] = useState("PRODUCCION");
  const [simCriticidad, setSimCriticidad] = useState("ALTA");

  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const abrirNuevoAtributo = () => {
    setFormAtributo({
      id: `prot_${Date.now()}`,
      clase: "todas",
      atributo: "",
      entorno: "PRODUCCION",
      criticidad_minima: "MEDIA",
      politica: "solo_rfc"
    });
    setModalAtributo({ abierto: true, esNuevo: true });
  };

  const guardarAtributo = () => {
    if (bloqueado || !formAtributo.atributo?.trim()) return;
    let actualizados: AtributoProtegidoItem[];
    if (modalAtributo.esNuevo) {
      actualizados = [...protegidos, formAtributo as AtributoProtegidoItem];
    } else {
      actualizados = protegidos.map((p) => (p.id === formAtributo.id ? (formAtributo as AtributoProtegidoItem) : p));
    }
    onChange({ ...datos, atributos_protegidos: actualizados });
    setModalAtributo({ abierto: false, esNuevo: false });
    mostrarToast("Regla de atributo protegido guardada.");
  };

  const eliminarAtributo = (id: string) => {
    if (bloqueado) return;
    const actualizados = protegidos.filter((p) => p.id !== id);
    onChange({ ...datos, atributos_protegidos: actualizados });
    mostrarToast("Regla de protección eliminada.");
  };

  // Simulación de evaluación
  const reglaEncontrada = protegidos.find((p) => {
    const coincideAttr = p.atributo === simAtributo || p.atributo === "todas";
    const coincideEntorno = p.entorno === simEntorno || p.entorno === "TODOS";
    return coincideAttr && coincideEntorno;
  });

  const politicaEfectiva = reglaEncontrada ? reglaEncontrada.politica : "libre";

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMensaje && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-sm transition-opacity">
          {toastMensaje}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Fuentes de Datos y Control de Atributos Protegidos
          </h2>
          <p className="text-sm text-slate-500">
            Políticas de reconciliación de datos y restricciones para asegurar que ningún parámetro crítico en producción cambie sin una RFC aprobada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSimuladorAbierto(true)}
            className="px-3 py-2 border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 text-sm font-semibold rounded-md shadow-sm"
          >
            Simulador de política de edición
          </button>
          <button
            type="button"
            disabled={bloqueado}
            onClick={abrirNuevoAtributo}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm disabled:opacity-50"
          >
            + Agregar atributo protegido
          </button>
        </div>
      </div>

      {/* Jerarquía de Fuentes de Datos Autorizadas */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
          Fuentes de Datos y Jerarquía de Reconciliación
        </h3>
        <p className="text-xs text-slate-500">
          En caso de discrepancia en una actualización masiva, prevalece la fuente con mayor nivel de prioridad (1 = máxima prioridad).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {fuentes.map((f) => (
            <div key={f.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 text-xs">{f.nombre}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
                  Prioridad #{f.prioridad}
                </span>
              </div>
              <span className={`text-[11px] font-medium block ${f.confiable ? "text-emerald-700" : "text-amber-700"}`}>
                {f.confiable ? "Fuente altamente confiable" : "Requiere auditoría posterior"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de Atributos Protegidos */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800">
            Reglas de Protección de Atributos Críticos
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Clase de CI</th>
                <th className="px-4 py-3">Atributo Protegido</th>
                <th className="px-4 py-3 text-center">Entorno</th>
                <th className="px-4 py-3 text-center">Criticidad Mínima</th>
                <th className="px-4 py-3">Política de Edición Directa</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {protegidos.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800 capitalize">
                    {item.clase.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-indigo-700">
                    {item.atributo}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold font-mono">
                      {item.entorno}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">
                    &ge; {item.criticidad_minima}
                  </td>
                  <td className="px-4 py-3">
                    {item.politica === "solo_rfc" && (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        Solo mediante RFC Aprobada (Prompt 2)
                      </span>
                    )}
                    {item.politica === "excepcion_con_motivo" && (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Excepción permitida con motivo formal
                      </span>
                    )}
                    {item.politica === "libre" && (
                      <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Edición libre sin restricciones
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={bloqueado}
                      onClick={() => eliminarAtributo(item.id)}
                      className="text-rose-600 hover:text-rose-800 font-semibold disabled:opacity-50"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Simulador de Política de Edición */}
      {simuladorAbierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Simulador de Política de Modificación Directa
              </h3>
              <button
                type="button"
                onClick={() => setSimuladorAbierto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Verifique qué requisitos exige el sistema ante un intento de cambio de campo según el entorno y criticidad del elemento.
            </p>

            <div className="space-y-3 bg-slate-50 p-4 rounded-md border border-slate-200 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campo / Atributo a modificar:</label>
                <select
                  value={simAtributo}
                  onChange={(e) => setSimAtributo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                >
                  <option value="ip_principal">ip_principal (Dirección IP de producción)</option>
                  <option value="version_software">version_software (Versión de release)</option>
                  <option value="sistema_operativo">sistema_operativo (Distribución SO)</option>
                  <option value="relaciones_cmdb">relaciones_cmdb (Vínculos topológicos)</option>
                  <option value="firmware">firmware (Firmware de switch o router)</option>
                  <option value="memoria_ram_gb">memoria_ram_gb (Capacidad RAM)</option>
                  <option value="observaciones">observaciones (Comentarios generales)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entorno del CI:</label>
                  <select
                    value={simEntorno}
                    onChange={(e) => setSimEntorno(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="PRODUCCION">PRODUCCION</option>
                    <option value="PREPRODUCCION">PREPRODUCCION</option>
                    <option value="DESARROLLO">DESARROLLO</option>
                    <option value="PRUEBAS">PRUEBAS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Criticidad del CI:</label>
                  <select
                    value={simCriticidad}
                    onChange={(e) => setSimCriticidad(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="CRITICA">CRITICA</option>
                    <option value="ALTA">ALTA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="BAJA">BAJA</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-white border border-indigo-200 rounded-md mt-3 text-center">
                <span className="text-xs text-slate-500 block">Política de Aplicación Resultante:</span>
                <span className="text-sm font-extrabold text-indigo-700 block mt-1">
                  {politicaEfectiva === "solo_rfc" && "Bloqueado para edición directa: Exige RFC autorizada"}
                  {politicaEfectiva === "excepcion_con_motivo" && "Permitido con justificación formal obligatoria"}
                  {politicaEfectiva === "libre" && "Edición directa libre autorizada"}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {politicaEfectiva === "solo_rfc"
                    ? "Los cambios en este atributo solo pueden plasmarse mediante el botón [Aplicar a la CMDB] de una RFC aprobada."
                    : "El usuario debe registrar el motivo del cambio el cual quedará registrado en el log inmutable de auditoría."}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSimuladorAbierto(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold"
              >
                Cerrar simulador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Atributo */}
      {modalAtributo.abierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">
              Agregar Regla de Atributo Protegido
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre técnico del atributo</label>
                <input
                  type="text"
                  value={formAtributo.atributo || ""}
                  onChange={(e) => setFormAtributo({ ...formAtributo, atributo: e.target.value })}
                  placeholder="Ej: direccion_mac, hostname, firmware..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Política de Edición</label>
                <select
                  value={formAtributo.politica || "solo_rfc"}
                  onChange={(e) => setFormAtributo({ ...formAtributo, politica: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded"
                >
                  <option value="solo_rfc">Solo mediante RFC Aprobada</option>
                  <option value="excepcion_con_motivo">Excepción permitida con motivo</option>
                  <option value="libre">Libre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entorno</label>
                  <select
                    value={formAtributo.entorno || "PRODUCCION"}
                    onChange={(e) => setFormAtributo({ ...formAtributo, entorno: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="PRODUCCION">PRODUCCION</option>
                    <option value="PREPRODUCCION">PREPRODUCCION</option>
                    <option value="TODOS">TODOS</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Criticidad Mínima</label>
                  <select
                    value={formAtributo.criticidad_minima || "ALTA"}
                    onChange={(e) => setFormAtributo({ ...formAtributo, criticidad_minima: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="CRITICA">CRITICA</option>
                    <option value="ALTA">ALTA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="BAJA">BAJA</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalAtributo({ abierto: false, esNuevo: true })}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarAtributo}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
