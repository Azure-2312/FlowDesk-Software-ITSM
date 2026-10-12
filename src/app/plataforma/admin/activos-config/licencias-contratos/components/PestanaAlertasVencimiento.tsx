"use client";

import React, { useState } from "react";

export interface ReglaAlertaItem {
  id: string;
  entidad: string;
  fecha_base: string;
  anticipaciones_dias: number[];
  destinatarios: string[];
  activo: boolean;
  canal?: "correo" | "sistema" | "ambos";
  escalamiento_dias?: number;
  permite_snooze?: boolean;
}

export interface AlertasVencimientoData {
  alertas?: ReglaAlertaItem[];
}

interface Props {
  datos: AlertasVencimientoData;
  onChange: (nuevosDatos: AlertasVencimientoData) => void;
  bloqueado: boolean;
}

const ALERTAS_FABRICA_DEFAULT: ReglaAlertaItem[] = [
  {
    id: "licencia_vencimiento",
    entidad: "Licencia de software",
    fecha_base: "Fecha de vencimiento",
    anticipaciones_dias: [90, 60, 30, 15, 7, 0],
    destinatarios: ["Responsable de la licencia", "Gestor de Activos y Configuración"],
    activo: true,
    canal: "ambos",
    escalamiento_dias: 5,
    permite_snooze: true
  },
  {
    id: "licencia_soporte",
    entidad: "Soporte de licencia",
    fecha_base: "Fin de soporte técnico",
    anticipaciones_dias: [60, 30, 7],
    destinatarios: ["Responsable de la licencia", "Gestor de Activos y Configuración"],
    activo: true,
    canal: "ambos",
    escalamiento_dias: 7,
    permite_snooze: true
  },
  {
    id: "contrato_fin",
    entidad: "Contrato con proveedor",
    fecha_base: "Fecha de fin y límite de no renovación",
    anticipaciones_dias: [120, 90, 60, 30, 15, 0],
    destinatarios: ["Responsable del contrato", "Gestor de Activos y Configuración", "Gestor de Área"],
    activo: true,
    canal: "ambos",
    escalamiento_dias: 10,
    permite_snooze: false
  },
  {
    id: "garantia_activo",
    entidad: "Garantía de hardware",
    fecha_base: "Fin de garantía de fábrica",
    anticipaciones_dias: [60, 30, 7],
    destinatarios: ["Gestor de Activos y Configuración", "Custodio del activo"],
    activo: true,
    canal: "sistema",
    escalamiento_dias: 0,
    permite_snooze: true
  },
  {
    id: "eol_eos_modelo",
    entidad: "Fin de vida del modelo (EOL/EOS)",
    fecha_base: "Fecha EOL/EOS homologada",
    anticipaciones_dias: [180, 90],
    destinatarios: ["Gestor de Activos y Configuración"],
    activo: true,
    canal: "sistema",
    escalamiento_dias: 15,
    permite_snooze: true
  },
  {
    id: "fin_vida_activo",
    entidad: "Fin de vida útil del activo",
    fecha_base: "Fecha de fin de vida calculada",
    anticipaciones_dias: [180, 90, 30],
    destinatarios: ["Gestor de Activos y Configuración"],
    activo: true,
    canal: "sistema",
    escalamiento_dias: 15,
    permite_snooze: true
  },
  {
    id: "prestamo_activo",
    entidad: "Préstamo temporal de equipo",
    fecha_base: "Fecha prevista de devolución",
    anticipaciones_dias: [3, 1, 0, -1, -7],
    destinatarios: ["Custodio", "Supervisor"],
    activo: true,
    canal: "ambos",
    escalamiento_dias: 2,
    permite_snooze: false
  },
  {
    id: "revision_cmdb",
    entidad: "Auditoría periódica de CMDB",
    fecha_base: "Fecha programada de campaña",
    anticipaciones_dias: [14, 3],
    destinatarios: ["Responsable de la campaña"],
    activo: true,
    canal: "ambos",
    escalamiento_dias: 3,
    permite_snooze: true
  }
];

const ROLES_DISPONIBLES = [
  "Gestor de Activos y Configuración",
  "Responsable de la licencia",
  "Responsable del contrato",
  "Custodio del activo",
  "Custodio",
  "Supervisor",
  "Gestor de Área",
  "Responsable de la campaña",
  "Administrador"
];

export function PestanaAlertasVencimiento({ datos, onChange, bloqueado }: Props) {
  const alertas: ReglaAlertaItem[] = datos?.alertas && datos.alertas.length > 0
    ? datos.alertas
    : ALERTAS_FABRICA_DEFAULT;

  const [modalEdicion, setModalEdicion] = useState<{ abierto: boolean; item?: ReglaAlertaItem }>({
    abierto: false
  });
  const [formItem, setFormItem] = useState<Partial<ReglaAlertaItem>>({});
  const [diasInput, setDiasInput] = useState<string>("");
  const [modalPrueba, setModalPrueba] = useState(false);
  const [correoPrueba, setCorreoPrueba] = useState("");
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const handleToggleActivo = (id: string) => {
    if (bloqueado) return;
    const actualizadas = alertas.map((a) => (a.id === id ? { ...a, activo: !a.activo } : a));
    onChange({ ...datos, alertas: actualizadas });
  };

  const abrirModalEditar = (item: ReglaAlertaItem) => {
    setFormItem({ ...item });
    setDiasInput((item.anticipaciones_dias || []).join(", "));
    setModalEdicion({ abierto: true, item });
  };

  const guardarEdicion = () => {
    if (bloqueado || !modalEdicion.item) return;
    const diasParsed = diasInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    const itemActualizado: ReglaAlertaItem = {
      ...modalEdicion.item,
      ...formItem,
      anticipaciones_dias: diasParsed
    } as ReglaAlertaItem;

    const actualizadas = alertas.map((a) => (a.id === itemActualizado.id ? itemActualizado : a));
    onChange({ ...datos, alertas: actualizadas });
    setModalEdicion({ abierto: false });
    mostrarToast("Configuración de alerta actualizada");
  };

  const restaurarValoresFabrica = () => {
    if (bloqueado) return;
    onChange({ ...datos, alertas: ALERTAS_FABRICA_DEFAULT });
    mostrarToast("Alertas restauradas a valores estándar de fábrica");
  };

  const enviarPrueba = () => {
    if (!correoPrueba.trim()) {
      mostrarToast("Ingrese un correo destinatario válido");
      return;
    }
    setModalPrueba(false);
    mostrarToast(`Notificación de prueba enviada exitosamente a ${correoPrueba}`);
    setCorreoPrueba("");
  };

  const alternarDestinatario = (rol: string) => {
    const actuales = formItem.destinatarios || [];
    if (actuales.includes(rol)) {
      setFormItem({ ...formItem, destinatarios: actuales.filter((r) => r !== rol) });
    } else {
      setFormItem({ ...formItem, destinatarios: [...actuales, rol] });
    }
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
            Alertas de Vencimiento, Garantía y Ciclo de Vida
          </h2>
          <p className="text-sm text-slate-500">
            Cuadrícula centralizada de notificaciones anticipadas para contratos, licencias de software y hardware.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalPrueba(true)}
            className="px-3 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-sm font-medium rounded-md shadow-sm"
          >
            Enviar alerta de prueba
          </button>
          <button
            type="button"
            disabled={bloqueado}
            onClick={restaurarValoresFabrica}
            className="px-3 py-2 border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-sm font-medium rounded-md shadow-sm disabled:opacity-50"
          >
            Restaurar valores de fábrica
          </button>
        </div>
      </div>

      {/* Tabla Cuadrícula de Alertas */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Entidad a Monitorear</th>
                <th className="px-4 py-3">Fecha de Referencia</th>
                <th className="px-4 py-3">Anticipación (Días)</th>
                <th className="px-4 py-3">Destinatarios</th>
                <th className="px-4 py-3">Canal</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alertas.map((alerta) => (
                <tr key={alerta.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={bloqueado}
                      onClick={() => handleToggleActivo(alerta.id)}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        alerta.activo
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {alerta.activo ? "Activa" : "Inactiva"}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{alerta.entidad}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs font-mono">{alerta.fecha_base}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {alerta.anticipaciones_dias.map((d, idx) => (
                        <span
                          key={idx}
                          className={`inline-block px-1.5 py-0.5 text-xs rounded font-mono font-medium ${
                            d < 0
                              ? "bg-rose-100 text-rose-800"
                              : d === 0
                              ? "bg-amber-100 text-amber-800"
                              : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {d > 0 ? `-${d}d` : d === 0 ? "Día 0" : `+${Math.abs(d)}d`}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                    {alerta.destinatarios.join(", ")}
                  </td>
                  <td className="px-4 py-3 text-xs uppercase text-slate-500 font-medium">
                    {alerta.canal || "ambos"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => abrirModalEditar(alerta)}
                      className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs"
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

      {/* Panel Próximos Vencimientos (Horizonte de 90 Días) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">
            Próximos Vencimientos Estimados (Horizonte 90 Días)
          </h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Vista previa simulada
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Proyección del calendario de alertas basado en los parámetros activos y las fechas registradas en inventario.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 border border-rose-200 bg-rose-50 rounded-md">
            <span className="text-xs font-bold text-rose-800 uppercase block mb-1">
              Plazo Inmediato (1 - 15 días)
            </span>
            <ul className="text-xs text-rose-900 space-y-1">
              <li>• Licencia "AutoCAD 2024" vence en 7 días</li>
              <li>• Contrato "Enlace Red FO Sede Central" límite no renovación en 12 días</li>
            </ul>
          </div>
          <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
            <span className="text-xs font-bold text-amber-800 uppercase block mb-1">
              Plazo Corto (16 - 30 días)
            </span>
            <ul className="text-xs text-amber-900 space-y-1">
              <li>• Soporte software "Oracle Enterprise" fin de soporte en 22 días</li>
              <li>• Garantía lote 15 laptops Dell Latitude expira en 28 días</li>
            </ul>
          </div>
          <div className="p-4 border border-indigo-200 bg-indigo-50 rounded-md">
            <span className="text-xs font-bold text-indigo-800 uppercase block mb-1">
              Plazo Medio (31 - 90 días)
            </span>
            <ul className="text-xs text-indigo-900 space-y-1">
              <li>• Suscripción corporativa "Microsoft 365 E5" vence en 60 días</li>
              <li>• Auditoría trimestral de CMDB programada para dentro de 75 días</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Edición de Regla de Alerta */}
      {modalEdicion.abierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Configurar Alerta: {modalEdicion.item?.entidad}
              </h3>
              <button
                type="button"
                onClick={() => setModalEdicion({ abierto: false })}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Días de anticipación (separados por coma; negativos indican días posteriores al vencimiento)
                </label>
                <input
                  type="text"
                  value={diasInput}
                  onChange={(e) => setDiasInput(e.target.value)}
                  placeholder="Ej: 90, 60, 30, 15, 7, 0, -1, -7"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-500">
                  Valores positivos alertan antes del vencimiento; 0 el mismo día; valores negativos alertan si el elemento sigue vencido.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Destinatarios de la notificación
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-slate-200 rounded-md">
                  {ROLES_DISPONIBLES.map((rol) => {
                    const seleccionado = (formItem.destinatarios || []).includes(rol);
                    return (
                      <label
                        key={rol}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs ${
                          seleccionado ? "bg-indigo-50 text-indigo-900 font-medium" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => alternarDestinatario(rol)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{rol}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Canal de envío</label>
                  <select
                    value={formItem.canal || "ambos"}
                    onChange={(e) => setFormItem({ ...formItem, canal: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="ambos">Correo y Notificación en Sistema</option>
                    <option value="correo">Solo Correo Electrónico</option>
                    <option value="sistema">Solo Notificación en Sistema</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Escalamiento si no hay gestión (días)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formItem.escalamiento_dias ?? 5}
                    onChange={(e) => setFormItem({ ...formItem, escalamiento_dias: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chkSnooze"
                  checked={formItem.permite_snooze ?? true}
                  onChange={(e) => setFormItem({ ...formItem, permite_snooze: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="chkSnooze" className="text-xs font-medium text-slate-700">
                  Permitir posponer (Snooze) la alerta temporalmente a los responsables
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalEdicion({ abierto: false })}
                className="px-4 py-2 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarEdicion}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Envío de Alerta de Prueba */}
      {modalPrueba && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">
              Enviar Alerta de Prueba
            </h3>
            <p className="text-xs text-slate-500">
              Verifique la recepción y el formato de las plantillas de notificación enviando una simulación al correo electrónico indicado.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Correo destinatario del usuario técnico
              </label>
              <input
                type="email"
                value={correoPrueba}
                onChange={(e) => setCorreoPrueba(e.target.value)}
                placeholder="ejemplo@organizacion.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setModalPrueba(false)}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={enviarPrueba}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
              >
                Disparar prueba
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
