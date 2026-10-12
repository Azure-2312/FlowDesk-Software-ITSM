"use client";

import React, { useState } from "react";

export interface ServicioSolicitudVinculado {
  id: number;
  servicio_id: number;
  servicio_nombre: string;
  tipo_activo_generado: string;
  crear_activo_previo: boolean;
  estado_inicial: string;
}

export interface CampoCompra {
  id: string;
  etiqueta: string;
  obligatorio: boolean;
}

export interface AdquisicionRecepcionData {
  servicios_solicitud_vinculados?: ServicioSolicitudVinculado[];
  campos_compra_exigidos?: CampoCompra[];
  reglas_recepcion?: {
    auto_calcular_garantia: boolean;
    auto_asignar_codigo: boolean;
    imprimir_etiqueta_tras_recepcion: boolean;
    permitir_recepcion_parcial: boolean;
    estado_destino_defecto: "en_stock" | "asignado";
    resolver_solicitud_origen_al_completar: boolean;
    permitir_ingreso_directo_sin_solicitud: boolean;
  };
}

interface Props {
  datos: AdquisicionRecepcionData;
  onChange: (nuevosDatos: AdquisicionRecepcionData) => void;
  bloqueado: boolean;
}

export function PestanaAdquisicionRecepcion({ datos, onChange, bloqueado }: Props) {
  const [modalVinculo, setModalVinculo] = useState(false);
  const [nuevoVinculo, setNuevoVinculo] = useState<Partial<ServicioSolicitudVinculado>>({
    servicio_id: 104,
    servicio_nombre: "",
    tipo_activo_generado: "portatil",
    crear_activo_previo: true,
    estado_inicial: "solicitado"
  });
  const [modalSimularRecepcion, setModalSimularRecepcion] = useState(false);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const servicios = datos?.servicios_solicitud_vinculados || [
    { id: 1, servicio_id: 101, servicio_nombre: "Solicitud de computadora portátil para nuevo ingreso", tipo_activo_generado: "portatil", crear_activo_previo: true, estado_inicial: "solicitado" },
    { id: 2, servicio_id: 102, servicio_nombre: "Renovación planificada de estaciones de trabajo de cómputo", tipo_activo_generado: "estacion_trabajo", crear_activo_previo: true, estado_inicial: "solicitado" }
  ];

  const camposCompra = datos?.campos_compra_exigidos || [
    { id: "orden_compra", etiqueta: "Número de Orden de Compra", obligatorio: true },
    { id: "proveedor_id", etiqueta: "Proveedor adjudicado (Módulo 8)", obligatorio: true },
    { id: "fecha_pedido", etiqueta: "Fecha de emisión del pedido", obligatorio: true },
    { id: "monto_estimado", etiqueta: "Monto total de adquisición", obligatorio: false },
    { id: "fecha_entrega_estimada", etiqueta: "Fecha estimada de entrega en almacén", obligatorio: false }
  ];

  const reglas = datos?.reglas_recepcion || {
    auto_calcular_garantia: true,
    auto_asignar_codigo: true,
    imprimir_etiqueta_tras_recepcion: true,
    permitir_recepcion_parcial: true,
    estado_destino_defecto: "en_stock",
    resolver_solicitud_origen_al_completar: true,
    permitir_ingreso_directo_sin_solicitud: true
  };

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const actualizarReglas = (campos: Partial<typeof reglas>) => {
    if (bloqueado) return;
    onChange({
      ...datos,
      reglas_recepcion: { ...reglas, ...campos }
    });
  };

  const toggleCampoObligatorio = (id: string) => {
    if (bloqueado) return;
    const act = camposCompra.map((c) => (c.id === id ? { ...c, obligatorio: !c.obligatorio } : c));
    onChange({ ...datos, campos_compra_exigidos: act });
  };

  const guardarVinculo = () => {
    if (bloqueado || !nuevoVinculo.servicio_nombre) return;
    const creado: ServicioSolicitudVinculado = {
      id: Date.now(),
      servicio_id: nuevoVinculo.servicio_id || 105,
      servicio_nombre: nuevoVinculo.servicio_nombre,
      tipo_activo_generado: nuevoVinculo.tipo_activo_generado || "portatil",
      crear_activo_previo: !!nuevoVinculo.crear_activo_previo,
      estado_inicial: nuevoVinculo.estado_inicial || "solicitado"
    };
    onChange({
      ...datos,
      servicios_solicitud_vinculados: [...servicios, creado]
    });
    setModalVinculo(false);
    mostrarToast("Servicio del catálogo vinculado con el ciclo de vida de activos.");
  };

  const desvincularServicio = (id: number) => {
    if (bloqueado) return;
    const act = servicios.filter((s) => s.id !== id);
    onChange({ ...datos, servicios_solicitud_vinculados: act });
    mostrarToast("Vínculo eliminado.");
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
            1.5.2.4 Adquisición y recepción de activos
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Interacción entre solicitudes de servicio del catálogo ITSM (1.2.2), órdenes de compra y el alta física por lotes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalSimularRecepcion(true)}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100"
          >
            Simular recepción por escaneo
          </button>
          <button
            onClick={() => {
              setNuevoVinculo({ servicio_nombre: "", tipo_activo_generado: "portatil", crear_activo_previo: true });
              setModalVinculo(true);
            }}
            disabled={bloqueado}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors disabled:opacity-50"
          >
            + Vincular servicio de catálogo
          </button>
        </div>
      </div>

      {/* 1. Servicios vinculados */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h4 className="text-sm font-bold text-slate-800">
            Servicios del catálogo (1.2.2) que disparan la creación de activos
          </h4>
          <p className="text-xs text-slate-500">
            Al autorizarse la solicitud en el módulo de solicitudes, el sistema crea automáticamente el activo en estado "Solicitado".
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Servicio de solicitud ITSM</th>
                <th className="py-2.5 px-3">Tipo de activo generado</th>
                <th className="py-2.5 px-3">Pre-registro de activo</th>
                <th className="py-2.5 px-3">Estado inicial asignado</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {servicios.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{s.servicio_nombre}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 uppercase">{s.tipo_activo_generado}</td>
                  <td className="py-2.5 px-3">
                    {s.crear_activo_previo ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Automático al autorizar
                      </span>
                    ) : (
                      <span className="text-slate-400">Manual</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{s.estado_inicial}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => desvincularServicio(s.id)}
                      disabled={bloqueado}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Desvincular
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Parámetros de compra y recepción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos de compra */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <div className="pb-2 border-b border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Datos de compra exigidos al pasar a "Ordenado"
            </h4>
            <p className="text-[11px] text-slate-400">
              Campos requeridos en el modal al transicionar hacia el estado de compra.
            </p>
          </div>

          <div className="space-y-2">
            {camposCompra.map((campo) => (
              <div key={campo.id} className="flex items-center justify-between p-2 rounded bg-slate-50 text-xs">
                <span className="font-medium text-slate-800">{campo.etiqueta}</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={campo.obligatorio}
                    disabled={bloqueado}
                    onChange={() => toggleCampoObligatorio(campo.id)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="text-slate-600">Obligatorio</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Automatizaciones de recepción */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <div className="pb-2 border-b border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Automatizaciones de la recepción física
            </h4>
            <p className="text-[11px] text-slate-400">
              Comportamiento del sistema al procesar la llegada en almacén.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reglas.auto_calcular_garantia}
                disabled={bloqueado}
                onChange={(e) => actualizarReglas({ auto_calcular_garantia: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Cálculo automático de fecha de fin de garantía
                </span>
                <span className="text-slate-500 text-[11px]">
                  Fecha de recepción + meses de garantía estándar definidos en el modelo.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reglas.imprimir_etiqueta_tras_recepcion}
                disabled={bloqueado}
                onChange={(e) => actualizarReglas({ imprimir_etiqueta_tras_recepcion: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Impresión inmediata de lote de etiquetas QR
                </span>
                <span className="text-slate-500 text-[11px]">
                  Abre automáticamente el diálogo de impresión con el diseño oficial de 1.5.1.5.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reglas.resolver_solicitud_origen_al_completar}
                disabled={bloqueado}
                onChange={(e) => actualizarReglas({ resolver_solicitud_origen_al_completar: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Resolver solicitud de servicio de origen al recibir la totalidad
                </span>
                <span className="text-slate-500 text-[11px]">
                  Pasa el ticket solicitante al estado "Resuelta" con nota de cierre automática.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reglas.permitir_ingreso_directo_sin_solicitud}
                disabled={bloqueado}
                onChange={(e) => actualizarReglas({ permitir_ingreso_directo_sin_solicitud: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-indigo-600"
              />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Permitir ingreso directo sin ticket de solicitud (Solo Administradores)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Exige motivo justificado que queda registrado en auditoría.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Modal Vincular Servicio */}
      {modalVinculo && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Vincular servicio del catálogo a activo</h3>
              <button onClick={() => setModalVinculo(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del servicio de catálogo</label>
                <input
                  type="text"
                  value={nuevoVinculo.servicio_nombre || ""}
                  onChange={(e) => setNuevoVinculo({ ...nuevoVinculo, servicio_nombre: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded font-semibold text-slate-800"
                  placeholder="EJ: Solicitud de monitor de alta resolución"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de activo generado</label>
                <select
                  value={nuevoVinculo.tipo_activo_generado || "portatil"}
                  onChange={(e) => setNuevoVinculo({ ...nuevoVinculo, tipo_activo_generado: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                >
                  <option value="portatil">Computadora portátil (Laptop)</option>
                  <option value="estacion_trabajo">Estación de trabajo (Desktop)</option>
                  <option value="monitor">Monitor y pantalla</option>
                  <option value="servidor_fisico">Servidor físico</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!nuevoVinculo.crear_activo_previo}
                    onChange={(e) => setNuevoVinculo({ ...nuevoVinculo, crear_activo_previo: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="font-semibold text-slate-700">
                    Crear automáticamente el activo en estado "Solicitado" al autorizar ticket
                  </span>
                </label>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setModalVinculo(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600">
                Cancelar
              </button>
              <button
                onClick={guardarVinculo}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded"
              >
                Guardar vínculo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Simulación de Recepción */}
      {modalSimularRecepcion && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">
                Simulador de Formulario de Recepción Física en Lote
              </h3>
              <button onClick={() => setModalSimularRecepcion(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                <span className="font-bold block">Orden de compra: OC-2026-089 — Proveedor: Lenovo Perú S.A.</span>
                <span className="text-[11px] block mt-0.5">3 unidades recibidas de 5 ordenadas (Recepción Parcial)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-200">
                  <tr className="bg-slate-100 font-semibold text-slate-700">
                    <th className="p-2 border">#</th>
                    <th className="p-2 border">Número de Serie</th>
                    <th className="p-2 border">Hostname Sugerido</th>
                    <th className="p-2 border">Ubicación Destino</th>
                    <th className="p-2 border">Garantía Calculada</th>
                  </tr>
                  <tr>
                    <td className="p-2 border font-mono">1</td>
                    <td className="p-2 border font-mono font-bold text-slate-800">PF-89A001</td>
                    <td className="p-2 border font-mono text-indigo-700">LP-TI-0101</td>
                    <td className="p-2 border">Sede Central / Almacén TI</td>
                    <td className="p-2 border text-emerald-700 font-semibold">36 meses (hasta 2029)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-mono">2</td>
                    <td className="p-2 border font-mono font-bold text-slate-800">PF-89A002</td>
                    <td className="p-2 border font-mono text-indigo-700">LP-TI-0102</td>
                    <td className="p-2 border">Sede Central / Almacén TI</td>
                    <td className="p-2 border text-emerald-700 font-semibold">36 meses (hasta 2029)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-mono">3</td>
                    <td className="p-2 border font-mono font-bold text-slate-800">PF-89A003</td>
                    <td className="p-2 border font-mono text-indigo-700">LP-TI-0103</td>
                    <td className="p-2 border">Sede Central / Almacén TI</td>
                    <td className="p-2 border text-emerald-700 font-semibold">36 meses (hasta 2029)</td>
                  </tr>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setModalSimularRecepcion(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded"
              >
                Cerrar simulación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
