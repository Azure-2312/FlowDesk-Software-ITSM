"use client";

import React, { useState } from "react";

export type DireccionImpacto = "destino_a_origen" | "origen_a_destino" | "bidireccional" | "ninguna";
export type CardinalidadRelacion = "1:1" | "1:N" | "N:1" | "N:N";

export interface TipoRelacionItem {
  id: string;
  codigo: string;
  nombre_directo: string;
  nombre_inverso: string;
  direccion_impacto: DireccionImpacto;
  propaga_criticidad: boolean;
  cardinalidad: CardinalidadRelacion;
  permite_ciclos: boolean;
  color: string;
  estilo: "solida" | "punteada" | "discontinua";
  bloqueado: boolean;
  activo: boolean;
  descripcion?: string;
}

export interface ParejaClasePermitida {
  origen: string;
  destino: string;
}

export interface TiposRelacionData {
  tipos?: TipoRelacionItem[];
  matriz_permitida?: Record<string, ParejaClasePermitida[]>;
}

interface Props {
  datos: TiposRelacionData;
  onChange: (nuevosDatos: TiposRelacionData) => void;
  bloqueado: boolean;
}

const CLASES_PARA_MATRIZ = [
  { id: "hardware", label: "Hardware" },
  { id: "red", label: "Redes" },
  { id: "infraestructura_fisica", label: "Infra Física" },
  { id: "software_sistema", label: "Software" },
  { id: "base_datos", label: "Bases de Datos" },
  { id: "infraestructura_virtual", label: "Virtual" },
  { id: "servicios_ti", label: "Servicios TI" }
];

export function PestanaTiposRelacion({ datos, onChange, bloqueado }: Props) {
  const tipos: TipoRelacionItem[] = datos?.tipos || [];
  const matriz: Record<string, ParejaClasePermitida[]> = datos?.matriz_permitida || {};

  const [tipoSeleccionadoId, setTipoSeleccionadoId] = useState<string>(tipos[0]?.id || "depende_de");
  const [modalEdicion, setModalEdicion] = useState<{ abierto: boolean; tipo?: TipoRelacionItem; esNuevo: boolean }>({
    abierto: false,
    esNuevo: false
  });
  const [formTipo, setFormTipo] = useState<Partial<TipoRelacionItem>>({});
  const [modalSimulador, setModalSimulador] = useState(false);

  // Estados del simulador
  const [simClaseOrigen, setSimClaseOrigen] = useState(CLASES_PARA_MATRIZ[0].id);
  const [simClaseDestino, setSimClaseDestino] = useState(CLASES_PARA_MATRIZ[6].id);

  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const tipoSeleccionado = tipos.find((t) => t.id === tipoSeleccionadoId) || tipos[0];
  const parejasPermitidas = matriz[tipoSeleccionadoId] || [];

  const handleToggleActivo = (id: string) => {
    if (bloqueado) return;
    const actualizados = tipos.map((t) => (t.id === id ? { ...t, activo: !t.activo } : t));
    onChange({ ...datos, tipos: actualizados });
  };

  const abrirNuevoTipo = () => {
    setFormTipo({
      id: `rel_${Date.now()}`,
      codigo: "NUEVA_RELACION",
      nombre_directo: "",
      nombre_inverso: "",
      direccion_impacto: "destino_a_origen",
      propaga_criticidad: true,
      cardinalidad: "1:N",
      permite_ciclos: false,
      color: "#4f46e5",
      estilo: "solida",
      bloqueado: false,
      activo: true
    });
    setModalEdicion({ abierto: true, esNuevo: true });
  };

  const abrirEditarTipo = (t: TipoRelacionItem) => {
    setFormTipo({ ...t });
    setModalEdicion({ abierto: true, tipo: t, esNuevo: false });
  };

  const guardarTipo = () => {
    if (bloqueado || !formTipo.nombre_directo?.trim() || !formTipo.nombre_inverso?.trim()) return;
    let actualizados: TipoRelacionItem[];
    if (modalEdicion.esNuevo) {
      actualizados = [...tipos, formTipo as TipoRelacionItem];
    } else {
      actualizados = tipos.map((t) => (t.id === formTipo.id ? (formTipo as TipoRelacionItem) : t));
    }
    onChange({ ...datos, tipos: actualizados });
    setModalEdicion({ abierto: false, esNuevo: false });
    mostrarToast("Tipo de relación guardado correctamente.");
  };

  // Manejo de la Matriz de clases permitidas
  const esParejaPermitida = (origen: string, destino: string) => {
    return parejasPermitidas.some((p) => p.origen === origen && p.destino === destino);
  };

  const alternarParejaPermitida = (origen: string, destino: string) => {
    if (bloqueado) return;
    const existe = esParejaPermitida(origen, destino);
    let nuevasParejas: ParejaClasePermitida[];
    if (existe) {
      nuevasParejas = parejasPermitidas.filter((p) => !(p.origen === origen && p.destino === destino));
    } else {
      nuevasParejas = [...parejasPermitidas, { origen, destino }];
    }
    onChange({
      ...datos,
      matriz_permitida: {
        ...matriz,
        [tipoSeleccionadoId]: nuevasParejas
      }
    });
  };

  const marcarTodasParejas = () => {
    if (bloqueado) return;
    const todas: ParejaClasePermitida[] = [];
    for (const o of CLASES_PARA_MATRIZ) {
      for (const d of CLASES_PARA_MATRIZ) {
        todas.push({ origen: o.id, destino: d.id });
      }
    }
    onChange({
      ...datos,
      matriz_permitida: {
        ...matriz,
        [tipoSeleccionadoId]: todas
      }
    });
    mostrarToast("Todas las combinaciones marcadas como permitidas.");
  };

  const limpiarParejas = () => {
    if (bloqueado) return;
    onChange({
      ...datos,
      matriz_permitida: {
        ...matriz,
        [tipoSeleccionadoId]: []
      }
    });
    mostrarToast("Matriz limpiada para este tipo de relación.");
  };

  // Encontrar relaciones aplicables en el simulador
  const relacionesSimuladas = tipos.filter((t) => {
    const list = matriz[t.id] || [];
    return list.some((p) => p.origen === simClaseOrigen && p.destino === simClaseDestino);
  });

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
            Tipos de Relación Topológica y Matriz de Clases Permitidas
          </h2>
          <p className="text-sm text-slate-500">
            Definición de enlaces semánticos, dirección de propagación de fallos, propagación de criticidad y restricciones de conectividad.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalSimulador(true)}
            className="px-3 py-2 border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 text-sm font-semibold rounded-md shadow-sm"
          >
            Simulador de enlaces
          </button>
          <button
            type="button"
            disabled={bloqueado}
            onClick={abrirNuevoTipo}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm disabled:opacity-50"
          >
            + Nuevo tipo de relación
          </button>
        </div>
      </div>

      {/* Tabla de Tipos de Relación */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Nombre Directo / Inverso</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Dirección del Impacto</th>
                <th className="px-4 py-3 text-center">Propaga Criticidad</th>
                <th className="px-4 py-3 text-center">Cardinalidad</th>
                <th className="px-4 py-3 text-center">Ciclos</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tipos.map((tipo) => {
                const seleccionada = tipo.id === tipoSeleccionadoId;
                return (
                  <tr
                    key={tipo.id}
                    onClick={() => setTipoSeleccionadoId(tipo.id)}
                    className={`cursor-pointer transition-colors ${
                      seleccionada ? "bg-indigo-50/70 font-medium" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={bloqueado}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActivo(tipo.id);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          tipo.activo
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {tipo.activo ? "Activa" : "Inactiva"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tipo.color }}
                        ></span>
                        <div>
                          <div className="font-bold text-slate-900">{tipo.nombre_directo}</div>
                          <div className="text-[11px] text-slate-500">{tipo.nombre_inverso}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{tipo.codigo}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {tipo.direccion_impacto === "destino_a_origen" && "Fallo de Destino impacta a Origen"}
                      {tipo.direccion_impacto === "origen_a_destino" && "Fallo de Origen impacta a Destino"}
                      {tipo.direccion_impacto === "bidireccional" && "Impacto mutuo bidireccional"}
                      {tipo.direccion_impacto === "ninguna" && "Sin propagación de impacto"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {tipo.propaga_criticidad ? (
                        <span className="text-emerald-700 font-bold">Si</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">{tipo.cardinalidad}</td>
                    <td className="px-4 py-3 text-center">
                      {tipo.permite_ciclos ? (
                        <span className="text-amber-700 font-semibold">Si</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirEditarTipo(tipo);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matriz de Clases Permitidas para el Tipo Seleccionado */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Matriz de Clases Permitidas para: <span className="text-indigo-600 font-extrabold">{tipoSeleccionado?.nombre_directo}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Marque las casillas para autorizar que este tipo de relación se vincule entre las clases seleccionadas (Origen en filas, Destino en columnas).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={bloqueado}
              onClick={marcarTodasParejas}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Marcar todo
            </button>
            <button
              type="button"
              disabled={bloqueado}
              onClick={limpiarParejas}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-center border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold">
                <th className="p-2 border border-slate-200 text-left bg-slate-200/60">
                  Origen ↓ / Destino →
                </th>
                {CLASES_PARA_MATRIZ.map((c) => (
                  <th key={c.id} className="p-2 border border-slate-200 font-bold whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASES_PARA_MATRIZ.map((fila) => (
                <tr key={fila.id} className="hover:bg-slate-50">
                  <td className="p-2 border border-slate-200 text-left font-bold text-slate-800 bg-slate-50 whitespace-nowrap">
                    {fila.label}
                  </td>
                  {CLASES_PARA_MATRIZ.map((col) => {
                    const permitida = esParejaPermitida(fila.id, col.id);
                    return (
                      <td
                        key={col.id}
                        onClick={() => alternarParejaPermitida(fila.id, col.id)}
                        className={`p-2 border border-slate-200 cursor-pointer transition-colors ${
                          permitida
                            ? "bg-indigo-100/70 text-indigo-900 font-bold hover:bg-indigo-200"
                            : "hover:bg-slate-100 text-slate-300"
                        }`}
                      >
                        {permitida ? "Si" : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Simulador de Enlaces */}
      {modalSimulador && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Simulador de Enlaces Topológicos y Propagación
              </h3>
              <button
                type="button"
                onClick={() => setModalSimulador(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Seleccione dos clases hipotéticas para verificar qué relaciones están autorizadas en la matriz y cómo viajaría el impacto en caso de interrupción del servicio.
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clase Origen</label>
                <select
                  value={simClaseOrigen}
                  onChange={(e) => setSimClaseOrigen(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                >
                  {CLASES_PARA_MATRIZ.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clase Destino</label>
                <select
                  value={simClaseDestino}
                  onChange={(e) => setSimClaseDestino(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                >
                  {CLASES_PARA_MATRIZ.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Relaciones Permitidas entre estas dos Clases:
              </h4>

              {relacionesSimuladas.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
                  No existen tipos de relación autorizados en la matriz entre estas dos clases. Cualquier intento de vincularlas en la CMDB será bloqueado.
                </div>
              ) : (
                <div className="space-y-2">
                  {relacionesSimuladas.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-white border border-slate-200 rounded-md flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }}></span>
                        <span className="font-bold text-slate-900">{r.nombre_directo}</span>
                        <span className="text-slate-400">({r.nombre_inverso})</span>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                          {r.direccion_impacto.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalSimulador(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold"
              >
                Cerrar simulador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar / Nuevo Tipo de Relación */}
      {modalEdicion.abierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {modalEdicion.esNuevo ? "Nuevo Tipo de Relación" : `Editar: ${modalEdicion.tipo?.nombre_directo}`}
              </h3>
              <button
                type="button"
                onClick={() => setModalEdicion({ abierto: false, esNuevo: false })}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Directo</label>
                  <input
                    type="text"
                    value={formTipo.nombre_directo || ""}
                    onChange={(e) => setFormTipo({ ...formTipo, nombre_directo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                    placeholder="Ej: Depende de"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Inverso</label>
                  <input
                    type="text"
                    value={formTipo.nombre_inverso || ""}
                    onChange={(e) => setFormTipo({ ...formTipo, nombre_inverso: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                    placeholder="Ej: Es requerido por"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dirección del Impacto</label>
                  <select
                    value={formTipo.direccion_impacto || "destino_a_origen"}
                    onChange={(e) => setFormTipo({ ...formTipo, direccion_impacto: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  >
                    <option value="destino_a_origen">Fallo en Destino impacta a Origen</option>
                    <option value="origen_a_destino">Fallo en Origen impacta a Destino</option>
                    <option value="bidireccional">Impacto mutuo bidireccional</option>
                    <option value="ninguna">Sin propagación de impacto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cardinalidad</label>
                  <select
                    value={formTipo.cardinalidad || "1:N"}
                    onChange={(e) => setFormTipo({ ...formTipo, cardinalidad: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  >
                    <option value="1:1">1 a 1 (1:1)</option>
                    <option value="1:N">1 a Muchos (1:N)</option>
                    <option value="N:1">Muchos a 1 (N:1)</option>
                    <option value="N:N">Muchos a Muchos (N:N)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color Representativo</label>
                  <input
                    type="color"
                    value={formTipo.color || "#4f46e5"}
                    onChange={(e) => setFormTipo({ ...formTipo, color: e.target.value })}
                    className="w-full h-8 p-1 border border-slate-300 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estilo de Línea</label>
                  <select
                    value={formTipo.estilo || "solida"}
                    onChange={(e) => setFormTipo({ ...formTipo, estilo: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  >
                    <option value="solida">Línea sólida continua</option>
                    <option value="punteada">Línea punteada</option>
                    <option value="discontinua">Línea discontinua</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chkPropCrit"
                    checked={formTipo.propaga_criticidad ?? true}
                    onChange={(e) => setFormTipo({ ...formTipo, propaga_criticidad: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <label htmlFor="chkPropCrit" className="text-xs text-slate-700 font-medium">
                    Propagar criticidad efectiva a través de esta relación
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chkPermiteCiclos"
                    checked={formTipo.permite_ciclos ?? false}
                    onChange={(e) => setFormTipo({ ...formTipo, permite_ciclos: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                  />
                  <label htmlFor="chkPermiteCiclos" className="text-xs text-slate-700 font-medium">
                    Permitir dependencias cíclicas (solo recomendado para tipos simétricos)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalEdicion({ abierto: false, esNuevo: false })}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarTipo}
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
