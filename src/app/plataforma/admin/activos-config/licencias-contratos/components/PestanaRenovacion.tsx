"use client";

import React, { useState } from "react";

export interface RangoAprobacionMonto {
  desde: number;
  hasta: number;
  perfil_aprobador: string;
  orden: number;
}

export interface MotivoNoRenovacion {
  id: string;
  nombre: string;
  accion_asociada?: "retirar" | "reemplazar" | "liberar" | "ninguna";
  activo: boolean;
}

export interface RenovacionData {
  estados_renovacion?: string[];
  anticipacion_crear_solicitud_dias?: number;
  servicio_solicitud_renovacion_id?: number;
  bloquear_nuevas_asignaciones_si_vencida?: boolean;
  alerta_perdida_cobertura_activos?: boolean;
  aprobacion_por_montos?: RangoAprobacionMonto[];
  motivos_no_renovacion?: MotivoNoRenovacion[];
}

interface Props {
  datos: RenovacionData;
  onChange: (nuevosDatos: RenovacionData) => void;
  bloqueado: boolean;
}

const ESTADOS_RENOVACION_BLOQUEADOS = [
  "Pendiente",
  "En gestión",
  "Renovado",
  "No renovar",
  "Vencido sin renovar"
];

const PERFILES_APROBACION = [
  "Supervisor",
  "Aprobador",
  "Gestor de Activos y Configuración",
  "Gestor de Área",
  "Administrador"
];

export function PestanaRenovacion({ datos, onChange, bloqueado }: Props) {
  const estados = ESTADOS_RENOVACION_BLOQUEADOS;
  const anticipacionDias = datos?.anticipacion_crear_solicitud_dias ?? 60;
  const servicioId = datos?.servicio_solicitud_renovacion_id ?? 110;
  const bloquearAsignaciones = datos?.bloquear_nuevas_asignaciones_si_vencida ?? true;
  const alertaPerdidaCobertura = datos?.alerta_perdida_cobertura_activos ?? true;
  const rangos: RangoAprobacionMonto[] = datos?.aprobacion_por_montos || [
    { desde: 0, hasta: 5000, perfil_aprobador: "Supervisor", orden: 1 },
    { desde: 5001, hasta: 50000, perfil_aprobador: "Aprobador", orden: 2 },
    { desde: 50001, hasta: 999999, perfil_aprobador: "Administrador", orden: 3 }
  ];
  const motivos: MotivoNoRenovacion[] = datos?.motivos_no_renovacion || [
    { id: "migracion_alternativa", nombre: "Migración a plataforma o solución alternativa", accion_asociada: "reemplazar", activo: true },
    { id: "desuso_obsolescencia", nombre: "Pérdida de necesidad operativa / Desuso", accion_asociada: "liberar", activo: true },
    { id: "reduccion_presupuesto", nombre: "Optimización o reducción presupuestal", accion_asociada: "ninguna", activo: true },
    { id: "cambio_proveedor", nombre: "Reemplazo por proveedor homologado más competitivo", accion_asociada: "reemplazar", activo: true }
  ];

  const [modalVistaPrevia, setModalVistaPrevia] = useState(false);
  const [modalMotivo, setModalMotivo] = useState<{ abierto: boolean; motivo?: MotivoNoRenovacion; esNuevo: boolean }>({
    abierto: false,
    esNuevo: true
  });
  const [formMotivo, setFormMotivo] = useState<Partial<MotivoNoRenovacion>>({});
  const [modalRango, setModalRango] = useState<{ abierto: boolean; index?: number }>({ abierto: false });
  const [formRango, setFormRango] = useState<Partial<RangoAprobacionMonto>>({});
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const handleUpdate = (campo: keyof RenovacionData, valor: any) => {
    onChange({
      ...datos,
      [campo]: valor
    });
  };

  const abrirNuevoMotivo = () => {
    setFormMotivo({
      id: `motivo_${Date.now()}`,
      nombre: "",
      accion_asociada: "ninguna",
      activo: true
    });
    setModalMotivo({ abierto: true, esNuevo: true });
  };

  const guardarMotivo = () => {
    if (bloqueado || !formMotivo.nombre?.trim()) return;
    let actualizados: MotivoNoRenovacion[];
    if (modalMotivo.esNuevo) {
      actualizados = [...motivos, formMotivo as MotivoNoRenovacion];
    } else {
      actualizados = motivos.map((m) => (m.id === formMotivo.id ? (formMotivo as MotivoNoRenovacion) : m));
    }
    handleUpdate("motivos_no_renovacion", actualizados);
    setModalMotivo({ abierto: false, esNuevo: true });
    mostrarToast("Catálogo de motivos de no renovación actualizado");
  };

  const alternarActivoMotivo = (id: string) => {
    if (bloqueado) return;
    const actualizados = motivos.map((m) => (m.id === id ? { ...m, activo: !m.activo } : m));
    handleUpdate("motivos_no_renovacion", actualizados);
  };

  const abrirNuevoRango = () => {
    setFormRango({
      desde: 0,
      hasta: 10000,
      perfil_aprobador: "Supervisor",
      orden: rangos.length + 1
    });
    setModalRango({ abierto: true });
  };

  const guardarRango = () => {
    if (bloqueado) return;
    let actualizados: RangoAprobacionMonto[];
    if (modalRango.index !== undefined) {
      actualizados = [...rangos];
      actualizados[modalRango.index] = formRango as RangoAprobacionMonto;
    } else {
      actualizados = [...rangos, formRango as RangoAprobacionMonto];
    }
    handleUpdate("aprobacion_por_montos", actualizados);
    setModalRango({ abierto: false });
    mostrarToast("Reglas de aprobación financiera actualizadas");
  };

  const eliminarRango = (index: number) => {
    if (bloqueado) return;
    const actualizados = rangos.filter((_, i) => i !== index);
    handleUpdate("aprobacion_por_montos", actualizados);
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
            Políticas de Renovación y Fin de Cobertura
          </h2>
          <p className="text-sm text-slate-500">
            Automatización de solicitudes de renovación antes del vencimiento, niveles de autorización y consecuencias al no renovar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalVistaPrevia(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 text-sm font-semibold rounded-md shadow-sm transition-colors"
        >
          Vista previa de la solicitud generada
        </button>
      </div>

      {/* Estados del Ciclo de Renovación (Bloqueados de Fábrica) */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
            Estados del Ciclo de Renovación
          </h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
            Bloqueados por integridad del sistema
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {estados.map((est) => (
            <span
              key={est}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-700"
            >
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              {est}
            </span>
          ))}
        </div>
      </div>

      {/* Reglas de Generación Automática y Políticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generación Automática de Solicitud */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
            Generación Automática de Solicitud de Renovación
          </h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Anticipación para generar el ticket (días previos)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="15"
                max="180"
                disabled={bloqueado}
                value={anticipacionDias}
                onChange={(e) => handleUpdate("anticipacion_crear_solicitud_dias", parseInt(e.target.value) || 60)}
                className="w-24 px-3 py-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100"
              />
              <span className="text-sm text-slate-500">días antes de la fecha de expiración</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              El motor de tareas automáticas emitirá un ticket de solicitud de servicio prellenado con los datos del contrato o licencia.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Servicio de Catálogo asignado (Módulo 1.2.2)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                disabled={bloqueado}
                value={servicioId}
                onChange={(e) => handleUpdate("servicio_solicitud_renovacion_id", parseInt(e.target.value) || 110)}
                className="w-24 px-3 py-2 border border-slate-300 rounded-md text-sm font-mono"
              />
              <span className="text-xs text-slate-600 bg-slate-100 px-3 py-2 rounded border border-slate-200 flex-1">
                Servicio: Renovación formal de Licenciamiento y Contratos TI (ID #{servicioId})
              </span>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase text-slate-600">Consecuencias al Vencer sin Renovar</h4>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="chkBloqAsig"
                disabled={bloqueado}
                checked={bloquearAsignaciones}
                onChange={(e) => handleUpdate("bloquear_nuevas_asignaciones_si_vencida", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              <div>
                <label htmlFor="chkBloqAsig" className="text-sm font-medium text-slate-800">
                  Bloquear nuevas asignaciones en licencias vencidas
                </label>
                <p className="text-xs text-slate-500">
                  Impide asignar copias de software cuya licencia no haya sido renovada en fecha.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="chkAlertaCobertura"
                disabled={bloqueado}
                checked={alertaPerdidaCobertura}
                onChange={(e) => handleUpdate("alerta_perdida_cobertura_activos", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              <div>
                <label htmlFor="chkAlertaCobertura" className="text-sm font-medium text-slate-800">
                  Alerta de pérdida de cobertura de soporte/garantía sobre activos vinculados
                </label>
                <p className="text-xs text-slate-500">
                  Notifica a los responsables de los equipos cubiertos por el contrato expirado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Niveles de Aprobación Financiera */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-base font-semibold text-slate-800">
              Aprobación Financiera por Rangos de Monto
            </h3>
            <button
              type="button"
              disabled={bloqueado}
              onClick={abrirNuevoRango}
              className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded font-semibold border border-indigo-200 disabled:opacity-50"
            >
              + Agregar rango
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="px-3 py-2">Monto Mínimo</th>
                  <th className="px-3 py-2">Monto Máximo</th>
                  <th className="px-3 py-2">Perfil Aprobador</th>
                  <th className="px-3 py-2 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rangos.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono">${r.desde.toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono">${r.hasta.toLocaleString()}</td>
                    <td className="px-3 py-2 font-medium text-indigo-700">{r.perfil_aprobador}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        disabled={bloqueado}
                        onClick={() => eliminarRango(idx)}
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
          <p className="text-xs text-slate-500">
            Regla de segregación: el usuario solicitante no puede aprobar su propia solicitud de renovación, sin importar su perfil de sistema.
          </p>
        </div>
      </div>

      {/* Catálogo de Motivos de No Renovación */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Catálogo de Motivos de No Renovación
            </h3>
            <p className="text-xs text-slate-500">
              Opciones justificativas exigidas cuando se descarta renovar un software o contrato.
            </p>
          </div>
          <button
            type="button"
            disabled={bloqueado}
            onClick={abrirNuevoMotivo}
            className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            + Nuevo motivo
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-100 font-semibold text-slate-700">
              <tr>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Nombre / Justificación</th>
                <th className="px-3 py-2">Acción de Sistema Asociada</th>
                <th className="px-3 py-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {motivos.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={bloqueado}
                      onClick={() => alternarActivoMotivo(m.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        m.activo ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {m.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-800">{m.nombre}</td>
                  <td className="px-3 py-2 text-slate-600 capitalize">
                    {m.accion_asociada === "retirar" && "Planificar desinstalación / retiro"}
                    {m.accion_asociada === "reemplazar" && "Planificar reemplazo por solución alternativa"}
                    {m.accion_asociada === "liberar" && "Liberar asignaciones y devolver cupos"}
                    {(!m.accion_asociada || m.accion_asociada === "ninguna") && "Solo registro administrativo"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setFormMotivo({ ...m });
                        setModalMotivo({ abierto: true, esNuevo: false });
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold"
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

      {/* Modal Vista Previa de Solicitud Generada */}
      {modalVistaPrevia && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Vista Previa de Solicitud de Servicio Generada
              </h3>
              <button
                type="button"
                onClick={() => setModalVistaPrevia(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-700">Tipo de Ticket:</span>
                <span className="text-indigo-700 font-bold">Solicitud de Servicio (ID Servicio #{servicioId})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Título generado:</span>
                  <span className="font-medium text-slate-800">[RENOVACIÓN] Microsoft 365 E5 - Contrato #CT-2024-009</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Fecha límite sugerida:</span>
                  <span className="font-medium text-slate-800">30 días antes del vencimiento contractual</span>
                </div>
              </div>

              <div className="border-t pt-2 space-y-1">
                <span className="text-slate-500 block">Campos prellenados automáticamente:</span>
                <ul className="list-disc pl-5 text-slate-600 space-y-0.5">
                  <li><strong>Proveedor:</strong> Microsoft Licensing Corp.</li>
                  <li><strong>Cantidad actual:</strong> 150 licencias suscritas</li>
                  <li><strong>Monto del período previo:</strong> $36,000 USD</li>
                  <li><strong>Responsable asignado:</strong> Gestor de Activos y Configuración</li>
                  <li><strong>Flujo de aprobación:</strong> Aprobador de Compras TI (Rango $5,001 - $50,000)</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalVistaPrevia(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo / Editar Motivo */}
      {modalMotivo.abierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">
              {modalMotivo.esNuevo ? "Nuevo Motivo de No Renovación" : "Editar Motivo"}
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Descripción / Motivo
              </label>
              <input
                type="text"
                value={formMotivo.nombre || ""}
                onChange={(e) => setFormMotivo({ ...formMotivo, nombre: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                placeholder="Ej: Reemplazo por solución corporativa estandarizada"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Acción del sistema sugerida
              </label>
              <select
                value={formMotivo.accion_asociada || "ninguna"}
                onChange={(e) => setFormMotivo({ ...formMotivo, accion_asociada: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              >
                <option value="ninguna">Solo registro administrativo</option>
                <option value="reemplazar">Planificar reemplazo por solución alternativa</option>
                <option value="retirar">Planificar desinstalación y retiro</option>
                <option value="liberar">Liberar asignaciones y devolver cupos</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalMotivo({ abierto: false, esNuevo: true })}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarMotivo}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Rango de Aprobación */}
      {modalRango.abierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">
              Definir Rango de Aprobación Financiera
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Monto Desde ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formRango.desde || 0}
                  onChange={(e) => setFormRango({ ...formRango, desde: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Monto Hasta ($)</label>
                <input
                  type="number"
                  min="1"
                  value={formRango.hasta || 0}
                  onChange={(e) => setFormRango({ ...formRango, hasta: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Perfil Aprobador Requerido
              </label>
              <select
                value={formRango.perfil_aprobador || "Supervisor"}
                onChange={(e) => setFormRango({ ...formRango, perfil_aprobador: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              >
                {PERFILES_APROBACION.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalRango({ abierto: false })}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarRango}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
              >
                Guardar rango
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
