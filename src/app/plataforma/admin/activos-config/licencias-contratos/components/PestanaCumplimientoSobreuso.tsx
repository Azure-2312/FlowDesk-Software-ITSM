"use client";

import React, { useState } from "react";

export interface CumplimientoSobreusoData {
  umbral_riesgo_porcentaje?: number;
  accion_sobreasignacion?: "bloquear" | "aprobar" | "alertar";
  alertas_sobreuso_activas?: boolean;
  destinatarios_alerta_sobreuso?: string[];
  frecuencia_repeticion_alerta_dias?: number;
  dias_escalamiento_sobreuso?: number;
  reclamacion_automatica_activo_baja?: boolean;
  reclamacion_automatica_usuario_desactivado?: boolean;
  alerta_software_no_autorizado?: boolean;
  dias_inactividad_reporte_licencias_libres?: number;
}

interface Props {
  datos: CumplimientoSobreusoData;
  onChange: (nuevosDatos: CumplimientoSobreusoData) => void;
  bloqueado: boolean;
}

interface LicenciaSimulada {
  id: string;
  producto: string;
  adquiridas: number;
  asignadas: number;
  vencida: boolean;
}

const LICENCIAS_MUESTRA: LicenciaSimulada[] = [
  { id: "LIC-001", producto: "Microsoft 365 E5", adquiridas: 100, asignadas: 75, vencida: false },
  { id: "LIC-002", producto: "Adobe Creative Cloud All Apps", adquiridas: 50, asignadas: 46, vencida: false },
  { id: "LIC-003", producto: "JetBrains All Products Pack", adquiridas: 30, asignadas: 33, vencida: false },
  { id: "LIC-004", producto: "AutoCAD 2024 Comercial", adquiridas: 10, asignadas: 8, vencida: true },
  { id: "LIC-005", producto: "Red Hat Enterprise Linux Server", adquiridas: 20, asignadas: 0, vencida: false }
];

export function PestanaCumplimientoSobreuso({ datos, onChange, bloqueado }: Props) {
  const [modalSimulacion, setModalSimulacion] = useState(false);

  const umbral = datos?.umbral_riesgo_porcentaje ?? 90;
  const accion = datos?.accion_sobreasignacion ?? "bloquear";
  const alertasActivas = datos?.alertas_sobreuso_activas ?? true;
  const diasEscalamiento = datos?.dias_escalamiento_sobreuso ?? 7;
  const frecuenciaRepeticion = datos?.frecuencia_repeticion_alerta_dias ?? 3;
  const recActivoBaja = datos?.reclamacion_automatica_activo_baja ?? true;
  const recUsuarioDesactivado = datos?.reclamacion_automatica_usuario_desactivado ?? true;
  const alertaNoAutorizado = datos?.alerta_software_no_autorizado ?? true;
  const diasInactividad = datos?.dias_inactividad_reporte_licencias_libres ?? 60;

  const handleUpdate = (campo: keyof CumplimientoSobreusoData, valor: any) => {
    onChange({
      ...datos,
      [campo]: valor
    });
  };

  const calcularEstadoLicencia = (lic: LicenciaSimulada) => {
    if (lic.vencida) {
      return { estado: "Vencida", color: "bg-red-100 text-red-800 border-red-300" };
    }
    if (lic.adquiridas === 0) {
      return { estado: "Sin datos", color: "bg-slate-100 text-slate-700 border-slate-300" };
    }
    const ratio = (lic.asignadas / lic.adquiridas) * 100;
    if (lic.asignadas > lic.adquiridas) {
      return { estado: "Sobreuso", color: "bg-purple-100 text-purple-800 border-purple-300" };
    }
    if (ratio >= umbral) {
      return { estado: "En riesgo", color: "bg-amber-100 text-amber-800 border-amber-300" };
    }
    return { estado: "Cumple", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Cumplimiento y Control de Sobreuso (SAM)</h2>
          <p className="text-sm text-slate-500">
            Reglas automáticas para determinar el estado de licenciamiento, prevención de sobreasignación y reclamación de licencias desaprovechadas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalSimulacion(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 text-sm font-semibold rounded-md shadow-sm transition-colors"
        >
          Simular cumplimiento
        </button>
      </div>

      {/* Tarjetas de definición de estados calculados */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-3">
          Estados de Cumplimiento Calculados Automáticamente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
            <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">Cumple</span>
            <p className="text-xs text-emerald-700">Consumo inferior al umbral de riesgo configurado.</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <span className="text-xs font-bold text-amber-800 uppercase block mb-1">En riesgo</span>
            <p className="text-xs text-amber-700">Consumo igual o superior al {umbral}% de lo adquirido.</p>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
            <span className="text-xs font-bold text-purple-800 uppercase block mb-1">Sobreuso</span>
            <p className="text-xs text-purple-700">Asignaciones superan la cantidad adquirida.</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <span className="text-xs font-bold text-red-800 uppercase block mb-1">Vencida</span>
            <p className="text-xs text-red-700">La fecha de fin de vigencia ha expirado.</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Sin datos</span>
            <p className="text-xs text-slate-600">Licencia sin cantidad adquirida registrada o métrica no cuantificable.</p>
          </div>
        </div>
      </div>

      {/* Panel de Parámetros y Acciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parámetros de umbral y sobreasignación */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
            Umbrales y Políticas de Asignación
          </h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Umbral de riesgo (% de consumo)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="50"
                max="100"
                disabled={bloqueado}
                value={umbral}
                onChange={(e) => handleUpdate("umbral_riesgo_porcentaje", parseInt(e.target.value) || 90)}
                className="w-24 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100"
              />
              <span className="text-sm text-slate-500">% del total adquirido (Valor de fábrica: 90%)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Al alcanzar este porcentaje, la licencia cambia de estado a "En riesgo" y se disparan notificaciones preventivas.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Acción al intentar asignar por encima de lo adquirido
            </label>
            <select
              disabled={bloqueado}
              value={accion}
              onChange={(e) => handleUpdate("accion_sobreasignacion", e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100"
            >
              <option value="bloquear">Bloquear la asignación (Bloqueo duro obligatorio)</option>
              <option value="aprobar">Permitir únicamente con aprobación formal del Gestor SAM</option>
              <option value="alertar">Permitir y generar alerta inmediata de sobreuso</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Comportamiento aplicado en el formulario de asignación cuando el cupo está agotado.
            </p>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="chkAlertasSobreuso"
                disabled={bloqueado}
                checked={alertasActivas}
                onChange={(e) => handleUpdate("alertas_sobreuso_activas", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <label htmlFor="chkAlertasSobreuso" className="text-sm font-medium text-slate-800">
                  Emitir alertas recurrentes de sobreuso
                </label>
                <p className="text-xs text-slate-500">
                  Notifica al Gestor de Activos y Configuración mientras persista una condición de sobreuso.
                </p>
              </div>
            </div>

            {alertasActivas && (
              <div className="grid grid-cols-2 gap-3 pl-7 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Frecuencia de repetición</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      disabled={bloqueado}
                      value={frecuenciaRepeticion}
                      onChange={(e) => handleUpdate("frecuencia_repeticion_alerta_dias", parseInt(e.target.value) || 3)}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
                    />
                    <span className="text-xs text-slate-500">días</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Escalamiento si no regulariza</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      disabled={bloqueado}
                      value={diasEscalamiento}
                      onChange={(e) => handleUpdate("dias_escalamiento_sobreuso", parseInt(e.target.value) || 7)}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
                    />
                    <span className="text-xs text-slate-500">días</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Políticas de Reclamación y Cumplimiento de Software */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
            Reclamación Automática y Seguridad
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="chkRecActivoBaja"
                disabled={bloqueado}
                checked={recActivoBaja}
                onChange={(e) => handleUpdate("reclamacion_automatica_activo_baja", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <label htmlFor="chkRecActivoBaja" className="text-sm font-medium text-slate-800">
                  Liberar licencias al dar de baja o retirar un activo
                </label>
                <p className="text-xs text-slate-500">
                  Al completar la transición a "Dado de baja" o "Retirado", todas las licencias por dispositivo asignadas se desvinculan y retornan al stock disponible.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="chkRecUsuarioDesactivado"
                disabled={bloqueado}
                checked={recUsuarioDesactivado}
                onChange={(e) => handleUpdate("reclamacion_automatica_usuario_desactivado", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <label htmlFor="chkRecUsuarioDesactivado" className="text-sm font-medium text-slate-800">
                  Liberar licencias al desactivar a un usuario
                </label>
                <p className="text-xs text-slate-500">
                  Al inactivar o dar de baja a un usuario en el sistema de gestión de personal, las licencias nominales vinculadas se liberan automáticamente.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="chkAlertaNoAutorizado"
                disabled={bloqueado}
                checked={alertaNoAutorizado}
                onChange={(e) => handleUpdate("alerta_software_no_autorizado", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <label htmlFor="chkAlertaNoAutorizado" className="text-sm font-medium text-slate-800">
                  Detección de software no autorizado
                </label>
                <p className="text-xs text-slate-500">
                  Si un producto catalogado como "Prohibido" o "Restringido" aparece instalado sin autorización previa, se genera alerta de seguridad y tarea de regularización inmediata.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reporte de licencias libres inactivas (Optimización de costos)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="15"
                max="365"
                disabled={bloqueado}
                value={diasInactividad}
                onChange={(e) => handleUpdate("dias_inactividad_reporte_licencias_libres", parseInt(e.target.value) || 60)}
                className="w-24 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100"
              />
              <span className="text-sm text-slate-500">días sin asignación activa</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Identifica licencias adquiridas que no han sido asignadas a ningún usuario o equipo en el período seleccionado para sugerir no renovación o reducción de cupos.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Simulación de Cumplimiento */}
      {modalSimulacion && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Simulación de Cumplimiento de Licencias
              </h3>
              <button
                type="button"
                onClick={() => setModalSimulacion(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded text-xs text-slate-600">
              Evaluación en tiempo real aplicando el umbral de riesgo actual (<strong>{umbral}%</strong>) y regla de sobreasignación (<strong>{accion}</strong>) sobre datos representativos del catálogo.
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Producto de software</th>
                    <th className="px-3 py-2 text-right">Adquiridas</th>
                    <th className="px-3 py-2 text-right">Asignadas</th>
                    <th className="px-3 py-2 text-right">% Uso</th>
                    <th className="px-3 py-2 text-center">Estado resultante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {LICENCIAS_MUESTRA.map((lic) => {
                    const { estado, color } = calcularEstadoLicencia(lic);
                    const pct = lic.adquiridas > 0 ? ((lic.asignadas / lic.adquiridas) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={lic.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-slate-600">{lic.id}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">{lic.producto}</td>
                        <td className="px-3 py-2 text-right">{lic.adquiridas}</td>
                        <td className="px-3 py-2 text-right">{lic.asignadas}</td>
                        <td className="px-3 py-2 text-right font-medium">{pct}%</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${color}`}>
                            {estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setModalSimulacion(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold"
              >
                Aceptar y cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
