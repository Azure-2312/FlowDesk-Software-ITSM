"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { X, Trash2 } from "@/shared/components/ui/Iconos";

export interface TipoMantenimiento {
  id: string;
  nombre: string;
  genera_ticket: boolean;
  rfc_estandar_permitida: boolean;
  activo: boolean;
}

export interface PlanMantenimiento {
  id: number;
  nombre: string;
  aplica_a: string;
  frecuencia_meses: number;
  checklist_tareas: string[];
  responsable_grupo: string;
  accion_vencimiento: "crear_solicitud_servicio" | "crear_rfc_estandar" | "solo_notificar";
  anticipacion_dias: number;
  activo: boolean;
}

export interface PoliticaFinVida {
  anticipacion_alerta_meses: number;
  accion_sugerida: "planificar_reemplazo" | "retirar";
  usar_fechas_eol_eos_modelo: boolean;
  cambiar_estado_a_obsoleto_automatico: boolean;
  suspender_alertas_si_en_reparacion: boolean;
}

export interface MantenimientoFinVidaData {
  tipos_mantenimiento?: TipoMantenimiento[];
  planes_preventivos?: PlanMantenimiento[];
  politica_fin_vida?: PoliticaFinVida;
}

interface Props {
  datos: MantenimientoFinVidaData;
  onChange: (nuevosDatos: MantenimientoFinVidaData) => void;
  bloqueado: boolean;
}

export function PestanaMantenimientoFinVida({ datos, onChange, bloqueado }: Props) {
  const [modalPlan, setModalPlan] = useState(false);
  const [nuevoPlan, setNuevoPlan] = useState<Partial<PlanMantenimiento>>({
    nombre: "",
    aplica_a: "portatil",
    frecuencia_meses: 6,
    checklist_tareas: ["Limpieza y soplado de polvo", "Prueba de diagnÃ³stico de hardware"],
    responsable_grupo: "Soporte TÃ©cnico Nivel 1",
    accion_vencimiento: "crear_solicitud_servicio",
    anticipacion_dias: 15,
    activo: true
  });
  const [modalSimulacion12Meses, setModalSimulacion12Meses] = useState(false);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const tipos = datos?.tipos_mantenimiento || [
    { id: "preventivo", nombre: "Mantenimiento preventivo periÃ³dico", genera_ticket: true, rfc_estandar_permitida: true, activo: true },
    { id: "correctivo", nombre: "Mantenimiento correctivo por averÃ­a", genera_ticket: true, rfc_estandar_permitida: false, activo: true },
    { id: "calibracion", nombre: "CalibraciÃ³n y certificaciÃ³n tÃ©cnica", genera_ticket: true, rfc_estandar_permitida: true, activo: true },
    { id: "actualizacion", nombre: "ActualizaciÃ³n de hardware o firmware", genera_ticket: false, rfc_estandar_permitida: true, activo: true }
  ];

  const planes = datos?.planes_preventivos || [
    {
      id: 1,
      nombre: "Mantenimiento Preventivo Semestral de PortÃ¡tiles",
      aplica_a: "portatil",
      frecuencia_meses: 6,
      checklist_tareas: ["Limpieza interna de ventiladores", "Cambio de pasta tÃ©rmica si aplica", "DiagnÃ³stico de baterÃ­a", "ActualizaciÃ³n de BIOS"],
      responsable_grupo: "Soporte TÃ©cnico Nivel 1",
      accion_vencimiento: "crear_solicitud_servicio",
      anticipacion_dias: 15,
      activo: true
    },
    {
      id: 2,
      nombre: "InspecciÃ³n Anual de Servidores de Infraestructura Central",
      aplica_a: "servidor_fisico",
      frecuencia_meses: 12,
      checklist_tareas: ["VerificaciÃ³n de fuentes redundantes", "InspecciÃ³n de discos RAID", "ComprobaciÃ³n de firmware iLO/iDRAC"],
      responsable_grupo: "Infraestructura y Redes",
      accion_vencimiento: "crear_rfc_estandar",
      anticipacion_dias: 30,
      activo: true
    }
  ];

  const politica = datos?.politica_fin_vida || {
    anticipacion_alerta_meses: 6,
    accion_sugerida: "planificar_reemplazo",
    usar_fechas_eol_eos_modelo: true,
    cambiar_estado_a_obsoleto_automatico: false,
    suspender_alertas_si_en_reparacion: true
  };

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const actualizarPolitica = (campos: Partial<PoliticaFinVida>) => {
    if (bloqueado) return;
    onChange({
      ...datos,
      politica_fin_vida: { ...politica, ...campos }
    });
  };

  const toggleTipoGeneraTicket = (id: string) => {
    if (bloqueado) return;
    const act = tipos.map((t) => (t.id === id ? { ...t, genera_ticket: !t.genera_ticket } : t));
    onChange({ ...datos, tipos_mantenimiento: act });
  };

  const toggleTipoRFC = (id: string) => {
    if (bloqueado) return;
    const act = tipos.map((t) => (t.id === id ? { ...t, rfc_estandar_permitida: !t.rfc_estandar_permitida } : t));
    onChange({ ...datos, tipos_mantenimiento: act });
  };

  const guardarNuevoPlan = () => {
    if (bloqueado || !nuevoPlan.nombre) return;
    const creado: PlanMantenimiento = {
      id: Date.now(),
      nombre: nuevoPlan.nombre,
      aplica_a: nuevoPlan.aplica_a || "portatil",
      frecuencia_meses: nuevoPlan.frecuencia_meses || 6,
      checklist_tareas: nuevoPlan.checklist_tareas || [],
      responsable_grupo: nuevoPlan.responsable_grupo || "Soporte TI",
      accion_vencimiento: nuevoPlan.accion_vencimiento || "crear_solicitud_servicio",
      anticipacion_dias: nuevoPlan.anticipacion_dias || 15,
      activo: true
    };
    onChange({
      ...datos,
      planes_preventivos: [...planes, creado]
    });
    setModalPlan(false);
    mostrarToast("Plan de mantenimiento preventivo registrado en borrador.");
  };

  const eliminarPlan = (id: number) => {
    if (bloqueado) return;
    const act = planes.filter((p) => p.id !== id);
    onChange({ ...datos, planes_preventivos: act });
    mostrarToast("Plan eliminado.");
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
            Mantenimiento preventivo, garantÃ­as y fin de vida Ãºtil
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Planes periÃ³dicos, emisiÃ³n de RFCs estÃ¡ndar de mantenimiento y polÃ­ticas de obsolescencia anticipada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalSimulacion12Meses(true)}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100"
          >
            Simular prÃ³ximos 12 meses
          </button>
          <button
            onClick={() => setModalPlan(true)}
            disabled={bloqueado}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
          >
            + Nuevo plan preventivo
          </button>
        </div>
      </div>

      {/* 1. Planes de mantenimiento preventivo */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h4 className="text-sm font-bold text-slate-800">Planes de mantenimiento preventivo programados</h4>
          <p className="text-xs text-slate-500">
            Generan solicitudes de servicio o RFCs estÃ¡ndar con las tareas prescritas al cumplirse el perÃ­odo.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Plan institucional</th>
                <th className="py-2.5 px-3">Aplica a</th>
                <th className="py-2.5 px-3">Frecuencia</th>
                <th className="py-2.5 px-3">Grupo responsable</th>
                <th className="py-2.5 px-3">AcciÃ³n al vencer</th>
                <th className="py-2.5 px-3">AnticipaciÃ³n</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {planes.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{p.nombre}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 uppercase">{p.aplica_a}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">Cada {p.frecuencia_meses} meses</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.responsable_grupo}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        p.accion_vencimiento === "crear_rfc_estandar"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {p.accion_vencimiento === "crear_rfc_estandar" ? "Crear RFC estÃ¡ndar" : "Crear Solicitud"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{p.anticipacion_dias} dÃ­as antes</td>
                  <td className="py-2.5 px-3 text-right">
                    <BotonIcono
                      variante="peligro"
                      icono={<Trash2 size={13} />}
                      titulo="Eliminar plan preventivo"
                      ariaLabel={`Eliminar plan preventivo ${p.nombre}`}
                      onClick={() => eliminarPlan(p.id)}
                      disabled={bloqueado}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Tipos de Mantenimiento y PolÃ­tica de Fin de Vida */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipos de mantenimiento */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <div className="pb-2 border-b border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Tipos de mantenimiento autorizados
            </h4>
            <p className="text-[11px] text-slate-400">
              DefiniciÃ³n de quÃ© tipos pueden canalizarse como RFC estÃ¡ndar o ticket de soporte.
            </p>
          </div>

          <div className="space-y-2">
            {tipos.map((t) => (
              <div key={t.id} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 block">{t.nombre}</span>
                <div className="flex items-center gap-4 text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.genera_ticket}
                      disabled={bloqueado}
                      onChange={() => toggleTipoGeneraTicket(t.id)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span>Genera ticket ITSM</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={t.rfc_estandar_permitida}
                      disabled={bloqueado}
                      onChange={() => toggleTipoRFC(t.id)}
                      className="rounded border-slate-300 text-purple-600"
                    />
                    <span>Puede ser RFC estÃ¡ndar</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PolÃ­tica de fin de vida y obsolescencia */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <div className="pb-2 border-b border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              PolÃ­tica de obsolescencia y fin de vida (EOL / EOS)
            </h4>
            <p className="text-[11px] text-slate-400">
              Reglas de reemplazo preventivo antes de llegar a la obsolescencia tÃ©cnica.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                AnticipaciÃ³n para alertar fin de vida Ãºtil
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={politica.anticipacion_alerta_meses}
                  disabled={bloqueado}
                  onChange={(e) => actualizarPolitica({ anticipacion_alerta_meses: parseInt(e.target.value, 10) })}
                  className="w-20 px-2 py-1 border border-slate-300 rounded font-mono"
                />
                <span className="text-slate-600">meses antes de la fecha lÃ­mite</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">AcciÃ³n sugerida institucional</label>
              <select
                value={politica.accion_sugerida}
                disabled={bloqueado}
                onChange={(e) => actualizarPolitica({ accion_sugerida: e.target.value as any })}
                className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs"
              >
                <option value="planificar_reemplazo">Planificar reemplazo en presupuesto anual</option>
                <option value="retirar">Retirar inmediatamente al vencer soporte</option>
              </select>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={politica.usar_fechas_eol_eos_modelo}
                disabled={bloqueado}
                onChange={(e) => actualizarPolitica({ usar_fechas_eol_eos_modelo: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Usar fechas de fin de venta (EOL) y fin de soporte (EOS) del modelo
                </span>
                <span className="text-slate-500 text-[11px]">
                  Cruza automÃ¡ticamente con la base de datos de modelos homologados de 1.5.1.2.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={politica.suspender_alertas_si_en_reparacion}
                disabled={bloqueado}
                onChange={(e) => actualizarPolitica({ suspender_alertas_si_en_reparacion: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Suspender alertas de garantÃ­a si el activo se encuentra "En reparaciÃ³n"
                </span>
                <span className="text-slate-500 text-[11px]">
                  Evita notificaciones innecesarias mientras el equipo estÃ¡ bajo servicio tÃ©cnico.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Modal Crear Plan */}
      {modalPlan && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Nuevo plan de mantenimiento preventivo</h3>
              <BotonIcono variante="normal" icono={<X size={14} />} titulo="Cerrar modal" ariaLabel="Cerrar modal" onClick={() => setModalPlan(false)} />
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del plan</label>
                <input
                  type="text"
                  value={nuevoPlan.nombre || ""}
                  onChange={(e) => setNuevoPlan({ ...nuevoPlan, nombre: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                  placeholder="EJ: Limpieza trimestral de switches"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frecuencia (meses)</label>
                  <input
                    type="number"
                    value={nuevoPlan.frecuencia_meses || 6}
                    onChange={(e) => setNuevoPlan({ ...nuevoPlan, frecuencia_meses: parseInt(e.target.value, 10) })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">AnticipaciÃ³n (dÃ­as)</label>
                  <input
                    type="number"
                    value={nuevoPlan.anticipacion_dias || 15}
                    onChange={(e) => setNuevoPlan({ ...nuevoPlan, anticipacion_dias: parseInt(e.target.value, 10) })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">AcciÃ³n al vencer el plazo</label>
                <select
                  value={nuevoPlan.accion_vencimiento || "crear_solicitud_servicio"}
                  onChange={(e) => setNuevoPlan({ ...nuevoPlan, accion_vencimiento: e.target.value as any })}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs"
                >
                  <option value="crear_solicitud_servicio">Crear Solicitud de Servicio</option>
                  <option value="crear_rfc_estandar">Crear Solicitud de Cambio EstÃ¡ndar (RFC)</option>
                  <option value="solo_notificar">Solo Notificar al Grupo Resolutor</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grupo resolutor asignado</label>
                <input
                  type="text"
                  value={nuevoPlan.responsable_grupo || ""}
                  onChange={(e) => setNuevoPlan({ ...nuevoPlan, responsable_grupo: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-800"
                  placeholder="EJ: Soporte TÃ©cnico Nivel 1"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setModalPlan(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600">
                Cancelar
              </button>
              <button
                onClick={guardarNuevoPlan}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded"
              >
                Guardar plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal SimulaciÃ³n 12 Meses */}
      {modalSimulacion12Meses && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                SimulaciÃ³n de Mantenimientos Preventivos â€” PrÃ³ximos 12 meses
              </h3>
              <BotonIcono variante="normal" icono={<X size={14} />} titulo="Cerrar modal" ariaLabel="Cerrar modal" onClick={() => setModalSimulacion12Meses(false)} />
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600">
                ProyecciÃ³n de carga operativa segÃºn el parque actual de 5 activos registrados:
              </p>
              <div className="space-y-2 border border-slate-200 rounded p-3 bg-slate-50">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">Noviembre 2026:</span>
                  <span className="font-mono text-indigo-700 font-bold">2 servicios (PortÃ¡tiles L1)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">Enero 2027:</span>
                  <span className="font-mono text-purple-700 font-bold">1 RFC estÃ¡ndar (Servidor Central)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-700">Mayo 2027:</span>
                  <span className="font-mono text-indigo-700 font-bold">2 servicios (PortÃ¡tiles L1)</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setModalSimulacion12Meses(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
